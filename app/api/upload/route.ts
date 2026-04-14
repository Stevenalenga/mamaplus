import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  uploadToCloudinary,
  validateFileSize,
  validateFileType,
  type UploadType,
} from '@/lib/cloudinary'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/upload
 * Upload a file to Cloudinary
 * Requires authentication and instructor/admin role
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is instructor or admin
    const userRole = (session.user as any).role
    if (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Only instructors and admins can upload files' },
        { status: 403 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as UploadType) || 'image'
    const folder = formData.get('folder') as string | undefined

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const typeValidation = validateFileType(file.type, type)
    if (!typeValidation.valid) {
      return NextResponse.json(
        { success: false, message: typeValidation.error },
        { status: 400 }
      )
    }

    // Validate file size
    const sizeValidation = validateFileSize(file.size, type)
    if (!sizeValidation.valid) {
      return NextResponse.json(
        { success: false, message: sizeValidation.error },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const result = await uploadToCloudinary(base64, type, { folder })

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Upload failed' },
        { status: 500 }
      )
    }

    // Return upload result
    return NextResponse.json(
      {
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: result.url,
          secureUrl: result.secureUrl,
          publicId: result.publicId,
          resourceType: result.resourceType,
          format: result.format,
          width: result.width,
          height: result.height,
          duration: result.duration,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
