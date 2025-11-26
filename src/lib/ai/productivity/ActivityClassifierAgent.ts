/**
 * Activity Classifier Agent
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 7)
 * Story: AI-PROD-002 - Activity Classification
 *
 * Uses GPT-4o-mini vision to classify employee activities from screenshots.
 * Supports 7 activity categories with confidence scoring.
 *
 * @module lib/ai/productivity/ActivityClassifierAgent
 */

import { BaseAgent } from '../agents/BaseAgent';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Activity categories
 */
export type ActivityCategory =
  | 'coding'
  | 'email'
  | 'meeting'
  | 'documentation'
  | 'research'
  | 'social_media'
  | 'idle';

/**
 * Classification result
 */
export interface ActivityClassification {
  category: ActivityCategory;
  confidence: number; // 0-1
  reasoning: string;
  timestamp: string;
}

/**
 * Daily activity summary
 */
export interface DailySummary {
  totalScreenshots: number;
  analyzed: number;
  byCategory: Record<ActivityCategory, number>;
  productiveHours: number;
}

/**
 * Activity Classifier Agent
 *
 * Classifies screenshots into activity categories using GPT-4o-mini vision.
 *
 * @example
 * ```typescript
 * const classifier = new ActivityClassifierAgent();
 * const result = await classifier.classifyScreenshot('screenshot-id');
 * console.log(result.category, result.confidence);
 * ```
 */
export class ActivityClassifierAgent extends BaseAgent<string, ActivityClassification> {
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    super({
      agentName: 'activity_classifier',
      enableCostTracking: true,
      metadata: {
        model: 'gpt-4o-mini',
        useCase: 'productivity_tracking',
      },
    });
    this.supabase = supabase;
  }

  /**
   * Main execution: Classify a screenshot
   */
  async execute(screenshotId: string): Promise<ActivityClassification> {
    return this.classifyScreenshot(screenshotId);
  }

  /**
   * Classify single screenshot
   */
  async classifyScreenshot(screenshotId: string): Promise<ActivityClassification> {
    const startTime = Date.now();

    try {
      // Get screenshot metadata
      const { data: screenshot, error } = await this.supabase
        .from('employee_screenshots')
        .select('*')
        .eq('id', screenshotId)
        .single();

      if (error || !screenshot) {
        throw new Error(`Screenshot not found: ${screenshotId}`);
      }

      // Get signed URL for screenshot (60 second expiry)
      const { data: signedUrlData, error: urlError } = await this.supabase.storage
        .from('employee-screenshots')
        .createSignedUrl(screenshot.filename, 60);

      if (urlError || !signedUrlData) {
        throw new Error(`Failed to create signed URL: ${urlError?.message}`);
      }

      // Classify using GPT-4o-mini vision
      const classification = await this.classify(signedUrlData.signedUrl);

      // Update screenshot record
      await this.supabase
        .from('employee_screenshots')
        .update({
          analyzed: true,
          activity_category: classification.category,
          confidence: classification.confidence,
          analyzed_at: new Date().toISOString(),
        })
        .eq('id', screenshotId);

      const latencyMs = Date.now() - startTime;

      // Log interaction
      await this.logInteraction({
        type: 'screenshot_classification',
        model: 'gpt-4o-mini',
        latencyMs,
        metadata: {
          screenshotId,
          category: classification.category,
          confidence: classification.confidence,
        },
      });

      return {
        ...classification,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[ActivityClassifierAgent] Error classifying ${screenshotId}:`, error);
      throw error;
    }
  }

  /**
   * Classify using GPT-4o-mini vision API
   */
  private async classify(
    imageUrl: string
  ): Promise<Omit<ActivityClassification, 'timestamp'>> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Classify the activity shown in this screenshot into ONE category:

CATEGORIES:
- coding: Writing/editing code (IDE, text editor with code, terminal with development commands)
- email: Reading/writing emails (Gmail, Outlook, Apple Mail, etc.)
- meeting: Video calls or screen shares (Zoom, Teams, Google Meet, Slack huddle)
- documentation: Writing docs, wikis, markdown files, technical writing
- research: Reading articles, Stack Overflow, documentation sites, tutorials
- social_media: Twitter, LinkedIn, Reddit, Facebook, non-work browsing
- idle: No activity visible, lock screen, blank screen, screensaver

INSTRUCTIONS:
1. Analyze the screenshot carefully
2. Choose the MOST LIKELY category based on visible elements
3. Provide confidence score (0.0-1.0) based on clarity of evidence
4. Give brief reasoning for your choice

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "category": "coding",
  "confidence": 0.95,
  "reasoning": "Visual Studio Code open with TypeScript file visible"
}`,
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 150,
        temperature: 0.3, // Low temperature for consistent classification
      });

      const content = response.choices[0].message.content?.trim() || '{}';

      try {
        // Parse JSON response
        const parsed = JSON.parse(content);

        // Validate response
        if (!parsed.category || !parsed.confidence || !parsed.reasoning) {
          throw new Error('Invalid response format');
        }

        // Ensure confidence is in valid range
        const confidence = Math.max(0, Math.min(1, parsed.confidence));

        return {
          category: parsed.category as ActivityCategory,
          confidence,
          reasoning: parsed.reasoning,
        };
      } catch (parseError) {
        console.error('[ActivityClassifierAgent] Failed to parse response:', content);

        // Fallback classification
        return {
          category: 'idle',
          confidence: 0.1,
          reasoning: 'Failed to classify - parse error',
        };
      }
    } catch (error) {
      console.error('[ActivityClassifierAgent] Vision API error:', error);

      // Fallback on API error
      return {
        category: 'idle',
        confidence: 0.1,
        reasoning: 'Failed to classify - API error',
      };
    }
  }

  /**
   * Batch classify screenshots for a user on a specific date
   */
  async batchClassify(userId: string, date: string): Promise<number> {
    console.log(`[ActivityClassifierAgent] Starting batch classification for ${userId} on ${date}`);

    // Get unanalyzed screenshots
    const { data: screenshots, error } = await this.supabase
      .from('employee_screenshots')
      .select('id')
      .eq('user_id', userId)
      .gte('captured_at', `${date}T00:00:00Z`)
      .lt('captured_at', `${date}T23:59:59Z`)
      .eq('analyzed', false)
      .is('deleted_at', null)
      .order('captured_at', { ascending: true });

    if (error) {
      console.error('[ActivityClassifierAgent] Error fetching screenshots:', error);
      throw error;
    }

    if (!screenshots || screenshots.length === 0) {
      console.log('[ActivityClassifierAgent] No unanalyzed screenshots found');
      return 0;
    }

    console.log(`[ActivityClassifierAgent] Processing ${screenshots.length} screenshots`);

    // Process in batches to avoid rate limits
    const BATCH_SIZE = 10;
    const DELAY_MS = 1000; // 1 second delay between batches
    let classified = 0;

    for (let i = 0; i < screenshots.length; i += BATCH_SIZE) {
      const batch = screenshots.slice(i, i + BATCH_SIZE);

      // Process batch in parallel
      const results = await Promise.allSettled(
        batch.map((screenshot) => this.classifyScreenshot(screenshot.id))
      );

      // Count successful classifications
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          classified++;
        } else {
          console.error('[ActivityClassifierAgent] Classification failed:', result.reason);
        }
      });

      console.log(
        `[ActivityClassifierAgent] Batch ${Math.floor(i / BATCH_SIZE) + 1} complete: ${classified}/${i + batch.length}`
      );

      // Rate limiting delay (GPT-4o-mini: 500 requests/min)
      if (i + BATCH_SIZE < screenshots.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    console.log(`[ActivityClassifierAgent] Batch classification complete: ${classified}/${screenshots.length}`);

    return classified;
  }

  /**
   * Get daily activity summary
   */
  async getDailySummary(userId: string, date: string): Promise<DailySummary> {
    const { data: screenshots, error } = await this.supabase
      .from('employee_screenshots')
      .select('activity_category, confidence')
      .eq('user_id', userId)
      .gte('captured_at', `${date}T00:00:00Z`)
      .lt('captured_at', `${date}T23:59:59Z`)
      .is('deleted_at', null);

    if (error) {
      console.error('[ActivityClassifierAgent] Error fetching summary:', error);
      throw error;
    }

    if (!screenshots || screenshots.length === 0) {
      return {
        totalScreenshots: 0,
        analyzed: 0,
        byCategory: {} as Record<ActivityCategory, number>,
        productiveHours: 0,
      };
    }

    // Count by category
    const byCategory: Record<ActivityCategory, number> = {
      coding: 0,
      email: 0,
      meeting: 0,
      documentation: 0,
      research: 0,
      social_media: 0,
      idle: 0,
    };

    screenshots.forEach((s) => {
      if (s.activity_category) {
        byCategory[s.activity_category as ActivityCategory]++;
      }
    });

    // Calculate productive hours (30 seconds per screenshot)
    const productiveCategories: ActivityCategory[] = [
      'coding',
      'email',
      'meeting',
      'documentation',
      'research',
    ];
    const productiveScreenshots = productiveCategories.reduce(
      (sum, cat) => sum + byCategory[cat],
      0
    );
    const productiveHours = (productiveScreenshots * 30) / 3600; // 30s → hours

    return {
      totalScreenshots: screenshots.length,
      analyzed: screenshots.filter((s) => s.activity_category !== null).length,
      byCategory,
      productiveHours,
    };
  }

  /**
   * Log interaction for cost tracking
   */
  protected async logInteraction(metadata: {
    type: string;
    model?: string;
    latencyMs?: number;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    // Estimate cost (GPT-4o-mini vision: ~$0.0015 per request)
    const estimatedCost = 0.0015;

    console.log(
      `[ActivityClassifierAgent] ${metadata.type}: ${metadata.latencyMs}ms, ~$${estimatedCost.toFixed(4)}`
    );

    // TODO: Log to Helicone or analytics system
  }
}
