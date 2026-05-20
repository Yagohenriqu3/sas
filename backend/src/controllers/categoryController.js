const categoryService = require('../services/categoryService')

async function listByStore(req, res, next) {
  try {
    const { storeId } = req.params
    const categories = await categoryService.listByStore(storeId)
    return res.status(200).json(categories)
  } catch (error) {
    return next(error)
  }
}

async function create(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body)
    return res.status(201).json(category)
  } catch (error) {
    return next(error)
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params
    const category = await categoryService.updateCategory(id, req.body)
    return res.status(200).json(category)
  } catch (error) {
    return next(error)
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params
    await categoryService.deleteCategory(id)
    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  listByStore,
  create,
  update,
  remove,
}
