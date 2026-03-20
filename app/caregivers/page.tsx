import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import SEOHead from '@/components/seo-head'

export default function CaregiversPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 lg:px-8">
      <SEOHead
        title="For Caregivers - Dignified Work, Training, and Community"
        description="Join MamaPlus to find dignified work, access training and health resources, and connect with a supportive caregiver community."
        canonicalUrl="https://mamaplus.co.ke/caregivers"
      />

      <div className="max-w-7xl mx-auto">
        <p className="text-sm text-muted-foreground mb-3">Serving childcare workers, domestic workers, nannies, house helps, and mothers seeking additional income</p>
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Find Dignified Work. Build Your Skills. Join a Community.</h1>
        <p className="text-lg text-muted-foreground max-w-4xl mb-10">Whether you are a childcare worker, a domestic helper, or a mother seeking additional income, MamaPlus helps you access opportunities, training, and support.</p>

        <section className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="relative h-72 rounded-xl overflow-hidden border border-border">
            <Image src="/mamaplusservices/newsec.jpeg" alt="Caregiver training presentation" fill className="object-cover" />
          </div>
          <div className="relative h-72 rounded-xl overflow-hidden border border-border">
            <Image src="/mamaplusservices/totalnew.jpeg" alt="Community workshop for caregivers" fill className="object-cover" />
          </div>
          <div className="relative h-72 rounded-xl overflow-hidden border border-border">
            <Image src="/mamaplus images/signup.jpeg" alt="Caregiver onboarding and skills class" fill className="object-cover" />
          </div>
        </section>

        <section className="bg-white border border-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">What Caregivers Can Do on MamaPlus</h2>
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
                  ['Find Work', 'Get matched with families seeking your skills. Create a profile that showcases your experience and availability.'],
                  ['Training', 'Access digital literacy, health and safety, childcare, and entrepreneurship modules with audio narration.'],
                  ['Peer Support', 'Join moderated, female-only groups to connect with other caregivers and access shared resources.'],
                  ['Health Access', 'Access maternal health information, referrals, and wellness content through the platform.'],
                  ['Works Offline', 'Download training and content when you have signal, then access anytime without internet.'],
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
            <h2 className="text-2xl font-semibold mb-4">How It Works for Caregivers</h2>
            <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
              <li>Create your free profile and showcase your experience and skills.</li>
              <li>Complete free training modules to boost your credentials.</li>
              <li>Get matched with families seeking your services.</li>
              <li>Connect, interview, and start working.</li>
            </ol>
          </section>

          <section className="bg-white border border-border rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Why Join MamaPlus as a Caregiver?</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Free to join</li>
              <li>Access to practical training</li>
              <li>Vetted families</li>
              <li>Peer community support</li>
              <li>Health resources and referrals</li>
              <li>Offline access</li>
            </ul>
          </section>
        </div>

        <section className="bg-white border border-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Training Modules Available</h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-muted-foreground list-disc list-inside">
            <li>Digital Literacy</li>
            <li>Accelerate Childcare Worker Practice (Ages 0-5)</li>
            <li>Health & Hygiene</li>
            <li>First Aid Essentials</li>
            <li>Communication with Employers</li>
            <li>Financial Literacy & Saving</li>
            <li>Entrepreneurship</li>
            <li>Audio format and multiple languages</li>
          </ul>
        </section>

        <blockquote className="bg-white border border-border rounded-xl p-6 mb-8">
          <p className="text-lg text-foreground mb-3">“I started as a domestic worker. Through MamaPlus training, I learned digital skills and now I also teach other women in my community. I earn more and I'm respected more.”</p>
          <footer className="text-sm text-muted-foreground">— Grace, Caregiver and Trainer, Kakuma</footer>
        </blockquote>

        <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
          <Link href="/signup"><Button className="w-full bg-primary hover:bg-primary/90 text-white">Create Your Caregiver Profile — Free</Button></Link>
          <Link href="/courses"><Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent">Explore Training</Button></Link>
        </div>
      </div>
    </div>
  )
}
