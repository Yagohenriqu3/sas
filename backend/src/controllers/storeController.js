const storeService = require('../services/storeService')

async function getStoreBySlug(req, res, next) {
  try {
    const { slug } = req.params
    const store = await storeService.getStoreBySlug(slug)
    return res.status(200).json(store)
  } catch (error) {
    return next(error)
  }
}

async function updateStoreSettings(req, res, next) {
  try {
    const { id } = req.params
    const store = await storeService.updateStoreSettings(id, req.body)
    return res.status(200).json(store)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  getStoreBySlug,
  updateStoreSettings,
}
