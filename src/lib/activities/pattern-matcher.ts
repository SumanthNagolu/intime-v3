/**
 * Pattern Matcher
 * 
 * Matches events to activity patterns and creates activities accordingly.
 * 
 * @see docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md
 */

import { db } from '@/lib/db';
import { activityPatterns } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import type { Event } from '@/lib/events/event.types';

// ============================================================================
// PATTERN TYPES
// ============================================================================

export type AssignmentRuleType = 
  | 'owner' 
  | 'creator' 
  | 'raci_role' 
  | 'specific_user' 
  | 'specific_role' 
  | 'round_robin' 
  | 'least_busy'
  | 'manager';

export interface AssignmentRule {
  type: AssignmentRuleType;
  userId?: string;      // For specific_user
  role?: string;        // For specific_role or raci_role (R/A/C/I)
  groupId?: string;     // For round_robin
}

export interface TriggerCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains' | 'exists';
  value: unknown;
}

export interface ActivityPattern {
  id: string;
  orgId: string | null;          // null = system-wide
  patternCode: string;
  
  // Display
  name: string;
  description?: string;
  
  // Trigger
  triggerEvent: string;
  triggerConditions?: TriggerCondition[];
  
  // Activity Template
  activityType: string;
  subjectTemplate: string;
  descriptionTemplate?: string;
  priority: string;
  
  // Assignment
  assignTo: AssignmentRule;
  
  // Timing
  dueOffsetHours?: number;
  dueOffsetBusinessDays?: number;
  specificTime?: string;         // HH:MM
  
  // Configuration
  isActive: boolean;
  isSystem: boolean;
  canBeSkipped: boolean;
  requiresOutcome: boolean;
  
  // SLA
  slaWarningHours?: number;
  slaBreachHours?: number;
  
  // Metadata
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PATTERN MATCHER
// ============================================================================

export class PatternMatcher {
  /**
   * Find all patterns that match a given event
   */
  async findMatchingPatterns(event: Event): Promise<ActivityPattern[]> {
    // Get all active patterns for this event type
    const patterns = await db.select()
      .from(activityPatterns)
      .where(and(
        eq(activityPatterns.triggerEvent, event.eventType),
        eq(activityPatterns.isActive, true),
        // Match org-specific OR system-wide patterns
        // (orgId IS NULL OR orgId = event.orgId)
      ));
    
    // Filter by org and conditions
    const matchingPatterns: ActivityPattern[] = [];
    
    for (const pattern of patterns) {
      // Check if pattern applies to this org
      if (pattern.orgId && pattern.orgId !== event.orgId) {
        continue;
      }
      
      // Check trigger conditions
      const conditions = pattern.triggerConditions as TriggerCondition[] | null;
      if (conditions && conditions.length > 0) {
        const conditionsMet = this.evaluateConditions(conditions, event.eventData);
        if (!conditionsMet) {
          continue;
        }
      }
      
      matchingPatterns.push(this.mapToPattern(pattern));
    }
    
    return matchingPatterns;
  }

  /**
   * Evaluate trigger conditions against event data
   */
  evaluateConditions(conditions: TriggerCondition[], eventData: Record<string, unknown>): boolean {
    for (const condition of conditions) {
      const value = this.getNestedValue(eventData, condition.field);
      
      if (!this.evaluateCondition(condition, value)) {
        return false;  // All conditions must be met (AND logic)
      }
    }
    
    return true;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: TriggerCondition, actualValue: unknown): boolean {
    const { operator, value: expectedValue } = condition;
    
    switch (operator) {
      case 'eq':
        return actualValue === expectedValue;
        
      case 'ne':
        return actualValue !== expectedValue;
        
      case 'gt':
        return typeof actualValue === 'number' && typeof expectedValue === 'number' 
          && actualValue > expectedValue;
        
      case 'lt':
        return typeof actualValue === 'number' && typeof expectedValue === 'number' 
          && actualValue < expectedValue;
        
      case 'gte':
        return typeof actualValue === 'number' && typeof expectedValue === 'number' 
          && actualValue >= expectedValue;
        
      case 'lte':
        return typeof actualValue === 'number' && typeof expectedValue === 'number' 
          && actualValue <= expectedValue;
        
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
        
      case 'contains':
        return typeof actualValue === 'string' && typeof expectedValue === 'string'
          && actualValue.includes(expectedValue);
        
      case 'exists':
        return expectedValue ? actualValue !== undefined && actualValue !== null : !actualValue;
        
      default:
        return false;
    }
  }

  /**
   * Get nested value from object using dot notation
   * e.g., "candidate.visa_status" -> eventData.candidate.visa_status
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }
    
    return current;
  }

  /**
   * Get a pattern by code
   */
  async getPatternByCode(code: string, orgId?: string): Promise<ActivityPattern | null> {
    const conditions = [
      eq(activityPatterns.patternCode, code),
      eq(activityPatterns.isActive, true),
    ];
    
    const [pattern] = await db.select()
      .from(activityPatterns)
      .where(and(...conditions))
      .limit(1);
    
    return pattern ? this.mapToPattern(pattern) : null;
  }

  /**
   * Get all patterns for an org
   */
  async getPatternsForOrg(orgId: string): Promise<ActivityPattern[]> {
    const patterns = await db.select()
      .from(activityPatterns)
      .where(eq(activityPatterns.isActive, true));
    
    return patterns
      .filter(p => !p.orgId || p.orgId === orgId)
      .map(p => this.mapToPattern(p));
  }

  /**
   * Map database record to ActivityPattern
   */
  private mapToPattern(record: typeof activityPatterns.$inferSelect): ActivityPattern {
    return {
      id: record.id,
      orgId: record.orgId,
      patternCode: record.patternCode,
      name: record.name,
      description: record.description ?? undefined,
      triggerEvent: record.triggerEvent,
      triggerConditions: record.triggerConditions as TriggerCondition[] | undefined,
      activityType: record.activityType,
      subjectTemplate: record.subjectTemplate,
      descriptionTemplate: record.descriptionTemplate ?? undefined,
      priority: record.priority,
      assignTo: record.assignTo as AssignmentRule,
      dueOffsetHours: record.dueOffsetHours ?? undefined,
      dueOffsetBusinessDays: record.dueOffsetBusinessDays ?? undefined,
      specificTime: record.specificTime ?? undefined,
      isActive: record.isActive ?? true,
      isSystem: record.isSystem ?? false,
      canBeSkipped: record.canBeSkipped ?? false,
      requiresOutcome: record.requiresOutcome ?? true,
      slaWarningHours: record.slaWarningHours ?? undefined,
      slaBreachHours: record.slaBreachHours ?? undefined,
      tags: record.tags ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

// Export singleton
export const patternMatcher = new PatternMatcher();

