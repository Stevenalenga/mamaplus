'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Bell } from 'lucide-react'
import { getRoleDisplayName, getRoleBadgeColor, getDashboardForRole } from '@/lib/roles'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type EnrolledCourse = {
  id: string
  title: string
  amountPaid: number
  progress: number
  enrolledDate: string
}

type UserProfile = {
  id?: string
  name: string
  email: string
  enrolledCourses: EnrolledCourse[]
  profilePicture?: string
}

const defaultProfile: UserProfile = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  profilePicture: '',
  enrolledCourses: [],
}

export default function UserProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(profile.name)
  const [editedEmail, setEditedEmail] = useState(profile.email)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'New Course Available', message: 'Maternal Health Basics course is now available', time: '2 hours ago', read: false },
    { id: '2', title: 'Certificate Ready', message: 'Your certificate for Infant Nutrition is ready to download', time: '1 day ago', read: false },
    { id: '3', title: 'Welcome to MamaPlus', message: 'Thank you for joining our caregiving community', time: '3 days ago', read: true },
  ])

  const unreadCount = notifications.filter(n => !n.read).length
  const markAsRead = (id: string) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllAsRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })))

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      window.location.href = '/login'
      return
    }

    const userRole = (session?.user as any)?.role
    if (userRole && userRole !== 'USER') {
      window.location.href = getDashboardForRole(userRole)
      return
    }

    const fetchProfile = async () => {
      try {
        const [userRes, enrollmentsRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch('/api/enrollments'),
        ])

        let dbProfile = defaultProfile
        if (userRes.ok) {
          const userData = await userRes.json()
          if (userData.success && userData.data) {
            const dbUser = userData.data
            dbProfile = {
              id: dbUser.id,
              name: dbUser.name || '',
              email: dbUser.email || '',
              profilePicture: dbUser.avatar || '',
              enrolledCourses: [],
            }
          }
        }

        if (enrollmentsRes.ok) {
          const enrollmentData = await enrollmentsRes.json()
          if (enrollmentData.success) {
            const enrolledCourses: EnrolledCourse[] = (enrollmentData.data || []).map((enrollment: any) => ({
              id: enrollment.courseId,
              title: enrollment.course?.title || 'Untitled Course',
              amountPaid: enrollment.course?.currency === 'KES'
                ? (enrollment.course?.priceKES || 0)
                : (enrollment.course?.priceUSD || 0),
              progress: enrollment.progress || 0,
              enrolledDate: enrollment.createdAt,
            }))

            dbProfile.enrolledCourses = enrolledCourses
          }
        }

        setProfile(dbProfile)
        setEditedName(dbProfile.name)
        setEditedEmail(dbProfile.email)
      } catch {
        const fallbackProfile = {
          ...defaultProfile,
          name: session?.user?.name || defaultProfile.name,
          email: session?.user?.email || defaultProfile.email,
          profilePicture: session?.user?.image || '',
        }
        setProfile(fallbackProfile)
        setEditedName(fallbackProfile.name)
        setEditedEmail(fallbackProfile.email)
      }
    }

    fetchProfile()
  }, [status, session])

  const saveProfile = async () => {
    const updated = { ...profile, name: editedName, email: editedEmail }
    setProfile(updated)

    try {
      if (profile.id) {
        await fetch(`/api/users/${profile.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editedName,
          }),
        })
      }
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
      setUploadingPicture(false)
    }
    reader.readAsDataURL(file)
  }

  const removeProfilePicture = () => {
    const updated = { ...profile, profilePicture: '' }
    setProfile(updated)
  }

  const downloadCertificate = (courseName: string) => {
    const certificateText = `
═══════════════════════════════════════════════════════════════
                    CERTIFICATE OF COMPLETION
═══════════════════════════════════════════════════════════════

                          MamaPlus Platform

This is to certify that

                          ${profile.name}

has successfully completed the course

                      ${courseName}

on ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════════
    `
    const blob = new Blob([certificateText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${courseName.replace(/\s+/g, '_')}_Certificate.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const totalSpent = profile.enrolledCourses.reduce((sum, c) => sum + c.amountPaid, 0)
  const avgProgress = profile.enrolledCourses.length > 0
    ? Math.round(profile.enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / profile.enrolledCourses.length)
    : 0

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
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/user" className="flex items-center gap-2">
              <Image src="/logo.png" alt="MamaPlus" width={240} height={240} className="object-contain" />
            </Link>
            <Link href="/dashboard/user" className="text-sm text-muted-foreground hover:text-primary">Home</Link>
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary">Browse Courses</Link>
            <Link href="/dashboard/user/profile" className="text-sm font-semibold text-primary border-b-2 border-primary">My Profile</Link>
          </div>
          <div className="flex items-center gap-4">
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
                <span className="text-sm text-muted-foreground">
                  {session.user.name || session.user.email}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(session.user.role)}`}>
                  {getRoleDisplayName(session.user.role)}
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
            onClick={() => router.push('/dashboard/user')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-3 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Access Level</h2>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getRoleBadgeColor(session?.user?.role)}`}>
              {getRoleDisplayName(session?.user?.role)}
            </span>
            <p className="text-sm text-muted-foreground">You have student access to browse and enroll in courses.</p>
          </div>
        </div>

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
                <button onClick={() => { setIsEditing(false); setEditedName(profile.name); setEditedEmail(profile.email) }} className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            )}
          </div>

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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Courses Enrolled</p>
            <p className="text-3xl font-bold text-primary">{profile.enrolledCourses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p className="text-3xl font-bold text-green-600">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Average Progress</p>
            <p className="text-3xl font-bold text-blue-600">{avgProgress}%</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Enrolled Courses</h2>
            <button
              onClick={() => router.push('/courses')}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Browse Courses to Enroll
            </button>
          </div>
          {profile.enrolledCourses.length === 0 ? (
            <p className="text-muted-foreground">No courses enrolled yet.</p>
          ) : (
            <div className="space-y-4">
              {profile.enrolledCourses.map(course => (
                <div key={course.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">Enrolled on {new Date(course.enrolledDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Amount Paid</p>
                      <p className="text-lg font-semibold text-green-600">${course.amountPaid.toFixed(2)}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-600">Progress</p>
                      <p className="text-sm font-semibold text-primary">{course.progress}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      {course.progress === 100 ? (
                        <p className="text-sm text-green-600 font-semibold">✓ Completed</p>
                      ) : (
                        <button
                          onClick={() => router.push(`/dashboard/user/courses/${course.id}`)}
                          className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary/90"
                        >
                          Continue Course
                        </button>
                      )}
                      {course.progress === 100 && (
                        <button
                          onClick={() => downloadCertificate(course.title)}
                          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Certificate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
