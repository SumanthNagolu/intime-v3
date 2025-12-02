# escalation_notifications Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `escalation_notifications` |
| Schema | `public` |
| Purpose | Tracks delivery of escalation notifications to trainers via email, Slack, and other channels |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the notification |
| escalation_id | uuid | NO | - | Escalation this notification is about |
| notification_type | text | NO | - | Type of notification (email, slack, in_app) |
| recipient_id | uuid | YES | - | User receiving the notification (if applicable) |
| recipient_email | text | YES | - | Email address for email notifications |
| recipient_slack_id | text | YES | - | Slack user ID for Slack notifications |
| sent_at | timestamp with time zone | YES | - | When notification was sent |
| delivered_at | timestamp with time zone | YES | - | When notification was delivered/acknowledged |
| error_message | text | YES | - | Error message if delivery failed |
| created_at | timestamp with time zone | YES | now() | When notification was created |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| escalation_id | ai_mentor_escalations.id | - |
| recipient_id | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| escalation_notifications_pkey | CREATE UNIQUE INDEX escalation_notifications_pkey ON public.escalation_notifications USING btree (id) |
| idx_escalation_notifications_escalation_id | CREATE INDEX idx_escalation_notifications_escalation_id ON public.escalation_notifications USING btree (escalation_id) |
| idx_escalation_notifications_sent_at | CREATE INDEX idx_escalation_notifications_sent_at ON public.escalation_notifications USING btree (sent_at) |

## Usage Notes

- Supports multi-channel notification delivery
- Tracks notification delivery status for reliability monitoring
- Enables retry logic for failed notifications
- Audit trail for escalation communications
