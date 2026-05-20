const prisma = require('../prisma/client')
const AppError = require('../utils/AppError')
const { parsePositiveInt } = require('../utils/validators')

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

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/

function isValidTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)
}

function normalizeOperatingHours(rawHours) {
  const source = rawHours && typeof rawHours === 'object' ? rawHours : {}
  const normalized = {}

  DAY_KEYS.forEach((day) => {
    const incoming = source[day] || {}
    const open = isValidTime(incoming.open) ? incoming.open : DEFAULT_OPERATING_HOURS[day].open
    const close = isValidTime(incoming.close) ? incoming.close : DEFAULT_OPERATING_HOURS[day].close

    normalized[day] = {
      enabled:
        typeof incoming.enabled === 'boolean'
          ? incoming.enabled
          : DEFAULT_OPERATING_HOURS[day].enabled,
      open,
      close,
    }
  })

  return normalized
}

async function getStoreBySlug(slug) {
  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      categories: { orderBy: { name: 'asc' }, select: { id: true, name: true } },
      products: {
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          addons: {
            include: { addon: { select: { id: true, name: true, price: true } } },
          },
        },
      },
    },
  })

  if (!store) throw new AppError('Store not found', 404)

  const now = new Date()

  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    logoUrl: store.logoUrl || '',
    preparationTime: store.preparationTime || '25-35 min',
    primaryColor: store.primaryColor || '#ff6b00',
    secondaryColor: store.secondaryColor || '#1e1e1e',
    tertiaryColor: store.tertiaryColor || '#ffd166',
    isOpen: store.isOpen !== false,
    subscriptionStatus: store.subscriptionStatus || 'trial',
    trialEndsAt: store.trialEndsAt,
    operatingHours: normalizeOperatingHours(store.operatingHours),
    deliveryFee: Number(store.deliveryFee || 0),
    deliveryRadius: Number(store.deliveryRadius || 15),
    storeLatitude:
      store.storeLatitude !== null && store.storeLatitude !== undefined
        ? Number(store.storeLatitude)
        : null,
    storeLongitude:
      store.storeLongitude !== null && store.storeLongitude !== undefined
        ? Number(store.storeLongitude)
        : null,
    pixKey: store.pixKey || '',
    pixReceiverName: store.pixReceiverName || store.name,
    pixCity: store.pixCity || 'SAO PAULO',
    acceptsPixOnline: store.acceptsPixOnline,
    acceptsPixOnDelivery: store.acceptsPixOnDelivery,
    acceptsCreditCard: store.acceptsCreditCard,
    acceptsDebitCard: store.acceptsDebitCard,
    acceptsCash: store.acceptsCash,
    createdAt: store.createdAt,
    categories: store.categories,
    menu: store.products.map((product) => {
      const promoExpired =
        product.promotionEnd !== null &&
        product.promotionEnd !== undefined &&
        new Date(product.promotionEnd) < now

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        promotionalPrice: product.promotionalPrice !== null ? Number(product.promotionalPrice) : null,
        isPromotion: promoExpired ? false : product.isPromotion,
        promotionEnd: product.promotionEnd ? product.promotionEnd.toISOString() : null,
        isFeatured: product.isFeatured,
        salesCount: product.salesCount,
        image: product.image,
        categoryId: product.categoryId,
        category: product.category,
        storeId: product.storeId,
        addons: (product.addons || []).map((pa) => ({
          id: pa.addon.id,
          name: pa.addon.name,
          price: Number(pa.addon.price),
        })),
      }
    }),
  }
}

async function updateStoreSettings(storeIdRaw, payload) {
  const storeId = parsePositiveInt(storeIdRaw, 'storeId')
  const data = payload || {}

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  })

  if (!store) {
    throw new AppError('Store not found', 404)
  }

  if (data.deliveryFee !== undefined) {
    const parsedFee = Number(data.deliveryFee)
    if (Number.isNaN(parsedFee) || parsedFee < 0) {
      throw new AppError('deliveryFee must be a non-negative number', 400)
    }
  }

  if (data.deliveryRadius !== undefined) {
    const parsedRadius = Number(data.deliveryRadius)
    if (Number.isNaN(parsedRadius) || parsedRadius <= 0) {
      throw new AppError('deliveryRadius must be a positive number', 400)
    }
  }

  if (data.storeLatitude !== undefined && data.storeLatitude !== null) {
    const parsedLat = Number(data.storeLatitude)
    if (Number.isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      throw new AppError('storeLatitude must be a valid latitude (-90 to 90)', 400)
    }
  }

  if (data.storeLongitude !== undefined && data.storeLongitude !== null) {
    const parsedLon = Number(data.storeLongitude)
    if (Number.isNaN(parsedLon) || parsedLon < -180 || parsedLon > 180) {
      throw new AppError('storeLongitude must be a valid longitude (-180 to 180)', 400)
    }
  }

  if (data.name !== undefined && !String(data.name || '').trim()) {
    throw new AppError('name cannot be empty', 400)
  }

  ;['primaryColor', 'secondaryColor', 'tertiaryColor'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null && String(data[field]).trim() !== '') {
      if (!HEX_COLOR_REGEX.test(String(data[field]).trim())) {
        throw new AppError(`${field} must be a valid hex color`, 400)
      }
    }
  })

  const updateData = {
    name: data.name !== undefined ? String(data.name || '').trim() : undefined,
    logoUrl: data.logoUrl !== undefined ? String(data.logoUrl || '').trim() || null : undefined,
    preparationTime:
      data.preparationTime !== undefined
        ? String(data.preparationTime || '').trim() || null
        : undefined,
    primaryColor:
      data.primaryColor !== undefined ? String(data.primaryColor || '').trim() || null : undefined,
    secondaryColor:
      data.secondaryColor !== undefined ? String(data.secondaryColor || '').trim() || null : undefined,
    tertiaryColor:
      data.tertiaryColor !== undefined ? String(data.tertiaryColor || '').trim() || null : undefined,
    isOpen: data.isOpen !== undefined ? Boolean(data.isOpen) : undefined,
    deliveryFee:
      data.deliveryFee !== undefined
        ? Number(data.deliveryFee)
        : undefined,
    deliveryRadius:
      data.deliveryRadius !== undefined
        ? Number(data.deliveryRadius)
        : undefined,
    storeLatitude:
      data.storeLatitude !== undefined
        ? data.storeLatitude === null ? null : Number(data.storeLatitude)
        : undefined,
    storeLongitude:
      data.storeLongitude !== undefined
        ? data.storeLongitude === null ? null : Number(data.storeLongitude)
        : undefined,
    operatingHours:
      data.operatingHours !== undefined
        ? normalizeOperatingHours(data.operatingHours)
        : undefined,
    pixKey: data.pixKey !== undefined ? String(data.pixKey || '').trim() || null : undefined,
    pixReceiverName:
      data.pixReceiverName !== undefined
        ? String(data.pixReceiverName || '').trim() || null
        : undefined,
    pixCity: data.pixCity !== undefined ? String(data.pixCity || '').trim() || null : undefined,
    acceptsPixOnline:
      data.acceptsPixOnline !== undefined ? Boolean(data.acceptsPixOnline) : undefined,
    acceptsPixOnDelivery:
      data.acceptsPixOnDelivery !== undefined ? Boolean(data.acceptsPixOnDelivery) : undefined,
    acceptsCreditCard:
      data.acceptsCreditCard !== undefined ? Boolean(data.acceptsCreditCard) : undefined,
    acceptsDebitCard:
      data.acceptsDebitCard !== undefined ? Boolean(data.acceptsDebitCard) : undefined,
    acceptsCash: data.acceptsCash !== undefined ? Boolean(data.acceptsCash) : undefined,
  }

  const updatedStore = await prisma.store.update({
    where: { id: storeId },
    data: updateData,
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      preparationTime: true,
      primaryColor: true,
      secondaryColor: true,
      tertiaryColor: true,
      isOpen: true,
      operatingHours: true,
      deliveryFee: true,
      deliveryRadius: true,
      storeLatitude: true,
      storeLongitude: true,
      pixKey: true,
      pixReceiverName: true,
      pixCity: true,
      acceptsPixOnline: true,
      acceptsPixOnDelivery: true,
      acceptsCreditCard: true,
      acceptsDebitCard: true,
      acceptsCash: true,
    },
  })

  return {
    id: updatedStore.id,
    name: updatedStore.name,
    slug: updatedStore.slug,
    logoUrl: updatedStore.logoUrl || '',
    preparationTime: updatedStore.preparationTime || '25-35 min',
    primaryColor: updatedStore.primaryColor || '#ff6b00',
    secondaryColor: updatedStore.secondaryColor || '#1e1e1e',
    tertiaryColor: updatedStore.tertiaryColor || '#ffd166',
    isOpen: updatedStore.isOpen !== false,
    operatingHours: normalizeOperatingHours(updatedStore.operatingHours),
    deliveryFee: Number(updatedStore.deliveryFee || 0),
    deliveryRadius: Number(updatedStore.deliveryRadius || 15),
    storeLatitude:
      updatedStore.storeLatitude !== null && updatedStore.storeLatitude !== undefined
        ? Number(updatedStore.storeLatitude)
        : null,
    storeLongitude:
      updatedStore.storeLongitude !== null && updatedStore.storeLongitude !== undefined
        ? Number(updatedStore.storeLongitude)
        : null,
    pixKey: updatedStore.pixKey || '',
    pixReceiverName: updatedStore.pixReceiverName || updatedStore.name,
    pixCity: updatedStore.pixCity || 'SAO PAULO',
    acceptsPixOnline: updatedStore.acceptsPixOnline,
    acceptsPixOnDelivery: updatedStore.acceptsPixOnDelivery,
    acceptsCreditCard: updatedStore.acceptsCreditCard,
    acceptsDebitCard: updatedStore.acceptsDebitCard,
    acceptsCash: updatedStore.acceptsCash,
  }
}

module.exports = {
  getStoreBySlug,
  updateStoreSettings,
}
