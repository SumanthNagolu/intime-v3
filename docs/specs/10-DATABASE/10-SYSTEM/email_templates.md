# email_templates Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `email_templates` |
| Schema | `public` |
| Purpose | Stores reusable email templates with HTML/text content, variable interpolation, and categorization. Supports versioning and soft deletion. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for template |
| org_id | uuid | NO | - | Organization ID for multi-tenant isolation |
| name | text | NO | - | Unique template name/identifier (e.g., 'welcome_email', 'interview_reminder') |
| subject | text | NO | - | Email subject line with optional variable placeholders |
| body_html | text | NO | - | HTML version of email body |
| body_text | text | YES | - | Plain text version of email body |
| category | text | NO | - | Template category (transactional, marketing, notification, system) |
| variables | jsonb | NO | '{}' | JSON schema of required/optional variables (e.g., {firstName: 'string', jobTitle: 'string'}) |
| is_active | boolean | NO | true | Whether template is currently active and usable |
| created_by | uuid | NO | - | ID of user who created the template |
| created_at | timestamp with time zone | NO | now() | Timestamp when template was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when template was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft deletion timestamp |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | CASCADE |
| created_by | user_profiles.id | SET NULL |

## Indexes

| Index Name | Definition |
|------------|------------|
| email_templates_pkey | CREATE UNIQUE INDEX ON email_templates (id) |
| idx_email_templates_org | CREATE INDEX ON email_templates (org_id) |
| idx_email_templates_name | CREATE UNIQUE INDEX ON email_templates (org_id, name) WHERE deleted_at IS NULL |
| idx_email_templates_category | CREATE INDEX ON email_templates (category) |
| idx_email_templates_active | CREATE INDEX ON email_templates (is_active) WHERE is_active = true |

## Use Cases

1. **Transactional Emails** - Password reset, account verification, booking confirmations
2. **Recruitment Workflows** - Interview invitations, offer letters, rejection notices
3. **Marketing Campaigns** - Product announcements, feature updates, newsletters
4. **System Notifications** - Welcome emails, subscription renewals, payment receipts
5. **Multi-language Support** - Create templates for different locales
6. **A/B Testing** - Maintain multiple versions of templates for testing

## Template Variables

Variables are defined in the `variables` field and replaced at send time:

```json
{
  "firstName": "string",
  "lastName": "string",
  "jobTitle": "string",
  "companyName": "string",
  "interviewDate": "datetime",
  "interviewTime": "time",
  "actionUrl": "url"
}
```

## Example Template

```sql
INSERT INTO email_templates (org_id, name, subject, body_html, category, variables, created_by)
VALUES (
  'org-uuid',
  'interview_invitation',
  'Interview Invitation - {{jobTitle}} at {{companyName}}',
  '<h1>Hi {{firstName}},</h1><p>We would like to invite you to interview for the {{jobTitle}} position...</p>',
  'transactional',
  '{"firstName": "string", "jobTitle": "string", "companyName": "string", "interviewDate": "datetime"}'::jsonb,
  'user-uuid'
);
```

## Template Categories

- **transactional** - Account-related, triggered by user actions
- **marketing** - Promotional, campaigns, newsletters
- **notification** - System alerts, reminders, updates
- **recruiting** - ATS-specific emails (offers, interviews, etc.)
- **academy** - Training-related emails (course enrollment, completion)
