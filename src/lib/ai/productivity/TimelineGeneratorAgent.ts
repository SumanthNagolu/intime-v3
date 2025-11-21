/**
 * Timeline Generator Agent
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 7)
 * Story: AI-PROD-003 - Daily Timeline Generator
 *
 * Generates narrative daily productivity reports from classified screenshot data.
 * Uses GPT-4o for high-quality writing with positive, constructive tone.
 *
 * @module lib/ai/productivity/TimelineGeneratorAgent
 */

import { BaseAgent } from '../agents/BaseAgent';
import { ActivityClassifierAgent, type DailySummary } from './ActivityClassifierAgent';
import { createClient } from '@/lib/supabase/client';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Daily productivity report
 */
export interface DailyReport {
  summary: string;
  productiveHours: number;
  topActivities: Array<{ category: string; percentage: number; hours: number }>;
  insights: string[];
  recommendations: string[];
  date: string;
}

/**
 * Timeline Generator Agent
 *
 * Generates AI-powered daily productivity timelines with insights and recommendations.
 *
 * @example
 * ```typescript
 * const generator = new TimelineGeneratorAgent();
 * const report = await generator.generateDailyReport('user-id', '2025-01-15');
 * console.log(report.summary);
 * ```
 */
export class TimelineGeneratorAgent extends BaseAgent<
  { userId: string; date: string },
  DailyReport
> {
  private supabase = createClient();
  private classifier = new ActivityClassifierAgent();

  constructor() {
    super({
      agentName: 'timeline_generator',
      enableCostTracking: true,
      metadata: {
        model: 'gpt-4o',
        useCase: 'productivity_timeline',
      },
    });
  }

  /**
   * Main execution: Generate daily report
   */
  async execute(input: { userId: string; date: string }): Promise<DailyReport> {
    return this.generateDailyReport(input.userId, input.date);
  }

  /**
   * Generate daily timeline report for a user
   */
  async generateDailyReport(userId: string, date: string): Promise<DailyReport> {
    const startTime = Date.now();

    try {
      console.log(`[TimelineGenerator] Generating report for ${userId} on ${date}`);

      // Get activity summary from classifier
      const summary: DailySummary = await this.classifier.getDailySummary(userId, date);

      if (summary.totalScreenshots === 0) {
        throw new Error('No screenshots found for this date');
      }

      // Calculate top activities
      const total = summary.totalScreenshots;
      const topActivities = Object.entries(summary.byCategory)
        .map(([category, count]) => ({
          category,
          count,
          percentage: Math.round((count / total) * 100),
          hours: (count * 30) / 3600, // 30 seconds per screenshot
        }))
        .filter((a) => a.percentage > 0)
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);

      // Generate narrative using GPT-4o
      const narrative = await this.generateNarrative({
        userId,
        date,
        productiveHours: summary.productiveHours,
        topActivities,
        totalScreenshots: total,
        analyzed: summary.analyzed,
      });

      const report: DailyReport = {
        summary: narrative.summary,
        productiveHours: summary.productiveHours,
        topActivities,
        insights: narrative.insights,
        recommendations: narrative.recommendations,
        date,
      };

      // Save report to database
      await this.saveReport(userId, date, report);

      const latencyMs = Date.now() - startTime;

      console.log(
        `[TimelineGenerator] Report generated for ${userId} in ${latencyMs}ms (${summary.productiveHours.toFixed(1)}h productive)`
      );

      return report;
    } catch (error) {
      console.error(`[TimelineGenerator] Error generating report:`, error);
      throw error;
    }
  }

  /**
   * Generate narrative using GPT-4o
   */
  private async generateNarrative(data: {
    userId: string;
    date: string;
    productiveHours: number;
    topActivities: Array<{ category: string; percentage: number; hours: number }>;
    totalScreenshots: number;
    analyzed: number;
  }): Promise<{
    summary: string;
    insights: string[];
    recommendations: string[];
  }> {
    const prompt = `Generate a personalized daily productivity report with a positive, constructive tone.

**Date:** ${data.date}

**Productivity Data:**
- Total active time tracked: ${data.productiveHours.toFixed(1)} hours
- Screenshots analyzed: ${data.analyzed} / ${data.totalScreenshots}

**Top Activities:**
${data.topActivities.map((a) => `- ${a.category}: ${a.percentage}% (${a.hours.toFixed(1)} hours)`).join('\n')}

**Instructions:**
1. Write a 2-3 sentence summary highlighting the employee's focus areas and productivity
2. Identify 2-3 specific insights (patterns, achievements, or notable observations)
3. Provide 1-2 actionable recommendations for tomorrow
4. Use a positive, motivating tone - focus on strengths and opportunities
5. Be specific to the data provided
6. Return as valid JSON

**Output Format:**
{
  "summary": "You had a productive day focused on coding (65% of time)...",
  "insights": [
    "Strong focus on coding with minimal interruptions",
    "Meeting time was 20% lower than your usual average",
    "Balanced mix of coding and documentation work"
  ],
  "recommendations": [
    "Consider blocking 9-11 AM tomorrow as dedicated focus time for your current project",
    "Your low meeting time today suggests good progress - try to maintain this balance"
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful productivity coach who provides positive, actionable insights. Always be encouraging and constructive.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0].message.content?.trim() || '{}';
      const parsed = JSON.parse(content);

      return {
        summary: parsed.summary || 'No summary available',
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      };
    } catch (error) {
      console.error('[TimelineGenerator] Error generating narrative:', error);

      // Fallback narrative
      return {
        summary: `You worked for ${data.productiveHours.toFixed(1)} hours today with focus on ${data.topActivities[0]?.category || 'various activities'}.`,
        insights: [`Primary activity: ${data.topActivities[0]?.category || 'unknown'} (${data.topActivities[0]?.percentage || 0}%)`],
        recommendations: ['Continue your current work patterns.'],
      };
    }
  }

  /**
   * Save report to database
   */
  private async saveReport(userId: string, date: string, report: DailyReport): Promise<void> {
    try {
      const { error } = await this.supabase.from('productivity_reports').upsert(
        {
          user_id: userId,
          date,
          summary: report.summary,
          productive_hours: report.productiveHours,
          top_activities: report.topActivities,
          insights: report.insights,
          recommendations: report.recommendations,
        },
        {
          onConflict: 'user_id,date',
        }
      );

      if (error) {
        console.error('[TimelineGenerator] Error saving report:', error);
        throw error;
      }

      console.log(`[TimelineGenerator] Report saved for ${userId} on ${date}`);
    } catch (error) {
      console.error('[TimelineGenerator] Database error:', error);
      throw error;
    }
  }

  /**
   * Batch generate reports for all employees with screenshots
   */
  async batchGenerateReports(date: string): Promise<number> {
    console.log(`[TimelineGenerator] Starting batch generation for ${date}`);

    // Get all users with classified screenshots for this date
    const { data: employees, error } = await this.supabase
      .from('employee_screenshots')
      .select('user_id')
      .gte('captured_at', `${date}T00:00:00Z`)
      .lt('captured_at', `${date}T23:59:59Z`)
      .eq('analyzed', true) // Only users with analyzed screenshots
      .is('deleted_at', null);

    if (error) {
      console.error('[TimelineGenerator] Error fetching employees:', error);
      throw error;
    }

    if (!employees || employees.length === 0) {
      console.log('[TimelineGenerator] No employees with analyzed screenshots found');
      return 0;
    }

    // Get unique user IDs
    const uniqueEmployees = [...new Set(employees.map((e) => e.user_id))];
    console.log(`[TimelineGenerator] Generating reports for ${uniqueEmployees.length} employees`);

    let generated = 0;
    let failed = 0;

    for (const userId of uniqueEmployees) {
      try {
        await this.generateDailyReport(userId, date);
        generated++;
      } catch (error) {
        console.error(`[TimelineGenerator] Failed for user ${userId}:`, error);
        failed++;
      }
    }

    console.log(
      `[TimelineGenerator] Batch complete: ${generated} generated, ${failed} failed`
    );

    return generated;
  }
}
