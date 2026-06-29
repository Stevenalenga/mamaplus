'use client'

import React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, CreditCard, Shield, Users } from 'lucide-react'
import SEOHead from '@/components/seo-head'

export default function DonatePage() {
  const donateSchema = {
    '@context': 'https://schema.org',
    '@type': 'DonateAction',
    name: 'Support Quality Childcare in Kenya',
    description: 'Donate to support caregiver training and quality childcare programs across Kenya and Africa.',
    recipient: {
      '@type': 'Organization',
      name: 'MamaPlus',
    },
  }
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const presetAmounts = [500, 1000, 2500, 5000, 10000, 25000]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = selectedAmount || parseFloat(customAmount)
    console.log('Donation:', { ...formData, amount, donationType })
    // Handle donation submission here
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Donate - Support Quality Childcare in Kenya"
        description="Your donation helps train caregivers, support families, and ensure every child in Kenya receives safe, nurturing care. Make a difference in children's lives today."
        keywords={[
          'support childcare Kenya',
          'donate to childcare programs',
          'caregiver training donation',
          'support children Kenya',
          'nonprofit childcare',
        ]}
        canonicalUrl="https://mamaplus.co.ke/donate"
        schema={donateSchema}
      />
      {/* Hero Section - Mobile Optimized */}
      <section className="pt-20 pb-10 px-4 sm:pt-24 sm:pb-12 md:pt-32 md:pb-16 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto text-center">
          <Heart className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-primary mx-auto mb-4 md:mb-6 fill-primary/20" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 md:mb-6 leading-tight">
            Support Quality <span className="text-secondary">Childcare</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-secondary font-semibold max-w-3xl mx-auto px-4">
            Your donation helps us train caregivers, support families, and ensure every child receives safe, nurturing care.
          </p>
        </div>
      </section>

      {/* Impact Section - Mobile Optimized */}
      <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 sm:mb-8 text-center">Your Impact</h2>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                amount: 'KES 5,000',
                impact: 'Provides training materials for one caregiver'
              },
              {
                amount: 'KES 15,000',
                impact: 'Supports a caregiver through full certification program'
              },
              {
                amount: 'KES 50,000',
                impact: 'Establishes a community support circle for childcare centres'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 sm:p-6 border border-border text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-2">{item.amount}</div>
                <p className="text-sm sm:text-base text-muted-foreground">{item.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Form - Mobile Optimized */}
      <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-5 sm:p-6 md:p-8 border border-border">
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-5 sm:mb-6">Make a Donation</h2>

            {/* Donation Type */}
            <div className="mb-5 sm:mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">Donation Type</label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setDonationType('one-time')}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition ${
                    donationType === 'one-time'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-white text-foreground hover:border-primary/50'
                  }`}
                >
                  <div className="text-sm sm:text-base font-semibold">One-Time</div>
                  <div className="text-xs sm:text-sm">Single donation</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDonationType('monthly')}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition ${
                    donationType === 'monthly'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-white text-foreground hover:border-primary/50'
                  }`}
                >
                  <div className="text-sm sm:text-base font-semibold">Monthly</div>
                  <div className="text-xs sm:text-sm">Recurring support</div>
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="mb-5 sm:mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">Select Amount (KES)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-4">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amount)
                      setCustomAmount('')
                    }}
                    className={`p-3 sm:p-4 rounded-lg border-2 text-sm sm:text-base font-semibold transition ${
                      selectedAmount === amount
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-white text-foreground hover:border-primary/50'
                    }`}
                  >
                    {amount.toLocaleString()}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Or enter custom amount</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setSelectedAmount(null)
                  }}
                  className="w-full bg-white border-border focus:border-primary"
                  min="100"
                />
              </div>
            </div>

            {/* Donor Information */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-white border-border focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
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

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="+254 700 000 000"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-white border-border focus:border-primary"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white py-5 sm:py-6 text-base sm:text-lg"
                  disabled={!selectedAmount && !customAmount}
                >
                  <CreditCard className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Proceed to Payment
                </Button>
              </div>
            </form>

            {/* Security Note */}
            <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-primary/5 rounded-lg flex items-start gap-2.5 sm:gap-3">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your donation is secure and will be processed through our trusted payment partners. All transactions are encrypted and protected.
              </p>
            </div>
          </div>

          {/* Why Donate Section */}
          <div className="mt-8 sm:mt-10 md:mt-12 grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Users,
                title: 'Train Caregivers',
                description: 'Help us provide professional training to caregivers across Africa'
              },
              {
                icon: Heart,
                title: 'Support Families',
                description: 'Enable families to access quality, affordable childcare'
              },
              {
                icon: Shield,
                title: 'Protect Children',
                description: 'Ensure safe, nurturing environments for children to thrive'
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="bg-primary/10 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
