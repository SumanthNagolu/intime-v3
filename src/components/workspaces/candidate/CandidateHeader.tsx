'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  Star,
  Send,
  MoreHorizontal,
  ClipboardCheck,
  FileText,
  DollarSign,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { CandidateData, CandidateStats } from '@/types/candidate-workspace'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface CandidateHeaderProps {
  candidate: CandidateData
  stats: CandidateStats
  onAction?: (action: string) => void
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-success-100 text-success-700 border-success-200',
  screening: 'bg-blue-100 text-blue-700 border-blue-200',
  sourced: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
  placed: 'bg-gold-100 text-gold-700 border-gold-200',
  bench: 'bg-orange-100 text-orange-700 border-orange-200',
  inactive: 'bg-charcoal-100 text-charcoal-500 border-charcoal-200',
  archived: 'bg-charcoal-50 text-charcoal-400 border-charcoal-100',
}

/**
 * CandidateHeader - Bullhorn-style header for candidate workspace
 *
 * Features:
 * - Avatar, name, title, location
 * - Status badge and hotlist indicator
 * - Contact info (email, phone, LinkedIn)
 * - Quick stats (active submissions, interviews, placements)
 * - Action buttons: Call, Email, Submit
 * - Dropdown: Start Screening, Create Profile, Toggle Hotlist
 */
export function CandidateHeader({ candidate, stats, onAction }: CandidateHeaderProps) {
  const router = useRouter()
  const statusStyle = STATUS_STYLES[candidate.status] || STATUS_STYLES.active

  // Hotlist mutations
  const addToHotlistMutation = trpc.ats.candidates.addToHotlist.useMutation({
    onSuccess: () => {
      toast.success('Added to hotlist')
      router.refresh()
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to add to hotlist')
    },
  })

  const removeFromHotlistMutation = trpc.ats.candidates.removeFromHotlist.useMutation({
    onSuccess: () => {
      toast.success('Removed from hotlist')
      router.refresh()
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to remove from hotlist')
    },
  })

  // Build location string
  const locationParts: string[] = []
  if (candidate.city) locationParts.push(candidate.city)
  if (candidate.state) locationParts.push(candidate.state)
  const locationDisplay = locationParts.join(', ')

  // Handle actions
  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action)
    } else {
      // Dispatch custom event for dialog handling
      window.dispatchEvent(
        new CustomEvent('openCandidateDialog', {
          detail: { dialogId: action, candidateId: candidate.id },
        })
      )
    }
  }

  const handleToggleHotlist = () => {
    if (candidate.isOnHotlist) {
      removeFromHotlistMutation.mutate({ candidateId: candidate.id })
    } else {
      addToHotlistMutation.mutate({ candidateId: candidate.id })
    }
  }

  return (
    <div className="bg-white rounded-lg border border-charcoal-200 p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
          <User className="h-7 w-7 text-charcoal-600" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-semibold text-charcoal-900 truncate">
              {candidate.fullName}
            </h1>
            <Badge className={cn('capitalize', statusStyle)}>
              {candidate.status}
            </Badge>
            {candidate.isOnHotlist && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                <Star className="h-3 w-3 mr-1 fill-amber-500" />
                Hotlist
              </Badge>
            )}
          </div>

          {/* Subtitle row */}
          <div className="flex items-center gap-2 text-charcoal-600 text-sm flex-wrap">
            {candidate.title && (
              <span className="font-medium">{candidate.title}</span>
            )}
            {candidate.currentCompany && (
              <>
                {candidate.title && <span>@</span>}
                <span>{candidate.currentCompany}</span>
              </>
            )}
            {locationDisplay && (
              <span className="flex items-center gap-1 text-charcoal-500">
                <MapPin className="h-3.5 w-3.5" />
                {locationDisplay}
              </span>
            )}
          </div>

          {/* Contact info row */}
          <div className="flex items-center gap-4 mt-3 text-sm text-charcoal-600">
            {candidate.email && (
              <a
                href={`mailto:${candidate.email}`}
                className="flex items-center gap-1.5 hover:text-charcoal-900 transition-colors"
              >
                <Mail className="h-4 w-4" />
                {candidate.email}
              </a>
            )}
            {candidate.phone && (
              <a
                href={`tel:${candidate.phone}`}
                className="flex items-center gap-1.5 hover:text-charcoal-900 transition-colors"
              >
                <Phone className="h-4 w-4" />
                {candidate.phone}
              </a>
            )}
            {candidate.linkedinUrl && (
              <a
                href={candidate.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-charcoal-900 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            )}
          </div>

          {/* Quick stats row */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-1.5 text-charcoal-600">
              <Send className="h-4 w-4" />
              <span className="font-medium text-charcoal-900">{stats.activeSubmissions}</span>
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-charcoal-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium text-charcoal-900">{stats.interviews}</span>
              <span>Interviews</span>
            </div>
            <div className="flex items-center gap-1.5 text-charcoal-600">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium text-charcoal-900">{stats.placements}</span>
              <span>Placements</span>
            </div>
            {candidate.desiredRate && (
              <div className="flex items-center gap-1.5 text-charcoal-600">
                <span className="font-medium text-charcoal-900">
                  ${candidate.desiredRate}/hr
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {candidate.phone && (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${candidate.phone}`}>
                <Phone className="h-4 w-4 mr-1.5" />
                Call
              </a>
            </Button>
          )}
          {candidate.email && (
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${candidate.email}`}>
                <Mail className="h-4 w-4 mr-1.5" />
                Email
              </a>
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => handleAction('submitToJob')}
          >
            <Send className="h-4 w-4 mr-1.5" />
            Submit
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleAction('startScreening')}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Start Screening
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('createProfile')}>
                <FileText className="h-4 w-4 mr-2" />
                Create Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('generateResume')}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Resume
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggleHotlist}>
                <Star className={cn(
                  'h-4 w-4 mr-2',
                  candidate.isOnHotlist && 'fill-amber-500 text-amber-500'
                )} />
                {candidate.isOnHotlist ? 'Remove from Hotlist' : 'Add to Hotlist'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export default CandidateHeader
