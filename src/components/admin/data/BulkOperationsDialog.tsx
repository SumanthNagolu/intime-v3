'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulkOperationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operationType: 'update' | 'delete'
  onSuccess?: () => void
}

interface FieldUpdate {
  field: string
  value: string
}

export function BulkOperationsDialog({
  open,
  onOpenChange,
  operationType,
  onSuccess,
}: BulkOperationsDialogProps) {
  const [step, setStep] = useState(1)
  const [entityType, setEntityType] = useState('')
  const [recordIds, setRecordIds] = useState('')
  const [selectionMethod, setSelectionMethod] = useState<'ids' | 'filter'>('ids')
  const [filterField, setFilterField] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [fieldUpdates, setFieldUpdates] = useState<FieldUpdate[]>([{ field: '', value: '' }])
  const [archiveInstead, setArchiveInstead] = useState(true)
  const [confirmText, setConfirmText] = useState('')
  const [result, setResult] = useState<{ processed: number; failed: number } | null>(null)

  const utils = trpc.useUtils()

  const { data: entities } = trpc.data.getExportableEntities.useQuery()
  const selectedEntity = entities?.find(e => e.name === entityType)

  const bulkUpdateMutation = trpc.data.bulkUpdate.useMutation({
    onSuccess: (data) => {
      setResult(data)
      setStep(4)
      utils.data.getDashboardStats.invalidate()
      onSuccess?.()
    },
  })

  const bulkDeleteMutation = trpc.data.bulkDelete.useMutation({
    onSuccess: (data) => {
      setResult(data)
      setStep(4)
      utils.data.getDashboardStats.invalidate()
      utils.data.listArchivedRecords.invalidate()
      onSuccess?.()
    },
  })

  const isPending = bulkUpdateMutation.isPending || bulkDeleteMutation.isPending

  const handleClose = () => {
    setStep(1)
    setEntityType('')
    setRecordIds('')
    setSelectionMethod('ids')
    setFilterField('')
    setFilterValue('')
    setFieldUpdates([{ field: '', value: '' }])
    setArchiveInstead(true)
    setConfirmText('')
    setResult(null)
    onOpenChange(false)
  }

  const getRecordIdList = (): string[] => {
    if (selectionMethod === 'ids') {
      return recordIds
        .split(/[\n,]/)
        .map(id => id.trim())
        .filter(id => id.length > 0)
    }
    // For filter method, we'd need a separate query - simplified for MVP
    return []
  }

  const handleExecute = () => {
    const ids = getRecordIdList()
    if (ids.length === 0) return

    if (operationType === 'update') {
      const updates: Record<string, unknown> = {}
      fieldUpdates.forEach(fu => {
        if (fu.field && fu.value !== undefined) {
          updates[fu.field] = fu.value
        }
      })

      bulkUpdateMutation.mutate({
        entityType,
        recordIds: ids,
        updates,
      })
    } else {
      bulkDeleteMutation.mutate({
        entityType,
        recordIds: ids,
        archive: archiveInstead,
      })
    }
  }

  const addFieldUpdate = () => {
    setFieldUpdates([...fieldUpdates, { field: '', value: '' }])
  }

  const removeFieldUpdate = (index: number) => {
    setFieldUpdates(fieldUpdates.filter((_, i) => i !== index))
  }

  const updateFieldUpdate = (index: number, key: 'field' | 'value', value: string) => {
    const updated = [...fieldUpdates]
    updated[index][key] = value
    setFieldUpdates(updated)
  }

  const recordCount = getRecordIdList().length

  const canProceedStep1 = entityType !== ''
  const canProceedStep2 = recordCount > 0
  const canProceedStep3 = operationType === 'delete' || fieldUpdates.some(f => f.field && f.value)
  const canExecute = confirmText === (operationType === 'delete' ? 'DELETE' : 'UPDATE')

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {operationType === 'update' ? 'Bulk Update Records' : 'Bulk Delete Records'}
          </DialogTitle>
          <DialogDescription>
            {operationType === 'update'
              ? 'Update multiple records at once'
              : 'Delete or archive multiple records at once'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step >= s
                    ? 'bg-hublot-900 text-white'
                    : 'bg-charcoal-100 text-charcoal-400'
                )}
              >
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <ArrowRight className="h-4 w-4 mx-2 text-charcoal-300" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Entity */}
        {step === 1 && (
          <div className="space-y-4 py-4">
            <div>
              <Label>Select Entity Type</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose an entity..." />
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

            {selectedEntity && (
              <div className="p-3 bg-charcoal-50 rounded-lg">
                <p className="text-sm font-medium">{selectedEntity.displayName}</p>
                <p className="text-xs text-charcoal-500 mt-1">
                  {selectedEntity.fields.length} fields available
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Records */}
        {step === 2 && (
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Selection Method</Label>
              <RadioGroup
                value={selectionMethod}
                onValueChange={(v) => setSelectionMethod(v as 'ids' | 'filter')}
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="ids" />
                  <span>Enter Record IDs</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-charcoal-400">
                  <RadioGroupItem value="filter" disabled />
                  <span>Use Filter (Coming Soon)</span>
                </label>
              </RadioGroup>
            </div>

            {selectionMethod === 'ids' && (
              <div>
                <Label>Record IDs</Label>
                <Textarea
                  placeholder="Enter record IDs, one per line or comma-separated..."
                  value={recordIds}
                  onChange={(e) => setRecordIds(e.target.value)}
                  className="mt-1 h-32 font-mono text-sm"
                />
                <p className="text-sm text-charcoal-500 mt-1">
                  {recordCount} record{recordCount !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            {selectionMethod === 'filter' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Filter Field</Label>
                  <Select value={filterField} onValueChange={setFilterField}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select field..." />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedEntity?.fields.map((field) => (
                        <SelectItem key={field.name} value={field.name}>
                          {field.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Filter Value</Label>
                  <Input
                    placeholder="Enter value..."
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Configure Operation */}
        {step === 3 && (
          <div className="space-y-4 py-4">
            {operationType === 'update' ? (
              <>
                <Label className="mb-2 block">Fields to Update</Label>
                <div className="space-y-3">
                  {fieldUpdates.map((fu, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Select
                          value={fu.field}
                          onValueChange={(v) => updateFieldUpdate(index, 'field', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field..." />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedEntity?.fields
                              .filter(f => f.importable)
                              .map((field) => (
                                <SelectItem key={field.name} value={field.dbColumn}>
                                  {field.displayName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="New value..."
                          value={fu.value}
                          onChange={(e) => updateFieldUpdate(index, 'value', e.target.value)}
                        />
                      </div>
                      {fieldUpdates.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFieldUpdate(index)}
                        >
                          <Trash2 className="h-4 w-4 text-charcoal-400" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addFieldUpdate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">
                        You are about to delete {recordCount} record{recordCount !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        This operation affects the {selectedEntity?.displayName} entity.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Checkbox
                    id="archive"
                    checked={archiveInstead}
                    onCheckedChange={(checked) => setArchiveInstead(checked as boolean)}
                  />
                  <div>
                    <label htmlFor="archive" className="font-medium cursor-pointer">
                      Archive instead of permanent delete
                    </label>
                    <p className="text-sm text-charcoal-500">
                      Archived records can be restored later. Recommended for data safety.
                    </p>
                  </div>
                </div>

                {!archiveInstead && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Permanent Deletion</p>
                        <p className="text-sm text-red-700 mt-1">
                          Records will be permanently deleted and cannot be recovered.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Confirmation */}
            <div className="pt-4 border-t">
              <Label>
                Type "{operationType === 'delete' ? 'DELETE' : 'UPDATE'}" to confirm
              </Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder={operationType === 'delete' ? 'DELETE' : 'UPDATE'}
                className="mt-1 font-mono"
              />
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && result && (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Operation Complete
            </h3>
            <div className="flex justify-center gap-4 mb-4">
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                {result.processed} Processed
              </Badge>
              {result.failed > 0 && (
                <Badge variant="destructive">
                  {result.failed} Failed
                </Badge>
              )}
            </div>
            <p className="text-charcoal-500">
              {operationType === 'update'
                ? `Successfully updated ${result.processed} records`
                : archiveInstead
                  ? `Successfully archived ${result.processed} records`
                  : `Successfully deleted ${result.processed} records`}
            </p>
          </div>
        )}

        <DialogFooter>
          {step < 4 && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  onClick={() => setStep(s => s + 1)}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleExecute}
                  disabled={!canExecute || isPending}
                  variant={operationType === 'delete' ? 'destructive' : 'default'}
                >
                  {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {operationType === 'update' ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update {recordCount} Records
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {archiveInstead ? 'Archive' : 'Delete'} {recordCount} Records
                    </>
                  )}
                </Button>
              )}
            </>
          )}
          {step === 4 && (
            <Button onClick={handleClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
