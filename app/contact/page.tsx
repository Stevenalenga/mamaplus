'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react'
import SEOHead from '@/components/seo-head'

type FormState = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormState>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitState('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || 'Something went wrong while sending your enquiry.')
      }

      setSubmitState('success')
      setFormData(initialState)
    } catch (error) {
      setSubmitState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unable to send your enquiry right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead
        title="Contact MamaPlus - Enquiry Page"
        description="Send an enquiry to MamaPlus. Reach us for childcare services, caregiver support, partnerships, or general questions."
        keywords={[
          'MamaPlus contact',
          'MamaPlus enquiry',
          'childcare support Kenya',
          'caregiver services contact',
        ]}
        canonicalUrl="https://mamaplus.co.ke/contact"
      />

      <section className="pt-28 pb-12 px-4 lg:px-8 bg-secondary/5">
        <div className="max-w-7xl mx-auto text-center">
          <p className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            Contact MamaPlus
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">Send Us an Enquiry</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We are here to help with childcare placement, training, support programs, and partnerships.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 items-start">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-foreground">Email</h2>
              </div>
              <p className="text-muted-foreground text-sm">mamapluske@gmail.com</p>
            </div>
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-foreground">Phone</h2>
              </div>
              <p className="text-muted-foreground text-sm">+254 700 000 000</p>
            </div>
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-foreground">Location</h2>
              </div>
              <p className="text-muted-foreground text-sm">Nairobi, Kenya</p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-2">Enquiry Form</h2>
            <p className="text-sm text-muted-foreground mb-6">Fill in the details below and our team will respond shortly.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Full name"
                  required
                />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email address"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  value={formData.phone}
                  onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="Phone number (optional)"
                />
                <Input
                  value={formData.subject}
                  onChange={(event) => setFormData((prev) => ({ ...prev, subject: event.target.value }))}
                  placeholder="Subject"
                  required
                />
              </div>

              <Textarea
                value={formData.message}
                onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                placeholder="Tell us how we can help"
                className="min-h-36"
                required
              />

              {submitState === 'success' && (
                <div className="rounded-xl bg-secondary/10 border border-secondary/20 p-3 flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  Your enquiry has been submitted successfully.
                </div>
              )}

              {submitState === 'error' && (
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-sm text-foreground">
                  {errorMessage}
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-5 rounded-xl">
                {isSubmitting ? 'Sending...' : 'Submit Enquiry'}
                {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-6">
              Looking to sign up directly? Visit the <Link href="/signup" className="text-primary font-medium hover:underline">registration page</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
