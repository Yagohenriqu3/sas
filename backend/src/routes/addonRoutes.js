const { Router } = require('express')
const addonController = require('../controllers/addonController')
const { requireActiveStoreByStoreIdParam } = require('../middlewares/subscriptionMiddleware')

const addonRoutes = Router()

addonRoutes.get('/:storeId', requireActiveStoreByStoreIdParam('storeId'), addonController.list)
addonRoutes.post('/:storeId', requireActiveStoreByStoreIdParam('storeId'), addonController.create)
addonRoutes.put('/:storeId/:id', requireActiveStoreByStoreIdParam('storeId'), addonController.update)
addonRoutes.delete('/:storeId/:id', requireActiveStoreByStoreIdParam('storeId'), addonController.remove)
addonRoutes.post('/:storeId/:id/link/:productId', requireActiveStoreByStoreIdParam('storeId'), addonController.linkToProduct)
addonRoutes.delete('/:storeId/:id/link/:productId', requireActiveStoreByStoreIdParam('storeId'), addonController.unlinkFromProduct)

module.exports = addonRoutes
