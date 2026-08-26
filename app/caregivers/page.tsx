import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/page-hero'
import { PhotoFigure } from '@/components/photo-figure'
import { AnimatedSection } from '@/components/animated-section'
import SEOHead from '@/components/seo-head'

export default function CaregiversPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <SEOHead
        title="For Caregivers - Professional Training and Credentials"
        description="Join MamaPlus to train as a professional caregiver. Build skills, earn credentials, and practise childcare with a supportive learning community."
        canonicalUrl="https://mamaplus.co.ke/caregivers"
      />

      <PageHero
        kicker="For caregivers"
        title="Train as a professional. Practise with support."
        intro="Childcare workers, domestic workers, nannies, and house managers can build a recognised skill set in child development, safety, and care—then apply it with families and centres."
        photo={{
          src: '/mamaplusservices/newsec.jpeg',
          alt: 'Caregiver training presentation',
          caption: 'Caregivers in a professional training session',
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/courses">
            <Button className="bg-primary hover:bg-primary/90 text-white">Explore training</Button>
          </Link>
          <Link href="/learn">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
              Learning paths
            </Button>
          </Link>
        </div>
      </PageHero>

      <section className="px-4 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            {
              src: '/mamaplusservices/totalnew.jpeg',
              alt: 'Community workshop for caregivers',
              caption: 'Workshops that turn theory into practice',
            },
            {
              src: '/mamaplus images/signup.jpeg',
              alt: 'Caregiver skills class',
              caption: 'Skills classes in child development and safety',
            },
            {
              src: '/mamaplusservices/excel.jpeg',
              alt: 'Learners reviewing training materials',
              caption: 'Materials designed for real care settings',
            },
          ].map((photo, index) => (
            <AnimatedSection key={photo.src} delay={index * 70}>
              <PhotoFigure {...photo} heightClassName="h-56" />
            </AnimatedSection>
          ))}
        </div>
      </section>

      <section className="px-4 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <AnimatedSection>
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">What caregivers learn</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-primary/5">
                    <tr>
                      <th className="px-4 py-3">Focus</th>
                      <th className="px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Certified training', 'Child development, safety, emotional care, feeding, hygiene, CPR, and educational play.'],
                      ['Professional practice', 'Communication, time management, and working in partnership with families.'],
                      ['Peer support', 'Learn with other caregivers and stay connected after certification.'],
                      ['Pathways after class', 'Apply skills with families and centres; work opportunities follow training.'],
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
                  <li>Choose a course that matches your experience.</li>
                  <li>Train in centres, community sessions, or guided modules.</li>
                  <li>Complete assessment and earn your credentials.</li>
                  <li>Practise with support—and connect to work when you are ready.</li>
                </ol>
              </section>
            </AnimatedSection>
            <AnimatedSection delay={80}>
              <section className="bg-white border border-border rounded-2xl p-6 h-full">
                <h2 className="text-2xl font-semibold mb-4">Training modules</h2>
                <ul className="grid sm:grid-cols-2 gap-2 text-muted-foreground list-disc list-inside">
                  <li>Digital literacy</li>
                  <li>Childcare practice (ages 0–5)</li>
                  <li>Health and hygiene</li>
                  <li>First aid essentials</li>
                  <li>Communication with families</li>
                  <li>Financial literacy</li>
                </ul>
              </section>
            </AnimatedSection>
          </div>

          <AnimatedSection>
            <blockquote className="bg-white border border-border rounded-2xl p-6">
              <p className="text-lg text-foreground mb-3">
                “I started as a domestic worker. Through MamaPlus training, I learned digital skills and now I also teach other women in my community. I earn more and I&apos;m respected more.”
              </p>
              <footer className="text-sm text-muted-foreground">— Grace, caregiver and trainer, Kakuma</footer>
            </blockquote>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
