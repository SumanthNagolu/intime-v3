/**
 * XP Transactions tRPC Router
 * ACAD-018
 */

import { z } from 'zod';
import { router, protectedProcedure } from '@/lib/trpc/trpc';
import { createClient } from '@/lib/supabase/server';
import {
  TransactionFilterSchema,
  ExportTransactionsInputSchema,
  type XPTransaction,
  type XPSummary,
  type TransactionStats,
  calculateLevel,
  getLevelName,
  calculateXpToNextLevel,
  calculateLevelProgress,
  calculateTransactionStats,
  transactionsToCSV,
} from '@/types/xp-transactions';

export const xpTransactionsRouter = router({
  // ============================================================================
  // GET TRANSACTIONS
  // ============================================================================

  /**
   * Get user's XP transaction history with filtering
   */
  getMyTransactions: protectedProcedure
    .input(TransactionFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      let query = supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', ctx.session.user.id)
        .order('awarded_at', { ascending: false });

      // Apply filters
      if (input?.types && input.types.length > 0) {
        query = query.in('transaction_type', input.types);
      }

      if (input?.startDate) {
        query = query.gte('awarded_at', input.startDate);
      }

      if (input?.endDate) {
        query = query.lte('awarded_at', input.endDate);
      }

      if (input?.minAmount !== undefined) {
        query = query.gte('amount', input.minAmount);
      }

      if (input?.maxAmount !== undefined) {
        query = query.lte('amount', input.maxAmount);
      }

      // Pagination
      const limit = input?.limit || 50;
      const offset = input?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      return {
        transactions: (data as XPTransaction[]) ?? [],
        hasMore: (data?.length || 0) === limit,
      };
    }),

  /**
   * Get XP summary for current user
   */
  getMySummary: protectedProcedure.query(async ({ ctx }) => {
    const supabase = await createClient();

    // Get total XP
    const { data: xpData, error: xpError } = await supabase
      .from('user_xp_totals')
      .select('total_xp, transaction_count')
      .eq('user_id', ctx.session.user.id)
      .single();

    if (xpError) {
      throw new Error(`Failed to fetch XP total: ${xpError.message}`);
    }

    const totalXp = xpData?.total_xp || 0;
    const currentLevel = calculateLevel(totalXp);
    const levelName = getLevelName(totalXp);
    const xpToNextLevel = calculateXpToNextLevel(totalXp);
    const levelProgress = calculateLevelProgress(totalXp);

    // Get recent transactions
    const { data: recentTx, error: txError } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', ctx.session.user.id)
      .order('awarded_at', { ascending: false })
      .limit(10);

    if (txError) {
      throw new Error(`Failed to fetch recent transactions: ${txError.message}`);
    }

    const summary: XPSummary = {
      total_xp: totalXp,
      current_level: currentLevel,
      level_name: levelName,
      xp_to_next_level: xpToNextLevel,
      level_progress_percentage: levelProgress,
      total_transactions: xpData?.transaction_count || 0,
      recent_transactions: (recentTx as XPTransaction[]) ?? [],
    };

    return summary;
  }),

  /**
   * Get transaction statistics
   */
  getMyStats: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      let query = supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', ctx.session.user.id);

      if (input?.startDate) {
        query = query.gte('awarded_at', input.startDate);
      }

      if (input?.endDate) {
        query = query.lte('awarded_at', input.endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch transaction stats: ${error.message}`);
      }

      const transactions = (data as XPTransaction[]) ?? [];
      const stats = calculateTransactionStats(transactions);

      return stats;
    }),

  // ============================================================================
  // EXPORT
  // ============================================================================

  /**
   * Export transaction history as CSV
   */
  exportTransactions: protectedProcedure
    .input(ExportTransactionsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      let query = supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', ctx.session.user.id)
        .order('awarded_at', { ascending: false });

      // Apply filters if provided
      if (input.filters?.types && input.filters.types.length > 0) {
        query = query.in('transaction_type', input.filters.types);
      }

      if (input.filters?.startDate) {
        query = query.gte('awarded_at', input.filters.startDate);
      }

      if (input.filters?.endDate) {
        query = query.lte('awarded_at', input.filters.endDate);
      }

      // Limit to 10,000 transactions max for export
      query = query.limit(10000);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch transactions for export: ${error.message}`);
      }

      const transactions = (data as XPTransaction[]) ?? [];

      if (input.format === 'csv') {
        const csv = transactionsToCSV(transactions);
        return {
          data: csv,
          filename: `xp-transactions-${new Date().toISOString().split('T')[0]}.csv`,
          contentType: 'text/csv',
        };
      } else {
        // JSON format
        return {
          data: JSON.stringify(transactions, null, 2),
          filename: `xp-transactions-${new Date().toISOString().split('T')[0]}.json`,
          contentType: 'application/json',
        };
      }
    }),
});
