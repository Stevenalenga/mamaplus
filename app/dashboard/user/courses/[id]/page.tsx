'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Download, CheckCircle, Circle, Video, FileText, ImageIcon } from 'lucide-react'

type Resource = {
  id: string
  name: string
  type: 'video' | 'file' | 'image'
  url?: string
  fileData?: string
  fileName?: string
  fileSize?: number
  isMilestone: boolean
  completedBy?: string[]
}

type Course = {
  id: string
  title: string
  description?: string
  enrolledStudents?: number
  completedStudents?: number
  resources?: Resource[]
}

type EnrolledCourse = {
  id: string
  title: string
  progress: number
  completedResources?: string[]
}

type UserProfile = {
  name: string
  email: string
  phone: string
  location: string
  profilePicture?: string
  enrolledCourses: EnrolledCourse[]
}

export default function UserCoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [enrolledCourse, setEnrolledCourse] = useState<EnrolledCourse | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [completedResources, setCompletedResources] = useState<string[]>([])
  const [expandedResource, setExpandedResource] = useState<string | null>(null)

  useEffect(() => {
    // Validate session
    const currentUserType = localStorage.getItem('currentUserType')
    if (currentUserType !== 'user') {
      router.push('/login')
      return
    }

    // Load course from admin:courses
    try {
      const adminCoursesRaw = localStorage.getItem('admin:courses')
      if (adminCoursesRaw) {
        const adminCourses = JSON.parse(adminCoursesRaw) as Course[]
        const foundCourse = adminCourses.find(c => c.id === courseId)
        if (foundCourse) {
          setCourse(foundCourse)
        }
      }
    } catch (e) {
      console.error('Error loading course:', e)
    }

    // Load user profile and enrollment data
    try {
      const profileRaw = localStorage.getItem('user:profile')
      if (profileRaw) {
        const profile = JSON.parse(profileRaw) as UserProfile
        setUserProfile(profile)
        
        const enrolled = profile.enrolledCourses?.find(c => c.id === courseId)
        if (enrolled) {
          setEnrolledCourse(enrolled)
          setCompletedResources(enrolled.completedResources || [])
        } else {
          // Not enrolled, redirect to dashboard
          router.push('/dashboard/user')
        }
      }
    } catch (e) {
      console.error('Error loading user profile:', e)
    }
  }, [courseId, router])

  const calculateProgress = (completedResourceIds: string[]): number => {
    if (!course?.resources) return 0
    
    const milestones = course.resources.filter(r => r.isMilestone)
    if (milestones.length === 0) return 0
    
    const completedMilestones = milestones.filter(m => completedResourceIds.includes(m.id))
    return Math.round((completedMilestones.length / milestones.length) * 100)
  }

  const toggleResourceCompletion = (resourceId: string) => {
    if (!userProfile || !enrolledCourse) return

    const newCompletedResources = completedResources.includes(resourceId)
      ? completedResources.filter(id => id !== resourceId)
      : [...completedResources, resourceId]

    setCompletedResources(newCompletedResources)

    // Calculate new progress
    const newProgress = calculateProgress(newCompletedResources)

    // Update user profile
    const updatedProfile = {
      ...userProfile,
      enrolledCourses: userProfile.enrolledCourses.map(c =>
        c.id === courseId
          ? { ...c, progress: newProgress, completedResources: newCompletedResources }
          : c
      )
    }

    setUserProfile(updatedProfile)
    setEnrolledCourse({ ...enrolledCourse, progress: newProgress, completedResources: newCompletedResources })

    // Save to localStorage
    try {
      localStorage.setItem('user:profile', JSON.stringify(updatedProfile))
    } catch (e) {
      console.error('Error saving progress:', e)
    }

    // Update course completion stats in admin:courses
    if (newProgress === 100 && enrolledCourse.progress !== 100) {
      updateCourseCompletionStats(true)
    } else if (newProgress !== 100 && enrolledCourse.progress === 100) {
      updateCourseCompletionStats(false)
    }
  }

  const updateCourseCompletionStats = (completed: boolean) => {
    try {
      const adminCoursesRaw = localStorage.getItem('admin:courses')
      if (adminCoursesRaw) {
        const adminCourses = JSON.parse(adminCoursesRaw) as Course[]
        const updatedCourses = adminCourses.map(c => {
          if (c.id === courseId) {
            return {
              ...c,
              completedStudents: completed
                ? (c.completedStudents || 0) + 1
                : Math.max((c.completedStudents || 0) - 1, 0)
            }
          }
          return c
        })
        localStorage.setItem('admin:courses', JSON.stringify(updatedCourses))
      }
    } catch (e) {
      console.error('Error updating completion stats:', e)
    }
  }

  const downloadCertificate = () => {
    if (!course || !enrolledCourse || enrolledCourse.progress !== 100) return

    const certificateText = `
═══════════════════════════════════════════════
            CERTIFICATE OF COMPLETION
═══════════════════════════════════════════════

This is to certify that

            ${userProfile?.name || 'Student'}

has successfully completed the course

            "${course.title}"

with a progress of ${enrolledCourse.progress}%

Date: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════
              MamaPlus Education Platform
═══════════════════════════════════════════════
    `

    const blob = new Blob([certificateText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${course.title.replace(/\s+/g, '_')}_Certificate.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5" />
      case 'image':
        return <ImageIcon className="w-5 h-5" />
      case 'file':
        return <FileText className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const downloadResource = (resource: Resource) => {
    if (!resource.fileData) return

    const a = document.createElement('a')
    a.href = resource.fileData
    a.download = resource.fileName || resource.name
    a.click()
  }

  if (!course || !enrolledCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  const progress = enrolledCourse.progress || 0
  const milestoneCount = course.resources?.filter(r => r.isMilestone).length || 0
  const completedMilestoneCount = course.resources?.filter(r => r.isMilestone && completedResources.includes(r.id)).length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/dashboard/user" className="flex items-center gap-2 text-white/90 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
              {course.description && (
                <p className="text-white/90 mb-4">{course.description}</p>
              )}
              
              {/* Progress Bar */}
              <div className="bg-white/20 rounded-full h-3 overflow-hidden mb-2">
                <div
                  className="bg-white h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{progress}% Complete</span>
                <span>{completedMilestoneCount} / {milestoneCount} Milestones</span>
              </div>
            </div>
            
            {progress === 100 && (
              <button
                onClick={downloadCertificate}
                className="ml-6 px-4 py-2 bg-white text-primary rounded font-medium hover:bg-gray-100 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Certificate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Course Resources</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete milestone resources to track your progress
            </p>
          </div>

          <div className="divide-y">
            {course.resources && course.resources.length > 0 ? (
              course.resources.map((resource) => {
                const isCompleted = completedResources.includes(resource.id)
                const isExpanded = expandedResource === resource.id

                return (
                  <div key={resource.id} className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Completion Checkbox */}
                      <button
                        onClick={() => toggleResourceCompletion(resource.id)}
                        className="flex-shrink-0 mt-1"
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400" />
                        )}
                      </button>

                      {/* Resource Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-gray-600">
                            {getResourceIcon(resource.type)}
                          </div>
                          <h3 className="text-lg font-medium">{resource.name}</h3>
                          {resource.isMilestone && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                              ★ Milestone
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="capitalize">{resource.type}</span>
                          {resource.fileName && (
                            <span>• {resource.fileName}</span>
                          )}
                          {resource.fileSize && (
                            <span>• {(resource.fileSize / 1024).toFixed(1)} KB</span>
                          )}
                        </div>

                        {/* Resource Content */}
                        {resource.fileData && (
                          <div className="mt-4">
                            {resource.type === 'video' && (
                              <div className="bg-black rounded-lg overflow-hidden">
                                <video
                                  controls
                                  className="w-full max-h-96"
                                  src={resource.fileData}
                                >
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            )}

                            {resource.type === 'image' && (
                              <div className="border rounded-lg overflow-hidden">
                                <img
                                  src={resource.fileData}
                                  alt={resource.name}
                                  className="w-full max-h-96 object-contain bg-gray-100"
                                />
                              </div>
                            )}

                            {resource.type === 'file' && (
                              <button
                                onClick={() => downloadResource(resource)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Download {resource.fileName || 'File'}
                              </button>
                            )}
                          </div>
                        )}

                        {resource.url && !resource.fileData && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Open Resource →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-6 text-center text-gray-500">
                No resources available for this course yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
