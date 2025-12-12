'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { StickyNote, Plus, Pin, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { EmptyState } from '@/components/pcf/shared/EmptyState'

interface ContactNotesSectionProps {
  contactId: string
}

export function ContactNotesSection({ contactId }: ContactNotesSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [isAdding, setIsAdding] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch notes using the unified notes router
  const notesQuery = trpc.notes.listByEntity.useQuery({
    entityType: 'contact',
    entityId: contactId,
    limit: 50,
  })

  const notes = notesQuery.data?.items || []

  // Create note mutation using the unified notes router
  const createNoteMutation = trpc.notes.create.useMutation({
    onSuccess: () => {
      toast({ title: 'Note added' })
      utils.notes.listByEntity.invalidate({
        entityType: 'contact',
        entityId: contactId,
      })
      setNewNote('')
      setIsAdding(false)
    },
    onError: (error) => {
      toast({ title: 'Failed to add note', description: error.message, variant: 'error' })
    },
  })

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    setIsSubmitting(true)
    try {
      await createNoteMutation.mutateAsync({
        entityType: 'contact',
        entityId: contactId,
        content: newNote.trim(),
        noteType: 'general',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (notesQuery.isLoading) {
    return (
      <div className="p-6">
        <Card className="bg-white animate-pulse">
          <CardContent className="py-4">
            <div className="h-32 bg-charcoal-100 rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-charcoal-900">
          Notes ({notes.length})
        </h2>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Note
          </Button>
        )}
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <Card className="bg-white">
          <CardContent className="p-4 space-y-3">
            <Textarea
              placeholder="Write your note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false)
                  setNewNote('')
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={!newNote.trim() || isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      {notes.length === 0 && !isAdding ? (
        <EmptyState
          config={{
            icon: StickyNote,
            title: 'No notes yet',
            description: 'Add notes to keep track of important information',
            action: { label: 'Add Note', onClick: () => setIsAdding(true) },
          }}
          variant="inline"
        />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {note.title && (
                      <p className="font-medium text-charcoal-900 mb-1">{note.title}</p>
                    )}
                    <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-400">
                      <span>
                        {note.createdAt
                          ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })
                          : '—'}
                      </span>
                      {note.creator?.full_name && (
                        <span>by {note.creator.full_name}</span>
                      )}
                    </div>
                  </div>
                  {note.isPinned && (
                    <Pin className="w-4 h-4 text-gold-500 flex-shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
