/**
 * Leaderboard Position Widget Component
 * ACAD-019
 *
 * Displays user's leaderboard position with quick stats
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, TrendingUp, Calendar, ArrowRight, Crown } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { getRankDisplay, getRankBadgeColor } from '@/types/leaderboards';

export function LeaderboardPositionWidget() {
  const { data: summary, isLoading } = trpc.leaderboards.getMySummary.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary || summary.global_rank === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">
              Start earning XP to appear on the leaderboard!
            </p>
            <Link href="/academy/leaderboard">
              <Button variant="outline" size="sm">
                View Leaderboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const calculatePercentile = (rank: number, totalUsers: number): number => {
    if (totalUsers === 0) return 100;
    return Math.round(((totalUsers - rank + 1) / totalUsers) * 100);
  };

  const globalPercentile = summary.total_users
    ? calculatePercentile(summary.global_rank, summary.total_users)
    : null;

  const isTopRank = summary.global_rank <= 3;

  return (
    <Card className={isTopRank ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard Position
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Global Rank */}
        <div className="p-4 rounded-lg bg-card border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Global Rank</span>
            {isTopRank && (
              <Crown
                className={`h-5 w-5 ${
                  summary.global_rank === 1
                    ? 'text-yellow-500'
                    : summary.global_rank === 2
                      ? 'text-gray-400'
                      : 'text-orange-500'
                }`}
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`${getRankBadgeColor(summary.global_rank)} text-lg px-3 py-1`}>
              {getRankDisplay(summary.global_rank)}
            </Badge>
            {globalPercentile !== null && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Top {globalPercentile}%</span>
              </div>
            )}
          </div>
          {summary.total_users && (
            <p className="text-xs text-muted-foreground mt-2">
              Out of {summary.total_users.toLocaleString()} students
            </p>
          )}
        </div>

        {/* Weekly Rank */}
        {summary.weekly_rank !== null && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">This Week</span>
              </div>
              <Badge variant="secondary" className="text-sm">
                {getRankDisplay(summary.weekly_rank)}
              </Badge>
            </div>
            {summary.weekly_xp_earned !== undefined && summary.weekly_xp_earned > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                +{summary.weekly_xp_earned.toLocaleString()} XP this week
              </p>
            )}
          </div>
        )}

        {/* Progress Indicator */}
        {summary.xp_to_next_rank !== null && summary.xp_to_next_rank > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                To Rank #{summary.global_rank - 1}
              </span>
              <span className="text-xs font-bold text-primary">
                {summary.xp_to_next_rank.toLocaleString()} XP
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep learning to climb the ranks!
            </p>
          </div>
        )}

        {/* View Full Leaderboard Button */}
        <Link href="/academy/leaderboard" className="w-full block">
          <Button className="w-full" variant="outline">
            View Full Leaderboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
