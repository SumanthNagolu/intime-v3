'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  FileText,
  Download,
  Eye,
  Upload,
  Calendar,
  User,
  Star,
  StarOff,
  Send,
  MoreHorizontal,
  Pencil,
  Archive,
  Files,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CandidateResume } from '@/types/candidate-workspace'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface CandidateResumesSectionProps {
  resumes: CandidateResume[]
  candidateId: string
  candidateName: string
}

const SOURCE_COLORS: Record<string, string> = {
  uploaded: 'bg-blue-100 text-blue-700',
  parsed: 'bg-green-100 text-green-700',
  manual: 'bg-purple-100 text-purple-700',
  ai_generated: 'bg-amber-100 text-amber-700',
}

const SOURCE_LABELS: Record<string, string> = {
  uploaded: 'Uploaded',
  parsed: 'Parsed',
  manual: 'Manual',
  ai_generated: 'AI Generated',
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * CandidateResumesSection - Versioned resumes for this candidate
 *
 * Features:
 * - Multiple resume versions with labels and target roles
 * - Primary resume indicator (gold star)
 * - Submission usage tracking
 * - Upload, view, download, edit, set primary, archive actions
 */
export function CandidateResumesSection({
  resumes,
  candidateId,
  candidateName,
}: CandidateResumesSectionProps) {
  const handleUploadResume = () => {
    window.dispatchEvent(
      new CustomEvent('openCandidateDialog', {
        detail: { dialogId: 'uploadResume', candidateId },
      })
    )
  }

  const handleSetPrimary = (resumeId: string) => {
    window.dispatchEvent(
      new CustomEvent('candidateAction', {
        detail: { action: 'setPrimaryResume', candidateId, resumeId },
      })
    )
  }

  const handleEditResume = (resumeId: string) => {
    window.dispatchEvent(
      new CustomEvent('openCandidateDialog', {
        detail: { dialogId: 'editResumeMetadata', candidateId, resumeId },
      })
    )
  }

  const handleArchiveResume = (resumeId: string) => {
    window.dispatchEvent(
      new CustomEvent('candidateAction', {
        detail: { action: 'archiveResume', candidateId, resumeId },
      })
    )
  }

  // Group resumes: primary first, then by recency
  const sortedResumes = React.useMemo(() => {
    return [...resumes].sort((a, b) => {
      // Primary first
      if (a.isPrimary && !b.isPrimary) return -1
      if (!a.isPrimary && b.isPrimary) return 1
      // Then by upload date (newest first)
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    })
  }, [resumes])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal-900">
          Resumes ({resumes.length})
        </h2>
        <Button size="sm" onClick={handleUploadResume}>
          <Upload className="h-4 w-4 mr-1" />
          Upload Resume
        </Button>
      </div>

      {/* Resumes List */}
      {sortedResumes.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-charcoal-100">
              {sortedResumes.map((resume) => {
                const sourceColor = SOURCE_COLORS[resume.source] || 'bg-charcoal-100 text-charcoal-700'
                const sourceLabel = SOURCE_LABELS[resume.source] || resume.source
                const displayName = resume.label || resume.fileName

                return (
                  <div
                    key={resume.id}
                    className={cn(
                      'flex items-center gap-4 p-4 transition-colors',
                      resume.isPrimary ? 'bg-gold-50/50' : 'hover:bg-charcoal-50'
                    )}
                  >
                    {/* Icon with primary indicator */}
                    <div className="relative w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-charcoal-500" />
                      {resume.isPrimary && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center">
                          <Star className="h-2.5 w-2.5 text-white fill-white" />
                        </div>
                      )}
                    </div>

                    {/* Resume info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-charcoal-900 truncate">
                          {displayName}
                        </p>
                        {resume.isPrimary && (
                          <Badge className="bg-gold-100 text-gold-700 text-[10px]">
                            Primary
                          </Badge>
                        )}
                        {resume.targetRole && (
                          <Badge variant="outline" className="text-[10px]">
                            {resume.targetRole}
                          </Badge>
                        )}
                        <Badge className={cn('text-[10px]', sourceColor)}>
                          {sourceLabel}
                        </Badge>
                        {resume.version > 1 && (
                          <Badge variant="secondary" className="text-[10px]">
                            v{resume.version}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-charcoal-500 flex-wrap">
                        <span>{formatFileSize(resume.fileSize)}</span>
                        {resume.uploadedBy && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {resume.uploadedBy.fullName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(resume.uploadedAt), { addSuffix: true })}
                        </span>
                        {resume.submissionCount > 0 && (
                          <span className="flex items-center gap-1 text-charcoal-600">
                            <Send className="h-3 w-3" />
                            Used in {resume.submissionCount} submission{resume.submissionCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {resume.notes && (
                        <p className="mt-1 text-xs text-charcoal-500 italic truncate">
                          {resume.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer" title="View">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={resume.fileUrl} download={resume.fileName} title="Download">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!resume.isPrimary && (
                            <DropdownMenuItem onClick={() => handleSetPrimary(resume.id)}>
                              <Star className="h-4 w-4 mr-2" />
                              Set as Primary
                            </DropdownMenuItem>
                          )}
                          {resume.isPrimary && (
                            <DropdownMenuItem disabled>
                              <Star className="h-4 w-4 mr-2 text-gold-500" />
                              Primary Resume
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEditResume(resume.id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleArchiveResume(resume.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Files className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-sm font-medium text-charcoal-700">No resumes uploaded</p>
            <p className="text-xs text-charcoal-500 mt-1">
              Upload a resume to start submitting {candidateName} to jobs
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleUploadResume}>
              <Upload className="h-4 w-4 mr-1" />
              Upload First Resume
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CandidateResumesSection
