'use client'

import React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, CreditCard, Shield, Users } from 'lucide-react'

export default function DonatePage() {
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
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto text-center">
          <Heart className="w-16 h-16 text-primary mx-auto mb-6 fill-primary/20" />
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
            Support Quality <span className="text-secondary">Childcare</span>
          </h1>
          <p className="text-xl text-secondary font-semibold max-w-3xl mx-auto">
            Your donation helps us train caregivers, support families, and ensure every child receives safe, nurturing care.
          </p>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Your Impact</h2>
          <div className="grid md:grid-cols-3 gap-6">
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
              <div key={idx} className="bg-white rounded-xl p-6 border border-border text-center">
                <div className="text-2xl font-bold text-primary mb-2">{item.amount}</div>
                <p className="text-muted-foreground">{item.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-8 border border-border">
            <h2 className="text-2xl font-bold text-primary mb-6">Make a Donation</h2>

            {/* Donation Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">Donation Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDonationType('one-time')}
                  className={`p-4 rounded-lg border-2 transition ${
                    donationType === 'one-time'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-white text-foreground hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold">One-Time</div>
                  <div className="text-sm">Single donation</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDonationType('monthly')}
                  className={`p-4 rounded-lg border-2 transition ${
                    donationType === 'monthly'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-white text-foreground hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold">Monthly</div>
                  <div className="text-sm">Recurring support</div>
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">Select Amount (KES)</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amount)
                      setCustomAmount('')
                    }}
                    className={`p-4 rounded-lg border-2 font-semibold transition ${
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
                  className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg"
                  disabled={!selectedAmount && !customAmount}
                >
                  <CreditCard className="mr-2 w-5 h-5" />
                  Proceed to Payment
                </Button>
              </div>
            </form>

            {/* Security Note */}
            <div className="mt-6 p-4 bg-primary/5 rounded-lg flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Your donation is secure and will be processed through our trusted payment partners. All transactions are encrypted and protected.
              </p>
            </div>
          </div>

          {/* Why Donate Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
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
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
