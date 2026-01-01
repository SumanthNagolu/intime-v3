'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Plus,
  Eye,
  Copy,
  MoreHorizontal,
  Calendar,
  User,
  Send,
  Briefcase,
  Star,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { CandidateProfile } from '@/types/candidate-workspace'
import { formatDistanceToNow, format } from 'date-fns'

interface CandidateProfilesSectionProps {
  profiles: CandidateProfile[]
  candidateId: string
  candidateName: string
  onCreateProfile?: () => void
}

const TEMPLATE_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  technical: { label: 'Technical', color: 'bg-blue-100 text-blue-700', description: 'Skills-focused profile for technical roles' },
  leadership: { label: 'Leadership', color: 'bg-purple-100 text-purple-700', description: 'Leadership experience and achievements' },
  executive: { label: 'Executive', color: 'bg-gold-100 text-gold-700', description: 'Executive summary and strategic focus' },
  general: { label: 'General', color: 'bg-charcoal-100 text-charcoal-700', description: 'Comprehensive overview profile' },
}

/**
 * CandidateProfilesSection - Displays marketing profiles for the candidate
 *
 * Profiles are prepared versions of the candidate's resume/experience
 * tailored for specific types of opportunities.
 */
export function CandidateProfilesSection({
  profiles,
  candidateId,
  candidateName,
  onCreateProfile,
}: CandidateProfilesSectionProps) {
  const handleCreateProfile = () => {
    if (onCreateProfile) {
      onCreateProfile()
    } else {
      window.dispatchEvent(
        new CustomEvent('openCandidateDialog', {
          detail: { dialogId: 'createProfile', candidateId },
        })
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-900">Marketing Profiles</h2>
          <p className="text-sm text-charcoal-500">
            {profiles.length} prepared profile{profiles.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleCreateProfile}>
          <Plus className="h-4 w-4 mr-2" />
          Create Profile
        </Button>
      </div>

      {/* Profiles Grid */}
      {profiles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              candidateId={candidateId}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-charcoal-300 mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">
              No Profiles Created Yet
            </h3>
            <p className="text-sm text-charcoal-500 mb-4 max-w-md mx-auto">
              Create marketing profiles to present {candidateName} effectively for different types of roles.
            </p>
            <Button onClick={handleCreateProfile}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Profile Card Component
function ProfileCard({
  profile,
  candidateId,
}: {
  profile: CandidateProfile
  candidateId: string
}) {
  const templateConfig = TEMPLATE_CONFIG[profile.templateType || 'general'] || TEMPLATE_CONFIG.general

  const handleView = () => {
    window.dispatchEvent(
      new CustomEvent('openCandidateDialog', {
        detail: { dialogId: 'viewProfile', candidateId, profileId: profile.id },
      })
    )
  }

  const handleDuplicate = () => {
    window.dispatchEvent(
      new CustomEvent('openCandidateDialog', {
        detail: { dialogId: 'duplicateProfile', candidateId, profileId: profile.id },
      })
    )
  }

  const handleSubmit = () => {
    window.dispatchEvent(
      new CustomEvent('openCandidateDialog', {
        detail: { dialogId: 'submitWithProfile', candidateId, profileId: profile.id },
      })
    )
  }

  return (
    <Card className="hover:shadow-elevation-md transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-charcoal-100">
              <FileText className="h-5 w-5 text-charcoal-600" />
            </div>
            <div>
              <h3 className="font-medium text-charcoal-900">{profile.name}</h3>
              <Badge className={cn('mt-1', templateConfig.color)}>
                {templateConfig.label}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSubmit}>
                <Send className="h-4 w-4 mr-2" />
                Submit with Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-sm text-charcoal-500">
          {profile.createdBy && (
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Created by {profile.createdBy.fullName}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(profile.createdAt), 'MMM d, yyyy')}
          </div>
          {profile.usageCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Used {profile.usageCount} time{profile.usageCount !== 1 ? 's' : ''}
              {profile.lastUsedAt && (
                <span className="text-charcoal-400">
                  · Last: {formatDistanceToNow(new Date(profile.lastUsedAt), { addSuffix: true })}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-charcoal-100">
          <Button variant="outline" size="sm" onClick={handleView} className="flex-1">
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View
          </Button>
          <Button size="sm" onClick={handleSubmit} className="flex-1">
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CandidateProfilesSection
