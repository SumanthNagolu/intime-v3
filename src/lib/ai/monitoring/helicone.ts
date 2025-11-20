/**
 * Helicone Client
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 2)
 * Story: AI-INF-004 - Cost Monitoring with Helicone
 *
 * Integrates with Helicone for AI cost tracking and budget monitoring.
 * Provides proxy integration for OpenAI and Anthropic APIs.
 *
 * @module lib/ai/monitoring/helicone
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  CostTrackingRequest,
  CostSummary,
  BudgetAlert,
  DateRange,
  HeliconeConfig,
  BudgetConfig,
  DashboardMetrics,
  AIProvider,
  ModelCostSummary,
  DailyCostSummary,
  ProviderCostSummary,
} from './types';

/**
 * Default budget configuration
 */
const DEFAULT_BUDGET: BudgetConfig = {
  dailyLimit: 500, // $500/day
  monthlyLimit: 15000, // $15K/month
  warningThreshold: 75, // 75% warning
  criticalThreshold: 90, // 90% critical
};

/**
 * Helicone Client
 *
 * Provides cost tracking, budget monitoring, and dashboard metrics
 * for AI API usage across OpenAI and Anthropic.
 */
export class HeliconeClient {
  private supabase: SupabaseClient;
  private config: HeliconeConfig;
  private budget: BudgetConfig;

  constructor(config: HeliconeConfig) {
    this.config = config;
    this.budget = config.budget || DEFAULT_BUDGET;

    // Initialize Supabase client for cost tracking storage
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }

  /**
   * Track AI request cost
   *
   * Logs cost data to database for aggregation and analysis.
   *
   * @param request - Cost tracking request
   * @returns Promise that resolves when tracking is complete
   *
   * @example
   * ```typescript
   * const helicone = new HeliconeClient({ apiKey: 'xxx' });
   * await helicone.trackRequest({
   *   orgId: 'org_123',
   *   userId: 'user_456',
   *   provider: 'openai',
   *   model: 'gpt-4o-mini',
   *   inputTokens: 1000,
   *   outputTokens: 500,
   *   costUsd: 0.0004,
   *   latencyMs: 1200,
   * });
   * ```
   */
  async trackRequest(request: CostTrackingRequest): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('ai_cost_tracking')
        .insert({
          org_id: request.orgId,
          user_id: request.userId,
          provider: request.provider,
          model: request.model,
          input_tokens: request.inputTokens,
          output_tokens: request.outputTokens,
          cost_usd: request.costUsd,
          latency_ms: request.latencyMs,
          metadata: request.metadata || {},
        });

      if (error) {
        console.error('[HeliconeClient] Failed to track request:', error);
        // Don't throw - tracking failure shouldn't break app
      }
    } catch (error) {
      console.error('[HeliconeClient] Unexpected error tracking request:', error);
    }
  }

  /**
   * Get cost summary for a date range
   *
   * Aggregates cost data by provider, model, and day.
   *
   * @param orgId - Organization ID
   * @param dateRange - Date range to query
   * @returns Cost summary with breakdowns
   *
   * @example
   * ```typescript
   * const summary = await helicone.getCostSummary('org_123', {
   *   startDate: '2025-01-01',
   *   endDate: '2025-01-31',
   * });
   * console.log(summary.totalCost); // $450.25
   * console.log(summary.byProvider.openai.cost); // $320.00
   * ```
   */
  async getCostSummary(orgId: string, dateRange: DateRange): Promise<CostSummary> {
    try {
      const { data, error } = await this.supabase
        .from('ai_cost_tracking')
        .select('*')
        .eq('org_id', orgId)
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate);

      if (error) {
        throw new Error(`Failed to fetch cost data: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return this.getEmptyCostSummary();
      }

      // Aggregate totals
      const totalCost = data.reduce((sum, row) => sum + (row.cost_usd || 0), 0);
      const totalRequests = data.length;
      const totalInputTokens = data.reduce((sum, row) => sum + (row.input_tokens || 0), 0);
      const totalOutputTokens = data.reduce((sum, row) => sum + (row.output_tokens || 0), 0);
      const avgLatencyMs = data.reduce((sum, row) => sum + (row.latency_ms || 0), 0) / totalRequests;

      // Aggregate by provider
      const byProvider: Record<AIProvider, ProviderCostSummary> = {
        openai: { provider: 'openai', cost: 0, requests: 0, tokens: 0 },
        anthropic: { provider: 'anthropic', cost: 0, requests: 0, tokens: 0 },
      };

      data.forEach((row) => {
        const provider = row.provider as AIProvider;
        byProvider[provider].cost += row.cost_usd || 0;
        byProvider[provider].requests += 1;
        byProvider[provider].tokens += (row.input_tokens || 0) + (row.output_tokens || 0);
      });

      // Aggregate by model
      const modelMap: Record<string, ModelCostSummary> = {};
      data.forEach((row) => {
        const key = row.model;
        if (!modelMap[key]) {
          modelMap[key] = {
            model: row.model,
            provider: row.provider as AIProvider,
            cost: 0,
            requests: 0,
            inputTokens: 0,
            outputTokens: 0,
          };
        }
        modelMap[key].cost += row.cost_usd || 0;
        modelMap[key].requests += 1;
        modelMap[key].inputTokens += row.input_tokens || 0;
        modelMap[key].outputTokens += row.output_tokens || 0;
      });

      // Aggregate by day
      const dailyMap: Record<string, DailyCostSummary> = {};
      data.forEach((row) => {
        const date = new Date(row.created_at).toISOString().split('T')[0];
        if (!dailyMap[date]) {
          dailyMap[date] = { date, cost: 0, requests: 0, tokens: 0 };
        }
        dailyMap[date].cost += row.cost_usd || 0;
        dailyMap[date].requests += 1;
        dailyMap[date].tokens += (row.input_tokens || 0) + (row.output_tokens || 0);
      });

      const daily = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalCost,
        totalRequests,
        totalInputTokens,
        totalOutputTokens,
        avgLatencyMs,
        byProvider,
        byModel: modelMap,
        daily,
      };
    } catch (error) {
      console.error('[HeliconeClient] Failed to get cost summary:', error);
      return this.getEmptyCostSummary();
    }
  }

  /**
   * Check budget and generate alerts if necessary
   *
   * Checks daily and monthly spend against configured thresholds.
   * Generates warning or critical alerts when thresholds are exceeded.
   *
   * @param orgId - Organization ID
   * @returns Budget alert if threshold exceeded, null otherwise
   *
   * @example
   * ```typescript
   * const alert = await helicone.checkBudget('org_123');
   * if (alert) {
   *   console.log(alert.level); // 'warning' or 'critical'
   *   console.log(alert.message); // 'Daily budget at 80%'
   * }
   * ```
   */
  async checkBudget(orgId: string): Promise<BudgetAlert | null> {
    try {
      // Get today's spend
      const today = new Date().toISOString().split('T')[0];
      const todaySummary = await this.getCostSummary(orgId, {
        startDate: `${today}T00:00:00Z`,
        endDate: `${today}T23:59:59Z`,
      });

      // Get month-to-date spend
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthStartStr = monthStart.toISOString().split('T')[0];
      const monthSummary = await this.getCostSummary(orgId, {
        startDate: `${monthStartStr}T00:00:00Z`,
        endDate: new Date().toISOString(),
      });

      // Check daily budget
      const dailyPercentage = (todaySummary.totalCost / this.budget.dailyLimit) * 100;
      if (dailyPercentage >= this.budget.criticalThreshold) {
        return {
          id: `alert-${Date.now()}`,
          orgId,
          level: 'critical',
          message: `Critical: Daily AI spend at ${dailyPercentage.toFixed(1)}% of budget`,
          currentSpend: todaySummary.totalCost,
          threshold: this.budget.dailyLimit,
          percentageUsed: dailyPercentage,
          recommendation: 'Consider pausing non-critical AI operations or increasing budget',
          createdAt: new Date().toISOString(),
        };
      }

      if (dailyPercentage >= this.budget.warningThreshold) {
        return {
          id: `alert-${Date.now()}`,
          orgId,
          level: 'warning',
          message: `Warning: Daily AI spend at ${dailyPercentage.toFixed(1)}% of budget`,
          currentSpend: todaySummary.totalCost,
          threshold: this.budget.dailyLimit,
          percentageUsed: dailyPercentage,
          recommendation: 'Monitor usage closely and optimize high-cost operations',
          createdAt: new Date().toISOString(),
        };
      }

      // Check monthly budget
      const monthlyPercentage = (monthSummary.totalCost / this.budget.monthlyLimit) * 100;
      if (monthlyPercentage >= this.budget.criticalThreshold) {
        return {
          id: `alert-${Date.now()}`,
          orgId,
          level: 'critical',
          message: `Critical: Monthly AI spend at ${monthlyPercentage.toFixed(1)}% of budget`,
          currentSpend: monthSummary.totalCost,
          threshold: this.budget.monthlyLimit,
          percentageUsed: monthlyPercentage,
          recommendation: 'Immediate action required: Review and reduce AI usage',
          createdAt: new Date().toISOString(),
        };
      }

      if (monthlyPercentage >= this.budget.warningThreshold) {
        return {
          id: `alert-${Date.now()}`,
          orgId,
          level: 'warning',
          message: `Warning: Monthly AI spend at ${monthlyPercentage.toFixed(1)}% of budget`,
          currentSpend: monthSummary.totalCost,
          threshold: this.budget.monthlyLimit,
          percentageUsed: monthlyPercentage,
          recommendation: 'Review usage patterns and optimize where possible',
          createdAt: new Date().toISOString(),
        };
      }

      return null; // No alerts
    } catch (error) {
      console.error('[HeliconeClient] Failed to check budget:', error);
      return null;
    }
  }

  /**
   * Get dashboard metrics
   *
   * Aggregates cost data for dashboard display.
   *
   * @param orgId - Organization ID
   * @returns Dashboard metrics
   *
   * @example
   * ```typescript
   * const metrics = await helicone.getDashboardMetrics('org_123');
   * console.log(metrics.today); // $45.20
   * console.log(metrics.budgetStatus.percentageUsed); // 35.5
   * ```
   */
  async getDashboardMetrics(orgId: string): Promise<DashboardMetrics> {
    try {
      // Get today's cost
      const today = new Date().toISOString().split('T')[0];
      const todaySummary = await this.getCostSummary(orgId, {
        startDate: `${today}T00:00:00Z`,
        endDate: `${today}T23:59:59Z`,
      });

      // Get yesterday's cost
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const yesterdaySummary = await this.getCostSummary(orgId, {
        startDate: `${yesterdayStr}T00:00:00Z`,
        endDate: `${yesterdayStr}T23:59:59Z`,
      });

      // Get month-to-date
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthStartStr = monthStart.toISOString().split('T')[0];
      const monthSummary = await this.getCostSummary(orgId, {
        startDate: `${monthStartStr}T00:00:00Z`,
        endDate: new Date().toISOString(),
      });

      // Calculate weekly trend
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      const weekSummary = await this.getCostSummary(orgId, {
        startDate: `${weekAgoStr}T00:00:00Z`,
        endDate: new Date().toISOString(),
      });

      const weeklyTrend = weekSummary.totalCost > 0
        ? ((todaySummary.totalCost - yesterdaySummary.totalCost) / weekSummary.totalCost) * 100
        : 0;

      // Get top 5 models by cost
      const topModels = Object.values(monthSummary.byModel)
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5);

      // Check for alerts
      const alert = await this.checkBudget(orgId);
      const recentAlerts = alert ? [alert] : [];

      return {
        monthToDate: monthSummary.totalCost,
        today: todaySummary.totalCost,
        yesterday: yesterdaySummary.totalCost,
        weeklyTrend,
        topModels,
        recentAlerts,
        budgetStatus: {
          budget: this.budget.monthlyLimit,
          spent: monthSummary.totalCost,
          remaining: this.budget.monthlyLimit - monthSummary.totalCost,
          percentageUsed: (monthSummary.totalCost / this.budget.monthlyLimit) * 100,
        },
      };
    } catch (error) {
      console.error('[HeliconeClient] Failed to get dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get Helicone proxy URL for OpenAI
   *
   * @returns Helicone proxy URL
   */
  getOpenAIProxyUrl(): string {
    return this.config.baseUrl || 'https://oai.helicone.ai/v1';
  }

  /**
   * Get Helicone proxy URL for Anthropic
   *
   * @returns Helicone proxy URL
   */
  getAnthropicProxyUrl(): string {
    return this.config.baseUrl || 'https://anthropic.helicone.ai/v1';
  }

  /**
   * Get Helicone headers for API requests
   *
   * @param metadata - Optional metadata to include
   * @returns Headers object
   */
  getHeliconeHeaders(metadata?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Helicone-Auth': `Bearer ${this.config.apiKey}`,
    };

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        headers[`Helicone-Property-${key}`] = value;
      });
    }

    return headers;
  }

  /**
   * Get empty cost summary (for error cases)
   *
   * @returns Empty cost summary
   * @private
   */
  private getEmptyCostSummary(): CostSummary {
    return {
      totalCost: 0,
      totalRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      avgLatencyMs: 0,
      byProvider: {
        openai: { provider: 'openai', cost: 0, requests: 0, tokens: 0 },
        anthropic: { provider: 'anthropic', cost: 0, requests: 0, tokens: 0 },
      },
      byModel: {},
      daily: [],
    };
  }
}

/**
 * Default Helicone client instance (singleton)
 */
let defaultHeliconeClient: HeliconeClient | null = null;

/**
 * Get the default Helicone client instance
 *
 * @returns Default HeliconeClient instance
 * @throws Error if HELICONE_API_KEY is not set
 */
export function getDefaultHeliconeClient(): HeliconeClient {
  if (!defaultHeliconeClient) {
    const apiKey = process.env.HELICONE_API_KEY;
    if (!apiKey) {
      throw new Error('HELICONE_API_KEY environment variable is required');
    }

    defaultHeliconeClient = new HeliconeClient({ apiKey });
  }
  return defaultHeliconeClient;
}

/**
 * Reset the default Helicone client (useful for testing)
 */
export function resetDefaultHeliconeClient(): void {
  defaultHeliconeClient = null;
}
