'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

interface NoteDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  noteId: string | null
  accountId: string
}

const noteTypeOptions = [
  { value: 'general', label: 'General' },
  { value: 'internal', label: 'Internal' },
  { value: 'important', label: 'Important' },
  { value: 'reminder', label: 'Reminder' },
]

export function NoteDetailDialog({
  open,
  onOpenChange,
  noteId,
  accountId,
}: NoteDetailDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState('general')
  const [isPinned, setIsPinned] = useState(false)

  // Fetch note data
  const noteQuery = trpc.crm.notes.getById.useQuery(
    { id: noteId! },
    { enabled: !!noteId && open }
  )

  // Update mutation
  const updateMutation = trpc.crm.notes.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Note updated' })
      utils.crm.notes.listByAccount.invalidate({ accountId })
      setIsEditing(false)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Delete mutation
  const deleteMutation = trpc.crm.notes.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Note deleted' })
      utils.crm.notes.listByAccount.invalidate({ accountId })
      onOpenChange(false)
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
      setNoteType(n.note_type || 'general')
      setIsPinned(n.is_pinned || false)
    }
  }, [noteQuery.data])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false)
    }
  }, [open])

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {isEditing ? 'Edit Note' : 'Note Details'}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update note content' : 'View note details'}
              </DialogDescription>
            </div>
            {!isEditing && note && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {noteQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : note ? (
          isEditing ? (
            // Edit Mode
            <div className="space-y-4 py-4">
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
            </div>
          ) : (
            // View Mode
            <div className="py-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  {note.title && <h3 className="text-lg font-semibold">{note.title}</h3>}
                  <div className="flex items-center gap-2 text-sm text-charcoal-500 mt-1">
                    <span>{note.author?.full_name}</span>
                    <span>&bull;</span>
                    <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                {note.is_pinned && <Star className="w-5 h-5 text-gold-500 fill-gold-500" />}
              </div>

              <div className="bg-charcoal-50 rounded-lg p-4">
                <p className="whitespace-pre-wrap">{note.content}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-charcoal-500">Type:</span>
                <span className="text-sm capitalize">{note.note_type}</span>
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-8 text-charcoal-500">
            Note not found
          </div>
        )}

        <DialogFooter>
          {isEditing ? (
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
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
