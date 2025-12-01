/**
 * SLA Tracker
 * 
 * Background service that monitors active SLAs and triggers alerts.
 * In production, this would be a scheduled job (e.g., every 5 minutes).
 */

import { slaService } from './sla-service';
import { eventEmitter } from '@/lib/events';
import { activityService } from '@/lib/activities/activity-service';
import type { SlaInstance, SlaCheckResult, SlaStatus } from './sla.types';

/**
 * SLA Tracker - Monitors SLAs and triggers alerts
 */
export class SlaTracker {
  private isRunning = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Start the SLA tracker
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.checkInterval = setInterval(
      () => this.checkAllSlas(),
      this.CHECK_INTERVAL_MS
    );
    
    console.log('SLA Tracker started');
  }

  /**
   * Stop the SLA tracker
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    
    console.log('SLA Tracker stopped');
  }

  /**
   * Check all active SLAs across all orgs
   * This would be called by a scheduled job in production
   */
  async checkAllSlas(): Promise<void> {
    // In a real implementation, you'd iterate through all orgs
    // For now, this is a placeholder
    console.log('Checking SLAs...');
  }

  /**
   * Check all SLAs for an org
   */
  async checkOrgSlas(orgId: string): Promise<{
    checked: number;
    warnings: number;
    breaches: number;
  }> {
    const instances = await slaService.getActiveInstances(orgId);
    
    let warnings = 0;
    let breaches = 0;
    
    for (const instance of instances) {
      const result = await this.checkInstance(instance);
      
      if (result.breached && instance.status !== 'breached') {
        warnings++; // Was warning before breach
        breaches++;
        await this.handleBreach(instance);
      } else if (result.criticalTriggered && instance.status !== 'critical') {
        await this.handleCritical(instance);
      } else if (result.warningTriggered && instance.status === 'active') {
        warnings++;
        await this.handleWarning(instance);
      }
    }
    
    return {
      checked: instances.length,
      warnings,
      breaches,
    };
  }

  /**
   * Check a single SLA instance
   */
  async checkInstance(instance: SlaInstance): Promise<SlaCheckResult> {
    const now = new Date();
    const targetMs = instance.targetTime.getTime();
    const remainingMs = targetMs - now.getTime();
    const remainingMinutes = Math.round(remainingMs / 60000);
    
    // Calculate percent complete (0-100+, can exceed 100 if overdue)
    const totalMs = targetMs - instance.startTime.getTime();
    const elapsedMs = now.getTime() - instance.startTime.getTime();
    const percentComplete = Math.round((elapsedMs / totalMs) * 100);
    
    // Check thresholds
    const breached = now > instance.targetTime;
    const criticalTriggered = instance.criticalTime 
      ? now > instance.criticalTime 
      : false;
    const warningTriggered = instance.warningTime 
      ? now > instance.warningTime 
      : false;
    
    // Determine status
    let status: SlaStatus = 'active';
    if (breached) {
      status = 'breached';
    } else if (criticalTriggered) {
      status = 'critical';
    } else if (warningTriggered) {
      status = 'warning';
    }
    
    return {
      status,
      remainingMinutes,
      percentComplete,
      warningTriggered,
      criticalTriggered,
      breached,
    };
  }

  /**
   * Handle SLA warning
   */
  private async handleWarning(instance: SlaInstance): Promise<void> {
    // Update status
    await slaService.updateInstanceStatus(instance.id, 'warning');
    
    // Get activity for context
    const activity = await activityService.getById(instance.activityId);
    if (!activity) return;
    
    // Emit warning event
    await eventEmitter.emit({
      type: 'activity.sla_warning',
      orgId: instance.orgId,
      entityType: 'activity',
      entityId: instance.activityId,
      actorType: 'system',
      eventData: {
        slaInstanceId: instance.id,
        slaDefinitionId: instance.slaDefinitionId,
        targetTime: instance.targetTime,
        activitySubject: activity.subject,
        assignedTo: activity.assignedTo,
      },
      source: 'system',
    });
    
    console.log(`SLA Warning: Activity ${instance.activityId}`);
  }

  /**
   * Handle SLA critical
   */
  private async handleCritical(instance: SlaInstance): Promise<void> {
    // Update status
    await slaService.updateInstanceStatus(instance.id, 'critical');
    
    // Get activity for context
    const activity = await activityService.getById(instance.activityId);
    if (!activity) return;
    
    // Emit critical event
    await eventEmitter.emit({
      type: 'activity.sla_critical',
      orgId: instance.orgId,
      entityType: 'activity',
      entityId: instance.activityId,
      actorType: 'system',
      eventData: {
        slaInstanceId: instance.id,
        slaDefinitionId: instance.slaDefinitionId,
        targetTime: instance.targetTime,
        activitySubject: activity.subject,
        assignedTo: activity.assignedTo,
      },
      source: 'system',
    });
    
    console.log(`SLA Critical: Activity ${instance.activityId}`);
  }

  /**
   * Handle SLA breach
   */
  private async handleBreach(instance: SlaInstance): Promise<void> {
    // Update status
    await slaService.markBreached(instance.id);
    
    // Get activity for context
    const activity = await activityService.getById(instance.activityId);
    if (!activity) return;
    
    // Emit breach event
    await eventEmitter.emit({
      type: 'activity.sla_breach',
      orgId: instance.orgId,
      entityType: 'activity',
      entityId: instance.activityId,
      actorType: 'system',
      eventData: {
        slaInstanceId: instance.id,
        slaDefinitionId: instance.slaDefinitionId,
        targetTime: instance.targetTime,
        activitySubject: activity.subject,
        assignedTo: activity.assignedTo,
        breachedAt: new Date(),
      },
      source: 'system',
    });
    
    // TODO: Send escalation if configured
    // const definition = await slaService.getDefinitionById(instance.slaDefinitionId);
    // if (definition?.escalateOnBreach) { ... }
    
    console.log(`SLA Breach: Activity ${instance.activityId}`);
  }

  /**
   * Mark an activity as completed and update its SLA
   */
  async markActivityCompleted(activityId: string): Promise<void> {
    const instance = await slaService.getInstanceByActivityId(activityId);
    if (!instance) return;
    
    const now = new Date();
    
    // Check if it was completed on time
    if (now <= instance.targetTime) {
      await slaService.markMet(instance.id, now);
    } else {
      // Already breached, just mark as completed
      await slaService.updateInstanceStatus(instance.id, 'breached', {
        completedAt: now,
      });
    }
  }

  /**
   * Create SLA instance when an activity is created
   */
  async trackActivity(
    orgId: string,
    activityId: string,
    activityType: string,
    priority?: string
  ): Promise<SlaInstance | null> {
    // Find applicable SLA definition
    const definition = await slaService.findApplicableDefinition(
      orgId,
      activityType,
      priority
    );
    
    if (!definition) {
      return null; // No SLA applies
    }
    
    // Create SLA instance
    return slaService.createInstance({
      orgId,
      slaDefinitionId: definition.id,
      activityId,
    });
  }
}

// Export singleton
export const slaTracker = new SlaTracker();

