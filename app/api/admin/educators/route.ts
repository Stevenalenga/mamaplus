import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/roles'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'

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

    const schoolId = new URL(request.url).searchParams.get('schoolId')

    const educators = await prisma.educator.findMany({
      where: schoolId ? { schoolId } : undefined,
      include: { school: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: educators })
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

    const { name, email, phone, subject, schoolId, isActive } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 })
    }

    const educator = await prisma.educator.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        schoolId: schoolId || null,
        isActive: isActive !== false,
      },
      include: { school: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ success: true, data: educator }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { id, name, email, phone, subject, schoolId, isActive } = await request.json()
    if (!id) {
      return NextResponse.json({ success: false, message: 'id is required' }, { status: 400 })
    }

    const educator = await prisma.educator.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(subject !== undefined && { subject: subject?.trim() || null }),
        ...(schoolId !== undefined && { schoolId: schoolId || null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      include: { school: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ success: true, data: educator })
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

    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ success: false, message: 'id is required' }, { status: 400 })
    }

    await prisma.educator.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Educator deleted' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
