import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request as any)
  if (!currentUser || currentUser.role !== 'AGENCY') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const agencyId = currentUser.id
  const body = await request.json()
  const { caregiverId, courseId } = body

  if (!caregiverId || !courseId) {
    return NextResponse.json({ success: false, message: 'Caregiver ID and Course ID are required' }, { status: 400 })
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
    }

    const caregiver = await prisma.user.findUnique({
        where: { id: caregiverId, role: 'USER' }
    })

    if (!caregiver) {
        return NextResponse.json({ success: false, message: 'Caregiver not found' }, { status: 404 })
    }

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: caregiverId,
        courseId: courseId,
      },
    })

    if (existingEnrollment) {
      return NextResponse.json({ success: false, message: 'Caregiver is already enrolled in this course' }, { status: 409 })
    }

    const paymentReference = `SPONSOR-${agencyId.slice(0, 8)}-${courseId.slice(0, 8)}-${Date.now()}`
    
    const payment = await prisma.payment.create({
      data: {
        userId: agencyId,
        courseId: courseId,
        reference: paymentReference,
        amount: course.priceKES,
        currency: 'KES',
        status: 'SUCCESS',
        paymentMethod: 'SPONSORED',
        channel: 'agency_sponsorship',
        paidAt: new Date(),
        metadata: JSON.stringify({
          sponsoredCaregiverId: caregiverId,
          sponsoredCaregiverEmail: caregiver.email,
          agencyName: currentUser.name,
        }),
      },
    })

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: caregiverId,
        courseId: courseId,
        status: 'ACTIVE',
      },
    })

    return NextResponse.json({ 
        success: true, 
        message: 'Sponsorship successful!',
        data: {
            paymentId: payment.id,
            enrollmentId: enrollment.id
        }
    })
  } catch (error) {
    console.error('Sponsorship creation failed:', error)
    return NextResponse.json({ success: false, message: 'An internal error occurred' }, { status: 500 })
  }
}
