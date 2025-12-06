'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { trpc } from '@/lib/trpc/client'
import { format, subDays } from 'date-fns'
import {
  Download,
  Loader2,
  FileSpreadsheet,
  FileJson,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface ExportAuditLogsDialogProps {
  open: boolean
  onClose: () => void
}

export function ExportAuditLogsDialog({ open, onClose }: ExportAuditLogsDialogProps) {
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'))
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [includeUserDetails, setIncludeUserDetails] = useState(true)
  const [includeChangeDetails, setIncludeChangeDetails] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<{ filename: string; recordCount: number } | null>(null)

  const exportMutation = trpc.audit.export.useMutation({
    onSuccess: (data) => {
      // Create blob and download
      const blob = new Blob([data.data], { type: data.contentType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportResult({ filename: data.filename, recordCount: data.recordCount })
      toast.success(`Exported ${data.recordCount.toLocaleString()} audit log entries`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to export audit logs')
    },
    onSettled: () => {
      setIsExporting(false)
    },
  })

  const handleExport = () => {
    setIsExporting(true)
    setExportResult(null)
    exportMutation.mutate({
      dateFrom: new Date(dateFrom).toISOString(),
      dateTo: new Date(dateTo + 'T23:59:59').toISOString(),
      format: exportFormat,
      includeUserDetails,
      includeChangeDetails,
    })
  }

  const handleClose = () => {
    setExportResult(null)
    onClose()
  }

  const setQuickRange = (days: number) => {
    setDateFrom(format(subDays(new Date(), days), 'yyyy-MM-dd'))
    setDateTo(format(new Date(), 'yyyy-MM-dd'))
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-charcoal-400" />
            Export Audit Logs
          </DialogTitle>
          <DialogDescription>
            Export audit log entries to CSV or JSON format
          </DialogDescription>
        </DialogHeader>

        {exportResult ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
            <p className="text-lg font-medium text-charcoal-900">Export Complete</p>
            <p className="text-sm text-charcoal-600 mt-1">
              {exportResult.recordCount.toLocaleString()} entries exported to {exportResult.filename}
            </p>
            <Button className="mt-6" onClick={handleClose}>
              Close
            </Button>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 py-4 pr-4">
              {/* Date Range */}
              <div>
                <Label className="text-sm font-medium">Date Range</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <Label className="text-xs text-charcoal-500">From</Label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-charcoal-500">To</Label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => setQuickRange(1)}>Today</Button>
                  <Button variant="ghost" size="sm" onClick={() => setQuickRange(7)}>Last 7 days</Button>
                  <Button variant="ghost" size="sm" onClick={() => setQuickRange(30)}>Last 30 days</Button>
                </div>
              </div>

              {/* Format */}
              <div>
                <Label className="text-sm font-medium">Export Format</Label>
                <RadioGroup
                  className="mt-2 space-y-2"
                  value={exportFormat}
                  onValueChange={(v) => setExportFormat(v as 'csv' | 'json')}
                >
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-charcoal-50 transition-colors">
                    <RadioGroupItem value="csv" />
                    <FileSpreadsheet className="w-5 h-5 text-charcoal-500" />
                    <div>
                      <p className="font-medium">CSV</p>
                      <p className="text-xs text-charcoal-500">Spreadsheet compatible format</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-charcoal-50 transition-colors">
                    <RadioGroupItem value="json" />
                    <FileJson className="w-5 h-5 text-charcoal-500" />
                    <div>
                      <p className="font-medium">JSON</p>
                      <p className="text-xs text-charcoal-500">Machine readable format with nested data</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Options */}
              <div>
                <Label className="text-sm font-medium">Include Options</Label>
                <div className="mt-2 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={includeUserDetails}
                      onCheckedChange={(checked) => setIncludeUserDetails(checked === true)}
                    />
                    <div>
                      <p className="text-sm font-medium">User details</p>
                      <p className="text-xs text-charcoal-500">Email, role, IP address, user agent</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={includeChangeDetails}
                      onCheckedChange={(checked) => setIncludeChangeDetails(checked === true)}
                    />
                    <div>
                      <p className="text-sm font-medium">Change details</p>
                      <p className="text-xs text-charcoal-500">Before/after values for data changes</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        {!exportResult && (
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting || !dateFrom || !dateTo}>
              {isExporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
