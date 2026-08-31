'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  BookOpen,
  Building2,
  GraduationCap,
  Headphones,
  Heart,
  Loader2,
  MapPin,
  Users,
  WifiOff,
} from 'lucide-react'
import SEOHead from '@/components/seo-head'
import { getDashboardForRole } from '@/lib/roles'
import { AnimatedSection } from '@/components/animated-section'
import { PhotoFigure } from '@/components/photo-figure'

type HomePost = {
  slug: string
  title: string
  description: string
  category: string
}

const visualHighlights = [
  {
    src: '/seriopis/DSC_4262.JPG',
    alt: 'Caregivers practising infant bathing with a baby doll during MamaPlus training',
    caption: 'Hands-on infant care practice in a community training session',
  },
  {
    src: '/seriopis/DSC_4257.JPG',
    alt: 'Trainee practising childcare with a baby doll and nutrition screening tapes',
    caption: 'Practical skills in child health and nutrition',
  },
  {
    src: '/seriopis/DSC_4311.JPG',
    alt: 'Caregivers making low-cost educational toys during a MamaPlus workshop',
    caption: 'Learning through play: making teaching aids together',
  },
]

const impactStats = [
  { value: '1,200+', label: 'Caregivers to train' },
  { value: '500+', label: 'Family placements' },
  { value: '80+', label: 'Centres to support' },
  { value: '98%', label: 'Training pass rate' },
]

const journeys = [
  {
    icon: Heart,
    title: 'For families',
    text: 'Understand what trained care looks like, join parent workshops, and connect with caregivers who have practised the same standards.',
    points: ['Parent workshops', 'Clear care standards', 'Optional placement after training'],
    href: '/families',
    cta: 'I need care',
  },
  {
    icon: GraduationCap,
    title: 'For caregivers',
    text: 'Build a professional skill set, earn credentials, and join a community of trained practitioners.',
    points: ['Certified training', 'Professional recognition', 'Pathways after class'],
    href: '/caregivers',
    cta: 'Start training',
  },
  {
    icon: Building2,
    title: 'For organisations',
    text: 'Work with a trained talent pipeline and raise care quality in the communities you serve.',
    points: ['Workforce development', 'Centre and ELC network', 'Workplace childcare programmes'],
    href: '/agencies-partners',
    cta: 'Partner with us',
  },
]

const ecosystemStrip = ['Families', 'Caregivers', 'Centres', 'Employers', 'Partners']

const howItWorks = [
  {
    step: '01',
    title: 'Join',
    text: 'Families, caregivers, and organisations enter the MamaPlus ecosystem.',
  },
  {
    step: '02',
    title: 'Train and verify',
    text: 'Caregivers receive practical training and complete appropriate verification.',
  },
  {
    step: '03',
    title: 'Connect',
    text: 'We match people with relevant opportunities in homes, centres, and programmes.',
  },
  {
    step: '04',
    title: 'Support',
    text: 'Mentorship and community continue beyond class and placement.',
  },
]

const featuredPathways = [
  {
    title: 'Caregiver certification',
    description: 'Child development, safety, nutrition, and emotional care for people who look after children every day.',
    href: '/courses',
    src: '/seriopis/DSC_4287.JPG',
    alt: 'Caregivers using literacy cards under posters on child grooming and illness',
    caption: 'Classroom practice in child development and health',
  },
  {
    title: 'Parent workshops',
    description: 'Practical guidance on nurturing care, routines, and how to work with trained caregivers at home.',
    href: '/families',
    src: '/seriopis/DSC_4290.JPG',
    alt: 'Women making letter cards and teaching materials in a MamaPlus workshop',
    caption: 'Workshops that turn everyday materials into learning tools',
  },
  {
    title: 'Centre & team training',
    description: 'Staff skills, quality standards, and peer learning for childcare centres and early learning programmes.',
    href: '/services',
    src: '/seriopis/DSC_4325.JPG',
    alt: 'Centre team creating a number teaching aid during a group training session',
    caption: 'Peer learning for centre and early learning teams',
  },
]

const offlineFeatures = [
  {
    icon: WifiOff,
    title: 'Offline-first',
    text: 'Core lessons work with limited connectivity and sync when the network returns.',
  },
  {
    icon: Headphones,
    title: 'Audio learning',
    text: 'Training can be consumed through audio, improving access for more learners.',
  },
  {
    icon: MapPin,
    title: 'Community hubs',
    text: 'Physical spaces provide training, device access, and peer support.',
  },
  {
    icon: Users,
    title: 'Human support',
    text: 'Technology does not replace people. It strengthens the communities around care.',
  },
]

const testimonials = [
  {
    quote: "The training changed how I see my work. I'm not just a house manager — I'm a professional caregiver.",
    name: 'Amina',
    role: 'Certified caregiver, Nairobi',
    src: '/seriopis/DSC_4305.JPG',
    alt: 'MamaPlus trainee smiling with handmade educational toys from a skills session',
    caption: 'Caregivers practising professional childcare skills',
  },
  {
    quote:
      'I started as a domestic worker. Through MamaPlus training, I learned digital skills and now I also teach other women in my community. I earn more and I am respected more.',
    name: 'Grace',
    role: 'Caregiver and trainer, Kakuma',
    src: '/seriopis/DSC_4295.JPG',
    alt: 'Caregivers knitting and making teaching materials in a MamaPlus workshop',
    caption: 'Community workshops that turn practice into careers',
  },
  {
    quote:
      'A Nairobi placement agency needed trained domestic workers from outside the city. MamaPlus trained 200 women in Busia and Kakuma — the agency filled 85 placements in 12 months.',
    name: 'Partner story',
    role: 'Training for placement, Nairobi',
    src: '/mamaplus images/platform-conference.jpeg',
    alt: 'Partners reviewing MamaPlus training outcomes',
    caption: 'Partners reviewing training outcomes',
  },
]

export function HomeLanding({ posts }: { posts: HomePost[] }) {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'authenticated' && session?.user) {
      const userRole = (session.user as { role?: string }).role
      window.location.href = getDashboardForRole(userRole)
    }
  }, [session, status])

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'MamaPlus',
    description:
      'MamaPlus trains and certifies caregivers in Kenya, helps families understand quality childcare, and partners with organisations to strengthen care across communities.',
    url: 'https://mamaplus.co.ke',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <SEOHead
        title="MamaPlus – Trusted Childcare Starts with Trained Caregivers"
        description="MamaPlus trains and certifies caregivers, helps families understand quality care, and partners with organisations to strengthen childcare across Kenya."
        keywords={[
          'childcare training Kenya',
          'caregiver certification Nairobi',
          'trusted childcare Kenya',
          'professional caregiver training',
          'childcare partners Kenya',
          'MamaPlus training',
        ]}
        canonicalUrl="https://mamaplus.co.ke"
        schema={pageSchema}
      />

      <section className="pt-24 pb-12 px-4 md:pt-32 md:pb-16 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <AnimatedSection>
              <p className="inline-flex items-center rounded-full border border-border px-4 py-1 text-sm font-semibold uppercase tracking-widest text-secondary mb-6">
                Building a stronger childcare ecosystem
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-primary leading-tight mb-6">
                Trusted childcare starts with trained caregivers.
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4">
                MamaPlus trains and certifies caregivers, helps families understand quality care, and partners with organisations to strengthen childcare across Kenya.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Training · Certification · Family support · Community
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/courses">
                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white py-5 px-6">
                    Start training
                  </Button>
                </Link>
                <Link href="/families">
                  <Button variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 py-5 px-6 bg-transparent">
                    I need care
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={120}>
              <div className="grid grid-cols-2 gap-3">
                <PhotoFigure
                  src={visualHighlights[0].src}
                  alt={visualHighlights[0].alt}
                  caption={visualHighlights[0].caption}
                  className="col-span-2"
                  heightClassName="h-60 md:h-72"
                  priority
                />
                <PhotoFigure
                  src={visualHighlights[1].src}
                  alt={visualHighlights[1].alt}
                  caption={visualHighlights[1].caption}
                  heightClassName="h-40"
                />
                <PhotoFigure
                  src={visualHighlights[2].src}
                  alt={visualHighlights[2].alt}
                  caption={visualHighlights[2].caption}
                  heightClassName="h-40"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-8 px-4 lg:px-8 bg-primary text-white">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-white/80 mb-6 font-semibold">Our 2026 impact targets</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {impactStats.map((stat, index) => (
              <AnimatedSection key={stat.label} delay={index * 70}>
                <p className="text-3xl sm:text-4xl font-black">{stat.value}</p>
                <p className="text-sm text-white/70 mt-1">{stat.label}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Choose your path</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Three ways to join MamaPlus</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {journeys.map((journey, index) => (
              <AnimatedSection key={journey.title} delay={index * 80}>
                <div className="h-full bg-white border border-border rounded-2xl p-6 flex flex-col">
                  <journey.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{journey.title}</h3>
                  <p className="text-muted-foreground mb-4">{journey.text}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {journey.points.map((point) => (
                      <li key={point} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">·</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link href={journey.href} className="text-primary font-semibold inline-flex items-center gap-1 hover:underline">
                    {journey.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={160}>
            <p className="mt-10 text-center text-sm text-muted-foreground">
              One ecosystem.{' '}
              {ecosystemStrip.map((item, index) => (
                <span key={item}>
                  <span className="font-semibold text-foreground">{item}</span>
                  {index < ecosystemStrip.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section id="how-it-works" className="py-16 px-4 lg:px-8 bg-white/60 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">How MamaPlus works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">From training to trusted care</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {howItWorks.map((item, index) => (
              <AnimatedSection key={item.step} delay={index * 70}>
                <div className="bg-white border border-border rounded-2xl p-6 h-full">
                  <p className="text-3xl font-bold text-primary mb-2">{item.step}</p>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Featured learning</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary">Pathways you can start now</h2>
            </div>
            <Link href="/courses" className="text-primary font-semibold inline-flex items-center gap-1 hover:underline">
              View all courses <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredPathways.map((path, index) => (
              <AnimatedSection key={path.title} delay={index * 80}>
                <div className="h-full bg-white border border-border rounded-2xl overflow-hidden flex flex-col">
                  <PhotoFigure
                    src={path.src}
                    alt={path.alt}
                    caption={path.caption}
                    heightClassName="h-44"
                    className="rounded-none shadow-none"
                  />
                  <div className="p-6 flex flex-col flex-1">
                    <BookOpen className="w-7 h-7 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{path.title}</h3>
                    <p className="text-muted-foreground flex-1 mb-6">{path.description}</p>
                    <Link href={path.href}>
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                        Learn more
                      </Button>
                    </Link>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-3">A real differentiator</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Technology that works where people live
              </h2>
              <p className="text-muted-foreground mb-8">
                Not everyone has reliable internet. MamaPlus combines digital tools with community-based support so training stays accessible in low-connectivity settings.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {offlineFeatures.map((feature) => (
                  <div key={feature.title} className="bg-white border border-border rounded-2xl p-4">
                    <feature.icon className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.text}</p>
                  </div>
                ))}
              </div>
              <Link href="/our-platform">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  See the learning tools <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </AnimatedSection>
            <AnimatedSection delay={120}>
              <PhotoFigure
                src="/seriopis/DSC_4338.JPG"
                alt="Caregivers working together with training materials in a community hub"
                caption="Community hubs that host training, practice, and peer support"
                heightClassName="h-80 lg:h-[450px]"
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Stories from the ecosystem</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Caregiving is a profession</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, index) => (
              <AnimatedSection key={item.name} delay={index * 80}>
                <article className="h-full bg-white border border-border rounded-2xl overflow-hidden flex flex-col">
                  <PhotoFigure
                    src={item.src}
                    alt={item.alt}
                    caption={item.caption}
                    heightClassName="h-48"
                  />
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-foreground flex-1 mb-4">
                      {item.name === 'Partner story' ? item.quote : `“${item.quote}”`}
                    </p>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.role}</p>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8 bg-white/60">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Learn with us</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary">Knowledge that helps families thrive</h2>
            </div>
            <Link href="/learn" className="text-primary font-semibold inline-flex items-center gap-1 hover:underline">
              Open the Learn hub <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>
          {posts.length === 0 ? (
            <AnimatedSection>
              <div className="bg-white border border-border rounded-2xl p-8 text-center">
                <p className="text-muted-foreground mb-4">Visit the Learn hub for pathways, articles, and course guidance.</p>
                <Link href="/learn">
                  <Button className="bg-primary hover:bg-primary/90 text-white">Go to Learn</Button>
                </Link>
              </div>
            </AnimatedSection>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <AnimatedSection key={post.slug} delay={index * 80}>
                  <article className="h-full bg-white border border-border rounded-2xl p-6 flex flex-col">
                    <p className="text-xs font-semibold text-primary mb-2">{post.category}</p>
                    <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground flex-1 mb-4 line-clamp-3">{post.description}</p>
                    <Link href={`/blog/${post.slug}`} className="text-primary font-semibold inline-flex items-center gap-1 hover:underline">
                      Read article <ArrowRight className="w-4 h-4" />
                    </Link>
                  </article>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8 bg-[#052e34] text-white">
        <AnimatedSection>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Let&apos;s build a better future for care</h2>
            <p className="text-lg text-white/80 mb-8">
              Whether you are looking for childcare, building a career, or looking for a strategic partner, there is a place for you at MamaPlus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-5 font-bold rounded-xl">
                  Start training <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/families">
                <Button variant="outline" className="border-2 border-white/40 text-white hover:bg-white/10 px-8 py-5 rounded-xl bg-transparent">
                  For families
                </Button>
              </Link>
              <Link href="/agencies-partners">
                <Button variant="outline" className="border-2 border-white/40 text-white hover:bg-white/10 px-8 py-5 rounded-xl bg-transparent">
                  Partner with us
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  )
}
