/**
 * Pattern Service
 *
 * Dedicated service for activity pattern management.
 * Handles both static patterns (from patterns.ts) and database patterns.
 *
 * @see docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md
 */

import { db } from '@/lib/db';
import { activityPatterns, patternFields, patternChecklistItems } from '@/lib/db/schema/workplan';
import { eq, and } from 'drizzle-orm';
import { ACTIVITY_PATTERNS, type ActivityPattern as StaticPattern } from './patterns';
import { DEFAULT_SLA_DURATIONS, type Priority } from './sla';

// Type for database pattern with relations
interface DbPatternWithRelations {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  category?: string | null;
  entityType: string;
  priority?: string | null;
  targetDays?: number | null;
  isSystem?: boolean | null;
  isActive?: boolean | null;
  fields?: Array<{
    fieldName: string;
    fieldLabel: string;
    fieldType: string;
    isRequired?: boolean | null;
    placeholder?: string | null;
    helpText?: string | null;
    defaultValue?: unknown;
    validationRules?: unknown;
  }>;
  checklistItems?: Array<{
    itemText: string;
    orderIndex?: number | null;
  }>;
}

// ============================================================================
// TYPES
// ============================================================================

export interface PatternField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'select' | 'boolean' | 'currency' | 'email' | 'phone' | 'url';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  options?: { value: string; label: string }[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface UnifiedPattern {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  entityType?: string;
  defaultSubject: string;
  defaultDescription?: string;
  defaultPriority: Priority;
  slaHours: number;
  businessHoursOnly?: boolean;
  fields: PatternField[];
  defaultChecklist: string[];
  isSystem: boolean;
  isActive: boolean;
}

export interface InstantiatedActivity {
  patternCode: string;
  subject: string;
  description?: string;
  priority: Priority;
  dueAt: Date;
  relatedEntityType: string;
  relatedEntityId: string;
  assignedTo?: string;
  fieldValues: Record<string, unknown>;
  checklist: string[];
}

// ============================================================================
// PATTERN SERVICE
// ============================================================================

export class PatternService {
  /**
   * Get pattern by code (checks static patterns first, then DB)
   */
  async getPattern(code: string, orgId?: string): Promise<UnifiedPattern | undefined> {
    // First check static patterns
    const staticPattern = ACTIVITY_PATTERNS[code];
    if (staticPattern) {
      return this.mapStaticPattern(staticPattern);
    }

    // Then check database patterns
    const conditions = [eq(activityPatterns.code, code)];
    if (orgId) {
      conditions.push(eq(activityPatterns.orgId, orgId));
    }

    const dbPattern = await db.query.activityPatterns.findFirst({
      where: and(...conditions),
      with: {
        fields: true,
        checklistItems: true,
      },
    });

    if (dbPattern) {
      return this.mapDbPattern(dbPattern as unknown as DbPatternWithRelations);
    }

    return undefined;
  }

  /**
   * Get all patterns by category
   */
  async getByCategory(category: string, orgId?: string): Promise<UnifiedPattern[]> {
    // Get static patterns for category (filter out undefined values)
    const staticPatterns = Object.values(ACTIVITY_PATTERNS)
      .filter((p): p is StaticPattern => p !== undefined && p.category === category)
      .map((p) => this.mapStaticPattern(p));

    // Get database patterns for category
    const conditions = [eq(activityPatterns.category, category)];
    if (orgId) {
      conditions.push(eq(activityPatterns.orgId, orgId));
    }

    const dbPatterns = await db.query.activityPatterns.findMany({
      where: and(...conditions),
      with: {
        fields: true,
        checklistItems: true,
      },
    });

    const mappedDbPatterns = dbPatterns.map((p) => this.mapDbPattern(p as unknown as DbPatternWithRelations));

    return [...staticPatterns, ...mappedDbPatterns];
  }

  /**
   * Get patterns by entity type
   */
  async getByEntityType(entityType: string, orgId?: string): Promise<UnifiedPattern[]> {
    // Get static patterns for entity (filter out undefined values)
    const staticPatterns = Object.values(ACTIVITY_PATTERNS)
      .filter((p): p is StaticPattern => p !== undefined && (!p.applicableEntities || p.applicableEntities.includes(entityType)))
      .map((p) => this.mapStaticPattern(p));

    // Get database patterns for entity
    const conditions = [eq(activityPatterns.entityType, entityType)];
    if (orgId) {
      conditions.push(eq(activityPatterns.orgId, orgId));
    }

    const dbPatterns = await db.query.activityPatterns.findMany({
      where: and(...conditions),
      with: {
        fields: true,
        checklistItems: true,
      },
    });

    const mappedDbPatterns = dbPatterns.map((p) => this.mapDbPattern(p as unknown as DbPatternWithRelations));

    return [...staticPatterns, ...mappedDbPatterns];
  }

  /**
   * Get all patterns for an organization (static + org-specific)
   */
  async getAllPatterns(orgId?: string): Promise<UnifiedPattern[]> {
    // Get all static patterns (filter out undefined values)
    const staticPatterns = Object.values(ACTIVITY_PATTERNS)
      .filter((p): p is StaticPattern => p !== undefined)
      .map((p) => this.mapStaticPattern(p));

    // Get database patterns
    const dbPatterns = await db.query.activityPatterns.findMany({
      where: orgId ? eq(activityPatterns.orgId, orgId) : undefined,
      with: {
        fields: true,
        checklistItems: true,
      },
    });

    const mappedDbPatterns = dbPatterns.map((p) => this.mapDbPattern(p as unknown as DbPatternWithRelations));

    return [...staticPatterns, ...mappedDbPatterns];
  }

  /**
   * Instantiate an activity from a pattern
   */
  async instantiate(
    patternCode: string,
    entityType: string,
    entityId: string,
    overrides?: {
      subject?: string;
      description?: string;
      assignedTo?: string;
      dueAt?: Date;
      priority?: Priority;
      fieldValues?: Record<string, unknown>;
    },
    orgId?: string
  ): Promise<InstantiatedActivity> {
    const pattern = await this.getPattern(patternCode, orgId);
    if (!pattern) {
      throw new Error(`Pattern not found: ${patternCode}`);
    }

    // Calculate due date from pattern SLA
    const dueAt = overrides?.dueAt ?? this.calculateDueDate(pattern);

    return {
      patternCode: pattern.code,
      subject: overrides?.subject ?? pattern.defaultSubject,
      description: overrides?.description ?? pattern.defaultDescription,
      priority: overrides?.priority ?? pattern.defaultPriority,
      dueAt,
      relatedEntityType: entityType,
      relatedEntityId: entityId,
      assignedTo: overrides?.assignedTo,
      fieldValues: overrides?.fieldValues ?? {},
      checklist: pattern.defaultChecklist ?? [],
    };
  }

  /**
   * Get pattern fields
   */
  async getFields(patternCode: string, orgId?: string): Promise<PatternField[]> {
    const pattern = await this.getPattern(patternCode, orgId);
    return pattern?.fields ?? [];
  }

  /**
   * Validate field values against pattern
   */
  validateFields(
    pattern: UnifiedPattern,
    values: Record<string, unknown>
  ): ValidationResult {
    const errors: ValidationError[] = [];

    for (const field of pattern.fields ?? []) {
      const value = values[field.name];

      // Check required
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: field.name,
          message: `${field.label} is required`,
        });
        continue;
      }

      // Type validation (only if value is present)
      if (value !== undefined && value !== null && value !== '') {
        switch (field.type) {
          case 'number':
          case 'currency':
            if (typeof value !== 'number' && isNaN(Number(value))) {
              errors.push({
                field: field.name,
                message: `${field.label} must be a number`,
              });
            }
            break;

          case 'date':
          case 'datetime':
            if (!(value instanceof Date) && isNaN(Date.parse(value as string))) {
              errors.push({
                field: field.name,
                message: `${field.label} must be a valid date`,
              });
            }
            break;

          case 'email':
            if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors.push({
                field: field.name,
                message: `${field.label} must be a valid email address`,
              });
            }
            break;

          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push({
                field: field.name,
                message: `${field.label} must be true or false`,
              });
            }
            break;

          case 'select':
            if (field.options && !field.options.some((opt) => opt.value === value)) {
              errors.push({
                field: field.name,
                message: `${field.label} must be one of the available options`,
              });
            }
            break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate due date from pattern SLA
   */
  private calculateDueDate(pattern: UnifiedPattern): Date {
    const now = new Date();
    const slaHours = pattern.slaHours ?? DEFAULT_SLA_DURATIONS[pattern.defaultPriority];

    // Apply business hours if configured
    if (pattern.businessHoursOnly) {
      return this.addBusinessHours(now, slaHours);
    }

    return new Date(now.getTime() + slaHours * 60 * 60 * 1000);
  }

  /**
   * Add business hours (9am-6pm, Mon-Fri)
   */
  private addBusinessHours(start: Date, hours: number): Date {
    let remaining = hours;
    const current = new Date(start);

    while (remaining > 0) {
      const dayOfWeek = current.getDay();
      const hour = current.getHours();

      // Skip weekends
      if (dayOfWeek === 0) {
        // Sunday
        current.setDate(current.getDate() + 1);
        current.setHours(9, 0, 0, 0);
        continue;
      }
      if (dayOfWeek === 6) {
        // Saturday
        current.setDate(current.getDate() + 2);
        current.setHours(9, 0, 0, 0);
        continue;
      }

      // Before business hours
      if (hour < 9) {
        current.setHours(9, 0, 0, 0);
        continue;
      }

      // After business hours
      if (hour >= 18) {
        current.setDate(current.getDate() + 1);
        current.setHours(9, 0, 0, 0);
        continue;
      }

      // During business hours - consume time
      const hoursLeftToday = 18 - hour;
      const hoursToConsume = Math.min(remaining, hoursLeftToday);
      remaining -= hoursToConsume;
      current.setHours(current.getHours() + hoursToConsume);
    }

    return current;
  }

  /**
   * Map static pattern to unified format
   */
  private mapStaticPattern(pattern: StaticPattern): UnifiedPattern {
    return {
      id: pattern.id,
      code: pattern.id,
      name: pattern.name,
      description: pattern.description,
      category: pattern.category,
      entityType: pattern.applicableEntities?.[0],
      defaultSubject: pattern.name,
      defaultDescription: pattern.description,
      defaultPriority: pattern.defaultPriority as Priority,
      slaHours: pattern.slaTier ?? DEFAULT_SLA_DURATIONS[pattern.defaultPriority as Priority],
      businessHoursOnly: false,
      fields: pattern.fields.map((f) => ({
        name: f.id,
        label: f.label,
        type: f.type as PatternField['type'],
        required: f.required ?? false,
        placeholder: f.placeholder,
        helpText: f.helpText,
        defaultValue: f.defaultValue,
        options: f.options,
      })),
      defaultChecklist: pattern.checklist.map((c) => c.label),
      isSystem: true,
      isActive: true,
    };
  }

  /**
   * Map database pattern to unified format
   */
  private mapDbPattern(pattern: DbPatternWithRelations): UnifiedPattern {
    return {
      id: pattern.id,
      code: pattern.code,
      name: pattern.name,
      description: pattern.description ?? undefined,
      category: pattern.category ?? 'general',
      entityType: pattern.entityType,
      defaultSubject: pattern.name,
      defaultDescription: pattern.description ?? undefined,
      defaultPriority: (pattern.priority as Priority) ?? 'normal',
      slaHours: (pattern.targetDays ?? 1) * 24,
      businessHoursOnly: false,
      fields: (pattern.fields ?? []).map((f) => ({
        name: f.fieldName,
        label: f.fieldLabel,
        type: f.fieldType as PatternField['type'],
        required: f.isRequired ?? false,
        placeholder: f.placeholder ?? undefined,
        helpText: f.helpText ?? undefined,
        defaultValue: f.defaultValue ?? undefined,
        options: f.validationRules
          ? ((f.validationRules as Record<string, unknown>).options as
              | { value: string; label: string }[]
              | undefined)
          : undefined,
      })),
      defaultChecklist: (pattern.checklistItems ?? [])
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((c) => c.itemText),
      isSystem: pattern.isSystem ?? false,
      isActive: pattern.isActive ?? true,
    };
  }
}

// Export singleton instance
export const patternService = new PatternService();
