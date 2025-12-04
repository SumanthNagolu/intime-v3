'use client';

/**
 * Check-In Progress Tracker Widget
 *
 * Displays weekly check-in progress with status indicators,
 * timeline view, and quick add functionality.
 */

import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Plus,
  MessageSquare,
  ChevronRight,
  FileText,
  User,
  Edit,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface CheckIn {
  id: string;
  type: '30-day' | '60-day' | '90-day' | 'weekly' | 'monthly';
  status: 'completed' | 'pending' | 'overdue' | 'scheduled';
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
  completedBy?: string;
  rating?: number;
}

const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle,
    color: 'text-success-500',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-200',
    label: 'Completed',
  },
  pending: {
    icon: Clock,
    color: 'text-gold-500',
    bgColor: 'bg-gold-50',
    borderColor: 'border-gold-200',
    label: 'Pending',
  },
  overdue: {
    icon: AlertTriangle,
    color: 'text-error-500',
    bgColor: 'bg-error-50',
    borderColor: 'border-error-200',
    label: 'Overdue',
  },
  scheduled: {
    icon: Calendar,
    color: 'text-info-500',
    bgColor: 'bg-info-50',
    borderColor: 'border-info-200',
    label: 'Scheduled',
  },
};

interface CheckInCardProps {
  checkIn: CheckIn;
  onEdit?: (id: string) => void;
  onComplete?: (id: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function CheckInCard({ checkIn, onEdit, onComplete }: CheckInCardProps) {
  const config = STATUS_CONFIG[checkIn.status];
  const StatusIcon = config.icon;

  const typeLabels = {
    '30-day': '30 Day',
    '60-day': '60 Day',
    '90-day': '90 Day',
    'weekly': 'Weekly',
    'monthly': 'Monthly',
  };

  return (
    <div className={cn(
      'border rounded-lg p-4 transition-all hover:shadow-sm',
      config.borderColor,
      config.bgColor
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', config.bgColor)}>
            <StatusIcon className={cn('w-5 h-5', config.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-charcoal-900">
                {typeLabels[checkIn.type]} Check-In
              </h4>
              <span className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                config.bgColor,
                config.color
              )}>
                {config.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-charcoal-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {checkIn.status === 'completed' && checkIn.completedDate
                  ? `Completed ${formatDate(checkIn.completedDate)}`
                  : `Scheduled ${formatDate(checkIn.scheduledDate)}`}
              </span>
              {checkIn.completedBy && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {checkIn.completedBy}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {checkIn.status === 'pending' || checkIn.status === 'overdue' ? (
            <Button
              size="sm"
              onClick={() => onComplete?.(checkIn.id)}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
          ) : (
            <button
              onClick={() => onEdit?.(checkIn.id)}
              className="p-1.5 rounded hover:bg-white/50 transition-colors"
            >
              <Edit className="w-4 h-4 text-charcoal-500" />
            </button>
          )}
        </div>
      </div>

      {/* Notes */}
      {checkIn.notes && (
        <div className="mt-3 pt-3 border-t border-charcoal-100">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-charcoal-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-charcoal-600">{checkIn.notes}</p>
          </div>
        </div>
      )}

      {/* Rating */}
      {checkIn.rating !== undefined && (
        <div className="mt-3 pt-3 border-t border-charcoal-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-charcoal-500">Satisfaction:</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className={cn(
                    'w-4 h-4 rounded-full',
                    star <= checkIn.rating! ? 'bg-gold-400' : 'bg-charcoal-200'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TimelineViewProps {
  checkIns: CheckIn[];
  milestones: string[];
}

function TimelineView({ checkIns, milestones }: TimelineViewProps) {
  return (
    <div className="flex items-center gap-2 p-4 bg-charcoal-25 rounded-lg overflow-x-auto">
      {milestones.map((milestone, index) => {
        const checkIn = checkIns.find(c => c.type === milestone);
        const status = checkIn?.status || 'scheduled';
        const config = STATUS_CONFIG[status];
        const StatusIcon = config.icon;

        return (
          <React.Fragment key={milestone}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                config.bgColor
              )}>
                <StatusIcon className={cn('w-5 h-5', config.color)} />
              </div>
              <span className="text-xs font-medium text-charcoal-700 mt-2 whitespace-nowrap">
                {milestone}
              </span>
              <span className={cn('text-[10px] mt-0.5', config.color)}>
                {config.label}
              </span>
            </div>
            {index < milestones.length - 1 && (
              <div className="flex-1 min-w-8 h-0.5 bg-charcoal-200 mx-1" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Mock data
const MOCK_CHECK_INS: CheckIn[] = [
  {
    id: '1',
    type: '30-day',
    status: 'completed',
    scheduledDate: '2024-02-01',
    completedDate: '2024-02-01',
    completedBy: 'Sarah Manager',
    notes: 'Great start! Consultant is adapting well to the client environment.',
    rating: 5,
  },
  {
    id: '2',
    type: '60-day',
    status: 'pending',
    scheduledDate: '2024-03-01',
    notes: 'Schedule with client manager',
  },
  {
    id: '3',
    type: '90-day',
    status: 'scheduled',
    scheduledDate: '2024-04-01',
  },
];

export function CheckInProgressTracker({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const [showAddModal, setShowAddModal] = useState(false);

  const props = definition.componentProps as {
    checkIns?: string[];
    showTimeline?: boolean;
  } | undefined;

  const milestones = props?.checkIns || ['30-day', '60-day', '90-day'];
  const showTimeline = props?.showTimeline ?? true;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-stone-100 rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-stone-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Get check-ins from data or use mock data
  const checkIns = (data as { checkIns?: CheckIn[] })?.checkIns || MOCK_CHECK_INS;

  const handleComplete = (id: string) => {
    console.log('Complete check-in:', id);
  };

  const handleEdit = (id: string) => {
    console.log('Edit check-in:', id);
  };

  // Stats
  const completedCount = checkIns.filter(c => c.status === 'completed').length;
  const overdueCount = checkIns.filter(c => c.status === 'overdue').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-charcoal-700">
            {completedCount}/{checkIns.length} completed
          </span>
          {overdueCount > 0 && (
            <span className="text-sm text-error-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {overdueCount} overdue
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Record Check-In
        </Button>
      </div>

      {/* Timeline Progress */}
      {showTimeline && (
        <TimelineView checkIns={checkIns} milestones={milestones} />
      )}

      {/* Check-in Cards */}
      <div className="space-y-3">
        {checkIns.length > 0 ? (
          checkIns.map(checkIn => (
            <CheckInCard
              key={checkIn.id}
              checkIn={checkIn}
              onComplete={handleComplete}
              onEdit={handleEdit}
            />
          ))
        ) : (
          <div className="py-8 text-center border border-dashed border-charcoal-200 rounded-lg">
            <FileText className="w-8 h-8 mx-auto mb-2 text-charcoal-300" />
            <p className="text-sm text-charcoal-500">No check-ins recorded</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Record First Check-In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckInProgressTracker;
