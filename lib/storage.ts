import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

// Base directory for all uploads. Set UPLOAD_DIR in .env.local.
// In development it falls back to ./uploads relative to the project root.
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), 'uploads')

// Public URL base used to build file URLs returned to clients.
// Must be set to the full origin in production (e.g. https://mamaplus.co.ke).
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

export type UploadType = 'video' | 'image' | 'document'

export interface UploadOptions {
  folder?: string
}

export interface UploadResult {
  success: boolean
  url?: string
  secureUrl?: string
  publicId?: string
  resourceType?: string
  format?: string
  width?: number
  height?: number
  duration?: number
  error?: string
}

// Allowed MIME types per upload category
const ALLOWED_TYPES: Record<UploadType, string[]> = {
  video: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/webm', 'video/x-matroska'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
}

// Size limits per upload category
const SIZE_LIMITS: Record<UploadType, number> = {
  video: 500 * 1024 * 1024, // 500 MB
  image: 5 * 1024 * 1024,   // 5 MB
  document: 10 * 1024 * 1024, // 10 MB
}

// Map MIME type → file extension
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
  'video/x-ms-wmv': 'wmv',
  'video/webm': 'webm',
  'video/x-matroska': 'mkv',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

/**
 * Write a base64-encoded data URL to disk and return a public URL.
 * The `publicId` in the result is the subpath relative to UPLOAD_DIR
 * (e.g. "mamaplus/avatars/abc123.jpg") and is used for deletion.
 */
export async function uploadToStorage(
  file: string, // base64 data URL: "data:<mime>;base64,<data>"
  type: UploadType,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    // Parse data URL
    const match = file.match(/^data:([^;]+);base64,(.+)$/)
    if (!match) {
      return { success: false, error: 'Invalid file data' }
    }
    const mimeType = match[1]
    const base64Data = match[2]

    const ext = MIME_TO_EXT[mimeType] || 'bin'
    const folder = options.folder || `mamaplus/${type}s`

    // Prevent directory traversal: only allow alphanumeric, hyphen, underscore, forward slash
    if (!/^[\w\-/]+$/.test(folder)) {
      return { success: false, error: 'Invalid folder name' }
    }

    const filename = `${crypto.randomUUID()}.${ext}`
    const relPath = path.posix.join(folder, filename) // always use posix for the URL segment

    // Resolve to absolute path on disk
    const absFolder = path.join(UPLOAD_DIR, ...folder.split('/'))
    const absFile = path.join(absFolder, filename)

    // Ensure the target directory exists
    await fs.mkdir(absFolder, { recursive: true })

    // Write file
    await fs.writeFile(absFile, Buffer.from(base64Data, 'base64'))

    const fileUrl = `${APP_URL}/api/files/${relPath}`

    return {
      success: true,
      url: fileUrl,
      secureUrl: fileUrl,
      publicId: relPath,
      resourceType: type === 'video' ? 'video' : type === 'document' ? 'raw' : 'image',
      format: ext,
    }
  } catch (error: any) {
    console.error('Storage upload error:', error)
    return { success: false, error: error.message || 'Upload failed' }
  }
}

/**
 * Delete a previously uploaded file by its publicId (relative path).
 */
export async function deleteFromStorage(
  publicId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Prevent directory traversal
    const normalised = path.normalize(publicId).replace(/\\/g, '/')
    if (normalised.startsWith('..') || path.isAbsolute(normalised)) {
      return { success: false, error: 'Invalid file path' }
    }

    const absFile = path.join(UPLOAD_DIR, ...normalised.split('/'))
    await fs.unlink(absFile)
    return { success: true }
  } catch (error: any) {
    if (error.code === 'ENOENT') return { success: true } // already gone
    console.error('Storage delete error:', error)
    return { success: false, error: error.message || 'Delete failed' }
  }
}

/**
 * Validate file size against per-type limits.
 */
export function validateFileSize(
  sizeInBytes: number,
  type: UploadType
): { valid: boolean; error?: string } {
  const limit = SIZE_LIMITS[type]
  if (sizeInBytes > limit) {
    const limitMB = limit / (1024 * 1024)
    return { valid: false, error: `File size exceeds ${limitMB}MB limit for ${type}s` }
  }
  return { valid: true }
}

/**
 * Validate MIME type against allowed types for this upload category.
 */
export function validateFileType(
  mimeType: string,
  type: UploadType
): { valid: boolean; error?: string } {
  const allowed = ALLOWED_TYPES[type]
  if (!allowed.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type for ${type}. Allowed types: ${allowed.join(', ')}`,
    }
  }
  return { valid: true }
}
