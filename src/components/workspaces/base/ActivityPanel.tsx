/**
 * ActivityPanel Component
 *
 * Activity composer and timeline for workspace pages
 * Allows logging calls, emails, meetings, notes, tasks, and follow-ups
 */

'use client';

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckSquare,
  Clock,
  Plus,
  Send,
  Paperclip,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  MessageSquare,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import type { RCAIEntityTypeType } from '@/lib/db/schema/workspace';

// =====================================================
// TYPES
// =====================================================

type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'follow_up' | 'linkedin_message';

interface Activity {
  id: string;
  type: ActivityType;
  subject?: string;
  body?: string;
  status: string;
  outcome?: string;
  direction?: 'inbound' | 'outbound';
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  performer?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

interface ActivityPanelProps {
  entityType: RCAIEntityTypeType;
  entityId: string;
  canEdit?: boolean;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

// =====================================================
// CONSTANTS
// =====================================================

const ACTIVITY_TYPES = [
  { id: 'call', label: 'Call', icon: Phone, color: 'text-blue-600 bg-blue-100' },
  { id: 'email', label: 'Email', icon: Mail, color: 'text-green-600 bg-green-100' },
  { id: 'meeting', label: 'Meeting', icon: Calendar, color: 'text-purple-600 bg-purple-100' },
  { id: 'note', label: 'Note', icon: FileText, color: 'text-amber-600 bg-amber-100' },
  { id: 'task', label: 'Task', icon: CheckSquare, color: 'text-cyan-600 bg-cyan-100' },
  { id: 'follow_up', label: 'Follow-up', icon: Clock, color: 'text-orange-600 bg-orange-100' },
  { id: 'linkedin_message', label: 'LinkedIn', icon: MessageSquare, color: 'text-sky-600 bg-sky-100' },
] as const;

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  skipped: 'bg-stone-100 text-stone-500',
  cancelled: 'bg-red-100 text-red-700',
};

const OUTCOME_COLORS: Record<string, string> = {
  positive: 'text-green-600',
  neutral: 'text-stone-500',
  negative: 'text-red-600',
};

// =====================================================
// SUB-COMPONENTS
// =====================================================

function ActivityComposer({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: { type: ActivityType; subject: string; body: string; dueDate?: Date }) => void;
  isSubmitting: boolean;
}) {
  const [selectedType, setSelectedType] = useState<ActivityType>('note');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (!body.trim()) return;

    onSubmit({
      type: selectedType,
      subject: subject.trim() || `${ACTIVITY_TYPES.find(t => t.id === selectedType)?.label} - ${format(new Date(), 'MMM d')}`,
      body: body.trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    // Reset form
    setSubject('');
    setBody('');
    setDueDate('');
    setIsExpanded(false);
  };

  const needsSubject = ['task', 'follow_up', 'meeting'].includes(selectedType);
  const needsDueDate = ['task', 'follow_up'].includes(selectedType);

  return (
    <div className="border-b border-border">
      {/* Activity Type Buttons */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border/50">
        {ACTIVITY_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          return (
            <Button
              key={type.id}
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedType(type.id as ActivityType);
                setIsExpanded(true);
              }}
              className={cn(
                'gap-1.5 text-xs',
                isSelected && type.color
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {type.label}
            </Button>
          );
        })}
      </div>

      {/* Composer Form */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {/* Subject (for tasks, meetings, follow-ups) */}
          {needsSubject && (
            <Input
              placeholder="Subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-sm"
            />
          )}

          {/* Body */}
          <Textarea
            placeholder={`Add a ${selectedType.replace('_', ' ')}...`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="resize-none text-sm"
          />

          {/* Due Date (for tasks, follow-ups) */}
          {needsDueDate && (
            <div className="flex items-center gap-2">
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-sm w-auto"
              />
              <span className="text-xs text-muted-foreground">Due date</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!body.trim() || isSubmitting}
                className="gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Quick Add */}
      {!isExpanded && (
        <div
          className="px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add activity...</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const typeConfig = ACTIVITY_TYPES.find((t) => t.id === activity.type);
  const Icon = typeConfig?.icon || FileText;

  return (
    <div className="flex gap-3 py-3 px-4 hover:bg-stone-50 transition-colors group">
      {/* Icon */}
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', typeConfig?.color || 'bg-stone-100')}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            {activity.subject && (
              <p className="text-sm font-medium">{activity.subject}</p>
            )}
            {activity.body && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {activity.body}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="secondary" className={cn('text-[10px]', STATUS_COLORS[activity.status])}>
              {activity.status.replace('_', ' ')}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Mark Complete</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          {activity.performer && (
            <div className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarImage src={activity.performer.avatarUrl} />
                <AvatarFallback className="text-[8px]">
                  {activity.performer.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{activity.performer.name}</span>
            </div>
          )}
          <span>{formatDistanceToNow(activity.createdAt, { addSuffix: true })}</span>
          {activity.outcome && (
            <span className={OUTCOME_COLORS[activity.outcome]}>
              {activity.outcome}
            </span>
          )}
          {activity.direction && (
            <span className="text-muted-foreground">
              {activity.direction === 'inbound' ? '← Inbound' : '→ Outbound'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function ActivityPanel({
  entityType,
  entityId,
  canEdit = true,
  className,
  collapsed = false,
  onToggleCollapse,
}: ActivityPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');

  // Fetch activities
  const { data: activitiesData, isLoading, refetch } = trpc.activities.list.useQuery(
    {
      entityType: entityType as 'lead' | 'deal' | 'account' | 'candidate' | 'submission' | 'job' | 'poc',
      entityId,
      activityTypes: filter === 'all' ? undefined : [filter],
      limit: 20,
    },
    { enabled: !!entityType && !!entityId }
  );

  // Create activity mutation
  const createActivity = trpc.activities.create.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleSubmit = async (data: {
    type: ActivityType;
    subject: string;
    body: string;
    dueDate?: Date;
  }) => {
    await createActivity.mutateAsync({
      entityType: entityType as 'lead' | 'deal' | 'account' | 'candidate' | 'submission' | 'job' | 'poc',
      entityId,
      activityType: data.type,
      subject: data.subject,
      body: data.body,
      dueDate: data.dueDate || new Date(),
      status: data.dueDate ? 'scheduled' : 'completed',
    });
  };

  const activities: Activity[] = (activitiesData || []).map((a) => ({
    id: a.id,
    type: a.activityType as ActivityType,
    subject: a.subject || undefined,
    body: a.body || undefined,
    status: a.status,
    outcome: a.outcome || undefined,
    direction: a.direction as 'inbound' | 'outbound' | undefined,
    dueDate: a.dueDate ? new Date(a.dueDate) : undefined,
    completedAt: a.completedAt ? new Date(a.completedAt) : undefined,
    createdAt: new Date(a.createdAt),
    assignee: undefined, // TODO: Need to join assignee data in router
    performer: undefined, // TODO: Need to join performer data in router
  }));

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggleCollapse?.();
  };

  return (
    <div className={cn('bg-background', className)}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Activity</span>
          <Badge variant="secondary" className="text-xs">
            {activitiesData?.length || 0}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <Select
              value={filter}
              onValueChange={(v) => setFilter(v as ActivityType | 'all')}
            >
              <SelectTrigger className="h-7 w-[100px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6">
            {isCollapsed ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <>
          {/* Composer */}
          {canEdit && (
            <ActivityComposer
              onSubmit={handleSubmit}
              isSubmitting={createActivity.isPending}
            />
          )}

          {/* Activity List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No activities yet. Add one above!
              </div>
            ) : (
              activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ActivityPanel;
