import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { requireAdminForCourseWrite } from '@/lib/course-access'
import { decodeLessonResourceMeta, encodeLessonResourceMeta } from '@/lib/course-authoring'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; moduleId: string; lessonId: string } }
) {
  try {
    const currentUser = await getCurrentUser(request)
    const authError = requireAdminForCourseWrite(currentUser)
    if (authError) return authError

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
    const authError = requireAdminForCourseWrite(currentUser)
    if (authError) return authError

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
