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
import { Loader2, AlertTriangle, Bell, FileText, Lock, Phone, Users, Lightbulb, Target } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface AddNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
}

// Note types matching the database enum with better grouping and icons
const noteTypes = [
  { value: 'general', label: 'General', icon: FileText, description: 'Standard notes visible to team' },
  { value: 'internal', label: 'Internal', icon: Lock, description: 'For internal team use only' },
  { value: 'important', label: 'Important', icon: AlertTriangle, description: 'Critical information' },
  { value: 'reminder', label: 'Reminder', icon: Bell, description: 'Follow-up required' },
] as const

// Additional note types available in database (can be shown in advanced mode)
const advancedNoteTypes = [
  { value: 'meeting', label: 'Meeting', icon: Users, description: 'Meeting notes' },
  { value: 'call', label: 'Call', icon: Phone, description: 'Phone call notes' },
  { value: 'strategy', label: 'Strategy', icon: Target, description: 'Strategic planning' },
  { value: 'opportunity', label: 'Opportunity', icon: Lightbulb, description: 'Business opportunity' },
] as const

type NoteType = typeof noteTypes[number]['value'] | typeof advancedNoteTypes[number]['value']

export function AddNoteDialog({
  open,
  onOpenChange,
  accountId,
}: AddNoteDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState<NoteType>('general')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Using centralized notes router (NOTES-01)
  const createNoteMutation = trpc.notes.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Note added',
        description: 'The note has been saved to this account.',
      })
      utils.notes.listByEntity.invalidate({ entityType: 'account', entityId: accountId })
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
    setShowAdvanced(false)
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
      entityType: 'account',
      entityId: accountId,
      title: title.trim() || undefined,
      content: content.trim(),
      noteType: noteType,
    })
  }

  const allNoteTypes = showAdvanced ? [...noteTypes, ...advancedNoteTypes] : noteTypes
  const selectedType = [...noteTypes, ...advancedNoteTypes].find(t => t.value === noteType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
          {/* Fixed Header */}
          <div className="px-6 pt-6 pb-4 border-b border-charcoal-100">
            <DialogHeader>
              <DialogTitle className="text-xl font-heading">Add Note</DialogTitle>
              <DialogDescription className="text-sm text-charcoal-500 mt-1.5">
                Add a note to this account for future reference.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Note Type Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
                    Note Type
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-gold-600 hover:text-gold-700 font-medium"
                  >
                    {showAdvanced ? 'Show less' : 'More types'}
                  </button>
                </div>
                <div className={cn(
                  "grid gap-2",
                  showAdvanced ? "grid-cols-4" : "grid-cols-4"
                )}>
                  {allNoteTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setNoteType(type.value)}
                        className={cn(
                          'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200',
                          noteType === type.value
                            ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm'
                            : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50 text-charcoal-600'
                        )}
                      >
                        <Icon className={cn(
                          "w-4 h-4 mb-1.5",
                          noteType === type.value ? "text-gold-600" : "text-charcoal-400"
                        )} />
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider pb-2 border-b border-charcoal-100">
                  Note Details
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title <span className="text-charcoal-400 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of this note"
                    className="h-9"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-medium">
                    Content <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter your note here..."
                      rows={6}
                      required
                      className="resize-y text-sm min-h-[120px]"
                    />
                  </div>
                </div>
              </div>

              {/* Note Type Description */}
              {selectedType && (
                <div className="p-3 bg-charcoal-50 rounded-lg border border-charcoal-100">
                  <div className="flex items-center gap-2 mb-1">
                    <selectedType.icon className="w-4 h-4 text-charcoal-500" />
                    <h4 className="text-sm font-medium text-charcoal-900">
                      {selectedType.label} Note
                    </h4>
                  </div>
                  <p className="text-xs text-charcoal-600">
                    {selectedType.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="px-6 py-4 border-t border-charcoal-100 bg-charcoal-25">
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="min-w-[100px] h-9 uppercase text-xs font-semibold tracking-wider"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createNoteMutation.isPending}
                className="min-w-[120px] h-9 uppercase text-xs font-semibold tracking-wider"
              >
                {createNoteMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                )}
                Add Note
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
