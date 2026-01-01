'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { EntityWizard } from '@/components/pcf/wizard/EntityWizard'
import { jobIntakeWizardConfig } from '@/configs/entities/wizards/job-intake.config'
import { useJobIntakeStore, JobIntakeFormData, SkillEntry, InterviewRound } from '@/stores/job-intake-store'
import { useEntityData } from '@/components/layouts/EntityContextProvider'
import { Loader2 } from 'lucide-react'

// Type for the job data from getFullJob query
interface JobData {
  id: string
  title: string
  status: string
  company_id?: string
  company?: { id: string; name: string }
  location?: string
  location_address_line1?: string
  location_address_line2?: string
  location_city?: string
  location_state?: string
  location_postal_code?: string
  location_country?: string
  job_type?: string
  is_remote?: boolean
  is_hybrid?: boolean
  hybrid_days?: number
  positions_count?: number
  priority?: string
  target_start_date?: string
  target_end_date?: string
  target_fill_date?: string
  description?: string
  required_skills?: string[]
  nice_to_have_skills?: string[]
  min_experience_years?: number
  max_experience_years?: number
  rate_min?: number
  rate_max?: number
  rate_type?: string
  // Extended intake data
  intake_data?: {
    intakeMethod?: string
    hiringManagerId?: string
    targetStartDate?: string
    targetEndDate?: string
    experienceLevel?: string
    requiredSkillsDetailed?: SkillEntry[]
    preferredSkills?: string[]
    education?: string
    certifications?: string[]
    industries?: string[]
    roleOpenReason?: string
    roleSummary?: string
    responsibilities?: string
    teamName?: string
    teamSize?: number
    reportsTo?: string
    directReports?: number
    keyProjects?: string
    successMetrics?: string
    workArrangement?: string
    hybridDays?: number
    locationRestrictions?: string[]
    locationAddressLine1?: string
    locationAddressLine2?: string
    locationCity?: string
    locationState?: string
    locationPostalCode?: string
    locationCountry?: string
    workAuthorizations?: string[]
    payRateMin?: number
    payRateMax?: number
    conversionSalaryMin?: number
    conversionSalaryMax?: number
    conversionFee?: number
    benefits?: string[]
    weeklyHours?: number
    overtimeExpected?: string
    onCallRequired?: boolean
    onCallSchedule?: string
    interviewRounds?: InterviewRound[]
    decisionDays?: string
    submissionRequirements?: string[]
    submissionFormat?: string
    submissionNotes?: string
    candidatesPerWeek?: string
    feedbackTurnaround?: number
    screeningQuestions?: string
  }
  // JOBS-01: Unified company/contact references
  client_company_id?: string
  end_client_company_id?: string
  vendor_company_id?: string
  hiring_manager_contact_id?: string
  hr_contact_id?: string
  external_job_id?: string
  priority_rank?: number
  sla_days?: number
  fee_type?: string
  fee_percentage?: number
  fee_flat_amount?: number
}

// Map job data to form data structure
function mapJobToFormData(job: JobData): Partial<JobIntakeFormData> {
  const intakeData = job.intake_data || {}
  
  // Parse description to extract role summary and responsibilities
  let roleSummary = intakeData.roleSummary || ''
  let responsibilities = intakeData.responsibilities || ''
  
  if (!roleSummary && !responsibilities && job.description) {
    // Try to split description if it was created with the standard format
    const descParts = job.description.split('\n\nKey Responsibilities:\n')
    if (descParts.length === 2) {
      roleSummary = descParts[0]
      responsibilities = descParts[1]
    } else {
      roleSummary = job.description
    }
  }

  // Build required skills from detailed or simple array
  const requiredSkills: SkillEntry[] = intakeData.requiredSkillsDetailed || 
    (job.required_skills || []).map(name => ({
      name,
      years: '',
      proficiency: 'proficient' as const,
    }))

  // Determine work arrangement
  let workArrangement = intakeData.workArrangement || 'remote'
  if (!intakeData.workArrangement) {
    if (job.is_remote) workArrangement = 'remote'
    else if (job.is_hybrid) workArrangement = 'hybrid'
    else workArrangement = 'onsite'
  }

  return {
    // Step 1: Basic Information
    accountId: job.company_id || '',
    accountName: job.company?.name || '',
    // hiringManagerId comes from intake_data or falls back to the database column
    hiringManagerId: intakeData.hiringManagerId || job.hiring_manager_contact_id || '',
    intakeMethod: intakeData.intakeMethod || 'email',
    title: job.title || '',
    positionsCount: job.positions_count || 1,
    jobType: job.job_type || 'contract',
    priority: job.priority || 'normal',
    targetStartDate: job.target_start_date 
      ? job.target_start_date.split('T')[0] 
      : (intakeData.targetStartDate ? intakeData.targetStartDate.split('T')[0] : ''),
    targetEndDate: job.target_end_date 
      ? job.target_end_date.split('T')[0] 
      : (intakeData.targetEndDate ? intakeData.targetEndDate.split('T')[0] : ''),

    // JOBS-01: Unified company/contact references
    clientCompanyId: job.client_company_id || null,
    endClientCompanyId: job.end_client_company_id || null,
    vendorCompanyId: job.vendor_company_id || null,
    hiringManagerContactId: job.hiring_manager_contact_id || null,
    hrContactId: job.hr_contact_id || null,
    externalJobId: job.external_job_id || '',
    priorityRank: job.priority_rank || 0,
    slaDays: job.sla_days || 30,
    feeType: (job.fee_type as 'percentage' | 'flat' | 'hourly_spread') || 'percentage',
    feePercentage: job.fee_percentage || null,
    feeFlatAmount: job.fee_flat_amount || null,

    // Step 2: Technical Requirements
    minExperience: job.min_experience_years?.toString() || intakeData.requiredSkillsDetailed?.[0]?.years || '5',
    preferredExperience: job.max_experience_years?.toString() || '7',
    experienceLevel: intakeData.experienceLevel || 'senior',
    requiredSkills,
    preferredSkills: intakeData.preferredSkills || job.nice_to_have_skills || [],
    education: intakeData.education || 'bachelors',
    certifications: intakeData.certifications || [],
    industries: intakeData.industries || [],

    // Step 3: Role Details
    roleSummary,
    responsibilities,
    roleOpenReason: intakeData.roleOpenReason || 'growth',
    teamName: intakeData.teamName || '',
    // teamSize/directReports are stored as strings like "4-6", "1-2" to match dropdown values
    // Handle both string (new format) and number (legacy format) values
    teamSize: typeof intakeData.teamSize === 'string' ? intakeData.teamSize 
      : typeof intakeData.teamSize === 'number' ? '' : '',  // Legacy numbers don't map to dropdown, so reset
    reportsTo: intakeData.reportsTo || '',
    directReports: typeof intakeData.directReports === 'string' ? intakeData.directReports 
      : typeof intakeData.directReports === 'number' ? '0' : '0',  // Legacy numbers don't map to dropdown
    keyProjects: intakeData.keyProjects || '',
    successMetrics: intakeData.successMetrics || '',

    // Step 4: Logistics & Compensation
    workArrangement,
    hybridDays: intakeData.hybridDays || job.hybrid_days || 3,
    locationRestrictions: intakeData.locationRestrictions || ['us_based'],
    locationAddressLine1: intakeData.locationAddressLine1 || job.location_address_line1 || '',
    locationAddressLine2: intakeData.locationAddressLine2 || job.location_address_line2 || '',
    locationCity: intakeData.locationCity || job.location_city || '',
    locationState: intakeData.locationState || job.location_state || '',
    locationPostalCode: intakeData.locationPostalCode || job.location_postal_code || '',
    locationCountry: intakeData.locationCountry || job.location_country || 'US',
    workAuthorizations: intakeData.workAuthorizations || ['us_citizen', 'green_card'],
    billRateMin: job.rate_min?.toString() || '',
    billRateMax: job.rate_max?.toString() || '',
    payRateMin: intakeData.payRateMin?.toString() || '',
    payRateMax: intakeData.payRateMax?.toString() || '',
    conversionSalaryMin: intakeData.conversionSalaryMin?.toString() || '',
    conversionSalaryMax: intakeData.conversionSalaryMax?.toString() || '',
    conversionFee: intakeData.conversionFee?.toString() || '20',
    benefits: intakeData.benefits || ['health', '401k', 'pto'],
    weeklyHours: intakeData.weeklyHours?.toString() || '40',
    overtimeExpected: intakeData.overtimeExpected || 'rarely',
    onCallRequired: intakeData.onCallRequired || false,
    onCallSchedule: intakeData.onCallSchedule || '',

    // Step 5: Interview Process
    interviewRounds: intakeData.interviewRounds || [
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
    decisionDays: intakeData.decisionDays || '3-5',
    submissionRequirements: intakeData.submissionRequirements || ['resume'],
    submissionFormat: intakeData.submissionFormat || 'standard',
    submissionNotes: intakeData.submissionNotes || '',
    candidatesPerWeek: intakeData.candidatesPerWeek || '3-5',
    feedbackTurnaround: intakeData.feedbackTurnaround?.toString() || '48',
    screeningQuestions: intakeData.screeningQuestions || '',
  }
}

export default function JobEditPage() {
  const params = useParams()
  const jobId = params.id as string
  const router = useRouter()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Get job data from parent layout context
  const entityData = useEntityData<JobData>()
  const job = entityData?.data

  // Use the job intake store
  const store = useJobIntakeStore()
  
  // Track if this specific job has been initialized
  // Use ref to prevent re-initialization during step navigation
  const initializedJobRef = useRef<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize form with job data on mount - only once per job
  useEffect(() => {
    if (job && initializedJobRef.current !== jobId) {
      // Reset store first to clear any stale data from localStorage
      store.resetForm()
      // Then populate with job data
      const formData = mapJobToFormData(job)
      store.setFormData(formData)
      initializedJobRef.current = jobId
      setIsInitialized(true)
    }
  }, [job, jobId, store])

  // Update job mutation
  const updateJobMutation = trpc.ats.jobs.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Job updated successfully',
        description: `${store.formData.title} has been updated`,
      })
      utils.ats.jobs.list.invalidate()
      utils.ats.jobs.getFullJob.invalidate({ id: jobId })
      // Reset both store and initialization ref so fresh data loads on next visit
      store.resetForm()
      initializedJobRef.current = null
      setIsInitialized(false)
      router.push(`/employee/recruiting/jobs/${jobId}`)
    },
    onError: (error) => {
      toast({
        title: 'Error updating job',
        description: error.message || 'Failed to update job.',
        variant: 'error',
      })
    },
  })

  // Create config with update handler
  const config = useMemo(() => ({
    ...jobIntakeWizardConfig,
    title: 'Edit Job Requisition',
    description: 'Update the job requisition details',
    submitLabel: 'Save Changes',
    saveDraftLabel: undefined, // Hide draft button in edit mode
    onSubmit: async (formData: JobIntakeFormData) => {
      // Normalize certifications - handle legacy string format from localStorage
      const rawCerts = formData.certifications as string[] | string | undefined
      const normalizedCertifications = Array.isArray(rawCerts)
        ? rawCerts
        : typeof rawCerts === 'string' && rawCerts
          ? rawCerts.split(',').map((c: string) => c.trim()).filter(Boolean)
          : []

      return updateJobMutation.mutateAsync({
        jobId,
        title: formData.title.trim(),
        jobType: formData.jobType as 'contract' | 'permanent' | 'contract_to_hire' | 'temp' | 'sow',
        // Build location string from city/state (location_city, location_state, location_country columns don't exist on jobs table)
        location: formData.locationCity && formData.locationState
          ? `${formData.locationCity}, ${formData.locationState}`
          : undefined,
        isRemote: formData.workArrangement === 'remote',
        // is_hybrid column doesn't exist - hybrid status is inferred from hybrid_days > 0
        hybridDays: formData.workArrangement === 'hybrid' ? formData.hybridDays : null,
        requiredSkills: formData.requiredSkills.map((s) => s.name),
        niceToHaveSkills: formData.preferredSkills,
        minExperienceYears: formData.minExperience ? parseInt(formData.minExperience) : null,
        maxExperienceYears: formData.preferredExperience ? parseInt(formData.preferredExperience) : null,
        description: `${formData.roleSummary}\n\nKey Responsibilities:\n${formData.responsibilities}`,
        rateMin: formData.billRateMin ? parseFloat(formData.billRateMin) : undefined,
        rateMax: formData.billRateMax ? parseFloat(formData.billRateMax) : undefined,
        rateType: 'hourly',
        positionsCount: formData.positionsCount,
        priority: formData.priority as 'low' | 'normal' | 'high' | 'urgent' | 'critical',
        targetStartDate: formData.targetStartDate || null,
        targetEndDate: formData.targetEndDate || null,
        // Client/Contact references - hiringManagerId from wizard maps to hiring_manager_contact_id
        hiringManagerContactId: formData.hiringManagerId || formData.hiringManagerContactId || null,
        hrContactId: formData.hrContactId || null,
        clientCompanyId: formData.clientCompanyId || null,
        endClientCompanyId: formData.endClientCompanyId || null,
        vendorCompanyId: formData.vendorCompanyId || null,
        externalJobId: formData.externalJobId || null,
        // Fee structure
        feeType: formData.feeType || null,
        feePercentage: formData.feePercentage || null,
        feeFlatAmount: formData.feeFlatAmount || null,
        // Priority and SLA
        priorityRank: formData.priorityRank || null,
        slaDays: formData.slaDays || null,
        // Note: education and certifications are stored in intake_data JSONB, not as separate columns
        // Extended intake data for full preservation
        intakeData: {
          intakeMethod: formData.intakeMethod,
          hiringManagerId: formData.hiringManagerId || undefined,
          targetStartDate: formData.targetStartDate || undefined,
          targetEndDate: formData.targetEndDate || undefined,
          experienceLevel: formData.experienceLevel,
          requiredSkillsDetailed: formData.requiredSkills,
          preferredSkills: formData.preferredSkills,
          education: formData.education,
          certifications: normalizedCertifications.length > 0 ? normalizedCertifications : undefined,
          industries: formData.industries,
          roleOpenReason: formData.roleOpenReason,
          roleSummary: formData.roleSummary || undefined,
          responsibilities: formData.responsibilities || undefined,
          teamName: formData.teamName || undefined,
          teamSize: formData.teamSize || undefined,  // Store as string to preserve dropdown values like "4-6"
          reportsTo: formData.reportsTo || undefined,
          directReports: formData.directReports || undefined,  // Store as string to preserve dropdown values like "1-2"
          keyProjects: formData.keyProjects || undefined,
          successMetrics: formData.successMetrics || undefined,
          workArrangement: formData.workArrangement,
          hybridDays: formData.workArrangement === 'hybrid' ? formData.hybridDays : undefined,
          locationRestrictions: formData.locationRestrictions,
          // Store full address in intake_data for job location
          locationAddressLine1: formData.locationAddressLine1 || undefined,
          locationAddressLine2: formData.locationAddressLine2 || undefined,
          locationCity: formData.locationCity || undefined,
          locationState: formData.locationState || undefined,
          locationPostalCode: formData.locationPostalCode || undefined,
          locationCountry: formData.locationCountry || undefined,
          workAuthorizations: formData.workAuthorizations,
          payRateMin: formData.payRateMin ? parseFloat(formData.payRateMin) : undefined,
          payRateMax: formData.payRateMax ? parseFloat(formData.payRateMax) : undefined,
          conversionSalaryMin: formData.conversionSalaryMin ? parseFloat(formData.conversionSalaryMin) : undefined,
          conversionSalaryMax: formData.conversionSalaryMax ? parseFloat(formData.conversionSalaryMax) : undefined,
          conversionFee: formData.conversionFee ? parseFloat(formData.conversionFee) : undefined,
          benefits: formData.benefits,
          weeklyHours: formData.weeklyHours ? parseInt(formData.weeklyHours) : undefined,
          overtimeExpected: formData.overtimeExpected,
          onCallRequired: formData.onCallRequired,
          onCallSchedule: formData.onCallRequired ? formData.onCallSchedule : undefined,
          interviewRounds: formData.interviewRounds,
          decisionDays: formData.decisionDays,
          submissionRequirements: formData.submissionRequirements,
          submissionFormat: formData.submissionFormat,
          submissionNotes: formData.submissionNotes || undefined,
          candidatesPerWeek: formData.candidatesPerWeek,
          feedbackTurnaround: formData.feedbackTurnaround ? parseInt(formData.feedbackTurnaround) : undefined,
          screeningQuestions: formData.screeningQuestions || undefined,
        },
      })
    },
    onSuccess: () => {
      // Already handled in mutation onSuccess
    },
  }), [jobId, updateJobMutation, store.formData.title])

  // Show loading while initializing
  if (!job || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-hublot-600" />
          <p className="text-charcoal-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  return (
    <EntityWizard<JobIntakeFormData>
      config={config}
      store={{
        formData: store.formData,
        setFormData: store.setFormData,
        resetForm: store.resetForm,
        isDirty: store.isDirty,
        lastSaved: store.lastSaved,
      }}
      onCancel={() => {
        store.resetForm()
        router.push(`/employee/recruiting/jobs/${jobId}`)
      }}
    />
  )
}

