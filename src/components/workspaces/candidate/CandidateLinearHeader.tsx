'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MoreHorizontal,
  Send,
  Star,
  ChevronLeft,
  Share2,
  Download,
  MessageSquare,
  Link as LinkIcon,
  Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CandidateData } from '@/types/candidate-workspace'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CandidateLinearHeaderProps {
  candidate: CandidateData
  onAction?: (action: string) => void
}

export function CandidateLinearHeader({ 
  candidate, 
  onAction 
}: CandidateLinearHeaderProps) {
  const router = useRouter()

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied')
  }

  return (
    <div className="flex items-center justify-between py-5 px-8 border-b border-charcoal-100 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-charcoal-400 hover:text-charcoal-900 -ml-2"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-charcoal-500 font-medium text-sm">Candidates</span>
            <span className="text-charcoal-300 text-sm">/</span>
            <span className="font-semibold text-charcoal-900 text-sm">{candidate.fullName}</span>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <StatusPill status={candidate.status} />
            {candidate.isOnHotlist && (
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <ActionIcon icon={LinkIcon} onClick={copyUrl} tooltip="Copy Link" />
        <ActionIcon icon={Star} onClick={() => onAction?.('toggleHotlist')} active={candidate.isOnHotlist} activeColor="text-amber-500 fill-amber-500" />
        <div className="h-4 w-px bg-charcoal-200 mx-2" />
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs font-medium border-charcoal-200 text-charcoal-700 hover:bg-charcoal-50 hover:text-charcoal-900"
          onClick={() => onAction?.('submitToJob')}
        >
          Submit to Job
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="h-7 text-xs font-medium bg-charcoal-900 hover:bg-charcoal-800 text-white shadow-none"
          onClick={() => onAction?.('message')}
        >
          Contact
        </Button>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500',
    placed: 'bg-indigo-500',
    inactive: 'bg-charcoal-400',
    bench: 'bg-orange-500'
  }
  
  const color = styles[status] || 'bg-charcoal-400'
  
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-charcoal-50 border border-charcoal-100">
      <div className={cn("w-1.5 h-1.5 rounded-full", color)} />
      <span className="text-[10px] font-medium text-charcoal-600 uppercase tracking-wide">{status}</span>
    </div>
  )
}

function ActionIcon({ icon: Icon, onClick, tooltip, active, activeColor }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "h-7 w-7 flex items-center justify-center rounded-md hover:bg-charcoal-100 transition-colors text-charcoal-500 hover:text-charcoal-900",
        active && activeColor
      )}
      title={tooltip}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
