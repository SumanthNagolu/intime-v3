'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, StickyNote, AlertTriangle, Bell, FileText } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface AddNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
}

const noteTypes = [
  { value: 'general', label: 'General', icon: <FileText className="w-4 h-4" /> },
  { value: 'internal', label: 'Internal Only', icon: <StickyNote className="w-4 h-4" /> },
  { value: 'important', label: 'Important', icon: <AlertTriangle className="w-4 h-4" /> },
  { value: 'reminder', label: 'Reminder', icon: <Bell className="w-4 h-4" /> },
]

export function AddNoteDialog({
  open,
  onOpenChange,
  accountId,
}: AddNoteDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

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
      onOpenChange(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note to this account for future reference.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Note Type Selection */}
            <div className="space-y-2">
              <Label>Note Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {noteTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setNoteType(type.value)}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors',
                      noteType === type.value
                        ? 'border-hublot-700 bg-hublot-50 text-hublot-900'
                        : 'border-charcoal-200 hover:border-charcoal-300 text-charcoal-600'
                    )}
                  >
                    {type.icon}
                    <span className="text-xs mt-1">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your note here..."
                rows={6}
                required
              />
            </div>

            {/* Pin Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPinned"
                checked={isPinned}
                onCheckedChange={(checked) => setIsPinned(checked === true)}
              />
              <Label htmlFor="isPinned" className="text-sm font-normal">
                Pin this note (shows at top of notes list)
              </Label>
            </div>

            {/* Note Type Hints */}
            <div className="p-3 bg-charcoal-50 rounded-lg">
              <h4 className="text-sm font-medium text-charcoal-900 mb-1">
                {noteType === 'general' && 'General Note'}
                {noteType === 'internal' && 'Internal Note'}
                {noteType === 'important' && 'Important Note'}
                {noteType === 'reminder' && 'Reminder Note'}
              </h4>
              <p className="text-xs text-charcoal-600">
                {noteType === 'general' && 'Standard notes visible to team members.'}
                {noteType === 'internal' && 'Notes for internal team use only, not for client-facing documentation.'}
                {noteType === 'important' && 'Critical information that should be highlighted. Will appear with a warning indicator.'}
                {noteType === 'reminder' && 'Notes that require follow-up or attention at a later time.'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createNoteMutation.isPending}>
              {createNoteMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Add Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
