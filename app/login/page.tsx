'use client'

import React from 'react'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated' && session?.user) {
      const userRole = (session.user as any).role
      if (userRole === 'PENDING') {
        window.location.href = '/onboarding'
      } else if (userRole === 'ADMIN') {
        window.location.href = '/dashboard/admin'
      } else if (userRole === 'ADMIN_ASSISTANT') {
        window.location.href = '/dashboard/admin-assistant'
      } else if (userRole === 'INSTRUCTOR') {
        window.location.href = '/dashboard/educator'
      } else if (userRole === 'AGENCY') {
        window.location.href = '/dashboard/agency'
      } else {
        window.location.href = '/dashboard/user'
      }
    }
  }, [status, session])

  // Check for error messages in URL
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'auth_required') {
      toast.error('Please log in to access that page')
    } else if (errorParam === 'session_expired') {
      toast.error('Your session has expired. Please log in again.')
    } else if (errorParam === 'CredentialsSignin') {
      toast.error('Invalid email or password. Please try again.')
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Client-side validation
      if (!formData.email || !formData.password) {
        toast.error('Please enter both email and password')
        setIsLoading(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        toast.error('Please enter a valid email address')
        setIsLoading(false)
        return
      }

      // Use NextAuth signIn
      const result = await signIn('credentials', {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        // Handle authentication errors
        console.error('Login error:', result.error)
        toast.error('Invalid email or password. Please check your credentials.')
        return
      }

      if (result?.ok) {
        toast.success('Login successful! Redirecting...')

        // Small delay to ensure session is set before redirect
        await new Promise(resolve => setTimeout(resolve, 100))

        // Fetch the session to determine where to send the user
        const sessionResponse = await fetch('/api/auth/session')
        const sessionData = await sessionResponse.json()
        const userRole = sessionData?.user?.role

        if (userRole === 'PENDING') {
          window.location.href = '/onboarding'
        } else if (userRole === 'ADMIN') {
          window.location.href = '/dashboard/admin'
        } else if (userRole === 'ADMIN_ASSISTANT') {
          window.location.href = '/dashboard/admin-assistant'
        } else if (userRole === 'INSTRUCTOR') {
          window.location.href = '/dashboard/educator'
        } else if (userRole === 'AGENCY') {
          window.location.href = '/dashboard/agency'
        } else {
          window.location.href = '/dashboard/user'
        }
      }
      
    } catch (err: any) {
      console.error('Login error:', err)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    try {
      setIsLoading(true)
      // Use 'azure-ad' as the provider name for Microsoft
      const providerName = provider === 'microsoft' ? 'azure-ad' : provider
      await signIn(providerName, {
        callbackUrl: '/dashboard/user',
        redirect: true,
      })
    } catch (error) {
      console.error(`${provider} login error:`, error)
      toast.error(`Failed to sign in with ${provider}`)
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication status
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="https://mamaplus.co.ke/" className="inline-block hover:opacity-80 transition mb-6">
            <Image
              src="/logo.png"
              alt="MamaPlus"
              width={200}
              height={67}
              priority
            />
          </Link>
          <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
          <p className="text-secondary font-semibold">Sign in to access your caregiver portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
            <Input
              type="email"
              name="email"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full bg-white border-border focus:border-primary"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">Password</label>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full bg-white border-border focus:border-primary pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-4 h-4 rounded border-border cursor-pointer accent-primary disabled:opacity-50"
            />
            <label className="text-sm text-muted-foreground cursor-pointer">
              Remember me for 30 days
            </label>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>


        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gradient-to-br from-background via-white to-background text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Sign In */}
        <div className="space-y-3 mb-6">
          {/* Google */}
          <button 
            type="button"
            onClick={() => handleSocialLogin('google')} 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg hover:bg-muted transition font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.461,2.268,15.365,1.25,12.545,1.25 c-6.209,0-11.25,5.041-11.25,11.25c0,6.209,5.041,11.25,11.25,11.25c6.209,0,11.25-5.041,11.25-11.25 C23.795,11.6,23.7,10.999,23.589,10.403H12.545z"/>
            </svg>
            Sign in with Google
          </button>

          {/* Microsoft */}
          <button 
            type="button"
            onClick={() => handleSocialLogin('microsoft')} 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg hover:bg-muted transition font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#00A4EF" d="M0 0h11v11H0z"/>
              <path fill="#7FBA00" d="M13 0h11v11H13z"/>
              <path fill="#FFB900" d="M0 13h11v11H0z"/>
              <path fill="#F25022" d="M13 13h11v11H13z"/>
            </svg>
            Sign in with Microsoft
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-semibold">
            Create one now
          </Link>
        </p>
      </div>
    </div>
  )
}
