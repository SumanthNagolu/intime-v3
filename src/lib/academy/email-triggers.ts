// ============================================================
// Academy Email Triggers
// Sends academy-specific emails via Resend
// ============================================================

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.ACADEMY_FROM_EMAIL || 'academy@intime.dev'
const FROM_NAME = 'InTime Academy'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://intime.dev'

// --- Shared HTML wrapper ---

function wrapEmail(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, sans-serif; background: #fdfbf7; color: #171717; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
    .card { background: #fff; border-radius: 8px; border: 1px solid #e5e5e5; padding: 32px; }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #171717; }
    .header p { font-size: 13px; color: #737373; margin: 0; }
    .gold-bar { height: 3px; background: linear-gradient(to right, #c9a961, #d4af37, #c9a961); border-radius: 2px; margin-bottom: 24px; }
    .content { font-size: 15px; line-height: 1.6; color: #404040; }
    .content p { margin: 0 0 16px; }
    .btn { display: inline-block; padding: 12px 28px; background: #171717; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase; }
    .btn:hover { background: #333; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #a3a3a3; }
    .highlight { background: #fef9f0; border-left: 3px solid #c9a961; padding: 12px 16px; border-radius: 0 4px 4px 0; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="gold-bar"></div>
      ${content}
    </div>
    <div class="footer">
      <p>InTime Academy &mdash; Guidewire Developer Training</p>
      <p>&copy; ${new Date().getFullYear()} InTime. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}

// --- Send helper ---

async function sendAcademyEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!resend) {
    console.warn('[Academy Email] Resend not configured - skipping email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: params.to,
      subject: params.subject,
      html: wrapEmail(params.html),
    })

    if (error) {
      console.error('[Academy Email] Send failed:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error('[Academy Email] Error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ============================================================
// EMAIL TRIGGERS
// ============================================================

/**
 * Sent when a student submits an enrollment request
 */
export async function sendEnrollmentReceivedEmail(params: {
  to: string
  firstName: string
  pathTitle: string
}) {
  return sendAcademyEmail({
    to: params.to,
    subject: 'Application Received - InTime Academy',
    html: `
      <div class="header">
        <h1>Application Received!</h1>
        <p>We've received your enrollment request</p>
      </div>
      <div class="content">
        <p>Hi ${params.firstName},</p>
        <p>Thank you for your interest in the <strong>${params.pathTitle}</strong> learning path at InTime Academy.</p>
        <div class="highlight">
          Our team will review your application within <strong>2 business days</strong>. You'll receive an email once a decision is made.
        </div>
        <p>In the meantime, feel free to explore our catalog:</p>
        <p style="text-align: center; margin-top: 24px;">
          <a href="${BASE_URL}/academy/catalog" class="btn">View Catalog</a>
        </p>
      </div>
    `,
  })
}

/**
 * Sent when admin approves an enrollment request
 */
export async function sendEnrollmentApprovedEmail(params: {
  to: string
  firstName: string
  pathTitle: string
  pathSlug: string
}) {
  return sendAcademyEmail({
    to: params.to,
    subject: `Welcome to ${params.pathTitle} - InTime Academy`,
    html: `
      <div class="header">
        <h1>You're In!</h1>
        <p>Your enrollment has been approved</p>
      </div>
      <div class="content">
        <p>Hi ${params.firstName},</p>
        <p>Great news! Your enrollment in the <strong>${params.pathTitle}</strong> learning path has been approved.</p>
        <div class="highlight">
          You now have full access to all course materials, video demonstrations, and hands-on assignments in your learning path.
        </div>
        <p>Here's what to expect:</p>
        <ul>
          <li>Sequential lessons that build on each other</li>
          <li>Video demos for hands-on practice</li>
          <li>Assignments to test your understanding</li>
          <li>AI-powered Guru assistant for help</li>
        </ul>
        <p style="text-align: center; margin-top: 24px;">
          <a href="${BASE_URL}/academy/learn" class="btn">Start Learning</a>
        </p>
      </div>
    `,
  })
}

/**
 * Sent when admin rejects an enrollment request
 */
export async function sendEnrollmentRejectedEmail(params: {
  to: string
  firstName: string
  pathTitle: string
  reason?: string
}) {
  return sendAcademyEmail({
    to: params.to,
    subject: 'Enrollment Update - InTime Academy',
    html: `
      <div class="header">
        <h1>Enrollment Update</h1>
        <p>Regarding your application</p>
      </div>
      <div class="content">
        <p>Hi ${params.firstName},</p>
        <p>Thank you for your interest in the <strong>${params.pathTitle}</strong> learning path.</p>
        <p>Unfortunately, we're unable to approve your enrollment at this time.</p>
        ${params.reason ? `<div class="highlight">${params.reason}</div>` : ''}
        <p>If you have questions, please reach out to our team for more information.</p>
        <p style="text-align: center; margin-top: 24px;">
          <a href="${BASE_URL}/academy/catalog" class="btn">Browse Other Paths</a>
        </p>
      </div>
    `,
  })
}

/**
 * Sent when a student completes a chapter milestone
 */
export async function sendMilestoneCompletedEmail(params: {
  to: string
  firstName: string
  chapterTitle: string
  chapterNumber: number
  pathTitle: string
  completedCount: number
  totalChapters: number
}) {
  const progressPct = Math.round((params.completedCount / params.totalChapters) * 100)

  return sendAcademyEmail({
    to: params.to,
    subject: `Chapter ${params.chapterNumber} Complete! - InTime Academy`,
    html: `
      <div class="header">
        <h1>Chapter Complete!</h1>
        <p>${params.chapterTitle}</p>
      </div>
      <div class="content">
        <p>Hi ${params.firstName},</p>
        <p>Congratulations on completing <strong>Chapter ${params.chapterNumber}: ${params.chapterTitle}</strong>!</p>
        <div class="highlight">
          <strong>${progressPct}% complete</strong> &mdash; ${params.completedCount} of ${params.totalChapters} chapters finished in your ${params.pathTitle} path.
        </div>
        <p>Keep up the great work! Your next chapter is ready.</p>
        <p style="text-align: center; margin-top: 24px;">
          <a href="${BASE_URL}/academy/learn" class="btn">Continue Learning</a>
        </p>
      </div>
    `,
  })
}

/**
 * Sent when a student hasn't been active for 7+ days
 */
export async function sendInactivityReminderEmail(params: {
  to: string
  firstName: string
  pathTitle: string
  lastLessonTitle?: string
  daysSinceActive: number
}) {
  return sendAcademyEmail({
    to: params.to,
    subject: 'We miss you! Continue your learning journey',
    html: `
      <div class="header">
        <h1>Your Path Awaits</h1>
        <p>It's been a while since your last session</p>
      </div>
      <div class="content">
        <p>Hi ${params.firstName},</p>
        <p>It's been <strong>${params.daysSinceActive} days</strong> since your last activity in the ${params.pathTitle} path.</p>
        ${params.lastLessonTitle ? `<div class="highlight">Pick up where you left off: <strong>${params.lastLessonTitle}</strong></div>` : ''}
        <p>Consistency is key to mastering Guidewire development. Even 20 minutes a day can make a big difference!</p>
        <p style="text-align: center; margin-top: 24px;">
          <a href="${BASE_URL}/academy/learn" class="btn">Resume Learning</a>
        </p>
      </div>
    `,
  })
}

/**
 * Sent on graduation (all path lessons completed)
 */
export async function sendGraduationEmail(params: {
  to: string
  firstName: string
  pathTitle: string
  completionDate: string
  certificateUrl?: string
}) {
  return sendAcademyEmail({
    to: params.to,
    subject: `Congratulations, ${params.firstName}! You've graduated!`,
    html: `
      <div class="header">
        <h1>You Did It!</h1>
        <p>${params.pathTitle} &mdash; Completed</p>
      </div>
      <div class="content">
        <p>Hi ${params.firstName},</p>
        <p>Congratulations on completing the <strong>${params.pathTitle}</strong> learning path! This is a major achievement.</p>
        <div class="highlight">
          <strong>Completion Date:</strong> ${params.completionDate}
        </div>
        <p>You've demonstrated dedication and mastery of Guidewire development concepts. We're proud of your accomplishment!</p>
        ${params.certificateUrl ? `
        <p style="text-align: center; margin-top: 24px;">
          <a href="${params.certificateUrl}" class="btn">Download Certificate</a>
        </p>
        ` : `
        <p style="text-align: center; margin-top: 24px;">
          <a href="${BASE_URL}/academy/learn" class="btn">View Your Achievement</a>
        </p>
        `}
      </div>
    `,
  })
}

/**
 * Sent as invitation to enroll (from admin/sales)
 */
export async function sendInvitationEmail(params: {
  to: string
  firstName?: string
  pathTitle: string
  invitationToken: string
  senderName?: string
}) {
  const greeting = params.firstName ? `Hi ${params.firstName},` : 'Hello,'

  return sendAcademyEmail({
    to: params.to,
    subject: `You're Invited to InTime Academy - ${params.pathTitle}`,
    html: `
      <div class="header">
        <h1>You're Invited!</h1>
        <p>Join the ${params.pathTitle} learning path</p>
      </div>
      <div class="content">
        <p>${greeting}</p>
        ${params.senderName ? `<p><strong>${params.senderName}</strong> has invited you to join InTime Academy.</p>` : ''}
        <p>You've been selected for the <strong>${params.pathTitle}</strong> learning path, a comprehensive Guidewire developer training program.</p>
        <div class="highlight">
          This invitation gives you priority enrollment. Click the button below to get started.
        </div>
        <p style="text-align: center; margin-top: 24px;">
          <a href="${BASE_URL}/academy/invite/${params.invitationToken}" class="btn">Accept Invitation</a>
        </p>
      </div>
    `,
  })
}
