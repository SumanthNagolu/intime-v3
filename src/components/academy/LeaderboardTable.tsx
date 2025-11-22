/**
 * Leaderboard Table Component
 * ACAD-017
 *
 * Displays leaderboard entries with rank badges, avatars, and stats
 */

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Crown, TrendingUp, Trophy } from 'lucide-react';
import {
  getRankDisplay,
  getRankBadgeColor,
  formatPercentile,
  getUserAvatar,
} from '@/types/leaderboards';
import type {
  GlobalLeaderboardEntry,
  CourseLeaderboardEntry,
  WeeklyLeaderboardEntry,
  AllTimeLeaderboardEntry,
} from '@/types/leaderboards';

type LeaderboardEntry =
  | GlobalLeaderboardEntry
  | CourseLeaderboardEntry
  | WeeklyLeaderboardEntry
  | AllTimeLeaderboardEntry;

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  type: 'global' | 'course' | 'weekly' | 'all_time';
  currentUserId?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function LeaderboardTable({
  entries,
  type,
  currentUserId,
  isLoading = false,
  emptyMessage = 'No leaderboard data available',
}: LeaderboardTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Student</TableHead>
            {type === 'global' && <TableHead>Level</TableHead>}
            {type === 'course' && <TableHead>Progress</TableHead>}
            {type === 'all_time' && (
              <>
                <TableHead>Badges</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Days Active</TableHead>
              </>
            )}
            <TableHead className="text-right">
              {type === 'weekly' ? 'Weekly XP' : 'Total XP'}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const isCurrentUser = entry.user_id === currentUserId;

            return (
              <TableRow
                key={entry.user_id}
                className={isCurrentUser ? 'bg-primary/5 font-medium' : ''}
              >
                {/* Rank Column */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {entry.rank <= 3 && (
                      <Crown
                        className={`h-4 w-4 ${
                          entry.rank === 1
                            ? 'text-yellow-500'
                            : entry.rank === 2
                              ? 'text-gray-400'
                              : 'text-orange-500'
                        }`}
                      />
                    )}
                    <Badge
                      variant="outline"
                      className={getRankBadgeColor(entry.rank)}
                    >
                      {getRankDisplay(entry.rank)}
                    </Badge>
                  </div>
                </TableCell>

                {/* Student Column */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={getUserAvatar(entry.avatar_url, entry.full_name)}
                        alt={entry.full_name}
                      />
                      <AvatarFallback>
                        {entry.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {entry.full_name}
                        {isCurrentUser && (
                          <Badge variant="secondary" className="ml-2">
                            You
                          </Badge>
                        )}
                      </div>
                      {'percentile' in entry && entry.percentile && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {formatPercentile(entry.percentile)}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Global: Level Column */}
                {type === 'global' && 'level' in entry && (
                  <TableCell>
                    <div>
                      <div className="font-medium">Level {entry.level}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.level_name}
                      </div>
                    </div>
                  </TableCell>
                )}

                {/* Course: Progress Column */}
                {type === 'course' && 'completion_percentage' in entry && (
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {entry.completion_percentage.toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.modules_completed}/{entry.total_modules} modules
                      </div>
                    </div>
                  </TableCell>
                )}

                {/* All-Time: Badge Count */}
                {type === 'all_time' && 'badge_count' in entry && (
                  <>
                    <TableCell>
                      <Badge variant="secondary">{entry.badge_count}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entry.courses_completed}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{Math.floor(entry.days_active)}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.avg_xp_per_day.toFixed(0)} XP/day
                        </div>
                      </div>
                    </TableCell>
                  </>
                )}

                {/* XP Column */}
                <TableCell className="text-right">
                  <div className="font-bold text-lg">
                    {('weekly_xp' in entry
                      ? entry.weekly_xp
                      : entry.total_xp
                    ).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">XP</div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
