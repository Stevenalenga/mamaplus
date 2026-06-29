// Test script to create sample users in the database
// Run with: pnpm db:seed

import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding users...')

  // Hash passwords
  const sharedHashedPassword = await bcrypt.hash('password123', 10)
  const adminAssistantHashedPassword = await bcrypt.hash('adminassist123', 10)
  const uthabitiTestPassword = await bcrypt.hash('Uth@b1t1Adm!n#2026', 10)

  const uthabitiTestUsers = [
    {
      email: 'educator@uthabitiafrica.org',
      name: 'Test Educator',
      role: 'INSTRUCTOR',
      phoneNumber: '254712345681',
    },
    {
      email: 'students@uthabitafrica.org',
      name: 'Test Student',
      role: 'USER',
      phoneNumber: '254712345682',
      gender: 'FEMALE',
    },
    {
      email: 'agency@uthabitiafrica.org',
      name: 'Test Agency',
      role: 'AGENCY',
      phoneNumber: '254712345683',
    },
  ] as const

  for (const account of uthabitiTestUsers) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        password: uthabitiTestPassword,
        role: account.role,
        name: account.name,
        phoneNumber: account.phoneNumber,
        isVerified: true,
        ...('gender' in account ? { gender: account.gender } : {}),
      },
      create: {
        email: account.email,
        password: uthabitiTestPassword,
        name: account.name,
        phoneNumber: account.phoneNumber,
        role: account.role,
        isVerified: true,
        ...('gender' in account ? { gender: account.gender } : {}),
      },
    })
    console.log(`✅ Created/updated test user (${account.role}):`, user.email)
  }

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@mamaplus.co.ke' },
    update: {
      password: sharedHashedPassword,
      role: 'USER',
      isVerified: true,
    },
    create: {
      email: 'test@mamaplus.co.ke',
      password: sharedHashedPassword,
      name: 'Test User',
      phoneNumber: '254712345678',
      role: 'USER',
      isVerified: true
    }
  })

  console.log('✅ Created test user:', testUser.email)

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mamaplus.co.ke' },
    update: {
      password: sharedHashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
    create: {
      email: 'admin@mamaplus.co.ke',
      password: sharedHashedPassword,
      name: 'Admin User',
      phoneNumber: '254712345679',
      role: 'ADMIN',
      isVerified: true
    }
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create admin assistant user
  const adminAssistantUser = await prisma.user.upsert({
    where: { email: 'admin.assistant@mamaplus.co.ke' },
    update: {
      password: adminAssistantHashedPassword,
      role: 'ADMIN_ASSISTANT',
      isVerified: true,
    },
    create: {
      email: 'admin.assistant@mamaplus.co.ke',
      password: adminAssistantHashedPassword,
      name: 'Admin Assistant User',
      phoneNumber: '254712345680',
      role: 'ADMIN_ASSISTANT',
      isVerified: true
    }
  })

  console.log('✅ Created admin assistant user:', adminAssistantUser.email)

  console.log('\n🎉 Seeding complete!')
  console.log('\n📝 Login credentials:')
  console.log('Test User - Email: test@mamaplus.co.ke, Password: password123')
  console.log('Admin User - Email: admin@mamaplus.co.ke, Password: password123')
  console.log('Admin Assistant - Email: admin.assistant@mamaplus.co.ke, Password: adminassist123')
  console.log('\nUthabiti test accounts (password: Uth@b1t1Adm!n#2026):')
  console.log('Educator - Email: educator@uthabitiafrica.org')
  console.log('Student  - Email: students@uthabitafrica.org')
  console.log('Agency   - Email: agency@uthabitiafrica.org')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding users:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
