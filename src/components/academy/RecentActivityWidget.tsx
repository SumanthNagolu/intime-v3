/**
 * Recent Activity Widget Component
 * ACAD-019
 *
 * Displays recent XP earnings and badge unlocks
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, Award, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import {
  formatXpAmount,
  getXpAmountColor,
  getTransactionTypeIcon,
  formatTransactionDate,
} from '@/types/xp-transactions';

export function RecentActivityWidget() {
  const { data: xpSummary, isLoading: xpLoading } =
    trpc.xpTransactions.getMySummary.useQuery();

  const { data: badges, isLoading: badgesLoading } =
    trpc.badges.getMyBadges.useQuery({ limit: 5 });

  if (xpLoading || badgesLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentTransactions = xpSummary?.recent_transactions || [];
  const recentBadges = badges?.badges || [];

  // Combine and sort by date
  const activities = [
    ...recentTransactions.map((tx) => ({
      type: 'xp' as const,
      date: tx.awarded_at,
      data: tx,
    })),
    ...recentBadges.map((badge) => ({
      type: 'badge' as const,
      date: badge.earned_at,
      data: badge,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              No recent activity. Start learning to earn XP and badges!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {activities.map((activity, index) => {
              if (activity.type === 'xp') {
                const tx = activity.data;
                return (
                  <div
                    key={`xp-${index}`}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="text-2xl">
                      {getTransactionTypeIcon(tx.transaction_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.description || 'XP Earned'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTransactionDate(tx.awarded_at)}
                      </p>
                    </div>
                    <div className={`text-right ${getXpAmountColor(tx.amount)}`}>
                      <p className="text-sm font-bold">
                        {formatXpAmount(tx.amount)}
                      </p>
                    </div>
                  </div>
                );
              } else {
                const badge = activity.data;
                return (
                  <div
                    key={`badge-${index}`}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20"
                  >
                    <div className="text-2xl">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {badge.badge_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Badge Unlocked · {formatTransactionDate(badge.earned_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-yellow-700 dark:text-yellow-500">
                        +{badge.xp_reward} XP
                      </p>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
