'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { EntityWizard } from '@/components/pcf/wizard/EntityWizard'
import { jobIntakeWizardConfig } from '@/configs/entities/wizards/job-intake.config'
import { useJobIntakeStore, JobIntakeFormData } from '@/stores/job-intake-store'

export default function JobIntakePage() {
  const router = useRouter()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Use the existing store
  const store = useJobIntakeStore()

  // Mutation
  const createJobMutation = trpc.ats.jobs.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Job requisition created!',
        description: `${store.formData.title} @ ${store.formData.accountName || 'Account'}`,
      })
      utils.ats.jobs.list.invalidate()
      utils.crm.accounts.getById.invalidate({ id: store.formData.accountId })
      store.resetForm()
      // API returns { jobId, title, status, ... }
      const jobData = data as unknown as { jobId: string }
      router.push(`/employee/recruiting/jobs/${jobData.jobId}`)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create job requisition.',
        variant: 'error',
      })
    },
  })

  // Create config with submit handler
  const config = {
    ...jobIntakeWizardConfig,
    onSubmit: async (formData: JobIntakeFormData) => {
      // Normalize certifications - handle legacy string format from localStorage
      const rawCerts = formData.certifications as string[] | string | undefined
      const normalizedCertifications = Array.isArray(rawCerts)
        ? rawCerts
        : typeof rawCerts === 'string' && rawCerts
          ? rawCerts.split(',').map((c: string) => c.trim()).filter(Boolean)
          : []

      return createJobMutation.mutateAsync({
        title: formData.title.trim(),
        accountId: formData.accountId,
        jobType: formData.jobType as 'contract' | 'permanent' | 'contract_to_hire' | 'temp' | 'sow',
        positionsCount: formData.positionsCount,
        priority: formData.priority as 'low' | 'normal' | 'high' | 'urgent' | 'critical',
        targetStartDate: formData.targetStartDate || undefined,
        targetEndDate: formData.targetEndDate || undefined,
        // Location (structured for centralized addresses)
        isRemote: formData.workArrangement === 'remote',
        isHybrid: formData.workArrangement === 'hybrid',
        hybridDays: formData.workArrangement === 'hybrid' ? formData.hybridDays : undefined,
        // Build location string from structured fields for backward compatibility
        location: formData.locationCity && formData.locationState
          ? `${formData.locationCity}, ${formData.locationState}`
          : undefined,
        // Structured location for address creation
        locationCity: formData.locationCity || undefined,
        locationState: formData.locationState || undefined,
        locationCountry: formData.locationCountry || undefined,
        // Requirements
        minExperience: formData.minExperience ? parseInt(formData.minExperience) : undefined,
        maxExperience: formData.preferredExperience ? parseInt(formData.preferredExperience) : undefined,
        requiredSkills: formData.requiredSkills.map((s) => s.name),
        niceToHaveSkills: formData.preferredSkills,
        description: `${formData.roleSummary}\n\nKey Responsibilities:\n${formData.responsibilities}`,
        // Compensation
        rateMin: formData.billRateMin ? parseFloat(formData.billRateMin) : undefined,
        rateMax: formData.billRateMax ? parseFloat(formData.billRateMax) : undefined,
        rateType: 'hourly',
        // Extended intake data
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
        router.push('/employee/recruiting/jobs')
      }}
    />
  )
}
