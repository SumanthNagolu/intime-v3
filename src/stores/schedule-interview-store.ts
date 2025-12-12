import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDays, format } from 'date-fns'

// Types
export interface ProposedTime {
  date: string
  time: string
}

export interface Interviewer {
  name: string
  email: string
  title?: string
}

// New multi-participant support
export type ParticipantRole = 'lead_interviewer' | 'interviewer' | 'shadow' | 'observer' | 'note_taker' | 'hiring_manager'

export interface InterviewParticipant {
  id?: string // temp id for UI
  userId?: string
  contactId?: string
  name: string
  email: string
  title?: string
  role: ParticipantRole
  isRequired: boolean
}

export interface ScheduleInterviewFormData {
  // Context
  submissionId: string
  candidateName: string
  jobTitle: string
  accountName: string

  // Interview Details
  interviewType: 'phone_screen' | 'video_call' | 'in_person' | 'panel' | 'technical' | 'behavioral' | 'final_round'
  roundNumber: number
  durationMinutes: number
  timezone: string

  // Times
  proposedTimes: ProposedTime[]

  // People (legacy)
  interviewers: Interviewer[]

  // Multi-participant support (new)
  participants: InterviewParticipant[]
  isPanel: boolean
  scorecardTemplateId?: string
  primaryInterviewerContactId?: string
  coordinatorContactId?: string

  // Meeting Details
  meetingLink: string
  meetingLocation: string
  description: string
  internalNotes: string
}

interface ScheduleInterviewStore {
  formData: ScheduleInterviewFormData
  currentStep: 1 | 2 | 3
  isDirty: boolean
  lastSaved: Date | null

  // Actions
  setFormData: (data: Partial<ScheduleInterviewFormData>) => void
  setCurrentStep: (step: 1 | 2 | 3) => void
  addProposedTime: () => void
  removeProposedTime: (index: number) => void
  updateProposedTime: (index: number, time: ProposedTime) => void
  addInterviewer: () => void
  removeInterviewer: (index: number) => void
  updateInterviewer: (index: number, interviewer: Interviewer) => void
  // New participant management actions
  addParticipant: (participant?: Partial<InterviewParticipant>) => void
  removeParticipant: (index: number) => void
  updateParticipant: (index: number, participant: Partial<InterviewParticipant>) => void
  setScorecardTemplate: (templateId: string | undefined) => void
  resetForm: () => void
  initializeFromSubmission: (
    submissionId: string,
    candidateName: string,
    jobTitle: string,
    accountName: string,
    currentRound?: number
  ) => void
}

const defaultFormData: ScheduleInterviewFormData = {
  submissionId: '',
  candidateName: '',
  jobTitle: '',
  accountName: '',
  interviewType: 'phone_screen',
  roundNumber: 1,
  durationMinutes: 30,
  timezone: 'America/New_York',
  proposedTimes: [{ date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), time: '10:00' }],
  interviewers: [{ name: '', email: '', title: '' }],
  // New multi-participant fields
  participants: [],
  isPanel: false,
  scorecardTemplateId: undefined,
  primaryInterviewerContactId: undefined,
  coordinatorContactId: undefined,
  meetingLink: '',
  meetingLocation: '',
  description: '',
  internalNotes: '',
}

export const useScheduleInterviewStore = create<ScheduleInterviewStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      currentStep: 1,
      isDirty: false,
      lastSaved: null,

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
          isDirty: true,
          lastSaved: new Date(),
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      addProposedTime: () =>
        set((state) => ({
          formData: {
            ...state.formData,
            proposedTimes: [...state.formData.proposedTimes, { date: '', time: '' }],
          },
          isDirty: true,
        })),

      removeProposedTime: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            proposedTimes: state.formData.proposedTimes.filter((_, i) => i !== index),
          },
          isDirty: true,
        })),

      updateProposedTime: (index, time) =>
        set((state) => ({
          formData: {
            ...state.formData,
            proposedTimes: state.formData.proposedTimes.map((t, i) => (i === index ? time : t)),
          },
          isDirty: true,
        })),

      addInterviewer: () =>
        set((state) => ({
          formData: {
            ...state.formData,
            interviewers: [...state.formData.interviewers, { name: '', email: '', title: '' }],
          },
          isDirty: true,
        })),

      removeInterviewer: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            interviewers: state.formData.interviewers.filter((_, i) => i !== index),
          },
          isDirty: true,
        })),

      updateInterviewer: (index, interviewer) =>
        set((state) => ({
          formData: {
            ...state.formData,
            interviewers: state.formData.interviewers.map((i, idx) => (idx === index ? interviewer : i)),
          },
          isDirty: true,
        })),

      // Participant management actions
      addParticipant: (participant) =>
        set((state) => {
          const newParticipant: InterviewParticipant = {
            id: `temp-${Date.now()}`,
            name: '',
            email: '',
            role: 'interviewer',
            isRequired: true,
            ...participant,
          }
          const newParticipants = [...state.formData.participants, newParticipant]
          return {
            formData: {
              ...state.formData,
              participants: newParticipants,
              // Auto-mark as panel if more than 1 participant
              isPanel: newParticipants.length > 1,
            },
            isDirty: true,
            lastSaved: new Date(),
          }
        }),

      removeParticipant: (index) =>
        set((state) => {
          const newParticipants = state.formData.participants.filter((_, i) => i !== index)
          return {
            formData: {
              ...state.formData,
              participants: newParticipants,
              // Update panel flag
              isPanel: newParticipants.length > 1,
            },
            isDirty: true,
          }
        }),

      updateParticipant: (index, participant) =>
        set((state) => ({
          formData: {
            ...state.formData,
            participants: state.formData.participants.map((p, i) =>
              i === index ? { ...p, ...participant } : p
            ),
          },
          isDirty: true,
          lastSaved: new Date(),
        })),

      setScorecardTemplate: (templateId) =>
        set((state) => ({
          formData: {
            ...state.formData,
            scorecardTemplateId: templateId,
          },
          isDirty: true,
          lastSaved: new Date(),
        })),

      resetForm: () =>
        set({
          formData: defaultFormData,
          currentStep: 1,
          isDirty: false,
          lastSaved: null,
        }),

      initializeFromSubmission: (submissionId, candidateName, jobTitle, accountName, currentRound = 0) =>
        set((state) => ({
          formData: {
            ...state.formData,
            submissionId,
            candidateName,
            jobTitle,
            accountName,
            roundNumber: currentRound + 1,
          },
        })),
    }),
    {
      name: 'schedule-interview-form',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
      }),
    }
  )
)

// Constants
export const INTERVIEW_TYPES = [
  { value: 'phone_screen', label: 'Phone Screen', duration: 30 },
  { value: 'video_call', label: 'Video Call', duration: 45 },
  { value: 'in_person', label: 'In Person', duration: 60 },
  { value: 'panel', label: 'Panel Interview', duration: 60 },
  { value: 'technical', label: 'Technical Interview', duration: 90 },
  { value: 'behavioral', label: 'Behavioral Interview', duration: 45 },
  { value: 'final_round', label: 'Final Round', duration: 60 },
] as const

export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'UTC', label: 'UTC' },
] as const

export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180, 240] as const
export const ROUND_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

// Participant role options for multi-interviewer support
export const PARTICIPANT_ROLES = [
  { value: 'lead_interviewer', label: 'Lead Interviewer', description: 'Primary interviewer responsible for the session' },
  { value: 'interviewer', label: 'Interviewer', description: 'Standard interviewer participant' },
  { value: 'hiring_manager', label: 'Hiring Manager', description: 'Hiring manager for the role' },
  { value: 'shadow', label: 'Shadow', description: 'Observing to learn interviewing' },
  { value: 'observer', label: 'Observer', description: 'Silent observer for calibration' },
  { value: 'note_taker', label: 'Note Taker', description: 'Focused on documenting responses' },
] as const
