'use client'

import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import { Loader2, Search, User, Mail, Calendar, Award, BookOpen, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import AgencyHeader from '@/components/agency/agency-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/use-current-user'
import { getDashboardForRole } from '@/lib/roles'
import SponsorCaregiverDialog from './_components/SponsorCaregiverDialog'

type SearchedCaregiver = {
  id: string
  name: string | null
  email: string
  avatar: string | null
  createdAt: string
  _count: {
    enrollments: number
    certificates: number
  }
}

export default function SearchCaregiversPage() {
  const { user, isLoading } = useCurrentUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery] = useDebounce(searchQuery, 500)
  const [results, setResults] = useState<SearchedCaregiver[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [sponsoringCaregiver, setSponsoringCaregiver] = useState<SearchedCaregiver | null>(null)

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      setHasSearched(false)
      return
    }

    async function performSearch() {
      setLoading(true)
      setHasSearched(true)
      try {
        const response = await fetch(`/api/agencies/caregivers/search?query=${debouncedQuery}`)
        const data = await response.json()

        if (!response.ok || !data.success) {
          toast.error(data.message || 'Failed to search for caregivers.')
          setResults([])
        } else {
          setResults(data.data)
        }
      } catch (error) {
        toast.error('An error occurred while searching.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  const openSponsorDialog = (caregiver: SearchedCaregiver) => {
    setSponsoringCaregiver(caregiver)
  }

  const closeSponsorDialog = () => {
    setSponsoringCaregiver(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== 'AGENCY') {
    if (typeof window !== 'undefined') {
      window.location.href = user ? getDashboardForRole(user.role) : '/login'
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader currentPage={null} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Sponsor a Caregiver</h1>
        <p className="text-muted-foreground mb-6">
          Search for a caregiver by name or email to sponsor them for a course.
        </p>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            className="pl-10 h-12 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-muted-foreground">Searching for caregivers...</p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No caregivers found</p>
            <p className="text-sm mt-1 text-muted-foreground">
              Try a different name or email. Caregivers already in your agency will not appear.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            {results.map((caregiver) => (
              <div
                key={caregiver.id}
                className="bg-white rounded-xl shadow p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-xl font-semibold text-primary">
                    {caregiver.name ? caregiver.name[0].toUpperCase() : caregiver.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">
                      {caregiver.name || 'Unnamed Caregiver'}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        {caregiver.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        Joined {new Date(caregiver.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                        <BookOpen className="w-3 h-3" />
                        {caregiver._count.enrollments} courses
                      </span>
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                        <Award className="w-3 h-3" />
                        {caregiver._count.certificates} certificates
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => openSponsorDialog(caregiver)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Sponsor
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {sponsoringCaregiver && (
        <SponsorCaregiverDialog
          caregiver={sponsoringCaregiver}
          onClose={closeSponsorDialog}
        />
      )}
    </div>
  )
}
