'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  ArrowRight, Users, Award, Home, Briefcase, BookOpen,
  Heart, ChevronDown, Building2, CheckCircle2, Star,
  Shield, Sparkles, GraduationCap, Globe2
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import SEOHead from '@/components/seo-head'

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

function AnimatedSection({ children, className = '', delay = 0 }: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function ServicesPage() {
  const [expandedService, setExpandedService] = useState<number | null>(null)

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'MamaPlus Childcare Services',
    description: 'Comprehensive childcare services including caregiver placement, training, support for childcare centres, and corporate childcare solutions.',
    provider: { '@type': 'Organization', name: 'MamaPlus' },
    areaServed: { '@type': 'Country', name: 'Kenya' },
    serviceType: ['Caregiver Placement', 'Childcare Training', 'Centre Support', 'Corporate Childcare'],
  }

  const services = [
    {
      icon: Home,
      color: 'from-[#ee5f5e] to-[#c44b4a]',
      lightBg: 'bg-primary/10',
      accent: 'text-primary',
      badge: 'Most Popular',
      image: '/mamaplus images/relate.jpeg',
      title: "Placement & Support for House Managers",
      description: "We connect families with trained, vetted House Managers and domestic workers and provide support before, during, and after placement.",
      features: [
        "Caregiver matching based on family needs",
        "Background checks and credential verification",
        "Interview and hiring support",
        "Ongoing check-ins and conflict-resolution support",
        "Guidance on contracts and fair employment practices"
      ],
      cta: "Find a House Manager",
      stat: "500+",
      statLabel: "Target Placements"
    },
    {
      icon: GraduationCap,
      color: 'from-[#0c7e8e] to-[#095f6b]',
      lightBg: 'bg-secondary/10',
      accent: 'text-secondary',
      badge: null,
      image: '/mamaplus images/education.jpeg',
      title: "Training & Support for Caregivers",
      description: "We treat caregiving as a profession. MamaPlus provides certified training, mental health support, and access to job opportunities.",
      features: [
        "Certified training in child development, safety, and emotional care",
        "Skills training in feeding, hygiene, CPR, and educational play",
        "Soft-skills training: communication, professionalism, time management",
        "Mental health and wellbeing support",
        "Access to job opportunities through the MamaPlus platform"
      ],
      cta: "Explore Training",
      stat: "1,200+",
      statLabel: "Training Target"
    },
    {
      icon: Users,
      color: 'from-[#ee5f5e] to-[#c44b4a]',
      lightBg: 'bg-primary/10',
      accent: 'text-primary',
      badge: 'Women-Centered',
      image: '/mamaplusservices/crowd2.jpeg',
      title: 'Female-Only Cohorts & Learning Sessions',
      description: 'We run female-only caregiver cohorts and safe-session learning spaces designed around women\'s realities, confidence building, and practical care leadership.',
      features: [
        'Female-only classroom and peer-learning cohorts',
        'Safe moderated sessions focused on women caregivers',
        'Facilitators trained in gender-responsive learning methods',
        'Modules on confidence, communication, and workplace dignity',
        'Targeted support for young mothers and women re-entering work',
      ],
      cta: 'Join a Women-Only Cohort',
      stat: '300+',
      statLabel: 'Women in Cohorts',
    },
    {
      icon: Users,
      color: 'from-[#ee5f5e] to-[#c44b4a]',
      lightBg: 'bg-primary/10',
      accent: 'text-primary',
      badge: null,
      image: '/mamaplus images/growpep.jpeg',
      title: "Support Circles for Childcare Centres",
      description: "We strengthen community and informal childcare centres through training, quality standards, and peer support.",
      features: [
        "Staff training and certification programs",
        "Quality improvement tools and guidance",
        "Support circles and peer learning networks",
        "Increased trust and confidence from families",
        "Community-driven improvements"
      ],
      cta: "Join the Centre Network",
      stat: "80+",
      statLabel: "Target Centres"
    },
    {
      icon: Briefcase,
      color: 'from-[#0c7e8e] to-[#095f6b]',
      lightBg: 'bg-secondary/10',
      accent: 'text-secondary',
      badge: 'New',
      image: null,
      title: "Corporate Childcare Provision",
      description: "We help employers set up and manage childcare solutions that support productivity and employee wellbeing.",
      features: [
        "Customized childcare solutions for workplaces",
        "Access to trained caregivers and facilities",
        "Employee benefit coordination",
        "Quality assurance and compliance support",
        "Flexible scheduling and management"
      ],
      cta: "Partner With Us",
      stat: "30+",
      statLabel: "Target Partners"
    },
    {
      icon: Heart,
      color: 'from-[#ee5f5e] to-[#c44b4a]',
      lightBg: 'bg-primary/10',
      accent: 'text-primary',
      badge: null,
      image: null,
      title: "Training & Support for Parents",
      description: "We support parents with guidance, tools, and community—because quality childcare works best when families are supported too.",
      features: [
        "Guidance on hiring and managing caregivers",
        "Workshops on child development and nurturing care",
        "Communication tools for working with domestic staff",
        "Parent check-ins and support groups",
        "Practical resources and community connection"
      ],
      cta: "Access Parent Resources",
      stat: "2,000+",
      statLabel: "Target Families"
    },
    {
      icon: Building2,
      color: 'from-[#0c7e8e] to-[#095f6b]',
      lightBg: 'bg-secondary/10',
      accent: 'text-secondary',
      badge: null,
      image: null,
      title: "Solutions for Government & Public Sector",
      description: "We partner with governments to strengthen childcare systems, expand access to quality care, and build a trained workforce.",
      features: [
        "Policy implementation support and technical assistance",
        "Public childcare infrastructure development and management",
        "National caregiver training and certification programs",
        "Quality standards development and monitoring systems",
        "Community-based childcare program expansion",
        "Data systems for childcare workforce and service mapping"
      ],
      cta: "Partner With Government",
      stat: "5+",
      statLabel: "Target Counties"
    }
  ]

  const trainingImages = [
    {
      src: '/mamaplus images/relate.jpeg',
      alt: 'Caregiver training session',
      caption: 'Hands-On Training',
      description: 'Interactive sessions focused on real-world caregiving skills',
      tag: 'CPD Certified'
    },
    {
      src: '/mamaplus images/education.jpeg',
      alt: 'Professional development class',
      caption: 'Professional Development',
      description: 'Structured curriculum aligned to national care standards',
      tag: 'Nationally Recognized'
    },
    {
      src: '/mamaplus images/growpep.jpeg',
      alt: 'Mentorship session',
      caption: 'Personalized Mentorship',
      description: 'One-on-one guidance to support every caregiver\'s journey',
      tag: 'Ongoing Support'
    }
  ]

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 lg:px-8 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-accent/10 rounded-full blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Integrated Childcare Ecosystem
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
              Quality Care for{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Every Child
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              MamaPlus offers integrated services that support the entire childcare ecosystem—from families and caregivers to childcare centres and employers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/services/quicksignup">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-5 text-base rounded-xl shadow-lg shadow-primary/25">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="#services">
                <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary/5 px-8 py-5 text-base rounded-xl bg-transparent">
                  Explore Services
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { icon: Shield, label: 'Vetted & Certified' },
                { icon: Star, label: '4.9/5 Families Rate Us' },
                { icon: Globe2, label: 'Across Kenya' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Hero image mosaic */}
          <AnimatedSection delay={200} className="hidden lg:block">
            <div className="relative h-[500px]">
              {/* Main large image */}
              <div className="absolute top-0 right-0 w-72 h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image src="/mamaplus images/relate.jpeg" alt="Caregiver with child" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              {/* Secondary image */}
              <div className="absolute bottom-0 left-0 w-60 h-64 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <Image src="/mamaplus images/education.jpeg" alt="Training session" fill className="object-cover" />
              </div>
              {/* Tertiary image */}
              <div className="absolute top-24 left-16 w-48 h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white rotate-3">
                <Image src="/mamaplus images/growpep.jpeg" alt="Mentorship" fill className="object-cover" />
              </div>
              {/* Floating stat cards */}
              <div className="absolute top-4 left-4 bg-white rounded-2xl px-4 py-3 shadow-lg border border-border">
                <p className="text-2xl font-black text-primary">1,200+</p>
                <p className="text-xs text-muted-foreground">Training Target</p>
              </div>
              <div className="absolute bottom-8 right-4 bg-white rounded-2xl px-4 py-3 shadow-lg border border-border">
                <p className="text-2xl font-black text-primary">500+</p>
                <p className="text-xs text-muted-foreground">Target Families</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────── */}
      <section className="py-8 px-4 lg:px-8 bg-primary text-white">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-white/80 mb-4 font-semibold">Our 2026 Impact Targets</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '1,200+', label: 'Caregivers Trained' },
              { value: '500+', label: 'Family Placements' },
              { value: '80+', label: 'Centres Supported' },
              { value: '30+', label: 'Corporate Partners' },
            ].map((s, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <p className="text-3xl sm:text-4xl font-black">{s.value}</p>
                <p className="text-sm text-white/70 mt-1">{s.label}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ─────────────────────────────────── */}
      <section id="services" className="py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">Our Integrated Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Seven pillars supporting every part of the childcare journey
            </p>
          </AnimatedSection>

          <div className="space-y-6">
            {services.map((service, idx) => {
              const isEven = idx % 2 === 0
              const isExpanded = expandedService === idx

              return (
                <AnimatedSection key={idx} delay={idx * 60}>
                  <div className={`group rounded-2xl border border-border bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-transparent`}>
                    <div className="flex flex-col lg:flex-row">

                      {/* Left color stripe + icon */}
                      <div className={`bg-gradient-to-br ${service.color} p-6 lg:p-8 flex lg:flex-col items-center lg:items-start gap-4 lg:gap-6 lg:w-64 flex-shrink-0`}>
                        <div className="bg-white/20 rounded-2xl p-3">
                          <service.icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-white">
                          <p className="text-3xl font-black">{service.stat}</p>
                          <p className="text-sm text-white/80">{service.statLabel}</p>
                        </div>
                        {service.badge && (
                          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                            {service.badge}
                          </span>
                        )}
                        {/* Image preview in sidebar for services that have one */}
                        {service.image && (
                          <div className="hidden lg:block mt-auto w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-white/30">
                            <Image src={service.image} alt={service.title} width={220} height={165} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        {!service.image && (
                          <div className="hidden lg:flex mt-auto w-full aspect-[4/3] rounded-xl border-2 border-white/30 bg-white/10 items-center justify-center">
                            <service.icon className="w-12 h-12 text-white/40" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 lg:p-8">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <h3 className="text-xl lg:text-2xl font-bold text-foreground">{service.title}</h3>
                          <button
                            onClick={() => setExpandedService(isExpanded ? null : idx)}
                            className="lg:hidden flex-shrink-0 p-2 rounded-xl hover:bg-muted transition-colors"
                          >
                            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                        <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>

                        <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
                          <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">What's Included</p>
                              <ul className="space-y-2">
                                {service.features.map((f, i) => (
                                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${service.accent}`} />
                                    <span>{f}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex items-end">
                              <Link href="/signup" className="w-full">
                                <Button className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 text-white py-5 rounded-xl shadow-md text-sm font-semibold`}>
                                  {service.cta} <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TRAINING IN ACTION — Magazine Layout ─────────── */}
      <section className="py-16 px-4 lg:px-8 bg-[#052e34] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Behind The Scenes</p>
                <h2 className="text-3xl sm:text-4xl font-black">Training in Action</h2>
              </div>
              <p className="text-white/60 max-w-sm text-sm md:text-right">
                Real moments from our training centres across Kenya, shaping the next generation of professional caregivers.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Feature image — tall */}
            <AnimatedSection delay={100} className="md:col-span-7 md:row-span-2">
              <div className="relative h-64 md:h-full min-h-[400px] rounded-2xl overflow-hidden group cursor-pointer">
                <Image
                  src={trainingImages[0].src}
                  alt={trainingImages[0].alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {trainingImages[0].tag}
                  </span>
                  <h3 className="text-2xl font-black text-white mb-1">{trainingImages[0].caption}</h3>
                  <p className="text-white/70 text-sm">{trainingImages[0].description}</p>
                </div>
              </div>
            </AnimatedSection>

            {/* Two stacked images */}
            {trainingImages.slice(1).map((img, i) => (
              <AnimatedSection key={i} delay={200 + i * 100} className="md:col-span-5">
                <div className="relative h-48 md:h-56 rounded-2xl overflow-hidden group cursor-pointer">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-2 border border-white/30">
                      {img.tag}
                    </span>
                    <h3 className="text-lg font-bold text-white">{img.caption}</h3>
                    <p className="text-white/60 text-xs mt-0.5">{img.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Testimonial strip */}
          <AnimatedSection delay={300} className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-[#052e34] flex items-center justify-center text-white text-xs font-bold">
                    {['A', 'M', 'F'][i - 1]}
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-sm italic">
                  "The training changed how I see my work. I'm not just a house manager — I'm a professional caregiver."
                </p>
                <p className="text-white/40 text-xs mt-1">— Amina, certified caregiver, Nairobi</p>
              </div>
              <Link href="/signup">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 text-sm rounded-xl bg-transparent whitespace-nowrap">
                  Start Training <ArrowRight className="ml-1 w-3 h-3" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── VALUE PROPOSITION — Tabbed Cards ─────────────── */}
      <section className="py-16 px-4 lg:px-8 bg-secondary/5">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">Who We Serve</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              MamaPlus creates value across the entire childcare ecosystem
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              {
                icon: Heart,
                title: "Families",
                color: 'from-[#ee5f5e] to-[#c44b4a]',
                items: ["Trusted, trained caregivers", "Clear expectations & standards", "Peace of mind to work and thrive"]
              },
              {
                icon: GraduationCap,
                title: "Caregivers",
                color: 'from-[#0c7e8e] to-[#095f6b]',
                items: ["Professional certification", "Job matching & placement", "Dignified career path"]
              },
              {
                icon: Users,
                title: "Centres",
                color: 'from-[#ee5f5e] to-[#c44b4a]',
                items: ["Access to trained staff", "Quality standards guidance", "Trust from families"]
              },
              {
                icon: Briefcase,
                title: "Corporates",
                color: 'from-[#0c7e8e] to-[#095f6b]',
                items: ["Workplace childcare access", "Training courses for teams", "Employee benefit coordination"]
              },
              {
                icon: Building2,
                title: "Government",
                color: 'from-[#ee5f5e] to-[#c44b4a]',
                items: ["Policy implementation support", "National training programs", "Data & monitoring systems"]
              },
            ].map((prop, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <div className="bg-white rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className={`bg-gradient-to-br ${prop.color} p-4 flex items-center gap-3`}>
                    <prop.icon className="w-6 h-6 text-white" />
                    <h3 className="text-white font-bold text-lg">{prop.title}</h3>
                  </div>
                  <ul className="p-4 space-y-2.5">
                    {prop.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-16 px-4 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">How MamaPlus Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our Training & Support Centres ensure every caregiver meets clear standards for safety, learning, and wellbeing.
            </p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <AnimatedSection>
              <div className="space-y-4">
                {[
                  { step: '01', title: 'Enrol & Assess', desc: 'Caregivers or families sign up and are matched to the right programme.' },
                  { step: '02', title: 'Train & Certify', desc: 'Practical, hands-on training with professional certification aligned to standards.' },
                  { step: '03', title: 'Match & Place', desc: 'Vetted caregivers are matched to families, centres, or corporates.' },
                  { step: '04', title: 'Ongoing Support', desc: 'Continuous mentorship, check-ins, and quality assurance after placement.' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      {step.step}
                    </div>
                    <div className="pt-2">
                      <h4 className="font-bold text-foreground">{step.title}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200} className="relative">
              <div className="relative h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl">
                <Image src="/mamaplus images/education.jpeg" alt="Training centre" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <p className="text-white font-bold">Training & Support Centres</p>
                  <p className="text-white/70 text-sm mt-1">Hands-on learning, community support, certified outcomes</p>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-primary text-white rounded-2xl px-4 py-3 shadow-lg">
                <p className="text-2xl font-black">98%</p>
                <p className="text-xs text-white/80">Pass Rate</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── QUALITY STANDARDS ─────────────────────────────── */}
      <section className="py-16 px-4 lg:px-8 bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">How We Ensure Quality</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            <AnimatedSection delay={100}>
              <div className="bg-white rounded-2xl p-8 border border-border shadow-sm h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Our Care Standards</h3>
                </div>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  All caregivers and centres supported by MamaPlus follow clear care standards applied whether care happens in a home, centre, or workplace.
                </p>
                <ul className="space-y-3">
                  {[
                    "Safe and child-friendly environments",
                    "Appropriate caregiver-to-child ratios",
                    "Structured routines for play, learning, and rest",
                    "Nutrition, hygiene, and health standards",
                    "Emergency preparedness and first aid"
                  ].map((s, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-foreground">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm h-full flex flex-col">
                <div className="relative h-48 flex-shrink-0">
                  <Image src="/mamaplus images/growpep.jpeg" alt="Child in care" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                      <Heart className="w-5 h-5 text-primary" />
                      <p className="text-white font-semibold text-sm">What Children Experience</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <p className="text-muted-foreground mb-4 text-sm">
                    Children in MamaPlus-supported care experience warm, nurturing environments designed for their development.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Warm, responsive relationships with trained caregivers",
                      "Safe spaces to explore, learn, and grow",
                      "Play-based learning that supports development",
                      "Healthy routines and nutritious meals",
                      "Emotional security and sense of belonging"
                    ].map((s, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-16 px-4 lg:px-8 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        </div>
        <AnimatedSection className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Join the MamaPlus Community
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Whether you are a parent, caregiver, centre, or employer, MamaPlus is here to support you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button className="bg-white text-primary hover:bg-white/90 px-10 py-5 text-base font-bold rounded-xl shadow-xl w-full sm:w-auto">
                Create an Account <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-2 border-white/40 text-white hover:bg-white/10 px-10 py-5 text-base rounded-xl bg-transparent w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  )
}
