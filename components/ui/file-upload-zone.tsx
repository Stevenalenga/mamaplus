'use client'

import React, { useState, useRef, DragEvent } from 'react'
import { Upload, X, FileIcon, Loader2, Image as ImageIcon, VideoIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type FileUploadType = 'video' | 'image' | 'document'

interface FileUploadZoneProps {
  type: FileUploadType
  onUploadComplete: (url: string, publicId: string) => void
  onUploadError?: (error: string) => void
  accept?: string
  maxSizeMB?: number
  disabled?: boolean
  currentUrl?: string
  onRemove?: () => void
  folder?: string
}

export function FileUploadZone({
  type,
  onUploadComplete,
  onUploadError,
  accept,
  maxSizeMB,
  disabled = false,
  currentUrl,
  onRemove,
  folder,
}: FileUploadZoneProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Default accept patterns based on type
  const defaultAccept = {
    video: 'video/mp4,video/quicktime,video/x-msvideo,video/webm',
    image: 'image/jpeg,image/png,image/gif,image/webp',
    document: 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }

  // Default max sizes
  const defaultMaxSize = {
    video: 500,
    image: 5,
    document: 10,
  }

  const acceptPattern = accept || defaultAccept[type]
  const maxSize = (maxSizeMB || defaultMaxSize[type]) * 1024 * 1024

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled || uploading) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled || uploading) return

    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Validate file size
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024))
      const error = `File size exceeds ${sizeMB}MB limit`
      onUploadError?.(error)
      return
    }

    // Validate file type
    const acceptedTypes = acceptPattern.split(',').map(t => t.trim())
    if (!acceptedTypes.some(t => file.type.match(t.replace('*', '.*')))) {
      const error = `Invalid file type. Accepted types: ${acceptPattern}`
      onUploadError?.(error)
      return
    }

    // Upload file
    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      if (folder) {
        formData.append('folder', folder)
      }

      // Simulate progress (since fetch doesn't provide real upload progress easily)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Upload failed')
      }

      const data = await response.json()
      if (data.success && data.data.secureUrl) {
        onUploadComplete(data.data.secureUrl, data.data.publicId)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      onUploadError?.(error.message || 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const getIcon = () => {
    if (type === 'video') return <VideoIcon className="w-12 h-12 text-gray-400" />
    if (type === 'image') return <ImageIcon className="w-12 h-12 text-gray-400" />
    return <FileIcon className="w-12 h-12 text-gray-400" />
  }

  const getLabel = () => {
    if (type === 'video') return 'video'
    if (type === 'image') return 'image'
    return 'document'
  }

  // If there's a current URL, show preview with remove option
  if (currentUrl && !uploading) {
    return (
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {type === 'image' && (
              <img
                src={currentUrl}
                alt="Preview"
                className="w-16 h-16 object-cover rounded"
              />
            )}
            {type === 'video' && (
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                <VideoIcon className="w-8 h-8 text-gray-600" />
              </div>
            )}
            {type === 'document' && (
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                <FileIcon className="w-8 h-8 text-gray-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Current {getLabel()}</p>
              <p className="text-xs text-gray-500 truncate">{currentUrl}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClick}
              disabled={disabled}
            >
              Replace
            </Button>
            {onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRemove}
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptPattern}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    )
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive
          ? 'border-primary bg-primary/5'
          : 'border-gray-300 hover:border-gray-400'
      } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={!uploading && !disabled ? handleClick : undefined}
    >
      {uploading ? (
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">Uploading {getLabel()}...</p>
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">{progress}%</p>
        </div>
      ) : (
        <>
          {getIcon()}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              <span className="text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {type === 'video' && 'MP4, MOV, or WebM (max 500MB)'}
              {type === 'image' && 'JPG, PNG, or GIF (max 5MB)'}
              {type === 'document' && 'PDF or DOCX (max 10MB)'}
            </p>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptPattern}
        onChange={handleChange}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  )
}
