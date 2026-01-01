'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, StickyNote, Pin } from 'lucide-react'
import type { AccountNote } from '@/types/workspace'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface AccountNotesSectionProps {
  notes: AccountNote[]
  accountId: string
}

/**
 * AccountNotesSection - Notes for this account
 */
export function AccountNotesSection({ notes, accountId }: AccountNotesSectionProps) {
  const pinnedNotes = notes.filter(n => n.isPinned)
  const regularNotes = notes.filter(n => !n.isPinned)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal-900">
          Notes ({notes.length})
        </h2>
        <Button 
          size="sm"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('openAccountDialog', { 
              detail: { dialogId: 'addNote', accountId } 
            }))
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>

      {notes.length > 0 ? (
        <div className="space-y-4">
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
                <Pin className="h-3 w-3" />
                Pinned
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Notes */}
          {regularNotes.length > 0 && (
            <div className="space-y-2">
              {pinnedNotes.length > 0 && (
                <h3 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                  All Notes
                </h3>
              )}
              <div className="grid grid-cols-2 gap-4">
                {regularNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <StickyNote className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-sm text-charcoal-500">No notes yet</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openAccountDialog', { 
                  detail: { dialogId: 'addNote', accountId } 
                }))
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add First Note
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function NoteCard({ note }: { note: AccountNote }) {
  return (
    <Card className={cn(note.isPinned && 'border-gold-300 bg-gold-50/50')}>
      <CardContent className="p-4">
        <div className="flex items-start gap-2 mb-2">
          {note.isPinned && (
            <Pin className="h-4 w-4 text-gold-500 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-charcoal-700 line-clamp-4">
            {note.content}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs text-charcoal-500">
          <span>{note.createdBy}</span>
          <span>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccountNotesSection
