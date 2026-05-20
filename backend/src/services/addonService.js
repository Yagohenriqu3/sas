const prisma = require('../prisma/client')
const AppError = require('../utils/AppError')
const { parsePositiveInt } = require('../utils/validators')

function serializeAddon(addon) {
  return {
    id: addon.id,
    storeId: addon.storeId,
    name: addon.name,
    price: Number(addon.price),
    categoryId: addon.categoryId !== null && addon.categoryId !== undefined ? addon.categoryId : null,
    category: addon.category
      ? {
          id: addon.category.id,
          name: addon.category.name,
        }
      : null,
    productIds: (addon.products || []).map((pa) => pa.productId),
  }
}

async function listAddonsByStore(storeIdRaw) {
  const storeId = parsePositiveInt(storeIdRaw, 'storeId')

  const addons = await prisma.addon.findMany({
    where: { storeId },
    include: {
      category: { select: { id: true, name: true } },
      products: { select: { productId: true } },
    },
    orderBy: { name: 'asc' },
  })

  return addons.map(serializeAddon)
}

async function createAddon(storeIdRaw, name, priceRaw, categoryIdRaw) {
  const storeId = parsePositiveInt(storeIdRaw, 'storeId')

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AppError('name is required', 400)
  }

  const price = Number(priceRaw)
  if (Number.isNaN(price) || price < 0) {
    throw new AppError('price must be a non-negative number', 400)
  }

  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { id: true } })
  if (!store) throw new AppError('Store not found', 404)

  let categoryId = null
  if (categoryIdRaw !== undefined && categoryIdRaw !== null && String(categoryIdRaw) !== '') {
    categoryId = parsePositiveInt(categoryIdRaw, 'categoryId')

    const category = await prisma.category.findFirst({
      where: { id: categoryId, storeId },
      select: { id: true },
    })

    if (!category) throw new AppError('Category not found', 404)
  }

  const addon = await prisma.addon.create({
    data: { storeId, name: name.trim(), price, categoryId },
    include: {
      category: { select: { id: true, name: true } },
      products: { select: { productId: true } },
    },
  })

  return serializeAddon(addon)
}

async function updateAddon(idRaw, storeIdRaw, name, priceRaw, categoryIdRaw) {
  const id = parsePositiveInt(idRaw, 'id')
  const storeId = parsePositiveInt(storeIdRaw, 'storeId')

  const existing = await prisma.addon.findUnique({ where: { id } })
  if (!existing || existing.storeId !== storeId) throw new AppError('Addon not found', 404)

  const data = {}

  if (name !== undefined) {
    if (!String(name).trim()) throw new AppError('name cannot be empty', 400)
    data.name = String(name).trim()
  }

  if (priceRaw !== undefined) {
    const price = Number(priceRaw)
    if (Number.isNaN(price) || price < 0) throw new AppError('price must be a non-negative number', 400)
    data.price = price
  }

  if (categoryIdRaw !== undefined) {
    if (categoryIdRaw === null || String(categoryIdRaw) === '') {
      data.categoryId = null
    } else {
      const categoryId = parsePositiveInt(categoryIdRaw, 'categoryId')
      const category = await prisma.category.findFirst({
        where: { id: categoryId, storeId },
        select: { id: true },
      })

      if (!category) throw new AppError('Category not found', 404)
      data.categoryId = categoryId
    }
  }

  const addon = await prisma.addon.update({
    where: { id },
    data,
    include: {
      category: { select: { id: true, name: true } },
      products: { select: { productId: true } },
    },
  })

  return serializeAddon(addon)
}

async function deleteAddon(idRaw, storeIdRaw) {
  const id = parsePositiveInt(idRaw, 'id')
  const storeId = parsePositiveInt(storeIdRaw, 'storeId')

  const existing = await prisma.addon.findUnique({ where: { id } })
  if (!existing || existing.storeId !== storeId) throw new AppError('Addon not found', 404)

  await prisma.addon.delete({ where: { id } })
}

async function linkAddonToProduct(addonIdRaw, productIdRaw, storeIdRaw) {
  const addonId = parsePositiveInt(addonIdRaw, 'addonId')
  const productId = parsePositiveInt(productIdRaw, 'productId')
  const storeId = parsePositiveInt(storeIdRaw, 'storeId')

  const addon = await prisma.addon.findFirst({ where: { id: addonId, storeId } })
  if (!addon) throw new AppError('Addon not found', 404)

  const product = await prisma.product.findFirst({ where: { id: productId, storeId } })
  if (!product) throw new AppError('Product not found', 404)

  await prisma.productAddon.upsert({
    where: { productId_addonId: { productId, addonId } },
    create: { productId, addonId },
    update: {},
  })
}

async function unlinkAddonFromProduct(addonIdRaw, productIdRaw, storeIdRaw) {
  const addonId = parsePositiveInt(addonIdRaw, 'addonId')
  const productId = parsePositiveInt(productIdRaw, 'productId')
  const storeId = parsePositiveInt(storeIdRaw, 'storeId')

  const addon = await prisma.addon.findFirst({ where: { id: addonId, storeId } })
  if (!addon) throw new AppError('Addon not found', 404)

  await prisma.productAddon.deleteMany({ where: { addonId, productId } })
}

module.exports = {
  listAddonsByStore,
  createAddon,
  updateAddon,
  deleteAddon,
  linkAddonToProduct,
  unlinkAddonFromProduct,
}
