import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AuthContextState, AuthPayload, SignUpParams, User } from '../types'
import { clearAuthData, loadAuthData, saveAuthData, signInRequest, signUpRequest } from '../api/client'

const AuthContext = createContext<AuthContextState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function restore() {
      try {
        const saved = await loadAuthData()
        if (saved) {
          setUser(saved.user)
          setToken(saved.token)
        }
      } catch (error) {
        console.warn('Auth restore failed', error)
      } finally {
        setIsLoading(false)
      }
    }

    restore()
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await signInRequest(email, password)
      const auth = response.data
      await saveAuthData(auth)
      setUser(auth.user)
      setToken(auth.token)
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (payload: SignUpParams) => {
    setIsLoading(true)
    try {
      const response = await signUpRequest(payload)
      const auth = response.data
      await saveAuthData(auth)
      setUser(auth.user)
      setToken(auth.token)
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithSocial = async (auth: AuthPayload) => {
    await saveAuthData(auth)
    setUser(auth.user)
    setToken(auth.token)
  }

  const signOut = async () => {
    await clearAuthData()
    setUser(null)
    setToken(null)
  }

  const value = useMemo(
    () => ({ user, token, isLoading, signIn, signUp, signInWithSocial, signOut }),
    [user, token, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
