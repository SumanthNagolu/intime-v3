import {
  Search,
  FileText,
  Send,
  Eye,
  Calendar,
  Gift,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react'

// Submission status type matching the backend enum
export type SubmissionStatus =
  | 'sourced' | 'screening' | 'submission_ready' | 'submitted_to_client'
  | 'client_review' | 'client_interview' | 'offer_stage' | 'placed' | 'rejected' | 'withdrawn'

export type PipelineStage =
  | 'sourced'
  | 'screening'
  | 'submitted'
  | 'client_review'
  | 'interview'
  | 'offer'
  | 'placed'

export interface StageDefinition {
  id: PipelineStage
  label: string
  icon: LucideIcon
  color: string
  bgColor: string
  textColor: string
  statuses: string[] // Database statuses that map to this stage
}

export const PIPELINE_STAGES: StageDefinition[] = [
  {
    id: 'sourced',
    label: 'Sourced',
    icon: Search,
    color: 'bg-charcoal-100',
    bgColor: 'bg-charcoal-50',
    textColor: 'text-charcoal-700',
    statuses: ['sourced'],
  },
  {
    id: 'screening',
    label: 'Screening',
    icon: FileText,
    color: 'bg-blue-100',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    statuses: ['screening', 'submission_ready'],
  },
  {
    id: 'submitted',
    label: 'Submitted',
    icon: Send,
    color: 'bg-indigo-100',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    statuses: ['submitted', 'submitted_to_client'],
  },
  {
    id: 'client_review',
    label: 'Client Review',
    icon: Eye,
    color: 'bg-purple-100',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    statuses: ['client_review'],
  },
  {
    id: 'interview',
    label: 'Interview',
    icon: Calendar,
    color: 'bg-cyan-100',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    statuses: ['interview_scheduled', 'client_interview', 'interviewed'],
  },
  {
    id: 'offer',
    label: 'Offer',
    icon: Gift,
    color: 'bg-amber-100',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    statuses: ['offer_stage'],
  },
  {
    id: 'placed',
    label: 'Hired',
    icon: CheckCircle,
    color: 'bg-green-100',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    statuses: ['placed'],
  },
]

export function getStageFromStatus(status: string): PipelineStage {
  for (const stage of PIPELINE_STAGES) {
    if (stage.statuses.includes(status)) {
      return stage.id
    }
  }
  return 'sourced' // Default fallback
}

export function getStatusForStage(stage: PipelineStage): string {
  // Return the primary status for each stage (first in the array)
  const stageDef = PIPELINE_STAGES.find((s) => s.id === stage)
  return stageDef?.statuses[0] || 'sourced'
}
