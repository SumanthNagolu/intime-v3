'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Target,
  Shield,
  Trophy,
  AlertTriangle,
  Plus,
  Trash2,
  Building2,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import {
  WIN_REASONS,
  LOSS_REASON_CATEGORIES,
  FUTURE_POTENTIAL_OPTIONS,
} from '@/lib/deals/constants'
import type { SectionMode, CompetitorsSectionData } from '@/lib/deals/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface CompetitorsSectionProps {
  mode: SectionMode
  data: CompetitorsSectionData
  onChange?: (field: string, value: unknown) => void
  onEdit?: () => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
  /** Current stage - needed for conditional display */
  currentStage?: string
}

/**
 * CompetitorsSection - Unified component for Deal Competitors
 */
export function CompetitorsSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
  currentStage,
}: CompetitorsSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')
  const [newCompetitor, setNewCompetitor] = React.useState('')

  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleChange = (field: string, value: unknown) => {
    onChange?.(field, value)
  }

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

  const handleAddCompetitor = () => {
    if (newCompetitor.trim()) {
      onChange?.('competitors', [...data.competitors, newCompetitor.trim()])
      setNewCompetitor('')
    }
  }

  const handleRemoveCompetitor = (index: number) => {
    const updated = data.competitors.filter((_, i) => i !== index)
    onChange?.('competitors', updated)
  }

  const handleToggleCompetitorBeat = (competitor: string) => {
    const isBeat = data.competitorsBeat.includes(competitor)
    if (isBeat) {
      onChange?.('competitorsBeat', data.competitorsBeat.filter((c) => c !== competitor))
    } else {
      onChange?.('competitorsBeat', [...data.competitorsBeat, competitor])
    }
  }

  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'
  const isClosed = currentStage === 'closed_won' || currentStage === 'closed_lost'
  const isClosedWon = currentStage === 'closed_won'
  const isClosedLost = currentStage === 'closed_lost'

  const winReasonOptions = WIN_REASONS.map((w) => ({ value: w.value, label: w.label }))
  const lossReasonOptions = LOSS_REASON_CATEGORIES.map((l) => ({ value: l.value, label: l.label }))
  const futurePotentialOptions = FUTURE_POTENTIAL_OPTIONS.map((f) => ({ value: f.value, label: f.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      {!isCreateMode && (
        <SectionHeader
          title="Competitors"
          subtitle="Competitive landscape and positioning"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitors List Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Competitors</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditable && (
              <div className="flex gap-2">
                <Input
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  placeholder="Enter competitor name"
                  className="h-11 rounded-lg flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCompetitor()}
                />
                <Button onClick={handleAddCompetitor} className="h-11">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {data.competitors.length > 0 ? (
              <div className="space-y-2">
                {data.competitors.map((competitor, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-charcoal-50 border border-charcoal-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-charcoal-200 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-charcoal-600" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-charcoal-900">
                      {competitor}
                    </span>
                    {isClosedWon && (
                      <Badge
                        className={cn(
                          "cursor-pointer transition-colors",
                          data.competitorsBeat.includes(competitor)
                            ? "bg-success-50 text-success-700 border-success-200"
                            : "bg-charcoal-100 text-charcoal-500"
                        )}
                        onClick={() => isEditable && handleToggleCompetitorBeat(competitor)}
                      >
                        <Trophy className="h-3 w-3 mr-1" />
                        {data.competitorsBeat.includes(competitor) ? 'Beat' : 'Mark as Beat'}
                      </Badge>
                    )}
                    {isClosedLost && data.competitorWon === competitor && (
                      <Badge className="bg-error-50 text-error-700 border-error-200">
                        Lost To
                      </Badge>
                    )}
                    {isEditable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCompetitor(index)}
                        className="text-charcoal-400 hover:text-error-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-charcoal-400" />
                </div>
                <p className="text-sm text-charcoal-500">No competitors identified</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Competitive Advantage Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Our Competitive Advantage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <UnifiedField
              label=""
              type="textarea"
              value={data.competitiveAdvantage}
              onChange={(v) => handleChange('competitiveAdvantage', v)}
              editable={isEditable}
              placeholder="Why should we win this deal? What makes us different?"
              maxLength={1000}
            />
          </CardContent>
        </Card>
      </div>

      {/* Win Analysis - Show when closed_won */}
      {(isClosedWon || (isCreateMode && false)) && (
        <Card className="shadow-elevation-sm border-success-200 bg-success-50/30">
          <CardHeader className="pb-3 border-b border-success-200">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-success-100 rounded-lg">
                <Trophy className="w-4 h-4 text-success-600" />
              </div>
              <CardTitle className="text-base font-heading text-success-900">Win Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <UnifiedField
              label="Win Reason"
              type="select"
              options={winReasonOptions}
              value={data.winReason}
              onChange={(v) => handleChange('winReason', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Win Details"
              type="textarea"
              value={data.winDetails}
              onChange={(v) => handleChange('winDetails', v)}
              editable={isEditable}
              placeholder="What were the key factors in winning?"
              maxLength={1000}
            />
          </CardContent>
        </Card>
      )}

      {/* Loss Analysis - Show when closed_lost */}
      {(isClosedLost || (isCreateMode && false)) && (
        <Card className="shadow-elevation-sm border-error-200 bg-error-50/30">
          <CardHeader className="pb-3 border-b border-error-200">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-error-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-error-600" />
              </div>
              <CardTitle className="text-base font-heading text-error-900">Loss Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <UnifiedField
                label="Loss Category"
                type="select"
                options={lossReasonOptions}
                value={data.lossReasonCategory}
                onChange={(v) => handleChange('lossReasonCategory', v)}
                editable={isEditable}
              />
              {data.lossReasonCategory === 'competitor' && (
                <UnifiedField
                  label="Lost To"
                  type="select"
                  options={data.competitors.map((c) => ({ value: c, label: c }))}
                  value={data.competitorWon}
                  onChange={(v) => handleChange('competitorWon', v)}
                  editable={isEditable}
                />
              )}
            </div>
            <UnifiedField
              label="Loss Details"
              type="textarea"
              value={data.lossDetails}
              onChange={(v) => handleChange('lossDetails', v)}
              editable={isEditable}
              placeholder="What led to losing this deal?"
              maxLength={1000}
            />
            {data.competitorWon && (
              <UnifiedField
                label="Competitor Price"
                type="currency"
                value={data.competitorPrice}
                onChange={(v) => handleChange('competitorPrice', v ? Number(v) : null)}
                editable={isEditable}
                placeholder="If known"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Lessons Learned & Future Potential - Show when closed_lost */}
      {isClosedLost && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-elevation-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                </div>
                <CardTitle className="text-base font-heading">Lessons Learned</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <UnifiedField
                label=""
                type="textarea"
                value={data.lessonsLearned}
                onChange={(v) => handleChange('lessonsLearned', v)}
                editable={isEditable}
                placeholder="What can we learn from this loss?"
                maxLength={1000}
              />
            </CardContent>
          </Card>

          <Card className="shadow-elevation-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                </div>
                <CardTitle className="text-base font-heading">Future Potential</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <UnifiedField
                label="Re-engagement Potential"
                type="select"
                options={futurePotentialOptions}
                value={data.futurePotential}
                onChange={(v) => handleChange('futurePotential', v)}
                editable={isEditable}
              />
              {data.futurePotential === 'yes' && (
                <UnifiedField
                  label="Re-engagement Date"
                  type="date"
                  value={data.reengagementDate}
                  onChange={(v) => handleChange('reengagementDate', v)}
                  editable={isEditable}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CompetitorsSection
