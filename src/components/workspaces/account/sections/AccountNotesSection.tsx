'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  StickyNote, Pin, Star, MessageSquare, Phone, Calendar,
  Plus, Search, MoreVertical, X, ChevronLeft, ChevronRight,
  Loader2, AlertTriangle, Lightbulb, Shield, Eye, EyeOff,
  Clock, User, FileText, Tag, Trash2, Edit3, Reply, Hash
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AccountNote } from '@/types/workspace'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useAccountWorkspace } from '../AccountWorkspaceProvider'

// Constants
const ITEMS_PER_PAGE = 10

interface AccountNotesSectionProps {
  notes: AccountNote[]
  accountId: string
}

type StatusFilter = 'all' | 'pinned' | 'general' | 'meeting' | 'call' | 'important' | 'internal'

// Note type configuration
const NOTE_TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; gradient: string; label: string; color: string }> = {
  general: { icon: StickyNote, gradient: 'from-charcoal-400 to-charcoal-500', label: 'General', color: 'text-charcoal-600' },
  meeting: { icon: Calendar, gradient: 'from-blue-400 to-blue-600', label: 'Meeting', color: 'text-blue-600' },
  call: { icon: Phone, gradient: 'from-emerald-400 to-emerald-600', label: 'Call', color: 'text-emerald-600' },
  strategy: { icon: Lightbulb, gradient: 'from-amber-400 to-amber-600', label: 'Strategy', color: 'text-amber-600' },
  warning: { icon: AlertTriangle, gradient: 'from-error-400 to-error-600', label: 'Warning', color: 'text-error-600' },
  opportunity: { icon: Star, gradient: 'from-gold-400 to-gold-600', label: 'Opportunity', color: 'text-gold-600' },
  competitive_intel: { icon: Shield, gradient: 'from-purple-400 to-purple-600', label: 'Competitive Intel', color: 'text-purple-600' },
  internal: { icon: EyeOff, gradient: 'from-rose-400 to-rose-600', label: 'Internal', color: 'text-rose-600' },
  important: { icon: Star, gradient: 'from-red-400 to-red-600', label: 'Important', color: 'text-red-600' },
  reminder: { icon: Clock, gradient: 'from-indigo-400 to-indigo-600', label: 'Reminder', color: 'text-indigo-600' },
}

// Visibility configuration
const VISIBILITY_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  private: { icon: EyeOff, label: 'Private' },
  team: { icon: User, label: 'Team' },
  organization: { icon: Eye, label: 'Organization' },
}

/**
 * AccountNotesSection - Premium SaaS-level notes workspace
 * Features: List view with headers, bottom detail panel when selected, full note management
 */
export function AccountNotesSection({ notes, accountId }: AccountNotesSectionProps) {
  const { toast } = useToast()
  const { refreshData } = useAccountWorkspace()

  const [selectedNote, setSelectedNote] = React.useState<AccountNote | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [currentPage, setCurrentPage] = React.useState(1)

  // Fetch full note detail when selected
  const { data: noteDetail, isLoading: detailLoading } = trpc.notes.getById.useQuery(
    { id: selectedNote?.id! },
    { enabled: !!selectedNote }
  )

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
      refreshData()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const updateMutation = trpc.notes.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Note updated' })
      refreshData()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const createReplyMutation = trpc.notes.create.useMutation({
    onSuccess: () => {
      toast({ title: 'Reply added' })
      refreshData()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Calculate filter counts
  const filterCounts = React.useMemo(() => {
    return {
      all: notes.length,
      pinned: notes.filter(n => n.isPinned).length,
      general: notes.filter(n => n.noteType === 'general').length,
      meeting: notes.filter(n => n.noteType === 'meeting').length,
      call: notes.filter(n => n.noteType === 'call').length,
      important: notes.filter(n => n.noteType === 'important').length,
      internal: notes.filter(n => n.noteType === 'internal').length,
    }
  }, [notes])

  // Filter notes
  const filteredNotes = React.useMemo(() => {
    let result = notes

    // Status filter
    if (statusFilter === 'pinned') {
      result = result.filter(n => n.isPinned)
    } else if (statusFilter !== 'all') {
      result = result.filter(n => n.noteType === statusFilter)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(n =>
        n.content.toLowerCase().includes(q) ||
        n.title?.toLowerCase().includes(q) ||
        n.creator?.full_name.toLowerCase().includes(q)
      )
    }

    return result
  }, [notes, searchQuery, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE)
  const paginatedNotes = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredNotes.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredNotes, currentPage])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const handleRowClick = (note: AccountNote) => {
    if (selectedNote?.id === note.id) {
      setSelectedNote(null)
    } else {
      setSelectedNote(note)
    }
  }

  const handleTogglePin = (noteId: string, isPinned: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    togglePinMutation.mutate({ id: noteId, isPinned: !isPinned })
  }

  const handleDelete = (noteId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate({ id: noteId })
    }
  }

  const getNoteTypeConfig = (type: string) => {
    return NOTE_TYPE_CONFIG[type] || NOTE_TYPE_CONFIG.general
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
                  {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} for this account
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
                  window.dispatchEvent(new CustomEvent('openAccountDialog', {
                    detail: { dialogId: 'addNote', accountId }
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
                { key: 'all', label: 'All', count: filterCounts.all },
                { key: 'pinned', label: 'Pinned', count: filterCounts.pinned, highlight: true },
                { key: 'meeting', label: 'Meeting', count: filterCounts.meeting },
                { key: 'call', label: 'Call', count: filterCounts.call },
                { key: 'important', label: 'Important', count: filterCounts.important },
              ].filter(f => f.count > 0 || f.key === 'all').map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key as StatusFilter)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    statusFilter === filter.key
                      ? filter.highlight && filter.count > 0
                        ? "bg-gold-600 text-white shadow-sm"
                        : "bg-charcoal-900 text-white shadow-sm"
                      : filter.highlight && filter.count > 0
                        ? "bg-gold-50 text-gold-700 hover:bg-gold-100"
                        : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                  )}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_100px_120px_100px_60px] gap-2 px-4 py-2.5 bg-charcoal-50/80 border-b border-charcoal-200/60 text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.1em]">
          <div className="text-center">#</div>
          <div>Note</div>
          <div>Type</div>
          <div>Created By</div>
          <div className="text-center">Date</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        {paginatedNotes.length > 0 ? (
          <div className="divide-y divide-charcoal-100/40">
            {paginatedNotes.map((note, idx) => {
              const rowNumber = ((currentPage - 1) * ITEMS_PER_PAGE) + idx + 1
              const typeConfig = getNoteTypeConfig(note.noteType)
              const TypeIcon = typeConfig.icon

              return (
                <div
                  key={note.id}
                  onClick={() => handleRowClick(note)}
                  className={cn(
                    'group grid grid-cols-[40px_1fr_100px_120px_100px_60px] gap-2 px-4 py-3 cursor-pointer transition-all duration-150 items-center',
                    selectedNote?.id === note.id
                      ? 'bg-gold-50/80 border-l-2 border-l-gold-500'
                      : 'hover:bg-charcoal-50/60 border-l-2 border-l-transparent',
                    note.isPinned && selectedNote?.id !== note.id && 'bg-gold-50/30'
                  )}
                >
                  {/* Row Number */}
                  <div className="text-center">
                    <span className="text-sm font-bold text-charcoal-300 tabular-nums">
                      {rowNumber}
                    </span>
                  </div>

                  {/* Note Info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn(
                      "relative w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm",
                      typeConfig.gradient
                    )}>
                      <TypeIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate text-charcoal-900">
                          {note.title || note.content.slice(0, 50) + (note.content.length > 50 ? '...' : '')}
                        </span>
                        {note.isPinned && (
                          <Pin className="h-3.5 w-3.5 text-gold-500 flex-shrink-0" />
                        )}
                        {note.isStarred && (
                          <Star className="h-3.5 w-3.5 text-gold-500 fill-gold-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-charcoal-500">
                        <span className="truncate">
                          {note.title ? note.content.slice(0, 60) + (note.content.length > 60 ? '...' : '') : ''}
                        </span>
                        {note.replyCount > 0 && (
                          <span className="flex items-center gap-0.5 text-charcoal-400 flex-shrink-0">
                            <Reply className="h-3 w-3" />
                            {note.replyCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0 border-0",
                        `bg-${typeConfig.color.replace('text-', '')}/10`,
                        typeConfig.color
                      )}
                    >
                      {typeConfig.label}
                    </Badge>
                  </div>

                  {/* Created By */}
                  <div className="flex items-center gap-2">
                    {note.creator ? (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={note.creator.avatar_url || undefined} />
                          <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-[10px] font-semibold">
                            {note.creator.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-charcoal-600 truncate">{note.creator.full_name.split(' ')[0]}</span>
                      </>
                    ) : (
                      <span className="text-xs text-charcoal-400">Unknown</span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-center">
                    <div className="text-xs text-charcoal-600">
                      <div className="font-semibold tabular-nums">{format(new Date(note.createdAt), 'MMM d')}</div>
                      <div className="text-[10px] text-charcoal-400">{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true }).replace('about ', '')}</div>
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
                          <Pin className="h-3.5 w-3.5 mr-2" />
                          {note.isPinned ? 'Unpin' : 'Pin'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(note.id, e as unknown as React.MouseEvent)}
                          className="text-error-600 focus:text-error-600"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
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
              {searchQuery || statusFilter !== 'all' ? 'No notes match your filters' : 'No notes yet'}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">
              {searchQuery || statusFilter !== 'all' ? 'Try different search terms or filters' : 'Create your first note to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openAccountDialog', {
                      detail: { dialogId: 'addNote', accountId }
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
          noteDetail={noteDetail}
          isLoading={detailLoading}
          onClose={() => setSelectedNote(null)}
          onTogglePin={handleTogglePin}
          onDelete={handleDelete}
          onUpdate={(id, data) => updateMutation.mutate({
            id,
            title: data.title,
            content: data.content,
            noteType: data.noteType as 'general' | 'meeting' | 'call' | 'strategy' | 'warning' | 'opportunity' | 'competitive_intel' | 'internal' | 'important' | 'reminder' | undefined,
          })}
          onReply={(parentNoteId, content) => createReplyMutation.mutate({
            entityType: 'account',
            entityId: accountId,
            content,
            parentNoteId,
          })}
          refreshData={refreshData}
          isUpdating={updateMutation.isPending}
          isReplying={createReplyMutation.isPending}
        />
      )}
    </div>
  )
}

// ============================================
// Note Detail Bottom Panel
// ============================================
interface NoteDetailBottomPanelProps {
  note: AccountNote
  noteDetail: unknown
  isLoading: boolean
  onClose: () => void
  onTogglePin: (id: string, isPinned: boolean, e?: React.MouseEvent) => void
  onDelete: (id: string, e?: React.MouseEvent) => void
  onUpdate: (id: string, data: { title?: string; content?: string; noteType?: string }) => void
  onReply: (parentNoteId: string, content: string) => void
  refreshData: () => void
  isUpdating: boolean
  isReplying: boolean
}

function NoteDetailBottomPanel({
  note,
  noteDetail,
  isLoading,
  onClose,
  onTogglePin,
  onDelete,
  onUpdate,
  onReply,
  isUpdating,
  isReplying,
}: NoteDetailBottomPanelProps) {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editTitle, setEditTitle] = React.useState('')
  const [editContent, setEditContent] = React.useState('')
  const [editNoteType, setEditNoteType] = React.useState('')
  const [replyContent, setReplyContent] = React.useState('')

  // Initialize edit form when dialog opens
  React.useEffect(() => {
    if (editDialogOpen && note) {
      setEditTitle(note.title || '')
      setEditContent(note.content || '')
      setEditNoteType(note.noteType || 'general')
    }
  }, [editDialogOpen, note])

  const handleSaveEdit = () => {
    onUpdate(note.id, {
      title: editTitle || undefined,
      content: editContent,
      noteType: editNoteType,
    })
    setEditDialogOpen(false)
  }

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return
    onReply(note.id, replyContent.trim())
    setReplyContent('')
  }

  const detail = noteDetail as {
    id: string
    title: string | null
    content: string
    noteType: string
    visibility: string
    isPinned: boolean
    isStarred: boolean
    replyCount: number
    tags: string[] | null
    creator: { id: string; full_name: string; avatar_url?: string | null } | null
    replies: Array<{
      id: string
      content: string
      created_at: string
      creator: { id: string; full_name: string; avatar_url?: string | null } | null
    }> | null
    createdAt: string
    updatedAt: string | null
  } | null

  const typeConfig = NOTE_TYPE_CONFIG[note.noteType] || NOTE_TYPE_CONFIG.general
  const TypeIcon = typeConfig.icon
  const visibilityConfig = VISIBILITY_CONFIG[note.visibility] || VISIBILITY_CONFIG.team
  const VisibilityIcon = visibilityConfig.icon

  return (
    <div
      className="relative rounded-2xl border border-charcoal-200/40 bg-gradient-to-br from-white via-white to-cream/30 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden"
      style={{
        animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Decorative top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500" />

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
            <div className={cn(
              "absolute inset-0 rounded-2xl blur-xl opacity-40",
              note.isPinned ? 'bg-gold-400' : 'bg-charcoal-400'
            )} />
            <div className={cn(
              "relative w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg ring-4 ring-white/80",
              typeConfig.gradient
            )}>
              <TypeIcon className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-charcoal-900 tracking-tight">
                {note.title || 'Untitled Note'}
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold border-0 shadow-sm",
                    typeConfig.color,
                    `bg-${typeConfig.color.replace('text-', '')}/10`
                  )}
                >
                  {typeConfig.label}
                </Badge>
                {note.isPinned && (
                  <Badge
                    variant="outline"
                    className="text-xs font-semibold border-0 shadow-sm bg-gold-50 text-gold-700"
                  >
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-500">
              <span className="flex items-center gap-1.5">
                <VisibilityIcon className="h-3.5 w-3.5" />
                {visibilityConfig.label}
              </span>
              {note.creator && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  by {note.creator.full_name}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
          </div>
        ) : (
          <>
            {/* Note Content */}
            <div
              className="mb-8"
              style={{ animation: 'fadeInUp 0.5s ease-out 0.1s forwards', opacity: 0 }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center shadow-sm ring-1 ring-charcoal-200/50">
                  <FileText className="h-4 w-4 text-charcoal-600" />
                </div>
                <h4 className="text-sm font-bold text-charcoal-800 tracking-wide uppercase">Content</h4>
              </div>
              <div className="relative rounded-2xl border border-charcoal-100/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal-50/40 via-white to-transparent" />
                <div className="relative p-6 max-h-[300px] overflow-y-auto">
                  <p className="text-sm text-charcoal-700 whitespace-pre-wrap leading-[1.8]">
                    {detail?.content || note.content}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {detail?.tags && detail.tags.length > 0 && (
              <div
                className="mb-8"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.15s forwards', opacity: 0 }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-sm ring-1 ring-blue-200/50">
                    <Tag className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-bold text-charcoal-800 tracking-wide uppercase">Tags</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {detail.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-charcoal-50">
                      <Hash className="h-3 w-3 mr-1 text-charcoal-400" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Replies Section - Always show to allow adding replies */}
            <div
              className="mb-8"
              style={{ animation: 'fadeInUp 0.5s ease-out 0.2s forwards', opacity: 0 }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center shadow-sm ring-1 ring-amber-200/50">
                  <Reply className="h-4 w-4 text-amber-600" />
                </div>
                <h4 className="text-sm font-bold text-charcoal-800 tracking-wide uppercase">Replies</h4>
                {detail?.replies && detail.replies.length > 0 && (
                  <span className="text-xs bg-charcoal-100 text-charcoal-600 px-2 py-0.5 rounded-full">
                    {detail.replies.length}
                  </span>
                )}
              </div>

              {/* Existing Replies */}
              {detail?.replies && detail.replies.length > 0 && (
                <div className="space-y-3 mb-4">
                  {detail.replies.map((reply) => (
                    <div key={reply.id} className="relative rounded-xl border border-charcoal-100/50 p-4 bg-white">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={reply.creator?.avatar_url || undefined} />
                          <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-[10px] font-semibold">
                            {reply.creator?.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-charcoal-800">
                              {reply.creator?.full_name || 'Unknown'}
                            </span>
                            <span className="text-xs text-charcoal-400">
                              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-charcoal-600 whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Reply Input */}
              <div className="relative rounded-xl border border-charcoal-200/60 bg-white overflow-hidden">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px] border-0 focus:ring-0 resize-none"
                />
                <div className="flex items-center justify-between px-3 py-2 bg-charcoal-50/50 border-t border-charcoal-100">
                  <span className="text-xs text-charcoal-400">
                    {replyContent.length > 0 ? `${replyContent.length} characters` : 'Add a comment or follow-up'}
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim() || isReplying}
                    className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900"
                  >
                    {isReplying ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Reply className="h-3.5 w-3.5 mr-1.5" />
                        Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div
              className="grid grid-cols-3 gap-8 mb-8"
              style={{ animation: 'fadeInUp 0.5s ease-out 0.25s forwards', opacity: 0 }}
            >
              {/* Note Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gold-500" />
                  <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Note Details</h4>
                </div>
                <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
                  <DetailRow label="Type" value={typeConfig.label} />
                  <DetailRow label="Visibility" value={visibilityConfig.label} />
                  <DetailRow label="Replies" value={String(detail?.replies?.length ?? note.replyCount)} isLast />
                </div>
              </div>

              {/* Author */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-500" />
                  <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Author</h4>
                </div>
                <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
                  <DetailRow label="Created By" value={note.creator?.full_name || 'Unknown'} isLast />
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Timeline</h4>
                </div>
                <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
                  <DetailRow label="Created" value={format(new Date(note.createdAt), 'MMM d, yyyy')} />
                  <DetailRow label="Updated" value={note.updatedAt ? format(new Date(note.updatedAt), 'MMM d, yyyy') : null} isLast />
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div
              className="pt-6 border-t border-charcoal-100/40 flex items-center justify-center gap-3"
              style={{ animation: 'fadeInUp 0.5s ease-out 0.3s forwards', opacity: 0 }}
            >
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit3 className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => onTogglePin(note.id, note.isPinned)}
              >
                <Pin className="h-4 w-4 mr-1.5" />
                {note.isPinned ? 'Unpin' : 'Pin Note'}
              </Button>
              <Button
                variant="outline"
                className="text-error-600 hover:text-error-700 hover:bg-error-50"
                onClick={() => onDelete(note.id)}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Edit Note Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-gold-500" />
              Edit Note
            </DialogTitle>
            <DialogDescription>
              Make changes to this note. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="noteTitle">Title (optional)</Label>
              <Input
                id="noteTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Give your note a title..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="noteType">Note Type</Label>
              <Select value={editNoteType} onValueChange={setEditNoteType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select note type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="strategy">Strategy</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="opportunity">Opportunity</SelectItem>
                  <SelectItem value="competitive_intel">Competitive Intel</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="noteContent">Content</Label>
              <Textarea
                id="noteContent"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write your note content..."
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editContent.trim() || isUpdating}
              className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

// ============================================
// Helper Components
// ============================================
function DetailRow({
  label,
  value,
  isLast = false
}: {
  label: string
  value: string | null | undefined
  isLast?: boolean
}) {
  const hasValue = value && value !== '—'

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3 bg-white",
      !isLast && "border-b border-charcoal-50"
    )}>
      <span className="text-xs font-medium text-charcoal-400">{label}</span>
      {hasValue ? (
        <span className="text-sm font-semibold text-charcoal-800">
          {value}
        </span>
      ) : (
        <span className="text-[11px] text-charcoal-300 font-medium">
          —
        </span>
      )}
    </div>
  )
}

export default AccountNotesSection
