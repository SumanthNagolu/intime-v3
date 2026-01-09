'use client'

import * as React from 'react'
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ParsedResumeData } from '@/lib/services/resume-parser'

// ============================================
// RESUME UPLOAD & PARSER COMPONENT
// ============================================

export interface ResumeUploadParserProps {
  onParsed: (data: ParsedResumeData, file: File) => void
  onError?: (error: string) => void
  className?: string
  disabled?: boolean
}

type ParseState = 'idle' | 'uploading' | 'parsing' | 'success' | 'error'

export function ResumeUploadParser({
  onParsed,
  onError,
  className,
  disabled = false,
}: ResumeUploadParserProps) {
  const [state, setState] = React.useState<ParseState>('idle')
  const [error, setError] = React.useState<string | null>(null)
  const [file, setFile] = React.useState<File | null>(null)
  const [parsedData, setParsedData] = React.useState<ParsedResumeData | null>(null)
  const [showPreview, setShowPreview] = React.useState(true)
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = React.useCallback(
    async (selectedFile: File) => {
      // Validate file type
      if (!selectedFile.type.includes('pdf') && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
        const errorMsg = 'Please upload a PDF file'
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }

      // Validate file size (10MB max)
      const maxSizeBytes = 10 * 1024 * 1024
      if (selectedFile.size > maxSizeBytes) {
        const errorMsg = `File too large (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }

      setFile(selectedFile)
      setError(null)
      setParsedData(null)
      setState('uploading')

      try {
        // Create form data
        const formData = new FormData()
        formData.append('file', selectedFile)

        setState('parsing')

        // Call parse API
        const response = await fetch('/api/resume/parse', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to parse resume')
        }

        setParsedData(result.data)
        setState('success')
        onParsed(result.data, selectedFile)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to parse resume'
        setError(errorMsg)
        setState('error')
        onError?.(errorMsg)
      }
    },
    [onParsed, onError]
  )

  const handleDragOver = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled && state === 'idle') {
        setIsDragging(true)
      }
    },
    [disabled, state]
  )

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled || state !== 'idle') return

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [disabled, state, handleFile]
  )

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
      // Reset input value so same file can be selected again
      e.target.value = ''
    },
    [handleFile]
  )

  const handleClick = React.useCallback(() => {
    if (!disabled && state === 'idle') {
      inputRef.current?.click()
    }
  }, [disabled, state])

  const handleRetry = React.useCallback(() => {
    setState('idle')
    setError(null)
    setParsedData(null)
    setFile(null)
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  // Render idle state (upload zone)
  if (state === 'idle') {
    return (
      <div className={cn('w-full', className)}>
        <div
          className={cn(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer min-h-[200px]',
            isDragging
              ? 'border-gold-500 bg-gold-50'
              : 'border-charcoal-200 bg-cream hover:border-gold-400 hover:bg-gold-50/30',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full transition-colors',
                isDragging ? 'bg-gold-100' : 'bg-charcoal-100'
              )}
            >
              {isDragging ? (
                <Upload className="h-8 w-8 text-gold-600" />
              ) : (
                <FileText className="h-8 w-8 text-charcoal-500" />
              )}
            </div>

            <div>
              <p className="text-base font-medium text-hublot-900">
                {isDragging ? 'Drop your resume here' : 'Upload your resume'}
              </p>
              <p className="mt-1 text-sm text-charcoal-500">
                Drag and drop a PDF file, or{' '}
                <span className="font-medium text-gold-600">browse</span>
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-charcoal-400">
              <Badge variant="outline" className="text-xs">
                PDF only
              </Badge>
              <span>•</span>
              <span>Max 10MB</span>
            </div>

            <div className="mt-2 flex items-center gap-2 rounded-full bg-gold-50 px-4 py-2 text-sm text-gold-700">
              <Sparkles className="h-4 w-4" />
              <span>AI-powered parsing extracts all details automatically</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }

  // Render processing state
  if (state === 'uploading' || state === 'parsing') {
    return (
      <div className={cn('w-full', className)}>
        <div className="rounded-lg border border-charcoal-200 bg-cream p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold-100">
              <Loader2 className="h-6 w-6 animate-spin text-gold-600" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-charcoal-500" />
                <span className="font-medium text-hublot-900">{file?.name}</span>
                <span className="text-sm text-charcoal-400">
                  ({file ? formatFileSize(file.size) : ''})
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-charcoal-600">
                    {state === 'uploading' ? 'Uploading...' : 'Analyzing resume with AI...'}
                  </span>
                  <span className="text-gold-600">
                    {state === 'uploading' ? 'Step 1 of 2' : 'Step 2 of 2'}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-charcoal-100">
                  <div
                    className={cn(
                      'h-full rounded-full bg-gold-500 transition-all duration-500',
                      state === 'uploading' ? 'w-1/3' : 'w-2/3 animate-pulse'
                    )}
                  />
                </div>
              </div>

              <p className="mt-3 text-sm text-charcoal-500">
                {state === 'parsing'
                  ? 'Extracting contact info, skills, experience, and more...'
                  : 'Please wait while we upload your resume...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render error state
  if (state === 'error') {
    return (
      <div className={cn('w-full', className)}>
        <div className="rounded-lg border border-error-200 bg-error-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error-100">
              <AlertCircle className="h-6 w-6 text-error-600" />
            </div>

            <div className="flex-1">
              <h4 className="font-medium text-error-800">Failed to parse resume</h4>
              <p className="mt-1 text-sm text-error-600">{error}</p>

              <div className="mt-4 flex gap-3">
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleRetry()
                    onError?.('User chose manual entry')
                  }}
                  className="text-charcoal-600"
                >
                  Enter Manually Instead
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render success state with full preview
  if (state === 'success' && parsedData) {
    const visaStatusLabels: Record<string, string> = {
      us_citizen: 'US Citizen',
      green_card: 'Green Card',
      h1b: 'H1B Visa',
      l1: 'L1 Visa',
      tn: 'TN Visa',
      opt: 'OPT',
      cpt: 'CPT',
      ead: 'EAD',
      other: 'Other',
    }

    return (
      <div className={cn('w-full', className)}>
        <div className="rounded-lg border border-success-200 bg-success-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-100">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-success-800">Resume parsed successfully!</h4>
                  <p className="mt-1 text-sm text-success-600">
                    We extracted the following information from {file?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white text-success-700 border-success-300">
                    {parsedData.confidence.overall}% confidence
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleRetry}
                    title="Upload a different resume"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Collapsible full preview */}
              <button
                className="mt-4 flex w-full items-center justify-between rounded-lg bg-white/50 p-3 text-left transition-colors hover:bg-white/80"
                onClick={() => setShowPreview(!showPreview)}
              >
                <span className="text-sm font-medium text-charcoal-700">
                  {showPreview ? 'Hide' : 'Show'} extracted data
                </span>
                {showPreview ? (
                  <ChevronUp className="h-4 w-4 text-charcoal-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-charcoal-400" />
                )}
              </button>

              {showPreview && (
                <div className="mt-3 rounded-lg bg-white p-5 space-y-5">
                  {/* Section: Basic Information */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 border-b border-charcoal-100 pb-2">
                      Basic Information
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-charcoal-400">First Name</label>
                        <p className="font-medium text-hublot-900">{parsedData.firstName}</p>
                      </div>
                      <div>
                        <label className="text-xs text-charcoal-400">Last Name</label>
                        <p className="font-medium text-hublot-900">{parsedData.lastName}</p>
                      </div>
                      <div>
                        <label className="text-xs text-charcoal-400">Email</label>
                        <p className="text-charcoal-700">{parsedData.email}</p>
                      </div>
                      <div>
                        <label className="text-xs text-charcoal-400">Phone</label>
                        <p className="text-charcoal-700">{parsedData.phone || '—'}</p>
                      </div>
                      {parsedData.linkedinProfile && (
                        <div className="col-span-2">
                          <label className="text-xs text-charcoal-400">LinkedIn</label>
                          <p className="text-charcoal-700 truncate">{parsedData.linkedinProfile}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Location */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 border-b border-charcoal-100 pb-2">
                      Location
                    </h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-charcoal-400">City</label>
                        <p className="text-charcoal-700">{parsedData.locationCity || '—'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-charcoal-400">State/Province</label>
                        <p className="text-charcoal-700">{parsedData.locationState || '—'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-charcoal-400">Country</label>
                        <p className="text-charcoal-700">{parsedData.locationCountry || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section: Professional Details */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 border-b border-charcoal-100 pb-2">
                      Professional Details
                    </h5>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-charcoal-400">Headline / Title</label>
                        <p className="text-charcoal-700">{parsedData.professionalHeadline || '—'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-charcoal-400">Professional Summary</label>
                        <p className="text-charcoal-700 text-sm leading-relaxed">
                          {parsedData.professionalSummary || '—'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-charcoal-400">Years of Experience</label>
                          <p className="text-charcoal-700 font-medium">
                            {parsedData.experienceYears} years
                          </p>
                        </div>
                        {parsedData.visaStatus && (
                          <div>
                            <label className="text-xs text-charcoal-400">Work Authorization</label>
                            <p className="text-charcoal-700">
                              {visaStatusLabels[parsedData.visaStatus] || parsedData.visaStatus}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section: Skills */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 border-b border-charcoal-100 pb-2">
                      Skills ({parsedData.skills.length} extracted)
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {parsedData.skills.length === 0 && (
                        <p className="text-sm text-charcoal-400 italic">No skills extracted</p>
                      )}
                    </div>
                  </div>

                  {/* Section: Confidence Scores */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 border-b border-charcoal-100 pb-2">
                      AI Confidence Scores
                    </h5>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(parsedData.confidence.fields).map(([field, score]) => (
                        <div key={field} className="flex items-center justify-between bg-charcoal-50 rounded px-3 py-2">
                          <span className="text-xs text-charcoal-600 capitalize">{field}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              score >= 80
                                ? 'border-success-300 text-success-700'
                                : score >= 50
                                  ? 'border-warning-300 text-warning-700'
                                  : 'border-error-300 text-error-700'
                            )}
                          >
                            {score}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <p className="mt-4 text-xs text-success-600">
                Click "Continue" to review and edit the extracted information in the next steps.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}



