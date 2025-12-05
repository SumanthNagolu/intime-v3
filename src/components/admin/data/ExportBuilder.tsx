'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Download, Loader2, Check, X, FileSpreadsheet, FileJson } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExportBuilderProps {
  open: boolean
  onClose: () => void
}

export function ExportBuilder({ open, onClose }: ExportBuilderProps) {
  const [entityType, setEntityType] = useState('')
  const [exportName, setExportName] = useState('')
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [format, setFormat] = useState<'csv' | 'excel' | 'json'>('csv')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [exportJob, setExportJob] = useState<{
    id: string
    status: string
    record_count: number
  } | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const utils = trpc.useUtils()

  const { data: entities } = trpc.data.getExportableEntities.useQuery()

  const exportMutation = trpc.data.createExportJob.useMutation({
    onSuccess: (data) => {
      setExportJob(data)
      utils.data.listExportJobs.invalidate()
      utils.data.getDashboardStats.invalidate()
    },
  })

  const { data: downloadData, refetch: fetchDownloadUrl } = trpc.data.getExportDownloadUrl.useQuery(
    { id: exportJob?.id || '' },
    { enabled: false }
  )

  const selectedEntity = entities?.find(e => e.name === entityType)

  // Auto-select all columns when entity changes
  useEffect(() => {
    if (selectedEntity) {
      setSelectedColumns(selectedEntity.fields.map(f => f.name))
      setExportName(`${selectedEntity.displayName} Export`)
    } else {
      setSelectedColumns([])
    }
  }, [selectedEntity])

  // Fetch download URL when export completes
  useEffect(() => {
    if (exportJob?.status === 'completed') {
      fetchDownloadUrl().then(result => {
        if (result.data?.url) {
          setDownloadUrl(result.data.url)
        }
      })
    }
  }, [exportJob?.status, fetchDownloadUrl])

  const handleExport = () => {
    if (!entityType || selectedColumns.length === 0) return

    exportMutation.mutate({
      entityType,
      exportName,
      columns: selectedColumns,
      format,
      filters,
      includeHeaders: true,
    })
  }

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
    }
  }

  const handleClose = () => {
    setEntityType('')
    setExportName('')
    setSelectedColumns([])
    setFormat('csv')
    setFilters({})
    setExportJob(null)
    setDownloadUrl(null)
    onClose()
  }

  const toggleColumn = (columnName: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnName)
        ? prev.filter(c => c !== columnName)
        : [...prev, columnName]
    )
  }

  const selectAllColumns = () => {
    if (selectedEntity) {
      setSelectedColumns(selectedEntity.fields.map(f => f.name))
    }
  }

  const deselectAllColumns = () => {
    setSelectedColumns([])
  }

  const isLoading = exportMutation.isPending

  return (
    <Dialog open={open} onOpenChange={() => handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Export records to CSV, Excel, or JSON format
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {!exportJob ? (
            <div className="space-y-6">
              {/* Entity Selection */}
              <div>
                <Label>Entity</Label>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select what to export" />
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
                <>
                  {/* Export Name */}
                  <div>
                    <Label>Export Name</Label>
                    <Input
                      className="mt-1"
                      value={exportName}
                      onChange={(e) => setExportName(e.target.value)}
                      placeholder="Enter a name for this export"
                    />
                  </div>

                  {/* Filters */}
                  <div>
                    <Label>Filters (Optional)</Label>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-charcoal-500">Date From</Label>
                        <Input
                          type="date"
                          value={filters.date_from || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-charcoal-500">Date To</Label>
                        <Input
                          type="date"
                          value={filters.date_to || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-charcoal-500">Status</Label>
                        <Input
                          placeholder="Any status"
                          value={filters.status || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Columns to Include</Label>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={selectAllColumns}>
                          Select All
                        </Button>
                        <Button variant="ghost" size="sm" onClick={deselectAllColumns}>
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedEntity.fields.map((field) => (
                          <label
                            key={field.name}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedColumns.includes(field.name)}
                              onCheckedChange={() => toggleColumn(field.name)}
                            />
                            <span className="text-sm">{field.displayName}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-charcoal-500 mt-1">
                      {selectedColumns.length} of {selectedEntity.fields.length} columns selected
                    </p>
                  </div>

                  {/* Format Selection */}
                  <div>
                    <Label>Format</Label>
                    <RadioGroup
                      className="flex gap-4 mt-2"
                      value={format}
                      onValueChange={(value) => setFormat(value as 'csv' | 'excel' | 'json')}
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <RadioGroupItem value="csv" />
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>CSV</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <RadioGroupItem value="excel" />
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Excel</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <RadioGroupItem value="json" />
                        <FileJson className="h-4 w-4" />
                        <span>JSON</span>
                      </label>
                    </RadioGroup>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              {exportJob.status === 'processing' || exportJob.status === 'pending' ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-gold-500 mx-auto mb-4" />
                  <p className="font-medium text-charcoal-700">Generating export...</p>
                  <p className="text-sm text-charcoal-500">This may take a moment</p>
                </>
              ) : exportJob.status === 'completed' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-900 mb-2">
                    Export Complete!
                  </h3>
                  <p className="text-charcoal-600 mb-4">
                    {exportJob.record_count} records exported
                  </p>
                  {downloadUrl && (
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <X className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-900 mb-2">
                    Export Failed
                  </h3>
                  <p className="text-charcoal-600">
                    Please try again
                  </p>
                </>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          {exportJob ? (
            <Button onClick={handleClose}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={!entityType || selectedColumns.length === 0 || isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
