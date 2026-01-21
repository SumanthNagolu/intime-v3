'use client'

import * as React from 'react'
import { StickyNote, Plus, User, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FullJob, NoteItem } from '@/types/job'
import { formatDistanceToNow } from 'date-fns'

interface JobNotesSectionProps {
  job: FullJob
  onRefresh?: () => void
}

/**
 * JobNotesSection - Notes for the job
 */
export function JobNotesSection({ job, onRefresh }: JobNotesSectionProps) {
  const notes = job.sections?.notes?.items || []

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <StickyNote className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Notes</h3>
                <p className="text-xs text-charcoal-500">{notes.length} notes</p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Note
            </Button>
          </div>
        </div>

        <div className="p-6">
          {notes.length === 0 ? (
            <div className="py-12 text-center">
              <StickyNote className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
              <p className="text-sm text-charcoal-500">No notes yet</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="h-4 w-4 mr-1.5" />
                Add First Note
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border border-charcoal-200/60 bg-white p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-charcoal-700 whitespace-pre-wrap flex-1">
                      {note.content}
                    </p>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-charcoal-500">
                    {note.creator && (
                      <>
                        <User className="h-3 w-3" />
                        <span>{note.creator.full_name}</span>
                        <span>·</span>
                      </>
                    )}
                    <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobNotesSection
