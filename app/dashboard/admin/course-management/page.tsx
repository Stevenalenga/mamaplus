'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AdminHeader } from '@/components/admin/admin-header'

type Resource = {
  id: string
  name: string
  type: 'video' | 'file' | 'image'
  url?: string
  fileData?: string
  fileName?: string
  fileSize?: number
  isMilestone: boolean
}

type Course = {
  id: string
  title: string
  description?: string
  enrolledStudents?: number
  completedStudents?: number
  resources?: Resource[]
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

const defaultCourses: Course[] = [
  {
    id: uid(),
    title: 'Introduction to Caregiving',
    description: 'Basic caregiving skills',
    enrolledStudents: 125,
    completedStudents: 89,
    resources: [
      { id: uid(), name: 'Course Overview Video', type: 'video', url: '', isMilestone: true },
      { id: uid(), name: 'Module 1: Basics', type: 'video', url: '', isMilestone: false },
      { id: uid(), name: 'Assessment Quiz', type: 'file', url: '', isMilestone: true },
    ],
  },
  {
    id: uid(),
    title: 'Maternal Health Basics',
    description: 'Essential maternal health knowledge',
    enrolledStudents: 98,
    completedStudents: 67,
    resources: [{ id: uid(), name: 'Introduction', type: 'video', url: '', isMilestone: true }],
  },
  {
    id: uid(),
    title: 'Infant Nutrition',
    description: 'Nutrition for infants and toddlers',
    enrolledStudents: 84,
    completedStudents: 84,
    resources: [],
  },
]

export default function CourseManagementPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const raw = localStorage.getItem('admin:courses')
      if (raw) return JSON.parse(raw)
      localStorage.setItem('admin:courses', JSON.stringify(defaultCourses))
      return defaultCourses
    } catch {
      return []
    }
  })

  // Create course form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Creation-time resources
  const [creationResources, setCreationResources] = useState<Resource[]>([])
  const [creationResourceName, setCreationResourceName] = useState('')
  const [creationResourceType, setCreationResourceType] = useState<'video' | 'file' | 'image'>('video')
  const [creationResourceMilestone, setCreationResourceMilestone] = useState(false)
  const [initialCourseFile, setInitialCourseFile] = useState<{ data: string; name: string; size: number } | null>(null)
  const [uploadingInitialFile, setUploadingInitialFile] = useState(false)

  // Per-course resource add form
  const [showResourceForm, setShowResourceForm] = useState<string | null>(null)
  const [resourceName, setResourceName] = useState('')
  const [resourceType, setResourceType] = useState<'video' | 'file' | 'image'>('video')
  const [resourceUrl, setResourceUrl] = useState('')
  const [resourceIsMilestone, setResourceIsMilestone] = useState(false)
  const [resourceFile, setResourceFile] = useState<{ data: string; name: string; size: number } | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Search / filter
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
      window.location.href = '/login'
    }
  }, [router, status, session])

  useEffect(() => {
    try { localStorage.setItem('admin:courses', JSON.stringify(courses)) } catch {}
  }, [courses])

  // ── Helpers ──────────────────────────────────────────────────────────────

  const handleInitialFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('File size must be less than 10MB'); return }
    setUploadingInitialFile(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setInitialCourseFile({ data: reader.result as string, name: file.name, size: file.size })
      setUploadingInitialFile(false)
    }
    reader.readAsDataURL(file)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('File size must be less than 10MB'); return }
    setUploadingFile(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setResourceFile({ data: reader.result as string, name: file.name, size: file.size })
      setUploadingFile(false)
      if (!resourceName.trim()) setResourceName(file.name)
    }
    reader.readAsDataURL(file)
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
      fileSize: initialCourseFile?.size,
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
      resources: [...creationResources],
    }
    setCourses(prev => [newCourse, ...prev])
    // Sync to browse:courses
    try {
      const browseCourses = JSON.parse(localStorage.getItem('browse:courses') || '[]')
      const maxId = browseCourses.length > 0 ? Math.max(...browseCourses.map((c: any) => Number(c.id) || 0)) : 0
      browseCourses.push({
        id: maxId + 1,
        title: newCourse.title,
        description: newCourse.description || 'No description provided',
        duration: `${creationResources.length} resources`,
        price: 'Free',
        courseId,
      })
      localStorage.setItem('browse:courses', JSON.stringify(browseCourses))
    } catch {}
    setTitle('')
    setDescription('')
    setCreationResources([])
    setInitialCourseFile(null)
  }

  function removeCourse(id: string) {
    setCourses(prev => prev.filter(c => c.id !== id))
    try {
      const browseCourses = JSON.parse(localStorage.getItem('browse:courses') || '[]')
      localStorage.setItem('browse:courses', JSON.stringify(browseCourses.filter((c: any) => c.courseId !== id)))
    } catch {}
  }

  function updateCourse(id: string, data: Partial<Course>) {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)))
    try {
      const browseCourses = JSON.parse(localStorage.getItem('browse:courses') || '[]')
      localStorage.setItem(
        'browse:courses',
        JSON.stringify(
          browseCourses.map((c: any) =>
            c.courseId === id ? { ...c, title: data.title || c.title, description: data.description || c.description } : c
          )
        )
      )
    } catch {}
  }

  function addResource(courseId: string) {
    if (!resourceName.trim()) { alert('Please provide a resource name'); return }
    if (!resourceUrl.trim() && !resourceFile) { alert('Please either upload a file or provide a URL'); return }
    const newResource: Resource = {
      id: uid(),
      name: resourceName.trim(),
      type: resourceType,
      url: resourceUrl.trim(),
      isMilestone: resourceIsMilestone,
      fileData: resourceFile?.data,
      fileName: resourceFile?.name,
      fileSize: resourceFile?.size,
    }
    setCourses(prev =>
      prev.map(c => (c.id === courseId ? { ...c, resources: [...(c.resources || []), newResource] } : c))
    )
    setResourceName(''); setResourceUrl(''); setResourceIsMilestone(false); setResourceFile(null); setShowResourceForm(null)
  }

  function removeResource(courseId: string, resourceId: string) {
    setCourses(prev =>
      prev.map(c => (c.id === courseId ? { ...c, resources: (c.resources || []).filter(r => r.id !== resourceId) } : c))
    )
  }

  function updateResource(courseId: string, resourceId: string, data: Partial<Resource>) {
    setCourses(prev =>
      prev.map(c =>
        c.id === courseId
          ? { ...c, resources: (c.resources || []).map(r => (r.id === resourceId ? { ...r, ...data } : r)) }
          : c
      )
    )
  }

  const filteredCourses = courses.filter(
    c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalEnrollments = courses.reduce((s, c) => s + (c.enrolledStudents || 0), 0)
  const totalCompletions = courses.reduce((s, c) => s + (c.completedStudents || 0), 0)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader active="course-management" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Course Management</h1>
        <p className="text-muted-foreground mb-6">Create, update, upload resources, and delete courses.</p>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Courses</p>
            <p className="text-3xl font-bold text-primary">{courses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Enrollments</p>
            <p className="text-3xl font-bold text-blue-600">{totalEnrollments}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Completions</p>
            <p className="text-3xl font-bold text-green-600">{totalCompletions}</p>
          </div>
        </div>

        {/* Create Course */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
          <form onSubmit={addCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Course Title <span className="text-red-500">*</span></label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                placeholder="e.g., Maternal Nutrition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                rows={3}
                placeholder="Brief course description..."
              />
            </div>

            {/* Pre-add resources during creation */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-2">Add Resources & Milestones</label>
              <div className="bg-gray-50 p-4 rounded space-y-3 mb-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Resource Name</label>
                  <input
                    value={creationResourceName}
                    onChange={e => setCreationResourceName(e.target.value)}
                    className="w-full text-sm border px-3 py-2 rounded"
                    placeholder="e.g., Introduction Video, Quiz 1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Type</label>
                    <select
                      value={creationResourceType}
                      onChange={e => setCreationResourceType(e.target.value as 'video' | 'file' | 'image')}
                      className="w-full text-sm border px-3 py-2 rounded"
                    >
                      <option value="video">Video</option>
                      <option value="file">Document / File</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
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
                  <label className="block text-xs font-medium mb-1">Upload File (max 10 MB, optional)</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 px-3 py-2 bg-white border rounded text-sm cursor-pointer hover:bg-gray-50">
                      {uploadingInitialFile ? 'Uploading…' : initialCourseFile ? initialCourseFile.name : 'Choose file…'}
                      <input
                        type="file"
                        onChange={handleInitialFileUpload}
                        disabled={uploadingInitialFile}
                        accept={
                          creationResourceType === 'image' ? 'image/*' : creationResourceType === 'video' ? 'video/*' : '*/*'
                        }
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
                    <p className="text-xs text-gray-500 mt-1">📎 {(initialCourseFile.size / 1024).toFixed(1)} KB</p>
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

              {creationResources.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">{creationResources.length} resource(s) queued:</p>
                  {creationResources.map(r => (
                    <div key={r.id} className="flex items-center justify-between bg-white border rounded px-3 py-2">
                      <div>
                        <span className="text-sm font-medium">{r.name}</span>
                        {r.isMilestone && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">★ Milestone</span>
                        )}
                        <div className="text-xs text-gray-500 mt-0.5 capitalize">
                          {r.type}{r.fileName ? ` • ${r.fileName}` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCreationResource(r.id)}
                        className="text-red-600 hover:text-red-700 text-sm ml-4"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button type="submit" className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 font-medium">
                Create Course
              </button>
            </div>
          </form>
        </div>

        {/* Course List */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-xl font-semibold">All Courses</h2>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border px-3 py-2 rounded text-sm w-full sm:w-64"
              placeholder="Search courses…"
            />
          </div>

          {filteredCourses.length === 0 && (
            <p className="text-muted-foreground py-4">{search ? 'No courses match your search.' : 'No courses yet.'}</p>
          )}

          <div className="space-y-6">
            {filteredCourses.map(course => {
              const completionPct =
                (course.enrolledStudents || 0) > 0
                  ? Math.round(((course.completedStudents || 0) / (course.enrolledStudents || 1)) * 100)
                  : 0

              return (
                <div key={course.id} className="border rounded-lg p-5 hover:bg-gray-50 transition">
                  {/* Title row */}
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      value={course.title}
                      onChange={e => updateCourse(course.id, { title: e.target.value })}
                      className="font-semibold text-lg border-b border-transparent hover:border-gray-300 focus:border-primary outline-none bg-transparent flex-1"
                    />
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${course.title}"? This cannot be undone.`)) removeCourse(course.id)
                      }}
                      className="px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 shrink-0"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Description */}
                  <textarea
                    className="w-full border p-2 rounded mb-4 text-sm"
                    value={course.description || ''}
                    onChange={e => updateCourse(course.id, { description: e.target.value })}
                    placeholder="Course description…"
                    rows={2}
                  />

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pb-4 border-b mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Enrolled</p>
                      <input
                        type="number"
                        value={course.enrolledStudents || 0}
                        onChange={e => updateCourse(course.id, { enrolledStudents: parseInt(e.target.value) || 0 })}
                        className="w-full text-sm border px-2 py-1 rounded"
                        min="0"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Completed</p>
                      <input
                        type="number"
                        value={course.completedStudents || 0}
                        onChange={e => updateCourse(course.id, { completedStudents: parseInt(e.target.value) || 0 })}
                        className="w-full text-sm border px-2 py-1 rounded"
                        min="0"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Completion Rate</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-green-600 shrink-0">{completionPct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Resources */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Resources & Milestones
                        <span className="ml-2 text-xs font-normal text-gray-400">({(course.resources || []).length})</span>
                      </h3>
                      <button
                        onClick={() => {
                          setShowResourceForm(showResourceForm === course.id ? null : course.id)
                          setResourceName(''); setResourceUrl(''); setResourceType('video')
                          setResourceIsMilestone(false); setResourceFile(null)
                        }}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        {showResourceForm === course.id ? 'Cancel' : '+ Add Resource'}
                      </button>
                    </div>

                    {/* Add resource form */}
                    {showResourceForm === course.id && (
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded mb-3 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
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
                              <option value="file">File / Document</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1">Upload File (max 10 MB)</label>
                          <div className="flex items-center gap-2">
                            <label className="flex-1 px-3 py-2 bg-white border rounded text-sm cursor-pointer hover:bg-gray-50">
                              {uploadingFile ? 'Uploading…' : resourceFile ? resourceFile.name : 'Choose file…'}
                              <input
                                type="file"
                                onChange={handleFileUpload}
                                disabled={uploadingFile}
                                accept={
                                  resourceType === 'image' ? 'image/*' : resourceType === 'video' ? 'video/*' : '*/*'
                                }
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
                            <p className="text-xs text-gray-500 mt-1">📎 {(resourceFile.size / 1024).toFixed(1)} KB</p>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 text-center">— or —</div>

                        <div>
                          <label className="block text-xs font-medium mb-1">External URL</label>
                          <input
                            value={resourceUrl}
                            onChange={e => setResourceUrl(e.target.value)}
                            className="w-full text-sm border px-2 py-1 rounded"
                            placeholder="https://…"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={resourceIsMilestone}
                            onChange={e => setResourceIsMilestone(e.target.checked)}
                            className="w-4 h-4"
                          />
                          <label className="text-xs font-medium">Mark as Milestone</label>
                        </div>

                        <button
                          onClick={() => addResource(course.id)}
                          disabled={uploadingFile}
                          className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Save Resource
                        </button>
                      </div>
                    )}

                    {/* Resource list */}
                    <div className="space-y-2">
                      {(!course.resources || course.resources.length === 0) && (
                        <p className="text-xs text-gray-400 italic">No resources yet.</p>
                      )}
                      {course.resources?.map(resource => (
                        <div key={resource.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                          <div className="flex-shrink-0 mt-0.5">
                            {resource.type === 'video' ? (
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                            ) : resource.type === 'image' ? (
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <input
                              value={resource.name}
                              onChange={e => updateResource(course.id, resource.id, { name: e.target.value })}
                              className="w-full text-sm font-medium bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary outline-none"
                            />
                            {resource.fileData ? (
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500">
                                  📎 {resource.fileName} ({(resource.fileSize! / 1024).toFixed(1)} KB)
                                </span>
                                <a href={resource.fileData} download={resource.fileName} className="text-xs text-blue-600 hover:underline">
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
                                    Preview
                                  </button>
                                )}
                              </div>
                            ) : resource.url ? (
                              <input
                                value={resource.url}
                                onChange={e => updateResource(course.id, resource.id, { url: e.target.value })}
                                className="w-full text-xs text-gray-500 bg-transparent mt-0.5"
                                placeholder="URL"
                              />
                            ) : null}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => updateResource(course.id, resource.id, { isMilestone: !resource.isMilestone })}
                              className={`px-2 py-0.5 text-xs rounded ${resource.isMilestone ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                            >
                              {resource.isMilestone ? '★ Milestone' : 'Milestone?'}
                            </button>
                            <button
                              onClick={() => removeResource(course.id, resource.id)}
                              className="text-red-500 hover:text-red-700 text-xs px-1"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
