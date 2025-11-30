/**
 * UnifiedTalentWorkspace Component
 *
 * A modular talent/candidate workspace that uses the GenericEntityWorkspace composer
 * with Talent-specific content components.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Edit, Mail, Phone, Plus } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import {
  useCreateActivity,
  useCompleteActivity,
} from '@/hooks/mutations/activities';

// Composers
import { GenericEntityWorkspace, buildTalentTabs } from '../composers';

// Entity content
import {
  TalentOverviewContent,
  TalentSidebarContent,
  TalentJobsContent,
  TalentResumeSection,
} from '../entity/talent';

// Shared tabs
import { ActivityTab } from '../tabs/ActivityTab';
import { DocumentsTab, type DocumentCategory } from '../tabs/DocumentsTab';
import { TasksTab } from '../tabs/TasksTab';

// =====================================================
// TYPES
// =====================================================

interface UnifiedTalentWorkspaceProps {
  talentId: string;
}

// Document categories for talents
const TALENT_DOCUMENT_CATEGORIES: DocumentCategory[] = [
  { key: 'resume', label: 'Resume', color: 'bg-blue-100 text-blue-700' },
  { key: 'cover_letter', label: 'Cover Letter', color: 'bg-purple-100 text-purple-700' },
  { key: 'certificate', label: 'Certificate', color: 'bg-amber-100 text-amber-700' },
  { key: 'portfolio', label: 'Portfolio', color: 'bg-green-100 text-green-700' },
  { key: 'reference', label: 'Reference', color: 'bg-indigo-100 text-indigo-700' },
  { key: 'other', label: 'Other', color: 'bg-stone-100 text-stone-600' },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export function UnifiedTalentWorkspace({ talentId }: UnifiedTalentWorkspaceProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showResumeUploadModal, setShowResumeUploadModal] = useState(false);

  // Fetch talent details
  const { data: talent, isLoading, error, refetch } = trpc.ats.candidates.getById.useQuery(
    { id: talentId },
    { enabled: !!talentId }
  );

  // Fetch submissions for this talent
  const { data: submissions = [], refetch: refetchSubmissions } = trpc.ats.submissions.list.useQuery(
    { candidateId: talentId, limit: 50 },
    { enabled: !!talentId }
  );

  // Fetch resumes
  const { data: resumes = [], refetch: refetchResumes } = trpc.ats.resumes.list.useQuery(
    { candidateId: talentId },
    { enabled: !!talentId }
  );

  // Fetch activities
  const { data: activities, isLoading: activitiesLoading, refetch: refetchActivities } = trpc.activities.list.useQuery(
    { entityType: 'candidate', entityId: talentId, includeCompleted: true, limit: 50, offset: 0 },
    { enabled: !!talentId }
  );

  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = trpc.activities.list.useQuery(
    { entityType: 'candidate', entityId: talentId, activityTypes: ['task', 'follow_up'], includeCompleted: true, limit: 100, offset: 0 },
    { enabled: !!talentId }
  );

  // Fetch documents
  const { data: documents, isLoading: documentsLoading, refetch: refetchDocuments } = trpc.files.list.useQuery(
    { entityType: 'candidate', entityId: talentId },
    { enabled: !!talentId }
  );

  // Mutations
  const createActivity = useCreateActivity();
  const completeActivity = useCompleteActivity();

  // File mutations
  const getUploadUrl = trpc.files.getUploadUrl.useMutation();
  const recordUpload = trpc.files.recordUpload.useMutation();
  const deleteFile = trpc.files.delete.useMutation();
  const getDownloadUrl = trpc.files.getDownloadUrl.useMutation();

  // Transform talent data
  const talentData = useMemo(() => {
    if (!talent) return null;
    return {
      id: talent.id,
      firstName: talent.firstName || '',
      lastName: talent.lastName || '',
      fullName: talent.fullName || `${talent.firstName || ''} ${talent.lastName || ''}`.trim(),
      email: talent.email,
      phone: talent.phone,
      candidateLocation: talent.candidateLocation,
      candidateCurrentVisa: talent.candidateCurrentVisa,
      candidateHourlyRate: talent.candidateHourlyRate ? parseFloat(talent.candidateHourlyRate) : null,
      candidateSkills: talent.candidateSkills,
      candidateExperienceYears: talent.candidateExperienceYears,
      candidateAvailability: talent.candidateAvailability,
      candidateWillingToRelocate: talent.candidateWillingToRelocate,
      candidateStatus: talent.candidateStatus,
      createdAt: talent.createdAt,
    };
  }, [talent]);

  // Transform jobs data
  const jobsList = useMemo(() => {
    return submissions.map((sub) => ({
      id: sub.id,
      submissionId: sub.id,
      jobId: sub.jobId,
      jobTitle: 'Job',
      accountName: undefined,
      location: undefined,
      rateMin: undefined,
      rateMax: undefined,
      rateType: undefined,
      status: 'open',
      submissionStatus: sub.status,
      submittedAt: sub.createdAt,
    }));
  }, [submissions]);

  // Transform resumes
  const resumesList = useMemo(() => {
    return resumes.map((resume) => ({
      id: resume.id,
      fileId: resume.id, // Use resume id as fileId
      fileName: resume.fileName,
      fileSize: resume.fileSize,
      mimeType: resume.mimeType,
      version: resume.version,
      isLatest: resume.isLatest,
      resumeType: resume.resumeType,
      title: resume.title,
      notes: resume.notes,
      aiSummary: resume.aiSummary,
      extractedSkills: resume.parsedSkills,
      uploadedAt: resume.uploadedAt,
    }));
  }, [resumes]);

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
      assignee: task.assignedTo,
      createdAt: task.createdAt,
    }));
  }, [tasks]);

  // Metrics
  const metrics = useMemo(() => {
    const total = submissions.length;
    const active = submissions.filter(s =>
      s.status !== 'rejected' && s.status !== 'withdrawn'
    ).length;
    const placed = submissions.filter(s => s.status === 'placed').length;
    return {
      totalSubmissions: total,
      activeSubmissions: active,
      placedCount: placed,
    };
  }, [submissions]);

  // Handle document upload
  const handleUploadDocument = async (files: File[], metadata: { category: string; description: string; tags: string[] }) => {
    for (const file of files) {
      const { uploadUrl, filePath, bucket } = await getUploadUrl.mutateAsync({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        entityType: 'candidate',
        entityId: talentId,
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
        entityType: 'candidate',
        entityId: talentId,
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

  // Handle resume download/preview
  const handleResumeDownload = async (fileId: string) => {
    const result = await getDownloadUrl.mutateAsync({ fileId });
    window.open(result.url, '_blank');
  };

  // Handle task operations
  const handleCreateTask = async (task: { title: string; priority: string; dueDate?: Date }) => {
    await createActivity.mutateAsync({
      entityType: 'candidate',
      entityId: talentId,
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

  // Build tabs
  const tabs = buildTalentTabs({
    overview: talentData ? (
      <div className="space-y-6">
        <TalentOverviewContent
          talent={talentData}
          metrics={metrics}
          onEdit={() => setShowEditModal(true)}
        />
        <TalentResumeSection
          talentId={talentId}
          talentName={talentData.fullName}
          resumes={resumesList}
          onUpload={() => setShowResumeUploadModal(true)}
          onDownload={handleResumeDownload}
          onPreview={handleResumeDownload}
        />
      </div>
    ) : null,
    jobs: {
      content: (
        <TalentJobsContent jobs={jobsList} />
      ),
      count: jobsList.filter(j =>
        j.submissionStatus !== 'rejected' && j.submissionStatus !== 'withdrawn'
      ).length,
    },
    activity: (
      <ActivityTab
        entityType="talent"
        entityId={talentId}
      />
    ),
    documents: {
      content: (
        <DocumentsTab
          entityType="talent"
          entityId={talentId}
          categories={TALENT_DOCUMENT_CATEGORIES}
        />
      ),
      count: documents?.length,
    },
    tasks: {
      content: (
        <TasksTab
          entityType="talent"
          entityId={talentId}
        />
      ),
      count: tasksList.filter((t) => t.status !== 'completed').length,
    },
  });

  // Build sidebar
  const sidebar = talentData ? (
    <TalentSidebarContent
      talent={talentData}
      onEdit={() => setShowEditModal(true)}
      onEmail={() => setShowEmailModal(true)}
      onCall={() => {
        if (talentData.phone) {
          window.location.href = `tel:${talentData.phone}`;
        }
      }}
    />
  ) : null;

  // Build actions
  const actions = [
    {
      id: 'edit',
      label: 'Edit Profile',
      icon: Edit,
      variant: 'outline' as const,
      onClick: () => setShowEditModal(true),
    },
    {
      id: 'email',
      label: 'Send Email',
      icon: Mail,
      onClick: () => setShowEmailModal(true),
    },
  ];

  return (
    <GenericEntityWorkspace
      entityType="talent"
      entityId={talentId}
      entityName={talentData?.fullName || 'Talent'}
      isLoading={isLoading}
      error={error ? new Error(error.message) : null}
      backLink={{ href: '/employee/recruiting/talent', label: 'Back to Talent' }}
      sidebar={sidebar}
      tabs={tabs}
      defaultTab="overview"
      actions={actions}
    />
  );
}

export default UnifiedTalentWorkspace;
