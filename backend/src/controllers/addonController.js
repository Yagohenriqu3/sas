const addonService = require('../services/addonService')

async function list(req, res, next) {
  try {
    const { storeId } = req.params
    const addons = await addonService.listAddonsByStore(storeId)
    return res.status(200).json(addons)
  } catch (error) {
    return next(error)
  }
}

async function create(req, res, next) {
  try {
    const { storeId } = req.params
    const { name, price, categoryId } = req.body
    const addon = await addonService.createAddon(storeId, name, price, categoryId)
    return res.status(201).json(addon)
  } catch (error) {
    return next(error)
  }
}

async function update(req, res, next) {
  try {
    const { id, storeId } = req.params
    const { name, price, categoryId } = req.body
    const addon = await addonService.updateAddon(id, storeId, name, price, categoryId)
    return res.status(200).json(addon)
  } catch (error) {
    return next(error)
  }
}

async function remove(req, res, next) {
  try {
    const { id, storeId } = req.params
    await addonService.deleteAddon(id, storeId)
    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
}

async function linkToProduct(req, res, next) {
  try {
    const { id, storeId, productId } = req.params
    await addonService.linkAddonToProduct(id, productId, storeId)
    return res.status(200).json({ linked: true })
  } catch (error) {
    return next(error)
  }
}

async function unlinkFromProduct(req, res, next) {
  try {
    const { id, storeId, productId } = req.params
    await addonService.unlinkAddonFromProduct(id, productId, storeId)
    return res.status(200).json({ linked: false })
  } catch (error) {
    return next(error)
  }
}

module.exports = { list, create, update, remove, linkToProduct, unlinkFromProduct }
