import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'

import { getCurrentUser } from '@/lib/auth'

import { requireAdminForCourseWrite } from '@/lib/course-access'

import { encodeLessonResourceMeta } from '@/lib/course-authoring'

import { resolveRouteParams } from '@/lib/route-params'



export async function POST(

  request: NextRequest,

  { params }: { params: Promise<{ id: string; moduleId: string }> }

) {

  try {

    const { id, moduleId } = await resolveRouteParams(params)

    const currentUser = await getCurrentUser(request)

    const authError = requireAdminForCourseWrite(currentUser)

    if (authError) return authError



    const module = await prisma.module.findUnique({ where: { id: moduleId } })

    if (!module || module.courseId !== id) {

      return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 })

    }



    const { title, description, type, url, isMilestone, duration } = await request.json()

    if (!title?.trim()) {

      return NextResponse.json({ success: false, message: 'title is required' }, { status: 400 })

    }



    const existingCount = await prisma.lesson.count({

      where: { moduleId }

    })



    const lesson = await prisma.lesson.create({

      data: {

        moduleId,

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

