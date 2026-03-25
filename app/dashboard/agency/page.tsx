'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCurrentUser } from '@/hooks/use-current-user'
import { getDashboardForRole } from '@/lib/roles'
import { Loader2, Users, Briefcase, ClipboardList, Star, UserPlus, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AgencyHeader from '@/components/agency/agency-header'
import { toast } from 'sonner'

type Caregiver = {
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

type AgencyStats = {
  totalCaregivers: number
  activeCaregivers: number
  completedPlacements: number
  inactiveCaregivers: number
  avgRating: number
  ratedCount: number
}

export default function AgencyDashboardPage() {
  const { user, isLoading } = useCurrentUser()

  const [availableCaregivers, setAvailableCaregivers] = useState<Caregiver[]>([])
  const [stats, setStats] = useState<AgencyStats | null>(null)
  const [loadingCaregivers, setLoadingCaregivers] = useState(true)
  const [recruitingId, setRecruitingId] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Load stats and available caregivers
  useEffect(() => {
    // Prevent duplicate fetches
    if (isLoading || !user || hasLoaded) return
    if (user.role !== 'AGENCY') return

    async function loadData() {
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

        // Fetch available caregivers
        const caregiversRes = await fetch('/api/agencies/caregivers', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        
        if (!caregiversRes.ok) {
          const errorData = await caregiversRes.json().catch(() => ({ message: 'Unknown error' }))
          console.error('Caregivers fetch failed:', caregiversRes.status, errorData)
          toast.error(`Failed to load caregivers: ${errorData.message || 'Server error'}`)
        } else {
          const caregiversData = await caregiversRes.json()
          if (caregiversData.success) {
            setAvailableCaregivers(caregiversData.data)
          } else {
            console.error('Caregivers response unsuccessful:', caregiversData)
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        toast.error(`Failed to load data: ${errorMessage}`)
      } finally {
        setLoadingCaregivers(false)
        setHasLoaded(true)
      }
    }

    loadData()
  }, [isLoading, user, hasLoaded])

  async function recruitCaregiver(caregiverId: string, caregiverName: string | null) {
    setRecruitingId(caregiverId)
    try {
      const response = await fetch('/api/agencies/caregivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.message || 'Failed to recruit caregiver')
        return
      }

      toast.success(`${caregiverName || 'Caregiver'} recruited successfully!`)
      
      // Remove from available list immediately for better UX
      setAvailableCaregivers(prev => prev.filter(c => c.id !== caregiverId))
      
      // Refresh stats by triggering data reload
      setHasLoaded(false)
    } catch (error) {
      toast.error('An error occurred while recruiting the caregiver')
    } finally {
      setRecruitingId(null)
    }
  }

  // Guard: redirect non-agency users
  if (!isLoading && user?.role && user.role !== 'AGENCY') {
    window.location.href = getDashboardForRole(user.role)
    return null
  }

  if (isLoading) {
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
      <AgencyHeader currentPage="home" />

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back{user?.name ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-muted-foreground mb-8">
          Manage your caregivers, track placements, and grow your agency.
        </p>

        {/* Stats */}
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
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Active Placements</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.activeCaregivers || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Currently active caregivers</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Completed Placements</p>
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

        {/* QLink href="/dashboard/agency/profile">
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                View My Caregivers
              </button>
            </Link>
            <button className="px-4 py-2 bg-white border border-primary text-primary rounded-lg hover:bg-primary/10 font-medium text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Manage Placements
            </button>
            <button className="px-4 py-2 bg-white border border-gray-200 text-foreground rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              View Reports
            </button>
          </div>
        </div>

        {/* Available Caregivers to Recruit */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Available Caregivers</h2>
            <Link href="/dashboard/agency/profile" className="text-sm text-primary hover:underline">
              View My Recruited →
            </Link>
          </div>

          {loadingCaregivers ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-muted-foreground">Loading caregivers...</p>
            </div>
          ) : availableCaregivers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No available caregivers</p>
              <p className="text-sm mt-1">
                All caregivers on the platform have been recruited by your agency.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableCaregivers.slice(0, 5).map((caregiver) => (
                <div
                  key={caregiver.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-lg font-semibold text-primary">
                      {caregiver.name ? caregiver.name[0].toUpperCase() : caregiver.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {caregiver.name || 'Unnamed Caregiver'}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {caregiver.email}
                        </span>
                        {caregiver.phoneNumber && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {caregiver.phoneNumber}
                          </span>
                        )}
                        {caregiver.gender && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {caregiver.gender}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{caregiver._count.enrollments} courses enrolled</span>
                        <span>•</span>
                        <span>{caregiver._count.certificates} certificates</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => recruitCaregiver(caregiver.id, caregiver.name)}
                    disabled={recruitingId === caregiver.id}
                    className="flex items-center gap-2"
                  >
                    {recruitingId === caregiver.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Recruiting...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Recruit
                      </>
                    )}
                  </Button>
                </div>
              ))}

              {availableCaregivers.length > 5 && (
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {availableCaregivers.length - 5} more caregivers available
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
