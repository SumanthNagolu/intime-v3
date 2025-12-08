'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Loader2,
  StickyNote,
  AlertTriangle,
  Bell,
  FileText,
  Plus,
  X,
  Pin,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface InlineNoteFormProps {
  accountId: string
  onSuccess?: () => void
  className?: string
}

const noteTypes = [
  { value: 'general', label: 'General', icon: <FileText className="w-4 h-4" /> },
  { value: 'internal', label: 'Internal', icon: <StickyNote className="w-4 h-4" /> },
  { value: 'important', label: 'Important', icon: <AlertTriangle className="w-4 h-4" /> },
  { value: 'reminder', label: 'Reminder', icon: <Bell className="w-4 h-4" /> },
]

export function InlineNoteForm({
  accountId,
  onSuccess,
  className,
}: InlineNoteFormProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState('general')
  const [isPinned, setIsPinned] = useState(false)

  const createNoteMutation = trpc.crm.notes.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Note added',
        description: 'The note has been saved to this account.',
      })
      utils.crm.notes.listByAccount.invalidate({ accountId })
      resetForm()
      setIsExpanded(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add note.',
        variant: 'error',
      })
    },
  })

  const resetForm = () => {
    setTitle('')
    setContent('')
    setNoteType('general')
    setIsPinned(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter note content.',
        variant: 'error',
      })
      return
    }

    createNoteMutation.mutate({
      accountId,
      title: title.trim() || undefined,
      content: content.trim(),
      noteType: noteType as 'general' | 'internal' | 'important' | 'reminder',
      isPinned,
    })
  }

  const handleCancel = () => {
    resetForm()
    setIsExpanded(false)
  }

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className={cn('w-full border-dashed', className)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Note
      </Button>
    )
  }

  return (
    <div className={cn('border rounded-lg bg-white p-4 shadow-sm', className)}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-charcoal-900">Add Note</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Note Type Selection - Compact */}
        <div className="flex flex-wrap gap-1 mb-4">
          {noteTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setNoteType(type.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                noteType === type.value
                  ? 'bg-hublot-900 text-white'
                  : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
              )}
            >
              {type.icon}
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Main Fields */}
        <div className="space-y-3">
          {/* Title - Optional */}
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title (optional)"
            />
          </div>

          {/* Content - Required */}
          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Pin Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPinnedInline"
              checked={isPinned}
              onCheckedChange={(checked) => setIsPinned(checked === true)}
            />
            <Label htmlFor="isPinnedInline" className="text-sm font-normal flex items-center gap-1">
              <Pin className="w-3 h-3" />
              Pin this note
            </Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={createNoteMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={createNoteMutation.isPending}>
            {createNoteMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Add Note
          </Button>
        </div>
      </form>
    </div>
  )
}
