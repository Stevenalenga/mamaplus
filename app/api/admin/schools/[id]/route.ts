import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/roles'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'

async function requireAdmin(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user || user.role !== ROLES.ADMIN) return null
  return user
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const school = await prisma.school.findUnique({
      where: { id },
      include: { educators: true, _count: { select: { educators: true } } },
    })

    if (!school) {
      return NextResponse.json({ success: false, message: 'School not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: school })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const { name, location, county, studentCount, isActive } = await request.json()

    const school = await prisma.school.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(location !== undefined && { location: location?.trim() || null }),
        ...(county !== undefined && { county: county?.trim() || null }),
        ...(studentCount !== undefined && { studentCount: Number(studentCount) || 0 }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })

    return NextResponse.json({ success: true, data: school })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    await prisma.school.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'School deleted' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
