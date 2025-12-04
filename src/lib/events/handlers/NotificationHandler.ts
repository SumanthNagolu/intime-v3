/**
 * Notification Handler
 *
 * Handler that sends notifications based on user subscriptions.
 * Matches events against subscription patterns and queues notifications.
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { subscriptionService } from '../SubscriptionService';
import { deliveryService } from '../DeliveryService';
import type { Event } from '../event.types';

export interface NotificationResult {
  success: boolean;
  notificationsQueued?: number;
  error?: string;
}

/**
 * Handler that sends notifications based on subscriptions
 *
 * Flow:
 * 1. Get all subscriptions matching the event type
 * 2. Filter out the event actor (don't notify yourself)
 * 3. Create notification payload from event
 * 4. Queue notification for each subscriber
 */
export async function notificationHandler(event: Event): Promise<NotificationResult> {
  try {
    // Get matching subscriptions
    const subscriptions = await subscriptionService.getMatchingSubscriptions(event.eventType);

    let queued = 0;

    for (const sub of subscriptions) {
      // Skip if subscription is for the actor (don't notify yourself)
      if (sub.userId === event.actorId) continue;

      // Create notification payload from event
      const payload = createNotificationPayload(event);

      await deliveryService.queueNotification(
        sub.userId,
        sub.channel,
        {
          id: event.id,
          type: event.eventType,
          entityType: event.entityType,
          entityId: event.entityId,
          data: event.eventData,
          actorId: event.actorId,
          occurredAt: event.occurredAt,
        },
        payload
      );

      queued++;
    }

    if (queued > 0) {
      console.log(`[NotificationHandler] Queued ${queued} notifications for event ${event.eventType}`);
    }

    return {
      success: true,
      notificationsQueued: queued,
    };
  } catch (error) {
    console.error('[NotificationHandler] Failed:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Create notification payload from event
 */
function createNotificationPayload(event: Event): { title: string; body: string; url?: string } {
  const data = event.eventData as Record<string, string>;

  // Event-specific templates
  const templates: Record<string, { title: string; body: string; url?: string }> = {
    // Submission events
    'submission.created': {
      title: 'New Submission',
      body: `A new candidate has been submitted for ${data.jobTitle || 'a job'}`,
      url: `/recruiting/submissions/${event.entityId}`,
    },
    'submission.status_changed': {
      title: 'Submission Status Updated',
      body: `Submission status changed to ${data.newStatus || 'updated'}`,
      url: `/recruiting/submissions/${event.entityId}`,
    },
    'submission.approved': {
      title: 'Submission Approved',
      body: `Your submission has been approved`,
      url: `/recruiting/submissions/${event.entityId}`,
    },
    'submission.rejected': {
      title: 'Submission Rejected',
      body: `Your submission has been rejected`,
      url: `/recruiting/submissions/${event.entityId}`,
    },

    // Interview events
    'interview.scheduled': {
      title: 'Interview Scheduled',
      body: `An interview has been scheduled for ${data.candidateName || 'a candidate'}`,
      url: `/recruiting/interviews/${event.entityId}`,
    },
    'interview.rescheduled': {
      title: 'Interview Rescheduled',
      body: `An interview has been rescheduled`,
      url: `/recruiting/interviews/${event.entityId}`,
    },
    'interview.cancelled': {
      title: 'Interview Cancelled',
      body: `An interview has been cancelled`,
      url: `/recruiting/interviews/${event.entityId}`,
    },
    'interview.completed': {
      title: 'Interview Completed',
      body: `An interview has been completed`,
      url: `/recruiting/interviews/${event.entityId}`,
    },

    // Activity events
    'activity.assigned': {
      title: 'New Activity Assigned',
      body: data.subject || 'You have a new activity',
      url: `/activities/${event.entityId}`,
    },
    'activity.sla_warning': {
      title: 'SLA Warning',
      body: `Activity "${data.subject || 'Activity'}" is approaching deadline`,
      url: `/activities/${event.entityId}`,
    },
    'activity.escalated': {
      title: 'Activity Escalated',
      body: `Activity "${data.subject || 'Activity'}" has been escalated to you`,
      url: `/activities/${event.entityId}`,
    },
    'activity.overdue': {
      title: 'Activity Overdue',
      body: `Activity "${data.subject || 'Activity'}" is overdue`,
      url: `/activities/${event.entityId}`,
    },

    // Offer events
    'offer.sent': {
      title: 'Offer Sent',
      body: `An offer has been sent to ${data.candidateName || 'a candidate'}`,
      url: `/recruiting/offers/${event.entityId}`,
    },
    'offer.accepted': {
      title: 'Offer Accepted',
      body: `${data.candidateName || 'Candidate'} has accepted the offer`,
      url: `/recruiting/offers/${event.entityId}`,
    },
    'offer.rejected': {
      title: 'Offer Declined',
      body: `${data.candidateName || 'Candidate'} has declined the offer`,
      url: `/recruiting/offers/${event.entityId}`,
    },

    // Placement events
    'placement.started': {
      title: 'Placement Started',
      body: `A new placement has started`,
      url: `/recruiting/placements/${event.entityId}`,
    },
    'placement.end_approaching': {
      title: 'Placement Ending Soon',
      body: `A placement is ending soon`,
      url: `/recruiting/placements/${event.entityId}`,
    },

    // Account events
    'account.health_score_dropped': {
      title: 'Account Health Alert',
      body: `Account health score has dropped`,
      url: `/crm/accounts/${event.entityId}`,
    },

    // Job events
    'job.created': {
      title: 'New Job Created',
      body: `A new job "${data.title || 'job'}" has been created`,
      url: `/recruiting/jobs/${event.entityId}`,
    },
    'job.published': {
      title: 'Job Published',
      body: `Job "${data.title || ''}" has been published`,
      url: `/recruiting/jobs/${event.entityId}`,
    },
    'job.sla_warning': {
      title: 'Job SLA Warning',
      body: `Job is approaching SLA deadline`,
      url: `/recruiting/jobs/${event.entityId}`,
    },
    'job.sla_breach': {
      title: 'Job SLA Breached',
      body: `Job has breached its SLA`,
      url: `/recruiting/jobs/${event.entityId}`,
    },

    // Candidate events
    'candidate.submitted': {
      title: 'Candidate Submitted',
      body: `A candidate has been submitted`,
      url: `/recruiting/candidates/${event.entityId}`,
    },
    'candidate.placed': {
      title: 'Candidate Placed',
      body: `A candidate has been placed`,
      url: `/recruiting/candidates/${event.entityId}`,
    },

    // Lead events
    'lead.created': {
      title: 'New Lead',
      body: `A new lead has been created`,
      url: `/crm/leads/${event.entityId}`,
    },
    'lead.qualified': {
      title: 'Lead Qualified',
      body: `A lead has been qualified`,
      url: `/crm/leads/${event.entityId}`,
    },

    // Deal events
    'deal.stage_changed': {
      title: 'Deal Stage Changed',
      body: `Deal has moved to a new stage`,
      url: `/crm/deals/${event.entityId}`,
    },
    'deal.won': {
      title: 'Deal Won!',
      body: `Congratulations! A deal has been won`,
      url: `/crm/deals/${event.entityId}`,
    },
  };

  const template = templates[event.eventType];
  if (template) {
    return template;
  }

  // Default template for unknown event types
  return {
    title: formatEventType(event.eventType),
    body: `${event.entityType} ${event.entityId} was updated`,
  };
}

/**
 * Format event type for display
 */
function formatEventType(type: string): string {
  return type
    .split('.')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' '))
    .join(' - ');
}

export default notificationHandler;
