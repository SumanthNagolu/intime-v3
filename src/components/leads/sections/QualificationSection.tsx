'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  Shield,
  Target,
  Clock,
  TrendingUp,
  Calculator,
  Calendar,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import {
  QUALIFICATION_RESULTS,
  PROBABILITY_OPTIONS,
  getBANTScoreLabel,
  getBANTScoreColor,
} from '@/lib/leads/constants'
import type { SectionMode, QualificationSectionData } from '@/lib/leads/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface QualificationSectionProps {
  mode: SectionMode
  data: QualificationSectionData
  onChange?: (field: string, value: unknown) => void
  onEdit?: () => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
}

/**
 * QualificationSection - BANT Scoring and Deal Estimation
 */
export function QualificationSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: QualificationSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

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

  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // Calculate total BANT score
  const bantScores = [data.bantBudget, data.bantAuthority, data.bantNeed, data.bantTimeline]
  const validScores = bantScores.filter(s => s !== null) as number[]
  const totalBANTScore = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : null

  const qualificationOptions = QUALIFICATION_RESULTS.map(r => ({ value: r.value, label: r.label }))
  const probabilityOptions = PROBABILITY_OPTIONS.map(p => ({ value: p.value, label: p.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      {!isCreateMode && (
        <SectionHeader
          title="Qualification"
          subtitle="BANT scoring and deal estimation"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* BANT Score Overview (View Only) */}
      {!isCreateMode && totalBANTScore !== null && (
        <Card className="shadow-elevation-sm bg-charcoal-50">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-charcoal-200 flex items-center justify-center">
                  <span className="text-2xl font-bold text-charcoal-900">{totalBANTScore}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal-500">Total BANT Score</p>
                  <p className="text-lg font-semibold text-charcoal-900">
                    {getBANTScoreLabel(totalBANTScore)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {bantScores.map((score, idx) => {
                  const labels = ['B', 'A', 'N', 'T']
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center font-semibold',
                        score !== null && score >= 75 ? 'bg-success-100 text-success-700' :
                        score !== null && score >= 50 ? 'bg-amber-100 text-amber-700' :
                        score !== null ? 'bg-error-100 text-error-700' :
                        'bg-charcoal-100 text-charcoal-400'
                      )}
                    >
                      {labels[idx]}
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Card */}
        <BANTCard
          icon={DollarSign}
          title="Budget"
          letter="B"
          description="Does the lead have budget allocated?"
          score={data.bantBudget}
          notes={data.bantBudgetNotes}
          onScoreChange={(v) => handleChange('bantBudget', v)}
          onNotesChange={(v) => handleChange('bantBudgetNotes', v)}
          editable={isEditable}
          questions={[
            'What is your budget for this project?',
            'Has budget been approved?',
            'Who controls the budget?',
          ]}
        />

        {/* Authority Card */}
        <BANTCard
          icon={Shield}
          title="Authority"
          letter="A"
          description="Does the lead have decision-making authority?"
          score={data.bantAuthority}
          notes={data.bantAuthorityNotes}
          onScoreChange={(v) => handleChange('bantAuthority', v)}
          onNotesChange={(v) => handleChange('bantAuthorityNotes', v)}
          editable={isEditable}
          questions={[
            'Who is involved in the decision?',
            'What is the approval process?',
            'Are there other stakeholders?',
          ]}
        />

        {/* Need Card */}
        <BANTCard
          icon={Target}
          title="Need"
          letter="N"
          description="Is there a genuine business need?"
          score={data.bantNeed}
          notes={data.bantNeedNotes}
          onScoreChange={(v) => handleChange('bantNeed', v)}
          onNotesChange={(v) => handleChange('bantNeedNotes', v)}
          editable={isEditable}
          questions={[
            'What problem are you trying to solve?',
            'What happens if you don\'t solve it?',
            'What have you tried before?',
          ]}
        />

        {/* Timeline Card */}
        <BANTCard
          icon={Clock}
          title="Timeline"
          letter="T"
          description="Is there urgency to move forward?"
          score={data.bantTimeline}
          notes={data.bantTimelineNotes}
          onScoreChange={(v) => handleChange('bantTimeline', v)}
          onNotesChange={(v) => handleChange('bantTimelineNotes', v)}
          editable={isEditable}
          questions={[
            'When do you need to implement?',
            'What is driving the timeline?',
            'Are there any deadlines?',
          ]}
        />
      </div>

      {/* Qualification Result & Deal Estimation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Qualification Result */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Calculator className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Qualification Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Result"
              value={data.qualificationResult}
              onChange={(v) => handleChange('qualificationResult', v)}
              editable={isEditable}
              type="select"
              options={qualificationOptions}
              badge
              badgeVariant={
                data.qualificationResult === 'qualified' ? 'success' :
                data.qualificationResult === 'unqualified' ? 'destructive' :
                'secondary'
              }
            />
            <UnifiedField
              label="Notes"
              value={data.qualificationNotes}
              onChange={(v) => handleChange('qualificationNotes', v)}
              editable={isEditable}
              type="textarea"
              placeholder="Summary of qualification findings..."
            />
          </CardContent>
        </Card>

        {/* Deal Estimation */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Deal Estimation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Estimated Annual Value"
              value={data.estimatedAnnualValue}
              onChange={(v) => handleChange('estimatedAnnualValue', v)}
              editable={isEditable}
              placeholder="e.g., $50,000"
            />
            <UnifiedField
              label="Probability"
              value={data.probability}
              onChange={(v) => handleChange('probability', v)}
              editable={isEditable}
              type="select"
              options={probabilityOptions}
              placeholder="Select probability"
            />
            <UnifiedField
              label="Expected Close Date"
              value={data.expectedCloseDate}
              onChange={(v) => handleChange('expectedCloseDate', v)}
              editable={isEditable}
              type="date"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============ HELPER COMPONENTS ============

interface BANTCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  letter: string
  description: string
  score: number | null
  notes: string
  onScoreChange: (value: number | null) => void
  onNotesChange: (value: string) => void
  editable: boolean
  questions: string[]
}

function BANTCard({
  icon: Icon,
  title,
  letter,
  description,
  score,
  notes,
  onScoreChange,
  onNotesChange,
  editable,
  questions,
}: BANTCardProps) {
  const scoreColor = getBANTScoreColor(score)

  return (
    <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-charcoal-100 rounded-lg">
              <Icon className="w-4 h-4 text-charcoal-600" />
            </div>
            <div>
              <CardTitle className="text-base font-heading">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg',
            score !== null && score >= 75 ? 'bg-success-100 text-success-700' :
            score !== null && score >= 50 ? 'bg-amber-100 text-amber-700' :
            score !== null ? 'bg-error-100 text-error-700' :
            'bg-charcoal-100 text-charcoal-400'
          )}>
            {score ?? '—'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {editable ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Score (0-100)
                </Label>
                <span className="text-sm font-semibold text-charcoal-900">
                  {score ?? 0}
                </span>
              </div>
              <Slider
                value={[score ?? 0]}
                onValueChange={([v]) => onScoreChange(v)}
                max={100}
                step={5}
                className="py-2"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Notes
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Document your findings..."
                rows={3}
              />
            </div>
            {/* Discovery Questions */}
            <div className="space-y-2 pt-2 border-t border-charcoal-100">
              <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">
                Discovery Questions
              </p>
              <ul className="space-y-1">
                {questions.map((q, idx) => (
                  <li key={idx} className="text-xs text-charcoal-500 flex items-start gap-2">
                    <span className="text-charcoal-300">•</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Score
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-charcoal-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      score !== null && score >= 75 ? 'bg-success-500' :
                      score !== null && score >= 50 ? 'bg-amber-500' :
                      score !== null ? 'bg-error-500' :
                      'bg-charcoal-300'
                    )}
                    style={{ width: `${score ?? 0}%` }}
                  />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {getBANTScoreLabel(score)}
                </Badge>
              </div>
            </div>
            {notes && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Notes
                </p>
                <p className="text-sm text-charcoal-700">{notes}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default QualificationSection
