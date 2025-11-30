/**
 * Organization Twin
 *
 * Epic: AI Twin Living Organism
 * Phase 6: Central Orchestrator
 *
 * The "brain" of the AI twin ecosystem.
 * Coordinates all individual twins, generates standups, and monitors organism health.
 *
 * @module lib/ai/twins/OrganizationTwin
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import type { Database } from '@/types/supabase';
import type { TwinRole } from '@/types/productivity';
import { BaseAgent, type AgentConfig } from '../agents/BaseAgent';
import { TwinEventBus, type TwinEvent } from './TwinEventBus';
import { TwinDirectory } from './TwinDirectory';
import { OrganizationContext, type PillarHealth } from './OrganizationContext';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Daily standup report
 */
export interface StandupReport {
  id: string;
  date: string;
  summary: string;
  pillarSummaries: Record<TwinRole, PillarStandupSummary>;
  crossPollinationInsights: string[];
  escalations: Escalation[];
  blockers: Blocker[];
  organismHealthScore: number;
  generatedAt: string;
}

/**
 * Per-pillar standup summary
 */
export interface PillarStandupSummary {
  pillar: TwinRole;
  yesterdayAccomplishments: string[];
  todayPlans: string[];
  blockers: string[];
  highlights: string[];
  healthScore: number;
}

/**
 * Escalation item
 */
export interface Escalation {
  id: string;
  sourceRole: TwinRole;
  title: string;
  description: string;
  priority: 'medium' | 'high' | 'critical';
  suggestedAction?: string;
  createdAt: string;
}

/**
 * Blocker item
 */
export interface Blocker {
  id: string;
  pillar: TwinRole;
  description: string;
  impact: string;
  suggestedResolution?: string;
}

/**
 * Organism health metrics
 */
export interface OrganismHealth {
  overallScore: number; // 0-100
  pillarHealth: PillarHealth[];
  communicationHealth: {
    eventsToday: number;
    queriesThisWeek: number;
    unprocessedEvents: number;
  };
  crossPollinationScore: number;
  alerts: string[];
  lastUpdated: string;
}

/**
 * Query routing result
 */
export interface RoutingResult {
  targetTwins: TwinRole[];
  reasoning: string;
  confidence: number;
}

// ============================================================================
// ORGANIZATION TWIN CLASS
// ============================================================================

/**
 * Organization Twin
 *
 * Central orchestrator for the AI twin ecosystem.
 * Acts as the "digital scrum master" coordinating all pillars.
 */
export class OrganizationTwin extends BaseAgent<string, string> {
  private eventBus: TwinEventBus;
  private directory: TwinDirectory;
  private context: OrganizationContext;
  private openai: OpenAI;
  private supabase: SupabaseClient<Database>;
  private orgId: string;

  constructor(
    orgId: string,
    userId: string,
    config?: Partial<AgentConfig>,
    dependencies?: {
      supabase?: SupabaseClient<Database>;
      openai?: OpenAI;
    }
  ) {
    super({
      agentName: 'OrganizationTwin',
      userId,
      orgId,
      enableCostTracking: true,
      enableMemory: true,
      enableRAG: true,
      ...config,
    });

    this.orgId = orgId;

    this.supabase =
      dependencies?.supabase ||
      createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );

    this.openai =
      dependencies?.openai ||
      new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Initialize sub-components
    this.eventBus = new TwinEventBus(orgId, userId, this.supabase);
    this.directory = new TwinDirectory(orgId, userId, {
      supabase: this.supabase,
      openai: this.openai,
    });
    this.context = new OrganizationContext(this.supabase);
  }

  /**
   * Execute method required by BaseAgent
   */
  async execute(input: string): Promise<string> {
    const routing = await this.routeQuery(input);
    if (routing.targetTwins.length === 0) {
      return this.handleDirectQuery(input);
    }
    // Route to the first suggested twin
    const result = await this.directory.queryTwin(
      'ceo', // OrganizationTwin acts as CEO
      routing.targetTwins[0],
      input
    );
    return result.answer;
  }

  // ==========================================================================
  // PUBLIC METHODS - STANDUP GENERATION
  // ==========================================================================

  /**
   * Generate daily standup report
   *
   * Aggregates status from all pillars and generates insights.
   *
   * @returns Comprehensive standup report
   */
  async generateDailyStandup(): Promise<StandupReport> {
    const startTime = performance.now();

    console.log(`[OrganizationTwin] Generating daily standup for org ${this.orgId}`);

    // 1. Gather data from all sources
    const [_metrics, pillarHealth, events, opportunities] = await Promise.all([
      this.context.getOrgMetrics(this.orgId),
      this.context.getPillarHealth(this.orgId) as Promise<PillarHealth[]>,
      this.eventBus.getUnprocessedEvents({ limit: 50 }),
      this.context.getCrossPollinationOpportunities(this.orgId),
    ]);

    // 2. Generate pillar summaries
    const pillarSummaries = await this.generatePillarSummaries(pillarHealth);

    // 3. Identify escalations from events
    const escalations = this.extractEscalations(events);

    // 4. Generate cross-pollination insights
    const crossPollinationInsights = await this.generateCrossPollinationInsights(
      opportunities,
      events
    );

    // 5. Calculate organism health
    const healthScore = this.calculateOrganismHealthScore(pillarHealth, events);

    // 6. Compile the report
    const report: StandupReport = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      summary: await this.generateStandupSummary(pillarSummaries, escalations),
      pillarSummaries,
      crossPollinationInsights,
      escalations,
      blockers: this.extractBlockers(pillarSummaries),
      organismHealthScore: healthScore,
      generatedAt: new Date().toISOString(),
    };

    // 7. Save to database
    await this.saveStandup(report);

    const latencyMs = Math.round(performance.now() - startTime);
    console.log(`[OrganizationTwin] Standup generated in ${latencyMs}ms`);

    return report;
  }

  /**
   * Get today's standup (or generate if not exists)
   */
  async getTodayStandup(forceRegenerate = false): Promise<StandupReport | null> {
    if (!forceRegenerate) {
      const { data } = await (this.supabase.rpc as (name: string, params: Record<string, unknown>) => Promise<{ data: unknown }> )('get_today_standup', {
        p_org_id: this.orgId,
      });

      if (data) {
        return data as unknown as StandupReport;
      }
    }

    return this.generateDailyStandup();
  }

  // ==========================================================================
  // PUBLIC METHODS - QUERY ROUTING
  // ==========================================================================

  /**
   * Route a query to the appropriate twin(s)
   *
   * @param question - Question to route
   * @returns Routing result with target twins and reasoning
   */
  async routeQuery(question: string): Promise<RoutingResult> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are the Organization Twin routing questions to specialized AI twins.

Available twins:
- CEO: Strategic decisions, org-wide priorities, escalations
- Recruiter: Candidates, job requisitions, hiring pipeline
- Bench Sales: Consultants, placements, rates
- Talent Acquisition: Deals, prospects, client relationships
- HR: Employees, policies, compliance
- Immigration: Visas, work authorization
- Trainer: Students, courses, certifications
- Admin: System health, technical issues

For each question, determine:
1. Which twin(s) should answer (can be multiple for cross-functional questions)
2. Your reasoning
3. Your confidence (0-1)

Respond with JSON:
{
  "targetTwins": ["role1", "role2"],
  "reasoning": "explanation",
  "confidence": 0.9
}

If the question is general organizational or strategic, route to CEO.`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content || '{}';
      const parsed = JSON.parse(content);

      return {
        targetTwins: parsed.targetTwins || ['ceo'],
        reasoning: parsed.reasoning || 'Default routing',
        confidence: parsed.confidence || 0.5,
      };
    } catch (error) {
      console.error('[OrganizationTwin] Routing failed:', error);
      return {
        targetTwins: ['ceo'],
        reasoning: 'Routing error, defaulting to CEO',
        confidence: 0.3,
      };
    }
  }

  // ==========================================================================
  // PUBLIC METHODS - ORGANISM HEALTH
  // ==========================================================================

  /**
   * Get organism health metrics
   *
   * @returns Comprehensive health assessment
   */
  async getOrganismHealth(): Promise<OrganismHealth> {
    const [pillarHealth, eventStats] = await Promise.all([
      this.context.getPillarHealth(this.orgId) as Promise<PillarHealth[]>,
      this.eventBus.getStats(),
    ]);

    // Query communication metrics
    const { count: queriesThisWeek } = await (this.supabase
      .from as (table: string) => {
        select: (cols: string, opts?: { count?: string; head?: boolean }) => {
          eq: (col: string, val: string) => {
            gte: (col: string, val: string) => Promise<{ count: number | null }>
          }
        }
      })('twin_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', this.orgId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const overallScore = this.calculateOrganismHealthScore(
      pillarHealth,
      [] // Events not needed for health calc
    );

    const crossPollinationScore = this.calculateCrossPollinationScore(eventStats);

    const alerts = this.generateHealthAlerts(pillarHealth, eventStats);

    return {
      overallScore,
      pillarHealth,
      communicationHealth: {
        eventsToday: eventStats.byType['custom'] || 0,
        queriesThisWeek: queriesThisWeek || 0,
        unprocessedEvents: eventStats.unprocessed,
      },
      crossPollinationScore,
      alerts,
      lastUpdated: new Date().toISOString(),
    };
  }

  // ==========================================================================
  // PUBLIC METHODS - EVENT PROCESSING
  // ==========================================================================

  /**
   * Process pending events and generate insights
   *
   * @returns Processing results
   */
  async processEventQueue(): Promise<{
    processed: number;
    insights: string[];
  }> {
    const events = await this.eventBus.getUnprocessedEvents({ limit: 100 });
    const insights: string[] = [];
    let processed = 0;

    for (const event of events) {
      try {
        // Process based on event type
        const insight = await this.processEvent(event);
        if (insight) {
          insights.push(insight);
        }

        await this.eventBus.markProcessed(event.id);
        processed++;
      } catch (error) {
        console.error(`[OrganizationTwin] Failed to process event ${event.id}:`, error);
      }
    }

    return { processed, insights };
  }

  // ==========================================================================
  // PRIVATE METHODS - STANDUP HELPERS
  // ==========================================================================

  /**
   * Generate summaries for each pillar
   */
  private async generatePillarSummaries(
    pillarHealth: PillarHealth[]
  ): Promise<Record<TwinRole, PillarStandupSummary>> {
    const summaries: Record<TwinRole, PillarStandupSummary> = {} as Record<
      TwinRole,
      PillarStandupSummary
    >;

    const pillars: TwinRole[] = [
      'recruiter',
      'bench_sales',
      'talent_acquisition',
      'hr',
      'immigration',
      'trainer',
    ];

    for (const pillar of pillars) {
      const health = pillarHealth.find(h => h.pillar === pillar);

      summaries[pillar] = {
        pillar,
        yesterdayAccomplishments: [], // TODO: Query actual activity logs
        todayPlans: [], // TODO: Query scheduled tasks
        blockers: health?.alerts || [],
        highlights: [],
        healthScore: health?.score || 85,
      };
    }

    return summaries;
  }

  /**
   * Extract escalations from events
   */
  private extractEscalations(events: TwinEvent[]): Escalation[] {
    return events
      .filter(e => e.eventType === 'escalation')
      .map(e => ({
        id: e.id,
        sourceRole: e.sourceRole,
        title: (e.payload.title as string) || 'Escalation',
        description: (e.payload.description as string) || '',
        priority: e.priority as 'medium' | 'high' | 'critical',
        suggestedAction: e.payload.suggestedAction as string | undefined,
        createdAt: e.createdAt,
      }));
  }

  /**
   * Extract blockers from pillar summaries
   */
  private extractBlockers(
    pillarSummaries: Record<TwinRole, PillarStandupSummary>
  ): Blocker[] {
    const blockers: Blocker[] = [];

    for (const [pillar, summary] of Object.entries(pillarSummaries)) {
      for (const blockerText of summary.blockers) {
        blockers.push({
          id: crypto.randomUUID(),
          pillar: pillar as TwinRole,
          description: blockerText,
          impact: 'Pending assessment',
        });
      }
    }

    return blockers;
  }

  /**
   * Generate cross-pollination insights
   */
  private async generateCrossPollinationInsights(
    opportunities: unknown[],
    events: TwinEvent[]
  ): Promise<string[]> {
    const insights: string[] = [];

    // Count events by cross-pollination type
    const placementComplete = events.filter(e => e.eventType === 'placement_complete').length;
    const benchEnding = events.filter(e => e.eventType === 'bench_ending').length;
    const trainingGraduates = events.filter(e => e.eventType === 'training_graduate').length;
    const dealsClosed = events.filter(e => e.eventType === 'deal_closed').length;

    if (placementComplete > 0) {
      insights.push(
        `${placementComplete} new placement(s) ready for bench sales onboarding`
      );
    }

    if (benchEnding > 0) {
      insights.push(
        `${benchEnding} placement(s) ending soon - renewal opportunities for TA`
      );
    }

    if (trainingGraduates > 0) {
      insights.push(
        `${trainingGraduates} training graduate(s) ready for placement`
      );
    }

    if (dealsClosed > 0) {
      insights.push(
        `${dealsClosed} new deal(s) closed - recruiting pipeline needs attention`
      );
    }

    if (opportunities.length > 0) {
      insights.push(
        `${opportunities.length} cross-sell opportunity/opportunities identified`
      );
    }

    return insights;
  }

  /**
   * Generate standup summary using AI
   */
  private async generateStandupSummary(
    pillarSummaries: Record<TwinRole, PillarStandupSummary>,
    escalations: Escalation[]
  ): Promise<string> {
    const prompt = `Generate a brief (2-3 paragraph) daily standup summary for the CEO.

Pillar Status:
${Object.entries(pillarSummaries)
  .map(([p, s]) => `- ${p}: Health ${s.healthScore}%, ${s.blockers.length} blockers`)
  .join('\n')}

Escalations: ${escalations.length} requiring attention

Write in a professional, concise tone. Highlight the most important items.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an executive assistant summarizing daily operations.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return response.choices[0].message.content || 'Unable to generate summary.';
    } catch {
      return 'Daily standup summary unavailable.';
    }
  }

  /**
   * Calculate organism health score
   */
  private calculateOrganismHealthScore(
    pillarHealth: PillarHealth[],
    events: TwinEvent[]
  ): number {
    if (pillarHealth.length === 0) return 85;

    // Average pillar health
    const avgHealth =
      pillarHealth.reduce((sum, p) => sum + p.score, 0) / pillarHealth.length;

    // Penalty for critical escalations
    const criticalEvents = events.filter(e => e.priority === 'critical').length;
    const penalty = Math.min(criticalEvents * 5, 20);

    return Math.round(Math.max(avgHealth - penalty, 0));
  }

  /**
   * Calculate cross-pollination score
   */
  private calculateCrossPollinationScore(
    eventStats: Awaited<ReturnType<TwinEventBus['getStats']>>
  ): number {
    const crossPollinationTypes = [
      'placement_complete',
      'bench_ending',
      'training_graduate',
      'deal_closed',
      'cross_sell_opportunity',
    ];

    const crossEvents = crossPollinationTypes.reduce(
      (sum, type) => sum + (eventStats.byType[type] || 0),
      0
    );

    // Score based on activity (more cross-events = healthier organism)
    return Math.min(50 + crossEvents * 5, 100);
  }

  /**
   * Generate health alerts
   */
  private generateHealthAlerts(
    pillarHealth: PillarHealth[],
    eventStats: Awaited<ReturnType<TwinEventBus['getStats']>>
  ): string[] {
    const alerts: string[] = [];

    // Check for unhealthy pillars
    for (const pillar of pillarHealth) {
      if (pillar.status === 'critical') {
        alerts.push(`CRITICAL: ${pillar.pillar} pillar requires immediate attention`);
      } else if (pillar.status === 'warning') {
        alerts.push(`WARNING: ${pillar.pillar} pillar showing degraded performance`);
      }
    }

    // Check for high unprocessed events
    if (eventStats.unprocessed > 20) {
      alerts.push(`${eventStats.unprocessed} unprocessed events in queue`);
    }

    // Check for critical priority events
    if (eventStats.byPriority.critical > 0) {
      alerts.push(`${eventStats.byPriority.critical} critical event(s) pending`);
    }

    return alerts;
  }

  /**
   * Process a single event
   */
  private async processEvent(event: TwinEvent): Promise<string | null> {
    // Generate insight based on event type
    switch (event.eventType) {
      case 'placement_complete':
        return `New placement: ${event.payload.consultantName || 'Consultant'} at ${event.payload.clientName || 'Client'}`;

      case 'bench_ending':
        return `Placement ending: ${event.payload.consultantName || 'Consultant'} - renewal opportunity`;

      case 'training_graduate':
        return `Graduate ready: ${event.payload.studentName || 'Student'} completed training`;

      case 'deal_closed':
        return `Deal closed: ${event.payload.clientName || 'Client'} - ${event.payload.positions || '?'} position(s)`;

      case 'escalation':
        return `Escalation from ${event.sourceRole}: ${event.payload.title || 'Issue'}`;

      default:
        return null;
    }
  }

  /**
   * Save standup to database
   */
  private async saveStandup(report: StandupReport): Promise<void> {
    try {
      await (this.supabase.from as (table: string) => { upsert: (data: Record<string, unknown>) => Promise<void> })('org_standups').upsert({
        org_id: this.orgId,
        standup_date: report.date,
        generated_by: 'organization_twin',
        report: report as unknown as Record<string, unknown>,
        pillar_summaries: report.pillarSummaries as unknown as Record<string, unknown>,
        cross_pollination_insights: report.crossPollinationInsights,
        escalations: report.escalations as unknown as Record<string, unknown>[],
        blockers: report.blockers as unknown as Record<string, unknown>[],
        organism_health_score: report.organismHealthScore,
      });
    } catch (error) {
      console.error('[OrganizationTwin] Failed to save standup:', error);
    }
  }

  /**
   * Handle direct query to OrganizationTwin
   */
  private async handleDirectQuery(question: string): Promise<string> {
    const context = await this.context.getOrgMetrics(this.orgId);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are the Organization Twin, the central AI coordinator for a Guidewire staffing organization.

You have access to all pillars: Recruiting, Bench Sales, TA, HR, Immigration, Academy.

Organization Context:
${JSON.stringify(context, null, 2)}

Answer questions about the organization, coordinate cross-pillar activities, and provide strategic guidance.`,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || 'Unable to process query.';
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create an OrganizationTwin instance
 */
export function createOrganizationTwin(
  orgId: string,
  userId: string,
  dependencies?: {
    supabase?: SupabaseClient<Database>;
    openai?: OpenAI;
  }
): OrganizationTwin {
  return new OrganizationTwin(orgId, userId, undefined, dependencies);
}
