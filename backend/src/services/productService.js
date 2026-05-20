const prisma = require('../prisma/client')
const AppError = require('../utils/AppError')
const { parsePositiveInt } = require('../utils/validators')

/* ── helpers ─────────────────────────────────────────────────── */

function serializeProduct(product) {
  const now = new Date()
  const promoExpired =
    product.promotionEnd !== null &&
    product.promotionEnd !== undefined &&
    new Date(product.promotionEnd) < now

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    promotionalPrice: product.promotionalPrice !== null ? Number(product.promotionalPrice) : null,
    isPromotion: promoExpired ? false : product.isPromotion,
    promotionEnd: product.promotionEnd ? product.promotionEnd.toISOString() : null,
    isFeatured: product.isFeatured,
    salesCount: product.salesCount,
    image: product.image,
    categoryId: product.categoryId,
    storeId: product.storeId,
    createdAt: product.createdAt,
  }
}

function parseOptionalNumber(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    throw new AppError(`${fieldName} must be a valid number`, 400)
  }

  return parsed
}

function parseOptionalDate(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError(`${fieldName} must be a valid date`, 400)
  }

  return parsedDate
}

async function ensureStoreExists(storeId) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  })
  if (!store) throw new AppError('Store not found', 404)
  return store
}

/* ── auto-expire promotions in bulk ─────────────────────────── */

async function disableExpiredPromotions(storeId) {
  await prisma.product.updateMany({
    where: {
      storeId,
      isPromotion: true,
      promotionEnd: { lt: new Date() },
    },
    data: { isPromotion: false },
  })
}

/* ── listProductsByStore ─────────────────────────────────────── */

async function listProductsByStore(storeIdRaw) {
  const storeId = parsePositiveInt(storeIdRaw, 'storeId')

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, name: true, slug: true },
  })

  if (!store) throw new AppError('Store not found', 404)

  await disableExpiredPromotions(storeId)

  const products = await prisma.product.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { id: true, name: true } } },
  })

  return {
    store,
    products: products.map(serializeProduct),
  }
}

/* ── createProduct ───────────────────────────────────────────── */

async function createProduct(payload) {
  const {
    storeId: storeIdRaw,
    name,
    description,
    price,
    promotionalPrice = null,
    isPromotion = false,
    promotionEnd = null,
    isFeatured = false,
    image,
    categoryId = null,
  } = payload || {}

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new AppError('name is required', 400)
  }
  if (price === undefined || price === null || isNaN(Number(price))) {
    throw new AppError('price must be a valid number', 400)
  }
  if (!image || typeof image !== 'string' || image.trim() === '') {
    throw new AppError('image is required', 400)
  }

  const storeId = parsePositiveInt(storeIdRaw, 'storeId')
  await ensureStoreExists(storeId)

  if (isFeatured) {
    await prisma.product.updateMany({
      where: { storeId, isFeatured: true },
      data: { isFeatured: false },
    })
  }

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      description: description ? String(description).trim() : '',
      price: Number(price),
      promotionalPrice: parseOptionalNumber(promotionalPrice, 'promotionalPrice'),
      isPromotion: Boolean(isPromotion),
      promotionEnd: parseOptionalDate(promotionEnd, 'promotionEnd'),
      isFeatured: Boolean(isFeatured),
      image: image.trim(),
      storeId,
      categoryId: categoryId ? parsePositiveInt(categoryId, 'categoryId') : null,
    },
  })

  return serializeProduct(product)
}

/* ── updateProduct ───────────────────────────────────────────── */

async function updateProduct(productIdRaw, payload, storeIdFilter) {
  const id = parsePositiveInt(productIdRaw, 'id')

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) throw new AppError('Product not found', 404)

  if (storeIdFilter !== undefined) {
    const storeId = parsePositiveInt(storeIdFilter, 'storeId')
    if (existing.storeId !== storeId) throw new AppError('Product not found', 404)
  }

  const {
    name,
    description,
    price,
    promotionalPrice,
    isPromotion,
    promotionEnd,
    isFeatured,
    image,
    categoryId,
  } = payload || {}

  const data = {}

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') throw new AppError('name cannot be empty', 400)
    data.name = name.trim()
  }
  if (description !== undefined) data.description = String(description).trim()
  if (price !== undefined) {
    if (isNaN(Number(price))) throw new AppError('price must be a valid number', 400)
    data.price = Number(price)
  }
  if (promotionalPrice !== undefined) {
    data.promotionalPrice = parseOptionalNumber(promotionalPrice, 'promotionalPrice')
  }
  if (isPromotion !== undefined) data.isPromotion = Boolean(isPromotion)
  if (promotionEnd !== undefined) {
    data.promotionEnd = parseOptionalDate(promotionEnd, 'promotionEnd')
  }
  if (image !== undefined) {
    if (typeof image !== 'string' || image.trim() === '') throw new AppError('image cannot be empty', 400)
    data.image = image.trim()
  }
  if (categoryId !== undefined) {
    data.categoryId = categoryId !== null ? parsePositiveInt(categoryId, 'categoryId') : null
  }

  // Featured rule: only one per store
  if (isFeatured !== undefined) {
    data.isFeatured = Boolean(isFeatured)
    if (data.isFeatured) {
      await prisma.product.updateMany({
        where: { storeId: existing.storeId, isFeatured: true, id: { not: id } },
        data: { isFeatured: false },
      })
    }
  }

  const updated = await prisma.product.update({ where: { id }, data })
  return serializeProduct(updated)
}

/* ── deleteProduct ───────────────────────────────────────────── */

async function deleteProduct(productIdRaw, storeIdFilter) {
  const id = parsePositiveInt(productIdRaw, 'id')

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) throw new AppError('Product not found', 404)

  if (storeIdFilter !== undefined) {
    const storeId = parsePositiveInt(storeIdFilter, 'storeId')
    if (existing.storeId !== storeId) throw new AppError('Product not found', 404)
  }

  await prisma.product.delete({ where: { id } })
}

module.exports = {
  listProductsByStore,
  createProduct,
  updateProduct,
  deleteProduct,
}

