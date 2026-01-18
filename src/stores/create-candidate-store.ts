'use client'

import { create } from 'zustand'
import type { PhoneInputValue } from '@/components/ui/phone-input'

// Work History Entry (Step 4)
export interface WorkHistoryEntry {
  id: string // Unique ID for React keys and editing
  companyName: string
  jobTitle: string
  employmentType?: 'full_time' | 'contract' | 'part_time' | 'internship'
  startDate: string // YYYY-MM format
  endDate?: string // YYYY-MM format, undefined if current
  isCurrent: boolean
  locationCity?: string
  locationState?: string
  isRemote?: boolean
  description?: string
  achievements: string[]
  isFromResume?: boolean // Flag for AI-parsed entries
}

// Education Entry (Step 5)
export interface EducationEntry {
  id: string
  institutionName: string
  degreeType?: 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'other'
  degreeName?: string
  fieldOfStudy?: string
  startDate?: string // YYYY-MM format
  endDate?: string // YYYY-MM format
  isCurrent?: boolean
  gpa?: number
  honors?: string
  isFromResume?: boolean
}

// Compliance Document Entry (Step 9)
export interface ComplianceDocumentEntry {
  id: string
  type: 'rtr' | 'nda' | 'references' | 'background_auth' | 'void_check' | 'i9' | 'w4' | 'other'
  status: 'not_uploaded' | 'pending' | 'submitted' | 'approved' | 'rejected'
  fileName?: string
  fileUrl?: string
  fileSize?: number
  uploadedAt?: string
  notes?: string
  expiresAt?: string
}

// Comprehensive candidate form data type - based on Bullhorn/Ceipal best practices
export interface CreateCandidateFormData {
  // Step 1: Source
  sourceType: 'manual' | 'resume' | 'linkedin'
  resumeStoragePath?: string
  resumeParsed?: boolean
  resumeFileName?: string // For display in review
  resumeFileSize?: number // For display in review (bytes)
  linkedinUrl?: string

  // Step 2: Contact Information
  firstName: string
  lastName: string
  email: string
  phone: PhoneInputValue
  linkedinProfile?: string
  // Location
  location: string
  locationCity?: string
  locationState?: string
  locationCountry?: string

  // Step 3: Professional Profile
  professionalHeadline?: string
  professionalSummary?: string
  experienceYears: number
  // Employment preferences
  employmentTypes: ('full_time' | 'contract' | 'contract_to_hire' | 'part_time')[]
  workModes: ('on_site' | 'remote' | 'hybrid')[]

  // Step 4: Work History (NEW)
  workHistory: WorkHistoryEntry[]

  // Step 5: Education (NEW)
  education: EducationEntry[]

  // Step 6: Skills & Certifications
  skills: SkillEntry[]
  primarySkills: string[] // Top 5 skills for quick reference
  certifications: CertificationEntry[]

  // Step 7: Work Authorization & Availability
  visaStatus: 'us_citizen' | 'green_card' | 'h1b' | 'l1' | 'tn' | 'opt' | 'cpt' | 'ead' | 'other'
  visaExpiryDate?: string // ISO date string
  requiresSponsorship: boolean
  currentSponsor?: string
  isTransferable?: boolean
  availability: 'immediate' | '2_weeks' | '30_days' | '60_days' | 'not_available'
  availableFrom?: string // ISO date string for specific date
  noticePeriodDays?: number
  willingToRelocate: boolean
  relocationPreferences?: string // Notes on relocation
  isRemoteOk: boolean

  // Step 8: Compensation
  rateType: 'hourly' | 'annual' | 'per_diem'
  minimumRate?: number
  desiredRate?: number
  currency: 'USD' | 'CAD' | 'EUR' | 'GBP' | 'INR'
  isNegotiable: boolean
  compensationNotes?: string

  // Step 9: Documents & Tracking
  leadSource: 'linkedin' | 'indeed' | 'dice' | 'monster' | 'referral' | 'direct' | 'agency' | 'job_board' | 'website' | 'event' | 'other'
  sourceDetails?: string
  referredBy?: string // Name or ID of referrer
  campaignId?: string // If sourced from a campaign
  complianceDocuments: ComplianceDocumentEntry[]
  isOnHotlist: boolean
  hotlistNotes?: string
  tags: string[]
  internalNotes?: string
}

// Skill entry with proficiency tracking
export interface SkillEntry {
  name: string
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience?: number
  isPrimary: boolean
  isCertified: boolean
  lastUsed?: string // Year or "Current"
}

// Certification entry
export interface CertificationEntry {
  name: string
  acronym?: string
  issuingOrganization?: string
  credentialId?: string
  credentialUrl?: string
  issueDate?: string
  expiryDate?: string
  isLifetime: boolean
}

interface CreateCandidateStore {
  formData: CreateCandidateFormData
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null
  // Resume file stored separately (not serializable to wizard_state)
  resumeFile: File | null
  resumeParsedData: import('@/lib/services/resume-parser').ParsedResumeData | null
  // Compliance document files stored separately (File objects, not serializable)
  complianceDocumentFiles: Map<string, File>

  // Actions
  setFormData: (data: Partial<CreateCandidateFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void

  // Work History management (NEW)
  addWorkHistory: (entry: Omit<WorkHistoryEntry, 'id'>) => void
  updateWorkHistory: (id: string, entry: Partial<WorkHistoryEntry>) => void
  removeWorkHistory: (id: string) => void
  reorderWorkHistory: (fromIndex: number, toIndex: number) => void

  // Education management (NEW)
  addEducation: (entry: Omit<EducationEntry, 'id'>) => void
  updateEducation: (id: string, entry: Partial<EducationEntry>) => void
  removeEducation: (id: string) => void

  // Skills management
  addSkill: (skill: SkillEntry) => void
  updateSkill: (index: number, skill: Partial<SkillEntry>) => void
  removeSkill: (index: number) => void
  togglePrimarySkill: (skillName: string) => void

  // Certifications management
  addCertification: (cert: CertificationEntry) => void
  updateCertification: (index: number, cert: Partial<CertificationEntry>) => void
  removeCertification: (index: number) => void

  // Compliance Documents management (NEW)
  addComplianceDocument: (doc: Omit<ComplianceDocumentEntry, 'id'>, file?: File) => void
  updateComplianceDocument: (id: string, doc: Partial<ComplianceDocumentEntry>, file?: File) => void
  removeComplianceDocument: (id: string) => void
  setComplianceDocumentFile: (docId: string, file: File | null) => void

  // Tags management
  addTag: (tag: string) => void
  removeTag: (tag: string) => void

  // Resume handling
  setResumeFile: (file: File | null, parsedData: import('@/lib/services/resume-parser').ParsedResumeData | null) => void

  // Resume pre-population helper (NEW)
  populateFromResume: (data: import('@/lib/services/resume-parser').ParsedResumeData) => void
}

const defaultFormData: CreateCandidateFormData = {
  // Step 1: Source
  sourceType: 'manual',
  resumeParsed: false,

  // Step 2: Contact Information
  firstName: '',
  lastName: '',
  email: '',
  phone: { countryCode: 'US', number: '' },
  linkedinProfile: '',
  location: '',
  locationCity: '',
  locationState: '',
  locationCountry: 'US',

  // Step 3: Professional Profile
  professionalHeadline: '',
  professionalSummary: '',
  experienceYears: 0,
  employmentTypes: ['full_time', 'contract'],
  workModes: ['on_site', 'remote'],

  // Step 4: Work History
  workHistory: [],

  // Step 5: Education
  education: [],

  // Step 6: Skills & Certifications
  skills: [],
  primarySkills: [],
  certifications: [],

  // Step 7: Work Authorization & Availability
  visaStatus: 'us_citizen',
  requiresSponsorship: false,
  availability: '2_weeks',
  willingToRelocate: false,
  isRemoteOk: false,

  // Step 8: Compensation
  rateType: 'hourly',
  currency: 'USD',
  isNegotiable: true,

  // Step 9: Documents & Tracking
  leadSource: 'linkedin',
  sourceDetails: '',
  complianceDocuments: [],
  isOnHotlist: false,
  hotlistNotes: '',
  tags: [],
}

// Helper to generate unique IDs
const generateId = () => crypto.randomUUID()

// NO localStorage persistence - DB is the only source of truth
// This prevents stale data from old drafts bleeding into new ones
export const useCreateCandidateStore = create<CreateCandidateStore>()((set, get) => ({
  formData: defaultFormData,
  currentStep: 1,
  isDirty: false,
  lastSaved: null,
  resumeFile: null,
  resumeParsedData: null,
  complianceDocumentFiles: new Map<string, File>(),

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
      resumeFile: null,
      resumeParsedData: null,
      complianceDocumentFiles: new Map<string, File>(),
    }),

  // Skills management
  addSkill: (skill) => {
    const { formData } = get()
    const normalizedName = skill.name.trim()
    if (!normalizedName) return

    // Check for duplicates
    if (formData.skills.some(s => s.name.toLowerCase() === normalizedName.toLowerCase())) return

    set((state) => ({
      formData: {
        ...state.formData,
        skills: [...state.formData.skills, { ...skill, name: normalizedName }],
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  updateSkill: (index, skill) => {
    set((state) => {
      const skills = [...state.formData.skills]
      if (index >= 0 && index < skills.length) {
        skills[index] = { ...skills[index], ...skill }
      }
      return {
        formData: { ...state.formData, skills },
        isDirty: true,
        lastSaved: new Date(),
      }
    })
  },

  removeSkill: (index) => {
    set((state) => {
      const skills = state.formData.skills.filter((_, i) => i !== index)
      const removedSkill = state.formData.skills[index]
      const primarySkills = removedSkill
        ? state.formData.primarySkills.filter(s => s !== removedSkill.name)
        : state.formData.primarySkills
      return {
        formData: { ...state.formData, skills, primarySkills },
        isDirty: true,
        lastSaved: new Date(),
      }
    })
  },

  togglePrimarySkill: (skillName) => {
    set((state) => {
      const { primarySkills } = state.formData
      const isPrimary = primarySkills.includes(skillName)

      let newPrimarySkills: string[]
      if (isPrimary) {
        newPrimarySkills = primarySkills.filter(s => s !== skillName)
      } else if (primarySkills.length < 5) {
        newPrimarySkills = [...primarySkills, skillName]
      } else {
        // Max 5 primary skills
        return state
      }

      return {
        formData: { ...state.formData, primarySkills: newPrimarySkills },
        isDirty: true,
        lastSaved: new Date(),
      }
    })
  },

  // Certifications management
  addCertification: (cert) => {
    if (!cert.name.trim()) return
    set((state) => ({
      formData: {
        ...state.formData,
        certifications: [...state.formData.certifications, cert],
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  updateCertification: (index, cert) => {
    set((state) => {
      const certifications = [...state.formData.certifications]
      if (index >= 0 && index < certifications.length) {
        certifications[index] = { ...certifications[index], ...cert }
      }
      return {
        formData: { ...state.formData, certifications },
        isDirty: true,
        lastSaved: new Date(),
      }
    })
  },

  removeCertification: (index) => {
    set((state) => ({
      formData: {
        ...state.formData,
        certifications: state.formData.certifications.filter((_, i) => i !== index),
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  // Tags management
  addTag: (tag) => {
    const trimmedTag = tag.trim()
    if (!trimmedTag) return
    const { formData } = get()
    if (formData.tags.includes(trimmedTag)) return

    set((state) => ({
      formData: {
        ...state.formData,
        tags: [...state.formData.tags, trimmedTag],
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  removeTag: (tag) => {
    set((state) => ({
      formData: {
        ...state.formData,
        tags: state.formData.tags.filter((t) => t !== tag),
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  setResumeFile: (file, parsedData) =>
    set((state) => ({
      resumeFile: file,
      resumeParsedData: parsedData,
      // Also store filename/size in formData for review display
      formData: {
        ...state.formData,
        resumeFileName: file?.name,
        resumeFileSize: file?.size,
      },
    })),

  // Work History management
  addWorkHistory: (entry) => {
    set((state) => ({
      formData: {
        ...state.formData,
        workHistory: [...state.formData.workHistory, { ...entry, id: generateId() }],
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  updateWorkHistory: (id, entry) => {
    set((state) => ({
      formData: {
        ...state.formData,
        workHistory: state.formData.workHistory.map((w) =>
          w.id === id ? { ...w, ...entry } : w
        ),
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  removeWorkHistory: (id) => {
    set((state) => ({
      formData: {
        ...state.formData,
        workHistory: state.formData.workHistory.filter((w) => w.id !== id),
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  reorderWorkHistory: (fromIndex, toIndex) => {
    set((state) => {
      const workHistory = [...state.formData.workHistory]
      const [removed] = workHistory.splice(fromIndex, 1)
      workHistory.splice(toIndex, 0, removed)
      return {
        formData: { ...state.formData, workHistory },
        isDirty: true,
        lastSaved: new Date(),
      }
    })
  },

  // Education management
  addEducation: (entry) => {
    set((state) => ({
      formData: {
        ...state.formData,
        education: [...state.formData.education, { ...entry, id: generateId() }],
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  updateEducation: (id, entry) => {
    set((state) => ({
      formData: {
        ...state.formData,
        education: state.formData.education.map((e) =>
          e.id === id ? { ...e, ...entry } : e
        ),
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  removeEducation: (id) => {
    set((state) => ({
      formData: {
        ...state.formData,
        education: state.formData.education.filter((e) => e.id !== id),
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  // Compliance Documents management
  addComplianceDocument: (doc, file) => {
    const newId = generateId()
    set((state) => {
      const newFiles = new Map(state.complianceDocumentFiles)
      if (file) {
        newFiles.set(newId, file)
      }
      return {
        formData: {
          ...state.formData,
          complianceDocuments: [...state.formData.complianceDocuments, { ...doc, id: newId }],
        },
        complianceDocumentFiles: newFiles,
        isDirty: true,
        lastSaved: new Date(),
      }
    })
  },

  updateComplianceDocument: (id, doc, file) => {
    set((state) => {
      const newFiles = new Map(state.complianceDocumentFiles)
      if (file) {
        newFiles.set(id, file)
      }
      return {
        formData: {
          ...state.formData,
          complianceDocuments: state.formData.complianceDocuments.map((d) =>
            d.id === id ? { ...d, ...doc } : d
          ),
        },
        complianceDocumentFiles: newFiles,
        isDirty: true,
        lastSaved: new Date(),
      }
    })
  },

  removeComplianceDocument: (id) => {
    set((state) => {
      const newFiles = new Map(state.complianceDocumentFiles)
      newFiles.delete(id)
      return {
        formData: {
          ...state.formData,
          complianceDocuments: state.formData.complianceDocuments.filter((d) => d.id !== id),
        },
        complianceDocumentFiles: newFiles,
        isDirty: true,
        lastSaved: new Date(),
      }
    })
  },

  setComplianceDocumentFile: (docId, file) => {
    set((state) => {
      const newFiles = new Map(state.complianceDocumentFiles)
      if (file) {
        newFiles.set(docId, file)
      } else {
        newFiles.delete(docId)
      }
      return { complianceDocumentFiles: newFiles }
    })
  },

  // Resume pre-population helper
  populateFromResume: (data) => {
    const { setFormData, addWorkHistory, addEducation, addCertification, addSkill } = get()

    // Basic info
    setFormData({
      resumeParsed: true,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone ? { countryCode: 'US', number: data.phone } : { countryCode: 'US', number: '' },
      linkedinProfile: data.linkedinProfile || '',
      professionalHeadline: data.professionalHeadline || '',
      professionalSummary: data.professionalSummary || '',
      experienceYears: data.experienceYears || 0,
      location: data.location || '',
      locationCity: data.locationCity || '',
      locationState: data.locationState || '',
      locationCountry: data.locationCountry || 'US',
      visaStatus: data.visaStatus || 'us_citizen',
    })

    // Work History from resume
    if (data.workHistory && Array.isArray(data.workHistory)) {
      data.workHistory.forEach((job) => {
        addWorkHistory({
          companyName: job.companyName,
          jobTitle: job.jobTitle,
          startDate: job.startDate,
          endDate: job.endDate,
          isCurrent: job.isCurrent,
          description: job.description,
          achievements: job.achievements || [],
          isFromResume: true,
        })
      })
    }

    // Education from resume
    if (data.education && Array.isArray(data.education)) {
      data.education.forEach((edu) => {
        addEducation({
          institutionName: edu.institutionName,
          degreeType: edu.degreeType,
          degreeName: edu.degreeName,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa,
          honors: edu.honors,
          isFromResume: true,
        })
      })
    }

    // Certifications from resume
    if (data.certifications && Array.isArray(data.certifications)) {
      data.certifications.forEach((cert) => {
        addCertification({
          name: cert.name,
          issuingOrganization: cert.issuingOrganization,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          credentialId: cert.credentialId,
          isLifetime: !cert.expiryDate,
        })
      })
    }

    // Skills from resume
    if (data.skills && Array.isArray(data.skills)) {
      data.skills.forEach((skillName, index) => {
        addSkill({
          name: skillName,
          proficiency: 'intermediate',
          isPrimary: index < 5, // First 5 are primary
          isCertified: false,
        })
      })
    }
  },
}))

// Constants for dropdowns
export const VISA_STATUSES = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card / Permanent Resident' },
  { value: 'h1b', label: 'H1B Visa' },
  { value: 'l1', label: 'L1 Visa' },
  { value: 'tn', label: 'TN Visa' },
  { value: 'opt', label: 'OPT (F1)' },
  { value: 'cpt', label: 'CPT (F1)' },
  { value: 'ead', label: 'EAD Card' },
  { value: 'other', label: 'Other' },
] as const

export const AVAILABILITY_OPTIONS = [
  { value: 'immediate', label: 'Immediately Available' },
  { value: '2_weeks', label: '2 Weeks Notice' },
  { value: '30_days', label: '30 Days Notice' },
  { value: '60_days', label: '60 Days Notice' },
  { value: 'not_available', label: 'Not Currently Available' },
] as const

export const LEAD_SOURCES = [
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'indeed', label: 'Indeed', icon: '🔍' },
  { value: 'dice', label: 'Dice', icon: '🎲' },
  { value: 'monster', label: 'Monster', icon: '👾' },
  { value: 'referral', label: 'Employee Referral', icon: '👥' },
  { value: 'direct', label: 'Direct Application', icon: '📩' },
  { value: 'agency', label: 'Agency/Partner', icon: '🤝' },
  { value: 'job_board', label: 'Other Job Board', icon: '📋' },
  { value: 'website', label: 'Company Website', icon: '🌐' },
  { value: 'event', label: 'Career Fair/Event', icon: '🎪' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const

export const SOURCE_TYPES = [
  { value: 'manual', label: 'Manual Entry', description: 'Enter candidate details manually', icon: '✏️' },
  { value: 'resume', label: 'Upload Resume', description: 'Parse from resume with AI extraction', icon: '📄' },
  { value: 'linkedin', label: 'LinkedIn Import', description: 'Import from LinkedIn profile (coming soon)', icon: '💼', disabled: true },
] as const

export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-Time (W2)' },
  { value: 'contract', label: 'Contract (W2/1099)' },
  { value: 'contract_to_hire', label: 'Contract-to-Hire' },
  { value: 'part_time', label: 'Part-Time' },
] as const

export const WORK_MODES = [
  { value: 'on_site', label: 'On-Site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
] as const

export const RATE_TYPES = [
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'annual', label: 'Annual Salary' },
  { value: 'per_diem', label: 'Per Diem' },
] as const

export const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: '0-1 years' },
  { value: 'intermediate', label: 'Intermediate', description: '1-3 years' },
  { value: 'advanced', label: 'Advanced', description: '3-5 years' },
  { value: 'expert', label: 'Expert', description: '5+ years' },
] as const

export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
] as const

export const DEGREE_TYPES = [
  { value: 'high_school', label: 'High School / GED' },
  { value: 'associate', label: "Associate's Degree" },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'master', label: "Master's Degree" },
  { value: 'phd', label: 'Doctorate / PhD' },
  { value: 'other', label: 'Other Credential' },
] as const

export const WORK_HISTORY_EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'part_time', label: 'Part-Time' },
  { value: 'internship', label: 'Internship' },
] as const

export const COMPLIANCE_DOCUMENT_TYPES = [
  { value: 'rtr', label: 'Right to Represent (RTR)', description: 'Candidate authorization for representation' },
  { value: 'nda', label: 'Non-Disclosure Agreement', description: 'Confidentiality agreement' },
  { value: 'references', label: 'Professional References', description: '2-3 professional references' },
  { value: 'background_auth', label: 'Background Check Authorization', description: 'Authorization for background check' },
  { value: 'void_check', label: 'Voided Check / Direct Deposit', description: 'For payroll setup' },
  { value: 'i9', label: 'I-9 Employment Eligibility', description: 'Legal employment verification' },
  { value: 'w4', label: 'W-4 Tax Withholding', description: 'Federal tax withholding form' },
  { value: 'other', label: 'Other Document', description: 'Additional compliance document' },
] as const

export const COMPLIANCE_DOCUMENT_STATUSES = [
  { value: 'not_uploaded', label: 'Not Uploaded', color: 'gray' },
  { value: 'pending', label: 'Pending Review', color: 'amber' },
  { value: 'submitted', label: 'Submitted', color: 'blue' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
] as const
