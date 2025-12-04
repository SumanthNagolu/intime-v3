/**
 * Activity Engine
 *
 * Core engine that processes events and creates auto-activities based on patterns.
 * Implements the rule engine from the spec.
 *
 * Enhanced with:
 * - Static auto-creation rules
 * - Database-driven auto rules
 * - Condition evaluation with operators
 * - Field mapping from events to activities
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md#rule-engine-architecture
 */

import { db } from '@/lib/db';
import { objectOwners, userProfiles } from '@/lib/db/schema';
import { activityAutoRules } from '@/lib/db/schema/workplan';
import { pods } from '@/lib/db/schema/ta-hr';
import { eq, and, or } from 'drizzle-orm';
import { activityService } from './activity-service';
import { patternMatcher, type ActivityPattern, type AssignmentRule } from './pattern-matcher';
import { patternService } from './PatternService';
import { interpolateTemplate, createTemplateContext, getNestedValue } from './template-utils';
import { calculateDueDate } from './due-date-utils';
import type { Event } from '@/lib/events/event.types';
import type { Activity, CreateActivityInput, ActivityType, ActivityPriority } from './activity.types';
import type { EntityType } from '@/types/core/entity.types';

// ============================================================================
// AUTO RULE TYPES
// ============================================================================

export interface AutoRule {
  id: string;
  eventType: string;
  patternCode: string;
  conditions?: Record<string, unknown>;
  fieldMapping?: Record<string, string>;
  assigneeResolution?: 'actor' | 'owner' | 'manager' | 'specific';
  assigneeId?: string;
  subjectTemplate?: string;
  active: boolean;
}

// ============================================================================
// STATIC AUTO RULES
// ============================================================================

/**
 * Static auto-creation rules (can be extended via database)
 */
const STATIC_AUTO_RULES: AutoRule[] = [
  {
    id: 'submission-created',
    eventType: 'submission.created',
    patternCode: 'submit_candidate',
    conditions: {},
    assigneeResolution: 'owner',
    subjectTemplate: 'Review submission for {{candidate.name}}',
    active: true,
  },
  {
    id: 'interview-scheduled',
    eventType: 'interview.scheduled',
    patternCode: 'conduct_interview',
    conditions: {},
    assigneeResolution: 'owner',
    subjectTemplate: 'Follow up on interview with {{candidate.name}}',
    active: true,
  },
  {
    id: 'offer-sent',
    eventType: 'offer.sent',
    patternCode: 'make_offer',
    conditions: {},
    assigneeResolution: 'owner',
    subjectTemplate: 'Follow up on offer to {{candidate.name}}',
    active: true,
  },
  {
    id: 'lead-created',
    eventType: 'lead.created',
    patternCode: 'lead_outreach',
    conditions: {},
    assigneeResolution: 'actor',
    subjectTemplate: 'Initial outreach to {{lead.name}}',
    active: true,
  },
  {
    id: 'placement-ending',
    eventType: 'placement.ending_soon',
    patternCode: 'follow_up',
    conditions: {},
    assigneeResolution: 'owner',
    subjectTemplate: 'Discuss extension for {{consultant.name}}',
    active: true,
  },
  {
    id: 'visa-expiring',
    eventType: 'consultant.visa_expiring',
    patternCode: 'immigration_check',
    conditions: {},
    assigneeResolution: 'owner',
    subjectTemplate: 'Check visa status for {{consultant.name}}',
    active: true,
  },
];

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
    // First try to get manager from user profile
    const [user] = await db
      .select()
      .from(userProfiles)
      .where(and(eq(userProfiles.orgId, orgId), eq(userProfiles.id, userId)))
      .limit(1);

    // Check for managerId field
    const managerId = (user as { managerId?: string } | undefined)?.managerId;
    if (managerId) {
      return managerId;
    }

    // Fall back to pod senior member
    const [pod] = await db
      .select({ seniorMemberId: pods.seniorMemberId })
      .from(pods)
      .where(
        and(
          eq(pods.orgId, orgId),
          or(eq(pods.seniorMemberId, userId), eq(pods.juniorMemberId, userId))
        )
      )
      .limit(1);

    if (pod?.seniorMemberId && pod.seniorMemberId !== userId) {
      return pod.seniorMemberId;
    }

    return null;
  }

  // ==========================================================================
  // AUTO RULES PROCESSING
  // ==========================================================================

  /**
   * Process an event using auto-creation rules
   * This is an alternative to pattern-based processing for simple rules
   */
  async processEventWithRules(event: Event): Promise<Activity[]> {
    const rules = await this.getRulesForEvent(event.eventType, event.orgId);
    const createdActivities: Activity[] = [];

    for (const rule of rules) {
      // Skip inactive rules
      if (!rule.active) continue;

      // Evaluate conditions
      if (!this.evaluateConditions(rule, event)) continue;

      try {
        // Map event data to activity fields
        const fieldValues = this.mapFields(rule, event);

        // Resolve assignee
        const assignedTo = await this.resolveAutoRuleAssignee(rule, event);

        if (!assignedTo) {
          console.warn(
            `Could not resolve assignee for auto rule ${rule.id}, skipping`
          );
          continue;
        }

        // Create activity from pattern
        const activityData = await patternService.instantiate(
          rule.patternCode,
          event.entityType,
          event.entityId,
          {
            assignedTo,
            fieldValues,
            subject: this.interpolateRuleSubject(rule, event),
          },
          event.orgId
        );

        const created = await activityService.create({
          orgId: event.orgId,
          activityType: 'task' as ActivityType,
          patternCode: activityData.patternCode,
          subject: activityData.subject,
          description: activityData.description,
          entityType: event.entityType as EntityType,
          entityId: event.entityId,
          assignedTo,
          createdBy: 'system',
          priority: activityData.priority as ActivityPriority,
          dueDate: activityData.dueAt,
          isAutoCreated: true,
          customFields: fieldValues,
        });

        createdActivities.push(created);
      } catch (error) {
        console.error(`Failed to create activity from rule ${rule.id}:`, error);
      }
    }

    return createdActivities;
  }

  /**
   * Get auto-creation rules for an event type
   */
  async getRulesForEvent(eventType: string, _orgId?: string): Promise<AutoRule[]> {
    // Check database rules using direct query
    const dbRulesRaw = await db
      .select()
      .from(activityAutoRules)
      .where(
        and(
          eq(activityAutoRules.eventType, eventType),
          eq(activityAutoRules.isActive, true)
        )
      );

    const dbRules: AutoRule[] = dbRulesRaw.map((r) => ({
      id: r.id,
      eventType: r.eventType,
      patternCode: r.ruleCode,
      conditions: r.condition as Record<string, unknown> | undefined,
      assigneeResolution: r.assignToField as AutoRule['assigneeResolution'],
      assigneeId: r.assignToUserId ?? undefined,
      active: r.isActive ?? true,
    }));

    // Also check static rules
    const staticRules = STATIC_AUTO_RULES.filter(
      (r) => r.eventType === eventType
    );

    return [...dbRules, ...staticRules];
  }

  /**
   * Evaluate rule conditions against event data
   */
  evaluateConditions(rule: AutoRule, event: Event): boolean {
    if (!rule.conditions || Object.keys(rule.conditions).length === 0) {
      return true;
    }

    for (const [field, expected] of Object.entries(rule.conditions)) {
      const actual = getNestedValue(event.eventData, field);

      if (typeof expected === 'object' && expected !== null) {
        const expectedObj = expected as Record<string, unknown>;
        // Handle operators
        if ('$eq' in expectedObj && actual !== expectedObj.$eq) return false;
        if ('$ne' in expectedObj && actual === expectedObj.$ne) return false;
        if ('$in' in expectedObj && !Array.isArray(expectedObj.$in)) return false;
        if ('$in' in expectedObj && Array.isArray(expectedObj.$in) && !expectedObj.$in.includes(actual)) return false;
        if ('$nin' in expectedObj && Array.isArray(expectedObj.$nin) && expectedObj.$nin.includes(actual)) return false;
        if ('$gt' in expectedObj && !(Number(actual) > Number(expectedObj.$gt))) return false;
        if ('$gte' in expectedObj && !(Number(actual) >= Number(expectedObj.$gte))) return false;
        if ('$lt' in expectedObj && !(Number(actual) < Number(expectedObj.$lt))) return false;
        if ('$lte' in expectedObj && !(Number(actual) <= Number(expectedObj.$lte))) return false;
        if ('$exists' in expectedObj && (actual !== undefined) !== expectedObj.$exists) return false;
      } else {
        // Simple equality
        if (actual !== expected) return false;
      }
    }

    return true;
  }

  /**
   * Map event data to activity fields
   */
  mapFields(rule: AutoRule, event: Event): Record<string, unknown> {
    if (!rule.fieldMapping) return {};

    const mapped: Record<string, unknown> = {};

    for (const [activityField, eventPath] of Object.entries(rule.fieldMapping)) {
      mapped[activityField] = getNestedValue(event.eventData, eventPath);
    }

    return mapped;
  }

  /**
   * Resolve the assignee for an auto rule
   */
  async resolveAutoRuleAssignee(
    rule: AutoRule,
    event: Event
  ): Promise<string | undefined> {
    switch (rule.assigneeResolution) {
      case 'actor':
        return event.actorId ?? undefined;

      case 'owner':
        return (
          (await this.getEntityOwner(
            event.orgId,
            event.entityType as EntityType,
            event.entityId
          )) ?? undefined
        );

      case 'manager':
        const ownerId = await this.getEntityOwner(
          event.orgId,
          event.entityType as EntityType,
          event.entityId
        );
        if (ownerId) {
          return (await this.getUserManager(event.orgId, ownerId)) ?? undefined;
        }
        return undefined;

      case 'specific':
        return rule.assigneeId;

      default:
        return event.actorId ?? undefined;
    }
  }

  /**
   * Interpolate subject template with event data
   */
  interpolateRuleSubject(rule: AutoRule, event: Event): string | undefined {
    if (!rule.subjectTemplate) return undefined;

    const context = createTemplateContext(event.eventData, {
      event: {
        type: event.eventType,
        entityType: event.entityType,
        entityId: event.entityId,
      },
    });

    return interpolateTemplate(rule.subjectTemplate, context);
  }

  /**
   * Get all static auto rules
   */
  getStaticRules(): AutoRule[] {
    return [...STATIC_AUTO_RULES];
  }

  /**
   * Add a static rule (for testing or runtime configuration)
   */
  addStaticRule(rule: AutoRule): void {
    STATIC_AUTO_RULES.push(rule);
  }

  /**
   * Remove a static rule by ID
   */
  removeStaticRule(ruleId: string): boolean {
    const index = STATIC_AUTO_RULES.findIndex((r) => r.id === ruleId);
    if (index !== -1) {
      STATIC_AUTO_RULES.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Export singleton
export const activityEngine = new ActivityEngine();

