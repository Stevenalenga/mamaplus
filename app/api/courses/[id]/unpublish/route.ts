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
      select: { id: true, instructorId: true }
    })

    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
    }

    const isAdmin = hasRole(currentUser, ROLES.ADMIN)
    if (!isAdmin && course.instructorId !== currentUser.userId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
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
