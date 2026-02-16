'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type AdminProfile = {
  name: string
  email: string
  role: string
  adminSince: string
  profilePicture?: string
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

export default function AdminProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<AdminProfile>(defaultAdminProfile)
  const [stats, setStats] = useState<CourseStats>(dummyStats)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(profile.name)
  const [editedEmail, setEditedEmail] = useState(profile.email)
  const [uploadingPicture, setUploadingPicture] = useState(false)

  useEffect(() => {
    // Validate session
    const currentUserType = localStorage.getItem('currentUserType')
    if (currentUserType !== 'admin') {
      router.push('/login')
      return
    }

    // Load from localStorage
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
  }, [router])

  const saveProfile = () => {
    const updated = { ...profile, name: editedName, email: editedEmail }
    setProfile(updated)
    try {
      localStorage.setItem('admin:profile', JSON.stringify(updated))
    } catch {}
    setIsEditing(false)
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB')
      return
    }

    setUploadingPicture(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      const updated = { ...profile, profilePicture: base64String }
      setProfile(updated)
      try {
        localStorage.setItem('admin:profile', JSON.stringify(updated))
      } catch {}
      setUploadingPicture(false)
    }
    reader.readAsDataURL(file)
  }

  const removeProfilePicture = () => {
    const updated = { ...profile, profilePicture: '' }
    setProfile(updated)
    try {
      localStorage.setItem('admin:profile', JSON.stringify(updated))
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/admin" className="flex items-center gap-2">
              <Image src="/logo.png" alt="MamaPlus" width={240} height={240} className="object-contain" />
            </Link>
            <Link href="/dashboard/admin" className="text-sm text-muted-foreground hover:text-primary">Home</Link>
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary">Browse Courses</Link>
            <Link href="/dashboard/admin/profile" className="text-sm font-semibold text-primary border-b-2 border-primary">My Profile</Link>
          </div>
          <button onClick={() => { localStorage.removeItem('currentUserType'); router.push('/login'); }} className="text-sm text-muted-foreground hover:text-primary">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 pt-8">
        <h1 className="text-3xl font-bold mb-6">Admin Profile</h1>

        {/* Personal Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90">
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={saveProfile} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                  Save
                </button>
                <button onClick={() => { setIsEditing(false); setEditedName(profile.name); setEditedEmail(profile.email); }} className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Profile Picture Section */}
          <div className="flex items-center gap-6 mb-6 pb-6 border-b">
            <div className="relative">
              {profile.profilePicture ? (
                <Image 
                  src={profile.profilePicture} 
                  alt="Profile" 
                  width={120} 
                  height={120} 
                  className="rounded-full object-cover border-4 border-primary/20"
                />
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
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfilePictureChange}
                    disabled={uploadingPicture}
                    className="hidden"
                  />
                </label>
                {profile.profilePicture && (
                  <button 
                    onClick={removeProfilePicture}
                    className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
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
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
              <p className="text-foreground font-semibold">{profile.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Admin Since</label>
              <p className="text-foreground">{new Date(profile.adminSince).toLocaleDateString()}</p>
            </div>
          </div>
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
    </div>
  )
}
