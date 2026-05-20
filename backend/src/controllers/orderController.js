const orderService = require('../services/orderService')
const { getIO } = require('../socket')

async function create(req, res, next) {
  try {
    const order = await orderService.createOrder(req.body)
    getIO().emit('new_order', order)
    return res.status(201).json(order)
  } catch (error) {
    return next(error)
  }
}

async function listByStore(req, res, next) {
  try {
    const { storeId } = req.params
    const orders = await orderService.listOrdersByStore(storeId)
    return res.status(200).json(orders)
  } catch (error) {
    return next(error)
  }
}

async function getCustomerByPhone(req, res, next) {
  try {
    const { storeId, phone } = req.params
    const result = await orderService.getCustomerAddressesByPhone(storeId, phone)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

async function getCustomerOrderHistory(req, res, next) {
  try {
    const { storeId, phone } = req.params
    const { fromDate, toDate } = req.query
    const result = await orderService.getCustomerOrderHistory(storeId, phone, {
      fromDate,
      toDate,
    })
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status } = req.body
    const order = await orderService.updateOrderStatus(id, status)
    getIO().emit('order_updated', order)
    return res.status(200).json(order)
  } catch (error) {
    return next(error)
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params
    await orderService.deleteOrder(id)
    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  create,
  listByStore,
  getCustomerByPhone,
  getCustomerOrderHistory,
  updateStatus,
  remove,
}
