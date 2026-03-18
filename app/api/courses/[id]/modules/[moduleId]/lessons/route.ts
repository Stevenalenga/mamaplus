import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasRole } from '@/lib/auth'
import { ROLES } from '@/lib/roles'
import { encodeLessonResourceMeta } from '@/lib/course-authoring'

async function canManageCourse(courseId: string, userId: string, isAdmin: boolean) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true }
  })

  if (!course) return { ok: false as const, notFound: true }
  if (!isAdmin && course.instructorId !== userId) return { ok: false as const, forbidden: true }
  return { ok: true as const }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; moduleId: string } }
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

    const module = await prisma.module.findUnique({ where: { id: params.moduleId } })
    if (!module || module.courseId !== params.id) {
      return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 })
    }

    const { title, description, type, url, isMilestone, duration } = await request.json()
    if (!title?.trim()) {
      return NextResponse.json({ success: false, message: 'title is required' }, { status: 400 })
    }

    const existingCount = await prisma.lesson.count({
      where: { moduleId: params.moduleId }
    })

    const lesson = await prisma.lesson.create({
      data: {
        moduleId: params.moduleId,
        title: title.trim(),
        description: description || null,
        content: type || null,
        videoUrl: type === 'video' ? (url || null) : null,
        duration: duration || 0,
        order: existingCount + 1,
        isFree: false,
        resourceUrls: encodeLessonResourceMeta(url, isMilestone),
      }
    })

    return NextResponse.json({ success: true, data: lesson, message: 'Lesson created successfully' }, { status: 201 })
  } catch (error: any) {
    console.error('Create lesson error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
