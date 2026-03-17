// Database utility functions and helpers

import { prisma } from './db'
import bcrypt from 'bcryptjs'

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a unique course slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate a unique certificate number
 */
export function generateCertificateNumber(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `MAMA-${timestamp}-${random}`
}

/**
 * Calculate course completion percentage
 */
export async function calculateCourseProgress(userId: string, courseId: string): Promise<number> {
  // Get all lessons in the course
  const lessons = await prisma.lesson.findMany({
    where: {
      module: {
        courseId
      }
    }
  })

  if (lessons.length === 0) return 0

  // Get completed lessons
  const completedLessons = await prisma.progress.count({
    where: {
      userId,
      lessonId: {
        in: lessons.map((l: { id: string }) => l.id)
      },
      isCompleted: true
    }
  })

  return Math.round((completedLessons / lessons.length) * 100)
}

/**
 * Check if user has access to a course
 */
export async function hasAccessToCourse(userId: string, courseId: string): Promise<boolean> {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    }
  })

  return enrollment?.status === 'ACTIVE' || enrollment?.status === 'COMPLETED'
}

/**
 * Check if user has completed a course
 */
export async function hasCertificate(userId: string, courseId: string): Promise<boolean> {
  const certificate = await prisma.certificate.findFirst({
    where: {
      userId,
      courseId
    }
  })

  return !!certificate
}

/**
 * Get average course rating
 */
export async function getCourseRating(courseId: string): Promise<{ average: number; count: number }> {
  const reviews = await prisma.review.findMany({
    where: {
      courseId,
      isPublished: true
    },
    select: {
      rating: true
    }
  })

  if (reviews.length === 0) {
    return { average: 0, count: 0 }
  }

  const sum = reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0)
  const average = sum / reviews.length

  return {
    average: Math.round(average * 10) / 10,
    count: reviews.length
  }
}

/**
 * Get user's enrolled courses with progress
 */
export async function getUserEnrolledCourses(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId
    },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return enrollments
}

/**
 * Create enrollment after successful payment
 */
export async function createEnrollmentFromPayment(
  userId: string,
  courseId: string,
  paymentId: string
) {
  return prisma.enrollment.create({
    data: {
      userId,
      courseId,
      status: 'ACTIVE'
    }
  })
}

/**
 * Update payment status and create enrollment if successful
 */
export async function updatePaymentAndEnroll(
  reference: string,
  status: 'SUCCESS' | 'FAILED',
  gatewayResponse?: string
) {
  const payment = await prisma.payment.findUnique({
    where: { reference }
  })

  if (!payment) {
    throw new Error('Payment not found')
  }

  // Update payment
  const updatedPayment = await prisma.payment.update({
    where: { reference },
    data: {
      status,
      gatewayResponse,
      paidAt: status === 'SUCCESS' ? new Date() : null
    }
  })

  // Create enrollment if payment successful and courseId exists
  if (status === 'SUCCESS' && payment.courseId) {
    await createEnrollmentFromPayment(payment.userId, payment.courseId, payment.id)
  }

  return updatedPayment
}

/**
 * Search courses
 */
export async function searchCourses(query: string, filters?: {
  category?: string
  level?: string
  maxPrice?: number
}) {
  return prisma.course.findMany({
    where: {
      AND: [
        { isPublished: true },
        {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        filters?.category ? { category: filters.category } : {},
        filters?.level ? { level: filters.level as any } : {},
        filters?.maxPrice ? { priceUSD: { lte: filters.maxPrice } } : {}
      ]
    },
    include: {
      modules: {
        include: {
          lessons: true
        }
      },
      _count: {
        select: {
          enrollments: true,
          reviews: true
        }
      }
    }
  })
}
