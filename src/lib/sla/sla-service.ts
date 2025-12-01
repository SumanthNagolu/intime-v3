/**
 * SLA Service
 * 
 * CRUD operations for SLA definitions and instances.
 */

import { db } from '@/lib/db';
import { slaDefinitions, slaInstances } from '@/lib/db/schema';
import { eq, and, isNull, inArray } from 'drizzle-orm';
import type {
  SlaDefinition,
  SlaInstance,
  CreateSlaInstanceInput,
  SlaStatus,
  SlaMetrics,
} from './sla.types';
import { calculateDueDate } from '@/lib/activities/due-date-utils';

/**
 * SLA Service - Manages SLA definitions and instances
 */
export class SlaService {
  /**
   * Get SLA definition by ID
   */
  async getDefinitionById(id: string): Promise<SlaDefinition | null> {
    const [def] = await db.select()
      .from(slaDefinitions)
      .where(eq(slaDefinitions.id, id))
      .limit(1);
    
    return def ? this.mapToDefinition(def) : null;
  }

  /**
   * Get SLA definition by code
   */
  async getDefinitionByCode(code: string, orgId?: string): Promise<SlaDefinition | null> {
    const [def] = await db.select()
      .from(slaDefinitions)
      .where(and(
        eq(slaDefinitions.slaCode, code),
        eq(slaDefinitions.isActive, true)
      ))
      .limit(1);
    
    return def ? this.mapToDefinition(def) : null;
  }

  /**
   * Get all active SLA definitions for an org
   */
  async getDefinitionsForOrg(orgId: string): Promise<SlaDefinition[]> {
    const defs = await db.select()
      .from(slaDefinitions)
      .where(eq(slaDefinitions.isActive, true));
    
    // Filter to org-specific or global definitions
    return defs
      .filter(d => !d.orgId || d.orgId === orgId)
      .map(d => this.mapToDefinition(d));
  }

  /**
   * Find applicable SLA definition for an activity
   */
  async findApplicableDefinition(
    orgId: string,
    activityType: string,
    priority?: string
  ): Promise<SlaDefinition | null> {
    const defs = await this.getDefinitionsForOrg(orgId);
    
    // Find most specific match
    // Priority: exact activity type + priority > activity type only > default
    let bestMatch: SlaDefinition | null = null;
    
    for (const def of defs) {
      if (def.entityType !== 'activity') continue;
      
      // Check activity type match
      if (def.activityType && def.activityType !== activityType) continue;
      
      // Check priority match
      if (def.priority && def.priority !== priority) continue;
      
      // This is a match - check if it's more specific than current best
      if (!bestMatch) {
        bestMatch = def;
      } else if (def.activityType && !bestMatch.activityType) {
        bestMatch = def;
      } else if (def.priority && !bestMatch.priority) {
        bestMatch = def;
      }
    }
    
    return bestMatch;
  }

  /**
   * Create an SLA instance for an activity
   */
  async createInstance(input: CreateSlaInstanceInput): Promise<SlaInstance> {
    const definition = await this.getDefinitionById(input.slaDefinitionId);
    if (!definition) {
      throw new Error(`SLA definition not found: ${input.slaDefinitionId}`);
    }
    
    const startTime = input.startTime ?? new Date();
    
    // Calculate target times
    const targetTime = calculateDueDate(startTime, {
      offsetHours: definition.targetHours,
      useBusinessHours: definition.useBusinessHours,
    });
    
    const warningTime = definition.warningHours
      ? calculateDueDate(startTime, {
          offsetHours: definition.warningHours,
          useBusinessHours: definition.useBusinessHours,
        })
      : undefined;
    
    const criticalTime = definition.criticalHours
      ? calculateDueDate(startTime, {
          offsetHours: definition.criticalHours,
          useBusinessHours: definition.useBusinessHours,
        })
      : undefined;
    
    const [instance] = await db.insert(slaInstances).values({
      orgId: input.orgId,
      slaDefinitionId: input.slaDefinitionId,
      activityId: input.activityId,
      startTime,
      targetTime,
      warningTime,
      criticalTime,
      status: 'active',
      isBreached: false,
      escalationSent: false,
      createdAt: new Date(),
    }).returning();
    
    return this.mapToInstance(instance);
  }

  /**
   * Get SLA instance by activity ID
   */
  async getInstanceByActivityId(activityId: string): Promise<SlaInstance | null> {
    const [instance] = await db.select()
      .from(slaInstances)
      .where(eq(slaInstances.activityId, activityId))
      .limit(1);
    
    return instance ? this.mapToInstance(instance) : null;
  }

  /**
   * Get active SLA instances for an org
   */
  async getActiveInstances(orgId: string): Promise<SlaInstance[]> {
    const instances = await db.select()
      .from(slaInstances)
      .where(and(
        eq(slaInstances.orgId, orgId),
        inArray(slaInstances.status, ['active', 'warning', 'critical'])
      ));
    
    return instances.map(i => this.mapToInstance(i));
  }

  /**
   * Update SLA instance status
   */
  async updateInstanceStatus(
    instanceId: string,
    status: SlaStatus,
    additionalData?: Partial<{
      completedAt: Date;
      breachedAt: Date;
      breachDuration: number;
      escalationSent: boolean;
      escalationSentAt: Date;
    }>
  ): Promise<SlaInstance> {
    const now = new Date();
    
    const updateData: Record<string, unknown> = {
      status,
    };
    
    if (status === 'breached' && !additionalData?.breachedAt) {
      updateData.isBreached = true;
      updateData.breachedAt = now;
    }
    
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }
    
    const [updated] = await db.update(slaInstances)
      .set(updateData)
      .where(eq(slaInstances.id, instanceId))
      .returning();
    
    return this.mapToInstance(updated);
  }

  /**
   * Mark SLA as met (activity completed on time)
   */
  async markMet(instanceId: string, completedAt: Date): Promise<SlaInstance> {
    return this.updateInstanceStatus(instanceId, 'met', { completedAt });
  }

  /**
   * Mark SLA as breached
   */
  async markBreached(instanceId: string): Promise<SlaInstance> {
    const instance = await this.getInstanceById(instanceId);
    if (!instance) {
      throw new Error(`SLA instance not found: ${instanceId}`);
    }
    
    const now = new Date();
    const breachDuration = Math.round(
      (now.getTime() - instance.targetTime.getTime()) / 60000
    ); // minutes
    
    return this.updateInstanceStatus(instanceId, 'breached', {
      breachedAt: now,
      breachDuration,
    });
  }

  /**
   * Get SLA instance by ID
   */
  async getInstanceById(id: string): Promise<SlaInstance | null> {
    const [instance] = await db.select()
      .from(slaInstances)
      .where(eq(slaInstances.id, id))
      .limit(1);
    
    return instance ? this.mapToInstance(instance) : null;
  }

  /**
   * Get SLA metrics for an org
   */
  async getMetrics(
    orgId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      slaCode?: string;
    }
  ): Promise<SlaMetrics> {
    const instances = await db.select()
      .from(slaInstances)
      .where(eq(slaInstances.orgId, orgId));
    
    // Filter by date range if specified
    let filtered = instances;
    if (options?.startDate) {
      filtered = filtered.filter(i => i.createdAt >= options.startDate!);
    }
    if (options?.endDate) {
      filtered = filtered.filter(i => i.createdAt <= options.endDate!);
    }
    
    // Calculate metrics
    const met = filtered.filter(i => i.status === 'met').length;
    const breached = filtered.filter(i => i.isBreached).length;
    const inProgress = filtered.filter(
      i => ['active', 'warning', 'critical'].includes(i.status!)
    ).length;
    
    // Calculate average completion time for met SLAs
    const metInstances = filtered.filter(i => i.status === 'met' && i.completedAt);
    const totalCompletionHours = metInstances.reduce((sum, i) => {
      const hours = (i.completedAt!.getTime() - i.startTime.getTime()) / 3600000;
      return sum + hours;
    }, 0);
    
    // Calculate average breach duration
    const breachedInstances = filtered.filter(i => i.isBreached && i.breachDuration);
    const totalBreachMinutes = breachedInstances.reduce(
      (sum, i) => sum + (i.breachDuration ?? 0),
      0
    );
    
    return {
      totalTracked: filtered.length,
      met,
      breached,
      inProgress,
      complianceRate: filtered.length > 0
        ? (met / (met + breached)) * 100
        : 100,
      avgCompletionHours: metInstances.length > 0
        ? totalCompletionHours / metInstances.length
        : 0,
      avgBreachMinutes: breachedInstances.length > 0
        ? totalBreachMinutes / breachedInstances.length
        : 0,
    };
  }

  /**
   * Map database record to SlaDefinition
   */
  private mapToDefinition(record: typeof slaDefinitions.$inferSelect): SlaDefinition {
    return {
      id: record.id,
      orgId: record.orgId,
      slaName: record.slaName,
      slaCode: record.slaCode,
      description: record.description ?? undefined,
      entityType: record.entityType,
      activityType: record.activityType as SlaDefinition['activityType'],
      activityCategory: record.activityCategory ?? undefined,
      priority: record.priority as SlaDefinition['priority'],
      targetHours: record.targetHours,
      warningHours: record.warningHours ?? undefined,
      criticalHours: record.criticalHours ?? undefined,
      useBusinessHours: record.useBusinessHours ?? false,
      businessHoursStart: record.businessHoursStart ?? undefined,
      businessHoursEnd: record.businessHoursEnd ?? undefined,
      escalateOnBreach: record.escalateOnBreach ?? false,
      escalateToUserId: record.escalateToUserId ?? undefined,
      escalateToGroupId: record.escalateToGroupId ?? undefined,
      isActive: record.isActive ?? true,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Map database record to SlaInstance
   */
  private mapToInstance(record: typeof slaInstances.$inferSelect): SlaInstance {
    return {
      id: record.id,
      orgId: record.orgId,
      slaDefinitionId: record.slaDefinitionId,
      activityId: record.activityId,
      startTime: record.startTime,
      targetTime: record.targetTime,
      warningTime: record.warningTime ?? undefined,
      criticalTime: record.criticalTime ?? undefined,
      status: record.status as SlaStatus,
      completedAt: record.completedAt ?? undefined,
      pausedAt: record.pausedAt ?? undefined,
      resumedAt: record.resumedAt ?? undefined,
      isBreached: record.isBreached ?? false,
      breachedAt: record.breachedAt ?? undefined,
      breachDuration: record.breachDuration ?? undefined,
      escalationSent: record.escalationSent ?? false,
      escalationSentAt: record.escalationSentAt ?? undefined,
      createdAt: record.createdAt,
    };
  }
}

// Export singleton
export const slaService = new SlaService();

