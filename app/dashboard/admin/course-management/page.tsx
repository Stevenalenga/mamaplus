'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  decodeStringList,
  encodeStringList,
  stringListToTextarea,
  textareaToStringList,
} from '@/lib/course-fields'

type CourseStatus = 'DRAFT' | 'PUBLISHED'

type ManagedCourse = {
  id: string
  title: string
  description: string
  durationLabel: string
  scheduleDates: string
  location: string
  currency: 'USD' | 'KES'
  priceUSD: number
  priceKES: number
  targetAudienceText: string
  learningObjectivesText: string
  keyBenefitsText: string
  isFeatured: boolean
  status: CourseStatus
  enrolledStudents: number
  updatedAt: string
}

type ApiCourse = {
  id: string
  title: string
  description?: string | null
  durationLabel?: string | null
  scheduleDates?: string | null
  location?: string | null
  currency?: string | null
  priceUSD?: number
  priceKES?: number
  requirements?: string | null
  whatYouLearn?: string | null
  keyBenefits?: string | null
  isFeatured?: boolean
  isPublished: boolean
  updatedAt: string
  _count?: {
    enrollments?: number
  }
}

type CourseFormState = {
  title: string
  description: string
  durationLabel: string
  scheduleDates: string
  location: string
  currency: 'USD' | 'KES'
  price: string
  targetAudienceText: string
  learningObjectivesText: string
  keyBenefitsText: string
  isFeatured: boolean
}

const emptyForm: CourseFormState = {
  title: '',
  description: '',
  durationLabel: '',
  scheduleDates: '',
  location: '',
  currency: 'KES',
  price: '',
  targetAudienceText: '',
  learningObjectivesText: '',
  keyBenefitsText: '',
  isFeatured: false,
}

function mapApiCourse(course: ApiCourse): ManagedCourse {
  const currency = course.currency === 'USD' ? 'USD' : 'KES'
  return {
    id: course.id,
    title: course.title,
    description: course.description || '',
    durationLabel: course.durationLabel || '',
    scheduleDates: course.scheduleDates || '',
    location: course.location || '',
    currency,
    priceUSD: course.priceUSD ?? 0,
    priceKES: course.priceKES ?? 0,
    targetAudienceText: stringListToTextarea(decodeStringList(course.requirements)),
    learningObjectivesText: stringListToTextarea(decodeStringList(course.whatYouLearn)),
    keyBenefitsText: stringListToTextarea(decodeStringList(course.keyBenefits)),
    isFeatured: !!course.isFeatured,
    status: course.isPublished ? 'PUBLISHED' : 'DRAFT',
    enrolledStudents: course._count?.enrollments || 0,
    updatedAt: course.updatedAt,
  }
}

function formFromCourse(course: ManagedCourse): CourseFormState {
  return {
    title: course.title,
    description: course.description,
    durationLabel: course.durationLabel,
    scheduleDates: course.scheduleDates,
    location: course.location,
    currency: course.currency,
    price: String(course.currency === 'USD' ? course.priceUSD : course.priceKES),
    targetAudienceText: course.targetAudienceText,
    learningObjectivesText: course.learningObjectivesText,
    keyBenefitsText: course.keyBenefitsText,
    isFeatured: course.isFeatured,
  }
}

function buildPayload(form: CourseFormState) {
  const price = parseFloat(form.price) || 0
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    durationLabel: form.durationLabel.trim(),
    scheduleDates: form.scheduleDates.trim(),
    location: form.location.trim(),
    currency: form.currency,
    priceUSD: form.currency === 'USD' ? price : 0,
    priceKES: form.currency === 'KES' ? price : 0,
    requirements: encodeStringList(textareaToStringList(form.targetAudienceText)),
    whatYouLearn: encodeStringList(textareaToStringList(form.learningObjectivesText)),
    keyBenefits: encodeStringList(textareaToStringList(form.keyBenefitsText)),
    isFeatured: form.isFeatured,
    category: 'Professional Training',
    level: 'BEGINNER',
    duration: 0,
  }
}

export default function CourseManagementPage() {
  const { data: session, status } = useSession()

  const [courses, setCourses] = useState<ManagedCourse[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [createForm, setCreateForm] = useState<CourseFormState>(emptyForm)
  const [editForm, setEditForm] = useState<CourseFormState | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
      window.location.href = '/login'
    }
  }, [status, session])

  async function loadCourses() {
    setLoadingCourses(true)
    setError(null)
    try {
      const response = await fetch('/api/courses?mine=true')
      const json = await response.json()
      if (!response.ok || !json.success) {
        setError(json.message || 'Failed to load courses')
        return
      }

      const mappedCourses = (json.data as ApiCourse[]).map(mapApiCourse)
      setCourses(mappedCourses)

      if (selectedCourseId) {
        const selected = mappedCourses.find((course) => course.id === selectedCourseId)
        if (selected) {
          setEditForm(formFromCourse(selected))
        } else {
          setSelectedCourseId(null)
          setEditForm(null)
        }
      }
    } catch {
      setError('Failed to load courses')
    } finally {
      setLoadingCourses(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      loadCourses()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.role])

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) || null,
    [courses, selectedCourseId],
  )

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase()) ||
      course.location.toLowerCase().includes(search.toLowerCase()),
  )

  const totalEnrollments = courses.reduce((sum, course) => sum + course.enrolledStudents, 0)

  function selectCourse(course: ManagedCourse) {
    setSelectedCourseId(course.id)
    setEditForm(formFromCourse(course))
    setMessage(null)
    setError(null)
  }

  function renderFormFields(
    form: CourseFormState,
    onChange: (next: CourseFormState) => void,
    idPrefix: string,
  ) {
    return (
      <div className="space-y-4">
        <div>
          <label htmlFor={`${idPrefix}-title`} className="block text-sm font-medium mb-1">
            Course Title <span className="text-red-500">*</span>
          </label>
          <input
            id={`${idPrefix}-title`}
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g., Maternal Nutrition"
            disabled={submitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${idPrefix}-duration`} className="block text-sm font-medium mb-1">
              Duration
            </label>
            <input
              id={`${idPrefix}-duration`}
              value={form.durationLabel}
              onChange={(e) => onChange({ ...form, durationLabel: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              placeholder="e.g., 3 Days"
              disabled={submitting}
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-dates`} className="block text-sm font-medium mb-1">
              Time / Dates
            </label>
            <input
              id={`${idPrefix}-dates`}
              value={form.scheduleDates}
              onChange={(e) => onChange({ ...form, scheduleDates: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              placeholder="e.g., 13th – 15th May 2026"
              disabled={submitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-location`} className="block text-sm font-medium mb-1">
            Place / Location
          </label>
          <input
            id={`${idPrefix}-location`}
            value={form.location}
            onChange={(e) => onChange({ ...form, location: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g., Nairobi"
            disabled={submitting}
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}-description`} className="block text-sm font-medium mb-1">
            Course Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id={`${idPrefix}-description`}
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            rows={4}
            placeholder="Describe what participants will learn..."
            disabled={submitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${idPrefix}-currency`} className="block text-sm font-medium mb-1">
              Price Currency
            </label>
            <select
              id={`${idPrefix}-currency`}
              value={form.currency}
              onChange={(e) => onChange({ ...form, currency: e.target.value as 'USD' | 'KES' })}
              className="w-full border px-3 py-2 rounded"
              disabled={submitting}
            >
              <option value="KES">KES</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div>
            <label htmlFor={`${idPrefix}-price`} className="block text-sm font-medium mb-1">
              Price
            </label>
            <input
              id={`${idPrefix}-price`}
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => onChange({ ...form, price: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              placeholder="e.g., 24000"
              disabled={submitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-audience`} className="block text-sm font-medium mb-1">
            Target Audience
          </label>
          <textarea
            id={`${idPrefix}-audience`}
            value={form.targetAudienceText}
            onChange={(e) => onChange({ ...form, targetAudienceText: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            rows={4}
            placeholder="One audience per line"
            disabled={submitting}
          />
          <p className="text-xs text-muted-foreground mt-1">Enter one target audience item per line.</p>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-objectives`} className="block text-sm font-medium mb-1">
            Learning Objectives
          </label>
          <textarea
            id={`${idPrefix}-objectives`}
            value={form.learningObjectivesText}
            onChange={(e) => onChange({ ...form, learningObjectivesText: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            rows={4}
            placeholder="One objective per line"
            disabled={submitting}
          />
          <p className="text-xs text-muted-foreground mt-1">Enter one learning objective per line.</p>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-benefits`} className="block text-sm font-medium mb-1">
            Key Benefits
          </label>
          <textarea
            id={`${idPrefix}-benefits`}
            value={form.keyBenefitsText}
            onChange={(e) => onChange({ ...form, keyBenefitsText: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            rows={4}
            placeholder="One benefit per line"
            disabled={submitting}
          />
          <p className="text-xs text-muted-foreground mt-1">Enter one key benefit per line.</p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => onChange({ ...form, isFeatured: e.target.checked })}
            disabled={submitting}
          />
          Feature this course on the browse page
        </label>
      </div>
    )
  }

  async function createCourse(e: React.FormEvent) {
    e.preventDefault()
    if (!createForm.title.trim() || !createForm.description.trim()) {
      setError('Course title and description are required.')
      return
    }

    setSubmitting(true)
    setMessage(null)
    setError(null)
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(createForm)),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setError(json.message || 'Failed to create course')
        return
      }

      setCreateForm(emptyForm)
      setMessage('Course created. Publish it when ready to show on Browse Courses.')
      await loadCourses()
      if (json.data?.id) {
        setSelectedCourseId(json.data.id)
      }
    } catch {
      setError('Failed to create course')
    } finally {
      setSubmitting(false)
    }
  }

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCourseId || !editForm) return
    if (!editForm.title.trim() || !editForm.description.trim()) {
      setError('Course title and description are required.')
      return
    }

    setSubmitting(true)
    setMessage(null)
    setError(null)
    try {
      const response = await fetch(`/api/courses/${selectedCourseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(editForm)),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setError(json.message || 'Failed to update course')
        return
      }

      setMessage('Course updated successfully.')
      await loadCourses()
    } catch {
      setError('Failed to update course')
    } finally {
      setSubmitting(false)
    }
  }

  async function publishCourse(courseId: string) {
    if (!window.confirm('Publish this course to the Browse Courses page?')) return

    setSubmitting(true)
    setMessage(null)
    setError(null)
    try {
      const response = await fetch(`/api/courses/${courseId}/publish`, { method: 'POST' })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setError(json.message || 'Failed to publish course')
        return
      }
      setMessage('Course published to Browse Courses.')
      await loadCourses()
    } catch {
      setError('Failed to publish course')
    } finally {
      setSubmitting(false)
    }
  }

  async function unpublishCourse(courseId: string) {
    if (!window.confirm('Remove this course from the Browse Courses page?')) return

    setSubmitting(true)
    setMessage(null)
    setError(null)
    try {
      const response = await fetch(`/api/courses/${courseId}/unpublish`, { method: 'POST' })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setError(json.message || 'Failed to unpublish course')
        return
      }
      setMessage('Course removed from Browse Courses.')
      await loadCourses()
    } catch {
      setError('Failed to unpublish course')
    } finally {
      setSubmitting(false)
    }
  }

  async function removeCourse(courseId: string) {
    const course = courses.find((item) => item.id === courseId)
    if (!window.confirm(`Delete "${course?.title}" permanently?`)) return

    setSubmitting(true)
    setMessage(null)
    setError(null)
    try {
      const response = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' })
      const json = await response.json()
      if (!response.ok || !json.success) {
        setError(json.message || 'Failed to delete course')
        return
      }

      if (selectedCourseId === courseId) {
        setSelectedCourseId(null)
        setEditForm(null)
      }
      setMessage('Course deleted.')
      await loadCourses()
    } catch {
      setError('Failed to delete course')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loadingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader active="course-management" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Course Management</h1>
        <p className="text-muted-foreground mb-6">
          Create and edit courses shown on the Browse Courses page. Only published courses are visible to users.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Courses</p>
            <p className="text-3xl font-bold text-primary">{courses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Enrollments</p>
            <p className="text-3xl font-bold text-blue-600">{totalEnrollments}</p>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
          <form onSubmit={createCourse}>
            {renderFormFields(createForm, setCreateForm, 'create')}
            <button
              type="submit"
              disabled={submitting || !createForm.title.trim() || !createForm.description.trim()}
              className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 font-medium disabled:opacity-50"
            >
              Create Course
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-xl font-semibold">All Courses</h2>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-3 py-2 rounded text-sm w-full sm:w-64"
                placeholder="Search courses…"
              />
            </div>

            {filteredCourses.length === 0 ? (
              <p className="text-muted-foreground py-4">
                {search ? 'No courses match your search.' : 'No courses yet.'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      selectedCourseId === course.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => selectCourse(course)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>{course.durationLabel || 'Duration TBD'}</span>
                          <span>•</span>
                          <span>{course.location || 'Location TBD'}</span>
                          <span>•</span>
                          <span>
                            {course.currency === 'USD'
                              ? `$${course.priceUSD}`
                              : `KES ${course.priceKES.toLocaleString()}`}
                          </span>
                        </div>
                        <span
                          className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                            course.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {course.status}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {course.status === 'PUBLISHED' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              unpublishCourse(course.id)
                            }}
                            className="px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
                            disabled={submitting}
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              publishCourse(course.id)
                            }}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            disabled={submitting}
                          >
                            Publish
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeCourse(course.id)
                          }}
                          className="px-3 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50"
                          disabled={submitting}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Course</h2>
            {!selectedCourse || !editForm ? (
              <p className="text-muted-foreground">Select a course from the list to edit its details.</p>
            ) : (
              <form onSubmit={saveCourse}>
                {renderFormFields(editForm, setEditForm, 'edit')}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                  {selectedCourse.status === 'PUBLISHED' ? (
                    <button
                      type="button"
                      onClick={() => unpublishCourse(selectedCourse.id)}
                      disabled={submitting}
                      className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => publishCourse(selectedCourse.id)}
                      disabled={submitting}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Publish
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
