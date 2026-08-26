import Link from 'next/link'
import { ArrowRight, Building2, GraduationCap, Heart, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/page-hero'
import { AnimatedSection } from '@/components/animated-section'
import SEOHead from '@/components/seo-head'

const audiences = [
  {
    icon: Heart,
    title: 'Families',
    description: 'Learn how trained caregivers support your child, and access parent workshops on nurturing care and child development.',
    href: '/families',
    cta: 'For families',
  },
  {
    icon: GraduationCap,
    title: 'Caregivers',
    description: 'Build a professional skill set, earn credentials, and join a community of people who take childcare seriously.',
    href: '/caregivers',
    cta: 'For caregivers',
  },
  {
    icon: Users,
    title: 'Agencies & partners',
    description: 'Source trained talent, run workforce programmes, and strengthen the quality of care in the communities you serve.',
    href: '/agencies-partners',
    cta: 'For agencies',
  },
  {
    icon: Building2,
    title: 'How training is applied',
    description: 'See how classroom learning is used in homes, centres, workplaces, and community early learning programmes.',
    href: '/services',
    cta: 'See the applications',
  },
]

export default function WhoWeServePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <SEOHead
        title="Who We Serve - Families, Caregivers, and Partners"
        description="MamaPlus trains caregivers, supports families, and partners with agencies so children across Kenya receive skilled, nurturing care."
        canonicalUrl="https://mamaplus.co.ke/who-we-serve"
      />

      <PageHero
        kicker="Who we serve"
        title="Training for everyone who shapes a child’s early years"
        intro="MamaPlus is a training organisation first. Families, caregivers, centres, and partners each have a place in the learning journey."
        photo={{
          src: '/mamaplusservices/platform-community-training.jpeg',
          alt: 'Community training session with MamaPlus facilitators',
          caption: 'Community training: facilitators working with caregivers in session',
        }}
      />

      <section className="pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
          {audiences.map((audience, index) => (
            <AnimatedSection key={audience.title} delay={index * 80}>
              <div className="h-full bg-white border border-border rounded-2xl p-6 flex flex-col">
                <audience.icon className="w-8 h-8 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-2">{audience.title}</h2>
                <p className="text-muted-foreground flex-1 mb-6">{audience.description}</p>
                <Link href={audience.href}>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                    {audience.cta} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <section className="pb-16 px-4 lg:px-8">
        <AnimatedSection>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Start with a course</h2>
            <p className="text-muted-foreground mb-6">
              Whatever your role, professional training is the shared foundation. Explore the catalogue or talk to the team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/courses">
                <Button className="bg-primary hover:bg-primary/90 text-white">Explore courses</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
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
