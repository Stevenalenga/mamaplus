'use client'

import React from "react"

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'authenticated' && session?.user) {
      const userRole = (session.user as any).role
      if (userRole === 'ADMIN') {
        window.location.href = '/dashboard/admin'
      } else {
        window.location.href = '/dashboard/user'
      }
    }
  }, [status, session])

  // Check for messages in URL
  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'account_required') {
      toast.info('Please create an account to continue')
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.fullName.trim().length < 2) {
      toast.error('Name must be at least 2 characters long')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }
    
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    setIsLoading(true)

    try {
      // Register user
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          toast.error(data.message || 'An account with this email already exists. Please log in instead.')
        } else if (response.status === 400) {
          toast.error(data.message || 'Please check your input and try again')
        } else if (response.status === 500) {
          toast.error('Server error. Please try again later.')
        } else {
          toast.error(data.message || 'Registration failed. Please try again.')
        }
        return
      }

      // Registration successful
      console.log('Registration successful:', data)
      toast.success('Account created successfully! Logging you in...')

      // Auto-login with NextAuth
      const loginResult = await signIn('credentials', {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      })

      if (loginResult?.error) {
        toast.error('Account created but login failed. Please try logging in manually.')
        router.push('/login')
        return
      }

      if (loginResult?.ok) {
        // New accounts start as PENDING — go to onboarding to select role
        window.location.href = '/onboarding'
      }
      
    } catch (err: any) {
      console.error('Signup error:', err)
      
      // Handle network and other errors
      if (err.message.includes('fetch')) {
        toast.error('Network error. Please check your internet connection.')
      } else {
        toast.error(err.message || 'An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignup = async (provider: string) => {
    try {
      setIsLoading(true)
      // Use 'azure-ad' as the provider name for Microsoft
      const providerName = provider === 'microsoft' ? 'azure-ad' : provider
      await signIn(providerName, {
        callbackUrl: '/onboarding',
        redirect: true,
      })
    } catch (error) {
      console.error(`${provider} signup error:`, error)
      toast.error(`Failed to sign up with ${provider}`)
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
          <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
          <p className="text-secondary font-semibold">Start your journey in professional caregiving</p>
        </div>

        {/* Sign up Form */}
        <form onSubmit={handleSignup} className="space-y-4 mb-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <Input
              type="text"
              name="fullName"
              placeholder="Jane Doe"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full bg-white border-border focus:border-primary"
              required
            />
          </div>

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
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
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
            <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full bg-white border-border focus:border-primary pr-10"
                required
              />
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-4 h-4 mt-1 rounded border-border cursor-pointer accent-primary disabled:opacity-50"
              required
            />
            <label className="text-sm text-muted-foreground">
              I agree to the{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </label>
          </div>

          {/* Sign Up Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
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

        {/* Social Sign Up */}
        <div className="space-y-3 mb-6">
          {/* Google */}
          <button 
            type="button"
            onClick={() => handleSocialSignup('google')} 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg hover:bg-muted transition font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.461,2.268,15.365,1.25,12.545,1.25 c-6.209,0-11.25,5.041-11.25,11.25c0,6.209,5.041,11.25,11.25,11.25c6.209,0,11.25-5.041,11.25-11.25 C23.795,11.6,23.7,10.999,23.589,10.403H12.545z"/>
            </svg>
            Sign up with Google
          </button>

          {/* Microsoft */}
          <button 
            type="button"
            onClick={() => handleSocialSignup('microsoft')} 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg hover:bg-muted transition font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#00A4EF" d="M0 0h11v11H0z"/>
              <path fill="#7FBA00" d="M13 0h11v11H13z"/>
              <path fill="#FFB900" d="M0 13h11v11H0z"/>
              <path fill="#F25022" d="M13 13h11v11H13z"/>
            </svg>
            Sign up with Microsoft
          </button>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
