'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Cropper from 'react-easy-crop'
import { getRoleDisplayName, getRoleBadgeColor } from '@/lib/roles'
import { AdminHeader } from '@/components/admin/admin-header'

type AdminProfile = {
  name: string
  email: string
  role: string
  adminSince: string
  profilePicture?: string
  isOAuthUser?: boolean
}

const defaultAdminProfile: AdminProfile = {
  name: 'Admin User',
  email: 'admin@mamaplus.com',
  role: 'Super Administrator',
  adminSince: '2025-06-01',
  profilePicture: ''
}

type CourseStats = {
  totalCourses: number
  totalStudents: number
  totalRevenue: number
}

const dummyStats: CourseStats = {
  totalCourses: 12,
  totalStudents: 347,
  totalRevenue: 12456.78
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = new window.Image()
  image.src = imageSrc
  await new Promise<void>(resolve => { image.onload = () => resolve() })
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas is empty')), 'image/jpeg', 0.95)
  })
}

export default function AdminProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<AdminProfile>(defaultAdminProfile)
  const [stats, setStats] = useState<CourseStats>(dummyStats)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(profile.name)
  const [editedEmail, setEditedEmail] = useState(profile.email)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [pendingPreview, setPendingPreview] = useState<string | null>(null)
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (status === 'loading') return
    
    if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
      window.location.href = '/login'
      return
    }

    // Load from DB
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/me')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            const dbUser = data.data
            const dbProfile: AdminProfile = {
              name: dbUser.name || defaultAdminProfile.name,
              email: dbUser.email || defaultAdminProfile.email,
              role: dbUser.role || 'ADMIN',
              adminSince: dbUser.createdAt || defaultAdminProfile.adminSince,
              profilePicture: dbUser.avatar || '',
              isOAuthUser: !dbUser.password || dbUser.password === '',
            }
            setProfile(dbProfile)
            setEditedName(dbProfile.name)
            setEditedEmail(dbProfile.email)
            return
          }
        }
      } catch {
        // Ignore errors
      }

      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('admin:profile')
        if (saved) {
          const parsed = JSON.parse(saved)
          setProfile(parsed)
          setEditedName(parsed.name)
          setEditedEmail(parsed.email)
        } else {
          localStorage.setItem('admin:profile', JSON.stringify(defaultAdminProfile))
        }
      } catch {
        // Ignore errors
      }
    }

    fetchProfile()
  }, [router, status, session])

  const saveProfile = async () => {
    setSaveError(null)
    setSaveSuccess(null)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName, email: editedEmail }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setSaveError(data.message || 'Failed to save profile')
        return
      }
      const updated = { ...profile, name: editedName, email: editedEmail }
      setProfile(updated)
      setSaveSuccess('Profile saved successfully')
    } catch {
      setSaveError('Failed to save profile')
    }
    setIsEditing(false)
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB'); return }
    const objectUrl = URL.createObjectURL(file)
    setImageToCrop(objectUrl)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCropModalOpen(true)
    e.target.value = ''
  }

  const handleCropComplete = (_: unknown, pixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(pixels)
  }

  const handleConfirmCrop = async () => {
    if (!imageToCrop || !croppedAreaPixels) return
    try {
      const blob = await getCroppedImg(imageToCrop, croppedAreaPixels)
      const previewUrl = URL.createObjectURL(blob)
      if (pendingPreview) URL.revokeObjectURL(pendingPreview)
      setPendingBlob(blob)
      setPendingPreview(previewUrl)
      setCropModalOpen(false)
      URL.revokeObjectURL(imageToCrop)
      setImageToCrop(null)
    } catch {
      alert('Failed to crop image')
    }
  }

  const handleSavePhoto = async () => {
    if (!pendingBlob) return
    setUploadingPicture(true)
    try {
      const formData = new FormData()
      formData.append('file', pendingBlob, 'avatar.jpg')
      const res = await fetch('/api/users/me/avatar', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok || !data.success) { alert(data.message || 'Upload failed'); return }
      setProfile(prev => ({ ...prev, profilePicture: data.data.avatarUrl }))
      if (pendingPreview) { URL.revokeObjectURL(pendingPreview); setPendingPreview(null) }
      setPendingBlob(null)
      setSaveSuccess('Profile picture updated successfully')
    } catch {
      alert('Failed to upload profile picture')
    } finally {
      setUploadingPicture(false)
    }
  }

  const discardPendingPhoto = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview)
    setPendingPreview(null)
    setPendingBlob(null)
  }

  const removeProfilePicture = async () => {
    try { await fetch('/api/users/me/avatar', { method: 'DELETE' }) } catch {}
    setProfile(prev => ({ ...prev, profilePicture: '' }))
  }

  const handlePasswordChange = async () => {
    setPasswordError(null)
    setPasswordSuccess(null)
    if (!newPassword || !currentPassword) { setPasswordError('Please fill in all password fields'); return }
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match'); return }
    if (newPassword.length < 8) { setPasswordError('New password must be at least 8 characters'); return }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) { setPasswordError(data.message || 'Failed to update password'); return }
      setPasswordSuccess('Password updated successfully')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch {
      setPasswordError('Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader active="profile" />

      <div className="max-w-6xl mx-auto px-6 py-8 pt-8">
        <h1 className="text-3xl font-bold mb-6">Admin Profile</h1>

        {/* Personal Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            {!isEditing ? (
              <button onClick={() => { setIsEditing(true); setSaveError(null); setSaveSuccess(null) }} className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90">
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={saveProfile} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                  Save
                </button>
                <button onClick={() => { setIsEditing(false); setEditedName(profile.name); setEditedEmail(profile.email); setSaveError(null) }} className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            )}
          </div>

          {saveError && <div className="mb-4 rounded bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{saveError}</div>}
          {saveSuccess && <div className="mb-4 rounded bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-sm">{saveSuccess}</div>}

          {/* Profile Picture Section */}
          <div className="flex items-center gap-6 mb-6 pb-6 border-b">
            <div className="relative flex-shrink-0">
              {pendingPreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pendingPreview} alt="Preview" className="rounded-full object-cover border-4 border-amber-400 w-[120px] h-[120px]" />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">Preview</span>
                </div>
              ) : profile.profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profilePicture} alt="Profile" className="rounded-full object-cover border-4 border-primary/20 w-[120px] h-[120px]" />
              ) : (
                <div className="w-[120px] h-[120px] rounded-full bg-gray-200 flex items-center justify-center border-4 border-primary/20">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Profile Picture</h3>
              <p className="text-sm text-gray-600 mb-3">
                {pendingPreview ? 'Looking good! Save the photo to apply it to your profile.' : 'Upload a photo to personalize your profile'}
              </p>
              {pendingPreview ? (
                <div className="flex flex-wrap gap-2">
                  <button onClick={handleSavePhoto} disabled={uploadingPicture} className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
                    {uploadingPicture ? 'Saving...' : 'Save Photo'}
                  </button>
                  <label className="px-4 py-2 bg-primary text-white rounded text-sm cursor-pointer hover:bg-primary/90 inline-block">
                    Re-crop
                    <input type="file" accept="image/*" onChange={handleProfilePictureChange} disabled={uploadingPicture} className="hidden" />
                  </label>
                  <button onClick={discardPendingPhoto} className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                    Discard
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label className="px-4 py-2 bg-primary text-white rounded text-sm cursor-pointer hover:bg-primary/90 inline-block">
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
                  </label>
                  {profile.profilePicture && (
                    <button onClick={removeProfilePicture} className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                      Remove
                    </button>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Maximum file size: 5MB. Accepted formats: JPG, PNG, GIF, WebP</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
              {isEditing ? (
                <input value={editedName} onChange={e => setEditedName(e.target.value)} className="w-full border px-3 py-2 rounded" />
              ) : (
                <p className="text-foreground">{profile.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              {isEditing ? (
                <input type="email" value={editedEmail} onChange={e => setEditedEmail(e.target.value)} className="w-full border px-3 py-2 rounded" />
              ) : (
                <p className="text-foreground">{profile.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(session?.user?.role || 'ADMIN')}`}>
                  {getRoleDisplayName(session?.user?.role || 'ADMIN')}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Admin Since</label>
              <p className="text-foreground">{new Date(profile.adminSince).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Change Password</h2>
            <button
              onClick={() => { setShowPasswordSection(v => !v); setPasswordError(null); setPasswordSuccess(null) }}
              className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
            >
              {showPasswordSection ? 'Close' : 'Change Password'}
            </button>
          </div>
          {profile.isOAuthUser && (
            <p className="text-sm text-muted-foreground">Password changes are not available for accounts signed in with Google or Microsoft.</p>
          )}
          {!profile.isOAuthUser && showPasswordSection && (
            <div className="space-y-3 max-w-md">
              {passwordError && <div className="rounded bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{passwordError}</div>}
              {passwordSuccess && <div className="rounded bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-sm">{passwordSuccess}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full border px-3 py-2 rounded" autoComplete="current-password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border px-3 py-2 rounded" autoComplete="new-password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border px-3 py-2 rounded" autoComplete="new-password" />
              </div>
              <button onClick={handlePasswordChange} disabled={savingPassword} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50">
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>

        {/* Platform Stats */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Total Courses</p>
              <p className="text-3xl font-bold text-primary">{stats.totalCourses}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Admin Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-muted-foreground">Course "Infant Nutrition" created - 2 days ago</p>
            </div>
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-muted-foreground">User "Jane Doe" enrolled in "Maternal Health" - 3 days ago</p>
            </div>
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm text-muted-foreground">Course "Caregiving 101" updated - 5 days ago</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm text-muted-foreground">New payment received $29.99 - 1 week ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {cropModalOpen && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold">Crop Photo</h3>
              <button
                onClick={() => { setCropModalOpen(false); URL.revokeObjectURL(imageToCrop); setImageToCrop(null) }}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
              >&times;</button>
            </div>
            <div className="relative w-full bg-gray-900" style={{ height: 340 }}>
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <span className="text-xs text-gray-500 w-10 text-right">{zoom.toFixed(1)}x</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">Drag to reposition · scroll or use the slider to zoom</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setCropModalOpen(false); URL.revokeObjectURL(imageToCrop); setImageToCrop(null) }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCrop}
                  className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90"
                >
                  Confirm Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
