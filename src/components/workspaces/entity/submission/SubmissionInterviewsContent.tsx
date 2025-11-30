/**
 * SubmissionInterviewsContent Component
 *
 * Displays interviews for a submission with scheduling and management.
 */

'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  User,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface Interview {
  id: string;
  type: 'phone' | 'video' | 'onsite' | 'technical' | 'final';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  scheduledAt: Date | string;
  duration?: number; // minutes
  interviewers?: string[];
  location?: string | null;
  meetingLink?: string | null;
  notes?: string | null;
  feedback?: string | null;
  result?: 'passed' | 'failed' | 'pending' | null;
}

export interface SubmissionInterviewsContentProps {
  interviews: Interview[];
  onSchedule?: () => void;
  onViewDetails?: (interview: Interview) => void;
  onAddFeedback?: (interview: Interview) => void;
  className?: string;
}

// =====================================================
// CONFIGURATION
// =====================================================

const INTERVIEW_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  phone: { label: 'Phone Screen', icon: Phone, color: 'bg-blue-100 text-blue-700' },
  video: { label: 'Video Call', icon: Video, color: 'bg-purple-100 text-purple-700' },
  onsite: { label: 'On-Site', icon: MapPin, color: 'bg-green-100 text-green-700' },
  technical: { label: 'Technical', icon: User, color: 'bg-orange-100 text-orange-700' },
  final: { label: 'Final Round', icon: Users, color: 'bg-amber-100 text-amber-700' },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Calendar },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-stone-100 text-stone-700', icon: XCircle },
  no_show: { label: 'No Show', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const RESULT_CONFIG: Record<string, { label: string; color: string }> = {
  passed: { label: 'Passed', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
};

// =====================================================
// INTERVIEW CARD
// =====================================================

function InterviewCard({
  interview,
  onViewDetails,
  onAddFeedback,
}: {
  interview: Interview;
  onViewDetails?: () => void;
  onAddFeedback?: () => void;
}) {
  const typeConfig = INTERVIEW_TYPE_CONFIG[interview.type] || INTERVIEW_TYPE_CONFIG.video;
  const statusConfig = STATUS_CONFIG[interview.status] || STATUS_CONFIG.scheduled;
  const resultConfig = interview.result ? RESULT_CONFIG[interview.result] : null;
  const TypeIcon = typeConfig.icon;
  const scheduledDate = new Date(interview.scheduledAt);
  const isPast = scheduledDate < new Date();

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-stone-200 p-4 hover:border-stone-300 transition-all',
        interview.status === 'cancelled' && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              typeConfig.color
            )}
          >
            <TypeIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-charcoal">{typeConfig.label}</p>
            <p className="text-xs text-stone-500">
              {scheduledDate.toLocaleDateString()} at{' '}
              {scheduledDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {interview.duration && ` (${interview.duration} min)`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={cn('text-[10px]', statusConfig.color)}>
            {statusConfig.label}
          </Badge>
          {resultConfig && (
            <Badge variant="secondary" className={cn('text-[10px]', resultConfig.color)}>
              {resultConfig.label}
            </Badge>
          )}
        </div>
      </div>

      {/* Interview Details */}
      <div className="space-y-2 mb-3">
        {interview.interviewers && interview.interviewers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Users className="w-3 h-3" />
            <span>With: {interview.interviewers.join(', ')}</span>
          </div>
        )}
        {interview.location && (
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <MapPin className="w-3 h-3" />
            <span>{interview.location}</span>
          </div>
        )}
        {interview.meetingLink && (
          <a
            href={interview.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
          >
            <Video className="w-3 h-3" />
            <span>Join Meeting</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Notes/Feedback */}
      {interview.notes && (
        <div className="mb-3 p-2 bg-stone-50 rounded-lg">
          <p className="text-xs text-stone-600 line-clamp-2">{interview.notes}</p>
        </div>
      )}

      {interview.feedback && (
        <div className="mb-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-xs text-amber-800 line-clamp-2">
            <strong>Feedback:</strong> {interview.feedback}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onViewDetails && (
          <Button variant="outline" size="sm" className="flex-1" onClick={onViewDetails}>
            View Details
          </Button>
        )}
        {onAddFeedback && interview.status === 'completed' && !interview.feedback && (
          <Button variant="outline" size="sm" className="flex-1" onClick={onAddFeedback}>
            <MessageSquare className="w-3 h-3 mr-1" />
            Add Feedback
          </Button>
        )}
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function SubmissionInterviewsContent({
  interviews,
  onSchedule,
  onViewDetails,
  onAddFeedback,
  className,
}: SubmissionInterviewsContentProps) {
  // Separate upcoming and past interviews
  const now = new Date();
  const upcomingInterviews = interviews
    .filter(
      (i) => new Date(i.scheduledAt) >= now && i.status === 'scheduled'
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  const pastInterviews = interviews
    .filter(
      (i) => new Date(i.scheduledAt) < now || i.status !== 'scheduled'
    )
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );

  // Stats
  const completedCount = interviews.filter((i) => i.status === 'completed').length;
  const passedCount = interviews.filter((i) => i.result === 'passed').length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-charcoal">Interviews</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {interviews.length} total
            </Badge>
            {completedCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                {passedCount}/{completedCount} passed
              </Badge>
            )}
          </div>
        </div>

        {onSchedule && (
          <Button onClick={onSchedule} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        )}
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-3">
            Upcoming
          </h4>
          <div className="space-y-3">
            {upcomingInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onViewDetails={onViewDetails ? () => onViewDetails(interview) : undefined}
                onAddFeedback={onAddFeedback ? () => onAddFeedback(interview) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Interviews */}
      {pastInterviews.length > 0 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-3">
            Past Interviews
          </h4>
          <div className="space-y-3">
            {pastInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onViewDetails={onViewDetails ? () => onViewDetails(interview) : undefined}
                onAddFeedback={onAddFeedback ? () => onAddFeedback(interview) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {interviews.length === 0 && (
        <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
          <Calendar className="w-12 h-12 mx-auto text-stone-300 mb-4" />
          <h3 className="font-bold text-charcoal mb-2">No Interviews Scheduled</h3>
          <p className="text-stone-500 text-sm mb-4">
            Schedule an interview to move this submission forward
          </p>
          {onSchedule && (
            <Button onClick={onSchedule}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule First Interview
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default SubmissionInterviewsContent;
