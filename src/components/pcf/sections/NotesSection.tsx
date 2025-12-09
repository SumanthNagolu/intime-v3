'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Edit,
  MoreVertical,
  Plus,
  StickyNote,
  Trash2,
  User,
  Pin,
  PinOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { toast } from '@/components/ui/use-toast'
import {
  NOTE_TYPE_CONFIG,
  NOTES_COLUMNS,
  NOTES_SORT_FIELD_MAP,
  type NoteItem,
} from '@/configs/sections/notes.config'

interface NotesSectionProps {
  entityType: string
  entityId: string
  notes?: NoteItem[]
  isLoading?: boolean
  onAddNote?: (content: string) => Promise<void>
  onEditNote?: (id: string, content: string) => Promise<void>
  onDeleteNote?: (id: string) => Promise<void>
  onTogglePin?: (id: string, isPinned: boolean) => Promise<void>
  showInlineForm?: boolean
}

export function NotesSection({
  entityType: _entityType,
  entityId: _entityId,
  notes = [],
  isLoading = false,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onTogglePin,
  showInlineForm = true,
}: NotesSectionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current sort state from URL
  const currentSortBy = searchParams.get('notesSortBy') || 'createdAt'
  const currentSortOrder = (searchParams.get('notesSortOrder') || 'desc') as 'asc' | 'desc'

  const selectedNote = notes.find((n) => n.id === selectedNoteId)

  // Transform and sort notes
  const sortedNotes = useMemo(() => {
    // Normalize data
    const normalized = notes.map(item => ({
      ...item,
      isPinned: item.is_pinned || item.isPinned,
      createdAt: item.created_at || item.createdAt,
      updatedAt: item.updated_at || item.updatedAt,
      noteType: item.note_type || item.noteType,
      entityType: item.entity_type || item.entityType,
      entityId: item.entity_id || item.entityId,
    }))

    // Sort: pinned first, then by selected column
    return [...normalized].sort((a, b) => {
      // Pinned always first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      // Then sort by selected field
      const sortField = NOTES_SORT_FIELD_MAP[currentSortBy] || 'created_at'
      let aVal: string | number | undefined
      let bVal: string | number | undefined

      switch (sortField) {
        case 'subject':
          aVal = a.subject
          bVal = b.subject
          break
        case 'created_at':
          aVal = a.createdAt
          bVal = b.createdAt
          break
        case 'updated_at':
          aVal = a.updatedAt
          bVal = b.updatedAt
          break
        default:
          aVal = a.createdAt
          bVal = b.createdAt
          break
      }

      if (!aVal && !bVal) return 0
      if (!aVal) return 1
      if (!bVal) return -1

      const comparison = String(aVal).localeCompare(String(bVal))
      return currentSortOrder === 'asc' ? comparison : -comparison
    })
  }, [notes, currentSortBy, currentSortOrder])

  const handleSort = (columnKey: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const newOrder = currentSortBy === columnKey && currentSortOrder === 'desc' ? 'asc' : 'desc'
    params.set('notesSortBy', columnKey)
    params.set('notesSortOrder', newOrder)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const getSortIcon = (columnKey: string) => {
    if (currentSortBy !== columnKey) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-charcoal-400" />
    }
    return currentSortOrder === 'asc'
      ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-gold-600" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5 text-gold-600" />
  }

  const handleCreateNote = async () => {
    if (!newNoteContent.trim() || !onAddNote) return

    setIsSubmitting(true)
    try {
      await onAddNote(newNoteContent.trim())
      setNewNoteContent('')
      setIsCreating(false)
      toast({ title: 'Note added' })
    } catch {
      toast({ title: 'Failed to add note', variant: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (!onDeleteNote) return

    try {
      await onDeleteNote(id)
      setSelectedNoteId(null)
      toast({ title: 'Note deleted' })
    } catch {
      toast({ title: 'Failed to delete note', variant: 'error' })
    }
  }

  const handleTogglePin = async (id: string, currentlyPinned: boolean) => {
    if (!onTogglePin) return

    try {
      await onTogglePin(id, !currentlyPinned)
      toast({ title: currentlyPinned ? 'Note unpinned' : 'Note pinned' })
    } catch {
      toast({ title: 'Failed to update note', variant: 'error' })
    }
  }

  const formatCellValue = (item: NoteItem, column: typeof NOTES_COLUMNS[number]) => {
    const keys = column.key.split('.')
    let value: unknown = item
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key]
    }

    // Custom render function takes priority
    if (column.render) {
      return column.render(value, item)
    }

    // Handle null/undefined
    if (value === null || value === undefined) {
      return <span className="text-charcoal-400">—</span>
    }

    // Format based on column type
    switch (column.format) {
      case 'date':
        try {
          return format(new Date(String(value)), 'MMM d, yyyy')
        } catch {
          return String(value)
        }

      case 'relative-date':
        try {
          return formatDistanceToNow(new Date(String(value)), { addSuffix: true })
        } catch {
          return String(value)
        }

      default:
        return String(value)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white animate-pulse">
        <CardContent className="py-4">
          <div className="h-64 bg-charcoal-100 rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Inline Create Form */}
      {showInlineForm && onAddNote && (
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
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateNote}
                    disabled={!newNoteContent.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Note'}
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
      )}

      {/* Empty state */}
      {sortedNotes.length === 0 && !isCreating && (
        <EmptyState
          config={{
            icon: StickyNote,
            title: 'No notes yet',
            description: 'Add notes to capture important information',
            action: showInlineForm && onAddNote
              ? { label: 'Add Note', onClick: () => setIsCreating(true) }
              : undefined,
          }}
          variant="inline"
        />
      )}

      {/* Table and Inline Panel */}
      {sortedNotes.length > 0 && (
        <div className="flex gap-4">
          {/* Notes Table */}
          <div
            className={cn(
              'flex-1 transition-all duration-300',
              selectedNoteId ? 'max-w-[calc(100%-400px)]' : 'max-w-full'
            )}
          >
            <Card className="bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-charcoal-50 border-b border-charcoal-200">
                      {NOTES_COLUMNS.map((column) => (
                        <TableHead
                          key={column.key}
                          className={cn(
                            'font-semibold text-charcoal-700 text-xs uppercase tracking-wider',
                            column.width,
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.sortable && 'cursor-pointer select-none hover:bg-charcoal-100 transition-colors'
                          )}
                          onClick={column.sortable ? () => handleSort(column.key) : undefined}
                        >
                          <span className="flex items-center">
                            {column.header || column.label}
                            {column.sortable && getSortIcon(column.key)}
                          </span>
                        </TableHead>
                      ))}
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedNotes.map((note) => (
                      <TableRow
                        key={note.id}
                        className={cn(
                          'cursor-pointer transition-colors',
                          selectedNoteId === note.id
                            ? 'bg-gold-50/50'
                            : note.isPinned
                              ? 'bg-gold-50/20 hover:bg-gold-50/30'
                              : 'hover:bg-charcoal-50'
                        )}
                        onClick={() => setSelectedNoteId(note.id)}
                      >
                        {NOTES_COLUMNS.map((column) => (
                          <TableCell
                            key={column.key}
                            className={cn(
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right'
                            )}
                          >
                            {formatCellValue(note, column)}
                          </TableCell>
                        ))}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onEditNote && (
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {onTogglePin && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleTogglePin(note.id, !!note.isPinned)
                                  }}
                                >
                                  {note.isPinned ? (
                                    <>
                                      <PinOff className="w-4 h-4 mr-2" />
                                      Unpin
                                    </>
                                  ) : (
                                    <>
                                      <Pin className="w-4 h-4 mr-2" />
                                      Pin to top
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                              {onDeleteNote && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteNote(note.id)
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          {/* Inline Panel */}
          <InlinePanel
            isOpen={!!selectedNote}
            onClose={() => setSelectedNoteId(null)}
            title="Note"
            description={selectedNote?.creator?.full_name || selectedNote?.author?.full_name || 'Note details'}
            width="md"
            headerActions={
              onEditNote && (
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )
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
                    {(selectedNote.isPinned) && (
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Status</span>
                        <Badge className="bg-gold-100 text-gold-700">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      </div>
                    )}
                    {selectedNote.noteType && (
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Type</span>
                        <Badge className={NOTE_TYPE_CONFIG[selectedNote.noteType]?.color || 'bg-charcoal-100 text-charcoal-700'}>
                          {NOTE_TYPE_CONFIG[selectedNote.noteType]?.label || selectedNote.noteType}
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Created by</span>
                      <div className="flex items-center gap-2">
                        {(selectedNote.creator || selectedNote.author) ? (
                          <>
                            {(selectedNote.creator?.avatar_url || selectedNote.author?.avatar_url) ? (
                              <img
                                src={selectedNote.creator?.avatar_url || selectedNote.author?.avatar_url}
                                alt={selectedNote.creator?.full_name || selectedNote.author?.full_name}
                                className="w-5 h-5 rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-charcoal-200 flex items-center justify-center">
                                <User className="w-3 h-3 text-charcoal-500" />
                              </div>
                            )}
                            <span className="font-medium">
                              {selectedNote.creator?.full_name || selectedNote.author?.full_name}
                            </span>
                          </>
                        ) : (
                          <span className="text-charcoal-400">Unknown</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Created</span>
                      <span className="font-medium">
                        {selectedNote.createdAt && format(new Date(selectedNote.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {selectedNote.updatedAt && selectedNote.updatedAt !== selectedNote.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Last updated</span>
                        <span className="font-medium">
                          {format(new Date(selectedNote.updatedAt), 'MMM d, yyyy h:mm a')}
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
