/**
 * UnifiedSubmissionWorkspace Component
 *
 * A modular submission workspace that uses the GenericEntityWorkspace composer
 * with Submission-specific content components.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, MessageSquare, Plus } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import {
  useCreateActivity,
  useCompleteActivity,
} from '@/hooks/mutations/activities';

// Composers
import { GenericEntityWorkspace, buildSubmissionTabs } from '../composers';

// Entity content
import {
  SubmissionOverviewContent,
  SubmissionWorkflowBar,
  SubmissionSidebarContent,
  SubmissionInterviewsContent,
} from '../entity/submission';

import { getDefaultPrimaryAction } from '../entity/submission/SubmissionWorkflowBar';

// Shared tabs
import { ActivityTab } from '../tabs/ActivityTab';
import { DocumentsTab, type DocumentCategory } from '../tabs/DocumentsTab';
import { TasksTab } from '../tabs/TasksTab';

// Modals
import { WorkflowTransitionModal, type WorkflowTransition } from '../modals/WorkflowTransitionModal';

// =====================================================
// TYPES
// =====================================================

interface UnifiedSubmissionWorkspaceProps {
  submissionId: string;
}

// Document categories for submissions
const SUBMISSION_DOCUMENT_CATEGORIES: DocumentCategory[] = [
  { key: 'resume', label: 'Resume', color: 'bg-blue-100 text-blue-700' },
  { key: 'cover_letter', label: 'Cover Letter', color: 'bg-purple-100 text-purple-700' },
  { key: 'submission_form', label: 'Submission Form', color: 'bg-amber-100 text-amber-700' },
  { key: 'interview_notes', label: 'Interview Notes', color: 'bg-green-100 text-green-700' },
  { key: 'offer_letter', label: 'Offer Letter', color: 'bg-emerald-100 text-emerald-700' },
  { key: 'contract', label: 'Contract', color: 'bg-indigo-100 text-indigo-700' },
  { key: 'other', label: 'Other', color: 'bg-stone-100 text-stone-600' },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export function UnifiedSubmissionWorkspace({ submissionId }: UnifiedSubmissionWorkspaceProps) {
  // Modal states
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [currentTransition, setCurrentTransition] = useState<WorkflowTransition | null>(null);
  const [showScheduleInterviewModal, setShowScheduleInterviewModal] = useState(false);

  // Fetch submission details
  const { data: submission, isLoading, error, refetch } = trpc.ats.submissions.getById.useQuery(
    { id: submissionId },
    { enabled: !!submissionId }
  );

  // Fetch interviews
  const { data: interviews = [], refetch: refetchInterviews } = trpc.ats.interviews.list.useQuery(
    { submissionId },
    { enabled: !!submissionId }
  );

  // Fetch activities
  const { data: activities, isLoading: activitiesLoading, refetch: refetchActivities } = trpc.activities.list.useQuery(
    { entityType: 'submission', entityId: submissionId, includeCompleted: true, limit: 50, offset: 0 },
    { enabled: !!submissionId }
  );

  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = trpc.activities.list.useQuery(
    { entityType: 'submission', entityId: submissionId, activityTypes: ['task', 'follow_up'], includeCompleted: true, limit: 100, offset: 0 },
    { enabled: !!submissionId }
  );

  // Fetch documents
  const { data: documents, isLoading: documentsLoading, refetch: refetchDocuments } = trpc.files.list.useQuery(
    { entityType: 'submission', entityId: submissionId },
    { enabled: !!submissionId }
  );

  // Mutations
  const createActivity = useCreateActivity();
  const completeActivity = useCompleteActivity();
  const updateSubmission = trpc.ats.submissions.update.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); },
  });
  const submitToVendor = trpc.ats.submissions.submitToVendor.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); setShowTransitionModal(false); },
  });
  const recordVendorDecision = trpc.ats.submissions.recordVendorDecision.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); setShowTransitionModal(false); },
  });
  const submitToClient = trpc.ats.submissions.submitToClient.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); setShowTransitionModal(false); },
  });
  const recordClientDecision = trpc.ats.submissions.recordClientDecision.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); setShowTransitionModal(false); },
  });
  const moveToOffer = trpc.ats.submissions.moveToOffer.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); },
  });
  const markPlaced = trpc.ats.submissions.markPlaced.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); },
  });
  const withdraw = trpc.ats.submissions.withdraw.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); },
  });

  // File mutations
  const getUploadUrl = trpc.files.getUploadUrl.useMutation();
  const recordUpload = trpc.files.recordUpload.useMutation();
  const deleteFile = trpc.files.delete.useMutation();

  // Transform submission data
  const submissionData = useMemo(() => {
    if (!submission) return null;
    return {
      id: submission.id,
      status: submission.status,
      candidate: {
        id: submission.candidateId,
        firstName: submission.candidate?.firstName,
        lastName: submission.candidate?.lastName,
        fullName: submission.candidate?.firstName && submission.candidate?.lastName
          ? `${submission.candidate.firstName} ${submission.candidate.lastName}`
          : 'Unknown Candidate',
        email: submission.candidate?.email || '',
        phone: submission.candidate?.phone,
        candidateLocation: submission.candidate?.candidateLocation,
        candidateCurrentVisa: submission.candidate?.candidateCurrentVisa,
        candidateHourlyRate: submission.candidate?.candidateHourlyRate
          ? parseFloat(submission.candidate.candidateHourlyRate as unknown as string)
          : null,
        candidateSkills: submission.candidate?.candidateSkills,
      },
      job: {
        id: submission.jobId,
        title: submission.job?.title || 'Unknown Job',
        location: submission.job?.location,
        rateMin: submission.job?.rateMin ? parseFloat(submission.job.rateMin) : null,
        rateMax: submission.job?.rateMax ? parseFloat(submission.job.rateMax) : null,
        rateType: submission.job?.rateType,
        accountId: submission.job?.accountId,
        accountName: null, // TODO: Need to add account relation to job query
      },
      vendorName: null, // TODO: Vendor name needs to be fetched from vendor relation
      vendorId: null, // TODO: Vendor tracking not yet implemented
      clientSubmittedAt: submission.submittedToClientAt,
      interviewCount: interviews.length,
      submissionNotes: submission.submissionNotes,
      internalNotes: submission.vendorNotes,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    };
  }, [submission, interviews]);

  // Transform interviews
  const interviewsList = useMemo(() => {
    return interviews.map((interview) => ({
      id: interview.id,
      type: interview.interviewType as 'phone' | 'video' | 'onsite' | 'technical' | 'final',
      status: interview.status as 'scheduled' | 'completed' | 'cancelled' | 'no_show',
      scheduledAt: interview.scheduledAt || new Date(),
      duration: interview.durationMinutes || undefined,
      interviewers: interview.interviewerNames || [],
      location: interview.meetingLocation,
      meetingLink: interview.meetingLink,
      notes: interview.feedback,
      feedback: interview.feedback,
      result: interview.recommendation as 'passed' | 'failed' | 'pending' | null,
    }));
  }, [interviews]);

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
      assignee: task.assignedTo ? { id: task.assignedTo, name: 'Assigned User' } : null,
      createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
    }));
  }, [tasks]);

  // Workflow action handlers
  const handleStartScreening = () => {
    updateSubmission.mutate({ id: submissionId, status: 'screening' });
  };

  const handleSubmitToVendor = () => {
    setCurrentTransition({
      fromStatus: submission?.status || 'screening',
      toStatus: 'vendor_pending',
      action: 'Submit to Vendor',
      variant: 'default',
    });
    setShowTransitionModal(true);
  };

  const handleRecordVendorDecision = () => {
    setCurrentTransition({
      fromStatus: submission?.status || 'vendor_pending',
      toStatus: 'vendor_accepted',
      action: 'Record Vendor Decision',
      variant: 'success',
    });
    setShowTransitionModal(true);
  };

  const handleSubmitToClient = () => {
    setCurrentTransition({
      fromStatus: submission?.status || 'vendor_accepted',
      toStatus: 'submitted_to_client',
      action: 'Submit to Client',
      variant: 'default',
    });
    setShowTransitionModal(true);
  };

  const handleRecordClientDecision = () => {
    setCurrentTransition({
      fromStatus: submission?.status || 'submitted_to_client',
      toStatus: 'client_accepted',
      action: 'Record Client Decision',
      variant: 'success',
    });
    setShowTransitionModal(true);
  };

  const handleScheduleInterview = () => {
    setShowScheduleInterviewModal(true);
  };

  const handleMoveToOffer = () => {
    moveToOffer.mutate({ id: submissionId });
  };

  const handleMarkPlaced = () => {
    markPlaced.mutate({ id: submissionId });
  };

  const handleWithdraw = () => {
    if (confirm('Are you sure you want to withdraw this submission?')) {
      withdraw.mutate({ id: submissionId, reason: 'Withdrawn by recruiter' });
    }
  };

  // Get primary action
  const primaryAction = getDefaultPrimaryAction(submission?.status || 'sourced', {
    onStartScreening: handleStartScreening,
    onSubmitToVendor: handleSubmitToVendor,
    onRecordVendorDecision: handleRecordVendorDecision,
    onSubmitToClient: handleSubmitToClient,
    onRecordClientDecision: handleRecordClientDecision,
    onScheduleInterview: handleScheduleInterview,
    onMoveToOffer: handleMoveToOffer,
    onMarkPlaced: handleMarkPlaced,
  });

  // Handle transition confirm
  const handleTransitionConfirm = async (data: Record<string, string>) => {
    if (!currentTransition) return;

    switch (currentTransition.action) {
      case 'Submit to Vendor':
        await submitToVendor.mutateAsync({
          id: submissionId,
          notes: data.notes,
        });
        break;
      case 'Record Vendor Decision':
        await recordVendorDecision.mutateAsync({
          id: submissionId,
          decision: 'accepted',
          notes: data.notes,
        });
        break;
      case 'Submit to Client':
        await submitToClient.mutateAsync({
          id: submissionId,
          notes: data.notes,
        });
        break;
      case 'Record Client Decision':
        await recordClientDecision.mutateAsync({
          id: submissionId,
          decision: 'accepted',
          notes: data.notes,
        });
        break;
    }
  };

  // Handle document upload
  const handleUploadDocument = async (files: File[], metadata: { category: string; description: string; tags: string[] }) => {
    for (const file of files) {
      const { uploadUrl, filePath, bucket } = await getUploadUrl.mutateAsync({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        entityType: 'submission',
        entityId: submissionId,
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
        entityType: 'submission',
        entityId: submissionId,
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
    await createActivity.mutateAsync({
      entityType: 'submission',
      entityId: submissionId,
      activityType: 'task',
      subject: task.title,
      priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
      dueDate: task.dueDate || new Date(),
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

  // Build workflow bar
  const workflowBar = submission ? (
    <SubmissionWorkflowBar
      status={submission.status}
      primaryAction={primaryAction}
      onWithdraw={handleWithdraw}
      isLoading={updateSubmission.isPending || submitToVendor.isPending || submitToClient.isPending}
    />
  ) : null;

  // Build tabs
  const tabs = buildSubmissionTabs({
    overview: submissionData ? (
      <SubmissionOverviewContent submission={submissionData} />
    ) : null,
    interviews: {
      content: (
        <SubmissionInterviewsContent
          interviews={interviewsList}
          onSchedule={() => setShowScheduleInterviewModal(true)}
        />
      ),
      count: interviewsList.length,
    },
    activity: (
      <ActivityTab
        entityType="submission"
        entityId={submissionId}
      />
    ),
    documents: {
      content: (
        <DocumentsTab
          entityType="submission"
          entityId={submissionId}
          categories={SUBMISSION_DOCUMENT_CATEGORIES}
        />
      ),
      count: documents?.length,
    },
    tasks: {
      content: (
        <TasksTab
          entityType="submission"
          entityId={submissionId}
        />
      ),
      count: tasksList.filter(t => t.status !== 'completed').length,
    },
  });

  // Build sidebar
  const sidebar = submissionData ? (
    <SubmissionSidebarContent
      submission={{
        id: submissionData.id,
        status: submissionData.status,
        createdAt: submissionData.createdAt,
        updatedAt: submissionData.updatedAt,
        clientSubmittedAt: submissionData.clientSubmittedAt,
      }}
      candidate={{
        id: submissionData.candidate.id,
        fullName: submissionData.candidate.fullName,
        location: submissionData.candidate.candidateLocation,
        visa: submissionData.candidate.candidateCurrentVisa,
        hourlyRate: submissionData.candidate.candidateHourlyRate
          ? parseFloat(submissionData.candidate.candidateHourlyRate as unknown as string)
          : null,
      }}
      job={{
        id: submissionData.job.id,
        title: submissionData.job.title,
        location: submissionData.job.location,
        accountName: submissionData.job.accountName,
      }}
    />
  ) : null;

  // Build actions
  const actions = [
    {
      id: 'add-note',
      label: 'Add Note',
      icon: MessageSquare,
      variant: 'outline' as const,
      onClick: () => {
        // Would open add note modal
      },
    },
    {
      id: 'schedule-interview',
      label: 'Schedule Interview',
      icon: Calendar,
      onClick: () => setShowScheduleInterviewModal(true),
    },
  ];

  return (
    <>
      <GenericEntityWorkspace
        entityType="submission"
        entityId={submissionId}
        entityName={submissionData?.candidate.fullName || 'Submission'}
        isLoading={isLoading}
        error={error ? new Error(error.message) : undefined}
        backLink={{ href: '/employee/recruiting/submissions', label: 'Back to Submissions' }}
        sidebar={sidebar}
        workflowBar={workflowBar}
        tabs={tabs}
        defaultTab="overview"
        actions={actions}
      />

      {/* Workflow Transition Modal */}
      {currentTransition && (
        <WorkflowTransitionModal
          isOpen={showTransitionModal}
          onClose={() => {
            setShowTransitionModal(false);
            setCurrentTransition(null);
          }}
          transition={currentTransition}
          onConfirm={handleTransitionConfirm}
          isProcessing={
            submitToVendor.isPending ||
            recordVendorDecision.isPending ||
            submitToClient.isPending ||
            recordClientDecision.isPending
          }
          fields={
            currentTransition.action === 'Submit to Vendor'
              ? [
                  {
                    id: 'vendorName',
                    label: 'Vendor Name',
                    type: 'text',
                    placeholder: 'Enter vendor name',
                  },
                ]
              : []
          }
        />
      )}
    </>
  );
}

export default UnifiedSubmissionWorkspace;
