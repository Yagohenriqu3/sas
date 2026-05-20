const { Router } = require('express')
const storeRoutes = require('./storeRoutes')
const productRoutes = require('./productRoutes')
const orderRoutes = require('./orderRoutes')
const categoryRoutes = require('./categoryRoutes')
const addonRoutes = require('./addonRoutes')
const authRoutes = require('./authRoutes')
const billingRoutes = require('./billingRoutes')
const masterRoutes = require('./masterRoutes')
const uploadRoutes = require('./uploadRoutes')

const routes = Router()

routes.use('/stores', storeRoutes)
routes.use('/products', productRoutes)
routes.use('/orders', orderRoutes)
routes.use('/categories', categoryRoutes)
routes.use('/addons', addonRoutes)
routes.use('/auth', authRoutes)
routes.use('/billing', billingRoutes)
routes.use('/master', masterRoutes)
routes.use('/upload-image', uploadRoutes)

module.exports = routes
