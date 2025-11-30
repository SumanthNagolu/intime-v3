/**
 * Twin Event Bus
 *
 * Epic: AI Twin Living Organism
 * Phase 4: Async Communication Layer
 *
 * Enables asynchronous event-driven communication between AI twins.
 * Events are persisted to database and can be processed on-demand.
 *
 * @module lib/ai/twins/TwinEventBus
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { TwinRole, CrossPollinationEvent } from '@/types/productivity';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Twin event types
 */
export type TwinEventType =
  | CrossPollinationEvent
  | 'custom';

/**
 * Event priority levels
 */
export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Twin event structure
 */
export interface TwinEvent {
  id: string;
  orgId: string;
  sourceUserId: string;
  sourceRole: TwinRole;
  targetRole: TwinRole | null; // null = broadcast
  eventType: TwinEventType;
  payload: Record<string, unknown>;
  priority: EventPriority;
  processed: boolean;
  processedAt: string | null;
  processedBy: string | null;
  createdAt: string;
  expiresAt: string | null;
}

/**
 * Event creation input
 */
export interface CreateEventInput {
  sourceRole: TwinRole;
  targetRole?: TwinRole | null;
  eventType: TwinEventType;
  payload?: Record<string, unknown>;
  priority?: EventPriority;
}

/**
 * Event handler function type
 */
export type EventHandler = (event: TwinEvent) => Promise<void> | void;

/**
 * Event query options
 */
export interface EventQueryOptions {
  unprocessedOnly?: boolean;
  limit?: number;
  priority?: EventPriority;
  eventTypes?: TwinEventType[];
  since?: Date;
}

// ============================================================================
// TWIN EVENT BUS CLASS
// ============================================================================

/**
 * Twin Event Bus
 *
 * Manages async event-driven communication between AI twins.
 * Events are persisted and can be queried on-demand.
 */
export class TwinEventBus {
  private supabase: SupabaseClient<Database>;
  private orgId: string;
  private userId: string;
  private handlers: Map<TwinEventType, EventHandler[]>;

  constructor(
    orgId: string,
    userId: string,
    supabase?: SupabaseClient<Database>
  ) {
    this.orgId = orgId;
    this.userId = userId;
    this.supabase =
      supabase ||
      createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );
    this.handlers = new Map();
  }

  // ==========================================================================
  // PUBLIC METHODS - EVENT EMISSION
  // ==========================================================================

  /**
   * Emit an event to the bus
   *
   * @param input - Event creation input
   * @returns Created event ID
   *
   * @example
   * ```typescript
   * const eventBus = new TwinEventBus(orgId, userId);
   *
   * // Emit placement complete event to Bench Sales
   * await eventBus.emit({
   *   sourceRole: 'recruiter',
   *   targetRole: 'bench_sales',
   *   eventType: 'placement_complete',
   *   payload: { consultantId: '123', clientId: '456', startDate: '2024-01-15' },
   *   priority: 'high',
   * });
   * ```
   */
  async emit(input: CreateEventInput): Promise<string> {
    type RpcFunction = (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    const { data, error } = await (this.supabase.rpc as unknown as RpcFunction)('emit_twin_event', {
      p_org_id: this.orgId,
      p_source_user_id: this.userId,
      p_source_role: input.sourceRole,
      p_target_role: input.targetRole || null,
      p_event_type: input.eventType,
      p_payload: input.payload || {},
      p_priority: input.priority || 'medium',
    });

    if (error) {
      throw new Error(`Failed to emit event: ${(error as Error).message}`);
    }

    console.log(
      `[TwinEventBus] Event emitted: ${input.eventType} from ${input.sourceRole} to ${input.targetRole || 'all'}`
    );

    return data as string;
  }

  /**
   * Emit a broadcast event to all twins
   *
   * @param eventType - Event type
   * @param payload - Event payload
   * @param priority - Event priority
   * @returns Created event ID
   */
  async broadcast(
    eventType: TwinEventType,
    sourceRole: TwinRole,
    payload?: Record<string, unknown>,
    priority: EventPriority = 'medium'
  ): Promise<string> {
    return this.emit({
      sourceRole,
      targetRole: null, // null = broadcast
      eventType,
      payload,
      priority,
    });
  }

  /**
   * Emit an escalation to CEO
   *
   * @param sourceRole - Role escalating the issue
   * @param title - Escalation title
   * @param description - Detailed description
   * @param priority - Priority level
   * @returns Created event ID
   */
  async escalate(
    sourceRole: TwinRole,
    title: string,
    description: string,
    priority: EventPriority = 'high'
  ): Promise<string> {
    return this.emit({
      sourceRole,
      targetRole: 'ceo',
      eventType: 'escalation',
      payload: { title, description },
      priority,
    });
  }

  // ==========================================================================
  // PUBLIC METHODS - EVENT RETRIEVAL
  // ==========================================================================

  /**
   * Get events for a specific role
   *
   * @param role - Target role
   * @param options - Query options
   * @returns Array of events
   */
  async getEventsForRole(
    role: TwinRole,
    options?: EventQueryOptions
  ): Promise<TwinEvent[]> {
    type RpcFunction = (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    const { data, error } = await (this.supabase.rpc as unknown as RpcFunction)('get_twin_events_for_role', {
      p_org_id: this.orgId,
      p_role: role,
      p_limit: options?.limit || 50,
    });

    if (error) {
      throw new Error(`Failed to get events: ${(error as Error).message}`);
    }

    return (data as Record<string, unknown>[] || []).map((row) => this.mapEventRow(row));
  }

  /**
   * Get all unprocessed events
   *
   * @param options - Query options
   * @returns Array of events
   */
  async getUnprocessedEvents(options?: EventQueryOptions): Promise<TwinEvent[]> {
    type QueryBuilder = {
      select: (columns: string) => QueryBuilder;
      eq: (column: string, value: unknown) => QueryBuilder;
      limit: (count: number) => QueryBuilder;
      in: (column: string, values: unknown[]) => QueryBuilder;
      gte: (column: string, value: string) => QueryBuilder;
      order: (column: string, opts: { ascending: boolean }) => QueryBuilder;
      then: <T>(onfulfilled: (value: { data: unknown; error: unknown }) => T) => Promise<T>;
    };
    type FromFunction = (table: string) => QueryBuilder;

    let query = (this.supabase.from as unknown as FromFunction)('twin_events')
      .select('*')
      .eq('org_id', this.orgId)
      .eq('processed', false)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.priority) {
      query = query.eq('priority', options.priority);
    }

    if (options?.eventTypes && options.eventTypes.length > 0) {
      query = query.in('event_type', options.eventTypes);
    }

    if (options?.since) {
      query = query.gte('created_at', options.since.toISOString());
    }

    const { data, error } = await query.then((result) => result);

    if (error) {
      throw new Error(`Failed to get unprocessed events: ${(error as Error).message}`);
    }

    return (data as Record<string, unknown>[] || []).map((row) => this.mapEventRow(row));
  }

  /**
   * Get broadcast events (events with no specific target)
   *
   * @param options - Query options
   * @returns Array of broadcast events
   */
  async getBroadcasts(options?: EventQueryOptions): Promise<TwinEvent[]> {
    type QueryBuilder = {
      select: (columns: string) => QueryBuilder;
      eq: (column: string, value: unknown) => QueryBuilder;
      is: (column: string, value: null) => QueryBuilder;
      limit: (count: number) => QueryBuilder;
      order: (column: string, opts: { ascending: boolean }) => QueryBuilder;
      then: <T>(onfulfilled: (value: { data: unknown; error: unknown }) => T) => Promise<T>;
    };
    type FromFunction = (table: string) => QueryBuilder;

    let query = (this.supabase.from as unknown as FromFunction)('twin_events')
      .select('*')
      .eq('org_id', this.orgId)
      .is('target_role', null)
      .order('created_at', { ascending: false });

    if (options?.unprocessedOnly) {
      query = query.eq('processed', false);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query.then((result) => result);

    if (error) {
      throw new Error(`Failed to get broadcasts: ${(error as Error).message}`);
    }

    return (data as Record<string, unknown>[] || []).map((row) => this.mapEventRow(row));
  }

  /**
   * Get event by ID
   *
   * @param eventId - Event ID
   * @returns Event or null
   */
  async getEvent(eventId: string): Promise<TwinEvent | null> {
    type QueryBuilder = {
      select: (columns: string) => QueryBuilder;
      eq: (column: string, value: unknown) => QueryBuilder;
      single: () => Promise<{ data: unknown; error: unknown }>;
    };
    type FromFunction = (table: string) => QueryBuilder;

    const { data, error } = await (this.supabase.from as unknown as FromFunction)('twin_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapEventRow(data as Record<string, unknown>);
  }

  // ==========================================================================
  // PUBLIC METHODS - EVENT PROCESSING
  // ==========================================================================

  /**
   * Mark an event as processed
   *
   * @param eventId - Event ID
   * @returns Success status
   */
  async markProcessed(eventId: string): Promise<boolean> {
    type RpcFunction = (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    const { data, error } = await (this.supabase.rpc as unknown as RpcFunction)('mark_twin_event_processed', {
      p_event_id: eventId,
      p_processed_by: this.userId,
    });

    if (error) {
      console.error(`[TwinEventBus] Failed to mark event processed:`, error);
      return false;
    }

    return data as boolean;
  }

  /**
   * Process all events for a role with a handler
   *
   * @param role - Role to process events for
   * @param handler - Handler function
   * @returns Number of events processed
   */
  async processEventsForRole(
    role: TwinRole,
    handler: EventHandler
  ): Promise<number> {
    const events = await this.getEventsForRole(role, { unprocessedOnly: true });
    let processed = 0;

    for (const event of events) {
      try {
        await handler(event);
        await this.markProcessed(event.id);
        processed++;
      } catch (error) {
        console.error(`[TwinEventBus] Failed to process event ${event.id}:`, error);
      }
    }

    return processed;
  }

  // ==========================================================================
  // PUBLIC METHODS - EVENT SUBSCRIPTION (IN-MEMORY)
  // ==========================================================================

  /**
   * Subscribe to events of a specific type (in-memory only)
   *
   * @param eventType - Event type to subscribe to
   * @param handler - Handler function
   */
  subscribe(eventType: TwinEventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  /**
   * Unsubscribe from events
   *
   * @param eventType - Event type
   * @param handler - Handler to remove
   */
  unsubscribe(eventType: TwinEventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    const index = existing.indexOf(handler);
    if (index > -1) {
      existing.splice(index, 1);
    }
  }

  /**
   * Trigger handlers for an event (manual invocation)
   *
   * @param event - Event to trigger handlers for
   */
  async triggerHandlers(event: TwinEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`[TwinEventBus] Handler error for ${event.eventType}:`, error);
      }
    }
  }

  // ==========================================================================
  // PUBLIC METHODS - STATISTICS
  // ==========================================================================

  /**
   * Get event statistics
   *
   * @returns Event counts by status and type
   */
  async getStats(): Promise<{
    total: number;
    unprocessed: number;
    byType: Record<string, number>;
    byPriority: Record<EventPriority, number>;
  }> {
    type QueryBuilder = {
      select: (columns: string) => QueryBuilder;
      eq: (column: string, value: unknown) => QueryBuilder;
      then: <T>(onfulfilled: (value: { data: unknown; error: unknown }) => T) => Promise<T>;
    };
    type FromFunction = (table: string) => QueryBuilder;

    const { data: events } = await (this.supabase.from as unknown as FromFunction)('twin_events')
      .select('event_type, priority, processed')
      .eq('org_id', this.orgId)
      .then((result) => result);

    if (!events) {
      return {
        total: 0,
        unprocessed: 0,
        byType: {},
        byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
      };
    }

    const byType: Record<string, number> = {};
    const byPriority: Record<EventPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    let unprocessed = 0;

    type EventRow = { event_type: string; priority: EventPriority; processed: boolean };
    for (const event of events as EventRow[]) {
      byType[event.event_type] = (byType[event.event_type] || 0) + 1;
      byPriority[event.priority as EventPriority]++;
      if (!event.processed) unprocessed++;
    }

    return {
      total: (events as EventRow[]).length,
      unprocessed,
      byType,
      byPriority,
    };
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Map database row to TwinEvent
   */
  private mapEventRow(row: Record<string, unknown>): TwinEvent {
    return {
      id: row.id as string,
      orgId: row.org_id as string,
      sourceUserId: row.source_user_id as string,
      sourceRole: row.source_role as TwinRole,
      targetRole: (row.target_role as TwinRole) || null,
      eventType: row.event_type as TwinEventType,
      payload: (row.payload as Record<string, unknown>) || {},
      priority: row.priority as EventPriority,
      processed: row.processed as boolean,
      processedAt: row.processed_at as string | null,
      processedBy: row.processed_by as string | null,
      createdAt: row.created_at as string,
      expiresAt: row.expires_at as string | null,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a TwinEventBus instance
 *
 * @param orgId - Organization ID
 * @param userId - User ID
 * @param supabase - Optional Supabase client
 * @returns TwinEventBus instance
 */
export function createTwinEventBus(
  orgId: string,
  userId: string,
  supabase?: SupabaseClient<Database>
): TwinEventBus {
  return new TwinEventBus(orgId, userId, supabase);
}

// ============================================================================
// CONVENIENCE EMIT FUNCTIONS
// ============================================================================

/**
 * Quick emit function for common events
 */
export const TwinEvents = {
  /**
   * Recruiter completed a placement
   */
  placementComplete: (
    bus: TwinEventBus,
    data: {
      consultantId: string;
      consultantName: string;
      clientId: string;
      clientName: string;
      startDate: string;
      endDate?: string;
      rate?: number;
    }
  ) =>
    bus.emit({
      sourceRole: 'recruiter',
      targetRole: 'bench_sales',
      eventType: 'placement_complete',
      payload: data,
      priority: 'high',
    }),

  /**
   * Bench placement ending soon
   */
  benchEnding: (
    bus: TwinEventBus,
    data: {
      consultantId: string;
      consultantName: string;
      clientId: string;
      clientName: string;
      endDate: string;
      renewalPotential: 'low' | 'medium' | 'high';
    }
  ) =>
    bus.emit({
      sourceRole: 'bench_sales',
      targetRole: 'talent_acquisition',
      eventType: 'bench_ending',
      payload: data,
      priority: 'high',
    }),

  /**
   * Training graduate ready for placement
   */
  trainingGraduate: (
    bus: TwinEventBus,
    data: {
      studentId: string;
      studentName: string;
      completedCourses: string[];
      certifications: string[];
      skills: string[];
      graduationDate: string;
    }
  ) =>
    bus.emit({
      sourceRole: 'trainer',
      targetRole: 'recruiter',
      eventType: 'training_graduate',
      payload: data,
      priority: 'medium',
    }),

  /**
   * TA closed a deal
   */
  dealClosed: (
    bus: TwinEventBus,
    data: {
      dealId: string;
      clientId: string;
      clientName: string;
      positions: number;
      skills: string[];
      startDate: string;
    }
  ) =>
    bus.emit({
      sourceRole: 'talent_acquisition',
      targetRole: 'recruiter',
      eventType: 'deal_closed',
      payload: data,
      priority: 'high',
    }),

  /**
   * Cross-sell opportunity identified
   */
  crossSellOpportunity: (
    bus: TwinEventBus,
    sourceRole: TwinRole,
    data: {
      clientId: string;
      clientName: string;
      opportunity: string;
      estimatedValue?: number;
    }
  ) =>
    bus.emit({
      sourceRole,
      targetRole: 'talent_acquisition',
      eventType: 'cross_sell_opportunity',
      payload: data,
      priority: 'medium',
    }),

  /**
   * Milestone reached (broadcast)
   */
  milestoneReached: (
    bus: TwinEventBus,
    sourceRole: TwinRole,
    data: {
      title: string;
      description: string;
      metric?: string;
      value?: number;
    }
  ) =>
    bus.broadcast('milestone_reached', sourceRole, data, 'low'),
};
