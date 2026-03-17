'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Bell } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type Course = {
  id: string
  title: string
  description?: string
  enrolledStudents?: number
  completedStudents?: number
}

type School = {
  id: string
  name: string
  location: string
  studentCount: number
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export default function AdminAssistantDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const raw = localStorage.getItem('admin:courses')
      if (raw) return JSON.parse(raw)
      const defaults = [
        { id: uid(), title: 'Introduction to Caregiving', description: 'Basic caregiving skills', enrolledStudents: 125, completedStudents: 89 },
        { id: uid(), title: 'Maternal Health Basics', description: 'Essential maternal health knowledge', enrolledStudents: 98, completedStudents: 67 },
      ]
      localStorage.setItem('admin:courses', JSON.stringify(defaults))
      return defaults
    } catch { return [] }
  })

  const [schools, setSchools] = useState<School[]>(() => {
    try {
      const raw = localStorage.getItem('admin:schools')
      if (raw) return JSON.parse(raw)
      const defaults = [
        { id: uid(), name: 'Nairobi Central Campus', location: 'Nairobi', studentCount: 125 },
        { id: uid(), name: 'Mombasa Learning Center', location: 'Mombasa', studentCount: 87 },
      ]
      localStorage.setItem('admin:schools', JSON.stringify(defaults))
      return defaults
    } catch { return [] }
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [schoolLocation, setSchoolLocation] = useState('')
  const [schoolStudentCount, setSchoolStudentCount] = useState('')

  const [notifications, setNotifications] = useState([
    { id: '1', title: 'New Enrollment', message: 'A new student enrolled', time: '2 hours ago', read: false },
    { id: '2', title: 'Course Update', message: 'Maternal Health course was updated', time: '1 day ago', read: false },
    { id: '3', title: 'Welcome', message: 'Welcome to MamaPlus admin portal', time: '3 days ago', read: true },
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
    // Only allow ADMIN_ASSISTANT and ADMIN
    const role = (session?.user as any)?.role
    if (role !== 'ADMIN_ASSISTANT' && role !== 'ADMIN') {
      window.location.href = '/login'
    }
  }, [status, session])

  useEffect(() => {
    try { localStorage.setItem('admin:courses', JSON.stringify(courses)) } catch {}
  }, [courses])

  useEffect(() => {
    try { localStorage.setItem('admin:schools', JSON.stringify(schools)) } catch {}
  }, [schools])

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

  function addSchool(e?: React.FormEvent) {
    e?.preventDefault()
    if (!schoolName.trim() || !schoolLocation.trim()) return
    setSchools(prev => [{ id: uid(), name: schoolName.trim(), location: schoolLocation.trim(), studentCount: parseInt(schoolStudentCount) || 0 }, ...prev])
    setSchoolName('')
    setSchoolLocation('')
    setSchoolStudentCount('')
  }

  function removeSchool(id: string) {
    setSchools(prev => prev.filter(s => s.id !== id))
  }

  const totalStudents = schools.reduce((sum, s) => sum + s.studentCount, 0)
  const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0)

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
            <Link href="/dashboard/admin-assistant" className="text-sm font-semibold text-primary border-b-2 border-primary">Home</Link>
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary">Browse Courses</Link>
            <Link href="/dashboard/admin-assistant/profile" className="text-sm text-muted-foreground hover:text-primary">My Profile</Link>
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
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">Admin Assistant</span>
              </div>
            )}
            <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-primary">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 pt-8">
        <h1 className="text-3xl font-bold mb-4">Admin Assistant Dashboard</h1>
        <p className="text-muted-foreground mb-6">Manage courses and schools. User management is reserved for administrators.</p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Courses</p>
            <p className="text-3xl font-bold text-primary">{courses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Physical Schools</p>
            <p className="text-3xl font-bold text-purple-600">{schools.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Students</p>
            <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Enrollments</p>
            <p className="text-3xl font-bold text-green-600">{totalEnrollments}</p>
          </div>
        </div>

        {/* Manage Schools */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Physical Schools</h2>
          <form onSubmit={addSchool} className="space-y-3 mb-6 pb-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="School name" className="border rounded px-3 py-2" />
              <input value={schoolLocation} onChange={e => setSchoolLocation(e.target.value)} placeholder="Location" className="border rounded px-3 py-2" />
              <input value={schoolStudentCount} onChange={e => setSchoolStudentCount(e.target.value)} placeholder="Student count" type="number" className="border rounded px-3 py-2" />
            </div>
            <button type="submit" disabled={!schoolName.trim() || !schoolLocation.trim()} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50">Add School</button>
          </form>
          <div className="space-y-3">
            {schools.length === 0 && <p className="text-muted-foreground">No schools yet.</p>}
            {schools.map(school => (
              <div key={school.id} className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <h3 className="font-semibold">{school.name}</h3>
                  <p className="text-sm text-muted-foreground">{school.location} &middot; {school.studentCount} students</p>
                </div>
                <button onClick={() => removeSchool(school.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
              </div>
            ))}
          </div>
        </div>

        {/* Manage Courses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Manage Courses</h2>
          <form onSubmit={addCourse} className="space-y-3 mb-6 pb-6 border-b">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Course title" className="w-full border rounded px-3 py-2" />
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description (optional)" className="w-full border rounded px-3 py-2" />
            <button type="submit" disabled={!title.trim()} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50">Add Course</button>
          </form>
          <div className="space-y-3">
            {courses.length === 0 && <p className="text-muted-foreground">No courses yet.</p>}
            {courses.map(course => (
              <div key={course.id} className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <h3 className="font-semibold">{course.title}</h3>
                  {course.description && <p className="text-sm text-muted-foreground">{course.description}</p>}
                  <p className="text-xs text-gray-500 mt-1">{course.enrolledStudents || 0} enrolled &middot; {course.completedStudents || 0} completed</p>
                </div>
                <button onClick={() => removeCourse(course.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
