/**
 * Twin Directory
 *
 * Epic: AI Twin Living Organism
 * Phase 5: Direct Query Communication
 *
 * Enables synchronous queries between AI twins.
 * Acts as a registry and router for inter-twin communication.
 *
 * @module lib/ai/twins/TwinDirectory
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import type { Database } from '@/types/supabase';
import type { TwinRole, TWIN_HIERARCHY } from '@/types/productivity';
import { EmployeeTwin } from './EmployeeTwin';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Query result from twin-to-twin communication
 */
export interface TwinQueryResult {
  answer: string;
  respondingRole: TwinRole;
  tokensUsed: number;
  cost: number;
  latencyMs: number;
  conversationId: string;
}

/**
 * Twin registration entry
 */
interface TwinRegistration {
  role: TwinRole;
  description: string;
  capabilities: string[];
  available: boolean;
}

/**
 * Query options
 */
export interface QueryOptions {
  includeContext?: boolean;
  maxTokens?: number;
  temperature?: number;
}

// ============================================================================
// TWIN DIRECTORY CLASS
// ============================================================================

/**
 * Twin Directory
 *
 * Registry and router for AI twin instances.
 * Manages twin-to-twin queries and maintains hierarchy.
 */
export class TwinDirectory {
  private supabase: SupabaseClient<Database>;
  private openai: OpenAI;
  private orgId: string;
  private userId: string;
  private twinCache: Map<TwinRole, EmployeeTwin>;

  constructor(
    orgId: string,
    userId: string,
    dependencies?: {
      supabase?: SupabaseClient<Database>;
      openai?: OpenAI;
    }
  ) {
    this.orgId = orgId;
    this.userId = userId;
    this.twinCache = new Map();

    this.supabase =
      dependencies?.supabase ||
      createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );

    this.openai =
      dependencies?.openai ||
      new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  // ==========================================================================
  // PUBLIC METHODS - TWIN RETRIEVAL
  // ==========================================================================

  /**
   * Get a twin instance by role
   *
   * @param role - Twin role to get
   * @returns EmployeeTwin instance
   */
  getTwin(role: TwinRole): EmployeeTwin {
    // Check cache first
    if (this.twinCache.has(role)) {
      return this.twinCache.get(role)!;
    }

    // Create new twin instance
    const twin = new EmployeeTwin(this.userId, role, {
      orgId: this.orgId,
      userId: this.userId,
    });

    // Cache for reuse
    this.twinCache.set(role, twin);

    return twin;
  }

  /**
   * List all available twin roles
   *
   * @returns Array of twin registrations
   */
  listAvailableTwins(): TwinRegistration[] {
    return [
      {
        role: 'ceo',
        description: 'Strategic oversight and cross-pillar coordination',
        capabilities: ['org_health', 'standup', 'escalation_handling', 'strategic_decisions'],
        available: true,
      },
      {
        role: 'recruiter',
        description: 'Full recruiting cycle: sourcing to placement',
        capabilities: ['candidate_tracking', 'job_matching', 'pipeline_management', 'placement'],
        available: true,
      },
      {
        role: 'bench_sales',
        description: 'Bench management and consultant placement',
        capabilities: ['bench_tracking', 'client_matching', 'rate_negotiation', 'extensions'],
        available: true,
      },
      {
        role: 'talent_acquisition',
        description: 'Business development and deal pipeline',
        capabilities: ['prospecting', 'outreach', 'deal_closing', 'client_relationships'],
        available: true,
      },
      {
        role: 'hr',
        description: 'People operations and compliance',
        capabilities: ['onboarding', 'performance', 'compliance', 'employee_lifecycle'],
        available: true,
      },
      {
        role: 'immigration',
        description: 'Visa tracking and immigration compliance',
        capabilities: ['visa_tracking', 'case_management', 'compliance_alerts', 'renewals'],
        available: true,
      },
      {
        role: 'trainer',
        description: 'Training operations and student management',
        capabilities: ['student_tracking', 'curriculum', 'assessments', 'interventions'],
        available: true,
      },
      {
        role: 'admin',
        description: 'System administration and monitoring',
        capabilities: ['system_health', 'user_management', 'security', 'reporting'],
        available: true,
      },
    ];
  }

  /**
   * Get the hierarchy (who reports to whom)
   *
   * @returns Map of role to parent role
   */
  getHierarchy(): Map<TwinRole, TwinRole | null> {
    const hierarchy = new Map<TwinRole, TwinRole | null>();

    // Flat hierarchy with CEO oversight
    hierarchy.set('ceo', null);
    hierarchy.set('admin', 'ceo');
    hierarchy.set('recruiter', 'ceo');
    hierarchy.set('bench_sales', 'ceo');
    hierarchy.set('talent_acquisition', 'ceo');
    hierarchy.set('hr', 'ceo');
    hierarchy.set('immigration', 'ceo');
    hierarchy.set('trainer', 'ceo');

    return hierarchy;
  }

  // ==========================================================================
  // PUBLIC METHODS - DIRECT QUERIES
  // ==========================================================================

  /**
   * Query another twin directly
   *
   * @param fromRole - Role initiating the query
   * @param toRole - Role being queried
   * @param question - Question to ask
   * @param options - Query options
   * @returns Query result with answer and metadata
   *
   * @example
   * ```typescript
   * const directory = new TwinDirectory(orgId, userId);
   *
   * // Recruiter asks CEO about priorities
   * const result = await directory.queryTwin(
   *   'recruiter',
   *   'ceo',
   *   'What are the Q4 hiring priorities?'
   * );
   *
   * console.log(result.answer);
   * ```
   */
  async queryTwin(
    fromRole: TwinRole,
    toRole: TwinRole,
    question: string,
    options?: QueryOptions
  ): Promise<TwinQueryResult> {
    const startTime = performance.now();

    try {
      // Get the target twin
      const targetTwin = this.getTwin(toRole);

      // Build context-aware prompt
      const contextualQuestion = this.buildContextualQuestion(
        fromRole,
        toRole,
        question,
        options?.includeContext
      );

      // Query the twin
      const response = await targetTwin.query(contextualQuestion);

      const latencyMs = Math.round(performance.now() - startTime);

      // Log the conversation for audit trail
      await this.logConversation({
        initiatorRole: fromRole,
        responderRole: toRole,
        question,
        response: response.answer,
        tokensUsed: 0, // TODO: Get actual token count
        cost: 0, // TODO: Calculate cost
        latencyMs,
      });

      return {
        answer: response.answer,
        respondingRole: toRole,
        tokensUsed: 0,
        cost: 0,
        latencyMs,
        conversationId: response.conversationId,
      };
    } catch (error) {
      console.error(`[TwinDirectory] Query failed:`, error);
      throw error;
    }
  }

  /**
   * Query multiple twins and aggregate responses
   *
   * @param fromRole - Role initiating the query
   * @param toRoles - Roles to query
   * @param question - Question to ask
   * @returns Map of role to response
   */
  async queryMultipleTwins(
    fromRole: TwinRole,
    toRoles: TwinRole[],
    question: string
  ): Promise<Map<TwinRole, TwinQueryResult>> {
    const results = new Map<TwinRole, TwinQueryResult>();

    // Query in parallel
    const queries = toRoles.map(async (toRole) => {
      try {
        const result = await this.queryTwin(fromRole, toRole, question);
        results.set(toRole, result);
      } catch (error) {
        console.error(`[TwinDirectory] Failed to query ${toRole}:`, error);
      }
    });

    await Promise.all(queries);

    return results;
  }

  /**
   * Ask the organization (routes to best twin)
   *
   * @param fromRole - Role asking
   * @param question - Question to ask
   * @returns Query result with routing info
   */
  async askOrganization(
    fromRole: TwinRole,
    question: string
  ): Promise<TwinQueryResult & { routedTo: TwinRole; reasoning: string }> {
    // Route the question to the most appropriate twin
    const routing = await this.routeQuestion(question);

    const result = await this.queryTwin(fromRole, routing.targetRole, question);

    return {
      ...result,
      routedTo: routing.targetRole,
      reasoning: routing.reasoning,
    };
  }

  // ==========================================================================
  // PUBLIC METHODS - CONVENIENCE QUERIES
  // ==========================================================================

  /**
   * Ask CEO for strategic guidance
   */
  async askCEO(fromRole: TwinRole, question: string): Promise<TwinQueryResult> {
    return this.queryTwin(fromRole, 'ceo', question);
  }

  /**
   * Ask recruiter about candidates/positions
   */
  async askRecruiter(fromRole: TwinRole, question: string): Promise<TwinQueryResult> {
    return this.queryTwin(fromRole, 'recruiter', question);
  }

  /**
   * Ask bench sales about consultants/placements
   */
  async askBenchSales(fromRole: TwinRole, question: string): Promise<TwinQueryResult> {
    return this.queryTwin(fromRole, 'bench_sales', question);
  }

  /**
   * Ask TA about deals/clients
   */
  async askTA(fromRole: TwinRole, question: string): Promise<TwinQueryResult> {
    return this.queryTwin(fromRole, 'talent_acquisition', question);
  }

  /**
   * Ask HR about people/policies
   */
  async askHR(fromRole: TwinRole, question: string): Promise<TwinQueryResult> {
    return this.queryTwin(fromRole, 'hr', question);
  }

  /**
   * Ask Immigration about visas/compliance
   */
  async askImmigration(fromRole: TwinRole, question: string): Promise<TwinQueryResult> {
    return this.queryTwin(fromRole, 'immigration', question);
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Build a context-aware question
   */
  private buildContextualQuestion(
    fromRole: TwinRole,
    toRole: TwinRole,
    question: string,
    includeContext?: boolean
  ): string {
    const roleLabels: Record<TwinRole, string> = {
      ceo: 'CEO',
      admin: 'Administrator',
      recruiter: 'Recruiter',
      bench_sales: 'Bench Sales',
      talent_acquisition: 'Talent Acquisition',
      hr: 'HR',
      immigration: 'Immigration',
      trainer: 'Trainer',
    };

    const contextPrefix = includeContext
      ? `[Cross-Twin Query from ${roleLabels[fromRole]}]\n\n`
      : '';

    return `${contextPrefix}${question}`;
  }

  /**
   * Route a question to the best twin
   */
  private async routeQuestion(
    question: string
  ): Promise<{ targetRole: TwinRole; reasoning: string }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You route questions to the appropriate AI twin based on their expertise.

Available twins and their domains:
- CEO: Strategic decisions, cross-pillar coordination, escalations, org-wide priorities
- Recruiter: Candidates, job requisitions, placements, hiring pipeline
- Bench Sales: Consultants on bench, client placements, rates, marketing
- Talent Acquisition: Prospects, deals, client relationships, revenue pipeline
- HR: Employees, policies, compliance, performance, onboarding
- Immigration: Visas, work authorization, compliance, cases
- Trainer: Students, courses, training progress, certifications
- Admin: System health, technical issues, user management

Respond with JSON: { "targetRole": "role_name", "reasoning": "brief explanation" }`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content || '{}';
      const parsed = JSON.parse(content);

      return {
        targetRole: parsed.targetRole || 'ceo',
        reasoning: parsed.reasoning || 'Default routing to CEO',
      };
    } catch (error) {
      console.error('[TwinDirectory] Routing failed:', error);
      return {
        targetRole: 'ceo',
        reasoning: 'Routing failed, defaulting to CEO',
      };
    }
  }

  /**
   * Log conversation for audit trail
   */
  private async logConversation(data: {
    initiatorRole: TwinRole | 'organization';
    responderRole: TwinRole | 'organization';
    question: string;
    response: string;
    tokensUsed: number;
    cost: number;
    latencyMs: number;
  }): Promise<void> {
    try {
      await this.supabase.from('twin_conversations').insert({
        org_id: this.orgId,
        initiator_user_id: this.userId,
        initiator_role: data.initiatorRole,
        responder_role: data.responderRole,
        question: data.question,
        response: data.response,
        tokens_used: data.tokensUsed,
        cost_usd: data.cost,
        latency_ms: data.latencyMs,
        model_used: 'gpt-4o-mini',
        status: 'completed',
      });
    } catch (error) {
      console.error('[TwinDirectory] Failed to log conversation:', error);
    }
  }

  /**
   * Clear the twin cache
   */
  clearCache(): void {
    this.twinCache.clear();
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a TwinDirectory instance
 */
export function createTwinDirectory(
  orgId: string,
  userId: string,
  dependencies?: {
    supabase?: SupabaseClient<Database>;
    openai?: OpenAI;
  }
): TwinDirectory {
  return new TwinDirectory(orgId, userId, dependencies);
}
