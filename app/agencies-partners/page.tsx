import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/page-hero'
import { PhotoFigure } from '@/components/photo-figure'
import { AnimatedSection } from '@/components/animated-section'
import SEOHead from '@/components/seo-head'

export default function AgenciesPartnersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <SEOHead
        title="For Agencies & Partners - A Trained Talent Pipeline"
        description="Partner with MamaPlus to train caregivers, certify teams, and raise care quality in the communities you serve."
        canonicalUrl="https://mamaplus.co.ke/agencies-partners"
      />

      <PageHero
        kicker="For agencies and partners"
        title="Work with people who have been trained to care"
        intro="Placement agencies, employers, NGOs, and government partners tap a pipeline of caregivers who have practised professional childcare skills—not just a list of names."
        photo={{
          src: '/mamaplus images/platform-conference.jpeg',
          alt: 'Partners at a MamaPlus training forum',
          caption: 'Partners reviewing training outcomes with MamaPlus',
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/contact">
            <Button className="bg-primary hover:bg-primary/90 text-white">Talk to us</Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
              See the curriculum
            </Button>
          </Link>
        </div>
      </PageHero>

      <section className="px-4 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-4">
          <AnimatedSection>
            <PhotoFigure
              src="/mamaplus images/platform-roundtable.jpeg"
              alt="Agency roundtable on caregiver training"
              caption="Roundtables on workforce training and quality"
              heightClassName="h-64"
            />
          </AnimatedSection>
          <AnimatedSection delay={80}>
            <PhotoFigure
              src="/mamaplusservices/platform-community-training.jpeg"
              alt="Community-level caregiver training"
              caption="Community training that feeds a skilled pipeline"
              heightClassName="h-64"
            />
          </AnimatedSection>
        </div>
      </section>

      <section className="px-4 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <AnimatedSection>
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Who we train with</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-primary/5">
                    <tr>
                      <th className="px-4 py-3">Partner type</th>
                      <th className="px-4 py-3">Training value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Placement agencies', 'Access caregivers who have completed childcare training and professional practice modules.'],
                      ['Employers and corporates', 'Staff childcare and employee programmes built on trained caregivers and parent workshops.'],
                      ['NGOs and government', 'Deliver measurable skills programmes with reporting on training completed.'],
                      ['Training institutions', 'Align curricula and connect graduates to MamaPlus certification and practice.'],
                    ].map(([type, offer]) => (
                      <tr key={type} className="border-t border-border">
                        <td className="px-4 py-3 font-medium text-primary">{type}</td>
                        <td className="px-4 py-3 text-muted-foreground">{offer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </AnimatedSection>

          <AnimatedSection>
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Partnership models</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">1. Talent pipeline</p>
                  <p>We train caregivers in last-mile communities; you work with a steady flow of job-ready, credentialed candidates.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">2. Programme delivery</p>
                  <p>We deliver your skills and quality goals through our centres, curriculum, and community reach.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">3. Workplace learning</p>
                  <p>Employee childcare and parent workshops as part of wellness packages, grounded in the same training standards.</p>
                </div>
              </div>
            </section>
          </AnimatedSection>

          <AnimatedSection>
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Case study: training for placement</h2>
              <p className="text-muted-foreground mb-2">
                <span className="font-semibold text-foreground">Challenge:</span> A Nairobi placement agency needed trained domestic workers from outside the city.
              </p>
              <p className="text-muted-foreground mb-2">
                <span className="font-semibold text-foreground">Solution:</span> MamaPlus trained 200 women in Busia and Kakuma in childcare, digital literacy, and workplace professionalism.
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Outcome:</span> The agency filled 85 placements in 12 months and improved retention by 40%.
              </p>
            </section>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
