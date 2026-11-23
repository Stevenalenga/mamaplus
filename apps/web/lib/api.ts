const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '')

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
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`
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
