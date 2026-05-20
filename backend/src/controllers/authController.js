const authService = require('../services/authService')

async function register(req, res, next) {
  try {
    const result = await authService.registerOwner(req.body)
    return res.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.loginOwner(req.body)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

async function me(req, res, next) {
  try {
    const result = await authService.getMe(req.auth)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  register,
  login,
  me,
}
