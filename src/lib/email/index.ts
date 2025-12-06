import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Default sender
const DEFAULT_FROM = process.env.EMAIL_FROM || 'InTime <noreply@intime.solutions>'

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send a user invitation email
 */
export async function sendInvitationEmail(params: {
  to: string
  firstName: string
  lastName: string
  invitedBy: string
  inviteLink: string
  orgName?: string
}): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: params.to,
      subject: `You've been invited to join ${params.orgName || 'InTime'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to InTime</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0D4C3B 0%, #1a5c4a 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to InTime</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${params.firstName},</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${params.invitedBy}</strong> has invited you to join ${params.orgName || 'their organization'} on InTime.
            </p>
            <p style="font-size: 16px; margin-bottom: 30px;">
              Click the button below to set up your account and get started.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${params.inviteLink}" style="background: #0D4C3B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This invitation link will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              © ${new Date().getFullYear()} InTime. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send invitation email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error('Error sending invitation email:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(params: {
  to: string
  firstName: string
  resetLink: string
}): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: params.to,
      subject: 'Reset your InTime password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0D4C3B 0%, #1a5c4a 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset Request</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${params.firstName},</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${params.resetLink}" style="background: #0D4C3B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              © ${new Date().getFullYear()} InTime. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send password reset email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error('Error sending password reset email:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Send a welcome email after user completes signup
 */
export async function sendWelcomeEmail(params: {
  to: string
  firstName: string
  loginUrl: string
  orgName?: string
}): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: params.to,
      subject: `Welcome to ${params.orgName || 'InTime'}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to InTime</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0D4C3B 0%, #1a5c4a 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to InTime!</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${params.firstName},</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Your account has been successfully created. You're all set to start using InTime!
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${params.loginUrl}" style="background: #0D4C3B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Log In to Your Account
              </a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you have any questions, feel free to reach out to your administrator.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              © ${new Date().getFullYear()} InTime. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error('Error sending welcome email:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Send account status change notification
 */
export async function sendStatusChangeEmail(params: {
  to: string
  firstName: string
  status: 'suspended' | 'deactivated' | 'activated'
  reason?: string
}): Promise<SendEmailResult> {
  const statusMessages = {
    suspended: {
      subject: 'Your InTime account has been suspended',
      title: 'Account Suspended',
      message: 'Your InTime account has been temporarily suspended.',
    },
    deactivated: {
      subject: 'Your InTime account has been deactivated',
      title: 'Account Deactivated',
      message: 'Your InTime account has been deactivated.',
    },
    activated: {
      subject: 'Your InTime account has been activated',
      title: 'Account Activated',
      message: 'Your InTime account has been activated. You can now log in.',
    },
  }

  const { subject, title, message } = statusMessages[params.status]

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: params.to,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${params.status === 'activated' ? '#0D4C3B' : '#dc2626'}; padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${params.firstName},</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${message}
            </p>
            ${params.reason ? `
              <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                <strong>Reason:</strong> ${params.reason}
              </p>
            ` : ''}
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you have any questions, please contact your administrator.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              © ${new Date().getFullYear()} InTime. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send status change email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error('Error sending status change email:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ============================================
// TEMPLATE-BASED EMAIL SERVICE
// ============================================
export {
  sendTemplatedEmail,
  renderTemplate,
  getAvailableTemplates,
  getTemplateBySlug,
  sendBulkTemplatedEmails,
} from './template-service'

export type {
  TemplateContext,
  SendTemplatedEmailParams,
  SendTemplatedEmailResult
} from './template-service'
