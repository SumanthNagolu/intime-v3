'use client'

import * as React from 'react'
import {
  Mail,
  Phone,
  Linkedin,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Globe,
  Briefcase,
  Hash,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CandidateData, CandidateStats, CandidateSkill } from '@/types/candidate-workspace'
import { toast } from 'sonner'

interface CandidatePropertiesProps {
  candidate: CandidateData
  stats: CandidateStats
  skills: CandidateSkill[]
}

export function CandidateProperties({ candidate, stats, skills }: CandidatePropertiesProps) {
  const primarySkills = skills.filter(s => s.isPrimary).slice(0, 5)

  const copyToClipboard = (text: string | null) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="space-y-8 py-6">
      
      {/* Properties Group: Details */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider pl-2">Details</h3>
        <div className="space-y-0.5">
          <PropertyRow 
            icon={Mail} 
            label="Email" 
            value={candidate.email} 
            onClick={() => copyToClipboard(candidate.email)}
            actionIcon
          />
          <PropertyRow 
            icon={Phone} 
            label="Phone" 
            value={candidate.phone} 
            onClick={() => copyToClipboard(candidate.phone)}
            actionIcon
          />
          <PropertyRow 
            icon={Linkedin} 
            label="LinkedIn" 
            value={candidate.linkedinUrl ? 'View Profile' : null} 
            href={candidate.linkedinUrl || undefined}
          />
          <PropertyRow 
            icon={MapPin} 
            label="Location" 
            value={candidate.location} 
          />
          <PropertyRow 
            icon={Globe} 
            label="Visa" 
            value={candidate.workAuthorization} 
          />
        </div>
      </div>

      {/* Properties Group: Terms */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider pl-2">Terms</h3>
        <div className="space-y-0.5">
          <PropertyRow 
            icon={DollarSign} 
            label="Rate" 
            value={candidate.desiredRate ? `$${candidate.desiredRate}/${candidate.rateType || 'hr'}` : '-'} 
          />
          <PropertyRow 
            icon={Clock} 
            label="Notice" 
            value={candidate.availability === 'immediate' ? 'Immediate' : candidate.noticePeriod} 
          />
          <PropertyRow 
            icon={Briefcase} 
            label="Exp" 
            value={candidate.yearsExperience ? `${candidate.yearsExperience} years` : '-'} 
          />
        </div>
      </div>

      {/* Properties Group: Skills */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider pl-2">Skills</h3>
        <div className="px-2 flex flex-wrap gap-1.5">
          {primarySkills.map(skill => (
            <span 
              key={skill.id}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-charcoal-100 text-charcoal-700 border border-charcoal-200"
            >
              {skill.skillName}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-charcoal-500">
              +{skills.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Properties Group: System */}
      <div className="space-y-3 border-t border-charcoal-100 pt-6">
        <div className="space-y-0.5">
          <PropertyRow 
            icon={Hash} 
            label="ID" 
            value={candidate.id.slice(0, 8)} 
            mono
          />
          <PropertyRow 
            icon={Calendar} 
            label="Created" 
            value={new Date(candidate.createdAt).toLocaleDateString()} 
          />
          <PropertyRow 
            icon={User} 
            label="Owner" 
            value={candidate.owner?.fullName || 'Unassigned'} 
          />
        </div>
      </div>

    </div>
  )
}

function PropertyRow({ icon: Icon, label, value, href, onClick, actionIcon, mono }: any) {
  if (!value) return null

  const Content = (
    <>
      <div className="flex items-center gap-2 min-w-[100px] text-charcoal-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <div className={cn(
        "text-xs text-charcoal-900 truncate flex-1 text-right",
        href && "text-blue-600 hover:underline",
        mono && "font-mono"
      )}>
        {value}
      </div>
    </>
  )

  const containerClass = "flex items-center justify-between px-2 py-1.5 rounded hover:bg-charcoal-50 transition-colors cursor-default group"

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn(containerClass, "cursor-pointer")}>
        {Content}
      </a>
    )
  }

  if (onClick) {
    return (
      <div onClick={onClick} className={cn(containerClass, "cursor-pointer")}>
        {Content}
      </div>
    )
  }

  return (
    <div className={containerClass}>
      {Content}
    </div>
  )
}
