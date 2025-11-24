/**
 * CoordinatorAgent
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 5)
 * Story: AI-GURU-001 - Coordinator Agent
 *
 * Routes student questions to the appropriate specialist agent.
 * Detects escalations and notifies trainers via Slack.
 *
 * @module lib/ai/agents/guru/CoordinatorAgent
 */

import { BaseAgent, type AgentConfig } from '../BaseAgent';
import { CodeMentorAgent } from './CodeMentorAgent';
import { ResumeBuilderAgent } from './ResumeBuilderAgent';
import { ProjectPlannerAgent } from './ProjectPlannerAgent';
import { InterviewCoachAgent } from './InterviewCoachAgent';
import { getSupabaseClient } from "./supabase-client";
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Query classification result
 */
interface Classification {
  category: 'code_question' | 'resume_help' | 'project_planning' | 'interview_prep';
  confidence: number;
  reasoning?: string;
}

/**
 * Coordinator input
 */
export interface CoordinatorInput {
  question: string;
  studentId: string;
  conversationId?: string;
  currentModule?: string;
}

/**
 * Coordinator output
 */
export interface CoordinatorOutput {
  answer: string;
  agentUsed: 'code_mentor' | 'resume_builder' | 'project_planner' | 'interview_coach';
  conversationId: string;
  escalated: boolean;
  tokensUsed: number;
  cost: number;
  classification?: Classification;
}

/**
 * Coordinator Agent
 *
 * Intelligent routing layer that:
 * 1. Classifies student questions (GPT-4o-mini)
 * 2. Routes to appropriate specialist agent
 * 3. Detects stuck students (5+ same questions)
 * 4. Escalates to human trainers via Slack
 *
 * Performance: <500ms classification, <2s end-to-end
 */
export class CoordinatorAgent extends BaseAgent<CoordinatorInput, CoordinatorOutput> {
  private codeMentor: CodeMentorAgent;
  private resumeBuilder: ResumeBuilderAgent;
  private projectPlanner: ProjectPlannerAgent;
  private interviewCoach: InterviewCoachAgent;

  constructor(config?: Partial<AgentConfig>) {
    super({
      agentName: 'CoordinatorAgent',
      enableCostTracking: true,
      enableMemory: false, // Coordinator doesn't need memory (agents do)
      enableRAG: false, // Coordinator doesn't need RAG (agents do)
      ...config,
    });

    // Initialize specialist agents
    this.codeMentor = new CodeMentorAgent(config);
    this.resumeBuilder = new ResumeBuilderAgent(config);
    this.projectPlanner = new ProjectPlannerAgent(config);
    this.interviewCoach = new InterviewCoachAgent(config);
  }

  /**
   * Execute routing logic
   *
   * @param input - Student question and context
   * @returns Response from appropriate specialist agent
   */
  async execute(input: CoordinatorInput): Promise<CoordinatorOutput> {
    const startTime = performance.now();
    const conversationId = input.conversationId || `conv-${Date.now()}`;

    try {
      // Step 1: Classify the query (GPT-4o-mini for cost efficiency)
      const classification = await this.classifyQuery(input.question);

      // Step 2: Route to appropriate specialist agent
      let result: any;
      let agentUsed: CoordinatorOutput['agentUsed'];

      switch (classification.category) {
        case 'code_question':
          result = await this.codeMentor.execute({
            studentId: input.studentId,
            question: input.question,
            conversationId,
            currentModule: input.currentModule || 'general',
          });
          agentUsed = 'code_mentor';
          break;

        case 'resume_help':
          result = await this.resumeBuilder.execute({
            studentId: input.studentId,
            format: 'json', // Default format
            targetJobDescription: input.question,
            includeProjects: true,
            includeCertifications: true,
          });
          agentUsed = 'resume_builder';
          break;

        case 'project_planning':
          result = await this.projectPlanner.execute({
            studentId: input.studentId,
            projectType: 'Capstone Project',
            guidewireModule: input.currentModule || 'General',
            skillLevel: 3, // Default: intermediate (1-5 scale)
          });
          agentUsed = 'project_planner';
          break;

        case 'interview_prep':
          result = await this.interviewCoach.execute({
            studentId: input.studentId,
            interviewType: 'behavioral', // Default
            guidewireModule: input.currentModule,
          });
          agentUsed = 'interview_coach';
          break;

        default:
          // Fallback to Code Mentor for ambiguous queries
          result = await this.codeMentor.execute({
            studentId: input.studentId,
            question: input.question,
            conversationId,
            currentModule: input.currentModule || 'General',
          });
          agentUsed = 'code_mentor';
      }

      // Step 3: Check for escalation triggers
      const shouldEscalate = await this.checkEscalation(input.studentId, input.question);
      if (shouldEscalate) {
        await this.escalateToTrainer(input, result, classification);
      }

      // Step 4: Build response
      const output: CoordinatorOutput = {
        answer: result.response || result.content || 'Response generated',
        agentUsed,
        conversationId,
        escalated: shouldEscalate,
        tokensUsed: result.tokensUsed || 0,
        cost: result.cost || 0,
        classification,
      };

      // Track coordinator cost
      const latencyMs = performance.now() - startTime;
      await this.trackCost(
        100, // Classification tokens (estimated)
        0.00002, // GPT-4o-mini cost ($0.15/1M input tokens)
        'gpt-4o-mini',
        latencyMs
      );

      await this.logCoordinatorInteraction({
        studentId: input.studentId,
        input,
        output,
        classification,
        latencyMs,
      });

      return output;
    } catch (error) {
      console.error('[CoordinatorAgent] Error:', error);
      throw new Error(
        `Coordinator failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Classify student query using GPT-4o-mini
   *
   * Performance: <200ms, Cost: ~$0.00002
   *
   * @param question - Student question
   * @returns Classification result
   */
  private async classifyQuery(question: string): Promise<Classification> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a query classifier for a Guidewire training platform.
Classify student questions into ONE category:

1. **code_question**: Technical Guidewire questions (PolicyCenter, ClaimCenter, BillingCenter, configuration, coding, debugging, architecture)
2. **resume_help**: Resume writing, formatting, job application assistance
3. **project_planning**: Capstone project planning, sprint breakdown, task estimation
4. **interview_prep**: Interview practice, behavioral questions, STAR method

Respond ONLY with valid JSON:
{
  "category": "code_question",
  "confidence": 0.95,
  "reasoning": "Question about PolicyCenter rating algorithm"
}`,
          },
          {
            role: 'user',
            content: `Classify this question: "${question}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No classification result');
      }

      return JSON.parse(content) as Classification;
    } catch (error) {
      console.warn('[CoordinatorAgent] Classification failed, using fallback:', error);
      // Fallback: Default to code_question
      return {
        category: 'code_question',
        confidence: 0.5,
        reasoning: 'Classification failed, defaulting to code mentor',
      };
    }
  }

  /**
   * Check if student should be escalated to human trainer
   *
   * Triggers:
   * - Same question asked 5+ times in 24 hours
   * - Student expressed frustration (TODO: sentiment analysis)
   *
   * @param studentId - Student ID
   * @param question - Current question
   * @returns True if should escalate
   */
  private async checkEscalation(studentId: string, question: string): Promise<boolean> {
    try {
      // Check for repeated questions (5+ times in 24 hours)
      const client = getSupabaseClient();

      // Defensive check for client
      if (!client || !client.from) {
        console.warn('[CoordinatorAgent] Supabase client not initialized correctly');
        return false;
      }

      const { count, error } = await client
        .from('guru_interactions')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .ilike('input', `%${question.substring(0, 50)}%`) // Match first 50 chars
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.warn('[CoordinatorAgent] Escalation check failed:', error);
        return false;
      }

      return (count || 0) >= 5;
    } catch (error) {
      console.warn('[CoordinatorAgent] Escalation check error:', error);
      return false;
    }
  }

  /**
   * Escalate to human trainer via Slack notification
   *
   * @param input - Original input
   * @param result - Agent result
   * @param classification - Query classification
   */
  private async escalateToTrainer(
    input: CoordinatorInput,
    result: any,
    classification: Classification
  ): Promise<void> {
    if (!process.env.SLACK_WEBHOOK_URL) {
      console.warn('[CoordinatorAgent] Slack webhook not configured, skipping escalation');
      return;
    }

    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: '#trainers',
          text: '🚨 Student Escalation Required',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🚨 Student Escalation',
                emoji: true,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Student:* ${input.studentId}\n*Issue:* Student appears stuck (5+ similar questions)\n*Category:* ${classification.category}\n*Module:* ${input.currentModule || 'Unknown'}`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Question:*\n>${input.question}`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*AI Response:*\n>${result.response?.substring(0, 200) || 'No response'}...`,
              },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'View Full Context',
                    emoji: true,
                  },
                  url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/escalations/${input.studentId}`,
                  style: 'primary',
                },
              ],
            },
          ],
        }),
      });

      console.log('[CoordinatorAgent] Escalation notification sent to Slack');
    } catch (error) {
      console.error('[CoordinatorAgent] Failed to send Slack notification:', error);
    }
  }

  /**
   * Log coordinator interaction
   */
  private async logCoordinatorInteraction(data: {
    studentId: string;
    input: CoordinatorInput;
    output: CoordinatorOutput;
    classification: Classification;
    latencyMs: number;
  }): Promise<void> {
    try {
      console.log('[CoordinatorAgent] Logging interaction for:', data.studentId);
      const { error } = await getSupabaseClient().from('guru_interactions').insert({
        org_id: this.config.orgId || 'default',
        student_id: data.studentId,
        agent_type: data.output.agentUsed,
        conversation_id: data.output.conversationId,
        input: data.input as any,
        output: {
          ...data.output,
          classification: data.classification,
          routed_to: data.output.agentUsed,
          escalated: data.output.escalated,
        } as any,
        model_used: 'gpt-4o-mini',
        tokens_used: 100, // Estimated
        cost_usd: 0.00002, // Estimated
        latency_ms: Math.round(data.latencyMs),
      });

      if (error) {
        console.error('[CoordinatorAgent] Supabase INSERT error:', error);
      } else {
        console.log('[CoordinatorAgent] Interaction logged successfully');
      }
    } catch (error) {
      console.error('[CoordinatorAgent] Failed to log interaction (exception):', error);
    }
  }
}
