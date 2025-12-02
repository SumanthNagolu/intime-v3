# notifications Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `notifications` |
| Schema | `public` |
| Purpose | Manages multi-channel user notifications (in-app, email, Slack) with delivery tracking, read receipts, and action links. Supports priority-based routing and archival. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for notification |
| org_id | uuid | NO | - | Organization ID for multi-tenant isolation |
| user_id | uuid | NO | - | ID of the user receiving the notification |
| notification_type | text | NO | - | Type of notification (e.g., 'job_posted', 'candidate_applied', 'interview_scheduled') |
| title | text | NO | - | Notification title/subject line |
| message | text | NO | - | Main notification message body |
| entity_type | text | YES | - | Type of related entity (e.g., 'job', 'candidate', 'interview') |
| entity_id | uuid | YES | - | ID of the related entity |
| channels | text[] | YES | ['in_app'] | Delivery channels (in_app, email, slack) |
| email_sent_at | timestamp with time zone | YES | - | Timestamp when email was successfully sent |
| email_error | text | YES | - | Error message if email delivery failed |
| slack_sent_at | timestamp with time zone | YES | - | Timestamp when Slack message was successfully sent |
| slack_error | text | YES | - | Error message if Slack delivery failed |
| is_read | boolean | YES | false | Whether user has read the notification (in-app only) |
| read_at | timestamp with time zone | YES | - | Timestamp when user marked notification as read |
| is_archived | boolean | YES | false | Whether notification has been archived by user |
| archived_at | timestamp with time zone | YES | - | Timestamp when notification was archived |
| priority | text | YES | 'normal' | Priority level (low, normal, high, urgent) |
| action_url | text | YES | - | URL to navigate to when notification is clicked |
| action_label | text | YES | - | Label for the action button (e.g., 'View Job', 'Review Candidate') |
| created_at | timestamp with time zone | NO | now() | Timestamp when notification was created |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | CASCADE |
| user_id | user_profiles.id | CASCADE |

## Indexes

| Index Name | Definition |
|------------|------------|
| notifications_pkey | CREATE UNIQUE INDEX ON notifications (id) |
| idx_notifications_org | CREATE INDEX ON notifications (org_id) |
| idx_notifications_user | CREATE INDEX ON notifications (user_id) |
| idx_notifications_user_unread | CREATE INDEX ON notifications (user_id, is_read) WHERE NOT is_read AND NOT is_archived |
| idx_notifications_created | CREATE INDEX ON notifications (created_at DESC) |
| idx_notifications_entity | CREATE INDEX ON notifications (entity_type, entity_id) |
| idx_notifications_type | CREATE INDEX ON notifications (notification_type) |

## Use Cases

1. **Real-time In-App Notifications** - Display unread notifications in application header
2. **Email Notifications** - Send transactional emails for important events
3. **Slack Integration** - Push critical notifications to user's Slack workspace
4. **Activity Feed** - Show chronological list of all user notifications
5. **Notification Preferences** - Allow users to configure which channels they want per notification type
6. **Delivery Tracking** - Monitor email/Slack delivery success rates
7. **Action Routing** - Deep link users to relevant screens when clicking notifications

## Common Notification Types

- **Recruiting**: `job_posted`, `candidate_applied`, `interview_scheduled`, `offer_extended`, `candidate_hired`
- **Bench Sales**: `hotlist_generated`, `client_interested`, `consultant_submitted`, `deal_closed`
- **Academy**: `course_enrolled`, `module_completed`, `certificate_earned`, `badge_unlocked`
- **System**: `account_created`, `password_reset`, `role_changed`, `subscription_expiring`

## Example Query

```sql
-- Get unread notifications for a user
SELECT * FROM notifications
WHERE user_id = 'user-uuid'
  AND is_read = false
  AND is_archived = false
ORDER BY created_at DESC
LIMIT 20;
```
