/**
 * Multi-Agent Orchestrator
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 2)
 * Story: AI-INF-007 - Multi-Agent Orchestrator
 *
 * Routes user queries to the appropriate specialist agent based on intent classification.
 * Supports agent handoff and context sharing.
 *
 * @module lib/ai/orchestrator
 */

import { BaseAgent } from './agents/BaseAgent';
import { AIRouter, type AITask } from './router';
import OpenAI from 'openai';

/**
 * Agent response
 */
export interface AgentResponse {
  /** Agent name that handled the query */
  agentName: string;
  /** Response text */
  response: string;
  /** Confidence in agent selection (0-1) */
  confidence: number;
  /** Suggested follow-up questions */
  followUps?: string[];
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Intent classification result
 */
export interface IntentClassification {
  /** Detected intent */
  intent: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Reasoning for classification */
  reasoning: string;
  /** Recommended agent */
  agentName: string;
}

/**
 * Available intents and their agent mappings
 */
const INTENT_AGENT_MAP: Record<string, string> = {
  code_help: 'CodeMentorAgent',
  resume_request: 'ResumeBuilderAgent',
  project_planning: 'ProjectPlannerAgent',
  interview_prep: 'InterviewCoachAgent',
  work_query: 'EmployeeTwin',
  general: 'GeneralAgent',
};

/**
 * Multi-Agent Orchestrator
 *
 * Intelligently routes queries to specialist agents.
 */
export class Orchestrator {
  private agents: Map<string, BaseAgent<any, any>>;
  private router: AIRouter;
  private openai: OpenAI;

  constructor() {
    this.agents = new Map();
    this.router = new AIRouter();
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Register an agent
   *
   * @param name - Agent name
   * @param agent - Agent instance
   *
   * @example
   * ```typescript
   * const orchestrator = new Orchestrator();
   * orchestrator.register('CodeMentorAgent', new CodeMentorAgent());
   * ```
   */
  register(name: string, agent: BaseAgent<any, any>): void {
    this.agents.set(name, agent);
    console.log(`[Orchestrator] Registered agent: ${name}`);
  }

  /**
   * Route query to appropriate agent
   *
   * @param query - User query
   * @param userId - User ID
   * @param context - Optional context
   * @returns Agent response
   *
   * @example
   * ```typescript
   * const response = await orchestrator.route(
   *   'How do I debug a NullPointerException in PolicyCenter?',
   *   'user_123'
   * );
   * console.log(response.agentName); // 'CodeMentorAgent'
   * console.log(response.response); // Socratic guidance...
   * ```
   */
  async route(
    query: string,
    userId: string,
    context?: Record<string, unknown>
  ): Promise<AgentResponse> {
    // 1. Classify intent
    const classification = await this.classifyIntent(query);

    console.log(
      `[Orchestrator] Intent: ${classification.intent} (${classification.confidence.toFixed(2)}) → ${classification.agentName}`
    );

    // 2. Get agent
    const agent = this.agents.get(classification.agentName);

    if (!agent) {
      // Fallback to general response
      return {
        agentName: 'OrchestratorFallback',
        response: `I understand you're asking about: "${query}". Unfortunately, I don't have a specialist agent configured for this type of request yet. Please try rephrasing or contact support.`,
        confidence: 0.3,
      };
    }

    // 3. Execute agent
    try {
      const result = await agent.execute({ query, userId, context });

      return {
        agentName: classification.agentName,
        response: result.response || result.toString(),
        confidence: classification.confidence,
        metadata: {
          intent: classification.intent,
          reasoning: classification.reasoning,
        },
      };
    } catch (error) {
      console.error(`[Orchestrator] Agent execution failed:`, error);

      return {
        agentName: classification.agentName,
        response: `I encountered an error while processing your request. Please try again or rephrase your question.`,
        confidence: 0.0,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Classify user intent
   *
   * Uses GPT-4o-mini for intent classification.
   *
   * @param query - User query
   * @returns Intent classification
   * @private
   */
  private async classifyIntent(query: string): Promise<IntentClassification> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an intent classifier for a Guidewire staffing platform.

Classify the user's query into ONE of these intents:

1. **code_help** - Questions about code, debugging, implementation
   Examples: "How do I implement...?", "What's wrong with this code?", "Debug help"

2. **resume_request** - Resume creation or optimization
   Examples: "Update my resume", "Create a resume", "Optimize my CV"

3. **project_planning** - Project breakdown, sprint planning, estimation
   Examples: "Plan this project", "Break down into sprints", "Estimate timeline"

4. **interview_prep** - Interview preparation and coaching
   Examples: "Prepare for interview", "Mock interview", "Interview questions"

5. **work_query** - Work-related questions for employee twin
   Examples: "What's my schedule?", "Any urgent tasks?", "Show my pipeline"

6. **general** - Everything else
   Examples: Greetings, general questions, off-topic

Return ONLY a JSON object:
{
  "intent": "code_help",
  "confidence": 0.95,
  "reasoning": "User asking about implementing a specific feature"
}`,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content || '{}';
      const parsed = JSON.parse(content);

      const intent = parsed.intent || 'general';
      const agentName = INTENT_AGENT_MAP[intent] || 'GeneralAgent';

      return {
        intent,
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || 'Default classification',
        agentName,
      };
    } catch (error) {
      console.error('[Orchestrator] Intent classification failed:', error);

      // Fallback to general
      return {
        intent: 'general',
        confidence: 0.3,
        reasoning: 'Classification failed, defaulting to general',
        agentName: 'GeneralAgent',
      };
    }
  }

  /**
   * Handoff context from one agent to another
   *
   * @param fromAgent - Source agent name
   * @param toAgent - Target agent name
   * @param context - Context to transfer
   * @returns Promise that resolves when handoff is complete
   *
   * @example
   * ```typescript
   * await orchestrator.handoff(
   *   'ResumeBuilderAgent',
   *   'InterviewCoachAgent',
   *   { resume: '...', targetRole: 'Senior Developer' }
   * );
   * ```
   */
  async handoff(
    fromAgent: string,
    toAgent: string,
    context: any
  ): Promise<void> {
    console.log(`[Orchestrator] Handoff: ${fromAgent} → ${toAgent}`);

    const targetAgent = this.agents.get(toAgent);

    if (!targetAgent) {
      throw new Error(`Target agent not found: ${toAgent}`);
    }

    // In a full implementation, this would:
    // 1. Notify source agent of handoff
    // 2. Transfer conversation history
    // 3. Initialize target agent with context
    // 4. Log handoff event

    // For now, just log
    console.log(`[Orchestrator] Context transferred:`, context);
  }

  /**
   * Get list of registered agents
   *
   * @returns Array of agent names
   */
  listAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Get orchestrator statistics
   *
   * @returns Statistics
   */
  getStats(): {
    totalAgents: number;
    registeredAgents: string[];
  } {
    return {
      totalAgents: this.agents.size,
      registeredAgents: this.listAgents(),
    };
  }
}

/**
 * Default orchestrator instance (singleton)
 */
let defaultOrchestrator: Orchestrator | null = null;

/**
 * Get the default orchestrator instance
 *
 * @returns Default Orchestrator instance
 */
export function getDefaultOrchestrator(): Orchestrator {
  if (!defaultOrchestrator) {
    defaultOrchestrator = new Orchestrator();
  }
  return defaultOrchestrator;
}

/**
 * Reset the default orchestrator (useful for testing)
 */
export function resetDefaultOrchestrator(): void {
  defaultOrchestrator = null;
}
