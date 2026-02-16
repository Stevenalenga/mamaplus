'use client'

import React from "react"

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import SEOHead from '@/components/seo-head'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle signup logic here
    console.log('Signup attempt:', formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background flex items-center justify-center px-4">
      <SEOHead
        title="Create Account - Start Your Caregiving Career"
        description="Join MamaPlus and start your professional caregiving career. Access training, certification, and job opportunities across Kenya."
        keywords={[
          'become a caregiver Kenya',
          'nanny registration',
          'childcare worker signup',
          'caregiver jobs Kenya',
        ]}
        canonicalUrl="https://mamaplus.co.ke/signup"
      />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block hover:opacity-80 transition mb-6">
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
                className="w-full bg-white border-border focus:border-primary pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              className="w-4 h-4 mt-1 rounded border-border cursor-pointer accent-primary"
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
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 mt-6"
          >
            Create Account
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
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg hover:bg-muted transition font-medium text-foreground">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.461,2.268,15.365,1.25,12.545,1.25 c-6.209,0-11.25,5.041-11.25,11.25c0,6.209,5.041,11.25,11.25,11.25c6.209,0,11.25-5.041,11.25-11.25 C23.795,11.6,23.7,10.999,23.589,10.403H12.545z"/>
            </svg>
            Sign up with Google
          </button>

          {/* Microsoft */}
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg hover:bg-muted transition font-medium text-foreground">
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

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
