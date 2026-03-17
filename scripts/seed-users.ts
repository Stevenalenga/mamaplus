// Test script to create sample users in the database
// Run with: pnpm db:seed

import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding users...')

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@mamaplus.co.ke' },
    update: {},
    create: {
      email: 'test@mamaplus.co.ke',
      password: hashedPassword,
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
    update: {},
    create: {
      email: 'admin@mamaplus.co.ke',
      password: hashedPassword,
      name: 'Admin User',
      phoneNumber: '254712345679',
      role: 'ADMIN',
      isVerified: true
    }
  })

  console.log('✅ Created admin user:', adminUser.email)

  console.log('\n🎉 Seeding complete!')
  console.log('\n📝 Login credentials:')
  console.log('Test User - Email: test@mamaplus.co.ke, Password: password123')
  console.log('Admin User - Email: admin@mamaplus.co.ke, Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding users:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
