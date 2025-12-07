'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  Loader2,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  User,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Save,
  AlertTriangle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ScreeningRoomProps {
  candidateId: string
  candidateName?: string
  jobId?: string
  submissionId?: string
  existingScreeningId?: string // For resuming an existing screening
  onComplete?: (screeningId: string) => void
  onCancel?: () => void
}

type ScreeningStep = 'knockout' | 'technical' | 'soft_skills' | 'summary'

interface KnockoutAnswer {
  questionId?: string
  question: string
  answer: string
  passed: boolean
  notes?: string
}

interface SkillScore {
  rating: number
  notes: string
}

interface ProjectDiscussion {
  role: string
  teamSize: number
  duration: string
  challenge: string
  solution: string
  outcome: string
}

interface MotivationNotes {
  whyLeaving: string
  whyInterested: string
  careerGoals: string
}

const STEPS: { id: ScreeningStep; label: string }[] = [
  { id: 'knockout', label: 'Knockout' },
  { id: 'technical', label: 'Technical' },
  { id: 'soft_skills', label: 'Soft Skills' },
  { id: 'summary', label: 'Summary' },
]

const TECHNICAL_CATEGORIES = [
  { id: 'primary_tech', label: 'Primary Technology' },
  { id: 'database', label: 'Database' },
  { id: 'cloud', label: 'Cloud/Infrastructure' },
  { id: 'system_design', label: 'System Design' },
]

const SOFT_SKILL_CATEGORIES = [
  { id: 'communication', label: 'Communication' },
  { id: 'problem_solving', label: 'Problem Solving' },
  { id: 'collaboration', label: 'Collaboration' },
  { id: 'leadership', label: 'Leadership Potential' },
]

export function ScreeningRoom({
  candidateId,
  candidateName,
  jobId,
  submissionId,
  existingScreeningId,
  onComplete,
  onCancel,
}: ScreeningRoomProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [step, setStep] = useState<ScreeningStep>('knockout')
  const [screeningId, setScreeningId] = useState<string | null>(existingScreeningId || null)
  const [startTime, setStartTime] = useState<Date>(new Date())
  const [elapsedTime, setElapsedTime] = useState(0)

  // Knockout state
  const [knockoutAnswers, setKnockoutAnswers] = useState<KnockoutAnswer[]>([
    { question: 'Years of relevant experience?', answer: '', passed: false },
    { question: 'Relevant domain experience?', answer: '', passed: false },
    { question: 'Comfortable with on-call?', answer: '', passed: false },
    { question: 'Rate expectations?', answer: '', passed: false },
    { question: 'Availability to start?', answer: '', passed: false },
  ])

  // Technical state
  const [technicalScores, setTechnicalScores] = useState<Record<string, SkillScore>>({
    primary_tech: { rating: 0, notes: '' },
    database: { rating: 0, notes: '' },
    cloud: { rating: 0, notes: '' },
    system_design: { rating: 0, notes: '' },
  })
  const [projectDiscussion, setProjectDiscussion] = useState<ProjectDiscussion>({
    role: '',
    teamSize: 0,
    duration: '',
    challenge: '',
    solution: '',
    outcome: '',
  })

  // Soft skills state
  const [softSkillsScores, setSoftSkillsScores] = useState<Record<string, SkillScore>>({
    communication: { rating: 0, notes: '' },
    problem_solving: { rating: 0, notes: '' },
    collaboration: { rating: 0, notes: '' },
    leadership: { rating: 0, notes: '' },
  })
  const [cultureFit, setCultureFit] = useState(0)
  const [interestLevel, setInterestLevel] = useState<'low' | 'medium' | 'high' | 'very_high'>('medium')
  const [motivationNotes, setMotivationNotes] = useState<MotivationNotes>({
    whyLeaving: '',
    whyInterested: '',
    careerGoals: '',
  })

  // Summary state
  const [recommendation, setRecommendation] = useState<'submit' | 'submit_with_reservations' | 'hold' | 'reject'>('hold')
  const [strengths, setStrengths] = useState<string[]>([])
  const [strengthInput, setStrengthInput] = useState('')
  const [concerns, setConcerns] = useState<string[]>([])
  const [concernInput, setConcernInput] = useState('')
  const [interviewPrepNotes, setInterviewPrepNotes] = useState('')
  const [compensationNotes, setCompensationNotes] = useState('')

  // Queries
  const candidateQuery = trpc.ats.candidates.getById.useQuery({ id: candidateId })

  // Mutations
  const startScreeningMutation = trpc.ats.candidates.startScreening.useMutation({
    onSuccess: (data) => {
      setScreeningId(data.screeningId)
      setStartTime(new Date())
    },
    onError: (error) => {
      toast({ title: 'Error starting screening', description: error.message, variant: 'error' })
    },
  })

  const saveKnockoutMutation = trpc.ats.candidates.saveKnockoutAnswers.useMutation()
  const saveTechnicalMutation = trpc.ats.candidates.saveTechnicalAssessment.useMutation()
  const saveSoftSkillsMutation = trpc.ats.candidates.saveSoftSkillsAssessment.useMutation()
  const completeScreeningMutation = trpc.ats.candidates.completeScreening.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Screening completed', description: `Overall score: ${data.overallScore.toFixed(1)}/5` })
      utils.ats.candidates.getById.invalidate({ id: candidateId })
      onComplete?.(screeningId!)
    },
    onError: (error) => {
      toast({ title: 'Error completing screening', description: error.message, variant: 'error' })
    },
  })

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime])

  // Start screening on mount
  useEffect(() => {
    if (!screeningId) {
      startScreeningMutation.mutate({ candidateId, jobId, submissionId })
    }
  }, [candidateId, jobId, submissionId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const knockoutPassed = knockoutAnswers.every(a => a.passed)
  const technicalOverall = Object.values(technicalScores).filter(s => s.rating > 0).reduce((sum, s) => sum + s.rating, 0) /
    Math.max(1, Object.values(technicalScores).filter(s => s.rating > 0).length)
  const softSkillsOverall = Object.values(softSkillsScores).filter(s => s.rating > 0).reduce((sum, s) => sum + s.rating, 0) /
    Math.max(1, Object.values(softSkillsScores).filter(s => s.rating > 0).length)

  const handleSaveKnockout = async () => {
    if (!screeningId) return
    await saveKnockoutMutation.mutateAsync({
      screeningId,
      answers: knockoutAnswers,
      knockoutPassed,
    })
    setStep('technical')
  }

  const handleSaveTechnical = async () => {
    if (!screeningId) return
    const scores = Object.fromEntries(
      Object.entries(technicalScores).filter(([, v]) => v.rating > 0).map(([k, v]) => [k, { rating: v.rating, notes: v.notes }])
    )
    await saveTechnicalMutation.mutateAsync({
      screeningId,
      scores,
      projectDiscussion: projectDiscussion.role ? projectDiscussion : undefined,
    })
    setStep('soft_skills')
  }

  const handleSaveSoftSkills = async () => {
    if (!screeningId) return
    const scores = Object.fromEntries(
      Object.entries(softSkillsScores).filter(([, v]) => v.rating > 0).map(([k, v]) => [k, { rating: v.rating, notes: v.notes }])
    )
    await saveSoftSkillsMutation.mutateAsync({
      screeningId,
      scores,
      cultureFit,
      interestLevel,
      motivationNotes: motivationNotes.whyLeaving ? motivationNotes : undefined,
    })
    setStep('summary')
  }

  const handleComplete = async () => {
    if (!screeningId) return
    await completeScreeningMutation.mutateAsync({
      screeningId,
      recommendation,
      strengths,
      concerns,
      interviewPrepNotes: interviewPrepNotes || undefined,
      compensationDiscussion: compensationNotes ? { notes: compensationNotes } : undefined,
    })
  }

  const addStrength = () => {
    if (strengthInput.trim()) {
      setStrengths([...strengths, strengthInput.trim()])
      setStrengthInput('')
    }
  }

  const addConcern = () => {
    if (concernInput.trim()) {
      setConcerns([...concerns, concernInput.trim()])
      setConcernInput('')
    }
  }

  const updateKnockoutAnswer = (index: number, field: keyof KnockoutAnswer, value: string | boolean) => {
    setKnockoutAnswers(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const candidate = candidateQuery.data

  if (candidateQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-charcoal-900">Candidate Screening</h1>
          <p className="text-charcoal-500">
            {candidate?.first_name} {candidate?.last_name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-charcoal-500">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
          </div>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => setStep(s.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                step === s.id ? 'bg-hublot-900 text-white' : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
              )}
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">
                {i + 1}
              </span>
              <span className="font-medium">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 mx-2 text-charcoal-300" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Candidate Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Candidate Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-semibold text-charcoal-900">
                  {candidate?.first_name} {candidate?.last_name}
                </div>
                <div className="text-sm text-charcoal-500">{candidate?.headline}</div>
              </div>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Experience</span>
                  <span className="font-medium">{candidate?.experience_years ?? 0} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Location</span>
                  <span className="font-medium">{candidate?.location || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Rate</span>
                  <span className="font-medium">${candidate?.desired_rate}/hr</span>
                </div>
              </div>
              {candidate?.skills && candidate.skills.length > 0 && (
                <div>
                  <div className="text-sm text-charcoal-500 mb-2">Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 8).map((skill: { skill_name: string }) => (
                      <Badge key={skill.skill_name} variant="secondary" className="text-xs">
                        {skill.skill_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scores Summary */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-500">Knockout</span>
                <Badge className={knockoutPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {knockoutPassed ? 'PASS' : 'PENDING'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-500">Technical</span>
                <span className="font-semibold">{technicalOverall.toFixed(1)}/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-500">Soft Skills</span>
                <span className="font-semibold">{softSkillsOverall.toFixed(1)}/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-500">Culture Fit</span>
                <span className="font-semibold">{cultureFit}/5</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-charcoal-700">Overall</span>
                  <span className="text-xl font-bold text-charcoal-900">
                    {((technicalOverall * 0.4 + softSkillsOverall * 0.3 + cultureFit * 0.3) || 0).toFixed(1)}/5
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Screening Form */}
        <div className="lg:col-span-2">
          {/* Knockout Questions */}
          {step === 'knockout' && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Knockout Questions</CardTitle>
                <CardDescription>
                  Quick qualification check - all must pass to proceed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {knockoutAnswers.map((answer, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Label className="font-medium">{answer.question}</Label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={answer.passed}
                          onCheckedChange={(checked) => updateKnockoutAnswer(index, 'passed', checked === true)}
                        />
                        <span className={cn(
                          'text-sm font-medium',
                          answer.passed ? 'text-green-600' : 'text-charcoal-500'
                        )}>
                          {answer.passed ? 'PASS' : 'Pending'}
                        </span>
                      </label>
                    </div>
                    <Input
                      value={answer.answer}
                      onChange={(e) => updateKnockoutAnswer(index, 'answer', e.target.value)}
                      placeholder="Enter answer..."
                      className="mb-2"
                    />
                    <Textarea
                      value={answer.notes || ''}
                      onChange={(e) => updateKnockoutAnswer(index, 'notes', e.target.value)}
                      placeholder="Notes (optional)"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                ))}

                <div className={cn(
                  'p-4 rounded-lg',
                  knockoutPassed ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
                )}>
                  <div className="flex items-center gap-2">
                    {knockoutPassed ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">All knockout questions passed!</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span className="font-medium text-amber-800">
                          {knockoutAnswers.filter(a => a.passed).length}/{knockoutAnswers.length} questions passed
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveKnockout} disabled={saveKnockoutMutation.isPending}>
                    {saveKnockoutMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save & Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Assessment */}
          {step === 'technical' && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Technical Assessment</CardTitle>
                <CardDescription>
                  Rate technical skills from 1-5
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {TECHNICAL_CATEGORIES.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <Label className="font-medium mb-3 block">{category.label}</Label>
                    <div className="flex gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setTechnicalScores(prev => ({
                            ...prev,
                            [category.id]: { ...prev[category.id], rating }
                          }))}
                          className={cn(
                            'w-10 h-10 rounded-lg border-2 font-medium transition-colors',
                            technicalScores[category.id].rating === rating
                              ? 'bg-hublot-900 border-hublot-900 text-white'
                              : 'border-charcoal-200 hover:border-charcoal-400'
                          )}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                    <Textarea
                      value={technicalScores[category.id].notes}
                      onChange={(e) => setTechnicalScores(prev => ({
                        ...prev,
                        [category.id]: { ...prev[category.id], notes: e.target.value }
                      }))}
                      placeholder="Notes..."
                      rows={2}
                    />
                  </div>
                ))}

                <div className="border-t pt-6">
                  <Label className="font-medium mb-3 block">Key Project Discussion</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Role"
                      value={projectDiscussion.role}
                      onChange={(e) => setProjectDiscussion(prev => ({ ...prev, role: e.target.value }))}
                    />
                    <Input
                      placeholder="Team Size"
                      type="number"
                      value={projectDiscussion.teamSize || ''}
                      onChange={(e) => setProjectDiscussion(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 0 }))}
                    />
                    <Input
                      placeholder="Duration"
                      value={projectDiscussion.duration}
                      onChange={(e) => setProjectDiscussion(prev => ({ ...prev, duration: e.target.value }))}
                    />
                  </div>
                  <Textarea
                    placeholder="Challenge faced..."
                    value={projectDiscussion.challenge}
                    onChange={(e) => setProjectDiscussion(prev => ({ ...prev, challenge: e.target.value }))}
                    rows={2}
                    className="mt-4"
                  />
                  <Textarea
                    placeholder="Solution implemented..."
                    value={projectDiscussion.solution}
                    onChange={(e) => setProjectDiscussion(prev => ({ ...prev, solution: e.target.value }))}
                    rows={2}
                    className="mt-2"
                  />
                  <Textarea
                    placeholder="Outcome/Results..."
                    value={projectDiscussion.outcome}
                    onChange={(e) => setProjectDiscussion(prev => ({ ...prev, outcome: e.target.value }))}
                    rows={2}
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep('knockout')}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleSaveTechnical} disabled={saveTechnicalMutation.isPending}>
                    {saveTechnicalMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save & Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Soft Skills Assessment */}
          {step === 'soft_skills' && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Soft Skills & Culture Fit</CardTitle>
                <CardDescription>
                  Assess communication, collaboration, and cultural alignment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {SOFT_SKILL_CATEGORIES.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <Label className="font-medium mb-3 block">{category.label}</Label>
                    <div className="flex gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setSoftSkillsScores(prev => ({
                            ...prev,
                            [category.id]: { ...prev[category.id], rating }
                          }))}
                          className={cn(
                            'w-10 h-10 rounded-lg border-2 font-medium transition-colors',
                            softSkillsScores[category.id].rating === rating
                              ? 'bg-hublot-900 border-hublot-900 text-white'
                              : 'border-charcoal-200 hover:border-charcoal-400'
                          )}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                    <Textarea
                      value={softSkillsScores[category.id].notes}
                      onChange={(e) => setSoftSkillsScores(prev => ({
                        ...prev,
                        [category.id]: { ...prev[category.id], notes: e.target.value }
                      }))}
                      placeholder="Notes..."
                      rows={2}
                    />
                  </div>
                ))}

                <div className="border rounded-lg p-4">
                  <Label className="font-medium mb-3 block">Culture Fit</Label>
                  <div className="flex gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setCultureFit(rating)}
                        className={cn(
                          'w-10 h-10 rounded-lg border-2 font-medium transition-colors',
                          cultureFit === rating
                            ? 'bg-gold-500 border-gold-500 text-white'
                            : 'border-charcoal-200 hover:border-charcoal-400'
                        )}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <Label className="font-medium mb-3 block">Interest Level</Label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high', 'very_high'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setInterestLevel(level)}
                        className={cn(
                          'px-4 py-2 rounded-lg border-2 font-medium transition-colors capitalize',
                          interestLevel === level
                            ? 'bg-hublot-900 border-hublot-900 text-white'
                            : 'border-charcoal-200 hover:border-charcoal-400'
                        )}
                      >
                        {level.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Label className="font-medium mb-3 block">Motivation & Interest</Label>
                  <Textarea
                    placeholder="Why leaving current role?"
                    value={motivationNotes.whyLeaving}
                    onChange={(e) => setMotivationNotes(prev => ({ ...prev, whyLeaving: e.target.value }))}
                    rows={2}
                    className="mb-2"
                  />
                  <Textarea
                    placeholder="Why interested in this role/company?"
                    value={motivationNotes.whyInterested}
                    onChange={(e) => setMotivationNotes(prev => ({ ...prev, whyInterested: e.target.value }))}
                    rows={2}
                    className="mb-2"
                  />
                  <Textarea
                    placeholder="Career goals (1-2 years)?"
                    value={motivationNotes.careerGoals}
                    onChange={(e) => setMotivationNotes(prev => ({ ...prev, careerGoals: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep('technical')}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleSaveSoftSkills} disabled={saveSoftSkillsMutation.isPending}>
                    {saveSoftSkillsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save & Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary & Recommendation */}
          {step === 'summary' && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Screening Summary</CardTitle>
                <CardDescription>
                  Final recommendation and notes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium mb-3 block">Recommendation</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { id: 'submit', label: 'Submit to Client', color: 'bg-green-100 border-green-300 text-green-800' },
                      { id: 'submit_with_reservations', label: 'Submit with Reservations', color: 'bg-amber-100 border-amber-300 text-amber-800' },
                      { id: 'hold', label: 'Hold for Other Roles', color: 'bg-blue-100 border-blue-300 text-blue-800' },
                      { id: 'reject', label: 'Reject', color: 'bg-red-100 border-red-300 text-red-800' },
                    ] as const).map((rec) => (
                      <button
                        key={rec.id}
                        onClick={() => setRecommendation(rec.id)}
                        className={cn(
                          'p-4 rounded-lg border-2 text-left transition-colors',
                          recommendation === rec.id
                            ? rec.color
                            : 'border-charcoal-200 hover:border-charcoal-400'
                        )}
                      >
                        <div className="font-medium">{rec.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="font-medium mb-3 block">Strengths</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={strengthInput}
                      onChange={(e) => setStrengthInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
                      placeholder="Add strength..."
                    />
                    <Button variant="outline" onClick={addStrength}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {strengths.map((s, i) => (
                      <Badge key={i} variant="secondary" className="bg-green-100 text-green-700">
                        {s}
                        <button onClick={() => setStrengths(strengths.filter((_, idx) => idx !== i))} className="ml-2">
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="font-medium mb-3 block">Concerns / Areas to Probe</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={concernInput}
                      onChange={(e) => setConcernInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addConcern())}
                      placeholder="Add concern..."
                    />
                    <Button variant="outline" onClick={addConcern}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {concerns.map((c, i) => (
                      <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-700">
                        {c}
                        <button onClick={() => setConcerns(concerns.filter((_, idx) => idx !== i))} className="ml-2">
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="font-medium mb-3 block">Interview Preparation Notes</Label>
                  <Textarea
                    value={interviewPrepNotes}
                    onChange={(e) => setInterviewPrepNotes(e.target.value)}
                    placeholder="Notes to help prepare candidate for client interview..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="font-medium mb-3 block">Compensation Discussion Notes</Label>
                  <Textarea
                    value={compensationNotes}
                    onChange={(e) => setCompensationNotes(e.target.value)}
                    placeholder="Rate expectations, negotiation notes..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setStep('soft_skills')}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={completeScreeningMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {completeScreeningMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Complete Screening
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
