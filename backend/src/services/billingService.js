const axios = require('axios')
const prisma = require('../prisma/client')
const AppError = require('../utils/AppError')

function getBillingConfig() {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
  const amount = Number(process.env.SAAS_SUBSCRIPTION_AMOUNT || 99.9)
  const currencyId = process.env.SAAS_SUBSCRIPTION_CURRENCY || 'BRL'
  const reason = process.env.SAAS_SUBSCRIPTION_REASON || 'LacheON SaaS - Assinatura mensal'
  const backUrl = process.env.SAAS_BILLING_RETURN_URL || 'http://localhost:5174/minha-conta'
  const webhookUrl = process.env.SAAS_WEBHOOK_URL || 'https://seu-dominio.com/billing/mercado-pago/webhook'

  if (!accessToken) {
    throw new AppError('Configuracao de pagamento ausente. Defina MERCADO_PAGO_ACCESS_TOKEN.', 500)
  }

  if (Number.isNaN(amount) || amount <= 0) {
    throw new AppError('Valor de assinatura invalido. Revise SAAS_SUBSCRIPTION_AMOUNT.', 500)
  }

  return {
    accessToken,
    amount,
    currencyId,
    reason,
    backUrl,
    webhookUrl,
  }
}

function getPlanSettings(planId, defaultAmount, defaultReason) {
  const plans = {
    monthly: {
      id: 'monthly',
      frequency: 1,
      amount: defaultAmount,
      reason: `${defaultReason} - Plano Mensal`,
      itemId: 'saas-plan-monthly',
      itemDescription: 'Assinatura mensal da plataforma LacheON SaaS para gestao de delivery',
    },
    quarterly: {
      id: 'quarterly',
      frequency: 3,
      amount: 79.9,
      reason: `${defaultReason} - Plano Trimestral`,
      itemId: 'saas-plan-quarterly',
      itemDescription: 'Assinatura trimestral da plataforma LacheON SaaS para gestao de delivery',
    },
    yearly: {
      id: 'yearly',
      frequency: 12,
      amount: 299,
      reason: `${defaultReason} - Plano Anual`,
      itemId: 'saas-plan-yearly',
      itemDescription: 'Assinatura anual da plataforma LacheON SaaS para gestao de delivery',
    },
  }

  const normalizedPlanId = String(planId || 'monthly').toLowerCase()
  return plans[normalizedPlanId] || plans.monthly
}

async function createRecurringSubscriptionForStore({ userId, planId }) {
  const ownerUserId = Number(userId)
  if (!ownerUserId) {
    throw new AppError('Unauthorized', 401)
  }

  const owner = await prisma.user.findUnique({
    where: { id: ownerUserId },
    select: {
      id: true,
      email: true,
      fullName: true,
      stores: {
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: {
          id: true,
          name: true,
          slug: true,
          subscriptionStatus: true,
          trialEndsAt: true,
        },
      },
    },
  })

  if (!owner) {
    throw new AppError('Conta nao encontrada', 404)
  }

  const store = owner.stores[0]
  if (!store) {
    throw new AppError('Conta sem loja vinculada', 400)
  }

  const config = getBillingConfig()
  const plan = getPlanSettings(planId, config.amount, config.reason)

  const body = {
    reason: plan.reason,
    back_url: config.backUrl,
    notification_url: config.webhookUrl,
    payer_email: owner.email,
    external_reference: `store-${store.id}:plan-${plan.id}`,
    status: 'pending',
    auto_recurring: {
      frequency: plan.frequency,
      frequency_type: 'months',
      transaction_amount: Number(plan.amount.toFixed(2)),
      currency_id: config.currencyId,
    },
    items: [
      {
        id: `${plan.itemId}-store-${store.id}`,
        title: plan.reason,
        description: plan.itemDescription,
        category_id: 'services',
        quantity: 1,
        unit_price: Number(plan.amount.toFixed(2)),
        currency_id: config.currencyId,
      },
    ],
  }

  try {
    const response = await axios.post('https://api.mercadopago.com/preapproval', body, {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    })

    return {
      initPoint: response.data?.init_point || '',
      sandboxInitPoint: response.data?.sandbox_init_point || '',
      subscriptionId: response.data?.id || null,
      status: store.subscriptionStatus,
      trialEndsAt: store.trialEndsAt,
    }
  } catch (error) {
    const mpData = error?.response?.data
    console.error('[billingService] Erro ao criar preapproval:', JSON.stringify(mpData || error?.message))

    const message =
      mpData?.message ||
      mpData?.error ||
      mpData?.cause?.[0]?.description ||
      'Falha ao gerar assinatura no Mercado Pago.'

    throw new AppError(message, 502)
  }
}

function normalizeSubscriptionStatus(status) {
  const normalized = String(status || '').toLowerCase()

  if (normalized === 'authorized') return 'active'
  if (normalized === 'paused') return 'paused'
  if (normalized === 'cancelled') return 'canceled'
  if (normalized === 'pending') return 'trial'

  return 'trial'
}

function extractStoreIdFromExternalReference(value) {
  const match = String(value || '').match(/^store-(\d+)(:plan-[a-z]+)?$/)
  if (!match) return null
  return Number(match[1])
}

async function processMercadoPagoWebhook(payload, query) {
  const subscriptionId = payload?.data?.id || query?.id || null
  if (!subscriptionId) {
    return { ignored: true, reason: 'subscription id not informed' }
  }

  const config = getBillingConfig()

  const response = await axios.get(
    `https://api.mercadopago.com/preapproval/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
      },
      timeout: 15000,
    },
  )

  const externalReference = response.data?.external_reference
  const storeId = extractStoreIdFromExternalReference(externalReference)

  if (!storeId) {
    return { ignored: true, reason: 'external reference not mapped to store' }
  }

  const mappedStatus = normalizeSubscriptionStatus(response.data?.status)

  await prisma.store.update({
    where: { id: storeId },
    data: {
      subscriptionStatus: mappedStatus,
    },
  })

  return {
    ignored: false,
    storeId,
    subscriptionId,
    mercadoPagoStatus: response.data?.status || 'unknown',
    mappedStatus,
  }
}

async function createSimplePaymentLink({ userId }) {
  const ownerUserId = Number(userId)
  if (!ownerUserId) {
    throw new AppError('Unauthorized', 401)
  }

  const owner = await prisma.user.findUnique({
    where: { id: ownerUserId },
    select: {
      id: true,
      email: true,
      fullName: true,
      stores: {
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  if (!owner) {
    throw new AppError('Conta nao encontrada', 404)
  }

  const store = owner.stores[0]
  if (!store) {
    throw new AppError('Conta sem loja vinculada', 400)
  }

  const config = getBillingConfig()

  const body = {
    transaction_amount: Number(config.amount.toFixed(2)),
    description: config.reason,
    payment_method_id: 'master',
    payer: {
      email: owner.email,
      first_name: owner.fullName.split(' ')[0],
      last_name: owner.fullName.split(' ').slice(1).join(' ') || '',
    },
    back_urls: {
      success: config.backUrl,
      failure: config.backUrl,
      pending: config.backUrl,
    },
    notification_url: config.webhookUrl,
    external_reference: `store-${store.id}`,
    items: [
      {
        id: `payment-store-${store.id}`,
        title: config.reason,
        description: 'Assinatura da plataforma LacheON SaaS para gestao de delivery',
        category_id: 'services',
        quantity: 1,
        unit_price: Number(config.amount.toFixed(2)),
        currency_id: config.currencyId,
      },
    ],
  }

  try {
    const response = await axios.post('https://api.mercadopago.com/checkout/preferences', body, {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    })

    console.log('[billingService] Payment link criado com sucesso:', response.data?.id)

    return {
      initPoint: response.data?.init_point || '',
      sandboxInitPoint: response.data?.sandbox_init_point || '',
      preferenceId: response.data?.id || null,
    }
  } catch (error) {
    const mpData = error?.response?.data
    console.error('[billingService] Erro ao criar payment link:', JSON.stringify(mpData || error?.message))

    const message =
      mpData?.message ||
      mpData?.error ||
      mpData?.cause?.[0]?.description ||
      'Falha ao gerar link de pagamento no Mercado Pago.'

    throw new AppError(message, 502)
  }
}

module.exports = {
  createRecurringSubscriptionForStore,
  createSimplePaymentLink,
  processMercadoPagoWebhook,
}
