'use client'

import React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import SEOHead from '@/components/seo-head'

export default function PartnerPage() {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Partner With MamaPlus',
    description: 'Partner with MamaPlus for corporate childcare, government collaborations, and development partnerships across Africa.',
  }
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Partnership inquiry:', formData)
    // Handle form submission here
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Partner With Us - Childcare Collaboration Opportunities"
        description="Partner with MamaPlus for corporate childcare programs, government collaborations, NGO partnerships, training programs, and research initiatives across Kenya and Africa."
        keywords={[
          'childcare partnership opportunities',
          'corporate childcare Kenya',
          'government childcare collaboration',
          'NGO partnerships Africa',
          'childcare research Kenya',
        ]}
        canonicalUrl="https://mamaplus.co.ke/partner"
        schema={contactSchema}
      />
      {/* Hero Section - Mobile Optimized */}
      <section className="pt-20 pb-10 px-4 sm:pt-24 sm:pb-12 md:pt-32 md:pb-16 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 md:mb-6 leading-tight">
            Partner <span className="text-secondary">With Us</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-secondary font-semibold max-w-3xl mx-auto px-4">
            Join us in transforming childcare and empowering caregivers across Africa. Let's work together to create lasting impact.
          </p>
        </div>
      </section>

      {/* Contact Section - Mobile Optimized */}
      <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">Get in Touch</h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
                We're excited to explore partnership opportunities with organizations, governments, NGOs, and businesses committed to quality childcare.
              </p>

              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 p-2.5 sm:p-3 rounded-lg">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">Email</h3>
                    <a href="mailto:info@mamaplus.co.ke" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition">
                      info@mamaplus.co.ke
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 p-2.5 sm:p-3 rounded-lg">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">Phone</h3>
                    <a href="tel:+254769886655" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition">
                      +254 769 886 655
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 p-2.5 sm:p-3 rounded-lg">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">Location</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Nairobi, Kenya
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 p-5 sm:p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">Partnership Opportunities</h3>
                <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Corporate childcare programs</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Government collaborations</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>NGO and development partnerships</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Training and capacity building</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Research and innovation</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl p-5 sm:p-6 md:p-8 border border-border">
              <h2 className="text-xl sm:text-2xl font-bold text-primary mb-5 sm:mb-6">Send Us a Message</h2>
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
                    placeholder="+254 769 886 655"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white border-border focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Organization</label>
                  <Input
                    type="text"
                    name="organization"
                    placeholder="Your organization name"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="w-full bg-white border-border focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                  <Textarea
                    name="message"
                    placeholder="Tell us about your partnership interest..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full bg-white border-border focus:border-primary min-h-[120px]"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-5 sm:py-6 text-base">
                  Send Message <Send className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
