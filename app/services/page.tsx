'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Award, Home, Briefcase, BookOpen, Heart, ChevronDown, Building2 } from 'lucide-react'
import { useState } from 'react'
import SEOHead from '@/components/seo-head'

export default function ServicesPage() {
  const [expandedService, setExpandedService] = useState<number | null>(null)
  
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'MamaPlus Childcare Services',
    description: 'Comprehensive childcare services including caregiver placement, training, support for childcare centres, and corporate childcare solutions.',
    provider: {
      '@type': 'Organization',
      name: 'MamaPlus',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Kenya',
    },
    serviceType: ['Caregiver Placement', 'Childcare Training', 'Centre Support', 'Corporate Childcare'],
  }
  const services = [
    {
      icon: Home,
      title: "Placement & Support for House Managers",
      description: "We connect families with trained, vetted House Managers and domestic workers and provide support before, during, and after placement.",
      features: [
        "Caregiver matching based on family needs",
        "Background checks and credential verification",
        "Interview and hiring support",
        "Ongoing check-ins and conflict-resolution support",
        "Guidance on contracts and fair employment practices"
      ],
      cta: "Find a House Manager"
    },
    {
      icon: BookOpen,
      title: "Training & Support for Caregivers",
      description: "We treat caregiving as a profession. MamaPlus provides certified training, mental health support, and access to job opportunities.",
      features: [
        "Certified training in child development, safety, and emotional care",
        "Skills training in feeding, hygiene, CPR, and educational play",
        "Soft-skills training: communication, professionalism, time management",
        "Mental health and wellbeing support",
        "Access to job opportunities through the MamaPlus platform"
        
      ],
      cta: "Explore Training"
    },
    {
      icon: Users,
      title: "Support Circles for Childcare Centres",
      description: "We strengthen community and informal childcare centres through training, quality standards, and peer support.",
      features: [
        "Staff training and certification programs",
        "Quality improvement tools and guidance",
        "Support circles and peer learning networks",
        "Increased trust and confidence from families",
        "Community-driven improvements"
      ],
      cta: "Join the Centre Network"
    },
    {
      icon: Briefcase,
      title: "Corporate Childcare Provision",
      description: "We help employers set up and manage childcare solutions that support productivity and employee wellbeing.",
      features: [
        "Customized childcare solutions for workplaces",
        "Access to trained caregivers and facilities",
        "Employee benefit coordination",
        "Quality assurance and compliance support",
        "Flexible scheduling and management"
      ],
      cta: "Partner With Us"
    },
    {
      icon: Heart,
      title: "Training & Support for Parents",
      description: "We support parents with guidance, tools, and community—because quality childcare works best when families are supported too.",
      features: [
        "Guidance on hiring and managing caregivers",
        "Workshops on child development and nurturing care",
        "Communication tools for working with domestic staff",
        "Parent check-ins and support groups",
        "Practical resources and community connection"
      ],
      cta: "Access Parent Resources"
    },
    {
      icon: Building2,
      title: "Solutions for Government & Public Sector",
      description: "We partner with governments to strengthen childcare systems, expand access to quality care, and build a trained workforce that supports national development goals.",
      features: [
        "Policy implementation support and technical assistance",
        "Public childcare infrastructure development and management",
        "National caregiver training and certification programs",
        "Quality standards development and monitoring systems",
        "Community-based childcare program expansion",
        "Data systems for childcare workforce and service mapping"
      ],
      cta: "Partner With Government"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Childcare Services - Placement, Training & Support"
        description="MamaPlus offers integrated childcare services: house manager placement, professional caregiver training, support for childcare centres, corporate solutions, and parent resources across Kenya."
        keywords={[
          'childcare placement services Kenya',
          'house manager hiring Nairobi',
          'caregiver support programs',
          'childcare centre support',
          'corporate childcare solutions',
          'caregiver background checks',
          'professional nanny placement',
        ]}
        canonicalUrl="https://mamaplus.co.ke/services"
        schema={serviceSchema}
      />
      {/* Hero Section - Mobile Optimized */}
      <section className="pt-20 pb-10 px-4 sm:pt-24 sm:pb-12 md:pt-32 md:pb-16 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 md:mb-6 leading-tight">
            Our <span className="text-secondary">Services</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-secondary font-semibold max-w-3xl mb-6 md:mb-8">
            MamaPlus offers integrated services that support the entire childcare ecosystem—from families and caregivers to childcare centres and employers.
          </p>
        </div>
      </section>

      {/* How MamaPlus Works - Mobile Optimized */}
      <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-6 sm:mb-8 md:mb-12 text-center">How MamaPlus Works</h2>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            <div className="bg-white rounded-xl p-5 sm:p-6 md:p-8 border border-border">
              <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">Digital Platform</h3>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6">
                Our platform connects families, caregivers, centres, and employers—making it easier to find care, access training, and receive ongoing support.
              </p>
              <ul className="space-y-2.5 sm:space-y-3">
                {[
                  "Easy caregiver matching and placement",
                  "Access to training programs and certifications",
                  "Ongoing support and communication tools"
                ].map((item, i) => (
                  <li key={i} className="flex gap-2.5 sm:gap-3 text-sm sm:text-base">
                    <span className="text-primary font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-5 sm:p-6 md:p-8 border border-border">
              <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">Training & Support Centres</h3>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6">
                Our Training & Support Centres ensure caregivers and childcare providers meet clear standards for safety, learning, and wellbeing.
              </p>
              <ul className="space-y-2.5 sm:space-y-3">
                {[
                  "Practical, hands-on training programs",
                  "Professional certification aligned to standards",
                  "Ongoing mentorship and quality assurance",
                  "Connection to local training services"
                ].map((item, i) => (
                  <li key={i} className="flex gap-2.5 sm:gap-3 text-sm sm:text-base">
                    <span className="text-primary font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services List - Mobile Optimized with Collapsible Features */}
      <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-6 sm:mb-8 md:mb-12 text-center">Integrated Services</h2>
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 sm:p-6 md:p-8 border border-border hover:border-primary/50 transition">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
                  <service.icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">{service.title}</h3>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground">{service.description}</p>
                  </div>
                  <button 
                    onClick={() => setExpandedService(expandedService === idx ? null : idx)}
                    className="md:hidden self-start p-2 -mr-2"
                    aria-label="Toggle features"
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedService === idx ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                <div className={`${expandedService === idx ? 'block' : 'hidden'} md:block`}>
                  <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base text-foreground mb-3 sm:mb-4">What's Included</h4>
                      <ul className="space-y-2 sm:space-y-2.5 md:space-y-3">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex gap-2 sm:gap-2.5 md:gap-3 text-sm sm:text-base text-muted-foreground">
                            <span className="text-primary font-bold flex-shrink-0">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex md:items-end mt-4 md:mt-0">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg">
                        {service.cta} <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Care Standards - Mobile Optimized */}
      <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-6 sm:mb-8 md:mb-12 text-center">How we Ensure Quality</h2>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-5 sm:p-6 md:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">Our Care Standards</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                All caregivers and centres supported by MamaPlus follow clear care standards applied whether care happens in a home, centre, or workplace.
              </p>
              <ul className="space-y-2.5 sm:space-y-3">
                {[
                  "Safe and child-friendly environments",
                  "Appropriate caregiver-to-child ratios",
                  "Structured routines for play, learning, and rest",
                  "Nutrition, hygiene, and health standards",
                  "Emergency preparedness and first aid"
                ].map((standard, i) => (
                  <li key={i} className="flex gap-2.5 sm:gap-3 text-sm sm:text-base">
                    <span className="text-primary font-bold flex-shrink-0">✓</span>
                    <span className="text-foreground">{standard}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-secondary/10 rounded-xl p-5 sm:p-6 md:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">What Children Experience</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Children in MamaPlus-supported care experience warm, nurturing environments designed for their development and wellbeing.
              </p>
              <ul className="space-y-2.5 sm:space-y-3">
                {[
                  "Warm, responsive relationships with trained caregivers",
                  "Safe spaces to explore, learn, and grow",
                  "Play-based learning that supports development",
                  "Healthy routines and nutritious meals",
                  "Emotional security and sense of belonging"
                ].map((item, i) => (
                  <li key={i} className="flex gap-2.5 sm:gap-3 text-sm sm:text-base">
                    <span className="text-primary font-bold flex-shrink-0">✓</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition - Mobile Optimized with Horizontal Scroll */}
      <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-6 sm:mb-8 md:mb-12 text-center">Value Proposition</h2>
          {/* Mobile: Horizontal scroll, Desktop: Horizontal Grid */}
          <div className="flex lg:grid lg:grid-cols-5 gap-4 lg:gap-4 overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0 pb-4 lg:pb-0">
            {[
              {
                title: "For Families",
                items: [
                  "Childcare you can trust",
                  "Caregivers who are trained and supported",
                  "Clear expectations and standards",
                  "Peace of mind to work and thrive"
                ]
              },
              {
                title: "For Caregivers",
                items: [
                  "Professional training and certification",
                  "Job matching and placement support",
                  "Ongoing mentorship and support",
                  "Dignified, rewarding career path"
                ]
              },
              {
                title: "Placement Agencies",
                items: [
                  "Access to trained caregivers",
                  "Clear quality standards and guidance",
                  "Increased trust from families",
                  "Shared commitment to child wellbeing"
                ]
              },
              {
                title: "For Corporates",
                items: [
                  "Access to quality childcare for staff",
                  "Access to training courses"
                ]
              },
              {
                title: "For Governments",
                items: [
                  "Policy implementation support",
                  "Public childcare infrastructure development",
                  "National workforce training programs",
                  "Quality monitoring and data systems"
                ]
              }
            ].map((proposition, i) => (
              <div key={i} className="bg-white rounded-xl p-5 sm:p-6 border border-border min-w-[280px] lg:min-w-0 flex-shrink-0">
                <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4">{proposition.title}</h3>
                <ul className="space-y-2 sm:space-y-2.5">
                  {proposition.items.map((item, j) => (
                    <li key={j} className="flex gap-2 sm:gap-2.5 text-sm text-muted-foreground">
                      <span className="text-primary font-bold flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">Ready to Get Started?</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Whether you are a parent, caregiver, centre, or employer, MamaPlus is here to support you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button className="bg-primary hover:bg-primary/90 text-white text-base px-8 py-5 w-full sm:w-auto">
                Create an Account <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 text-base px-8 py-5 w-full sm:w-auto bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
