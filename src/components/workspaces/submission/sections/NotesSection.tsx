'use client'

import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  StickyNote,
  Pin,
  User,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
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
import type { FullSubmission, Note } from '@/types/submission'

interface NotesSectionProps {
  submission: FullSubmission
}

export function NotesSection({ submission }: NotesSectionProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const notes = submission.sections?.notes?.items || []
  const selectedNote = notes.find((n) => n.id === selectedNoteId)

  // Sort notes: pinned first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    const dateA = new Date(a.created_at || 0).getTime()
    const dateB = new Date(b.created_at || 0).getTime()
    return dateB - dateA
  })

  if (notes.length === 0 && !isCreating) {
    return (
      <EmptyState
        config={{
          icon: StickyNote,
          title: 'No notes yet',
          description: 'Add notes to capture important information about this submission',
          action: { label: 'Add Note', onClick: () => setIsCreating(true) },
        }}
        variant="inline"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Inline Create Form */}
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
                >
                  Cancel
                </Button>
                <Button size="sm" disabled={!newNoteContent.trim()}>
                  Add Note
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

      {/* Notes List with Inline Panel */}
      {sortedNotes.length > 0 && (
        <div className="flex gap-4">
          <div
            className={cn(
              'flex-1 transition-all duration-300',
              selectedNoteId ? 'max-w-[calc(100%-400px)]' : 'max-w-full'
            )}
          >
            {/* Note Cards */}
            <div className="space-y-2">
              {sortedNotes.map((note) => (
                <Card
                  key={note.id}
                  className={cn(
                    'bg-white cursor-pointer transition-all duration-300',
                    selectedNoteId === note.id
                      ? 'ring-2 ring-gold-500'
                      : note.is_pinned
                        ? 'bg-gold-50/30 hover:shadow-md'
                        : 'hover:shadow-md'
                  )}
                  onClick={() => setSelectedNoteId(note.id)}
                >
                  <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'p-2 rounded-lg',
                          note.is_pinned ? 'bg-gold-100' : 'bg-charcoal-100'
                        )}
                      >
                        {note.is_pinned ? (
                          <Pin className="w-4 h-4 text-gold-600" />
                        ) : (
                          <StickyNote className="w-4 h-4 text-charcoal-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-charcoal-700 line-clamp-2">
                          {note.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-charcoal-400">
                          <span>
                            {note.created_at
                              ? formatDistanceToNow(new Date(note.created_at), { addSuffix: true })
                              : '—'}
                          </span>
                          {note.creator && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {note.creator.full_name}
                            </span>
                          )}
                          {note.is_pinned && (
                            <Badge className="bg-gold-100 text-gold-700 text-[10px]">
                              Pinned
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pin className="w-4 h-4 mr-2" />
                            {note.is_pinned ? 'Unpin' : 'Pin to top'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Inline Panel */}
          <InlinePanel
            isOpen={!!selectedNote}
            onClose={() => setSelectedNoteId(null)}
            title="Note"
            description={selectedNote?.creator?.full_name || 'Note details'}
            width="md"
            headerActions={
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
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
                    {selectedNote.is_pinned && (
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Status</span>
                        <Badge className="bg-gold-100 text-gold-700">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Created by</span>
                      <div className="flex items-center gap-2">
                        {selectedNote.creator ? (
                          <>
                            {selectedNote.creator.avatar_url ? (
                              <img
                                src={selectedNote.creator.avatar_url}
                                alt={selectedNote.creator.full_name}
                                className="w-5 h-5 rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-charcoal-200 flex items-center justify-center">
                                <User className="w-3 h-3 text-charcoal-500" />
                              </div>
                            )}
                            <span className="font-medium">{selectedNote.creator.full_name}</span>
                          </>
                        ) : (
                          <span className="text-charcoal-400">Unknown</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Created</span>
                      <span className="font-medium">
                        {selectedNote.created_at &&
                          format(new Date(selectedNote.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {selectedNote.updated_at &&
                      selectedNote.updated_at !== selectedNote.created_at && (
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
      )}
    </div>
  )
}
