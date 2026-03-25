import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Set Up Your Account – MamaPlus',
  description: 'Choose your role to get started with MamaPlus',
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
