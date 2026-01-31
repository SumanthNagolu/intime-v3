'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Pencil,
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Send,
  Award,
  ShieldCheck,
  FileText,
  Building2,
  Globe,
  Linkedin,
  Download,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  CandidateData,
  CandidateSkill,
  CandidateWorkHistory,
  CandidateEducation,
  CandidateCertification,
  CandidateSubmission,
  CandidateStats,
} from '@/types/candidate-workspace'
import { PROFICIENCY_LABELS, EMPLOYMENT_TYPE_LABELS, DEGREE_TYPE_LABELS } from '@/types/candidate-workspace'
import { formatDistanceToNow } from 'date-fns'
import { PIPELINE_STAGES, getStageFromStatus } from '@/lib/pipeline/stages'

interface CandidateSummarySectionProps {
  candidate: CandidateData
  skills: CandidateSkill[]
  workHistory: CandidateWorkHistory[]
  education: CandidateEducation[]
  certifications: CandidateCertification[]
  submissions: CandidateSubmission[]
  stats: CandidateStats
  onNavigate: (section: string) => void
}

// Format availability for display
function formatAvailability(availability: string | null): string {
  if (!availability) return 'Not Set'
  const labels: Record<string, string> = {
    immediate: 'Immediately Available',
    '2_weeks': '2 Weeks Notice',
    '30_days': '30 Days Notice',
    '60_days': '60 Days Notice',
    not_available: 'Not Currently Available',
  }
  return labels[availability] || availability
}

// Format rate for display
function formatRate(rate: number | null, currency = 'USD', rateType = 'hourly'): string {
  if (!rate) return '-'
  const symbols: Record<string, string> = { USD: '$', CAD: 'C$', EUR: '€', GBP: '£', INR: '₹' }
  const suffixes: Record<string, string> = { hourly: '/hr', annual: '/yr', per_diem: '/day' }
  return `${symbols[currency] || '$'}${rate.toLocaleString()}${suffixes[rateType] || '/hr'}`
}

// Format date range for work history/education
function formatDateRange(startDate: string | null, endDate: string | null, isCurrent: boolean): string {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  if (!startDate) return isCurrent ? 'Present' : '-'
  const start = formatDate(startDate)
  const end = isCurrent ? 'Present' : (endDate ? formatDate(endDate) : '-')
  return `${start} - ${end}`
}

// Format employment types for display
function formatEmploymentTypes(types: string[] | null): string {
  if (!types || types.length === 0) return '-'
  const labels: Record<string, string> = {
    full_time: 'Full-Time',
    contract: 'Contract',
    contract_to_hire: 'C2H',
    part_time: 'Part-Time',
  }
  return types.map(t => labels[t] || t).join(', ')
}

// Format work modes for display
function formatWorkModes(modes: string[] | null): string {
  if (!modes || modes.length === 0) return '-'
  const labels: Record<string, string> = {
    on_site: 'On-Site',
    remote: 'Remote',
    hybrid: 'Hybrid',
  }
  return modes.map(m => labels[m] || m).join(', ')
}

import { CandidateOverviewEditDialog } from '../dialogs/CandidateOverviewEditDialog'
import { CandidateWorkAuthEditDialog } from '../dialogs/CandidateWorkAuthEditDialog'
import { CandidateSkillsEditDialog } from '../dialogs/CandidateSkillsEditDialog'

/**
 * CandidateSummarySection - Cinematic Enterprise Redesign
 * Features: Glassmorphism, Mesh Gradients, Premium Typography
 */
export function CandidateSummarySection({
  candidate,
  skills,
  workHistory,
  education,
  certifications,
  submissions,
  stats,
  onNavigate,
}: CandidateSummarySectionProps) {
  const [showProfileEdit, setShowProfileEdit] = React.useState(false)
  const [showAuthEdit, setShowAuthEdit] = React.useState(false)
  const [showSkillsEdit, setShowSkillsEdit] = React.useState(false)

  // Get active submissions (top 5)
  const activeSubmissions = submissions
    .filter((s) => !['placed', 'rejected', 'withdrawn'].includes(s.status))
    .slice(0, 5)

  // Get top 3 work history entries
  const recentJobs = workHistory.slice(0, 3)

  // Get most recent education
  const recentEducation = education.slice(0, 2)

  // Get active certifications
  const activeCerts = certifications.filter(c => c.expiryStatus !== 'expired').slice(0, 4)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Edit Dialogs */}
      <CandidateOverviewEditDialog open={showProfileEdit} onOpenChange={setShowProfileEdit} />
      <CandidateWorkAuthEditDialog open={showAuthEdit} onOpenChange={setShowAuthEdit} />
      <CandidateSkillsEditDialog open={showSkillsEdit} onOpenChange={setShowSkillsEdit} />

      {/* Hero Header - Cinematic Mesh Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-mesh-cinematic p-8 shadow-premium-lg group">
         <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
         <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50 pointer-events-none" />
         
         <div className="relative z-10 flex items-start justify-between">
           <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-2xl border-2 border-white/60 bg-white shadow-lg overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                 {candidate.avatarUrl ? (
                    <img src={candidate.avatarUrl} alt={candidate.fullName} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-charcoal-50 text-charcoal-300">
                       <UserIcon className="w-10 h-10" />
                    </div>
                 )}
                 <div className="absolute bottom-0 right-0 p-1">
                    <div className={cn("w-4 h-4 rounded-full border-2 border-white", 
                       candidate.status === 'active' ? "bg-emerald-500" : "bg-charcoal-400"
                    )} />
                 </div>
              </div>
              
              <div className="space-y-3 pt-1">
                 <div>
                    <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight leading-none mb-2">
                       {candidate.fullName}
                    </h1>
                    <div className="flex items-center gap-3 text-charcoal-600">
                       <span className="text-lg font-medium">{candidate.title || 'Candidate'}</span>
                       {candidate.location && (
                          <>
                             <span className="w-1 h-1 rounded-full bg-charcoal-400" />
                             <span className="text-sm flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {candidate.location}
                             </span>
                          </>
                       )}
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3 pt-1">
                    <Button size="sm" className="glass-button-primary h-8 px-4 text-xs uppercase tracking-wider font-semibold">
                       <Download className="w-3 h-3 mr-2" /> Resume
                    </Button>
                    {candidate.linkedinUrl && (
                       <Button size="sm" variant="ghost" className="glass-button h-8 w-8 p-0" asChild>
                          <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                             <Linkedin className="w-4 h-4 text-[#0077b5]" />
                          </a>
                       </Button>
                    )}
                 </div>
              </div>
           </div>

           {/* Hero Stats */}
           <div className="flex gap-4">
              <div className="glass-panel p-4 rounded-xl backdrop-blur-md bg-white/40 min-w-[140px]">
                 <div className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-1">Experience</div>
                 <div className="text-2xl font-bold text-charcoal-900">{candidate.yearsExperience ? `${candidate.yearsExperience}y` : '-'}</div>
                 <div className="text-xs text-charcoal-600 font-medium mt-1">Senior Level</div>
              </div>
              <div className="glass-panel p-4 rounded-xl backdrop-blur-md bg-white/40 min-w-[140px]">
                 <div className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-1">Rate</div>
                 <div className="text-2xl font-bold text-forest-700">
                    {formatRate(candidate.desiredRate, candidate.rateCurrency, candidate.rateType || 'hourly').split('/')[0]}
                 </div>
                 <div className="text-xs text-charcoal-600 font-medium mt-1">/ {candidate.rateType || 'hr'}</div>
              </div>
           </div>
         </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
         {/* Left Column - 8 cols */}
         <div className="col-span-8 space-y-8">
            
            {/* Profile Details - Glass Panel */}
            <div className="glass-panel rounded-2xl overflow-hidden animate-slide-up">
               <div className="px-6 py-4 border-b border-white/20 flex items-center justify-between bg-white/40">
                  <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-widest flex items-center gap-2">
                     <UserIcon className="h-4 w-4 text-forest-500" />
                     Profile Details
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowProfileEdit(true)} className="hover:bg-white/50 text-charcoal-500">
                     <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                  </Button>
               </div>
               <div className="p-6 bg-white/30">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                     <DetailRow label="Email" value={candidate.email} icon={<Mail className="h-3.5 w-3.5" />} copyable />
                     <DetailRow label="Phone" value={candidate.phone} icon={<Phone className="h-3.5 w-3.5" />} copyable />
                     <DetailRow label="Current Company" value={candidate.currentCompany} icon={<Building2 className="h-3.5 w-3.5" />} />
                     <DetailRow label="Willing to Relocate" value={candidate.willingToRelocate ? 'Yes' : 'No'} />
                  </div>
                  {candidate.professionalSummary && (
                     <div className="mt-6 pt-6 border-t border-charcoal-100/50">
                        <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-3">Professional Summary</h4>
                        <p className="text-sm text-charcoal-700 leading-relaxed">{candidate.professionalSummary}</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Work History - Glass Panel */}
            <div className="glass-panel rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
               <div className="px-6 py-4 border-b border-white/20 flex items-center justify-between bg-white/40">
                  <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-widest flex items-center gap-2">
                     <Briefcase className="h-4 w-4 text-forest-500" />
                     Work History
                  </h3>
                  <span className="text-xs font-medium bg-charcoal-100 px-2 py-0.5 rounded-full text-charcoal-600">{workHistory.length}</span>
               </div>
               <div className="p-6 bg-white/30 space-y-6">
                  {recentJobs.length > 0 ? recentJobs.map((job, index) => (
                     <div key={job.id} className="relative pl-6 border-l-2 border-charcoal-100 last:border-0 pb-2">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white bg-forest-500 shadow-sm" />
                        <div className="flex justify-between items-start mb-1">
                           <h4 className="font-bold text-charcoal-900">{job.jobTitle}</h4>
                           <span className="text-xs font-medium text-charcoal-500 bg-white/50 px-2 py-0.5 rounded-md border border-white/40">
                              {formatDateRange(job.startDate, job.endDate, job.isCurrent)}
                           </span>
                        </div>
                        <div className="text-sm font-medium text-forest-700 mb-2 flex items-center gap-1.5">
                           {job.companyName}
                           {job.location && <span className="text-charcoal-400 font-normal text-xs">• {job.location}</span>}
                        </div>
                        {job.description && (
                           <p className="text-sm text-charcoal-600 leading-relaxed mb-2">{job.description}</p>
                        )}
                        {job.achievements.length > 0 && (
                           <ul className="space-y-1">
                              {job.achievements.slice(0, 2).map((achievement, i) => (
                                 <li key={i} className="text-xs text-charcoal-500 flex items-start gap-2">
                                    <span className="w-1 h-1 rounded-full bg-charcoal-300 mt-1.5 flex-shrink-0" />
                                    {achievement}
                                 </li>
                              ))}
                           </ul>
                        )}
                     </div>
                  )) : (
                     <EmptyState icon={Briefcase} label="No work history added" />
                  )}
               </div>
            </div>

            {/* Skills - Glass Panel */}
            <div className="glass-panel rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
               <div className="px-6 py-4 border-b border-white/20 flex items-center justify-between bg-white/40">
                  <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-widest flex items-center gap-2">
                     <Award className="h-4 w-4 text-gold-500" />
                     Skills & Expertise
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowSkillsEdit(true)} className="hover:bg-white/50 text-charcoal-500">
                     <Pencil className="h-3.5 w-3.5 mr-1.5" /> Manage
                  </Button>
               </div>
               <div className="p-6 bg-white/30">
                  {skills.length > 0 ? (
                     <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                           <div key={skill.id} className="glass-button px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-charcoal-700">
                              {skill.skillName}
                              {skill.isPrimary && <Star className="w-3 h-3 text-gold-500 fill-gold-500" />}
                              {skill.yearsExperience && <span className="text-xs text-charcoal-400 border-l border-charcoal-200 pl-2 ml-1">{skill.yearsExperience}y</span>}
                           </div>
                        ))}
                     </div>
                  ) : (
                     <EmptyState icon={FileText} label="No skills added" />
                  )}
               </div>
            </div>

         </div>

         {/* Right Column - 4 cols */}
         <div className="col-span-4 space-y-6">
            
            {/* Active Submissions - Glass Panel */}
            <div className="glass-panel rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
               <div className="px-5 py-4 border-b border-white/20 bg-white/40 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Active Submissions</h3>
                  <Badge variant="secondary" className="bg-forest-50 text-forest-700 border-forest-100">{stats.activeSubmissions}</Badge>
               </div>
               <div className="p-2">
                  {activeSubmissions.length > 0 ? activeSubmissions.map(sub => {
                     const stage = PIPELINE_STAGES.find(s => s.id === getStageFromStatus(sub.status))
                     return (
                        <div key={sub.id} className="p-3 hover:bg-white/50 rounded-lg transition-colors group cursor-pointer border border-transparent hover:border-white/40">
                           <div className="font-semibold text-charcoal-900 text-sm truncate">{sub.job?.title || 'Unknown Job'}</div>
                           <div className="text-xs text-charcoal-500 truncate mb-2">{sub.account?.name}</div>
                           <div className="flex justify-between items-center">
                              {stage && (
                                 <Badge className={cn('text-[10px] px-1.5 py-0', stage.bgColor, stage.textColor)}>
                                    {stage.label}
                                 </Badge>
                              )}
                              <span className="text-[10px] text-charcoal-400">{formatDistanceToNow(new Date(sub.submittedAt || Date.now()), { addSuffix: true })}</span>
                           </div>
                        </div>
                     )
                  }) : (
                     <div className="p-8 text-center">
                        <Send className="w-8 h-8 text-charcoal-200 mx-auto mb-2" />
                        <p className="text-xs text-charcoal-400">No active submissions</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Employment Preferences */}
            <div className="glass-panel rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
               <div className="px-5 py-4 border-b border-white/20 bg-white/40">
                  <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Preferences</h3>
               </div>
               <div className="p-5 space-y-4 bg-white/30">
                  <div>
                     <div className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider mb-2">Employment Types</div>
                     <div className="flex flex-wrap gap-1.5">
                        {candidate.employmentTypes?.map(type => (
                           <Badge key={type} variant="outline" className="bg-white/50 text-charcoal-600 border-charcoal-200">{EMPLOYMENT_TYPE_LABELS[type] || type}</Badge>
                        ))}
                     </div>
                  </div>
                  <div>
                     <div className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider mb-2">Work Mode</div>
                     <div className="flex flex-wrap gap-1.5">
                        {candidate.workModes?.map(mode => (
                           <Badge key={mode} variant="outline" className="bg-white/50 text-charcoal-600 border-charcoal-200 capitalize">{mode.replace('_', ' ')}</Badge>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Education & Certs */}
            <div className="glass-panel rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
               <div className="px-5 py-4 border-b border-white/20 bg-white/40">
                  <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Education</h3>
               </div>
               <div className="p-5 bg-white/30 space-y-4">
                  {recentEducation.map(edu => (
                     <div key={edu.id}>
                        <div className="font-semibold text-charcoal-900 text-sm">{edu.institutionName}</div>
                        <div className="text-xs text-charcoal-600">{edu.degreeDisplay || edu.degreeName}</div>
                        <div className="text-[10px] text-charcoal-400 mt-0.5">{formatDateRange(edu.startDate, edu.endDate, edu.isCurrent)}</div>
                     </div>
                  ))}
                  {recentEducation.length === 0 && <div className="text-xs text-charcoal-400 italic">No education listed</div>}
               </div>
            </div>

         </div>
      </div>
    </div>
  )
}

// Format visa status for display
function formatVisaStatus(status: string | null): string | null {
  if (!status) return null
  const labels: Record<string, string> = {
    us_citizen: 'US Citizen',
    green_card: 'Green Card',
    h1b: 'H1B',
    l1: 'L1',
    tn: 'TN',
    opt: 'OPT',
    cpt: 'CPT',
    ead: 'EAD',
    other: 'Other',
  }
  return labels[status] || status
}

function DetailRow({ label, value, icon, href, copyable }: { label: string, value: string | null | undefined, icon?: React.ReactNode, href?: string, copyable?: boolean }) {
   return (
      <div className="group">
         <div className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            {icon && <span className="text-charcoal-300">{icon}</span>}
            {label}
         </div>
         <div className="text-sm font-medium text-charcoal-900 break-words">
            {href ? (
               <a href={href} target="_blank" rel="noopener noreferrer" className="text-forest-600 hover:text-forest-700 hover:underline">{value}</a>
            ) : (
               value || <span className="text-charcoal-300">-</span>
            )}
         </div>
      </div>
   )
}

function EmptyState({ icon: Icon, label }: { icon: any, label: string }) {
   return (
      <div className="flex flex-col items-center justify-center py-8 text-charcoal-400 border border-dashed border-charcoal-200 rounded-xl bg-white/20">
         <Icon className="w-8 h-8 mb-2 opacity-30" />
         <p className="text-xs font-medium">{label}</p>
      </div>
   )
}

function UserIcon(props: any) {
   return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
         <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1 .437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
      </svg>
   )
}

export default CandidateSummarySection
