import SEOHead from '@/components/seo-head'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/page-hero'
import { AnimatedSection } from '@/components/animated-section'

export default function PartnerPage() {
  const networkSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Join the MamaPlus ELC Network',
    description: 'Join the MamaPlus ELC Network and run a community training and early learning centre with curriculum, coaching, and ongoing support.',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <SEOHead
        title="Join the MamaPlus ELC Training Network"
        description="Run a community training and early learning centre with MamaPlus curriculum, facilitator coaching, and ongoing support."
        keywords={[
          'MamaPlus ELC Network',
          'early learning training centre Kenya',
          'community childcare training',
          'start a training centre',
        ]}
        canonicalUrl="https://mamaplus.co.ke/partner"
        schema={networkSchema}
      />

      <PageHero
        kicker="Training-centre network"
        title="Join the MamaPlus ELC Network"
        intro="Open a community centre that trains caregivers and delivers early learning—with MamaPlus curriculum, coaching, and quality standards behind you."
        photo={{
          src: '/mamaplusservices/platform-community-training.jpeg',
          alt: 'Community early learning and training centre session',
          caption: 'Community centres that host training and early learning',
        }}
      >
        <Link href="/services/quicksignup">
          <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-5">
            Apply to join
          </Button>
        </Link>
      </PageHero>

      <section className="px-4 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <AnimatedSection>
            <div className="bg-white border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">As a network centre you can:</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>Run caregiver training and early learning in your community</li>
                <li>Use MamaPlus curriculum, assessment, and quality standards</li>
                <li>Receive facilitator guidance and ongoing coaching</li>
                <li>Help children and caregivers practise skills for school and work</li>
              </ul>
              <p className="mt-5 text-foreground font-medium">
                Prior childcare experience is helpful, but a commitment to learning is the requirement.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div className="bg-white border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Is this for you?</h2>
              <p className="text-muted-foreground mb-4">You are ready to join if you:</p>
              <ul className="space-y-3 text-muted-foreground">
                <li>Want to host training and early learning locally</li>
                <li>Care about children&apos;s development and caregiver skills</li>
                <li>Are willing to follow a shared curriculum and standards</li>
                <li>Want coaching rather than starting from scratch</li>
              </ul>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={120}>
            <div className="bg-white border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">How joining works</h2>
              <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                <li>Apply — tell us about your community and goals</li>
                <li>Meet the team — learn how a MamaPlus training centre operates</li>
                <li>Start your programme — open with curriculum and coaching in place</li>
              </ol>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={160}>
            <div className="bg-primary rounded-2xl p-8 text-center">
              <p className="text-lg sm:text-xl text-white font-semibold mb-6">
                We guide you at every step, with training tools to help your centre succeed.
              </p>
              <Link href="/contact">
                <Button className="bg-white text-primary hover:bg-white/90">Talk to the network team</Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
