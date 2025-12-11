'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Loader2, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { NoteInlinePanel } from '../NoteInlinePanel'
import { InlineNoteForm } from '../InlineNoteForm'
import { cn } from '@/lib/utils'

interface AccountNotesSectionProps {
  accountId: string
  onAddNote?: () => void // Made optional since inline form is primary now
}

/**
 * Notes Section - Isolated component with self-contained query
 * Uses inline panel for detail view (Guidewire pattern)
 *
 * Trigger: Rendered when section === 'notes'
 * DB Call: notes.listByAccount({ accountId })
 */
export function AccountNotesSection({ accountId, onAddNote: _onAddNote }: AccountNotesSectionProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  // This query fires when this component is rendered
  // Using centralized notes router (NOTES-01)
  const notesQuery = trpc.notes.listByEntity.useQuery({
    entityType: 'account',
    entityId: accountId,
  })
  const notes = notesQuery.data?.items || []

  const handleNoteClick = (noteId: string) => {
    setSelectedNoteId(noteId)
  }

  const handleClosePanel = () => {
    setSelectedNoteId(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
        <CardDescription>Internal notes about this account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Notes list */}
          <div className={cn(
            'flex-1 transition-all duration-300',
            selectedNoteId ? 'max-w-[calc(100%-496px)]' : 'max-w-full'
          )}>
            {/* Inline Note Form - Guidewire pattern */}
            <div className="mb-4">
              <InlineNoteForm accountId={accountId} />
            </div>

            {notesQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                <p className="text-charcoal-500">No notes yet</p>
                <p className="text-sm text-charcoal-400 mt-2">Use the form above to add your first note</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleNoteClick(note.id)}
                    className={cn(
                      'p-4 border rounded-lg cursor-pointer transition-colors',
                      note.isPinned && selectedNoteId !== note.id && 'border-gold-300 bg-gold-50',
                      selectedNoteId === note.id
                        ? 'border-hublot-500 bg-hublot-50'
                        : 'hover:border-hublot-300'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {note.title && <p className="font-medium truncate">{note.title}</p>}
                        <p className="text-sm text-charcoal-600 line-clamp-2">{note.content}</p>
                      </div>
                      {note.isPinned && <Star className="w-4 h-4 text-gold-500 fill-gold-500 flex-shrink-0 ml-2" />}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-charcoal-500">
                      <span>{note.creator?.full_name}</span>
                      <span>&bull;</span>
                      <span>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inline detail panel */}
          <NoteInlinePanel
            noteId={selectedNoteId}
            accountId={accountId}
            onClose={handleClosePanel}
          />
        </div>
      </CardContent>
    </Card>
  )
}
