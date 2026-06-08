import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL, AUTH_STORAGE_KEY } from '../constants'
import { AuthPayload, SignUpParams } from '../types'

export async function saveAuthData(payload: AuthPayload) {
  const serialized = JSON.stringify(payload)
  try {
    if (typeof SecureStore?.setItemAsync === 'function') {
      await SecureStore.setItemAsync(AUTH_STORAGE_KEY, serialized)
      return
    }
    // older expo-secure-store builds might export different method names
    if (typeof (SecureStore as any)?.setValueWithKeyAsync === 'function') {
      await (SecureStore as any).setValueWithKeyAsync(AUTH_STORAGE_KEY, serialized)
      return
    }
  } catch (error) {
    console.warn('saveAuthData: SecureStore set failed', error)
  }

  // Fallback to localStorage for web/environments without SecureStore
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, serialized)
    }
  } catch (e) {
    console.warn('saveAuthData: localStorage fallback failed', e)
  }
}

export async function loadAuthData(): Promise<AuthPayload | null> {
  // Try SecureStore first (native)
  try {
    if (typeof SecureStore?.getItemAsync === 'function') {
      const raw = await SecureStore.getItemAsync(AUTH_STORAGE_KEY)
      if (!raw) return null
      try {
        return JSON.parse(raw) as AuthPayload
      } catch (e) {
        console.warn('loadAuthData: failed to parse stored auth payload', e)
        return null
      }
    }
    if (typeof (SecureStore as any)?.getValueWithKeyAsync === 'function') {
      const raw = await (SecureStore as any).getValueWithKeyAsync(AUTH_STORAGE_KEY)
      if (!raw) return null
      try {
        return JSON.parse(raw) as AuthPayload
      } catch (e) {
        console.warn('loadAuthData: failed to parse stored auth payload', e)
        return null
      }
    }
  } catch (error) {
    console.warn('loadAuthData: SecureStore read failed', error)
  }

  // Fallback to localStorage for web
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) return null
      try {
        return JSON.parse(raw) as AuthPayload
      } catch (e) {
        console.warn('loadAuthData: failed to parse localStorage auth payload', e)
        return null
      }
    }
  } catch (e) {
    console.warn('loadAuthData: localStorage read failed', e)
  }

  return null
}

export async function clearAuthData() {
  try {
    if (typeof SecureStore?.deleteItemAsync === 'function') {
      await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY)
      return
    }
    if (typeof (SecureStore as any)?.deleteValueWithKeyAsync === 'function') {
      await (SecureStore as any).deleteValueWithKeyAsync(AUTH_STORAGE_KEY)
      return
    }
  } catch (error) {
    console.warn('clearAuthData: SecureStore delete failed', error)
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  } catch (e) {
    console.warn('clearAuthData: localStorage fallback failed', e)
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
