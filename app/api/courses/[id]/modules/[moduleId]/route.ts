import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasRole } from '@/lib/auth'
import { ROLES } from '@/lib/roles'
import { decodeModuleDescription, encodeModuleDescription } from '@/lib/course-authoring'

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

    const data = await request.json()
    const existingModule = await prisma.module.findUnique({ where: { id: params.moduleId } })
    if (!existingModule || existingModule.courseId !== params.id) {
      return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 })
    }

    const existingMeta = decodeModuleDescription(existingModule.description)

    const module = await prisma.module.update({
      where: { id: params.moduleId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.order !== undefined && { order: data.order }),
        description: encodeModuleDescription(
          data.description !== undefined ? data.description : existingMeta.description,
          data.isMilestone !== undefined ? data.isMilestone : existingMeta.isMilestone,
        ),
      }
    })

    return NextResponse.json({ success: true, data: module, message: 'Section updated successfully' })
  } catch (error: any) {
    console.error('Update module error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    const existingModule = await prisma.module.findUnique({ where: { id: params.moduleId } })
    if (!existingModule || existingModule.courseId !== params.id) {
      return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 })
    }

    await prisma.module.delete({ where: { id: params.moduleId } })

    return NextResponse.json({ success: true, message: 'Section deleted successfully' })
  } catch (error: any) {
    console.error('Delete module error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
