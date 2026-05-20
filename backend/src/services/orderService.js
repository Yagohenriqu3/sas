const prisma = require('../prisma/client')
const AppError = require('../utils/AppError')
const { ensureArray, parsePositiveInt } = require('../utils/validators')
const { generatePixCopyPaste } = require('../utils/pix')
const { isWithinDeliveryRadius } = require('../utils/distance')
const { geocodeCustomerAddress } = require('../utils/geocoding')

const PAYMENT_METHODS = ['pix_online', 'pix_on_delivery', 'credit_card', 'debit_card', 'cash']

const PAYMENT_METHOD_LABELS = {
  pix_online: 'PIX online',
  pix_on_delivery: 'PIX presencial',
  credit_card: 'Cartao de credito',
  debit_card: 'Cartao de debito',
  cash: 'Dinheiro',
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const DEFAULT_OPERATING_HOURS = {
  sunday: { enabled: true, open: '08:00', close: '22:00' },
  monday: { enabled: true, open: '08:00', close: '22:00' },
  tuesday: { enabled: true, open: '08:00', close: '22:00' },
  wednesday: { enabled: true, open: '08:00', close: '22:00' },
  thursday: { enabled: true, open: '08:00', close: '22:00' },
  friday: { enabled: true, open: '08:00', close: '22:00' },
  saturday: { enabled: true, open: '08:00', close: '22:00' },
}

function isValidTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)
}

function normalizeOperatingHours(rawHours) {
  const source = rawHours && typeof rawHours === 'object' ? rawHours : {}
  const normalized = {}

  DAY_KEYS.forEach((day) => {
    const incoming = source[day] || {}
    normalized[day] = {
      enabled:
        typeof incoming.enabled === 'boolean'
          ? incoming.enabled
          : DEFAULT_OPERATING_HOURS[day].enabled,
      open: isValidTime(incoming.open) ? incoming.open : DEFAULT_OPERATING_HOURS[day].open,
      close: isValidTime(incoming.close) ? incoming.close : DEFAULT_OPERATING_HOURS[day].close,
    }
  })

  return normalized
}

function parseTimeToMinutes(timeValue) {
  const [hours, minutes] = timeValue.split(':').map(Number)
  return (hours * 60) + minutes
}

function getEffectiveProductPrice(product) {
  const basePrice = Number(product.price)
  const promoPrice = product.promotionalPrice !== null ? Number(product.promotionalPrice) : null
  const hasPromotion = Boolean(product.isPromotion) && promoPrice !== null && promoPrice > 0

  if (!hasPromotion) {
    return basePrice
  }

  if (!product.promotionEnd) {
    return promoPrice
  }

  return new Date(product.promotionEnd) > new Date() ? promoPrice : basePrice
}

function isStoreAcceptingOrders(store) {
  if (store.isOpen === false) {
    return false
  }

  const now = new Date()
  const hoursConfig = normalizeOperatingHours(store.operatingHours)
  const dayIndex = now.getDay()
  const dayKey = DAY_KEYS[dayIndex]
  const previousDayKey = DAY_KEYS[(dayIndex + 6) % DAY_KEYS.length]
  const today = hoursConfig[dayKey]
  const yesterday = hoursConfig[previousDayKey]
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  if (yesterday?.enabled) {
    const yesterdayOpenMinutes = parseTimeToMinutes(yesterday.open)
    const yesterdayCloseMinutes = parseTimeToMinutes(yesterday.close)

    if (yesterdayOpenMinutes === yesterdayCloseMinutes) {
      return true
    }

    if (yesterdayCloseMinutes < yesterdayOpenMinutes && nowMinutes <= yesterdayCloseMinutes) {
      return true
    }
  }

  if (!today?.enabled) {
    return false
  }

  const openMinutes = parseTimeToMinutes(today.open)
  const closeMinutes = parseTimeToMinutes(today.close)

  if (openMinutes === closeMinutes) {
    return true
  }

  if (closeMinutes > openMinutes) {
    return nowMinutes >= openMinutes && nowMinutes <= closeMinutes
  }

  return nowMinutes >= openMinutes || nowMinutes <= closeMinutes
}

function serializeOrder(order) {
  return {
    id: order.id,
    storeId: order.storeId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    paymentMethod: order.paymentMethod,
    paymentMethodLabel: PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paymentDetail: order.paymentDetail,
    pixCopyPaste: order.pixCopyPaste,
    needsChange: Boolean(order.needsChange),
    changeFor: order.changeFor !== null ? Number(order.changeFor) : null,
    customerCep: order.customerCep,
    customerStreet: order.customerStreet,
    customerNumber: order.customerNumber,
    customerNeighborhood: order.customerNeighborhood,
    customerCity: order.customerCity,
    customerState: order.customerState,
    customerComplement: order.customerComplement,
    customerLatitude: order.customerLatitude !== null ? Number(order.customerLatitude) : null,
    customerLongitude: order.customerLongitude !== null ? Number(order.customerLongitude) : null,
    customerMapsLink: order.customerMapsLink,
    deliveryFee: Number(order.deliveryFee || 0),
    status: order.status,
    total: Number(order.total),
    createdAt: order.createdAt,
    items: order.orderItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.price),
      observation: item.observation,
      addons: (item.addons || []).map((addon) => ({
        id: addon.id,
        addonId: addon.addonId,
        name: addon.name,
        price: Number(addon.price),
        quantity: addon.quantity,
      })),
      product: item.product,
    })),
  }
}

const ORDER_INCLUDE = {
  orderItems: {
    include: {
      addons: true,
      product: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  },
}

async function createOrder(payload) {
  const {
    storeId: storeIdRaw,
    customerName,
    customerPhone,
    paymentMethod,
    paymentStatus,
    paymentDetail,
    needsChange,
    changeFor,
    customerCep,
    customerStreet,
    customerNumber,
    customerNeighborhood,
    customerCity,
    customerState,
    customerComplement,
    customerLatitude,
    customerLongitude,
    customerMapsLink,
    items,
  } = payload || {}

  const storeId = parsePositiveInt(storeIdRaw, 'storeId')

  if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
    throw new AppError('customerName is required', 400)
  }

  if (!customerPhone || typeof customerPhone !== 'string' || customerPhone.trim() === '') {
    throw new AppError('customerPhone is required', 400)
  }

  if (!paymentMethod || !PAYMENT_METHODS.includes(paymentMethod)) {
    throw new AppError(`paymentMethod is required and must be one of: ${PAYMENT_METHODS.join(', ')}`, 400)
  }

  ensureArray(items, 'items')

  const normalizedItems = items.map((item, index) => {
    try {
      const rawAddons = Array.isArray(item.addons) ? item.addons : []
      const addons = rawAddons.map((a, ai) => ({
        addonId: parsePositiveInt(a.addonId, `items[${index}].addons[${ai}].addonId`),
        quantity: parsePositiveInt(a.quantity, `items[${index}].addons[${ai}].quantity`),
      }))

      return {
        productId: parsePositiveInt(item.productId, `items[${index}].productId`),
        quantity: parsePositiveInt(item.quantity, `items[${index}].quantity`),
        observation:
          typeof item.observation === 'string' && item.observation.trim()
            ? item.observation.trim().slice(0, 300)
            : null,
        addons,
      }
    } catch {
      throw new AppError(`Invalid item at index ${index}`, 400)
    }
  })

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: {
      id: true,
      pixKey: true,
      pixReceiverName: true,
      pixCity: true,
      isOpen: true,
      operatingHours: true,
      deliveryFee: true,
      deliveryRadius: true,
      storeLatitude: true,
      storeLongitude: true,
      acceptsPixOnline: true,
      acceptsPixOnDelivery: true,
      acceptsCreditCard: true,
      acceptsDebitCard: true,
      acceptsCash: true,
    },
  })

  if (!store) {
    throw new AppError('Store not found', 404)
  }

  if (!isStoreAcceptingOrders(store)) {
    throw new AppError('Loja fechada no momento', 400)
  }

  // Validar raio de entrega
  let resolvedCustomerLatitude =
    customerLatitude !== null && customerLatitude !== undefined ? Number(customerLatitude) : null
  let resolvedCustomerLongitude =
    customerLongitude !== null && customerLongitude !== undefined ? Number(customerLongitude) : null

  const hasInvalidCustomerCoords =
    (resolvedCustomerLatitude !== null && Number.isNaN(resolvedCustomerLatitude)) ||
    (resolvedCustomerLongitude !== null && Number.isNaN(resolvedCustomerLongitude))

  if (hasInvalidCustomerCoords) {
    throw new AppError('Coordenadas de endereco invalidas', 400)
  }

  const hasCustomerCoords = resolvedCustomerLatitude !== null && resolvedCustomerLongitude !== null
  const hasStoreCoords = store.storeLatitude !== null && store.storeLatitude !== undefined && store.storeLongitude !== null && store.storeLongitude !== undefined

  if (!hasCustomerCoords && hasStoreCoords) {
    const geocoded = await geocodeCustomerAddress({
      cep: customerCep,
      street: customerStreet,
      number: customerNumber,
      neighborhood: customerNeighborhood,
      city: customerCity,
      state: customerState,
    })

    if (!geocoded) {
      throw new AppError(
        'Nao foi possivel validar o endereco pelo CEP. Confira os dados ou use "Registrar geolocalizacao".',
        400,
      )
    }

    resolvedCustomerLatitude = geocoded.latitude
    resolvedCustomerLongitude = geocoded.longitude
  }

  if (resolvedCustomerLatitude !== null && resolvedCustomerLongitude !== null && hasStoreCoords) {
    const { isWithinRadius, distance } = isWithinDeliveryRadius(
      store.storeLatitude,
      store.storeLongitude,
      resolvedCustomerLatitude,
      resolvedCustomerLongitude,
      store.deliveryRadius,
    )

    if (!isWithinRadius) {
      throw new AppError('A loja nao atua nesse endereco.', 400)
    }
  }

  const methodAvailability = {
    pix_online: store.acceptsPixOnline,
    pix_on_delivery: store.acceptsPixOnDelivery,
    credit_card: store.acceptsCreditCard,
    debit_card: store.acceptsDebitCard,
    cash: store.acceptsCash,
  }

  if (!methodAvailability[paymentMethod]) {
    throw new AppError('Selected payment method is not available for this store', 400)
  }

  const productIds = [...new Set(normalizedItems.map((item) => item.productId))]
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      storeId,
    },
    select: {
      id: true,
      name: true,
      price: true,
      promotionalPrice: true,
      isPromotion: true,
      promotionEnd: true,
      image: true,
      storeId: true,
    },
  })

  if (products.length !== productIds.length) {
    throw new AppError('One or more products are invalid for this store', 400)
  }

  const productsMap = new Map(products.map((product) => [product.id, product]))

  // Fetch addon prices from DB (use DB price as source of truth)
  const allAddonIds = [
    ...new Set(
      normalizedItems.flatMap((item) => item.addons.map((a) => a.addonId)),
    ),
  ]

  const addonRecords =
    allAddonIds.length > 0
      ? await prisma.addon.findMany({
          where: { id: { in: allAddonIds }, storeId },
          select: { id: true, name: true, price: true },
        })
      : []

  const addonsMap = new Map(addonRecords.map((a) => [a.id, a]))

  const orderItemsData = normalizedItems.map((item) => {
    const product = productsMap.get(item.productId)
    const unitPrice = getEffectiveProductPrice(product)

    const addonsCost = item.addons.reduce((sum, a) => {
      const addonRecord = addonsMap.get(a.addonId)
      return sum + (addonRecord ? Number(addonRecord.price) : 0) * a.quantity
    }, 0)

    return {
      productId: item.productId,
      quantity: item.quantity,
      price: unitPrice,
      observation: item.observation,
      addons: item.addons.map((a) => {
        const addonRecord = addonsMap.get(a.addonId)
        return {
          addonId: a.addonId,
          quantity: a.quantity,
          name: addonRecord?.name || '',
          price: addonRecord ? Number(addonRecord.price) : 0,
        }
      }),
      subtotal: (unitPrice + addonsCost) * item.quantity,
    }
  })

  const subtotalItems = orderItemsData.reduce((accumulator, item) => accumulator + item.subtotal, 0)
  const deliveryFee = Number(store.deliveryFee || 0)
  const total = subtotalItems + deliveryFee
  const parsedChangeFor =
    changeFor !== undefined && changeFor !== null && String(changeFor).trim() !== ''
      ? Number(changeFor)
      : null
  const needsChangeBool = paymentMethod === 'cash' ? Boolean(needsChange) : false

  if (paymentMethod === 'cash' && needsChangeBool && (parsedChangeFor === null || Number.isNaN(parsedChangeFor))) {
    throw new AppError('changeFor is required when customer needs change', 400)
  }

  if (paymentMethod === 'cash' && needsChangeBool && parsedChangeFor < total) {
    throw new AppError('changeFor must be greater than or equal to order total', 400)
  }

  const defaultPaymentStatus = paymentMethod === 'pix_online' ? 'awaiting_payment' : 'pending'
  const resolvedPaymentStatus =
    typeof paymentStatus === 'string' && paymentStatus.trim() ? paymentStatus.trim() : defaultPaymentStatus

  let resolvedPaymentDetail = typeof paymentDetail === 'string' ? paymentDetail.trim() : ''
  if (!resolvedPaymentDetail) {
    if (paymentMethod === 'cash') {
      resolvedPaymentDetail = needsChangeBool
        ? `Cliente solicitou troco para R$ ${parsedChangeFor.toFixed(2)}`
        : 'Cliente informou que nao precisa de troco'
    } else if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      resolvedPaymentDetail = 'Pagamento em cartao na entrega. Levar maquina.'
    } else if (paymentMethod === 'pix_on_delivery') {
      resolvedPaymentDetail = 'Pagamento em PIX presencial na entrega.'
    } else {
      resolvedPaymentDetail = 'Pagamento em PIX online.'
    }
  }

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        storeId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        paymentMethod,
        paymentStatus: resolvedPaymentStatus,
        paymentDetail: resolvedPaymentDetail,
        needsChange: needsChangeBool,
        changeFor: needsChangeBool ? parsedChangeFor : null,
        customerCep: customerCep ? String(customerCep).trim() : null,
        customerStreet: customerStreet ? String(customerStreet).trim() : null,
        customerNumber: customerNumber ? String(customerNumber).trim() : null,
        customerNeighborhood: customerNeighborhood ? String(customerNeighborhood).trim() : null,
        customerCity: customerCity ? String(customerCity).trim() : null,
        customerState: customerState ? String(customerState).trim() : null,
        customerComplement: customerComplement ? String(customerComplement).trim() : null,
        customerLatitude:
          resolvedCustomerLatitude,
        customerLongitude:
          resolvedCustomerLongitude,
        customerMapsLink: customerMapsLink ? String(customerMapsLink).trim() : null,
        deliveryFee,
        total,
        status: 'pending',
      },
    })

    if (paymentMethod === 'pix_online') {
      if (!store.pixKey) {
        throw new AppError('Store PIX key is not configured', 400)
      }

      const pixCode = generatePixCopyPaste({
        pixKey: store.pixKey,
        receiverName: store.pixReceiverName || 'LancheON',
        city: store.pixCity || 'SAO PAULO',
        amount: total,
        txid: `PED${createdOrder.id}`,
        description: `Pedido ${createdOrder.id} ${customerName}`,
      })

      await tx.order.update({
        where: { id: createdOrder.id },
        data: { pixCopyPaste: pixCode },
      })
    }

    await tx.orderItem.createMany({
      data: orderItemsData.map((item) => ({
        orderId: createdOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        observation: item.observation,
      })),
    })

    // Save OrderItemAddons (need IDs, so fetch created items and match by productId)
    const hasAddons = orderItemsData.some((item) => item.addons?.length > 0)
    if (hasAddons) {
      const createdItems = await tx.orderItem.findMany({
        where: { orderId: createdOrder.id },
        select: { id: true, productId: true },
      })

      for (const createdItem of createdItems) {
        const itemData = orderItemsData.find((d) => d.productId === createdItem.productId)
        if (!itemData?.addons?.length) continue

        await tx.orderItemAddon.createMany({
          data: itemData.addons.map((a) => ({
            orderItemId: createdItem.id,
            addonId: a.addonId,
            name: a.name,
            price: a.price,
            quantity: a.quantity,
          })),
        })
      }
    }

    for (const item of normalizedItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          salesCount: { increment: item.quantity },
        },
      })
    }

    return tx.order.findUnique({
      where: { id: createdOrder.id },
      include: ORDER_INCLUDE,
    })
  })

  return serializeOrder(order)
}

async function listOrdersByStore(storeIdRaw) {
  const storeId = parsePositiveInt(storeIdRaw, 'storeId')

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  })

  if (!store) {
    throw new AppError('Store not found', 404)
  }

  const orders = await prisma.order.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
    include: ORDER_INCLUDE,
  })

  return orders.map(serializeOrder)
}

async function getCustomerAddressesByPhone(storeIdRaw, phoneRaw) {
  const storeId = parsePositiveInt(storeIdRaw, 'storeId')
  const customerPhone = String(phoneRaw || '').replace(/\D/g, '')

  if (customerPhone.length < 10) {
    throw new AppError('customerPhone must have at least 10 digits', 400)
  }

  const orders = await prisma.order.findMany({
    where: { storeId, customerPhone },
    orderBy: { createdAt: 'desc' },
    select: {
      customerName: true,
      customerPhone: true,
      customerCep: true,
      customerStreet: true,
      customerNumber: true,
      customerNeighborhood: true,
      customerCity: true,
      customerState: true,
      customerComplement: true,
      customerLatitude: true,
      customerLongitude: true,
      customerMapsLink: true,
      createdAt: true,
    },
  })

  if (!orders.length) {
    return {
      found: false,
      customerName: null,
      customerPhone,
      addresses: [],
    }
  }

  const addressesMap = new Map()

  for (const order of orders) {
    const key = [
      order.customerCep || '',
      order.customerStreet || '',
      order.customerNumber || '',
      order.customerNeighborhood || '',
      order.customerCity || '',
      order.customerState || '',
      order.customerComplement || '',
      order.customerMapsLink || '',
    ].join('|')

    if (!addressesMap.has(key)) {
      addressesMap.set(key, {
        key,
        cep: order.customerCep || '',
        street: order.customerStreet || '',
        number: order.customerNumber || '',
        neighborhood: order.customerNeighborhood || '',
        city: order.customerCity || '',
        state: order.customerState || '',
        complement: order.customerComplement || '',
        latitude: order.customerLatitude !== null ? Number(order.customerLatitude) : null,
        longitude: order.customerLongitude !== null ? Number(order.customerLongitude) : null,
        mapsLink: order.customerMapsLink || '',
      })
    }
  }

  return {
    found: true,
    customerName: orders[0].customerName,
    customerPhone,
    addresses: Array.from(addressesMap.values()),
  }
}

function buildDateFilter(fromDateRaw, toDateRaw) {
  if (!fromDateRaw && !toDateRaw) return undefined

  const filter = {}

  if (fromDateRaw) {
    const from = new Date(`${fromDateRaw}T00:00:00.000Z`)
    if (Number.isNaN(from.getTime())) {
      throw new AppError('Invalid fromDate. Expected format YYYY-MM-DD', 400)
    }
    filter.gte = from
  }

  if (toDateRaw) {
    const to = new Date(`${toDateRaw}T23:59:59.999Z`)
    if (Number.isNaN(to.getTime())) {
      throw new AppError('Invalid toDate. Expected format YYYY-MM-DD', 400)
    }
    filter.lte = to
  }

  return filter
}

async function getCustomerOrderHistory(storeIdRaw, phoneRaw, filters = {}) {
  const storeId = parsePositiveInt(storeIdRaw, 'storeId')
  const customerPhone = String(phoneRaw || '').replace(/\D/g, '')

  if (customerPhone.length < 10) {
    throw new AppError('customerPhone must have at least 10 digits', 400)
  }

  const createdAtFilter = buildDateFilter(filters.fromDate, filters.toDate)

  const where = {
    storeId,
    customerPhone,
  }

  if (createdAtFilter) {
    where.createdAt = createdAtFilter
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: ORDER_INCLUDE,
  })

  const serializedOrders = orders.map(serializeOrder)

  const addressesMap = new Map()
  for (const order of serializedOrders) {
    const hasAddressData =
      Boolean(order.customerStreet) ||
      Boolean(order.customerNumber) ||
      Boolean(order.customerNeighborhood) ||
      Boolean(order.customerCity) ||
      Boolean(order.customerState) ||
      Boolean(order.customerCep) ||
      Boolean(order.customerMapsLink)

    if (!hasAddressData) continue

    const key = [
      order.customerCep || '',
      order.customerStreet || '',
      order.customerNumber || '',
      order.customerNeighborhood || '',
      order.customerCity || '',
      order.customerState || '',
      order.customerComplement || '',
      order.customerMapsLink || '',
    ].join('|')

    if (!addressesMap.has(key)) {
      addressesMap.set(key, {
        key,
        cep: order.customerCep || '',
        street: order.customerStreet || '',
        number: order.customerNumber || '',
        neighborhood: order.customerNeighborhood || '',
        city: order.customerCity || '',
        state: order.customerState || '',
        complement: order.customerComplement || '',
        latitude: order.customerLatitude,
        longitude: order.customerLongitude,
        mapsLink: order.customerMapsLink || '',
        lastUsedAt: order.createdAt,
      })
    }
  }

  return {
    found: serializedOrders.length > 0,
    customer: serializedOrders.length
      ? {
          name: serializedOrders[0].customerName,
          phone: serializedOrders[0].customerPhone,
        }
      : {
          name: null,
          phone: customerPhone,
        },
    addresses: Array.from(addressesMap.values()),
    orders: serializedOrders,
  }
}

const VALID_STATUSES = ['pending', 'preparing', 'delivery', 'done']

async function updateOrderStatus(orderId, status) {
  const id = parsePositiveInt(orderId, 'orderId')

  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400)
  }

  const existing = await prisma.order.findUnique({ where: { id } })

  if (!existing) {
    throw new AppError('Order not found', 404)
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: ORDER_INCLUDE,
  })

  return serializeOrder(updated)
}

async function deleteOrder(orderId) {
  const id = parsePositiveInt(orderId, 'orderId')

  const existing = await prisma.order.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError('Order not found', 404)
  }

  await prisma.order.delete({ where: { id } })
}

module.exports = {
  createOrder,
  listOrdersByStore,
  getCustomerAddressesByPhone,
  getCustomerOrderHistory,
  updateOrderStatus,
  deleteOrder,
}
