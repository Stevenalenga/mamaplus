'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Handshake, ShieldCheck, Users } from 'lucide-react'
import SEOHead from '@/components/seo-head'

export default function LandingPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'MamaPlus Platform - Connecting Families, Caregivers, and Communities',
    description: 'MamaPlus is an offline-first, digitally enabled childcare training and service platform for families, caregivers, agencies, and partners.',
    url: 'https://mamaplus.co.ke',
  }

  const visualHighlights = [
    {
      src: '/mamaplusservices/explain.jpeg',
      alt: 'MamaPlus facilitators delivering caregiver training',
      caption: 'Digital + Community-Based Training',
    },
    {
      src: '/mamaplusservices/newsec.jpeg',
      alt: 'Caregiver classroom session with trainer',
      caption: 'Practical Skills for Real Work',
    },
    {
      src: '/mamaplusservices/crowd.jpeg',
      alt: 'Women participating in MamaPlus community learning',
      caption: 'Women-Centered Ecosystem',
    },
  ]

  const featuredCourses = [
    {
      title: 'Accelerate Childcare Worker Practice (0-5 years)',
      description: 'Hands-on childcare fundamentals focused on safety, stimulation, and daily routines for ages 0-5.',
      image: '/mamaplus images/education.jpeg',
      level: 'Foundational',
    },
    {
      title: 'Health, Hygiene & First Aid Essentials',
      description: 'Core caregiver health protocols, emergency response basics, and preventive hygiene practices.',
      image: '/mamaplusservices/platform-community-training.jpeg',
      level: 'Practical',
    },
    {
      title: 'Digital Literacy & Financial Readiness',
      description: 'Smartphone confidence, safer online behavior, communication, and money-management basics.',
      image: '/mamaplusservices/totalnew.jpeg',
      level: 'Career Growth',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <SEOHead
        title="MamaPlus Platform - Connecting Families, Caregivers, and Communities"
        description="Offline-first childcare training and service platform for low-connectivity urban and peri-urban contexts."
        keywords={[
          'offline-first childcare platform',
          'families caregivers agencies',
          'caregiver training kenya',
          'maternal health and parenting tools',
          'vetted caregiver profiles',
          'last-mile workforce development',
        ]}
        canonicalUrl="https://mamaplus.co.ke"
        schema={pageSchema}
      />

      <section className="pt-24 pb-12 px-4 md:pt-32 md:pb-20 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="inline-flex items-center rounded-full border border-border px-4 py-1 text-sm text-muted-foreground mb-6">
                Offline-First, Digitally Enabled Platform
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-primary leading-tight mb-6">
                Connecting Families, Caregivers, and Communities
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8">
                MamaPlus is an offline-first, digitally enabled childcare training and service platform designed for low-connectivity urban and peri-urban contexts. For families seeking trusted support. For caregivers seeking dignified work. For agencies seeking vetted talent. And for partners seeking last-mile reach.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <Link href="/families">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white py-5">Find a Caregiver</Button>
                </Link>
                <Link href="/caregivers">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white py-5">Join as a Caregiver</Button>
                </Link>
                <Link href="/agencies-partners">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 py-5 bg-transparent">Partner With Us</Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 relative h-60 md:h-72 rounded-2xl overflow-hidden shadow-lg">
                <Image src={visualHighlights[0].src} alt={visualHighlights[0].alt} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <p className="absolute left-4 bottom-4 text-white font-semibold">{visualHighlights[0].caption}</p>
              </div>
              <div className="relative h-40 rounded-xl overflow-hidden shadow">
                <Image src={visualHighlights[1].src} alt={visualHighlights[1].alt} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <p className="absolute left-3 bottom-3 text-white text-sm font-medium">{visualHighlights[1].caption}</p>
              </div>
              <div className="relative h-40 rounded-xl overflow-hidden shadow">
                <Image src={visualHighlights[2].src} alt={visualHighlights[2].alt} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <p className="absolute left-3 bottom-3 text-white text-sm font-medium">{visualHighlights[2].caption}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">Featured Courses & Learning Paths</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <article key={course.title} className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="relative h-44">
                  <Image src={course.image} alt={course.title} fill className="object-cover" />
                </div>
                <div className="p-5">
                  <p className="text-xs text-primary font-semibold mb-2">{course.level}</p>
                  <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                  <Link href="/courses" className="inline-flex items-center text-primary font-medium hover:underline">
                    View Course Details <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/courses">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">Explore All Courses</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-xl font-semibold text-primary mb-3">For Families</h3>
            <p className="text-muted-foreground mb-5">Find trusted childcare services, childcare workers and domestic help. Access maternal health information and parenting support—all in one place.</p>
            <Link href="/families" className="inline-flex items-center text-primary font-medium hover:underline">Learn More <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </div>
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-xl font-semibold text-primary mb-3">For Caregivers</h3>
            <p className="text-muted-foreground mb-5">Find dignified work opportunities. Access training, health information, and a community of peers. Build your skills and your future.</p>
            <Link href="/caregivers" className="inline-flex items-center text-primary font-medium hover:underline">Learn More <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </div>
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-xl font-semibold text-primary mb-3">For Agencies & Partners</h3>
            <p className="text-muted-foreground mb-5">Find vetted talent for placement. Reach last-mile communities. Partner with us for workforce development, data insights, and impact.</p>
            <Link href="/agencies-partners" className="inline-flex items-center text-primary font-medium hover:underline">Learn More <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">One Platform. Three Audiences. Tailored Experiences.</h2>
            <p className="text-muted-foreground">How the MamaPlus platform works</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-border rounded-xl p-6">
              <Users className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Step 1: We Onboard the Ecosystem</h3>
              <p className="text-muted-foreground">We onboard families seeking care, caregivers seeking work, and agencies seeking talent. Each user gets a tailored experience—health content for mothers, job matching for caregivers, placement tools for agencies.</p>
            </div>
            <div className="bg-white border border-border rounded-xl p-6">
              <ShieldCheck className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Step 2: We Build Trust & Skills</h3>
              <p className="text-muted-foreground">Caregivers access digital literacy training, health education, and moderated peer groups. Families access verified profiles and health resources. Trust is built through transparency and community.</p>
            </div>
            <div className="bg-white border border-border rounded-xl p-6">
              <Handshake className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Step 3: We Connect & Empower</h3>
              <p className="text-muted-foreground">We connect caregivers to placement opportunities. We connect families to vetted support. We connect agencies and corporate partners to a trained, empowered workforce—even in last-mile communities.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8 bg-white/60">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-10">Platform Features Snapshot</h2>
          <div className="overflow-x-auto bg-white border border-border rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-primary/5">
                <tr>
                  <th className="px-5 py-4 font-semibold">Feature</th>
                  <th className="px-5 py-4 font-semibold">What It Means for Users</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Offline-First', 'Access content without internet. Syncs when connection returns.'],
                  ['Audio Narration', 'Every module available in audio—for low-literacy users and women with disabilities.'],
                  ['Female-Only Spaces', 'Moderated peer groups where women connect safely.'],
                  ['Device-Lending Hubs', 'Borrow phones and charge via solar at MamaPlus community hubs.'],
                  ['Verified Profiles', 'All caregivers vetted. All families verified.'],
                ].map(([feature, details]) => (
                  <tr key={feature} className="border-t border-border">
                    <td className="px-5 py-4 font-medium text-primary">{feature}</td>
                    <td className="px-5 py-4 text-muted-foreground">{details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
          <blockquote className="bg-white border border-border rounded-xl p-6">
            <p className="text-lg text-foreground mb-4">“MamaPlus helped me find work as a domestic worker. I also use the health information to care for my own child. It changed my life.”</p>
            <footer className="text-sm text-muted-foreground">— Akinyi, Caregiver, Busia</footer>
          </blockquote>
          <blockquote className="bg-white border border-border rounded-xl p-6">
            <p className="text-lg text-foreground mb-4">“We partner with MamaPlus to source trained, vetted caregivers for our placement agency. The quality is consistent, and the reach into rural communities is unmatched.”</p>
            <footer className="text-sm text-muted-foreground">— James, Placement Agency Director, Nairobi</footer>
          </blockquote>
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8 bg-primary/5">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Join the MamaPlus Ecosystem Today</h2>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="text-xl font-semibold mb-2">Families</h3>
              <p className="text-muted-foreground mb-5">Find trusted care for your loved ones.</p>
              <Link href="/families"><Button className="w-full bg-primary hover:bg-primary/90 text-white">Find Care</Button></Link>
            </div>
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="text-xl font-semibold mb-2">Caregivers</h3>
              <p className="text-muted-foreground mb-5">Find dignified work and build your skills.</p>
              <Link href="/caregivers"><Button className="w-full bg-primary hover:bg-primary/90 text-white">Apply Now</Button></Link>
            </div>
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="text-xl font-semibold mb-2">Agencies</h3>
              <p className="text-muted-foreground mb-5">Partner with us to build a stronger workforce.</p>
              <Link href="/contact"><Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent">Contact Us</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          {[
            'Works offline in low-connectivity contexts',
            'Built for inclusion and accessibility',
            'Supports families, caregivers, agencies, and partners',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
