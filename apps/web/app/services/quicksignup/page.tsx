'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/page-hero'
import SEOHead from '@/components/seo-head'

export default function QuickSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <SEOHead
        title="Quick Signup - Enrol in MamaPlus Training"
        description="Enrol quickly in MamaPlus childcare training. Select your preferred course and start your learning path."
        canonicalUrl="https://mamaplus.co.ke/services/quicksignup"
      />

      <PageHero
        kicker="Enrol in training"
        title="Quick signup for MamaPlus courses"
        intro="Use the form below to tell us which training path you want. You can also browse the full catalogue first."
      >
        <Link href="/courses">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
            Browse the catalogue
          </Button>
        </Link>
      </PageHero>

      <section className="px-4 lg:px-8 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <iframe
              src="https://forms.gle/qg14gKFHqMsD72sD8"
              width="100%"
              height="900"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              title="MamaPlus Quick Signup Form"
              className="block"
            >
              Loading…
            </iframe>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Having trouble with the form?{' '}
            <a
              href="https://forms.gle/qg14gKFHqMsD72sD8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Open it directly
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
