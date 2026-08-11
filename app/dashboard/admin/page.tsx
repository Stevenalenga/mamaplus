'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  School,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { StatCard } from '@/components/admin/stat-card'
import { ActivityFeed, type ActivityItem } from '@/components/admin/activity-feed'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

type StatsData = {
  users: { total: number; newThisWeek: number; newThisMonth: number; byRole: Record<string, number> }
  enrollments: { total: number; active: number; completed: number; avgProgress: number }
  courses: { published: number; draft: number; topByEnrollment: Array<{ id: string; title: string; enrollments: number }> }
  revenue: {
    byCurrency: Array<{ currency: string; total: number; count: number }>
    overTime: Array<{ date: string; amount: number }>
  }
  schools: { active: number; educators: number }
  recentActivity: ActivityItem[]
}

const revenueChartConfig = {
  amount: { label: 'Revenue', color: 'hsl(var(--primary))' },
} satisfies ChartConfig

const enrollmentChartConfig = {
  enrollments: { label: 'Enrollments', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to load stats')
        return
      }
      setStats({
        ...data.data,
        schools: data.data.schools ?? { active: 0, educators: 0 },
        revenue: {
          byCurrency: data.data.revenue?.byCurrency ?? [],
          overTime: data.data.revenue?.overTime ?? [],
        },
        recentActivity: data.data.recentActivity ?? [],
      })
    } catch {
      setError('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive">{error || 'Unable to load dashboard'}</p>
        <Button onClick={loadStats} className="mt-4" variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  const totalRevenue = (stats.revenue?.byCurrency ?? []).reduce((sum, r) => sum + r.total, 0)
  const revenueLabel = (stats.revenue?.byCurrency ?? [])
    .map((r) => `${r.currency} ${r.total.toLocaleString()}`)
    .join(' · ') || 'No revenue yet'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Platform Overview</h2>
          <p className="text-sm text-muted-foreground">Live metrics across users, courses, and revenue</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/admin/users">Manage Users</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/admin/enrollments">View Enrollments</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/admin/course-management">Create Course</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Users" value={stats.users.total} subtitle={`+${stats.users.newThisWeek} this week`} icon={Users} />
        <StatCard title="Enrollments" value={stats.enrollments.total} subtitle={`${stats.enrollments.active} active`} icon={GraduationCap} />
        <StatCard title="Courses" value={stats.courses.published} subtitle={`${stats.courses.draft} drafts`} icon={BookOpen} />
        <StatCard title="Avg Progress" value={`${stats.enrollments.avgProgress}%`} subtitle={`${stats.enrollments.completed} completed`} icon={TrendingUp} />
        <StatCard title="Revenue" value={totalRevenue > 0 ? totalRevenue.toLocaleString() : '—'} subtitle={revenueLabel} icon={DollarSign} />
        <StatCard title="Schools" value={stats.schools?.active ?? 0} subtitle={`${stats.schools?.educators ?? 0} educators`} icon={School} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Revenue (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {(stats.revenue?.overTime ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No payment data yet</p>
            ) : (
              <ChartContainer config={revenueChartConfig} className="h-[240px] w-full">
                <LineChart data={stats.revenue?.overTime ?? []} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={48} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Top Courses by Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.courses.topByEnrollment.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No enrollments yet</p>
            ) : (
              <ChartContainer config={enrollmentChartConfig} className="h-[240px] w-full">
                <BarChart
                  data={stats.courses.topByEnrollment.map((c) => ({
                    name: c.title.length > 20 ? c.title.slice(0, 20) + '…' : c.title,
                    enrollments: c.enrollments,
                  }))}
                  margin={{ left: 8, right: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} width={32} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="enrollments" fill="var(--color-enrollments)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed items={stats.recentActivity} />
        </div>
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Object.entries(stats.users.byRole).map(([role, count]) => (
                <li key={role} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{role}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="ghost" className="mt-4 w-full" size="sm">
              <Link href="/dashboard/admin/users">
                View all users <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
