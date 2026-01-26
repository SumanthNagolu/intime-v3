'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Plus,
  Trash2,
  Star,
  Crown,
  Target,
  Lightbulb,
  XCircle,
  User,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Pencil,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import {
  STAKEHOLDER_ROLES,
  INFLUENCE_LEVELS,
  SENTIMENT_OPTIONS,
} from '@/lib/deals/constants'
import type { SectionMode, StakeholdersSectionData, DealStakeholder, DEFAULT_STAKEHOLDER } from '@/lib/deals/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface StakeholdersSectionProps {
  mode: SectionMode
  data: StakeholdersSectionData
  onChange?: (field: string, value: unknown) => void
  onEdit?: () => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
}

const ROLE_ICONS: Record<string, typeof Crown> = {
  champion: Crown,
  decision_maker: Target,
  influencer: Lightbulb,
  blocker: XCircle,
  end_user: User,
}

const SENTIMENT_ICONS: Record<string, typeof ThumbsUp> = {
  positive: ThumbsUp,
  neutral: Minus,
  negative: ThumbsDown,
}

/**
 * StakeholdersSection - Unified component for Deal Stakeholders
 */
export function StakeholdersSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: StakeholdersSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')
  // Track which stakeholder is currently expanded for editing (null = none, 'new' = new form)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleSave = async () => {
    await onSave?.()
    setIsEditing(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setIsEditing(false)
  }

  const handleEdit = () => {
    onEdit?.()
    setIsEditing(true)
  }

  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  const handleAddStakeholder = () => {
    const newId = crypto.randomUUID()
    const newStakeholder: DealStakeholder = {
      id: newId,
      contactId: null,
      name: '',
      title: '',
      email: '',
      phone: '',
      role: 'influencer',
      influenceLevel: 'medium',
      sentiment: 'neutral',
      engagementNotes: '',
      isPrimary: data.stakeholders.length === 0,
      isActive: true,
    }
    onChange?.('stakeholders', [...data.stakeholders, newStakeholder])
    setExpandedId(newId) // Auto-expand new stakeholder
  }

  // Check if a stakeholder has meaningful data filled in
  const isStakeholderComplete = (s: DealStakeholder) => {
    return s.name.trim() !== ''
  }

  const handleRemoveStakeholder = (id: string) => {
    onChange?.('stakeholders', data.stakeholders.filter((s) => s.id !== id))
  }

  const handleStakeholderChange = (id: string, field: string, value: unknown) => {
    const updated = data.stakeholders.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    )
    onChange?.('stakeholders', updated)
  }

  const handleSetPrimary = (id: string) => {
    const updated = data.stakeholders.map((s) => ({
      ...s,
      isPrimary: s.id === id,
    }))
    onChange?.('stakeholders', updated)
  }

  // Group stakeholders by role for view mode
  const groupedStakeholders = React.useMemo(() => {
    if (isEditable) return null
    const groups: Record<string, DealStakeholder[]> = {}
    data.stakeholders.filter(s => s.isActive).forEach((s) => {
      const role = s.role || 'other'
      if (!groups[role]) groups[role] = []
      groups[role].push(s)
    })
    return groups
  }, [data.stakeholders, isEditable])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      {!isCreateMode && (
        <SectionHeader
          title="Stakeholders"
          subtitle="Key contacts and decision makers involved in this deal"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Edit Mode - Compact List with Expandable Forms */}
      {isEditable ? (
        <div className="space-y-3">
          {data.stakeholders.map((stakeholder, index) => {
            const isExpanded = expandedId === stakeholder.id
            const isComplete = isStakeholderComplete(stakeholder)
            const RoleIcon = ROLE_ICONS[stakeholder.role] || User
            const roleConfig = STAKEHOLDER_ROLES.find((r) => r.value === stakeholder.role)

            return (
              <Card key={stakeholder.id} className={cn(
                "shadow-elevation-sm transition-all duration-200",
                isExpanded && "ring-2 ring-gold-500/20"
              )}>
                {/* Collapsed Header - Always Visible */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-4 cursor-pointer hover:bg-charcoal-50/50 transition-colors",
                    isExpanded && "border-b border-charcoal-100"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : stakeholder.id)}
                >
                  {/* Avatar/Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    isComplete ? "bg-charcoal-200" : "bg-charcoal-100"
                  )}>
                    {isComplete ? (
                      <span className="text-sm font-semibold text-charcoal-700">
                        {stakeholder.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    ) : (
                      <User className="h-5 w-5 text-charcoal-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isComplete ? "text-charcoal-900" : "text-charcoal-400 italic"
                      )}>
                        {isComplete ? stakeholder.name : 'New Stakeholder'}
                      </p>
                      {stakeholder.isPrimary && (
                        <Badge className="bg-gold-50 text-gold-700 border-gold-200 text-xs flex-shrink-0">
                          <Star className="h-3 w-3 mr-1 fill-gold-500" />
                          Primary
                        </Badge>
                      )}
                    </div>
                    {isComplete && (
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-charcoal-500">
                          {roleConfig?.icon} {roleConfig?.label}
                        </span>
                        {stakeholder.title && (
                          <span className="text-xs text-charcoal-400">• {stakeholder.title}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {!stakeholder.isPrimary && isComplete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetPrimary(stakeholder.id)}
                        className="text-xs h-8 px-2"
                      >
                        Set Primary
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStakeholder(stakeholder.id)}
                      className="text-error-600 hover:text-error-700 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-charcoal-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-charcoal-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Form */}
                {isExpanded && (
                  <CardContent className="p-4 space-y-4 bg-charcoal-50/30">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                          Name <span className="text-gold-500">*</span>
                        </label>
                        <Input
                          value={stakeholder.name}
                          onChange={(e) => handleStakeholderChange(stakeholder.id, 'name', e.target.value)}
                          placeholder="Full name"
                          className="h-10 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                          Title
                        </label>
                        <Input
                          value={stakeholder.title}
                          onChange={(e) => handleStakeholderChange(stakeholder.id, 'title', e.target.value)}
                          placeholder="Job title"
                          className="h-10 rounded-lg bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={stakeholder.email}
                          onChange={(e) => handleStakeholderChange(stakeholder.id, 'email', e.target.value)}
                          placeholder="email@company.com"
                          className="h-10 rounded-lg bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                          Phone
                        </label>
                        <Input
                          value={stakeholder.phone}
                          onChange={(e) => handleStakeholderChange(stakeholder.id, 'phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="h-10 rounded-lg bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                          Role
                        </label>
                        <Select
                          value={stakeholder.role}
                          onValueChange={(v) => handleStakeholderChange(stakeholder.id, 'role', v)}
                        >
                          <SelectTrigger className="h-10 rounded-lg bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAKEHOLDER_ROLES.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.icon} {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                          Influence
                        </label>
                        <Select
                          value={stakeholder.influenceLevel}
                          onValueChange={(v) => handleStakeholderChange(stakeholder.id, 'influenceLevel', v)}
                        >
                          <SelectTrigger className="h-10 rounded-lg bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INFLUENCE_LEVELS.map((l) => (
                              <SelectItem key={l.value} value={l.value}>
                                {l.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                          Sentiment
                        </label>
                        <Select
                          value={stakeholder.sentiment}
                          onValueChange={(v) => handleStakeholderChange(stakeholder.id, 'sentiment', v)}
                        >
                          <SelectTrigger className="h-10 rounded-lg bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SENTIMENT_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.icon} {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                        Engagement Notes
                      </label>
                      <Textarea
                        value={stakeholder.engagementNotes}
                        onChange={(e) => handleStakeholderChange(stakeholder.id, 'engagementNotes', e.target.value)}
                        placeholder="Notes about interactions, preferences, concerns..."
                        className="rounded-lg resize-none bg-white"
                        rows={2}
                      />
                    </div>

                    {/* Collapse button */}
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedId(null)}
                        className="text-xs"
                      >
                        Done
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}

          <Button
            variant="outline"
            className="w-full h-12 border-dashed"
            onClick={handleAddStakeholder}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stakeholder
          </Button>
        </div>
      ) : (
        /* View Mode - Grouped Display */
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="shadow-elevation-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-charcoal-900 mt-1">
                  {data.stakeholders.filter((s) => s.isActive).length}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-elevation-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">Champions</p>
                <p className="text-2xl font-bold text-gold-600 mt-1">
                  {data.stakeholders.filter((s) => s.role === 'champion' && s.isActive).length}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-elevation-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">Positive</p>
                <p className="text-2xl font-bold text-success-600 mt-1">
                  {data.stakeholders.filter((s) => s.sentiment === 'positive' && s.isActive).length}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-elevation-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">Blockers</p>
                <p className={cn(
                  "text-2xl font-bold mt-1",
                  data.stakeholders.filter((s) => s.role === 'blocker' && s.isActive).length > 0
                    ? "text-error-600"
                    : "text-charcoal-400"
                )}>
                  {data.stakeholders.filter((s) => s.role === 'blocker' && s.isActive).length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Grouped by Role */}
          {groupedStakeholders && Object.entries(groupedStakeholders).map(([role, stakeholders]) => {
            const roleConfig = STAKEHOLDER_ROLES.find((r) => r.value === role)
            const RoleIcon = ROLE_ICONS[role] || User

            return (
              <Card key={role} className="shadow-elevation-sm">
                <CardHeader className="pb-3 border-b border-charcoal-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                      <RoleIcon className="h-5 w-5 text-charcoal-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-heading">
                        {roleConfig?.label || 'Other'} ({stakeholders.length})
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {stakeholders.map((s) => {
                      const SentimentIcon = SENTIMENT_ICONS[s.sentiment] || Minus
                      return (
                        <div
                          key={s.id}
                          className="flex items-start gap-4 p-4 rounded-lg bg-charcoal-50/50 border border-charcoal-100"
                        >
                          <div className="w-10 h-10 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-charcoal-700">
                              {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-charcoal-900">{s.name}</p>
                              {s.isPrimary && (
                                <Badge className="bg-gold-50 text-gold-700 border-gold-200 text-xs">
                                  <Star className="h-3 w-3 mr-1 fill-gold-500" />
                                  Primary
                                </Badge>
                              )}
                            </div>
                            {s.title && (
                              <p className="text-xs text-charcoal-600 mt-0.5">{s.title}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              {s.email && (
                                <a
                                  href={`mailto:${s.email}`}
                                  className="flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-gold-700"
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                  {s.email}
                                </a>
                              )}
                              {s.phone && (
                                <span className="flex items-center gap-1.5 text-xs text-charcoal-500">
                                  <Phone className="h-3.5 w-3.5" />
                                  {s.phone}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {INFLUENCE_LEVELS.find((l) => l.value === s.influenceLevel)?.label} Influence
                              </Badge>
                              <span className="flex items-center gap-1 text-xs text-charcoal-500">
                                <SentimentIcon className="h-3.5 w-3.5" />
                                {SENTIMENT_OPTIONS.find((o) => o.value === s.sentiment)?.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {data.stakeholders.length === 0 && (
            <Card className="shadow-elevation-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-charcoal-400" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal-900 mb-1">No Stakeholders Yet</h3>
                <p className="text-sm text-charcoal-500">
                  Add key contacts involved in this deal to track relationships.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default StakeholdersSection
