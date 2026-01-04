'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  StickyNote, Plus, Search, Pin, PinOff, MoreVertical,
  MessageSquare, Lock, Globe, Users, Trash2, Edit2,
  X, ChevronLeft, ChevronRight, Reply, Clock,
  CheckCircle2, Loader2, Calendar
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import type { ContactNote } from '@/types/workspace'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useContactWorkspace } from '../ContactWorkspaceProvider'

// Constants
const ITEMS_PER_PAGE = 10

interface ContactNotesSectionProps {
  notes: ContactNote[]
  contactId: string
}

type NoteTypeFilter = 'all' | 'pinned' | 'general' | 'internal' | 'private'
type VisibilityType = 'public' | 'team' | 'private'

// Note type configuration
const NOTE_TYPE_CONFIG: Record<string, {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
}> = {
  general: { icon: StickyNote, label: 'General', color: 'text-gold-600' },
  meeting: { icon: Calendar, label: 'Meeting', color: 'text-blue-600' },
  call: { icon: MessageSquare, label: 'Call', color: 'text-emerald-600' },
  internal: { icon: Lock, label: 'Internal', color: 'text-purple-600' },
}

// Visibility configuration
const VISIBILITY_CONFIG: Record<VisibilityType, {
  icon: React.ComponentType<{ className?: string }>
  label: string
  bgColor: string
  textColor: string
}> = {
  public: { icon: Globe, label: 'Public', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
  team: { icon: Users, label: 'Team', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  private: { icon: Lock, label: 'Private', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
}

/**
 * ContactNotesSection - Premium SaaS-level note management
 * Features: Table list view with headers, pinned notes filter, pagination, bottom detail panel with replies
 */
export function ContactNotesSection({ notes, contactId }: ContactNotesSectionProps) {
  const { toast } = useToast()
  const { refreshData } = useContactWorkspace()

  const [selectedNote, setSelectedNote] = React.useState<ContactNote | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<NoteTypeFilter>('all')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [noteToDelete, setNoteToDelete] = React.useState<string | null>(null)

  // Mutations
  const togglePinMutation = trpc.notes.togglePin.useMutation({
    onSuccess: () => {
      toast({ title: 'Note updated' })
      refreshData()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const deleteMutation = trpc.notes.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Note deleted' })
      setSelectedNote(null)
      setDeleteDialogOpen(false)
      setNoteToDelete(null)
      refreshData()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Calculate type counts
  const typeCounts = React.useMemo(() => {
    return {
      all: notes.length,
      pinned: notes.filter(n => n.isPinned).length,
      general: notes.filter(n => n.noteType === 'general' || !n.noteType).length,
      internal: notes.filter(n => n.noteType === 'internal').length,
      private: notes.filter(n => n.visibility === 'private').length,
    }
  }, [notes])

  // Filter notes
  const filteredNotes = React.useMemo(() => {
    let result = notes

    // Type filter
    if (typeFilter === 'pinned') {
      result = result.filter(n => n.isPinned)
    } else if (typeFilter === 'general') {
      result = result.filter(n => n.noteType === 'general' || !n.noteType)
    } else if (typeFilter === 'internal') {
      result = result.filter(n => n.noteType === 'internal')
    } else if (typeFilter === 'private') {
      result = result.filter(n => n.visibility === 'private')
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(n =>
        n.content.toLowerCase().includes(q) ||
        n.creator?.full_name?.toLowerCase().includes(q)
      )
    }

    // Sort: pinned first, then by date
    result = [...result].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return result
  }, [notes, searchQuery, typeFilter])

  // Pagination
  const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE)
  const paginatedNotes = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredNotes.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredNotes, currentPage])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, typeFilter])

  const handleRowClick = (note: ContactNote) => {
    if (selectedNote?.id === note.id) {
      setSelectedNote(null)
    } else {
      setSelectedNote(note)
    }
  }

  const handleTogglePin = (noteId: string, currentPinned: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    togglePinMutation.mutate({ id: noteId, isPinned: !currentPinned })
  }

  const handleDelete = (noteId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setNoteToDelete(noteId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (noteToDelete) {
      deleteMutation.mutate({ id: noteToDelete })
    }
  }

  const getNoteTypeConfig = (type: string | null | undefined) => {
    return NOTE_TYPE_CONFIG[type || 'general'] || NOTE_TYPE_CONFIG.general
  }

  const getVisibilityConfig = (visibility: string | null | undefined): typeof VISIBILITY_CONFIG.public => {
    return VISIBILITY_CONFIG[(visibility || 'team') as VisibilityType] || VISIBILITY_CONFIG.team
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Premium List Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        {/* Header with gradient */}
        <div className="px-5 py-4 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50/80 via-white to-gold-50/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-sm">
                <StickyNote className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Notes</h3>
                <p className="text-xs text-charcoal-500">
                  {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} for this contact
                  {typeCounts.pinned > 0 && ` • ${typeCounts.pinned} pinned`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-64 text-sm border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20"
                />
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900 shadow-sm font-medium"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openContactDialog', {
                    detail: { dialogId: 'addNote', contactId }
                  }))
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Note
              </Button>
            </div>
          </div>

          {/* Filter Pills */}
          {notes.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              {[
                { key: 'all', label: 'All', count: typeCounts.all },
                { key: 'pinned', label: 'Pinned', count: typeCounts.pinned, highlight: true },
                { key: 'general', label: 'General', count: typeCounts.general },
                { key: 'internal', label: 'Internal', count: typeCounts.internal },
                { key: 'private', label: 'Private', count: typeCounts.private },
              ].filter(f => f.count > 0 || f.key === 'all').map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setTypeFilter(filter.key as NoteTypeFilter)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    typeFilter === filter.key
                      ? filter.highlight && filter.count > 0
                        ? "bg-gold-600 text-white shadow-sm"
                        : "bg-charcoal-900 text-white shadow-sm"
                      : filter.highlight && filter.count > 0
                        ? "bg-gold-50 text-gold-700 hover:bg-gold-100"
                        : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                  )}
                >
                  {filter.key === 'pinned' && <Pin className="h-3 w-3 mr-1 inline-block" />}
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_120px_100px_100px_60px] gap-2 px-4 py-2.5 bg-charcoal-50/80 border-b border-charcoal-200/60 text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.1em]">
          <div className="text-center">#</div>
          <div>Note</div>
          <div>Author</div>
          <div className="text-center">Type</div>
          <div className="text-center">Date</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        {paginatedNotes.length > 0 ? (
          <div className="divide-y divide-charcoal-100/40">
            {paginatedNotes.map((note, idx) => {
              const rowNumber = ((currentPage - 1) * ITEMS_PER_PAGE) + idx + 1
              const typeConfig = getNoteTypeConfig(note.noteType)
              const visibilityConfig = getVisibilityConfig(note.visibility)
              const TypeIcon = typeConfig.icon

              return (
                <div
                  key={note.id}
                  onClick={() => handleRowClick(note)}
                  className={cn(
                    'group grid grid-cols-[40px_1fr_120px_100px_100px_60px] gap-2 px-4 py-3 cursor-pointer transition-all duration-150 items-center',
                    selectedNote?.id === note.id
                      ? 'bg-gold-50/80 border-l-2 border-l-gold-500'
                      : 'hover:bg-charcoal-50/60 border-l-2 border-l-transparent'
                  )}
                >
                  {/* Row Number */}
                  <div className="text-center flex items-center justify-center">
                    {note.isPinned ? (
                      <Pin className="h-4 w-4 text-gold-500" />
                    ) : (
                      <span className="text-sm font-bold text-charcoal-300 tabular-nums">{rowNumber}</span>
                    )}
                  </div>

                  {/* Note Preview */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn(
                      "relative w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0 shadow-sm"
                    )}>
                      <TypeIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-charcoal-900 line-clamp-1 font-medium">
                        {note.content}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-charcoal-500">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] px-1.5 py-0 font-medium border-0",
                            visibilityConfig.bgColor,
                            visibilityConfig.textColor
                          )}
                        >
                          <visibilityConfig.icon className="h-2.5 w-2.5 mr-0.5" />
                          {visibilityConfig.label}
                        </Badge>
                        {note.replyCount > 0 && (
                          <span className="flex items-center gap-1 text-charcoal-400">
                            <Reply className="h-3 w-3" />
                            {note.replyCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={note.creator?.avatar_url || undefined} alt={note.creator?.full_name} />
                      <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-[10px] font-semibold">
                        {note.creator?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-charcoal-600 truncate">
                      {note.creator?.full_name?.split(' ')[0] || 'Unknown'}
                    </span>
                  </div>

                  {/* Type */}
                  <div className="text-center">
                    <Badge variant="outline" className="text-[10px] font-medium border-charcoal-200 px-1.5 py-0">
                      {typeConfig.label}
                    </Badge>
                  </div>

                  {/* Date */}
                  <div className="text-center">
                    <div className="text-xs text-charcoal-600 font-medium tabular-nums">
                      {format(new Date(note.createdAt), 'MMM d')}
                    </div>
                    <div className="text-[10px] text-charcoal-400">
                      {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true }).replace('about ', '')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4 text-charcoal-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={(e) => handleTogglePin(note.id, note.isPinned, e as unknown as React.MouseEvent)}>
                          {note.isPinned ? (
                            <>
                              <PinOff className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                              Unpin Note
                            </>
                          ) : (
                            <>
                              <Pin className="h-3.5 w-3.5 mr-2 text-gold-500" />
                              Pin Note
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Edit2 className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                          Edit Note
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(note.id, e as unknown as React.MouseEvent)}
                          className="text-error-600"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete Note
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center mx-auto mb-4">
              <StickyNote className="h-8 w-8 text-charcoal-400" />
            </div>
            <p className="text-base font-medium text-charcoal-700">
              {searchQuery || typeFilter !== 'all' ? 'No notes match your filters' : 'No notes yet'}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">
              {searchQuery || typeFilter !== 'all' ? 'Try different search terms or filters' : 'Add notes to track important information about this contact'}
            </p>
            {!searchQuery && typeFilter === 'all' && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openContactDialog', {
                      detail: { dialogId: 'addNote', contactId }
                    }))
                  }}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Note
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-charcoal-100 bg-charcoal-50/30 flex items-center justify-between">
            <p className="text-sm text-charcoal-500">
              Showing <span className="font-medium text-charcoal-700">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-medium text-charcoal-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredNotes.length)}</span> of <span className="font-medium text-charcoal-700">{filteredNotes.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-charcoal-600 min-w-[100px] text-center">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Premium Detail Panel - Slides up from bottom */}
      {selectedNote && (
        <NoteDetailBottomPanel
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onTogglePin={handleTogglePin}
          onDelete={handleDelete}
          contactId={contactId}
          refreshData={refreshData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-error-600 hover:bg-error-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================
// Note Detail Bottom Panel
// ============================================
interface NoteDetailBottomPanelProps {
  note: ContactNote
  onClose: () => void
  onTogglePin: (id: string, isPinned: boolean, e?: React.MouseEvent) => void
  onDelete: (id: string, e?: React.MouseEvent) => void
  contactId: string
  refreshData: () => void
}

function NoteDetailBottomPanel({
  note,
  onClose,
  onTogglePin,
  onDelete,
}: NoteDetailBottomPanelProps) {
  const typeConfig = NOTE_TYPE_CONFIG[note.noteType || 'general'] || NOTE_TYPE_CONFIG.general
  const visibilityConfig = VISIBILITY_CONFIG[(note.visibility || 'team') as VisibilityType] || VISIBILITY_CONFIG.team
  const TypeIcon = typeConfig.icon
  const VisibilityIcon = visibilityConfig.icon

  return (
    <div
      className="relative rounded-2xl border border-charcoal-200/40 bg-gradient-to-br from-white via-white to-cream/30 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden"
      style={{
        animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Decorative top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-amber-500 to-gold-400" />

      {/* Floating close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal-900/5 hover:bg-charcoal-900/10 backdrop-blur-sm border border-charcoal-200/50 text-charcoal-500 hover:text-charcoal-700 transition-all duration-200 group"
      >
        <span className="text-xs font-medium">Close</span>
        <X className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Header */}
      <div className="relative px-8 pt-6 pb-5 bg-gradient-to-br from-charcoal-50/80 via-transparent to-gold-50/20">
        <div className="flex items-start gap-5">
          {/* Note icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-gold-400 rounded-2xl blur-xl opacity-40" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg ring-4 ring-white/80">
              <TypeIcon className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            {note.isPinned && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center ring-2 ring-white">
                <Pin className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className={cn("text-xs font-semibold border-0", typeConfig.color)}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeConfig.label} Note
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-xs font-semibold border-0", visibilityConfig.bgColor, visibilityConfig.textColor)}
              >
                <VisibilityIcon className="h-3 w-3 mr-1" />
                {visibilityConfig.label}
              </Badge>
              {note.isPinned && (
                <Badge variant="outline" className="text-xs font-semibold border-0 bg-gold-50 text-gold-700">
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-500">
              <span className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={note.creator?.avatar_url || undefined} />
                  <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-[9px] font-semibold">
                    {note.creator?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
                {note.creator?.full_name || 'Unknown'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(note.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {/* Note Content */}
        <div
          className="mb-6"
          style={{ animation: 'fadeInUp 0.4s ease-out 0.1s forwards', opacity: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <StickyNote className="h-4 w-4 text-gold-500" />
            <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Note Content</h4>
          </div>
          <div className="rounded-2xl border border-charcoal-100/50 bg-white p-5">
            <p className="text-sm text-charcoal-700 whitespace-pre-wrap leading-relaxed">
              {note.content}
            </p>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Created */}
          <div
            className="space-y-2"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.15s forwards', opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Created</h4>
            </div>
            <div className="rounded-xl border border-charcoal-100/50 bg-white p-3">
              <p className="text-sm font-semibold text-charcoal-800">
                {format(new Date(note.createdAt), 'MMMM d, yyyy')}
              </p>
              <p className="text-xs text-charcoal-500 mt-0.5">
                {format(new Date(note.createdAt), 'h:mm a')}
              </p>
            </div>
          </div>

          {/* Author */}
          <div
            className="space-y-2"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.2s forwards', opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-500" />
              <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Author</h4>
            </div>
            <div className="rounded-xl border border-charcoal-100/50 bg-white p-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={note.creator?.avatar_url || undefined} />
                  <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-[10px] font-semibold">
                    {note.creator?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-charcoal-800">
                  {note.creator?.full_name || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Replies Count */}
          <div
            className="space-y-2"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.25s forwards', opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <Reply className="h-4 w-4 text-purple-500" />
              <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Replies</h4>
            </div>
            <div className="rounded-xl border border-charcoal-100/50 bg-white p-3">
              <p className="text-sm font-semibold text-charcoal-800">
                {note.replyCount} {note.replyCount === 1 ? 'reply' : 'replies'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div
          className="flex items-center justify-center gap-3 pt-6 border-t border-charcoal-100/40"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.35s forwards', opacity: 0 }}
        >
          <Button
            variant="outline"
            onClick={() => onTogglePin(note.id, note.isPinned)}
          >
            {note.isPinned ? (
              <>
                <PinOff className="h-4 w-4 mr-2" />
                Unpin Note
              </>
            ) : (
              <>
                <Pin className="h-4 w-4 mr-2" />
                Pin Note
              </>
            )}
          </Button>
          <Button variant="outline">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="text-error-600 hover:text-error-700 hover:bg-error-50"
            onClick={() => onDelete(note.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default ContactNotesSection
