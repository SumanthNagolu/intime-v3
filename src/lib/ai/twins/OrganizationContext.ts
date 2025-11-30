/**
 * Organization Context Pool
 *
 * Epic: AI Twin Living Organism
 * Phase 3: Shared Context Pool
 *
 * Provides shared organizational knowledge accessible by all twins.
 * Uses caching with TTL to minimize database queries.
 *
 * @module lib/ai/twins/OrganizationContext
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { TwinRole } from '@/types/productivity';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Organization priority item
 */
export interface OrgPriority {
  id: string;
  title: string;
  description: string;
  pillar?: TwinRole;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
  owner?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

/**
 * Pillar health status
 */
export interface PillarHealth {
  pillar: TwinRole;
  status: 'healthy' | 'warning' | 'critical';
  score: number; // 0-100
  metrics: Record<string, number | string>;
  alerts: string[];
  lastUpdated: string;
}

/**
 * Organization-wide metrics
 */
export interface OrgMetrics {
  totalEmployees: number;
  activeConsultants: number;
  openRequisitions: number;
  benchCount: number;
  avgBenchDays: number;
  pipelineValue: number;
  monthlyRevenue: number;
  trainingGraduates: number;
  placementRate: number;
  updatedAt: string;
}

/**
 * Cross-pollination opportunity
 */
export interface CrossPollinationOpportunity {
  id: string;
  type: 'placement_to_bench' | 'bench_to_ta' | 'graduate_to_placement' | 'deal_to_recruiting' | 'custom';
  sourceRole: TwinRole;
  targetRole: TwinRole;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  data: Record<string, unknown>;
  createdAt: string;
  expiresAt?: string;
}

/**
 * Context types that can be cached
 */
export type ContextType = 'priorities' | 'metrics' | 'pillar_health' | 'cross_pollination' | 'announcements' | 'goals';

// ============================================================================
// ORGANIZATION CONTEXT CLASS
// ============================================================================

/**
 * Organization Context Pool
 *
 * Shared knowledge base for all AI twins in an organization.
 * Provides cached access to org-wide priorities, metrics, and opportunities.
 */
export class OrganizationContext {
  private supabase: SupabaseClient<Database>;
  private localCache: Map<string, { data: unknown; expiresAt: Date }>;
  private defaultTTLHours: number;

  constructor(
    supabase?: SupabaseClient<Database>,
    _options?: { defaultTTLHours?: number }
  ) {
    this.supabase =
      supabase ||
      createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );
    this.localCache = new Map();
    this.defaultTTLHours = _options?.defaultTTLHours || 24;
  }

  // ==========================================================================
  // PUBLIC METHODS
  // ==========================================================================

  /**
   * Get organization priorities
   *
   * @param orgId - Organization ID
   * @param forceRefresh - Skip cache and fetch fresh data
   * @returns Array of organization priorities
   */
  async getOrgPriorities(orgId: string, forceRefresh = false): Promise<OrgPriority[]> {
    const _cacheKey = `${orgId}:priorities`;

    if (!forceRefresh) {
      const cached = await this.getFromCache<OrgPriority[]>(orgId, 'priorities');
      if (cached) return cached;
    }

    // Fetch from database or generate
    const priorities = await this.fetchOrgPriorities(orgId);

    // Cache the result
    await this.setInCache(orgId, 'priorities', priorities);

    return priorities;
  }

  /**
   * Get organization metrics
   *
   * @param orgId - Organization ID
   * @param forceRefresh - Skip cache and fetch fresh data
   * @returns Organization-wide metrics
   */
  async getOrgMetrics(orgId: string, forceRefresh = false): Promise<OrgMetrics> {
    const _cacheKey = `${orgId}:metrics`;

    if (!forceRefresh) {
      const cached = await this.getFromCache<OrgMetrics>(orgId, 'metrics');
      if (cached) return cached;
    }

    // Fetch from database
    const metrics = await this.fetchOrgMetrics(orgId);

    // Cache the result
    await this.setInCache(orgId, 'metrics', metrics);

    return metrics;
  }

  /**
   * Get pillar health status
   *
   * @param orgId - Organization ID
   * @param pillar - Optional specific pillar to get
   * @returns Pillar health status(es)
   */
  async getPillarHealth(
    orgId: string,
    pillar?: TwinRole
  ): Promise<PillarHealth[] | PillarHealth | null> {
    const cached = await this.getFromCache<PillarHealth[]>(orgId, 'pillar_health');
    const healthData = cached || await this.fetchPillarHealth(orgId);

    if (!cached) {
      await this.setInCache(orgId, 'pillar_health', healthData);
    }

    if (pillar) {
      return healthData.find(h => h.pillar === pillar) || null;
    }

    return healthData;
  }

  /**
   * Get cross-pollination opportunities
   *
   * @param orgId - Organization ID
   * @param targetRole - Optional filter by target role
   * @returns Array of opportunities
   */
  async getCrossPollinationOpportunities(
    orgId: string,
    targetRole?: TwinRole
  ): Promise<CrossPollinationOpportunity[]> {
    const cached = await this.getFromCache<CrossPollinationOpportunity[]>(orgId, 'cross_pollination');
    let opportunities = cached || await this.fetchCrossPollinationOpportunities(orgId);

    if (!cached) {
      await this.setInCache(orgId, 'cross_pollination', opportunities, 1); // Short TTL for opportunities
    }

    if (targetRole) {
      opportunities = opportunities.filter(o => o.targetRole === targetRole);
    }

    return opportunities;
  }

  /**
   * Search organization knowledge base using RAG
   *
   * @param query - Search query
   * @param orgId - Organization ID
   * @param options - Search options
   * @returns Relevant documents
   */
  async searchOrgKnowledge(
    query: string,
    orgId: string,
    _options?: { limit?: number; threshold?: number }
  ): Promise<{ content: string; source: string; score: number }[]> {
    // TODO: Integrate with existing RAG system
    // For now, return empty array
    console.log(`[OrganizationContext] RAG search for: "${query}" in org ${orgId}`);

    // This would use the RAGRetriever from the existing infrastructure
    // const retriever = new RAGRetriever(this.supabase);
    // return retriever.search(query, { namespace: `org:${orgId}`, ..._options });

    return [];
  }

  /**
   * Refresh all cached context for an organization
   *
   * @param orgId - Organization ID
   */
  async refreshContext(orgId: string): Promise<void> {
    console.log(`[OrganizationContext] Refreshing all context for org ${orgId}`);

    await Promise.all([
      this.getOrgPriorities(orgId, true),
      this.getOrgMetrics(orgId, true),
      this.getPillarHealth(orgId),
      this.getCrossPollinationOpportunities(orgId),
    ]);

    console.log(`[OrganizationContext] Context refresh complete for org ${orgId}`);
  }

  /**
   * Add a cross-pollination opportunity
   *
   * @param orgId - Organization ID
   * @param opportunity - Opportunity to add
   */
  async addCrossPollinationOpportunity(
    orgId: string,
    opportunity: Omit<CrossPollinationOpportunity, 'id' | 'createdAt'>
  ): Promise<string> {
    const id = crypto.randomUUID();
    const fullOpportunity: CrossPollinationOpportunity = {
      ...opportunity,
      id,
      createdAt: new Date().toISOString(),
    };

    // Add to cache
    const existing = await this.getCrossPollinationOpportunities(orgId);
    existing.push(fullOpportunity);
    await this.setInCache(orgId, 'cross_pollination', existing, 1);

    // Persist to database
    await (this.supabase.from as (table: string) => unknown)('org_context_cache').upsert({
      org_id: orgId,
      context_type: 'cross_pollination',
      data: existing as unknown as Record<string, unknown>,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      updated_at: new Date().toISOString(),
    });

    return id;
  }

  /**
   * Clear local cache
   */
  clearLocalCache(): void {
    this.localCache.clear();
  }

  // ==========================================================================
  // PRIVATE METHODS - CACHE MANAGEMENT
  // ==========================================================================

  /**
   * Get data from cache (local first, then database)
   */
  private async getFromCache<T>(orgId: string, contextType: ContextType): Promise<T | null> {
    const cacheKey = `${orgId}:${contextType}`;

    // Check local cache first
    const local = this.localCache.get(cacheKey);
    if (local && local.expiresAt > new Date()) {
      return local.data as T;
    }

    // Check database cache
    const { data } = await (this.supabase.rpc as (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown }>)('get_org_context', {
      p_org_id: orgId,
      p_context_type: contextType,
    });

    if (data) {
      // Store in local cache
      this.localCache.set(cacheKey, {
        data,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min local TTL
      });
      return data as T;
    }

    return null;
  }

  /**
   * Set data in cache (local and database)
   */
  private async setInCache<T>(
    orgId: string,
    contextType: ContextType,
    data: T,
    ttlHours?: number
  ): Promise<void> {
    const cacheKey = `${orgId}:${contextType}`;
    const ttl = ttlHours || this.defaultTTLHours;

    // Update local cache
    this.localCache.set(cacheKey, {
      data,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min local TTL
    });

    // Update database cache
    await (this.supabase.rpc as (fn: string, params: Record<string, unknown>) => Promise<unknown>)('set_org_context', {
      p_org_id: orgId,
      p_context_type: contextType,
      p_data: data as unknown as Record<string, unknown>,
      p_ttl_hours: ttl,
    });
  }

  // ==========================================================================
  // PRIVATE METHODS - DATA FETCHING
  // ==========================================================================

  /**
   * Fetch organization priorities from database
   */
  private async fetchOrgPriorities(_orgId: string): Promise<OrgPriority[]> {
    // TODO: Query actual priorities table when available
    // For now, return placeholder data
    return [
      {
        id: '1',
        title: 'Q4 Revenue Target',
        description: 'Achieve $2M in placements',
        priority: 'high',
        status: 'in_progress',
      },
      {
        id: '2',
        title: 'Reduce Bench Days',
        description: 'Average bench days < 30',
        pillar: 'bench_sales',
        priority: 'high',
        status: 'in_progress',
      },
      {
        id: '3',
        title: 'Training Graduation Rate',
        description: 'Maintain 90%+ graduation rate',
        pillar: 'trainer',
        priority: 'medium',
        status: 'in_progress',
      },
    ];
  }

  /**
   * Fetch organization metrics from database
   */
  private async fetchOrgMetrics(_orgId: string): Promise<OrgMetrics> {
    // TODO: Query actual metrics from various tables
    // For now, return placeholder data
    return {
      totalEmployees: 0,
      activeConsultants: 0,
      openRequisitions: 0,
      benchCount: 0,
      avgBenchDays: 0,
      pipelineValue: 0,
      monthlyRevenue: 0,
      trainingGraduates: 0,
      placementRate: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Fetch pillar health from database
   */
  private async fetchPillarHealth(_orgId: string): Promise<PillarHealth[]> {
    const pillars: TwinRole[] = [
      'recruiter',
      'bench_sales',
      'talent_acquisition',
      'hr',
      'immigration',
      'trainer',
    ];

    // TODO: Calculate actual health metrics per pillar
    return pillars.map(pillar => ({
      pillar,
      status: 'healthy' as const,
      score: 85,
      metrics: {},
      alerts: [],
      lastUpdated: new Date().toISOString(),
    }));
  }

  /**
   * Fetch cross-pollination opportunities
   */
  private async fetchCrossPollinationOpportunities(
    orgId: string
  ): Promise<CrossPollinationOpportunity[]> {
    // Define the expected event structure
    interface TwinEvent {
      id: string;
      event_type: string;
      source_role: string;
      target_role?: string;
      priority: string;
      payload: Record<string, unknown>;
      created_at: string;
      expires_at?: string;
    }

    // Query from twin_events for potential opportunities
    const { data: events } = await (this.supabase.from as (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: unknown) => {
          eq: (column: string, value: unknown) => {
            in: (column: string, values: string[]) => {
              order: (column: string, options: { ascending: boolean }) => {
                limit: (count: number) => Promise<{ data: TwinEvent[] | null }>;
              };
            };
          };
        };
      };
    })('twin_events')
      .select('*')
      .eq('org_id', orgId)
      .eq('processed', false)
      .in('event_type', [
        'placement_complete',
        'bench_ending',
        'training_graduate',
        'deal_closed',
        'cross_sell_opportunity',
      ])
      .order('created_at', { ascending: false })
      .limit(20);

    if (!events) return [];

    return events.map((event: TwinEvent) => ({
      id: event.id,
      type: this.mapEventTypeToOpportunityType(event.event_type),
      sourceRole: event.source_role as TwinRole,
      targetRole: (event.target_role || 'ceo') as TwinRole,
      title: this.generateOpportunityTitle(event as unknown as Record<string, unknown>),
      description: (event.payload as Record<string, string>)?.description || '',
      priority: event.priority as 'low' | 'medium' | 'high',
      data: event.payload as Record<string, unknown>,
      createdAt: event.created_at,
      expiresAt: event.expires_at || undefined,
    }));
  }

  /**
   * Map event type to opportunity type
   */
  private mapEventTypeToOpportunityType(
    eventType: string
  ): CrossPollinationOpportunity['type'] {
    const mapping: Record<string, CrossPollinationOpportunity['type']> = {
      placement_complete: 'placement_to_bench',
      bench_ending: 'bench_to_ta',
      training_graduate: 'graduate_to_placement',
      deal_closed: 'deal_to_recruiting',
    };
    return mapping[eventType] || 'custom';
  }

  /**
   * Generate opportunity title from event
   */
  private generateOpportunityTitle(event: Record<string, unknown>): string {
    const payload = event.payload as Record<string, string> | undefined;
    if (payload?.title) return payload.title;

    const typeLabels: Record<string, string> = {
      placement_complete: 'New Placement - Add to Bench',
      bench_ending: 'Placement Ending - Renewal Opportunity',
      training_graduate: 'Graduate Ready for Placement',
      deal_closed: 'New Deal - Recruiting Needed',
      cross_sell_opportunity: 'Cross-Sell Opportunity',
    };

    return typeLabels[event.event_type as string] || 'New Opportunity';
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let defaultOrganizationContext: OrganizationContext | null = null;

/**
 * Get the default OrganizationContext instance
 */
export function getOrganizationContext(): OrganizationContext {
  if (!defaultOrganizationContext) {
    defaultOrganizationContext = new OrganizationContext();
  }
  return defaultOrganizationContext;
}

/**
 * Reset the default OrganizationContext (for testing)
 */
export function resetOrganizationContext(): void {
  defaultOrganizationContext = null;
}
