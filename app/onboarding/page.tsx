'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession, getSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDashboardForRole } from '@/lib/roles'

type Step = 'role' | 'gender'
type SelectedRole = 'USER' | 'AGENCY' | 'INSTRUCTOR' | null
type SelectedGender = 'MALE' | 'FEMALE' | null

const ROLE_OPTIONS: { value: SelectedRole; label: string; description: string; icon: string }[] = [
  {
    value: 'USER',
    label: 'Caregiver',
    description: 'I provide care for children, the elderly, or individuals with special needs',
    icon: '🤲',
  },
  {
    value: 'AGENCY',
    label: 'Agency',
    description: 'I represent a staffing or placement agency that manages caregivers',
    icon: '🏢',
  },
  {
    value: 'INSTRUCTOR',
    label: 'Educator',
    description: 'I create and teach courses on caregiving topics',
    icon: '📚',
  },
]

const GENDER_OPTIONS: { value: SelectedGender; label: string; icon: string }[] = [
  { value: 'MALE', label: 'Male', icon: '♂️' },
  { value: 'FEMALE', label: 'Female', icon: '♀️' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()

  const [step, setStep] = useState<Step>('role')
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null)
  const [selectedGender, setSelectedGender] = useState<SelectedGender>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const userName = session?.user?.name

  // Redirect if user has already completed onboarding
  useEffect(() => {
    if (status === 'loading') return
    
    const userRole = (session?.user as any)?.role
    const userGender = (session?.user as any)?.gender
    
    if (session && userRole) {
      // Check if onboarding is complete:
      // 1. Role is not PENDING, AND
      // 2. If role is USER (caregiver), gender must be set
      const isOnboardingComplete = 
        userRole !== 'PENDING' && 
        (userRole !== 'USER' || (userRole === 'USER' && userGender !== null && userGender !== undefined))
      
      if (isOnboardingComplete) {
        // User has already completed onboarding, redirect to their dashboard
        window.location.replace(getDashboardForRole(userRole))
      }
    }
  }, [session, status])

  // Pre-warm all possible destination dashboards while the user is
  // reading the onboarding options — eliminates first-visit compile delay
  useEffect(() => {
    router.prefetch('/dashboard/user')
    router.prefetch('/dashboard/agency')
    router.prefetch('/dashboard/educator')
  }, [router])

  async function pollSession(
    condition: (session: any) => boolean,
    timeout = 5000,
    interval = 500
  ): Promise<boolean> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      await update() // Forces a session refetch
      const freshSession = await getSession()
      if (condition(freshSession)) {
        return true
      }
      await new Promise(resolve => setTimeout(resolve, interval))
    }

    return false
  }

  async function handleSubmit() {
    if (!selectedRole) return

    if (selectedRole === 'USER' && !selectedGender) {
      toast.error('Please select your gender to continue')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/users/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          gender: selectedRole === 'USER' ? selectedGender : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.message || 'Something went wrong. Please try again.')
        return
      }

      const targetPath = getDashboardForRole(selectedRole!)

      // Pre-fetch the dashboard page NOW so Next.js compiles it
      // in parallel while we wait for the session update below
      router.prefetch(targetPath)

      toast.success('All set! Taking you to your dashboard…')

      // Poll session until the role is updated, then navigate.
      // This is more reliable than a fixed timeout.
      const isSessionUpdated = await pollSession(
        (session: any) => session?.user?.role === selectedRole
      )

      if (isSessionUpdated) {
        // Use replace() so the onboarding page is removed from browser history
        // (user can't hit Back to come back here after completing onboarding).
        // Full-page navigation ensures the middleware reads the freshly-baked
        // cookie rather than any stale router-cache entry.
        window.location.replace(targetPath)
      } else {
        toast.error(
          'Onboarding complete, but we could not log you in automatically. Please log in again to continue.'
        )
        setIsSubmitting(false)
        // Log out the user and redirect to login page
        await signOut({ callbackUrl: '/login' })
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
    // Note: don't reset isSubmitting in finally — keep the spinner
    // visible during the navigation transition so the user sees activity
  }

  function handleRoleContinue() {
    if (!selectedRole) {
      toast.error('Please select your role to continue')
      return
    }
    if (selectedRole === 'USER') {
      setStep('gender')
    } else {
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="https://mamaplus.co.ke/" className="inline-block hover:opacity-80 transition mb-6">
            <Image src="/logo.png" alt="MamaPlus" width={200} height={67} priority />
          </Link>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {userName ? `Welcome, ${userName}!` : 'Welcome!'}
          </h1>
          <p className="text-muted-foreground font-medium">
            {step === 'role'
              ? 'Tell us who you are so we can personalise your experience.'
              : 'One more thing — please tell us your gender.'}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className={`w-2.5 h-2.5 rounded-full transition-colors ${step === 'role' ? 'bg-primary' : 'bg-primary/30'}`} />
          <div className={`w-2.5 h-2.5 rounded-full transition-colors ${selectedRole === 'USER' ? (step === 'gender' ? 'bg-primary' : 'bg-primary/30') : 'bg-muted'}`} />
        </div>

        {/* ── Step 1: Role selection ── */}
        {step === 'role' && (
          <div className="space-y-4">
            {ROLE_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedRole(option.value)}
                disabled={isSubmitting}
                className={`w-full flex items-start gap-4 p-5 rounded-xl border-2 text-left transition
                  ${selectedRole === option.value
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-white hover:border-primary/40 hover:bg-gray-50'}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-3xl mt-0.5">{option.icon}</span>
                <div>
                  <p className="font-semibold text-foreground">{option.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
                </div>
                {selectedRole === option.value && (
                  <div className="ml-auto mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}

            <Button
              onClick={handleRoleContinue}
              disabled={!selectedRole || isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting up…
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        )}

        {/* ── Step 2: Gender selection (caregivers only) ── */}
        {step === 'gender' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {GENDER_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedGender(option.value)}
                  disabled={isSubmitting}
                  className={`flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 font-medium transition
                    ${selectedGender === option.value
                      ? 'border-primary bg-primary/5 shadow-sm text-primary'
                      : 'border-border bg-white hover:border-primary/40 text-foreground'}
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-4xl">{option.icon}</span>
                  <span className="text-lg font-semibold">{option.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('role')}
                disabled={isSubmitting}
                className="flex-1 py-6"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedGender || isSubmitting}
                className="flex-[2] bg-primary hover:bg-primary/90 text-white font-semibold py-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Setting up…
                  </>
                ) : (
                  'Go to My Dashboard'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
