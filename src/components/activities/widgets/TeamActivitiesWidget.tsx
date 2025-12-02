/**
 * Team Activities Widget
 *
 * Manager view of team workload for dashboard display.
 */

'use client';

import React from 'react';
import {
  Users, ArrowRight, AlertTriangle, CheckCircle, Clock, UserX,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ==========================================
// TYPES
// ==========================================

interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  totalActivities: number;
  inProgressCount: number;
  overdueCount: number;
  atRiskCount: number;
}

export interface TeamActivitiesWidgetProps {
  /** Team members with activity stats */
  teamMembers: TeamMember[];

  /** Unassigned activities count */
  unassignedCount: number;

  /** Total team activities */
  totalActivities: number;

  /** Total completed today */
  completedToday: number;

  /** Loading state */
  isLoading?: boolean;

  /** View team queue handler */
  onViewTeamQueue?: () => void;

  /** Member click handler */
  onMemberClick?: (member: TeamMember) => void;

  /** Unassigned click handler */
  onUnassignedClick?: () => void;

  /** Additional className */
  className?: string;
}

// ==========================================
// HELPER COMPONENTS
// ==========================================

type MemberStatus = 'on_track' | 'at_risk' | 'overdue';

function getMemberStatus(member: TeamMember): MemberStatus {
  if (member.overdueCount > 0) return 'overdue';
  if (member.atRiskCount > 0) return 'at_risk';
  return 'on_track';
}

function getStatusColor(status: MemberStatus): string {
  switch (status) {
    case 'overdue': return 'bg-red-500';
    case 'at_risk': return 'bg-amber-500';
    case 'on_track': return 'bg-green-500';
  }
}

function MemberRow({
  member,
  onClick,
}: {
  member: TeamMember;
  onClick?: () => void;
}) {
  const status = getMemberStatus(member);
  const statusColor = getStatusColor(status);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 text-left transition-colors"
    >
      {/* Avatar with status indicator */}
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.avatarUrl} />
          <AvatarFallback className="text-xs">
            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className={cn(
          'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background',
          statusColor
        )} />
      </div>

      {/* Name and stats */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{member.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {member.inProgressCount}
          </span>
          {member.overdueCount > 0 && (
            <span className="flex items-center gap-0.5 text-red-600">
              <AlertTriangle className="h-3 w-3" />
              {member.overdueCount}
            </span>
          )}
        </div>
      </div>

      {/* Total badge */}
      <Badge variant="outline" className="text-xs">
        {member.totalActivities}
      </Badge>
    </button>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function TeamActivitiesWidget({
  teamMembers,
  unassignedCount,
  totalActivities,
  completedToday,
  isLoading = false,
  onViewTeamQueue,
  onMemberClick,
  onUnassignedClick,
  className,
}: TeamActivitiesWidgetProps) {
  // Calculate team health
  const overdueMembers = teamMembers.filter(m => m.overdueCount > 0).length;
  const atRiskMembers = teamMembers.filter(m => m.atRiskCount > 0 && m.overdueCount === 0).length;
  const onTrackMembers = teamMembers.length - overdueMembers - atRiskMembers;

  const healthPercentage = teamMembers.length > 0
    ? (onTrackMembers / teamMembers.length) * 100
    : 100;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Workload
          </CardTitle>
          <div className="flex items-center gap-1">
            <Badge variant="secondary">{totalActivities}</Badge>
            {completedToday > 0 && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                +{completedToday} today
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Team Health Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Team Health</span>
            <span className={cn(
              healthPercentage >= 80 && 'text-green-600',
              healthPercentage >= 50 && healthPercentage < 80 && 'text-amber-600',
              healthPercentage < 50 && 'text-red-600'
            )}>
              {Math.round(healthPercentage)}% on track
            </span>
          </div>
          <div className="flex gap-0.5 h-2">
            <div
              className="bg-green-500 rounded-l"
              style={{ width: `${(onTrackMembers / teamMembers.length) * 100}%` }}
            />
            <div
              className="bg-amber-500"
              style={{ width: `${(atRiskMembers / teamMembers.length) * 100}%` }}
            />
            <div
              className="bg-red-500 rounded-r"
              style={{ width: `${(overdueMembers / teamMembers.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              {onTrackMembers} on track
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              {atRiskMembers} at risk
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              {overdueMembers} overdue
            </span>
          </div>
        </div>

        <Separator />

        {/* Team Members List */}
        <div className="space-y-1 max-h-[240px] overflow-y-auto">
          {teamMembers.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onClick={() => onMemberClick?.(member)}
            />
          ))}

          {/* Unassigned Row */}
          {unassignedCount > 0 && (
            <button
              onClick={onUnassignedClick}
              className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 text-left transition-colors border border-dashed border-amber-300 bg-amber-50/50"
            >
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <UserX className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700">Unassigned</p>
                <p className="text-xs text-amber-600">Needs attention</p>
              </div>
              <Badge variant="outline" className="border-amber-300 text-amber-700">
                {unassignedCount}
              </Badge>
            </button>
          )}
        </div>

        {/* View Team Queue Button */}
        {onViewTeamQueue && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onViewTeamQueue}
          >
            View Team Queue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default TeamActivitiesWidget;
