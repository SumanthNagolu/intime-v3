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
  Download,
  Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CandidateData, CandidateStats, CandidateSkill } from '@/types/candidate-workspace'
import { toast } from 'sonner'

interface CandidateContextPanelProps {
  candidate: CandidateData
  stats: CandidateStats
  skills: CandidateSkill[]
}

export function CandidateContextPanel({ candidate, stats, skills }: CandidateContextPanelProps) {
  const primarySkills = skills.filter(s => s.isPrimary).slice(0, 5)
  const otherSkills = skills.filter(s => !s.isPrimary).slice(0, 10)

  const copyToClipboard = (text: string | null, label: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions Card */}
      <div className="glass-panel p-1 rounded-xl bg-white/60">
        <div className="grid grid-cols-2 gap-1">
          <Button variant="ghost" className="h-14 flex flex-col items-center justify-center gap-1 hover:bg-white/80 rounded-lg">
            <Phone className="h-4 w-4 text-charcoal-500" />
            <span className="text-[10px] font-medium text-charcoal-600 uppercase tracking-wide">Call</span>
          </Button>
          <Button variant="ghost" className="h-14 flex flex-col items-center justify-center gap-1 hover:bg-white/80 rounded-lg">
            <Mail className="h-4 w-4 text-charcoal-500" />
            <span className="text-[10px] font-medium text-charcoal-600 uppercase tracking-wide">Email</span>
          </Button>
        </div>
      </div>

      {/* Contact & Info */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest px-1">Details</h3>
        
        <div className="bg-white/40 rounded-xl p-4 space-y-3 backdrop-blur-sm border border-white/20">
          <InfoItem 
            icon={Mail} 
            value={candidate.email} 
            label="Email" 
            onCopy={() => copyToClipboard(candidate.email, 'Email')} 
          />
          <InfoItem 
            icon={Phone} 
            value={candidate.phone} 
            label="Phone"
            onCopy={() => copyToClipboard(candidate.phone, 'Phone')}
          />
          <InfoItem 
            icon={Linkedin} 
            value={candidate.linkedinUrl ? 'LinkedIn Profile' : null} 
            label="Social"
            href={candidate.linkedinUrl || undefined}
          />
          <InfoItem 
            icon={MapPin} 
            value={candidate.location} 
            label="Location"
          />
          <InfoItem 
            icon={Globe} 
            value={candidate.workAuthorization} 
            label="Visa Status"
          />
        </div>
      </div>

      {/* Rate & Availability */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest px-1">Terms</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/40 rounded-xl p-4 backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-2 mb-1 text-charcoal-500">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Rate</span>
            </div>
            <div className="text-lg font-bold text-charcoal-900">
              {candidate.desiredRate ? `$${candidate.desiredRate}` : '-'}
            </div>
            <div className="text-[10px] text-charcoal-500 font-medium">
              / {candidate.rateType || 'hr'}
            </div>
          </div>

          <div className="bg-white/40 rounded-xl p-4 backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-2 mb-1 text-charcoal-500">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Notice</span>
            </div>
            <div className="text-lg font-bold text-charcoal-900">
              {candidate.availability === 'immediate' ? 'Now' : candidate.noticePeriod || '-'}
            </div>
            <div className="text-[10px] text-charcoal-500 font-medium">
              Availability
            </div>
          </div>
        </div>
      </div>

      {/* Skills Cloud */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest px-1">Skills</h3>
        <div className="flex flex-wrap gap-1.5">
          {primarySkills.map(skill => (
            <Badge 
              key={skill.id} 
              variant="secondary" 
              className="bg-charcoal-900 text-white hover:bg-charcoal-700 px-2 py-1 rounded-md"
            >
              {skill.skillName}
            </Badge>
          ))}
          {otherSkills.map(skill => (
            <Badge 
              key={skill.id} 
              variant="outline" 
              className="bg-white/40 text-charcoal-600 border-charcoal-200/50 hover:bg-white/60 cursor-pointer"
            >
              {skill.skillName}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats Mini-Grid */}
      <div className="pt-6 border-t border-charcoal-200/20">
        <div className="grid grid-cols-3 gap-2 text-center">
          <StatBox value={stats.activeSubmissions} label="Active" />
          <StatBox value={stats.interviews} label="Interviews" />
          <StatBox value={stats.placements} label="Placed" />
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, value, label, onCopy, href }: any) {
  if (!value) return null
  
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-charcoal-50 flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors">
          <Icon className="h-4 w-4 text-charcoal-500" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-charcoal-400 font-medium uppercase tracking-wide">{label}</span>
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-charcoal-900 truncate hover:text-blue-600 hover:underline cursor-pointer">
              {value}
            </a>
          ) : (
            <span className="text-sm font-medium text-charcoal-900 truncate" title={value}>{value}</span>
          )}
        </div>
      </div>
      {onCopy && (
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={onCopy}>
          <Copy className="h-3 w-3 text-charcoal-400" />
        </Button>
      )}
    </div>
  )
}

function StatBox({ value, label }: { value: number, label: string }) {
  return (
    <div className="p-2 rounded-lg bg-charcoal-50/50">
      <div className="text-lg font-bold text-charcoal-900">{value}</div>
      <div className="text-[9px] text-charcoal-500 uppercase tracking-wider">{label}</div>
    </div>
  )
}
