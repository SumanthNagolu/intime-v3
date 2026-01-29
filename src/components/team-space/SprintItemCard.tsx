'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Bug,
  Lightbulb,
  CheckSquare,
  BookOpen,
  Zap,
  AlertCircle,
  Clock,
  MessageSquare,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { SprintItemWithRelations, SprintItemType, SprintItemPriority, SprintItemStatus } from '@/types/scrum'
import { formatDistanceToNow } from 'date-fns'

interface SprintItemCardProps {
  item: SprintItemWithRelations
  isDragging?: boolean
  onView?: (item: SprintItemWithRelations) => void
  onEdit?: (item: SprintItemWithRelations) => void
  onDelete?: (item: SprintItemWithRelations) => void
}

const TYPE_ICONS: Record<SprintItemType, React.ElementType> = {
  epic: BookOpen,
  story: CheckSquare,
  task: CheckSquare,
  bug: Bug,
  spike: Lightbulb,
}

const TYPE_COLORS: Record<SprintItemType, string> = {
  epic: 'bg-purple-100 text-purple-700 border-purple-200',
  story: 'bg-blue-100 text-blue-700 border-blue-200',
  task: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
  bug: 'bg-red-100 text-red-700 border-red-200',
  spike: 'bg-amber-100 text-amber-700 border-amber-200',
}

const PRIORITY_STYLES: Record<SprintItemPriority, { color: string; icon?: React.ElementType }> = {
  critical: { color: 'text-red-600', icon: AlertCircle },
  high: { color: 'text-orange-500', icon: Zap },
  medium: { color: 'text-charcoal-400' },
  low: { color: 'text-charcoal-300' },
}

export function SprintItemCard({
  item,
  isDragging,
  onView,
  onEdit,
  onDelete,
}: SprintItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const TypeIcon = TYPE_ICONS[item.itemType]
  const priorityStyle = PRIORITY_STYLES[item.priority]
  const PriorityIcon = priorityStyle.icon

  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'done'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-white rounded-lg border border-charcoal-200/60 shadow-sm hover:shadow-md transition-all duration-200',
        isDragging && 'opacity-50 rotate-1 shadow-lg',
        item.status === 'blocked' && 'border-red-300 bg-red-50/50'
      )}
    >
      {/* Header: Drag handle + Item number + Type + Priority */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-charcoal-100">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-charcoal-300 hover:text-charcoal-500 transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono text-charcoal-500">{item.itemNumber}</span>

        <Badge
          variant="outline"
          className={cn('text-[10px] px-1.5 py-0 h-5 gap-1', TYPE_COLORS[item.itemType])}
        >
          <TypeIcon className="w-3 h-3" />
          {item.itemType}
        </Badge>

        {/* Priority indicator */}
        {(item.priority === 'critical' || item.priority === 'high') && PriorityIcon && (
          <PriorityIcon className={cn('w-3.5 h-3.5', priorityStyle.color)} />
        )}

        {/* Story points */}
        {item.storyPoints !== undefined && item.storyPoints !== null && (
          <span className="ml-auto text-xs font-medium bg-charcoal-100 text-charcoal-600 px-1.5 py-0.5 rounded">
            {item.storyPoints}
          </span>
        )}

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-charcoal-100 rounded">
              <MoreHorizontal className="w-4 h-4 text-charcoal-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onView?.(item)}>View details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(item)}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(item)}
              className="text-red-600 focus:text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Body: Title */}
      <div
        className="px-3 py-2 cursor-pointer"
        onClick={() => onView?.(item)}
      >
        <p className="text-sm font-medium text-charcoal-800 line-clamp-2 hover:text-charcoal-900">
          {item.title}
        </p>

        {/* Labels */}
        {item.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.labels.slice(0, 3).map((label) => (
              <span
                key={label}
                className="text-[10px] px-1.5 py-0.5 bg-charcoal-100 text-charcoal-600 rounded"
              >
                {label}
              </span>
            ))}
            {item.labels.length > 3 && (
              <span className="text-[10px] text-charcoal-400">
                +{item.labels.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Assignee + Due date */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-charcoal-100">
        {/* Assignee */}
        {item.assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar className="w-5 h-5">
              {item.assignee.avatarUrl && (
                <AvatarImage src={item.assignee.avatarUrl} alt={item.assignee.fullName} />
              )}
              <AvatarFallback className="text-[10px] bg-charcoal-200 text-charcoal-600">
                {item.assignee.fullName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-charcoal-500 truncate max-w-[80px]">
              {item.assignee.fullName.split(' ')[0]}
            </span>
          </div>
        ) : (
          <span className="text-xs text-charcoal-400">Unassigned</span>
        )}

        {/* Due date or comments indicator */}
        <div className="flex items-center gap-2">
          {item.comments && item.comments.length > 0 && (
            <div className="flex items-center gap-1 text-charcoal-400">
              <MessageSquare className="w-3 h-3" />
              <span className="text-[10px]">{item.comments.length}</span>
            </div>
          )}

          {item.dueDate && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue ? 'text-red-600' : 'text-charcoal-400'
              )}
            >
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(item.dueDate), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Non-draggable version for backlog list
export function SprintItemCardStatic({
  item,
  selected,
  onSelect,
  onView,
}: {
  item: SprintItemWithRelations
  selected?: boolean
  onSelect?: (item: SprintItemWithRelations) => void
  onView?: (item: SprintItemWithRelations) => void
}) {
  const TypeIcon = TYPE_ICONS[item.itemType]
  const priorityStyle = PRIORITY_STYLES[item.priority]
  const PriorityIcon = priorityStyle.icon

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 bg-white rounded-lg border transition-all duration-200 cursor-pointer',
        selected
          ? 'border-gold-500 bg-gold-50 shadow-sm'
          : 'border-charcoal-200/60 hover:border-charcoal-300 hover:shadow-sm'
      )}
      onClick={() => onSelect?.(item)}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
          selected
            ? 'border-gold-500 bg-gold-500'
            : 'border-charcoal-300'
        )}
      >
        {selected && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
            <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        )}
      </div>

      {/* Type icon */}
      <div className={cn('p-1.5 rounded', TYPE_COLORS[item.itemType])}>
        <TypeIcon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-charcoal-500">{item.itemNumber}</span>
          {(item.priority === 'critical' || item.priority === 'high') && PriorityIcon && (
            <PriorityIcon className={cn('w-3.5 h-3.5', priorityStyle.color)} />
          )}
        </div>
        <p
          className="text-sm font-medium text-charcoal-800 truncate hover:text-gold-600 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            onView?.(item)
          }}
        >
          {item.title}
        </p>
      </div>

      {/* Story points */}
      {item.storyPoints !== undefined && item.storyPoints !== null && (
        <span className="text-xs font-medium bg-charcoal-100 text-charcoal-600 px-2 py-1 rounded">
          {item.storyPoints} pts
        </span>
      )}

      {/* Assignee */}
      {item.assignee && (
        <Avatar className="w-6 h-6">
          {item.assignee.avatarUrl && (
            <AvatarImage src={item.assignee.avatarUrl} alt={item.assignee.fullName} />
          )}
          <AvatarFallback className="text-[10px] bg-charcoal-200 text-charcoal-600">
            {item.assignee.fullName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
