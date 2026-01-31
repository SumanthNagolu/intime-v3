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
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CandidateData } from '@/types/candidate-workspace'
import { useRouter } from 'next/navigation'

interface CandidateCinematicHeaderProps {
  candidate: CandidateData
  scrolled?: boolean
  onAction?: (action: string) => void
}

export function CandidateCinematicHeader({ 
  candidate, 
  scrolled,
  onAction 
}: CandidateCinematicHeaderProps) {
  const router = useRouter()

  return (
    <div className={cn(
      "sticky top-0 z-50 transition-all duration-300 ease-out border-b border-transparent",
      scrolled 
        ? "bg-white/80 backdrop-blur-xl border-white/20 shadow-sm py-3 px-8" 
        : "bg-transparent py-6 px-8"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-white/40 hover:bg-white/60 text-charcoal-600"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className={cn(
                "font-bold text-charcoal-900 tracking-tight transition-all duration-300",
                scrolled ? "text-lg" : "text-2xl"
              )}>
                {candidate.fullName}
              </h1>
              <Badge 
                variant="outline" 
                className={cn(
                  "border-transparent",
                  candidate.status === 'active' ? "bg-emerald-500/10 text-emerald-700" : "bg-charcoal-500/10 text-charcoal-600"
                )}
              >
                {candidate.status}
              </Badge>
              {candidate.isOnHotlist && (
                <Star className="h-4 w-4 text-gold-500 fill-gold-500 animate-pulse-slow" />
              )}
            </div>
            {!scrolled && (
              <p className="text-sm text-charcoal-500 font-medium">
                {candidate.title} {candidate.currentCompany && <span className="opacity-50 mx-1">@</span>} {candidate.currentCompany}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="glass-button text-charcoal-600 hover:text-charcoal-900"
            onClick={() => onAction?.('message')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            className="bg-charcoal-900 hover:bg-charcoal-800 text-white shadow-lg shadow-charcoal-900/20"
            onClick={() => onAction?.('submitToJob')}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8 text-charcoal-500">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
