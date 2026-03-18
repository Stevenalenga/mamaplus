import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasRole } from '@/lib/auth'
import { ROLES } from '@/lib/roles'
import { decodeLessonResourceMeta, encodeLessonResourceMeta } from '@/lib/course-authoring'

async function canManageCourse(courseId: string, userId: string, isAdmin: boolean) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true }
  })

  if (!course) return { ok: false as const, notFound: true }
  if (!isAdmin && course.instructorId !== userId) return { ok: false as const, forbidden: true }
  return { ok: true as const }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; moduleId: string; lessonId: string } }
) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    if (!hasRole(currentUser, [ROLES.INSTRUCTOR, ROLES.ADMIN])) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const isAdmin = hasRole(currentUser, ROLES.ADMIN)
    const access = await canManageCourse(params.id, currentUser.userId, isAdmin)
    if (!access.ok) {
      if ('notFound' in access) return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const existingLesson = await prisma.lesson.findUnique({ where: { id: params.lessonId } })
    if (!existingLesson || existingLesson.moduleId !== params.moduleId) {
      return NextResponse.json({ success: false, message: 'Lesson not found' }, { status: 404 })
    }

    const data = await request.json()
    const existingMeta = decodeLessonResourceMeta(existingLesson.resourceUrls)

    const updatedLesson = await prisma.lesson.update({
      where: { id: params.lessonId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type !== undefined && { content: data.type }),
        ...(data.type === 'video' && data.url !== undefined && { videoUrl: data.url }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.order !== undefined && { order: data.order }),
        resourceUrls: encodeLessonResourceMeta(
          data.url !== undefined ? data.url : existingMeta.url,
          data.isMilestone !== undefined ? data.isMilestone : existingMeta.isMilestone,
        ),
      }
    })

    return NextResponse.json({ success: true, data: updatedLesson, message: 'Lesson updated successfully' })
  } catch (error: any) {
    console.error('Update lesson error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; moduleId: string; lessonId: string } }
) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    if (!hasRole(currentUser, [ROLES.INSTRUCTOR, ROLES.ADMIN])) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const isAdmin = hasRole(currentUser, ROLES.ADMIN)
    const access = await canManageCourse(params.id, currentUser.userId, isAdmin)
    if (!access.ok) {
      if ('notFound' in access) return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const existingLesson = await prisma.lesson.findUnique({ where: { id: params.lessonId } })
    if (!existingLesson || existingLesson.moduleId !== params.moduleId) {
      return NextResponse.json({ success: false, message: 'Lesson not found' }, { status: 404 })
    }

    await prisma.lesson.delete({ where: { id: params.lessonId } })

    return NextResponse.json({ success: true, message: 'Lesson deleted successfully' })
  } catch (error: any) {
    console.error('Delete lesson error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
