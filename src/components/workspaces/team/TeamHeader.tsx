'use client'

import * as React from 'react'
import { UsersRound, Copy, Check, Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { TeamEntityData } from '@/types/workspace'
import { useToast } from '@/components/ui/use-toast'

interface TeamHeaderProps {
  team: TeamEntityData
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  active: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    dot: 'bg-success-500',
    border: 'border-success-200'
  },
  inactive: {
    bg: 'bg-charcoal-100',
    text: 'text-charcoal-600',
    dot: 'bg-charcoal-400',
    border: 'border-charcoal-200'
  },
  archived: {
    bg: 'bg-error-50',
    text: 'text-error-700',
    dot: 'bg-error-500',
    border: 'border-error-200'
  },
}

const GROUP_TYPE_CONFIG: Record<string, { bg: string; text: string }> = {
  team: { bg: 'bg-blue-50', text: 'text-blue-700' },
  division: { bg: 'bg-purple-50', text: 'text-purple-700' },
  branch: { bg: 'bg-forest-50', text: 'text-forest-700' },
  satellite_office: { bg: 'bg-amber-50', text: 'text-amber-700' },
  producer: { bg: 'bg-gold-50', text: 'text-gold-700' },
  root: { bg: 'bg-charcoal-100', text: 'text-charcoal-700' },
}

/**
 * TeamHeader - Premium entity header with visual hierarchy
 *
 * Hublot-inspired design: Clean information display only.
 * All actions are centralized in the sidebar Quick Actions panel.
 */
export function TeamHeader({ team }: TeamHeaderProps) {
  const { toast } = useToast()
  const [copied, setCopied] = React.useState(false)

  const statusConfig = team.isActive ? STATUS_CONFIG.active : STATUS_CONFIG.inactive
  const groupTypeConfig = GROUP_TYPE_CONFIG[team.groupType] || GROUP_TYPE_CONFIG.team

  // Format "Since" date
  const sinceDate = team.createdAt
    ? new Date(team.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    : null

  // Copy team ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(team.id)
    setCopied(true)
    toast({ title: 'Team ID copied to clipboard' })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal-50/30 via-transparent to-gold-50/20" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-forest-500 via-gold-500 to-forest-500" />

      <div className="relative p-6">
        <div className="flex items-start gap-5">
          {/* Icon with gradient */}
          <div className="relative group">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-lg shadow-forest-500/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-forest-500/30 group-hover:scale-105">
              <UsersRound className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight truncate">
                {team.name}
              </h1>
              <Badge className={cn(
                'capitalize font-medium px-2.5 py-0.5 flex items-center gap-1.5',
                statusConfig.bg,
                statusConfig.text,
                statusConfig.border
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                {team.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge className={cn(
                'capitalize font-medium px-2.5 py-0.5',
                groupTypeConfig.bg,
                groupTypeConfig.text
              )}>
                {team.groupType.replace(/_/g, ' ')}
              </Badge>
            </div>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-charcoal-500">
              {team.code && (
                <span className="font-medium text-charcoal-600">Code: {team.code}</span>
              )}
              {team.parentGroup && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  Parent: <span className="font-medium text-charcoal-600">{team.parentGroup.name}</span>
                </span>
              )}
              {team.city && team.state && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  {team.city}, {team.state}
                </span>
              )}
              {sinceDate && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  Since {sinceDate}
                </span>
              )}
              {team.manager && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  Manager: <span className="font-medium text-charcoal-700">{team.manager.fullName}</span>
                </span>
              )}
            </div>

            {/* ID and contact row */}
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-charcoal-600 transition-colors font-mono"
              >
                <span className="bg-charcoal-100 px-1.5 py-0.5 rounded">ID: {team.id.slice(0, 8)}...</span>
                {copied ? (
                  <Check className="h-3 w-3 text-success-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              {team.email && (
                <a
                  href={`mailto:${team.email}`}
                  className="inline-flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700 transition-colors"
                >
                  <Mail className="h-3 w-3" />
                  {team.email}
                </a>
              )}
              {team.phone && (
                <a
                  href={`tel:${team.phone}`}
                  className="inline-flex items-center gap-1 text-xs text-charcoal-500 hover:text-charcoal-700 transition-colors"
                >
                  <Phone className="h-3 w-3" />
                  {team.phone}
                </a>
              )}
            </div>

            {/* Description */}
            {team.description && (
              <p className="mt-3 text-sm text-charcoal-600 line-clamp-2">
                {team.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamHeader
