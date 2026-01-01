'use client'

import { Button } from '@/components/ui/button'
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
import { useJobIntakeStore, INTERVIEW_FORMATS, InterviewRound } from '@/stores/job-intake-store'
import { Plus, X, Calendar, Send, MessageSquare, GripVertical, Clock, Users, Briefcase, MapPin, DollarSign, Target, Sparkles, CheckCircle2, Zap, Phone, Video, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Section wrapper component
function Section({ 
  icon: Icon, 
  title, 
  subtitle,
  badge,
  children,
  className 
}: { 
  icon?: React.ElementType
  title: string
  subtitle?: string
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex items-center justify-between">
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
        {badge}
      </div>
      {children}
    </div>
  )
}

export function IntakeStep5Interview() {
  const { formData, setFormData } = useJobIntakeStore()

  const addInterviewRound = () => {
    const newRound: InterviewRound = {
      name: `Round ${formData.interviewRounds.length + 1}`,
      format: 'video',
      duration: 60,
      interviewer: '',
      focus: '',
    }
    setFormData({ interviewRounds: [...formData.interviewRounds, newRound] })
  }

  const removeInterviewRound = (index: number) => {
    setFormData({
      interviewRounds: formData.interviewRounds.filter((_, i) => i !== index),
    })
  }

  const updateInterviewRound = (
    index: number,
    field: keyof InterviewRound,
    value: string | number
  ) => {
    const updated = [...formData.interviewRounds]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ interviewRounds: updated })
  }

  // Calculate total interview time
  const totalInterviewTime = formData.interviewRounds.reduce((acc, round) => acc + round.duration, 0)

  const formatIcons = {
    phone: Phone,
    video: Video,
    onsite: Building2,
  }

  return (
    <div className="space-y-10">
      {/* Interview Process Section */}
      <Section 
        icon={Calendar} 
        title="Interview Process"
        badge={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-charcoal-100 rounded-full text-xs font-medium text-charcoal-600">
            <Clock className="w-3.5 h-3.5" />
            {formData.interviewRounds.length} rounds • ~{Math.round(totalInterviewTime / 60)}h total
          </div>
        }
      >
        <div className="space-y-4">
          {formData.interviewRounds.map((round, index) => {
            const FormatIcon = formatIcons[round.format as keyof typeof formatIcons] || Video
            
            return (
              <div
                key={index}
                className="p-5 bg-white border border-charcoal-100 rounded-2xl space-y-4 hover:border-charcoal-200 hover:shadow-elevation-xs transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-5 h-5 text-charcoal-300" />
                    </div>
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-gold-100 to-amber-50 text-gold-700 rounded-xl text-sm font-bold">
                      {index + 1}
                    </div>
                    <Input
                      value={round.name}
                      onChange={(e) => updateInterviewRound(index, 'name', e.target.value)}
                      placeholder="Round name"
                      className="w-52 h-10 text-sm font-semibold border-0 bg-transparent hover:bg-charcoal-50 focus:bg-white rounded-lg"
                    />
                  </div>
                  {formData.interviewRounds.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInterviewRound(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-charcoal-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-charcoal-500 font-medium">Format</Label>
                    <Select
                      value={round.format}
                      onValueChange={(v) => updateInterviewRound(index, 'format', v)}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INTERVIEW_FORMATS.map((f) => {
                          const Icon = formatIcons[f.value as keyof typeof formatIcons] || Video
                          return (
                            <SelectItem key={f.value} value={f.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-charcoal-500" />
                                {f.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-charcoal-500 font-medium">Duration</Label>
                    <Select
                      value={round.duration.toString()}
                      onValueChange={(v) => updateInterviewRound(index, 'duration', parseInt(v))}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                        <SelectItem value="90">90 min</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                        <SelectItem value="240">4 hours (Full loop)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-charcoal-500 font-medium">Interviewer</Label>
                    <Input
                      value={round.interviewer}
                      onChange={(e) => updateInterviewRound(index, 'interviewer', e.target.value)}
                      placeholder="e.g., Senior Engineer"
                      className="h-11 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-charcoal-500 font-medium">Focus Area</Label>
                    <Input
                      value={round.focus}
                      onChange={(e) => updateInterviewRound(index, 'focus', e.target.value)}
                      placeholder="e.g., System Design"
                      className="h-11 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            )
          })}

          <Button
            type="button"
            variant="outline"
            onClick={addInterviewRound}
            className="w-full h-14 rounded-2xl border-2 border-dashed border-charcoal-200 hover:border-gold-400 hover:bg-gold-50/50 text-charcoal-600 hover:text-gold-700 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Interview Round
          </Button>
        </div>

        {/* Quick templates */}
        <div className="p-5 bg-gradient-to-r from-charcoal-50 to-slate-50 rounded-xl border border-charcoal-100">
          <p className="text-xs font-semibold text-charcoal-600 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold-500" />
            Quick Templates
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Standard (3 rounds)', rounds: [
                { name: 'Recruiter Screen', format: 'phone', duration: 30, interviewer: 'Recruiter', focus: 'Culture fit, logistics' },
                { name: 'Technical Screen', format: 'video', duration: 60, interviewer: 'Engineer', focus: 'Technical assessment' },
                { name: 'Hiring Manager', format: 'video', duration: 45, interviewer: 'Hiring Manager', focus: 'Team fit, experience' },
              ]},
              { label: 'Tech Heavy (4 rounds)', rounds: [
                { name: 'Recruiter Screen', format: 'phone', duration: 30, interviewer: 'Recruiter', focus: 'Culture fit, logistics' },
                { name: 'Coding Challenge', format: 'video', duration: 60, interviewer: 'Engineer', focus: 'Live coding' },
                { name: 'System Design', format: 'video', duration: 60, interviewer: 'Staff Engineer', focus: 'Architecture' },
                { name: 'Final Loop', format: 'onsite', duration: 180, interviewer: 'Team', focus: 'Full assessment' },
              ]},
              { label: 'Quick (2 rounds)', rounds: [
                { name: 'Phone Screen', format: 'phone', duration: 30, interviewer: 'Recruiter', focus: 'Initial qualification' },
                { name: 'Technical Interview', format: 'video', duration: 60, interviewer: 'Hiring Manager', focus: 'Full assessment' },
              ]},
            ].map((template) => (
              <Button
                key={template.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({ interviewRounds: template.rounds as InterviewRound[] })}
                className="rounded-xl border-charcoal-200 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-700 text-xs"
              >
                {template.label}
              </Button>
            ))}
          </div>
        </div>
      </Section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">Expectations</span>
        </div>
      </div>

      {/* Decision & Submission Section */}
      <Section icon={Send} title="Submission Expectations">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Decision Timeline</Label>
            <Select
              value={formData.decisionDays}
              onValueChange={(value) => setFormData({ decisionDays: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1-2 days (Fast)</SelectItem>
                <SelectItem value="3-5">3-5 days (Standard)</SelectItem>
                <SelectItem value="1 week">~1 week</SelectItem>
                <SelectItem value="2 weeks">~2 weeks</SelectItem>
                <SelectItem value="2+ weeks">2+ weeks (Slow)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-charcoal-500">After final interview</p>
          </div>
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Candidates / Week</Label>
            <Select
              value={formData.candidatesPerWeek}
              onValueChange={(value) => setFormData({ candidatesPerWeek: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1-2 (Quality focus)</SelectItem>
                <SelectItem value="3-5">3-5 (Standard)</SelectItem>
                <SelectItem value="5-10">5-10 (High volume)</SelectItem>
                <SelectItem value="10+">10+ (Mass hiring)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-charcoal-500">Desired submission volume</p>
          </div>
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Feedback Turnaround</Label>
            <Select
              value={formData.feedbackTurnaround}
              onValueChange={(value) => setFormData({ feedbackTurnaround: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">48 hours</SelectItem>
                <SelectItem value="72">72 hours</SelectItem>
                <SelectItem value="week">1 week</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-charcoal-500">Expected response time</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-charcoal-700 font-medium">Submission Notes</Label>
          <Textarea
            value={formData.submissionNotes}
            onChange={(e) => setFormData({ submissionNotes: e.target.value })}
            placeholder="Any special submission preferences, format requirements, or additional notes for the recruiting team..."
            rows={3}
            className="resize-none rounded-xl border-charcoal-200 bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400"
          />
        </div>
      </Section>

      {/* Screening Questions Section */}
      <Section icon={MessageSquare} title="Screening Questions" subtitle="Optional questions for initial screening">
        <Textarea
          value={formData.screeningQuestions}
          onChange={(e) => setFormData({ screeningQuestions: e.target.value })}
          placeholder="• What's your experience with distributed systems?&#10;• Are you comfortable with on-call rotations?&#10;• What's your expected hourly rate?&#10;• Can you start within 2 weeks?"
          rows={5}
          className="resize-none font-mono text-sm rounded-xl border-charcoal-200 bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400"
        />
        <p className="text-xs text-charcoal-500">
          Questions to ask candidates during initial screening. Use bullet points.
        </p>
      </Section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">Summary</span>
        </div>
      </div>

      {/* Summary Section */}
      <div className="p-6 bg-gradient-to-br from-charcoal-900 to-charcoal-800 rounded-2xl text-white overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-400/10 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-gold-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold">Job Summary</h3>
              <p className="text-sm text-charcoal-300">Review before creating</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
            <SummaryItem icon={Briefcase} label="Job Title" value={formData.title || '—'} />
            <SummaryItem icon={Building2} label="Client" value={formData.accountName || '—'} />
            <SummaryItem icon={Briefcase} label="Type" value={formData.jobType.replace('_', '-')} capitalize />
            <SummaryItem 
              icon={Zap} 
              label="Priority" 
              value={formData.priority}
              capitalize
              valueClass={cn(
                formData.priority === 'urgent' && 'text-red-400',
                formData.priority === 'high' && 'text-amber-400',
                formData.priority === 'normal' && 'text-blue-400',
                formData.priority === 'low' && 'text-charcoal-400'
              )}
            />
            <SummaryItem 
              icon={DollarSign} 
              label="Bill Rate" 
              value={`$${formData.billRateMin || '?'} - $${formData.billRateMax || '?'}/hr`} 
            />
            <SummaryItem 
              icon={MapPin} 
              label="Work Style" 
              value={`${formData.workArrangement}${formData.workArrangement === 'hybrid' ? ` (${formData.hybridDays}d)` : ''}`}
              capitalize
            />
            <SummaryItem icon={Clock} label="Experience" value={`${formData.minExperience}+ years`} />
            <SummaryItem icon={Target} label="Required Skills" value={`${formData.requiredSkills.length} skills`} />
            <SummaryItem icon={Calendar} label="Interview Rounds" value={`${formData.interviewRounds.length} (${Math.round(totalInterviewTime / 60)}h)`} />
            <SummaryItem icon={Users} label="Positions" value={formData.positionsCount.toString()} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Summary item component
function SummaryItem({ 
  icon: Icon, 
  label, 
  value, 
  capitalize = false,
  valueClass
}: { 
  icon: React.ElementType
  label: string
  value: string
  capitalize?: boolean
  valueClass?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-charcoal-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-charcoal-400">{label}</p>
        <p className={cn(
          'text-sm font-medium text-white truncate',
          capitalize && 'capitalize',
          valueClass
        )}>
          {value}
        </p>
      </div>
    </div>
  )
}
