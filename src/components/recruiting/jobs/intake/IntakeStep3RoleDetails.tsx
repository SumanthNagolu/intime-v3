'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useJobIntakeStore, ROLE_OPEN_REASONS } from '@/stores/job-intake-store'
import { cn } from '@/lib/utils'
import { FileText, Users2, Target, TrendingUp, HelpCircle, CheckCircle2, Lightbulb, Rocket, Users, BarChart3 } from 'lucide-react'

// Section wrapper component
function Section({ 
  icon: Icon, 
  title, 
  subtitle,
  children,
  className 
}: { 
  icon?: React.ElementType
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gold-600" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-charcoal-800 uppercase tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-charcoal-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

// Character count indicator
function CharacterCount({ current, min, label }: { current: number; min: number; label: string }) {
  const isMet = current >= min
  return (
    <div className="flex justify-between text-xs mt-2">
      <span className="text-charcoal-400">{current} characters</span>
      <span className={cn(
        'flex items-center gap-1',
        isMet ? 'text-forest-600' : 'text-amber-600'
      )}>
        {isMet ? (
          <>
            <CheckCircle2 className="w-3 h-3" />
            Minimum met
          </>
        ) : (
          `${label} (${min} chars min)`
        )}
      </span>
    </div>
  )
}

export function IntakeStep3RoleDetails() {
  const { formData, setFormData } = useJobIntakeStore()

  return (
    <div className="space-y-10">
      {/* Job Description Section */}
      <Section 
        icon={FileText} 
        title="Role Description"
        subtitle="Describe what this role entails"
      >
        <div className="space-y-3">
          <Label className="text-charcoal-700 font-medium flex items-center gap-2">
            Role Summary <span className="text-gold-500">*</span>
            <span className="text-xs text-charcoal-400 font-normal ml-1">
              (A brief overview of the position)
            </span>
          </Label>
          <Textarea
            value={formData.roleSummary}
            onChange={(e) => setFormData({ roleSummary: e.target.value })}
            placeholder="We are looking for a Senior Backend Engineer to join our Platform team. This role will focus on building scalable microservices and APIs that power our core product..."
            rows={4}
            className="resize-none rounded-xl border-charcoal-200 bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400"
          />
          <CharacterCount current={formData.roleSummary.length} min={20} label="Keep writing" />
        </div>

        <div className="space-y-3">
          <Label className="text-charcoal-700 font-medium flex items-center gap-2">
            Key Responsibilities <span className="text-gold-500">*</span>
            <span className="text-xs text-charcoal-400 font-normal ml-1">
              (Use bullet points for clarity)
            </span>
          </Label>
          <Textarea
            value={formData.responsibilities}
            onChange={(e) => setFormData({ responsibilities: e.target.value })}
            placeholder="• Design and implement scalable backend services&#10;• Own end-to-end development from architecture to deployment&#10;• Collaborate with frontend engineers and product managers&#10;• Mentor junior team members&#10;• Participate in code reviews and technical discussions"
            rows={6}
            className="resize-none font-mono text-sm rounded-xl border-charcoal-200 bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400"
          />
          <CharacterCount current={formData.responsibilities.length} min={20} label="Keep writing" />
        </div>

        <div className="space-y-3">
          <Label className="text-charcoal-700 font-medium flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-charcoal-400" />
            Why is this role open?
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPEN_REASONS.map((reason) => {
              const isSelected = formData.roleOpenReason === reason.value
              const icons = {
                growth: Rocket,
                backfill: Users,
                project: Lightbulb,
                restructuring: BarChart3,
              }
              const Icon = icons[reason.value as keyof typeof icons] || HelpCircle

              return (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() => setFormData({ roleOpenReason: reason.value })}
                  className={cn(
                    'relative p-4 rounded-xl border-2 text-left transition-all duration-300 overflow-hidden',
                    isSelected
                      ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50 shadow-gold-glow'
                      : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-5 h-5 text-gold-500" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isSelected ? 'bg-gold-100' : 'bg-charcoal-100'
                    )}>
                      <Icon className={cn('w-5 h-5', isSelected ? 'text-gold-600' : 'text-charcoal-500')} />
                    </div>
                    <span className={cn('text-sm font-semibold', isSelected ? 'text-gold-700' : 'text-charcoal-800')}>
                      {reason.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">Team Info</span>
        </div>
      </div>

      {/* Team Structure Section */}
      <Section icon={Users2} title="Team Structure">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Team / Department Name</Label>
            <Input
              value={formData.teamName}
              onChange={(e) => setFormData({ teamName: e.target.value })}
              placeholder="e.g., Platform Engineering, Payments Team"
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Current Team Size</Label>
            <Select
              value={formData.teamSize}
              onValueChange={(value) => setFormData({ teamSize: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select team size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-3">1-3 people (Small)</SelectItem>
                <SelectItem value="4-6">4-6 people (Medium)</SelectItem>
                <SelectItem value="7-10">7-10 people (Large)</SelectItem>
                <SelectItem value="11-20">11-20 people (XL)</SelectItem>
                <SelectItem value="20+">20+ people (Enterprise)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Reports To</Label>
            <Input
              value={formData.reportsTo}
              onChange={(e) => setFormData({ reportsTo: e.target.value })}
              placeholder="e.g., VP of Engineering, Engineering Manager"
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Will Have Direct Reports?</Label>
            <Select
              value={formData.directReports}
              onValueChange={(value) => setFormData({ directReports: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No (Individual Contributor)</SelectItem>
                <SelectItem value="1-2">1-2 reports</SelectItem>
                <SelectItem value="3-5">3-5 reports</SelectItem>
                <SelectItem value="6-10">6-10 reports</SelectItem>
                <SelectItem value="10+">10+ reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">Goals & Metrics</span>
        </div>
      </div>

      {/* Key Projects & Success Metrics Section */}
      <Section icon={Target} title="Projects & Success Metrics">
        <div className="space-y-3">
          <Label className="text-charcoal-700 font-medium flex items-center gap-2">
            <Rocket className="w-4 h-4 text-charcoal-400" />
            Key Projects This Person Will Work On
            <span className="text-xs text-charcoal-400 font-normal">(Optional)</span>
          </Label>
          <Textarea
            value={formData.keyProjects}
            onChange={(e) => setFormData({ keyProjects: e.target.value })}
            placeholder="• Real-time payment processing system&#10;• Fraud detection integration with ML models&#10;• API gateway modernization&#10;• Performance optimization initiatives"
            rows={4}
            className="resize-none rounded-xl border-charcoal-200 bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-charcoal-700 font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-charcoal-400" />
            Success Metrics (First 90 Days)
            <span className="text-xs text-charcoal-400 font-normal">(Optional)</span>
          </Label>
          <Textarea
            value={formData.successMetrics}
            onChange={(e) => setFormData({ successMetrics: e.target.value })}
            placeholder="• Day 30: Complete onboarding and ship first feature&#10;• Day 60: Own a service component independently&#10;• Day 90: Join on-call rotation, contribute to architecture decisions"
            rows={4}
            className="resize-none rounded-xl border-charcoal-200 bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400"
          />
          <p className="text-xs text-charcoal-500 flex items-center gap-2 mt-2">
            <Lightbulb className="w-3.5 h-3.5 text-gold-500" />
            These help candidates understand what &quot;success&quot; looks like in this role
          </p>
        </div>
      </Section>

      {/* Helpful Tips Card */}
      <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Pro Tip</h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              Detailed role descriptions attract better candidates. Include specific technologies, 
              project examples, and growth opportunities to help candidates envision themselves in the role.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
