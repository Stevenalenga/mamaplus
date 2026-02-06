'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
                Quality <span className="text-secondary">Childcare</span> Families Can Trust
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                MamaPlus supports families by ensuring children receive safe, nurturing, and high-quality childcare—at home, in centres, or near the workplace. Through professional training, ongoing support, and clear standards, we strengthen quality care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/services">
                  <Button className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6 w-full sm:w-auto">
                    Find Childcare <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 text-lg px-8 py-6 w-full sm:w-auto bg-transparent">
                    Create an Account
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <Users className="w-20 h-20 text-primary mx-auto mb-4" />
                <p className="text-primary font-semibold text-lg">Trusted Childcare Platform</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training & Support Centers Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">The MamaPlus Training & Support Centres</h2>
            <p className="text-xl text-secondary font-semibold max-w-2xl mx-auto">
              Where Quality Childcare Begins
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 border border-border mb-12">
            <p className="text-lg text-foreground mb-6">
              The MamaPlus Training & Support Centres are the backbone of our childcare model. They ensure that every caregiver and childcare provider in our network meets clear, child-centred standards.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">What We Provide</h3>
                <ul className="space-y-3">
                  {[
                    "Practical, hands-on caregiver training",
                    "Certification aligned to care standards",
                    "Ongoing mentorship and support",
                    "Guidance on child safety, learning, nutrition, and wellbeing"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1 fill-primary/20" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Our Impact</h3>
                <p className="text-muted-foreground mb-4">
                  Working with county governments, national institutions, and regional partners across Africa, MamaPlus aligns childcare standards across homes, centres, and workplaces.
                </p>
                <Link href="/services">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Learn About Our Standards
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services for Families Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">Our Services</h2>
            <p className="text-xl text-secondary font-semibold">Integrated support across the entire childcare ecosystem</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "For Families",
                description: "Childcare You Can Trust",
                items: [
                  "Caregivers trained in child safety and development",
                  "Clean, safe, regularly supported care environments",
                  "Age-appropriate routines for play, learning, and rest",
                  "Support for children's health, nutrition, and wellbeing"
                ]
              },
              {
                title: "For Caregivers",
                description: "Professional Training & Career Support",
                items: [
                  "Certified training in child development and safety",
                  "Skills training in feeding, hygiene, CPR, and play",
                  "Soft-skills and professional development",
                  "Mental health support and job opportunities"
                ]
              },
              {
                title: "For Childcare Centres",
                description: "Quality Support & Peer Learning",
                items: [
                  "Staff training and certification programs",
                  "Quality improvement tools and guidance",
                  "Support circles and peer learning networks",
                  "Increased family trust and confidence"
                ]
              },
              {
                title: "For Parents",
                description: "Guidance & Community Support",
                items: [
                  "Guidance on hiring and managing caregivers",
                  "Workshops on child development",
                  "Communication tools and resources",
                  "Parent check-ins, support groups, and community"
                ]
              }
            ].map((service, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 border border-border hover:border-primary/50 transition">
                <h3 className="text-2xl font-bold text-primary mb-2">{service.title}</h3>
                <p className="text-lg font-semibold text-foreground mb-6">{service.description}</p>
                <ul className="space-y-3">
                  {service.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1 fill-primary/20" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-primary mb-6">Ready to Advance Your Career?</h2>
          <p className="text-xl text-secondary font-semibold mb-8 max-w-2xl mx-auto">
            Join thousands of caregivers building better futures for families
          </p>
          <Link href="/signup">
            <Button className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6">
              Create Your Account <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}
