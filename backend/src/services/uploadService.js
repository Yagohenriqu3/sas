const cloudinary = require('../utils/cloudinary')
const AppError = require('../utils/AppError')

function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        resolve(result)
      },
    )

    uploadStream.end(buffer)
  })
}

async function uploadProductImage(file) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new AppError('Cloudinary nao configurado no servidor', 500)
  }

  if (!file || !file.buffer) {
    throw new AppError('Arquivo de imagem nao enviado', 400)
  }

  let uploaded

  try {
    uploaded = await uploadBufferToCloudinary(file.buffer, 'lacheon/products')
  } catch (error) {
    throw new AppError(`Falha no upload para Cloudinary: ${error.message || 'erro desconhecido'}`, 502)
  }

  const optimizedUrl = cloudinary.url(uploaded.public_id, {
    secure: true,
    transformation: [
      { width: 500, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  })

  return {
    url: optimizedUrl,
    publicId: uploaded.public_id,
    width: uploaded.width,
    height: uploaded.height,
  }
}

module.exports = {
  uploadProductImage,
}
