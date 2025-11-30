/**
 * TimelineGenerator Service
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 4)
 * Story: AI-PROD-003 - Daily Timeline Generator
 *
 * Generates AI-powered daily productivity reports from activity data.
 * Refactored to extend BaseAgent for cost tracking and model routing.
 *
 * @module lib/ai/productivity/TimelineGenerator
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { ActivityClassifier } from './ActivityClassifier';
import type {
  ProductivityReport,
  ITimelineGenerator,
  ActivityBreakdown,
  ProductivityError,
} from '@/types/productivity';
import { ProductivityErrorCodes } from '@/types/productivity';
import { BaseAgent, type AgentConfig } from '../agents/BaseAgent';

/**
 * Timeline Generator
 *
 * Generates daily productivity reports with AI-powered narrative summaries.
 * Uses ActivityClassifier for data aggregation and GPT-4o-mini for narrative generation.
 * Now extends BaseAgent for integrated cost tracking and model routing.
 */
export class TimelineGenerator
  extends BaseAgent<{ userId: string; date: string }, ProductivityReport>
  implements ITimelineGenerator
{
  private classifier: ActivityClassifier;
  private openai: OpenAI;
  private supabase: SupabaseClient;

  constructor(
    config?: Partial<AgentConfig>,
    dependencies?: {
      classifier?: ActivityClassifier;
      openai?: OpenAI;
      supabase?: SupabaseClient;
    }
  ) {
    super({
      agentName: 'TimelineGenerator',
      enableCostTracking: true,
      enableMemory: false,
      enableRAG: false,
      ...config,
    });

    // Allow dependency injection for testing
    this.classifier = dependencies?.classifier || new ActivityClassifier();
    this.openai = dependencies?.openai || new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.supabase =
      dependencies?.supabase ||
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );
  }

  /**
   * Execute method required by BaseAgent
   */
  async execute(input: { userId: string; date: string }): Promise<ProductivityReport> {
    return this.generateDailyReport(input.userId, input.date);
  }

  /**
   * Generate daily productivity report for a user
   *
   * @param userId - User ID to generate report for
   * @param date - Date in YYYY-MM-DD format
   * @returns Complete productivity report
   * @throws ProductivityError if report generation fails
   */
  async generateDailyReport(
    userId: string,
    date: string
  ): Promise<ProductivityReport> {
    const startTime = performance.now();

    try {
      // Use BaseAgent router for model selection
      const model = await this.routeModel('daily productivity report narrative generation');

      // Get user profile for org_id
      const { data: userProfile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('org_id, full_name')
        .eq('id', userId)
        .single();

      if (profileError || !userProfile) {
        throw this.createError(
          'User profile not found',
          'REPORT_GENERATION_FAILED',
          { userId, error: profileError }
        );
      }

      // Get activity summary from classifier
      const summary = await this.classifier.getDailySummary(userId, date);

      if (summary.totalScreenshots === 0) {
        throw this.createError(
          'No activity data available for this date',
          'REPORT_GENERATION_FAILED',
          { userId, date }
        );
      }

      // Calculate top activities
      const total = summary.totalScreenshots;
      const topActivities: ActivityBreakdown[] = Object.entries(summary.byCategory)
        .map(([category, count]) => ({
          category: category as ActivityBreakdown['category'],
          count,
          percentage: Math.round((count / total) * 100),
          hours: Math.round(((count * 30) / 3600) * 100) / 100, // 30s per screenshot
        }))
        .filter((a) => a.percentage > 0)
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);

      // Generate AI narrative
      const narrative = await this.generateNarrative({
        userName: userProfile.full_name || 'Employee',
        date,
        productiveHours: summary.productiveHours,
        topActivities,
        totalScreenshots: total,
        analyzed: summary.analyzed,
        activityBreakdown: summary.byCategory,
      });

      // Create report record
      const report: Omit<ProductivityReport, 'id' | 'createdAt' | 'updatedAt'> = {
        orgId: userProfile.org_id,
        userId,
        date,
        summary: narrative.summary,
        productiveHours: summary.productiveHours,
        topActivities,
        insights: narrative.insights,
        recommendations: narrative.recommendations,
        totalScreenshots: total,
        analyzedScreenshots: summary.analyzed,
        activityBreakdown: summary.byCategory,
      };

      // Save to database
      const { data: savedReport, error: saveError } = await this.supabase
        .from('productivity_reports')
        .insert({
          org_id: report.orgId,
          user_id: report.userId,
          date: report.date,
          summary: report.summary,
          productive_hours: report.productiveHours,
          top_activities: report.topActivities,
          insights: report.insights,
          recommendations: report.recommendations,
          total_screenshots: report.totalScreenshots,
          analyzed_screenshots: report.analyzedScreenshots,
          activity_breakdown: report.activityBreakdown,
        })
        .select()
        .single();

      if (saveError || !savedReport) {
        throw this.createError(
          'Failed to save productivity report',
          'REPORT_GENERATION_FAILED',
          { userId, date, error: saveError }
        );
      }

      const result = {
        id: savedReport.id,
        ...report,
        createdAt: savedReport.created_at,
        updatedAt: savedReport.updated_at,
      };

      // Track cost using BaseAgent (estimated 500 tokens for narrative generation)
      const latencyMs = performance.now() - startTime;
      const estimatedTokens = 500;
      const estimatedCost = (estimatedTokens / 1_000_000) * 0.375; // GPT-4o-mini avg
      await this.trackCost(estimatedTokens, estimatedCost, model.model, latencyMs);

      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'ProductivityError') {
        throw error;
      }

      throw this.createError(
        `Failed to generate daily report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'REPORT_GENERATION_FAILED',
        { userId, date, error }
      );
    }
  }

  /**
   * Generate AI narrative summary for the report
   *
   * @param data - Activity data to generate narrative from
   * @returns Narrative summary with insights and recommendations
   * @private
   */
  private async generateNarrative(data: {
    userName: string;
    date: string;
    productiveHours: number;
    topActivities: ActivityBreakdown[];
    totalScreenshots: number;
    analyzed: number;
    activityBreakdown: Record<string, number>;
  }): Promise<{
    summary: string;
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `Generate a positive and constructive daily productivity summary for ${data.userName}.

DATE: ${data.date}

ACTIVITY DATA:
- Total active time: ${data.productiveHours.toFixed(1)} hours
- Screenshots analyzed: ${data.analyzed} / ${data.totalScreenshots}

Top Activities:
${data.topActivities.map((a) => `- ${a.category}: ${a.percentage}% (${a.hours} hours)`).join('\n')}

Activity Breakdown:
${Object.entries(data.activityBreakdown)
  .filter(([_, count]) => count > 0)
  .map(([category, count]) => `- ${category}: ${count} instances`)
  .join('\n')}

Generate a JSON response with the following structure:
{
  "summary": "2-3 sentence overview of the day in a positive, encouraging tone",
  "insights": ["3-4 specific patterns or observations about productivity"],
  "recommendations": ["2-3 actionable suggestions for improvement"]
}

Guidelines:
- Be positive and constructive
- Focus on strengths before areas for improvement
- Make recommendations specific and actionable
- Use professional but friendly language
- Celebrate productive hours
- Acknowledge focused work periods`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a supportive productivity coach helping employees understand their work patterns.
Your tone is positive, constructive, and focused on growth. You celebrate wins and gently suggest improvements.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 512,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content || '{}';

      try {
        const parsed = JSON.parse(content);

        return {
          summary: parsed.summary || 'Unable to generate summary',
          insights: Array.isArray(parsed.insights) ? parsed.insights : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        };
      } catch {
        console.error('[TimelineGenerator] Failed to parse AI response:', content);

        // Fallback narrative
        return {
          summary: `You logged ${data.productiveHours.toFixed(1)} productive hours on ${data.date}. Your top activity was ${data.topActivities[0]?.category || 'work'}.`,
          insights: ['Activity data captured successfully'],
          recommendations: ['Continue maintaining your current work patterns'],
        };
      }
    } catch (error) {
      console.error('[TimelineGenerator] AI narrative generation failed:', error);

      // Fallback narrative
      return {
        summary: `You logged ${data.productiveHours.toFixed(1)} productive hours on ${data.date}.`,
        insights: ['Activity data captured'],
        recommendations: ['Keep up the good work'],
      };
    }
  }

  /**
   * Batch generate reports for all employees on a specific date
   *
   * @param date - Date in YYYY-MM-DD format
   * @returns Number of successfully generated reports
   */
  async batchGenerateReports(date: string): Promise<number> {
    try {
      // Get all employees who have screenshots for this date
      const { data: employeeScreenshots, error } = await this.supabase
        .from('employee_screenshots')
        .select('user_id')
        .gte('captured_at', `${date}T00:00:00Z`)
        .lt('captured_at', `${date}T23:59:59Z`)
        .eq('is_deleted', false);

      if (error) {
        throw this.createError(
          'Failed to fetch employees for batch report generation',
          'REPORT_GENERATION_FAILED',
          { date, error }
        );
      }

      if (!employeeScreenshots || employeeScreenshots.length === 0) {
        console.log(`[TimelineGenerator] No employees with activity on ${date}`);
        return 0;
      }

      // Get unique employee IDs
      const uniqueEmployees = [...new Set(employeeScreenshots.map((e) => e.user_id))];

      console.log(
        `[TimelineGenerator] Generating reports for ${uniqueEmployees.length} employees on ${date}`
      );

      let generatedCount = 0;

      // Process each employee
      for (const userId of uniqueEmployees) {
        try {
          // Check if report already exists
          const { data: existingReport } = await this.supabase
            .from('productivity_reports')
            .select('id')
            .eq('user_id', userId)
            .eq('date', date)
            .single();

          if (existingReport) {
            console.log(`[TimelineGenerator] Report already exists for ${userId} on ${date}`);
            continue;
          }

          // Generate report
          await this.generateDailyReport(userId, date);
          generatedCount++;

          console.log(`[TimelineGenerator] Generated report for ${userId} (${generatedCount}/${uniqueEmployees.length})`);
        } catch (error) {
          console.error(`[TimelineGenerator] Failed to generate report for ${userId}:`, error);
          // Continue with next employee
        }
      }

      console.log(
        `[TimelineGenerator] Batch generation complete: ${generatedCount}/${uniqueEmployees.length} reports generated`
      );

      return generatedCount;
    } catch (error) {
      if (error instanceof Error && error.name === 'ProductivityError') {
        throw error;
      }

      throw this.createError(
        `Batch report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'REPORT_GENERATION_FAILED',
        { date, error }
      );
    }
  }

  /**
   * Create a ProductivityError
   *
   * @param message - Error message
   * @param code - Error code
   * @param details - Additional error details
   * @returns ProductivityError instance
   * @private
   */
  private createError(
    message: string,
    code: keyof typeof ProductivityErrorCodes,
    details?: Record<string, unknown>
  ): ProductivityError {
    const error = new Error(message) as ProductivityError;
    error.name = 'ProductivityError';
    error.code = code;
    error.details = details;
    return error;
  }
}
