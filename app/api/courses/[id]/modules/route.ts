import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { requireAdminForCourseWrite } from '@/lib/course-access'
import { encodeModuleDescription } from '@/lib/course-authoring'

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

    const { title, description, isMilestone } = await request.json()
    if (!title?.trim()) {
      return NextResponse.json({ success: false, message: 'title is required' }, { status: 400 })
    }

    const existingCount = await prisma.module.count({
      where: { courseId: params.id }
    })

    const module = await prisma.module.create({
      data: {
        courseId: params.id,
        title: title.trim(),
        description: encodeModuleDescription(description, isMilestone),
        order: existingCount + 1,
      }
    })

    return NextResponse.json({ success: true, data: module, message: 'Section created successfully' }, { status: 201 })
  } catch (error: any) {
    console.error('Create module error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
