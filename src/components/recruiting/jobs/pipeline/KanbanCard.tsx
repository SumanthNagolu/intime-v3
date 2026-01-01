'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Star, Calendar, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Submission } from '@/configs/entities/submissions.config'
import type { SubmissionStatus } from '@/lib/pipeline/stages'

interface KanbanCardProps {
  submission: Submission
  onView: () => void
  onStatusChange: (status: SubmissionStatus) => void
}

export function KanbanCard({ submission, onView, onStatusChange }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: submission.id,
    data: { submission },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const candidate = submission.candidate
  const candidateName = candidate
    ? `${candidate.first_name} ${candidate.last_name}`.trim()
    : 'Unknown'
  const initials = candidate
    ? `${candidate.first_name?.[0] || ''}${candidate.last_name?.[0] || ''}`
    : '?'

  // Calculate days in stage
  const stageChangedAt = submission.stage_changed_at || submission.created_at
  const daysInStage = stageChangedAt
    ? Math.floor((Date.now() - new Date(stageChangedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Rating from feedback (placeholder - would come from interviews/feedback)
  const rating = submission.ai_match_score ? Math.round(submission.ai_match_score / 20) : null

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-cream hover:bg-white cursor-grab transition-all duration-200',
        'hover:shadow-elevation-sm border border-charcoal-100',
        isDragging && 'opacity-50 rotate-2 shadow-elevation-md z-50'
      )}
      {...attributes}
    >
      <CardContent className="p-3">
        {/* Header: Drag handle + Avatar + Name + Menu */}
        <div className="flex items-center gap-2 mb-2">
          <div {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-charcoal-300" />
          </div>
          <Avatar className="w-8 h-8">
            <AvatarImage src={candidate?.avatar_url || undefined} />
            <AvatarFallback className="text-xs bg-gold-100 text-gold-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={onView}
            className="flex-1 text-left font-medium text-charcoal-900 hover:text-gold-600 truncate"
          >
            {candidateName}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-charcoal-100 rounded">
                <MoreHorizontal className="w-4 h-4 text-charcoal-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange('rejected')}>
                Reject
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange('withdrawn')}>
                Withdraw
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Days in stage */}
        <div className="flex items-center gap-1 text-xs text-charcoal-500 mb-2">
          <Calendar className="w-3 h-3" />
          <span>{daysInStage} day{daysInStage !== 1 ? 's' : ''} in stage</span>
        </div>

        {/* Rating (if available) */}
        {rating && (
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-3 h-3',
                  i < rating ? 'fill-gold-400 text-gold-400' : 'text-charcoal-300'
                )}
              />
            ))}
          </div>
        )}

        {/* Match score badge */}
        {submission.ai_match_score && (
          <Badge variant="secondary" className="text-xs">
            {submission.ai_match_score}% match
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
