import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request as any)
  if (!currentUser || currentUser.role !== 'AGENCY') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ success: false, message: 'Search query is required' }, { status: 400 })
  }

  try {
    const caregivers = await prisma.user.findMany({
      where: {
        role: 'USER',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        // Optional: Exclude caregivers already recruited by the agency
        agencyRecruitments: {
          none: {
            agencyId: currentUser.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            certificates: true,
          },
        },
      },
      take: 10,
    })

    return NextResponse.json({ success: true, data: caregivers })
  } catch (error) {
    console.error('Failed to search for caregivers:', error)
    return NextResponse.json({ success: false, message: 'An internal error occurred' }, { status: 500 })
  }
}
