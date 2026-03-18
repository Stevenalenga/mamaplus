import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasRole } from '@/lib/auth'
import { ROLES } from '@/lib/roles'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    if (!hasRole(currentUser, [ROLES.INSTRUCTOR, ROLES.ADMIN])) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        modules: {
          include: { lessons: true }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
    }

    const isAdmin = hasRole(currentUser, ROLES.ADMIN)
    if (!isAdmin && course.instructorId !== currentUser.userId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const hasAtLeastOneModule = course.modules.length > 0
    const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0)

    if (!course.title?.trim() || !course.description?.trim() || !hasAtLeastOneModule || totalLessons === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Course needs title, description, at least one section and one lesson before publish',
        },
        { status: 400 }
      )
    }

    const published = await prisma.course.update({
      where: { id: params.id },
      data: { isPublished: true }
    })

    return NextResponse.json({ success: true, data: published, message: 'Course published successfully' })
  } catch (error: any) {
    console.error('Publish course error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
