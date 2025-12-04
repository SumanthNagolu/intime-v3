'use client';

/**
 * Kanban Board Widget
 *
 * Displays a drag-and-drop kanban board for submissions pipeline.
 * Supports filtering, status updates, and navigation to detail views.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { GripVertical, User, Building2, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';
import { trpc } from '@/lib/trpc/client';
import { formatDistanceToNow } from 'date-fns';

// ==========================================
// TYPES
// ==========================================

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color: string;
  wipLimit?: number;
}

interface SubmissionCard {
  id: string;
  status: string;
  priority: string | null;
  candidateName: string;
  candidateAvatar: string | null;
  jobTitle: string;
  accountName: string | null;
  updatedAt: string | Date;
  slaStatus?: 'met' | 'at_risk' | 'breached';
  overdueActivitiesCount?: number;
}

interface KanbanData {
  columns: KanbanColumn[];
  submissions: SubmissionCard[];
}

interface KanbanBoardConfig {
  entityType: string;
  statusField: string;
  columns: KanbanColumn[];
  cardTemplate: {
    title: { type: string; path: string };
    subtitle: { type: string; path: string };
    fields: Array<{ path: string; icon: string; type?: string }>;
    badges: Array<{ type: string; path: string; visible?: Record<string, unknown> }>;
    avatar: { type: string; path: string };
  };
  dragEnabled: boolean;
  onDragEnd: string;
  onCardClick: string;
}

// ==========================================
// DEFAULT COLUMNS
// ==========================================

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'sourced', title: 'Sourced', status: 'sourced', color: 'stone' },
  { id: 'submitted', title: 'Submitted', status: 'submitted', color: 'blue', wipLimit: 15 },
  { id: 'client_review', title: 'Client Review', status: 'client_review', color: 'purple', wipLimit: 10 },
  { id: 'interview_scheduled', title: 'Interview Scheduled', status: 'interview_scheduled', color: 'indigo', wipLimit: 8 },
  { id: 'interview_completed', title: 'Interview Completed', status: 'interview_completed', color: 'cyan', wipLimit: 5 },
  { id: 'offer_pending', title: 'Offer Pending', status: 'offer_pending', color: 'amber', wipLimit: 5 },
  { id: 'placed', title: 'Placed', status: 'placed', color: 'green' },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  stone: { bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-700', dot: 'bg-stone-400' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-400' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-400' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', dot: 'bg-cyan-400' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-400' },
};

// ==========================================
// SUBMISSION CARD COMPONENT
// ==========================================

interface SubmissionCardProps {
  submission: SubmissionCard;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, submission: SubmissionCard) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onClick?: (submission: SubmissionCard) => void;
}

function SubmissionCardItem({
  submission,
  isDragging,
  onDragStart,
  onDragEnd,
  onClick
}: SubmissionCardProps) {
  const initials = submission.candidateName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const timeAgo = formatDistanceToNow(new Date(submission.updatedAt), { addSuffix: true });

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, submission)}
      onDragEnd={onDragEnd}
      onClick={() => onClick?.(submission)}
      className={cn(
        "bg-white rounded-lg border border-stone-200 p-3 cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-stone-300 group",
        isDragging && "opacity-50 shadow-lg rotate-2"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Avatar */}
        <Avatar className="h-9 w-9 shrink-0">
          {submission.candidateAvatar && (
            <AvatarImage src={submission.candidateAvatar} alt={submission.candidateName} />
          )}
          <AvatarFallback className="text-xs bg-stone-100 text-stone-600">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-stone-900 truncate">
            {submission.candidateName}
          </h4>
          <p className="text-xs text-stone-500 truncate">
            {submission.jobTitle}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-2 mt-2 text-xs text-stone-400">
            {submission.accountName && (
              <span className="flex items-center gap-1 truncate">
                <Building2 className="w-3 h-3" />
                {submission.accountName}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1 mt-2">
            {submission.priority && ['urgent', 'high'].includes(submission.priority) && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs h-5",
                  submission.priority === 'urgent'
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-amber-300 bg-amber-50 text-amber-700"
                )}
              >
                {submission.priority}
              </Badge>
            )}
            {submission.slaStatus && submission.slaStatus !== 'met' && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs h-5",
                  submission.slaStatus === 'breached'
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-amber-300 bg-amber-50 text-amber-700"
                )}
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                SLA {submission.slaStatus.replace('_', ' ')}
              </Badge>
            )}
            {submission.overdueActivitiesCount && submission.overdueActivitiesCount > 0 && (
              <Badge variant="outline" className="text-xs h-5 border-red-300 bg-red-50 text-red-700">
                {submission.overdueActivitiesCount} overdue
              </Badge>
            )}
          </div>
        </div>

        {/* Action indicator */}
        <ChevronRight className="w-4 h-4 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

// ==========================================
// KANBAN COLUMN COMPONENT
// ==========================================

interface KanbanColumnProps {
  column: KanbanColumn;
  submissions: SubmissionCard[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnStatus: string) => void;
  onCardDragStart: (e: React.DragEvent, submission: SubmissionCard) => void;
  onCardDragEnd: (e: React.DragEvent) => void;
  onCardClick: (submission: SubmissionCard) => void;
  draggingId: string | null;
}

function KanbanColumnComponent({
  column,
  submissions,
  onDragOver,
  onDrop,
  onCardDragStart,
  onCardDragEnd,
  onCardClick,
  draggingId,
}: KanbanColumnProps) {
  const colors = COLOR_MAP[column.color] || COLOR_MAP.stone;
  const isOverWip = column.wipLimit && submissions.length > column.wipLimit;

  return (
    <div
      className={cn(
        "flex-shrink-0 w-72 flex flex-col rounded-lg",
        colors.bg
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.status)}
    >
      {/* Column Header */}
      <div className={cn(
        "flex items-center justify-between p-3 border-b",
        colors.border
      )}>
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", colors.dot)} />
          <span className={cn("text-sm font-semibold", colors.text)}>
            {column.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            isOverWip ? "bg-red-100 text-red-700" : "bg-white/60 text-stone-600"
          )}>
            {submissions.length}
            {column.wipLimit && `/${column.wipLimit}`}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[200px]">
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-sm">
            No submissions
          </div>
        ) : (
          submissions.map((submission) => (
            <SubmissionCardItem
              key={submission.id}
              submission={submission}
              isDragging={draggingId === submission.id}
              onDragStart={onCardDragStart}
              onDragEnd={onCardDragEnd}
              onClick={onCardClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ==========================================
// MAIN KANBAN BOARD WIDGET
// ==========================================

export function KanbanBoard({ definition, data, context }: SectionWidgetProps) {
  const router = useRouter();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Get config from componentProps
  const componentProps = definition.componentProps as KanbanBoardConfig | undefined;
  const columns = componentProps?.columns || DEFAULT_COLUMNS;

  // Fetch submissions data via tRPC
  const { data: submissionsData, isLoading, refetch } = trpc.ats.submissions.listForPipeline.useQuery({
    ownership: 'my_team',
  });

  // Status update mutation
  const updateStatusMutation = trpc.ats.submissions.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Use submissions data directly (already in correct format from tRPC)
  const submissions = useMemo<SubmissionCard[]>(() => {
    if (!submissionsData) return [];
    return submissionsData as SubmissionCard[];
  }, [submissionsData]);

  // Group submissions by status
  const submissionsByStatus = useMemo(() => {
    const grouped: Record<string, SubmissionCard[]> = {};
    columns.forEach((col) => {
      grouped[col.status] = submissions.filter((s) => s.status === col.status);
    });
    return grouped;
  }, [submissions, columns]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, submission: SubmissionCard) => {
    e.dataTransfer.setData('text/plain', submission.id);
    e.dataTransfer.setData('application/json', JSON.stringify(submission));
    setDraggingId(submission.id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const submissionId = e.dataTransfer.getData('text/plain');
    const submissionData = e.dataTransfer.getData('application/json');

    if (submissionId && submissionData) {
      const submission = JSON.parse(submissionData) as SubmissionCard;
      if (submission.status !== newStatus) {
        // Call mutation to update status
        updateStatusMutation.mutate({
          id: submissionId,
          status: newStatus,
        });
      }
    }
    setDraggingId(null);
  }, [updateStatusMutation]);

  const handleCardClick = useCallback((submission: SubmissionCard) => {
    router.push(`/employee/recruiting/submissions/${submission.id}`);
  }, [router]);

  // Loading state
  if (isLoading || context?.isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.slice(0, 5).map((col) => (
          <div
            key={col.id}
            className="flex-shrink-0 w-72 rounded-lg bg-stone-100 animate-pulse"
          >
            <div className="p-3 border-b border-stone-200">
              <div className="h-5 w-24 bg-stone-200 rounded" />
            </div>
            <div className="p-2 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-stone-200 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (context?.error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Failed to load pipeline</p>
            <p className="text-sm text-red-500">{context.error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <KanbanColumnComponent
          key={column.id}
          column={column}
          submissions={submissionsByStatus[column.status] || []}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onCardDragStart={handleDragStart}
          onCardDragEnd={handleDragEnd}
          onCardClick={handleCardClick}
          draggingId={draggingId}
        />
      ))}
    </div>
  );
}

export default KanbanBoard;
