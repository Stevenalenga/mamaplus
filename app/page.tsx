'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Shield, Users, Heart, GraduationCap, Briefcase, MapPin } from 'lucide-react'
import SEOHead from '@/components/seo-head'

export default function LandingPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'MamaPlus – Quality Childcare Families Can Trust',
    description: 'MamaPlus supports families by ensuring children receive safe, nurturing, and high-quality childcare—wherever that care happens: at home, in childcare centres, or near the workplace.',
    url: 'https://mamaplus.co.ke',
  }

  const visualHighlights = [
    {
      src: '/mamaplusservices/explain.jpeg',
      alt: 'MamaPlus facilitators delivering caregiver training',
      caption: 'Professional Training & Support',
    },
    {
      src: '/mamaplusservices/newsec.jpeg',
      alt: 'Caregiver classroom session with trainer',
      caption: 'Practical Skills for Real Work',
    },
    {
      src: '/mamaplusservices/crowd.jpeg',
      alt: 'Women participating in MamaPlus community learning',
      caption: 'Community-Centred Care',
    },
  ]

  const services = [
    {
      emoji: '👩🏽‍👧',
      icon: Heart,
      title: 'In-Home Childcare & House Manager Support',
      description: 'We help families find trained, vetted House Managers and in-home caregivers, and provide support before, during, and after placement.',
      features: [
        'Caregiver matching based on family needs',
        'Background checks and credential verification',
        'Ongoing check-ins and conflict-resolution support',
      ],
      primaryCta: 'Find In-Home Childcare',
      primaryHref: '/families',
      secondaryCta: 'Family Sign In',
      secondaryHref: '/login',
      color: 'from-[#ee5f5e] to-[#c44b4a]',
    },
    {
      emoji: '🎓',
      icon: GraduationCap,
      title: 'Training & Career Support for Caregivers',
      description: 'We believe caregiving is a profession—and we treat it like one. MamaPlus provides certified training, mental health support, and access to job opportunities.',
      features: [
        'Certified training in child development, safety, and emotional care',
        'Mental health and wellbeing support',
        'Access to job opportunities through the MamaPlus platform',
      ],
      primaryCta: 'Explore Training',
      primaryHref: '/courses',
      secondaryCta: 'Caregiver Sign In',
      secondaryHref: '/login',
      color: 'from-[#0c7e8e] to-[#095f6b]',
    },
    {
      emoji: '🏫',
      icon: Users,
      title: 'Support for Childcare Centres',
      description: 'MamaPlus strengthens community and informal childcare centres through training, quality standards, and peer support.',
      features: [
        'Staff training and certification',
        'Quality improvement tools and guidance',
        'Support circles and peer learning networks',
      ],
      primaryCta: 'Join the Centre Network',
      primaryHref: '/services',
      secondaryCta: 'Centre Sign In',
      secondaryHref: '/login',
      color: 'from-[#ee5f5e] to-[#c44b4a]',
    },
    {
      emoji: '🏢',
      icon: Briefcase,
      title: 'Corporate Childcare Provision',
      description: 'We help employers set up and manage childcare solutions that support productivity and employee wellbeing.',
      features: [
        'Customised childcare solutions for workplaces',
        'Access to trained caregivers and facilities',
        'Quality assurance and compliance support',
      ],
      primaryCta: 'Partner With Us',
      primaryHref: '/agencies-partners',
      secondaryCta: 'Employer Sign In',
      secondaryHref: '/login',
      color: 'from-[#0c7e8e] to-[#095f6b]',
    },
    {
      emoji: '👨‍👩‍👧',
      icon: Heart,
      title: 'Training & Support for Parents',
      description: "Parenting doesn't come with a manual—but MamaPlus provides guidance, tools, and community support for every family.",
      features: [
        'Guidance on hiring and managing caregivers',
        'Workshops on child development and nurturing care',
        'Parent check-ins, support groups, and practical resources',
      ],
      primaryCta: 'Access Parent Resources',
      primaryHref: '/families',
      secondaryCta: 'Parent Sign In',
      secondaryHref: '/login',
      color: 'from-[#ee5f5e] to-[#c44b4a]',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <SEOHead
        title="MamaPlus – Quality Childcare Families Can Trust"
        description="MamaPlus supports families by ensuring children receive safe, nurturing, and high-quality childcare—at home, in childcare centres, or near the workplace. Professional training, clear care standards, and ongoing support."
        keywords={[
          'quality childcare Kenya',
          'trusted childcare families',
          'caregiver training Nairobi',
          'childcare standards Kenya',
          'house manager placement',
          'early childhood care Kenya',
        ]}
        canonicalUrl="https://mamaplus.co.ke"
        schema={pageSchema}
      />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="pt-24 pb-12 px-4 md:pt-32 md:pb-20 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="inline-flex items-center rounded-full border border-border px-4 py-1 text-sm text-muted-foreground mb-6">
                <MapPin className="w-3 h-3 mr-1.5 text-primary" /> Trusted Childcare Across Kenya
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-primary leading-tight mb-6">
                Quality Childcare Families Can Trust
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4">
                MamaPlus supports families by ensuring children receive safe, nurturing, and high-quality childcare—wherever that care happens: at home, in childcare centres, or near the workplace.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Through professional training, ongoing support, and clear childcare standards, MamaPlus strengthens the quality of care for children under six and supports the adults who care for them. When caregivers are well trained and supported, families benefit—and children get the best possible start in life.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <Link href="/families">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white py-5">Find Childcare</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 py-5 bg-transparent">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-white py-5">Create an Account</Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 relative h-60 md:h-72 rounded-2xl overflow-hidden shadow-lg">
                <Image src={visualHighlights[0].src} alt={visualHighlights[0].alt} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <p className="absolute left-4 bottom-4 text-white font-semibold">{visualHighlights[0].caption}</p>
              </div>
              <div className="relative h-40 rounded-xl overflow-hidden shadow">
                <Image src={visualHighlights[1].src} alt={visualHighlights[1].alt} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <p className="absolute left-3 bottom-3 text-white text-sm font-medium">{visualHighlights[1].caption}</p>
              </div>
              <div className="relative h-40 rounded-xl overflow-hidden shadow">
                <Image src={visualHighlights[2].src} alt={visualHighlights[2].alt} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <p className="absolute left-3 bottom-3 text-white text-sm font-medium">{visualHighlights[2].caption}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRAINING & SUPPORT CENTRES ───────────────────────── */}
      <section className="py-16 px-4 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-3">Our Foundation</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                The MamaPlus Training & Support Centres
              </h2>
              <p className="text-lg font-semibold text-secondary mb-4">Where Quality Childcare Begins</p>
              <p className="text-muted-foreground mb-6">
                The MamaPlus Training & Support Centres are the backbone of our childcare model. They ensure that every caregiver and childcare provider in our network meets clear, child-centred standards.
              </p>
              <p className="text-sm font-semibold text-foreground mb-3">At our centres, MamaPlus provides:</p>
              <ul className="space-y-3 mb-6">
                {[
                  'Practical, hands-on caregiver training',
                  'Certification aligned to care standards',
                  'Ongoing mentorship and support',
                  'Guidance on child safety, learning, nutrition, and emotional wellbeing',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mb-6">
                Working with county governments, national institutions, and regional partners across Africa, MamaPlus aligns childcare standards across homes, centres, and workplaces—so families can expect consistent quality, wherever their child is cared for.
              </p>
              <Link href="/services">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Learn About Our Standards <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="relative h-80 lg:h-[450px] rounded-3xl overflow-hidden shadow-2xl">
              <Image src="/mamaplus images/education.jpeg" alt="MamaPlus Training & Support Centre" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-white font-bold">Training & Support Centres</p>
                <p className="text-white/70 text-sm mt-1">Ensuring every caregiver meets clear, child-centred standards</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR FAMILIES + CHILDREN'S EXPERIENCE ─────────────── */}
      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">For Families</h2>
            <p className="text-xl font-semibold text-secondary">Childcare You Can Trust</p>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Choosing childcare is one of the most important decisions a family makes. MamaPlus supports families by setting and monitoring clear standards for safety, learning, health, and wellbeing.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-primary mb-4">Our Promise to Families</h3>
              <ul className="space-y-3 mb-8">
                {[
                  'Caregivers trained in child safety, development, and positive discipline',
                  'Clean, safe, and regularly supported care environments',
                  'Age-appropriate routines for play, learning, and rest',
                  "Support for children's health, nutrition, and emotional wellbeing",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/families">
                  <Button className="bg-primary hover:bg-primary/90 text-white">Find Trusted Childcare</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">Family Sign In</Button>
                </Link>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-primary mb-4">What Your Child Experiences</h3>
              <p className="text-muted-foreground text-sm mb-5">
                Children in MamaPlus-supported care experience an environment designed for their safety, growth, and happiness.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Warm, responsive relationships with trained caregivers',
                  'Structured daily routines that build confidence and security',
                  'Learning through play, music, storytelling, and movement',
                  'Healthy meals and snacks',
                  'A safe space to grow, explore, and belong',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/families">
                  <Button className="bg-primary hover:bg-primary/90 text-white">Find Childcare</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">Sign In</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR SERVICES ─────────────────────────────────────── */}
      <section className="py-16 px-4 lg:px-8 bg-white/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              MamaPlus offers integrated services that support families, caregivers, centres, and partners across the childcare ecosystem.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col">
                <div className={`bg-gradient-to-r ${service.color} p-4 flex items-center gap-3`}>
                  <span className="text-2xl">{service.emoji}</span>
                  <h3 className="text-white font-bold text-sm leading-tight">{service.title}</h3>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                  <ul className="space-y-2 mb-5 flex-1">
                    {service.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-2 mt-auto">
                    <Link href={service.primaryHref}>
                      <Button className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 text-white text-sm`}>
                        {service.primaryCta} <ArrowRight className="ml-1 w-3 h-3" />
                      </Button>
                    </Link>
                    <Link href={service.secondaryHref}>
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent text-sm">
                        {service.secondaryCta}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARE STANDARDS + TRAINED CAREGIVERS ──────────────── */}
      <section className="py-16 px-4 lg:px-8 bg-[#052e34] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Non-Negotiable</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Our Care Standards</h2>
              <p className="text-lg font-semibold text-primary mb-4">Putting Children First, Always</p>
              <p className="text-white/70 mb-6">
                Quality is built into every MamaPlus service. All caregivers and centres in the MamaPlus network follow clear standards, and are regularly supported to improve and maintain quality.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Child safety and safeguarding policies',
                  'Clean, child-friendly environments',
                  'Appropriate caregiver-to-child ratios',
                  'Structured routines for learning, rest, and play',
                  'Nutrition, hygiene, and health standards',
                  'Emergency preparedness and first aid',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/services">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Learn More About Our Standards <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
                <h3 className="text-xl font-bold mb-2">Trained Caregivers</h3>
                <p className="text-lg font-semibold text-primary mb-4">Skilled Hands. Caring Hearts.</p>
                <p className="text-white/70 text-sm mb-5">
                  MamaPlus caregivers are trained to provide safe, nurturing, and developmentally appropriate care. Caregivers understand that caring for a child means caring for the whole family.
                </p>
                <ul className="space-y-2.5 mb-6">
                  {[
                    'Child safety and safeguarding',
                    'Early childhood development',
                    'Positive discipline and emotional support',
                    'Nutrition, hygiene, and health',
                    'Communication and partnership with families',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/families">
                  <Button className="bg-primary hover:bg-primary/90 text-white w-full">
                    Request a Trained Caregiver
                  </Button>
                </Link>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
                <h3 className="text-xl font-bold mb-2">Quality Care at Home</h3>
                <p className="text-base font-semibold text-primary mb-3">For Families Using Domestic Workers</p>
                <p className="text-white/70 text-sm mb-5">
                  MamaPlus works with caregivers and placement agencies to improve childcare quality in family homes—including for existing domestic workers or House Managers.
                </p>
                <ul className="space-y-2.5 mb-6">
                  {[
                    'Access to trained or untrained caregivers through MamaPlus',
                    'Affordable training in home-based childcare basics',
                    'Better routines, learning activities, and child engagement',
                    'Clear expectations and care standards',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Link href="/families">
                    <Button className="bg-primary hover:bg-primary/90 text-white text-sm">Improve Childcare at Home</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent text-sm">Family Sign In</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY + PARTNER ──────────────────────────────── */}
      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-primary mb-2">Community & Parent Support</h3>
            <p className="text-lg font-semibold text-secondary mb-4">You Are Not Alone</p>
            <p className="text-muted-foreground text-sm mb-5">
              Strong families build strong children. MamaPlus supports families through community and peer connections.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Parent circles and community discussions',
                'Parenting tips and child development guidance',
                'Opportunities to connect with other families',
                'Access to trusted childcare information',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/families">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Join the Parent Community <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-primary mb-2">Partner With MamaPlus</h3>
            <p className="text-lg font-semibold text-secondary mb-4">Strengthening Childcare Together</p>
            <p className="text-muted-foreground text-sm mb-5">
              MamaPlus partners with childcare centres, caregivers, placement agencies, employers, and governments to raise childcare standards.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Access to trained caregivers',
                'Clear quality standards and guidance',
                'Increased trust from families',
                "A shared commitment to children's wellbeing",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link href="/agencies-partners">
                <Button className="bg-secondary hover:bg-secondary/90 text-white">
                  Become a Partner <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10 bg-transparent">
                  Partner Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT + CONTACT CTA ──────────────────────────────── */}
      <section className="py-16 px-4 lg:px-8 bg-primary">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">About MamaPlus</h2>
          <p className="text-lg text-white/80 mb-3 max-w-3xl mx-auto">
            MamaPlus was created to ensure that quality childcare is not a privilege, but a standard. We work across communities to strengthen childcare systems, empower caregivers, and help children thrive—while giving families peace of mind.
          </p>
          <p className="text-white/60 mb-10 max-w-2xl mx-auto">
            Whether you are a parent, caregiver, childcare centre, or partner, MamaPlus is here to help you find trusted childcare, learn more about our standards, or get involved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-white text-primary hover:bg-white/90 px-8 py-5 font-bold rounded-xl shadow-xl">
                Contact MamaPlus <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-2 border-white/40 text-white hover:bg-white/10 px-8 py-5 rounded-xl bg-transparent">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-secondary hover:bg-secondary/90 text-white px-8 py-5 rounded-xl">
                Create an Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
