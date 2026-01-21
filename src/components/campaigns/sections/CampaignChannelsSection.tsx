'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Mail, Linkedin, Phone, Zap, CheckCircle2, Calendar, Send, MessageSquare, Briefcase, Users } from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
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
        </CardHeader>
        <CardContent>
          {isEditable ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CHANNEL_OPTIONS.map((channel) => {
                const isSelected = data.channels.includes(channel.value)
                const IconComponent = CHANNEL_ICONS[channel.value]
                return (
                  <button
                    key={channel.value}
                    type="button"
                    onClick={() => handleToggleChannel(channel.value)}
                    className={cn(
                      'relative p-5 rounded-xl border-2 text-left transition-all duration-300 group hover:shadow-elevation-sm',
                      isSelected
                        ? 'border-gold-400 bg-gradient-to-br from-gold-50/50 to-white shadow-gold-glow'
                        : 'border-charcoal-100 bg-white hover:border-gold-200'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-5 h-5 text-gold-500" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors',
                        isSelected
                          ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-gold-glow'
                          : 'bg-charcoal-50 text-charcoal-400 group-hover:bg-gold-50 group-hover:text-gold-500'
                      )}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-charcoal-900 mb-1">{channel.label}</h3>
                    <p className="text-xs text-charcoal-500">{channel.description}</p>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {data.channels.length > 0 ? (
                data.channels.map((channel) => {
                  const channelOption = CHANNEL_OPTIONS.find(c => c.value === channel)
                  const IconComponent = CHANNEL_ICONS[channel]
                  return (
                    <div
                      key={channel}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-charcoal-50 rounded-lg"
                    >
                      <IconComponent className="w-4 h-4 text-charcoal-500" />
                      <span className="text-sm font-medium text-charcoal-700">
                        {channelOption?.label || channel}
                      </span>
                    </div>
                  )
                })
              ) : (
                <span className="text-sm text-charcoal-400">No channels selected</span>
              )}
            </div>
          )}
          {errors?.channels && (
            <p className="text-xs text-error-600 mt-2">{errors.channels}</p>
          )}
        </CardContent>
      </Card>

      {/* Sequence Configuration - show when no templates selected */}
      {showManualConfig && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Sequence Config */}
          {data.channels.includes('email') && (
            <Card className="shadow-elevation-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-base font-heading">Email Sequence</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <UnifiedField
                  label="Number of Steps"
                  type="number"
                  value={String(data.emailSteps)}
                  onChange={(v) => handleChange('emailSteps', parseInt(String(v), 10) || 1)}
                  editable={isEditable}
                  min={1}
                  max={10}
                />
                <UnifiedField
                  label="Days Between Steps"
                  type="number"
                  value={String(data.emailDaysBetween)}
                  onChange={(v) => handleChange('emailDaysBetween', parseInt(String(v), 10) || 1)}
                  editable={isEditable}
                  min={1}
                  max={14}
                />
              </CardContent>
            </Card>
          )}

          {/* LinkedIn Sequence Config */}
          {data.channels.includes('linkedin') && (
            <Card className="shadow-elevation-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-700/10 rounded-lg">
                    <Linkedin className="w-4 h-4 text-blue-700" />
                  </div>
                  <CardTitle className="text-base font-heading">LinkedIn Sequence</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <UnifiedField
                  label="Number of Steps"
                  type="number"
                  value={String(data.linkedinSteps)}
                  onChange={(v) => handleChange('linkedinSteps', parseInt(String(v), 10) || 1)}
                  editable={isEditable}
                  min={1}
                  max={5}
                />
                <UnifiedField
                  label="Days Between Steps"
                  type="number"
                  value={String(data.linkedinDaysBetween)}
                  onChange={(v) => handleChange('linkedinDaysBetween', parseInt(String(v), 10) || 1)}
                  editable={isEditable}
                  min={1}
                  max={14}
                />
              </CardContent>
            </Card>
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
          <UnifiedField
            label="Stop on Reply"
            type="switch"
            value={data.stopOnReply}
            onChange={(v) => handleChange('stopOnReply', v)}
            editable={isEditable}
            helpText="Automatically pause sequence when prospect replies"
          />
          <UnifiedField
            label="Stop on Meeting Booked"
            type="switch"
            value={data.stopOnBooking}
            onChange={(v) => handleChange('stopOnBooking', v)}
            editable={isEditable}
            helpText="Automatically pause sequence when meeting is scheduled"
          />
          <UnifiedField
            label="Daily Send Limit"
            type="number"
            value={String(data.dailyLimit)}
            onChange={(v) => handleChange('dailyLimit', parseInt(String(v), 10) || 100)}
            editable={isEditable}
            min={10}
            max={500}
            helpText="Maximum messages to send per day"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default CampaignChannelsSection
