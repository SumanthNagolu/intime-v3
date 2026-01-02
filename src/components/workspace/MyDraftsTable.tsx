'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  FileText,
  Building2,
  Briefcase,
  User,
  Play,
  Trash2,
  Clock,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import type { DraftItem, EntityType } from '@/server/routers/drafts'

// Map entity types to icons and colors
const entityTypeConfig: Record<EntityType, { icon: typeof FileText; color: string; label: string }> = {
  account: { icon: Building2, color: 'bg-blue-100 text-blue-800', label: 'Account' },
  job: { icon: Briefcase, color: 'bg-green-100 text-green-800', label: 'Job' },
  contact: { icon: User, color: 'bg-purple-100 text-purple-800', label: 'Contact' },
  candidate: { icon: User, color: 'bg-orange-100 text-orange-800', label: 'Candidate' },
  submission: { icon: FileText, color: 'bg-yellow-100 text-yellow-800', label: 'Submission' },
  placement: { icon: FileText, color: 'bg-teal-100 text-teal-800', label: 'Placement' },
  vendor: { icon: Building2, color: 'bg-indigo-100 text-indigo-800', label: 'Vendor' },
  contract: { icon: FileText, color: 'bg-gray-100 text-gray-800', label: 'Contract' },
}

interface MyDraftsTableProps {
  className?: string
}

export function MyDraftsTable({ className }: MyDraftsTableProps) {
  const router = useRouter()
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const utils = trpc.useUtils()

  // Fetch drafts
  const { data: drafts, isLoading, error } = trpc.drafts.list.useQuery({})

  // Delete mutation
  const deleteMutation = trpc.drafts.delete.useMutation({
    onSuccess: () => {
      utils.drafts.list.invalidate()
      utils.drafts.counts.invalidate()
      setDeletingId(null)
    },
    onError: () => {
      setDeletingId(null)
    },
  })

  // Filter drafts by entity type
  const filteredDrafts = useMemo(() => {
    if (!drafts) return []
    if (entityFilter === 'all') return drafts
    return drafts.filter((d) => d.entityType === entityFilter)
  }, [drafts, entityFilter])

  // Get unique entity types for filter
  const entityTypes = useMemo(() => {
    if (!drafts) return []
    const types = new Set(drafts.map((d) => d.entityType))
    return Array.from(types) as EntityType[]
  }, [drafts])

  const handleResume = (draft: DraftItem) => {
    router.push(`${draft.wizardRoute}?resume=${draft.id}`)
  }

  const handleDelete = async (draftId: string) => {
    setDeletingId(draftId)
    await deleteMutation.mutateAsync({ id: draftId })
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('border-charcoal-200', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600" />
              Drafts
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('border-charcoal-200', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-600" />
            Drafts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-charcoal-500">
            Failed to load drafts. Please try again.
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!drafts || drafts.length === 0) {
    return (
      <Card className={cn('border-charcoal-200', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-600" />
            Drafts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-charcoal-400" />
            </div>
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">No saved drafts</h3>
            <p className="text-charcoal-500 max-w-sm mx-auto">
              When you start creating accounts, jobs, or candidates and navigate away,
              your progress will be automatically saved here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('border-charcoal-200', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-600" />
            Drafts
            <Badge variant="secondary" className="ml-2">
              {drafts.length}
            </Badge>
          </CardTitle>
          {entityTypes.length > 1 && (
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {entityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {entityTypeConfig[type]?.label || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-charcoal-50">
                <TableHead className="w-32">Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-32">Progress</TableHead>
                <TableHead className="w-40">Last Updated</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrafts.map((draft) => {
                const config = entityTypeConfig[draft.entityType]
                const Icon = config?.icon || FileText

                return (
                  <TableRow
                    key={draft.id}
                    className="cursor-pointer hover:bg-charcoal-50/50"
                    onClick={() => handleResume(draft)}
                  >
                    <TableCell>
                      <Badge className={cn('gap-1', config?.color)}>
                        <Icon className="w-3 h-3" />
                        {config?.label || draft.entityType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {draft.displayName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-charcoal-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold-500 rounded-full transition-all"
                            style={{
                              width: `${(draft.currentStep / draft.totalSteps) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-charcoal-500">
                          {draft.currentStep}/{draft.totalSteps}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-charcoal-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(draft.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleResume(draft)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Resume
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={deletingId === draft.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Draft?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{draft.displayName}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(draft.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

