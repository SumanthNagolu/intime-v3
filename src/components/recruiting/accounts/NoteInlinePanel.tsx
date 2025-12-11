'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { InlinePanel, InlinePanelContent, InlinePanelSection } from '@/components/ui/inline-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Loader2, Trash2, Edit, X, Check, Star } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface NoteInlinePanelProps {
  noteId: string | null
  accountId: string
  onClose: () => void
}

const noteTypeOptions = [
  { value: 'general', label: 'General' },
  { value: 'internal', label: 'Internal' },
  { value: 'important', label: 'Important' },
  { value: 'reminder', label: 'Reminder' },
]

export function NoteInlinePanel({
  noteId,
  accountId,
  onClose,
}: NoteInlinePanelProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState('general')
  const [isPinned, setIsPinned] = useState(false)

  // Fetch note data - Using centralized notes router (NOTES-01)
  const noteQuery = trpc.notes.getById.useQuery(
    { id: noteId! },
    { enabled: !!noteId }
  )

  // Update mutation
  const updateMutation = trpc.notes.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Note updated' })
      utils.notes.listByEntity.invalidate({ entityType: 'account', entityId: accountId })
      setIsEditing(false)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Delete mutation
  const deleteMutation = trpc.notes.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Note deleted' })
      utils.notes.listByEntity.invalidate({ entityType: 'account', entityId: accountId })
      onClose()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Populate form when note data loads
  useEffect(() => {
    if (noteQuery.data) {
      const n = noteQuery.data
      setTitle(n.title || '')
      setContent(n.content || '')
      setNoteType(n.noteType || 'general')
      setIsPinned(n.isPinned || false)
    }
  }, [noteQuery.data])

  // Reset edit mode when note changes
  useEffect(() => {
    setIsEditing(false)
  }, [noteId])

  const handleSave = () => {
    if (!noteId) return
    updateMutation.mutate({
      id: noteId,
      title: title.trim() || undefined,
      content: content.trim(),
      noteType: noteType as 'general' | 'internal' | 'important' | 'reminder',
      isPinned,
    })
  }

  const handleDelete = () => {
    if (!noteId) return
    deleteMutation.mutate({ id: noteId })
  }

  const note = noteQuery.data

  const headerActions = !isEditing && note && (
    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
      <Edit className="w-4 h-4 mr-2" />
      Edit
    </Button>
  )

  const footerActions = isEditing ? (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="text-red-600 mr-auto">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this note. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button variant="outline" onClick={() => setIsEditing(false)}>
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
      <Button onClick={handleSave} disabled={updateMutation.isPending || !content.trim()}>
        {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        <Check className="w-4 h-4 mr-2" />
        Save
      </Button>
    </>
  ) : undefined

  return (
    <InlinePanel
      isOpen={!!noteId}
      onClose={onClose}
      title={isEditing ? 'Edit Note' : 'Note Details'}
      description={isEditing ? 'Update note content' : undefined}
      headerActions={headerActions}
      actions={footerActions}
      width="lg"
    >
      {noteQuery.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : note ? (
        isEditing ? (
          // Edit Mode
          <InlinePanelContent>
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noteType">Note Type</Label>
              <Select value={noteType} onValueChange={setNoteType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select note type" />
                </SelectTrigger>
                <SelectContent>
                  {noteTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPinned"
                checked={isPinned}
                onCheckedChange={(checked) => setIsPinned(checked === true)}
              />
              <Label htmlFor="isPinned" className="text-sm font-normal">
                Pin this note
              </Label>
            </div>
          </InlinePanelContent>
        ) : (
          // View Mode
          <InlinePanelContent>
            <div className="flex items-start justify-between">
              <div>
                {note.title && <h3 className="text-lg font-semibold">{note.title}</h3>}
                <div className="flex items-center gap-2 text-sm text-charcoal-500 mt-1">
                  <span>{note.creator?.full_name}</span>
                  <span>&bull;</span>
                  <span>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
              {note.isPinned && <Star className="w-5 h-5 text-gold-500 fill-gold-500" />}
            </div>

            <InlinePanelSection title="Content">
              <div className="bg-charcoal-50 rounded-lg p-4">
                <p className="whitespace-pre-wrap">{note.content}</p>
              </div>
            </InlinePanelSection>

            <div className="flex items-center gap-2">
              <span className="text-sm text-charcoal-500">Type:</span>
              <span className="text-sm capitalize">{note.noteType}</span>
            </div>
          </InlinePanelContent>
        )
      ) : (
        <div className="text-center py-8 text-charcoal-500">
          Note not found
        </div>
      )}
    </InlinePanel>
  )
}
