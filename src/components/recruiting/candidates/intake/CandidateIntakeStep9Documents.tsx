'use client'

import React from 'react'
import {
  FileText,
  Tag,
  Star,
  MessageSquare,
  Link2,
} from 'lucide-react'
import { useCreateCandidateStore, LEAD_SOURCES } from '@/stores/create-candidate-store'
import { Section, FieldGroup, ValidationBanner, SectionDivider } from './shared'
import { ComplianceDocumentUpload } from './ComplianceDocumentUpload'
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

export function CandidateIntakeStep9Documents() {
  const {
    formData,
    setFormData,
    addComplianceDocument,
    updateComplianceDocument,
    removeComplianceDocument,
    addTag,
    removeTag,
  } = useCreateCandidateStore()

  const {
    leadSource,
    sourceDetails,
    referredBy,
    complianceDocuments,
    isOnHotlist,
    hotlistNotes,
    tags,
    internalNotes,
  } = formData

  // Validation items
  const validationItems: string[] = []
  if (!leadSource) {
    validationItems.push('Select a lead source')
  }
  if (leadSource === 'referral' && !referredBy?.trim()) {
    validationItems.push('Enter the referrer name')
  }

  // Tag input handler
  const [tagInput, setTagInput] = React.useState('')
  const handleAddTag = () => {
    if (tagInput.trim()) {
      addTag(tagInput.trim())
      setTagInput('')
    }
  }

  return (
    <div className="space-y-8">
      {/* Source Tracking */}
      <Section
        icon={Link2}
        title="Source Tracking"
        subtitle="How did this candidate come to your attention?"
      >
        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-charcoal-700">
              Lead Source <span className="text-red-500">*</span>
            </Label>
            <Select
              value={leadSource}
              onValueChange={(value) => setFormData({ leadSource: value as typeof leadSource })}
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    <span className="flex items-center gap-2">
                      <span>{source.icon}</span>
                      <span>{source.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-charcoal-700">
              Source Details
            </Label>
            <Input
              value={sourceDetails || ''}
              onChange={(e) => setFormData({ sourceDetails: e.target.value })}
              placeholder="Additional details about the source..."
              className="h-12 rounded-xl"
            />
          </div>
        </FieldGroup>

        {leadSource === 'referral' && (
          <div className="space-y-2 mt-4">
            <Label className="text-sm font-medium text-charcoal-700">
              Referred By <span className="text-red-500">*</span>
            </Label>
            <Input
              value={referredBy || ''}
              onChange={(e) => setFormData({ referredBy: e.target.value })}
              placeholder="Name of the person who referred this candidate"
              className="h-12 rounded-xl"
            />
          </div>
        )}
      </Section>

      <SectionDivider label="Documents" />

      {/* Compliance Documents */}
      <Section
        icon={FileText}
        title="Compliance Documents"
        subtitle="Upload documents for job submissions and placements"
      >
        <ComplianceDocumentUpload
          documents={complianceDocuments}
          onAdd={addComplianceDocument}
          onUpdate={updateComplianceDocument}
          onRemove={removeComplianceDocument}
        />
      </Section>

      <SectionDivider label="Organization" />

      {/* Tags */}
      <Section
        icon={Tag}
        title="Tags"
        subtitle="Add searchable tags to help find this candidate later"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              placeholder="Type a tag and press Enter..."
              className="h-10 rounded-xl flex-1"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 h-10 rounded-xl bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-700 text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gradient-to-r from-gold-50 to-amber-50 border border-gold-200 text-gold-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="w-4 h-4 rounded-full hover:bg-gold-200 flex items-center justify-center transition-colors"
                  >
                    <span className="text-xs font-bold">&times;</span>
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-charcoal-500">
            Suggested tags: technology, skills, industries, specializations
          </p>
        </div>
      </Section>

      {/* Hotlist */}
      <Section
        icon={Star}
        title="Priority Status"
        subtitle="Mark high-priority candidates for quick access"
      >
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 rounded-xl border border-charcoal-200 hover:border-gold-300 hover:bg-gold-50/30 cursor-pointer transition-colors">
            <Checkbox
              checked={isOnHotlist}
              onCheckedChange={(checked) => setFormData({ isOnHotlist: !!checked })}
            />
            <div>
              <span className="font-medium text-charcoal-800 flex items-center gap-2">
                <Star className="w-4 h-4 text-gold-500" />
                Add to Hotlist
              </span>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Hotlist candidates appear in quick-access lists and priority views
              </p>
            </div>
          </label>

          {isOnHotlist && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-charcoal-700">
                Hotlist Notes
              </Label>
              <Textarea
                value={hotlistNotes || ''}
                onChange={(e) => setFormData({ hotlistNotes: e.target.value })}
                placeholder="Why is this candidate on the hotlist? Any special considerations..."
                rows={2}
                className="rounded-xl resize-none"
              />
            </div>
          )}
        </div>
      </Section>

      {/* Internal Notes */}
      <Section
        icon={MessageSquare}
        title="Internal Notes"
        subtitle="Private notes visible only to your team"
      >
        <Textarea
          value={internalNotes || ''}
          onChange={(e) => setFormData({ internalNotes: e.target.value })}
          placeholder="Add any internal notes about this candidate..."
          rows={4}
          className="rounded-xl resize-none"
        />
        <p className="text-xs text-charcoal-500 mt-2">
          These notes are for internal use only and will not be shared with the candidate or clients.
        </p>
      </Section>

      <ValidationBanner items={validationItems} />
    </div>
  )
}
