import { create } from 'zustand'

// Types
export interface SkillEntry {
  name: string
  years: string
  proficiency: 'beginner' | 'proficient' | 'expert'
}

export interface InterviewRound {
  id: string
  name: string
  format: 'phone' | 'video' | 'onsite' | 'panel' | 'technical' | 'behavioral'
  duration: number
  interviewer: string
  focus: string
}

export interface CreateJobFormData {
  // Step 1: Basic Information
  accountId: string
  accountName: string
  title: string
  description: string
  positionsCount: number
  jobType: 'contract' | 'permanent' | 'contract_to_hire' | 'c2c' | 'temp' | 'sow'
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  targetStartDate: string
  targetEndDate: string
  targetFillDate: string
  intakeMethod: string
  externalJobId: string

  // Client/Company References (JOBS-01)
  clientCompanyId: string | null
  endClientCompanyId: string | null
  vendorCompanyId: string | null
  hiringManagerContactId: string | null
  hrContactId: string | null

  // Step 2: Requirements
  requiredSkills: SkillEntry[]
  preferredSkills: string[]
  minExperience: string
  maxExperience: string
  experienceLevel: 'junior' | 'mid' | 'senior' | 'staff' | 'principal' | 'director' | ''
  education: string
  certifications: string[]
  industries: string[]
  visaRequirements: string[]

  // Step 3: Role Details
  roleSummary: string
  responsibilities: string
  roleOpenReason: 'growth' | 'backfill' | 'new_project' | 'restructuring' | ''
  teamName: string
  teamSize: string
  reportsTo: string
  directReports: string
  keyProjects: string
  successMetrics: string

  // Step 4: Location & Work
  workArrangement: 'remote' | 'hybrid' | 'onsite'
  hybridDays: number
  location: string
  locationAddressLine1: string
  locationAddressLine2: string
  locationCity: string
  locationState: string
  locationPostalCode: string
  locationCountry: string
  locationRestrictions: string[]
  workAuthorizations: string[]
  isRemote: boolean

  // Step 5: Compensation
  rateType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual'
  currency: string
  billRateMin: string
  billRateMax: string
  payRateMin: string
  payRateMax: string
  conversionSalaryMin: string
  conversionSalaryMax: string
  conversionFee: string
  feeType: 'percentage' | 'flat' | 'hourly_spread'
  feePercentage: string
  feeFlatAmount: string
  benefits: string[]
  weeklyHours: string
  overtimeExpected: 'never' | 'rarely' | 'sometimes' | 'often' | ''
  onCallRequired: boolean
  onCallSchedule: string

  // Step 6: Interview Process
  interviewRounds: InterviewRound[]
  decisionDays: string
  submissionRequirements: string[]
  submissionFormat: string
  submissionNotes: string
  candidatesPerWeek: string
  feedbackTurnaround: string
  screeningQuestions: string
  clientInterviewProcess: string
  clientSubmissionInstructions: string

  // Step 7: Team Assignment
  ownerId: string
  recruiterIds: string[]
  priorityRank: 0 | 1 | 2 | 3 | 4
  slaDays: number
}

interface CreateJobStore {
  formData: CreateJobFormData
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null

  // Core actions
  setFormData: (data: Partial<CreateJobFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void
  initializeFromAccount: (accountId: string, accountName: string) => void

  // Skill helpers
  addSkill: (skill: SkillEntry) => void
  removeSkill: (index: number) => void
  updateSkill: (index: number, data: Partial<SkillEntry>) => void
  addPreferredSkill: (skill: string) => void
  removePreferredSkill: (skill: string) => void

  // Interview round helpers
  addInterviewRound: (round: InterviewRound) => void
  removeInterviewRound: (id: string) => void
  updateInterviewRound: (id: string, data: Partial<InterviewRound>) => void

  // Array helpers
  toggleArrayItem: (field: keyof CreateJobFormData, item: string) => void
  addRecruiter: (recruiterId: string) => void
  removeRecruiter: (recruiterId: string) => void
}

const defaultFormData: CreateJobFormData = {
  // Step 1: Basic Information
  accountId: '',
  accountName: '',
  title: '',
  description: '',
  positionsCount: 1,
  jobType: 'contract',
  priority: 'normal',
  urgency: 'medium',
  targetStartDate: '',
  targetEndDate: '',
  targetFillDate: '',
  intakeMethod: 'phone_video',
  externalJobId: '',

  // Client/Company References
  clientCompanyId: null,
  endClientCompanyId: null,
  vendorCompanyId: null,
  hiringManagerContactId: null,
  hrContactId: null,

  // Step 2: Requirements
  requiredSkills: [],
  preferredSkills: [],
  minExperience: '',
  maxExperience: '',
  experienceLevel: '',
  education: '',
  certifications: [],
  industries: [],
  visaRequirements: [],

  // Step 3: Role Details
  roleSummary: '',
  responsibilities: '',
  roleOpenReason: '',
  teamName: '',
  teamSize: '',
  reportsTo: '',
  directReports: '',
  keyProjects: '',
  successMetrics: '',

  // Step 4: Location & Work
  workArrangement: 'remote',
  hybridDays: 3,
  location: '',
  locationAddressLine1: '',
  locationAddressLine2: '',
  locationCity: '',
  locationState: '',
  locationPostalCode: '',
  locationCountry: 'US',
  locationRestrictions: [],
  workAuthorizations: [],
  isRemote: true,

  // Step 5: Compensation
  rateType: 'hourly',
  currency: 'USD',
  billRateMin: '',
  billRateMax: '',
  payRateMin: '',
  payRateMax: '',
  conversionSalaryMin: '',
  conversionSalaryMax: '',
  conversionFee: '',
  feeType: 'percentage',
  feePercentage: '',
  feeFlatAmount: '',
  benefits: [],
  weeklyHours: '40',
  overtimeExpected: '',
  onCallRequired: false,
  onCallSchedule: '',

  // Step 6: Interview Process
  interviewRounds: [],
  decisionDays: '',
  submissionRequirements: [],
  submissionFormat: 'standard',
  submissionNotes: '',
  candidatesPerWeek: '',
  feedbackTurnaround: '',
  screeningQuestions: '',
  clientInterviewProcess: '',
  clientSubmissionInstructions: '',

  // Step 7: Team Assignment
  ownerId: '',
  recruiterIds: [],
  priorityRank: 0,
  slaDays: 30,
}

// NO localStorage persistence - DB is the only source of truth
// This prevents stale data from old drafts bleeding into new ones
export const useCreateJobStore = create<CreateJobStore>()((set, get) => ({
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

  // Skill helpers
  addSkill: (skill) =>
    set((state) => ({
      formData: {
        ...state.formData,
        requiredSkills: [...state.formData.requiredSkills, skill],
      },
      isDirty: true,
      lastSaved: new Date(),
    })),

  removeSkill: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        requiredSkills: state.formData.requiredSkills.filter((_, i) => i !== index),
      },
      isDirty: true,
      lastSaved: new Date(),
    })),

  updateSkill: (index, data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        requiredSkills: state.formData.requiredSkills.map((skill, i) =>
          i === index ? { ...skill, ...data } : skill
        ),
      },
      isDirty: true,
      lastSaved: new Date(),
    })),

  addPreferredSkill: (skill) => {
    const trimmed = skill.trim()
    if (!trimmed) return
    const { formData } = get()
    if (formData.preferredSkills.includes(trimmed)) return
    set((state) => ({
      formData: {
        ...state.formData,
        preferredSkills: [...state.formData.preferredSkills, trimmed],
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  removePreferredSkill: (skill) =>
    set((state) => ({
      formData: {
        ...state.formData,
        preferredSkills: state.formData.preferredSkills.filter((s) => s !== skill),
      },
      isDirty: true,
      lastSaved: new Date(),
    })),

  // Interview round helpers
  addInterviewRound: (round) =>
    set((state) => ({
      formData: {
        ...state.formData,
        interviewRounds: [...state.formData.interviewRounds, round],
      },
      isDirty: true,
      lastSaved: new Date(),
    })),

  removeInterviewRound: (id) =>
    set((state) => ({
      formData: {
        ...state.formData,
        interviewRounds: state.formData.interviewRounds.filter((r) => r.id !== id),
      },
      isDirty: true,
      lastSaved: new Date(),
    })),

  updateInterviewRound: (id, data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        interviewRounds: state.formData.interviewRounds.map((round) =>
          round.id === id ? { ...round, ...data } : round
        ),
      },
      isDirty: true,
      lastSaved: new Date(),
    })),

  // Generic array toggle helper
  toggleArrayItem: (field, item) => {
    const { formData } = get()
    const arr = formData[field] as string[]
    const newArr = arr.includes(item)
      ? arr.filter((i) => i !== item)
      : [...arr, item]

    set((state) => ({
      formData: { ...state.formData, [field]: newArr },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  addRecruiter: (recruiterId) => {
    const { formData } = get()
    if (formData.recruiterIds.includes(recruiterId)) return
    set((state) => ({
      formData: {
        ...state.formData,
        recruiterIds: [...state.formData.recruiterIds, recruiterId],
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  removeRecruiter: (recruiterId) =>
    set((state) => ({
      formData: {
        ...state.formData,
        recruiterIds: state.formData.recruiterIds.filter((id) => id !== recruiterId),
      },
      isDirty: true,
      lastSaved: new Date(),
    })),
}))

// Constants for form options
export const INTAKE_METHODS = [
  { value: 'phone_video', label: 'Phone/Video Call (Live intake)' },
  { value: 'email', label: 'Email (Client sent requirements)' },
  { value: 'client_portal', label: 'Client Portal (Self-service submission)' },
  { value: 'in_person', label: 'In-Person Meeting' },
] as const

export const JOB_TYPES = [
  { value: 'contract', label: 'Contract (W2)', icon: '📋' },
  { value: 'contract_to_hire', label: 'Contract-to-Hire', icon: '🔄' },
  { value: 'permanent', label: 'Direct Hire (Permanent)', icon: '🏠' },
  { value: 'c2c', label: '1099 / C2C', icon: '🤝' },
  { value: 'temp', label: 'Temporary', icon: '⏱️' },
  { value: 'sow', label: 'Statement of Work (SOW)', icon: '📄' },
] as const

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', description: '60+ days, pipeline building', color: 'text-charcoal-500', bgColor: 'bg-charcoal-100' },
  { value: 'normal', label: 'Normal', description: '30-60 days', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { value: 'high', label: 'High', description: 'Within 30 days', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { value: 'urgent', label: 'Urgent', description: 'ASAP, <2 weeks', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { value: 'critical', label: 'Critical', description: 'Immediate need', color: 'text-red-600', bgColor: 'bg-red-100' },
] as const

export const PRIORITY_RANKS = [
  { value: 0, label: 'Unset', color: 'text-charcoal-400' },
  { value: 1, label: 'Critical (P1)', color: 'text-red-600' },
  { value: 2, label: 'High (P2)', color: 'text-amber-600' },
  { value: 3, label: 'Medium (P3)', color: 'text-blue-600' },
  { value: 4, label: 'Low (P4)', color: 'text-charcoal-500' },
] as const

export const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'mid', label: 'Mid-Level (3-5 years)' },
  { value: 'senior', label: 'Senior (5-8 years)' },
  { value: 'staff', label: 'Staff (8-12 years)' },
  { value: 'principal', label: 'Principal (12+ years)' },
  { value: 'director', label: 'Director / Lead' },
] as const

export const EDUCATION_LEVELS = [
  { value: 'none', label: 'No requirement' },
  { value: 'high_school', label: 'High School' },
  { value: 'associates', label: "Associate's Degree" },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'bachelors_cs', label: "Bachelor's in CS or equivalent" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'masters_preferred', label: "Master's preferred" },
  { value: 'phd', label: 'PhD required' },
] as const

export const ROLE_OPEN_REASONS = [
  { value: 'growth', label: 'Team growth / Expansion', icon: '📈' },
  { value: 'backfill', label: 'Backfill (someone left)', icon: '🔄' },
  { value: 'new_project', label: 'New project / Initiative', icon: '🚀' },
  { value: 'restructuring', label: 'Restructuring', icon: '🏗️' },
] as const

export const WORK_ARRANGEMENTS = [
  { value: 'remote', label: 'Remote (100%)', icon: '🏠', description: 'Work from anywhere' },
  { value: 'hybrid', label: 'Hybrid', icon: '🔀', description: 'Mix of remote and on-site' },
  { value: 'onsite', label: 'On-site', icon: '🏢', description: 'Full-time in office' },
] as const

export const WORK_AUTHORIZATIONS = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'h1b_transfer', label: 'H1B (Transfer)' },
  { value: 'h1b_new', label: 'H1B (New sponsorship)' },
  { value: 'opt', label: 'OPT' },
  { value: 'cpt', label: 'CPT' },
  { value: 'tn_visa', label: 'TN Visa' },
  { value: 'l1_visa', label: 'L1 Visa' },
  { value: 'e3_visa', label: 'E3 Visa' },
  { value: 'any', label: 'Any Work Authorization' },
] as const

export const RATE_TYPES = [
  { value: 'hourly', label: 'Hourly', suffix: '/hr' },
  { value: 'daily', label: 'Daily', suffix: '/day' },
  { value: 'weekly', label: 'Weekly', suffix: '/week' },
  { value: 'monthly', label: 'Monthly', suffix: '/mo' },
  { value: 'annual', label: 'Annual', suffix: '/yr' },
] as const

export const FEE_TYPES = [
  { value: 'percentage', label: 'Percentage of Salary/Rate', description: 'Standard fee structure' },
  { value: 'flat', label: 'Flat Fee', description: 'Fixed amount per placement' },
  { value: 'hourly_spread', label: 'Hourly Spread', description: 'Difference between bill and pay rate' },
] as const

export const BENEFITS = [
  { value: 'health', label: 'Health Insurance' },
  { value: 'dental', label: 'Dental Insurance' },
  { value: 'vision', label: 'Vision Insurance' },
  { value: '401k', label: '401(k)' },
  { value: '401k_match', label: '401(k) with Match' },
  { value: 'pto', label: 'Paid Time Off' },
  { value: 'unlimited_pto', label: 'Unlimited PTO' },
  { value: 'sick_leave', label: 'Sick Leave' },
  { value: 'parental', label: 'Parental Leave' },
  { value: 'remote_stipend', label: 'Remote Work Stipend' },
  { value: 'education', label: 'Education Reimbursement' },
  { value: 'stock', label: 'Stock Options / Equity' },
  { value: 'bonus', label: 'Performance Bonus' },
  { value: 'relocation', label: 'Relocation Assistance' },
] as const

export const OVERTIME_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: 'rarely', label: 'Rarely (a few times per year)' },
  { value: 'sometimes', label: 'Sometimes (1-2 times per month)' },
  { value: 'often', label: 'Often (weekly)' },
] as const

export const INTERVIEW_FORMATS = [
  { value: 'phone', label: 'Phone' },
  { value: 'video', label: 'Video Call' },
  { value: 'onsite', label: 'On-site' },
  { value: 'panel', label: 'Panel Interview' },
  { value: 'technical', label: 'Technical Assessment' },
  { value: 'behavioral', label: 'Behavioral' },
] as const

export const SUBMISSION_REQUIREMENTS = [
  { value: 'resume', label: 'Resume' },
  { value: 'cover_letter', label: 'Cover Letter' },
  { value: 'portfolio', label: 'Portfolio / Work Samples' },
  { value: 'references', label: 'References' },
  { value: 'linkedin', label: 'LinkedIn Profile' },
  { value: 'github', label: 'GitHub / Code Samples' },
  { value: 'certifications', label: 'Certifications' },
  { value: 'salary_expectations', label: 'Salary Expectations' },
  { value: 'availability', label: 'Start Date / Availability' },
  { value: 'visa_status', label: 'Work Authorization Status' },
] as const

export const SUBMISSION_FORMATS = [
  { value: 'standard', label: 'Standard Resume Format' },
  { value: 'client_template', label: 'Client-Specific Template' },
  { value: 'blind', label: 'Blind Resume (No identifying info)' },
  { value: 'detailed', label: 'Detailed with Writeup' },
] as const

export const INDUSTRIES = [
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'fintech', label: 'FinTech', icon: '💳' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'finance', label: 'Finance & Banking', icon: '🏦' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'retail', label: 'Retail', icon: '🛒' },
  { value: 'ecommerce', label: 'E-Commerce', icon: '🛍️' },
  { value: 'professional_services', label: 'Professional Services', icon: '💼' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'government', label: 'Government', icon: '🏛️' },
  { value: 'energy', label: 'Energy & Utilities', icon: '⚡' },
  { value: 'telecommunications', label: 'Telecommunications', icon: '📡' },
  { value: 'media', label: 'Media & Entertainment', icon: '🎬' },
  { value: 'automotive', label: 'Automotive', icon: '🚗' },
  { value: 'aerospace', label: 'Aerospace & Defense', icon: '✈️' },
  { value: 'pharma', label: 'Pharmaceuticals', icon: '💊' },
  { value: 'logistics', label: 'Logistics & Supply Chain', icon: '📦' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏘️' },
  { value: 'other', label: 'Other', icon: '📋' },
] as const

// Proficiency levels for skills
export const SKILL_PROFICIENCIES = [
  { value: 'beginner', label: 'Beginner', description: '< 1 year' },
  { value: 'proficient', label: 'Proficient', description: '1-3 years' },
  { value: 'expert', label: 'Expert', description: '3+ years' },
] as const

// Common certifications by category
export const COMMON_CERTIFICATIONS = {
  cloud: ['AWS Solutions Architect', 'AWS Developer', 'Azure Administrator', 'GCP Professional', 'Kubernetes (CKA/CKAD)'],
  security: ['CISSP', 'CISM', 'Security+', 'CEH', 'OSCP'],
  agile: ['PMP', 'CSM', 'PSM', 'SAFe Agilist'],
  data: ['Google Data Engineer', 'Databricks', 'Snowflake'],
  development: ['Java Certified', 'Microsoft Certified', 'Salesforce Certified'],
} as const
