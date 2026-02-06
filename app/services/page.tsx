'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Award, Home, Briefcase, BookOpen, Heart } from 'lucide-react'

export default function ServicesPage() {
  const services = [
    {
      icon: Home,
      title: "Placement & Support for House Managers",
      description: "We connect families with trained, vetted House Managers and domestic workers and provide support before, during, and after placement.",
      features: [
        "Caregiver matching based on family needs",
        "Background checks and credential verification",
        "Interview and hiring support",
        "Ongoing check-ins and conflict-resolution support",
        "Guidance on contracts and fair employment practices"
      ],
      cta: "Find a House Manager"
    },
    {
      icon: BookOpen,
      title: "Training & Support for Caregivers",
      description: "We treat caregiving as a profession. MamaPlus provides certified training, mental health support, and access to job opportunities.",
      features: [
        "Certified training in child development, safety, and emotional care",
        "Skills training in feeding, hygiene, CPR, and educational play",
        "Soft-skills training: communication, professionalism, time management",
        "Mental health and wellbeing support",
        "Access to job opportunities through the MamaPlus platform"
        
      ],
      cta: "Explore Training"
    },
    {
      icon: Users,
      title: "Support Circles for Childcare Centres",
      description: "We strengthen community and informal childcare centres through training, quality standards, and peer support.",
      features: [
        "Staff training and certification programs",
        "Quality improvement tools and guidance",
        "Support circles and peer learning networks",
        "Increased trust and confidence from families",
        "Community-driven improvements"
      ],
      cta: "Join the Centre Network"
    },
    {
      icon: Briefcase,
      title: "Corporate Childcare Provision",
      description: "We help employers set up and manage childcare solutions that support productivity and employee wellbeing.",
      features: [
        "Customized childcare solutions for workplaces",
        "Access to trained caregivers and facilities",
        "Employee benefit coordination",
        "Quality assurance and compliance support",
        "Flexible scheduling and management"
      ],
      cta: "Partner With Us"
    },
    {
      icon: Heart,
      title: "Training & Support for Parents",
      description: "We support parents with guidance, tools, and community—because quality childcare works best when families are supported too.",
      features: [
        "Guidance on hiring and managing caregivers",
        "Workshops on child development and nurturing care",
        "Communication tools for working with domestic staff",
        "Parent check-ins and support groups",
        "Practical resources and community connection"
      ],
      cta: "Access Parent Resources"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
            Our <span className="text-secondary">Services</span>
          </h1>
          <p className="text-xl text-secondary font-semibold max-w-3xl mb-8">
            MamaPlus offers integrated services that support the entire childcare ecosystem—from families and caregivers to childcare centres and employers.
          </p>
        </div>
      </section>

      {/* How MamaPlus Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">How MamaPlus Works</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-primary mb-4">Digital Platform</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Our platform connects families, caregivers, centres, and employers—making it easier to find care, access training, and receive ongoing support.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Easy caregiver matching and placement</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Access to training programs and certifications</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Ongoing support and communication tools</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-primary mb-4">Training & Support Centres</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Our Training & Support Centres ensure caregivers and childcare providers meet clear standards for safety, learning, and wellbeing.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Practical, hands-on training programs</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Professional certification aligned to standards</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Ongoing mentorship and quality assurance</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Connection to local training services</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Integrated Services</h2>
          <div className="space-y-8">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 border border-border hover:border-primary/50 transition">
                <div className="flex items-start gap-6 mb-6">
                  <service.icon className="w-12 h-12 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{service.title}</h3>
                    <p className="text-lg text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">What's Included</h4>
                    <ul className="space-y-3">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex gap-3 text-muted-foreground">
                          <span className="text-primary font-bold">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white py-6">
                      {service.cta} <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Care Standards Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">How we Ensure Quality</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-primary mb-4">Our Care Standards</h3>
              <p className="text-muted-foreground mb-6">
                All caregivers and centres supported by MamaPlus follow clear care standards applied whether care happens in a home, centre, or workplace.
              </p>
              <ul className="space-y-3">
                {[
                  "Safe and child-friendly environments",
                  "Appropriate caregiver-to-child ratios",
                  "Structured routines for play, learning, and rest",
                  "Nutrition, hygiene, and health standards",
                  "Emergency preparedness and first aid"
                ].map((standard, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span className="text-foreground">{standard}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-secondary/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-primary mb-4">What Children Experience</h3>
              <p className="text-muted-foreground mb-6">
                Children in MamaPlus-supported care experience warm, nurturing environments designed for their development and wellbeing.
              </p>
              <ul className="space-y-3">
                {[
                  "Warm, responsive relationships with trained caregivers",
                  "Safe spaces to explore, learn, and grow",
                  "Play-based learning that supports development",
                  "Healthy routines and nutritious meals",
                  "Emotional security and sense of belonging"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* For Different Audiences */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Value Proposition</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-primary mb-4">For Families</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Childcare you can trust</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Caregivers who are trained and supported</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Clear expectations and standards</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Peace of mind to work and thrive</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-primary mb-4">For Caregivers</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Professional training and certification</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Job matching and placement support</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Ongoing mentorship and support</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Dignified, rewarding career path</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-primary mb-4">Placement Agencies</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Access to trained caregivers</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Clear quality standards and guidance</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Increased trust from families</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Shared commitment to child wellbeing</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-primary mb-4">For Corporates</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Access to quality childcare for staff</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Access to training courses</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you are a parent, caregiver, centre, or employer, MamaPlus is here to support you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6">
                Create an Account <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 text-lg px-8 py-6 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
