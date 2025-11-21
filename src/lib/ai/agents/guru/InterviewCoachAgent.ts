/**
 * InterviewCoachAgent
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 3)
 * Story: AI-GURU-004 - Interview Coach Agent
 *
 * Conducts mock interviews and provides STAR method feedback.
 *
 * @module lib/ai/agents/guru/InterviewCoachAgent
 */

import { BaseAgent, type AgentConfig } from '../BaseAgent';
import type {
  InterviewCoachInput,
  InterviewCoachOutput,
  GuruError,
} from '@/types/guru';
import { GuruErrorCodes } from '@/types/guru';
import { loadPromptTemplate } from '../../prompts';
import { getSupabaseClient } from "./supabase-client";
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Interview Coach Agent
 *
 * Features:
 * - Mock interview question generation
 * - STAR method training (Situation, Task, Action, Result)
 * - Answer evaluation and scoring (1-10)
 * - Detailed feedback and improvement suggestions
 * - Guidewire-specific technical questions
 */
export class InterviewCoachAgent extends BaseAgent<
  InterviewCoachInput,
  InterviewCoachOutput
> {
  constructor(config?: Partial<AgentConfig>) {
    super({
      agentName: 'InterviewCoachAgent',
      enableCostTracking: true,
      enableMemory: true, // Remember interview session
      enableRAG: false,
      ...config,
    });
  }

  /**
   * Execute interview coaching
   *
   * @param input - Interview type and student answer (optional)
   * @returns Question or evaluation
   */
  async execute(input: InterviewCoachInput): Promise<InterviewCoachOutput> {
    const startTime = performance.now();

    try {
      // Validate input
      this.validateInput(input);

      // Route to optimal model
      const model = await this.routeModel('Interview coaching and evaluation');

      let output: InterviewCoachOutput;

      if (input.answer && input.questionId) {
        // Evaluate answer
        output = await this.evaluateAnswer(input, model.model);
      } else {
        // Generate next question
        output = await this.generateQuestion(input, model.model);
      }

      // Track cost
      const latencyMs = performance.now() - startTime;
      await this.trackCost(800, 0.002, model.model, latencyMs);

      return output;
    } catch (error) {
      throw this.createGuruError(
        `Failed to process interview coaching: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AGENT_FAILED',
        { input, error }
      );
    }
  }

  /**
   * Validate input
   */
  private validateInput(input: InterviewCoachInput): void {
    if (!input.studentId || !input.interviewType) {
      throw this.createGuruError(
        'Missing required fields: studentId, interviewType',
        'VALIDATION_FAILED',
        { input }
      );
    }
  }

  /**
   * Generate interview question
   */
  private async generateQuestion(
    input: InterviewCoachInput,
    model: string
  ): Promise<InterviewCoachOutput> {
    const sessionId = input.sessionId || `session-${Date.now()}`;
    const promptTemplate = loadPromptTemplate('interview_coach');

    const prompt = `Generate a ${input.interviewType} interview question for a Guidewire developer.
${input.guidewireModule ? `Focus on: ${input.guidewireModule}` : ''}

Return JSON format:
{
  "question": "Your interview question here",
  "type": "${input.interviewType}",
  "difficulty": "medium",
  "starComponents": ${input.interviewType === 'behavioral' ? '{ "situation": "hint", "task": "hint", "action": "hint", "result": "hint" }' : 'null'}
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: promptTemplate,
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
    const parsed = JSON.parse(content);

    const questionId = `q-${Date.now()}`;

    return {
      sessionId,
      question: parsed.question,
      questionId,
      starComponents:
        input.interviewType === 'behavioral' ? parsed.starComponents : undefined,
    };
  }

  /**
   * Evaluate answer using STAR method (for behavioral) or technical accuracy
   */
  private async evaluateAnswer(
    input: InterviewCoachInput,
    model: string
  ): Promise<InterviewCoachOutput> {
    const promptTemplate = loadPromptTemplate('interview_coach');

    const prompt = `Evaluate this interview answer on a scale of 1-10.

QUESTION ID: ${input.questionId}
ANSWER: ${input.answer}
TYPE: ${input.interviewType}

Provide scores for:
1. Overall (1-10)
2. Technical accuracy (1-10)
3. Communication clarity (1-10)
4. Confidence/STAR method (1-10)

Also provide:
- 3-5 specific feedback points
- 2-3 improvement suggestions

Return JSON format:
{
  "score": {
    "overall": 7,
    "technical": 8,
    "communication": 7,
    "confidence": 6
  },
  "feedback": ["Feedback 1", "Feedback 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: promptTemplate,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(content);

    return {
      sessionId: input.sessionId || `session-${Date.now()}`,
      question: '', // Already asked
      questionId: input.questionId || '',
      score: parsed.score,
      feedback: parsed.feedback,
      suggestions: parsed.suggestions,
    };
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
