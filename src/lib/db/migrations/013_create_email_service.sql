-- Migration 013: Email Service
-- Sprint 3: Workflow Engine & Core Services
-- Created: 2025-11-19
-- Purpose: Create email templates and logging tables

-- ========================================
-- 1. EMAIL_TEMPLATES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL, -- Handlebars template
  body_html TEXT NOT NULL, -- Handlebars template
  body_text TEXT, -- Plain text fallback
  category TEXT NOT NULL, -- 'transactional', 'notification', 'marketing'
  variables JSONB DEFAULT '{}'::jsonb NOT NULL, -- Expected variables
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT unique_email_template_name UNIQUE (org_id, name),
  CONSTRAINT valid_category CHECK (category IN ('transactional', 'notification', 'marketing'))
);

CREATE INDEX idx_email_templates_org_id ON email_templates(org_id);
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_active ON email_templates(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE email_templates IS 'Email templates for transactional/notification emails';

-- ========================================
-- 2. EMAIL_LOGS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id),
  to_email TEXT NOT NULL,
  cc_email TEXT[],
  bcc_email TEXT[],
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'sent', 'failed', 'bounced', 'opened', 'clicked'
  resend_id TEXT, -- Resend email ID (for tracking)
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- Variables used, IP address, user agent
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT valid_email_status CHECK (status IN ('pending', 'sent', 'failed', 'bounced', 'opened', 'clicked'))
);

CREATE INDEX idx_email_logs_org_id ON email_logs(org_id);
CREATE INDEX idx_email_logs_template_id ON email_logs(template_id);
CREATE INDEX idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_resend_id ON email_logs(resend_id) WHERE resend_id IS NOT NULL;

COMMENT ON TABLE email_logs IS 'Log of all emails sent (for tracking and compliance)';

-- ========================================
-- RLS POLICIES
-- ========================================

-- email_templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view email templates in their org"
  ON email_templates FOR SELECT
  USING (org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "Only admins can create email templates"
  ON email_templates FOR INSERT
  WITH CHECK (user_is_admin());

CREATE POLICY "Only admins can update email templates"
  ON email_templates FOR UPDATE
  USING (user_is_admin());

-- email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view email logs in their org"
  ON email_logs FOR SELECT
  USING (org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "Service role can insert email logs"
  ON email_logs FOR INSERT
  WITH CHECK (TRUE); -- Needed for email service

CREATE POLICY "Service role can update email logs"
  ON email_logs FOR UPDATE
  USING (TRUE); -- Needed for Resend webhooks

-- ========================================
-- TRIGGERS
-- ========================================

CREATE TRIGGER trigger_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SEED DATA
-- ========================================

DO $$
DECLARE
  v_org_id UUID;
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_org_id FROM organizations WHERE name = 'InTime Solutions' LIMIT 1;
  SELECT id INTO v_admin_id FROM user_profiles WHERE email LIKE '%admin%' ORDER BY created_at LIMIT 1;

  IF v_org_id IS NULL OR v_admin_id IS NULL THEN
    RAISE NOTICE 'Skipping email template seed data';
    RETURN;
  END IF;

  -- Welcome Email
  INSERT INTO email_templates (
    org_id, name, subject, body_html, body_text, category, variables, created_by
  ) VALUES (
    v_org_id,
    'Welcome Email',
    'Welcome to InTime, {{ firstName }}!',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to InTime!</h1>
  </div>
  <div class="content">
    <h2>Hello {{ firstName }}!</h2>
    <p>We''re excited to have you join the InTime platform.</p>
    <p>You can now access your account and start exploring all the features we have to offer.</p>
    <p style="text-align: center;">
      <a href="{{ loginUrl }}" class="button">Login to Your Account</a>
    </p>
    <p>If you have any questions, don''t hesitate to reach out to our support team.</p>
    <p>Best regards,<br>The InTime Team</p>
  </div>
  <div class="footer">
    <p>&copy; 2025 InTime Solutions. All rights reserved.</p>
  </div>
</body>
</html>',
    'Welcome {{ firstName }}! We''re excited to have you join InTime. Login to your account: {{ loginUrl }}',
    'transactional',
    jsonb_build_object(
      'firstName', jsonb_build_object('type', 'string', 'required', true),
      'loginUrl', jsonb_build_object('type', 'string', 'required', true, 'default', 'https://app.intimeesolutions.com/login')
    ),
    v_admin_id
  ) ON CONFLICT (org_id, name) DO NOTHING;

  -- Password Reset
  INSERT INTO email_templates (
    org_id, name, subject, body_html, body_text, category, variables, created_by
  ) VALUES (
    v_org_id,
    'Password Reset',
    'Reset Your Password',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background: #e74c3c;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h2>Password Reset Request</h2>
  <p>We received a request to reset your password.</p>
  <p style="text-align: center;">
    <a href="{{ resetUrl }}" class="button">Reset Password</a>
  </p>
  <p>This link will expire in {{ expiresIn }}.</p>
  <div class="warning">
    <strong>Security Notice:</strong> If you didn''t request this password reset, please ignore this email. Your password will remain unchanged.
  </div>
</body>
</html>',
    'Click here to reset your password: {{ resetUrl }} (expires in {{ expiresIn }})',
    'transactional',
    jsonb_build_object(
      'resetUrl', jsonb_build_object('type', 'string', 'required', true),
      'expiresIn', jsonb_build_object('type', 'string', 'required', false, 'default', '1 hour')
    ),
    v_admin_id
  ) ON CONFLICT (org_id, name) DO NOTHING;

  -- Course Completion
  INSERT INTO email_templates (
    org_id, name, subject, body_html, body_text, category, variables, created_by
  ) VALUES (
    v_org_id,
    'Course Completion Certificate',
    'Congratulations on Completing {{ courseName }}!',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .celebration {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
      border-radius: 10px;
    }
    .achievement {
      background: #f0f8ff;
      border: 2px solid #3498db;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .button {
      display: inline-block;
      background: #27ae60;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="celebration">
    <h1>🎉 Congratulations!</h1>
  </div>
  <h2>Hello {{ studentName }},</h2>
  <p>We''re thrilled to inform you that you have successfully completed <strong>{{ courseName }}</strong>!</p>
  <div class="achievement">
    <p style="text-align: center; margin: 0;">
      <strong>Final Grade:</strong> {{ grade }}%<br>
      <strong>Completion Date:</strong> {{ completionDate }}
    </p>
  </div>
  <p>Your certificate is ready to download:</p>
  <p style="text-align: center;">
    <a href="{{ certificateUrl }}" class="button">Download Certificate</a>
  </p>
  <p><strong>Next Steps:</strong></p>
  <ul>
    <li>Check out our job board for placement opportunities</li>
    <li>Connect with our recruitment team</li>
    <li>Share your achievement on LinkedIn</li>
  </ul>
  <p>Congratulations again on this achievement!</p>
  <p>Best regards,<br>InTime Training Academy</p>
</body>
</html>',
    'Congratulations {{ studentName }}! You completed {{ courseName }} with {{ grade }}%. Download certificate: {{ certificateUrl }}',
    'notification',
    jsonb_build_object(
      'studentName', jsonb_build_object('type', 'string', 'required', true),
      'courseName', jsonb_build_object('type', 'string', 'required', true),
      'grade', jsonb_build_object('type', 'number', 'required', true),
      'completionDate', jsonb_build_object('type', 'string', 'required', true),
      'certificateUrl', jsonb_build_object('type', 'string', 'required', true)
    ),
    v_admin_id
  ) ON CONFLICT (org_id, name) DO NOTHING;

  -- Interview Scheduled
  INSERT INTO email_templates (
    org_id, name, subject, body_html, body_text, category, variables, created_by
  ) VALUES (
    v_org_id,
    'Interview Scheduled',
    'Interview Scheduled - {{ jobTitle }} at {{ companyName }}',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .interview-details {
      background: #e8f5e9;
      border-left: 4px solid #4caf50;
      padding: 20px;
      margin: 20px 0;
    }
    .calendar-add {
      background: #2196f3;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      display: inline-block;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <h2>Interview Scheduled</h2>
  <p>Dear {{ candidateName }},</p>
  <p>Great news! Your interview has been scheduled for the position of <strong>{{ jobTitle }}</strong> at <strong>{{ companyName }}</strong>.</p>
  <div class="interview-details">
    <p><strong>Interview Details:</strong></p>
    <ul>
      <li><strong>Date & Time:</strong> {{ interviewDateTime }}</li>
      <li><strong>Duration:</strong> {{ duration }}</li>
      <li><strong>Location/Link:</strong> {{ location }}</li>
      <li><strong>Interviewer:</strong> {{ interviewerName }}</li>
    </ul>
  </div>
  <p><strong>Preparation Tips:</strong></p>
  <ul>
    <li>Review the job description</li>
    <li>Prepare questions about the role and company</li>
    <li>Test your internet connection (if virtual)</li>
    <li>Have your resume handy</li>
  </ul>
  <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
  <p>Good luck!</p>
  <p>Best regards,<br>InTime Recruitment Team</p>
</body>
</html>',
    'Interview scheduled for {{ jobTitle }} at {{ companyName }} on {{ interviewDateTime }}. Location: {{ location }}',
    'notification',
    jsonb_build_object(
      'candidateName', jsonb_build_object('type', 'string', 'required', true),
      'jobTitle', jsonb_build_object('type', 'string', 'required', true),
      'companyName', jsonb_build_object('type', 'string', 'required', true),
      'interviewDateTime', jsonb_build_object('type', 'string', 'required', true),
      'duration', jsonb_build_object('type', 'string', 'required', true),
      'location', jsonb_build_object('type', 'string', 'required', true),
      'interviewerName', jsonb_build_object('type', 'string', 'required', true)
    ),
    v_admin_id
  ) ON CONFLICT (org_id, name) DO NOTHING;

  RAISE NOTICE 'Email template seed data created successfully';
END $$;
