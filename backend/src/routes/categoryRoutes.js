const { Router } = require('express')
const categoryController = require('../controllers/categoryController')
const {
	requireActiveStoreByStoreIdParam,
	requireActiveStoreByBodyStoreId,
	requireActiveStoreByCategoryId,
} = require('../middlewares/subscriptionMiddleware')

const categoryRoutes = Router()

categoryRoutes.get('/:storeId', requireActiveStoreByStoreIdParam('storeId'), categoryController.listByStore)
categoryRoutes.post('/', requireActiveStoreByBodyStoreId('storeId'), categoryController.create)
categoryRoutes.put('/:id', requireActiveStoreByCategoryId('id'), categoryController.update)
categoryRoutes.delete('/:id', requireActiveStoreByCategoryId('id'), categoryController.remove)

module.exports = categoryRoutes
