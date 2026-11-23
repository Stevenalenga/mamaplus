import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv(file) {
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue
    if (process.env[key] !== undefined) continue
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

loadEnv(path.join(root, '.env'))
loadEnv(path.join(root, '.env.local'))
process.env.NODE_ENV ||= 'production'
process.env.PORT ||= '4000'
if (!process.env.UPLOAD_DIR) process.env.UPLOAD_DIR = path.join(root, 'uploads')

const children = []

function start(command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    env: process.env,
    stdio: 'inherit',
  })
  children.push(child)
  return child
}

function shutdown(code = 0) {
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill('SIGTERM')
  }
  process.exit(code)
}

process.on('SIGTERM', () => shutdown(0))
process.on('SIGINT', () => shutdown(0))

const api = start(
  'pnpm',
  ['--filter', '@mamaplus/api', 'exec', 'tsx', 'src/index.ts'],
  root
)

api.on('exit', (code, signal) => {
  if (signal) return
  console.error(`MamaPlus API exited with code ${code}`)
  shutdown(code ?? 1)
})

const healthy = await waitForApi()
if (!healthy) console.error('MamaPlus API did not open /health; starting the website anyway')

const nextBin = path.join(root, 'apps/web/node_modules/next/dist/bin/next')
const web = start(process.execPath, [nextBin, 'start', '-H', '0.0.0.0', '-p', '3000'], path.join(root, 'apps/web'))

web.on('exit', (code, signal) => {
  if (signal) return
  console.error(`MamaPlus website exited with code ${code}`)
  shutdown(code ?? 1)
})

async function waitForApi() {
  const deadline = Date.now() + 20000
  while (Date.now() < deadline) {
    if (api.exitCode !== null) return false
    try {
      const response = await fetch(`http://127.0.0.1:${process.env.PORT || 4000}/health`)
      if (response.ok) return true
    } catch {
      // API process is still booting.
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  return false
}
