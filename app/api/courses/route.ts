import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { searchCourses } from '@/lib/db-utils'

/**
 * GET /api/courses
 * Get all published courses or search courses
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const featured = searchParams.get('featured')

    // Search if query provided
    if (query) {
      const courses = await searchCourses(query, {
        category: category || undefined,
        level: level || undefined
      })

      return NextResponse.json({
        success: true,
        data: courses,
        count: courses.length
      })
    }

    // Otherwise, get all courses with filters
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(category && { category }),
        ...(level && { level: level as any }),
        ...(featured === 'true' && { isFeatured: true })
      },
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                duration: true,
                order: true,
                isFree: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: courses,
      count: courses.length
    })

  } catch (error: any) {
    console.error('Get courses error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses
 * Create a new course (Admin/Instructor only)
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        thumbnail: data.thumbnail,
        level: data.level || 'BEGINNER',
        category: data.category,
        duration: data.duration,
        priceUSD: data.priceUSD,
        priceKES: data.priceKES,
        currency: data.currency || 'USD',
        isPublished: data.isPublished || false,
        isFeatured: data.isFeatured || false,
        requirements: data.requirements,
        whatYouLearn: data.whatYouLearn,
        instructorId: data.instructorId,
        videoUrl: data.videoUrl,
        previewUrl: data.previewUrl
      }
    })

    return NextResponse.json({
      success: true,
      data: course,
      message: 'Course created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create course error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
