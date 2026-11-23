import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/page-hero'
import { PhotoFigure } from '@/components/photo-figure'
import { AnimatedSection } from '@/components/animated-section'
import SEOHead from '@/components/seo-head'
import { ApkDownloadButton } from '@/components/apk-download-button'

export default function OurPlatformPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <SEOHead
        title="Learning Tools - The MamaPlus Platform"
        description="MamaPlus learning tools support classroom training with offline access, audio lessons, and community hubs so caregivers can keep practising after class."
        canonicalUrl="https://mamaplus.co.ke/our-platform"
      />

      <PageHero
        kicker="Learning tools"
        title="Tools that keep training going after class"
        intro="The MamaPlus platform extends the classroom: offline lessons, audio narration, and community hubs so learners can practise skills even with limited connectivity."
        photo={{
          src: '/mamaplusservices/platform-community-training.jpeg',
          alt: 'Community training using MamaPlus learning tools',
          caption: 'Community hubs that host training and device access',
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/learn">
            <Button className="bg-primary hover:bg-primary/90 text-white">Go to Learn</Button>
          </Link>
          <ApkDownloadButton variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent" />
        </div>
      </PageHero>

      <section className="px-4 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { src: '/mamaplusservices/newsec.jpeg', alt: 'Caregiver training orientation', caption: 'Orientation before a training cohort' },
            { src: '/mamaplusservices/explain.jpeg', alt: 'Hands-on classroom facilitation', caption: 'Facilitation that learners can revisit offline' },
            { src: '/mamaplus images/growpep.jpeg', alt: 'Group workshop participation', caption: 'Group practice in child-development skills' },
            { src: '/mamaplus images/announcement.jpeg', alt: 'Community training meetup', caption: 'Community meetups after class' },
            { src: '/mamaplus images/relate.jpeg', alt: 'Mentorship session', caption: 'Mentorship that continues on the platform' },
            { src: '/mamaplus images/platform-conference.jpeg', alt: 'Stakeholder session on learning tools', caption: 'Partners reviewing learning tools' },
          ].map((photo, index) => (
            <AnimatedSection key={photo.src} delay={index * 50}>
              <PhotoFigure {...photo} heightClassName="h-48" />
            </AnimatedSection>
          ))}
        </div>
      </section>

      <section className="px-4 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <AnimatedSection>
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">How the tools support each learner</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-primary/5">
                    <tr>
                      <th className="px-4 py-3">Learner</th>
                      <th className="px-4 py-3">Experience</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Families', 'Parent resources, workshops, and a clear view of the skills trained caregivers practise.'],
                      ['Caregivers', 'Training modules, audio lessons, and peer support—with offline access. Free to join.'],
                      ['Agencies', 'Credentials, cohort tracking, and a trained talent pipeline.'],
                      ['Partners', 'Programme delivery tools and outcomes data on skills gained.'],
                    ].map(([type, experience]) => (
                      <tr key={type} className="border-t border-border">
                        <td className="px-4 py-3 font-medium text-primary">{type}</td>
                        <td className="px-4 py-3 text-muted-foreground">{experience}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </AnimatedSection>

          <AnimatedSection>
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Key learning features</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-primary/5">
                    <tr>
                      <th className="px-4 py-3">Feature</th>
                      <th className="px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Offline-first lessons', 'Core content works without internet and syncs when connectivity returns.'],
                      ['Accessibility', 'Audio narration, simplified UI, and support for low digital confidence.'],
                      ['Hub access', 'Shared devices and solar charging in community training hubs.'],
                      ['Languages', 'Multiple languages with easy switching.'],
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

          <AnimatedSection>
            <div className="grid md:grid-cols-2 gap-6">
              <section className="bg-white border border-border rounded-2xl p-6">
                <h2 className="text-2xl font-semibold mb-4">The hub model</h2>
                <p className="text-muted-foreground mb-3">Physical hubs host training, device lending, and peer meetups in underserved communities.</p>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                  <li>Device lending for training</li>
                  <li>Solar charging for reliable access</li>
                  <li>In-person practice sessions</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">Current locations: Busia, Kakuma (expanding)</p>
              </section>
              <section className="bg-white border border-border rounded-2xl p-6">
                <h2 className="text-2xl font-semibold mb-4">Privacy in learning</h2>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                  <li>User data encrypted</li>
                  <li>Learner profiles shared only with verified partners where needed</li>
                  <li>Aggregated training outcomes for programme reporting</li>
                </ul>
              </section>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
              <Link href="/contact">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">Request a walkthrough</Button>
              </Link>
              <Link href="/about-us">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent">
                  About MamaPlus
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
