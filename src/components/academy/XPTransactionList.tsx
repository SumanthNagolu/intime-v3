/**
 * XP Transaction List Component
 * ACAD-018
 *
 * Displays paginated list of XP transactions with grouping by date
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, FileText } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import type { TransactionFilter } from '@/types/xp-transactions';
import {
  getTransactionTypeName,
  getTransactionTypeIcon,
  getTransactionTypeColor,
  formatXpAmount,
  getXpAmountColor,
  formatTransactionDate,
  groupTransactionsByDate,
} from '@/types/xp-transactions';

interface XPTransactionListProps {
  filters?: TransactionFilter;
  showFilters?: boolean;
}

export function XPTransactionList({
  filters,
  showFilters = true,
}: XPTransactionListProps) {
  const [page, setPage] = useState(0);
  const limit = 50;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.xpTransactions.getMyTransactions.useInfiniteQuery(
      {
        ...filters,
        limit,
      },
      {
        getNextPageParam: (lastPage, allPages) => {
          if (!lastPage.hasMore) return undefined;
          return allPages.length * limit;
        },
      }
    );

  const transactions = data?.pages.flatMap((page) => page.transactions) ?? [];
  const groupedTransactions = groupTransactionsByDate(transactions);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No transactions found
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete activities to start earning XP!
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
          <FileText className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {Array.from(groupedTransactions.entries()).map(([date, txs]) => (
              <div key={date}>
                {/* Date Header */}
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {date}
                </h3>

                {/* Transactions for this date */}
                <div className="space-y-2">
                  {txs.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      {/* Icon */}
                      <div className="text-2xl">
                        {getTransactionTypeIcon(tx.transaction_type)}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-medium ${getTransactionTypeColor(tx.transaction_type)}`}>
                            {getTransactionTypeName(tx.transaction_type)}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatTransactionDate(tx.awarded_at)}
                          </span>
                        </div>
                        {tx.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {tx.description}
                          </p>
                        )}
                      </div>

                      {/* XP Amount */}
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getXpAmountColor(tx.amount)}`}>
                          {formatXpAmount(tx.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Load More
                  </>
                )}
              </Button>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
