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

type ManagedCourse = {
  id: string
  title: string
  description?: string
  enrolledStudents: number
  completedStudents: number
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export default function EducatorDashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useCurrentUser()
  const [courses, setCourses] = useState<ManagedCourse[]>(() => {
    try {
      const raw = localStorage.getItem('educator:courses')
      if (raw) return JSON.parse(raw)
      const defaults: ManagedCourse[] = [
        { id: uid(), title: 'Introduction to Caregiving', description: 'Basic caregiving skills', enrolledStudents: 45, completedStudents: 32 },
        { id: uid(), title: 'Maternal Health Basics', description: 'Essential maternal health knowledge', enrolledStudents: 28, completedStudents: 15 },
      ]
      localStorage.setItem('educator:courses', JSON.stringify(defaults))
      return defaults
    } catch { return [] }
  })
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [notifications, setNotifications] = useState([
    { id: '1', title: 'New Enrollment', message: 'A student enrolled in your course', time: '1 hour ago', read: false },
    { id: '2', title: 'Course Completed', message: 'A student completed Maternal Health Basics', time: '1 day ago', read: false },
    { id: '3', title: 'Welcome Educator', message: 'Welcome to MamaPlus educator portal', time: '3 days ago', read: true },
  ])
  const unreadCount = notifications.filter(n => !n.read).length
  const markAsRead = (id: string) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllAsRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })))

  useEffect(() => {
    try { localStorage.setItem('educator:courses', JSON.stringify(courses)) } catch {}
  }, [courses])

  function addCourse(e?: React.FormEvent) {
    e?.preventDefault()
    if (!title.trim()) return
    setCourses(prev => [{ id: uid(), title: title.trim(), description: description.trim(), enrolledStudents: 0, completedStudents: 0 }, ...prev])
    setTitle('')
    setDescription('')
  }

  function removeCourse(id: string) {
    setCourses(prev => prev.filter(c => c.id !== id))
  }

  const totalStudents = courses.reduce((sum, c) => sum + c.enrolledStudents, 0)
  const totalCompleted = courses.reduce((sum, c) => sum + c.completedStudents, 0)

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
            <Link href="/dashboard/educator" className="flex items-center gap-2">
              <Image src="/logo.png" alt="MamaPlus" width={240} height={240} className="object-contain" />
            </Link>
            <Link href="/dashboard/educator" className="text-sm font-semibold text-primary border-b-2 border-primary">Home</Link>
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary">Browse Courses</Link>
            <Link href="/dashboard/educator/profile" className="text-sm text-muted-foreground hover:text-primary">My Profile</Link>
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Educator</span>
              </div>
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
          Manage your courses and track student progress
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">My Courses</p>
            <p className="text-3xl font-bold text-primary">{courses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Enrolled Students</p>
            <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Course Completions</p>
            <p className="text-3xl font-bold text-green-600">{totalCompleted}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-3">
            <button onClick={() => router.push('/courses')} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">Browse Courses</button>
            <button onClick={() => router.push('/dashboard/educator/profile')} className="px-4 py-2 bg-white border border-primary text-primary rounded hover:bg-primary/10">View Profile</button>
          </div>
        </div>

        {/* Add Course */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create a Course</h2>
          <form onSubmit={addCourse} className="space-y-3">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Course title"
              className="w-full border rounded px-3 py-2"
            />
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              className="w-full border rounded px-3 py-2"
            />
            <button type="submit" disabled={!title.trim()} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50">
              Add Course
            </button>
          </form>
        </div>

        {/* My Courses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">My Courses</h2>
          {courses.length === 0 ? (
            <p className="text-muted-foreground">No courses yet. Create one above!</p>
          ) : (
            <div className="space-y-4">
              {courses.map(course => (
                <div key={course.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      {course.description && <p className="text-sm text-muted-foreground mt-1">{course.description}</p>}
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>{course.enrolledStudents} enrolled</span>
                        <span>{course.completedStudents} completed</span>
                      </div>
                    </div>
                    <button onClick={() => removeCourse(course.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
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
