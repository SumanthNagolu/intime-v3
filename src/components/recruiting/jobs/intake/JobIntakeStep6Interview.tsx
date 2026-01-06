'use client'

import { useState } from 'react'
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
import {
  useCreateJobStore,
  INTERVIEW_FORMATS,
  SUBMISSION_REQUIREMENTS,
  SUBMISSION_FORMATS,
  type InterviewRound,
} from '@/stores/create-job-store'
import { Section, FieldGroup, ChipToggle, EmptyState, InlineItemCard } from './shared'
import { Calendar, FileText, Users, MessageSquare, Plus, Clock, Send } from 'lucide-react'

export function JobIntakeStep6Interview() {
  const { formData, setFormData, addInterviewRound, removeInterviewRound, updateInterviewRound, toggleArrayItem } = useCreateJobStore()

  // Local state for adding new round
  const [isAddingRound, setIsAddingRound] = useState(false)
  const [newRound, setNewRound] = useState<Partial<InterviewRound>>({
    name: '',
    format: 'video',
    duration: 60,
    interviewer: '',
    focus: '',
  })

  const handleAddRound = () => {
    if (!newRound.name?.trim()) return
    addInterviewRound({
      id: crypto.randomUUID(),
      name: newRound.name.trim(),
      format: newRound.format as InterviewRound['format'],
      duration: newRound.duration || 60,
      interviewer: newRound.interviewer || '',
      focus: newRound.focus || '',
    })
    setNewRound({
      name: '',
      format: 'video',
      duration: 60,
      interviewer: '',
      focus: '',
    })
    setIsAddingRound(false)
  }

  return (
    <div className="space-y-10">
      {/* Interview Rounds */}
      <Section icon={Calendar} title="Interview Rounds" subtitle={`${formData.interviewRounds.length} rounds configured`}>
        {formData.interviewRounds.length > 0 ? (
          <div className="space-y-3">
            {formData.interviewRounds.map((round, index) => (
              <InlineItemCard
                key={round.id}
                onRemove={() => removeInterviewRound(round.id)}
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-charcoal-900">{round.name}</p>
                    <p className="text-xs text-charcoal-500">
                      {round.format} • {round.duration} min
                      {round.interviewer && ` • ${round.interviewer}`}
                    </p>
                  </div>
                  {round.focus && (
                    <span className="text-xs px-2 py-1 bg-charcoal-100 text-charcoal-600 rounded-full">
                      {round.focus}
                    </span>
                  )}
                </div>
              </InlineItemCard>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No interview rounds defined"
            description="Add interview rounds to help recruiters understand the process"
          />
        )}

        {/* Add Round Form */}
        {isAddingRound ? (
          <div className="p-6 border-2 border-gold-200 rounded-xl bg-gold-50/50 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-charcoal-900">Add Interview Round</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingRound(false)}
              >
                Cancel
              </Button>
            </div>

            <FieldGroup cols={3}>
              <div className="space-y-2">
                <Label className="text-charcoal-700 font-medium">Round Name *</Label>
                <Input
                  value={newRound.name}
                  onChange={(e) => setNewRound({ ...newRound, name: e.target.value })}
                  placeholder="e.g., Technical Screen"
                  className="h-11 rounded-xl border-charcoal-200 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-charcoal-700 font-medium">Format</Label>
                <Select
                  value={newRound.format}
                  onValueChange={(value) => setNewRound({ ...newRound, format: value as InterviewRound['format'] })}
                >
                  <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVIEW_FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-charcoal-700 font-medium">Duration</Label>
                <Select
                  value={newRound.duration?.toString()}
                  onValueChange={(value) => setNewRound({ ...newRound, duration: parseInt(value) })}
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
                  </SelectContent>
                </Select>
              </div>
            </FieldGroup>

            <FieldGroup cols={2}>
              <div className="space-y-2">
                <Label className="text-charcoal-700 font-medium">Interviewer (Title/Role)</Label>
                <Input
                  value={newRound.interviewer}
                  onChange={(e) => setNewRound({ ...newRound, interviewer: e.target.value })}
                  placeholder="e.g., Senior Engineer, Hiring Manager"
                  className="h-11 rounded-xl border-charcoal-200 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-charcoal-700 font-medium">Focus Areas</Label>
                <Input
                  value={newRound.focus}
                  onChange={(e) => setNewRound({ ...newRound, focus: e.target.value })}
                  placeholder="e.g., System Design, Culture Fit"
                  className="h-11 rounded-xl border-charcoal-200 bg-white"
                />
              </div>
            </FieldGroup>

            <Button
              type="button"
              onClick={handleAddRound}
              disabled={!newRound.name?.trim()}
              className="rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Round
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddingRound(true)}
            className="rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Interview Round
          </Button>
        )}
      </Section>

      {/* Timeline & Expectations */}
      <Section icon={Clock} title="Timeline & Expectations" subtitle="Process timing and candidate flow">
        <FieldGroup cols={3}>
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
                <SelectItem value="1-2">1-2 days</SelectItem>
                <SelectItem value="3-5">3-5 days</SelectItem>
                <SelectItem value="1 week">1 week</SelectItem>
                <SelectItem value="2 weeks">2 weeks</SelectItem>
                <SelectItem value="3+ weeks">3+ weeks</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-charcoal-500">Time from final interview to decision</p>
          </div>

          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Candidates Per Week</Label>
            <Select
              value={formData.candidatesPerWeek}
              onValueChange={(value) => setFormData({ candidatesPerWeek: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1-2 candidates</SelectItem>
                <SelectItem value="3-5">3-5 candidates</SelectItem>
                <SelectItem value="5-10">5-10 candidates</SelectItem>
                <SelectItem value="10+">10+ candidates</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-charcoal-500">Desired submission rate</p>
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
                <SelectItem value="1 week">1 week</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-charcoal-500">Expected feedback time</p>
          </div>
        </FieldGroup>
      </Section>

      {/* Submission Requirements */}
      <Section icon={Send} title="Submission Requirements" subtitle="What do you need from candidates?">
        <div className="flex flex-wrap gap-2">
          {SUBMISSION_REQUIREMENTS.map((req) => (
            <ChipToggle
              key={req.value}
              selected={formData.submissionRequirements.includes(req.value)}
              onClick={() => toggleArrayItem('submissionRequirements', req.value)}
            >
              {req.label}
            </ChipToggle>
          ))}
        </div>

        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Submission Format</Label>
            <Select
              value={formData.submissionFormat}
              onValueChange={(value) => setFormData({ submissionFormat: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBMISSION_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Submission Notes</Label>
            <Input
              value={formData.submissionNotes}
              onChange={(e) => setFormData({ submissionNotes: e.target.value })}
              placeholder="Any special instructions for submissions..."
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>
        </FieldGroup>
      </Section>

      {/* Client Process Documentation */}
      <Section icon={FileText} title="Client Process Documentation" subtitle="Detailed instructions from the client">
        <div className="space-y-2">
          <Label className="text-charcoal-700 font-medium">Client Interview Process</Label>
          <Textarea
            value={formData.clientInterviewProcess}
            onChange={(e) => setFormData({ clientInterviewProcess: e.target.value })}
            placeholder="Detailed notes about the client's interview process, preferences, and expectations..."
            rows={4}
            className="rounded-xl border-charcoal-200 bg-white resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-charcoal-700 font-medium">Client Submission Instructions</Label>
          <Textarea
            value={formData.clientSubmissionInstructions}
            onChange={(e) => setFormData({ clientSubmissionInstructions: e.target.value })}
            placeholder="How the client wants candidates submitted (email format, portal instructions, etc.)..."
            rows={4}
            className="rounded-xl border-charcoal-200 bg-white resize-none"
          />
        </div>
      </Section>

      {/* Screening Questions */}
      <Section icon={MessageSquare} title="Screening Questions" subtitle="Questions to ask candidates upfront">
        <div className="space-y-2">
          <Label className="text-charcoal-700 font-medium">Pre-Screen Questions</Label>
          <Textarea
            value={formData.screeningQuestions}
            onChange={(e) => setFormData({ screeningQuestions: e.target.value })}
            placeholder="• Are you authorized to work in the US?&#10;• What is your expected compensation?&#10;• When can you start?&#10;• Do you have experience with [specific technology]?"
            rows={6}
            className="rounded-xl border-charcoal-200 bg-white resize-none font-mono text-sm"
          />
          <p className="text-xs text-charcoal-500">
            Use bullet points or numbered questions. These will be shown to recruiters during candidate screening.
          </p>
        </div>
      </Section>
    </div>
  )
}
