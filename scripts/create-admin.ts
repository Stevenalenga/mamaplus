import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  const hashedPassword = await bcrypt.hash('Uth@b1t1Adm!n#2026', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'info@uthabitiafrica.org' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
    create: {
      email: 'info@uthabitiafrica.org',
      name: 'Uthabiti Africa Admin',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  })

  console.log('✅ Admin user ready:', admin.email, '| role:', admin.role)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
