'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type EnrolledCourse = {
  id: string
  title: string
  amountPaid: number
  progress: number // 0-100
  enrolledDate: string
  completedResources?: string[] // Array of resource IDs completed by this user
}

type AvailableCourse = {
  id: string
  title: string
  description: string
  price: number
}

type UserProfile = {
  name: string
  email: string
  enrolledCourses: EnrolledCourse[]
  profilePicture?: string
}

const availableCourses: AvailableCourse[] = [
  { id: '1', title: 'Introduction to Caregiving', description: 'Learn basic caregiving skills and techniques', price: 29.99 },
  { id: '2', title: 'Maternal Health Basics', description: 'Essential knowledge for maternal health care', price: 39.99 },
  { id: '3', title: 'Infant Nutrition', description: 'Comprehensive guide to infant and toddler nutrition', price: 24.99 },
  { id: '4', title: 'Child Development', description: 'Understanding child growth and development stages', price: 34.99 },
  { id: '5', title: 'Emergency Care', description: 'First aid and emergency response for caregivers', price: 44.99 },
  { id: '6', title: 'Mental Health Support', description: 'Supporting mental wellbeing in caregiving', price: 37.99 },
  { id: '7', title: 'Elderly Care Essentials', description: 'Specialized care for elderly patients', price: 42.99 },
  { id: '8', title: 'Nutrition and Meal Planning', description: 'Creating healthy meal plans for all ages', price: 32.99 },
]

const defaultProfile: UserProfile = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  profilePicture: '',
  enrolledCourses: [
    {
      id: '1',
      title: 'Introduction to Caregiving',
      amountPaid: 29.99,
      progress: 65,
      enrolledDate: '2026-01-15'
    },
    {
      id: '2',
      title: 'Maternal Health Basics',
      amountPaid: 39.99,
      progress: 30,
      enrolledDate: '2026-02-01'
    },
    {
      id: '3',
      title: 'Infant Nutrition',
      amountPaid: 24.99,
      progress: 100,
      enrolledDate: '2025-12-20'
    }
  ]
}

export default function UserProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(profile.name)
  const [editedEmail, setEditedEmail] = useState(profile.email)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [uploadingPicture, setUploadingPicture] = useState(false)

  useEffect(() => {
    // Validate session
    const currentUserType = localStorage.getItem('currentUserType')
    if (currentUserType !== 'user') {
      router.push('/login')
      return
    }

    // Load from localStorage
    try {
      const saved = localStorage.getItem('user:profile')
      if (saved) {
        const parsed = JSON.parse(saved)
        setProfile(parsed)
        setEditedName(parsed.name)
        setEditedEmail(parsed.email)
      } else {
        localStorage.setItem('user:profile', JSON.stringify(defaultProfile))
      }
    } catch {
      // Ignore errors
    }
  }, [router])

  const saveProfile = () => {
    const updated = { ...profile, name: editedName, email: editedEmail }
    setProfile(updated)
    try {
      localStorage.setItem('user:profile', JSON.stringify(updated))
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
        localStorage.setItem('user:profile', JSON.stringify(updated))
      } catch {}
      setUploadingPicture(false)
    }
    reader.readAsDataURL(file)
  }

  const removeProfilePicture = () => {
    const updated = { ...profile, profilePicture: '' }
    setProfile(updated)
    try {
      localStorage.setItem('user:profile', JSON.stringify(updated))
    } catch {}
  }

  const enrollInCourse = (course: AvailableCourse) => {
    // Check if already enrolled
    const alreadyEnrolled = profile.enrolledCourses.some(c => c.title === course.title)
    if (alreadyEnrolled) {
      alert('You are already enrolled in this course!')
      return
    }

    const newEnrollment: EnrolledCourse = {
      id: course.id,
      title: course.title,
      amountPaid: course.price,
      progress: 0,
      enrolledDate: new Date().toISOString()
    }

    const updated = {
      ...profile,
      enrolledCourses: [...profile.enrolledCourses, newEnrollment]
    }
    setProfile(updated)
    try {
      localStorage.setItem('user:profile', JSON.stringify(updated))
    } catch {}
    setShowEnrollModal(false)
    alert(`Successfully enrolled in ${course.title}!`)
  }

  const availableCoursesToEnroll = availableCourses.filter(
    ac => !profile.enrolledCourses.some(ec => ec.title === ac.title)
  )

  const downloadCertificate = (courseName: string) => {
    // Generate a simple text certificate
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
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
          <button onClick={() => { localStorage.removeItem('currentUserType'); router.push('/login'); }} className="text-sm text-muted-foreground hover:text-primary">Logout</button>
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
          </div>
        </div>

        {/* Stats Summary */}
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

        {/* Enrolled Courses */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Enrolled Courses</h2>
            <button 
              onClick={() => setShowEnrollModal(true)}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Enroll in New Course
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

                  {/* Progress Bar */}
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
                    {course.progress === 100 && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <p className="text-sm text-green-600 font-semibold">✓ Completed</p>
                        <button 
                          onClick={() => downloadCertificate(course.title)}
                          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Certificate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enrollment Modal */}
        {showEnrollModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-2xl font-bold">Enroll in a New Course</h2>
                <button 
                  onClick={() => setShowEnrollModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {availableCoursesToEnroll.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">You are enrolled in all available courses!</p>
                    <button 
                      onClick={() => setShowEnrollModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableCoursesToEnroll.map(course => (
                      <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500">Course Fee</p>
                            <p className="text-xl font-bold text-green-600">${course.price.toFixed(2)}</p>
                          </div>
                          <button 
                            onClick={() => enrollInCourse(course)}
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                          >
                            Enroll Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
