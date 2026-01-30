'use client'

import { useState } from 'react'
import {
  Target,
  ChevronRight,
  ChevronDown,
  Plus,
  Building2,
  Users,
  User,
  MoreVertical,
  Edit3,
  Trash2,
  Flag,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface GoalOwner {
  user?: {
    full_name: string
    avatar_url?: string | null
  }
}

interface Department {
  id: string
  name: string
}

interface Goal {
  id: string
  goal: string
  description?: string | null
  category: string
  scope: string
  goal_type_enum?: string | null
  status: string
  progress_percent: number
  weight_percent?: number | null
  start_date?: string | null
  target_date?: string | null
  employee?: GoalOwner | null
  department?: Department | null
  children?: Goal[]
}

interface GoalCascadeTreeProps {
  goals: Goal[]
  onUpdateProgress?: (goalId: string, progress: number) => void
  onEdit?: (goal: Goal) => void
  onDelete?: (goalId: string) => void
  onAddChild?: (parentGoalId: string) => void
  showActions?: boolean
}

const SCOPE_CONFIG = {
  company: { icon: Building2, color: 'text-purple-600 bg-purple-100', label: 'Company' },
  department: { icon: Users, color: 'text-blue-600 bg-blue-100', label: 'Department' },
  team: { icon: Users, color: 'text-teal-600 bg-teal-100', label: 'Team' },
  individual: { icon: User, color: 'text-green-600 bg-green-100', label: 'Individual' },
}

const STATUS_CONFIG = {
  not_started: { icon: Circle, color: 'text-gray-500', label: 'Not Started' },
  in_progress: { icon: Clock, color: 'text-blue-500', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-green-500', label: 'Completed' },
  deferred: { icon: Flag, color: 'text-amber-500', label: 'Deferred' },
  cancelled: { icon: Circle, color: 'text-red-500', label: 'Cancelled' },
}

const TYPE_CONFIG: Record<string, { label: string; badge: string }> = {
  objective: { label: 'O', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
  key_result: { label: 'KR', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  goal: { label: 'G', badge: 'bg-green-100 text-green-700 border-green-200' },
  initiative: { label: 'I', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function GoalNode({
  goal,
  level = 0,
  expanded,
  onToggle,
  onUpdateProgress,
  onEdit,
  onDelete,
  onAddChild,
  showActions,
}: {
  goal: Goal
  level?: number
  expanded: Set<string>
  onToggle: (id: string) => void
  onUpdateProgress?: (goalId: string, progress: number) => void
  onEdit?: (goal: Goal) => void
  onDelete?: (goalId: string) => void
  onAddChild?: (parentGoalId: string) => void
  showActions?: boolean
}) {
  const isExpanded = expanded.has(goal.id)
  const hasChildren = goal.children && goal.children.length > 0
  const scopeConfig = SCOPE_CONFIG[goal.scope as keyof typeof SCOPE_CONFIG] || SCOPE_CONFIG.individual
  const statusConfig = STATUS_CONFIG[goal.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.not_started
  const typeConfig = TYPE_CONFIG[goal.goal_type_enum as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.goal
  const ScopeIcon = scopeConfig.icon
  const StatusIcon = statusConfig.icon

  return (
    <TooltipProvider>
      <div className={cn('relative', level > 0 && 'ml-8')}>
        {/* Connection Lines */}
        {level > 0 && (
          <>
            <div className="absolute left-[-20px] top-0 bottom-0 w-px bg-charcoal-200" />
            <div className="absolute left-[-20px] top-6 h-px w-5 bg-charcoal-200" />
          </>
        )}

        <div className="mb-2">
          <div
            className={cn(
              'group flex items-start gap-3 p-4 rounded-lg border bg-white transition-all hover:shadow-md',
              goal.status === 'completed'
                ? 'border-green-200 bg-green-50/30'
                : goal.status === 'deferred' || goal.status === 'cancelled'
                ? 'border-charcoal-200 bg-charcoal-50/30 opacity-60'
                : 'border-charcoal-200'
            )}
          >
            {/* Expand/Collapse */}
            <button
              onClick={() => onToggle(goal.id)}
              className={cn(
                'w-6 h-6 rounded flex items-center justify-center transition-colors mt-0.5',
                hasChildren ? 'hover:bg-charcoal-100 cursor-pointer' : 'cursor-default'
              )}
              disabled={!hasChildren}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-charcoal-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-charcoal-500" />
                )
              ) : (
                <div className="w-2 h-2 rounded-full bg-charcoal-300" />
              )}
            </button>

            {/* Goal Type Badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={cn('font-mono text-xs px-1.5 py-0.5', typeConfig.badge)}
                >
                  {typeConfig.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {goal.goal_type_enum?.replace(/_/g, ' ') || 'Goal'}
              </TooltipContent>
            </Tooltip>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-charcoal-900 line-clamp-1">
                      {goal.goal}
                    </h4>
                    {goal.weight_percent && (
                      <Badge variant="outline" className="text-xs">
                        {goal.weight_percent}%
                      </Badge>
                    )}
                  </div>
                  {goal.description && (
                    <p className="text-sm text-charcoal-500 mt-0.5 line-clamp-1">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <StatusIcon className={cn('w-4 h-4', statusConfig.color)} />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-charcoal-500">Progress</span>
                  <span className={cn(
                    'font-medium',
                    goal.progress_percent >= 100
                      ? 'text-green-600'
                      : goal.progress_percent >= 50
                      ? 'text-blue-600'
                      : 'text-charcoal-600'
                  )}>
                    {goal.progress_percent}%
                  </span>
                </div>
                <Progress
                  value={goal.progress_percent}
                  className={cn(
                    'h-1.5',
                    goal.progress_percent >= 100
                      ? '[&>div]:bg-green-500'
                      : goal.progress_percent >= 50
                      ? '[&>div]:bg-blue-500'
                      : ''
                  )}
                />
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 mt-3 text-xs text-charcoal-500">
                {/* Scope */}
                <div className="flex items-center gap-1">
                  <ScopeIcon className="w-3.5 h-3.5" />
                  <span>{scopeConfig.label}</span>
                </div>

                {/* Owner */}
                {goal.employee?.user && (
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={goal.employee.user.avatar_url || undefined} />
                      <AvatarFallback className="text-[8px]">
                        {getInitials(goal.employee.user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[100px]">
                      {goal.employee.user.full_name}
                    </span>
                  </div>
                )}

                {/* Department */}
                {goal.department && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{goal.department.name}</span>
                  </div>
                )}

                {/* Target Date */}
                {goal.target_date && (
                  <div className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    <span>{new Date(goal.target_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(goal)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Goal
                    </DropdownMenuItem>
                  )}
                  {onAddChild && goal.scope !== 'individual' && (
                    <DropdownMenuItem onClick={() => onAddChild(goal.id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Child Goal
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(goal.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="mt-2">
              {goal.children!.map((child) => (
                <GoalNode
                  key={child.id}
                  goal={child}
                  level={level + 1}
                  expanded={expanded}
                  onToggle={onToggle}
                  onUpdateProgress={onUpdateProgress}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                  showActions={showActions}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

export function GoalCascadeTree({
  goals,
  onUpdateProgress,
  onEdit,
  onDelete,
  onAddChild,
  showActions = true,
}: GoalCascadeTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // Auto-expand first 2 levels
    const ids = new Set<string>()
    const collectIds = (goals: Goal[], depth = 0) => {
      if (depth > 1) return
      goals.forEach((goal) => {
        ids.add(goal.id)
        if (goal.children) {
          collectIds(goal.children, depth + 1)
        }
      })
    }
    collectIds(goals)
    return ids
  })

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    const allIds = new Set<string>()
    const collectIds = (goals: Goal[]) => {
      goals.forEach((goal) => {
        allIds.add(goal.id)
        if (goal.children) collectIds(goal.children)
      })
    }
    collectIds(goals)
    setExpanded(allIds)
  }

  const collapseAll = () => {
    setExpanded(new Set())
  }

  // Calculate stats
  const countGoals = (goals: Goal[]): { total: number; completed: number } => {
    let total = 0
    let completed = 0
    goals.forEach((goal) => {
      total++
      if (goal.status === 'completed') completed++
      if (goal.children) {
        const childStats = countGoals(goal.children)
        total += childStats.total
        completed += childStats.completed
      }
    })
    return { total, completed }
  }

  const stats = countGoals(goals)
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
          <Target className="h-8 w-8 text-charcoal-400" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-charcoal-900 mb-2">
          No Goals Yet
        </h3>
        <p className="text-charcoal-500 text-center max-w-md mb-6">
          Create company, department, or individual goals to start tracking objectives.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-charcoal-500 uppercase tracking-wider">Total Goals</p>
            <p className="text-2xl font-semibold text-charcoal-900">{stats.total}</p>
          </div>
          <div className="h-8 w-px bg-charcoal-200" />
          <div>
            <p className="text-xs text-charcoal-500 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-semibold text-green-600">{stats.completed}</p>
          </div>
          <div className="h-8 w-px bg-charcoal-200" />
          <div>
            <p className="text-xs text-charcoal-500 uppercase tracking-wider">Completion</p>
            <p className="text-2xl font-semibold text-charcoal-900">{completionRate}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 p-3 bg-charcoal-50 rounded-lg text-xs">
        <span className="text-charcoal-500 font-medium">Type:</span>
        {Object.entries(TYPE_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5">
            <Badge variant="outline" className={cn('text-[10px] px-1 py-0', config.badge)}>
              {config.label}
            </Badge>
            <span className="text-charcoal-600 capitalize">{key.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>

      {/* Goal Tree */}
      <div className="space-y-2">
        {goals.map((goal) => (
          <GoalNode
            key={goal.id}
            goal={goal}
            expanded={expanded}
            onToggle={toggleExpanded}
            onUpdateProgress={onUpdateProgress}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            showActions={showActions}
          />
        ))}
      </div>
    </div>
  )
}
