const { Router } = require('express')
const productController = require('../controllers/productController')
const {
	requireActiveStoreByStoreIdParam,
	requireActiveStoreByBodyStoreId,
	requireActiveStoreByProductId,
} = require('../middlewares/subscriptionMiddleware')

const productRoutes = Router()

productRoutes.get('/:storeId', requireActiveStoreByStoreIdParam('storeId'), productController.listByStore)
productRoutes.post('/', requireActiveStoreByBodyStoreId('storeId'), productController.create)
productRoutes.put('/:id', requireActiveStoreByProductId('id'), productController.update)
productRoutes.delete('/:id', requireActiveStoreByProductId('id'), productController.remove)

module.exports = productRoutes
