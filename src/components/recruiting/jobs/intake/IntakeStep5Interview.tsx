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
import { Plus, X, Calendar, Send, MessageSquare, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  return (
    <div className="space-y-8">
      {/* Interview Process Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-500" />
            <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
              Interview Process
            </h3>
          </div>
          <div className="text-sm text-charcoal-500">
            {formData.interviewRounds.length} rounds • ~{Math.round(totalInterviewTime / 60)}h total
          </div>
        </div>

        <div className="space-y-3">
          {formData.interviewRounds.map((round, index) => (
            <div
              key={index}
              className="p-4 border border-charcoal-200 rounded-lg space-y-3 bg-white hover:border-charcoal-300 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-charcoal-300" />
                  <div className="w-7 h-7 flex items-center justify-center bg-gold-100 text-gold-700 rounded-full text-sm font-semibold">
                    {index + 1}
                  </div>
                  <Input
                    value={round.name}
                    onChange={(e) => updateInterviewRound(index, 'name', e.target.value)}
                    placeholder="Round name"
                    className="w-48 h-8 text-sm font-medium border-0 bg-transparent hover:bg-charcoal-50 focus:bg-white"
                  />
                </div>
                {formData.interviewRounds.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInterviewRound(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-charcoal-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-charcoal-500">Format</Label>
                  <Select
                    value={round.format}
                    onValueChange={(v) => updateInterviewRound(index, 'format', v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVIEW_FORMATS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.value === 'phone' && '📞 '}
                          {f.value === 'video' && '📹 '}
                          {f.value === 'onsite' && '🏢 '}
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-charcoal-500">Duration</Label>
                  <Select
                    value={round.duration.toString()}
                    onValueChange={(v) => updateInterviewRound(index, 'duration', parseInt(v))}
                  >
                    <SelectTrigger className="h-9">
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
                <div className="space-y-1">
                  <Label className="text-xs text-charcoal-500">Interviewer</Label>
                  <Input
                    value={round.interviewer}
                    onChange={(e) => updateInterviewRound(index, 'interviewer', e.target.value)}
                    placeholder="e.g., Senior Engineer"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-charcoal-500">Focus Area</Label>
                  <Input
                    value={round.focus}
                    onChange={(e) => updateInterviewRound(index, 'focus', e.target.value)}
                    placeholder="e.g., System Design"
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addInterviewRound}
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Interview Round
          </Button>
        </div>

        {/* Quick templates */}
        <div className="p-4 bg-charcoal-50 rounded-lg space-y-2">
          <p className="text-xs font-medium text-charcoal-600">Quick Templates:</p>
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
                className="text-xs"
              >
                {template.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Decision & Submission Section */}
      <div className="space-y-4 pt-6 border-t border-charcoal-100">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Submission Expectations
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Decision Timeline</Label>
            <Select
              value={formData.decisionDays}
              onValueChange={(value) => setFormData({ decisionDays: value })}
            >
              <SelectTrigger>
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
            <Label>Candidates / Week</Label>
            <Select
              value={formData.candidatesPerWeek}
              onValueChange={(value) => setFormData({ candidatesPerWeek: value })}
            >
              <SelectTrigger>
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
            <Label>Feedback Turnaround</Label>
            <Select
              value={formData.feedbackTurnaround}
              onValueChange={(value) => setFormData({ feedbackTurnaround: value })}
            >
              <SelectTrigger>
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
          <Label>Submission Notes</Label>
          <Textarea
            value={formData.submissionNotes}
            onChange={(e) => setFormData({ submissionNotes: e.target.value })}
            placeholder="Any special submission preferences, format requirements, or additional notes for the recruiting team..."
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      {/* Screening Questions Section */}
      <div className="space-y-4 pt-6 border-t border-charcoal-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Screening Questions (Optional)
          </h3>
        </div>

        <div className="space-y-2">
          <Textarea
            value={formData.screeningQuestions}
            onChange={(e) => setFormData({ screeningQuestions: e.target.value })}
            placeholder="• What's your experience with distributed systems?&#10;• Are you comfortable with on-call rotations?&#10;• What's your expected hourly rate?&#10;• Can you start within 2 weeks?"
            rows={5}
            className="resize-none font-mono text-sm"
          />
          <p className="text-xs text-charcoal-500">
            Questions to ask candidates during initial screening. Use bullet points.
          </p>
        </div>
      </div>

      {/* Summary Section */}
      <div className="space-y-4 pt-6 border-t border-charcoal-100">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Job Summary
        </h3>

        <div className="p-5 bg-gradient-to-br from-charcoal-50 to-charcoal-100 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-charcoal-500">Job Title</span>
              <span className="font-medium text-charcoal-900">{formData.title || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Client</span>
              <span className="font-medium text-charcoal-900">{formData.accountName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Type</span>
              <span className="font-medium text-charcoal-900 capitalize">{formData.jobType.replace('_', '-')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Priority</span>
              <span className={cn(
                'font-medium capitalize',
                formData.priority === 'urgent' && 'text-red-600',
                formData.priority === 'high' && 'text-amber-600',
                formData.priority === 'normal' && 'text-blue-600',
                formData.priority === 'low' && 'text-charcoal-600'
              )}>
                {formData.priority}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Bill Rate</span>
              <span className="font-medium text-charcoal-900">
                ${formData.billRateMin || '?'} - ${formData.billRateMax || '?'}/hr
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Work Style</span>
              <span className="font-medium text-charcoal-900 capitalize">
                {formData.workArrangement}
                {formData.workArrangement === 'hybrid' && ` (${formData.hybridDays}d)`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Experience</span>
              <span className="font-medium text-charcoal-900">{formData.minExperience}+ years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Required Skills</span>
              <span className="font-medium text-charcoal-900">{formData.requiredSkills.length} skills</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Interview Rounds</span>
              <span className="font-medium text-charcoal-900">
                {formData.interviewRounds.length} ({Math.round(totalInterviewTime / 60)}h)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Positions</span>
              <span className="font-medium text-charcoal-900">{formData.positionsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
