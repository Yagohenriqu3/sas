const { Router } = require('express')
const masterController = require('../controllers/masterController')
const { requireAuth, requireMaster } = require('../middlewares/authMiddleware')

const masterRoutes = Router()

masterRoutes.get('/users', requireAuth, requireMaster, masterController.listUsers)
masterRoutes.patch('/users/:userId', requireAuth, requireMaster, masterController.updateUser)

module.exports = masterRoutes
