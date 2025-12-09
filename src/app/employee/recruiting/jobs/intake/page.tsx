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
      const jobData = data as unknown as { id: string }
      router.push(`/employee/recruiting/jobs/${jobData.id}`)
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
      return createJobMutation.mutateAsync({
        title: formData.title.trim(),
        accountId: formData.accountId,
        jobType: formData.jobType as 'contract' | 'permanent' | 'contract_to_hire' | 'temp' | 'sow',
        positionsCount: formData.positionsCount,
        priority: formData.priority as 'low' | 'normal' | 'high' | 'urgent' | 'critical',
        targetStartDate: formData.targetStartDate || undefined,
        // Location
        isRemote: formData.workArrangement === 'remote',
        isHybrid: formData.workArrangement === 'hybrid',
        hybridDays: formData.workArrangement === 'hybrid' ? formData.hybridDays : undefined,
        location: formData.officeLocation || undefined,
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
          experienceLevel: formData.experienceLevel,
          requiredSkillsDetailed: formData.requiredSkills,
          preferredSkills: formData.preferredSkills,
          education: formData.education,
          certifications: formData.certifications || undefined,
          industries: formData.industries,
          roleOpenReason: formData.roleOpenReason,
          teamName: formData.teamName || undefined,
          teamSize: formData.teamSize ? parseInt(formData.teamSize) : undefined,
          reportsTo: formData.reportsTo || undefined,
          directReports: formData.directReports ? parseInt(formData.directReports) : undefined,
          keyProjects: formData.keyProjects || undefined,
          successMetrics: formData.successMetrics || undefined,
          workArrangement: formData.workArrangement,
          hybridDays: formData.workArrangement === 'hybrid' ? formData.hybridDays : undefined,
          locationRestrictions: formData.locationRestrictions,
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
