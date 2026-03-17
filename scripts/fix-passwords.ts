/**
 * Script to diagnose and fix password issues
 * 
 * This script helps identify users with plain-text or improperly hashed passwords
 * and provides options to rehash them.
 * 
 * Usage: npx tsx scripts/fix-passwords.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function isPasswordHashed(password: string): Promise<boolean> {
  // BCrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(password)
}

async function checkUsers() {
  console.log('\n🔍 Checking all users in the database...\n')

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
    return []
  }

  console.log(`Found ${users.length} user(s):\n`)

  const usersWithIssues: typeof users = []

  for (const user of users) {
    const hashedPasswordCheck = await isPasswordHashed(user.password)
    const status = hashedPasswordCheck ? '✅ Hashed' : '⚠️  Plain-text or Invalid'

    console.log(`User: ${user.email}`)
    console.log(`  Name: ${user.name || 'N/A'}`)
    console.log(`  Created: ${user.createdAt.toLocaleDateString()}`)
    console.log(`  Password Status: ${status}`)
    console.log(`  Password Preview: ${user.password.substring(0, 20)}...`)
    console.log()

    if (!hashedPasswordCheck) {
      usersWithIssues.push(user)
    }
  }

  return usersWithIssues
}

async function fixUserPassword(user: any, newPassword?: string) {
  console.log(`\n🔧 Fixing password for: ${user.email}`)

  let passwordToHash: string

  if (newPassword) {
    passwordToHash = newPassword
  } else {
    // Use the existing password (assuming it's plain text)
    passwordToHash = user.password
    console.log(`⚠️  Using existing password value for hashing: "${passwordToHash}"`)
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(passwordToHash, 10)

  // Update in database
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })

  console.log(`✅ Password updated successfully!`)
  console.log(`   New hash preview: ${hashedPassword.substring(0, 30)}...`)
}

async function main() {
  console.log('═══════════════════════════════════════════')
  console.log('   MamaPlus Password Diagnostic Tool')
  console.log('═══════════════════════════════════════════')

  const usersWithIssues = await checkUsers()

  if (usersWithIssues.length === 0) {
    console.log('✅ All users have properly hashed passwords!')
    rl.close()
    return
  }

  console.log(`\n⚠️  Found ${usersWithIssues.length} user(s) with password issues:\n`)

  for (const user of usersWithIssues) {
    console.log(`  • ${user.email}`)
  }

  console.log('\n───────────────────────────────────────────')
  console.log('Options:')
  console.log('  1. Rehash existing passwords (assumes they are plain text)')
  console.log('  2. Set a new password for a specific user')
  console.log('  3. Exit without changes')
  console.log('───────────────────────────────────────────\n')

  const choice = await question('Enter your choice (1-3): ')

  if (choice === '1') {
    console.log('\n⚠️  WARNING: This will rehash the existing password values.')
    console.log('   This assumes the current values are plain-text passwords.')
    const confirm = await question('\nAre you sure? (yes/no): ')

    if (confirm.toLowerCase() === 'yes') {
      for (const user of usersWithIssues) {
        await fixUserPassword(user)
      }
      console.log('\n✅ All passwords have been rehashed!')
    } else {
      console.log('❌ Operation cancelled.')
    }
  } else if (choice === '2') {
    const email = await question('\nEnter user email: ')
    const user = usersWithIssues.find((u) => u.email === email)

    if (!user) {
      console.log('❌ User not found in the list of users with issues.')
    } else {
      const newPassword = await question('Enter new password (min 8 characters): ')

      if (newPassword.length < 8) {
        console.log('❌ Password must be at least 8 characters long.')
      } else {
        await fixUserPassword(user, newPassword)
        console.log(`\n✅ Password updated for ${email}`)
      }
    }
  } else {
    console.log('❌ Exiting without changes.')
  }

  rl.close()
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
