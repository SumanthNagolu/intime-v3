/**
 * ActivityClassifier Service
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 4)
 * Story: AI-PROD-002 - Activity Classification
 *
 * Classifies employee activities from screenshots using GPT-4o-mini vision API.
 *
 * @module lib/ai/productivity/ActivityClassifier
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import type {
  ActivityCategory,
  ActivityClassification,
  IActivityClassifier,
  DailyActivitySummary,
  ProductivityError,
} from '@/types/productivity';
import { ProductivityErrorCodes } from '@/types/productivity';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Activity Classifier
 *
 * Uses GPT-4o-mini vision API to classify screenshots into activity categories.
 * Cost-optimized with batch processing and rate limiting.
 */
export class ActivityClassifier implements IActivityClassifier {
  private readonly BATCH_SIZE = 10; // Process 10 at a time (rate limiting)
  private readonly RATE_LIMIT_DELAY = 1000; // 1 second delay between batches

  /**
   * Classify a single screenshot by ID
   *
   * @param screenshotId - UUID of screenshot to classify
   * @returns Activity classification result
   * @throws ProductivityError if classification fails
   */
  async classifyScreenshot(
    screenshotId: string
  ): Promise<ActivityClassification> {
    try {
      // Get screenshot metadata
      const { data: screenshot, error } = await supabase
        .from('employee_screenshots')
        .select('*')
        .eq('id', screenshotId)
        .single();

      if (error || !screenshot) {
        throw this.createError(
          'Screenshot not found',
          'CLASSIFICATION_FAILED',
          { screenshotId, error }
        );
      }

      // Get signed URL for screenshot (60s expiry for AI classification)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('employee-screenshots')
        .createSignedUrl(screenshot.filename, 60);

      if (urlError || !signedUrlData) {
        throw this.createError(
          'Failed to create signed URL for screenshot',
          'CLASSIFICATION_FAILED',
          { screenshotId, error: urlError }
        );
      }

      // Classify using GPT-4o-mini vision
      const classification = await this.classifyImage(signedUrlData.signedUrl);

      // Update screenshot record with classification
      const { error: updateError } = await supabase
        .from('employee_screenshots')
        .update({
          analyzed: true,
          activity_category: classification.category,
          confidence: classification.confidence,
          reasoning: classification.reasoning,
          updated_at: new Date().toISOString(),
        })
        .eq('id', screenshotId);

      if (updateError) {
        console.error('[ActivityClassifier] Failed to update screenshot:', updateError);
        // Don't throw - classification succeeded, just logging failed
      }

      return {
        ...classification,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'ProductivityError') {
        throw error;
      }

      throw this.createError(
        `Failed to classify screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CLASSIFICATION_FAILED',
        { screenshotId, error }
      );
    }
  }

  /**
   * Classify image using OpenAI GPT-4o-mini vision API
   *
   * @param imageUrl - Signed URL of image to classify
   * @returns Classification result without timestamp
   * @private
   */
  private async classifyImage(
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
- coding: Writing/editing code (IDE, text editor with code)
- email: Reading/writing emails (Gmail, Outlook, etc.)
- meeting: Video calls (Zoom, Teams, Google Meet)
- documentation: Writing docs, wikis, markdown files
- research: Reading articles, Stack Overflow, documentation sites
- social_media: Twitter, LinkedIn, Reddit, non-work sites
- idle: No activity, lock screen, blank screen

Return ONLY a JSON object:
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
        temperature: 0.3,
        response_format: { type: 'json_object' }, // Enforce JSON response
      });

      const content = response.choices[0].message.content || '{}';

      try {
        const parsed = JSON.parse(content);

        // Validate response structure
        if (!parsed.category || !parsed.confidence || !parsed.reasoning) {
          throw new Error('Invalid response structure from OpenAI');
        }

        return {
          category: parsed.category as ActivityCategory,
          confidence: Number(parsed.confidence),
          reasoning: parsed.reasoning,
        };
      } catch (parseError) {
        console.error('[ActivityClassifier] Failed to parse OpenAI response:', content);

        // Fallback classification
        return {
          category: 'idle',
          confidence: 0.1,
          reasoning: 'Failed to parse classification response',
        };
      }
    } catch (error) {
      console.error('[ActivityClassifier] OpenAI API error:', error);

      // Fallback classification
      return {
        category: 'idle',
        confidence: 0.1,
        reasoning: `API error: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Batch classify screenshots for a user on a specific date
   *
   * Processes screenshots in batches with rate limiting to avoid API limits.
   *
   * @param userId - User ID to classify screenshots for
   * @param date - Date in YYYY-MM-DD format
   * @returns Number of successfully classified screenshots
   */
  async batchClassify(userId: string, date: string): Promise<number> {
    try {
      // Get unanalyzed screenshots for user on date
      const { data: screenshots, error } = await supabase
        .from('employee_screenshots')
        .select('id')
        .eq('user_id', userId)
        .gte('captured_at', `${date}T00:00:00Z`)
        .lt('captured_at', `${date}T23:59:59Z`)
        .eq('analyzed', false)
        .eq('is_deleted', false)
        .order('captured_at', { ascending: true });

      if (error) {
        throw this.createError(
          'Failed to fetch screenshots for classification',
          'CLASSIFICATION_FAILED',
          { userId, date, error }
        );
      }

      if (!screenshots || screenshots.length === 0) {
        console.log(`[ActivityClassifier] No unanalyzed screenshots for ${userId} on ${date}`);
        return 0;
      }

      console.log(
        `[ActivityClassifier] Classifying ${screenshots.length} screenshots for ${userId} on ${date}`
      );

      let classifiedCount = 0;

      // Process in batches with rate limiting
      for (let i = 0; i < screenshots.length; i += this.BATCH_SIZE) {
        const batch = screenshots.slice(i, i + this.BATCH_SIZE);

        // Process batch in parallel
        const results = await Promise.allSettled(
          batch.map((screenshot) => this.classifyScreenshot(screenshot.id))
        );

        // Count successes
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            classifiedCount++;
          } else {
            console.error(
              `[ActivityClassifier] Failed to classify ${batch[index].id}:`,
              result.reason
            );
          }
        });

        // Rate limiting: wait before next batch (GPT-4o-mini: 500 requests/min max)
        if (i + this.BATCH_SIZE < screenshots.length) {
          await new Promise((resolve) => setTimeout(resolve, this.RATE_LIMIT_DELAY));
        }
      }

      console.log(
        `[ActivityClassifier] Classified ${classifiedCount}/${screenshots.length} screenshots`
      );

      return classifiedCount;
    } catch (error) {
      if (error instanceof Error && error.name === 'ProductivityError') {
        throw error;
      }

      throw this.createError(
        `Batch classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CLASSIFICATION_FAILED',
        { userId, date, error }
      );
    }
  }

  /**
   * Get daily activity summary for a user
   *
   * Aggregates activity data for a specific date.
   *
   * @param userId - User ID to get summary for
   * @param date - Date in YYYY-MM-DD format
   * @returns Daily activity summary
   */
  async getDailySummary(
    userId: string,
    date: string
  ): Promise<DailyActivitySummary> {
    try {
      const { data: screenshots, error } = await supabase
        .from('employee_screenshots')
        .select('activity_category, confidence, analyzed')
        .eq('user_id', userId)
        .gte('captured_at', `${date}T00:00:00Z`)
        .lt('captured_at', `${date}T23:59:59Z`)
        .eq('is_deleted', false);

      if (error) {
        throw this.createError(
          'Failed to fetch screenshots for summary',
          'CLASSIFICATION_FAILED',
          { userId, date, error }
        );
      }

      if (!screenshots || screenshots.length === 0) {
        return {
          totalScreenshots: 0,
          analyzed: 0,
          byCategory: {
            coding: 0,
            email: 0,
            meeting: 0,
            documentation: 0,
            research: 0,
            social_media: 0,
            idle: 0,
          },
          productiveHours: 0,
        };
      }

      // Aggregate by category
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

      // Calculate productive hours (30s per screenshot)
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

      const productiveHours = (productiveScreenshots * 30) / 3600; // 30s per screenshot → hours

      return {
        totalScreenshots: screenshots.length,
        analyzed: screenshots.filter((s) => s.analyzed).length,
        byCategory,
        productiveHours: Math.round(productiveHours * 100) / 100, // Round to 2 decimals
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'ProductivityError') {
        throw error;
      }

      throw this.createError(
        `Failed to generate daily summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'REPORT_GENERATION_FAILED',
        { userId, date, error }
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
    details?: any
  ): ProductivityError {
    const error = new Error(message) as ProductivityError;
    error.name = 'ProductivityError';
    error.code = code;
    error.details = details;
    return error;
  }
}
