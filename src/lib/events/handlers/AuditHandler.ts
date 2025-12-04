/**
 * Audit Handler
 *
 * Handler that creates audit log entries for auditable events.
 * Records entity lifecycle, security, and user action events.
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';
import type { Event, EventCategory } from '../event.types';

export interface AuditResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
}

// Categories that should be audited
const AUDITABLE_CATEGORIES: EventCategory[] = ['entity', 'workflow', 'security'];

// Event types that require special audit handling
const SENSITIVE_EVENTS = [
  'user.login',
  'user.logout',
  'user.password_changed',
  'user.permission_changed',
  'security.access_denied',
  'security.suspicious_activity',
];

/**
 * Handler that creates audit log entries
 *
 * This handler processes events and creates audit log entries
 * for auditable event categories.
 */
export async function auditHandler(event: Event): Promise<AuditResult> {
  // Only audit certain event categories
  if (!AUDITABLE_CATEGORIES.includes(event.eventCategory)) {
    return { success: true, skipped: true };
  }

  try {
    const action = extractAction(event.eventType);
    const severity = determineSeverity(event);
    const isComplianceRelevant = SENSITIVE_EVENTS.includes(event.eventType);

    await db.insert(auditLogs).values({
      orgId: event.orgId,
      entityType: event.entityType,
      entityId: event.entityId,
      action,
      actorType: event.actorType,
      actorId: event.actorId ?? null,
      oldValues: (event.changes?.reduce((acc, c) => ({ ...acc, [c.field]: c.oldValue }), {}) as Record<string, unknown>) || null,
      newValues: (event.changes?.reduce((acc, c) => ({ ...acc, [c.field]: c.newValue }), {}) as Record<string, unknown>) || null,
      changedFields: event.changes?.map(c => c.field) || null,
      correlationId: event.correlationId,
      metadata: {
        eventType: event.eventType,
        eventCategory: event.eventCategory,
        source: event.source,
        sessionId: event.sessionId,
      },
      severity,
      isComplianceRelevant,
      createdAt: event.occurredAt,
    });

    console.log(`[AuditHandler] Created audit log for ${event.eventType}`);

    return { success: true };
  } catch (error) {
    console.error('[AuditHandler] Failed:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Extract action from event type
 */
function extractAction(type: string): string {
  const parts = type.split('.');
  const action = parts[parts.length - 1]; // e.g., 'created', 'updated', 'deleted'

  // Map to standard audit actions
  const actionMap: Record<string, string> = {
    created: 'INSERT',
    updated: 'UPDATE',
    deleted: 'DELETE',
    login: 'LOGIN',
    logout: 'LOGOUT',
    approved: 'APPROVE',
    rejected: 'REJECT',
    status_changed: 'UPDATE',
    owner_changed: 'UPDATE',
  };

  return actionMap[action] || action.toUpperCase();
}

/**
 * Determine severity based on event type
 */
function determineSeverity(event: Event): string {
  // Security events are always at least warning level
  if (event.eventCategory === 'security') {
    if (event.eventType.includes('denied') || event.eventType.includes('suspicious')) {
      return 'warning';
    }
    return 'info';
  }

  // Deletion events are warning level
  if (event.eventType.endsWith('.deleted')) {
    return 'warning';
  }

  // Use event severity if available
  if (event.eventSeverity) {
    return event.eventSeverity;
  }

  return 'info';
}

export default auditHandler;
