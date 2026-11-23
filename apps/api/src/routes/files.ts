import { promises as fs } from 'fs'
import path from 'path'
import { Hono, type Context } from 'hono'
import type { AppEnv } from '../types'
import { getUser, hasRole } from '../lib/auth'
import { ROLES } from '../lib/roles'
import {
  UPLOAD_DIR,
  deleteFromStorage,
  uploadToStorage,
  validateFileSize,
  validateFileType,
  type UploadType,
} from '../lib/storage'

export const filesRouter = new Hono<AppEnv>()

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

const UPLOAD_ROLES = [ROLES.INSTRUCTOR, ROLES.ADMIN, ROLES.ADMIN_ASSISTANT]
const DELETE_ROLES = [ROLES.INSTRUCTOR, ROLES.ADMIN]

/**
 * POST /api/upload
 * Upload a file. Requires instructor, admin, or admin assistant.
 */
filesRouter.post('/api/upload', async (c) => {
  try {
    const currentUser = getUser(c)
    if (!currentUser) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    if (!hasRole(currentUser, UPLOAD_ROLES)) {
      return c.json(
        { success: false, message: 'Only instructors and admins can upload files' },
        403
      )
    }

    const formData = await c.req.formData()
    const file = formData.get('file') as File | null
    const type = ((formData.get('type') as UploadType) || 'image') as UploadType
    const folder = formData.get('folder') as string | undefined

    if (!file) {
      return c.json({ success: false, message: 'No file provided' }, 400)
    }

    const typeValidation = validateFileType(file.type, type)
    if (!typeValidation.valid) {
      return c.json({ success: false, message: typeValidation.error }, 400)
    }

    const sizeValidation = validateFileSize(file.size, type)
    if (!sizeValidation.valid) {
      return c.json({ success: false, message: sizeValidation.error }, 400)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const result = await uploadToStorage(base64, type, { folder })

    if (!result.success) {
      return c.json({ success: false, message: result.error || 'Upload failed' }, 500)
    }

    return c.json(
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
      201
    )
  } catch (error: any) {
    console.error('Upload error:', error)
    return c.json({ success: false, message: error.message || 'Upload failed' }, 500)
  }
})

/**
 * POST and DELETE /api/upload/:publicId
 * publicId is a single path segment. The handler decodes it, matching the old route.
 */
async function deleteUploadedFile(c: Context<AppEnv>) {
  try {
    const currentUser = getUser(c)
    if (!currentUser) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    if (!hasRole(currentUser, DELETE_ROLES)) {
      return c.json(
        { success: false, message: 'Only instructors and admins can delete files' },
        403
      )
    }

    const publicId = decodeURIComponent(c.req.param('publicId') || '')

    if (!publicId) {
      return c.json({ success: false, message: 'No public ID provided' }, 400)
    }

    const result = await deleteFromStorage(publicId)

    if (!result.success) {
      return c.json({ success: false, message: result.error || 'Delete failed' }, 500)
    }

    return c.json({
      success: true,
      message: 'File deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete error:', error)
    return c.json({ success: false, message: error.message || 'Delete failed' }, 500)
  }
}

filesRouter.post('/api/upload/:publicId', deleteUploadedFile)
filesRouter.delete('/api/upload/:publicId', deleteUploadedFile)

/**
 * GET /api/files/*
 * Serves a file from UPLOAD_DIR. Path traversal is rejected.
 */
filesRouter.get('/api/files/*', async (c) => {
  try {
    const pathname = c.req.path
    const prefix = '/api/files/'
    const relative = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : ''
    const segments = relative.length === 0 ? [] : relative.split('/')

    if (segments.length === 0 || segments.some((segment) => segment === '..' || segment === '.')) {
      return c.json({ success: false, message: 'Invalid path' }, 400)
    }

    const absFile = path.join(UPLOAD_DIR, ...segments)
    const resolved = path.resolve(absFile)
    if (!resolved.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) {
      return c.json({ success: false, message: 'Forbidden' }, 403)
    }

    let fileBuffer: Buffer
    try {
      fileBuffer = await fs.readFile(resolved)
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return c.json({ success: false, message: 'File not found' }, 404)
      }
      throw err
    }

    const ext = path.extname(resolved).slice(1).toLowerCase()
    const contentType = EXT_TO_MIME[ext] || 'application/octet-stream'

    return c.body(fileBuffer as Uint8Array<ArrayBuffer>, 200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': String(fileBuffer.length),
    })
  } catch (error: any) {
    console.error('File serve error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})
