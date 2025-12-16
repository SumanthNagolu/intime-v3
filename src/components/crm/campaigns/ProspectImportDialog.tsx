'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  Loader2,
  ArrowRight,
  HelpCircle,
  Users,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ProspectImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  onSuccess?: () => void
}

// Expected columns for import
const REQUIRED_COLUMNS = ['email']
const OPTIONAL_COLUMNS = [
  'first_name', 'last_name', 'phone', 'linkedin_url', 
  'company_name', 'company_industry', 'company_size', 
  'title', 'location', 'timezone'
]

interface ParsedRow {
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  linkedin_url?: string
  company_name?: string
  company_industry?: string
  company_size?: string
  title?: string
  location?: string
  timezone?: string
  [key: string]: string | undefined
}

interface ColumnMapping {
  [fileColumn: string]: string | null
}

interface ImportStats {
  total: number
  valid: number
  invalid: number
  duplicates: number
}

export function ProspectImportDialog({
  open,
  onOpenChange,
  campaignId,
  onSuccess,
}: ProspectImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [fileHeaders, setFileHeaders] = useState<string[]>([])
  const [parsedData, setParsedData] = useState<ParsedRow[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [importProgress, setImportProgress] = useState(0)
  const [importStats, setImportStats] = useState<ImportStats>({ total: 0, valid: 0, invalid: 0, duplicates: 0 })
  const [errors, setErrors] = useState<string[]>([])

  const utils = trpc.useUtils()

  // Parse CSV content
  const parseCSV = (content: string): { headers: string[]; rows: ParsedRow[] } => {
    const lines = content.split(/\r?\n/).filter(line => line.trim())
    if (lines.length === 0) return { headers: [], rows: [] }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
    
    // Parse rows
    const rows: ParsedRow[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      if (values.length === 0) continue
      
      const row: ParsedRow = {}
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || undefined
      })
      rows.push(row)
    }

    return { headers, rows }
  }

  // Handle CSV line with quotes
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.replace(/^"|"$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.replace(/^"|"$/g, ''))
    
    return result
  }

  // File drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const { headers, rows } = parseCSV(content)
      
      setFileHeaders(headers)
      setParsedData(rows)
      
      // Auto-map columns that match exactly
      const autoMapping: ColumnMapping = {}
      headers.forEach(header => {
        const normalized = header.toLowerCase().replace(/[_\s-]/g, '')
        const allColumns = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]
        
        for (const col of allColumns) {
          const normalizedCol = col.replace(/_/g, '')
          if (normalized === normalizedCol || normalized.includes(normalizedCol) || normalizedCol.includes(normalized)) {
            autoMapping[header] = col
            break
          }
        }
        if (!autoMapping[header]) {
          autoMapping[header] = null
        }
      })
      
      setColumnMapping(autoMapping)
      setStep('mapping')
    }
    reader.readAsText(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  })

  // Map columns and prepare data
  const prepareImportData = () => {
    const mappedData: ParsedRow[] = []
    const validationErrors: string[] = []
    const seen = new Set<string>()
    let duplicates = 0

    parsedData.forEach((row, index) => {
      const mappedRow: ParsedRow = {}
      
      // Apply column mapping
      Object.entries(columnMapping).forEach(([fileCol, targetCol]) => {
        if (targetCol && row[fileCol]) {
          mappedRow[targetCol] = row[fileCol]
        }
      })

      // Validate required fields
      if (!mappedRow.email) {
        validationErrors.push(`Row ${index + 2}: Missing email`)
        return
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(mappedRow.email)) {
        validationErrors.push(`Row ${index + 2}: Invalid email "${mappedRow.email}"`)
        return
      }

      // Check for duplicates
      if (seen.has(mappedRow.email.toLowerCase())) {
        duplicates++
        return
      }
      seen.add(mappedRow.email.toLowerCase())

      mappedData.push(mappedRow)
    })

    setImportStats({
      total: parsedData.length,
      valid: mappedData.length,
      invalid: validationErrors.length,
      duplicates,
    })
    setErrors(validationErrors.slice(0, 10)) // Show first 10 errors
    setParsedData(mappedData)
    setStep('preview')
  }

  // Simulate import (in production, this would call the actual API)
  const executeImport = async () => {
    setStep('importing')
    setImportProgress(0)

    // Simulate batch import
    const batchSize = 50
    const totalBatches = Math.ceil(parsedData.length / batchSize)

    for (let i = 0; i < totalBatches; i++) {
      // In production, call API here
      await new Promise(resolve => setTimeout(resolve, 500))
      setImportProgress(Math.round(((i + 1) / totalBatches) * 100))
    }

    setStep('complete')
    utils.crm.campaigns.getProspects.invalidate({ campaignId })
    onSuccess?.()
  }

  const resetDialog = () => {
    setStep('upload')
    setFile(null)
    setFileHeaders([])
    setParsedData([])
    setColumnMapping({})
    setImportProgress(0)
    setImportStats({ total: 0, valid: 0, invalid: 0, duplicates: 0 })
    setErrors([])
  }

  const handleClose = () => {
    resetDialog()
    onOpenChange(false)
  }

  const downloadTemplate = () => {
    const headers = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].join(',')
    const sampleRow = 'john@example.com,John,Doe,+1234567890,https://linkedin.com/in/johndoe,Acme Corp,Technology,51-200,VP Engineering,San Francisco,America/Los_Angeles'
    const csv = `${headers}\n${sampleRow}`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prospect_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-hublot-600" />
            Import Prospects
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file with prospect data to add to this campaign
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2 py-3 border-b">
          {['Upload', 'Map Columns', 'Preview', 'Import'].map((label, index) => {
            const stepNames: Array<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'> = ['upload', 'mapping', 'preview', 'importing']
            const isActive = step === stepNames[index] || (step === 'complete' && index === 3)
            const isCompleted = stepNames.indexOf(step) > index || step === 'complete'

            return (
              <div key={label} className="flex items-center">
                <div className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
                  isActive && 'bg-hublot-50 text-hublot-700 font-medium',
                  isCompleted && !isActive && 'text-emerald-600'
                )}>
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                    isActive && 'bg-hublot-600 text-white',
                    isCompleted && !isActive && 'bg-emerald-100 text-emerald-600',
                    !isActive && !isCompleted && 'bg-charcoal-100 text-charcoal-500'
                  )}>
                    {isCompleted && !isActive ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  {label}
                </div>
                {index < 3 && (
                  <ArrowRight className="w-4 h-4 mx-2 text-charcoal-300" />
                )}
              </div>
            )
          })}
        </div>

        <div className="flex-1 overflow-auto py-4">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                  isDragActive ? 'border-hublot-500 bg-hublot-50' : 'border-charcoal-200 hover:border-charcoal-300'
                )}
              >
                <input {...getInputProps()} />
                <FileSpreadsheet className={cn(
                  'w-12 h-12 mx-auto mb-4',
                  isDragActive ? 'text-hublot-500' : 'text-charcoal-400'
                )} />
                {isDragActive ? (
                  <p className="text-hublot-700 font-medium">Drop your file here...</p>
                ) : (
                  <>
                    <p className="text-charcoal-700 font-medium mb-1">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-charcoal-500">
                      or click to browse (CSV, XLS, XLSX)
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-charcoal-400" />
                  <div>
                    <p className="text-sm font-medium text-charcoal-700">Need a template?</p>
                    <p className="text-xs text-charcoal-500">Download our template with all supported columns</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium text-charcoal-700 mb-2">Required Column</p>
                <Badge variant="secondary" className="mr-2">email</Badge>
                
                <p className="text-sm font-medium text-charcoal-700 mt-4 mb-2">Optional Columns</p>
                <div className="flex flex-wrap gap-1.5">
                  {OPTIONAL_COLUMNS.map(col => (
                    <Badge key={col} variant="outline" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">{file?.name}</p>
                  <p className="text-sm text-blue-700">{parsedData.length} rows detected</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/2">Your Column</TableHead>
                      <TableHead className="w-1/2">Maps To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fileHeaders.map((header) => (
                      <TableRow key={header}>
                        <TableCell className="font-medium">{header}</TableCell>
                        <TableCell>
                          <Select
                            value={columnMapping[header] || 'skip'}
                            onValueChange={(value) => setColumnMapping(prev => ({
                              ...prev,
                              [header]: value === 'skip' ? null : value
                            }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="skip">
                                <span className="text-charcoal-400">Skip this column</span>
                              </SelectItem>
                              {[...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].map(col => (
                                <SelectItem key={col} value={col}>
                                  {col}
                                  {REQUIRED_COLUMNS.includes(col) && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {!Object.values(columnMapping).includes('email') && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-700">
                    You must map the email column to proceed
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-charcoal-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-charcoal-900">{importStats.total}</p>
                  <p className="text-xs text-charcoal-500">Total Rows</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-600">{importStats.valid}</p>
                  <p className="text-xs text-emerald-700">Valid</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{importStats.invalid}</p>
                  <p className="text-xs text-red-700">Invalid</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-600">{importStats.duplicates}</p>
                  <p className="text-xs text-amber-700">Duplicates</p>
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-2">
                    Validation Errors ({importStats.invalid})
                  </p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                    {importStats.invalid > 10 && (
                      <li className="text-charcoal-500">
                        ...and {importStats.invalid - 10} more errors
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              <div className="border rounded-lg overflow-hidden">
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Title</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice(0, 20).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-sm">{row.email}</TableCell>
                          <TableCell>
                            {row.first_name} {row.last_name}
                          </TableCell>
                          <TableCell>{row.company_name || '-'}</TableCell>
                          <TableCell>{row.title || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                {parsedData.length > 20 && (
                  <div className="p-2 bg-charcoal-50 text-center text-sm text-charcoal-500">
                    Showing first 20 of {parsedData.length} prospects
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Importing */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-hublot-500 mb-4" />
              <p className="text-lg font-medium text-charcoal-900 mb-2">
                Importing prospects...
              </p>
              <p className="text-sm text-charcoal-500 mb-6">
                Please don't close this dialog
              </p>
              <div className="w-64">
                <Progress value={importProgress} className="h-2" />
                <p className="text-center text-sm text-charcoal-500 mt-2">
                  {importProgress}% complete
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 'complete' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-xl font-semibold text-charcoal-900 mb-2">
                Import Complete!
              </p>
              <p className="text-charcoal-500 mb-6">
                Successfully added {importStats.valid} prospects to the campaign
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                <Button onClick={() => {
                  resetDialog()
                  setStep('upload')
                }}>
                  Import More
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'importing' && step !== 'complete' && (
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {step === 'mapping' && (
              <Button 
                onClick={prepareImportData}
                disabled={!Object.values(columnMapping).includes('email')}
              >
                Continue to Preview
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {step === 'preview' && (
              <Button 
                onClick={executeImport}
                disabled={importStats.valid === 0}
              >
                <Users className="w-4 h-4 mr-2" />
                Import {importStats.valid} Prospects
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}






