const prisma = require('../prisma/client')
const AppError = require('../utils/AppError')
const { parsePositiveInt } = require('../utils/validators')

async function listByStore(storeIdRaw) {
  const storeId = parsePositiveInt(storeIdRaw, 'storeId')

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  })
  if (!store) throw new AppError('Store not found', 404)

  return prisma.category.findMany({
    where: { storeId },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      storeId: true,
      _count: { select: { products: true } },
    },
  })
}

async function createCategory(payload) {
  const { storeId: storeIdRaw, name } = payload || {}

  const storeId = parsePositiveInt(storeIdRaw, 'storeId')

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new AppError('name is required', 400)
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  })
  if (!store) throw new AppError('Store not found', 404)

  const existing = await prisma.category.findFirst({
    where: { storeId, name: { equals: name.trim() } },
  })
  if (existing) throw new AppError('Category with this name already exists', 409)

  return prisma.category.create({
    data: { name: name.trim(), storeId },
    select: { id: true, name: true, storeId: true },
  })
}

async function updateCategory(categoryIdRaw, payload) {
  const id = parsePositiveInt(categoryIdRaw, 'id')
  const { name } = payload || {}

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) throw new AppError('Category not found', 404)

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new AppError('name is required', 400)
  }

  return prisma.category.update({
    where: { id },
    data: { name: name.trim() },
    select: { id: true, name: true, storeId: true },
  })
}

async function deleteCategory(categoryIdRaw) {
  const id = parsePositiveInt(categoryIdRaw, 'id')

  const existing = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  })
  if (!existing) throw new AppError('Category not found', 404)

  if (existing._count.products > 0) {
    throw new AppError('Cannot delete a category that has associated products', 409)
  }

  await prisma.category.delete({ where: { id } })
}

module.exports = {
  listByStore,
  createCategory,
  updateCategory,
  deleteCategory,
}
