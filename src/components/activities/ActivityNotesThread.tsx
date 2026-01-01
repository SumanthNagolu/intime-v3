'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Send, Lock } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface ActivityNote {
  id: string
  content: string
  isInternal: boolean
  createdAt: string
  createdBy: {
    id: string
    full_name: string
    avatar_url?: string
  } | Array<{ id: string; full_name: string; avatar_url?: string }> | null
}

interface ActivityNotesThreadProps {
  activityId: string
  notes: ActivityNote[]
}

/**
 * ActivityNotesThread - Threaded notes/comments for an activity
 * Supports internal (team-only) and external notes
 */
export function ActivityNotesThread({
  activityId,
  notes,
}: ActivityNotesThreadProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  
  const [newNote, setNewNote] = React.useState('')
  const [isInternal, setIsInternal] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const addNoteMutation = trpc.activities.addNote.useMutation({
    onSuccess: () => {
      setNewNote('')
      utils.activities.getDetail.invalidate({ id: activityId })
      // Scroll to bottom after adding note
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }, 100)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    addNoteMutation.mutate({
      activityId,
      content: newNote.trim(),
      isInternal,
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Notes list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-charcoal-400 text-sm">No notes yet</p>
            <p className="text-charcoal-400 text-xs mt-1">
              Add a note to track progress or share updates
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))
        )}
      </div>

      {/* Add note form */}
      <form onSubmit={handleSubmit} className="border-t p-4 bg-charcoal-50">
        <div className="space-y-3">
          <Textarea
            placeholder="Add a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[80px] resize-none"
            disabled={addNoteMutation.isPending}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="internal-note"
                checked={isInternal}
                onCheckedChange={setIsInternal}
              />
              <Label htmlFor="internal-note" className="text-sm text-charcoal-600 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Internal note
              </Label>
            </div>
            <Button 
              type="submit" 
              size="sm" 
              disabled={!newNote.trim() || addNoteMutation.isPending}
            >
              <Send className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

function NoteItem({ note }: { note: ActivityNote }) {
  // Handle both array and object formats for createdBy
  const createdByUser = Array.isArray(note.createdBy) 
    ? note.createdBy[0] 
    : note.createdBy

  return (
    <div className={cn(
      "rounded-lg p-3 border",
      note.isInternal 
        ? "bg-amber-50 border-amber-200" 
        : "bg-white border-charcoal-200"
    )}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={createdByUser?.avatar_url} />
          <AvatarFallback className="text-xs">
            {createdByUser?.full_name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {createdByUser?.full_name || 'Unknown User'}
            </span>
            {note.isInternal && (
              <Badge variant="outline" className="text-xs py-0 px-1 text-amber-700 border-amber-300">
                <Lock className="h-2.5 w-2.5 mr-0.5" />
                Internal
              </Badge>
            )}
            <span className="text-xs text-charcoal-400">
              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
            {note.content}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ActivityNotesThread

