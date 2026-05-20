const { Router } = require('express')
const billingController = require('../controllers/billingController')
const { requireAuth } = require('../middlewares/authMiddleware')

const billingRoutes = Router()

billingRoutes.post('/subscription-link', requireAuth, billingController.createSubscriptionLink)
billingRoutes.post('/payment-link', requireAuth, billingController.createPaymentLink)
billingRoutes.post('/mercado-pago/webhook', billingController.mercadoPagoWebhook)
billingRoutes.get('/mercado-pago/webhook', billingController.mercadoPagoWebhook)

module.exports = billingRoutes
