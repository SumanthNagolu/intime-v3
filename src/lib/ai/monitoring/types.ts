/**
 * AI Monitoring Types
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 2)
 * Story: AI-INF-004 - Cost Monitoring with Helicone
 *
 * Type definitions for AI cost tracking and monitoring.
 *
 * @module lib/ai/monitoring/types
 */

/**
 * AI model providers
 */
export type AIProvider = 'openai' | 'anthropic';

/**
 * Date range for cost queries
 */
export interface DateRange {
  /** Start date (ISO 8601) */
  startDate: string;
  /** End date (ISO 8601) */
  endDate: string;
}

/**
 * Cost tracking request
 */
export interface CostTrackingRequest {
  /** Organization ID */
  orgId: string;
  /** User ID who initiated the request */
  userId: string;
  /** AI provider used */
  provider: AIProvider;
  /** Specific model used */
  model: string;
  /** Number of input tokens */
  inputTokens: number;
  /** Number of output tokens */
  outputTokens: number;
  /** Total cost in USD */
  costUsd: number;
  /** Request latency in milliseconds */
  latencyMs: number;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Cost summary for a date range
 */
export interface CostSummary {
  /** Total cost in USD */
  totalCost: number;
  /** Total requests made */
  totalRequests: number;
  /** Total input tokens used */
  totalInputTokens: number;
  /** Total output tokens used */
  totalOutputTokens: number;
  /** Average latency in milliseconds */
  avgLatencyMs: number;
  /** Cost breakdown by provider */
  byProvider: Record<AIProvider, ProviderCostSummary>;
  /** Cost breakdown by model */
  byModel: Record<string, ModelCostSummary>;
  /** Daily cost breakdown */
  daily: DailyCostSummary[];
}

/**
 * Provider-level cost summary
 */
export interface ProviderCostSummary {
  /** Provider name */
  provider: AIProvider;
  /** Total cost for this provider */
  cost: number;
  /** Total requests to this provider */
  requests: number;
  /** Total tokens used */
  tokens: number;
}

/**
 * Model-level cost summary
 */
export interface ModelCostSummary {
  /** Model name */
  model: string;
  /** Provider */
  provider: AIProvider;
  /** Total cost for this model */
  cost: number;
  /** Total requests to this model */
  requests: number;
  /** Total input tokens */
  inputTokens: number;
  /** Total output tokens */
  outputTokens: number;
}

/**
 * Daily cost summary
 */
export interface DailyCostSummary {
  /** Date (YYYY-MM-DD) */
  date: string;
  /** Total cost for this day */
  cost: number;
  /** Total requests for this day */
  requests: number;
  /** Total tokens for this day */
  tokens: number;
}

/**
 * Budget alert
 */
export interface BudgetAlert {
  /** Alert ID */
  id: string;
  /** Organization ID */
  orgId: string;
  /** Alert level */
  level: 'warning' | 'critical';
  /** Alert message */
  message: string;
  /** Current spend */
  currentSpend: number;
  /** Budget threshold */
  threshold: number;
  /** Percentage of budget used */
  percentageUsed: number;
  /** Recommended action */
  recommendation: string;
  /** Alert timestamp */
  createdAt: string;
}

/**
 * Budget configuration
 */
export interface BudgetConfig {
  /** Daily budget limit in USD */
  dailyLimit: number;
  /** Monthly budget limit in USD */
  monthlyLimit: number;
  /** Warning threshold percentage (0-100) */
  warningThreshold: number;
  /** Critical threshold percentage (0-100) */
  criticalThreshold: number;
}

/**
 * Helicone configuration
 */
export interface HeliconeConfig {
  /** Helicone API key */
  apiKey: string;
  /** Helicone base URL (default: https://api.helicone.ai) */
  baseUrl?: string;
  /** Budget configuration */
  budget?: BudgetConfig;
}

/**
 * Dashboard metrics
 */
export interface DashboardMetrics {
  /** Current month cost */
  monthToDate: number;
  /** Today's cost */
  today: number;
  /** Yesterday's cost */
  yesterday: number;
  /** Weekly trend (percentage change) */
  weeklyTrend: number;
  /** Top 5 models by cost */
  topModels: ModelCostSummary[];
  /** Recent alerts */
  recentAlerts: BudgetAlert[];
  /** Monthly budget status */
  budgetStatus: {
    /** Allocated budget */
    budget: number;
    /** Spent so far */
    spent: number;
    /** Remaining budget */
    remaining: number;
    /** Percentage used */
    percentageUsed: number;
  };
}
