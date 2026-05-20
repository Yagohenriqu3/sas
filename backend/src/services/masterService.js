const prisma = require('../prisma/client')
const bcrypt = require('bcryptjs')
const AppError = require('../utils/AppError')

function parseAccessDate({ accessUntil, accessDays }) {
  if (accessUntil) {
    const parsed = new Date(accessUntil)
    if (Number.isNaN(parsed.getTime())) {
      throw new AppError('accessUntil invalido. Use formato de data ISO.', 400)
    }
    return parsed
  }

  const days = Number(accessDays)
  if (!Number.isInteger(days) || days < 0) {
    throw new AppError('accessDays deve ser um numero inteiro maior ou igual a 0.', 400)
  }

  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

async function listUsersWithStores() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      documentNumber: true,
      legalName: true,
      billingZip: true,
      billingStreet: true,
      billingNumber: true,
      billingNeighborhood: true,
      billingCity: true,
      billingState: true,
      createdAt: true,
      stores: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          createdAt: true,
        },
      },
    },
  })

  return users
}

async function updateUserAndAccess({
  userId,
  fullName,
  email,
  password,
  phone,
  documentNumber,
  legalName,
  billingZip,
  billingStreet,
  billingNumber,
  billingNeighborhood,
  billingCity,
  billingState,
  storeName,
  accessUntil,
  accessDays,
  subscriptionStatus,
}) {
  const parsedUserId = Number(userId)
  if (!parsedUserId) {
    throw new AppError('userId invalido', 400)
  }

  const existing = await prisma.user.findUnique({
    where: { id: parsedUserId },
    select: {
      id: true,
      stores: { orderBy: { createdAt: 'asc' }, select: { id: true } },
    },
  })

  if (!existing) {
    throw new AppError('Usuario nao encontrado', 404)
  }

  const hasUserDataChange =
    typeof fullName === 'string' ||
    typeof email === 'string' ||
    typeof password === 'string' ||
    typeof phone === 'string' ||
    typeof documentNumber === 'string' ||
    typeof legalName === 'string' ||
    typeof billingZip === 'string' ||
    typeof billingStreet === 'string' ||
    typeof billingNumber === 'string' ||
    typeof billingNeighborhood === 'string' ||
    typeof billingCity === 'string' ||
    typeof billingState === 'string'
  const hasStoreDataChange =
    typeof storeName === 'string' ||
    typeof accessUntil !== 'undefined' ||
    typeof accessDays !== 'undefined' ||
    typeof subscriptionStatus === 'string'

  if (!hasUserDataChange && !hasStoreDataChange) {
    throw new AppError('Nenhum campo para atualizar foi enviado', 400)
  }

  const userData = {}
  if (typeof fullName === 'string') {
    const normalized = fullName.trim()
    if (!normalized) throw new AppError('fullName nao pode ser vazio', 400)
    userData.fullName = normalized
  }

  if (typeof email === 'string') {
    const normalized = email.trim().toLowerCase()
    if (!normalized.includes('@')) throw new AppError('email invalido', 400)
    userData.email = normalized
  }

  if (typeof password === 'string') {
    const normalized = password.trim()
    if (normalized.length > 0 && normalized.length < 6) {
      throw new AppError('password deve ter pelo menos 6 caracteres', 400)
    }

    if (normalized.length > 0) {
      userData.passwordHash = await bcrypt.hash(normalized, 10)
    }
  }

  if (typeof phone === 'string') {
    const normalized = phone.trim()
    if (!normalized) throw new AppError('phone nao pode ser vazio', 400)
    userData.phone = normalized
  }

  if (typeof documentNumber === 'string') {
    const normalized = documentNumber.trim()
    if (!normalized) throw new AppError('documentNumber nao pode ser vazio', 400)
    userData.documentNumber = normalized
  }

  if (typeof legalName === 'string') {
    const normalized = legalName.trim()
    if (!normalized) throw new AppError('legalName nao pode ser vazio', 400)
    userData.legalName = normalized
  }

  if (typeof billingZip === 'string') {
    const normalized = billingZip.trim()
    if (!normalized) throw new AppError('billingZip nao pode ser vazio', 400)
    userData.billingZip = normalized
  }

  if (typeof billingStreet === 'string') {
    const normalized = billingStreet.trim()
    if (!normalized) throw new AppError('billingStreet nao pode ser vazio', 400)
    userData.billingStreet = normalized
  }

  if (typeof billingNumber === 'string') {
    const normalized = billingNumber.trim()
    if (!normalized) throw new AppError('billingNumber nao pode ser vazio', 400)
    userData.billingNumber = normalized
  }

  if (typeof billingNeighborhood === 'string') {
    const normalized = billingNeighborhood.trim()
    if (!normalized) throw new AppError('billingNeighborhood nao pode ser vazio', 400)
    userData.billingNeighborhood = normalized
  }

  if (typeof billingCity === 'string') {
    const normalized = billingCity.trim()
    if (!normalized) throw new AppError('billingCity nao pode ser vazio', 400)
    userData.billingCity = normalized
  }

  if (typeof billingState === 'string') {
    const normalized = billingState.trim().toUpperCase()
    if (!normalized) throw new AppError('billingState nao pode ser vazio', 400)
    userData.billingState = normalized
  }

  let updatedUser = null
  let updatedStore = null

  await prisma.$transaction(async (tx) => {
    if (Object.keys(userData).length > 0) {
      updatedUser = await tx.user.update({
        where: { id: parsedUserId },
        data: userData,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          documentNumber: true,
          legalName: true,
          billingZip: true,
          billingStreet: true,
          billingNumber: true,
          billingNeighborhood: true,
          billingCity: true,
          billingState: true,
          createdAt: true,
        },
      })
    }

    if (hasStoreDataChange) {
      const targetStore = existing.stores[0]
      if (!targetStore) {
        throw new AppError('Usuario sem loja vinculada para ajustar acesso', 400)
      }

      const storeData = {}

      if (typeof storeName === 'string') {
        const normalizedStoreName = storeName.trim()
        if (!normalizedStoreName) throw new AppError('storeName nao pode ser vazio', 400)
        storeData.name = normalizedStoreName
      }

      if (typeof subscriptionStatus === 'string') {
        const normalizedStatus = subscriptionStatus.trim().toLowerCase()
        if (!normalizedStatus) throw new AppError('subscriptionStatus invalido', 400)
        storeData.subscriptionStatus = normalizedStatus
      }

      if (typeof accessUntil !== 'undefined' || typeof accessDays !== 'undefined') {
        storeData.trialEndsAt = parseAccessDate({ accessUntil, accessDays })

        if (!storeData.subscriptionStatus) {
          storeData.subscriptionStatus = 'manual'
        }
      }

      updatedStore = await tx.store.update({
        where: { id: targetStore.id },
        data: storeData,
        select: {
          id: true,
          name: true,
          slug: true,
          subscriptionStatus: true,
          trialEndsAt: true,
        },
      })
    }
  })

  if (!updatedUser) {
    updatedUser = await prisma.user.findUnique({
      where: { id: parsedUserId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        documentNumber: true,
        legalName: true,
        billingZip: true,
        billingStreet: true,
        billingNumber: true,
        billingNeighborhood: true,
        billingCity: true,
        billingState: true,
        createdAt: true,
      },
    })
  }

  return {
    user: updatedUser,
    store: updatedStore,
  }
}

module.exports = {
  listUsersWithStores,
  updateUserAndAccess,
}
