'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Search,
  Copy,
  Merge,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function DuplicatesManager() {
  const [entityType, setEntityType] = useState('candidates')
  const [selectedDuplicate, setSelectedDuplicate] = useState<string | null>(null)
  const [keepRecordId, setKeepRecordId] = useState<string | null>(null)
  const [showMergeDialog, setShowMergeDialog] = useState(false)

  const utils = trpc.useUtils()

  const { data: entities } = trpc.data.getExportableEntities.useQuery()
  const { data: duplicates, isLoading } = trpc.data.listDuplicates.useQuery({
    entityType,
    status: 'pending',
    limit: 50,
  })

  const { data: duplicateDetails, isLoading: detailsLoading } = trpc.data.getDuplicateRecords.useQuery(
    { duplicateId: selectedDuplicate || '' },
    { enabled: !!selectedDuplicate }
  )

  const detectMutation = trpc.data.detectDuplicates.useMutation({
    onSuccess: () => {
      utils.data.listDuplicates.invalidate()
      utils.data.getDashboardStats.invalidate()
    },
  })

  const mergeMutation = trpc.data.mergeDuplicates.useMutation({
    onSuccess: () => {
      utils.data.listDuplicates.invalidate()
      utils.data.getDashboardStats.invalidate()
      setSelectedDuplicate(null)
      setShowMergeDialog(false)
    },
  })

  const dismissMutation = trpc.data.dismissDuplicate.useMutation({
    onSuccess: () => {
      utils.data.listDuplicates.invalidate()
      utils.data.getDashboardStats.invalidate()
      setSelectedDuplicate(null)
    },
  })

  const handleDetect = () => {
    detectMutation.mutate({ entityType })
  }

  const handleMerge = () => {
    if (!selectedDuplicate || !keepRecordId || !duplicateDetails) return

    const mergeRecordId = duplicateDetails.duplicate.record_id_1 === keepRecordId
      ? duplicateDetails.duplicate.record_id_2
      : duplicateDetails.duplicate.record_id_1

    mergeMutation.mutate({
      duplicateId: selectedDuplicate,
      keepRecordId,
      mergeRecordId,
    })
  }

  const handleDismiss = (duplicateId: string) => {
    dismissMutation.mutate({
      duplicateId,
      reason: 'Not a duplicate',
    })
  }

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.9) {
      return <Badge variant="destructive">High ({Math.round(score * 100)}%)</Badge>
    } else if (score >= 0.7) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium ({Math.round(score * 100)}%)</Badge>
    } else {
      return <Badge variant="secondary">Low ({Math.round(score * 100)}%)</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Duplicate Detection</CardTitle>
              <CardDescription>Find and merge duplicate records</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger className="w-[180px]">
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
              <Button onClick={handleDetect} disabled={detectMutation.isPending}>
                {detectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Detect Duplicates
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Duplicates List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: List */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base">
              Pending Review ({duplicates?.total || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-charcoal-400" />
              </div>
            ) : duplicates?.duplicates && duplicates.duplicates.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {duplicates.duplicates.map((dup) => (
                    <div
                      key={dup.id}
                      onClick={() => setSelectedDuplicate(dup.id)}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-colors',
                        selectedDuplicate === dup.id
                          ? 'border-gold-500 bg-gold-50'
                          : 'border-charcoal-200 hover:border-charcoal-300'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Copy className="h-4 w-4 text-charcoal-400" />
                          <span className="text-sm font-mono text-charcoal-600">
                            {dup.record_id_1.slice(0, 8)}...
                          </span>
                          <span className="text-charcoal-400">&</span>
                          <span className="text-sm font-mono text-charcoal-600">
                            {dup.record_id_2.slice(0, 8)}...
                          </span>
                        </div>
                        {getConfidenceBadge(dup.confidence_score)}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {dup.match_fields.map((field: string) => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <Copy className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
                <p className="text-charcoal-500">No duplicates found</p>
                <p className="text-sm text-charcoal-400">
                  Click "Detect Duplicates" to scan for matches
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Detail */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base">Record Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDuplicate ? (
              <div className="text-center py-8 text-charcoal-500">
                Select a duplicate pair to compare
              </div>
            ) : detailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-charcoal-400" />
              </div>
            ) : duplicateDetails ? (
              <div className="space-y-4">
                {/* Comparison Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-charcoal-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Field</th>
                        <th className="px-3 py-2 text-left font-medium">Record 1</th>
                        <th className="px-3 py-2 text-left font-medium">Record 2</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {duplicateDetails.entityConfig.fields.slice(0, 10).map((field: { name: string; dbColumn: string; displayName: string }) => {
                        const val1 = duplicateDetails.records[0]?.[field.dbColumn]
                        const val2 = duplicateDetails.records[1]?.[field.dbColumn]
                        const isDifferent = String(val1 || '') !== String(val2 || '')
                        const isMatch = duplicateDetails.duplicate.match_fields.includes(field.name)

                        return (
                          <tr
                            key={field.name}
                            className={cn(isMatch && 'bg-yellow-50')}
                          >
                            <td className="px-3 py-2 font-medium text-charcoal-600">
                              {field.displayName}
                              {isMatch && (
                                <Badge variant="outline" className="ml-1 text-xs">match</Badge>
                              )}
                            </td>
                            <td className={cn(
                              'px-3 py-2',
                              isDifferent && 'text-charcoal-900 font-medium'
                            )}>
                              {String(val1 || '-')}
                            </td>
                            <td className={cn(
                              'px-3 py-2',
                              isDifferent && 'text-charcoal-900 font-medium'
                            )}>
                              {String(val2 || '-')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDismiss(selectedDuplicate)}
                    disabled={dismissMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Not a Duplicate
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setShowMergeDialog(true)}
                  >
                    <Merge className="h-4 w-4 mr-2" />
                    Merge Records
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Merge Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge Records</DialogTitle>
            <DialogDescription>
              Select which record to keep. The other will be merged into it and deleted.
            </DialogDescription>
          </DialogHeader>

          {duplicateDetails && (
            <div className="py-4">
              <Label className="mb-3 block">Keep this record:</Label>
              <RadioGroup
                value={keepRecordId || ''}
                onValueChange={setKeepRecordId}
              >
                {duplicateDetails.records.map((record, i) => (
                  <label
                    key={record.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      keepRecordId === record.id
                        ? 'border-gold-500 bg-gold-50'
                        : 'border-charcoal-200 hover:border-charcoal-300'
                    )}
                  >
                    <RadioGroupItem value={record.id} className="mt-1" />
                    <div>
                      <p className="font-medium">
                        {record.first_name} {record.last_name}
                      </p>
                      <p className="text-sm text-charcoal-600">{record.email}</p>
                      <p className="text-xs text-charcoal-400 mt-1">
                        ID: {record.id}
                      </p>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Warning</p>
                    <p className="text-yellow-700">
                      The non-selected record will be permanently deleted.
                      Any missing fields will be filled from the deleted record.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMerge}
              disabled={!keepRecordId || mergeMutation.isPending}
            >
              {mergeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Merge Records
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
