const masterService = require('../services/masterService')

async function listUsers(req, res, next) {
  try {
    const users = await masterService.listUsersWithStores()
    return res.status(200).json({ users })
  } catch (error) {
    return next(error)
  }
}

async function updateUser(req, res, next) {
  try {
    const result = await masterService.updateUserAndAccess({
      userId: req.params.userId,
      fullName: req.body?.fullName,
      email: req.body?.email,
      password: req.body?.password,
      phone: req.body?.phone,
      documentNumber: req.body?.documentNumber,
      legalName: req.body?.legalName,
      billingZip: req.body?.billingZip,
      billingStreet: req.body?.billingStreet,
      billingNumber: req.body?.billingNumber,
      billingNeighborhood: req.body?.billingNeighborhood,
      billingCity: req.body?.billingCity,
      billingState: req.body?.billingState,
      storeName: req.body?.storeName,
      accessUntil: req.body?.accessUntil,
      accessDays: req.body?.accessDays,
      subscriptionStatus: req.body?.subscriptionStatus,
    })

    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  listUsers,
  updateUser,
}
