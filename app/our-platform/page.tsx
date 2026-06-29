import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import SEOHead from '@/components/seo-head'

export default function OurPlatformPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 lg:px-8">
      <SEOHead
        title="Our Platform - Inclusion, Resilience, and Impact"
        description="One platform with tailored experiences for families, caregivers, agencies, and partners. Built for inclusion and resilience."
        canonicalUrl="https://mamaplus.co.ke/our-platform"
      />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">One Platform. Multiple Users. Tailored Experiences.</h1>
        <p className="text-lg text-muted-foreground mb-10">Built for inclusion. Engineered for resilience.</p>

        <section className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 relative h-72 rounded-xl overflow-hidden border border-border">
            <Image src="/mamaplus images/platform-conference.jpeg" alt="Stakeholder engagement session using MamaPlus model" fill className="object-cover" />
          </div>
          <div className="grid grid-rows-2 gap-4">
            <div className="relative h-34 rounded-xl overflow-hidden border border-border">
              <Image src="/mamaplus images/platform-roundtable.jpeg" alt="Roundtable discussion and planning" fill className="object-cover" />
            </div>
            <div className="relative h-34 rounded-xl overflow-hidden border border-border">
              <Image src="/mamaplusservices/platform-community-training.jpeg" alt="Community-level training deployment" fill className="object-cover" />
            </div>
          </div>
        </section>

        <section className="bg-white border border-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Platform in Action</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative h-48 rounded-lg overflow-hidden border border-border">
              <Image src="/mamaplusservices/newsec.jpeg" alt="Caregiver training orientation" fill className="object-cover" />
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden border border-border">
              <Image src="/mamaplusservices/explain.jpeg" alt="Hands-on classroom facilitation" fill className="object-cover" />
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden border border-border">
              <Image src="/mamaplus images/growpep.jpeg" alt="Group workshop participation" fill className="object-cover" />
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden border border-border">
              <Image src="/mamaplus images/announcement.jpeg" alt="Community training announcement and meetup" fill className="object-cover" />
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden border border-border">
              <Image src="/mamaplus images/relate.jpeg" alt="Mentorship and peer support session" fill className="object-cover" />
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden border border-border">
              <Image src="/mamaplus images/photoopp.jpeg" alt="Network and partner collaboration moment" fill className="object-cover" />
            </div>
          </div>
        </section>

        <section className="bg-white border border-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">How the Platform Works</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-primary/5">
                <tr>
                  <th className="px-4 py-3">User Type</th>
                  <th className="px-4 py-3">Experience</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Families', 'Simple interface to find caregivers and access health tools. Verified profiles and direct connection.'],
                  ['Caregivers', 'Training modules, job matching, and peer support with audio and offline access. Free to join.'],
                  ['Agencies', 'Dashboard to manage placements, verify worker credentials, and track outcomes.'],
                  ['Partners', 'Data insights, program delivery tools, and last-mile distribution channels.'],
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

        <section className="bg-white border border-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Key Technical Features</h2>
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
                  ['Offline-First Architecture', 'Core content works without internet and syncs automatically when connectivity returns.'],
                  ['Accessibility by Design', 'Audio narration, simplified UI, and support for low digital confidence and diverse abilities.'],
                  ['Safety & Moderation', 'Female-only spaces with active moderation, reporting, and blocking tools.'],
                  ['Device-Lending Integration', 'Supports shared device use through community hubs with solar charging.'],
                  ['Multi-Language Support', 'Available in multiple languages with easy switching.'],
                  ['Analytics Dashboard', 'Real-time engagement and outcomes data for agencies and partners.'],
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

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <section className="bg-white border border-border rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">The MamaPlus Hub Model</h2>
            <p className="text-muted-foreground mb-3">In addition to the digital platform, MamaPlus operates physical hubs in underserved communities.</p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Device lending for training and job searching</li>
              <li>Solar charging for reliable access</li>
              <li>Peer meetups and in-person support sessions</li>
              <li>Trusted local hub hosts</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">Current locations: Busia, Kakuma (expanding)</p>
          </section>

          <section className="bg-white border border-border rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Security & Privacy</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>All user data encrypted</li>
              <li>Caregiver profiles shared only with verified families</li>
              <li>Partners receive anonymized, aggregated data unless consent is provided</li>
              <li>Co-designed community safety guidelines</li>
            </ul>
          </section>
        </div>

        <section className="bg-white border border-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Roadmap</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-primary/5">
                <tr>
                  <th className="px-4 py-3">Phase</th>
                  <th className="px-4 py-3">Timeline</th>
                  <th className="px-4 py-3">Features</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Phase 1', 'Complete', 'Core platform, caregiver profiles, family search, health content'],
                  ['Phase 2', 'Current', 'Agency dashboard, offline-first, audio narration, device-lending hubs'],
                  ['Phase 3', 'Q3 2024', 'Partner analytics, expanded training modules, additional languages'],
                  ['Phase 4', '2025', 'National expansion, tele-health integration, microfinance partnerships'],
                ].map(([phase, timeline, features]) => (
                  <tr key={phase} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-primary">{phase}</td>
                    <td className="px-4 py-3 text-foreground">{timeline}</td>
                    <td className="px-4 py-3 text-muted-foreground">{features}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
          <Link href="/contact"><Button className="w-full bg-primary hover:bg-primary/90 text-white">Platform Demo Video</Button></Link>
          <Link href="/contact"><Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent">Contact Our Tech Team</Button></Link>
        </div>
      </div>
    </div>
  )
}
