import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL, AUTH_STORAGE_KEY } from '../constants'
import { AuthPayload, SignUpParams } from '../types'

const isWeb = Platform.OS === 'web'

function parseAuthPayload(raw: string | null): AuthPayload | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthPayload
  } catch (error) {
    console.warn('Failed to parse stored auth payload', error)
    return null
  }
}

function readFromLocalStorage(): AuthPayload | null {
  if (typeof window === 'undefined' || !window.localStorage) return null
  return parseAuthPayload(window.localStorage.getItem(AUTH_STORAGE_KEY))
}

function writeToLocalStorage(serialized: string) {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.setItem(AUTH_STORAGE_KEY, serialized)
}

function clearLocalStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

export async function saveAuthData(payload: AuthPayload) {
  const serialized = JSON.stringify(payload)

  if (isWeb) {
    writeToLocalStorage(serialized)
    return
  }

  try {
    await Promise.race([
      SecureStore.setItemAsync(AUTH_STORAGE_KEY, serialized),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('SecureStore write timed out')), 5000)
      )
    ])
  } catch (error) {
    console.warn('saveAuthData: SecureStore set failed', error)
  }
}

export async function loadAuthData(): Promise<AuthPayload | null> {
  if (isWeb) {
    return readFromLocalStorage()
  }

  try {
    const raw = await SecureStore.getItemAsync(AUTH_STORAGE_KEY)
    return parseAuthPayload(raw)
  } catch (error) {
    console.warn('loadAuthData: SecureStore read failed', error)
    return null
  }
}

export async function clearAuthData() {
  if (isWeb) {
    clearLocalStorage()
    return
  }

  try {
    await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY)
  } catch (error) {
    console.warn('clearAuthData: SecureStore delete failed', error)
  }
}

async function request<T>(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  let response: Response

  try {
    response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `Request timed out connecting to ${API_BASE_URL}. Ensure the portal is running (npm run dev) and your phone is on the same Wi‑Fi network.`
      )
    }

    const hint =
      Platform.OS === 'android'
        ? ' On a physical Android device, the API must use your PC LAN IP (not 10.0.2.2). Ensure npm run dev is running and your phone is on the same Wi‑Fi.'
        : ' Make sure the web portal is running (npm run dev in the project root).'
    throw new Error(`Cannot reach the server at ${API_BASE_URL}.${hint}`)
  } finally {
    clearTimeout(timeoutId)
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.message || 'Request failed')
  }

  return body as T
}

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unable to sign in'
}

export async function signInRequest(email: string, password: string) {
  return request<{ success: boolean; data: AuthPayload }>(
    '/api/users/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }
  )
}

export async function signUpRequest(payload: SignUpParams) {
  return request<{ success: boolean; data: AuthPayload }>(
    '/api/users/register',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  )
}

export async function socialSignIn(provider: 'google' | 'microsoft', tokens: { idToken?: string; accessToken?: string }) {
  return request<{ success: boolean; data: AuthPayload }>(
    '/api/auth/social',
    {
      method: 'POST',
      body: JSON.stringify({ provider, ...tokens })
    }
  )
}
