'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  Loader2,
  ClipboardList,
  Calendar,
  Clock,
  User,
  Building2,
  Video,
  Phone,
  Users,
  CheckCircle,
  Send,
  BookOpen,
  HelpCircle,
  FileText,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface InterviewPrepDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  interviewId: string
  interviewType: string
  roundNumber: number
  scheduledAt?: string
  durationMinutes?: number
  meetingLink?: string
  location?: string
  interviewers?: string
  candidateName: string
  jobTitle: string
  accountName: string
  accountInfo?: {
    industry?: string
    size?: string
    techStack?: string[]
    culture?: string
  }
  onSuccess?: () => void
}

const PREP_CHECKLIST = [
  { id: 'company_background', label: 'Review company background', required: true },
  { id: 'role_specifics', label: 'Discuss role specifics', required: true },
  { id: 'practice_questions', label: 'Practice common questions', required: true },
  { id: 'interview_approach', label: 'Review approach for interview type', required: true },
  { id: 'candidate_questions', label: 'Prepare questions for interviewer', required: true },
  { id: 'confirm_logistics', label: 'Confirm logistics (time, link, location)', required: true },
  { id: 'compensation', label: 'Discuss compensation if relevant', required: false },
] as const

const INTERVIEW_TYPE_QUESTIONS: Record<string, { technical: string[]; behavioral: string[] }> = {
  phone_screen: {
    technical: [
      'Walk me through your experience with [technology]',
      'Describe a challenging project you worked on',
      'What are your key strengths?',
    ],
    behavioral: [
      'Tell me about yourself',
      'Why are you interested in this role?',
      'What are you looking for in your next position?',
    ],
  },
  technical: {
    technical: [
      'Explain [technology] architecture you have designed',
      'How would you solve [problem scenario]?',
      'Walk through your approach to debugging',
      'Discuss system design for [common scenario]',
    ],
    behavioral: [
      'How do you handle technical disagreements?',
      'Describe a time you mentored a team member',
    ],
  },
  behavioral: {
    technical: [],
    behavioral: [
      'Tell me about a time you faced a conflict at work',
      'Describe a situation where you had to lead without authority',
      'How do you prioritize competing deadlines?',
      'Give an example of adapting to change',
      'Tell me about a failure and what you learned',
    ],
  },
  panel: {
    technical: [
      'Be prepared for questions from multiple perspectives',
      'Technical depth may vary by interviewer',
    ],
    behavioral: [
      'Expect leadership and collaboration questions',
      'Be ready to address different stakeholder concerns',
    ],
  },
  final_round: {
    technical: [
      'Deep dive into previous technical discussions',
      'Architecture and design questions',
    ],
    behavioral: [
      'Long-term career goals',
      'Cultural fit and team dynamics',
      'Compensation expectations',
    ],
  },
}

const MATERIAL_TYPES = [
  { id: 'company_overview', label: 'Company Overview Document' },
  { id: 'interview_tips', label: 'Interview Tips & Guidelines' },
  { id: 'logistics', label: 'Meeting Link & Logistics' },
] as const

export function InterviewPrepDialog({
  open,
  onOpenChange,
  interviewId,
  interviewType,
  roundNumber,
  scheduledAt,
  durationMinutes = 60,
  meetingLink,
  location,
  interviewers,
  candidateName,
  jobTitle,
  accountName,
  accountInfo,
  onSuccess,
}: InterviewPrepDialogProps) {
  const { toast } = useToast()

  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [prepNotes, setPrepNotes] = useState('')
  const [sendMaterials, setSendMaterials] = useState(false)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])

  const completePrepMutation = trpc.ats.interviews.completePrep.useMutation({
    onSuccess: () => {
      toast({
        title: 'Prep completed',
        description: sendMaterials
          ? 'Interview prep completed and materials sent to candidate'
          : 'Interview prep marked as complete',
      })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to complete prep',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const toggleChecked = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleMaterial = (id: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleComplete = () => {
    completePrepMutation.mutate({
      interviewId,
      prepNotes: prepNotes || undefined,
      checklistCompleted: checkedItems,
      sendMaterials,
      materialTypes: sendMaterials ? selectedMaterials : undefined,
    })
  }

  const requiredItems = PREP_CHECKLIST.filter((item) => item.required)
  const allRequiredCompleted = requiredItems.every((item) =>
    checkedItems.includes(item.id)
  )

  const questions = INTERVIEW_TYPE_QUESTIONS[interviewType] || INTERVIEW_TYPE_QUESTIONS.phone_screen

  const getInterviewTypeIcon = () => {
    switch (interviewType) {
      case 'video_call':
        return <Video className="w-4 h-4" />
      case 'phone_screen':
        return <Phone className="w-4 h-4" />
      case 'in_person':
        return <MapPin className="w-4 h-4" />
      case 'panel':
        return <Users className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-hublot-900" />
            Interview Preparation
          </DialogTitle>
          <DialogDescription>
            Prepare{' '}
            <span className="font-medium text-charcoal-900">{candidateName}</span> for
            Round {roundNumber} {interviewType.replace(/_/g, ' ')} at{' '}
            <span className="font-medium text-charcoal-900">{accountName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Interview Details */}
          <Card className="bg-cream">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="py-3 pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {getInterviewTypeIcon()}
                  <span>Round {roundNumber} - {interviewType.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-charcoal-400" />
                  <span>{durationMinutes} minutes</span>
                </div>
                {scheduledAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-charcoal-400" />
                    <span>{format(new Date(scheduledAt), 'MMM d, h:mm a')}</span>
                  </div>
                )}
                {interviewers && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-charcoal-400" />
                    <span>{interviewers}</span>
                  </div>
                )}
                {meetingLink && (
                  <div className="col-span-2">
                    <a
                      href={meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-hublot-900 hover:underline flex items-center gap-1"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting Link
                    </a>
                  </div>
                )}
                {location && (
                  <div className="col-span-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-charcoal-400" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prep Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Prep Checklist
              </Label>
              <Badge variant="outline">
                {checkedItems.length}/{PREP_CHECKLIST.length} complete
              </Badge>
            </div>
            <div className="space-y-2">
              {PREP_CHECKLIST.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
                    checkedItems.includes(item.id)
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-charcoal-200 hover:border-charcoal-300'
                  )}
                  onClick={() => toggleChecked(item.id)}
                >
                  <Checkbox
                    checked={checkedItems.includes(item.id)}
                    onCheckedChange={() => toggleChecked(item.id)}
                  />
                  <span
                    className={cn(
                      'text-sm flex-1',
                      checkedItems.includes(item.id) && 'line-through text-charcoal-500'
                    )}
                  >
                    {item.label}
                  </span>
                  {item.required && (
                    <span className="text-xs text-red-500">Required</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Company Brief */}
          {accountInfo && (
            <Card className="bg-white">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company Brief - {accountName}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3 pt-0 space-y-2 text-sm">
                {accountInfo.industry && (
                  <div>
                    <span className="text-charcoal-500">Industry:</span>{' '}
                    {accountInfo.industry}
                  </div>
                )}
                {accountInfo.size && (
                  <div>
                    <span className="text-charcoal-500">Company Size:</span>{' '}
                    {accountInfo.size}
                  </div>
                )}
                {accountInfo.techStack && accountInfo.techStack.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-charcoal-500">Tech Stack:</span>
                    <div className="flex flex-wrap gap-1">
                      {accountInfo.techStack.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {accountInfo.culture && (
                  <div>
                    <span className="text-charcoal-500">Culture:</span>{' '}
                    {accountInfo.culture}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Likely Questions */}
          <Card className="bg-white">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Likely Questions for {interviewType.replace(/_/g, ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3 pt-0 space-y-3 text-sm">
              {questions.technical.length > 0 && (
                <div>
                  <h5 className="font-medium text-charcoal-700 mb-1">Technical</h5>
                  <ul className="list-disc list-inside space-y-1 text-charcoal-600">
                    {questions.technical.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
              {questions.behavioral.length > 0 && (
                <div>
                  <h5 className="font-medium text-charcoal-700 mb-1">Behavioral</h5>
                  <ul className="list-disc list-inside space-y-1 text-charcoal-600">
                    {questions.behavioral.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prep Notes */}
          <div className="space-y-2">
            <Label htmlFor="prepNotes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Prep Notes
            </Label>
            <Textarea
              id="prepNotes"
              value={prepNotes}
              onChange={(e) => setPrepNotes(e.target.value)}
              placeholder="Notes from prep session, candidate concerns, specific focus areas..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Send Materials */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="sendMaterials"
                checked={sendMaterials}
                onCheckedChange={(checked) => setSendMaterials(checked as boolean)}
              />
              <Label htmlFor="sendMaterials" className="flex items-center gap-2 cursor-pointer">
                <Send className="w-4 h-4" />
                Send prep materials to candidate
              </Label>
            </div>

            {sendMaterials && (
              <div className="ml-7 space-y-2">
                {MATERIAL_TYPES.map((material) => (
                  <div key={material.id} className="flex items-center gap-3">
                    <Checkbox
                      id={material.id}
                      checked={selectedMaterials.includes(material.id)}
                      onCheckedChange={() => toggleMaterial(material.id)}
                    />
                    <Label htmlFor={material.id} className="cursor-pointer text-sm">
                      {material.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!allRequiredCompleted || completePrepMutation.isPending}
          >
            {completePrepMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Prep
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
