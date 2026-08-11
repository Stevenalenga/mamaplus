import { formatDistanceToNow } from 'date-fns'
import {
  CreditCard,
  GraduationCap,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

export type ActivityItem = {
  id: string
  type: 'user_registered' | 'enrollment' | 'payment'
  title: string
  description: string
  createdAt: string
}

const ACTIVITY_ICONS: Record<ActivityItem['type'], LucideIcon> = {
  user_registered: UserPlus,
  enrollment: GraduationCap,
  payment: CreditCard,
}

type ActivityFeedProps = {
  items: ActivityItem[]
  title?: string
}

export function ActivityFeed({ items, title = 'Recent Activity' }: ActivityFeedProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No recent activity</EmptyTitle>
              <EmptyDescription>Platform events will appear here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => {
              const Icon = ACTIVITY_ICONS[item.type]
              return (
                <li key={item.id} className="flex gap-3">
                  <div className="mt-0.5 rounded-full bg-muted p-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
