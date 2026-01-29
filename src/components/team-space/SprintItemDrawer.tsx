'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { trpc } from '@/lib/trpc/client'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Bug,
  Lightbulb,
  CheckSquare,
  BookOpen,
  AlertCircle,
  Zap,
  Clock,
  User,
  MessageSquare,
  Send,
  Calendar,
  Tag,
  History,
} from 'lucide-react'
import type { SprintItemWithRelations, SprintItemType, SprintItemPriority, SprintItemStatus } from '@/types/scrum'

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

const STATUS_OPTIONS: { value: SprintItemStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
]

const PRIORITY_OPTIONS: { value: SprintItemPriority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

interface SprintItemDrawerProps {
  item: SprintItemWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export function SprintItemDrawer({
  item,
  open,
  onOpenChange,
  onClose,
}: SprintItemDrawerProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const updateItem = trpc.sprintItems.update.useMutation({
    onSuccess: () => {
      // Optimistic update handled by parent
    },
  })

  const addComment = trpc.sprintItems.addComment.useMutation({
    onSuccess: () => {
      setNewComment('')
      setIsSubmittingComment(false)
    },
    onError: () => {
      setIsSubmittingComment(false)
    },
  })

  if (!item) return null

  const TypeIcon = TYPE_ICONS[item.itemType]

  const handleStatusChange = (status: SprintItemStatus) => {
    updateItem.mutate({ id: item.id, status })
  }

  const handlePriorityChange = (priority: SprintItemPriority) => {
    updateItem.mutate({ id: item.id, priority })
  }

  const handleSubmitComment = () => {
    if (!newComment.trim()) return
    setIsSubmittingComment(true)
    addComment.mutate({
      itemId: item.id,
      content: newComment.trim(),
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={cn('text-xs px-1.5 py-0 h-5 gap-1', TYPE_COLORS[item.itemType])}
            >
              <TypeIcon className="w-3 h-3" />
              {item.itemType}
            </Badge>
            <span className="text-sm font-mono text-charcoal-500">{item.itemNumber}</span>
          </div>
          <SheetTitle className="text-left text-lg font-semibold">
            {item.title}
          </SheetTitle>
          <SheetDescription className="text-left">
            {item.description || 'No description provided.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Status
              </label>
              <Select
                value={item.status}
                onValueChange={(value) => handleStatusChange(value as SprintItemStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Priority
              </label>
              <Select
                value={item.priority}
                onValueChange={(value) => handlePriorityChange(value as SprintItemPriority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                <User className="w-3 h-3" />
                Assignee
              </div>
              {item.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    {item.assignee.avatarUrl && (
                      <AvatarImage src={item.assignee.avatarUrl} alt={item.assignee.fullName} />
                    )}
                    <AvatarFallback className="text-[10px] bg-charcoal-200 text-charcoal-600">
                      {item.assignee.fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-charcoal-700">{item.assignee.fullName}</span>
                </div>
              ) : (
                <span className="text-sm text-charcoal-400">Unassigned</span>
              )}
            </div>

            {/* Story Points */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                <Tag className="w-3 h-3" />
                Story Points
              </div>
              <span className="text-sm text-charcoal-700">
                {item.storyPoints !== null ? `${item.storyPoints} pts` : 'Not estimated'}
              </span>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                <Calendar className="w-3 h-3" />
                Due Date
              </div>
              <span className="text-sm text-charcoal-700">
                {item.dueDate ? format(new Date(item.dueDate), 'MMM d, yyyy') : 'No due date'}
              </span>
            </div>

            {/* Created */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                Created
              </div>
              <span className="text-sm text-charcoal-700">
                {format(new Date(item.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          {/* Labels */}
          {item.labels.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  <Tag className="w-3 h-3" />
                  Labels
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.labels.map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Comments */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
              <MessageSquare className="w-3 h-3" />
              Comments ({item.comments?.length || 0})
            </div>

            {/* Comment List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {item.comments?.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-7 h-7">
                    {comment.user.avatarUrl && (
                      <AvatarImage src={comment.user.avatarUrl} alt={comment.user.fullName} />
                    )}
                    <AvatarFallback className="text-[10px] bg-charcoal-200 text-charcoal-600">
                      {comment.user.fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-charcoal-800">
                        {comment.user.fullName}
                      </span>
                      <span className="text-xs text-charcoal-400">
                        {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-charcoal-600 mt-0.5">{comment.content}</p>
                  </div>
                </div>
              ))}

              {(!item.comments || item.comments.length === 0) && (
                <p className="text-sm text-charcoal-400 italic">No comments yet.</p>
              )}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmittingComment}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="destructive" size="sm">
              Delete Item
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
