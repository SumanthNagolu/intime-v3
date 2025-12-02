/**
 * Event Emitter
 * 
 * Emits events to the event bus and persists them to the database.
 * Events are immutable records that trigger auto-activities.
 * 
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eventBus } from './event-bus';
import type {
  Event,
  EmitEventInput,
  EventCategory,
  EventSeverity,
} from './event.types';
import { getEventCategory, getEventSeverity } from './event.types';

/**
 * Event Emitter
 * 
 * Responsible for:
 * 1. Creating and persisting events
 * 2. Publishing to event bus
 * 3. Triggering activity pattern matcher
 */
export class EventEmitter {
  /**
   * Emit an event
   * 
   * @example
   * await eventEmitter.emit({
   *   type: 'candidate.submitted',
   *   orgId: 'org-123',
   *   entityType: 'submission',
   *   entityId: 'sub-456',
   *   actorId: 'user-789',
   *   eventData: {
   *     candidateId: 'cand-111',
   *     jobId: 'job-222',
   *     billRate: 95,
   *     payRate: 72
   *   }
   * });
   */
  async emit(input: EmitEventInput): Promise<Event> {
    const now = new Date();
    const id = uuidv4();
    
    // Determine category and severity from event type
    const category = getEventCategory(input.type);
    const severity = getEventSeverity(input.type);
    
    // Create event record
    const event: Event = {
      id,
      orgId: input.orgId,
      
      eventType: input.type,
      eventCategory: category,
      eventSeverity: severity,
      
      actorType: input.actorType ?? 'user',
      actorId: input.actorId,
      actorName: input.actorName,
      
      entityType: input.entityType,
      entityId: input.entityId,
      entityName: input.entityName,
      
      relatedEntities: input.relatedEntities,
      
      eventData: input.eventData,
      changes: input.changes,
      
      source: input.source ?? 'ui',
      correlationId: input.correlationId,
      parentEventId: input.parentEventId,
      
      occurredAt: now,
      recordedAt: now,
    };
    
    // Persist to database
    await this.persist(event);
    
    // Publish to event bus (async, don't wait)
    eventBus.publish(event).catch(error => {
      console.error('Failed to publish event to bus:', error);
    });
    
    return event;
  }

  /**
   * Emit multiple events in a batch
   */
  async emitBatch(inputs: EmitEventInput[]): Promise<Event[]> {
    const events: Event[] = [];
    
    for (const input of inputs) {
      const event = await this.emit(input);
      events.push(event);
    }
    
    return events;
  }

  /**
   * Emit an entity created event
   */
  async emitCreated<T extends Record<string, unknown>>(
    orgId: string,
    entityType: string,
    entityId: string,
    data: T,
    actorId?: string,
    entityName?: string
  ): Promise<Event> {
    return this.emit({
      type: `${entityType}.created`,
      orgId,
      entityType,
      entityId,
      actorId,
      eventData: data,
      entityName,
    });
  }

  /**
   * Emit an entity updated event with changes
   */
  async emitUpdated<T extends Record<string, unknown>>(
    orgId: string,
    entityType: string,
    entityId: string,
    changes: { field: string; oldValue: unknown; newValue: unknown }[],
    actorId?: string,
    entityName?: string
  ): Promise<Event> {
    return this.emit({
      type: `${entityType}.updated`,
      orgId,
      entityType,
      entityId,
      actorId,
      eventData: {},
      changes,
      entityName,
    });
  }

  /**
   * Emit an entity deleted event
   */
  async emitDeleted(
    orgId: string,
    entityType: string,
    entityId: string,
    actorId?: string,
    entityName?: string
  ): Promise<Event> {
    return this.emit({
      type: `${entityType}.deleted`,
      orgId,
      entityType,
      entityId,
      actorId,
      eventData: {},
      entityName,
    });
  }

  /**
   * Emit a status change event
   */
  async emitStatusChanged(
    orgId: string,
    entityType: string,
    entityId: string,
    oldStatus: string,
    newStatus: string,
    actorId?: string,
    entityName?: string
  ): Promise<Event> {
    return this.emit({
      type: `${entityType}.status_changed`,
      orgId,
      entityType,
      entityId,
      actorId,
      eventData: {
        oldStatus,
        newStatus,
      },
      changes: [{
        field: 'status',
        oldValue: oldStatus,
        newValue: newStatus,
      }],
      entityName,
    });
  }

  /**
   * Emit a system event (no user actor)
   */
  async emitSystem(
    type: string,
    orgId: string,
    entityType: string,
    entityId: string,
    data: Record<string, unknown>
  ): Promise<Event> {
    return this.emit({
      type,
      orgId,
      entityType,
      entityId,
      actorType: 'system',
      eventData: data,
      source: 'system',
    });
  }

  /**
   * Persist event to database
   */
  private async persist(event: Event): Promise<void> {
    try {
      await db.insert(events).values({
        id: event.id,
        orgId: event.orgId,

        eventType: event.eventType,
        eventCategory: event.eventCategory,
        severity: event.eventSeverity,

        actorType: event.actorType,
        actorId: event.actorId ?? null,

        entityType: event.entityType,
        entityId: event.entityId,

        eventData: event.eventData as Record<string, unknown>,

        occurredAt: event.occurredAt,
        createdAt: event.recordedAt,
      });
    } catch (error) {
      console.error('Failed to persist event:', error);
      // Don't throw - event emission should not fail due to persistence issues
      // In production, you'd want to queue this for retry
    }
  }
}

// Export singleton
export const eventEmitter = new EventEmitter();

