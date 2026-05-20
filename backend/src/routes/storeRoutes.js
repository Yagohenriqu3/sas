const { Router } = require('express')
const storeController = require('../controllers/storeController')
const {
	allowStoreAccessBySlug,
	requireActiveStoreByStoreIdParam,
} = require('../middlewares/subscriptionMiddleware')

const storeRoutes = Router()

storeRoutes.patch('/:id/settings', requireActiveStoreByStoreIdParam('id'), storeController.updateStoreSettings)
storeRoutes.get('/:slug', allowStoreAccessBySlug, storeController.getStoreBySlug)

module.exports = storeRoutes
