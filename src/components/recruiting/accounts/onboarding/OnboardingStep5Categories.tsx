'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useAccountOnboardingStore, JOB_CATEGORIES } from '@/stores/account-onboarding-store'
import { cn } from '@/lib/utils'

const WORK_AUTHS = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'h1b_transfer', label: 'H1B Transfer' },
  { value: 'opt_cpt', label: 'OPT/CPT' },
  { value: 'tn_visa', label: 'TN Visa' },
]

const EXP_LEVELS = [
  { value: 'junior', label: 'Junior (0-2 yrs)' },
  { value: 'mid', label: 'Mid (3-5 yrs)' },
  { value: 'senior', label: 'Senior (5-8 yrs)' },
  { value: 'staff', label: 'Staff/Principal (8+)' },
]

const LOCATIONS = [
  { value: 'remote_us', label: 'Remote (US)' },
  { value: 'remote_global', label: 'Remote (Global)' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site only' },
]

export function OnboardingStep5Categories() {
  const { formData, setFormData } = useAccountOnboardingStore()

  const toggleCategory = (category: string) => {
    if (formData.selectedJobCategories.includes(category)) {
      setFormData({
        selectedJobCategories: formData.selectedJobCategories.filter((c) => c !== category),
      })
    } else {
      setFormData({
        selectedJobCategories: [...formData.selectedJobCategories, category],
      })
    }
  }

  const toggleWorkAuth = (auth: string) => {
    if (formData.workAuthorizations.includes(auth)) {
      setFormData({
        workAuthorizations: formData.workAuthorizations.filter((a) => a !== auth),
      })
    } else {
      setFormData({
        workAuthorizations: [...formData.workAuthorizations, auth],
      })
    }
  }

  const toggleExpLevel = (level: string) => {
    if (formData.experienceLevels.includes(level)) {
      setFormData({
        experienceLevels: formData.experienceLevels.filter((l) => l !== level),
      })
    } else {
      setFormData({
        experienceLevels: [...formData.experienceLevels, level],
      })
    }
  }

  const toggleLocation = (loc: string) => {
    if (formData.locationPreferences.includes(loc)) {
      setFormData({
        locationPreferences: formData.locationPreferences.filter((l) => l !== loc),
      })
    } else {
      setFormData({
        locationPreferences: [...formData.locationPreferences, loc],
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Hot Job Categories */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Hot Job Categories
        </h3>
        <p className="text-sm text-charcoal-500">
          Select the job categories this client typically hires for
        </p>
        <div className="space-y-4">
          {JOB_CATEGORIES.map((group) => (
            <div key={group.group}>
              <h4 className="text-sm font-medium text-charcoal-700 mb-2">{group.group}</h4>
              <div className="grid grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <label
                    key={item.value}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors',
                      formData.selectedJobCategories.includes(item.value)
                        ? 'bg-hublot-50 border-hublot-700'
                        : 'border-charcoal-200 hover:border-charcoal-300'
                    )}
                  >
                    <Checkbox
                      checked={formData.selectedJobCategories.includes(item.value)}
                      onCheckedChange={() => toggleCategory(item.value)}
                    />
                    <span className="text-sm">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Technology Preferences
        </h3>
        <div className="space-y-2">
          <Label>Primary Tech Stack</Label>
          <Textarea
            value={formData.techStack}
            onChange={(e) => setFormData({ techStack: e.target.value })}
            placeholder="React, Node.js, AWS, Python, PostgreSQL..."
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>Nice-to-Have Skills</Label>
          <Textarea
            value={formData.niceToHaveSkills}
            onChange={(e) => setFormData({ niceToHaveSkills: e.target.value })}
            placeholder="Kubernetes, GraphQL, Kafka..."
            rows={2}
          />
        </div>
      </div>

      {/* Candidate Requirements */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Candidate Requirements
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Work Authorization</Label>
            <div className="flex flex-wrap gap-2">
              {WORK_AUTHS.map((auth) => (
                <button
                  key={auth.value}
                  type="button"
                  onClick={() => toggleWorkAuth(auth.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-colors',
                    formData.workAuthorizations.includes(auth.value)
                      ? 'bg-hublot-700 text-white'
                      : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                  )}
                >
                  {auth.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Experience Levels</Label>
            <div className="flex flex-wrap gap-2">
              {EXP_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => toggleExpLevel(level.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-colors',
                    formData.experienceLevels.includes(level.value)
                      ? 'bg-hublot-700 text-white'
                      : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                  )}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Location Preferences</Label>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.value}
                  type="button"
                  onClick={() => toggleLocation(loc.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-colors',
                    formData.locationPreferences.includes(loc.value)
                      ? 'bg-hublot-700 text-white'
                      : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                  )}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interview Process */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Interview Process
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Typical Interview Rounds</Label>
            <Input
              type="number"
              value={formData.interviewRounds}
              onChange={(e) => setFormData({ interviewRounds: e.target.value })}
              placeholder="4"
              min={1}
              max={10}
            />
          </div>
          <div className="space-y-2">
            <Label>Avg. Decision Days</Label>
            <Input
              value={formData.avgDecisionDays}
              onChange={(e) => setFormData({ avgDecisionDays: e.target.value })}
              placeholder="3-5"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Interview Process Notes</Label>
          <Textarea
            value={formData.interviewProcessNotes}
            onChange={(e) => setFormData({ interviewProcessNotes: e.target.value })}
            placeholder="Any specific interview format, panel preferences, take-home assignments..."
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
