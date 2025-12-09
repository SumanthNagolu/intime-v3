'use client'

import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Edit,
  MoreVertical,
  Plus,
  StickyNote,
  Trash2,
  User,
  Pin,
  PinOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InlinePanel, InlinePanelSection } from '@/components/ui/inline-panel'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { toast } from '@/components/ui/use-toast'

interface NoteType {
  id: string
  content: string
  is_pinned?: boolean
  created_at: string
  updated_at?: string
  creator?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

interface NotesSectionProps {
  entityType: string
  entityId: string
  notes?: NoteType[]
  isLoading?: boolean
  onAddNote?: (content: string) => Promise<void>
  onEditNote?: (id: string, content: string) => Promise<void>
  onDeleteNote?: (id: string) => Promise<void>
  onTogglePin?: (id: string, isPinned: boolean) => Promise<void>
  showInlineForm?: boolean
}

export function NotesSection({
  entityType: _entityType,
  entityId: _entityId,
  notes = [],
  isLoading = false,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onTogglePin,
  showInlineForm = true,
}: NotesSectionProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedNote = notes.find((n) => n.id === selectedNoteId)

  // Sort notes: pinned first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const handleCreateNote = async () => {
    if (!newNoteContent.trim() || !onAddNote) return

    setIsSubmitting(true)
    try {
      await onAddNote(newNoteContent.trim())
      setNewNoteContent('')
      setIsCreating(false)
      toast({ title: 'Note added' })
    } catch {
      toast({ title: 'Failed to add note', variant: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (!onDeleteNote) return

    try {
      await onDeleteNote(id)
      setSelectedNoteId(null)
      toast({ title: 'Note deleted' })
    } catch {
      toast({ title: 'Failed to delete note', variant: 'error' })
    }
  }

  const handleTogglePin = async (id: string, currentlyPinned: boolean) => {
    if (!onTogglePin) return

    try {
      await onTogglePin(id, !currentlyPinned)
      toast({ title: currentlyPinned ? 'Note unpinned' : 'Note pinned' })
    } catch {
      toast({ title: 'Failed to update note', variant: 'error' })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white animate-pulse">
            <CardContent className="py-4">
              <div className="h-16 bg-charcoal-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      {/* Notes List */}
      <div
        className={cn(
          'flex-1 space-y-3 transition-all duration-300',
          selectedNoteId ? 'max-w-[calc(100%-400px)]' : 'max-w-full'
        )}
      >
        {/* Inline Create Form */}
        {showInlineForm && onAddNote && (
          <Card className="bg-white">
            <CardContent className="py-4">
              {isCreating ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Write your note..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={3}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCreating(false)
                        setNewNoteContent('')
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreateNote}
                      disabled={!newNoteContent.trim() || isSubmitting}
                    >
                      {isSubmitting ? 'Adding...' : 'Add Note'}
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  className="w-full flex items-center gap-2 text-charcoal-500 hover:text-charcoal-700 transition-colors"
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add a note...</span>
                </button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {sortedNotes.length === 0 && !isCreating && (
          <EmptyState
            config={{
              icon: StickyNote,
              title: 'No notes yet',
              description: 'Add notes to capture important information',
              action: showInlineForm && onAddNote
                ? { label: 'Add Note', onClick: () => setIsCreating(true) }
                : undefined,
            }}
            variant="inline"
          />
        )}

        {/* Note cards */}
        {sortedNotes.map((note) => (
          <Card
            key={note.id}
            className={cn(
              'bg-white cursor-pointer transition-all duration-200',
              selectedNoteId === note.id
                ? 'ring-2 ring-gold-500 bg-gold-50/30'
                : 'hover:shadow-sm',
              note.is_pinned && 'border-l-4 border-l-gold-500'
            )}
            onClick={() => setSelectedNoteId(note.id)}
          >
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Content preview */}
                  <p className="text-charcoal-700 line-clamp-3 whitespace-pre-wrap">
                    {note.content}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-3 text-xs text-charcoal-500">
                    {note.creator && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {note.creator.full_name}
                      </span>
                    )}
                    <span>
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </span>
                    {note.is_pinned && (
                      <Badge variant="outline" className="text-xs">
                        <Pin className="w-3 h-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEditNote && (
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onTogglePin && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTogglePin(note.id, !!note.is_pinned)
                        }}
                      >
                        {note.is_pinned ? (
                          <>
                            <PinOff className="w-4 h-4 mr-2" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="w-4 h-4 mr-2" />
                            Pin to top
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    {onDeleteNote && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNote(note.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inline Panel */}
      <InlinePanel
        isOpen={!!selectedNote}
        onClose={() => setSelectedNoteId(null)}
        title="Note"
        description={selectedNote?.creator?.full_name || 'Note details'}
        width="md"
        headerActions={
          onEditNote && (
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )
        }
      >
        {selectedNote && (
          <>
            <InlinePanelSection title="Content">
              <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                {selectedNote.content}
              </p>
            </InlinePanelSection>

            <InlinePanelSection title="Details">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Created by</span>
                  <span className="font-medium">{selectedNote.creator?.full_name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Created</span>
                  <span className="font-medium">
                    {format(new Date(selectedNote.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                {selectedNote.updated_at && selectedNote.updated_at !== selectedNote.created_at && (
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Last updated</span>
                    <span className="font-medium">
                      {format(new Date(selectedNote.updated_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}
              </div>
            </InlinePanelSection>
          </>
        )}
      </InlinePanel>
    </div>
  )
}
