'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users, Mail, Phone, Plus, Star, Shield, AlertTriangle,
  ThumbsUp, ThumbsDown, Minus, UserPlus, Edit, ExternalLink,
  Crown, Target, Lightbulb, XCircle, User
} from 'lucide-react'
import type { DealStakeholder } from '@/types/deal'
import { cn } from '@/lib/utils'

interface DealStakeholdersSectionProps {
  stakeholders: DealStakeholder[]
  dealId: string
  onRefresh: () => void
  onAddStakeholder?: () => void
  onEditStakeholder?: (stakeholder: DealStakeholder) => void
}

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Star; color: string; bgColor: string }> = {
  champion: {
    label: 'Champion',
    icon: Crown,
    color: 'text-gold-700',
    bgColor: 'bg-gold-50 border-gold-200'
  },
  decision_maker: {
    label: 'Decision Maker',
    icon: Target,
    color: 'text-forest-700',
    bgColor: 'bg-forest-50 border-forest-200'
  },
  influencer: {
    label: 'Influencer',
    icon: Lightbulb,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  blocker: {
    label: 'Blocker',
    icon: XCircle,
    color: 'text-error-700',
    bgColor: 'bg-error-50 border-error-200'
  },
  end_user: {
    label: 'End User',
    icon: User,
    color: 'text-charcoal-700',
    bgColor: 'bg-charcoal-50 border-charcoal-200'
  },
}

const SENTIMENT_CONFIG: Record<string, { label: string; icon: typeof ThumbsUp; color: string }> = {
  positive: { label: 'Positive', icon: ThumbsUp, color: 'text-success-600' },
  neutral: { label: 'Neutral', icon: Minus, color: 'text-charcoal-500' },
  negative: { label: 'Negative', icon: ThumbsDown, color: 'text-error-600' },
}

const INFLUENCE_CONFIG: Record<string, { label: string; color: string }> = {
  high: { label: 'High', color: 'bg-success-100 text-success-700 border-success-200' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  low: { label: 'Low', color: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200' },
}

/**
 * DealStakeholdersSection - Comprehensive stakeholder management
 *
 * Displays:
 * - All stakeholders with roles (champion, decision maker, etc.)
 * - Influence levels and sentiment tracking
 * - Contact information
 * - Engagement notes
 */
export function DealStakeholdersSection({
  stakeholders,
  dealId,
  onRefresh,
  onAddStakeholder,
  onEditStakeholder
}: DealStakeholdersSectionProps) {
  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  // Group stakeholders by role
  const champions = stakeholders.filter(s => s.role === 'champion' && s.isActive)
  const decisionMakers = stakeholders.filter(s => s.role === 'decision_maker' && s.isActive)
  const influencers = stakeholders.filter(s => s.role === 'influencer' && s.isActive)
  const blockers = stakeholders.filter(s => s.role === 'blocker' && s.isActive)
  const endUsers = stakeholders.filter(s => s.role === 'end_user' && s.isActive)
  const otherStakeholders = stakeholders.filter(s => !s.role && s.isActive)
  const inactiveStakeholders = stakeholders.filter(s => !s.isActive)

  // Stats
  const totalActive = stakeholders.filter(s => s.isActive).length
  const positiveCount = stakeholders.filter(s => s.sentiment === 'positive' && s.isActive).length
  const negativeCount = stakeholders.filter(s => s.sentiment === 'negative' && s.isActive).length

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-charcoal-200/60 bg-white p-4 shadow-elevation-sm animate-fade-in" style={getDelay(0)}>
          <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">Total Stakeholders</p>
          <p className="text-2xl font-bold text-charcoal-900 mt-1">{totalActive}</p>
        </div>
        <div className="rounded-xl border border-charcoal-200/60 bg-white p-4 shadow-elevation-sm animate-fade-in" style={getDelay(1)}>
          <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">Champions</p>
          <p className="text-2xl font-bold text-gold-600 mt-1">{champions.length}</p>
        </div>
        <div className="rounded-xl border border-charcoal-200/60 bg-white p-4 shadow-elevation-sm animate-fade-in" style={getDelay(2)}>
          <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">Positive Sentiment</p>
          <p className="text-2xl font-bold text-success-600 mt-1">{positiveCount}</p>
        </div>
        <div className="rounded-xl border border-charcoal-200/60 bg-white p-4 shadow-elevation-sm animate-fade-in" style={getDelay(3)}>
          <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">Blockers</p>
          <p className={cn("text-2xl font-bold mt-1", blockers.length > 0 ? "text-error-600" : "text-charcoal-400")}>
            {blockers.length}
          </p>
        </div>
      </div>

      {/* Add Stakeholder Button */}
      {onAddStakeholder && (
        <div className="flex justify-end">
          <Button onClick={onAddStakeholder} className="bg-charcoal-900 hover:bg-charcoal-800">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Stakeholder
          </Button>
        </div>
      )}

      {/* Stakeholders by Role */}
      {stakeholders.length > 0 ? (
        <div className="space-y-6">
          {/* Champions */}
          {champions.length > 0 && (
            <StakeholderGroup
              title="Champions"
              description="Internal advocates pushing for our solution"
              stakeholders={champions}
              roleConfig={ROLE_CONFIG.champion}
              onEdit={onEditStakeholder}
              delayStart={4}
            />
          )}

          {/* Decision Makers */}
          {decisionMakers.length > 0 && (
            <StakeholderGroup
              title="Decision Makers"
              description="People who can sign off on the deal"
              stakeholders={decisionMakers}
              roleConfig={ROLE_CONFIG.decision_maker}
              onEdit={onEditStakeholder}
              delayStart={5}
            />
          )}

          {/* Influencers */}
          {influencers.length > 0 && (
            <StakeholderGroup
              title="Influencers"
              description="People who can sway the decision"
              stakeholders={influencers}
              roleConfig={ROLE_CONFIG.influencer}
              onEdit={onEditStakeholder}
              delayStart={6}
            />
          )}

          {/* Blockers */}
          {blockers.length > 0 && (
            <StakeholderGroup
              title="Blockers"
              description="People who may oppose our solution"
              stakeholders={blockers}
              roleConfig={ROLE_CONFIG.blocker}
              onEdit={onEditStakeholder}
              delayStart={7}
              isWarning
            />
          )}

          {/* End Users */}
          {endUsers.length > 0 && (
            <StakeholderGroup
              title="End Users"
              description="People who will use the placed resources"
              stakeholders={endUsers}
              roleConfig={ROLE_CONFIG.end_user}
              onEdit={onEditStakeholder}
              delayStart={8}
            />
          )}

          {/* Other Stakeholders */}
          {otherStakeholders.length > 0 && (
            <StakeholderGroup
              title="Other Contacts"
              description="Additional stakeholders"
              stakeholders={otherStakeholders}
              onEdit={onEditStakeholder}
              delayStart={9}
            />
          )}

          {/* Inactive Stakeholders */}
          {inactiveStakeholders.length > 0 && (
            <div className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden animate-slide-up" style={{ animationDelay: '750ms' }}>
              <div className="px-6 py-4 border-b border-charcoal-200">
                <p className="text-sm font-medium text-charcoal-500">Inactive Stakeholders ({inactiveStakeholders.length})</p>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {inactiveStakeholders.map((stakeholder) => (
                    <Badge key={stakeholder.id} variant="outline" className="text-charcoal-400">
                      {stakeholder.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-charcoal-400" />
            </div>
            <h3 className="text-lg font-semibold text-charcoal-900 mb-1">No Stakeholders Yet</h3>
            <p className="text-sm text-charcoal-500 max-w-md mx-auto">
              Add key contacts involved in this deal to track relationships and influence.
            </p>
            {onAddStakeholder && (
              <Button
                className="mt-6 bg-charcoal-900 hover:bg-charcoal-800"
                onClick={onAddStakeholder}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Stakeholder
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Stakeholder Group Component
function StakeholderGroup({
  title,
  description,
  stakeholders,
  roleConfig,
  onEdit,
  delayStart,
  isWarning
}: {
  title: string
  description: string
  stakeholders: DealStakeholder[]
  roleConfig?: typeof ROLE_CONFIG.champion
  onEdit?: (stakeholder: DealStakeholder) => void
  delayStart: number
  isWarning?: boolean
}) {
  const Icon = roleConfig?.icon || Users

  return (
    <div
      className={cn(
        "rounded-xl border shadow-elevation-sm overflow-hidden animate-slide-up",
        isWarning ? "border-error-200 bg-error-50/30" : "border-charcoal-200/60 bg-white"
      )}
      style={{ animationDelay: `${delayStart * 75}ms` }}
    >
      <div className={cn(
        "px-6 py-4 border-b",
        isWarning ? "border-error-200" : "border-charcoal-100"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isWarning ? "bg-error-100" : "bg-charcoal-100"
          )}>
            <Icon className={cn("h-5 w-5", isWarning ? "text-error-600" : "text-charcoal-600")} />
          </div>
          <div>
            <h3 className={cn("font-semibold", isWarning ? "text-error-900" : "text-charcoal-900")}>
              {title}
            </h3>
            <p className={cn("text-xs", isWarning ? "text-error-600" : "text-charcoal-500")}>
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {stakeholders.map((stakeholder) => (
            <StakeholderCard key={stakeholder.id} stakeholder={stakeholder} onEdit={onEdit} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Individual Stakeholder Card
function StakeholderCard({
  stakeholder,
  onEdit
}: {
  stakeholder: DealStakeholder
  onEdit?: (stakeholder: DealStakeholder) => void
}) {
  const roleConfig = stakeholder.role ? ROLE_CONFIG[stakeholder.role] : null
  const sentimentConfig = stakeholder.sentiment ? SENTIMENT_CONFIG[stakeholder.sentiment] : null
  const influenceConfig = stakeholder.influenceLevel ? INFLUENCE_CONFIG[stakeholder.influenceLevel] : null
  const SentimentIcon = sentimentConfig?.icon

  return (
    <div className="group flex items-start gap-4 p-4 rounded-lg border border-charcoal-100 bg-charcoal-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-semibold text-charcoal-700">
          {stakeholder.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-charcoal-900">{stakeholder.name}</p>
              {stakeholder.isPrimary && (
                <Badge className="bg-gold-50 text-gold-700 border-gold-200 text-xs">
                  <Star className="h-3 w-3 mr-1 fill-gold-500" />
                  Primary
                </Badge>
              )}
            </div>
            {stakeholder.title && (
              <p className="text-xs text-charcoal-600 mt-0.5">{stakeholder.title}</p>
            )}
          </div>

          {/* Edit Button */}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-charcoal-500"
              onClick={() => onEdit(stakeholder)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {roleConfig && (
            <Badge className={cn("text-xs", roleConfig.bgColor, roleConfig.color)}>
              <roleConfig.icon className="h-3 w-3 mr-1" />
              {roleConfig.label}
            </Badge>
          )}
          {influenceConfig && (
            <Badge variant="outline" className={cn("text-xs", influenceConfig.color)}>
              {influenceConfig.label} Influence
            </Badge>
          )}
          {sentimentConfig && SentimentIcon && (
            <span className={cn("flex items-center gap-1 text-xs", sentimentConfig.color)}>
              <SentimentIcon className="h-3.5 w-3.5" />
              {sentimentConfig.label}
            </span>
          )}
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-4 mt-3">
          {stakeholder.email && (
            <a
              href={`mailto:${stakeholder.email}`}
              className="flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-gold-700 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              {stakeholder.email}
            </a>
          )}
          {stakeholder.phone && (
            <a
              href={`tel:${stakeholder.phone}`}
              className="flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-gold-700 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              {stakeholder.phone}
            </a>
          )}
        </div>

        {/* Engagement Notes */}
        {stakeholder.engagementNotes && (
          <div className="mt-3 p-3 bg-charcoal-100/50 rounded-md">
            <p className="text-xs text-charcoal-600 italic">&ldquo;{stakeholder.engagementNotes}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DealStakeholdersSection
