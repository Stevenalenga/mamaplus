/**
 * Quick password check script
 * 
 * This script quickly checks if users have properly hashed passwords
 * 
 * Usage: npx tsx scripts/check-passwords.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function isPasswordHashed(password: string): Promise<boolean> {
  // BCrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(password)
}

async function main() {
  console.log('\n🔍 Checking password status for all users...\n')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      createdAt: true,
    },
  })

  if (users.length === 0) {
    console.log('❌ No users found in the database.')
    console.log('\nTip: Create a test user by visiting http://localhost:3000/signup')
    return
  }

  console.log(`Found ${users.length} user(s):\n`)
  console.log('─'.repeat(80))

  let hashedCount = 0
  let plainTextCount = 0

  for (const user of users) {
    const isHashed = await isPasswordHashed(user.password)
    const status = isHashed ? '✅ HASHED' : '⚠️  PLAIN TEXT'
    const passwordPreview = user.password.substring(0, 30) + '...'

    console.log(`\nEmail:    ${user.email}`)
    console.log(`Name:     ${user.name || 'N/A'}`)
    console.log(`Status:   ${status}`)
    console.log(`Preview:  ${passwordPreview}`)
    console.log(`Created:  ${user.createdAt.toLocaleDateString()}`)

    if (isHashed) {
      hashedCount++
    } else {
      plainTextCount++
    }
  }

  console.log('\n' + '─'.repeat(80))
  console.log('\n📊 Summary:')
  console.log(`   Total Users:        ${users.length}`)
  console.log(`   Properly Hashed:    ${hashedCount} ✅`)
  console.log(`   Plain Text/Invalid: ${plainTextCount} ${plainTextCount > 0 ? '⚠️' : ''}`)

  if (plainTextCount > 0) {
    console.log('\n⚠️  ACTION REQUIRED:')
    console.log('   Some users have plain-text or invalid passwords.')
    console.log('   Run this command to fix them:')
    console.log('   ')
    console.log('   npx tsx scripts/fix-passwords.ts')
    console.log('')
  } else {
    console.log('\n✅ All passwords are properly hashed!')
  }

  console.log('')
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
