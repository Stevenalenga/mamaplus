'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCurrentUser } from '@/hooks/use-current-user'
import { getDashboardForRole } from '@/lib/roles'
import { 
  Loader2, 
  Users, 
  Star, 
  Mail, 
  Phone, 
  Calendar,
  Award,
  Briefcase,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import AgencyHeader from '@/components/agency/agency-header'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

type RecruitedCaregiver = {
  id: string
  caregiverId: string
  status: string
  rating: number | null
  reviewComment: string | null
  recruiterNotes: string | null
  recruitedAt: string
  completedAt: string | null
  caregiver: {
    id: string
    name: string | null
    email: string
    gender: string | null
    phoneNumber: string | null
    avatar: string | null
    createdAt: string
    _count: {
      enrollments: number
      certificates: number
    }
  }
}

type AgencyStats = {
  totalCaregivers: number
  activeCaregivers: number
  completedPlacements: number
  inactiveCaregivers: number
  avgRating: number
  ratedCount: number
}

export default function AgencyProfilePage() {
  const { user, isLoading } = useCurrentUser()

  const [recruitedCaregivers, setRecruitedCaregivers] = useState<RecruitedCaregiver[]>([])
  const [stats, setStats] = useState<AgencyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [ratingDialog, setRatingDialog] = useState<{
    open: boolean
    caregiverId: string | null
    recruitmentId: string | null
    currentRating: number | null
    currentComment: string | null
  }>({
    open: false,
    caregiverId: null,
    recruitmentId: null,
    currentRating: null,
    currentComment: null,
  })
  const [selectedRating, setSelectedRating] = useState<number>(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Guard: redirect non-agency users
  if (!isLoading && user?.role && user.role !== 'AGENCY') {
    window.location.href = getDashboardForRole(user.role)
    return null
  }

  useEffect(() => {
    // Prevent duplicate fetches
    if (isLoading || !user || hasLoaded) return
    if (user.role !== 'AGENCY') return

    async function loadData() {
      setLoading(true)
      try {
        // Fetch stats
        const statsRes = await fetch('/api/agencies/stats', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        
        if (!statsRes.ok) {
          const errorData = await statsRes.json().catch(() => ({ message: 'Unknown error' }))
          console.error('Stats fetch failed:', statsRes.status, errorData)
          toast.error(`Failed to load stats: ${errorData.message || 'Server error'}`)
        } else {
          const statsData = await statsRes.json()
          if (statsData.success) {
            setStats(statsData.data)
          } else {
            console.error('Stats response unsuccessful:', statsData)
          }
        }

        // Fetch recruited caregivers
        const recruitedRes = await fetch('/api/agencies/caregivers?recruited=true', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        
        if (!recruitedRes.ok) {
          const errorData = await recruitedRes.json().catch(() => ({ message: 'Unknown error' }))
          console.error('Caregivers fetch failed:', recruitedRes.status, errorData)
          toast.error(`Failed to load caregivers: ${errorData.message || 'Server error'}`)
        } else {
          const recruitedData = await recruitedRes.json()
          if (recruitedData.success) {
            setRecruitedCaregivers(recruitedData.data)
          } else {
            console.error('Caregivers response unsuccessful:', recruitedData)
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        toast.error(`Failed to load profile data: ${errorMessage}`)
      } finally {
        setLoading(false)
        setHasLoaded(true)
      }
    }

    loadData()
  }, [isLoading, user, hasLoaded])

  function openRatingDialog(recruitment: RecruitedCaregiver) {
    setRatingDialog({
      open: true,
      caregiverId: recruitment.caregiverId,
      recruitmentId: recruitment.id,
      currentRating: recruitment.rating,
      currentComment: recruitment.reviewComment,
    })
    setSelectedRating(recruitment.rating || 0)
    setReviewComment(recruitment.reviewComment || '')
  }

  function closeRatingDialog() {
    setRatingDialog({
      open: false,
      caregiverId: null,
      recruitmentId: null,
      currentRating: null,
      currentComment: null,
    })
    setSelectedRating(0)
    setReviewComment('')
  }

  async function refreshData() {
    setHasLoaded(false)
    // The useEffect will trigger and reload the data
  }

  async function submitRating() {
    if (!ratingDialog.recruitmentId) return
    if (selectedRating < 1 || selectedRating > 5) {
      toast.error('Please select a rating between 1 and 5 stars')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/agencies/caregivers/${ratingDialog.recruitmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
          reviewComment: reviewComment.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.message || 'Failed to submit rating')
        return
      }

      toast.success('Rating submitted successfully!')
      closeRatingDialog()

      // Refresh data by resetting the hasLoaded flag
      await refreshData()
    } catch (error) {
      toast.error('An error occurred while submitting the rating')
    } finally {
      setSubmitting(false)
    }
  }

  const activeCaregivers = recruitedCaregivers.filter(r => r.status === 'ACTIVE')
  const completedCaregivers = recruitedCaregivers.filter(r => r.status === 'COMPLETED')
  const inactiveCaregivers = recruitedCaregivers.filter(r => r.status === 'INACTIVE')

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader currentPage="profile" />

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Agency Profile</h1>
          <p className="text-muted-foreground">
            Manage your caregivers and view your agency statistics
          </p>
        </div>

        {/* Agency Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Total Caregivers</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.totalCaregivers || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Recruited to your agency</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Active</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.activeCaregivers || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Completed</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.completedPlacements || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Successfully completed</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Avg. Rating</p>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats?.avgRating ? stats.avgRating.toFixed(1) : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.ratedCount ? `From ${stats.ratedCount} ratings` : 'No ratings yet'}
            </p>
          </div>
        </div>

        {/* Active Caregivers */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Active Caregivers ({activeCaregivers.length})
          </h2>

          {activeCaregivers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No active caregivers</p>
              <p className="text-sm mt-1">
                <Link href="/dashboard/agency" className="text-primary hover:underline">
                  Recruit caregivers
                </Link>{' '}
                from the dashboard to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCaregivers.map((recruitment) => (
                <div
                  key={recruitment.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:border-primary transition"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center text-lg font-semibold text-primary">
                      {recruitment.caregiver.name
                        ? recruitment.caregiver.name[0].toUpperCase()
                        : recruitment.caregiver.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {recruitment.caregiver.name || 'Unnamed Caregiver'}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {recruitment.caregiver.email}
                        </span>
                        {recruitment.caregiver.phoneNumber && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {recruitment.caregiver.phoneNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Recruited {new Date(recruitment.recruitedAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{recruitment.caregiver._count.enrollments} courses</span>
                        <span>•</span>
                        <span>{recruitment.caregiver._count.certificates} certificates</span>
                      </div>
                      {recruitment.rating && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= recruitment.rating!
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {recruitment.rating}/5
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openRatingDialog(recruitment)}
                    className="flex items-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    {recruitment.rating ? 'Update Rating' : 'Rate'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Placements */}
        {completedCaregivers.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-600" />
              Completed Placements ({completedCaregivers.length})
            </h2>

            <div className="space-y-3">
              {completedCaregivers.map((recruitment) => (
                <div
                  key={recruitment.id}
                  className="flex items-start justify-between p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600">
                      {recruitment.caregiver.name
                        ? recruitment.caregiver.name[0].toUpperCase()
                        : recruitment.caregiver.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {recruitment.caregiver.name || 'Unnamed Caregiver'}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{recruitment.caregiver.email}</span>
                        {recruitment.caregiver.phoneNumber && (
                          <>
                            <span>•</span>
                            <span>{recruitment.caregiver.phoneNumber}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>
                          Completed {recruitment.completedAt ? new Date(recruitment.completedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      {recruitment.rating && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= recruitment.rating!
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {recruitment.rating}/5
                          </span>
                          {recruitment.reviewComment && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground italic">
                                "{recruitment.reviewComment}"
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inactive Caregivers */}
        {inactiveCaregivers.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-gray-500" />
              Inactive Caregivers ({inactiveCaregivers.length})
            </h2>

            <div className="space-y-2">
              {inactiveCaregivers.map((recruitment) => (
                <div
                  key={recruitment.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-500">
                      {recruitment.caregiver.name
                        ? recruitment.caregiver.name[0].toUpperCase()
                        : recruitment.caregiver.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-foreground">
                        {recruitment.caregiver.name || 'Unnamed Caregiver'}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {recruitment.caregiver.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">Inactive</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Dialog */}
      <Dialog open={ratingDialog.open} onOpenChange={closeRatingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Caregiver</DialogTitle>
            <DialogDescription>
              Provide a rating and optional review for this caregiver's performance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Star Rating */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium text-foreground">Your Rating</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    className="transition hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= selectedRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedRating === 0 && 'Select a rating'}
                {selectedRating === 1 && 'Poor'}
                {selectedRating === 2 && 'Fair'}
                {selectedRating === 3 && 'Good'}
                {selectedRating === 4 && 'Very Good'}
                {selectedRating === 5 && 'Excellent'}
              </p>
            </div>

            {/* Review Comment */}
            <div>
              <label htmlFor="review" className="text-sm font-medium text-foreground">
                Review (Optional)
              </label>
              <Textarea
                id="review"
                placeholder="Share your experience working with this caregiver..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeRatingDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitRating}
              disabled={submitting || selectedRating === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
