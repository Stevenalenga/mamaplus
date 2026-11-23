import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/page-hero'
import { PhotoFigure } from '@/components/photo-figure'
import { AnimatedSection } from '@/components/animated-section'
import SEOHead from '@/components/seo-head'

export default function FamiliesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <SEOHead
        title="For Families - Learn What Trained Care Looks Like"
        description="MamaPlus helps families understand professional childcare training, join parent workshops, and work with caregivers who have practised the skills children need."
        canonicalUrl="https://mamaplus.co.ke/families"
      />

      <PageHero
        kicker="For families"
        title="Learn what trained care looks like—and how to support it at home"
        intro="Parent workshops, child-development guidance, and a clear picture of the skills MamaPlus caregivers practise. Placement support is available after the learning foundation."
        photo={{
          src: '/mamaplus images/education.jpeg',
          alt: 'Parent and caregiver learning session',
          caption: 'Parents learning alongside trained caregivers',
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/contact">
            <Button className="bg-primary hover:bg-primary/90 text-white">Talk to us about care</Button>
          </Link>
          <Link href="/learn">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
              Parent resources
            </Button>
          </Link>
        </div>
      </PageHero>

      <section className="px-4 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-4">
          <AnimatedSection>
            <PhotoFigure
              src="/mamaplusservices/explain.jpeg"
              alt="Facilitator explaining childcare guidance to families"
              caption="Facilitators explaining routines, safety, and nurturing care"
              heightClassName="h-64"
            />
          </AnimatedSection>
          <AnimatedSection delay={80}>
            <PhotoFigure
              src="/mamaplusservices/crowd2.jpeg"
              alt="Families in a MamaPlus support session"
              caption="Community sessions for parents and caregivers"
              heightClassName="h-64"
            />
          </AnimatedSection>
        </div>
      </section>

      <section className="px-4 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <AnimatedSection>
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">What families learn with MamaPlus</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-primary/5">
                    <tr>
                      <th className="px-4 py-3">Focus</th>
                      <th className="px-4 py-3">What you gain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Parent workshops', 'Child development, nurturing care, and how to work with a trained caregiver at home.'],
                      ['What trained care looks like', 'Clear standards for safety, routines, play, nutrition, and emotional wellbeing.'],
                      ['Working with caregivers', 'Guidance on expectations, communication, and supporting professional practice.'],
                      ['Optional placement support', 'After the learning foundation, connect with caregivers who have completed MamaPlus training.'],
                    ].map(([feature, description]) => (
                      <tr key={feature} className="border-t border-border">
                        <td className="px-4 py-3 font-medium text-primary">{feature}</td>
                        <td className="px-4 py-3 text-muted-foreground">{description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            <AnimatedSection>
              <section className="bg-white border border-border rounded-2xl p-6 h-full">
                <h2 className="text-2xl font-semibold mb-4">How it works</h2>
                <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                  <li>Browse parent learning and the course catalogue.</li>
                  <li>Join a workshop or talk to the team about your child’s needs.</li>
                  <li>Work with trained caregivers who practise the same standards.</li>
                </ol>
              </section>
            </AnimatedSection>
            <AnimatedSection delay={80}>
              <section className="bg-white border border-border rounded-2xl p-6 h-full">
                <h2 className="text-2xl font-semibold mb-4">Why families choose trained care</h2>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                  <li>Caregivers trained in safety, development, and positive discipline</li>
                  <li>Parent workshops grounded in the same curriculum</li>
                  <li>Clear care standards you can recognise at home</li>
                  <li>Ongoing support after class</li>
                </ul>
              </section>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}
