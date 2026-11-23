import path from 'node:path'
import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

const packageRoot = path.resolve(__dirname, '..')
config({ path: path.join(packageRoot, '.env') })
config({ path: path.join(packageRoot, '.env.local') })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? process.env.PRISMA_LOG_QUERIES === 'true'
          ? ['query', 'error', 'warn']
          : ['error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { PrismaClient }
export default prisma
