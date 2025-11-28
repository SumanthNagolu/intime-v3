'use client';

import React from 'react';
import { Mail, Phone, Calendar, FileText, Linkedin, User, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Activity {
  id: string;
  activityType: string;
  subject?: string | null;
  body?: string | null;
  direction?: string | null;
  outcome?: string | null;
  nextAction?: string | null;
  nextActionDate?: Date | null;
  durationMinutes?: number | null;
  activityDate: Date;
  performedBy?: string | null;
}

interface ActivityTimelineProps {
  activities: Activity[];
  isLoading?: boolean;
}

const ACTIVITY_CONFIG: Record<string, { icon: React.ComponentType<any>; label: string; color: string }> = {
  email: { icon: Mail, label: 'Email', color: 'bg-blue-100 text-blue-600' },
  call: { icon: Phone, label: 'Call', color: 'bg-green-100 text-green-600' },
  meeting: { icon: Calendar, label: 'Meeting', color: 'bg-purple-100 text-purple-600' },
  linkedin_message: { icon: Linkedin, label: 'LinkedIn', color: 'bg-sky-100 text-sky-600' },
  note: { icon: FileText, label: 'Note', color: 'bg-stone-100 text-stone-600' },
};

const OUTCOME_CONFIG: Record<string, { label: string; color: string }> = {
  positive: { label: 'Positive', color: 'bg-green-50 text-green-600' },
  neutral: { label: 'Neutral', color: 'bg-stone-50 text-stone-600' },
  negative: { label: 'Negative', color: 'bg-red-50 text-red-600' },
};

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
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

  return (
    <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100">
        <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">
          Activity Timeline
        </h3>
      </div>

      <div className="divide-y divide-stone-100 activity-timeline">
        {activities.map((activity, index) => {
          const config = ACTIVITY_CONFIG[activity.activityType] || ACTIVITY_CONFIG.note;
          const Icon = config.icon;
          const outcomeConfig = activity.outcome ? OUTCOME_CONFIG[activity.outcome] : null;

          return (
            <div key={activity.id} className="p-6 hover:bg-stone-50/50 transition-colors">
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
                        {activity.direction && (
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded text-[10px] font-bold uppercase">
                            {activity.direction}
                          </span>
                        )}
                        {outcomeConfig && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${outcomeConfig.color}`}>
                            {outcomeConfig.label}
                          </span>
                        )}
                      </div>
                      {activity.subject && (
                        <p className="text-sm font-medium text-charcoal mt-1">{activity.subject}</p>
                      )}
                    </div>
                    <div className="text-xs text-stone-400 whitespace-nowrap flex items-center gap-1">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(activity.activityDate), { addSuffix: true })}
                    </div>
                  </div>

                  {/* Body */}
                  {activity.body && (
                    <p className="text-sm text-stone-600 whitespace-pre-wrap">{activity.body}</p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-stone-400">
                    {activity.durationMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {activity.durationMinutes} min
                      </span>
                    )}
                    {activity.nextAction && (
                      <span className="flex items-center gap-1 text-rust">
                        <ArrowRight size={12} /> {activity.nextAction}
                        {activity.nextActionDate && (
                          <span className="text-stone-400">
                            (due {format(new Date(activity.nextActionDate), 'MMM d')})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
