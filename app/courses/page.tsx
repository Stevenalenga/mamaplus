'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Clock, DollarSign, Users, CheckCircle, ArrowRight, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CoursesHeader from '@/components/courses-header'
import Footer from '@/components/footer'
import { useCurrentUser } from '@/hooks/use-current-user'
import { LogoutButton } from '@/components/auth/LogoutButton'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from 'sonner'

type Course = {
  id: string
  title: string
  duration: string
  dates: string
  location: string
  cost: string
  costNumeric?: number
  currency: string
  overview: string
  targetAudience: string[]
  learningObjectives: string[]
  keyBenefits: string[]
  included: string
  specialOffer?: string
  featured?: boolean
  isEducatorUploaded?: boolean
}

type ApiPublishedCourse = {
  id: string
  title: string
  description: string
  duration: number
  currency: string
  priceUSD: number
  priceKES: number
  modules?: Array<{
    lessons?: Array<{ id: string }>
  }>
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Regional Child Safeguarding & Protection Training',
    duration: '3 Days',
    dates: '13th – 15th May 2026',
    location: 'Nairobi',
    cost: '$800',
    costNumeric: 800,
    currency: 'USD',
    overview: 'Strengthen your child safeguarding knowledge and skills. Learn to identify risks, protect children, and implement effective safeguarding systems in homes, centres, and communities.',
    targetAudience: [
      'Child protection officers',
      'Children\'s rights advocates',
      'Policymakers and administrators',
      'Caregivers and parents'
    ],
    learningObjectives: [
      'Understand principles of safeguarding and protection',
      'Identify child risks and vulnerabilities',
      'Implement practical child protection measures',
      'Design monitoring and response systems'
    ],
    keyBenefits: [
      'Practical knowledge of child protection frameworks',
      'Enhanced skills to safeguard children',
      'Ability to develop and implement child protection policies',
      'Network with other protection professionals'
    ],
    included: 'Tuition, lunches, teas, facilitation, materials (excludes travel/accommodation)',
    specialOffer: 'Scholarships of up to 20% available for early registration before 30th March 2026',
    featured: true
  },
  {
    id: '2',
    title: '15-Day Accelerated Childcare Worker Training Course',
    duration: '15 Days',
    dates: '16th March onwards (Inservice during school holidays)',
    location: 'Nairobi, Kisumu, Bungoma & Migori',
    cost: 'KES 24,000',
    costNumeric: 24000,
    currency: 'KES',
    overview: 'This intensive 15-day training equips childcare workers with practical skills to deliver safe, nurturing, and high-quality care. Participants gain hands-on experience, professional knowledge, and leadership skills needed to excel in childcare homes, centres, or entrepreneurial ventures.',
    targetAudience: [
      'Experienced childcare workers',
      'Childcare micro-entrepreneurs',
      'Domestic workers without formal training',
      'Early Childhood Development (ECD) teachers – 0–5 years',
      'Anyone interested in childcare'
    ],
    learningObjectives: [
      'Foundations of Childcare – Health, hygiene, child safety, and basic development',
      'Child Growth & Development – Supporting milestones, play, and early learning',
      'Professional Skills – Leadership, centre management, entrepreneurship',
      'Specialized Skills – Inclusive childcare, climate-resilient practices, safeguarding',
      'Parenting & Self-Care – Supporting families while maintaining caregiver wellbeing'
    ],
    keyBenefits: [
      'Practical, hands-on skills to deliver quality childcare',
      'Strengthen your career and business opportunities',
      'Learn to manage children with diverse needs safely',
      'Develop leadership, entrepreneurship, and professional growth skills',
      'Flexible learning that accommodates working schedules'
    ],
    included: 'Interactive workshops, practical demonstrations, group discussions, scenario-based exercises, certificate of completion, mentorship support',
    featured: true
  },
  {
    id: '3',
    title: 'Disability & Inclusion in Early Childhood Care, Education and Development',
    duration: '2 Days',
    dates: 'Ongoing, demand-driven',
    location: 'TBD',
    cost: 'KES 8,000',
    costNumeric: 8000,
    currency: 'KES',
    overview: 'Learn to create inclusive, accessible, and safe childcare environments for children with diverse needs. This course equips staff to support children with disabilities while strengthening centre operations.',
    targetAudience: [
      'Teachers',
      'Childcare Workers',
      'Development Professionals'
    ],
    learningObjectives: [
      'Understand disability rights and inclusion principles',
      'Identify and accommodate diverse learning needs',
      'Strengthen communication and teamwork',
      'Implement inclusion-focused improvements in childcare operations'
    ],
    keyBenefits: [
      'Safer, more inclusive childcare environments',
      'Enhanced teamwork and staff engagement',
      'Increased centre reputation and trust',
      'Personal inclusion and professional development plan',
      'Operational improvement plan for your centre'
    ],
    included: 'Training materials, personal development plan, operational improvement plan, clear systems for communication and documentation'
  },
  {
    id: '4',
    title: 'Leadership & Management for Childcare Workers',
    duration: '2 Days',
    dates: 'Ongoing, Demand-Driven',
    location: 'TBD',
    cost: 'KES 3,000',
    costNumeric: 3000,
    currency: 'KES',
    overview: 'Build leadership, management, and operational skills to lead teams, improve childcare operations, and drive sustainable growth.',
    targetAudience: [
      'Childcare workers',
      'Centre managers',
      'Supervisors'
    ],
    learningObjectives: [
      'Understand effective leadership in childcare',
      'Strengthen team communication and engagement',
      'Apply management principles to daily operations',
      'Plan and sustain improvements in centres'
    ],
    keyBenefits: [
      'Improved leadership and management capacity',
      'Enhanced quality and safety standards',
      'Stronger teamwork and staff engagement',
      'Sustainable growth for childcare centres',
      'Personal leadership improvement plan'
    ],
    included: 'Leadership training, management tools, personal leadership improvement plan, centre operational improvement plan'
  },
  {
    id: '5',
    title: 'Climate Change & Environmental Management',
    duration: '1 Day',
    dates: 'Ongoing and Demand-driven',
    location: 'TBD',
    cost: 'KES 3,000',
    costNumeric: 3000,
    currency: 'KES',
    overview: 'Understand climate risks and their impact on children, and learn to create resilient, safe, and sustainable childcare environments.',
    targetAudience: [
      'Childcare workers',
      'Centre managers',
      'Home-based providers'
    ],
    learningObjectives: [
      'Understand climate change effects on children\'s health, safety, and development',
      'Assess vulnerabilities in childcare centres',
      'Design climate-resilient spaces (shade, ventilation, safe play areas)',
      'Lead centre-wide sustainability initiatives'
    ],
    keyBenefits: [
      'Increased staff climate awareness',
      'Safer, resilient childcare environments',
      'Stronger ability to protect children from environmental risks',
      'Completed centre climate risk assessment',
      'Updated emergency procedures and practical resilience plans'
    ],
    included: 'Climate risk assessment, emergency procedure updates, practical resilience planning, sustainability resources'
  }
]

export default function CoursesPage() {
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  const [publishedEducatorCourses, setPublishedEducatorCourses] = useState<Course[]>([])
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null)
  const { user } = useCurrentUser()
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'New Course Available', message: 'Maternal Health Basics course is now available', time: '2 hours ago', read: false },
    { id: '2', title: 'Certificate Ready', message: 'Your certificate for Infant Nutrition is ready to download', time: '1 day ago', read: false },
    { id: '3', title: 'Welcome to MamaPlus', message: 'Thank you for joining our caregiving community', time: '3 days ago', read: true },
  ])
  const unreadCount = notifications.filter(n => !n.read).length
  const markAsRead = (id: string) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllAsRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })))

  useEffect(() => {
    async function loadPublishedCourses() {
      try {
        const response = await fetch('/api/courses')
        const json = await response.json()

        if (!response.ok || !json.success) {
          setPublishedEducatorCourses([])
          return
        }

        const mapped = (json.data as ApiPublishedCourse[]).map((course) => {
          const lessonCount = (course.modules || []).reduce((sum, module) => sum + (module.lessons?.length || 0), 0)
          return {
            id: course.id,
            title: course.title,
            duration: lessonCount > 0 ? `${lessonCount} learning items` : `${Math.max(course.duration || 0, 1)} minutes`,
            dates: 'Self-paced',
            location: 'Online',
            cost: course.currency === 'KES' ? `KES ${course.priceKES || 0}` : `$${course.priceUSD || 0}`,
            costNumeric: course.currency === 'KES' ? course.priceKES || 0 : course.priceUSD || 0,
            currency: course.currency || 'USD',
            overview: course.description || 'Created by educators on MamaPlus.',
            targetAudience: ['Caregivers', 'Parents', 'Healthcare support workers'],
            learningObjectives: [
              'Build practical caregiving skills',
              'Track learning progress by section',
              'Complete educator-defined milestones',
            ],
            keyBenefits: [
              'Educator-curated practical resources',
              'Structured section-by-section learning',
              'Flexible self-paced access',
            ],
            included: 'Online learning content and milestone tracking',
            featured: false,
            isEducatorUploaded: true,
          } satisfies Course
        })

        setPublishedEducatorCourses(mapped)
      } catch {
        setPublishedEducatorCourses([])
      }
    }

    loadPublishedCourses()
  }, [])

  const allCourses = useMemo(() => {
    const educatorCourseIds = new Set(publishedEducatorCourses.map(course => String(course.id)))
    const baseCourses = courses.filter(course => !educatorCourseIds.has(String(course.id)))
    return [...publishedEducatorCourses, ...baseCourses]
  }, [publishedEducatorCourses])

  const handleEnroll = async (course: Course) => {
    if (!user) {
      toast.info('Please sign in to enroll in a course.')
      router.push('/login?message=account_required')
      return
    }

    const isFreeCourse = (course.costNumeric || 0) <= 0

    if (!isFreeCourse) {
      setSelectedCourse(course)
      setShowPaymentInfo(true)
      toast.info('This is a paid course. Please complete payment to activate enrollment.')
      return
    }

    setEnrollingCourseId(course.id)
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      })
      const json = await response.json()

      if (response.status === 409) {
        toast.info('You are already enrolled. Opening course...')
        router.push(`/dashboard/user/courses/${course.id}`)
        return
      }

      if (!response.ok || !json.success) {
        toast.error(json.message || 'Unable to enroll in this course right now.')
        return
      }

      toast.success('Enrollment successful! Opening your course...')
      router.push(`/dashboard/user/courses/${course.id}`)
    } catch {
      toast.error('Unable to enroll right now. Please try again.')
    } finally {
      setEnrollingCourseId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        <nav className="bg-white border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard/user" className="flex items-center hover:opacity-80 transition">
                <Image src="/logo.png" alt="MamaPlus" width={240} height={240} className="object-contain" />
              </Link>
              <Link href="/dashboard/user" className="text-sm text-muted-foreground hover:text-primary">Home</Link>
              <Link href="/courses" className="text-sm font-semibold text-primary border-b-2 border-primary">Browse Courses</Link>
              <Link href="/dashboard/user/profile" className="text-sm text-muted-foreground hover:text-primary">My Profile</Link>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications Bell */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative p-2 text-gray-700 hover:text-primary transition rounded-full hover:bg-gray-100 border border-gray-200">
                    <Bell className="w-5 h-5 stroke-2" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 border-2 border-white animate-pulse" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">Mark all as read</button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 transition cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                                <p className="text-sm text-muted-foreground mb-1">{notification.message}</p>
                                <p className="text-xs text-muted-foreground">{notification.time}</p>
                              </div>
                              {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <span className="text-sm text-muted-foreground">
                {user.name || user.email}
              </span>
              <LogoutButton variant="ghost" size="sm" />
            </div>
          </div>
        </nav>
      ) : (
        <CoursesHeader />
      )}

      {/* Hero Section with top padding for fixed header */}
      <div className={`bg-gradient-to-r from-primary to-primary/80 text-white py-16 ${!user ? 'pt-32' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Professional Childcare Training Courses</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Elevate your childcare skills with expert-led training designed for professionals who care about quality, safety, and child development.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {allCourses.map((course) => (
            <Card key={course.id} className={`hover:shadow-lg transition ${course.featured ? 'border-primary border-2' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-2xl font-bold text-primary">{course.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {course.isEducatorUploaded && (
                      <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">Educator Uploaded</Badge>
                    )}
                    {course.featured && (
                      <Badge className="bg-primary text-white">Featured</Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-base">{course.overview}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span><strong>Duration:</strong> {course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span><strong>Cost:</strong> {course.cost}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span><strong>Dates:</strong> {course.dates}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span><strong>Location:</strong> {course.location}</span>
                  </div>
                </div>

                {/* Special Offer */}
                {course.specialOffer && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 flex items-start gap-2">
                      <span className="text-xl">💡</span>
                      <span><strong>Special Offer:</strong> {course.specialOffer}</span>
                    </p>
                  </div>
                )}

                {/* Tabs for Details */}
                <Tabs defaultValue="audience" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="audience">Audience</TabsTrigger>
                    <TabsTrigger value="objectives">Objectives</TabsTrigger>
                    <TabsTrigger value="benefits">Benefits</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="audience" className="space-y-2 mt-4">
                    <h4 className="font-semibold text-sm text-gray-700">Target Audience:</h4>
                    <ul className="space-y-1">
                      {course.targetAudience.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="objectives" className="space-y-2 mt-4">
                    <h4 className="font-semibold text-sm text-gray-700">Learning Objectives:</h4>
                    <ul className="space-y-1">
                      {course.learningObjectives.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="benefits" className="space-y-2 mt-4">
                    <h4 className="font-semibold text-sm text-gray-700">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {course.keyBenefits.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>

                {/* What's Included */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2">What's Included:</h4>
                  <p className="text-sm text-gray-700">{course.included}</p>
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleEnroll(course)}
                  disabled={enrollingCourseId === course.id}
                >
                  {enrollingCourseId === course.id ? 'Enrolling...' : 'Enroll Now'} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Why Choose MamaPlus Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">Why Choose MamaPlus Training?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Practical & Hands-On</h3>
              <p className="text-sm text-gray-600">Interactive workshops, demonstrations, and scenario-based exercises you can implement immediately in your work.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Expert Facilitation</h3>
              <p className="text-sm text-gray-600">Learn from experienced childcare professionals and development experts with deep field knowledge.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Flexible Schedules</h3>
              <p className="text-sm text-gray-600">Training designed for working professionals with flexible and weekend options that fit your life.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Badge className="w-8 h-8 bg-primary text-white flex items-center justify-center text-xs">CERT</Badge>
              </div>
              <h3 className="font-bold text-lg mb-2">Professional Certification</h3>
              <p className="text-sm text-gray-600">Gain industry-recognized credentials that advance your career and increase employment opportunities.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Ongoing Support</h3>
              <p className="text-sm text-gray-600">Receive mentorship and support after training to help you apply what you've learned.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Community Learning</h3>
              <p className="text-sm text-gray-600">Network with other childcare professionals and build relationships with peers in your field.</p>
            </div>
          </div>
        </div>

        {/* M-Pesa Payment Section */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 text-gray-800">Pay with M-Pesa</h2>
              <p className="text-gray-600">Quick and secure mobile payment for all courses</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4 text-gray-800">How to Pay via M-Pesa Paybill</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                  <div>
                    <p className="font-semibold">Go to M-Pesa menu on your phone</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                  <div>
                    <p className="font-semibold">Select Lipa na M-Pesa, then Pay Bill</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                  <div className="flex-1">
                    <p className="font-semibold mb-2">Enter the following details:</p>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Business Number (Paybill)</p>
                        <p className="text-2xl font-bold text-green-600">4182157</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Account Number</p>
                        <p className="text-lg font-bold text-gray-800">Your ID Number</p>
                        <p className="text-xs text-gray-500">Enter your national ID number as the account number</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                  <div>
                    <p className="font-semibold">Enter the course amount you wish to pay</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">5</div>
                  <div>
                    <p className="font-semibold">Enter your M-Pesa PIN and confirm the payment</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">6</div>
                  <div>
                    <p className="font-semibold">You will receive an M-Pesa confirmation SMS. Keep this for your records.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>📱 Need Help?</strong> After payment, keep your M-Pesa confirmation message for your records and enrollment confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
