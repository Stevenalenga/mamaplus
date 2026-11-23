import path from 'node:path'
import { config } from 'dotenv'

const repoRoot = path.resolve(__dirname, '../../..')

config({ path: path.join(repoRoot, '.env') })
config({ path: path.join(repoRoot, '.env.local') })
config({ path: path.resolve(__dirname, '../.env') })

if (!process.env.UPLOAD_DIR) {
  process.env.UPLOAD_DIR = path.join(repoRoot, 'uploads')
}

const configuredPublicUrl = process.env.API_PUBLIC_URL || ''
const isLocal = !configuredPublicUrl || /localhost|127\.0\.0\.1/.test(configuredPublicUrl)
if (isLocal && process.env.NODE_ENV === 'production') {
  process.env.API_PUBLIC_URL = (
    process.env.WEB_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'https://mamaplus.co.ke'
  ).replace(/\/$/, '')
}
