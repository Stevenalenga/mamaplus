import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import SEOHead from '@/components/seo-head'

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 lg:px-8">
      <SEOHead
        title="About MamaPlus - Building a Future Where Every Woman Can Thrive"
        description="Learn about the MamaPlus mission, vision, values, and ecosystem approach to dignified care work, health access, and inclusion."
        canonicalUrl="https://mamaplus.co.ke/about-us"
      />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-8">Building a Future Where Every Woman Can Thrive</h1>

        <section className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 relative h-72 rounded-xl overflow-hidden border border-border">
            <Image src="/mamaplus images/photoopp.jpeg" alt="MamaPlus community and partners group photo" fill className="object-cover" />
          </div>
          <div className="grid grid-rows-2 gap-4">
            <div className="relative h-34 rounded-xl overflow-hidden border border-border">
              <Image src="/mamaplus images/presentaton.jpeg" alt="MamaPlus presentation on childcare and caregiving" fill className="object-cover" />
            </div>
            <div className="relative h-34 rounded-xl overflow-hidden border border-border">
              <Image src="/mamaplusservices/totalnew.jpeg" alt="Caregiver community session at MamaPlus" fill className="object-cover" />
            </div>
          </div>
        </section>

        <section className="bg-white border border-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>MamaPlus started with a simple observation: the women who care for our families—mothers, childcare workers, domestic helpers—often lack access to the resources they need to care for themselves and build better futures.</p>
            <p>We saw mothers in Busia struggling to find trusted health information, domestic workers in Kakuma unable to access training or dignified work, placement agencies searching for vetted candidates, and women with disabilities excluded from digital solutions.</p>
            <p>Today, MamaPlus connects families to trusted caregivers, caregivers to dignified work and training, and partners to last-mile communities through a single inclusive platform.</p>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <section className="bg-white border border-border rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
            <p className="text-muted-foreground">To empower women across the care economy—mothers, caregivers, and workers—with the tools, training, and connections they need to thrive.</p>
          </section>
          <section className="bg-white border border-border rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
            <p className="text-muted-foreground">A world where every woman, regardless of location or education level, can access dignified work, health information, and community support.</p>
          </section>
        </div>

        <section className="bg-white border border-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-primary/5">
                <tr>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">What It Means</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Inclusion', 'We design for the most marginalized first, including women with disabilities and low-literacy users.'],
                  ['Dignity', 'Care work is real work. Every caregiver is a professional and every family is a partner.'],
                  ['Community', 'We build digital and physical spaces where women connect, learn, and grow together.'],
                  ['Resilience', 'From offline-first design to solar charging hubs, we meet users where they are.'],
                  ['Impact', 'We measure what matters: jobs created, skills gained, and health outcomes improved.'],
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

        <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
          <Link href="/contact"><Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent">View Careers</Button></Link>
          <Link href="/contact"><Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent">Contact Us</Button></Link>
        </div>
      </div>
    </div>
  )
}
