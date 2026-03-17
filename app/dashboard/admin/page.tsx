'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { ROLES, getRoleDisplayName, getRoleBadgeColor } from '@/lib/roles'

type Resource = {
  id: string
  name: string
  type: 'video' | 'file' | 'image'
  url?: string
  fileData?: string // base64 encoded file
  fileName?: string
  fileSize?: number
  isMilestone: boolean
  completedBy?: string[] // Array of user profile IDs who completed this resource
}

type Course = {
  id: string
  title: string
  description?: string
  enrolledStudents?: number
  completedStudents?: number
  resources?: Resource[]
}

type School = {
  id: string
  name: string
  location: string
  studentCount: number
}

type Educator = {
  id: string
  name: string
  subject: string
  school: string
}

type ManagedUser = {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const raw = localStorage.getItem('admin:courses')
      if (raw) return JSON.parse(raw)
      // Default courses with completion data
      const defaultCourses = [
        { 
          id: uid(), 
          title: 'Introduction to Caregiving', 
          description: 'Basic caregiving skills', 
          enrolledStudents: 125, 
          completedStudents: 89,
          resources: [
            { id: uid(), name: 'Course Overview Video', type: 'video' as const, url: '', isMilestone: true },
            { id: uid(), name: 'Module 1: Basics', type: 'video' as const, url: '', isMilestone: false },
            { id: uid(), name: 'Assessment Quiz', type: 'file' as const, url: '', isMilestone: true },
          ]
        },
        { 
          id: uid(), 
          title: 'Maternal Health Basics', 
          description: 'Essential maternal health knowledge', 
          enrolledStudents: 98, 
          completedStudents: 67,
          resources: [
            { id: uid(), name: 'Introduction', type: 'video' as const, url: '', isMilestone: true },
          ]
        },
        { 
          id: uid(), 
          title: 'Infant Nutrition', 
          description: 'Nutrition for infants and toddlers', 
          enrolledStudents: 84, 
          completedStudents: 84,
          resources: []
        },
      ]
      localStorage.setItem('admin:courses', JSON.stringify(defaultCourses))
      return defaultCourses
    } catch {
      return []
    }
  })

  const [schools, setSchools] = useState<School[]>(() => {
    try {
      const raw = localStorage.getItem('admin:schools')
      if (raw) return JSON.parse(raw)
      // Default schools
      const defaultSchools = [
        { id: uid(), name: 'Nairobi Central Campus', location: 'Nairobi', studentCount: 125 },
        { id: uid(), name: 'Mombasa Learning Center', location: 'Mombasa', studentCount: 87 },
        { id: uid(), name: 'Kisumu Training Hub', location: 'Kisumu', studentCount: 64 },
        { id: uid(), name: 'Eldoret Branch', location: 'Eldoret', studentCount: 71 },
      ]
      localStorage.setItem('admin:schools', JSON.stringify(defaultSchools))
      return defaultSchools
    } catch {
      return []
    }
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [showResourceForm, setShowResourceForm] = useState<string | null>(null)
  const [resourceName, setResourceName] = useState('')
  const [resourceType, setResourceType] = useState<'video' | 'file' | 'image'>('video')
  const [resourceUrl, setResourceUrl] = useState('')
  const [resourceIsMilestone, setResourceIsMilestone] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [resourceFile, setResourceFile] = useState<{ data: string; name: string; size: number } | null>(null)
  
  // Initial course creation file upload
  const [initialCourseFile, setInitialCourseFile] = useState<{ data: string; name: string; size: number } | null>(null)
  const [initialFileType, setInitialFileType] = useState<'video' | 'file' | 'image'>('file')
  const [uploadingInitialFile, setUploadingInitialFile] = useState(false)
  
  // Multi-resource creation
  const [creationResources, setCreationResources] = useState<Resource[]>([])
  const [creationResourceName, setCreationResourceName] = useState('')
  const [creationResourceType, setCreationResourceType] = useState<'video' | 'file' | 'image'>('video')
  const [creationResourceMilestone, setCreationResourceMilestone] = useState(false)
  
  const [educators, setEducators] = useState<Educator[]>(() => {
    try {
      const raw = localStorage.getItem('admin:educators')
      if (raw) return JSON.parse(raw)
      // Default educators
      const defaultEducators = [
        { id: uid(), name: 'Dr. Sarah Kamau', subject: 'Maternal Health', school: 'Nairobi Central Campus' },
        { id: uid(), name: 'James Omondi', subject: 'Infant Nutrition', school: 'Mombasa Learning Center' },
        { id: uid(), name: 'Grace Wanjiku', subject: 'Caregiving Basics', school: 'Kisumu Training Hub' },
        { id: uid(), name: 'Peter Mutua', subject: 'Child Development', school: 'Nairobi Central Campus' },
        { id: uid(), name: 'Mary Achieng', subject: 'Emergency Care', school: 'Eldoret Branch' },
      ]
      localStorage.setItem('admin:educators', JSON.stringify(defaultEducators))
      return defaultEducators
    } catch {
      return []
    }
  })

  const [schoolName, setSchoolName] = useState('')
  const [schoolLocation, setSchoolLocation] = useState('')
  const [schoolStudentCount, setSchoolStudentCount] = useState('')
  
  const [educatorName, setEducatorName] = useState('')
  const [educatorSubject, setEducatorSubject] = useState('')
  const [educatorSchool, setEducatorSchool] = useState('')

  // User management state
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [userTotal, setUserTotal] = useState(0)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [userMessage, setUserMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (status === 'loading') return
    
    if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
      window.location.href = '/login'
      return
    }
  }, [router, status, session])

  useEffect(() => {
    try {
      localStorage.setItem('admin:courses', JSON.stringify(courses))
    } catch {}
  }, [courses])

  useEffect(() => {
    try {
      localStorage.setItem('admin:schools', JSON.stringify(schools))
    } catch {}
  }, [schools])

  useEffect(() => {
    try {
      localStorage.setItem('admin:educators', JSON.stringify(educators))
    } catch {}
  }, [educators])

  // Fetch users from API
  const fetchUsers = useCallback(async (search = '', role = '', page = 1) => {
    setLoadingUsers(true)
    setUserMessage(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (role) params.set('role', role)
      params.set('page', String(page))
      params.set('limit', '10')
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setManagedUsers(json.data.users)
        setUserTotal(json.data.total)
        setUserTotalPages(json.data.totalPages)
        setUserPage(json.data.page)
      } else {
        setUserMessage({ type: 'error', text: json.message || 'Failed to load users' })
      }
    } catch {
      setUserMessage({ type: 'error', text: 'Failed to load users' })
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  // Fetch users on mount and when filters change
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchUsers(userSearch, userRoleFilter, userPage)
    }
  }, [status, session, fetchUsers, userSearch, userRoleFilter, userPage])

  // Update a user's role
  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId)
    setUserMessage(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      const json = await res.json()
      if (json.success) {
        setManagedUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
        setUserMessage({ type: 'success', text: `${json.data.name || json.data.email} is now ${getRoleDisplayName(newRole)}` })
      } else {
        setUserMessage({ type: 'error', text: json.message || 'Failed to update role' })
      }
    } catch {
      setUserMessage({ type: 'error', text: 'Failed to update role' })
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleInitialFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setUploadingInitialFile(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setInitialCourseFile({
        data: reader.result as string,
        name: file.name,
        size: file.size
      })
      setUploadingInitialFile(false)
    }
    reader.readAsDataURL(file)
  }

  function addCourse(e?: React.FormEvent) {
    e?.preventDefault()
    if (!title.trim()) return
    
    const courseId = uid()
    const newCourse: Course = { 
      id: courseId, 
      title: title.trim(), 
      description: description.trim(),
      enrolledStudents: 0,
      completedStudents: 0,
      resources: [...creationResources]
    }
    setCourses(prev => [newCourse, ...prev])
    
    // Also add to browse:courses for public visibility
    try {
      const browseCourses = JSON.parse(localStorage.getItem('browse:courses') || '[]')
      const browseCoursesWithNumbers = browseCourses.map((c: any) => ({
        ...c,
        id: typeof c.id === 'string' ? parseInt(c.id.replace(/[^0-9]/g, '')) || Date.now() : c.id
      }))
      const maxId = browseCoursesWithNumbers.length > 0 
        ? Math.max(...browseCoursesWithNumbers.map((c: any) => c.id))
        : 0
      
      const browseCourse = {
        id: maxId + 1,
        title: newCourse.title,
        description: newCourse.description || 'No description provided',
        duration: `${creationResources.length} resources`,
        price: 'Free',
        courseId: courseId // Link to admin course
      }
      browseCourses.push(browseCourse)
      localStorage.setItem('browse:courses', JSON.stringify(browseCourses))
    } catch (e) {
      console.error('Error syncing to browse courses:', e)
    }
    
    setTitle('')
    setDescription('')
    setCreationResources([])
    setInitialCourseFile(null)
  }
  
  function addCreationResource() {
    if (!creationResourceName.trim()) return
    
    const newResource: Resource = {
      id: uid(),
      name: creationResourceName.trim(),
      type: creationResourceType,
      isMilestone: creationResourceMilestone,
      fileData: initialCourseFile?.data,
      fileName: initialCourseFile?.name,
      fileSize: initialCourseFile?.size
    }
    
    setCreationResources(prev => [...prev, newResource])
    setCreationResourceName('')
    setCreationResourceType('video')
    setCreationResourceMilestone(false)
    setInitialCourseFile(null)
  }
  
  function removeCreationResource(resourceId: string) {
    setCreationResources(prev => prev.filter(r => r.id !== resourceId))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setUploadingFile(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setResourceFile({
        data: reader.result as string,
        name: file.name,
        size: file.size
      })
      setUploadingFile(false)
      // Auto-set resource name if empty
      if (!resourceName.trim()) {
        setResourceName(file.name)
      }
    }
    reader.readAsDataURL(file)
  }

  function addResource(courseId: string) {
    if (!resourceName.trim()) {
      alert('Please provide a resource name')
      return
    }
    if (!resourceUrl.trim() && !resourceFile) {
      alert('Please either upload a file or provide a URL')
      return
    }
    
    const newResource: Resource = {
      id: uid(),
      name: resourceName.trim(),
      type: resourceType,
      url: resourceUrl.trim(),
      isMilestone: resourceIsMilestone,
      fileData: resourceFile?.data,
      fileName: resourceFile?.name,
      fileSize: resourceFile?.size
    }
    setCourses(prev => prev.map(c => 
      c.id === courseId 
        ? { ...c, resources: [...(c.resources || []), newResource] }
        : c
    ))
    setResourceName('')
    setResourceUrl('')
    setResourceIsMilestone(false)
    setResourceFile(null)
    setShowResourceForm(null)
  }

  function removeResource(courseId: string, resourceId: string) {
    setCourses(prev => prev.map(c => 
      c.id === courseId 
        ? { ...c, resources: (c.resources || []).filter(r => r.id !== resourceId) }
        : c
    ))
  }

  function updateResource(courseId: string, resourceId: string, data: Partial<Resource>) {
    setCourses(prev => prev.map(c => 
      c.id === courseId 
        ? { ...c, resources: (c.resources || []).map(r => r.id === resourceId ? { ...r, ...data } : r) }
        : c
    ))
  }

  function removeCourse(id: string) {
    setCourses(prev => prev.filter(c => c.id !== id))
    
    // Also remove from browse:courses
    try {
      const browseCourses = JSON.parse(localStorage.getItem('browse:courses') || '[]')
      const updatedBrowseCourses = browseCourses.filter((c: any) => c.courseId !== id)
      localStorage.setItem('browse:courses', JSON.stringify(updatedBrowseCourses))
    } catch (e) {
      console.error('Error syncing course deletion to browse courses:', e)
    }
  }

  function updateCourse(id: string, data: Partial<Course>) {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)))
    
    // Also update in browse:courses
    try {
      const browseCourses = JSON.parse(localStorage.getItem('browse:courses') || '[]')
      const updatedBrowseCourses = browseCourses.map((c: any) => {
        if (c.courseId === id) {
          return {
            ...c,
            title: data.title || c.title,
            description: data.description || c.description
          }
        }
        return c
      })
      localStorage.setItem('browse:courses', JSON.stringify(updatedBrowseCourses))
    } catch (e) {
      console.error('Error syncing course update to browse courses:', e)
    }
  }

  function addSchool(e?: React.FormEvent) {
    e?.preventDefault()
    if (!schoolName.trim() || !schoolLocation.trim()) return
    const newSchool: School = {
      id: uid(),
      name: schoolName.trim(),
      location: schoolLocation.trim(),
      studentCount: parseInt(schoolStudentCount) || 0
    }
    setSchools(prev => [newSchool, ...prev])
    setSchoolName('')
    setSchoolLocation('')
    setSchoolStudentCount('')
  }

  function removeSchool(id: string) {
    setSchools(prev => prev.filter(s => s.id !== id))
  }

  function updateSchool(id: string, data: Partial<School>) {
    setSchools(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)))
  }

  function addEducator(e?: React.FormEvent) {
    e?.preventDefault()
    if (!educatorName.trim() || !educatorSubject.trim()) return
    const newEducator: Educator = {
      id: uid(),
      name: educatorName.trim(),
      subject: educatorSubject.trim(),
      school: educatorSchool.trim()
    }
    setEducators(prev => [newEducator, ...prev])
    setEducatorName('')
    setEducatorSubject('')
    setEducatorSchool('')
  }

  function removeEducator(id: string) {
    setEducators(prev => prev.filter(e => e.id !== id))
  }

  function updateEducator(id: string, data: Partial<Educator>) {
    setEducators(prev => prev.map(e => (e.id === id ? { ...e, ...data } : e)))
  }

  const totalSchoolStudents = schools.reduce((sum, s) => sum + s.studentCount, 0)
  const totalCompletions = courses.reduce((sum, c) => sum + (c.completedStudents || 0), 0)
  const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    window.location.href = '/login'
  }

  // Show loading spinner while checking authentication
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
            <Link href="/dashboard/admin" className="flex items-center gap-2">
              <Image src="/logo.png" alt="MamaPlus" width={240} height={240} className="object-contain" />
            </Link>
            <Link href="/dashboard/admin" className="text-sm font-semibold text-primary border-b-2 border-primary">Home</Link>
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary">Browse Courses</Link>
            <Link href="/dashboard/admin/profile" className="text-sm text-muted-foreground hover:text-primary">My Profile</Link>
          </div>
          <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-primary">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 pt-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-6">This is a placeholder admin interface—changes are stored locally in your browser only.</p>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {/* Total Courses */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-primary">{courses.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active courses</p>
          </div>

          {/* Total Schools */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Physical Schools</p>
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-purple-600">{schools.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalSchoolStudents} students</p>
          </div>

          {/* Total Educators */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Educators</p>
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-indigo-600">{educators.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active educators</p>
          </div>

          {/* Total Students */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-blue-600">{totalEnrollments}</p>
            <p className="text-xs text-muted-foreground mt-1">Course enrollments</p>
          </div>

          {/* Courses Completed */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Completions</p>
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-green-600">{totalCompletions}</p>
            <p className="text-xs text-muted-foreground mt-1">Students completed</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-amber-600">$12,456</p>
            <p className="text-xs text-muted-foreground mt-1">Total earnings</p>
          </div>

          {/* Average Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-orange-600">68%</p>
            <p className="text-xs text-muted-foreground mt-1">Completion rate</p>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-sm text-muted-foreground mb-4">Search for users and assign or update their roles.</p>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <input
                value={userSearch}
                onChange={e => { setUserSearch(e.target.value); setUserPage(1) }}
                className="w-full border px-3 py-2 rounded"
                placeholder="Search by name or email..."
              />
            </div>
            <select
              value={userRoleFilter}
              onChange={e => { setUserRoleFilter(e.target.value); setUserPage(1) }}
              className="border px-3 py-2 rounded min-w-[160px]"
            >
              <option value="">All Roles</option>
              <option value="USER">Student / Caregiver</option>
              <option value="INSTRUCTOR">Teacher / Educator</option>
              <option value="ADMIN_ASSISTANT">Admin Assistant</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          {/* Status Message */}
          {userMessage && (
            <div className={`mb-4 px-4 py-2 rounded text-sm ${
              userMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {userMessage.text}
            </div>
          )}

          {/* Users Table */}
          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : managedUsers.length === 0 ? (
            <p className="text-muted-foreground py-4">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Current Role</th>
                    <th className="pb-2 font-medium">Joined</th>
                    <th className="pb-2 font-medium">Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {managedUsers.map(user => (
                    <tr key={user.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 pr-3">{user.name || '—'}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{user.email}</td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        {user.id === session?.user?.id ? (
                          <span className="text-xs text-muted-foreground italic">You</span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={e => updateUserRole(user.id, e.target.value)}
                            disabled={updatingUserId === user.id}
                            className="border px-2 py-1 rounded text-sm disabled:opacity-50"
                          >
                            <option value="USER">Student / Caregiver</option>
                            <option value="INSTRUCTOR">Teacher / Educator</option>
                            <option value="ADMIN_ASSISTANT">Admin Assistant</option>
                            <option value="ADMIN">Administrator</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {userTotalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Showing {managedUsers.length} of {userTotal} users</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setUserPage(p => Math.max(1, p - 1))}
                  disabled={userPage === 1}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">Page {userPage} of {userTotalPages}</span>
                <button
                  onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))}
                  disabled={userPage === userTotalPages}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Physical Schools Management */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Physical Schools</h2>
          
          {/* Add School Form */}
          <form onSubmit={addSchool} className="space-y-3 mb-6 pb-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">School Name</label>
                <input value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="e.g., Nairobi Campus" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input value={schoolLocation} onChange={e => setSchoolLocation(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="e.g., Nairobi" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Student Count</label>
                <input type="number" value={schoolStudentCount} onChange={e => setSchoolStudentCount(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="0" min="0" />
              </div>
            </div>
            <div>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Add School</button>
            </div>
          </form>

          {/* Schools List */}
          <div className="space-y-3">
            {schools.length === 0 && <p className="text-muted-foreground">No schools yet.</p>}
            {schools.map(school => (
              <div key={school.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input 
                        value={school.name} 
                        onChange={e => updateSchool(school.id, { name: e.target.value })} 
                        className="font-semibold text-lg border-b border-transparent hover:border-gray-300 focus:border-primary outline-none bg-transparent"
                      />
                      <button onClick={() => removeSchool(school.id)} className="text-red-600 hover:underline text-sm">Remove</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Location</p>
                        <input 
                          value={school.location} 
                          onChange={e => updateSchool(school.id, { location: e.target.value })} 
                          className="w-full text-sm border px-2 py-1 rounded"
                          placeholder="City/Region"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Students Enrolled</p>
                        <input 
                          type="number"
                          value={school.studentCount} 
                          onChange={e => updateSchool(school.id, { studentCount: parseInt(e.target.value) || 0 })} 
                          className="w-full text-sm border px-2 py-1 rounded"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Educators Management */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Educators</h2>
          
          {/* Add Educator Form */}
          <form onSubmit={addEducator} className="space-y-3 mb-6 pb-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Educator Name</label>
                <input value={educatorName} onChange={e => setEducatorName(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="e.g., Dr. Sarah Kamau" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject/Specialization</label>
                <input value={educatorSubject} onChange={e => setEducatorSubject(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="e.g., Maternal Health" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assigned School (optional)</label>
                <input value={educatorSchool} onChange={e => setEducatorSchool(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="e.g., Nairobi Campus" />
              </div>
            </div>
            <div>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Add Educator</button>
            </div>
          </form>

          {/* Educators List */}
          <div className="space-y-3">
            {educators.length === 0 && <p className="text-muted-foreground">No educators yet.</p>}
            {educators.map(educator => (
              <div key={educator.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input 
                        value={educator.name} 
                        onChange={e => updateEducator(educator.id, { name: e.target.value })} 
                        className="font-semibold text-lg border-b border-transparent hover:border-gray-300 focus:border-primary outline-none bg-transparent"
                      />
                      <button onClick={() => removeEducator(educator.id)} className="text-red-600 hover:underline text-sm">Remove</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Subject/Specialization</p>
                        <input 
                          value={educator.subject} 
                          onChange={e => updateEducator(educator.id, { subject: e.target.value })} 
                          className="w-full text-sm border px-2 py-1 rounded"
                          placeholder="Subject area"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Assigned School</p>
                        <input 
                          value={educator.school} 
                          onChange={e => updateEducator(educator.id, { school: e.target.value })} 
                          className="w-full text-sm border px-2 py-1 rounded"
                          placeholder="School location"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Manage Courses</h2>
          <form onSubmit={addCourse} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Course Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="e.g., Maternal Nutrition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded" rows={3} />
          </div>
          
          {/* Resources Section */}
          <div className="border-t pt-3">
            <label className="block text-sm font-medium mb-2">Course Resources & Milestones</label>
            
            {/* Add Resource Form */}
            <div className="bg-gray-50 p-3 rounded space-y-2 mb-3">
              <div>
                <label className="block text-xs font-medium mb-1">Resource Name</label>
                <input 
                  value={creationResourceName}
                  onChange={e => setCreationResourceName(e.target.value)}
                  className="w-full text-sm border px-3 py-2 rounded"
                  placeholder="e.g., Introduction Video, Quiz 1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Type</label>
                  <select 
                    value={creationResourceType} 
                    onChange={e => setCreationResourceType(e.target.value as 'video' | 'file' | 'image')}
                    className="w-full text-sm border px-3 py-2 rounded"
                  >
                    <option value="video">Video</option>
                    <option value="file">Document/File</option>
                    <option value="image">Image</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={creationResourceMilestone}
                      onChange={e => setCreationResourceMilestone(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs font-medium">Mark as Milestone</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1">Upload File (Max 10MB, optional)</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-2 bg-white border rounded text-sm cursor-pointer hover:bg-gray-50">
                    {uploadingInitialFile ? 'Uploading...' : initialCourseFile ? initialCourseFile.name : 'Choose file...'}
                    <input 
                      type="file"
                      onChange={handleInitialFileUpload}
                      disabled={uploadingInitialFile}
                      accept={creationResourceType === 'image' ? 'image/*' : creationResourceType === 'video' ? 'video/*' : '*/*'}
                      className="hidden"
                    />
                  </label>
                  {initialCourseFile && (
                    <button
                      type="button"
                      onClick={() => setInitialCourseFile(null)}
                      className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {initialCourseFile && (
                  <p className="text-xs text-gray-600 mt-1">
                    📎 {(initialCourseFile.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
              
              <button
                type="button"
                onClick={addCreationResource}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                + Add Resource to Course
              </button>
            </div>
            
            {/* List of Added Resources */}
            {creationResources.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600">{creationResources.length} Resource(s) Added:</p>
                {creationResources.map(resource => (
                  <div key={resource.id} className="flex items-center justify-between bg-white border rounded p-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{resource.name}</span>
                        {resource.isMilestone && (
                          <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">★ Milestone</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 capitalize">{resource.type}</span>
                        {resource.fileName && (
                          <span className="text-xs text-gray-400">• {resource.fileName}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCreationResource(resource.id)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">Add Course</button>
          </div>
        </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Course List</h2>
          <div className="space-y-4">
          {courses.length === 0 && <p className="text-muted-foreground">No courses yet.</p>}
          {courses.map(course => (
            <div key={course.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between mb-3">
                <input 
                  value={course.title} 
                  onChange={e => updateCourse(course.id, { title: e.target.value })} 
                  className="font-semibold text-lg border-b border-transparent hover:border-gray-300 focus:border-primary outline-none bg-transparent flex-1"
                />
                <button onClick={() => removeCourse(course.id)} className="text-red-600 hover:underline text-sm ml-4">Remove</button>
              </div>
              
              <textarea 
                className="w-full border p-2 rounded mb-3" 
                value={course.description} 
                onChange={e => updateCourse(course.id, { description: e.target.value })} 
                placeholder="Course description..." 
                rows={2}
              />

              {/* Student Statistics */}
              <div className="grid grid-cols-3 gap-4 pt-3 border-t mb-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Enrolled Students</p>
                  <input 
                    type="number"
                    value={course.enrolledStudents || 0} 
                    onChange={e => updateCourse(course.id, { enrolledStudents: parseInt(e.target.value) || 0 })} 
                    className="w-full text-sm border px-2 py-1 rounded"
                    min="0"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Completed Students</p>
                  <input 
                    type="number"
                    value={course.completedStudents || 0} 
                    onChange={e => updateCourse(course.id, { completedStudents: parseInt(e.target.value) || 0 })} 
                    className="w-full text-sm border px-2 py-1 rounded"
                    min="0"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Completion Rate</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(course.enrolledStudents || 0) > 0 ? Math.round(((course.completedStudents || 0) / (course.enrolledStudents || 1)) * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {(course.enrolledStudents || 0) > 0 ? Math.round(((course.completedStudents || 0) / (course.enrolledStudents || 1)) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Resources Section */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Course Resources & Milestones</h3>
                  <button 
                    onClick={() => setShowResourceForm(showResourceForm === course.id ? null : course.id)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {showResourceForm === course.id ? 'Cancel' : '+ Add Resource'}
                  </button>
                </div>

                {/* Add Resource Form */}
                {showResourceForm === course.id && (
                  <div className="bg-blue-50 p-3 rounded mb-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Resource Name</label>
                        <input 
                          value={resourceName} 
                          onChange={e => setResourceName(e.target.value)} 
                          className="w-full text-sm border px-2 py-1 rounded"
                          placeholder="e.g., Module 1 Video"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Type</label>
                        <select 
                          value={resourceType} 
                          onChange={e => setResourceType(e.target.value as 'video' | 'file' | 'image')}
                          className="w-full text-sm border px-2 py-1 rounded"
                        >
                          <option value="video">Video</option>
                          <option value="image">Image</option>
                          <option value="file">File/Document</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* File Upload Section */}
                    <div className="space-y-2 pt-2 border-t">
                      <div>
                        <label className="block text-xs font-medium mb-1">Upload File (Max 10MB)</label>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 px-3 py-2 bg-white border rounded text-sm cursor-pointer hover:bg-gray-50">
                            {uploadingFile ? 'Uploading...' : resourceFile ? resourceFile.name : 'Choose file...'}
                            <input 
                              type="file"
                              onChange={handleFileUpload}
                              disabled={uploadingFile}
                              accept={resourceType === 'image' ? 'image/*' : resourceType === 'video' ? 'video/*' : '*/*'}
                              className="hidden"
                            />
                          </label>
                          {resourceFile && (
                            <button
                              onClick={() => setResourceFile(null)}
                              className="px-2 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        {resourceFile && (
                          <p className="text-xs text-gray-600 mt-1">
                            {(resourceFile.size / 1024).toFixed(1)} KB
                          </p>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-600 text-center">OR</div>
                      
                      <div>
                        <label className="block text-xs font-medium mb-1">External URL (optional)</label>
                        <input 
                          value={resourceUrl} 
                          onChange={e => setResourceUrl(e.target.value)} 
                          className="w-full text-sm border px-2 py-1 rounded"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={resourceIsMilestone}
                        onChange={e => setResourceIsMilestone(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label className="text-xs font-medium">Mark as Milestone (assessment/tracking point)</label>
                    </div>
                    <button 
                      onClick={() => addResource(course.id)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      disabled={uploadingFile}
                    >
                      Add Resource
                    </button>
                  </div>
                )}

                {/* Resources List */}
                <div className="space-y-2">
                  {(!course.resources || course.resources.length === 0) && (
                    <p className="text-xs text-gray-500 italic">No resources added yet</p>
                  )}
                  {course.resources?.map(resource => (
                    <div key={resource.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                      <div className="flex-shrink-0">
                        {resource.type === 'video' ? (
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        ) : resource.type === 'image' ? (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <input 
                          value={resource.name} 
                          onChange={e => updateResource(course.id, resource.id, { name: e.target.value })}
                          className="w-full text-sm font-medium bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary outline-none"
                        />
                        {resource.fileData ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-600">
                              📎 {resource.fileName} ({(resource.fileSize! / 1024).toFixed(1)} KB)
                            </span>
                            <a
                              href={resource.fileData}
                              download={resource.fileName}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Download
                            </a>
                            {resource.type === 'image' && (
                              <button
                                onClick={() => {
                                  const win = window.open()
                                  win?.document.write(`<img src="${resource.fileData}" alt="${resource.name}" style="max-width:100%;height:auto;"/>`)
                                }}
                                className="text-xs text-green-600 hover:underline"
                              >
                                View
                              </button>
                            )}
                          </div>
                        ) : resource.url ? (
                          <input 
                            value={resource.url} 
                            onChange={e => updateResource(course.id, resource.id, { url: e.target.value })}
                            className="w-full text-xs text-gray-600 bg-transparent mt-1"
                            placeholder="URL"
                          />
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateResource(course.id, resource.id, { isMilestone: !resource.isMilestone })}
                          className={`px-2 py-0.5 text-xs rounded ${resource.isMilestone ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                          title={resource.isMilestone ? 'Milestone' : 'Click to mark as milestone'}
                        >
                          {resource.isMilestone ? '★ Milestone' : 'Milestone?'}
                        </button>
                        <button 
                          onClick={() => removeResource(course.id, resource.id)}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  )
}
