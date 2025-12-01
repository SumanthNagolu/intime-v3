/**
 * Activity Engine
 * 
 * Core engine that processes events and creates auto-activities based on patterns.
 * Implements the rule engine from the spec.
 * 
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md#rule-engine-architecture
 */

import { db } from '@/lib/db';
import { objectOwners, userProfiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { activityService } from './activity-service';
import { patternMatcher, type ActivityPattern, type AssignmentRule } from './pattern-matcher';
import { interpolateTemplate, createTemplateContext } from './template-utils';
import { calculateDueDate } from './due-date-utils';
import type { Event } from '@/lib/events/event.types';
import type { Activity, CreateActivityInput, ActivityType, ActivityPriority } from './activity.types';
import type { EntityType } from '@/types/core/entity.types';

/**
 * Activity Engine
 * 
 * Processes events and creates auto-activities based on patterns.
 * This is the core of the activity-centric architecture.
 */
export class ActivityEngine {
  /**
   * Process an event and create auto-activities based on matching patterns
   * 
   * Flow:
   * 1. Event Published to Event Bus
   * 2. Activity Pattern Matcher - Find patterns where trigger_event = event_type
   * 3. For each matching pattern:
   *    a. Check if activity already exists (dedup)
   *    b. Resolve assignee using AssignmentRule
   *    c. Calculate due_date from offset
   *    d. Interpolate subject/description templates
   *    e. Create Activity record
   * 4. Link Activity to triggering Event
   * 5. Send Notification to Assignee
   */
  async processEvent(event: Event): Promise<Activity[]> {
    // 1. Find matching patterns
    const patterns = await patternMatcher.findMatchingPatterns(event);
    
    if (patterns.length === 0) {
      return [];
    }
    
    const createdActivities: Activity[] = [];
    
    // 2. Process each matching pattern
    for (const pattern of patterns) {
      try {
        const activity = await this.createActivityFromPattern(event, pattern);
        if (activity) {
          createdActivities.push(activity);
        }
      } catch (error) {
        console.error(
          `Failed to create activity from pattern ${pattern.patternCode}:`,
          error
        );
        // Continue processing other patterns
      }
    }
    
    return createdActivities;
  }

  /**
   * Create an activity from a pattern
   */
  private async createActivityFromPattern(
    event: Event,
    pattern: ActivityPattern
  ): Promise<Activity | null> {
    // a. Check for duplicate (dedup)
    const isDuplicate = await this.checkDuplicate(event, pattern);
    if (isDuplicate) {
      console.log(`Skipping duplicate activity for pattern ${pattern.patternCode}`);
      return null;
    }
    
    // b. Resolve assignee
    const assigneeId = await this.resolveAssignee(
      pattern.assignTo,
      event,
      event.entityType as EntityType,
      event.entityId
    );
    
    if (!assigneeId) {
      console.warn(
        `Could not resolve assignee for pattern ${pattern.patternCode}, skipping`
      );
      return null;
    }
    
    // c. Calculate due date
    const dueDate = calculateDueDate(event.occurredAt, {
      offsetHours: pattern.dueOffsetHours,
      offsetBusinessDays: pattern.dueOffsetBusinessDays,
      specificTime: pattern.specificTime,
    });
    
    // d. Interpolate templates
    const context = createTemplateContext(event.eventData, {
      event: {
        type: event.eventType,
        actor: { name: event.actorName },
        occurred_at: event.occurredAt,
      },
    });
    
    const subject = interpolateTemplate(pattern.subjectTemplate, context);
    const description = pattern.descriptionTemplate
      ? interpolateTemplate(pattern.descriptionTemplate, context)
      : undefined;
    
    // e. Create activity
    const input: CreateActivityInput = {
      orgId: event.orgId,
      
      activityType: pattern.activityType as ActivityType,
      patternCode: pattern.patternCode,
      patternId: pattern.id,
      
      subject,
      description,
      
      entityType: event.entityType as EntityType,
      entityId: event.entityId,
      
      assignedTo: assigneeId,
      createdBy: 'system',
      
      priority: pattern.priority as ActivityPriority,
      dueDate,
      
      isAutoCreated: true,
      
      tags: pattern.tags,
    };
    
    // Add secondary entity if present in event data
    if (event.relatedEntities && event.relatedEntities.length > 0) {
      const secondary = event.relatedEntities[0];
      input.secondaryEntityType = secondary.type as EntityType;
      input.secondaryEntityId = secondary.id;
    }
    
    const activity = await activityService.create(input);
    
    // 4. Link to triggering event is done via the event's triggered_activity_ids
    // This would be updated in the event record
    
    // 5. Send notification (handled by notification system)
    // TODO: Integrate with notification service
    
    return activity;
  }

  /**
   * Check if a duplicate activity already exists for this event/pattern combo
   */
  private async checkDuplicate(
    event: Event,
    pattern: ActivityPattern
  ): Promise<boolean> {
    // Check if there's already an open activity with this pattern for this entity
    const existing = await activityService.getMany({
      orgId: event.orgId,
      entityType: event.entityType as EntityType,
      entityId: event.entityId,
      status: ['open', 'in_progress'],
      limit: 1,
    });
    
    // Check if any have the same pattern code
    return existing.some(a => a.patternCode === pattern.patternCode);
  }

  /**
   * Resolve the assignee based on assignment rule
   */
  async resolveAssignee(
    rule: AssignmentRule,
    event: Event,
    entityType: EntityType,
    entityId: string
  ): Promise<string | null> {
    switch (rule.type) {
      case 'owner':
        return this.getEntityOwner(event.orgId, entityType, entityId);
        
      case 'creator':
        return event.actorId ?? null;
        
      case 'raci_role':
        return this.getRACIAssignee(
          event.orgId,
          entityType,
          entityId,
          rule.role as 'R' | 'A' | 'C' | 'I'
        );
        
      case 'specific_user':
        return rule.userId ?? null;
        
      case 'specific_role':
        return this.getUserByRole(event.orgId, rule.role!);
        
      case 'round_robin':
        return this.getRoundRobinAssignee(event.orgId, rule.groupId!);
        
      case 'least_busy':
        return this.getLeastBusyUser(event.orgId);
        
      case 'manager':
        const ownerId = await this.getEntityOwner(event.orgId, entityType, entityId);
        if (ownerId) {
          return this.getUserManager(event.orgId, ownerId);
        }
        return null;
        
      default:
        return null;
    }
  }

  /**
   * Get the owner of an entity from object_owners table
   */
  private async getEntityOwner(
    orgId: string,
    entityType: EntityType,
    entityId: string
  ): Promise<string | null> {
    const [owner] = await db.select()
      .from(objectOwners)
      .where(and(
        eq(objectOwners.orgId, orgId),
        eq(objectOwners.entityType, entityType),
        eq(objectOwners.entityId, entityId),
        eq(objectOwners.role, 'accountable'),
        eq(objectOwners.isPrimary, true)
      ))
      .limit(1);
    
    return owner?.userId ?? null;
  }

  /**
   * Get assignee based on RACI role
   */
  private async getRACIAssignee(
    orgId: string,
    entityType: EntityType,
    entityId: string,
    raciRole: 'R' | 'A' | 'C' | 'I'
  ): Promise<string | null> {
    const roleMap: Record<string, string> = {
      'R': 'responsible',
      'A': 'accountable',
      'C': 'consulted',
      'I': 'informed',
    };
    
    const [owner] = await db.select()
      .from(objectOwners)
      .where(and(
        eq(objectOwners.orgId, orgId),
        eq(objectOwners.entityType, entityType),
        eq(objectOwners.entityId, entityId),
        eq(objectOwners.role, roleMap[raciRole])
      ))
      .limit(1);
    
    return owner?.userId ?? null;
  }

  /**
   * Get a user by role
   */
  private async getUserByRole(
    orgId: string,
    roleName: string
  ): Promise<string | null> {
    // This would need to be implemented based on your role system
    // For now, return null
    console.warn(`getUserByRole not implemented for role: ${roleName}`);
    return null;
  }

  /**
   * Get next user in round robin
   */
  private async getRoundRobinAssignee(
    orgId: string,
    groupId: string
  ): Promise<string | null> {
    // This would need state management for round robin
    // For now, return null
    console.warn(`getRoundRobinAssignee not implemented for group: ${groupId}`);
    return null;
  }

  /**
   * Get user with fewest open activities
   */
  private async getLeastBusyUser(orgId: string): Promise<string | null> {
    // This would need activity counts per user
    // For now, return null
    console.warn('getLeastBusyUser not implemented');
    return null;
  }

  /**
   * Get a user's manager
   */
  private async getUserManager(
    orgId: string,
    userId: string
  ): Promise<string | null> {
    const [user] = await db.select()
      .from(userProfiles)
      .where(and(
        eq(userProfiles.orgId, orgId),
        eq(userProfiles.id, userId)
      ))
      .limit(1);
    
    // Assuming user_profiles has a managerId field
    return (user as { managerId?: string } | undefined)?.managerId ?? null;
  }
}

// Export singleton
export const activityEngine = new ActivityEngine();

