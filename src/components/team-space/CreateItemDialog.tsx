'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useTeamSpace } from './TeamSpaceProvider'
import type { SprintItemType, SprintItemPriority } from '@/types/scrum'

const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  itemType: z.enum(['epic', 'story', 'task', 'bug', 'spike']),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  storyPoints: z.number().min(0).max(100).optional(),
  labels: z.string().optional(),
})

type CreateItemForm = z.infer<typeof createItemSchema>

interface CreateItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultColumn?: string
  sprintId?: string
}

export function CreateItemDialog({
  open,
  onOpenChange,
  defaultColumn,
  sprintId,
}: CreateItemDialogProps) {
  const { refetchBacklog, refetchBoard } = useTeamSpace()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateItemForm>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      title: '',
      description: '',
      itemType: 'story',
      priority: 'medium',
      storyPoints: undefined,
      labels: '',
    },
  })

  const createItem = trpc.sprintItems.create.useMutation({
    onSuccess: () => {
      refetchBacklog()
      refetchBoard()
      onOpenChange(false)
      form.reset()
    },
    onError: (error) => {
      console.error('Failed to create item:', error)
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const onSubmit = (data: CreateItemForm) => {
    setIsSubmitting(true)
    createItem.mutate({
      title: data.title,
      description: data.description || undefined,
      itemType: data.itemType as SprintItemType,
      priority: data.priority as SprintItemPriority,
      storyPoints: data.storyPoints,
      labels: data.labels ? data.labels.split(',').map((l) => l.trim()).filter(Boolean) : undefined,
      sprintId: sprintId,
      status: defaultColumn ? (defaultColumn as 'todo' | 'in_progress' | 'review' | 'done') : 'backlog',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Add a new story, task, bug, or spike to the backlog.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Implement user authentication"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-error-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.watch('itemType')}
                onValueChange={(value) => form.setValue('itemType', value as SprintItemType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="spike">Spike</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.watch('priority')}
                onValueChange={(value) => form.setValue('priority', value as SprintItemPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe the item in detail..."
              rows={3}
              {...form.register('description')}
            />
          </div>

          {/* Story Points & Labels */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storyPoints">Story Points</Label>
              <Input
                id="storyPoints"
                type="number"
                min={0}
                max={100}
                placeholder="e.g., 3"
                {...form.register('storyPoints', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labels">Labels (comma-separated)</Label>
              <Input
                id="labels"
                placeholder="e.g., frontend, api"
                {...form.register('labels')}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
