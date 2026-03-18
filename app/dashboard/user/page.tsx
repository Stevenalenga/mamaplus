'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCurrentUser } from '@/hooks/use-current-user'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Loader2, Bell } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'New Course Available', message: 'Maternal Health Basics course is now available', time: '2 hours ago', read: false },
    { id: '2', title: 'Certificate Ready', message: 'Your certificate for Infant Nutrition is ready to download', time: '1 day ago', read: false },
    { id: '3', title: 'Welcome to MamaPlus', message: 'Thank you for joining our caregiving community', time: '3 days ago', read: true },
  ])
  const unreadCount = notifications.filter(n => !n.read).length
  const markAsRead = (id: string) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllAsRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })))

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
            {user && (
              <span className="text-sm text-muted-foreground">
                {user.name || user.email}
              </span>
            )}
            <LogoutButton variant="ghost" size="sm" />
          </div>
        </div>
      </nav>

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
