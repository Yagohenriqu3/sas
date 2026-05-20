const { Router } = require('express')
const orderController = require('../controllers/orderController')
const {
	requireActiveStoreByBodyStoreId,
	requireActiveStoreByStoreIdParam,
	requireActiveStoreByOrderId,
} = require('../middlewares/subscriptionMiddleware')

const orderRoutes = Router()

orderRoutes.post('/', requireActiveStoreByBodyStoreId('storeId'), orderController.create)
orderRoutes.get('/customer/:storeId/:phone/history', requireActiveStoreByStoreIdParam('storeId'), orderController.getCustomerOrderHistory)
orderRoutes.get('/customer/:storeId/:phone', requireActiveStoreByStoreIdParam('storeId'), orderController.getCustomerByPhone)
orderRoutes.get('/:storeId', requireActiveStoreByStoreIdParam('storeId'), orderController.listByStore)
orderRoutes.patch('/:id/status', requireActiveStoreByOrderId('id'), orderController.updateStatus)
orderRoutes.put('/:id/status', requireActiveStoreByOrderId('id'), orderController.updateStatus)
orderRoutes.delete('/:id', requireActiveStoreByOrderId('id'), orderController.remove)

module.exports = orderRoutes
