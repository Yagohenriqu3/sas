const prisma = require('../prisma/client')
const AppError = require('../utils/AppError')

function parseId(rawValue, fieldName) {
  const value = Number(rawValue)
  if (!Number.isInteger(value) || value <= 0) {
    throw new AppError(`${fieldName} invalido`, 400)
  }
  return value
}

function hasValidAccess(store) {
  const status = String(store.subscriptionStatus || '').toLowerCase()

  if (status === 'active' || status === 'manual') {
    return true
  }

  if (status === 'trial') {
    if (!store.trialEndsAt) {
      return false
    }

    return new Date(store.trialEndsAt) >= new Date()
  }

  return false
}

function ensureStoreIsActive(store) {
  if (!store) {
    throw new AppError('Loja nao encontrada', 404)
  }

  if (!hasValidAccess(store)) {
    throw new AppError('Conta inativa. Regularize o pagamento para reativar o cardapio.', 402)
  }
}

async function loadStoreById(storeId) {
  return prisma.store.findUnique({
    where: { id: storeId },
    select: {
      id: true,
      subscriptionStatus: true,
      trialEndsAt: true,
    },
  })
}

// Middleware para acesso público ao cardápio (sem bloquear mesmo se inativo)
// Permite retornar a loja com status inativo para o cliente ver que não está disponível
async function allowStoreAccessBySlug(req, _res, next) {
  try {
    const slug = String(req.params.slug || '').trim()
    if (!slug) {
      throw new AppError('slug invalido', 400)
    }

    const store = await prisma.store.findUnique({
      where: { slug },
      select: {
        id: true,
        subscriptionStatus: true,
        trialEndsAt: true,
      },
    })

    if (!store) {
      throw new AppError('Loja nao encontrada', 404)
    }

    // Apenas valida existência, não bloqueia por inatividade
    return next()
  } catch (error) {
    return next(error)
  }
}

// Middleware para acesso administrativo (bloqueia se inativo)
async function requireActiveStoreBySlug(req, _res, next) {
  try {
    const slug = String(req.params.slug || '').trim()
    if (!slug) {
      throw new AppError('slug invalido', 400)
    }

    const store = await prisma.store.findUnique({
      where: { slug },
      select: {
        id: true,
        subscriptionStatus: true,
        trialEndsAt: true,
      },
    })

    ensureStoreIsActive(store)
    return next()
  } catch (error) {
    return next(error)
  }
}

function requireActiveStoreByStoreIdParam(paramName = 'storeId') {
  return async function middleware(req, _res, next) {
    try {
      const storeId = parseId(req.params[paramName], paramName)
      const store = await loadStoreById(storeId)
      ensureStoreIsActive(store)
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

function requireActiveStoreByBodyStoreId(fieldName = 'storeId') {
  return async function middleware(req, _res, next) {
    try {
      const storeId = parseId(req.body?.[fieldName], fieldName)
      const store = await loadStoreById(storeId)
      ensureStoreIsActive(store)
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

function requireActiveStoreByProductId(paramName = 'id') {
  return async function middleware(req, _res, next) {
    try {
      const productId = parseId(req.params[paramName], paramName)
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          store: {
            select: {
              id: true,
              subscriptionStatus: true,
              trialEndsAt: true,
            },
          },
        },
      })

      if (!product) {
        throw new AppError('Produto nao encontrado', 404)
      }

      ensureStoreIsActive(product.store)
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

function requireActiveStoreByOrderId(paramName = 'id') {
  return async function middleware(req, _res, next) {
    try {
      const orderId = parseId(req.params[paramName], paramName)
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          store: {
            select: {
              id: true,
              subscriptionStatus: true,
              trialEndsAt: true,
            },
          },
        },
      })

      if (!order) {
        throw new AppError('Pedido nao encontrado', 404)
      }

      ensureStoreIsActive(order.store)
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

function requireActiveStoreByCategoryId(paramName = 'id') {
  return async function middleware(req, _res, next) {
    try {
      const categoryId = parseId(req.params[paramName], paramName)
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: {
          id: true,
          store: {
            select: {
              id: true,
              subscriptionStatus: true,
              trialEndsAt: true,
            },
          },
        },
      })

      if (!category) {
        throw new AppError('Categoria nao encontrada', 404)
      }

      ensureStoreIsActive(category.store)
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

module.exports = {
  allowStoreAccessBySlug,
  requireActiveStoreBySlug,
  requireActiveStoreByStoreIdParam,
  requireActiveStoreByBodyStoreId,
  requireActiveStoreByProductId,
  requireActiveStoreByOrderId,
  requireActiveStoreByCategoryId,
}
