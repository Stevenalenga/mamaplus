import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/roles'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'

function generateCertificateNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `MP-${year}-${rand}`
}

async function requireAdmin(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user || user.role !== ROLES.ADMIN) return null
  return user
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const search = new URL(request.url).searchParams.get('search')?.trim() || ''

    const where = search
      ? {
          OR: [
            { certificateNumber: { contains: search } },
            { user: { email: { contains: search } } },
            { user: { name: { contains: search } } },
          ],
        }
      : {}

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { issuedAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ success: true, data: certificates })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { userId, courseId } = await request.json()
    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, message: 'userId and courseId are required' },
        { status: 400 },
      )
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })
    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: 'User is not enrolled in this course' },
        { status: 400 },
      )
    }

    const existing = await prisma.certificate.findFirst({
      where: { userId, courseId },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Certificate already issued for this course' },
        { status: 409 },
      )
    }

    let certNumber = generateCertificateNumber()
    let attempts = 0
    while (attempts < 5) {
      const clash = await prisma.certificate.findUnique({
        where: { certificateNumber: certNumber },
      })
      if (!clash) break
      certNumber = generateCertificateNumber()
      attempts++
    }

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateNumber: certNumber,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    await prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: { status: 'COMPLETED', progress: 100, completedAt: new Date() },
    })

    return NextResponse.json(
      { success: true, data: certificate, message: 'Certificate issued' },
      { status: 201 },
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { certificateId } = await request.json()
    if (!certificateId) {
      return NextResponse.json(
        { success: false, message: 'certificateId is required' },
        { status: 400 },
      )
    }

    await prisma.certificate.delete({ where: { id: certificateId } })

    return NextResponse.json({ success: true, message: 'Certificate revoked' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
