import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export type UploadType = 'video' | 'image' | 'document'

export interface UploadOptions {
  folder?: string
  resourceType?: 'image' | 'video' | 'raw' | 'auto'
  transformation?: any[]
  publicId?: string
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

/**
 * Upload a file to Cloudinary
 * @param file - File data (base64 string or buffer)
 * @param type - Type of upload (video, image, document)
 * @param options - Additional upload options
 * @returns Upload result with URL and metadata
 */
export async function uploadToCloudinary(
  file: string,
  type: UploadType,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    // Determine resource type based on upload type
    let resourceType: 'image' | 'video' | 'raw' = 'image'
    if (type === 'video') {
      resourceType = 'video'
    } else if (type === 'document') {
      resourceType = 'raw'
    }

    // Set default folder based on type
    const folder = options.folder || `mamaplus/${type}s`

    // Configure upload options
    const uploadOptions: any = {
      resource_type: options.resourceType || resourceType,
      folder,
      use_filename: true,
      unique_filename: true,
    }

    if (options.publicId) {
      uploadOptions.public_id = options.publicId
    }

    // Add transformations for images and videos
    if (type === 'image' && !options.transformation) {
      uploadOptions.transformation = [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 1920, height: 1080, crop: 'limit' },
      ]
    } else if (type === 'video' && !options.transformation) {
      uploadOptions.transformation = [
        { quality: 'auto', fetch_format: 'auto' },
      ]
    } else if (options.transformation) {
      uploadOptions.transformation = options.transformation
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file, uploadOptions)

    return {
      success: true,
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      width: result.width,
      height: result.height,
      duration: result.duration,
    }
  } catch (error: any) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error.message || 'Upload failed',
    }
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - Public ID of the file to delete
 * @param resourceType - Type of resource (image, video, raw)
 * @returns Success status
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })

    if (result.result === 'ok' || result.result === 'not found') {
      return { success: true }
    }

    return {
      success: false,
      error: 'Failed to delete file',
    }
  } catch (error: any) {
    console.error('Cloudinary delete error:', error)
    return {
      success: false,
      error: error.message || 'Delete failed',
    }
  }
}

/**
 * Extract public ID from Cloudinary URL
 * @param url - Full Cloudinary URL
 * @returns Public ID or null
 */
export function extractPublicId(url: string): string | null {
  try {
    // Match pattern: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Get resource type from URL or file extension
 * @param urlOrExtension - URL or file extension
 * @returns Resource type
 */
export function getResourceType(urlOrExtension: string): 'image' | 'video' | 'raw' {
  const ext = urlOrExtension.toLowerCase()
  
  if (ext.includes('/video/') || /\.(mp4|mov|avi|wmv|flv|webm|mkv)$/.test(ext)) {
    return 'video'
  }
  
  if (ext.includes('/image/') || /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/.test(ext)) {
    return 'image'
  }
  
  return 'raw'
}

/**
 * Validate file size
 * @param sizeInBytes - File size in bytes
 * @param type - Upload type
 * @returns Is valid and error message if invalid
 */
export function validateFileSize(
  sizeInBytes: number,
  type: UploadType
): { valid: boolean; error?: string } {
  const limits = {
    video: 500 * 1024 * 1024, // 500MB
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
  }

  const limit = limits[type]
  if (sizeInBytes > limit) {
    const limitMB = limit / (1024 * 1024)
    return {
      valid: false,
      error: `File size exceeds ${limitMB}MB limit for ${type}s`,
    }
  }

  return { valid: true }
}

/**
 * Validate file type
 * @param mimeType - MIME type of the file
 * @param type - Upload type
 * @returns Is valid and error message if invalid
 */
export function validateFileType(
  mimeType: string,
  type: UploadType
): { valid: boolean; error?: string } {
  const allowedTypes = {
    video: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/webm', 'video/x-matroska'],
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  }

  if (!allowedTypes[type].includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type for ${type}. Allowed types: ${allowedTypes[type].join(', ')}`,
    }
  }

  return { valid: true }
}

export default cloudinary
