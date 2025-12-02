# email_logs Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `email_logs` |
| Schema | `public` |
| Purpose | Tracks all email delivery attempts with status monitoring, engagement metrics (opens/clicks), and integration with Resend email service. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for email log |
| org_id | uuid | NO | - | Organization ID for multi-tenant isolation |
| template_id | uuid | YES | - | Reference to email template if template was used |
| to_email | text | NO | - | Primary recipient email address |
| cc_email | text[] | YES | - | Array of CC recipient email addresses |
| bcc_email | text[] | YES | - | Array of BCC recipient email addresses |
| subject | text | NO | - | Email subject line |
| status | text | NO | 'pending' | Delivery status (pending, sent, delivered, failed, bounced) |
| resend_id | text | YES | - | Resend service email ID for tracking |
| error_message | text | YES | - | Error message if delivery failed |
| sent_at | timestamp with time zone | YES | - | Timestamp when email was successfully sent |
| opened_at | timestamp with time zone | YES | - | Timestamp when recipient first opened the email |
| clicked_at | timestamp with time zone | YES | - | Timestamp when recipient first clicked a link in the email |
| metadata | jsonb | NO | '{}' | Additional email metadata (variables, context, etc.) |
| created_at | timestamp with time zone | NO | now() | Timestamp when email was queued |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | CASCADE |
| template_id | email_templates.id | SET NULL |

## Indexes

| Index Name | Definition |
|------------|------------|
| email_logs_pkey | CREATE UNIQUE INDEX ON email_logs (id) |
| idx_email_logs_org | CREATE INDEX ON email_logs (org_id) |
| idx_email_logs_status | CREATE INDEX ON email_logs (status) |
| idx_email_logs_created | CREATE INDEX ON email_logs (created_at DESC) |
| idx_email_logs_to_email | CREATE INDEX ON email_logs (to_email) |
| idx_email_logs_resend_id | CREATE INDEX ON email_logs (resend_id) WHERE resend_id IS NOT NULL |

## Use Cases

1. **Email Delivery Monitoring** - Track success/failure rates for email campaigns
2. **Engagement Analytics** - Measure open and click-through rates
3. **Debugging** - Troubleshoot email delivery issues with error messages
4. **Compliance** - Maintain audit trail of all email communications
5. **Resend Integration** - Track emails sent via Resend service
6. **Performance Metrics** - Calculate email delivery SLAs and response times

## Email Status Flow

```
pending → sent → delivered → opened → clicked
                     ↓
                  bounced
                     ↓
                  failed
```

## Example Queries

```sql
-- Get email delivery rate for last 30 days
SELECT
  COUNT(*) FILTER (WHERE status = 'delivered') * 100.0 / COUNT(*) as delivery_rate
FROM email_logs
WHERE created_at > NOW() - INTERVAL '30 days';

-- Get engagement metrics by template
SELECT
  t.name,
  COUNT(*) as sent,
  COUNT(e.opened_at) as opens,
  COUNT(e.clicked_at) as clicks,
  COUNT(e.opened_at) * 100.0 / COUNT(*) as open_rate,
  COUNT(e.clicked_at) * 100.0 / COUNT(*) as click_rate
FROM email_logs e
JOIN email_templates t ON e.template_id = t.id
WHERE e.status = 'delivered'
GROUP BY t.id, t.name;
```
