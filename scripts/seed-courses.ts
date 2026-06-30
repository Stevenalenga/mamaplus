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
    title: '15-Day Accelerated Childcare Worker Training Course',
    slug: '15-day-accelerated-childcare-worker-training',
    description:
      'This intensive 15-day training equips childcare workers with practical skills to deliver safe, nurturing, and high-quality care. Participants gain hands-on experience, professional knowledge, and leadership skills needed to excel in childcare homes, centres, or entrepreneurial ventures.',
    durationLabel: '15 Days',
    scheduleDates: '16th March onwards (Inservice during school holidays)',
    location: 'Nairobi, Kisumu, Bungoma & Migori',
    currency: 'KES',
    priceUSD: 0,
    priceKES: 24000,
    targetAudience: [
      'Experienced childcare workers',
      'Childcare micro-entrepreneurs',
      'Domestic workers without formal training',
      'Early Childhood Development (ECD) teachers – 0–5 years',
      'Anyone interested in childcare',
    ],
    learningObjectives: [
      'Foundations of Childcare – Health, hygiene, child safety, and basic development',
      'Child Growth & Development – Supporting milestones, play, and early learning',
      'Professional Skills – Leadership, centre management, entrepreneurship',
      'Specialized Skills – Inclusive childcare, climate-resilient practices, safeguarding',
      'Parenting & Self-Care – Supporting families while maintaining caregiver wellbeing',
    ],
    keyBenefits: [
      'Hands-on practical childcare training',
      'Leadership and entrepreneurship skills',
      'Certificate of completion and mentorship support',
      'Flexible inservice scheduling during school holidays',
    ],
    included:
      'Interactive workshops, practical demonstrations, group discussions, scenario-based exercises, certificate of completion, mentorship support',
    isFeatured: true,
  },
  {
    title: 'Disability & Inclusion in Early Childhood Care, Education and Development',
    slug: 'disability-inclusion-early-childhood-care',
    description:
      'Learn to create inclusive, accessible, and safe childcare environments for children with diverse needs. This course equips staff to support children with disabilities while strengthening centre operations.',
    durationLabel: '2 Days',
    scheduleDates: 'Ongoing, demand-driven',
    location: 'TBD',
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
    scheduleDates: 'Ongoing, Demand-Driven',
    location: 'TBD',
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
      'Affordable demand-driven training',
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
    scheduleDates: 'Ongoing and Demand-driven',
    location: 'TBD',
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
