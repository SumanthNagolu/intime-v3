/**
 * UnifiedJobWorkspace Component
 *
 * A modular job workspace that uses the GenericEntityWorkspace composer
 * with Job-specific content components.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useJobRaw, useJobMetrics } from '@/hooks/queries/jobs';
import {
  useCreateActivity,
  useCompleteActivity,
} from '@/hooks/mutations/activities';

// Composers
import { GenericEntityWorkspace, buildJobTabs } from '../composers';

// Entity content
import {
  JobOverviewContent,
  JobPipelineContent,
  JobSubmissionsContent,
  JobSidebarContent,
} from '../entity/job';

// Shared tabs
import { ActivityTab } from '../tabs/ActivityTab';
import { DocumentsTab, type DocumentCategory } from '../tabs/DocumentsTab';
import { TasksTab } from '../tabs/TasksTab';

// Modals
import { AttachEntityModal } from '../modals/AttachEntityModal';

// =====================================================
// TYPES
// =====================================================

interface UnifiedJobWorkspaceProps {
  jobId: string;
}

// Document categories for jobs
const JOB_DOCUMENT_CATEGORIES: DocumentCategory[] = [
  { key: 'job_description', label: 'Job Description', color: 'bg-blue-100 text-blue-700' },
  { key: 'requirements', label: 'Requirements', color: 'bg-purple-100 text-purple-700' },
  { key: 'submission', label: 'Submission Docs', color: 'bg-amber-100 text-amber-700' },
  { key: 'candidate', label: 'Candidate Files', color: 'bg-green-100 text-green-700' },
  { key: 'offer', label: 'Offer Letters', color: 'bg-emerald-100 text-emerald-700' },
  { key: 'contract', label: 'Contracts', color: 'bg-indigo-100 text-indigo-700' },
  { key: 'other', label: 'Other', color: 'bg-stone-100 text-stone-600' },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export function UnifiedJobWorkspace({ jobId }: UnifiedJobWorkspaceProps) {
  const [showAttachCandidateModal, setShowAttachCandidateModal] = useState(false);

  // Fetch job details
  const { data: job, isLoading, error, refetch } = useJobRaw(jobId);

  // Fetch job metrics
  const { data: metrics } = useJobMetrics(jobId);

  // Fetch submissions for this job
  const { data: submissions = [], refetch: refetchSubmissions } = trpc.ats.submissions.list.useQuery({
    jobId: jobId,
    limit: 50,
  });

  // Fetch account if job has one
  const { data: account } = trpc.crm.accounts.getById.useQuery(
    { id: job?.accountId || '' },
    { enabled: !!job?.accountId }
  );

  // Fetch activities
  const { data: activities, isLoading: activitiesLoading, refetch: refetchActivities } = trpc.activities.list.useQuery(
    { entityType: 'job', entityId: jobId, includeCompleted: true, limit: 50, offset: 0 },
    { enabled: !!jobId }
  );

  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = trpc.activities.list.useQuery(
    { entityType: 'job', entityId: jobId, activityTypes: ['task', 'follow_up'], includeCompleted: true, limit: 100, offset: 0 },
    { enabled: !!jobId }
  );

  // Fetch documents
  const { data: documents, isLoading: documentsLoading, refetch: refetchDocuments } = trpc.files.list.useQuery(
    { entityType: 'job', entityId: jobId },
    { enabled: !!jobId }
  );

  // Candidate search for attach modal
  const [candidateSearch, setCandidateSearch] = useState('');
  const { data: searchResults = [], isLoading: isSearching } = trpc.ats.candidates.search.useQuery(
    { limit: 20 },
    { enabled: showAttachCandidateModal }
  );

  // Mutations
  const createActivity = useCreateActivity();
  const completeActivity = useCompleteActivity();
  const createSubmission = trpc.ats.submissions.create.useMutation({
    onSuccess: () => {
      refetchSubmissions();
      setShowAttachCandidateModal(false);
    },
  });

  // File mutations
  const getUploadUrl = trpc.files.getUploadUrl.useMutation();
  const recordUpload = trpc.files.recordUpload.useMutation();
  const deleteFile = trpc.files.delete.useMutation();

  // Transform submissions for pipeline
  // Note: candidate relation may or may not be included depending on the query
  const pipelineCandidates = useMemo(() => {
    return submissions.map((sub) => {
      const candidate = (sub as { candidate?: { firstName?: string; lastName?: string; candidateLocation?: string; candidateCurrentVisa?: string; candidateHourlyRate?: number; candidateSkills?: string[] } }).candidate;
      return {
        id: sub.candidateId,
        submissionId: sub.id,
        candidateId: sub.candidateId,
        fullName: candidate?.firstName && candidate?.lastName
          ? `${candidate.firstName} ${candidate.lastName}`
          : `Candidate #${sub.candidateId.slice(0, 8)}`,
        initials: candidate?.firstName && candidate?.lastName
          ? `${candidate.firstName[0]}${candidate.lastName[0]}`
          : undefined,
        location: candidate?.candidateLocation,
        visa: candidate?.candidateCurrentVisa,
        hourlyRate: candidate?.candidateHourlyRate,
        skills: candidate?.candidateSkills,
        status: sub.status,
        createdAt: sub.createdAt,
      };
    });
  }, [submissions]);

  // Transform submissions for list view
  const submissionsList = useMemo(() => {
    return submissions.map((sub) => {
      const candidate = (sub as { candidate?: { firstName?: string; lastName?: string; candidateLocation?: string; candidateCurrentVisa?: string; candidateHourlyRate?: number; candidateSkills?: string[] } }).candidate;
      return {
        id: sub.id,
        candidateId: sub.candidateId,
        candidateName: candidate?.firstName && candidate?.lastName
          ? `${candidate.firstName} ${candidate.lastName}`
          : `Candidate #${sub.candidateId.slice(0, 8)}`,
        candidateInitials: candidate?.firstName && candidate?.lastName
          ? `${candidate.firstName[0]}${candidate.lastName[0]}`
          : undefined,
        candidateLocation: candidate?.candidateLocation,
        candidateVisa: candidate?.candidateCurrentVisa,
        candidateHourlyRate: candidate?.candidateHourlyRate,
        candidateSkills: candidate?.candidateSkills,
        status: sub.status,
        submissionNotes: sub.submissionNotes,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      };
    });
  }, [submissions]);

  // Transform documents
  const documentsList = useMemo(() => {
    return (documents || []).map((doc) => ({
      id: doc.id,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      category: (doc.metadata as { category?: string })?.category || 'other',
      description: (doc.metadata as { description?: string })?.description,
      tags: (doc.metadata as { tags?: string[] })?.tags,
      uploadedAt: doc.uploadedAt,
      uploadedBy: doc.uploaderName,
    }));
  }, [documents]);

  // Transform tasks
  const tasksList = useMemo(() => {
    return (tasks || []).map((task) => ({
      id: task.id,
      title: task.subject || 'Untitled Task',
      status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
      priority: (task.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      assignee: (task as { assignedToName?: string }).assignedToName || task.assignedTo || undefined,
      createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
    }));
  }, [tasks]);

  // Tasks summary for sidebar
  const tasksSummary = useMemo(() => {
    const total = tasksList.length;
    const completed = tasksList.filter(t => t.status === 'completed').length;
    const overdue = tasksList.filter(t =>
      t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()
    ).length;
    return { total, completed, overdue };
  }, [tasksList]);

  // Handle document upload
  const handleUploadDocument = async (files: File[], metadata: { category: string; description: string; tags: string[] }) => {
    for (const file of files) {
      const { uploadUrl, filePath, bucket } = await getUploadUrl.mutateAsync({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        entityType: 'job',
        entityId: jobId,
      });

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });

      await recordUpload.mutateAsync({
        bucket,
        filePath,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        entityType: 'job',
        entityId: jobId,
        metadata,
      });
    }
    refetchDocuments();
  };

  // Handle document delete
  const handleDeleteDocument = async (documentId: string) => {
    await deleteFile.mutateAsync({ fileId: documentId });
    refetchDocuments();
  };

  // Handle task operations
  const handleCreateTask = async (task: { title: string; priority: string; dueDate?: Date }) => {
    if (!task.dueDate) {
      throw new Error('Due date is required');
    }
    await createActivity.mutateAsync({
      entityType: 'job',
      entityId: jobId,
      activityType: 'task',
      subject: task.title,
      priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
      dueDate: task.dueDate,
      status: 'open',
    });
    refetchTasks();
    refetchActivities();
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeActivity.mutateAsync({ id: taskId });
    refetchTasks();
    refetchActivities();
  };

  // Handle attach candidate
  const handleAttachCandidate = async (candidateId: string, notes?: string) => {
    await createSubmission.mutateAsync({
      candidateId,
      jobId,
      status: 'sourced',
      submissionNotes: notes,
    });
  };

  // Search results for attach modal
  const attachSearchResults = useMemo(() => {
    return searchResults.map((c) => ({
      id: c.id,
      title: c.fullName || `${c.firstName} ${c.lastName}`,
      subtitle: c.candidateLocation || undefined,
      status: c.candidateCurrentVisa || undefined,
      initials: c.firstName && c.lastName ? `${c.firstName[0]}${c.lastName[0]}` : undefined,
    }));
  }, [searchResults]);

  // Build tabs
  const tabs = buildJobTabs({
    overview: job ? (
      <JobOverviewContent
        job={{
          ...job,
          rateMin: job.rateMin ? parseFloat(job.rateMin) : null,
          rateMax: job.rateMax ? parseFloat(job.rateMax) : null,
        }}
        metrics={metrics ? {
          totalSubmissions: metrics.submissions?.reduce((sum, s) => sum + s.count, 0) ?? 0,
          activeSubmissions: metrics.submissions?.find(s => s.status !== 'rejected' && s.status !== 'withdrawn')?.count ?? 0,
          interviewsScheduled: metrics.interviews ?? 0,
          offersExtended: metrics.offers ?? 0,
          placed: 0,
          avgTimeToSubmit: 0,
        } : undefined}
        accountName={account?.name}
        onNavigateToAccount={() => {
          if (account?.id) {
            window.location.href = `/employee/recruiting/accounts/${account.id}`;
          }
        }}
      />
    ) : null,
    activity: (
      <ActivityTab
        entityType="job"
        entityId={jobId}
      />
    ),
    submissions: {
      content: (
        <JobSubmissionsContent
          submissions={submissionsList}
          onAddCandidate={() => setShowAttachCandidateModal(true)}
        />
      ),
      count: submissions.filter(s => s.status !== 'rejected' && s.status !== 'withdrawn').length,
    },
    documents: {
      content: (
        <DocumentsTab
          entityType="job"
          entityId={jobId}
          categories={JOB_DOCUMENT_CATEGORIES}
        />
      ),
      count: documents?.length,
    },
    tasks: {
      content: (
        <TasksTab
          entityType="job"
          entityId={jobId}
        />
      ),
      count: tasksList.filter(t => t.status !== 'completed').length,
    },
  });

  // Build sidebar
  const sidebar = job ? (
    <JobSidebarContent
      job={{
        ...job,
        rateMin: job.rateMin ? parseFloat(job.rateMin) : null,
        rateMax: job.rateMax ? parseFloat(job.rateMax) : null,
      }}
      accountName={account?.name}
      accountId={account?.id}
      tasksSummary={tasksSummary}
    />
  ) : null;

  // Build actions
  const actions = [
    {
      id: 'attach-candidate',
      label: 'Attach Candidate',
      icon: Plus,
      onClick: () => setShowAttachCandidateModal(true),
    },
  ];

  return (
    <>
      <GenericEntityWorkspace
        entityType="job"
        entityId={jobId}
        entityName={job?.title || 'Job'}
        isLoading={isLoading}
        error={error ? new Error(error.message) : undefined}
        backLink={{ href: '/employee/recruiting/jobs', label: 'Back to Jobs' }}
        sidebar={sidebar}
        tabs={tabs}
        defaultTab="activity"
        actions={actions}
      />

      {/* Attach Candidate Modal */}
      <AttachEntityModal
        isOpen={showAttachCandidateModal}
        onClose={() => setShowAttachCandidateModal(false)}
        sourceType="job"
        sourceId={jobId}
        targetType="talent"
        title="Attach Candidate"
        description="Link a candidate from the talent pool to this job"
        searchResults={attachSearchResults}
        isSearching={isSearching}
        onSearch={setCandidateSearch}
        onAttach={handleAttachCandidate}
        isAttaching={createSubmission.isPending}
        allowCreate
        createLabel="Create New Talent"
      />
    </>
  );
}

export default UnifiedJobWorkspace;
