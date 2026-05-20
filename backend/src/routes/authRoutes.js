const { Router } = require('express')
const authController = require('../controllers/authController')
const { requireAuth } = require('../middlewares/authMiddleware')

const authRoutes = Router()

authRoutes.post('/register', authController.register)
authRoutes.post('/login', authController.login)
authRoutes.get('/me', requireAuth, authController.me)

module.exports = authRoutes
