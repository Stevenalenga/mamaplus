'use client'

import React, { useEffect, useMemo, useState } from 'react'
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
import { decodeLessonResourceMeta, decodeModuleDescription } from '@/lib/course-authoring'

type ResourceType = 'video' | 'file' | 'image'
type CourseStatus = 'DRAFT' | 'PUBLISHED'

type LessonItem = {
  id: string
  title: string
  type: ResourceType
  url?: string
  isMilestone: boolean
}

type CourseSection = {
  id: string
  title: string
  isMilestone: boolean
  lessons: LessonItem[]
}

type ManagedCourse = {
  id: string
  title: string
  description?: string
  status: CourseStatus
  sections: CourseSection[]
  enrolledStudents: number
  completedStudents: number
  updatedAt: string
}

type LessonDraft = {
  title: string
  type: ResourceType
  url: string
  isMilestone: boolean
}

type ApiLesson = {
  id: string
  title: string
  content?: string | null
  videoUrl?: string | null
  resourceUrls?: string | null
}

type ApiModule = {
  id: string
  title: string
  description?: string | null
  lessons: ApiLesson[]
}

type ApiCourse = {
  id: string
  title: string
  description?: string | null
  isPublished: boolean
  updatedAt: string
  modules: ApiModule[]
  _count?: {
    enrollments?: number
  }
}

function mapType(type: string | null | undefined): ResourceType {
  if (type === 'file' || type === 'image' || type === 'video') return type
  return 'video'
}

function mapApiCourse(course: ApiCourse): ManagedCourse {
  return {
    id: course.id,
    title: course.title,
    description: course.description || '',
    status: course.isPublished ? 'PUBLISHED' : 'DRAFT',
    sections: (course.modules || []).map((module) => {
      const moduleMeta = decodeModuleDescription(module.description)
      return {
        id: module.id,
        title: module.title,
        isMilestone: moduleMeta.isMilestone,
        lessons: (module.lessons || []).map((lesson) => {
          const lessonMeta = decodeLessonResourceMeta(lesson.resourceUrls)
          return {
            id: lesson.id,
            title: lesson.title,
            type: mapType(lesson.content),
            url: lessonMeta.url || lesson.videoUrl || undefined,
            isMilestone: lessonMeta.isMilestone,
          }
        }),
      }
    }),
    enrolledStudents: course._count?.enrollments || 0,
    completedStudents: 0,
    updatedAt: course.updatedAt,
  }
}

export default function EducatorDashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useCurrentUser()

  const [courses, setCourses] = useState<ManagedCourse[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [draftTitle, setDraftTitle] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [newSectionMilestone, setNewSectionMilestone] = useState(false)
  const [lessonDrafts, setLessonDrafts] = useState<Record<string, LessonDraft>>({})
  const [message, setMessage] = useState<string | null>(null)

  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Draft Saved', message: 'Continue building your course anytime', time: '1 hour ago', read: false },
    { id: '2', title: 'Course Published', message: 'Published courses become visible to users', time: '1 day ago', read: false },
    { id: '3', title: 'Welcome Educator', message: 'Welcome to MamaPlus educator portal', time: '3 days ago', read: true },
  ])

  const unreadCount = notifications.filter(n => !n.read).length
  const markAsRead = (id: string) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllAsRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })))

  async function loadCourses(preserveSelected = true) {
    setLoadingCourses(true)
    try {
      const response = await fetch('/api/courses?mine=true')
      const json = await response.json()
      if (!response.ok || !json.success) {
        setMessage(json.message || 'Failed to load courses')
        return
      }

      const mappedCourses = (json.data as ApiCourse[]).map(mapApiCourse)
      setCourses(mappedCourses)

      if (mappedCourses.length === 0) {
        setSelectedCourseId(null)
      } else if (!preserveSelected || !mappedCourses.some((course) => course.id === selectedCourseId)) {
        setSelectedCourseId(mappedCourses[0].id)
      }
    } catch {
      setMessage('Failed to load courses')
    } finally {
      setLoadingCourses(false)
    }
  }

  useEffect(() => {
    if (!isLoading) {
      loadCourses(false)
    }
  }, [isLoading])

  const selectedCourse = useMemo(
    () => courses.find(c => c.id === selectedCourseId) || null,
    [courses, selectedCourseId],
  )

  async function createDraftCourse(e?: React.FormEvent) {
    e?.preventDefault()
    if (!draftTitle.trim() || !draftDescription.trim()) {
      setMessage('Course title and description are required.')
      return
    }

    setSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draftTitle.trim(),
          description: draftDescription.trim(),
          category: 'Educator Created',
          level: 'BEGINNER',
          duration: 0,
          priceUSD: 0,
          priceKES: 0,
          currency: 'USD',
          isPublished: false,
        }),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setMessage(json.message || 'Failed to create draft')
        return
      }

      setDraftTitle('')
      setDraftDescription('')
      setMessage('Draft course created. Continue building it in sections below.')
      await loadCourses(false)
      setSelectedCourseId(json.data.id)
    } catch {
      setMessage('Failed to create draft')
    } finally {
      setSubmitting(false)
    }
  }

  async function saveDraft(courseId: string) {
    const course = courses.find(c => c.id === courseId)
    if (!course) return

    setSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: course.title,
          description: course.description || '',
          isPublished: false,
        }),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setMessage(json.message || 'Failed to save draft')
        return
      }

      setMessage('Draft saved. You can continue editing anytime.')
      await loadCourses()
    } catch {
      setMessage('Failed to save draft')
    } finally {
      setSubmitting(false)
    }
  }

  async function addSection(e?: React.FormEvent) {
    e?.preventDefault()
    if (!selectedCourse || !newSectionTitle.trim()) return

    setSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSectionTitle.trim(),
          isMilestone: newSectionMilestone,
        }),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setMessage(json.message || 'Failed to add section')
        return
      }

      setNewSectionTitle('')
      setNewSectionMilestone(false)
      setMessage('Section added to draft.')
      await loadCourses()
    } catch {
      setMessage('Failed to add section')
    } finally {
      setSubmitting(false)
    }
  }

  async function editSection(sectionId: string, currentTitle: string, currentMilestone: boolean) {
    if (!selectedCourse) return

    const nextTitle = window.prompt('Update section title', currentTitle)
    if (!nextTitle || !nextTitle.trim()) return
    const nextMilestone = window.confirm('Should this section be a milestone? Click OK for Yes, Cancel for No.')

    setSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}/modules/${sectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: nextTitle.trim(),
          isMilestone: nextMilestone,
        }),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setMessage(json.message || 'Failed to update section')
        return
      }

      setMessage('Section updated.')
      await loadCourses()
    } catch {
      setMessage('Failed to update section')
    } finally {
      setSubmitting(false)
    }
  }

  async function removeSection(sectionId: string) {
    if (!selectedCourse) return

    const approved = window.confirm('Delete this section and all lessons inside it?')
    if (!approved) return

    setSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}/modules/${sectionId}`, {
        method: 'DELETE',
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setMessage(json.message || 'Failed to remove section')
        return
      }

      setMessage('Section removed.')
      await loadCourses()
    } catch {
      setMessage('Failed to remove section')
    } finally {
      setSubmitting(false)
    }
  }

  async function addLesson(sectionId: string) {
    if (!selectedCourse) return
    const draft = lessonDrafts[sectionId]
    if (!draft || !draft.title.trim()) return

    setSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}/modules/${sectionId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title.trim(),
          type: draft.type,
          url: draft.url.trim() || undefined,
          isMilestone: draft.isMilestone,
          duration: 0,
        }),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setMessage(json.message || 'Failed to add lesson')
        return
      }

      setLessonDrafts(prev => ({
        ...prev,
        [sectionId]: { title: '', type: 'video', url: '', isMilestone: false },
      }))
      setMessage('Lesson added.')
      await loadCourses()
    } catch {
      setMessage('Failed to add lesson')
    } finally {
      setSubmitting(false)
    }
  }

  async function removeLesson(sectionId: string, lessonId: string) {
    if (!selectedCourse) return

    const approved = window.confirm('Delete this lesson?')
    if (!approved) return

    setSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}/modules/${sectionId}/lessons/${lessonId}`, {
        method: 'DELETE',
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setMessage(json.message || 'Failed to remove lesson')
        return
      }

      setMessage('Lesson removed.')
      await loadCourses()
    } catch {
      setMessage('Failed to remove lesson')
    } finally {
      setSubmitting(false)
    }
  }

  async function publishCourse(courseId: string) {
    const approved = window.confirm('Publish this course now? It will become visible to users.')
    if (!approved) return

    setSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/courses/${courseId}/publish`, {
        method: 'POST',
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setMessage(json.message || 'Failed to publish course')
        return
      }

      setMessage('Course published. Users can now view and enroll.')
      await loadCourses()
    } catch {
      setMessage('Failed to publish course')
    } finally {
      setSubmitting(false)
    }
  }

  async function unpublishCourse(courseId: string) {
    const approved = window.confirm('Unpublish this course? Users will no longer see it in active content.')
    if (!approved) return

    setSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/courses/${courseId}/unpublish`, {
        method: 'POST',
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setMessage(json.message || 'Failed to unpublish course')
        return
      }

      setMessage('Course unpublished and moved back to draft.')
      await loadCourses()
    } catch {
      setMessage('Failed to unpublish course')
    } finally {
      setSubmitting(false)
    }
  }

  async function removeCourse(courseId: string) {
    const approved = window.confirm('Delete this course permanently?')
    if (!approved) return

    setSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setMessage(json.message || 'Failed to delete course')
        return
      }

      if (selectedCourseId === courseId) {
        setSelectedCourseId(null)
      }
      setMessage('Course deleted.')
      await loadCourses(false)
    } catch {
      setMessage('Failed to delete course')
    } finally {
      setSubmitting(false)
    }
  }

  const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0)
  const totalCompleted = courses.reduce((sum, c) => sum + (c.completedStudents || 0), 0)

  if (isLoading || loadingCourses) {
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
        <h1 className="text-3xl font-bold mb-4">Welcome back{user?.name ? `, ${user.name}` : ''}!</h1>
        <p className="text-muted-foreground mb-6">Create courses in sections, add milestones, save as draft, then publish when ready.</p>

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

        {message && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Draft Course</h2>
          <form onSubmit={createDraftCourse} className="space-y-3">
            <input
              value={draftTitle}
              onChange={e => setDraftTitle(e.target.value)}
              placeholder="Course title"
              className="w-full border rounded px-3 py-2"
              disabled={submitting}
            />
            <textarea
              value={draftDescription}
              onChange={e => setDraftDescription(e.target.value)}
              placeholder="Course description"
              rows={3}
              className="w-full border rounded px-3 py-2"
              disabled={submitting}
            />
            <button type="submit" disabled={!draftTitle.trim() || !draftDescription.trim() || submitting} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50">
              Create Draft
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">My Courses</h2>
          {courses.length === 0 ? (
            <p className="text-muted-foreground">No courses yet.</p>
          ) : (
            <div className="space-y-3">
              {courses.map(course => (
                <div key={course.id} className={`border rounded-lg p-4 ${selectedCourseId === course.id ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      {course.description && <p className="text-sm text-muted-foreground mt-1">{course.description}</p>}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                          {course.status}
                        </span>
                        <span className="text-xs text-muted-foreground">{course.sections.length} sections</span>
                        <span className="text-xs text-muted-foreground">Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => setSelectedCourseId(course.id)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50" disabled={submitting}>Edit</button>
                      <button onClick={() => saveDraft(course.id)} className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50" disabled={submitting}>Save Draft</button>
                      {course.status === 'PUBLISHED' ? (
                        <button onClick={() => unpublishCourse(course.id)} className="px-3 py-1 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50" disabled={submitting}>Unpublish</button>
                      ) : (
                        <button onClick={() => publishCourse(course.id)} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50" disabled={submitting}>Publish</button>
                      )}
                      <button onClick={() => removeCourse(course.id)} className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50" disabled={submitting}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCourse && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Build Course Sections & Milestones</h2>

            <div className="space-y-3 mb-6 pb-6 border-b">
              <input
                value={selectedCourse.title}
                onChange={e => setCourses(prev => prev.map(course => course.id === selectedCourse.id ? { ...course, title: e.target.value } : course))}
                placeholder="Course title"
                className="w-full border rounded px-3 py-2"
                disabled={submitting}
              />
              <textarea
                value={selectedCourse.description || ''}
                onChange={e => setCourses(prev => prev.map(course => course.id === selectedCourse.id ? { ...course, description: e.target.value } : course))}
                placeholder="Course description"
                rows={3}
                className="w-full border rounded px-3 py-2"
                disabled={submitting}
              />
              <button onClick={() => saveDraft(selectedCourse.id)} className="w-fit px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50" disabled={submitting}>
                Save Course Details
              </button>
            </div>

            <form onSubmit={addSection} className="space-y-3 mb-6 pb-6 border-b">
              <h3 className="font-semibold">Add Section</h3>
              <input
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                placeholder="Section title (e.g., Module 1: Fundamentals)"
                className="w-full border rounded px-3 py-2"
                disabled={submitting}
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={newSectionMilestone}
                  onChange={e => setNewSectionMilestone(e.target.checked)}
                  className="rounded"
                  disabled={submitting}
                />
                This section is a milestone
              </label>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50" disabled={submitting}>Add Section</button>
            </form>

            <div className="space-y-4">
              {selectedCourse.sections.length === 0 ? (
                <p className="text-muted-foreground">No sections yet. Add your first section above.</p>
              ) : (
                selectedCourse.sections.map((section) => {
                  const sectionDraft = lessonDrafts[section.id] || { title: '', type: 'video' as ResourceType, url: '', isMilestone: false }

                  return (
                    <div key={section.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3 gap-4">
                        <div className="flex-1 space-y-2">
                          <p className="font-medium">{section.title}</p>
                          <p className="text-xs text-muted-foreground">{section.isMilestone ? 'Section milestone' : 'Regular section'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => editSection(section.id, section.title, section.isMilestone)} className="text-sm border rounded px-3 py-1 hover:bg-gray-50 disabled:opacity-50" disabled={submitting}>Edit</button>
                          <button onClick={() => removeSection(section.id)} className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50" disabled={submitting}>Remove Section</button>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {section.lessons.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No lessons in this section yet.</p>
                        ) : (
                          section.lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between rounded border px-3 py-2">
                              <div>
                                <p className="text-sm font-medium">{lesson.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.type.toUpperCase()} {lesson.isMilestone ? '• Milestone' : ''}
                                </p>
                              </div>
                              <button onClick={() => removeLesson(section.id, lesson.id)} className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50" disabled={submitting}>Remove</button>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="bg-gray-50 rounded p-3 space-y-2">
                        <p className="text-sm font-medium">Add Lesson</p>
                        <input
                          value={sectionDraft.title}
                          onChange={e => setLessonDrafts(prev => ({
                            ...prev,
                            [section.id]: { ...sectionDraft, title: e.target.value },
                          }))}
                          placeholder="Lesson title"
                          className="w-full border rounded px-3 py-2 text-sm"
                          disabled={submitting}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <select
                            value={sectionDraft.type}
                            onChange={e => setLessonDrafts(prev => ({
                              ...prev,
                              [section.id]: { ...sectionDraft, type: e.target.value as ResourceType },
                            }))}
                            className="w-full border rounded px-3 py-2 text-sm"
                            disabled={submitting}
                          >
                            <option value="video">Video</option>
                            <option value="file">File</option>
                            <option value="image">Image</option>
                          </select>
                          <input
                            value={sectionDraft.url}
                            onChange={e => setLessonDrafts(prev => ({
                              ...prev,
                              [section.id]: { ...sectionDraft, url: e.target.value },
                            }))}
                            placeholder="Resource URL (optional)"
                            className="w-full border rounded px-3 py-2 text-sm"
                            disabled={submitting}
                          />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={sectionDraft.isMilestone}
                            onChange={e => setLessonDrafts(prev => ({
                              ...prev,
                              [section.id]: { ...sectionDraft, isMilestone: e.target.checked },
                            }))}
                            className="rounded"
                            disabled={submitting}
                          />
                          Lesson milestone
                        </label>
                        <button onClick={() => addLesson(section.id)} className="px-3 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90 disabled:opacity-50" disabled={submitting}>
                          Add Lesson
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-3">
            <button onClick={() => router.push('/courses')} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">Browse Courses</button>
            <button onClick={() => router.push('/dashboard/educator/profile')} className="px-4 py-2 bg-white border border-primary text-primary rounded hover:bg-primary/10">View Profile</button>
          </div>
        </div>
      </div>
    </div>
  )
}
