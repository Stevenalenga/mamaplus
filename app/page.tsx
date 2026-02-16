'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Users, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import SEOHead from '@/components/seo-head'

export default function LandingPage() {
  const [expandedService, setExpandedService] = useState<number | null>(null)
  
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'MamaPlus - Quality Childcare Services Kenya',
    description: 'Professional childcare services and caregiver training platform in Kenya. Connect with trained caregivers, access certification programs, and ensure quality care for children.',
    url: 'https://mamaplus.co.ke',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <SEOHead
        title="Quality Childcare Services & Caregiver Training in Kenya"
        description="MamaPlus connects families with trained, vetted caregivers and provides professional childcare training across Kenya and Africa. Quality care you can trust, careers you can build."
        keywords={[
          'childcare services Kenya',
          'caregiver training Nairobi',
          'house manager placement Kenya',
          'professional nanny services',
          'childcare certification courses',
          'quality childcare platform',
          'caregiver jobs Kenya',
          'nanny training program',
        ]}
        canonicalUrl="https://mamaplus.co.ke"
        schema={pageSchema}
      />

      {/* Hero Section - Mobile Optimized */}
      <section className="pt-20 pb-12 px-4 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 md:mb-6 leading-tight">
                Quality <span className="text-secondary">Childcare</span> Families Can Trust
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 leading-relaxed">
                MamaPlus supports families by ensuring children receive safe, nurturing, and high-quality childcare—at home, in centres, or near the workplace.
              </p>
              <div className="flex flex-col gap-3 sm:gap-4">
                <Link href="/services" className="w-full">
                  <Button className="bg-primary hover:bg-primary/90 text-white text-base px-6 py-5 w-full">
                    Find Childcare <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/signup" className="w-full">
                  <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 text-base px-6 py-5 w-full bg-transparent">
                    Create an Account
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-6 h-48 sm:h-64 md:h-80 lg:h-96 flex items-center justify-center">
              <div className="text-center">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-primary mx-auto mb-3 md:mb-4" />
                <p className="text-primary font-semibold text-sm sm:text-base md:text-lg">Trusted Childcare Platform</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training & Support Centers - Mobile Optimized */}
      <section className="py-12 px-4 sm:py-16 md:py-20 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 md:mb-4">The MamaPlus Training & Support Centres</h2>
            <p className="text-base sm:text-lg md:text-xl text-secondary font-semibold max-w-2xl mx-auto px-4">
              Where Quality Childcare Begins
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 sm:p-6 md:p-8 border border-border mb-8 sm:mb-10 md:mb-12">
            <p className="text-sm sm:text-base md:text-lg text-foreground mb-5 md:mb-6">
              The MamaPlus Training & Support Centres are the backbone of our childcare model. They ensure that every caregiver and childcare provider in our network meets clear, child-centred standards.
            </p>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">What We Provide</h3>
                <ul className="space-y-2.5 sm:space-y-3">
                  {[
                    "Practical, hands-on caregiver training",
                    "Certification aligned to care standards",
                    "Ongoing mentorship and support",
                    "Guidance on child safety, learning, nutrition, and wellbeing"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 sm:gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5 fill-primary/20" />
                      <span className="text-sm sm:text-base text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Our Impact</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Working with county governments, national institutions, and regional partners across Africa, MamaPlus aligns childcare standards across homes, centres, and workplaces.
                </p>
                <Link href="/services">
                  <Button className="bg-primary hover:bg-primary/90 text-white w-full text-base py-5">
                    Learn About Our Standards
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services - Mobile Optimized with Expandable Cards */}
      <section id="benefits" className="py-12 px-4 sm:py-16 md:py-20 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 md:mb-4">Our Services</h2>
            <p className="text-base sm:text-lg md:text-xl text-secondary font-semibold">Integrated support across the entire childcare ecosystem</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                title: "For Families",
                description: "Childcare You Can Trust",
                items: [
                  "Caregivers trained in child safety and development",
                  "Clean, safe, regularly supported care environments",
                  "Age-appropriate routines for play, learning, and rest",
                  "Support for children's health, nutrition, and wellbeing"
                ]
              },
              {
                title: "For Caregivers",
                description: "Professional Training & Career Support",
                items: [
                  "Certified training in child development and safety",
                  "Skills training in feeding, hygiene, CPR, and play",
                  "Soft-skills and professional development",
                  "Mental health support and job opportunities"
                ]
              },
              {
                title: "For Childcare Centres",
                description: "Quality Support & Peer Learning",
                items: [
                  "Staff training and certification programs",
                  "Quality improvement tools and guidance",
                  "Support circles and peer learning networks",
                  "Increased family trust and confidence"
                ]
              },
              {
                title: "For Parents",
                description: "Guidance & Community Support",
                items: [
                  "Guidance on hiring and managing caregivers",
                  "Workshops on child development",
                  "Communication tools and resources",
                  "Parent check-ins, support groups, and community"
                ]
              }
            ].map((service, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 sm:p-6 md:p-8 border border-border hover:border-primary/50 transition">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-1">{service.title}</h3>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-foreground">{service.description}</p>
                  </div>
                  <button 
                    onClick={() => setExpandedService(expandedService === idx ? null : idx)}
                    className="md:hidden p-2 -mr-2"
                    aria-label="Toggle details"
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedService === idx ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <ul className={`space-y-2.5 sm:space-y-3 ${expandedService === idx ? '' : 'hidden md:block'}`}>
                  {service.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 sm:gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5 fill-primary/20" />
                      <span className="text-sm sm:text-base text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-12 px-4 sm:py-16 md:py-20 lg:px-8 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 md:mb-6">Ready to Advance Your Career?</h2>
          <p className="text-base sm:text-lg md:text-xl text-secondary font-semibold mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of caregivers building better futures for families
          </p>
          <Link href="/signup">
            <Button className="bg-primary hover:bg-primary/90 text-white text-base px-8 py-5 w-full sm:w-auto">
              Create Your Account <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}
