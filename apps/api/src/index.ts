import './env'
import { serve } from '@hono/node-server'
import { swaggerUI } from '@hono/swagger-ui'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { AppEnv } from './types'
import { openApiSpec } from './openapi'
import { authRouter } from './routes/auth'
import { usersRouter } from './routes/users'
import { coursesRouter } from './routes/courses'
import { learningRouter } from './routes/learning'
import { paymentsRouter } from './routes/payments'
import { agenciesRouter } from './routes/agencies'
import { adminRouter } from './routes/admin'
import { contentRouter } from './routes/content'
import { filesRouter } from './routes/files'

const app = new Hono<AppEnv>()

const configuredOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function isAllowedOrigin(origin: string) {
  if (configuredOrigins.includes(origin)) return true
  return (
    /^http:\/\/localhost:\d+$/.test(origin) ||
    /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
    /^http:\/\/10\.0\.2\.2:\d+$/.test(origin)
  )
}

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return configuredOrigins[0] || 'http://localhost:3000'
      return isAllowedOrigin(origin) ? origin : ''
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
)

app.get('/health', (c) => c.json({ ok: true, service: 'mamaplus-api' }))
app.get('/openapi.json', (c) => c.json(openApiSpec))
app.get('/docs', swaggerUI({ url: '/openapi.json' }))

app.route('/', authRouter)
app.route('/', usersRouter)
app.route('/', coursesRouter)
app.route('/', learningRouter)
app.route('/', paymentsRouter)
app.route('/', agenciesRouter)
app.route('/', adminRouter)
app.route('/', contentRouter)
app.route('/', filesRouter)

app.notFound((c) => c.json({ success: false, message: 'Not found' }, 404))
app.onError((error, c) => {
  console.error(error)
  return c.json({ success: false, message: 'Internal server error' }, 500)
})

const port = Number(process.env.PORT || 4000)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`MamaPlus API listening on http://localhost:${info.port}`)
  console.log(`API docs at http://localhost:${info.port}/docs`)
})
