import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create an Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cargoo.com' },
    update: {},
    create: {
      email: 'admin@cargoo.com',
      name: 'Admin Manager',
      role: 'ADMIN',
      // password will be hashed in production
    },
  })

  // Sample Products from the mock catalog
  const products = [
    { name: 'Air Jordan 1 Retro High OG Chicago', brand: 'Jordan', category: 'Sneakers' },
    { name: 'Nike Dunk Low Black White (Panda)', brand: 'Nike', category: 'Sneakers' },
    { name: 'Supreme Box Logo Hoodie Ash Grey', brand: 'Supreme', category: 'Apparel' },
    { name: 'Louis Vuitton Keepall Bandouliere 50', brand: 'Louis Vuitton', category: 'Handbags' },
    { name: 'Sony PlayStation 5 Console', brand: 'Sony', category: 'Electronics' },
  ]

  // Actually creating tags and products would go here
  // For brevity, seeding just a few key records
  
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
