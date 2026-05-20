const uploadService = require('../services/uploadService')

async function uploadImage(req, res, next) {
  try {
    const result = await uploadService.uploadProductImage(req.file)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  uploadImage,
}
