import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { requireAdminForCourseWrite } from '@/lib/course-access'
import { decodeModuleDescription, encodeModuleDescription } from '@/lib/course-authoring'
import { resolveRouteParams } from '@/lib/route-params'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { id, moduleId } = await resolveRouteParams(params)
    const currentUser = await getCurrentUser(request)
    const authError = requireAdminForCourseWrite(currentUser)
    if (authError) return authError

    const data = await request.json()
    const existingModule = await prisma.module.findUnique({ where: { id: moduleId } })
    if (!existingModule || existingModule.courseId !== id) {
      return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 })
    }

    const existingMeta = decodeModuleDescription(existingModule.description)

    const module = await prisma.module.update({
      where: { id: moduleId },
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
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { id, moduleId } = await resolveRouteParams(params)
    const currentUser = await getCurrentUser(request)
    const authError = requireAdminForCourseWrite(currentUser)
    if (authError) return authError

    const existingModule = await prisma.module.findUnique({ where: { id: moduleId } })
    if (!existingModule || existingModule.courseId !== id) {
      return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 })
    }

    await prisma.module.delete({ where: { id: moduleId } })

    return NextResponse.json({ success: true, message: 'Section deleted successfully' })
  } catch (error: any) {
    console.error('Delete module error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
