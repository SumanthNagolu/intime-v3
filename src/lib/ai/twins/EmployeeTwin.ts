/**
 * EmployeeTwin Framework
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 4)
 * Story: AI-TWIN-001 - Employee AI Twin Framework
 *
 * Personalized AI assistants for employees based on their roles.
 * Provides morning briefings, proactive suggestions, and on-demand help.
 * Refactored to extend BaseAgent for memory, RAG, and cost tracking.
 *
 * @module lib/ai/twins/EmployeeTwin
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import OpenAI from 'openai';
import type {
  TwinRole,
  TwinInteraction,
  IEmployeeTwin,
  TwinContext,
  ProductivityError,
} from '@/types/productivity';
import { ProductivityErrorCodes } from '@/types/productivity';
import { BaseAgent, type AgentConfig } from '../agents/BaseAgent';

/**
 * Employee AI Twin
 *
 * Role-specific AI assistant that provides personalized support to employees.
 * Now extends BaseAgent for integrated memory, RAG, and cost tracking capabilities.
 */
export class EmployeeTwin
  extends BaseAgent<string, string>
  implements IEmployeeTwin
{
  private role: TwinRole;
  private employeeId: string;
  private orgId: string;
  private openai: OpenAI;
  private supabase: SupabaseClient<Database>;

  constructor(
    employeeId: string,
    role: TwinRole,
    config?: Partial<AgentConfig>,
    dependencies?: {
      openai?: OpenAI;
      supabase?: SupabaseClient<Database>;
    }
  ) {
    super({
      agentName: `EmployeeTwin-${role}`,
      userId: employeeId,
      enableCostTracking: true,
      enableMemory: true, // Enable for conversation context
      enableRAG: true, // Enable for role-specific data retrieval
      ...config,
    });

    this.employeeId = employeeId;
    this.role = role;
    this.orgId = ''; // Will be fetched in context gathering

    // Allow dependency injection for testing
    this.openai = dependencies?.openai || new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.supabase =
      dependencies?.supabase ||
      createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );
  }

  /**
   * Execute method required by BaseAgent
   * Routes to query method for general queries
   */
  async execute(input: string): Promise<string> {
    const result = await this.query(input);
    return result.answer;
  }

  /**
   * Get the role of this twin
   */
  getRole(): TwinRole {
    return this.role;
  }

  /**
   * Generate morning briefing for employee
   *
   * Personalized daily summary with priorities, urgent items, and opportunities.
   *
   * @returns Morning briefing text
   * @throws ProductivityError if generation fails
   */
  async generateMorningBriefing(): Promise<string> {
    const startTime = performance.now();

    try {
      // Use BaseAgent router for model selection
      const model = await this.routeModel(`Generate morning briefing for ${this.role}`);

      const context = await this.gatherEmployeeContext();

      const prompt = `Generate a personalized morning briefing for this ${this.role}.

CONTEXT:
${JSON.stringify(context, null, 2)}

BRIEFING STRUCTURE:
1. Greeting (personalized with name)
2. Today's priorities (top 3 tasks)
3. Urgent items (deadlines, follow-ups)
4. Opportunities (proactive suggestions)
5. Motivational close

Keep it concise (200-300 words), friendly, and actionable.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getRolePrompt(this.role),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 512,
      });

      const briefing = response.choices[0].message.content || 'Unable to generate briefing';

      // Track cost using BaseAgent
      const latencyMs = performance.now() - startTime;
      const tokens = response.usage?.total_tokens || 0;
      const cost = this.calculateCost(tokens, model.model);
      await this.trackCost(tokens, cost, model.model, latencyMs);

      // Log interaction
      await this.logEmployeeTwinInteraction({
        interactionType: 'morning_briefing',
        prompt: null,
        response: briefing,
        context,
        modelUsed: model.model,
        tokensUsed: tokens,
        costUsd: cost,
        latencyMs,
      });

      return briefing;
    } catch (error) {
      throw this.createError(
        `Failed to generate morning briefing: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TWIN_QUERY_FAILED',
        { employeeId: this.employeeId, role: this.role, error }
      );
    }
  }

  /**
   * Generate proactive suggestion based on employee's current context
   *
   * @returns Suggestion text or null if no actionable items
   * @throws ProductivityError if generation fails
   */
  async generateProactiveSuggestion(): Promise<string | null> {
    try {
      const context = await this.gatherEmployeeContext();

      // Check if there are actionable items
      const hasActionableItems = await this.hasActionableItems(context);

      if (!hasActionableItems) {
        console.log(`[EmployeeTwin] No actionable items for ${this.employeeId}`);
        return null;
      }

      const prompt = `Based on this context, generate ONE proactive suggestion.

CONTEXT:
${JSON.stringify(context, null, 2)}

SUGGESTION FORMAT:
- Start with attention grabber ("👋 Quick heads up...")
- State the opportunity/issue
- Suggest specific action
- Keep it 1-2 sentences

Return only the suggestion text.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getRolePrompt(this.role),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 150,
      });

      const suggestion = response.choices[0].message.content || null;

      if (suggestion) {
        // Log interaction
        await this.logEmployeeTwinInteraction({
          interactionType: 'suggestion',
          prompt: null,
          response: suggestion,
          context,
          modelUsed: 'gpt-4o-mini',
          tokensUsed: response.usage?.total_tokens || 0,
          costUsd: this.calculateCost(response.usage?.total_tokens || 0, 'gpt-4o-mini'),
          latencyMs: 0,
        });
      }

      return suggestion;
    } catch (error) {
      throw this.createError(
        `Failed to generate proactive suggestion: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TWIN_QUERY_FAILED',
        { employeeId: this.employeeId, role: this.role, error }
      );
    }
  }

  /**
   * Query the twin with a specific question
   *
   * @param question - User's question
   * @param conversationId - Optional conversation ID for context
   * @returns Answer and conversation ID
   * @throws ProductivityError if query fails
   */
  async query(
    question: string,
    conversationId?: string
  ): Promise<{ answer: string; conversationId: string }> {
    try {
      const context = await this.gatherEmployeeContext();
      const newConversationId = conversationId || `conv-${Date.now()}`;

      const prompt = `Answer this question for the employee:

QUESTION: ${question}

CONTEXT:
${JSON.stringify(context, null, 2)}

Provide a helpful, specific answer based on the employee's role and context.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getRolePrompt(this.role),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 512,
      });

      const answer = response.choices[0].message.content || 'Unable to generate answer';

      // Log interaction
      await this.logEmployeeTwinInteraction({
        interactionType: 'question',
        prompt: question,
        response: answer,
        context,
        modelUsed: 'gpt-4o-mini',
        tokensUsed: response.usage?.total_tokens || 0,
        costUsd: this.calculateCost(response.usage?.total_tokens || 0, 'gpt-4o-mini'),
        latencyMs: 0,
      });

      return {
        answer,
        conversationId: newConversationId,
      };
    } catch (error) {
      throw this.createError(
        `Failed to process query: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TWIN_QUERY_FAILED',
        { employeeId: this.employeeId, role: this.role, question, error }
      );
    }
  }

  /**
   * Get interaction history for this employee
   *
   * @param limit - Maximum number of interactions to return
   * @returns Array of twin interactions
   */
  async getInteractionHistory(limit: number = 10): Promise<TwinInteraction[]> {
    try {
      const { data, error } = await this.supabase
        .from('ai_agent_interactions')
        .select('*')
        .eq('user_id', this.employeeId)
        .eq('agent_name', `EmployeeTwin-${this.role}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw this.createError(
          'Failed to fetch interaction history',
          'TWIN_QUERY_FAILED',
          { employeeId: this.employeeId, error }
        );
      }

      return (data || []).map((row) => ({
        id: row.id,
        orgId: row.org_id,
        userId: row.user_id || '',
        twinRole: this.role,
        interactionType: row.interaction_type as 'morning_briefing' | 'suggestion' | 'question' | 'feedback',
        prompt: row.input || '',
        response: row.output || '',
        context: (row.metadata as any)?.context || {},
        wasHelpful: (row.metadata as any)?.was_helpful,
        userFeedback: (row.metadata as any)?.user_feedback,
        modelUsed: row.model_used,
        tokensUsed: row.tokens_used,
        costUsd: row.cost_usd,
        latencyMs: row.latency_ms,
        createdAt: row.created_at,
      })) as any;
    } catch (error) {
      throw this.createError(
        `Failed to get interaction history: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TWIN_QUERY_FAILED',
        { employeeId: this.employeeId, error }
      );
    }
  }

  /**
   * Get role-specific system prompt
   *
   * @param role - Twin role
   * @returns System prompt for the role
   * @private
   */
  private getRolePrompt(role: TwinRole): string {
    const prompts: Record<TwinRole, string> = {
      ceo: `You are an AI assistant for the CEO of a Guidewire staffing and training organization.

YOUR ROLE:
- Strategic oversight of all organizational pillars
- Cross-pillar coordination and resource optimization
- Monitor organizational health metrics
- Identify opportunities and risks across the business
- Coordinate the "living organism" of AI twins

PILLARS YOU OVERSEE:
- Recruiting (sourcing → placement)
- Bench Sales (consultant → client placement)
- Talent Acquisition (prospecting → deal close)
- HR (people operations)
- Immigration (visa compliance)
- Academy (training operations)

BE PROACTIVE:
- "Recruiting pipeline is 30% below target - consider TA partnership"
- "3 bench consultants reaching 45 days - prioritize marketing"
- "Academy has 5 graduates ready - align with open requisitions"

CROSS-POLLINATION:
Alert on opportunities that span pillars:
- Training graduates ready for placement
- Bench placements ending (renewal opportunity)
- New deals creating recruiting needs

TONE: Strategic, decisive, supportive, data-informed, visionary`,

      recruiter: `You are an AI assistant for a technical recruiter specializing in Guidewire placements.

YOUR ROLE (END-TO-END PARTNER APPROACH):
- Full recruiting cycle: Sourcing → Screening → Interview → Offer → Placement → Follow-up
- Track candidate pipeline and suggest next best actions
- Remind about follow-ups and deadlines
- Provide resume matching insights
- Track placement metrics

BE PROACTIVE:
- "You have 3 candidates waiting for follow-up"
- "Job req #42 has been open for 2 weeks - suggest posting to LinkedIn"
- "Candidate John Doe matches 85% with PolicyCenter role"

CROSS-PILLAR AWARENESS:
- Placement complete? → Notify Bench Sales (new consultant)
- Strong reject? → Consider for internal training program
- Client expanding? → Alert TA for deal opportunity

TONE: Professional, action-oriented, data-driven`,

      trainer: `You are an AI assistant for a Guidewire trainer.

YOUR ROLE:
- Track student progress and struggles
- Suggest personalized interventions
- Remind about grading deadlines
- Identify at-risk students
- Recommend curriculum improvements
- Prepare class materials

BE PROACTIVE:
- "Student Jane is struggling with Rating module - schedule 1:1"
- "Quiz grades due tomorrow for Module 5"
- "3 students haven't logged in this week"

CROSS-PILLAR AWARENESS:
- Student graduating? → Alert Recruiting for placement
- Student has prior experience? → Fast-track certification path

TONE: Supportive, educator-focused, student-centric`,

      bench_sales: `You are an AI assistant for a bench sales consultant.

YOUR ROLE (END-TO-END PARTNER APPROACH):
- Full bench cycle: Onboard → Marketing → Submission → Interview → Placement → Extension
- Track bench consultants (availability, skills, rates)
- Match consultants to client requirements
- Monitor market rates and placement timelines (30-60 day goal)

BE PROACTIVE:
- "Consultant Mike is on bench for 15 days - 3 matching reqs found"
- "Client ABC looking for ClaimCenter dev - Sarah is 90% match"
- "Market rate for PolicyCenter increased 10% this month"

CROSS-PILLAR AWARENESS:
- Placement ending? → Alert TA for renewal opportunity
- Consultant struggling? → Consider retraining via Academy
- New consultant from Recruiting? → Begin marketing immediately

TONE: Sales-oriented, metrics-focused, urgency-driven`,

      talent_acquisition: `You are an AI assistant for a Talent Acquisition (Business Development) specialist.

YOUR ROLE (END-TO-END PARTNER APPROACH):
- Full TA cycle: Prospecting → Outreach → Qualification → Handoff → Deal Close
- Build and nurture client relationships
- Track deal pipeline and revenue forecasts
- Optimize outreach campaigns

BE PROACTIVE:
- "Prospect XYZ hasn't responded in 5 days - follow-up sequence"
- "Opportunity ABC stalled at Proposal for 2 weeks"
- "LinkedIn connection at BigCorp - potential warm intro"

CROSS-PILLAR AWARENESS:
- Deal closed? → Alert Recruiting to fill positions
- Bench ending at client? → Renewal opportunity
- Client expanding? → Upsell additional consultants

TONE: Relationship-focused, persistent, strategic, revenue-driven`,

      hr: `You are an AI assistant for an HR professional.

YOUR ROLE:
- People operations and employee lifecycle
- Compliance and policy enforcement
- Performance management
- Learning and development coordination
- Payroll and benefits administration

BE PROACTIVE:
- "5 employees have overdue performance reviews"
- "New hire onboarding 60% complete - 3 items pending"
- "Benefits enrollment deadline in 5 days"

CROSS-PILLAR AWARENESS:
- Coordinate with Recruiting on offer letters
- Work with Immigration on visa-dependent employees
- Partner with Academy on training requirements

TONE: Empathetic, professional, confidential, policy-aware`,

      immigration: `You are an AI assistant for an Immigration Specialist.

YOUR ROLE:
- Visa and work authorization tracking
- Immigration case management
- Compliance monitoring and alerts
- USCIS filing and deadline management

BE PROACTIVE:
- "3 H-1B authorizations expiring in next 90 days"
- "RFE response for John due in 14 days"
- "Employee promotion may trigger H-1B amendment"

RISK LEVELS:
🔴 Authorization expiring in <30 days
🔴 RFE response due in <14 days
🟡 Routine renewal needed in 90 days

CROSS-PILLAR AWARENESS:
- Alert Recruiting about visa-related hiring constraints
- Inform Bench Sales about placement restrictions
- Coordinate with HR on onboarding timing

TONE: Precise, compliance-focused, empathetic, deadline-driven`,

      admin: `You are an AI assistant for a platform administrator.

YOUR ROLE:
- Monitor system health
- Track user activity and anomalies
- Suggest optimizations
- Alert on security issues
- Generate reports
- Coordinate cross-team tasks

BE PROACTIVE:
- "Database size increased 50% this week - consider archiving"
- "User login errors spiked - check auth service"
- "Weekly report generation scheduled for tomorrow"

TONE: Technical, precise, systems-thinking`,
    };

    return prompts[role];
  }

  /**
   * Gather role-specific context for the employee
   *
   * @returns Employee context data
   * @private
   */
  private async gatherEmployeeContext(): Promise<TwinContext> {
    // Get employee profile
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', this.employeeId)
      .single();

    if (profile) {
      this.orgId = profile.org_id;
    }

    // Role-specific context gathering
    const roleContext = await this.gatherRoleSpecificContext();

    return {
      employeeName: profile?.full_name || 'Employee',
      role: this.role,
      organizationName: 'InTime Solutions', // TODO: Fetch from org table
      ...roleContext,
    };
  }

  /**
   * Gather role-specific context based on the twin's role
   *
   * @returns Role-specific context data
   * @private
   */
  private async gatherRoleSpecificContext(): Promise<Record<string, any>> {
    switch (this.role) {
      case 'ceo':
        return this.gatherCEOContext();
      case 'recruiter':
        return this.gatherRecruiterContext();
      case 'bench_sales':
        return this.gatherBenchSalesContext();
      case 'talent_acquisition':
        return this.gatherTAContext();
      case 'hr':
        return this.gatherHRContext();
      case 'immigration':
        return this.gatherImmigrationContext();
      case 'trainer':
        return this.gatherTrainerContext();
      case 'admin':
        return this.gatherAdminContext();
      default:
        return {};
    }
  }

  /**
   * CEO context: Organization-wide metrics and pillar health
   */
  private async gatherCEOContext(): Promise<Record<string, any>> {
    // TODO: Query actual pillar metrics from database
    return {
      pillarHealth: {
        recruiting: { status: 'healthy', openReqs: 0, activeCandidates: 0 },
        benchSales: { status: 'healthy', benchCount: 0, avgDaysOnBench: 0 },
        talentAcquisition: { status: 'healthy', pipelineValue: 0, activeDeals: 0 },
        hr: { status: 'healthy', headcount: 0, pendingReviews: 0 },
        immigration: { status: 'healthy', activeCases: 0, expiringAuths: 0 },
        academy: { status: 'healthy', activeStudents: 0, graduationRate: 0 },
      },
      crossPollinationOpportunities: [],
      escalations: [],
    };
  }

  /**
   * Recruiter context: Candidates, jobs, pipeline
   */
  private async gatherRecruiterContext(): Promise<Record<string, any>> {
    // TODO: Query actual recruiting data
    return {
      activeCandidates: 0,
      openRequisitions: 0,
      weeklyPlacements: 0,
      pipelineStatus: {
        sourcing: 0,
        screening: 0,
        interview: 0,
        offer: 0,
        placed: 0,
      },
      urgentFollowUps: [],
      topMatches: [],
    };
  }

  /**
   * Bench Sales context: Consultants, placements, market
   */
  private async gatherBenchSalesContext(): Promise<Record<string, any>> {
    // TODO: Query actual bench data
    return {
      benchCount: 0,
      activeClients: 0,
      monthlyPlacements: 0,
      avgBenchDays: 0,
      consultants: [],
      urgentPlacements: [], // > 30 days on bench
      marketRates: {},
    };
  }

  /**
   * Talent Acquisition context: Prospects, deals, campaigns
   */
  private async gatherTAContext(): Promise<Record<string, any>> {
    // TODO: Query actual TA data
    return {
      activeProspects: 0,
      openOpportunities: 0,
      monthlyRevenue: 0,
      pipelineValue: 0,
      activeCampaigns: 0,
      stalledDeals: [],
      renewalOpportunities: [],
    };
  }

  /**
   * HR context: Employees, compliance, reviews
   */
  private async gatherHRContext(): Promise<Record<string, any>> {
    // TODO: Query actual HR data
    return {
      totalEmployees: 0,
      activeOnboardings: 0,
      pendingReviews: 0,
      openHRTickets: 0,
      complianceItems: 0,
      upcomingAnniversaries: [],
      expiringCertifications: [],
    };
  }

  /**
   * Immigration context: Cases, visas, deadlines
   */
  private async gatherImmigrationContext(): Promise<Record<string, any>> {
    // TODO: Query actual immigration data
    return {
      activeCases: 0,
      pendingFilings: 0,
      expiringAuths: 0,
      rfeCount: 0,
      complianceAlerts: 0,
      criticalDeadlines: [], // < 30 days
      upcomingRenewals: [], // 30-90 days
    };
  }

  /**
   * Trainer context: Students, cohorts, progress
   */
  private async gatherTrainerContext(): Promise<Record<string, any>> {
    // TODO: Query actual training data
    return {
      cohortName: '',
      studentCount: 0,
      currentModule: '',
      completionRate: 0,
      atRiskCount: 0,
      upcomingDeadlines: [],
      strugglingStudents: [],
    };
  }

  /**
   * Admin context: System health, users, metrics
   */
  private async gatherAdminContext(): Promise<Record<string, any>> {
    // TODO: Query actual system metrics
    return {
      activeUsers: 0,
      systemLoad: 0,
      databaseSize: '',
      apiRequests: 0,
      errorRate: 0,
      uptime: 99.9,
      recentAlerts: [],
      pendingTasks: [],
    };
  }

  /**
   * Check if there are actionable items for proactive suggestions
   *
   * @param context - Employee context
   * @returns True if there are actionable items
   * @private
   */
  private async hasActionableItems(context: TwinContext): Promise<boolean> {
    // Placeholder logic - in production, this would check actual business rules
    // For example:
    // - Recruiter: candidates needing follow-up > 0
    // - Trainer: struggling students > 0
    // - Bench Sales: bench consultants with > 7 days on bench
    // - Admin: system alerts or pending tasks

    return false; // Conservative default - avoid empty suggestions
  }

  /**
   * Log interaction to database
   *
   * @param data - Interaction data
   * @private
   */
  private async logEmployeeTwinInteraction(data: {
    interactionType: string;
    prompt: string | null;
    response: string;
    context: any;
    modelUsed: string;
    tokensUsed: number;
    costUsd: number;
    latencyMs: number;
  }): Promise<void> {
    try {
      await this.supabase.from('employee_twin_interactions').insert({
        org_id: this.orgId,
        user_id: this.employeeId,
        twin_role: this.role,
        interaction_type: data.interactionType,
        prompt: data.prompt,
        response: data.response,
        context: data.context,
        model_used: data.modelUsed,
        tokens_used: data.tokensUsed,
        cost_usd: data.costUsd,
        latency_ms: data.latencyMs,
      });
    } catch (error) {
      console.error('[EmployeeTwin] Failed to log interaction:', error);
      // Don't throw - interaction succeeded, just logging failed
    }
  }

  /**
   * Calculate cost of AI request
   *
   * @param tokens - Total tokens used
   * @param model - Model name
   * @returns Cost in USD
   * @private
   */
  private calculateCost(tokens: number, model: string): number {
    // GPT-4o-mini pricing: $0.15 per 1M input tokens, $0.60 per 1M output tokens
    // Simplified: assume 50/50 split for approximation
    const avgCostPerToken = ((0.15 + 0.60) / 2) / 1_000_000;
    return tokens * avgCostPerToken;
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
