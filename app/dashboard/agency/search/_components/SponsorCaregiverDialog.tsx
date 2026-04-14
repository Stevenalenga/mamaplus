'use client'

import { useState, useEffect } from 'react'
import { Loader2, X, Book, Check, Building, User } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency } from '@/lib/currency'

type Caregiver = {
  id: string
  name: string | null
  email: string
}

type Course = {
  id: string
  title: string
  priceKES: number
  priceUSD: number
  thumbnail: string | null
  currency: string
}

type SponsorCaregiverDialogProps = {
  caregiver: Caregiver
  onClose: () => void
}

export default function SponsorCaregiverDialog({ caregiver, onClose }: SponsorCaregiverDialogProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses')
        const data = await response.json()
        if (response.ok && data.success) {
          setCourses(data.data)
        } else {
          toast.error(data.message || 'Failed to load courses.')
        }
      } catch (error) {
        toast.error('An error occurred while fetching courses.')
      } finally {
        setLoadingCourses(false)
      }
    }
    fetchCourses()
  }, [])

  const handleSponsor = async () => {
    if (!selectedCourseId) {
      toast.warning('Please select a course to sponsor.')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/agencies/sponsorships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId: caregiver.id,
          courseId: selectedCourseId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.message || 'Failed to create sponsorship.')
      } else {
        toast.success('Sponsorship successful! The caregiver has been enrolled.')
        onClose()
      }
    } catch (error) {
      toast.error('An error occurred during sponsorship.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sponsor Caregiver</DialogTitle>
          <DialogDescription>
            Select a course to sponsor for{' '}
            <span className="font-semibold text-primary">{caregiver.name || caregiver.email}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div>
            <h3 className="font-semibold mb-3 text-lg">Available Courses</h3>
            {loadingCourses ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-80 pr-4 border rounded-lg">
                <div className="space-y-2 p-2">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all ${
                        selectedCourseId === course.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-16 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(course.priceKES, 'KES')}
                        </p>
                      </div>
                      {selectedCourseId === course.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-lg">Sponsorship Summary</h3>
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sponsor</p>
                  <p className="font-semibold">Your Agency</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-purple-100 rounded-full">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Beneficiary</p>
                  <p className="font-semibold">{caregiver.name || caregiver.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-full">
                  <Book className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Course</p>
                  <p className="font-semibold">{selectedCourse?.title || 'Not selected'}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">Sponsorship Amount</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(selectedCourse?.priceKES ?? 0, 'KES')}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This amount will be billed to your agency account.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSponsor}
            disabled={!selectedCourseId || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Sponsoring...
              </>
            ) : (
              'Confirm Sponsorship'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
