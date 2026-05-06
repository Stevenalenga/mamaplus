'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AdminHeader } from '@/components/admin/admin-header'

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

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export default function SchoolManagerPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [schools, setSchools] = useState<School[]>(() => {
    try {
      const raw = localStorage.getItem('admin:schools')
      if (raw) return JSON.parse(raw)
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

  const [educators, setEducators] = useState<Educator[]>(() => {
    try {
      const raw = localStorage.getItem('admin:educators')
      if (raw) return JSON.parse(raw)
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

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
      window.location.href = '/login'
    }
  }, [router, status, session])

  useEffect(() => {
    try { localStorage.setItem('admin:schools', JSON.stringify(schools)) } catch {}
  }, [schools])

  useEffect(() => {
    try { localStorage.setItem('admin:educators', JSON.stringify(educators)) } catch {}
  }, [educators])

  function addSchool(e?: React.FormEvent) {
    e?.preventDefault()
    if (!schoolName.trim() || !schoolLocation.trim()) return
    const newSchool: School = {
      id: uid(),
      name: schoolName.trim(),
      location: schoolLocation.trim(),
      studentCount: parseInt(schoolStudentCount) || 0,
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
      school: educatorSchool.trim(),
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader active="school-manager" />

      <div className="max-w-6xl mx-auto px-6 py-8 pt-8">
        <h1 className="text-3xl font-bold mb-2">School Manager</h1>
        <p className="text-muted-foreground mb-6">Manage physical school locations and assigned educators.</p>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Schools</p>
            <p className="text-3xl font-bold text-purple-600">{schools.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Students (Schools)</p>
            <p className="text-3xl font-bold text-blue-600">{totalSchoolStudents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Educators</p>
            <p className="text-3xl font-bold text-indigo-600">{educators.length}</p>
          </div>
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
      </div>
    </div>
  )
}
