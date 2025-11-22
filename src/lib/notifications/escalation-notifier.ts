/**
 * Escalation Notification Service
 * ACAD-014
 *
 * Send notifications to trainers when students escalate
 */

// ============================================================================
// TYPES
// ============================================================================

export interface EscalationNotification {
  escalationId: string;
  studentName: string;
  studentEmail: string;
  topicTitle: string | null;
  reason: string;
  confidence: number;
  originalQuestion: string;
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}

// ============================================================================
// SLACK NOTIFICATIONS
// ============================================================================

/**
 * Send Slack notification to trainer channel
 */
export async function sendSlackNotification(
  escalation: EscalationNotification
): Promise<NotificationResult> {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!slackWebhookUrl) {
    console.warn('Slack webhook URL not configured');
    return {
      success: false,
      error: 'Slack webhook not configured',
    };
  }

  try {
    const message = {
      text: '🚨 Student Escalation',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 Student Needs Help',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Student:*\n${escalation.studentName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Topic:*\n${escalation.topicTitle || 'General'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Confidence:*\n${Math.round(escalation.confidence * 100)}%`,
            },
            {
              type: 'mrkdwn',
              text: `*Escalation ID:*\n${escalation.escalationId.substring(0, 8)}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Reason:*\n${escalation.reason}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Original Question:*\n>${escalation.originalQuestion.substring(0, 200)}${escalation.originalQuestion.length > 200 ? '...' : ''}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View in Dashboard',
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/escalations/${escalation.escalationId}`,
              style: 'primary',
            },
          ],
        },
      ],
    };

    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// EMAIL NOTIFICATIONS
// ============================================================================

/**
 * Send email notification to trainer
 */
export async function sendEmailNotification(
  trainerEmail: string,
  escalation: EscalationNotification
): Promise<NotificationResult> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn('Resend API key not configured');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'InTime Academy <noreply@intimeesolutions.com>',
        to: trainerEmail,
        subject: `🚨 Student Escalation: ${escalation.studentName}`,
        html: `
          <h2>Student Needs Help</h2>

          <p>A student has been escalated to human trainer assistance.</p>

          <table style="border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">Student:</td>
              <td style="padding: 8px;">${escalation.studentName} (${escalation.studentEmail})</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Topic:</td>
              <td style="padding: 8px;">${escalation.topicTitle || 'General'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Confidence:</td>
              <td style="padding: 8px;">${Math.round(escalation.confidence * 100)}%</td>
            </tr>
          </table>

          <h3>Reason for Escalation:</h3>
          <p style="background: #f5f5f5; padding: 12px; border-left: 4px solid #3b82f6;">${escalation.reason}</p>

          <h3>Original Question:</h3>
          <p style="background: #f5f5f5; padding: 12px; border-left: 4px solid #3b82f6;">${escalation.originalQuestion}</p>

          <p style="margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/escalations/${escalation.escalationId}"
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View in Dashboard
            </a>
          </p>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await response.json();

    return {
      success: true,
      notificationId: data.id,
    };
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// MAIN NOTIFICATION DISPATCHER
// ============================================================================

/**
 * Send all notifications for an escalation
 */
export async function notifyTrainersOfEscalation(
  escalation: EscalationNotification
): Promise<{
  slack: NotificationResult;
  email: NotificationResult[];
}> {
  // Send Slack notification
  const slackResult = await sendSlackNotification(escalation);

  // TODO: Fetch trainer emails from database
  // For now, send to all trainers or a configured email
  const trainerEmails = process.env.TRAINER_EMAILS?.split(',') || [];

  const emailResults = await Promise.all(
    trainerEmails.map((email) => sendEmailNotification(email.trim(), escalation))
  );

  return {
    slack: slackResult,
    email: emailResults,
  };
}

/**
 * Record notification delivery in database
 */
export async function recordNotificationDelivery(
  escalationId: string,
  notificationType: 'slack' | 'email',
  result: NotificationResult,
  recipientEmail?: string
): Promise<void> {
  const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const sql = `SELECT record_notification($1, $2, NULL, $3, NULL)`;
  const params = [escalationId, notificationType, recipientEmail || null];

  try {
    await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql, params }),
    });
  } catch (error) {
    console.error('Failed to record notification delivery:', error);
  }
}
