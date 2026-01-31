/**
 * V4 Mutation Hooks
 *
 * Hooks for CRUD operations that connect V4 pages to existing tRPC routers.
 */

'use client'

import { trpc } from '@/lib/trpc/client'
import { useCallback } from 'react'
import { toast } from 'sonner'

// ============================================
// Jobs Mutations
// ============================================

export function useV4JobMutations() {
  const utils = trpc.useUtils()

  const createJob = trpc.ats.jobs.create.useMutation({
    onSuccess: () => {
      utils.ats.jobs.list.invalidate()
      toast.success('Job created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create job: ${error.message}`)
    },
  })

  const updateJob = trpc.ats.jobs.update.useMutation({
    onSuccess: () => {
      utils.ats.jobs.list.invalidate()
      utils.ats.jobs.getById.invalidate()
      toast.success('Job updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update job: ${error.message}`)
    },
  })

  const updateJobStatus = trpc.ats.jobs.updateStatus.useMutation({
    onSuccess: () => {
      utils.ats.jobs.list.invalidate()
      utils.ats.jobs.getById.invalidate()
      toast.success('Job status updated')
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`)
    },
  })

  return {
    createJob: createJob.mutateAsync,
    updateJob: updateJob.mutateAsync,
    updateJobStatus: updateJobStatus.mutateAsync,
    isCreating: createJob.isPending,
    isUpdating: updateJob.isPending,
  }
}

// ============================================
// Candidates Mutations
// ============================================

export function useV4CandidateMutations() {
  const utils = trpc.useUtils()

  const createCandidate = trpc.ats.candidates.create.useMutation({
    onSuccess: () => {
      utils.ats.candidates.list.invalidate()
      toast.success('Candidate created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create candidate: ${error.message}`)
    },
  })

  const updateCandidate = trpc.ats.candidates.update.useMutation({
    onSuccess: () => {
      utils.ats.candidates.list.invalidate()
      utils.ats.candidates.getById.invalidate()
      toast.success('Candidate updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update candidate: ${error.message}`)
    },
  })

  return {
    createCandidate: createCandidate.mutateAsync,
    updateCandidate: updateCandidate.mutateAsync,
    isCreating: createCandidate.isPending,
    isUpdating: updateCandidate.isPending,
  }
}

// ============================================
// Submissions Mutations
// ============================================

export function useV4SubmissionMutations() {
  const utils = trpc.useUtils()

  const createSubmission = trpc.ats.submissions.create.useMutation({
    onSuccess: () => {
      utils.ats.submissions.list.invalidate()
      utils.ats.jobs.list.invalidate()
      utils.ats.candidates.list.invalidate()
      toast.success('Candidate submitted to job successfully')
    },
    onError: (error) => {
      toast.error(`Failed to submit candidate: ${error.message}`)
    },
  })

  const updateSubmissionStatus = trpc.ats.submissions.updateStatus.useMutation({
    onSuccess: () => {
      utils.ats.submissions.list.invalidate()
      toast.success('Submission status updated')
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`)
    },
  })

  return {
    createSubmission: createSubmission.mutateAsync,
    updateSubmissionStatus: updateSubmissionStatus.mutateAsync,
    isCreating: createSubmission.isPending,
  }
}

// ============================================
// Accounts Mutations
// ============================================

export function useV4AccountMutations() {
  const utils = trpc.useUtils()

  const createAccount = trpc.crm.accounts.create.useMutation({
    onSuccess: () => {
      utils.crm.accounts.list.invalidate()
      toast.success('Account created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create account: ${error.message}`)
    },
  })

  const updateAccount = trpc.crm.accounts.update.useMutation({
    onSuccess: () => {
      utils.crm.accounts.list.invalidate()
      utils.crm.accounts.getById.invalidate()
      toast.success('Account updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update account: ${error.message}`)
    },
  })

  return {
    createAccount: createAccount.mutateAsync,
    updateAccount: updateAccount.mutateAsync,
    isCreating: createAccount.isPending,
    isUpdating: updateAccount.isPending,
  }
}

// ============================================
// Leads Mutations
// ============================================

export function useV4LeadMutations() {
  const utils = trpc.useUtils()

  const createLead = trpc.crm.leads.create.useMutation({
    onSuccess: () => {
      utils.crm.leads.list.invalidate()
      toast.success('Lead created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create lead: ${error.message}`)
    },
  })

  const updateLead = trpc.crm.leads.update.useMutation({
    onSuccess: () => {
      utils.crm.leads.list.invalidate()
      toast.success('Lead updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update lead: ${error.message}`)
    },
  })

  const convertLead = trpc.crm.leads.convertToDeal.useMutation({
    onSuccess: () => {
      utils.crm.leads.list.invalidate()
      utils.crm.deals.list.invalidate()
      toast.success('Lead converted to deal successfully')
    },
    onError: (error) => {
      toast.error(`Failed to convert lead: ${error.message}`)
    },
  })

  return {
    createLead: createLead.mutateAsync,
    updateLead: updateLead.mutateAsync,
    convertLead: convertLead.mutateAsync,
    isCreating: createLead.isPending,
    isUpdating: updateLead.isPending,
    isConverting: convertLead.isPending,
  }
}

// ============================================
// Activities Mutations
// ============================================

export function useV4ActivityMutations() {
  const utils = trpc.useUtils()

  const completeActivity = trpc.activities.complete.useMutation({
    onSuccess: () => {
      utils.activities.list.invalidate()
      toast.success('Activity completed')
    },
    onError: (error) => {
      toast.error(`Failed to complete activity: ${error.message}`)
    },
  })

  const createActivity = trpc.activities.create.useMutation({
    onSuccess: () => {
      utils.activities.list.invalidate()
      toast.success('Activity created')
    },
    onError: (error) => {
      toast.error(`Failed to create activity: ${error.message}`)
    },
  })

  return {
    completeActivity: completeActivity.mutateAsync,
    createActivity: createActivity.mutateAsync,
    isCompleting: completeActivity.isPending,
    isCreating: createActivity.isPending,
  }
}

// ============================================
// Notes Mutations
// ============================================

export function useV4NoteMutations() {
  const utils = trpc.useUtils()

  const createNoteMutation = trpc.notes.create.useMutation({
    onSuccess: () => {
      utils.notes.listByEntity.invalidate()
      toast.success('Note added')
    },
    onError: (error) => {
      toast.error(`Failed to add note: ${error.message}`)
    },
  })

  const createNote = useCallback(
    async (input: { entityType: string; entityId: string; content: string; isPrivate?: boolean }) => {
      return createNoteMutation.mutateAsync({
        entityType: input.entityType,
        entityId: input.entityId,
        content: input.content,
        visibility: input.isPrivate ? 'private' : 'team',
      })
    },
    [createNoteMutation]
  )

  return {
    createNote,
    isCreating: createNoteMutation.isPending,
  }
}

// ============================================
// Combined Quick Actions Hook
// ============================================

export function useV4QuickActions() {
  const { createSubmission } = useV4SubmissionMutations()
  const { createNote } = useV4NoteMutations()
  const { createActivity } = useV4ActivityMutations()

  const submitCandidateToJob = useCallback(
    async (candidateId: string, jobId: string, notes?: string) => {
      return createSubmission({
        jobId,
        candidateId,
        notes,
      })
    },
    [createSubmission]
  )

  const addNote = useCallback(
    async (entityType: string, entityId: string, content: string) => {
      return createNote({
        entityType,
        entityId,
        content,
        isPrivate: false,
      })
    },
    [createNote]
  )

  const scheduleFollowUp = useCallback(
    async (entityType: string, entityId: string, dueDate: string, subject: string) => {
      return createActivity({
        entityType,
        entityId,
        activityType: 'follow_up',
        subject,
        dueDate,
        priority: 'normal',
      })
    },
    [createActivity]
  )

  return {
    submitCandidateToJob,
    addNote,
    scheduleFollowUp,
  }
}
