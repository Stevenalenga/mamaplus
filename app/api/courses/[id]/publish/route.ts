import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { requireAdminForCourseWrite } from '@/lib/course-access'
import { resolveRouteParams } from '@/lib/route-params'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await resolveRouteParams(params)
    const currentUser = await getCurrentUser(request)
    const authError = requireAdminForCourseWrite(currentUser)
    if (authError) return authError

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: { lessons: true }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
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
      where: { id },
      data: { isPublished: true }
    })

    return NextResponse.json({ success: true, data: published, message: 'Course published successfully' })
  } catch (error: any) {
    console.error('Publish course error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
