import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { deleteFromCloudinary, extractPublicId, getResourceType } from '@/lib/cloudinary'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * DELETE /api/upload/[publicId]
 * Delete a file from Cloudinary
 * Requires authentication and instructor/admin role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
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
        { success: false, message: 'Only instructors and admins can delete files' },
        { status: 403 }
      )
    }

    // Get publicId from params (URL encoded)
    const publicId = decodeURIComponent(params.publicId)

    if (!publicId) {
      return NextResponse.json(
        { success: false, message: 'No public ID provided' },
        { status: 400 }
      )
    }

    // Get resource type from query params or infer from publicId
    const { searchParams } = new URL(request.url)
    const resourceTypeParam = searchParams.get('resourceType') as 'image' | 'video' | 'raw' | null
    const resourceType = resourceTypeParam || getResourceType(publicId)

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId, resourceType)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Delete failed' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'File deleted successfully',
      }
    )
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Delete failed' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/upload/[publicId]
 * Alternative delete method using POST (for compatibility)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  return DELETE(request, { params })
}
