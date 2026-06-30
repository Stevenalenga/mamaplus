'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AuthenticatedHeader from '@/components/authenticated-header'

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

  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)

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

  const [schoolName, setSchoolName] = useState('')
  const [schoolLocation, setSchoolLocation] = useState('')
  const [schoolStudentCount, setSchoolStudentCount] = useState('')

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
    if (status !== 'authenticated') return
    const role = (session?.user as { role?: string })?.role
    if (role !== 'ADMIN_ASSISTANT' && role !== 'ADMIN') return

    async function fetchCourses() {
      setLoadingCourses(true)
      try {
        const res = await fetch('/api/courses')
        const json = await res.json()
        if (json.success) {
          setCourses(
            (json.data || []).map((c: { id: string; title: string; description?: string; _count?: { enrollments?: number } }) => ({
              id: c.id,
              title: c.title,
              description: c.description,
              enrolledStudents: c._count?.enrollments || 0,
              completedStudents: 0,
            })),
          )
        }
      } catch {
        // Keep dashboard usable if course stats fail to load
      } finally {
        setLoadingCourses(false)
      }
    }

    fetchCourses()
  }, [status, session?.user?.role])

  useEffect(() => {
    try { localStorage.setItem('admin:schools', JSON.stringify(schools)) } catch {}
  }, [schools])

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedHeader activePage="home" />

      <div className="max-w-6xl mx-auto px-6 py-8 pt-8">
        <h1 className="text-3xl font-bold mb-4">Admin Assistant Dashboard</h1>
        <p className="text-muted-foreground mb-6">View courses and manage schools. Course catalog updates are reserved for administrators.</p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Courses</p>
            <p className="text-3xl font-bold text-primary">{loadingCourses ? '…' : courses.length}</p>
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

        {/* Published Courses (read-only) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Published Courses</h2>
          <div className="space-y-3">
            {courses.length === 0 && <p className="text-muted-foreground">No published courses yet.</p>}
            {courses.map(course => (
              <div key={course.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{course.title}</h3>
                {course.description && <p className="text-sm text-muted-foreground">{course.description}</p>}
                <p className="text-xs text-gray-500 mt-1">{course.enrolledStudents || 0} enrolled</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
