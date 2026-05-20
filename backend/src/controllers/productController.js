const productService = require('../services/productService')

async function listByStore(req, res, next) {
  try {
    const { storeId } = req.params
    const result = await productService.listProductsByStore(storeId)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

async function create(req, res, next) {
  try {
    const product = await productService.createProduct(req.body)
    return res.status(201).json(product)
  } catch (error) {
    return next(error)
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params
    const { storeId } = req.query
    const product = await productService.updateProduct(id, req.body, storeId)
    return res.status(200).json(product)
  } catch (error) {
    return next(error)
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params
    const { storeId } = req.query
    await productService.deleteProduct(id, storeId)
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
