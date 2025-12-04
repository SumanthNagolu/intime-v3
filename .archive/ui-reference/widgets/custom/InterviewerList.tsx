'use client';

/**
 * Interviewer List Widget
 *
 * Displays a list of assigned interviewers with contact actions
 * and feedback status indicators.
 */

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  X,
  Send,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface Interviewer {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  feedbackStatus: 'pending' | 'submitted' | 'overdue';
  scheduledTime?: string;
  avatarUrl?: string;
}

const FEEDBACK_STATUS = {
  pending: { icon: Clock, color: 'text-gold-500 bg-gold-50', label: 'Pending' },
  submitted: { icon: CheckCircle, color: 'text-success-500 bg-success-50', label: 'Submitted' },
  overdue: { icon: AlertCircle, color: 'text-error-500 bg-error-50', label: 'Overdue' },
};

interface InterviewerCardProps {
  interviewer: Interviewer;
  showContactActions?: boolean;
  onRemove?: (id: string) => void;
  onSendReminder?: (id: string) => void;
}

function InterviewerCard({ interviewer, showContactActions, onRemove, onSendReminder }: InterviewerCardProps) {
  const status = FEEDBACK_STATUS[interviewer.feedbackStatus];
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-white border border-charcoal-100 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center flex-shrink-0">
          {interviewer.avatarUrl ? (
            <img
              src={interviewer.avatarUrl}
              alt={interviewer.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-forest-700">
              {interviewer.name.split(' ').map(n => n[0]).join('')}
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="font-medium text-charcoal-900">{interviewer.name}</p>
          <p className="text-sm text-charcoal-500">{interviewer.role} • {interviewer.department}</p>
          {interviewer.scheduledTime && (
            <div className="flex items-center gap-1 mt-1 text-xs text-charcoal-400">
              <Calendar className="w-3 h-3" />
              <span>{interviewer.scheduledTime}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Feedback Status */}
        <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium', status.color)}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{status.label}</span>
        </div>

        {/* Contact Actions */}
        {showContactActions && (
          <div className="flex items-center gap-1">
            <a
              href={`mailto:${interviewer.email}`}
              className="p-1.5 rounded hover:bg-charcoal-50 transition-colors"
              title="Send email"
            >
              <Mail className="w-4 h-4 text-charcoal-500" />
            </a>
            <button
              className="p-1.5 rounded hover:bg-charcoal-50 transition-colors"
              title="Send message"
            >
              <MessageSquare className="w-4 h-4 text-charcoal-500" />
            </button>
            {interviewer.feedbackStatus === 'overdue' && (
              <button
                onClick={() => onSendReminder?.(interviewer.id)}
                className="p-1.5 rounded hover:bg-gold-50 transition-colors"
                title="Send reminder"
              >
                <Send className="w-4 h-4 text-gold-500" />
              </button>
            )}
          </div>
        )}

        {/* Remove Button */}
        {onRemove && (
          <button
            onClick={() => onRemove(interviewer.id)}
            className="p-1.5 rounded hover:bg-error-50 transition-colors"
            title="Remove interviewer"
          >
            <X className="w-4 h-4 text-charcoal-400 hover:text-error-500" />
          </button>
        )}
      </div>
    </div>
  );
}

// Mock data
const MOCK_INTERVIEWERS: Interviewer[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'Engineering Manager', department: 'Engineering', feedbackStatus: 'submitted', scheduledTime: 'Jan 15, 2:00 PM' },
  { id: '2', name: 'Mike Johnson', email: 'mike.johnson@company.com', role: 'Senior Developer', department: 'Engineering', feedbackStatus: 'pending', scheduledTime: 'Jan 15, 3:00 PM' },
  { id: '3', name: 'Emily Davis', email: 'emily.davis@company.com', role: 'Tech Lead', department: 'Engineering', feedbackStatus: 'overdue', scheduledTime: 'Jan 14, 10:00 AM' },
];

export function InterviewerList({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const [showAddModal, setShowAddModal] = useState(false);

  const props = definition.componentProps as {
    namesPath?: string;
    emailsPath?: string;
    showContactActions?: boolean;
  } | undefined;

  const showContactActions = props?.showContactActions ?? true;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-stone-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  // Get interviewers from data or use mock data
  const interviewers = (data as { interviewers?: Interviewer[] })?.interviewers || MOCK_INTERVIEWERS;

  const handleRemove = (id: string) => {
    console.log('Remove interviewer:', id);
  };

  const handleSendReminder = (id: string) => {
    console.log('Send reminder to:', id);
  };

  const submittedCount = interviewers.filter(i => i.feedbackStatus === 'submitted').length;
  const overdueCount = interviewers.filter(i => i.feedbackStatus === 'overdue').length;

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-charcoal-500">
            {interviewers.length} interviewers
          </span>
          <span className="text-sm text-success-600">
            {submittedCount} feedback submitted
          </span>
          {overdueCount > 0 && (
            <span className="text-sm text-error-600">
              {overdueCount} overdue
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Interviewer
        </Button>
      </div>

      {/* Interviewer List */}
      <div className="space-y-2">
        {interviewers.length > 0 ? (
          interviewers.map(interviewer => (
            <InterviewerCard
              key={interviewer.id}
              interviewer={interviewer}
              showContactActions={showContactActions}
              onRemove={handleRemove}
              onSendReminder={handleSendReminder}
            />
          ))
        ) : (
          <div className="py-8 text-center border border-dashed border-charcoal-200 rounded-lg">
            <User className="w-8 h-8 mx-auto mb-2 text-charcoal-300" />
            <p className="text-sm text-charcoal-500">No interviewers assigned</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Interviewer
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {overdueCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-error-50 rounded-lg border border-error-100">
          <div className="flex items-center gap-2 text-sm text-error-700">
            <AlertCircle className="w-4 h-4" />
            <span>{overdueCount} interviewer(s) have overdue feedback</span>
          </div>
          <Button size="sm" variant="outline" className="border-error-200 text-error-700 hover:bg-error-100">
            <Send className="w-4 h-4 mr-1" />
            Send Reminders
          </Button>
        </div>
      )}
    </div>
  );
}

export default InterviewerList;
