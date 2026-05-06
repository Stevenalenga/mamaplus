import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { uploadToStorage } from '@/lib/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

/**
 * POST /api/users/me/avatar
 * Upload a new profile picture for the authenticated user.
 * Accepts multipart/form-data with a single "file" field.
 */
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, message: 'Invalid file type. Only JPG, PNG, GIF and WebP images are allowed.' },
      { status: 400 },
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, message: 'File size exceeds 5MB limit.' },
      { status: 400 },
    )
  }

  const bytes = await file.arrayBuffer()
  const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`

  const result = await uploadToStorage(base64, 'image', {
    folder: 'mamaplus/avatars',
  })

  if (!result.success || !result.secureUrl) {
    return NextResponse.json(
      { success: false, message: result.error || 'Upload failed' },
      { status: 500 },
    )
  }

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: result.secureUrl },
  })

  return NextResponse.json({
    success: true,
    data: { avatarUrl: result.secureUrl },
    message: 'Profile picture updated successfully',
  })
}

/**
 * DELETE /api/users/me/avatar
 * Remove the profile picture for the authenticated user.
 */
export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: null },
  })

  return NextResponse.json({ success: true, message: 'Profile picture removed' })
}
