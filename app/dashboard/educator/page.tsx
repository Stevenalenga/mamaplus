'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Loader2 } from 'lucide-react'
import { decodeLessonResourceMeta, decodeModuleDescription } from '@/lib/course-authoring'
import EducatorHeader from '@/components/educator/educator-header'

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
  const [hasLoaded, setHasLoaded] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function loadCourses(preserveSelected = true) {
    if (hasLoaded && preserveSelected) {
      return
    }
    
    setLoadingCourses(true)
    try {
      const response = await fetch('/api/courses')
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
      
      setHasLoaded(true)
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
      <EducatorHeader currentPage="home" />

      <div className="max-w-6xl mx-auto px-6 py-8 pt-8">
        <h1 className="text-3xl font-bold mb-4">Welcome back{user?.name ? `, ${user.name}` : ''}!</h1>
        <p className="text-muted-foreground mb-6">
          Browse published courses. The course catalog is managed by administrators.
        </p>

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
          <h2 className="text-xl font-semibold mb-4">Published Courses</h2>
          {courses.length === 0 ? (
            <p className="text-muted-foreground">No published courses yet.</p>
          ) : (
            <div className="space-y-3">
              {courses.map(course => (
                <div key={course.id} className={`border rounded-lg p-4 ${selectedCourseId === course.id ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      {course.description && <p className="text-sm text-muted-foreground mt-1">{course.description}</p>}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800">
                          PUBLISHED
                        </span>
                        <span className="text-xs text-muted-foreground">{course.sections.length} sections</span>
                        <span className="text-xs text-muted-foreground">{course.enrolledStudents} enrolled</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedCourseId(course.id)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">View</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCourse && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            <div className="space-y-4 mb-6 pb-6 border-b">
              <h3 className="font-semibold text-lg">{selectedCourse.title}</h3>
              {selectedCourse.description && (
                <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
              )}
            </div>

            <div className="space-y-4">
              {selectedCourse.sections.length === 0 ? (
                <p className="text-muted-foreground">No sections in this course yet.</p>
              ) : (
                selectedCourse.sections.map((section) => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <div className="mb-3">
                      <p className="font-medium">{section.title}</p>
                      <p className="text-xs text-muted-foreground">{section.isMilestone ? 'Section milestone' : 'Regular section'}</p>
                    </div>
                    <div className="space-y-2">
                      {section.lessons.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No lessons in this section.</p>
                      ) : (
                        section.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between rounded border px-3 py-2">
                            <div>
                              <p className="text-sm font-medium">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {lesson.type.toUpperCase()} {lesson.isMilestone ? '• Milestone' : ''}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
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
