'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { trpc } from '@/lib/trpc/client'
import { Plus, FileText, Loader2, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface CampaignNotesSectionProps {
  campaignId: string
}

export function CampaignNotesSection({ campaignId }: CampaignNotesSectionProps) {
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null)

  const utils = trpc.useUtils()

  // Fetch notes (activities with type='note')
  const { data: notes, isLoading } = trpc.crm.activities.listByEntity.useQuery({
    entityType: 'campaign',
    entityId: campaignId,
    activityType: 'note',
  })

  const createNote = trpc.crm.activities.log.useMutation({
    onSuccess: () => {
      utils.crm.activities.listByEntity.invalidate({ entityType: 'campaign', entityId: campaignId })
      setIsAddingNote(false)
      setSubject('')
      setDescription('')
      toast.success('Note added successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add note')
    },
  })

  const deleteNote = trpc.crm.activities.delete.useMutation({
    onSuccess: () => {
      utils.crm.activities.listByEntity.invalidate({ entityType: 'campaign', entityId: campaignId })
      setDeleteNoteId(null)
      toast.success('Note deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete note')
    },
  })

  const handleCreateNote = () => {
    if (!subject.trim()) return
    createNote.mutate({
      entityType: 'campaign',
      entityId: campaignId,
      activityType: 'note',
      subject,
      description,
    })
  }

  const handleDeleteNote = () => {
    if (deleteNoteId) {
      deleteNote.mutate({ id: deleteNoteId })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Add Note Form */}
      {isAddingNote ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note title..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              placeholder="Note content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateNote} disabled={createNote.isPending || !subject.trim()}>
                {createNote.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Note
              </Button>
              <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAddingNote(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes?.map((note: {
          id: string
          subject?: string
          description?: string
          created_at: string
          creator?: { id: string; full_name: string; avatar_url?: string }
        }) => (
          <Card key={note.id} className="group">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-charcoal-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium">{note.subject || 'Untitled Note'}</h4>
                  {note.description && (
                    <p className="text-sm text-charcoal-600 mt-1 whitespace-pre-wrap">
                      {note.description}
                    </p>
                  )}
                  <p className="text-xs text-charcoal-400 mt-2">
                    {note.creator?.full_name} · {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setDeleteNoteId(note.id)}
                >
                  <Trash2 className="h-4 w-4 text-charcoal-400 hover:text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {notes?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="h-8 w-8 text-charcoal-300 mx-auto mb-2" />
              <p className="text-charcoal-500">No notes yet</p>
              <p className="text-sm text-charcoal-400">Add notes to track important campaign information</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
