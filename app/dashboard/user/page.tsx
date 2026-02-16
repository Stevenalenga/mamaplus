'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type EnrolledCourse = {
  id: string
  title: string
  progress: number
  completedResources?: string[] // Array of resource IDs completed by this user
}

export default function UserDashboardPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<EnrolledCourse[]>([])

  useEffect(() => {
    // Validate session
    const currentUserType = localStorage.getItem('currentUserType')
    if (currentUserType !== 'user') {
      router.push('/login')
      return
    }

    // Load courses from localStorage
    try {
      const saved = localStorage.getItem('user:profile')
      if (saved) {
        const profile = JSON.parse(saved)
        setCourses(profile.enrolledCourses || [])
      } else {
        // Default courses
        const defaultCourses = [
          { id: '1', title: 'Introduction to Caregiving', progress: 65 },
          { id: '2', title: 'Maternal Health Basics', progress: 30 },
          { id: '3', title: 'Infant Nutrition', progress: 100 },
        ]
        setCourses(defaultCourses)
      }
    } catch {
      // Ignore errors
    }
  }, [router])

  const goToCourses = () => router.push('/courses')

  const inProgressCourses = courses.filter(c => c.progress < 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/user" className="flex items-center gap-2">
              <Image src="/logo.png" alt="MamaPlus" width={240} height={240} className="object-contain" />
            </Link>
            <Link href="/dashboard/user" className="text-sm font-semibold text-primary border-b-2 border-primary">Home</Link>
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary">Browse Courses</Link>
            <Link href="/dashboard/user/profile" className="text-sm text-muted-foreground hover:text-primary">My Profile</Link>
          </div>
          <button onClick={() => { localStorage.removeItem('currentUserType'); router.push('/login'); }} className="text-sm text-muted-foreground hover:text-primary">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 pt-8">
        <h1 className="text-3xl font-bold mb-4">Your Dashboard</h1>
        <p className="text-muted-foreground mb-6">Welcome — this is a placeholder dashboard for learners. Authentication is not implemented yet.</p>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex gap-3">
              <button onClick={goToCourses} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">Browse Courses</button>
              <button onClick={() => router.push('/dashboard/user/profile')} className="px-4 py-2 bg-white border border-primary text-primary rounded hover:bg-primary/10">View Profile</button>
              <button onClick={() => router.push('/dashboard/user/profile')} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Enroll in New Course
              </button>
            </div>
          </div>

          {/* In Progress Courses */}
          {inProgressCourses.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">In Progress</h2>
              <div className="space-y-3">
                {inProgressCourses.map(course => (
                  <Link 
                    key={course.id} 
                    href={`/dashboard/user/courses/${course.id}`}
                    className="flex items-center justify-between p-3 border rounded hover:border-primary hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{course.title}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                        </div>
                        <p className="text-sm text-muted-foreground">{course.progress}%</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-primary text-white rounded ml-4 hover:bg-primary/90">Continue</button>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6">
            <Link href="/" className="text-primary hover:underline">Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
