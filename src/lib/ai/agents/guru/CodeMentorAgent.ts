/**
 * CodeMentorAgent
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 3)
 * Story: AI-GURU-001 - Code Mentor Agent
 *
 * Socratic method teaching agent for Guidewire students.
 * Never gives direct answers - guides with questions and hints.
 *
 * @module lib/ai/agents/guru/CodeMentorAgent
 */

import { BaseAgent, type AgentConfig } from '../BaseAgent';
import type {
  CodeMentorInput,
  CodeMentorOutput,
  GuruError,
  StudentProgress,
} from '@/types/guru';
import { GuruErrorCodes } from '@/types/guru';
import { loadPromptTemplate } from '../../prompts';
import { getSupabaseClient } from "./supabase-client";
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Code Mentor Agent
 *
 * Uses Socratic method to guide students to discover solutions themselves.
 * Integrates with RAG for Guidewire documentation and memory for conversation context.
 *
 * Features:
 * - Socratic questioning (never gives direct answers)
 * - RAG search for relevant documentation
 * - Conversation memory for context
 * - Progress tracking
 * - Helpful rating collection
 */
export class CodeMentorAgent extends BaseAgent<CodeMentorInput, CodeMentorOutput> {
  constructor(config?: Partial<AgentConfig>) {
    super({
      agentName: 'CodeMentorAgent',
      enableCostTracking: true,
      enableMemory: true,
      enableRAG: true,
      ...config,
    });
  }

  /**
   * Execute code mentoring session
   *
   * @param input - Student question and context
   * @returns Socratic response with hints
   */
  async execute(input: CodeMentorInput): Promise<CodeMentorOutput> {
    const startTime = performance.now();
    const conversationId = input.conversationId || `conv-${Date.now()}`;

    try {
      // Validate input
      this.validateInput(input);

      // Get student progress
      const progress = await this.getStudentProgress(input.studentId);

      // Route to optimal model (Claude Sonnet for reasoning)
      const model = await this.routeModel(
        `Socratic teaching for ${input.currentModule} module question`
      );

      // Search knowledge base for relevant documentation
      const relevantDocs = await this.searchDocumentation(
        input.question,
        input.currentModule
      );

      // Retrieve conversation context
      const conversationHistory = await this.rememberContext(conversationId);

      // Load prompt template
      const promptTemplate = loadPromptTemplate('code_mentor');

      // Build prompt with context
      const systemPrompt = promptTemplate
        .replace('{{studentName}}', progress?.studentId || 'Student')
        .replace('{{currentModule}}', input.currentModule)
        .replace('{{completedModules}}', progress?.completedModules.join(', ') || 'None')
        .replace('{{struggleArea}}', progress?.struggleAreas.join(', ') || 'Unknown');

      const userPrompt = this.buildUserPrompt(
        input,
        relevantDocs,
        conversationHistory
      );

      // Generate Socratic response using Claude
      const response = await anthropic.messages.create({
        model: model.model,
        max_tokens: 1024,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const responseText =
        response.content[0].type === 'text' ? response.content[0].text : '';

      // Extract documentation hints and next steps
      const documentationHints = this.extractDocumentationHints(relevantDocs);
      const nextSteps = this.extractNextSteps(responseText);

      // Calculate cost and tokens
      const latencyMs = performance.now() - startTime;
      const tokens = response.usage.input_tokens + response.usage.output_tokens;
      const cost = this.calculateClaudeCost(
        response.usage.input_tokens,
        response.usage.output_tokens
      );

      const output: CodeMentorOutput = {
        response: responseText,
        conversationId,
        documentationHints,
        nextSteps,
        tokensUsed: tokens,
        cost,
      };

      await this.trackCost(tokens, cost, model.model, latencyMs);
      await this.logGuruInteraction({
        studentId: input.studentId,
        agentType: 'code_mentor',
        conversationId,
        input,
        output,
        modelUsed: model.model,
        tokensUsed: tokens,
        costUsd: cost,
        latencyMs,
      });

      // Update student progress
      await this.updateStudentProgress(input.studentId, input.currentModule);

      return output;
    } catch (error) {
      throw this.createGuruError(
        `Failed to process code mentor request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AGENT_FAILED',
        { input, error }
      );
    }
  }

  /**
   * Validate input
   */
  private validateInput(input: CodeMentorInput): void {
    if (!input.studentId || !input.question || !input.currentModule) {
      throw this.createGuruError(
        'Missing required fields: studentId, question, currentModule',
        'VALIDATION_FAILED',
        { input }
      );
    }
  }

  /**
   * Get student progress
   */
  private async getStudentProgress(
    studentId: string
  ): Promise<StudentProgress | null> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found (OK)
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        studentId: data.student_id,
        currentModule: data.current_module,
        completedModules: data.completed_modules || [],
        struggleAreas: data.struggle_areas || [],
        lastActivityAt: data.last_activity_at,
        masteryScore: data.mastery_score,
      };
    } catch (error) {
      console.warn('[CodeMentorAgent] Failed to fetch student progress:', error);
      return null;
    }
  }

  /**
   * Search documentation using RAG
   */
  private async searchDocumentation(
    query: string,
    module: string
  ): Promise<any[]> {
    if (!this.hasRAG()) {
      return [];
    }

    try {
      const docs = await this.search(`${module}: ${query}`, {
        topK: 5,
        minSimilarity: 0.7,
      });

      return docs.map((doc) => ({
        content: doc.content,
        source: doc.metadata?.source || 'Unknown',
        similarity: doc.similarity,
      }));
    } catch (error) {
      console.warn('[CodeMentorAgent] RAG search failed:', error);
      return [];
    }
  }

  /**
   * Build user prompt with context
   */
  private buildUserPrompt(
    input: CodeMentorInput,
    relevantDocs: any[],
    conversationHistory: any[]
  ): string {
    let prompt = `STUDENT QUESTION:\n${input.question}\n\n`;

    if (input.codeContext) {
      prompt += `CODE CONTEXT:\n\`\`\`\n${input.codeContext}\n\`\`\`\n\n`;
    }

    if (relevantDocs.length > 0) {
      prompt += `RELEVANT DOCUMENTATION:\n`;
      relevantDocs.forEach((doc, i) => {
        prompt += `${i + 1}. ${doc.content.substring(0, 200)}...\n   (Source: ${doc.source})\n\n`;
      });
    }

    if (conversationHistory.length > 0) {
      prompt += `CONVERSATION HISTORY:\n`;
      conversationHistory.slice(-5).forEach((msg) => {
        prompt += `${msg.role}: ${msg.content.substring(0, 150)}...\n`;
      });
      prompt += `\n`;
    }

    prompt += `\nRemember: Use Socratic method. Ask questions, don't give answers.`;

    return prompt;
  }

  /**
   * Extract documentation hints
   */
  private extractDocumentationHints(docs: any[]): string[] {
    return docs
      .slice(0, 3)
      .map((doc) => `${doc.source}: ${doc.content.substring(0, 100)}...`);
  }

  /**
   * Extract next steps from response
   */
  private extractNextSteps(response: string): string[] {
    // Simple extraction: look for numbered lists or action verbs
    const lines = response.split('\n');
    const steps: string[] = [];

    lines.forEach((line) => {
      if (/^\d+\./.test(line) || /^-/.test(line)) {
        steps.push(line.replace(/^\d+\.\s*|-\s*/, '').trim());
      }
    });

    return steps.slice(0, 3); // Top 3 steps
  }

  /**
   * Calculate Claude cost
   */
  private calculateClaudeCost(inputTokens: number, outputTokens: number): number {
    // Claude Sonnet pricing: $3/M input, $15/M output
    const inputCost = (inputTokens / 1_000_000) * 3;
    const outputCost = (outputTokens / 1_000_000) * 15;
    return inputCost + outputCost;
  }

  /**
   * Log guru interaction
   */
  private async logGuruInteraction(data: {
    studentId: string;
    agentType: string;
    conversationId?: string;
    input: any;
    output: any;
    modelUsed: string;
    tokensUsed: number;
    costUsd: number;
    latencyMs: number;
  }): Promise<void> {
    try {
      await getSupabaseClient().from('guru_interactions').insert({
        org_id: this.config.orgId || 'default',
        student_id: data.studentId,
        agent_type: data.agentType,
        conversation_id: data.conversationId,
        input: data.input,
        output: data.output,
        model_used: data.modelUsed,
        tokens_used: data.tokensUsed,
        cost_usd: data.costUsd,
        latency_ms: data.latencyMs,
      });
    } catch (error) {
      console.error('[CodeMentorAgent] Failed to log interaction:', error);
    }
  }

  /**
   * Update student progress
   */
  private async updateStudentProgress(
    studentId: string,
    currentModule: string
  ): Promise<void> {
    try {
      const { error } = await getSupabaseClient()
        .from('student_progress')
        .upsert(
          {
            student_id: studentId,
            current_module: currentModule,
            last_activity_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'student_id' }
        );

      if (error) {
        console.error('[CodeMentorAgent] Failed to update progress:', error);
      }
    } catch (error) {
      console.error('[CodeMentorAgent] Failed to update progress:', error);
    }
  }

  /**
   * Create GuruError
   */
  private createGuruError(
    message: string,
    code: keyof typeof GuruErrorCodes,
    details?: any
  ): GuruError {
    const error = new Error(message) as GuruError;
    error.name = 'GuruError';
    error.code = code;
    error.details = details;
    return error;
  }
}
