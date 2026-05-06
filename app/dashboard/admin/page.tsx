'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ROLES, getRoleDisplayName, getRoleBadgeColor } from '@/lib/roles'
import { AdminHeader } from '@/components/admin/admin-header'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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
  const [courses] = useState<Course[]>(() => {
    try {
      const raw = localStorage.getItem('admin:courses')
      if (raw) return JSON.parse(raw)
      return []
    } catch {
      return []
    }
  })

  const [schools] = useState<School[]>(() => {
    try {
      const raw = localStorage.getItem('admin:schools')
      if (raw) return JSON.parse(raw)
      return []
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
  
  const [educators] = useState<Educator[]>(() => {
    try {
      const raw = localStorage.getItem('admin:educators')
      if (raw) return JSON.parse(raw)
      return []
    } catch {
      return []
    }
  })

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

  const totalSchoolStudents = schools.reduce((sum, s) => sum + s.studentCount, 0)
  const totalCompletions = courses.reduce((sum, c) => sum + (c.completedStudents || 0), 0)
  const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0)

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
      <AdminHeader active="home" />

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

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-semibold">Revenue Breakdown</h2>
            <span className="text-2xl font-bold text-amber-600">$12,456</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Total earnings split by revenue source</p>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-64 h-64 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Schools', value: 5200 },
                      { name: 'Educators', value: 3680 },
                      { name: 'Students', value: 3576 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#7c3aed" />
                    <Cell fill="#4f46e5" />
                    <Cell fill="#2563eb" />
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3 w-full">
              {[
                { label: 'Schools', value: 5200, total: 12456, color: 'bg-violet-600', text: 'text-violet-600' },
                { label: 'Educators', value: 3680, total: 12456, color: 'bg-indigo-600', text: 'text-indigo-600' },
                { label: 'Students', value: 3576, total: 12456, color: 'bg-blue-600', text: 'text-blue-600' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`}></span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${item.text}`}>${item.value.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground w-10 text-right">{Math.round((item.value / item.total) * 100)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${Math.round((item.value / item.total) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
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

      </div>
    </div>
  )
}
