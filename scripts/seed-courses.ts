import { prisma } from '../lib/db'
import { encodeModuleDescription } from '../lib/course-authoring'
import { encodeStringList } from '../lib/course-fields'

function createSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type SeedCourse = {
  title: string
  slug: string
  description: string
  durationLabel: string
  scheduleDates: string
  location: string
  currency: 'USD' | 'KES'
  priceUSD: number
  priceKES: number
  targetAudience: string[]
  learningObjectives: string[]
  keyBenefits: string[]
  included: string
  specialOffer?: string
  isFeatured?: boolean
}

const acceleratedAudience = [
  'Experienced childcare workers',
  'Childcare micro-entrepreneurs',
  'Domestic workers without formal training',
  'Early Childhood Development (ECD) teachers – 0–5 years',
  'Anyone interested in childcare',
]

const acceleratedSessions = [
  'Understanding childcare and safety in childcare centres',
  'Developmental milestones and child grooming',
  'Child Play and Habit Formation',
  'Leadership in centre management',
  'Health and Nutrition',
  'Homecare, Psychosocial support and Feedback',
  'Disability and Inclusion in Early Childhood Care, Education and Development',
  'Climate change and Environmental Management',
]

const acceleratedBenefits = [
  'Hands-on practical childcare training',
  'Leadership and entrepreneurship skills',
  'Certificate of completion and mentorship support',
  'Scheduled Thursday & Saturday sessions, 9am – 4pm',
]

const acceleratedIncluded =
  'Interactive workshops, practical demonstrations, group discussions, scenario-based exercises, certificate of completion, mentorship support'

function buildAcceleratedSchedule(venue: string) {
  return [
    `Venue: ${venue}`,
    'Time: 9am – 4pm (Thursday & Saturday sessions)',
    '14 & 16 May 2026 — Understanding childcare and safety in childcare centres',
    '21 & 23 May 2026 — Developmental milestones and child grooming',
    '28 & 30 May 2026 — Child Play and Habit Formation',
    '4 & 6 June 2026 — Leadership in centre management',
    '11 & 13 June 2026 — Health and Nutrition',
    '18 & 20 June 2026 — Homecare, Psychosocial support and Feedback',
    '25 & 27 June 2026 — Disability and Inclusion in Early Childhood Care, Education and Development',
    '2 & 4 July 2026 — Climate change and Environmental Management',
  ].join('\n')
}

const nairobiSchedule = buildAcceleratedSchedule('Mama Plus Training center Nairobi')
const bungomaSchedule = buildAcceleratedSchedule('Mama Plus Training center Bungoma')
const kisumuSchedule = buildAcceleratedSchedule('Kisumu (location TBC by Kisumu Team)')

const bootcampSessions = [
  'Understanding childcare and safety in childcare centres',
  'Developmental milestones and child grooming',
  'Child Play and Habit Formation',
  'Leadership in centre management',
  'Health and Nutrition',
  'Homecare, Psychosocial support and Feedback',
]

const bootcampBenefits = [
  'Intensive 5-day holiday bootcamp format',
  'Hands-on practical childcare training',
  'Leadership and centre management skills',
  'Certificate of completion and mentorship support',
]

const bootcampIncluded =
  'Interactive workshops, practical demonstrations, group discussions, scenario-based exercises, certificate of completion, mentorship support'

function buildBootcampSchedule(venue: string) {
  return [
    'August Holidays Bootcamp',
    `Venue: ${venue}`,
    'Dates: Monday – Friday, 4th – 8th August 2026',
    'Time: 9:00 am – 4:00 pm daily',
    'Sessions covered:',
    ...bootcampSessions.map((session) => `• ${session}`),
  ].join('\n')
}

const nairobiBootcampSchedule = buildBootcampSchedule('MamaPlus Training Centre Nairobi')
const bungomaBootcampSchedule = buildBootcampSchedule('MamaPlus Training Centre Bungoma')
const kisumuBootcampSchedule = buildBootcampSchedule('MamaPlus Training Centre Kisumu')

const seedCourses: SeedCourse[] = [
  {
    title: 'Regional Child Safeguarding & Protection Training',
    slug: 'regional-child-safeguarding-protection-training',
    description:
      'Strengthen your child safeguarding knowledge and skills. Learn to identify risks, protect children, and implement effective safeguarding systems in homes, centres, and communities.',
    durationLabel: '3 Days',
    scheduleDates: '13th – 15th May 2026',
    location: 'Nairobi',
    currency: 'USD',
    priceUSD: 800,
    priceKES: 0,
    targetAudience: [
      'Child protection officers',
      "Children's rights advocates",
      'Policymakers and administrators',
      'Caregivers and parents',
    ],
    learningObjectives: [
      'Understand principles of safeguarding and protection',
      'Identify child risks and vulnerabilities',
      'Implement practical child protection measures',
      'Design monitoring and response systems',
    ],
    keyBenefits: [
      'Expert-led regional safeguarding training',
      'Practical tools for homes, centres, and communities',
      'Certificate of completion',
      'Networking with child protection professionals',
    ],
    included: 'Tuition, lunches, teas, facilitation, materials (excludes travel/accommodation)',
    specialOffer:
      'Scholarships of up to 20% available for early registration before 30th March 2026',
    isFeatured: true,
  },
  {
    title: 'Accelerated Childcare Worker Training — Nairobi',
    slug: '15-day-accelerated-childcare-worker-training',
    description:
      'This intensive training equips childcare workers with practical skills to deliver safe, nurturing, and high-quality care. Participants gain hands-on experience, professional knowledge, and leadership skills needed to excel in childcare homes, centres, or entrepreneurial ventures.',
    durationLabel: 'Thursdays & Saturdays, 9am – 4pm',
    scheduleDates: nairobiSchedule,
    location: 'Mama Plus Training center Nairobi',
    currency: 'KES',
    priceUSD: 0,
    priceKES: 24000,
    targetAudience: acceleratedAudience,
    learningObjectives: acceleratedSessions,
    keyBenefits: acceleratedBenefits,
    included: acceleratedIncluded,
    isFeatured: true,
  },
  {
    title: 'Accelerated Childcare Worker Training — Bungoma',
    slug: 'accelerated-childcare-worker-training-bungoma',
    description:
      'This intensive training equips childcare workers with practical skills to deliver safe, nurturing, and high-quality care. Participants gain hands-on experience, professional knowledge, and leadership skills needed to excel in childcare homes, centres, or entrepreneurial ventures.',
    durationLabel: 'Thursdays & Saturdays, 9am – 4pm',
    scheduleDates: bungomaSchedule,
    location: 'Mama Plus Training center Bungoma',
    currency: 'KES',
    priceUSD: 0,
    priceKES: 24000,
    targetAudience: acceleratedAudience,
    learningObjectives: acceleratedSessions,
    keyBenefits: acceleratedBenefits,
    included: acceleratedIncluded,
    isFeatured: true,
  },
  {
    title: 'Accelerated Childcare Worker Training — Kisumu',
    slug: 'accelerated-childcare-worker-training-kisumu',
    description:
      'This intensive training equips childcare workers with practical skills to deliver safe, nurturing, and high-quality care. Participants gain hands-on experience, professional knowledge, and leadership skills needed to excel in childcare homes, centres, or entrepreneurial ventures.',
    durationLabel: 'Thursdays & Saturdays, 9am – 4pm',
    scheduleDates: kisumuSchedule,
    location: 'Kisumu (location TBC by Kisumu Team)',
    currency: 'KES',
    priceUSD: 0,
    priceKES: 24000,
    targetAudience: acceleratedAudience,
    learningObjectives: acceleratedSessions,
    keyBenefits: acceleratedBenefits,
    included: acceleratedIncluded,
    isFeatured: true,
  },
  {
    title: '5-Day Childcare Bootcamp — Nairobi',
    slug: '5-day-childcare-bootcamp-nairobi',
    description:
      'An intensive August holidays bootcamp covering core childcare skills in five consecutive days. Ideal for caregivers and childcare workers who want practical, hands-on training during the school holiday period.',
    durationLabel: '5 Days (Mon–Fri), 9am – 4pm',
    scheduleDates: nairobiBootcampSchedule,
    location: 'MamaPlus Training Centre Nairobi',
    currency: 'KES',
    priceUSD: 0,
    priceKES: 15000,
    targetAudience: acceleratedAudience,
    learningObjectives: bootcampSessions,
    keyBenefits: bootcampBenefits,
    included: bootcampIncluded,
    isFeatured: true,
  },
  {
    title: '5-Day Childcare Bootcamp — Kisumu',
    slug: '5-day-childcare-bootcamp-kisumu',
    description:
      'An intensive August holidays bootcamp covering core childcare skills in five consecutive days. Ideal for caregivers and childcare workers who want practical, hands-on training during the school holiday period.',
    durationLabel: '5 Days (Mon–Fri), 9am – 4pm',
    scheduleDates: kisumuBootcampSchedule,
    location: 'MamaPlus Training Centre Kisumu',
    currency: 'KES',
    priceUSD: 0,
    priceKES: 15000,
    targetAudience: acceleratedAudience,
    learningObjectives: bootcampSessions,
    keyBenefits: bootcampBenefits,
    included: bootcampIncluded,
    isFeatured: true,
  },
  {
    title: '5-Day Childcare Bootcamp — Bungoma',
    slug: '5-day-childcare-bootcamp-bungoma',
    description:
      'An intensive August holidays bootcamp covering core childcare skills in five consecutive days. Ideal for caregivers and childcare workers who want practical, hands-on training during the school holiday period.',
    durationLabel: '5 Days (Mon–Fri), 9am – 4pm',
    scheduleDates: bungomaBootcampSchedule,
    location: 'MamaPlus Training Centre Bungoma',
    currency: 'KES',
    priceUSD: 0,
    priceKES: 15000,
    targetAudience: acceleratedAudience,
    learningObjectives: bootcampSessions,
    keyBenefits: bootcampBenefits,
    included: bootcampIncluded,
    isFeatured: true,
  },
  {
    title: 'Disability & Inclusion in Early Childhood Care, Education and Development',
    slug: 'disability-inclusion-early-childhood-care',
    description:
      'Learn to create inclusive, accessible, and safe childcare environments for children with diverse needs. This course equips staff to support children with disabilities while strengthening centre operations.',
    durationLabel: '2 Days',
    scheduleDates: '25 & 27 June 2026 (also included in Accelerated Training)',
    location: 'Nairobi, Bungoma & Kisumu',
    currency: 'KES',
    priceUSD: 0,
    priceKES: 8000,
    targetAudience: ['Teachers', 'Childcare Workers', 'Development Professionals'],
    learningObjectives: [
      'Understand disability rights and inclusion principles',
      'Identify and accommodate diverse learning needs',
      'Strengthen communication and teamwork',
      'Implement inclusion-focused improvements in childcare operations',
    ],
    keyBenefits: [
      'Inclusive childcare environment design',
      'Personal and operational improvement plans',
      'Practical inclusion strategies for diverse needs',
      'Clear communication and documentation systems',
    ],
    included:
      'Training materials, personal development plan, operational improvement plan, clear systems for communication and documentation',
  },
  {
    title: 'Leadership & Management for Childcare Workers',
    slug: 'leadership-management-childcare-workers',
    description:
      'Build leadership, management, and operational skills to lead teams, improve childcare operations, and drive sustainable growth.',
    durationLabel: '2 Days',
    scheduleDates: '4 & 6 June 2026 (also included in Accelerated Training)',
    location: 'Nairobi, Bungoma & Kisumu',
    currency: 'KES',
    priceUSD: 0,
    priceKES: 3000,
    targetAudience: ['Childcare workers', 'Centre managers', 'Supervisors'],
    learningObjectives: [
      'Understand effective leadership in childcare',
      'Strengthen team communication and engagement',
      'Apply management principles to daily operations',
      'Plan and sustain improvements in centres',
    ],
    keyBenefits: [
      'Stronger team leadership and communication',
      'Practical management tools for daily operations',
      'Centre improvement planning support',
      'Affordable scheduled training across Mama Plus centres',
    ],
    included:
      'Leadership training, management tools, personal leadership improvement plan, centre operational improvement plan',
  },
  {
    title: 'Climate Change & Environmental Management',
    slug: 'climate-change-environmental-management',
    description:
      "Understand climate risks and their impact on children, and learn to create resilient, safe, and sustainable childcare environments.",
    durationLabel: '1 Day',
    scheduleDates: '2 & 4 July 2026 (also included in Accelerated Training)',
    location: 'Nairobi, Bungoma & Kisumu',
    currency: 'KES',
    priceUSD: 0,
    priceKES: 3000,
    targetAudience: ['Childcare workers', 'Centre managers', 'Home-based providers'],
    learningObjectives: [
      "Understand climate change effects on children's health, safety, and development",
      'Assess vulnerabilities in childcare centres',
      'Design climate-resilient spaces (shade, ventilation, safe play areas)',
      'Lead centre-wide sustainability initiatives',
    ],
    keyBenefits: [
      'Climate-resilient childcare planning',
      'Practical sustainability resources',
      'Emergency procedure updates',
      'Safer environments for children',
    ],
    included:
      'Climate risk assessment, emergency procedure updates, practical resilience planning, sustainability resources',
  },
]

async function ensureCourseContent(courseId: string) {
  const moduleCount = await prisma.module.count({ where: { courseId } })
  if (moduleCount > 0) return

  const module = await prisma.module.create({
    data: {
      courseId,
      title: 'Course Overview',
      description: encodeModuleDescription('', false),
      order: 1,
    },
  })

  await prisma.lesson.create({
    data: {
      moduleId: module.id,
      title: 'Introduction',
      description: 'Course introduction and overview',
      content: 'file',
      duration: 0,
      order: 1,
      isFree: true,
    },
  })
}

async function main() {
  for (const seed of seedCourses) {
    const existing = await prisma.course.findUnique({ where: { slug: seed.slug } })

    const courseData = {
      title: seed.title,
      description: seed.description,
      shortDescription: seed.description,
      category: 'Professional Training',
      level: 'BEGINNER',
      duration: 0,
      durationLabel: seed.durationLabel,
      scheduleDates: seed.scheduleDates,
      location: seed.location,
      priceUSD: seed.priceUSD,
      priceKES: seed.priceKES,
      currency: seed.currency,
      isPublished: true,
      isFeatured: !!seed.isFeatured,
      requirements: encodeStringList(seed.targetAudience),
      whatYouLearn: encodeStringList(seed.learningObjectives),
      keyBenefits: encodeStringList(seed.keyBenefits),
      specialOffer: seed.specialOffer || null,
    }

    let course
    if (existing) {
      course = await prisma.course.update({
        where: { id: existing.id },
        data: courseData,
      })
      console.log('Updated course:', course.title)
    } else {
      course = await prisma.course.create({
        data: {
          slug: seed.slug,
          ...courseData,
        },
      })
      console.log('Created course:', course.title)
    }

    await ensureCourseContent(course.id)
  }

  console.log(`✅ Seeded ${seedCourses.length} browse courses`)
}

main()
  .catch((error) => {
    console.error('❌ Seed courses error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
