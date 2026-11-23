const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
const API_URL =
  configuredApiUrl && !/localhost|127\.0\.0\.1/.test(configuredApiUrl)
    ? configuredApiUrl
    : typeof window === 'undefined'
      ? 'http://127.0.0.1:4000'
      : ''

let cachedToken: string | null = null
let sessionReady = false
let resolveSessionReady: () => void = () => {}
let sessionReadyPromise = new Promise<void>((resolve) => {
  resolveSessionReady = resolve
})

export function setApiAccessToken(token: string | null) {
  cachedToken = token
}

export function markApiSessionReady() {
  if (sessionReady) return
  sessionReady = true
  resolveSessionReady()
}

export function apiUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return API_URL ? `${API_URL}${normalized}` : normalized
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  await sessionReadyPromise

  const headers = new Headers(init.headers)
  if (cachedToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${cachedToken}`)
  }

  const { credentials: _credentials, ...rest } = init
  return fetch(apiUrl(path), { ...rest, headers })
}
