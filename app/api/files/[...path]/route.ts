import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), 'uploads')

// Map common extensions → MIME types
const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  wmv: 'video/x-ms-wmv',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

/**
 * GET /api/files/[...path]
 * Serves files stored in UPLOAD_DIR.
 * Path traversal attempts are rejected.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const segments = params.path

    // Reject any segment that would traverse upward
    if (!segments || segments.length === 0 || segments.some(s => s === '..' || s === '.')) {
      return NextResponse.json({ success: false, message: 'Invalid path' }, { status: 400 })
    }

    const absFile = path.join(UPLOAD_DIR, ...segments)

    // Ensure the resolved path stays inside UPLOAD_DIR
    const resolved = path.resolve(absFile)
    if (!resolved.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    let fileBuffer: Buffer
    try {
      fileBuffer = await fs.readFile(resolved)
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return NextResponse.json({ success: false, message: 'File not found' }, { status: 404 })
      }
      throw err
    }

    const ext = path.extname(resolved).slice(1).toLowerCase()
    const contentType = EXT_TO_MIME[ext] || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(fileBuffer.length),
      },
    })
  } catch (error: any) {
    console.error('File serve error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
