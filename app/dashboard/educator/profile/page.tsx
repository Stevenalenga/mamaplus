'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { getRoleDisplayName, getRoleBadgeColor } from '@/lib/roles'
import EducatorHeader from '@/components/educator/educator-header'

type EducatorProfile = {
  name: string
  email: string
  profilePicture?: string
}

const defaultProfile: EducatorProfile = {
  name: 'Educator',
  email: 'educator@example.com',
  profilePicture: '',
}

export default function EducatorProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<EducatorProfile>(defaultProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(profile.name)
  const [editedEmail, setEditedEmail] = useState(profile.email)
  const [uploadingPicture, setUploadingPicture] = useState(false)

  const userRole = (session?.user as any)?.role || 'INSTRUCTOR'

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      window.location.href = '/login'
      return
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/me')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            const dbUser = data.data
            const dbProfile: EducatorProfile = {
              name: dbUser.name || '',
              email: dbUser.email || '',
              profilePicture: dbUser.avatar || '',
            }
            setProfile(dbProfile)
            setEditedName(dbProfile.name)
            setEditedEmail(dbProfile.email)
            return
          }
        }
      } catch {}

      // Fallback to session
      const sessionProfile = {
        ...defaultProfile,
        name: session?.user?.name || defaultProfile.name,
        email: session?.user?.email || defaultProfile.email,
        profilePicture: (session?.user as any)?.image || '',
      }
      setProfile(sessionProfile)
      setEditedName(sessionProfile.name)
      setEditedEmail(sessionProfile.email)
    }

    fetchProfile()
  }, [status, session])

  const saveProfile = () => {
    const updated = { ...profile, name: editedName, email: editedEmail }
    setProfile(updated)
    try { localStorage.setItem('educator:profile', JSON.stringify(updated)) } catch {}
    setIsEditing(false)
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('File size must be less than 2MB'); return }

    setUploadingPicture(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      const updated = { ...profile, profilePicture: base64String }
      setProfile(updated)
      try { localStorage.setItem('educator:profile', JSON.stringify(updated)) } catch {}
      setUploadingPicture(false)
    }
    reader.readAsDataURL(file)
  }

  const removeProfilePicture = () => {
    const updated = { ...profile, profilePicture: '' }
    setProfile(updated)
    try { localStorage.setItem('educator:profile', JSON.stringify(updated)) } catch {}
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EducatorHeader currentPage="profile" />

      <div className="max-w-6xl mx-auto px-6 py-8 pt-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/educator')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-3 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>

        {/* Role / Access Level Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Access Level</h2>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getRoleBadgeColor(userRole)}`}>
              {getRoleDisplayName(userRole)}
            </span>
            <p className="text-sm text-muted-foreground">You can manage your own courses and view enrolled students.</p>
          </div>
        </div>

        {/* Personal Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90">Edit</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={saveProfile} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                <button onClick={() => { setIsEditing(false); setEditedName(profile.name); setEditedEmail(profile.email) }} className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Cancel</button>
              </div>
            )}
          </div>

          {/* Profile Picture Section */}
          <div className="flex items-center gap-6 mb-6 pb-6 border-b">
            <div className="relative">
              {profile.profilePicture ? (
                <Image src={profile.profilePicture} alt="Profile" width={120} height={120} className="rounded-full object-cover border-4 border-primary/20" />
              ) : (
                <div className="w-30 h-30 rounded-full bg-gray-200 flex items-center justify-center border-4 border-primary/20">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Profile Picture</h3>
              <p className="text-sm text-gray-600 mb-3">Upload a photo to personalize your profile</p>
              <div className="flex gap-2">
                <label className="px-4 py-2 bg-primary text-white rounded text-sm cursor-pointer hover:bg-primary/90 inline-block">
                  {uploadingPicture ? 'Uploading...' : 'Upload Photo'}
                  <input type="file" accept="image/*" onChange={handleProfilePictureChange} disabled={uploadingPicture} className="hidden" />
                </label>
                {profile.profilePicture && (
                  <button onClick={removeProfilePicture} className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">Remove</button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Maximum file size: 2MB. Accepted formats: JPG, PNG, GIF</p>
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
          </div>
        </div>
      </div>
    </div>
  )
}
