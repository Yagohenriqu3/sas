const prisma = require('../src/prisma/client')
const bcrypt = require('bcryptjs')

async function main() {
  /* ── User for LancheON Express ──────────────────────────────── */
  const hashedPassword = await bcrypt.hash('lancheon123', 10)
  const owner = await prisma.user.upsert({
    where: { email: 'lancheon-express@teste.com' },
    update: {},
    create: {
      fullName: 'LancheON Express Teste',
      email: 'lancheon-express@teste.com',
      passwordHash: hashedPassword,
      phone: '11999999999',
      documentNumber: '12345678900001',
      legalName: 'LancheON Express LTDA',
      billingZip: '01310100',
      billingStreet: 'Avenida Paulista',
      billingNumber: '1000',
      billingNeighborhood: 'Bela Vista',
      billingCity: 'São Paulo',
      billingState: 'SP',
    },
  })

  /* ── Store ─────────────────────────────────────────────────── */
  const store = await prisma.store.upsert({
    where: { slug: 'lacheon-express' },
    update: {
      ownerUserId: owner.id,
      pixKey: '11999999999',
      pixReceiverName: 'LancheON Express',
      pixCity: 'SAO PAULO',
      acceptsPixOnline: true,
      acceptsPixOnDelivery: true,
      acceptsCreditCard: true,
      acceptsDebitCard: true,
      acceptsCash: true,
    },
    create: {
      name: 'LancheON Express',
      slug: 'lacheon-express',
      ownerUserId: owner.id,
      pixKey: '11999999999',
      pixReceiverName: 'LancheON Express',
      pixCity: 'SAO PAULO',
      acceptsPixOnline: true,
      acceptsPixOnDelivery: true,
      acceptsCreditCard: true,
      acceptsDebitCard: true,
      acceptsCash: true,
    },
  })

  /* ── Categories ─────────────────────────────────────────────── */
  const categoryNames = ['Burgers', 'Combos', 'Bebidas']
  const categories = {}

  for (const name of categoryNames) {
    const existing = await prisma.category.findFirst({
      where: { storeId: store.id, name },
    })

    if (existing) {
      categories[name] = existing
    } else {
      categories[name] = await prisma.category.create({
        data: { name, storeId: store.id },
      })
    }
  }

  /* ── Products ────────────────────────────────────────────────── */
  // Deletar em cascata respeitando as foreign keys
  await prisma.orderItemAddon.deleteMany({
    where: {
      orderItem: {
        order: { storeId: store.id }
      }
    }
  })
  await prisma.orderItem.deleteMany({
    where: {
      order: { storeId: store.id }
    }
  })
  await prisma.order.deleteMany({ where: { storeId: store.id } })
  await prisma.productAddon.deleteMany({
    where: {
      product: { storeId: store.id }
    }
  })
  await prisma.addon.deleteMany({ where: { storeId: store.id } })
  await prisma.product.deleteMany({ where: { storeId: store.id } })

  await prisma.product.createMany({
    data: [
      {
        name: 'Cheddar Supreme',
        description: 'Pao brioche, blend 160g, cheddar cremoso e cebola crispy.',
        price: 29.9,
        promotionalPrice: null,
        isPromotion: false,
        promotionEnd: null,
        isFeatured: true,
        salesCount: 87,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
        storeId: store.id,
        categoryId: categories['Burgers'].id,
      },
      {
        name: 'Bacon House',
        description: 'Hamburguer 180g, queijo prato, bacon em tiras e molho da casa.',
        price: 33.5,
        promotionalPrice: 27.9,
        isPromotion: true,
        promotionEnd: new Date('2026-08-20T23:59:00'),
        isFeatured: false,
        salesCount: 134,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
        storeId: store.id,
        categoryId: categories['Burgers'].id,
      },
      {
        name: 'Combo Classico',
        description: 'Burger classico + fritas media + refrigerante lata.',
        price: 42.9,
        promotionalPrice: null,
        isPromotion: false,
        promotionEnd: null,
        isFeatured: false,
        salesCount: 212,
        image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&w=900&q=80',
        storeId: store.id,
        categoryId: categories['Combos'].id,
      },
      {
        name: 'Combo Duplo',
        description: 'Dois burgers smash + fritas grande + 2 refrigerantes.',
        price: 64.9,
        promotionalPrice: 54.9,
        isPromotion: true,
        promotionEnd: new Date('2026-08-25T23:59:00'),
        isFeatured: false,
        salesCount: 98,
        image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=900&q=80',
        storeId: store.id,
        categoryId: categories['Combos'].id,
      },
      {
        name: 'Limonada Pink',
        description: 'Limonada com frutas vermelhas e gelo.',
        price: 11.9,
        promotionalPrice: null,
        isPromotion: false,
        promotionEnd: null,
        isFeatured: false,
        salesCount: 45,
        image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=900&q=80',
        storeId: store.id,
        categoryId: categories['Bebidas'].id,
      },
      {
        name: 'Milkshake Oreo',
        description: 'Milkshake cremoso de baunilha com pedacos de Oreo.',
        price: 17.9,
        promotionalPrice: 12.9,
        isPromotion: true,
        promotionEnd: new Date('2026-09-15T20:00:00'),
        isFeatured: false,
        salesCount: 73,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80',
        storeId: store.id,
        categoryId: categories['Bebidas'].id,
      },
    ],
  })

  console.log(`Seed concluido — store: "${store.name}" (id: ${store.id})`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
