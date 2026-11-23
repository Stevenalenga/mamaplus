import type { JWTPayload } from './lib/auth'

export type AppEnv = {
  Variables: {
    user: JWTPayload | null
  }
}
