/**
 * User Event Handlers
 *
 * Handlers for user-related events (creation, updates, etc.)
 */

import { registerEventHandler } from '../decorators';
import type { Event, UserCreatedPayload } from '../types';

/**
 * Send welcome email when user is created
 *
 * @param event - user.created event
 */
export async function handleUserCreated(event: Event<UserCreatedPayload>) {
  const { email, fullName } = event.payload;

  console.log(`[Handler:send_welcome_email] Processing user.created for ${email}`);

  // TODO: Send email via Resend API
  // For now, just log (email integration in future sprint)

  /*
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'InTime <noreply@intimeesolutions.com>',
      to: email,
      subject: 'Welcome to InTime!',
      html: `<p>Hi ${fullName},</p><p>Welcome to InTime!</p>`
    })
  });
  */

  console.log(`[Handler:send_welcome_email] Welcome email would be sent to ${email}`);
}

/**
 * Create audit log entry when user is created
 *
 * @param event - user.created event
 */
export async function auditUserCreation(event: Event<UserCreatedPayload>) {
  const { userId, email } = event.payload;

  console.log(`[Handler:audit_user_creation] Auditing user creation for ${userId}`);

  // Audit log is already created by database trigger
  // This handler demonstrates multiple handlers for same event
  // In production, could add additional logging (e.g., analytics, Slack notification)

  console.log(`[Handler:audit_user_creation] User ${userId} (${email}) created successfully`);
}

// Register handlers
registerEventHandler('user.created', 'send_welcome_email', handleUserCreated);
registerEventHandler('user.created', 'audit_user_creation', auditUserCreation);
