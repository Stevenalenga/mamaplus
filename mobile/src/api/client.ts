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
    await SecureStore.setItemAsync(AUTH_STORAGE_KEY, serialized)
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
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.message || 'Request failed')
  }

  return body as T
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
