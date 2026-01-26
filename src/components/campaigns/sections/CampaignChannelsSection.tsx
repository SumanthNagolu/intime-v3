'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Mail, Linkedin, Phone, Zap, Calendar, Send, MessageSquare, Briefcase, Users, Check } from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import type { SectionMode, CampaignChannelsSectionData, CampaignChannel } from '@/lib/campaigns/types'
import { CHANNEL_OPTIONS } from '@/lib/campaigns/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface CampaignChannelsSectionProps {
  mode: SectionMode
  data: CampaignChannelsSectionData
  onChange?: (field: string, value: unknown) => void
  onToggleChannel?: (channel: CampaignChannel) => void
  onEdit?: () => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
}

const CHANNEL_ICONS: Record<CampaignChannel, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  linkedin: Linkedin,
  phone: Phone,
  sms: MessageSquare,
  event: Calendar,
  direct_mail: Send,
  job_board: Briefcase,
  referral: Users,
}

// Group channels by type for cleaner display
const CHANNEL_GROUPS = [
  { label: 'Digital', channels: ['email', 'linkedin', 'sms'] as CampaignChannel[] },
  { label: 'Direct', channels: ['phone', 'direct_mail', 'event'] as CampaignChannel[] },
  { label: 'Other', channels: ['job_board', 'referral'] as CampaignChannel[] },
]

// ============ HELPER COMPONENT ============

interface SequenceConfigCardProps {
  icon: React.ComponentType<{ className?: string }>
  iconBgClass: string
  iconClass: string
  title: string
  steps: number
  daysBetween: number
  stepsField: string
  daysBetweenField: string
  maxSteps?: number
  maxDaysBetween?: number
  isEditable: boolean
  onChange: (field: string, value: unknown) => void
}

function SequenceConfigCard({
  icon: Icon,
  iconBgClass,
  iconClass,
  title,
  steps,
  daysBetween,
  stepsField,
  daysBetweenField,
  maxSteps = 10,
  maxDaysBetween = 14,
  isEditable,
  onChange,
}: SequenceConfigCardProps) {
  return (
    <Card className="shadow-elevation-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-2 rounded-lg', iconBgClass)}>
            <Icon className={cn('w-4 h-4', iconClass)} />
          </div>
          <CardTitle className="text-base font-heading">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Number of Steps */}
        <div className="flex items-start gap-4">
          <Label className="text-sm font-medium text-charcoal-700 w-32 pt-2.5 shrink-0">
            Steps
          </Label>
          <div className="flex-1">
            {isEditable ? (
              <Input
                type="number"
                value={steps}
                onChange={(e) => onChange(stepsField, parseInt(e.target.value, 10) || 1)}
                min={1}
                max={maxSteps}
                className="h-10 w-24 tabular-nums"
              />
            ) : (
              <p className="text-charcoal-900 py-2">{steps} steps</p>
            )}
          </div>
        </div>
        {/* Days Between */}
        <div className="flex items-start gap-4">
          <Label className="text-sm font-medium text-charcoal-700 w-32 pt-2.5 shrink-0">
            Days Between
          </Label>
          <div className="flex-1">
            {isEditable ? (
              <Input
                type="number"
                value={daysBetween}
                onChange={(e) => onChange(daysBetweenField, parseInt(e.target.value, 10) || 1)}
                min={1}
                max={maxDaysBetween}
                className="h-10 w-24 tabular-nums"
              />
            ) : (
              <p className="text-charcoal-900 py-2">{daysBetween} days</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * CampaignChannelsSection - Unified component for Channels & Sequence configuration
 */
export function CampaignChannelsSection({
  mode,
  data,
  onChange,
  onToggleChannel,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: CampaignChannelsSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleChange = (field: string, value: unknown) => {
    onChange?.(field, value)
  }

  const handleToggleChannel = (channel: CampaignChannel) => {
    if (onToggleChannel) {
      onToggleChannel(channel)
    } else {
      const isSelected = data.channels.includes(channel)
      handleChange(
        'channels',
        isSelected ? data.channels.filter(c => c !== channel) : [...data.channels, channel]
      )
    }
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

  // Check if manual sequence configuration is needed
  const showManualConfig = data.sequenceTemplateIds.length === 0

  return (
    <div className={cn('space-y-6', className)}>
      {!isCreateMode && (
        <SectionHeader
          title="Channels & Sequence"
          subtitle="Configure outreach channels and automation settings"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Channel Selection */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <CardTitle className="text-base font-heading">Outreach Channels</CardTitle>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Select one or more channels to reach your target audience
          </p>
        </CardHeader>
        <CardContent>
          {isEditable ? (
            <div className="space-y-4">
              {CHANNEL_GROUPS.map((group) => (
                <div key={group.label} className="flex items-start gap-4">
                  <Label className="text-sm font-medium text-charcoal-700 w-20 pt-2 shrink-0">
                    {group.label}
                  </Label>
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {group.channels.map((channelValue) => {
                      const channel = CHANNEL_OPTIONS.find(c => c.value === channelValue)
                      if (!channel) return null
                      const isSelected = data.channels.includes(channelValue)
                      const IconComponent = CHANNEL_ICONS[channelValue]
                      return (
                        <button
                          key={channelValue}
                          type="button"
                          onClick={() => handleToggleChannel(channelValue)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200',
                            isSelected
                              ? 'border-hublot-900 bg-charcoal-50'
                              : 'border-charcoal-200 hover:border-charcoal-300 bg-white'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-4 w-4 items-center justify-center rounded border transition-colors shrink-0',
                              isSelected
                                ? 'bg-hublot-900 border-hublot-900 text-white'
                                : 'border-charcoal-300'
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <IconComponent className={cn(
                            'w-4 h-4 shrink-0',
                            isSelected ? 'text-charcoal-700' : 'text-charcoal-400'
                          )} />
                          <span className="text-sm text-charcoal-700 truncate">{channel.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-20 shrink-0">
                Selected
              </Label>
              <div className="flex-1 flex flex-wrap gap-1.5">
                {data.channels.length > 0 ? (
                  data.channels.map((channel) => {
                    const channelOption = CHANNEL_OPTIONS.find(c => c.value === channel)
                    const IconComponent = CHANNEL_ICONS[channel]
                    return (
                      <Badge key={channel} variant="outline" className="gap-1.5 font-normal py-1">
                        <IconComponent className="w-3.5 h-3.5" />
                        {channelOption?.label || channel}
                      </Badge>
                    )
                  })
                ) : (
                  <span className="text-sm text-charcoal-400">No channels selected</span>
                )}
              </div>
            </div>
          )}
          {errors?.channels && (
            <p className="text-xs text-error-600 mt-2">{errors.channels}</p>
          )}
        </CardContent>
      </Card>

      {/* Sequence Configuration - show when no templates selected */}
      {showManualConfig && data.channels.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Sequence Config */}
          {data.channels.includes('email') && (
            <SequenceConfigCard
              icon={Mail}
              iconBgClass="bg-blue-50"
              iconClass="text-blue-600"
              title="Email Sequence"
              steps={data.emailSteps}
              daysBetween={data.emailDaysBetween}
              stepsField="emailSteps"
              daysBetweenField="emailDaysBetween"
              maxSteps={10}
              isEditable={isEditable}
              onChange={handleChange}
            />
          )}

          {/* LinkedIn Sequence Config */}
          {data.channels.includes('linkedin') && (
            <SequenceConfigCard
              icon={Linkedin}
              iconBgClass="bg-blue-700/10"
              iconClass="text-blue-700"
              title="LinkedIn Sequence"
              steps={data.linkedinSteps}
              daysBetween={data.linkedinDaysBetween}
              stepsField="linkedinSteps"
              daysBetweenField="linkedinDaysBetween"
              maxSteps={5}
              isEditable={isEditable}
              onChange={handleChange}
            />
          )}

          {/* SMS Sequence Config */}
          {data.channels.includes('sms') && (
            <SequenceConfigCard
              icon={MessageSquare}
              iconBgClass="bg-green-50"
              iconClass="text-green-600"
              title="SMS Sequence"
              steps={data.smsSteps}
              daysBetween={data.smsDaysBetween}
              stepsField="smsSteps"
              daysBetweenField="smsDaysBetween"
              maxSteps={5}
              isEditable={isEditable}
              onChange={handleChange}
            />
          )}

          {/* Phone Sequence Config */}
          {data.channels.includes('phone') && (
            <SequenceConfigCard
              icon={Phone}
              iconBgClass="bg-purple-50"
              iconClass="text-purple-600"
              title="Phone Sequence"
              steps={data.phoneSteps}
              daysBetween={data.phoneDaysBetween}
              stepsField="phoneSteps"
              daysBetweenField="phoneDaysBetween"
              maxSteps={5}
              isEditable={isEditable}
              onChange={handleChange}
            />
          )}

          {/* Direct Mail Sequence Config */}
          {data.channels.includes('direct_mail') && (
            <SequenceConfigCard
              icon={Send}
              iconBgClass="bg-orange-50"
              iconClass="text-orange-600"
              title="Direct Mail Sequence"
              steps={data.directMailSteps}
              daysBetween={data.directMailDaysBetween}
              stepsField="directMailSteps"
              daysBetweenField="directMailDaysBetween"
              maxSteps={3}
              maxDaysBetween={30}
              isEditable={isEditable}
              onChange={handleChange}
            />
          )}

          {/* Event Sequence Config */}
          {data.channels.includes('event') && (
            <SequenceConfigCard
              icon={Calendar}
              iconBgClass="bg-amber-50"
              iconClass="text-amber-600"
              title="Event Sequence"
              steps={data.eventSteps}
              daysBetween={data.eventDaysBetween}
              stepsField="eventSteps"
              daysBetweenField="eventDaysBetween"
              maxSteps={5}
              isEditable={isEditable}
              onChange={handleChange}
            />
          )}

          {/* Job Board Sequence Config */}
          {data.channels.includes('job_board') && (
            <SequenceConfigCard
              icon={Briefcase}
              iconBgClass="bg-cyan-50"
              iconClass="text-cyan-600"
              title="Job Board Sequence"
              steps={data.jobBoardSteps}
              daysBetween={data.jobBoardDaysBetween}
              stepsField="jobBoardSteps"
              daysBetweenField="jobBoardDaysBetween"
              maxSteps={3}
              isEditable={isEditable}
              onChange={handleChange}
            />
          )}

          {/* Referral Sequence Config */}
          {data.channels.includes('referral') && (
            <SequenceConfigCard
              icon={Users}
              iconBgClass="bg-rose-50"
              iconClass="text-rose-600"
              title="Referral Sequence"
              steps={data.referralSteps}
              daysBetween={data.referralDaysBetween}
              stepsField="referralSteps"
              daysBetweenField="referralDaysBetween"
              maxSteps={3}
              isEditable={isEditable}
              onChange={handleChange}
            />
          )}
        </div>
      )}

      {/* Automation Settings */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <CardTitle className="text-base font-heading">Automation Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stop on Reply */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-charcoal-700">
                Stop on Reply
              </Label>
              <p className="text-xs text-charcoal-500">
                Automatically pause sequence when prospect replies
              </p>
            </div>
            <Switch
              checked={data.stopOnReply}
              onCheckedChange={(v) => handleChange('stopOnReply', v)}
              disabled={!isEditable}
            />
          </div>

          {/* Stop on Meeting Booked */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-charcoal-700">
                Stop on Meeting Booked
              </Label>
              <p className="text-xs text-charcoal-500">
                Automatically pause sequence when meeting is scheduled
              </p>
            </div>
            <Switch
              checked={data.stopOnBooking}
              onCheckedChange={(v) => handleChange('stopOnBooking', v)}
              disabled={!isEditable}
            />
          </div>

          {/* Daily Send Limit */}
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-0.5">
              <Label className="text-sm font-medium text-charcoal-700">
                Daily Send Limit
              </Label>
              <p className="text-xs text-charcoal-500">
                Maximum messages to send per day
              </p>
            </div>
            <div className="w-24">
              <Input
                type="number"
                value={data.dailyLimit}
                onChange={(e) => handleChange('dailyLimit', parseInt(e.target.value, 10) || 100)}
                disabled={!isEditable}
                min={10}
                max={500}
                className="h-9 text-center tabular-nums"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CampaignChannelsSection
