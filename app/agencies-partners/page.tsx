import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import SEOHead from '@/components/seo-head'

export default function AgenciesPartnersPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 lg:px-8">
      <SEOHead
        title="For Agencies & Partners - Workforce, Reach, and Impact"
        description="Partner with MamaPlus to access trained talent, deliver measurable programs, and reach underserved last-mile communities."
        canonicalUrl="https://mamaplus.co.ke/agencies-partners"
      />

      <div className="max-w-7xl mx-auto">
        <p className="text-sm text-muted-foreground mb-3">Serving placement agencies, healthcare organizations, employers, NGOs, government, and corporate partners</p>
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Build a Stronger Workforce. Reach Underserved Communities.</h1>
        <p className="text-lg text-muted-foreground max-w-4xl mb-10">MamaPlus partners with organizations to access trained talent, deliver impact, and reach last-mile communities.</p>

        <section className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 relative h-72 rounded-xl overflow-hidden border border-border">
            <Image src="/mamaplus images/platform-conference.jpeg" alt="Partners and stakeholders in a MamaPlus forum" fill className="object-cover" />
          </div>
          <div className="grid grid-rows-2 gap-4">
            <div className="relative h-34 rounded-xl overflow-hidden border border-border">
              <Image src="/mamaplus images/platform-roundtable.jpeg" alt="Agency roundtable and collaboration" fill className="object-cover" />
            </div>
            <div className="relative h-34 rounded-xl overflow-hidden border border-border">
              <Image src="/mamaplus images/photoopp.jpeg" alt="Partner networking and ecosystem engagement" fill className="object-cover" />
            </div>
          </div>
        </section>

        <section className="bg-white border border-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Who We Work With</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-primary/5">
                <tr>
                  <th className="px-4 py-3">Partner Type</th>
                  <th className="px-4 py-3">What We Offer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Placement Agencies', 'Access trained, vetted caregivers from last-mile communities and reduce recruitment costs.'],
                  ['Healthcare Organizations', 'Deliver maternal and child health information to women in hard-to-reach areas.'],
                  ['Employers & Corporates', 'Offer employee childcare and wellness programs and source trained domestic workers.'],
                  ['NGOs & Government', 'Implement programs with measurable impact and track outcomes through platform tools.'],
                  ['Training Institutions', 'Certify graduates through MamaPlus and connect them to employment opportunities.'],
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

        <section className="bg-white border border-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Partnership Models</h2>
          <div className="space-y-4 text-muted-foreground">
            <div><p className="font-semibold text-foreground">1. Talent Pipeline Partnership</p><p>We train caregivers in last-mile communities while you access a steady pipeline of vetted, job-ready candidates.</p></div>
            <div><p className="font-semibold text-foreground">2. Program Delivery Partnership</p><p>We deliver your program goals through our platform and community reach, with tracking and reporting built in.</p></div>
            <div><p className="font-semibold text-foreground">3. Corporate Childcare & Wellness Partnership</p><p>Offer employees childcare placement and maternal health resources as part of wellness packages.</p></div>
            <div><p className="font-semibold text-foreground">4. Last-Mile Distribution</p><p>Reach customers and beneficiaries in underserved communities through trusted hubs and local networks.</p></div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <section className="bg-white border border-border rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Why Partner With Us</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Verified reach into rural and refugee communities</li>
              <li>Trained workforce ready for placement</li>
              <li>Data and insights on needs and outcomes</li>
              <li>Offline-first technology for low-connectivity contexts</li>
              <li>Deep community trust and relationships</li>
            </ul>
          </section>

          <section className="bg-white border border-border rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Case Study: Placement Agency Partnership</h2>
            <p className="text-muted-foreground mb-2"><span className="font-semibold text-foreground">Challenge:</span> A Nairobi-based placement agency struggled to find trained domestic workers from outside the city.</p>
            <p className="text-muted-foreground mb-2"><span className="font-semibold text-foreground">Solution:</span> MamaPlus trained 200 women in Busia and Kakuma in childcare, digital literacy, and workplace professionalism.</p>
            <p className="text-muted-foreground"><span className="font-semibold text-foreground">Outcome:</span> The agency filled 85 placements in 12 months and improved retention rates by 40%.</p>
          </section>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
          <Link href="/contact"><Button className="w-full bg-primary hover:bg-primary/90 text-white">Become a Partner</Button></Link>
          <Link href="/contact"><Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent">Download Partnership Deck</Button></Link>
        </div>
      </div>
    </div>
  )
}
