'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  FileSpreadsheet,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Download,
  ChevronRight,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

// CSV field mapping configuration
const CSV_FIELD_OPTIONS = [
  { value: 'skip', label: '-- Skip this column --' },
  { value: 'firstName', label: 'First Name', required: true },
  { value: 'lastName', label: 'Last Name', required: true },
  { value: 'email', label: 'Email', required: true },
  { value: 'phone', label: 'Phone' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'linkedinProfile', label: 'LinkedIn URL' },
  { value: 'professionalHeadline', label: 'Job Title / Headline' },
  { value: 'currentCompany', label: 'Current Company' },
  { value: 'experienceYears', label: 'Years of Experience' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'country', label: 'Country' },
  { value: 'visaStatus', label: 'Visa Status' },
  { value: 'skills', label: 'Skills (comma-separated)' },
  { value: 'rateType', label: 'Rate Type (hourly/annual)' },
  { value: 'desiredRate', label: 'Desired Rate' },
  { value: 'currency', label: 'Currency' },
  { value: 'leadSource', label: 'Lead Source' },
  { value: 'tags', label: 'Tags (comma-separated)' },
  { value: 'internalNotes', label: 'Notes' },
] as const

type CsvFieldValue = typeof CSV_FIELD_OPTIONS[number]['value']

interface ParsedCsvRow {
  [key: string]: string
}

type ImportState = 'upload' | 'mapping' | 'preview' | 'importing' | 'success' | 'error'
type FileType = 'csv' | 'json'

interface CsvImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CsvImportDialog({ open, onOpenChange }: CsvImportDialogProps) {
  const router = useRouter()
  const [state, setState] = React.useState<ImportState>('upload')
  const [file, setFile] = React.useState<File | null>(null)
  const [headers, setHeaders] = React.useState<string[]>([])
  const [rows, setRows] = React.useState<ParsedCsvRow[]>([])
  const [columnMapping, setColumnMapping] = React.useState<Record<string, CsvFieldValue>>({})
  const [error, setError] = React.useState<string | null>(null)
  const [importResult, setImportResult] = React.useState<{
    total: number
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [fileType, setFileType] = React.useState<FileType>('csv')
  const [jsonCandidates, setJsonCandidates] = React.useState<Record<string, unknown>[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  // tRPC mutation for bulk import
  const bulkImportMutation = trpc.ats.candidates.bulkImportFromCsv.useMutation({
    onSuccess: (result) => {
      setImportResult(result)
      setState('success')
      toast.success(`Successfully imported ${result.success} candidates`)
    },
    onError: (err) => {
      setError(err.message)
      setState('error')
      toast.error('Failed to import candidates')
    },
  })

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setState('upload')
        setFile(null)
        setHeaders([])
        setRows([])
        setColumnMapping({})
        setError(null)
        setImportResult(null)
        setFileType('csv')
        setJsonCandidates([])
      }, 300)
    }
  }, [open])

  // Parse CSV file
  const parseCSV = React.useCallback((text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error('CSV must have a header row and at least one data row')
    }

    // Parse header
    const headerLine = lines[0]
    const parsedHeaders = parseCSVLine(headerLine)

    // Parse data rows
    const parsedRows: ParsedCsvRow[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const row: ParsedCsvRow = {}
      parsedHeaders.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      parsedRows.push(row)
    }

    return { headers: parsedHeaders, rows: parsedRows }
  }, [])

  // Parse a single CSV line (handles quoted values)
  function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          current += '"'
          i++ // Skip next quote
        } else if (char === '"') {
          inQuotes = false
        } else {
          current += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === ',') {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
    }
    result.push(current.trim())

    return result
  }

  // Auto-map columns based on header names
  const autoMapColumns = React.useCallback((parsedHeaders: string[]) => {
    const mapping: Record<string, CsvFieldValue> = {}
    const fieldNameVariants: Record<string, CsvFieldValue> = {
      'first name': 'firstName',
      'firstname': 'firstName',
      'first_name': 'firstName',
      'last name': 'lastName',
      'lastname': 'lastName',
      'last_name': 'lastName',
      'email': 'email',
      'email address': 'email',
      'phone': 'phone',
      'phone number': 'phone',
      'mobile': 'mobile',
      'cell': 'mobile',
      'linkedin': 'linkedinProfile',
      'linkedin url': 'linkedinProfile',
      'linkedin profile': 'linkedinProfile',
      'title': 'professionalHeadline',
      'job title': 'professionalHeadline',
      'headline': 'professionalHeadline',
      'company': 'currentCompany',
      'current company': 'currentCompany',
      'employer': 'currentCompany',
      'experience': 'experienceYears',
      'years experience': 'experienceYears',
      'years of experience': 'experienceYears',
      'city': 'city',
      'state': 'state',
      'province': 'state',
      'country': 'country',
      'visa': 'visaStatus',
      'visa status': 'visaStatus',
      'work authorization': 'visaStatus',
      'skills': 'skills',
      'rate type': 'rateType',
      'rate': 'desiredRate',
      'desired rate': 'desiredRate',
      'salary': 'desiredRate',
      'currency': 'currency',
      'source': 'leadSource',
      'lead source': 'leadSource',
      'tags': 'tags',
      'notes': 'internalNotes',
      'comments': 'internalNotes',
    }

    parsedHeaders.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim()
      if (fieldNameVariants[normalizedHeader]) {
        mapping[header] = fieldNameVariants[normalizedHeader]
      } else {
        mapping[header] = 'skip'
      }
    })

    return mapping
  }, [])

  // Parse InTime JSON format
  const parseInTimeJson = React.useCallback((text: string) => {
    const data = JSON.parse(text)

    // Check for InTime format v1
    if (data._format === 'intime_resume_v1') {
      // Single candidate from resume export
      const candidate = data.candidate || {}
      return [{
        firstName: candidate.firstName || '',
        lastName: candidate.lastName || '',
        email: candidate.email || '',
        phone: candidate.phone,
        mobile: candidate.mobile,
        linkedinProfile: candidate.linkedinUrl,
        professionalHeadline: candidate.headline,
        currentCompany: candidate.currentCompany,
        experienceYears: candidate.yearsExperience,
        city: candidate.city,
        state: candidate.state,
        country: candidate.country,
        visaStatus: candidate.visaStatus,
        skills: (data.skills || []).map((s: { name: string }) => s.name),
        desiredRate: candidate.desiredRate,
        rateType: candidate.rateType,
        currency: candidate.currency,
      }]
    }

    // Check for array of candidates
    if (Array.isArray(data)) {
      return data.map((c: Record<string, unknown>) => ({
        firstName: c.firstName || c.first_name || '',
        lastName: c.lastName || c.last_name || '',
        email: c.email || '',
        phone: c.phone,
        mobile: c.mobile,
        linkedinProfile: c.linkedinProfile || c.linkedinUrl || c.linkedin_url,
        professionalHeadline: c.professionalHeadline || c.headline || c.title,
        currentCompany: c.currentCompany || c.current_company,
        experienceYears: c.experienceYears || c.years_experience || c.yearsExperience,
        city: c.city,
        state: c.state,
        country: c.country,
        visaStatus: c.visaStatus || c.visa_status,
        skills: Array.isArray(c.skills) ? c.skills : [],
        desiredRate: c.desiredRate || c.desired_rate,
        rateType: c.rateType || c.rate_type,
        currency: c.currency,
        leadSource: c.leadSource || c.lead_source,
        tags: Array.isArray(c.tags) ? c.tags : [],
        internalNotes: c.internalNotes || c.notes,
      }))
    }

    throw new Error('Unrecognized JSON format. Expected InTime format or array of candidates.')
  }, [])

  // Handle file upload
  const handleFile = React.useCallback(async (selectedFile: File) => {
    const isJson = selectedFile.name.toLowerCase().endsWith('.json')
    const isCsv = selectedFile.name.toLowerCase().endsWith('.csv')

    // Validate file type
    if (!isJson && !isCsv) {
      setError('Please upload a CSV or JSON file')
      return
    }

    // Validate file size (5MB max)
    const maxSizeBytes = 5 * 1024 * 1024
    if (selectedFile.size > maxSizeBytes) {
      setError(`File too large (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`)
      return
    }

    setFile(selectedFile)
    setError(null)

    try {
      const text = await selectedFile.text()

      if (isJson) {
        // Parse JSON file
        setFileType('json')
        const candidates = parseInTimeJson(text)

        if (candidates.length === 0) {
          setError('JSON file has no candidate data')
          return
        }

        if (candidates.length > 500) {
          setError(`JSON has ${candidates.length} candidates. Maximum is 500 per import.`)
          return
        }

        setJsonCandidates(candidates)
        setState('preview') // Skip mapping for JSON
      } else {
        // Parse CSV file
        setFileType('csv')
        const { headers: parsedHeaders, rows: parsedRows } = parseCSV(text)

        if (parsedRows.length === 0) {
          setError('CSV file has no data rows')
          return
        }

        if (parsedRows.length > 500) {
          setError(`CSV has ${parsedRows.length} rows. Maximum is 500 rows per import.`)
          return
        }

        setHeaders(parsedHeaders)
        setRows(parsedRows)
        setColumnMapping(autoMapColumns(parsedHeaders))
        setState('mapping')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
    }
  }, [parseCSV, parseInTimeJson, autoMapColumns])

  // Handle drag and drop
  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
    e.target.value = ''
  }, [handleFile])

  // Update column mapping
  const updateMapping = (header: string, value: CsvFieldValue) => {
    setColumnMapping(prev => ({ ...prev, [header]: value }))
  }

  // Validate mapping has required fields
  const validateMapping = () => {
    const mappedFields = new Set(Object.values(columnMapping).filter(v => v !== 'skip')) as Set<string>
    const requiredFields = CSV_FIELD_OPTIONS
      .filter((f): f is typeof f & { required: true } => 'required' in f && f.required === true)
      .map(f => f.value)
    const missingRequired = requiredFields.filter(f => !mappedFields.has(f))
    return { valid: missingRequired.length === 0, missing: missingRequired }
  }

  // Transform rows based on mapping
  const transformRows = () => {
    return rows.map(row => {
      const transformed: Record<string, unknown> = {}
      Object.entries(columnMapping).forEach(([header, field]) => {
        if (field !== 'skip' && row[header]) {
          const value = row[header]

          // Handle special field transformations
          if (field === 'experienceYears') {
            transformed[field] = parseInt(value, 10) || 0
          } else if (field === 'desiredRate') {
            transformed[field] = parseFloat(value) || 0
          } else if (field === 'skills' || field === 'tags') {
            transformed[field] = value.split(',').map(s => s.trim()).filter(Boolean)
          } else {
            transformed[field] = value
          }
        }
      })
      return transformed
    })
  }

  // Start import
  const handleImport = () => {
    let candidatesToImport: {
      firstName: string
      lastName: string
      email: string
      [key: string]: unknown
    }[]

    if (fileType === 'json') {
      // For JSON import, use the already-parsed candidates
      candidatesToImport = jsonCandidates.map(c => ({
        firstName: String(c.firstName || ''),
        lastName: String(c.lastName || ''),
        email: String(c.email || ''),
        phone: c.phone as string | undefined,
        mobile: c.mobile as string | undefined,
        linkedinProfile: c.linkedinProfile as string | undefined,
        professionalHeadline: c.professionalHeadline as string | undefined,
        currentCompany: c.currentCompany as string | undefined,
        experienceYears: c.experienceYears as number | undefined,
        city: c.city as string | undefined,
        state: c.state as string | undefined,
        country: c.country as string | undefined,
        visaStatus: c.visaStatus as string | undefined,
        skills: Array.isArray(c.skills) ? c.skills : [],
        desiredRate: c.desiredRate as number | undefined,
        rateType: c.rateType as string | undefined,
        currency: c.currency as string | undefined,
        leadSource: c.leadSource as string | undefined,
        tags: Array.isArray(c.tags) ? c.tags : [],
        internalNotes: c.internalNotes as string | undefined,
      }))
    } else {
      // For CSV import, transform based on column mapping
      candidatesToImport = transformRows() as typeof candidatesToImport
    }

    setState('importing')
    bulkImportMutation.mutate({ candidates: candidatesToImport })
  }

  // Download sample CSV
  const downloadSample = () => {
    const sampleHeaders = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Mobile',
      'LinkedIn URL',
      'Job Title',
      'Current Company',
      'Years of Experience',
      'City',
      'State',
      'Country',
      'Visa Status',
      'Skills',
      'Rate Type',
      'Desired Rate',
      'Currency',
      'Lead Source',
      'Tags',
      'Notes',
    ]
    const sampleRows = [
      // USA - US Citizen
      [
        'John',
        'Miller',
        'john.miller@example.com',
        '+1-415-555-1234',
        '+1-415-555-1235',
        'https://linkedin.com/in/johnmiller',
        'Senior Software Engineer',
        'Acme Corp',
        '8',
        'San Francisco',
        'CA',
        'United States',
        'US Citizen',
        'React,TypeScript,Node.js,AWS',
        'hourly',
        '95',
        'USD',
        'LinkedIn',
        'senior,fullstack',
        'Strong candidate with cloud experience',
      ],
      // USA - H1B Visa
      [
        'Priya',
        'Sharma',
        'priya.sharma@example.com',
        '+1-408-555-2345',
        '+1-408-555-2346',
        'https://linkedin.com/in/priyasharma',
        'Full Stack Developer',
        'Tech Solutions Inc',
        '6',
        'San Jose',
        'CA',
        'United States',
        'H1B',
        'Java,Spring Boot,React,PostgreSQL,Docker',
        'hourly',
        '75',
        'USD',
        'Referral',
        'java,backend',
        'H1B valid until 2026. Transfer possible.',
      ],
      // USA - Green Card
      [
        'Amit',
        'Patel',
        'amit.patel@example.com',
        '+1-972-555-3456',
        '+1-972-555-3457',
        'https://linkedin.com/in/amitpatel',
        'Data Engineer',
        'Data Systems LLC',
        '7',
        'Dallas',
        'TX',
        'United States',
        'Green Card',
        'Python,Spark,Databricks,Snowflake,AWS',
        'hourly',
        '80',
        'USD',
        'Job Board',
        'data,bigdata',
        'Green Card holder. No sponsorship needed.',
      ],
      // USA - OPT/STEM
      [
        'Sneha',
        'Reddy',
        'sneha.reddy@example.com',
        '+1-201-555-4567',
        '',
        'https://linkedin.com/in/snehareddy',
        'ML Engineer',
        'AI Startup',
        '2',
        'Jersey City',
        'NJ',
        'United States',
        'OPT STEM',
        'Python,TensorFlow,PyTorch,MLOps,AWS SageMaker',
        'annual',
        '120000',
        'USD',
        'Campus',
        'ml,ai,fresher',
        'OPT STEM valid until 2026. Will need H1B.',
      ],
      // Canada - Canadian Citizen
      [
        'Sarah',
        'Thompson',
        'sarah.thompson@example.com',
        '+1-416-555-5678',
        '+1-416-555-5679',
        'https://linkedin.com/in/sarahthompson',
        'Product Manager',
        'Shopify',
        '5',
        'Toronto',
        'ON',
        'Canada',
        'Canadian Citizen',
        'Product Management,Agile,Scrum,JIRA,Figma',
        'annual',
        '130000',
        'CAD',
        'LinkedIn',
        'product,manager',
        'Open to TN visa for US roles.',
      ],
      // Canada - Work Permit
      [
        'Vikram',
        'Singh',
        'vikram.singh@example.com',
        '+1-604-555-6789',
        '+1-604-555-6790',
        'https://linkedin.com/in/vikramsingh',
        'DevOps Engineer',
        'AWS Canada',
        '4',
        'Vancouver',
        'BC',
        'Canada',
        'Work Permit',
        'Kubernetes,Terraform,AWS,Azure,CI/CD,Python',
        'hourly',
        '70',
        'CAD',
        'Referral',
        'devops,cloud',
        'Work permit valid until 2025. PR in progress.',
      ],
      // India - Needs Sponsorship
      [
        'Rahul',
        'Kumar',
        'rahul.kumar@example.com',
        '+91-98765-43210',
        '+91-98765-43211',
        'https://linkedin.com/in/rahulkumar',
        'Senior Java Developer',
        'Infosys',
        '9',
        'Bangalore',
        'Karnataka',
        'India',
        'Indian Citizen',
        'Java,Spring Boot,Microservices,Kafka,Oracle',
        'hourly',
        '45',
        'USD',
        'Job Board',
        'java,senior',
        'Needs H1B sponsorship. Open to relocation.',
      ],
      // India - Remote only
      [
        'Ananya',
        'Gupta',
        'ananya.gupta@example.com',
        '+91-98123-45678',
        '',
        'https://linkedin.com/in/ananyagupta',
        'UI/UX Designer',
        'Wipro',
        '5',
        'Hyderabad',
        'Telangana',
        'India',
        'Indian Citizen',
        'Figma,Sketch,Adobe XD,HTML,CSS,Design Systems',
        'hourly',
        '35',
        'USD',
        'LinkedIn',
        'design,ux',
        'Remote only. Not open to relocation.',
      ],
    ]

    const csvContent = [
      sampleHeaders.join(','),
      ...sampleRows.map(row => row.map(v => `"${v}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'candidate-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Render upload step
  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer min-h-[200px]',
          isDragging
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-charcoal-200 bg-cream hover:border-emerald-400 hover:bg-emerald-50/30'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <div className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full transition-colors',
            isDragging ? 'bg-emerald-100' : 'bg-charcoal-100'
          )}>
            <FileSpreadsheet className={cn(
              'h-8 w-8',
              isDragging ? 'text-emerald-600' : 'text-charcoal-500'
            )} />
          </div>

          <div>
            <p className="text-base font-medium text-hublot-900">
              {isDragging ? 'Drop your file here' : 'Upload CSV or JSON file'}
            </p>
            <p className="mt-1 text-sm text-charcoal-500">
              Drag and drop a file, or{' '}
              <span className="font-medium text-emerald-600">browse</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-charcoal-400">
            <Badge variant="outline" className="text-xs">CSV</Badge>
            <Badge variant="outline" className="text-xs bg-gold-50 text-gold-700 border-gold-200">InTime JSON</Badge>
            <span>•</span>
            <span>Max 500 candidates</span>
            <span>•</span>
            <span>Max 5MB</span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sample download */}
      <div className="flex items-center justify-center">
        <Button variant="ghost" size="sm" onClick={downloadSample}>
          <Download className="mr-2 h-4 w-4" />
          Download Sample CSV Template
        </Button>
      </div>
    </div>
  )

  // Render mapping step
  const renderMappingStep = () => {
    const validation = validateMapping()

    return (
      <div className="space-y-6">
        {/* File info */}
        <div className="flex items-center gap-3 p-4 bg-charcoal-50 rounded-lg">
          <FileSpreadsheet className="h-5 w-5 text-charcoal-500" />
          <div className="flex-1">
            <p className="font-medium text-charcoal-900">{file?.name}</p>
            <p className="text-sm text-charcoal-500">{rows.length} candidates to import</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setState('upload')}>
            Change File
          </Button>
        </div>

        {/* Column mapping */}
        <div>
          <h4 className="font-medium text-charcoal-900 mb-3">Map CSV columns to candidate fields</h4>
          <div className="space-y-3">
            {headers.map(header => (
              <div key={header} className="flex items-center gap-4">
                <div className="w-1/3">
                  <p className="text-sm font-medium text-charcoal-700 truncate">{header}</p>
                  <p className="text-xs text-charcoal-400 truncate">{rows[0]?.[header] || '(empty)'}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-charcoal-300 flex-shrink-0" />
                <Select
                  value={columnMapping[header] || 'skip'}
                  onValueChange={(value) => updateMapping(header, value as CsvFieldValue)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CSV_FIELD_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                        {'required' in option && option.required && <span className="text-error-500 ml-1">*</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>

        {/* Validation errors */}
        {!validation.valid && (
          <div className="flex items-start gap-2 rounded-lg bg-warning-50 p-3 text-sm text-warning-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Required fields not mapped:</p>
              <p>{validation.missing.map(f => CSV_FIELD_OPTIONS.find(o => o.value === f)?.label).join(', ')}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setState('upload')}>
            Back
          </Button>
          <Button onClick={() => setState('preview')} disabled={!validation.valid}>
            Preview Import
          </Button>
        </div>
      </div>
    )
  }

  // Render preview step
  const renderPreviewStep = () => {
    // Handle JSON preview
    if (fileType === 'json') {
      const previewCandidates = jsonCandidates.slice(0, 5)
      const jsonFields = [
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'email', label: 'Email' },
        { key: 'professionalHeadline', label: 'Title' },
        { key: 'currentCompany', label: 'Company' },
        { key: 'city', label: 'City' },
      ]

      return (
        <div className="space-y-6">
          {/* Summary */}
          <div className="flex items-center gap-3 p-4 bg-gold-50 rounded-lg border border-gold-200">
            <Users className="h-5 w-5 text-gold-600" />
            <div>
              <p className="font-medium text-gold-900">Ready to import {jsonCandidates.length} candidate{jsonCandidates.length !== 1 ? 's' : ''}</p>
              <p className="text-sm text-gold-600">From InTime JSON format</p>
            </div>
          </div>

          {/* Preview table */}
          <div>
            <h4 className="font-medium text-charcoal-900 mb-3">Preview (first 5 candidates)</h4>
            <ScrollArea className="h-[300px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    {jsonFields.map(({ key, label }) => (
                      <TableHead key={key} className="whitespace-nowrap">
                        {label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewCandidates.map((candidate, i) => (
                    <TableRow key={i}>
                      {jsonFields.map(({ key }) => (
                        <TableCell key={key} className="whitespace-nowrap">
                          {String(candidate[key] || '—')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setState('upload')}>
              Back
            </Button>
            <Button onClick={handleImport} className="bg-gold-600 hover:bg-gold-700">
              Import {jsonCandidates.length} Candidate{jsonCandidates.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )
    }

    // Handle CSV preview
    const previewRows = rows.slice(0, 5)
    const mappedFields = Object.entries(columnMapping)
      .filter(([, value]) => value !== 'skip')
      .map(([header, value]) => ({
        header,
        field: value,
        label: CSV_FIELD_OPTIONS.find(o => o.value === value)?.label || value,
      }))

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <Users className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="font-medium text-emerald-900">Ready to import {rows.length} candidates</p>
            <p className="text-sm text-emerald-600">{mappedFields.length} fields mapped</p>
          </div>
        </div>

        {/* Preview table */}
        <div>
          <h4 className="font-medium text-charcoal-900 mb-3">Preview (first 5 rows)</h4>
          <ScrollArea className="h-[300px] border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  {mappedFields.map(({ field, label }) => (
                    <TableHead key={field} className="whitespace-nowrap">
                      {label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, i) => (
                  <TableRow key={i}>
                    {mappedFields.map(({ header, field }) => (
                      <TableCell key={field} className="whitespace-nowrap">
                        {row[header] || '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setState('mapping')}>
            Back
          </Button>
          <Button onClick={handleImport} className="bg-emerald-600 hover:bg-emerald-700">
            Import {rows.length} Candidates
          </Button>
        </div>
      </div>
    )
  }

  // Render importing step
  const renderImportingStep = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      <div className="text-center">
        <p className="font-medium text-charcoal-900">Importing candidates...</p>
        <p className="text-sm text-charcoal-500">This may take a moment</p>
      </div>
    </div>
  )

  // Render success step
  const renderSuccessStep = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
        <CheckCircle className="h-8 w-8 text-success-600" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-charcoal-900">Import Complete!</p>
        <p className="text-sm text-charcoal-500 mt-1">
          Successfully imported {importResult?.success} of {importResult?.total} candidates
        </p>
      </div>

      {importResult?.failed && importResult.failed > 0 && (
        <div className="w-full rounded-lg bg-warning-50 p-4 text-sm">
          <p className="font-medium text-warning-800">{importResult.failed} candidates failed to import:</p>
          <ul className="mt-2 list-disc list-inside text-warning-700">
            {importResult.errors.slice(0, 5).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {importResult.errors.length > 5 && (
              <li>...and {importResult.errors.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
        <Button onClick={() => {
          onOpenChange(false)
          router.push('/employee/recruiting/candidates')
        }}>
          View Candidates
        </Button>
      </div>
    </div>
  )

  // Render error step
  const renderErrorStep = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-100">
        <AlertCircle className="h-8 w-8 text-error-600" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-charcoal-900">Import Failed</p>
        <p className="text-sm text-error-600 mt-1">{error}</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setState('preview')}>
          Try Again
        </Button>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Import Candidates
          </DialogTitle>
          <DialogDescription>
            {state === 'upload' && 'Upload a CSV or InTime JSON file to bulk import candidates.'}
            {state === 'mapping' && 'Map your CSV columns to candidate fields.'}
            {state === 'preview' && 'Review the data before importing.'}
            {state === 'importing' && 'Please wait while we import your candidates.'}
            {state === 'success' && 'Your candidates have been imported.'}
            {state === 'error' && 'There was an error importing your candidates.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {state === 'upload' && renderUploadStep()}
          {state === 'mapping' && renderMappingStep()}
          {state === 'preview' && renderPreviewStep()}
          {state === 'importing' && renderImportingStep()}
          {state === 'success' && renderSuccessStep()}
          {state === 'error' && renderErrorStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
