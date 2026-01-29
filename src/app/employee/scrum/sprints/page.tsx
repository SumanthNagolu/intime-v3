'use client'

import { useState } from 'react'
import { format, differenceInDays } from 'date-fns'
import { useTeamSpace } from '@/components/team-space'
import { CreateSprintDialog } from '@/components/team-space/CreateSprintDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { trpc } from '@/lib/trpc/client'
import {
  Plus,
  Rocket,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Play,
  MoreHorizontal,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Sprint, SprintStatus } from '@/types/scrum'

const STATUS_CONFIG: Record<SprintStatus, { label: string; color: string }> = {
  planning: { label: 'Planning', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
  review: { label: 'Review', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', color: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
}

export default function SprintsPage() {
  const { sprints, activeSprint, isLoadingSprints, refetchSprints } = useTeamSpace()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const startSprintMutation = trpc.sprints.start.useMutation({
    onSuccess: () => refetchSprints(),
  })

  const completeSprintMutation = trpc.sprints.complete.useMutation({
    onSuccess: () => refetchSprints(),
  })

  const handleStartSprint = (sprintId: string) => {
    startSprintMutation.mutate({ id: sprintId })
  }

  const handleCompleteSprint = (sprintId: string) => {
    completeSprintMutation.mutate({ id: sprintId })
  }

  // Group sprints by status
  const groupedSprints = {
    active: sprints.filter((s) => s.status === 'active'),
    planning: sprints.filter((s) => s.status === 'planning'),
    review: sprints.filter((s) => s.status === 'review'),
    completed: sprints.filter((s) => s.status === 'completed').slice(0, 5), // Last 5 completed
  }

  if (isLoadingSprints) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-charcoal-900">Sprints</h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Manage sprint cycles and track team progress
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          New Sprint
        </Button>
      </div>

      {/* Active Sprint */}
      {groupedSprints.active.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-charcoal-800 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-green-600" />
            Active Sprint
          </h2>
          {groupedSprints.active.map((sprint) => (
            <SprintCard
              key={sprint.id}
              sprint={sprint}
              isActive
              onComplete={() => handleCompleteSprint(sprint.id)}
            />
          ))}
        </div>
      )}

      {/* Planning Sprints */}
      {groupedSprints.planning.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-charcoal-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Planning
          </h2>
          {groupedSprints.planning.map((sprint) => (
            <SprintCard
              key={sprint.id}
              sprint={sprint}
              onStart={() => handleStartSprint(sprint.id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {sprints.length === 0 && (
        <Card className="bg-white shadow-elevation-md">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-100 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-gold-600" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-charcoal-900 mb-2">
              No Sprints Yet
            </h3>
            <p className="text-charcoal-600 mb-6 max-w-md mx-auto">
              Create your first sprint to start organizing work and tracking team velocity.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Create First Sprint
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Completed Sprints */}
      {groupedSprints.completed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-charcoal-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-charcoal-500" />
            Recently Completed
          </h2>
          <div className="grid gap-4">
            {groupedSprints.completed.map((sprint) => (
              <SprintCard key={sprint.id} sprint={sprint} isCompleted />
            ))}
          </div>
        </div>
      )}

      <CreateSprintDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}

interface SprintCardProps {
  sprint: Sprint
  isActive?: boolean
  isCompleted?: boolean
  onStart?: () => void
  onComplete?: () => void
}

function SprintCard({ sprint, isActive, isCompleted, onStart, onComplete }: SprintCardProps) {
  const progress = sprint.totalItems > 0
    ? Math.round((sprint.completedItems / sprint.totalItems) * 100)
    : 0

  const daysRemaining = differenceInDays(new Date(sprint.endDate), new Date())
  const totalDays = differenceInDays(new Date(sprint.endDate), new Date(sprint.startDate))

  const statusConfig = STATUS_CONFIG[sprint.status]

  return (
    <Card className={cn(
      'bg-white shadow-elevation-sm transition-all duration-200 hover:shadow-elevation-md',
      isActive && 'border-green-300 ring-1 ring-green-200'
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-charcoal-900">{sprint.name}</h3>
              <Badge variant="outline" className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
            </div>

            {/* Goal */}
            {sprint.goal && (
              <div className="flex items-start gap-2 mb-4 p-3 bg-charcoal-50 rounded-lg">
                <Target className="w-4 h-4 text-charcoal-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-charcoal-600">{sprint.goal}</p>
              </div>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-charcoal-500">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(new Date(sprint.startDate), 'MMM d')} - {format(new Date(sprint.endDate), 'MMM d, yyyy')}
                </span>
              </div>

              {!isCompleted && daysRemaining > 0 && (
                <div className="flex items-center gap-1.5 text-charcoal-500">
                  <Clock className="w-4 h-4" />
                  <span>{daysRemaining} days remaining</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-charcoal-500">
                <TrendingUp className="w-4 h-4" />
                <span>{sprint.totalPoints} points</span>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1">
                <span>{sprint.completedItems} / {sprint.totalItems} items</span>
                <span>{progress}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {sprint.status === 'planning' && onStart && (
              <Button size="sm" onClick={onStart}>
                <Play className="w-4 h-4 mr-1" />
                Start Sprint
              </Button>
            )}

            {isActive && onComplete && (
              <Button size="sm" variant="outline" onClick={onComplete}>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Complete
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Edit Sprint</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-error-600">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
