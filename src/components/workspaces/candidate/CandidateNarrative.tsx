'use client'

import * as React from 'react'
import {
  Briefcase,
  GraduationCap,
  Award,
  ArrowRight,
  GitCommit,
  Calendar,
  MapPin,
  Building2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { 
  CandidateData, 
  CandidateWorkHistory, 
  CandidateEducation, 
  CandidateSubmission,
  CandidateCertification 
} from '@/types/candidate-workspace'
import { PIPELINE_STAGES, getStageFromStatus } from '@/lib/pipeline/stages'

interface CandidateNarrativeProps {
  candidate: CandidateData
  workHistory: CandidateWorkHistory[]
  education: CandidateEducation[]
  submissions: CandidateSubmission[]
  certifications: CandidateCertification[]
}

export function CandidateNarrative({ 
  candidate, 
  workHistory, 
  education, 
  submissions,
  certifications 
}: CandidateNarrativeProps) {
  
  // Sort work history by date
  const sortedWork = [...workHistory].sort((a, b) => {
    if (a.isCurrent) return -1
    if (b.isCurrent) return 1
    if (!a.endDate) return -1
    if (!b.endDate) return 1
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
  })

  // Get active submissions
  const activeSubmissions = submissions
    .filter(s => !['placed', 'rejected', 'withdrawn'].includes(s.status))

  return (
    <div className="space-y-12 pb-20">
      
      {/* 1. Identity Poster */}
      <div className="relative overflow-hidden rounded-3xl bg-mesh-cinematic p-10 shadow-premium-lg group min-h-[300px] flex flex-col justify-end">
        <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent" />
        
        <div className="relative z-10 max-w-3xl animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
             {candidate.yearsExperience && (
               <Badge className="bg-charcoal-900 text-white border-none px-3 py-1 text-xs uppercase tracking-widest shadow-lg">
                 {candidate.yearsExperience} Years Exp
               </Badge>
             )}
             {candidate.location && (
               <div className="flex items-center gap-1.5 text-charcoal-700 font-medium text-sm backdrop-blur-md bg-white/30 px-3 py-1 rounded-full">
                 <MapPin className="h-3.5 w-3.5" /> {candidate.location}
               </div>
             )}
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal-900 leading-tight tracking-tight mb-6">
            {candidate.headline || candidate.title || "Experienced Professional"}
          </h2>
          
          <p className="text-lg text-charcoal-600 leading-relaxed max-w-2xl">
            {candidate.professionalSummary || "No professional summary provided."}
          </p>
        </div>
      </div>

      {/* 2. Pipeline Visualizer (If active) */}
      {activeSubmissions.length > 0 && (
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-charcoal-400 uppercase tracking-widest">Active Pipeline</h3>
            <span className="text-xs font-medium text-forest-600 bg-forest-50 px-2 py-1 rounded-full">
              {activeSubmissions.length} Opportunities
            </span>
          </div>
          
          <div className="grid gap-4">
            {activeSubmissions.map(submission => (
              <PipelineCard key={submission.id} submission={submission} />
            ))}
          </div>
        </div>
      )}

      {/* 3. The Journey (Timeline) */}
      <div className="space-y-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h3 className="text-sm font-bold text-charcoal-400 uppercase tracking-widest px-2">Career Journey</h3>
        
        <div className="relative pl-8 space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-charcoal-200 before:via-charcoal-200 before:to-transparent">
          
          {/* Work History */}
          {sortedWork.map((job, index) => (
            <div key={job.id} className="relative">
              <div className={cn(
                "absolute -left-[29px] top-1 h-5 w-5 rounded-full border-4 border-white shadow-sm z-10",
                index === 0 ? "bg-forest-500" : "bg-charcoal-300"
              )} />
              
              <div className="glass-panel p-6 rounded-2xl bg-white/60 hover:bg-white/80 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-xl font-bold text-charcoal-900 group-hover:text-forest-700 transition-colors">
                      {job.jobTitle}
                    </h4>
                    <div className="text-sm font-semibold text-charcoal-600 flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4" />
                      {job.companyName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-charcoal-500 bg-charcoal-50 px-3 py-1 rounded-lg border border-charcoal-100">
                      {formatDate(job.startDate)} - {job.isCurrent ? 'Present' : formatDate(job.endDate)}
                    </div>
                    {job.location && (
                      <div className="text-xs text-charcoal-400 mt-1">{job.location}</div>
                    )}
                  </div>
                </div>
                
                {job.description && (
                  <p className="text-sm text-charcoal-600 leading-relaxed mt-4 line-clamp-3 group-hover:line-clamp-none transition-all">
                    {job.description}
                  </p>
                )}

                {job.achievements.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {job.achievements.slice(0, 3).map((achievement, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-charcoal-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-forest-400 mt-2 flex-shrink-0" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}

          {/* Education Marker */}
          {education.length > 0 && (
            <div className="relative pt-4">
              <div className="absolute -left-[29px] top-5 h-5 w-5 rounded-full border-4 border-white bg-charcoal-300 shadow-sm z-10 flex items-center justify-center">
                <div className="h-1.5 w-1.5 bg-white rounded-full" />
              </div>
              <div className="flex items-center gap-4 text-charcoal-400 mb-6">
                <div className="h-px flex-1 bg-charcoal-200" />
                <span className="text-xs font-bold uppercase tracking-widest bg-charcoal-50 px-3 py-1 rounded-full">Education</span>
                <div className="h-px flex-1 bg-charcoal-200" />
              </div>

              <div className="grid gap-4">
                {education.map(edu => (
                  <div key={edu.id} className="glass-panel p-5 rounded-xl bg-white/40 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-charcoal-400 shadow-sm border border-charcoal-100">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <h5 className="font-bold text-charcoal-900">{edu.institutionName}</h5>
                      <p className="text-sm text-charcoal-600">{edu.degreeDisplay || edu.degreeName}</p>
                      <p className="text-xs text-charcoal-400 mt-0.5">{edu.year ? `Class of ${edu.year}` : formatDate(edu.endDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PipelineCard({ submission }: { submission: CandidateSubmission }) {
  const stage = PIPELINE_STAGES.find(s => s.id === getStageFromStatus(submission.status))
  const progress = PIPELINE_STAGES.findIndex(s => s.id === stage?.id) + 1
  const total = PIPELINE_STAGES.length
  const percent = Math.min(100, Math.max(5, (progress / total) * 100))

  return (
    <div className="glass-panel p-5 rounded-xl bg-white border-l-4 border-l-forest-500 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h4 className="font-bold text-charcoal-900 text-lg">{submission.job?.title || 'Unknown Role'}</h4>
          <p className="text-sm font-medium text-charcoal-500">{submission.account?.name}</p>
        </div>
        <Badge className={cn("capitalize px-3 py-1", stage?.bgColor, stage?.textColor)}>
          {stage?.label || submission.status}
        </Badge>
      </div>

      {/* Metro Map Visualizer */}
      <div className="relative pt-2 pb-1 z-10">
        <div className="flex justify-between text-[10px] uppercase font-bold text-charcoal-400 mb-2">
          <span>Applied</span>
          <span>Interviewing</span>
          <span>Offer</span>
          <span>Placed</span>
        </div>
        <div className="h-2 w-full bg-charcoal-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-forest-500 to-emerald-400 transition-all duration-1000 ease-out" 
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Subtle Background Action */}
      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
        <Button size="sm" variant="ghost" className="text-forest-600 hover:text-forest-700 hover:bg-forest-50">
          View Details <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
