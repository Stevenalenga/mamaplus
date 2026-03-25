import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

async function seedAgency() {
  console.log('🌱 Seeding test agency...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  const agency = {
    email: 'agency@mamaplus.co.ke',
    name: 'MamaPlus Agency',
    password: hashedPassword,
    role: 'AGENCY',
    phoneNumber: '+254712345600',
    isVerified: true,
  }

  const existing = await prisma.user.findUnique({
    where: { email: agency.email },
  })

  if (!existing) {
    await prisma.user.create({
      data: agency,
    })
    console.log(`✅ Created agency: ${agency.name}`)
  } else {
    console.log(`⏭️  Agency already exists: ${agency.name}`)
  }

  console.log('✅ Agency seeded successfully')
  console.log('📧 Login: agency@mamaplus.co.ke')
  console.log('🔑 Password: password123')
}

seedAgency()
  .catch((e) => {
    console.error('❌ Error seeding agency:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
