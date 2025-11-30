/**
 * TalentResumeSection Component
 *
 * Displays resume information with version history support.
 * Allows uploading new versions and viewing history.
 */

'use client';

import React, { useState } from 'react';
import {
  FileText,
  FileUp,
  Download,
  Eye,
  History,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface Resume {
  id: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  version: number;
  isLatest: boolean;
  resumeType?: string | null;
  title?: string | null;
  notes?: string | null;
  aiSummary?: string | null;
  extractedSkills?: string[] | null;
  uploadedAt: Date | string;
}

export interface TalentResumeSectionProps {
  talentId: string;
  talentName: string;
  resumes: Resume[];
  isLoading?: boolean;
  onUpload?: () => void;
  onDownload?: (fileId: string) => void;
  onPreview?: (fileId: string) => void;
  className?: string;
}

// =====================================================
// HELPERS
// =====================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const RESUME_TYPE_COLORS: Record<string, string> = {
  master: 'bg-blue-100 text-blue-700',
  formatted: 'bg-purple-100 text-purple-700',
  client_specific: 'bg-amber-100 text-amber-700',
};

// =====================================================
// RESUME CARD
// =====================================================

function ResumeCard({
  resume,
  isLatest,
  onDownload,
  onPreview,
}: {
  resume: Resume;
  isLatest: boolean;
  onDownload?: () => void;
  onPreview?: () => void;
}) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 border transition-all',
        isLatest
          ? 'bg-gradient-to-br from-stone-50 to-stone-100/50 border-stone-200'
          : 'bg-white border-stone-100 hover:border-stone-200'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-lg border flex items-center justify-center',
              isLatest ? 'bg-white border-stone-200' : 'bg-stone-50 border-stone-100'
            )}
          >
            <FileText className={cn('w-5 h-5', isLatest ? 'text-rust' : 'text-stone-400')} />
          </div>
          <div>
            <p className="font-medium text-charcoal text-sm">{resume.fileName}</p>
            <p className="text-xs text-stone-500">
              v{resume.version} • {formatFileSize(resume.fileSize)}
            </p>
          </div>
        </div>
        {isLatest && (
          <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px]">
            Latest
          </Badge>
        )}
      </div>

      {/* Resume Type & Title */}
      <div className="flex gap-2 mb-3">
        {resume.resumeType && (
          <Badge
            variant="secondary"
            className={cn(
              'text-[10px] font-bold uppercase',
              RESUME_TYPE_COLORS[resume.resumeType] || 'bg-stone-100 text-stone-600'
            )}
          >
            {resume.resumeType.replace('_', ' ')}
          </Badge>
        )}
        {resume.title && (
          <Badge variant="secondary" className="text-[10px] bg-stone-100 text-stone-600">
            {resume.title}
          </Badge>
        )}
      </div>

      {/* AI Summary */}
      {resume.aiSummary && (
        <p className="text-xs text-stone-600 mb-3 line-clamp-2">{resume.aiSummary}</p>
      )}

      {/* Extracted Skills */}
      {resume.extractedSkills && resume.extractedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {resume.extractedSkills.slice(0, 5).map((skill, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 bg-rust/10 text-rust rounded text-[10px]"
            >
              {skill}
            </span>
          ))}
          {resume.extractedSkills.length > 5 && (
            <span className="text-[10px] text-stone-400">
              +{resume.extractedSkills.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Upload Date */}
      <div className="flex items-center gap-1 text-[10px] text-stone-400 mb-3">
        <Clock className="w-3 h-3" />
        Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onPreview && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={onPreview}
          >
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
        )}
        {onDownload && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={onDownload}
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        )}
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function TalentResumeSection({
  talentId: _talentId,
  talentName: _talentName,
  resumes,
  isLoading = false,
  onUpload,
  onDownload,
  onPreview,
  className,
}: TalentResumeSectionProps) {
  const [showVersions, setShowVersions] = useState(false);

  const latestResume = resumes.find((r) => r.isLatest);
  const olderVersions = resumes.filter((r) => !r.isLatest);

  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-2xl p-6 border border-stone-100', className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-2xl p-6 border border-stone-100', className)}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-charcoal flex items-center gap-2">
          <FileText className="w-4 h-4" /> Resume
        </h3>
        {onUpload && (
          <Button variant="ghost" size="sm" onClick={onUpload} className="text-rust">
            <FileUp className="w-4 h-4 mr-1" />
            New Version
          </Button>
        )}
      </div>

      {latestResume ? (
        <div className="space-y-4">
          {/* Latest Resume */}
          <ResumeCard
            resume={latestResume}
            isLatest
            onDownload={onDownload ? () => onDownload(latestResume.fileId) : undefined}
            onPreview={onPreview ? () => onPreview(latestResume.fileId) : undefined}
          />

          {/* Version History Toggle */}
          {olderVersions.length > 0 && (
            <div>
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="flex items-center gap-2 text-xs text-stone-500 hover:text-charcoal transition-colors w-full justify-center py-2"
              >
                <History className="w-3 h-3" />
                {showVersions
                  ? 'Hide version history'
                  : `Show ${olderVersions.length} older version${olderVersions.length > 1 ? 's' : ''}`}
                {showVersions ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {/* Older Versions */}
              {showVersions && (
                <div className="space-y-3 mt-3 pt-3 border-t border-stone-100">
                  {olderVersions.map((resume) => (
                    <ResumeCard
                      key={resume.id}
                      resume={resume}
                      isLatest={false}
                      onDownload={
                        onDownload ? () => onDownload(resume.fileId) : undefined
                      }
                      onPreview={onPreview ? () => onPreview(resume.fileId) : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-stone-200">
          <FileText className="w-10 h-10 mx-auto text-stone-300 mb-3" />
          <p className="text-stone-500 font-medium mb-2">No resume uploaded</p>
          <p className="text-sm text-stone-400 mb-4">
            Upload a resume to improve matching accuracy
          </p>
          {onUpload && (
            <Button onClick={onUpload} variant="outline" size="sm">
              <FileUp className="w-4 h-4 mr-2" />
              Upload Resume
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default TalentResumeSection;
