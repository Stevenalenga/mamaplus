import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/page-hero'
import { PhotoFigure } from '@/components/photo-figure'
import { AnimatedSection } from '@/components/animated-section'
import SEOHead from '@/components/seo-head'

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <SEOHead
        title="About MamaPlus - A Childcare Training Organisation"
        description="MamaPlus is a training organisation that prepares caregivers, parents, and centres with professional skills—so children across Kenya receive safer, more nurturing care."
        canonicalUrl="https://mamaplus.co.ke/about-us"
      />

      <PageHero
        kicker="About MamaPlus"
        title="A training organisation for people who care for children"
        intro="We teach practical skills in child development, safety, and nurturing care. Inclusion and women’s economic opportunity remain part of the story; training and skills come first."
        photo={{
          src: '/mamaplus images/presentaton.jpeg',
          alt: 'MamaPlus trainer presenting childcare skills to a class',
          caption: 'Facilitators teaching childcare standards in a live session',
        }}
      />

      <section className="px-4 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4">
          <AnimatedSection className="md:col-span-2">
            <PhotoFigure
              src="/mamaplus images/photoopp.jpeg"
              alt="MamaPlus learners and partners after a training session"
              caption="Learners and partners after a community training day"
              heightClassName="h-72"
            />
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <PhotoFigure
              src="/mamaplusservices/totalnew.jpeg"
              alt="Caregiver community learning session"
              caption="Peer learning after class"
              heightClassName="h-72"
            />
          </AnimatedSection>
        </div>
      </section>

      <section className="px-4 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="bg-white border border-border rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Our story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  MamaPlus started with a simple observation: the people who care for young children—mothers, childcare workers, domestic helpers—often have the heart for the work, but not enough access to professional training.
                </p>
                <p>
                  We saw mothers in Busia looking for trusted guidance, domestic workers in Kakuma unable to access training, placement agencies searching for skilled candidates, and women with disabilities excluded from digital learning.
                </p>
                <p>
                  Today MamaPlus is a training organisation first. We teach, certify, and support caregivers—and that training is what families, centres, and partners rely on when they look for quality care.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <AnimatedSection>
              <section className="bg-white border border-border rounded-2xl p-6 h-full">
                <h2 className="text-2xl font-semibold mb-3">Our mission</h2>
                <p className="text-muted-foreground">
                  To train caregivers, parents, and centre teams with the skills, credentials, and support they need to provide safe, nurturing care for children—while opening dignified pathways for women in the care economy.
                </p>
              </section>
            </AnimatedSection>
            <AnimatedSection delay={80}>
              <section className="bg-white border border-border rounded-2xl p-6 h-full">
                <h2 className="text-2xl font-semibold mb-3">Our vision</h2>
                <p className="text-muted-foreground">
                  A Kenya where every child is cared for by someone who has been trained to do the job well—regardless of location, education level, or background.
                </p>
              </section>
            </AnimatedSection>
          </div>

          <AnimatedSection>
            <section className="bg-white border border-border rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Our values</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-primary/5">
                    <tr>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3">What it means in training</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Practice', 'We teach skills caregivers will use with children the next day.'],
                      ['Inclusion', 'We design learning for the most marginalized first, including women with disabilities and low-literacy learners.'],
                      ['Dignity', 'Care work is a profession. Training treats every caregiver as a practitioner.'],
                      ['Community', 'We build classrooms and peer spaces where people learn together.'],
                      ['Impact', 'We measure skills gained, credentials earned, and the quality of care that follows.'],
                    ].map(([value, meaning]) => (
                      <tr key={value} className="border-t border-border">
                        <td className="px-4 py-3 font-medium text-primary">{value}</td>
                        <td className="px-4 py-3 text-muted-foreground">{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
              <Link href="/courses">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">Explore courses</Button>
              </Link>
              <Link href="/our-platform">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent">
                  Learning tools
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
