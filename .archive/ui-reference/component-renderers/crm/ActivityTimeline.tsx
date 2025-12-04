'use client';

import React from 'react';
import {
  Mail, Phone, Calendar, FileText, Linkedin, Clock, ArrowRight,
  Loader2, CheckCircle, XCircle, AlertCircle, CircleDashed, Play, SkipForward,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow, format, isPast, isToday } from 'date-fns';
import type { Activity, ActivityStatus } from '@/lib/db/schema/activities';

interface ActivityTimelineProps {
  activities: Activity[];
  isLoading?: boolean;
  onCompleteActivity?: (activityId: string) => void;
  onSkipActivity?: (activityId: string) => void;
}

const ACTIVITY_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; color: string }> = {
  email: { icon: Mail, label: 'Email', color: 'bg-blue-100 text-blue-600' },
  call: { icon: Phone, label: 'Call', color: 'bg-green-100 text-green-600' },
  meeting: { icon: Calendar, label: 'Meeting', color: 'bg-purple-100 text-purple-600' },
  linkedin_message: { icon: Linkedin, label: 'LinkedIn', color: 'bg-sky-100 text-sky-600' },
  note: { icon: FileText, label: 'Note', color: 'bg-stone-100 text-stone-600' },
  task: { icon: CheckCircle, label: 'Task', color: 'bg-amber-100 text-amber-600' },
  follow_up: { icon: ArrowRight, label: 'Follow-up', color: 'bg-rust/10 text-rust' },
  reminder: { icon: AlertCircle, label: 'Reminder', color: 'bg-orange-100 text-orange-600' },
};

const STATUS_CONFIG: Record<ActivityStatus, { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; color: string; bgColor: string }> = {
  scheduled: { icon: Clock, label: 'Scheduled', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  open: { icon: CircleDashed, label: 'Open', color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200' },
  in_progress: { icon: Play, label: 'In Progress', color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  skipped: { icon: SkipForward, label: 'Skipped', color: 'text-stone-400', bgColor: 'bg-stone-50 border-stone-200' },
  cancelled: { icon: XCircle, label: 'Cancelled', color: 'text-red-400', bgColor: 'bg-red-50 border-red-200' },
};

const OUTCOME_CONFIG: Record<string, { label: string; color: string }> = {
  positive: { label: 'Positive', color: 'bg-green-50 text-green-600 border-green-200' },
  neutral: { label: 'Neutral', color: 'bg-stone-50 text-stone-600 border-stone-200' },
  negative: { label: 'Negative', color: 'bg-red-50 text-red-600 border-red-200' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-stone-400' },
  medium: { label: 'Medium', color: 'text-blue-500' },
  high: { label: 'High', color: 'text-amber-500' },
  urgent: { label: 'Urgent', color: 'text-red-500' },
};

export function ActivityTimeline({ activities, isLoading, onCompleteActivity, onSkipActivity }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-rust" size={32} />
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-8">
        <div className="text-center py-8 text-stone-400">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium">No activities yet</p>
          <p className="text-sm mt-2">Log an activity to start tracking interactions.</p>
        </div>
      </div>
    );
  }

  // Separate pending and completed activities
  const pendingActivities = activities.filter(a => 
    ['scheduled', 'open', 'in_progress'].includes(a.status)
  );
  const completedActivities = activities.filter(a => 
    ['completed', 'skipped', 'cancelled'].includes(a.status)
  );

  const renderActivity = (activity: Activity, showActions = false) => {
    const config = ACTIVITY_CONFIG[activity.activityType] || ACTIVITY_CONFIG.note;
    const statusConfig = STATUS_CONFIG[activity.status as ActivityStatus];
    const Icon = config.icon;
    const StatusIcon = statusConfig?.icon || CircleDashed;
    const outcomeConfig = activity.outcome ? OUTCOME_CONFIG[activity.outcome] : null;
    const priorityConfig = activity.priority ? PRIORITY_CONFIG[activity.priority] : null;
    
    const isOverdue = activity.dueDate && isPast(new Date(activity.dueDate)) && 
      ['scheduled', 'open', 'in_progress'].includes(activity.status);
    const isDueToday = activity.dueDate && isToday(new Date(activity.dueDate));
    
    return (
      <div 
        key={activity.id} 
        className={`p-6 hover:bg-stone-50/50 transition-colors ${
          isOverdue ? 'bg-red-50/30' : ''
        }`}
      >
        <div className="flex gap-4">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
            <Icon size={18} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-charcoal">{config.label}</span>
                  
                  {/* Status Badge */}
                  {statusConfig && (
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.color}`}>
                      <StatusIcon size={10} />
                      {statusConfig.label}
                    </span>
                  )}
                  
                  {/* Priority Badge (for pending activities) */}
                  {priorityConfig && ['scheduled', 'open', 'in_progress'].includes(activity.status) && activity.priority !== 'medium' && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityConfig.color}`}>
                      {priorityConfig.label}
                    </span>
                  )}
                  
                  {activity.direction && (
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded text-[10px] font-bold uppercase">
                      {activity.direction}
                    </span>
                  )}
                  
                  {outcomeConfig && (
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${outcomeConfig.color}`}>
                      {outcomeConfig.label}
                    </span>
                  )}
                  
                  {/* Overdue indicator */}
                  {isOverdue && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 border border-red-200 rounded text-[10px] font-bold uppercase">
                      Overdue
                    </span>
                  )}
                  
                  {/* Due today indicator */}
                  {isDueToday && !isOverdue && ['scheduled', 'open', 'in_progress'].includes(activity.status) && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 border border-amber-200 rounded text-[10px] font-bold uppercase">
                      Due Today
                    </span>
                  )}
                </div>
                
                {activity.subject && (
                  <p className="text-sm font-medium text-charcoal mt-1">{activity.subject}</p>
                )}
              </div>
              
              {/* Time */}
              <div className="text-xs text-stone-400 whitespace-nowrap flex flex-col items-end gap-1">
                {activity.completedAt ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-500" />
                    {formatDistanceToNow(new Date(activity.completedAt), { addSuffix: true })}
                  </span>
                ) : activity.dueDate ? (
                  <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                    <Clock size={12} />
                    Due {format(new Date(activity.dueDate), 'MMM d, h:mm a')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            {activity.body && (
              <p className="text-sm text-stone-600 whitespace-pre-wrap line-clamp-3">{activity.body}</p>
            )}

            {/* Metadata + Actions */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-xs text-stone-400">
                {activity.durationMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {activity.durationMinutes} min
                  </span>
                )}
                {activity.parentActivityId && (
                  <span className="flex items-center gap-1 text-blue-500">
                    <ChevronRight size={12} /> Follow-up
                  </span>
                )}
              </div>
              
              {/* Quick Actions for pending activities */}
              {showActions && ['scheduled', 'open', 'in_progress'].includes(activity.status) && (
                <div className="flex items-center gap-2">
                  {onCompleteActivity && (
                    <button
                      onClick={() => onCompleteActivity(activity.id)}
                      className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold uppercase hover:bg-green-100 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle size={12} /> Complete
                    </button>
                  )}
                  {onSkipActivity && (
                    <button
                      onClick={() => onSkipActivity(activity.id)}
                      className="px-3 py-1.5 bg-stone-50 text-stone-500 rounded-lg text-xs font-bold uppercase hover:bg-stone-100 transition-colors flex items-center gap-1"
                    >
                      <SkipForward size={12} /> Skip
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Pending Activities Section */}
      {pendingActivities.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/50">
            <h3 className="text-sm font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
              <AlertCircle size={16} />
              Pending Activities ({pendingActivities.length})
            </h3>
          </div>
          <div className="divide-y divide-stone-100">
            {pendingActivities.map((activity) => renderActivity(activity, true))}
          </div>
        </div>
      )}

      {/* Completed Activities Section */}
      <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">
            Activity Timeline
          </h3>
        </div>

        <div className="divide-y divide-stone-100 activity-timeline">
          {completedActivities.length > 0 ? (
            completedActivities.map((activity) => renderActivity(activity, false))
          ) : (
            <div className="p-6 text-center text-stone-400 text-sm">
              No completed activities yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
