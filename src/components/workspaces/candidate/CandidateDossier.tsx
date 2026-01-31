'use client'

import * as React from 'react'
import {
  Briefcase,
  GraduationCap,
  Building2,
  GitCommit,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { 
  CandidateData, 
  CandidateWorkHistory, 
  CandidateEducation, 
  CandidateSubmission 
} from '@/types/candidate-workspace'
import { PIPELINE_STAGES, getStageFromStatus } from '@/lib/pipeline/stages'

interface CandidateDossierProps {
  candidate: CandidateData
  workHistory: CandidateWorkHistory[]
  education: CandidateEducation[]
  submissions: CandidateSubmission[]
}

export function CandidateDossier({ 
  candidate, 
  workHistory, 
  education, 
  submissions 
}: CandidateDossierProps) {
  
  const sortedWork = [...workHistory].sort((a, b) => {
    if (a.isCurrent) return -1
    if (b.isCurrent) return 1
    if (!a.endDate) return -1
    if (!b.endDate) return 1
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
  })

  const activeSubmissions = submissions
    .filter(s => !['placed', 'rejected', 'withdrawn'].includes(s.status))

  return (
    <div className="max-w-3xl space-y-12 pb-20">
      
      {/* 1. Header (Dossier Title) */}
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-charcoal-900 tracking-tight">
          {candidate.headline || candidate.title || "Candidate Profile"}
        </h1>
        <p className="text-base text-charcoal-600 leading-relaxed">
          {candidate.professionalSummary || "No summary provided."}
        </p>
      </div>

      {/* 2. Active Pipeline (Linear List) */}
      {activeSubmissions.length > 0 && (
        <div className="space-y-4">
          <SectionHeader title="Active Opportunities" count={activeSubmissions.length} />
          <div className="border border-charcoal-100 rounded-lg overflow-hidden bg-white">
            {activeSubmissions.map((sub, i) => (
              <PipelineRow 
                key={sub.id} 
                submission={sub} 
                isLast={i === activeSubmissions.length - 1} 
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. Experience (Timeline) */}
      <div className="space-y-6">
        <SectionHeader title="Experience" />
        <div className="relative border-l border-charcoal-200 ml-3 space-y-8 pl-8 py-2">
          {sortedWork.map((job) => (
            <div key={job.id} className="relative group">
              <div className="absolute -left-[37px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-charcoal-200 group-hover:bg-charcoal-900 transition-colors" />
              
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium text-charcoal-900">{job.jobTitle}</h3>
                  <span className="text-xs text-charcoal-500 font-mono">
                    {formatDate(job.startDate)} — {job.isCurrent ? 'Present' : formatDate(job.endDate)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-charcoal-600">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{job.companyName}</span>
                  {job.location && <span className="text-charcoal-400">• {job.location}</span>}
                </div>

                {job.description && (
                  <p className="text-sm text-charcoal-600 leading-relaxed max-w-2xl pt-1">
                    {job.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Education */}
      {education.length > 0 && (
        <div className="space-y-6">
          <SectionHeader title="Education" />
          <div className="grid gap-4">
            {education.map(edu => (
              <div key={edu.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-charcoal-50 transition-colors border border-transparent hover:border-charcoal-100">
                <div className="h-10 w-10 flex items-center justify-center rounded bg-charcoal-100 text-charcoal-500">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-charcoal-900">{edu.institutionName}</h4>
                  <p className="text-sm text-charcoal-600">{edu.degreeDisplay || edu.degreeName}</p>
                  <p className="text-xs text-charcoal-400 mt-1">{edu.year || formatDate(edu.endDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

function SectionHeader({ title, count }: { title: string, count?: number }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-charcoal-100">
      <h2 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">{title}</h2>
      {count && (
        <span className="text-xs font-medium text-charcoal-400 bg-charcoal-100 px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  )
}

function PipelineRow({ submission, isLast }: { submission: CandidateSubmission, isLast: boolean }) {
  const stage = PIPELINE_STAGES.find(s => s.id === getStageFromStatus(submission.status))
  
  return (
    <div className={cn(
      "flex items-center justify-between p-3 hover:bg-charcoal-50 transition-colors cursor-pointer group",
      !isLast && "border-b border-charcoal-100"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("w-2 h-2 rounded-full", stage?.bgColor?.replace('bg-', 'bg-') || 'bg-charcoal-300')} />
        <div>
          <div className="text-sm font-medium text-charcoal-900">{submission.job?.title || 'Unknown Job'}</div>
          <div className="text-xs text-charcoal-500">{submission.account?.name}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-charcoal-500 px-2 py-1 rounded bg-charcoal-100">
          {stage?.label || submission.status}
        </span>
        <ArrowRight className="h-4 w-4 text-charcoal-300 group-hover:text-charcoal-600" />
      </div>
    </div>
  )
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
