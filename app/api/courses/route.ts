import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { searchCourses } from '@/lib/db-utils'
import { getCurrentUser, hasRole } from '@/lib/auth'
import { ROLES } from '@/lib/roles'

function createSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

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
    const mine = searchParams.get('mine') === 'true'

    if (mine) {
      const currentUser = await getCurrentUser(request)
      if (!currentUser) {
        return NextResponse.json(
          { success: false, message: 'Not authenticated' },
          { status: 401 }
        )
      }

      if (!hasRole(currentUser, [ROLES.INSTRUCTOR, ROLES.ADMIN])) {
        return NextResponse.json(
          { success: false, message: 'Forbidden' },
          { status: 403 }
        )
      }

      const ownedCourses = await prisma.course.findMany({
        where: hasRole(currentUser, ROLES.ADMIN)
          ? {
              ...(category && { category }),
              ...(level && { level: level as any }),
            }
          : {
              instructorId: currentUser.userId,
              ...(category && { category }),
              ...(level && { level: level as any }),
            },
        include: {
          modules: {
            include: {
              lessons: {
                orderBy: {
                  order: 'asc'
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
          updatedAt: 'desc'
        }
      })

      return NextResponse.json({
        success: true,
        data: ownedCourses,
        count: ownedCourses.length
      })
    }

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
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (!hasRole(currentUser, [ROLES.INSTRUCTOR, ROLES.ADMIN])) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const data = await request.json()

    if (!data.title?.trim() || !data.description?.trim() || !data.category?.trim()) {
      return NextResponse.json(
        { success: false, message: 'title, description and category are required' },
        { status: 400 }
      )
    }

    const baseSlug = data.slug?.trim() || createSlug(data.title)
    let slug = baseSlug
    let suffix = 1

    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`
      suffix += 1
    }

    const isAdmin = hasRole(currentUser, ROLES.ADMIN)
    const instructorId = isAdmin ? (data.instructorId || null) : currentUser.userId

    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        thumbnail: data.thumbnail,
        level: data.level || 'BEGINNER',
        category: data.category,
        duration: data.duration || 0,
        priceUSD: data.priceUSD || 0,
        priceKES: data.priceKES || 0,
        currency: data.currency || 'USD',
        isPublished: data.isPublished || false,
        isFeatured: data.isFeatured || false,
        requirements: data.requirements,
        whatYouLearn: data.whatYouLearn,
        instructorId,
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
