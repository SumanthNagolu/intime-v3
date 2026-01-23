'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, Clock, Repeat, Globe, Check } from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import type { SectionMode, CampaignScheduleSectionData, SendDay } from '@/lib/campaigns/types'
import { SEND_DAY_OPTIONS, TIMEZONE_OPTIONS } from '@/lib/campaigns/types'
import { cn } from '@/lib/utils'

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
            {/* Start Date */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <Input
                    type="date"
                    value={data.startDate || ''}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className={cn('h-10 w-40', errors?.startDate && 'border-red-500')}
                  />
                ) : (
                  <p className="text-charcoal-900 py-2">
                    {data.startDate ? new Date(data.startDate).toLocaleDateString() : '—'}
                  </p>
                )}
                {errors?.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
              </div>
            </div>

            {/* End Date */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                End Date <span className="text-red-500">*</span>
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <Input
                    type="date"
                    value={data.endDate || ''}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className={cn('h-10 w-40', errors?.endDate && 'border-red-500')}
                  />
                ) : (
                  <p className="text-charcoal-900 py-2">
                    {data.endDate ? new Date(data.endDate).toLocaleDateString() : '—'}
                  </p>
                )}
                {errors?.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {/* Launch Immediately */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">
                  Launch Immediately
                </Label>
                <p className="text-xs text-charcoal-500">
                  Start when created and approved
                </p>
              </div>
              <Switch
                checked={data.launchImmediately}
                onCheckedChange={(v) => handleChange('launchImmediately', v)}
                disabled={!isEditable}
              />
            </div>
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
            {/* Recurring Toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">
                  Recurring Campaign
                </Label>
                <p className="text-xs text-charcoal-500">
                  Auto-restart on schedule
                </p>
              </div>
              <Switch
                checked={data.isRecurring}
                onCheckedChange={(v) => handleChange('isRecurring', v)}
                disabled={!isEditable}
              />
            </div>

            {/* Recurring Interval */}
            {data.isRecurring && (
              <div className="flex items-start gap-4">
                <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                  Interval <span className="text-red-500">*</span>
                </Label>
                <div className="flex-1">
                  {isEditable ? (
                    <Select
                      value={data.recurringInterval || ''}
                      onValueChange={(v) => handleChange('recurringInterval', v)}
                    >
                      <SelectTrigger className={cn('h-10 w-36', errors?.recurringInterval && 'border-red-500')}>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-charcoal-900 py-2 capitalize">{data.recurringInterval || '—'}</p>
                  )}
                  {errors?.recurringInterval && <p className="text-xs text-red-500 mt-1">{errors.recurringInterval}</p>}
                </div>
              </div>
            )}

            {!isEditable && !data.isRecurring && (
              <p className="text-sm text-charcoal-400 italic">
                One-time campaign
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
          <p className="text-xs text-charcoal-500 mt-1">
            Configure when messages can be sent
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Time Range */}
          <div className="flex items-start gap-4">
            <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
              Time Range
            </Label>
            <div className="flex-1">
              {isEditable ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={data.sendWindowStart || ''}
                    onChange={(e) => handleChange('sendWindowStart', e.target.value)}
                    placeholder="09:00"
                    className="h-10 w-28"
                  />
                  <span className="text-charcoal-400">to</span>
                  <Input
                    type="time"
                    value={data.sendWindowEnd || ''}
                    onChange={(e) => handleChange('sendWindowEnd', e.target.value)}
                    placeholder="17:00"
                    className="h-10 w-28"
                  />
                </div>
              ) : (
                <p className="text-charcoal-900 py-2">
                  {data.sendWindowStart || '—'} to {data.sendWindowEnd || '—'}
                </p>
              )}
            </div>
          </div>

          {/* Timezone */}
          <div className="flex items-start gap-4">
            <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              Timezone
            </Label>
            <div className="flex-1">
              {isEditable ? (
                <Select
                  value={data.timezone}
                  onValueChange={(v) => handleChange('timezone', v)}
                >
                  <SelectTrigger className="h-10 w-64">
                    <SelectValue placeholder="Select timezone..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONE_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-charcoal-900 py-2">
                  {TIMEZONE_OPTIONS.find(t => t.value === data.timezone)?.label || data.timezone || '—'}
                </p>
              )}
            </div>
          </div>

          {/* Send Days */}
          <div className="flex items-start gap-4">
            <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2 shrink-0">
              Send Days
            </Label>
            <div className="flex-1">
              {isEditable ? (
                <div className="flex flex-wrap gap-1.5">
                  {SEND_DAY_OPTIONS.map((day) => {
                    const isSelected = data.sendDays.includes(day.value)
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleToggleSendDay(day.value)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200',
                          isSelected
                            ? 'border-hublot-900 bg-charcoal-50'
                            : 'border-charcoal-200 bg-white hover:border-charcoal-300'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded border transition-colors',
                            isSelected
                              ? 'bg-hublot-900 border-hublot-900 text-white'
                              : 'border-charcoal-300'
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        {day.shortLabel}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {data.sendDays.length > 0 ? (
                    data.sendDays.map((day) => {
                      const dayOption = SEND_DAY_OPTIONS.find(d => d.value === day)
                      return (
                        <Badge key={day} variant="outline" className="font-normal">
                          {dayOption?.shortLabel || day}
                        </Badge>
                      )
                    })
                  ) : (
                    <span className="text-sm text-charcoal-400">No send days selected</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CampaignScheduleSection
