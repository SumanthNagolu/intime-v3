/**
 * Events Router
 * 
 * Read-only router for querying events (immutable audit log).
 * Events are system records - they cannot be created, updated, or deleted via API.
 * Events are created automatically by the EventEmitter when actions occur.
 * 
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { eq, and, desc, gte, lte, inArray, sql } from 'drizzle-orm';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const eventCategorySchema = z.enum([
  'entity', 'workflow', 'system', 'integration', 'security', 'notification'
]);

const eventSeveritySchema = z.enum(['info', 'warning', 'error', 'critical']);

const actorTypeSchema = z.enum(['user', 'system', 'integration', 'scheduler', 'webhook']);

const entityTypeSchema = z.enum([
  'candidate', 'job', 'submission', 'interview', 'placement',
  'account', 'contact', 'lead', 'deal',
  'activity', 'user', 'organization'
]);

// =====================================================
// EVENTS ROUTER
// =====================================================

export const eventsRouter = router({
  
  // ─────────────────────────────────────────────────────
  // LIST EVENTS FOR ENTITY
  // ─────────────────────────────────────────────────────
  
  /**
   * Get events for a specific entity (timeline view)
   */
  forEntity: orgProtectedProcedure
    .input(z.object({
      entityType: entityTypeSchema,
      entityId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      categories: z.array(eventCategorySchema).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const conditions = [
        eq(events.orgId, orgId),
        eq(events.entityType, input.entityType),
        eq(events.entityId, input.entityId),
      ];
      
      if (input.categories && input.categories.length > 0) {
        conditions.push(inArray(events.eventCategory, input.categories));
      }
      
      const result = await db.select()
        .from(events)
        .where(and(...conditions))
        .orderBy(desc(events.occurredAt))
        .limit(input.limit)
        .offset(input.offset);
      
      return result;
    }),

  // ─────────────────────────────────────────────────────
  // GET SINGLE EVENT
  // ─────────────────────────────────────────────────────
  
  /**
   * Get a single event by ID
   */
  get: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const [event] = await db.select()
        .from(events)
        .where(and(
          eq(events.id, input.id),
          eq(events.orgId, orgId)
        ))
        .limit(1);
      
      return event || null;
    }),

  // ─────────────────────────────────────────────────────
  // SEARCH/FILTER EVENTS
  // ─────────────────────────────────────────────────────
  
  /**
   * Search events with filters
   */
  search: orgProtectedProcedure
    .input(z.object({
      // Entity filters
      entityType: entityTypeSchema.optional(),
      entityId: z.string().uuid().optional(),
      
      // Event type filters
      eventType: z.string().optional(),
      eventCategory: eventCategorySchema.optional(),
      eventSeverity: eventSeveritySchema.optional(),
      
      // Actor filters
      actorType: actorTypeSchema.optional(),
      actorId: z.string().uuid().optional(),
      
      // Date range
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      
      // Pagination
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const conditions = [eq(events.orgId, orgId)];
      
      if (input.entityType) {
        conditions.push(eq(events.entityType, input.entityType));
      }
      
      if (input.entityId) {
        conditions.push(eq(events.entityId, input.entityId));
      }
      
      if (input.eventType) {
        conditions.push(eq(events.eventType, input.eventType));
      }
      
      if (input.eventCategory) {
        conditions.push(eq(events.eventCategory, input.eventCategory));
      }
      
      if (input.eventSeverity) {
        conditions.push(eq(events.severity, input.eventSeverity));
      }
      
      if (input.actorType) {
        conditions.push(eq(events.actorType, input.actorType));
      }
      
      if (input.actorId) {
        conditions.push(eq(events.actorId, input.actorId));
      }
      
      if (input.startDate) {
        conditions.push(gte(events.occurredAt, input.startDate));
      }
      
      if (input.endDate) {
        conditions.push(lte(events.occurredAt, input.endDate));
      }
      
      const result = await db.select()
        .from(events)
        .where(and(...conditions))
        .orderBy(desc(events.occurredAt))
        .limit(input.limit)
        .offset(input.offset);
      
      return result;
    }),

  // ─────────────────────────────────────────────────────
  // GET RECENT EVENTS
  // ─────────────────────────────────────────────────────
  
  /**
   * Get recent events across the organization
   */
  recent: orgProtectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      categories: z.array(eventCategorySchema).optional(),
      severities: z.array(eventSeveritySchema).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const conditions = [eq(events.orgId, orgId)];
      
      if (input.categories && input.categories.length > 0) {
        conditions.push(inArray(events.eventCategory, input.categories));
      }
      
      if (input.severities && input.severities.length > 0) {
        conditions.push(inArray(events.severity, input.severities));
      }
      
      const result = await db.select()
        .from(events)
        .where(and(...conditions))
        .orderBy(desc(events.occurredAt))
        .limit(input.limit);
      
      return result;
    }),

  // ─────────────────────────────────────────────────────
  // EVENT TYPE COUNTS
  // ─────────────────────────────────────────────────────
  
  /**
   * Get event counts by type (for analytics)
   */
  countsByType: orgProtectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      entityType: entityTypeSchema.optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const conditions = [eq(events.orgId, orgId)];
      
      if (input.startDate) {
        conditions.push(gte(events.occurredAt, input.startDate));
      }
      
      if (input.endDate) {
        conditions.push(lte(events.occurredAt, input.endDate));
      }
      
      if (input.entityType) {
        conditions.push(eq(events.entityType, input.entityType));
      }
      
      const result = await db.select({
        eventType: events.eventType,
        count: sql<number>`count(*)::int`,
      })
        .from(events)
        .where(and(...conditions))
        .groupBy(events.eventType)
        .orderBy(desc(sql`count(*)`));
      
      return result;
    }),

  // ─────────────────────────────────────────────────────
  // USER ACTIVITY FEED
  // ─────────────────────────────────────────────────────
  
  /**
   * Get events triggered by a specific user
   */
  byActor: orgProtectedProcedure
    .input(z.object({
      actorId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const result = await db.select()
        .from(events)
        .where(and(
          eq(events.orgId, orgId),
          eq(events.actorId, input.actorId),
          eq(events.actorType, 'user')
        ))
        .orderBy(desc(events.occurredAt))
        .limit(input.limit)
        .offset(input.offset);
      
      return result;
    }),

  // ─────────────────────────────────────────────────────
  // CORRELATED EVENTS
  // ─────────────────────────────────────────────────────
  
  /**
   * Get events by correlation ID (linked events)
   */
  correlated: orgProtectedProcedure
    .input(z.object({
      correlationId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const result = await db.select()
        .from(events)
        .where(and(
          eq(events.orgId, orgId),
          eq(events.correlationId, input.correlationId)
        ))
        .orderBy(events.occurredAt);
      
      return result;
    }),

  // ─────────────────────────────────────────────────────
  // SECURITY EVENTS (for admins)
  // ─────────────────────────────────────────────────────
  
  /**
   * Get security-related events
   */
  security: orgProtectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      startDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const conditions = [
        eq(events.orgId, orgId),
        eq(events.eventCategory, 'security'),
      ];
      
      if (input.startDate) {
        conditions.push(gte(events.occurredAt, input.startDate));
      }
      
      const result = await db.select()
        .from(events)
        .where(and(...conditions))
        .orderBy(desc(events.occurredAt))
        .limit(input.limit);
      
      return result;
    }),
});

export type EventsRouter = typeof eventsRouter;

