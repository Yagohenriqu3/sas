const billingService = require('../services/billingService')

async function createSubscriptionLink(req, res, next) {
  try {
    const result = await billingService.createRecurringSubscriptionForStore({
      userId: req.auth?.userId,
      planId: req.body?.planId,
    })

    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

async function createPaymentLink(req, res, next) {
  try {
    const result = await billingService.createSimplePaymentLink({
      userId: req.auth?.userId,
    })

    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

async function mercadoPagoWebhook(req, res, next) {
  try {
    const result = await billingService.processMercadoPagoWebhook(req.body, req.query)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  createSubscriptionLink,
  createPaymentLink,
  mercadoPagoWebhook,
}
