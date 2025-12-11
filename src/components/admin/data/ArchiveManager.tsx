'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Archive,
  RotateCcw,
  Trash2,
  MoreVertical,
  Search,
  Loader2,
  AlertTriangle,
  Calendar,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export function ArchiveManager() {
  const [entityType, setEntityType] = useState('candidates')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [page, setPage] = useState(1)

  const utils = trpc.useUtils()

  const limit = 20
  const { data: entities } = trpc.data.getExportableEntities.useQuery()
  const { data: archivedData, isLoading } = trpc.data.listArchivedRecords.useQuery({
    entityType,
    offset: (page - 1) * limit,
    limit,
  })

  const restoreMutation = trpc.data.restoreArchivedRecord.useMutation({
    onSuccess: () => {
      utils.data.listArchivedRecords.invalidate()
      utils.data.getDashboardStats.invalidate()
      setShowRestoreDialog(false)
      setSelectedRecord(null)
    },
  })

  const deleteMutation = trpc.data.permanentlyDelete.useMutation({
    onSuccess: () => {
      utils.data.listArchivedRecords.invalidate()
      utils.data.getDashboardStats.invalidate()
      setShowDeleteDialog(false)
      setSelectedRecord(null)
    },
  })

  const handleRestore = () => {
    if (!selectedRecord) return
    restoreMutation.mutate({ id: selectedRecord })
  }

  const handlePermanentDelete = () => {
    if (!selectedRecord) return
    deleteMutation.mutate({ id: selectedRecord })
  }

  const getEntityLabel = (type: string) => {
    return entities?.find(e => e.name === type)?.displayName || type
  }

  const getArchiveReasonBadge = (reason: string) => {
    switch (reason) {
      case 'gdpr_request':
        return <Badge variant="destructive">GDPR Request</Badge>
      case 'retention_policy':
        return <Badge className="bg-blue-100 text-blue-800">Retention Policy</Badge>
      case 'manual':
        return <Badge variant="secondary">Manual</Badge>
      case 'bulk_operation':
        return <Badge className="bg-purple-100 text-purple-800">Bulk Operation</Badge>
      default:
        return <Badge variant="outline">{reason}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Archived Records</CardTitle>
              <CardDescription>View and manage archived data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Entity Type</Label>
              <Select value={entityType} onValueChange={(v) => { setEntityType(v); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {entities?.map((entity) => (
                    <SelectItem key={entity.name} value={entity.name}>
                      {entity.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search archived records..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archived Records Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-charcoal-400" />
            </div>
          ) : archivedData?.records && archivedData.records.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Record Preview</TableHead>
                    <TableHead>Archived Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Archived By</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedData.records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {getEntityLabel(record.entity_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-sm text-charcoal-600 truncate block">
                          {JSON.stringify(record.data).slice(0, 50)}...
                        </span>
                        <span className="text-xs text-charcoal-400 font-mono">
                          {record.original_id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-charcoal-400" />
                          {format(new Date(record.archived_at), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getArchiveReasonBadge(record.archive_reason)}
                      </TableCell>
                      <TableCell>
                        {record.archived_by ? (
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3 text-charcoal-400" />
                            <span className="truncate max-w-[100px]">{record.archived_by}</span>
                          </div>
                        ) : (
                          <span className="text-charcoal-400 text-sm">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.retention_until ? (
                          <span className="text-sm">
                            {format(new Date(record.retention_until), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-charcoal-400 text-sm">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRecord(record.id)
                                setShowRestoreDialog(true)
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restore
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRecord(record.id)
                                setShowDeleteDialog(true)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {archivedData.total > limit && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <span className="text-sm text-charcoal-500">
                    Page {page} of {Math.ceil(archivedData.total / limit)} ({archivedData.total} records)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(Math.ceil(archivedData.total / limit), p + 1))}
                      disabled={page === Math.ceil(archivedData.total / limit)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Archive className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
              <p className="text-charcoal-500">No archived records found</p>
              <p className="text-sm text-charcoal-400">
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'Records that are archived will appear here'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Record</DialogTitle>
            <DialogDescription>
              This will restore the archived record back to its original location.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-charcoal-600">
              The record will be unarchived and become active again. Any related data
              that was archived together will also be restored.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRestore}
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Restore Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Delete Record</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The record will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Warning: Permanent Deletion</p>
                  <p className="text-sm text-red-700 mt-1">
                    This will permanently delete the record and all associated data.
                    This action is irreversible and the data cannot be recovered.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePermanentDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
