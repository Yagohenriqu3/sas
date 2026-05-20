const { Router } = require('express')
const multer = require('multer')
const uploadController = require('../controllers/uploadController')
const AppError = require('../utils/AppError')
const { requireActiveStoreByBodyStoreId } = require('../middlewares/subscriptionMiddleware')

const uploadRoutes = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      cb(new AppError('Envie um arquivo de imagem valido', 400))
      return
    }

    cb(null, true)
  },
})

uploadRoutes.post(
  '/',
  upload.single('image'),
  requireActiveStoreByBodyStoreId('storeId'),
  uploadController.uploadImage,
)

module.exports = uploadRoutes
