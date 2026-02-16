'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, BookOpen, CheckCircle, Pencil, Trash2, X, Save, Search } from 'lucide-react'

type Course = {
  id: number
  title: string
  description: string
  duration: string
  price: string
  enrolled?: boolean
  courseId?: string // Links to admin:courses ID for resource access
}

export default function CoursesPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', duration: '', price: '' })
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newCourseForm, setNewCourseForm] = useState({ title: '', description: '', duration: '', price: '' })
  const [searchQuery, setSearchQuery] = useState('')
  
  useEffect(() => {
    // Check current session type
    const currentUserType = localStorage.getItem('currentUserType')
    const adminProfile = localStorage.getItem('admin:profile')
    const userProfile = localStorage.getItem('user:profile')
    
    if (currentUserType === 'admin' && adminProfile) {
      setIsAdmin(true)
      // Load courses from localStorage if admin
      const savedCourses = localStorage.getItem('browse:courses')
      if (savedCourses) {
        setCourses(JSON.parse(savedCourses))
      }
    } else if (currentUserType === 'user' && userProfile) {
      setIsAdmin(false)
      // For regular users, also load saved courses if available
      const savedCourses = localStorage.getItem('browse:courses')
      if (savedCourses) {
        setCourses(JSON.parse(savedCourses))
      }
    } else {
      // If no valid session, redirect to login
      router.push('/login')
    }
  }, [router])
  
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: "Regional Child Safeguarding & Protection Training",
      description: "Strengthen your child safeguarding knowledge and skills. Learn to identify risks, protect children, and implement effective safeguarding systems.",
      duration: "3 Days",
      price: "$800"
    },
    {
      id: 2,
      title: "15-Day Accelerated Childcare Worker Training Course",
      description: "Intensive training to equip childcare workers with practical skills to deliver safe, nurturing, and high-quality care.",
      duration: "15 Days",
      price: "$150"
    },
    {
      id: 3,
      title: "Disability & Inclusion in Early Childhood Care",
      description: "Learn to create inclusive, accessible, and safe childcare environments for children with diverse needs.",
      duration: "2 Days",
      price: "$75"
    },
    {
      id: 4,
      title: "Leadership & Management for Childcare Workers",
      description: "Build leadership, management, and operational skills to lead teams and improve childcare operations.",
      duration: "2 Days",
      price: "$25"
    },
    {
      id: 5,
      title: "Climate Change & Environmental Management",
      description: "Understand climate risks and create resilient, safe, and sustainable childcare environments.",
      duration: "1 Day",
      price: "$15"
    },
    {
      id: 6,
      title: "Early Childhood Development Fundamentals",
      description: "Master the basics of child development from birth to age 5, including cognitive, social, and emotional milestones.",
      duration: "5 Days",
      price: "$99"
    },
    {
      id: 7,
      title: "Nutrition & Health for Young Children",
      description: "Learn essential nutrition principles, meal planning, and health monitoring for children in your care.",
      duration: "3 Days",
      price: "$65"
    },
    {
      id: 8,
      title: "Positive Behavior Management Strategies",
      description: "Develop effective, compassionate approaches to guide children's behavior and create positive learning environments.",
      duration: "2 Days",
      price: "$45"
    }
  ])

  const handleEnroll = (courseId: number) => {
    // Admins cannot enroll in courses
    if (isAdmin) {
      alert('Administrators cannot enroll in courses. This feature is for users only.')
      return
    }

    // Get current user profile
    const profileRaw = localStorage.getItem('user:profile')
    if (!profileRaw) {
      alert('Please log in to enroll in courses')
      router.push('/login')
      return
    }

    const profile = JSON.parse(profileRaw)
    const course = courses.find(c => c.id === courseId)
    if (!course) return

    // Check if already enrolled using admin course ID if available
    const enrollmentId = course.courseId || `course-${courseId}`
    const alreadyEnrolled = profile.enrolledCourses?.some((ec: any) => ec.id === enrollmentId)
    if (alreadyEnrolled) {
      alert('You are already enrolled in this course!')
      return
    }

    // Add to enrolled courses with admin course ID for resource access
    const newEnrollment = {
      id: enrollmentId, // Use admin course ID if available
      title: course.title,
      amountPaid: parseFloat(course.price.replace('$', '')),
      progress: 0,
      enrolledDate: new Date().toISOString(),
      completedResources: []
    }

    profile.enrolledCourses = profile.enrolledCourses || []
    profile.enrolledCourses.push(newEnrollment)
    
    localStorage.setItem('user:profile', JSON.stringify(profile))
    alert(`Successfully enrolled in ${course.title}!`)
    
    // Mark as enrolled in UI
    setCourses(courses.map(c => c.id === courseId ? { ...c, enrolled: true } : c))
  }

  const handleEdit = (course: Course) => {
    setEditingId(course.id)
    setEditForm({
      title: course.title,
      description: course.description,
      duration: course.duration,
      price: course.price
    })
  }

  const handleSave = (courseId: number) => {
    const updatedCourses = courses.map(c => 
      c.id === courseId 
        ? { ...c, ...editForm }
        : c
    )
    setCourses(updatedCourses)
    localStorage.setItem('browse:courses', JSON.stringify(updatedCourses))
    setEditingId(null)
    alert('Course updated successfully!')
  }

  const handleDelete = (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    
    const updatedCourses = courses.filter(c => c.id !== courseId)
    setCourses(updatedCourses)
    localStorage.setItem('browse:courses', JSON.stringify(updatedCourses))
    alert('Course deleted successfully!')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ title: '', description: '', duration: '', price: '' })
  }

  const handleAddNew = () => {
    if (!newCourseForm.title || !newCourseForm.description || !newCourseForm.duration || !newCourseForm.price) {
      alert('Please fill in all fields')
      return
    }

    const newCourse: Course = {
      id: Math.max(...courses.map(c => c.id), 0) + 1,
      ...newCourseForm
    }

    const updatedCourses = [...courses, newCourse]
    setCourses(updatedCourses)
    localStorage.setItem('browse:courses', JSON.stringify(updatedCourses))
    setIsAddingNew(false)
    setNewCourseForm({ title: '', description: '', duration: '', price: '' })
    alert('Course added successfully!')
  }

  const handleCancelAdd = () => {
    setIsAddingNew(false)
    setNewCourseForm({ title: '', description: '', duration: '', price: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={isAdmin ? "/dashboard/admin" : "/dashboard/user"} className="flex items-center gap-2">
              <Image src="/logo.png" alt="MamaPlus" width={240} height={240} className="object-contain" />
            </Link>
            <Link href={isAdmin ? "/dashboard/admin" : "/dashboard/user"} className="text-sm text-muted-foreground hover:text-primary">Home</Link>
            <Link href="/courses" className="text-sm font-semibold text-primary border-b-2 border-primary">Browse Courses</Link>
            <Link href={isAdmin ? "/dashboard/admin/profile" : "/dashboard/user/profile"} className="text-sm text-muted-foreground hover:text-primary">My Profile</Link>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push(isAdmin ? '/dashboard/admin' : '/dashboard/user')} 
              className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary/90"
            >
              Go to Dashboard
            </button>
            <button onClick={() => { localStorage.removeItem('currentUserType'); router.push('/login'); }} className="text-sm text-muted-foreground hover:text-primary">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Available Courses</h1>
            <p className="text-muted-foreground">
              {isAdmin ? 'Manage course listings - Edit, delete, or add new courses' : 'Browse and enroll in courses to advance your childcare skills'}
            </p>
          </div>
          {isAdmin && !isAddingNew && (
            <Button 
              onClick={() => setIsAddingNew(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Add New Course
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Add New Course Form */}
        {isAdmin && isAddingNew && (
          <div className="bg-white rounded-lg border border-border shadow-sm p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Add New Course</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course Title</label>
                <input
                  type="text"
                  value={newCourseForm.title}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Course title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newCourseForm.description}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, description: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Course description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Duration</label>
                  <input
                    type="text"
                    value={newCourseForm.duration}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, duration: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. 3 Days"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="text"
                    value={newCourseForm.price}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, price: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. $99"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddNew}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
                <Button 
                  onClick={handleCancelAdd}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.filter(course => {
            const query = searchQuery.toLowerCase()
            return course.title.toLowerCase().includes(query) || 
                   course.description.toLowerCase().includes(query)
          }).length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : 'No courses available at the moment.'}
              </p>
            </div>
          ) : (
            courses.filter(course => {
              const query = searchQuery.toLowerCase()
              return course.title.toLowerCase().includes(query) || 
                     course.description.toLowerCase().includes(query)
            }).map((course) => (
            <div key={course.id} className="bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition overflow-hidden">
              <div className="p-6">
                {editingId === course.id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Course Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Course title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm"
                        rows={3}
                        placeholder="Course description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Duration</label>
                        <input
                          type="text"
                          value={editForm.duration}
                          onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="e.g. 3 Days"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Price</label>
                        <input
                          type="text"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="e.g. $99"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => handleSave(course.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <BookOpen className="w-8 h-8 text-primary flex-shrink-0" />
                      <div className="flex gap-2">
                        {course.enrolled && (
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Enrolled
                          </span>
                        )}
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => handleEdit(course)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="Edit course"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(course.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Delete course"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{course.description}</p>
                    
                    <div className="flex items-center justify-between mb-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">{course.price}</div>
                    </div>

                    {!isAdmin && (
                      <Button 
                        onClick={() => handleEnroll(course.id)}
                        disabled={course.enrolled}
                        className={`w-full ${course.enrolled ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
                      >
                        {course.enrolled ? 'Already Enrolled' : 'Enroll Now'}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
          )}
        </div>
      </div>
    </div>
  )
}
