import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

async function seedCaregivers() {
  console.log('🌱 Seeding caregivers...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  const caregivers = [
    {
      email: 'mary.caregiver@example.com',
      name: 'Mary Johnson',
      password: hashedPassword,
      role: 'USER',
      gender: 'FEMALE',
      phoneNumber: '+254712345671',
      isVerified: true,
    },
    {
      email: 'john.caregiver@example.com',
      name: 'John Kamau',
      password: hashedPassword,
      role: 'USER',
      gender: 'MALE',
      phoneNumber: '+254712345672',
      isVerified: true,
    },
    {
      email: 'grace.caregiver@example.com',
      name: 'Grace Wanjiku',
      password: hashedPassword,
      role: 'USER',
      gender: 'FEMALE',
      phoneNumber: '+254712345673',
      isVerified: true,
    },
    {
      email: 'peter.caregiver@example.com',
      name: 'Peter Omondi',
      password: hashedPassword,
      role: 'USER',
      gender: 'MALE',
      phoneNumber: '+254712345674',
      isVerified: true,
    },
    {
      email: 'sarah.caregiver@example.com',
      name: 'Sarah Akinyi',
      password: hashedPassword,
      role: 'USER',
      gender: 'FEMALE',
      phoneNumber: '+254712345675',
      isVerified: true,
    },
  ]

  for (const caregiver of caregivers) {
    const existing = await prisma.user.findUnique({
      where: { email: caregiver.email },
    })

    if (!existing) {
      await prisma.user.create({
        data: caregiver,
      })
      console.log(`✅ Created caregiver: ${caregiver.name}`)
    } else {
      console.log(`⏭️  Caregiver already exists: ${caregiver.name}`)
    }
  }

  console.log('✅ Caregivers seeded successfully')
}

seedCaregivers()
  .catch((e) => {
    console.error('❌ Error seeding caregivers:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
