import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'AGENCY') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const agencyId = session.user.id
  const body = await request.json()
  const { caregiverId, courseId } = body

  if (!caregiverId || !courseId) {
    return NextResponse.json({ success: false, message: 'Caregiver ID and Course ID are required' }, { status: 400 })
  }

  try {
    // 1. Verify the course exists and get its price
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
    }

    // 2. Verify the caregiver exists
    const caregiver = await prisma.user.findUnique({
        where: { id: caregiverId, role: 'USER' }
    })

    if (!caregiver) {
        return NextResponse.json({ success: false, message: 'Caregiver not found' }, { status: 404 })
    }

    // 3. Check if the caregiver is already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: caregiverId,
        courseId: courseId,
      },
    })

    if (existingEnrollment) {
      return NextResponse.json({ success: false, message: 'Caregiver is already enrolled in this course' }, { status: 409 })
    }

    // 4. Create a payment record for the sponsorship
    const paymentReference = `SPONSOR-${agencyId.slice(0, 8)}-${courseId.slice(0, 8)}-${Date.now()}`
    
    const payment = await prisma.payment.create({
      data: {
        userId: agencyId, // Payment is by the agency
        courseId: courseId,
        reference: paymentReference,
        amount: course.priceKES, // Assuming KES for now, adjust as needed
        currency: 'KES',
        status: 'SUCCESS',
        paymentMethod: 'SPONSORED',
        channel: 'agency_sponsorship',
        paidAt: new Date(),
        metadata: JSON.stringify({
          sponsoredCaregiverId: caregiverId,
          sponsoredCaregiverEmail: caregiver.email,
          agencyName: session.user.name,
        }),
      },
    })

    // 5. Create the enrollment for the caregiver
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: caregiverId,
        courseId: courseId,
        status: 'ACTIVE',
      },
    })

    // TODO: In a real-world scenario, you might want to trigger notifications here
    // e.g., email the caregiver that they've been enrolled.

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
