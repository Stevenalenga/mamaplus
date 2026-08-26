'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  GraduationCap,
  Heart,
  Loader2,
  Shield,
  Users,
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
    src: '/mamaplusservices/explain.jpeg',
    alt: 'MamaPlus facilitator delivering a caregiver training session',
    caption: 'Facilitators teaching practical childcare skills',
  },
  {
    src: '/mamaplus images/education.jpeg',
    alt: 'Learners in a MamaPlus classroom',
    caption: 'Classroom practice in child development',
  },
  {
    src: '/mamaplus images/presentaton.jpeg',
    alt: 'Trainer presenting childcare standards to a group',
    caption: 'Certification-ready training sessions',
  },
]

const learningSteps = [
  { step: '1', title: 'Enrol', text: 'Choose a course that matches your role—caregiver, parent, or centre team.' },
  { step: '2', title: 'Train', text: 'Learn in our centres, in community sessions, and through guided practice.' },
  { step: '3', title: 'Certify', text: 'Complete assessments and earn credentials aligned to care standards.' },
  { step: '4', title: 'Practise', text: 'Apply skills with children, with ongoing mentorship and peer support.' },
]

const featuredPathways = [
  {
    title: 'Caregiver certification',
    description: 'Child development, safety, nutrition, and emotional care for people who look after children every day.',
    href: '/courses',
  },
  {
    title: 'Parent workshops',
    description: 'Practical guidance on nurturing care, routines, and how to work with trained caregivers at home.',
    href: '/families',
  },
  {
    title: 'Centre & team training',
    description: 'Staff skills, quality standards, and peer learning for childcare centres and early learning programmes.',
    href: '/services',
  },
]

const audiences = [
  {
    icon: Heart,
    title: 'Families',
    text: 'Understand what trained care looks like, and learn alongside the people who care for your child.',
    href: '/families',
  },
  {
    icon: GraduationCap,
    title: 'Caregivers',
    text: 'Build a professional skill set, earn credentials, and join a community of trained practitioners.',
    href: '/caregivers',
  },
  {
    icon: Users,
    title: 'Agencies & partners',
    text: 'Work with a trained talent pipeline and raise care quality in the communities you serve.',
    href: '/agencies-partners',
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
    description: 'Professional childcare training in Kenya. Certified courses for caregivers, parents, and centres that raise the quality of care for children.',
    url: 'https://mamaplus.co.ke',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <SEOHead
        title="MamaPlus – Professional Childcare Training in Kenya"
        description="Learn professional childcare with MamaPlus. Certified training for caregivers, parents, and centres. When caregivers are well trained, children receive safer, more nurturing care."
        keywords={[
          'childcare training Kenya',
          'caregiver certification Nairobi',
          'early childhood courses Kenya',
          'professional caregiver training',
          'MamaPlus training',
        ]}
        canonicalUrl="https://mamaplus.co.ke"
        schema={pageSchema}
      />

      <section className="pt-24 pb-12 px-4 md:pt-32 md:pb-20 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <AnimatedSection>
              <p className="inline-flex items-center rounded-full border border-border px-4 py-1 text-sm text-muted-foreground mb-6">
                Professional childcare training across Kenya
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-primary leading-tight mb-6">
                Skills and certification for people who care for children
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4">
                MamaPlus is a training organisation. We prepare caregivers, parents, and centre teams with practical skills in child development, safety, and nurturing care.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                When caregivers are well trained and supported, families benefit—and children get a safer, stronger start in life.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/courses">
                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white py-5 px-6">
                    Explore courses
                  </Button>
                </Link>
                <Link href="#how-learning-works">
                  <Button variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 py-5 px-6 bg-transparent">
                    How it works
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

      <section id="how-learning-works" className="py-16 px-4 lg:px-8 bg-white/60 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">How learning works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">From enrolment to practised skill</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {learningSteps.map((item, index) => (
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
                <div className="h-full bg-white border border-border rounded-2xl p-6 flex flex-col">
                  <BookOpen className="w-7 h-7 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{path.title}</h3>
                  <p className="text-muted-foreground flex-1 mb-6">{path.description}</p>
                  <Link href={path.href}>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                      Learn more
                    </Button>
                  </Link>
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
              <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-3">Where learning happens</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                MamaPlus Training & Support Centres
              </h2>
              <p className="text-lg font-semibold text-secondary mb-4">Classrooms, practice, and mentorship</p>
              <p className="text-muted-foreground mb-6">
                Our centres are where caregivers and centre teams practise the skills they will use with children: safety, learning through play, nutrition, and emotional wellbeing.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Practical, hands-on caregiver training',
                  'Certification aligned to care standards',
                  'Ongoing mentorship and support',
                  'Guidance on child safety, learning, nutrition, and emotional wellbeing',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/about-us">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  About our training <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </AnimatedSection>
            <AnimatedSection delay={120}>
              <PhotoFigure
                src="/mamaplus images/education.jpeg"
                alt="MamaPlus Training & Support Centre classroom"
                caption="Training centres: where caregivers practise child-centred skills"
                heightClassName="h-80 lg:h-[450px]"
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Learn with us</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary">Resources from the library</h2>
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

      <section className="py-16 px-4 lg:px-8 bg-white/60">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Who we serve</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Audiences for training</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {audiences.map((audience, index) => (
              <AnimatedSection key={audience.title} delay={index * 80}>
                <div className="h-full bg-white border border-border rounded-2xl p-6">
                  <audience.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{audience.title}</h3>
                  <p className="text-muted-foreground mb-6">{audience.text}</p>
                  <Link href={audience.href} className="text-primary font-semibold inline-flex items-center gap-1 hover:underline">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8 bg-[#052e34] text-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <AnimatedSection>
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Why training matters</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Training raises the quality of care</h2>
            <p className="text-white/70 mb-6">
              Skills learned in the classroom show up in children’s daily lives: safer environments, better routines, and warmer, more responsive relationships.
            </p>
            <ul className="space-y-3">
              {[
                'Child safety and safeguarding',
                'Early childhood development',
                'Nutrition, hygiene, and health',
                'Positive discipline and emotional support',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </AnimatedSection>
          <AnimatedSection delay={120}>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
              <Award className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">What learners practise</h3>
              <p className="text-white/70 text-sm mb-5">
                Every course is built around skills caregivers use with children under six—not just theory.
              </p>
              <Link href="/services">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  See how training is applied
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8 bg-primary">
        <AnimatedSection>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Enrol in a course</h2>
            <p className="text-lg text-white/80 mb-8">
              Start with the catalogue, or talk to the team about the right training path for you or your organisation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button className="bg-white text-primary hover:bg-white/90 px-8 py-5 font-bold rounded-xl">
                  Explore courses <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-2 border-white/40 text-white hover:bg-white/10 px-8 py-5 rounded-xl bg-transparent">
                  Contact us
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  )
}
