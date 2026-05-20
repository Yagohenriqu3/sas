const AppError = require('./AppError')

function parsePositiveInt(value, fieldName) {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(`${fieldName} must be a positive integer`, 400)
  }

  return parsed
}

function ensureArray(value, fieldName) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new AppError(`${fieldName} must be a non-empty array`, 400)
  }
}

module.exports = {
  parsePositiveInt,
  ensureArray,
}
