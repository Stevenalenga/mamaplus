'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Building2 } from 'lucide-react'
import { DataTableToolbar } from '@/components/admin/data-table-toolbar'
import { StatCard } from '@/components/admin/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Agency = {
  id: string
  name: string | null
  email: string | null
  phoneNumber: string | null
  createdAt: string
  _count: { recruitedCaregivers: number }
  recruitedCaregivers: Array<{
    id: string
    status: string
    recruitedAt: string
    caregiver: { name: string | null; email: string | null }
  }>
}

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [placementStats, setPlacementStats] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/agencies?${params}`)
      const data = await res.json()
      if (data.success) {
        setAgencies(data.data.agencies)
        setPlacementStats(data.data.placementStats)
        setTotalPages(data.data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Agency Oversight</h2>
        <p className="text-sm text-muted-foreground">Platform-wide view of agencies and caregiver placements</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Agencies" value={agencies.length} subtitle="On this page" icon={Building2} />
        <StatCard title="Active Placements" value={placementStats.ACTIVE ?? 0} subtitle="Platform-wide" icon={Building2} />
        <StatCard title="Completed" value={placementStats.COMPLETED ?? 0} subtitle="Placements" icon={Building2} />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader><CardTitle className="text-base">Agencies</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <DataTableToolbar search={search} onSearchChange={(v) => { setSearch(v); setPage(1) }} searchPlaceholder="Search agencies..." />
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-4">
              {agencies.map((agency) => (
                <div key={agency.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{agency.name || 'Unnamed Agency'}</p>
                      <p className="text-sm text-muted-foreground">{agency.email || agency.phoneNumber}</p>
                    </div>
                    <Badge>{agency._count.recruitedCaregivers} caregivers</Badge>
                  </div>
                  {agency.recruitedCaregivers.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t pt-3">
                      {agency.recruitedCaregivers.map((r) => (
                        <li key={r.id} className="flex justify-between text-sm">
                          <span>{r.caregiver.name || r.caregiver.email}</span>
                          <span className="text-muted-foreground">{r.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
