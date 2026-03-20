import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import SEOHead from '@/components/seo-head'

export default function FamiliesPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 lg:px-8">
      <SEOHead
        title="For Families - Trusted Care and Health Information"
        description="Find trusted childcare workers and domestic help, and access maternal and parenting health tools on MamaPlus."
        canonicalUrl="https://mamaplus.co.ke/families"
      />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Trusted Care. Trusted Information. All in One Place.</h1>
        <p className="text-lg text-muted-foreground max-w-4xl mb-10">Whether you need a childcare worker, domestic help, or reliable health information for your pregnancy and parenting journey—MamaPlus brings it all together.</p>

        <section className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 relative h-72 rounded-xl overflow-hidden border border-border">
            <Image src="/mamaplusservices/crowd2.jpeg" alt="Families and caregivers in a support session" fill className="object-cover" />
          </div>
          <div className="grid grid-rows-2 gap-4">
            <div className="relative h-34 rounded-xl overflow-hidden border border-border">
              <Image src="/mamaplus images/education.jpeg" alt="Caregiver-led learning in childcare setting" fill className="object-cover" />
            </div>
            <div className="relative h-34 rounded-xl overflow-hidden border border-border">
              <Image src="/mamaplusservices/explain.jpeg" alt="MamaPlus facilitator explaining childcare guidance" fill className="object-cover" />
            </div>
          </div>
        </section>

        <section className="bg-white border border-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">What Families Can Do on MamaPlus</h2>
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
                  ['Find Caregivers', 'Browse profiles of trained, vetted childcare workers and domestic helpers in your area. View experience, skills, and reviews.'],
                  ['Health & Parenting Tools', 'Access pregnancy, postnatal, and child health information—online or offline. Audio narration available.'],
                  ['Peace of Mind', 'All caregivers on the platform have completed MamaPlus training and participate in ongoing peer support.'],
                  ['Direct Booking', 'Connect with caregivers directly through the platform. No middlemen. No hidden fees.'],
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
            <h2 className="text-2xl font-semibold mb-4">How It Works for Families</h2>
            <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
              <li>Create a free family profile.</li>
              <li>Browse caregiver profiles in your area.</li>
              <li>Connect, interview, and hire directly.</li>
            </ol>
          </section>

          <section className="bg-white border border-border rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Why Families Trust MamaPlus</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Verified caregivers with training credentials and references</li>
              <li>Expert-reviewed maternal and child health resources</li>
              <li>Moderated community support for parents</li>
              <li>Offline access for low-connectivity environments</li>
            </ul>
          </section>
        </div>

        <section className="bg-white border border-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-primary/5">
                <tr>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Cost</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Family Profile Creation', 'Free'],
                  ['Browse Caregivers', 'Free'],
                  ['Connect with Caregivers', 'Free'],
                  ['Placement fees apply only when you hire', 'Contact for details'],
                ].map(([service, cost]) => (
                  <tr key={service} className="border-t border-border">
                    <td className="px-4 py-3 text-foreground">{service}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
          <Link href="/signup"><Button className="w-full bg-primary hover:bg-primary/90 text-white">Create Your Family Account</Button></Link>
          <Link href="/courses"><Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent">Browse Caregivers Now</Button></Link>
        </div>
      </div>
    </div>
  )
}
