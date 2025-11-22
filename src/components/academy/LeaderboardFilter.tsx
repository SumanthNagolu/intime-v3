/**
 * Leaderboard Filter Component
 * ACAD-017
 *
 * Allows users to switch between different leaderboard types and time periods
 */

'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Globe, Trophy, Users, Zap } from 'lucide-react';
import type { LeaderboardType, LeaderboardPeriod } from '@/types/leaderboards';
import {
  getLeaderboardTypeName,
  getLeaderboardTypeDescription,
  getWeekLabel,
} from '@/types/leaderboards';

interface LeaderboardFilterProps {
  selectedType: LeaderboardType;
  onTypeChange: (type: LeaderboardType) => void;
  selectedPeriod?: LeaderboardPeriod;
  onPeriodChange?: (period: LeaderboardPeriod) => void;
  selectedCourseId?: string;
  onCourseIdChange?: (courseId: string) => void;
  availableCourses?: Array<{ id: string; title: string }>;
}

export function LeaderboardFilter({
  selectedType,
  onTypeChange,
  selectedPeriod,
  onPeriodChange,
  selectedCourseId,
  onCourseIdChange,
  availableCourses = [],
}: LeaderboardFilterProps) {
  const leaderboardTypes: Array<{
    type: LeaderboardType;
    label: string;
    icon: React.ReactNode;
  }> = [
    { type: 'global', label: 'Global', icon: <Globe className="h-4 w-4" /> },
    { type: 'course', label: 'Course', icon: <Users className="h-4 w-4" /> },
    { type: 'cohort', label: 'Cohort', icon: <Calendar className="h-4 w-4" /> },
    { type: 'weekly', label: 'Weekly', icon: <Zap className="h-4 w-4" /> },
    {
      type: 'all_time',
      label: 'All-Time Top 100',
      icon: <Trophy className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Leaderboard Type Tabs */}
      <div>
        <Tabs value={selectedType} onValueChange={(v) => onTypeChange(v as LeaderboardType)}>
          <TabsList className="grid w-full grid-cols-5">
            {leaderboardTypes.map(({ type, label, icon }) => (
              <TabsTrigger
                key={type}
                value={type}
                className="flex items-center gap-2"
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <p className="text-sm text-muted-foreground mt-2">
          {getLeaderboardTypeDescription(selectedType)}
        </p>
      </div>

      {/* Course Selector (for course and cohort types) */}
      {(selectedType === 'course' || selectedType === 'cohort') &&
        availableCourses.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Course
            </label>
            <Select
              value={selectedCourseId}
              onValueChange={(value) => onCourseIdChange?.(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a course..." />
              </SelectTrigger>
              <SelectContent>
                {availableCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

      {/* Week Selector (for weekly type) */}
      {selectedType === 'weekly' && onPeriodChange && (
        <div>
          <label className="text-sm font-medium mb-2 block">Time Period</label>
          <Select
            value={selectedPeriod}
            onValueChange={(value) => onPeriodChange(value as LeaderboardPeriod)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select week..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_week">
                {getWeekLabel(0)} (Current)
              </SelectItem>
              <SelectItem value="last_week">{getWeekLabel(1)}</SelectItem>
              <SelectItem value="last_4_weeks">Last 4 Weeks</SelectItem>
              <SelectItem value="last_12_weeks">Last 12 Weeks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
