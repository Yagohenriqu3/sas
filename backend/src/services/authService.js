const bcrypt = require('bcryptjs')
const prisma = require('../prisma/client')
const AppError = require('../utils/AppError')
const { signAuthToken } = require('../utils/auth')

const TRIAL_DAYS = 14

function getMasterCredentials() {
  return {
    email: String(process.env.MASTER_EMAIL || 'master@lacheon.com').trim().toLowerCase(),
    password: String(process.env.MASTER_PASSWORD || 'master123'),
    fullName: String(process.env.MASTER_FULL_NAME || 'Master LacheON').trim(),
  }
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

async function generateUniqueStoreSlug(baseName) {
  const base = slugify(baseName) || `loja-${Date.now()}`
  let attempt = 0

  while (attempt < 20) {
    const suffix = attempt === 0 ? '' : `-${Math.floor(Math.random() * 9000) + 1000}`
    const slug = `${base}${suffix}`.slice(0, 55)
    const existing = await prisma.store.findUnique({ where: { slug }, select: { id: true } })
    if (!existing) return slug
    attempt += 1
  }

  throw new AppError('Nao foi possivel gerar um slug unico para a loja', 500)
}

function buildPublicLinks(slug) {
  const cardapioBase = process.env.CARDAPIO_BASE_URL || 'http://localhost:5173'
  const adminBase = process.env.CARDAPIO_ADMIN_URL || 'http://localhost:5173/admin'

  return {
    cardapioUrl: `${cardapioBase}?store=${slug}`,
    adminUrl: `${adminBase}?store=${slug}`,
  }
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

function serializeAuthPayload(user, store) {
  const links = buildPublicLinks(store.slug)
  const token = signAuthToken({
    sub: String(user.id),
    email: user.email,
    storeId: store.id,
    isMaster: false,
  })

  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      documentNumber: user.documentNumber || '',
      legalName: user.legalName || '',
      billingZip: user.billingZip || '',
      billingStreet: user.billingStreet || '',
      billingNumber: user.billingNumber || '',
      billingNeighborhood: user.billingNeighborhood || '',
      billingCity: user.billingCity || '',
      billingState: user.billingState || '',
      isMaster: false,
      createdAt: user.createdAt,
    },
    store: {
      id: store.id,
      name: store.name,
      slug: store.slug,
      trialEndsAt: store.trialEndsAt,
      subscriptionStatus: store.subscriptionStatus,
      ...links,
    },
  }
}

function serializeMasterPayload(email) {
  const credentials = getMasterCredentials()
  const token = signAuthToken({
    sub: '-1',
    email,
    isMaster: true,
    storeId: null,
  })

  return {
    token,
    user: {
      id: -1,
      fullName: credentials.fullName,
      email,
      isMaster: true,
      createdAt: new Date().toISOString(),
    },
    store: null,
  }
}

async function registerOwner(payload) {
  const fullName = String(payload?.fullName || '').trim()
  const email = String(payload?.email || '').trim().toLowerCase()
  const password = String(payload?.password || '')
  const storeName = String(payload?.storeName || '').trim()
  const phone = String(payload?.phone || '').trim()
  const documentNumber = String(payload?.documentNumber || '').trim()
  const legalName = String(payload?.legalName || '').trim()
  const billingZip = String(payload?.billingZip || '').trim()
  const billingStreet = String(payload?.billingStreet || '').trim()
  const billingNumber = String(payload?.billingNumber || '').trim()
  const billingNeighborhood = String(payload?.billingNeighborhood || '').trim()
  const billingCity = String(payload?.billingCity || '').trim()
  const billingState = String(payload?.billingState || '').trim()

  if (!fullName) throw new AppError('fullName is required', 400)
  if (!storeName) throw new AppError('storeName is required', 400)
  if (!email || !email.includes('@')) throw new AppError('email is required and must be valid', 400)
  if (password.length < 6) throw new AppError('password must have at least 6 characters', 400)
  if (!phone) throw new AppError('phone is required', 400)
  if (onlyDigits(phone).length < 10) throw new AppError('phone is invalid', 400)
  if (!documentNumber) throw new AppError('documentNumber is required', 400)
  if (![11, 14].includes(onlyDigits(documentNumber).length)) {
    throw new AppError('documentNumber must be CPF (11) or CNPJ (14)', 400)
  }
  if (!legalName) throw new AppError('legalName is required', 400)
  if (!billingZip) throw new AppError('billingZip is required', 400)
  if (!billingStreet) throw new AppError('billingStreet is required', 400)
  if (!billingNumber) throw new AppError('billingNumber is required', 400)
  if (!billingNeighborhood) throw new AppError('billingNeighborhood is required', 400)
  if (!billingCity) throw new AppError('billingCity is required', 400)
  if (!billingState || billingState.length < 2) throw new AppError('billingState is required', 400)

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existingUser) {
    throw new AppError('Ja existe uma conta com este email', 409)
  }

  const slug = await generateUniqueStoreSlug(storeName)
  const passwordHash = await bcrypt.hash(password, 10)

  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS)

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        phone,
        documentNumber,
        legalName,
        billingZip,
        billingStreet,
        billingNumber,
        billingNeighborhood,
        billingCity,
        billingState: billingState.toUpperCase(),
      },
    })

    const store = await tx.store.create({
      data: {
        name: storeName,
        slug,
        ownerUserId: user.id,
        trialEndsAt,
        subscriptionStatus: 'trial',
      },
    })

    return { user, store }
  })

  return serializeAuthPayload(result.user, result.store)
}

async function loginOwner(payload) {
  const email = String(payload?.email || '').trim().toLowerCase()
  const password = String(payload?.password || '')

  if (!email || !email.includes('@')) throw new AppError('email is required and must be valid', 400)
  if (!password) throw new AppError('password is required', 400)

  const masterCredentials = getMasterCredentials()
  if (email === masterCredentials.email && password === masterCredentials.password) {
    return serializeMasterPayload(email)
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      documentNumber: true,
      legalName: true,
      billingZip: true,
      billingStreet: true,
      billingNumber: true,
      billingNeighborhood: true,
      billingCity: true,
      billingState: true,
      passwordHash: true,
      createdAt: true,
      stores: {
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: {
          id: true,
          name: true,
          slug: true,
          trialEndsAt: true,
          subscriptionStatus: true,
        },
      },
    },
  })

  if (!user) throw new AppError('Credenciais invalidas', 401)

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatches) throw new AppError('Credenciais invalidas', 401)

  const store = user.stores[0]
  if (!store) throw new AppError('Conta sem loja vinculada', 400)

  return serializeAuthPayload(
    {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      documentNumber: user.documentNumber,
      legalName: user.legalName,
      billingZip: user.billingZip,
      billingStreet: user.billingStreet,
      billingNumber: user.billingNumber,
      billingNeighborhood: user.billingNeighborhood,
      billingCity: user.billingCity,
      billingState: user.billingState,
      createdAt: user.createdAt,
    },
    store,
  )
}

async function getMe(userIdRaw) {
  if (userIdRaw?.isMaster) {
    return serializeMasterPayload(String(userIdRaw.email || getMasterCredentials().email))
  }

  const userId = Number(userIdRaw)
  if (!userId) throw new AppError('Unauthorized', 401)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      documentNumber: true,
      legalName: true,
      billingZip: true,
      billingStreet: true,
      billingNumber: true,
      billingNeighborhood: true,
      billingCity: true,
      billingState: true,
      createdAt: true,
      stores: {
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: {
          id: true,
          name: true,
          slug: true,
          trialEndsAt: true,
          subscriptionStatus: true,
        },
      },
    },
  })

  if (!user) throw new AppError('Unauthorized', 401)
  const store = user.stores[0]
  if (!store) throw new AppError('Conta sem loja vinculada', 400)

  return serializeAuthPayload(user, store)
}

module.exports = {
  registerOwner,
  loginOwner,
  getMe,
}
