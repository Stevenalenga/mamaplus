'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, Users, DollarSign } from 'lucide-react'

export default function CoursesPage() {
  const courses = [
    {
      id: 1,
      title: "Regional Child Safeguarding & Protection Training",
      duration: "3 Days",
      dates: "13th – 15th May 2026",
      location: "Nairobi",
      cost: "$800",
      audience: ["Child protection officers", "Children's rights advocates", "Policymakers and administrators", "Caregivers and parents"],
      overview: "Strengthen your child safeguarding knowledge and skills. Learn to identify risks, protect children, and implement effective safeguarding systems in homes, centres, and communities.",
      objectives: [
        "Understand principles of safeguarding and protection",
        "Identify child risks and vulnerabilities",
        "Implement practical child protection measures",
        "Design monitoring and response systems"
      ],
      benefits: [
        "Practical knowledge of child protection frameworks",
        "Enhanced skills to safeguard children",
        "Ability to develop and implement child protection policies",
        "Network with other protection professionals"
      ],
      includes: "Tuition, lunches, teas, facilitation, materials (excludes travel/accommodation)",
      scholarship: "Scholarships of up to 20% available for early registration before 30th March 2026"
    },
    {
      id: 2,
      title: "15-Day Accelerated Childcare Worker Training Course",
      duration: "15 Days",
      dates: "Flexible schedule, including weekends",
      location: "TBD",
      cost: "KES 1,000 per day",
      audience: ["Experienced childcare workers", "Childcare micro-entrepreneurs", "Domestic workers without formal training"],
      overview: "This intensive 15-day training equips childcare workers with practical skills to deliver safe, nurturing, and high-quality care. Participants gain hands-on experience, professional knowledge, and leadership skills needed to excel in childcare homes, centres, or entrepreneurial ventures.",
      objectives: [
        "Foundations of Childcare – Health, hygiene, child safety, and basic development",
        "Child Growth & Development – Supporting milestones, play, and early learning",
        "Professional Skills – Leadership, centre management, entrepreneurship",
        "Specialized Skills – Inclusive childcare, climate-resilient practices, safeguarding",
        "Parenting & Self-Care – Supporting families while maintaining caregiver wellbeing"
      ],
      benefits: [
        "Practical, hands-on skills to deliver quality childcare",
        "Strengthen your career and business opportunities",
        "Learn to manage children with diverse needs safely",
        "Develop leadership, entrepreneurship, and professional growth skills",
        "Flexible learning that accommodates working schedules"
      ],
      includes: "Interactive workshops, practical demonstrations, group discussions, scenario-based exercises, certificate of completion, mentorship support"
    },
    {
      id: 3,
      title: "Disability & Inclusion in Early Childhood Care, Education and Development",
      duration: "2 Days",
      dates: "Ongoing, demand-driven",
      location: "TBD",
      cost: "Contact for pricing",
      audience: ["Teachers", "Childcare Workers", "Development Professionals"],
      overview: "Learn to create inclusive, accessible, and safe childcare environments for children with diverse needs. This course equips staff to support children with disabilities while strengthening centre operations.",
      objectives: [
        "Understand disability rights and inclusion principles",
        "Identify and accommodate diverse learning needs",
        "Strengthen communication and teamwork",
        "Implement inclusion-focused improvements in childcare operations"
      ],
      benefits: [
        "Safer, more inclusive childcare environments",
        "Enhanced teamwork and staff engagement",
        "Increased centre reputation and trust",
        "Personal inclusion and professional development plan",
        "Operational improvement plan for your centre"
      ],
      includes: "Training materials, personal development plan, operational improvement plan, clear systems for communication and documentation"
    },
    {
      id: 4,
      title: "Leadership & Management for Childcare Workers",
      duration: "2 Days",
      dates: "Ongoing, Demand-Driven",
      location: "TBD",
      cost: "KES 2,500",
      audience: ["Childcare workers", "Centre managers", "Supervisors"],
      overview: "Build leadership, management, and operational skills to lead teams, improve childcare operations, and drive sustainable growth.",
      objectives: [
        "Understand effective leadership in childcare",
        "Strengthen team communication and engagement",
        "Apply management principles to daily operations",
        "Plan and sustain improvements in centres"
      ],
      benefits: [
        "Improved leadership and management capacity",
        "Enhanced quality and safety standards",
        "Stronger teamwork and staff engagement",
        "Sustainable growth for childcare centres",
        "Personal leadership improvement plan"
      ],
      includes: "Leadership training, management tools, personal leadership improvement plan, centre operational improvement plan"
    },
    {
      id: 5,
      title: "Climate Change & Environmental Management",
      duration: "1 Day",
      dates: "Ongoing and Demand-driven",
      location: "TBD",
      cost: "KES 1,500",
      audience: ["Childcare workers", "Centre managers", "Home-based providers"],
      overview: "Understand climate risks and their impact on children, and learn to create resilient, safe, and sustainable childcare environments.",
      objectives: [
        "Understand climate change effects on children's health, safety, and development",
        "Assess vulnerabilities in childcare centres",
        "Design climate-resilient spaces (shade, ventilation, safe play areas)",
        "Lead centre-wide sustainability initiatives"
      ],
      benefits: [
        "Increased staff climate awareness",
        "Safer, resilient childcare environments",
        "Stronger ability to protect children from environmental risks",
        "Completed centre climate risk assessment",
        "Updated emergency procedures and practical resilience plans"
      ],
      includes: "Climate risk assessment, emergency procedure updates, practical resilience planning, sustainability resources"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
            Build Skills, Lead <span className="text-secondary">Change</span>, Protect Children
          </h1>
          <p className="text-xl text-secondary font-semibold max-w-3xl mb-8">
            MamaPlus Training & Support Centre offers practical, interactive courses to equip childcare workers, centre staff, and parents with the knowledge and skills to deliver high-quality, safe, and sustainable childcare.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6">
                Sign In to Access Courses <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/partner">
              <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 text-lg px-8 py-6 bg-transparent">
                Contact MamaPlus for More Info
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Courses List */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border border-border overflow-hidden hover:border-primary/50 transition">
                {/* Course Header */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
                  <h2 className="text-3xl font-bold text-primary mb-4">{course.title}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold text-foreground">{course.duration}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dates</p>
                      <p className="font-semibold text-foreground text-sm">{course.dates}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold text-foreground">{course.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Cost</p>
                        <p className="font-semibold text-foreground">{course.cost}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-8">
                  {/* Overview */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-primary mb-3">Course Overview</h3>
                    <p className="text-lg text-muted-foreground">{course.overview}</p>
                  </div>

                  {/* Target Audience */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Target Audience
                    </h3>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {course.audience.map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-primary font-bold">•</span>
                          <span className="text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Learning Objectives */}
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-4">Learning Objectives</h3>
                      <ul className="space-y-3">
                        {course.objectives.map((obj, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="text-primary font-bold">✓</span>
                            <span className="text-muted-foreground">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-4">Key Benefits</h3>
                      <ul className="space-y-3">
                        {course.benefits.map((benefit, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="text-primary font-bold">✓</span>
                            <span className="text-muted-foreground">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* What's Included */}
                  <div className="bg-white/50 border border-border rounded-lg p-6 mb-6">
                    <p className="text-foreground"><span className="font-semibold">What's Included:</span> {course.includes}</p>
                    {course.scholarship && (
                      <p className="text-secondary font-semibold mt-3"><span className="text-primary">💡 Special Offer:</span> {course.scholarship}</p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="flex gap-4">
                    <Link href="/partner" className="flex-1">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white py-6">
                        Contact Us <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/10 py-6 bg-transparent">
                        Sign In to Portal
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why MamaPlus Training */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Why Choose MamaPlus Training?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Practical & Hands-On",
                description: "Interactive workshops, demonstrations, and scenario-based exercises you can implement immediately in your work."
              },
              {
                title: "Expert Facilitation",
                description: "Learn from experienced childcare professionals and development experts with deep field knowledge."
              },
              {
                title: "Flexible Schedules",
                description: "Training designed for working professionals with flexible and weekend options that fit your life."
              },
              {
                title: "Professional Certification",
                description: "Gain industry-recognized credentials that advance your career and increase employment opportunities."
              },
              {
                title: "Ongoing Support",
                description: "Receive mentorship and support after training to help you apply what you've learned."
              },
              {
                title: "Community Learning",
                description: "Network with other childcare professionals and build relationships with peers in your field."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-border hover:border-primary/50 transition">
                <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-primary mb-6">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl text-secondary font-semibold mb-8 max-w-2xl mx-auto">
            Choose a course that matches your goals and elevate your childcare skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/partner">
              <Button className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6">
                Contact Us <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/partner">
              <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 text-lg px-8 py-6 bg-transparent">
                Contact for More Info
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
