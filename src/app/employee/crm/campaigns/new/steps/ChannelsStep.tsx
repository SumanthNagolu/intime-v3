'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Linkedin,
  GitBranch,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  CreateCampaignFormData,
  CHANNEL_OPTIONS,
} from '@/stores/create-campaign-store'
import { SequenceTemplatePicker } from '@/components/crm/sequences/SequenceTemplatePicker'

interface StepProps {
  formData: CreateCampaignFormData
  setFormData: (data: Partial<CreateCampaignFormData>) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  onCancel: () => void
  isFirst: boolean
  isLast: boolean
  isSubmitting: boolean
}

export function ChannelsStep({
  formData,
  setFormData,
  onNext,
  onPrev,
}: StepProps) {
  const toggleChannel = (channel: 'email' | 'linkedin' | 'phone' | 'event' | 'direct_mail') => {
    if (formData.channels.includes(channel)) {
      setFormData({ channels: formData.channels.filter(c => c !== channel) })
    } else {
      setFormData({ channels: [...formData.channels, channel] })
    }
  }

  const isValid = formData.channels.length > 0

  return (
    <div className="space-y-6">
      <div>
        <Label>Outreach Channels *</Label>
        <p className="text-sm text-charcoal-500 mb-2">Select channels for this campaign</p>
        <div className="grid grid-cols-3 gap-4">
          {CHANNEL_OPTIONS.map((channel) => {
            const Icon = channel.icon
            const selected = formData.channels.includes(channel.value)
            return (
              <div
                key={channel.value}
                onClick={() => toggleChannel(channel.value)}
                className={cn(
                  'flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all',
                  selected && 'border-hublot-900 bg-hublot-50',
                  !selected && 'hover:border-charcoal-300'
                )}
              >
                <Icon className={cn('w-8 h-8 mb-2', selected ? 'text-hublot-900' : 'text-charcoal-400')} />
                <span className="font-medium">{channel.label}</span>
              </div>
            )
          })}
        </div>
        {formData.channels.length === 0 && (
          <p className="text-sm text-red-500 mt-2">Select at least one channel</p>
        )}
      </div>

      {/* Sequence Templates - Pick from Library */}
      {formData.channels.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3 bg-charcoal-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-hublot-600" />
              <h4 className="font-medium">Sequence Templates</h4>
            </div>
            <Link href="/employee/crm/sequences" target="_blank">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <ExternalLink className="w-3 h-3" />
                Manage Library
              </Button>
            </Link>
          </div>
          <p className="text-sm text-charcoal-500">
            Use pre-built sequence templates or configure manually below
          </p>
          <SequenceTemplatePicker
            selectedIds={formData.sequenceTemplateIds}
            onChange={(ids) => setFormData({ sequenceTemplateIds: ids })}
          />
        </div>
      )}

      {/* Manual Configuration - Only show if no templates selected */}
      {formData.sequenceTemplateIds.length === 0 && (
        <>
          <p className="text-sm text-charcoal-500 italic">
            Or configure sequences manually:
          </p>

          {formData.channels.includes('email') && (
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Sequence
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Number of Steps</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.emailSteps}
                    onChange={(e) => setFormData({ emailSteps: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Days Between Steps</Label>
                  <Input
                    type="number"
                    min={1}
                    max={14}
                    value={formData.emailDaysBetween}
                    onChange={(e) => setFormData({ emailDaysBetween: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.channels.includes('linkedin') && (
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Linkedin className="w-4 h-4" /> LinkedIn Sequence
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Number of Steps</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.linkedinSteps}
                    onChange={(e) => setFormData({ linkedinSteps: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Days Between Steps</Label>
                  <Input
                    type="number"
                    min={1}
                    max={14}
                    value={formData.linkedinDaysBetween}
                    onChange={(e) => setFormData({ linkedinDaysBetween: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4 space-y-4">
            <h4 className="text-sm font-medium">Automation Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-normal">Stop sequence when prospect replies</Label>
                <Switch
                  checked={formData.stopOnReply}
                  onCheckedChange={(checked) => setFormData({ stopOnReply: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Stop sequence when meeting is booked</Label>
                <Switch
                  checked={formData.stopOnBooking}
                  onCheckedChange={(checked) => setFormData({ stopOnBooking: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Daily send limit</Label>
                <Input
                  type="number"
                  className="w-24"
                  min={10}
                  max={500}
                  value={formData.dailyLimit}
                  onChange={(e) => setFormData({ dailyLimit: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button type="button" onClick={onNext} disabled={!isValid}>
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
