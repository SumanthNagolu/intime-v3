'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Calendar, Clock, Repeat, Globe } from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import type { SectionMode, CampaignScheduleSectionData, SendDay } from '@/lib/campaigns/types'
import { SEND_DAY_OPTIONS, TIMEZONE_OPTIONS } from '@/lib/campaigns/types'
import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

// ============ PROPS ============

interface CampaignScheduleSectionProps {
  mode: SectionMode
  data: CampaignScheduleSectionData
  onChange?: (field: string, value: unknown) => void
  onEdit?: () => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
}

/**
 * CampaignScheduleSection - Campaign timing and send window configuration
 */
export function CampaignScheduleSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: CampaignScheduleSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleChange = (field: string, value: unknown) => {
    onChange?.(field, value)
  }

  const handleToggleSendDay = (day: SendDay) => {
    const isSelected = data.sendDays.includes(day)
    const newDays = isSelected
      ? data.sendDays.filter(d => d !== day)
      : [...data.sendDays, day]
    onChange?.('sendDays', newDays)
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

  return (
    <div className={cn('space-y-6', className)}>
      {!isCreateMode && (
        <SectionHeader
          title="Schedule"
          subtitle="Campaign timeline and send window configuration"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Dates Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Campaign Dates</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Start Date"
              type="date"
              value={data.startDate}
              onChange={(v) => handleChange('startDate', v)}
              editable={isEditable}
              required
              error={errors?.startDate}
            />
            <UnifiedField
              label="End Date"
              type="date"
              value={data.endDate}
              onChange={(v) => handleChange('endDate', v)}
              editable={isEditable}
              required
              error={errors?.endDate}
            />
            <UnifiedField
              label="Launch Immediately"
              type="switch"
              value={data.launchImmediately}
              onChange={(v) => handleChange('launchImmediately', v)}
              editable={isEditable}
              helpText="Start the campaign as soon as it's created and approved"
            />
          </CardContent>
        </Card>

        {/* Recurring Settings Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Repeat className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Recurring Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Recurring Campaign"
              type="switch"
              value={data.isRecurring}
              onChange={(v) => handleChange('isRecurring', v)}
              editable={isEditable}
              helpText="Automatically restart the campaign on a schedule"
            />
            {data.isRecurring && (
              <UnifiedField
                label="Recurring Interval"
                type="select"
                value={data.recurringInterval}
                onChange={(v) => handleChange('recurringInterval', v)}
                editable={isEditable}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
                placeholder="Select interval..."
                required={data.isRecurring}
                error={errors?.recurringInterval}
              />
            )}
            {!isEditable && !data.isRecurring && (
              <p className="text-sm text-charcoal-400 italic">
                One-time campaign - will run once during the specified dates
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Send Window Card */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <CardTitle className="text-base font-heading">Send Window</CardTitle>
          </div>
          <p className="text-sm text-charcoal-500 mt-1">
            Configure when messages can be sent
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UnifiedField
              label="Start Time"
              type="text"
              value={data.sendWindowStart}
              onChange={(v) => handleChange('sendWindowStart', v)}
              editable={isEditable}
              placeholder="09:00"
              helpText="Messages will start sending at this time (HH:MM format)"
            />
            <UnifiedField
              label="End Time"
              type="text"
              value={data.sendWindowEnd}
              onChange={(v) => handleChange('sendWindowEnd', v)}
              editable={isEditable}
              placeholder="17:00"
              helpText="No messages will be sent after this time (HH:MM format)"
            />
          </div>

          {/* Timezone */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-charcoal-50 rounded-lg mt-1">
              <Globe className="w-4 h-4 text-charcoal-500" />
            </div>
            <div className="flex-1">
              <UnifiedField
                label="Timezone"
                type="select"
                value={data.timezone}
                onChange={(v) => handleChange('timezone', v)}
                editable={isEditable}
                options={TIMEZONE_OPTIONS.map(t => ({ value: t.value, label: t.label }))}
                helpText="Send times will be based on this timezone"
              />
            </div>
          </div>

          {/* Send Days */}
          <div className="space-y-3">
            <label className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
              Send Days
            </label>
            {isEditable ? (
              <div className="flex flex-wrap gap-2">
                {SEND_DAY_OPTIONS.map((day) => {
                  const isSelected = data.sendDays.includes(day.value)
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleToggleSendDay(day.value)}
                      className={cn(
                        'relative px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-300',
                        isSelected
                          ? 'border-gold-400 bg-gradient-to-br from-gold-50/50 to-white text-charcoal-900'
                          : 'border-charcoal-100 bg-white text-charcoal-500 hover:border-gold-200 hover:bg-gold-50/30'
                      )}
                    >
                      {isSelected && (
                        <CheckCircle2 className="absolute -top-1 -right-1 w-4 h-4 text-gold-500" />
                      )}
                      {day.shortLabel}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.sendDays.length > 0 ? (
                  data.sendDays.map((day) => {
                    const dayOption = SEND_DAY_OPTIONS.find(d => d.value === day)
                    return (
                      <span
                        key={day}
                        className="px-3 py-1 bg-charcoal-50 rounded-lg text-sm font-medium text-charcoal-700"
                      >
                        {dayOption?.shortLabel || day}
                      </span>
                    )
                  })
                ) : (
                  <span className="text-sm text-charcoal-400 italic">
                    No send days selected
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-charcoal-400">
              Select the days of the week when messages should be sent
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CampaignScheduleSection
