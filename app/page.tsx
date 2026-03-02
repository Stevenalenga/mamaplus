'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import SEOHead from '@/components/seo-head'

export default function LandingPage() {
  const [expandedService, setExpandedService] = useState<number | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [heroImageIndex, setHeroImageIndex] = useState(0)
  
  // Hero section images - Training and education focused
  const heroImages = [
    {
      src: '/mamaplusservices/explain.jpeg',
      alt: 'MamaPlus trainers conducting caregiver education session',
      caption: 'Professional Caregiver Training'
    },
    {
      src: '/mamaplusservices/newsec.jpeg',
      alt: 'MamaPlus trainer presenting to caregivers in a training session',
      caption: 'Expert-Led Caregiver Training'
    },
    {
      src: '/mamaplus images/education.jpeg',
      alt: 'Interactive hands-on training session for caregivers',
      caption: 'Hands-On Skills Development'
    },
    {
      src: '/mamaplusservices/crowd.jpeg',
      alt: 'Caregivers learning in MamaPlus training center',
      caption: 'Building Quality Care Standards'
    },
    {
      src: '/mamaplusservices/totalnew.jpeg',
      alt: 'Caregivers in a vibrant classroom learning environment',
      caption: 'Learning Environments That Inspire'
    }
  ]

  // Gallery section images - Community and impact focused
  const galleryImages = [
    {
      src: '/mamaplusservices/crowd.jpeg',
      alt: 'Caregivers attending training session in classroom environment',
      caption: 'Building a Community of Care'
    },
    {
      src: '/mamaplusservices/explain.jpeg',
      alt: 'Interactive hands-on training with practical learning activities',
      caption: 'Hands-On Skills Development'
    },
    {
      src: '/mamaplusservices/newsec.jpeg',
      alt: 'MamaPlus trainer presenting to caregivers in a training session',
      caption: 'Expert-Led Caregiver Training'
    },
    {
      src: '/mamaplusservices/newpic.jpeg',
      alt: 'Professional development session for childcare providers',
      caption: 'Professional Growth & Standards'
    },
    {
      src: '/mamaplus images/education.jpeg',
      alt: 'Interactive training with real-world childcare scenarios',
      caption: 'Practical Training That Works'
    },
    {
      src: '/mamaplusservices/totalnew.jpeg',
      alt: 'Caregivers in a vibrant classroom learning environment',
      caption: 'Inspiring Learning Environments'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % galleryImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [galleryImages.length])

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setHeroImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 4000)
    return () => clearInterval(heroInterval)
  }, [heroImages.length])
  
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
                <Link href="/services/quicksignup" className="w-full">
                  <Button className="bg-primary hover:bg-primary/90 text-white text-base px-6 py-5 w-full">
                    Get Started Now <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/signup" className="w-full">
                  <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 text-base px-6 py-5 w-full bg-transparent">
                    Create an Account
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-48 sm:h-64 md:h-80 lg:h-96 shadow-xl">
              {heroImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    index === heroImageIndex
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-105'
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                    <p className="text-white font-bold text-base sm:text-lg md:text-xl lg:text-2xl drop-shadow-lg">
                      {image.caption}
                    </p>
                    <p className="text-white/90 text-xs sm:text-sm md:text-base mt-1 sm:mt-2 drop-shadow-lg">
                      Trusted Childcare Platform
                    </p>
                  </div>
                </div>
              ))}
              {/* Navigation Dots */}
              <div className="absolute top-4 right-4 flex gap-1.5 sm:gap-2">
                {heroImages.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      index === heroImageIndex
                        ? 'w-6 sm:w-8 bg-white'
                        : 'w-1.5 sm:w-2 bg-white/50'
                    }`}
                  />
                ))}
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
            <p className="text-sm sm:text-base md:text-lg text-foreground mb-3 md:mb-4">
              The MamaPlus Training & Support Centres are the backbone of our childcare model. Working closely with County Governments and training institutions, we coordinate scalable workforce development initiatives, ensuring every caregiver and childcare provider in our network meets clear, child-centred skills aligned with national and international standards and best practices.
            </p>
            <p className="text-sm sm:text-base md:text-lg text-foreground mb-5 md:mb-6">
              We run our own centres in Nairobi and Bungoma, while collaborating with others to deliver our workforce development solutions in other geographies.
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
                <Link href="/services">
                  <Button className="bg-primary hover:bg-primary/90 text-white w-full text-base py-5">
                    Learn About Our Standards
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 sm:p-6 md:p-8 border border-border">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 md:mb-3">Our Impact</h2>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-foreground text-center max-w-3xl mx-auto">
              We upgrade skills, facilities and practices so that childcare standards and practices are aligned across homes, centres, and workplaces. This way we ensure that we are the practical engine for childcare that families can trust.
            </p>
          </div>
        </div>
      </section>

      {/* Image Gallery - MamaPlus in Action */}
      <section className="py-12 px-4 sm:py-16 md:py-20 lg:px-8 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 md:mb-4">
              MamaPlus in Action
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering caregivers, supporting families, and transforming childcare across Africa
            </p>
          </div>

          {/* Main Carousel Image */}
          <div className="relative max-w-5xl mx-auto mb-6 sm:mb-8">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    index === currentImageIndex
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-105'
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                    <p className="text-white font-semibold text-lg sm:text-xl md:text-2xl drop-shadow-lg">
                      {image.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-4 sm:mt-6">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-primary/30 hover:bg-primary/50'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'ring-4 ring-primary shadow-lg scale-105'
                    : 'ring-2 ring-border hover:ring-primary/50 opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
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
