/**
 * XP Transactions Type Definitions
 * ACAD-018
 */

import { z } from 'zod';

// ============================================================================
// BASE TYPES
// ============================================================================

export const TransactionTypeSchema = z.enum([
  'topic_completion',
  'quiz_passed',
  'lab_completed',
  'project_submitted',
  'bonus_achievement',
  'badge_earned',
  'penalty',
  'adjustment',
]);

export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const ReferenceTypeSchema = z.enum([
  'topic_completion',
  'enrollment',
  'achievement',
  'badge',
  'admin_action',
]);

export type ReferenceType = z.infer<typeof ReferenceTypeSchema>;

// ============================================================================
// XP TRANSACTION
// ============================================================================

export const XPTransactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().int(),
  transaction_type: TransactionTypeSchema,
  reference_type: ReferenceTypeSchema.nullable(),
  reference_id: z.string().uuid().nullable(),
  description: z.string().nullable(),
  awarded_at: z.string(), // ISO timestamp
  awarded_by: z.string().uuid().nullable(),
  created_at: z.string(), // ISO timestamp
});

export type XPTransaction = z.infer<typeof XPTransactionSchema>;

// ============================================================================
// TRANSACTION FILTERS
// ============================================================================

export const TransactionFilterSchema = z.object({
  types: z.array(TransactionTypeSchema).optional(),
  startDate: z.string().optional(), // ISO date
  endDate: z.string().optional(), // ISO date
  minAmount: z.number().int().optional(),
  maxAmount: z.number().int().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type TransactionFilter = z.infer<typeof TransactionFilterSchema>;

// ============================================================================
// TRANSACTION SUMMARY
// ============================================================================

export const XPSummarySchema = z.object({
  total_xp: z.number().int().min(0),
  current_level: z.number().int().min(1),
  level_name: z.string(),
  xp_to_next_level: z.number().int().min(0),
  level_progress_percentage: z.number().min(0).max(100),
  total_transactions: z.number().int().min(0),
  recent_transactions: z.array(XPTransactionSchema),
});

export type XPSummary = z.infer<typeof XPSummarySchema>;

// ============================================================================
// TRANSACTION STATS
// ============================================================================

export const TransactionStatsSchema = z.object({
  total_earned: z.number().int().min(0),
  total_spent: z.number().int().min(0),
  net_xp: z.number().int(),
  transaction_count: z.number().int().min(0),
  avg_transaction: z.number(),
  by_type: z.record(TransactionTypeSchema, z.number().int()),
});

export type TransactionStats = z.infer<typeof TransactionStatsSchema>;

// ============================================================================
// CSV EXPORT
// ============================================================================

export const ExportFormatSchema = z.enum(['csv', 'json']);
export type ExportFormat = z.infer<typeof ExportFormatSchema>;

export const ExportTransactionsInputSchema = z.object({
  format: ExportFormatSchema.default('csv'),
  filters: TransactionFilterSchema.optional(),
});

export type ExportTransactionsInput = z.infer<typeof ExportTransactionsInputSchema>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate level from total XP (1000 XP per level)
 */
export function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / 1000) + 1;
}

/**
 * Calculate XP needed for next level
 */
export function calculateXpToNextLevel(totalXp: number): number {
  const currentLevel = calculateLevel(totalXp);
  const nextLevelXp = currentLevel * 1000;
  return nextLevelXp - totalXp;
}

/**
 * Calculate level progress percentage
 */
export function calculateLevelProgress(totalXp: number): number {
  const currentLevelStart = (calculateLevel(totalXp) - 1) * 1000;
  const xpInCurrentLevel = totalXp - currentLevelStart;
  return Math.round((xpInCurrentLevel / 1000) * 100);
}

/**
 * Get level name from XP
 */
export function getLevelName(totalXp: number): string {
  if (totalXp < 1000) return 'Beginner';
  if (totalXp < 5000) return 'Intermediate';
  if (totalXp < 10000) return 'Advanced';
  if (totalXp < 25000) return 'Expert';
  return 'Master';
}

/**
 * Get transaction type display name
 */
export function getTransactionTypeName(type: TransactionType): string {
  const names: Record<TransactionType, string> = {
    topic_completion: 'Topic Completed',
    quiz_passed: 'Quiz Passed',
    lab_completed: 'Lab Completed',
    project_submitted: 'Project Submitted',
    bonus_achievement: 'Bonus Achievement',
    badge_earned: 'Badge Earned',
    penalty: 'Penalty',
    adjustment: 'Manual Adjustment',
  };
  return names[type];
}

/**
 * Get transaction type icon
 */
export function getTransactionTypeIcon(type: TransactionType): string {
  const icons: Record<TransactionType, string> = {
    topic_completion: '📚',
    quiz_passed: '✅',
    lab_completed: '🔬',
    project_submitted: '🎯',
    bonus_achievement: '⭐',
    badge_earned: '🏆',
    penalty: '⚠️',
    adjustment: '⚙️',
  };
  return icons[type];
}

/**
 * Get transaction type color class
 */
export function getTransactionTypeColor(type: TransactionType): string {
  const colors: Record<TransactionType, string> = {
    topic_completion: 'text-blue-600',
    quiz_passed: 'text-green-600',
    lab_completed: 'text-purple-600',
    project_submitted: 'text-indigo-600',
    bonus_achievement: 'text-yellow-600',
    badge_earned: 'text-orange-600',
    penalty: 'text-red-600',
    adjustment: 'text-gray-600',
  };
  return colors[type];
}

/**
 * Format XP amount with sign
 */
export function formatXpAmount(amount: number): string {
  const sign = amount > 0 ? '+' : '';
  return `${sign}${amount.toLocaleString()} XP`;
}

/**
 * Get XP color class based on amount
 */
export function getXpAmountColor(amount: number): string {
  if (amount > 0) return 'text-green-600';
  if (amount < 0) return 'text-red-600';
  return 'text-gray-600';
}

/**
 * Format date for display
 */
export function formatTransactionDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Group transactions by date
 */
export function groupTransactionsByDate(
  transactions: XPTransaction[]
): Map<string, XPTransaction[]> {
  const groups = new Map<string, XPTransaction[]>();

  for (const tx of transactions) {
    const date = new Date(tx.awarded_at).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(tx);
  }

  return groups;
}

/**
 * Calculate transaction statistics
 */
export function calculateTransactionStats(
  transactions: XPTransaction[]
): TransactionStats {
  const totalEarned = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalSpent = Math.abs(
    transactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + tx.amount, 0)
  );

  const byType: Partial<Record<TransactionType, number>> = {};
  for (const tx of transactions) {
    byType[tx.transaction_type] = (byType[tx.transaction_type] || 0) + tx.amount;
  }

  return {
    total_earned: totalEarned,
    total_spent: totalSpent,
    net_xp: totalEarned - totalSpent,
    transaction_count: transactions.length,
    avg_transaction:
      transactions.length > 0
        ? Math.round(
            transactions.reduce((sum, tx) => sum + tx.amount, 0) / transactions.length
          )
        : 0,
    by_type: byType as Record<TransactionType, number>,
  };
}

/**
 * Convert transactions to CSV
 */
export function transactionsToCSV(transactions: XPTransaction[]): string {
  const headers = [
    'Date',
    'Type',
    'Amount',
    'Description',
    'Reference Type',
    'Reference ID',
  ];

  const rows = transactions.map((tx) => [
    new Date(tx.awarded_at).toISOString(),
    tx.transaction_type,
    tx.amount.toString(),
    tx.description || '',
    tx.reference_type || '',
    tx.reference_id || '',
  ]);

  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
    ),
  ];

  return csvLines.join('\n');
}
