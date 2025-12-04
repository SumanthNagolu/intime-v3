'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, User, MapPin, Briefcase, Clock, Phone, Mail, Calendar,
  FileText, Activity, Building2, DollarSign, Plus,
  Loader2, X, Video, Send, CheckCircle, XCircle, Star,
  ThumbsUp, ThumbsDown, Eye, MessageSquare, ClipboardList,
  Building, Target, Sparkles,
  ExternalLink, Edit3, RefreshCw, ArrowRight, Check, Ban
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

interface SubmissionWorkspaceProps {
  submissionId: string;
}

// Type definitions - use 'any' to avoid strict typing with database types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SubmissionData = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InterviewData = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActivityData = any;

// Complete status configuration with workflow stages
const STATUS_CONFIG: Record<string, {
  bg: string;
  text: string;
  label: string;
  stage: 'initial' | 'vendor' | 'client' | 'final';
  order: number;
}> = {
  sourced: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Sourced', stage: 'initial', order: 1 },
  screening: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Screening', stage: 'initial', order: 2 },
  vendor_pending: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Vendor Pending', stage: 'vendor', order: 3 },
  vendor_screening: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Vendor Screening', stage: 'vendor', order: 4 },
  vendor_accepted: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Vendor Accepted', stage: 'vendor', order: 5 },
  vendor_rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Vendor Rejected', stage: 'vendor', order: -1 },
  submitted_to_client: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Client Submitted', stage: 'client', order: 6 },
  client_review: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Client Review', stage: 'client', order: 7 },
  client_accepted: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Client Accepted', stage: 'client', order: 8 },
  client_rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Client Rejected', stage: 'client', order: -1 },
  client_interview: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Interviewing', stage: 'client', order: 9 },
  offer_stage: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Offer Stage', stage: 'final', order: 10 },
  placed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Placed', stage: 'final', order: 11 },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', stage: 'final', order: -1 },
  withdrawn: { bg: 'bg-stone-100', text: 'text-stone-700', label: 'Withdrawn', stage: 'final', order: -1 },
};

// Pipeline stages for progress bar
const PIPELINE_STAGES = [
  { key: 'initial', label: 'Sourced', statuses: ['sourced', 'screening'] },
  { key: 'vendor', label: 'Vendor', statuses: ['vendor_pending', 'vendor_screening', 'vendor_accepted'] },
  { key: 'client', label: 'Client', statuses: ['submitted_to_client', 'client_review', 'client_accepted'] },
  { key: 'interview', label: 'Interview', statuses: ['client_interview'] },
  { key: 'offer', label: 'Offer', statuses: ['offer_stage'] },
  { key: 'placed', label: 'Placed', statuses: ['placed'] },
];

type TabType = 'overview' | 'interviews' | 'documents' | 'activity' | 'tasks';

export const SubmissionWorkspace: React.FC<SubmissionWorkspaceProps> = ({ submissionId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Modal states
  const [showVendorSubmitModal, setShowVendorSubmitModal] = useState(false);
  const [showVendorDecisionModal, setShowVendorDecisionModal] = useState(false);
  const [showClientSubmitModal, setShowClientSubmitModal] = useState(false);
  const [showClientDecisionModal, setShowClientDecisionModal] = useState(false);
  const [showScheduleInterviewModal, setShowScheduleInterviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Fetch submission details with related data
  const { data: submission, isLoading, error, refetch } = trpc.ats.submissions.getById.useQuery({ id: submissionId });

  // Fetch activities for this submission
  const { data: activities, refetch: refetchActivities } = trpc.activities.list.useQuery({
    entityType: 'submission',
    entityId: submissionId,
    limit: 20,
  }, { enabled: !!submissionId });

  // Fetch pending tasks
  const { data: pendingTasks, refetch: refetchTasks } = trpc.activities.pending.useQuery({
    entityType: 'submission',
    entityId: submissionId,
  }, { enabled: !!submissionId });

  // Mutations
  const updateStatus = trpc.ats.submissions.update.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); },
  });

  const submitToVendor = trpc.ats.submissions.submitToVendor.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); setShowVendorSubmitModal(false); },
  });

  const recordVendorDecision = trpc.ats.submissions.recordVendorDecision.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); setShowVendorDecisionModal(false); },
  });

  const submitToClient = trpc.ats.submissions.submitToClient.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); setShowClientSubmitModal(false); },
  });

  const recordClientDecision = trpc.ats.submissions.recordClientDecision.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); setShowClientDecisionModal(false); },
  });


  const moveToOffer = trpc.ats.submissions.moveToOffer.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); },
  });

  const markPlaced = trpc.ats.submissions.markPlaced.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); },
  });

  const withdraw = trpc.ats.submissions.withdraw.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); setShowWithdrawModal(false); },
  });

  const createActivity = trpc.activities.create.useMutation({
    onSuccess: () => { refetchActivities(); refetchTasks(); setShowAddNoteModal(false); setShowAddTaskModal(false); },
  });

  const completeActivity = trpc.activities.complete.useMutation({
    onSuccess: () => { refetchActivities(); refetchTasks(); },
  });

  const createInterview = trpc.ats.interviews.create.useMutation({
    onSuccess: () => { refetch(); refetchActivities(); setShowScheduleInterviewModal(false); },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 size={32} className="animate-spin text-stone-400" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="text-center py-24">
        <Briefcase size={48} className="mx-auto text-stone-300 mb-4" />
        <h2 className="text-xl font-bold text-charcoal mb-2">Submission Not Found</h2>
        <p className="text-stone-500 mb-4">The submission you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/employee/recruiting/submissions"
          className="text-rust font-bold hover:underline"
        >
          Back to Submissions
        </Link>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[submission.status] || STATUS_CONFIG.sourced;
  const candidateName = submission.candidate
    ? `${submission.candidate.firstName || ''} ${submission.candidate.lastName || ''}`.trim()
    : 'Unknown Candidate';

  const isTerminalStatus = ['placed', 'rejected', 'withdrawn', 'vendor_rejected', 'client_rejected'].includes(submission.status);
  const isActive = !isTerminalStatus;

  // Get current stage index for progress bar
  const getCurrentStageIndex = () => {
    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      if (PIPELINE_STAGES[i].statuses.includes(submission.status)) {
        return i;
      }
    }
    return -1;
  };

  const currentStageIndex = getCurrentStageIndex();

  // Get next action based on current status
  const getNextAction = () => {
    switch (submission.status) {
      case 'sourced':
        return { label: 'Start Screening', action: () => updateStatus.mutate({ id: submissionId, status: 'screening' }) };
      case 'screening':
        return { label: 'Submit to Vendor', action: () => setShowVendorSubmitModal(true) };
      case 'vendor_pending':
      case 'vendor_screening':
        return { label: 'Record Vendor Decision', action: () => setShowVendorDecisionModal(true) };
      case 'vendor_accepted':
        return { label: 'Submit to Client', action: () => setShowClientSubmitModal(true) };
      case 'submitted_to_client':
      case 'client_review':
        return { label: 'Record Client Decision', action: () => setShowClientDecisionModal(true) };
      case 'client_accepted':
        return { label: 'Schedule Interview', action: () => setShowScheduleInterviewModal(true) };
      case 'client_interview':
        return { label: 'Move to Offer', action: () => moveToOffer.mutate({ id: submissionId }) };
      case 'offer_stage':
        return { label: 'Mark as Placed', action: () => markPlaced.mutate({ id: submissionId }) };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Eye size={14} /> },
    { id: 'interviews', label: 'Interviews', icon: <Video size={14} />, count: submission.interviews?.length },
    { id: 'tasks', label: 'Tasks', icon: <ClipboardList size={14} />, count: pendingTasks?.length },
    { id: 'activity', label: 'Activity', icon: <Activity size={14} />, count: activities?.length },
    { id: 'documents', label: 'Documents', icon: <FileText size={14} /> },
  ];

  return (
    <div className="animate-fade-in">
      {/* Back Link */}
      <Link
        href={submission.candidateId ? `/employee/recruiting/talent/${submission.candidateId}` : '/employee/recruiting/submissions'}
        className="inline-flex items-center gap-2 text-stone-500 hover:text-charcoal mb-6 text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to {submission.candidateId ? 'Talent Profile' : 'Submissions'}
      </Link>

      {/* Header */}
      <div className="bg-white rounded-[2rem] border border-stone-200 p-8 mb-6 shadow-sm">
        <div className="flex items-start gap-6">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-rust/20 to-rust/10 rounded-2xl flex items-center justify-center text-rust border border-rust/10">
            <Send size={32} />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-2xl font-serif font-bold text-charcoal">
                  {candidateName}
                </h1>
                <div className="flex items-center gap-4 text-stone-500 mt-1">
                  <span className="flex items-center gap-1 text-sm">
                    <Briefcase size={14} /> {submission.job?.title || `Job #${submission.jobId.slice(0, 8)}`}
                  </span>
                  {submission.account && (
                    <span className="flex items-center gap-1 text-sm">
                      <Building2 size={14} /> {submission.account.name}
                    </span>
                  )}
                  {submission.job?.location && (
                    <span className="flex items-center gap-1 text-sm">
                      <MapPin size={14} /> {submission.job.location}
                    </span>
                  )}
                </div>
              </div>
              <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-3 mt-4">
              {submission.aiMatchScore && (
                <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-700 flex items-center gap-1">
                  <Sparkles size={12} /> {submission.aiMatchScore}% Match
                </span>
              )}
              {submission.submittedRate && (
                <span className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-bold text-green-700 flex items-center gap-1">
                  <DollarSign size={12} /> ${Number(submission.submittedRate).toLocaleString()}/{submission.submittedRateType || 'hr'}
                </span>
              )}
              {(submission.interviewCount ?? 0) > 0 && (
                <span className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs font-bold text-purple-700 flex items-center gap-1">
                  <Video size={12} /> {submission.interviewCount} Interview{(submission.interviewCount ?? 0) > 1 ? 's' : ''}
                </span>
              )}
              <span className="px-3 py-1.5 bg-stone-100 rounded-lg text-xs font-bold text-stone-700 flex items-center gap-1">
                <Calendar size={12} /> Created {new Date(submission.createdAt || '').toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Pipeline Progress */}
        <div className="mt-6 pt-6 border-t border-stone-100">
          <div className="flex items-center gap-1">
            {PIPELINE_STAGES.map((stage, index) => {
              const isPast = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isRejected = isTerminalStatus && submission.status.includes('rejected');

              return (
                <div key={stage.key} className="flex-1 relative">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isRejected && isCurrent ? 'bg-red-500' :
                      isCurrent ? 'bg-rust' :
                      isPast ? 'bg-green-500' :
                      'bg-stone-200'
                    }`}
                  />
                  {index < PIPELINE_STAGES.length - 1 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-white border-2 border-stone-200 z-10" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            {PIPELINE_STAGES.map((stage) => (
              <span key={stage.key} className="text-xs text-stone-500">{stage.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Banner - shows contextual next action */}
      {isActive && nextAction && (
        <div className="bg-gradient-to-r from-charcoal to-charcoal/90 rounded-2xl p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Target size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">Next Step</h3>
              <p className="text-white/70 text-sm">
                {submission.status === 'sourced' && 'Begin screening the candidate for this position'}
                {submission.status === 'screening' && 'Submit candidate for vendor approval'}
                {['vendor_pending', 'vendor_screening'].includes(submission.status) && 'Awaiting vendor decision on this candidate'}
                {submission.status === 'vendor_accepted' && 'Submit approved candidate to client'}
                {['submitted_to_client', 'client_review'].includes(submission.status) && 'Awaiting client feedback'}
                {submission.status === 'client_accepted' && 'Client wants to interview this candidate'}
                {submission.status === 'client_interview' && 'Candidate is in interview process'}
                {submission.status === 'offer_stage' && 'Finalizing offer with candidate'}
              </p>
            </div>
          </div>
          <button
            onClick={nextAction.action}
            disabled={updateStatus.isPending || submitToVendor.isPending || submitToClient.isPending}
            className="px-6 py-3 bg-rust text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-rust/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {(updateStatus.isPending || submitToVendor.isPending || submitToClient.isPending) ? (
              <><Loader2 size={16} className="animate-spin" /> Processing...</>
            ) : (
              <><ArrowRight size={16} /> {nextAction.label}</>
            )}
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-stone-200">
          <nav className="flex gap-0 overflow-x-auto flex-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-rust text-rust bg-rust/5'
                    : 'border-transparent text-stone-400 hover:text-charcoal hover:bg-stone-50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1.5 py-0.5 bg-stone-200 rounded text-[10px]">{tab.count}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Quick Actions */}
          {isActive && (
            <div className="flex items-center gap-2 pr-6">
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-50 rounded-lg transition-colors"
              >
                Withdraw
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Reject
              </button>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <OverviewTab
              submission={submission}
              candidateName={candidateName}
              onAddNote={() => setShowAddNoteModal(true)}
              onAddTask={() => setShowAddTaskModal(true)}
              onScheduleInterview={() => setShowScheduleInterviewModal(true)}
              isActive={isActive}
            />
          )}

          {activeTab === 'interviews' && (
            <InterviewsTab
              submission={submission}
              interviews={submission.interviews || []}
              onScheduleInterview={() => setShowScheduleInterviewModal(true)}
              isActive={isActive}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksTab
              tasks={pendingTasks || []}
              activities={activities || []}
              onAddTask={() => setShowAddTaskModal(true)}
              onCompleteTask={(id) => completeActivity.mutate({ id })}
              isLoading={completeActivity.isPending}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityTab
              activities={activities || []}
              onAddNote={() => setShowAddNoteModal(true)}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab submission={submission} />
          )}
        </div>
      </div>

      {/* Modals */}
      {showVendorSubmitModal && (
        <VendorSubmitModal
          onClose={() => setShowVendorSubmitModal(false)}
          onSubmit={(data) => submitToVendor.mutate({
            id: submissionId,
            notes: data.notes,
            submittedRate: data.submittedRate,
            submittedRateType: data.submittedRateType as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual' | undefined,
          })}
          isLoading={submitToVendor.isPending}
          currentRate={submission.submittedRate ?? undefined}
        />
      )}

      {showVendorDecisionModal && (
        <VendorDecisionModal
          onClose={() => setShowVendorDecisionModal(false)}
          onDecision={(data) => recordVendorDecision.mutate({ id: submissionId, ...data })}
          isLoading={recordVendorDecision.isPending}
        />
      )}

      {showClientSubmitModal && (
        <ClientSubmitModal
          onClose={() => setShowClientSubmitModal(false)}
          onSubmit={(data) => submitToClient.mutate({ id: submissionId, ...data })}
          isLoading={submitToClient.isPending}
          currentRate={submission.submittedRate ?? undefined}
          instructions={submission.job?.clientSubmissionInstructions ?? undefined}
        />
      )}

      {showClientDecisionModal && (
        <ClientDecisionModal
          onClose={() => setShowClientDecisionModal(false)}
          onDecision={(data) => recordClientDecision.mutate({ id: submissionId, ...data })}
          isLoading={recordClientDecision.isPending}
        />
      )}

      {showScheduleInterviewModal && (
        <ScheduleInterviewModal
          onClose={() => setShowScheduleInterviewModal(false)}
          onSchedule={(data) => createInterview.mutate({
            submissionId,
            jobId: submission.jobId,
            candidateId: submission.candidateId,
            interviewType: data.interviewType as 'phone_screen' | 'technical' | 'behavioral' | 'panel' | 'final' | 'client',
            scheduledAt: data.scheduledAt,
            durationMinutes: data.durationMinutes,
            meetingLink: data.meetingLink,
            interviewerNames: data.interviewerNames,
            round: data.roundNumber,
          })}
          isLoading={createInterview.isPending}
          interviewProcess={submission.job?.clientInterviewProcess ?? undefined}
          existingInterviews={submission.interviews || []}
        />
      )}

      {showRejectModal && (
        <RejectModal
          onClose={() => setShowRejectModal(false)}
          onReject={(reason) => updateStatus.mutate({
            id: submissionId,
            status: 'rejected',
            rejectionReason: reason,
          })}
          isLoading={updateStatus.isPending}
        />
      )}

      {showWithdrawModal && (
        <WithdrawModal
          onClose={() => setShowWithdrawModal(false)}
          onWithdraw={(reason) => withdraw.mutate({ id: submissionId, reason })}
          isLoading={withdraw.isPending}
        />
      )}

      {showAddNoteModal && (
        <AddNoteModal
          onClose={() => setShowAddNoteModal(false)}
          onAdd={(data) => createActivity.mutate({
            entityType: 'submission',
            entityId: submissionId,
            activityType: 'note',
            dueDate: new Date(),
            status: 'completed',
            ...data,
          })}
          isLoading={createActivity.isPending}
        />
      )}

      {showAddTaskModal && (
        <AddTaskModal
          onClose={() => setShowAddTaskModal(false)}
          onAdd={(data) => createActivity.mutate({
            entityType: 'submission',
            entityId: submissionId,
            activityType: data.activityType as 'task' | 'follow_up' | 'call' | 'meeting' | 'reminder',
            status: 'open',
            subject: data.subject,
            body: data.body,
            dueDate: data.dueDate,
            priority: data.priority as 'low' | 'medium' | 'high' | 'urgent' | undefined,
          })}
          isLoading={createActivity.isPending}
        />
      )}
    </div>
  );
};

// ============================================================================
// Overview Tab
// ============================================================================

const OverviewTab: React.FC<{
  submission: SubmissionData;
  candidateName: string;
  onAddNote: () => void;
  onAddTask: () => void;
  onScheduleInterview: () => void;
  isActive: boolean;
}> = ({ submission, candidateName, onAddNote, onAddTask, onScheduleInterview, isActive }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stage-specific info cards */}
        {['vendor_pending', 'vendor_screening'].includes(submission.status) && (
          <div className="bg-cyan-50 rounded-2xl p-6 border border-cyan-200">
            <h3 className="font-bold text-cyan-800 mb-3 flex items-center gap-2">
              <Building size={16} /> Vendor Review In Progress
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {submission.vendorSubmittedAt && (
                <div>
                  <p className="text-xs text-cyan-600 uppercase tracking-widest mb-1">Submitted</p>
                  <p className="text-cyan-800 font-medium">{new Date(submission.vendorSubmittedAt).toLocaleDateString()}</p>
                </div>
              )}
              {submission.vendorNotes && (
                <div className="col-span-2">
                  <p className="text-xs text-cyan-600 uppercase tracking-widest mb-1">Notes</p>
                  <p className="text-cyan-800">{submission.vendorNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {['submitted_to_client', 'client_review'].includes(submission.status) && (
          <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
            <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
              <Building2 size={16} /> Client Review In Progress
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {submission.submittedToClientAt && (
                <div>
                  <p className="text-xs text-purple-600 uppercase tracking-widest mb-1">Submitted</p>
                  <p className="text-purple-800 font-medium">{new Date(submission.submittedToClientAt).toLocaleDateString()}</p>
                </div>
              )}
              {submission.submittedRate && (
                <div>
                  <p className="text-xs text-purple-600 uppercase tracking-widest mb-1">Rate</p>
                  <p className="text-purple-800 font-medium">${Number(submission.submittedRate).toLocaleString()}/{submission.submittedRateType || 'hr'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {submission.status === 'client_interview' && (
          <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
            <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
              <Video size={16} /> Interview Stage
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-orange-600 uppercase tracking-widest mb-1">Total Interviews</p>
                <p className="text-orange-800 font-medium">{submission.interviewCount || submission.interviews?.length || 0}</p>
              </div>
              {submission.lastInterviewDate && (
                <div>
                  <p className="text-xs text-orange-600 uppercase tracking-widest mb-1">Last Interview</p>
                  <p className="text-orange-800 font-medium">{new Date(submission.lastInterviewDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            {submission.interviews?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-orange-200">
                <p className="text-xs text-orange-600 uppercase tracking-widest mb-2">Upcoming</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {submission.interviews.filter((i: any) => i.status === 'scheduled').slice(0, 2).map((interview: any) => (
                  <div key={interview.id} className="flex items-center justify-between py-2">
                    <span className="text-orange-800 font-medium">Round {interview.roundNumber}</span>
                    <span className="text-orange-600">{interview.scheduledAt && new Date(interview.scheduledAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rejection Info */}
        {['rejected', 'vendor_rejected', 'client_rejected', 'withdrawn'].includes(submission.status) && (
          <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
            <h3 className="font-bold text-red-700 mb-4 flex items-center gap-2">
              <XCircle size={16} /> {submission.status === 'withdrawn' ? 'Withdrawal' : 'Rejection'} Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-red-600 uppercase tracking-widest mb-1">Reason</p>
                <p className="text-red-700 font-medium">{submission.rejectionReason || 'Not specified'}</p>
              </div>
              {submission.rejectionSource && (
                <div>
                  <p className="text-xs text-red-600 uppercase tracking-widest mb-1">Source</p>
                  <p className="text-red-700 font-medium capitalize">{submission.rejectionSource}</p>
                </div>
              )}
              {submission.rejectedAt && (
                <div>
                  <p className="text-xs text-red-600 uppercase tracking-widest mb-1">Date</p>
                  <p className="text-red-700 font-medium">{new Date(submission.rejectedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Candidate Info */}
        {submission.candidate && (
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
            <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
              <User size={16} /> Candidate Details
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-rust/20 to-rust/10 rounded-xl flex items-center justify-center text-rust font-bold text-xl border border-rust/10">
                {submission.candidate.firstName?.[0]}{submission.candidate.lastName?.[0]}
              </div>
              <div className="flex-1">
                <p className="font-bold text-charcoal text-lg">{candidateName}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  {submission.candidate.email && (
                    <p className="text-sm text-stone-500 flex items-center gap-1">
                      <Mail size={12} /> {submission.candidate.email}
                    </p>
                  )}
                  {submission.candidate.phone && (
                    <p className="text-sm text-stone-500 flex items-center gap-1">
                      <Phone size={12} /> {submission.candidate.phone}
                    </p>
                  )}
                  {submission.candidate.candidateLocation && (
                    <p className="text-sm text-stone-500 flex items-center gap-1">
                      <MapPin size={12} /> {submission.candidate.candidateLocation}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {submission.candidate.candidateCurrentVisa && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                      {submission.candidate.candidateCurrentVisa}
                    </span>
                  )}
                  {submission.candidate.candidateExperienceYears && (
                    <span className="px-2 py-1 bg-stone-200 text-stone-700 text-xs font-bold rounded">
                      {submission.candidate.candidateExperienceYears} yrs exp
                    </span>
                  )}
                  {submission.candidate.candidateAvailability && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded capitalize">
                      {submission.candidate.candidateAvailability.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {submission.candidate.candidateSkills?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-stone-200">
                <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {submission.candidate.candidateSkills.slice(0, 10).map((skill: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-white border border-stone-200 text-stone-700 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                  {submission.candidate.candidateSkills.length > 10 && (
                    <span className="px-2 py-1 text-stone-500 text-xs">
                      +{submission.candidate.candidateSkills.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
            <Link
              href={`/employee/recruiting/talent/${submission.candidateId}`}
              className="mt-4 inline-flex items-center gap-2 text-rust font-bold text-sm hover:underline"
            >
              View Full Profile <ExternalLink size={14} />
            </Link>
          </div>
        )}

        {/* Submission Notes */}
        {submission.submissionNotes && (
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
            <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
              <FileText size={16} /> Submission Notes
            </h3>
            <p className="text-stone-600 whitespace-pre-wrap">{submission.submissionNotes}</p>
          </div>
        )}
      </div>

      {/* Right Column - Sidebar */}
      <div className="space-y-6">
        {/* Job Info */}
        <div className="bg-rust/5 rounded-2xl p-6 border border-rust/10">
          <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
            <Briefcase size={16} /> Job Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Title</p>
              <p className="font-medium text-charcoal">{submission.job?.title || 'N/A'}</p>
            </div>
            {submission.account && (
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Client</p>
                <p className="font-medium text-charcoal">{submission.account.name}</p>
              </div>
            )}
            {submission.job?.location && (
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Location</p>
                <p className="font-medium text-charcoal">
                  {submission.job.location}
                  {submission.job.isRemote && ' (Remote)'}
                </p>
              </div>
            )}
            {submission.job?.rateMin && (
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Rate Range</p>
                <p className="font-medium text-charcoal">
                  ${Number(submission.job.rateMin).toLocaleString()} - ${Number(submission.job.rateMax || submission.job.rateMin).toLocaleString()}/{submission.job.rateType || 'hr'}
                </p>
              </div>
            )}
          </div>
          <Link
            href={`/employee/recruiting/jobs/${submission.jobId}`}
            className="mt-4 inline-flex items-center gap-2 text-rust font-bold text-sm hover:underline"
          >
            View Job <ExternalLink size={14} />
          </Link>
        </div>

        {/* Quick Actions */}
        {isActive && (
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
            <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
              <Activity size={16} /> Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={onScheduleInterview}
                className="w-full py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center justify-center gap-2"
              >
                <Video size={14} /> Schedule Interview
              </button>
              <button
                onClick={onAddTask}
                className="w-full py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
              >
                <ClipboardList size={14} /> Add Task
              </button>
              <button
                onClick={onAddNote}
                className="w-full py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 size={14} /> Add Note
              </button>
            </div>
          </div>
        )}

        {/* Timeline Summary */}
        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
          <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
            <Clock size={16} /> Timeline
          </h3>
          <div className="space-y-3 text-sm">
            {submission.createdAt && (
              <div className="flex justify-between">
                <span className="text-stone-500">Created</span>
                <span className="font-medium">{new Date(submission.createdAt).toLocaleDateString()}</span>
              </div>
            )}
            {submission.vendorSubmittedAt && (
              <div className="flex justify-between">
                <span className="text-stone-500">Vendor Submitted</span>
                <span className="font-medium">{new Date(submission.vendorSubmittedAt).toLocaleDateString()}</span>
              </div>
            )}
            {submission.vendorDecisionAt && (
              <div className="flex justify-between">
                <span className="text-stone-500">Vendor Decision</span>
                <span className="font-medium">{new Date(submission.vendorDecisionAt).toLocaleDateString()}</span>
              </div>
            )}
            {submission.submittedToClientAt && (
              <div className="flex justify-between">
                <span className="text-stone-500">Client Submitted</span>
                <span className="font-medium">{new Date(submission.submittedToClientAt).toLocaleDateString()}</span>
              </div>
            )}
            {submission.clientDecisionAt && (
              <div className="flex justify-between">
                <span className="text-stone-500">Client Decision</span>
                <span className="font-medium">{new Date(submission.clientDecisionAt).toLocaleDateString()}</span>
              </div>
            )}
            {submission.offerExtendedAt && (
              <div className="flex justify-between">
                <span className="text-stone-500">Offer Extended</span>
                <span className="font-medium">{new Date(submission.offerExtendedAt).toLocaleDateString()}</span>
              </div>
            )}
            {submission.offerAcceptedAt && (
              <div className="flex justify-between">
                <span className="text-stone-500">Offer Accepted</span>
                <span className="font-medium">{new Date(submission.offerAcceptedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Interviews Tab
// ============================================================================

const InterviewsTab: React.FC<{
  submission: SubmissionData;
  interviews: InterviewData[];
  onScheduleInterview: () => void;
  isActive: boolean;
}> = ({ interviews, onScheduleInterview, isActive }) => {
  if (interviews.length === 0) {
    return (
      <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
        <Video size={48} className="mx-auto text-stone-300 mb-4" />
        <h3 className="font-bold text-charcoal mb-2">No Interviews Scheduled</h3>
        <p className="text-stone-500 mb-4">Schedule interviews to move this submission forward</p>
        {isActive && (
          <button
            onClick={onScheduleInterview}
            className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors"
          >
            Schedule Interview
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-charcoal">
          {interviews.length} Interview{interviews.length > 1 ? 's' : ''}
        </h3>
        {isActive && (
          <button
            onClick={onScheduleInterview}
            className="px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center gap-2"
          >
            <Plus size={14} /> Schedule
          </button>
        )}
      </div>

      {interviews.map((interview) => (
        <div key={interview.id} className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-charcoal text-white text-xs font-bold rounded-lg">
                  Round {interview.roundNumber}
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                  interview.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                  interview.status === 'completed' ? 'bg-green-100 text-green-700' :
                  interview.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-stone-100 text-stone-700'
                }`}>
                  {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                </span>
                <span className="px-3 py-1 bg-stone-200 text-stone-700 text-xs font-bold rounded-lg capitalize">
                  {interview.interviewType?.replace('_', ' ') || 'Interview'}
                </span>
              </div>
              <p className="text-charcoal font-medium">
                {interview.scheduledAt && new Date(interview.scheduledAt).toLocaleString()}
              </p>
              {interview.durationMinutes && (
                <p className="text-stone-500 text-sm">{interview.durationMinutes} minutes</p>
              )}
            </div>
            <div className="text-right">
              {interview.meetingLink && (
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rust font-bold text-sm hover:underline flex items-center gap-1"
                >
                  Join Meeting <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
          {interview.interviewerNames?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-200">
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">Interviewers</p>
              <div className="flex flex-wrap gap-2">
                {interview.interviewerNames.map((name: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-white border border-stone-200 text-stone-700 text-sm rounded">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {interview.feedback && (
            <div className="mt-4 pt-4 border-t border-stone-200">
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">Feedback</p>
              <p className="text-stone-700">{interview.feedback}</p>
              {interview.rating && (
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= interview.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Tasks Tab
// ============================================================================

const TasksTab: React.FC<{
  tasks: ActivityData[];
  activities: ActivityData[];
  onAddTask: () => void;
  onCompleteTask: (id: string) => void;
  isLoading: boolean;
}> = ({ tasks, activities, onAddTask, onCompleteTask, isLoading }) => {
  const taskActivities = activities.filter(a =>
    ['task', 'follow_up', 'reminder', 'call', 'meeting'].includes(a.activityType)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-charcoal">
          {tasks.length} Open Task{tasks.length !== 1 ? 's' : ''}
        </h3>
        <button
          onClick={onAddTask}
          className="px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center gap-2"
        >
          <Plus size={14} /> Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
          <ClipboardList size={48} className="mx-auto text-stone-300 mb-4" />
          <h3 className="font-bold text-charcoal mb-2">No Open Tasks</h3>
          <p className="text-stone-500">All tasks have been completed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-stone-50 rounded-xl p-4 border border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onCompleteTask(task.id)}
                  disabled={isLoading}
                  className="w-6 h-6 rounded-full border-2 border-stone-300 hover:border-green-500 hover:bg-green-50 transition-colors flex items-center justify-center"
                >
                  {isLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                </button>
                <div>
                  <p className="font-medium text-charcoal">{task.subject || task.activityType}</p>
                  {task.dueDate && (
                    <p className={`text-xs ${new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-stone-500'}`}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded ${
                task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                task.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                'bg-stone-200 text-stone-700'
              }`}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Completed tasks */}
      {taskActivities.filter(a => a.status === 'completed').length > 0 && (
        <div className="mt-8">
          <h4 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-4">Completed</h4>
          <div className="space-y-2">
            {taskActivities.filter(a => a.status === 'completed').slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center gap-3 text-stone-500 text-sm">
                <CheckCircle size={14} className="text-green-500" />
                <span className="line-through">{task.subject || task.activityType}</span>
                <span className="text-xs">{task.completedAt && new Date(task.completedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Activity Tab
// ============================================================================

const ActivityTab: React.FC<{
  activities: ActivityData[];
  onAddNote: () => void;
}> = ({ activities, onAddNote }) => {
  const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
    email: <Mail size={14} />,
    call: <Phone size={14} />,
    meeting: <Video size={14} />,
    note: <FileText size={14} />,
    linkedin_message: <MessageSquare size={14} />,
    task: <ClipboardList size={14} />,
    follow_up: <RefreshCw size={14} />,
    reminder: <Clock size={14} />,
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
        <Activity size={48} className="mx-auto text-stone-300 mb-4" />
        <h3 className="font-bold text-charcoal mb-2">No Activity Yet</h3>
        <p className="text-stone-500 mb-4">Start tracking activities for this submission</p>
        <button
          onClick={onAddNote}
          className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors"
        >
          Add Note
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-charcoal">{activities.length} Activities</h3>
        <button
          onClick={onAddNote}
          className="px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center gap-2"
        >
          <Plus size={14} /> Add Note
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              activity.activityType === 'note' ? 'bg-blue-100 text-blue-700' :
              activity.activityType === 'call' ? 'bg-green-100 text-green-700' :
              activity.activityType === 'email' ? 'bg-purple-100 text-purple-700' :
              activity.activityType === 'meeting' ? 'bg-amber-100 text-amber-700' :
              'bg-stone-100 text-stone-700'
            }`}>
              {ACTIVITY_ICONS[activity.activityType] || <Activity size={14} />}
            </div>
            <div className="flex-1 bg-stone-50 rounded-xl p-4 border border-stone-100">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-charcoal capitalize">
                  {activity.subject || activity.activityType.replace('_', ' ')}
                </span>
                <span className="text-xs text-stone-500">
                  {new Date(activity.createdAt).toLocaleString()}
                </span>
              </div>
              {activity.body && (
                <p className="text-stone-600 text-sm whitespace-pre-wrap">{activity.body}</p>
              )}
              {activity.outcome && (
                <span className={`mt-2 inline-block px-2 py-1 text-xs font-bold rounded ${
                  activity.outcome === 'positive' ? 'bg-green-100 text-green-700' :
                  activity.outcome === 'negative' ? 'bg-red-100 text-red-700' :
                  'bg-stone-200 text-stone-700'
                }`}>
                  {activity.outcome}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Documents Tab
// ============================================================================

const DocumentsTab: React.FC<{ submission: SubmissionData }> = ({ submission }) => {
  return (
    <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
      <FileText size={48} className="mx-auto text-stone-300 mb-4" />
      <h3 className="font-bold text-charcoal mb-2">Documents</h3>
      <p className="text-stone-500 mb-4">Resumes, cover letters, and submission documents</p>
      {submission.candidate?.candidateResumeUrl && (
        <a
          href={submission.candidate.candidateResumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors inline-flex items-center gap-2"
        >
          <FileText size={14} /> View Resume
        </a>
      )}
    </div>
  );
};

// ============================================================================
// Modals
// ============================================================================

// Vendor Submit Modal
const VendorSubmitModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: { notes?: string; submittedRate?: number; submittedRateType?: string }) => void;
  isLoading: boolean;
  currentRate?: string;
}> = ({ onClose, onSubmit, isLoading, currentRate }) => {
  const [notes, setNotes] = useState('');
  const [rate, setRate] = useState(currentRate ? Number(currentRate) : '');
  const [rateType, setRateType] = useState<'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual'>('hourly');

  return (
    <ModalWrapper onClose={onClose} title="Submit to Vendor">
      <p className="text-stone-500 text-sm mb-6">Submit this candidate for internal vendor approval</p>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Rate</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              placeholder="Enter rate"
              className="flex-1 p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
            />
            <select
              value={rateType}
              onChange={(e) => setRateType(e.target.value as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual')}
              className="p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
            >
              <option value="hourly">Per Hour</option>
              <option value="daily">Per Day</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes for the vendor review..."
            rows={3}
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button onClick={onClose} className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50">
          Cancel
        </button>
        <button
          onClick={() => onSubmit({
            notes: notes || undefined,
            submittedRate: rate ? Number(rate) : undefined,
            submittedRateType: rateType,
          })}
          disabled={isLoading}
          className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : <><Send size={14} /> Submit</>}
        </button>
      </div>
    </ModalWrapper>
  );
};

// Vendor Decision Modal
const VendorDecisionModal: React.FC<{
  onClose: () => void;
  onDecision: (data: { decision: 'accepted' | 'rejected'; notes?: string; screeningNotes?: string }) => void;
  isLoading: boolean;
}> = ({ onClose, onDecision, isLoading }) => {
  const [decision, setDecision] = useState<'accepted' | 'rejected' | null>(null);
  const [notes, setNotes] = useState('');
  const [screeningNotes, setScreeningNotes] = useState('');

  return (
    <ModalWrapper onClose={onClose} title="Vendor Decision">
      <p className="text-stone-500 text-sm mb-6">Record the vendor&apos;s decision on this candidate</p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setDecision('accepted')}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              decision === 'accepted'
                ? 'border-green-500 bg-green-50'
                : 'border-stone-200 hover:border-green-300'
            }`}
          >
            <ThumbsUp size={24} className={decision === 'accepted' ? 'text-green-600' : 'text-stone-400'} />
            <span className={`font-bold ${decision === 'accepted' ? 'text-green-700' : 'text-stone-600'}`}>Accept</span>
          </button>
          <button
            onClick={() => setDecision('rejected')}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              decision === 'rejected'
                ? 'border-red-500 bg-red-50'
                : 'border-stone-200 hover:border-red-300'
            }`}
          >
            <ThumbsDown size={24} className={decision === 'rejected' ? 'text-red-600' : 'text-stone-400'} />
            <span className={`font-bold ${decision === 'rejected' ? 'text-red-700' : 'text-stone-600'}`}>Reject</span>
          </button>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Screening Notes</label>
          <textarea
            value={screeningNotes}
            onChange={(e) => setScreeningNotes(e.target.value)}
            placeholder="Notes from the screening process..."
            rows={2}
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Decision Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={decision === 'rejected' ? 'Reason for rejection...' : 'Any additional notes...'}
            rows={2}
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button onClick={onClose} className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50">
          Cancel
        </button>
        <button
          onClick={() => decision && onDecision({ decision, notes: notes || undefined, screeningNotes: screeningNotes || undefined })}
          disabled={isLoading || !decision}
          className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 ${
            decision === 'accepted' ? 'bg-green-600 text-white hover:bg-green-700' :
            decision === 'rejected' ? 'bg-red-600 text-white hover:bg-red-700' :
            'bg-charcoal text-white hover:bg-rust'
          }`}
        >
          {isLoading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Check size={14} /> Confirm</>}
        </button>
      </div>
    </ModalWrapper>
  );
};

// Client Submit Modal
const ClientSubmitModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: { notes?: string; submittedRate?: number }) => void;
  isLoading: boolean;
  currentRate?: string;
  instructions?: string;
}> = ({ onClose, onSubmit, isLoading, currentRate, instructions }) => {
  const [notes, setNotes] = useState('');
  const [rate, setRate] = useState(currentRate ? Number(currentRate) : '');

  return (
    <ModalWrapper onClose={onClose} title="Submit to Client">
      <p className="text-stone-500 text-sm mb-6">Submit this candidate&apos;s profile to the client</p>

      {instructions && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Client Instructions</p>
          <p className="text-sm text-amber-800">{instructions}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Submission Rate</label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            placeholder="Rate to submit to client"
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes to include with submission..."
            rows={3}
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button onClick={onClose} className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50">
          Cancel
        </button>
        <button
          onClick={() => onSubmit({ notes: notes || undefined, submittedRate: rate ? Number(rate) : undefined })}
          disabled={isLoading}
          className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : <><Send size={14} /> Submit to Client</>}
        </button>
      </div>
    </ModalWrapper>
  );
};

// Client Decision Modal
const ClientDecisionModal: React.FC<{
  onClose: () => void;
  onDecision: (data: { decision: 'accepted' | 'rejected'; notes?: string; feedback?: string }) => void;
  isLoading: boolean;
}> = ({ onClose, onDecision, isLoading }) => {
  const [decision, setDecision] = useState<'accepted' | 'rejected' | null>(null);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');

  return (
    <ModalWrapper onClose={onClose} title="Client Decision">
      <p className="text-stone-500 text-sm mb-6">Record the client&apos;s response to this submission</p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setDecision('accepted')}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              decision === 'accepted'
                ? 'border-green-500 bg-green-50'
                : 'border-stone-200 hover:border-green-300'
            }`}
          >
            <ThumbsUp size={24} className={decision === 'accepted' ? 'text-green-600' : 'text-stone-400'} />
            <span className={`font-bold ${decision === 'accepted' ? 'text-green-700' : 'text-stone-600'}`}>Interested</span>
            <span className="text-xs text-stone-500">Wants to interview</span>
          </button>
          <button
            onClick={() => setDecision('rejected')}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              decision === 'rejected'
                ? 'border-red-500 bg-red-50'
                : 'border-stone-200 hover:border-red-300'
            }`}
          >
            <ThumbsDown size={24} className={decision === 'rejected' ? 'text-red-600' : 'text-stone-400'} />
            <span className={`font-bold ${decision === 'rejected' ? 'text-red-700' : 'text-stone-600'}`}>Pass</span>
            <span className="text-xs text-stone-500">Not interested</span>
          </button>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Client Feedback</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback from the client..."
            rows={2}
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Internal Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Your notes about this decision..."
            rows={2}
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button onClick={onClose} className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50">
          Cancel
        </button>
        <button
          onClick={() => decision && onDecision({ decision, notes: notes || undefined, feedback: feedback || undefined })}
          disabled={isLoading || !decision}
          className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 ${
            decision === 'accepted' ? 'bg-green-600 text-white hover:bg-green-700' :
            decision === 'rejected' ? 'bg-red-600 text-white hover:bg-red-700' :
            'bg-charcoal text-white hover:bg-rust'
          }`}
        >
          {isLoading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Check size={14} /> Confirm</>}
        </button>
      </div>
    </ModalWrapper>
  );
};

// Schedule Interview Modal
const ScheduleInterviewModal: React.FC<{
  onClose: () => void;
  onSchedule: (data: {
    interviewType: string;
    scheduledAt: Date;
    durationMinutes: number;
    meetingLink?: string;
    interviewerNames?: string[];
    roundNumber: number;
  }) => void;
  isLoading: boolean;
  interviewProcess?: string;
  existingInterviews: InterviewData[];
}> = ({ onClose, onSchedule, isLoading, interviewProcess, existingInterviews }) => {
  const nextRound = existingInterviews.length + 1;
  const [interviewType, setInterviewType] = useState<string>('technical');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(60);
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewerNames, setInterviewerNames] = useState('');

  return (
    <ModalWrapper onClose={onClose} title="Schedule Interview">
      <p className="text-stone-500 text-sm mb-6">Schedule Round {nextRound} interview</p>

      {interviewProcess && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Interview Process</p>
          <p className="text-sm text-blue-800">{interviewProcess}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Type</label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
            >
              <option value="phone_screen">Phone Screen</option>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="panel">Panel</option>
              <option value="final">Final</option>
              <option value="client">Client Interview</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Date & Time</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Meeting Link</label>
          <input
            type="url"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://zoom.us/j/..."
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Interviewers (comma separated)</label>
          <input
            type="text"
            value={interviewerNames}
            onChange={(e) => setInterviewerNames(e.target.value)}
            placeholder="John Doe, Jane Smith"
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button onClick={onClose} className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50">
          Cancel
        </button>
        <button
          onClick={() => onSchedule({
            interviewType,
            scheduledAt: new Date(scheduledAt),
            durationMinutes: duration,
            meetingLink: meetingLink || undefined,
            interviewerNames: interviewerNames ? interviewerNames.split(',').map(n => n.trim()) : undefined,
            roundNumber: nextRound,
          })}
          disabled={isLoading || !scheduledAt}
          className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 size={14} className="animate-spin" /> Scheduling...</> : <><Calendar size={14} /> Schedule</>}
        </button>
      </div>
    </ModalWrapper>
  );
};

// Reject Modal
const RejectModal: React.FC<{
  onClose: () => void;
  onReject: (reason: string) => void;
  isLoading: boolean;
}> = ({ onClose, onReject, isLoading }) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const reasons = [
    'Not Qualified',
    'Rate Too High',
    'Location Mismatch',
    'Visa Issues',
    'Position Filled',
    'Failed Interview',
    'Other',
  ];

  return (
    <ModalWrapper onClose={onClose} title="Reject Submission">
      <p className="text-stone-500 text-sm mb-6">Select a reason for rejecting this submission</p>

      <div className="space-y-2 mb-4">
        {reasons.map(r => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={`w-full text-left p-3 rounded-xl border transition-all ${
              reason === r ? 'border-red-400 bg-red-50 text-red-700' : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {reason === 'Other' && (
        <textarea
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          placeholder="Enter rejection reason..."
          rows={3}
          className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none mb-4"
        />
      )}

      <div className="flex gap-4">
        <button onClick={onClose} className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50">
          Cancel
        </button>
        <button
          onClick={() => onReject(reason === 'Other' ? customReason : reason)}
          disabled={!reason || (reason === 'Other' && !customReason) || isLoading}
          className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 size={14} className="animate-spin" /> Rejecting...</> : <><XCircle size={14} /> Reject</>}
        </button>
      </div>
    </ModalWrapper>
  );
};

// Withdraw Modal
const WithdrawModal: React.FC<{
  onClose: () => void;
  onWithdraw: (reason: string) => void;
  isLoading: boolean;
}> = ({ onClose, onWithdraw, isLoading }) => {
  const [reason, setReason] = useState('');

  const reasons = [
    'Candidate accepted another offer',
    'Candidate no longer interested',
    'Rate expectations not met',
    'Location/relocation issues',
    'Personal reasons',
    'Other',
  ];

  const [customReason, setCustomReason] = useState('');

  return (
    <ModalWrapper onClose={onClose} title="Withdraw Submission">
      <p className="text-stone-500 text-sm mb-6">Why is this submission being withdrawn?</p>

      <div className="space-y-2 mb-4">
        {reasons.map(r => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={`w-full text-left p-3 rounded-xl border transition-all ${
              reason === r ? 'border-stone-500 bg-stone-100' : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {reason === 'Other' && (
        <textarea
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          placeholder="Enter withdrawal reason..."
          rows={3}
          className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none mb-4"
        />
      )}

      <div className="flex gap-4">
        <button onClick={onClose} className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50">
          Cancel
        </button>
        <button
          onClick={() => onWithdraw(reason === 'Other' ? customReason : reason)}
          disabled={!reason || (reason === 'Other' && !customReason) || isLoading}
          className="flex-1 py-3 bg-stone-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : <><Ban size={14} /> Withdraw</>}
        </button>
      </div>
    </ModalWrapper>
  );
};

// Add Note Modal
const AddNoteModal: React.FC<{
  onClose: () => void;
  onAdd: (data: { subject?: string; body?: string }) => void;
  isLoading: boolean;
}> = ({ onClose, onAdd, isLoading }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  return (
    <ModalWrapper onClose={onClose} title="Add Note">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Note title..."
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Note</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your note..."
            rows={4}
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button onClick={onClose} className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50">
          Cancel
        </button>
        <button
          onClick={() => onAdd({ subject: subject || undefined, body: body || undefined })}
          disabled={!body || isLoading}
          className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : <><Plus size={14} /> Add Note</>}
        </button>
      </div>
    </ModalWrapper>
  );
};

// Add Task Modal
const AddTaskModal: React.FC<{
  onClose: () => void;
  onAdd: (data: { subject: string; body?: string; dueDate: Date; priority?: string; activityType: string }) => void;
  isLoading: boolean;
}> = ({ onClose, onAdd, isLoading }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [activityType, setActivityType] = useState('task');

  return (
    <ModalWrapper onClose={onClose} title="Add Task">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Task Type</label>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
          >
            <option value="task">Task</option>
            <option value="follow_up">Follow Up</option>
            <option value="call">Schedule Call</option>
            <option value="meeting">Schedule Meeting</option>
            <option value="reminder">Reminder</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Title</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Task title..."
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Details (optional)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Additional details..."
            rows={3}
            className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button onClick={onClose} className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50">
          Cancel
        </button>
        <button
          onClick={() => onAdd({
            subject,
            body: body || undefined,
            dueDate: new Date(dueDate),
            priority,
            activityType,
          })}
          disabled={!subject || !dueDate || isLoading}
          className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : <><Plus size={14} /> Add Task</>}
        </button>
      </div>
    </ModalWrapper>
  );
};

// Modal Wrapper Component
const ModalWrapper: React.FC<{
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ onClose, title, children }) => {
  return (
    <div
      className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-stone-400 hover:text-charcoal"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default SubmissionWorkspace;
