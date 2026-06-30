import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { requireAdminForCourseWrite } from '@/lib/course-access'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request)
    const authError = requireAdminForCourseWrite(currentUser)
    if (authError) return authError

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      select: { id: true }
    })

    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
    }

    const unpublished = await prisma.course.update({
      where: { id: params.id },
      data: { isPublished: false }
    })

    return NextResponse.json({ success: true, data: unpublished, message: 'Course unpublished successfully' })
  } catch (error: any) {
    console.error('Unpublish course error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
