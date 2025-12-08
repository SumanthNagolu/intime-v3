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
import { Plus, X } from 'lucide-react'

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

  return (
    <div className="space-y-6">
      {/* Interview Process Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Interview Process
        </h3>

        <div className="space-y-3">
          {formData.interviewRounds.map((round, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Round {index + 1}</h4>
                {formData.interviewRounds.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInterviewRound(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={round.name}
                    onChange={(e) => updateInterviewRound(index, 'name', e.target.value)}
                    placeholder="Round name"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Format</Label>
                  <Select
                    value={round.format}
                    onValueChange={(v) => updateInterviewRound(index, 'format', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVIEW_FORMATS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duration (min)</Label>
                  <Input
                    type="number"
                    value={round.duration}
                    onChange={(e) =>
                      updateInterviewRound(index, 'duration', parseInt(e.target.value) || 30)
                    }
                    min={15}
                    step={15}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Interviewer</Label>
                  <Input
                    value={round.interviewer}
                    onChange={(e) => updateInterviewRound(index, 'interviewer', e.target.value)}
                    placeholder="e.g., Senior Engineer"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Focus</Label>
                  <Input
                    value={round.focus}
                    onChange={(e) => updateInterviewRound(index, 'focus', e.target.value)}
                    placeholder="e.g., Technical depth"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addInterviewRound} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Round
          </Button>
        </div>
      </div>

      {/* Decision & Submission Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Decision & Submission
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Decision Days</Label>
            <Input
              value={formData.decisionDays}
              onChange={(e) => setFormData({ decisionDays: e.target.value })}
              placeholder="3-5"
            />
            <p className="text-xs text-charcoal-500">Days to make hiring decision</p>
          </div>
          <div className="space-y-2">
            <Label>Candidates/Week</Label>
            <Input
              value={formData.candidatesPerWeek}
              onChange={(e) => setFormData({ candidatesPerWeek: e.target.value })}
              placeholder="3-5"
            />
            <p className="text-xs text-charcoal-500">Desired submission volume</p>
          </div>
          <div className="space-y-2">
            <Label>Feedback (hrs)</Label>
            <Input
              type="number"
              value={formData.feedbackTurnaround}
              onChange={(e) => setFormData({ feedbackTurnaround: e.target.value })}
              placeholder="48"
            />
            <p className="text-xs text-charcoal-500">Expected turnaround time</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Submission Notes</Label>
          <Textarea
            value={formData.submissionNotes}
            onChange={(e) => setFormData({ submissionNotes: e.target.value })}
            placeholder="Any special submission preferences or requirements..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Screening Questions</Label>
          <Textarea
            value={formData.screeningQuestions}
            onChange={(e) => setFormData({ screeningQuestions: e.target.value })}
            placeholder="&#8226; What's your experience level with X?&#10;&#8226; Are you comfortable with Y?&#10;&#8226; What's your expected rate?"
            rows={4}
          />
          <p className="text-xs text-charcoal-500">
            Questions to ask candidates during initial screening
          </p>
        </div>
      </div>

      {/* Summary Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Review Summary
        </h3>

        <div className="p-4 bg-charcoal-50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-charcoal-500">Job Title:</span>{' '}
              <span className="font-medium">{formData.title || 'Not set'}</span>
            </div>
            <div>
              <span className="text-charcoal-500">Account:</span>{' '}
              <span className="font-medium">{formData.accountName || 'Not set'}</span>
            </div>
            <div>
              <span className="text-charcoal-500">Job Type:</span>{' '}
              <span className="font-medium capitalize">{formData.jobType.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-charcoal-500">Priority:</span>{' '}
              <span className="font-medium capitalize">{formData.priority}</span>
            </div>
            <div>
              <span className="text-charcoal-500">Bill Rate:</span>{' '}
              <span className="font-medium">
                ${formData.billRateMin || '?'} - ${formData.billRateMax || '?'}/hr
              </span>
            </div>
            <div>
              <span className="text-charcoal-500">Work Arrangement:</span>{' '}
              <span className="font-medium capitalize">
                {formData.workArrangement}
                {formData.workArrangement === 'hybrid' && ` (${formData.hybridDays} days)`}
              </span>
            </div>
            <div>
              <span className="text-charcoal-500">Required Skills:</span>{' '}
              <span className="font-medium">{formData.requiredSkills.length} skills</span>
            </div>
            <div>
              <span className="text-charcoal-500">Interview Rounds:</span>{' '}
              <span className="font-medium">{formData.interviewRounds.length} rounds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
