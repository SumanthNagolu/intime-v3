'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc/client'
import { Trophy, Gift, Star, ThumbsUp } from 'lucide-react'

interface WinItemProps {
  type: string
  description: string
  date: string
}

function WinItem({ type, description, date }: WinItemProps) {
  const typeIcons: Record<string, React.ReactNode> = {
    placement: <Trophy className="w-4 h-4 text-gold-500" />,
    offer_accepted: <Gift className="w-4 h-4 text-success-500" />,
    interview: <Star className="w-4 h-4 text-warning-500" />,
    submission: <ThumbsUp className="w-4 h-4 text-charcoal-500" />,
    goal_achieved: <Trophy className="w-4 h-4 text-gold-500" />,
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-success-50/30">
      <div className="flex-shrink-0 mt-0.5">
        {typeIcons[type] || <Trophy className="w-4 h-4 text-gold-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-charcoal-900">{description}</p>
        <p className="text-xs text-charcoal-500 mt-1">{formatDate(date)}</p>
      </div>
    </div>
  )
}

interface RecentWin {
  type: string
  description: string
  date: string
}

interface RecentWinsWidgetProps {
  className?: string
  initialData?: RecentWin[]
}

export function RecentWinsWidget({ className }: RecentWinsWidgetProps) {
  const { data, isLoading } = trpc.dashboard.getRecentWins.useQuery({ limit: 5 })

  if (isLoading) {
    return (
      <Card className={cn('bg-white', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('bg-white', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-h4 flex items-center gap-2">
          Recent Wins
          <span className="text-xl">🎉</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data?.length === 0 && (
          <div className="text-center py-8 text-charcoal-500">
            Keep up the great work! Wins will appear here.
          </div>
        )}

        {data?.map((win, index) => (
          <WinItem
            key={index}
            type={win.type}
            description={win.description}
            date={win.date}
          />
        ))}
      </CardContent>
    </Card>
  )
}
