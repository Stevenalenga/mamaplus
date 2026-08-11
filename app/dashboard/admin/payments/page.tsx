'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { DataTableToolbar } from '@/components/admin/data-table-toolbar'
import { StatCard } from '@/components/admin/stat-card'
import { CreditCard, DollarSign } from 'lucide-react'
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

type Payment = {
  id: string
  reference: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  paidAt: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string | null; phoneNumber: string | null }
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<Array<{ currency: string; status: string; total: number; count: number }>>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/admin/payments?${params}`)
      const data = await res.json()
      if (data.success) {
        setPayments(data.data.payments)
        setSummary(data.data.summary)
        setTotalPages(data.data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { load() }, [load])

  const successTotal = summary
    .filter((s) => s.status === 'SUCCESS')
    .reduce((acc, s) => acc + s.total, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
        <p className="text-sm text-muted-foreground">Transaction history and revenue summary</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Successful Revenue" value={successTotal.toLocaleString()} subtitle="All currencies combined" icon={DollarSign} />
        <StatCard title="Transactions" value={payments.length} subtitle="Current page" icon={CreditCard} />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader><CardTitle className="text-base">Transactions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <DataTableToolbar
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1) }}
            searchPlaceholder="Search reference or user..."
            filterValue={statusFilter}
            onFilterChange={(v) => { setStatusFilter(v); setPage(1) }}
            filterOptions={[
              { value: 'SUCCESS', label: 'Success' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'FAILED', label: 'Failed' },
            ]}
          />
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                      <TableCell className="text-sm">{p.user.name || p.user.email || p.user.phoneNumber}</TableCell>
                      <TableCell>{p.currency} {p.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{p.paymentMethod}</TableCell>
                      <TableCell><Badge variant={p.status === 'SUCCESS' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(p.paidAt || p.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
