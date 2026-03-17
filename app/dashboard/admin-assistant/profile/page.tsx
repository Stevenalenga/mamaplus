'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Bell } from 'lucide-react'
import { getRoleDisplayName, getRoleBadgeColor } from '@/lib/roles'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type AdminAssistantProfile = {
  name: string
  email: string
  profilePicture?: string
}

const defaultProfile: AdminAssistantProfile = {
  name: 'Admin Assistant',
  email: 'assistant@mamaplus.com',
  profilePicture: '',
}

export default function AdminAssistantProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<AdminAssistantProfile>(defaultProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(profile.name)
  const [editedEmail, setEditedEmail] = useState(profile.email)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'New Enrollment', message: 'A new student enrolled', time: '2 hours ago', read: false },
    { id: '2', title: 'Course Update', message: 'Maternal Health course was updated', time: '1 day ago', read: false },
    { id: '3', title: 'Welcome', message: 'Welcome to MamaPlus admin portal', time: '3 days ago', read: true },
  ])
  const unreadCount = notifications.filter(n => !n.read).length
  const markAsRead = (id: string) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllAsRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })))

  const userRole = (session?.user as any)?.role || 'ADMIN_ASSISTANT'

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
            const dbProfile: AdminAssistantProfile = {
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
    try { localStorage.setItem('admin-assistant:profile', JSON.stringify(updated)) } catch {}
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
      try { localStorage.setItem('admin-assistant:profile', JSON.stringify(updated)) } catch {}
      setUploadingPicture(false)
    }
    reader.readAsDataURL(file)
  }

  const removeProfilePicture = () => {
    const updated = { ...profile, profilePicture: '' }
    setProfile(updated)
    try { localStorage.setItem('admin-assistant:profile', JSON.stringify(updated)) } catch {}
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    window.location.href = '/login'
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
      {/* Navigation Bar */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/admin-assistant" className="flex items-center gap-2">
              <Image src="/logo.png" alt="MamaPlus" width={240} height={240} className="object-contain" />
            </Link>
            <Link href="/dashboard/admin-assistant" className="text-sm text-muted-foreground hover:text-primary">Home</Link>
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary">Browse Courses</Link>
            <Link href="/dashboard/admin-assistant/profile" className="text-sm font-semibold text-primary border-b-2 border-primary">My Profile</Link>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative p-2 text-gray-700 hover:text-primary transition rounded-full hover:bg-gray-100 border border-gray-200">
                  <Bell className="w-5 h-5 stroke-2" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 border-2 border-white animate-pulse" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">Mark all as read</button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 transition cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground mb-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground">{notification.time}</p>
                            </div>
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {session?.user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{session.user.name || session.user.email}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(userRole)}`}>
                  {getRoleDisplayName(userRole)}
                </span>
              </div>
            )}
            <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-primary">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 pt-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/admin-assistant')}
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
            <p className="text-sm text-muted-foreground">You can manage courses and schools. User management is reserved for full administrators.</p>
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
