const AppError = require('../utils/AppError')

function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

function errorHandler(error, req, res, _next) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
    })
  }

  if (error?.name === 'MulterError') {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'A imagem deve ter no maximo 5MB'
        : 'Erro no envio da imagem'

    return res.status(400).json({ message })
  }

  console.error(error)

  return res.status(500).json({
    message: 'Internal server error',
  })
}

module.exports = {
  notFoundHandler,
  errorHandler,
}
