'use client'

import * as React from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Star, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'
import type { CandidateResume } from '@/types/candidate-workspace'

interface ResumePickerFieldProps {
  candidateId: string
  value?: string | null
  onChange: (resumeId: string | null) => void
  label?: string
  required?: boolean
  disabled?: boolean
  className?: string
  // Optional: pass resumes directly instead of fetching
  resumes?: CandidateResume[]
}

/**
 * ResumePickerField - Select a resume for submission
 *
 * Used in submission creation dialogs to pick which resume version to submit.
 * Auto-selects the primary resume if available.
 */
export function ResumePickerField({
  candidateId,
  value,
  onChange,
  label = 'Select Resume',
  required = false,
  disabled = false,
  className,
  resumes: passedResumes,
}: ResumePickerFieldProps) {
  // Fetch resumes if not passed directly
  const { data: fetchedResumes, isLoading } = trpc.resumes.listByCandidate.useQuery(
    { candidateId },
    { enabled: !passedResumes && !!candidateId }
  )

  const resumes = passedResumes || fetchedResumes?.items || []

  // Auto-select primary resume on load
  React.useEffect(() => {
    if (!value && resumes.length > 0) {
      const primaryResume = resumes.find((r) => r.is_primary)
      if (primaryResume) {
        onChange(primaryResume.id)
      } else {
        // Select the first/most recent resume
        onChange(resumes[0].id)
      }
    }
  }, [resumes, value, onChange])

  const selectedResume = resumes.find((r) => r.id === value)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getResumeUrl = (resume: Record<string, unknown>): string => {
    const bucket = (resume.bucket as string) || 'resumes'
    const filePath = resume.file_path as string
    return filePath
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`
      : ''
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <Label>{label}</Label>
        <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-charcoal-50">
          <Loader2 className="h-4 w-4 animate-spin text-charcoal-400" />
          <span className="text-sm text-charcoal-500">Loading resumes...</span>
        </div>
      </div>
    )
  }

  if (resumes.length === 0) {
    return (
      <div className={cn('space-y-2', className)}>
        <Label>{label}</Label>
        <div className="flex items-center gap-2 p-3 border border-dashed rounded-md bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span className="text-sm text-amber-700">
            No resumes available. Please upload a resume first.
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex gap-2">
        <Select
          value={value || ''}
          onValueChange={(val) => onChange(val || null)}
          disabled={disabled}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a resume">
              {selectedResume && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-charcoal-500" />
                  <span className="truncate">
                    {selectedResume.title || selectedResume.file_name}
                  </span>
                  {selectedResume.is_primary && (
                    <Star className="h-3 w-3 text-gold-500 fill-gold-500" />
                  )}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {resumes.map((resume) => (
              <SelectItem key={resume.id} value={resume.id}>
                <div className="flex items-center gap-2 w-full">
                  <FileText className="h-4 w-4 text-charcoal-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">
                        {resume.title || resume.file_name}
                      </span>
                      {resume.is_primary && (
                        <Badge className="bg-gold-100 text-gold-700 text-[10px] px-1">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-charcoal-500">
                      {resume.target_role && (
                        <span className="truncate">{resume.target_role}</span>
                      )}
                      <span>{formatFileSize(resume.file_size || 0)}</span>
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedResume && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            asChild
            title="Preview resume"
          >
            <a
              href={getResumeUrl(selectedResume)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
      {selectedResume?.target_role && (
        <p className="text-xs text-charcoal-500">
          This resume is optimized for: {selectedResume.target_role}
        </p>
      )}
    </div>
  )
}

export default ResumePickerField
