import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface SkillEntry {
  name: string
  years: string
  proficiency: 'beginner' | 'proficient' | 'expert'
}

export interface InterviewRound {
  name: string
  format: string
  duration: number
  interviewer: string
  focus: string
}

export interface JobIntakeFormData {
  // Step 1: Basic Information
  accountId: string
  accountName: string
  hiringManagerId: string
  intakeMethod: string
  title: string
  positionsCount: number
  jobType: string
  priority: string
  targetStartDate: string
  targetEndDate: string

  // JOBS-01: Unified company/contact references
  clientCompanyId: string | null
  endClientCompanyId: string | null
  vendorCompanyId: string | null
  hiringManagerContactId: string | null
  hrContactId: string | null
  externalJobId: string
  priorityRank: number
  slaDays: number
  feeType: 'percentage' | 'flat' | 'hourly_spread'
  feePercentage: number | null
  feeFlatAmount: number | null

  // Step 2: Technical Requirements
  minExperience: string
  preferredExperience: string
  experienceLevel: string
  requiredSkills: SkillEntry[]
  preferredSkills: string[]
  education: string
  certifications: string[]  // Changed to array for multiple certifications
  industries: string[]

  // Step 3: Role Details
  roleSummary: string
  responsibilities: string
  roleOpenReason: string
  teamName: string
  teamSize: string
  reportsTo: string
  directReports: string
  keyProjects: string
  successMetrics: string

  // Step 4: Logistics & Compensation
  workArrangement: string
  hybridDays: number
  locationRestrictions: string[]
  // Structured location fields (for centralized addresses)
  locationAddressLine1: string
  locationAddressLine2: string
  locationCity: string
  locationState: string
  locationPostalCode: string
  locationCountry: string
  workAuthorizations: string[]
  billRateMin: string
  billRateMax: string
  payRateMin: string
  payRateMax: string
  conversionSalaryMin: string
  conversionSalaryMax: string
  conversionFee: string
  benefits: string[]
  weeklyHours: string
  overtimeExpected: string
  onCallRequired: boolean
  onCallSchedule: string

  // Step 5: Interview Process
  interviewRounds: InterviewRound[]
  decisionDays: string
  submissionRequirements: string[]
  submissionFormat: string
  submissionNotes: string
  candidatesPerWeek: string
  feedbackTurnaround: string
  screeningQuestions: string
}

interface JobIntakeStore {
  formData: JobIntakeFormData
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null

  // Actions
  setFormData: (data: Partial<JobIntakeFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void
  initializeFromAccount: (accountId: string, accountName: string) => void
}

const defaultFormData: JobIntakeFormData = {
  // Step 1
  accountId: '',
  accountName: '',
  hiringManagerId: '',
  intakeMethod: 'phone_video',
  title: '',
  positionsCount: 1,
  jobType: 'contract',
  priority: 'normal',
  targetStartDate: '',
  targetEndDate: '',

  // JOBS-01: Unified company/contact references
  clientCompanyId: null,
  endClientCompanyId: null,
  vendorCompanyId: null,
  hiringManagerContactId: null,
  hrContactId: null,
  externalJobId: '',
  priorityRank: 0,
  slaDays: 30,
  feeType: 'percentage',
  feePercentage: null,
  feeFlatAmount: null,

  // Step 2
  minExperience: '5',
  preferredExperience: '7',
  experienceLevel: 'senior',
  requiredSkills: [],
  preferredSkills: [],
  education: 'bachelors',
  certifications: [],  // Changed to array for multiple certifications
  industries: [],

  // Step 3
  roleSummary: '',
  responsibilities: '',
  roleOpenReason: 'growth',
  teamName: '',
  teamSize: '',
  reportsTo: '',
  directReports: '0',
  keyProjects: '',
  successMetrics: '',

  // Step 4
  workArrangement: 'remote',
  hybridDays: 3,
  locationRestrictions: ['us_based'],
  locationAddressLine1: '',
  locationAddressLine2: '',
  locationCity: '',
  locationState: '',
  locationPostalCode: '',
  locationCountry: 'US',
  workAuthorizations: ['us_citizen', 'green_card'],
  billRateMin: '',
  billRateMax: '',
  payRateMin: '',
  payRateMax: '',
  conversionSalaryMin: '',
  conversionSalaryMax: '',
  conversionFee: '20',
  benefits: ['health', '401k', 'pto'],
  weeklyHours: '40',
  overtimeExpected: 'rarely',
  onCallRequired: false,
  onCallSchedule: '',

  // Step 5
  interviewRounds: [
    {
      name: 'Recruiter Screen',
      format: 'phone',
      duration: 30,
      interviewer: 'InTime Recruiter',
      focus: 'Experience overview, culture, logistics',
    },
    {
      name: 'Technical Phone Screen',
      format: 'video',
      duration: 60,
      interviewer: 'Senior Engineer - TBD',
      focus: 'Technical depth, coding problem',
    },
  ],
  decisionDays: '3-5',
  submissionRequirements: ['resume'],
  submissionFormat: 'standard',
  submissionNotes: '',
  candidatesPerWeek: '3-5',
  feedbackTurnaround: '48',
  screeningQuestions: '',
}

export const useJobIntakeStore = create<JobIntakeStore>()(
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

      resetForm: () =>
        set({
          formData: defaultFormData,
          currentStep: 1,
          isDirty: false,
          lastSaved: null,
        }),

      initializeFromAccount: (accountId, accountName) =>
        set((state) => ({
          formData: {
            ...state.formData,
            accountId,
            accountName,
          },
        })),
    }),
    {
      name: 'job-intake-form',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
      }),
    }
  )
)

// Constants for form options
export const INTAKE_METHODS = [
  { value: 'phone_video', label: 'Phone/Video Call (Live intake)' },
  { value: 'email', label: 'Email (Client sent requirements)' },
  { value: 'client_portal', label: 'Client Portal (Self-service submission)' },
  { value: 'in_person', label: 'In-Person Meeting' },
]

export const JOB_TYPES = [
  { value: 'contract', label: 'Contract (W2)' },
  { value: 'contract_to_hire', label: 'Contract-to-Hire' },
  { value: 'permanent', label: 'Direct Hire (Permanent)' },
  { value: 'c2c', label: '1099 / C2C' },
]

export const PRIORITY_LEVELS = [
  { value: 'urgent', label: 'Urgent (Need ASAP, <2 weeks)', color: 'text-red-600' },
  { value: 'high', label: 'High (Within 30 days)', color: 'text-amber-600' },
  { value: 'normal', label: 'Normal (30-60 days)', color: 'text-blue-600' },
  { value: 'low', label: 'Low (60+ days, pipeline building)', color: 'text-charcoal-500' },
]

export const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'mid', label: 'Mid-Level (3-5 years)' },
  { value: 'senior', label: 'Senior (5-8 years)' },
  { value: 'staff', label: 'Staff/Principal (8+ years)' },
]

export const EDUCATION_LEVELS = [
  { value: 'none', label: 'No requirement' },
  { value: 'high_school', label: 'High School' },
  { value: 'associates', label: "Associate's" },
  { value: 'bachelors', label: "Bachelor's in CS or equivalent" },
  { value: 'masters', label: "Master's preferred" },
  { value: 'phd', label: 'PhD required' },
]

export const ROLE_OPEN_REASONS = [
  { value: 'growth', label: 'Team growth / Expansion' },
  { value: 'backfill', label: 'Backfill (someone left)' },
  { value: 'new_project', label: 'New project / Initiative' },
  { value: 'restructuring', label: 'Restructuring' },
]

export const WORK_ARRANGEMENTS = [
  { value: 'remote', label: 'Remote (100%)' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site (Full-time in office)' },
]

export const WORK_AUTHORIZATIONS = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'h1b_transfer', label: 'H1B (Transfer)' },
  { value: 'h1b_new', label: 'H1B (New sponsorship)' },
  { value: 'opt_cpt', label: 'OPT / CPT' },
  { value: 'tn_visa', label: 'TN Visa' },
]

export const INTERVIEW_FORMATS = [
  { value: 'phone', label: 'Phone' },
  { value: 'video', label: 'Video' },
  { value: 'onsite', label: 'On-site' },
]
