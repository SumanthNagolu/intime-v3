'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, StickyNote, Pin, PinOff } from 'lucide-react'
import type { ContactNote } from '@/types/workspace'
import { formatDistanceToNow } from 'date-fns'

interface ContactNotesSectionProps {
  notes: ContactNote[]
  contactId: string
}

/**
 * ContactNotesSection - Shows notes with pinned notes first
 */
export function ContactNotesSection({ notes, contactId }: ContactNotesSectionProps) {
  const pinnedNotes = notes.filter((n) => n.isPinned)
  const regularNotes = notes.filter((n) => !n.isPinned)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Notes ({notes.length})
          </CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div className="py-8 text-center text-charcoal-500">
              <StickyNote className="h-8 w-8 mx-auto mb-2 text-charcoal-300" />
              <p>No notes yet</p>
              <p className="text-sm mt-1">Add notes to track important information about this contact.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pinned Notes */}
              {pinnedNotes.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </h4>
                  <div className="space-y-3">
                    {pinnedNotes.map((note) => (
                      <NoteCard key={note.id} note={note} />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Notes */}
              {regularNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                      All Notes
                    </h4>
                  )}
                  <div className="space-y-3">
                    {regularNotes.map((note) => (
                      <NoteCard key={note.id} note={note} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function NoteCard({ note }: { note: ContactNote }) {
  return (
    <div className="border border-charcoal-100 rounded-lg p-3 bg-cream">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-sm text-charcoal-900 whitespace-pre-wrap">{note.content}</div>
          <div className="text-xs text-charcoal-500 mt-2">
            {note.createdBy} \u2022 {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
          </div>
        </div>
        <Button variant="ghost" size="sm" className="flex-shrink-0 h-6 w-6 p-0">
          {note.isPinned ? (
            <PinOff className="h-3 w-3 text-charcoal-400" />
          ) : (
            <Pin className="h-3 w-3 text-charcoal-400" />
          )}
        </Button>
      </div>
    </div>
  )
}

export default ContactNotesSection
