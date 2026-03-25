'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Loader2 } from 'lucide-react'
import UserHeader from '@/components/user/user-header'
import { getDashboardForRole } from '@/lib/roles'

type EnrolledCourse = {
  id: string
  title: string
  progress: number
  completedResources?: string[] // Array of resource IDs completed by this user
}

export default function UserDashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useCurrentUser()
  const [courses, setCourses] = useState<EnrolledCourse[]>([])

  useEffect(() => {
    if (isLoading) return
    if (user?.role && user.role !== 'USER') {
      window.location.href = getDashboardForRole(user.role)
      return
    }

    async function loadEnrollments() {
      try {
        const response = await fetch('/api/enrollments')
        const json = await response.json()

        if (!response.ok || !json.success) {
          setCourses([])
          return
        }

        const mappedCourses: EnrolledCourse[] = (json.data || []).map((enrollment: any) => ({
          id: enrollment.courseId,
          title: enrollment.course?.title || 'Untitled Course',
          progress: enrollment.progress || 0,
          completedResources: [],
        }))

        setCourses(mappedCourses)
      }
      catch {
        setCourses([])
      }
    }

    loadEnrollments()
  }, [isLoading, user])

  const goToCourses = () => router.push('/courses')

  const inProgressCourses = courses.filter(c => c.progress < 100)

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader currentPage="home" />

      <div className="max-w-6xl mx-auto px-6 py-8 pt-8">
        <h1 className="text-3xl font-bold mb-4">
          Welcome back{user?.name ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-muted-foreground mb-6">
          Continue your caregiving education journey
        </p>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex gap-3">
              <button onClick={goToCourses} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">Browse Courses</button>
              <button onClick={() => router.push('/dashboard/user/profile')} className="px-4 py-2 bg-white border border-primary text-primary rounded hover:bg-primary/10">View Profile</button>
              <button onClick={goToCourses} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Enroll in New Course
              </button>
            </div>
          </div>

          {/* User Stats */}
          {user?._count && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-muted-foreground mb-1">Enrolled Courses</p>
                <p className="text-3xl font-bold text-primary">{user._count.enrollments}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-muted-foreground mb-1">Payments Made</p>
                <p className="text-3xl font-bold text-green-600">{user._count.payments}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-muted-foreground mb-1">Reviews Given</p>
                <p className="text-3xl font-bold text-blue-600">{user._count.reviews}</p>
              </div>
            </div>
          )}

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
