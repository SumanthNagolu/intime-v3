'use client'

import { useState, useCallback } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  FileSpreadsheet,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImportWizardProps {
  open: boolean
  onClose: () => void
}

type Step = 'upload' | 'mapping' | 'preview' | 'import'

export function ImportWizard({ open, onClose }: ImportWizardProps) {
  const [step, setStep] = useState<Step>('upload')
  const [entityType, setEntityType] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileData, setFileData] = useState<string>('')
  const [parsedData, setParsedData] = useState<{
    headers: string[]
    sampleRows: Record<string, unknown>[]
    totalRows: number
  } | null>(null)
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [importOptions, setImportOptions] = useState({
    errorHandling: 'skip' as 'skip' | 'stop' | 'flag',
    updateExisting: false,
  })
  const [validation, setValidation] = useState<{
    totalRows: number
    validRows: number
    errorRows: number
    errors: Array<{ row: number; field: string; message: string }>
    warnings: Array<{ row: number; field: string; message: string }>
  } | null>(null)
  const [importJob, setImportJob] = useState<{
    id: string
    status: string
    success_rows: number
    error_rows: number
  } | null>(null)

  const utils = trpc.useUtils()

  const { data: entities } = trpc.data.getImportableEntities.useQuery()

  const parseFileMutation = trpc.data.parseImportFile.useMutation({
    onSuccess: (data) => {
      setParsedData(data)
      // Auto-map headers with matching names
      const autoMapping: Record<string, string> = {}
      const selectedEntity = entities?.find(e => e.name === entityType)
      if (selectedEntity) {
        data.headers.forEach(header => {
          const match = selectedEntity.fields.find(
            f => f.name.toLowerCase() === header.toLowerCase() ||
              f.displayName.toLowerCase() === header.toLowerCase()
          )
          if (match) {
            autoMapping[header] = match.name
          }
        })
      }
      setFieldMapping(autoMapping)
      setStep('mapping')
    },
  })

  const validateMutation = trpc.data.validateImportData.useMutation({
    onSuccess: (data) => {
      setValidation(data)
    },
  })

  const importMutation = trpc.data.createImportJob.useMutation({
    onSuccess: (data) => {
      setImportJob(data)
      utils.data.listImportJobs.invalidate()
      utils.data.getDashboardStats.invalidate()
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setFileData(base64)
      }
      reader.readAsDataURL(selectedFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json'],
    },
    maxFiles: 1,
  })

  const handleNext = () => {
    switch (step) {
      case 'upload':
        if (file && fileData && entityType) {
          parseFileMutation.mutate({ fileData, fileName: file.name })
        }
        break
      case 'mapping':
        if (parsedData && file) {
          validateMutation.mutate({
            entityType,
            fileData,
            fileName: file.name,
            fieldMapping,
          })
          setStep('preview')
        }
        break
      case 'preview':
        if (file) {
          importMutation.mutate({
            entityType,
            fileName: file.name,
            fileData,
            fieldMapping,
            importOptions,
          })
          setStep('import')
        }
        break
      case 'import':
        handleClose()
        break
    }
  }

  const handleBack = () => {
    switch (step) {
      case 'mapping':
        setStep('upload')
        break
      case 'preview':
        setStep('mapping')
        break
    }
  }

  const handleClose = () => {
    setStep('upload')
    setEntityType('')
    setFile(null)
    setFileData('')
    setParsedData(null)
    setFieldMapping({})
    setValidation(null)
    setImportJob(null)
    onClose()
  }

  const selectedEntity = entities?.find(e => e.name === entityType)
  const canProceed = {
    upload: file && fileData && entityType,
    mapping: Object.keys(fieldMapping).length > 0,
    preview: validation && (validation.validRows > 0 || importOptions.errorHandling !== 'stop'),
    import: importJob?.status === 'completed' || importJob?.status === 'failed',
  }

  const isLoading = parseFileMutation.isPending || validateMutation.isPending || importMutation.isPending

  return (
    <Dialog open={open} onOpenChange={() => handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Import records from CSV, Excel, or JSON files
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex gap-1 mb-4">
          {(['upload', 'mapping', 'preview', 'import'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={cn(
                'flex-1 h-1 rounded',
                step === s || i < ['upload', 'mapping', 'preview', 'import'].indexOf(step)
                  ? 'bg-hublot-500'
                  : 'bg-charcoal-200'
              )}
            />
          ))}
        </div>

        <ScrollArea className="flex-1 pr-4">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div>
                <Label>Entity Type</Label>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select what to import" />
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

              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                  isDragActive
                    ? 'border-gold-500 bg-gold-50'
                    : file
                    ? 'border-green-500 bg-green-50'
                    : 'border-charcoal-300 hover:border-charcoal-400'
                )}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileSpreadsheet className="h-12 w-12 text-green-600" />
                    <p className="font-medium text-charcoal-900">{file.name}</p>
                    <p className="text-sm text-charcoal-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <Button variant="ghost" size="sm" onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                      setFileData('')
                    }}>
                      Choose different file
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-12 w-12 text-charcoal-400" />
                    <p className="font-medium text-charcoal-700">
                      {isDragActive ? 'Drop the file here' : 'Drag & drop or click to browse'}
                    </p>
                    <p className="text-sm text-charcoal-500">
                      Supports CSV, Excel (.xlsx, .xls), and JSON files
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Field Mapping */}
          {step === 'mapping' && parsedData && selectedEntity && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-charcoal-600">
                    {parsedData.totalRows} rows found
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="firstRowHeaders"
                    checked={true}
                    disabled
                  />
                  <Label htmlFor="firstRowHeaders" className="text-sm">
                    First row contains headers
                  </Label>
                </div>
              </div>

              <div className="border rounded-lg divide-y">
                <div className="grid grid-cols-2 gap-4 p-3 bg-charcoal-50 font-medium text-sm">
                  <span>Source Column</span>
                  <span>Destination Field</span>
                </div>
                {parsedData.headers.map((header) => (
                  <div key={header} className="grid grid-cols-2 gap-4 p-3 items-center">
                    <span className="font-mono text-sm">{header}</span>
                    <Select
                      value={fieldMapping[header] || ''}
                      onValueChange={(value) => {
                        setFieldMapping(prev => ({
                          ...prev,
                          [header]: value === '__skip__' ? '' : value,
                        }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Skip this column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__skip__">-- Skip this column --</SelectItem>
                        {selectedEntity.fields.map((field) => (
                          <SelectItem key={field.name} value={field.name}>
                            {field.displayName}
                            {field.required && <span className="text-red-500">*</span>}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {/* Sample Data Preview */}
              {parsedData.sampleRows.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Sample Data Preview</p>
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-charcoal-50">
                        <tr>
                          {parsedData.headers.map((h) => (
                            <th key={h} className="px-3 py-2 text-left font-medium">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {parsedData.sampleRows.slice(0, 3).map((row, i) => (
                          <tr key={i}>
                            {parsedData.headers.map((h) => (
                              <td key={h} className="px-3 py-2 truncate max-w-[150px]">
                                {String(row[h] || '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview & Validation */}
          {step === 'preview' && (
            <div className="space-y-4">
              {validateMutation.isPending ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
                  <span className="ml-2">Validating data...</span>
                </div>
              ) : validation ? (
                <>
                  {/* Validation Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-charcoal-50 rounded-lg text-center">
                      <p className="text-2xl font-bold">{validation.totalRows}</p>
                      <p className="text-sm text-charcoal-600">Total Rows</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{validation.validRows}</p>
                      <p className="text-sm text-green-700">Valid</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">{validation.errorRows}</p>
                      <p className="text-sm text-red-700">Errors</p>
                    </div>
                  </div>

                  {/* Errors */}
                  {validation.errors.length > 0 && (
                    <div className="border border-red-200 rounded-lg">
                      <div className="p-3 bg-red-50 border-b border-red-200 flex items-center gap-2">
                        <X className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-800">
                          {validation.errors.length} Validation Errors
                        </span>
                      </div>
                      <div className="max-h-40 overflow-y-auto divide-y">
                        {validation.errors.slice(0, 20).map((err, i) => (
                          <div key={i} className="p-2 text-sm">
                            <span className="font-mono text-red-600">Row {err.row}:</span>{' '}
                            <span className="text-charcoal-600">{err.field}</span> - {err.message}
                          </div>
                        ))}
                        {validation.errors.length > 20 && (
                          <div className="p-2 text-sm text-charcoal-500">
                            ... and {validation.errors.length - 20} more errors
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {validation.warnings.length > 0 && (
                    <div className="border border-yellow-200 rounded-lg">
                      <div className="p-3 bg-yellow-50 border-b border-yellow-200 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">
                          {validation.warnings.length} Warnings
                        </span>
                      </div>
                      <div className="max-h-32 overflow-y-auto divide-y">
                        {validation.warnings.slice(0, 10).map((warn, i) => (
                          <div key={i} className="p-2 text-sm">
                            <span className="font-mono text-yellow-600">Row {warn.row}:</span>{' '}
                            {warn.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Import Options */}
                  <div className="border rounded-lg p-4">
                    <p className="font-medium mb-3">Error Handling</p>
                    <div className="space-y-2">
                      {[
                        { value: 'skip', label: 'Skip rows with errors' },
                        { value: 'stop', label: 'Stop import on first error' },
                        { value: 'flag', label: 'Import all (flag errors)' },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="errorHandling"
                            value={option.value}
                            checked={importOptions.errorHandling === option.value}
                            onChange={(e) => setImportOptions(prev => ({
                              ...prev,
                              errorHandling: e.target.value as 'skip' | 'stop' | 'flag',
                            }))}
                            className="text-gold-500"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Checkbox
                        id="updateExisting"
                        checked={importOptions.updateExisting}
                        onCheckedChange={(checked) => setImportOptions(prev => ({
                          ...prev,
                          updateExisting: checked === true,
                        }))}
                      />
                      <Label htmlFor="updateExisting">
                        Update existing records (match by email/unique fields)
                      </Label>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Step 4: Import Progress */}
          {step === 'import' && (
            <div className="space-y-6">
              {importMutation.isPending ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-gold-500 mb-4" />
                  <p className="font-medium text-charcoal-700">Importing data...</p>
                  <p className="text-sm text-charcoal-500">This may take a moment</p>
                </div>
              ) : importJob ? (
                <div className="text-center py-8">
                  {importJob.status === 'completed' ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <Check className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-charcoal-900 mb-2">
                        Import Complete!
                      </h3>
                      <p className="text-charcoal-600 mb-4">
                        Successfully imported {importJob.success_rows} records
                      </p>
                      {importJob.error_rows > 0 && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {importJob.error_rows} rows skipped due to errors
                        </Badge>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <X className="h-8 w-8 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-charcoal-900 mb-2">
                        Import Failed
                      </h3>
                      <p className="text-charcoal-600">
                        Please check your file and try again
                      </p>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          {step !== 'upload' && step !== 'import' && (
            <Button variant="outline" onClick={handleBack} disabled={isLoading}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex-1" />
          {step === 'import' && importJob ? (
            <Button onClick={handleClose}>
              Done
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed[step] || isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {step === 'preview' ? 'Start Import' : 'Continue'}
              {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
