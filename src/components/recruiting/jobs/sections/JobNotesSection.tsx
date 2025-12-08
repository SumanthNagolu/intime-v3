'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FileText,
  Loader2,
  Plus,
  X,
  Pin,
  AlertTriangle,
  Bell,
  StickyNote,
  Star,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface JobNotesSectionProps {
  jobId: string
}

const noteTypes = [
  { value: 'general', label: 'General', icon: <FileText className="w-4 h-4" /> },
  { value: 'internal', label: 'Internal', icon: <StickyNote className="w-4 h-4" /> },
  { value: 'important', label: 'Important', icon: <AlertTriangle className="w-4 h-4" /> },
  { value: 'reminder', label: 'Reminder', icon: <Bell className="w-4 h-4" /> },
]

export function JobNotesSection({ jobId }: JobNotesSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [isFormExpanded, setIsFormExpanded] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState('general')
  const [isPinned, setIsPinned] = useState(false)

  // Query notes (activities of type 'note') for this job
  const notesQuery = trpc.activities.listByEntity.useQuery({
    entityType: 'job',
    entityId: jobId,
    activityTypes: ['note'],
    limit: 100,
  })
  const notes = notesQuery.data?.items || []

  // Create note mutation
  const logNoteMutation = trpc.activities.log.useMutation({
    onSuccess: () => {
      toast({ title: 'Note added' })
      utils.activities.listByEntity.invalidate({ entityType: 'job', entityId: jobId })
      resetForm()
      setIsFormExpanded(false)
    },
    onError: (error) => {
      toast({ title: 'Failed to add note', description: error.message, variant: 'error' })
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
      toast({ title: 'Please enter note content', variant: 'error' })
      return
    }

    logNoteMutation.mutate({
      entityType: 'job',
      entityId: jobId,
      activityType: 'note',
      subject: title.trim() || `${noteType.charAt(0).toUpperCase() + noteType.slice(1)} Note`,
      body: content.trim(),
    })
  }

  const handleCancel = () => {
    resetForm()
    setIsFormExpanded(false)
  }

  const handleNoteClick = (noteId: string) => {
    setSelectedNoteId(selectedNoteId === noteId ? null : noteId)
  }

  // Sort notes - pinned first
  const sortedNotes = [...notes].sort((a: any, b: any) => {
    const aIsPinned = a.metadata?.isPinned || false
    const bIsPinned = b.metadata?.isPinned || false
    if (aIsPinned && !bIsPinned) return -1
    if (!aIsPinned && bIsPinned) return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Notes
        </CardTitle>
        <CardDescription>
          Internal notes about this job
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Inline Note Form */}
        <div className="mb-6">
          {!isFormExpanded ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFormExpanded(true)}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          ) : (
            <div className="border rounded-lg bg-white p-4 shadow-sm">
              <form onSubmit={handleSubmit}>
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

                {/* Note Type Selection */}
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

                {/* Form Fields */}
                <div className="space-y-3">
                  <div>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Note title (optional)"
                    />
                  </div>
                  <div>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your note here..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPinnedJobNote"
                      checked={isPinned}
                      onCheckedChange={(checked) => setIsPinned(checked === true)}
                    />
                    <Label htmlFor="isPinnedJobNote" className="text-sm font-normal flex items-center gap-1">
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
                    disabled={logNoteMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={logNoteMutation.isPending}>
                    {logNoteMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Add Note
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Notes List */}
        {notesQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : sortedNotes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No notes yet</p>
            <p className="text-sm text-charcoal-400 mt-1">
              Use the form above to add your first note
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedNotes.map((note: any) => {
              const isNoteImportant = note.metadata?.noteType === 'important'
              const isNotePinned = note.metadata?.isPinned

              return (
                <div
                  key={note.id}
                  onClick={() => handleNoteClick(note.id)}
                  className={cn(
                    'p-4 border rounded-lg cursor-pointer transition-colors',
                    isNotePinned && selectedNoteId !== note.id && 'border-gold-300 bg-gold-50',
                    isNoteImportant && selectedNoteId !== note.id && !isNotePinned && 'border-amber-300 bg-amber-50',
                    selectedNoteId === note.id
                      ? 'border-hublot-500 bg-hublot-50'
                      : !isNotePinned && !isNoteImportant && 'hover:border-hublot-300'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {note.subject && (
                        <p className="font-medium truncate">{note.subject}</p>
                      )}
                      <p className="text-sm text-charcoal-600 line-clamp-2 mt-1">
                        {note.description}
                      </p>
                    </div>
                    {isNotePinned && (
                      <Star className="w-4 h-4 text-gold-500 fill-gold-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-charcoal-500">
                    {note.metadata?.noteType && (
                      <Badge variant="outline" className="capitalize text-xs">
                        {note.metadata.noteType}
                      </Badge>
                    )}
                    {note.performed_by?.full_name && (
                      <span>{note.performed_by.full_name}</span>
                    )}
                    <span>&bull;</span>
                    <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                  </div>

                  {/* Expanded details */}
                  {selectedNoteId === note.id && (
                    <div className="mt-4 pt-4 border-t">
                      <Label className="text-xs text-charcoal-500">Full Note</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{note.description}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
