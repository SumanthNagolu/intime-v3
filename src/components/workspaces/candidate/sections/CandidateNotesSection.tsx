'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, StickyNote, Pin, User } from 'lucide-react'
import type { CandidateNote } from '@/types/candidate-workspace'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface CandidateNotesSectionProps {
  notes: CandidateNote[]
  candidateId: string
}

/**
 * CandidateNotesSection - Notes for this candidate
 */
export function CandidateNotesSection({ notes, candidateId }: CandidateNotesSectionProps) {
  // Sort pinned notes first
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const handleAddNote = () => {
    window.dispatchEvent(
      new CustomEvent('openCandidateDialog', {
        detail: { dialogId: 'addNote', candidateId },
      })
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal-900">
          Notes ({notes.length})
        </h2>
        <Button size="sm" onClick={handleAddNote}>
          <Plus className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>

      {/* Notes List */}
      {sortedNotes.length > 0 ? (
        <div className="space-y-3">
          {sortedNotes.map((note) => (
            <Card
              key={note.id}
              className={cn(
                note.isPinned && 'border-gold-300 bg-gold-50/30'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {note.isPinned && (
                    <Pin className="h-4 w-4 text-gold-500 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-charcoal-500">
                      {note.createdBy && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {note.createdBy.fullName}
                        </span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <StickyNote className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-sm text-charcoal-500">No notes yet</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleAddNote}>
              <Plus className="h-4 w-4 mr-1" />
              Add First Note
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CandidateNotesSection
