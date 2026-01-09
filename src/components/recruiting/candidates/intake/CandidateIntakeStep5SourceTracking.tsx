'use client'

import { FileText, Star, MessageSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateCandidateStore, LEAD_SOURCES } from '@/stores/create-candidate-store'
import { Section, FieldGroup, ValidationBanner, SelectCard } from './shared'

export function CandidateIntakeStep5SourceTracking() {
  const { formData, setFormData } = useCreateCandidateStore()

  // Build validation items
  const validationItems: string[] = []
  // No required validations for this step

  return (
    <div className="space-y-8">
      <Section
        icon={FileText}
        title="Lead Source"
        subtitle="How did you find this candidate?"
      >
        <div className="space-y-2">
          <Label htmlFor="leadSource" className="text-charcoal-700 font-medium">
            Source <span className="text-gold-500">*</span>
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {LEAD_SOURCES.map((source) => (
              <SelectCard
                key={source.value}
                selected={formData.leadSource === source.value}
                onClick={() => setFormData({ leadSource: source.value as typeof formData.leadSource })}
              >
                <div className="text-center">
                  <span className="text-2xl mb-2 block">{source.icon}</span>
                  <span className="text-sm font-semibold text-charcoal-800 block">{source.label}</span>
                </div>
              </SelectCard>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceDetails" className="text-charcoal-700 font-medium">
            Source Details
          </Label>
          <Input
            id="sourceDetails"
            value={formData.sourceDetails || ''}
            onChange={(e) => setFormData({ sourceDetails: e.target.value })}
            placeholder="e.g., Found via LinkedIn Recruiter search, referred by John Doe"
            className="h-12 rounded-xl border-charcoal-200 bg-white"
            maxLength={500}
          />
          <p className="text-xs text-charcoal-500">Additional details about how you sourced this candidate</p>
        </div>
      </Section>

      <Section
        icon={Star}
        title="Hotlist"
        subtitle="Mark high-priority candidates for immediate attention"
      >
        <div className="flex items-start space-x-3 p-5 bg-gradient-to-r from-gold-50 to-amber-50 rounded-xl border border-gold-200">
          <Checkbox
            id="isOnHotlist"
            checked={formData.isOnHotlist}
            onCheckedChange={(checked) => setFormData({ isOnHotlist: checked === true })}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="isOnHotlist" className="text-sm font-semibold text-gold-800 cursor-pointer flex items-center gap-2">
              <Star className="w-4 h-4 text-gold-500" />
              Add to Hotlist
            </Label>
            <p className="text-xs text-gold-700 mt-1">
              Hotlist candidates appear prominently in the talent pool and are prioritized for matching with new jobs.
            </p>
          </div>
        </div>

        {formData.isOnHotlist && (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="hotlistNotes" className="text-charcoal-700 font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-charcoal-400" />
              Hotlist Notes
            </Label>
            <Textarea
              id="hotlistNotes"
              value={formData.hotlistNotes || ''}
              onChange={(e) => setFormData({ hotlistNotes: e.target.value })}
              placeholder="Notes about why this candidate is on the hotlist..."
              className="min-h-[100px] rounded-xl border-charcoal-200 bg-white resize-none"
              maxLength={500}
            />
            <p className="text-xs text-charcoal-500">These notes are visible to all recruiters (max 500 characters)</p>
          </div>
        )}
      </Section>

      {/* Validation Summary */}
      <ValidationBanner items={validationItems} />
    </div>
  )
}
