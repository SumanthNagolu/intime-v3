/**
 * AI Prompts
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 2)
 * Story: AI-INF-006 - Prompt Library
 *
 * Exports for prompt template management.
 *
 * @module lib/ai/prompts
 */

import { join } from 'path';
import * as fs from 'fs';

export * from './library';

/**
 * Helper function to load prompt template (synchronous text reading)
 * Used by Guru agents for simple template loading
 *
 * @param templateName - Name of template file (without .txt extension)
 * @returns Template content as string
 */
export function loadPromptTemplate(templateName: string): string {
  const templatesDir = join(process.cwd(), 'src/lib/ai/prompts/templates');
  const filePath = join(templatesDir, `${templateName}.txt`);

  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Failed to load template ${templateName}:`, error);
    return `You are an AI assistant for InTime.`;
  }
}
