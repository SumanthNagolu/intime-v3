'use client';

import * as React from 'react';
import {
  Briefcase,
  MapPin,
  Building2,
  Users,
  Send,
  Calendar,
  AlertCircle,
  Copy,
  Eye,
  Monitor,
  Home,
  Building,
  MoreHorizontal,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EntityCardProps, JobData, CardAction } from '../types';
import { formatRate } from '../types';

const STATUS_CONFIG: Record<JobData['status'], { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  active: { label: 'Active', className: 'bg-green-100 text-green-700' },
  on_hold: { label: 'On Hold', className: 'bg-yellow-100 text-yellow-700' },
  filled: { label: 'Filled', className: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-700' },
};

const JOB_TYPE_CONFIG: Record<JobData['jobType'], { label: string; className: string }> = {
  full_time: { label: 'Full Time', className: 'bg-purple-100 text-purple-700' },
  contract: { label: 'Contract', className: 'bg-blue-100 text-blue-700' },
  contract_to_hire: { label: 'C2H', className: 'bg-indigo-100 text-indigo-700' },
  part_time: { label: 'Part Time', className: 'bg-orange-100 text-orange-700' },
};

const WORK_MODE_ICONS: Record<JobData['workMode'], React.ElementType> = {
  remote: Home,
  hybrid: Building,
  onsite: Building2,
};

const PRIORITY_CONFIG: Record<NonNullable<JobData['priority']>, { className: string }> = {
  urgent: { className: 'text-red-500' },
  high: { className: 'text-orange-500' },
  normal: { className: 'text-blue-500' },
  low: { className: 'text-gray-400' },
};

const DEFAULT_ACTIONS: CardAction[] = [
  { id: 'view', label: 'View', icon: Eye },
  { id: 'submit', label: 'Submit Candidate', icon: Send },
  { id: 'clone', label: 'Clone', icon: Copy },
];

interface JobCardProps extends EntityCardProps<JobData> {}

export function JobCard({
  data,
  variant = 'default',
  onView,
  onAction,
  actions = DEFAULT_ACTIONS,
  selected,
  loading,
  className,
}: JobCardProps) {
  const statusConfig = STATUS_CONFIG[data.status];
  const jobTypeConfig = JOB_TYPE_CONFIG[data.jobType];
  const WorkModeIcon = WORK_MODE_ICONS[data.workMode];
  const priorityConfig = data.priority ? PRIORITY_CONFIG[data.priority] : null;

  const progressPercent = data.positionsOpen > 0
    ? (data.positionsFilled / (data.positionsOpen + data.positionsFilled)) * 100
    : 0;

  const handleAction = (actionId: string) => {
    if (actionId === 'view' && onView) {
      onView();
    } else if (onAction) {
      onAction(actionId, data);
    }
  };

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="h-5 bg-charcoal-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-charcoal-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-charcoal-200 rounded w-full" />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5',
          selected && 'ring-2 ring-blue-500',
          className
        )}
        onClick={onView}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-900 truncate">
                {data.title}
              </p>
              <p className="text-xs text-charcoal-500 truncate">
                {data.accountName}
              </p>
            </div>
            <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        selected && 'ring-2 ring-blue-500',
        onView && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      onClick={onView}
    >
      <CardContent className="p-4">
        {/* Header: Title, Account, Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {priorityConfig && (
                <AlertCircle className={cn('h-4 w-4 flex-shrink-0', priorityConfig.className)} />
              )}
              <h3 className="text-base font-semibold text-charcoal-900 truncate">
                {data.title}
              </h3>
            </div>
            <a
              href={`/employee/workspace/accounts/${data.accountId}`}
              className="text-sm text-blue-600 hover:underline truncate block mt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {data.accountName || 'No Account'}
            </a>
          </div>
          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
        </div>

        {/* Location, Work Mode, Job Type */}
        <div className="flex flex-wrap gap-2 mb-3">
          {data.location && (
            <div className="flex items-center gap-1 text-xs text-charcoal-500">
              <MapPin className="h-3 w-3" />
              <span>{data.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-charcoal-500">
            <WorkModeIcon className="h-3 w-3" />
            <span className="capitalize">{data.workMode}</span>
          </div>
          <Badge variant="outline" className={cn('text-xs', jobTypeConfig.className)}>
            {jobTypeConfig.label}
          </Badge>
        </div>

        {/* Rate Range */}
        {(data.rateMin || data.rateMax) && (
          <div className="flex items-center gap-1.5 text-sm text-charcoal-700 mb-3">
            <Briefcase className="h-4 w-4 text-charcoal-400" />
            <span>
              {data.rateMin && data.rateMax
                ? `${formatRate(data.rateMin, data.rateType)} - ${formatRate(data.rateMax, data.rateType)}`
                : data.rateMin
                ? `From ${formatRate(data.rateMin, data.rateType)}`
                : `Up to ${formatRate(data.rateMax!, data.rateType)}`}
            </span>
          </div>
        )}

        {/* Positions Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-charcoal-500">Positions</span>
            <span className="font-medium text-charcoal-700">
              {data.positionsFilled} filled / {data.positionsOpen + data.positionsFilled} total
            </span>
          </div>
          <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs text-charcoal-500">
          {data.submissionsCount !== undefined && (
            <div className="flex items-center gap-1">
              <Send className="h-3 w-3" />
              <span>{data.submissionsCount} submissions</span>
            </div>
          )}
          {data.interviewsScheduled !== undefined && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{data.interviewsScheduled} interviews</span>
            </div>
          )}
        </div>

        {/* RCAI Assignments */}
        {data.rcaiAssignments && data.rcaiAssignments.length > 0 && (
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-charcoal-100">
            <Users className="h-3 w-3 text-charcoal-400 mr-1" />
            <div className="flex -space-x-2">
              {data.rcaiAssignments.slice(0, 3).map((assignment) => (
                <Avatar key={assignment.userId} className="h-6 w-6 border-2 border-white">
                  <AvatarImage src={assignment.avatar} />
                  <AvatarFallback className="text-xs">
                    {assignment.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {data.rcaiAssignments.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-charcoal-100 border-2 border-white flex items-center justify-center text-xs text-charcoal-600">
                  +{data.rcaiAssignments.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {actions.length > 0 && (
        <CardFooter className="p-2 pt-0 flex justify-end gap-1">
          {actions.slice(0, 2).map((action) => (
            <Button
              key={action.id}
              variant={action.variant as "default" | "outline" | "secondary" | "ghost" | "destructive" | "link" | null | undefined || 'ghost'}
              size="sm"
              disabled={action.disabled}
              className={cn(action.hidden && 'hidden')}
              onClick={(e) => {
                e.stopPropagation();
                handleAction(action.id);
              }}
            >
              {action.icon && <action.icon className="h-3 w-3 mr-1" />}
              {action.label}
            </Button>
          ))}
          {actions.length > 2 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.slice(2).map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    disabled={action.disabled}
                    className={cn(action.hidden && 'hidden')}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(action.id);
                    }}
                  >
                    {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

export default JobCard;
