/**
 * XP Progress Card Component
 * ACAD-018
 *
 * Displays user's total XP, current level, and progress to next level
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Zap, Award } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

export function XPProgressCard() {
  const { data: summary, isLoading } = trpc.xpTransactions.getMySummary.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            XP Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No XP data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          XP Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total XP Display */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total XP</p>
            <p className="text-4xl font-bold text-yellow-600">
              {summary.total_xp.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              Level {summary.current_level}
            </Badge>
            <p className="text-sm font-medium text-muted-foreground">
              {summary.level_name}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Progress to Level {summary.current_level + 1}
            </span>
            <span className="font-medium">
              {summary.level_progress_percentage}%
            </span>
          </div>
          <Progress
            value={summary.level_progress_percentage}
            className="h-3"
          />
          <p className="text-xs text-muted-foreground text-right">
            {summary.xp_to_next_level.toLocaleString()} XP to next level
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">
              {summary.total_transactions.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Recent Activity</p>
            <p className="text-2xl font-bold">
              {summary.recent_transactions.length}
            </p>
          </div>
        </div>

        {/* Level Milestones */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-3">Level Milestones</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className={summary.total_xp >= 1000 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                Intermediate (1,000 XP)
              </span>
              {summary.total_xp >= 1000 && <span className="text-green-600">✓</span>}
            </div>
            <div className="flex items-center justify-between">
              <span className={summary.total_xp >= 5000 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                Advanced (5,000 XP)
              </span>
              {summary.total_xp >= 5000 && <span className="text-green-600">✓</span>}
            </div>
            <div className="flex items-center justify-between">
              <span className={summary.total_xp >= 10000 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                Expert (10,000 XP)
              </span>
              {summary.total_xp >= 10000 && <span className="text-green-600">✓</span>}
            </div>
            <div className="flex items-center justify-between">
              <span className={summary.total_xp >= 25000 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                Master (25,000 XP)
              </span>
              {summary.total_xp >= 25000 && <span className="text-green-600">✓</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
