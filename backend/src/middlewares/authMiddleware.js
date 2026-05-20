const AppError = require('../utils/AppError')
const { verifyAuthToken } = require('../utils/auth')

function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const [scheme, token] = authHeader.split(' ')

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Unauthorized', 401)
    }

    const payload = verifyAuthToken(token)
    req.auth = {
      userId: Number(payload.sub),
      email: payload.email,
      storeId: payload.storeId ? Number(payload.storeId) : null,
      isMaster: Boolean(payload.isMaster),
    }

    return next()
  } catch (error) {
    if (error instanceof AppError) return next(error)
    return next(new AppError('Unauthorized', 401))
  }
}

function requireMaster(req, _res, next) {
  if (!req.auth?.isMaster) {
    return next(new AppError('Forbidden', 403))
  }

  return next()
}

module.exports = {
  requireAuth,
  requireMaster,
}
