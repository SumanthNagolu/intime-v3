# engagement_tracking Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `engagement_tracking` |
| Schema | `public` |
| Purpose | Tracks email and campaign engagement events (opens, clicks, bounces) for talent acquisition and marketing campaigns with IP/user agent logging. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for engagement event |
| campaign_contact_id | uuid | NO | - | Reference to the campaign contact (recipient) |
| event_type | text | NO | - | Type of engagement event (opened, clicked, bounced, unsubscribed) |
| event_data | jsonb | YES | - | Additional event-specific data |
| event_timestamp | timestamp with time zone | NO | now() | Timestamp when the engagement event occurred |
| tracking_id | text | YES | - | Unique tracking identifier embedded in email |
| user_agent | text | YES | - | Browser/email client user agent string |
| ip_address | inet | YES | - | IP address from which the engagement occurred |
| clicked_url | text | YES | - | URL that was clicked (for click events) |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| campaign_contact_id | campaign_contacts.id | CASCADE |

## Indexes

| Index Name | Definition |
|------------|------------|
| engagement_tracking_pkey | CREATE UNIQUE INDEX ON engagement_tracking (id) |
| idx_engagement_tracking_contact | CREATE INDEX ON engagement_tracking (campaign_contact_id) |
| idx_engagement_tracking_type | CREATE INDEX ON engagement_tracking (event_type) |
| idx_engagement_tracking_timestamp | CREATE INDEX ON engagement_tracking (event_timestamp DESC) |
| idx_engagement_tracking_tracking_id | CREATE INDEX ON engagement_tracking (tracking_id) WHERE tracking_id IS NOT NULL |

## Use Cases

1. **Email Analytics** - Measure open and click rates for campaigns
2. **Engagement Scoring** - Score candidates/leads based on email engagement
3. **Campaign Optimization** - Identify most engaging content and CTAs
4. **Deliverability Monitoring** - Track bounce rates and spam reports
5. **User Behavior** - Analyze which links get the most clicks
6. **Retargeting** - Follow up with engaged vs non-engaged contacts
7. **Compliance** - Honor unsubscribe requests

## Event Types

- **opened** - Email was opened (tracked via tracking pixel)
- **clicked** - Link in email was clicked
- **bounced** - Email bounced (hard bounce or soft bounce)
- **unsubscribed** - Recipient clicked unsubscribe link
- **spam_reported** - Recipient marked email as spam
- **delivered** - Email was successfully delivered

## Event Data Examples

```json
// Clicked event
{
  "link_text": "View Job Opening",
  "link_position": "header",
  "device_type": "mobile"
}

// Bounced event
{
  "bounce_type": "hard",
  "bounce_reason": "mailbox_does_not_exist"
}

// Opened event
{
  "open_count": 3,
  "device_type": "desktop",
  "email_client": "Gmail"
}
```

## Example Queries

```sql
-- Calculate engagement metrics for a campaign
SELECT
  COUNT(DISTINCT campaign_contact_id) as total_recipients,
  COUNT(DISTINCT campaign_contact_id) FILTER (WHERE event_type = 'opened') as opens,
  COUNT(DISTINCT campaign_contact_id) FILTER (WHERE event_type = 'clicked') as clicks,
  COUNT(*) FILTER (WHERE event_type = 'clicked') as total_clicks,
  COUNT(DISTINCT campaign_contact_id) FILTER (WHERE event_type = 'opened') * 100.0 /
    COUNT(DISTINCT campaign_contact_id) as open_rate,
  COUNT(DISTINCT campaign_contact_id) FILTER (WHERE event_type = 'clicked') * 100.0 /
    COUNT(DISTINCT campaign_contact_id) as click_rate
FROM engagement_tracking et
JOIN campaign_contacts cc ON et.campaign_contact_id = cc.id
WHERE cc.campaign_id = 'campaign-uuid';

-- Get most clicked links
SELECT
  clicked_url,
  COUNT(*) as click_count,
  COUNT(DISTINCT campaign_contact_id) as unique_clicks
FROM engagement_tracking
WHERE event_type = 'clicked'
  AND clicked_url IS NOT NULL
GROUP BY clicked_url
ORDER BY click_count DESC
LIMIT 20;

-- Find highly engaged contacts
SELECT
  cc.contact_id,
  COUNT(DISTINCT CASE WHEN et.event_type = 'opened' THEN et.id END) as opens,
  COUNT(DISTINCT CASE WHEN et.event_type = 'clicked' THEN et.id END) as clicks
FROM campaign_contacts cc
LEFT JOIN engagement_tracking et ON cc.id = et.campaign_contact_id
GROUP BY cc.contact_id
HAVING COUNT(DISTINCT CASE WHEN et.event_type = 'clicked' THEN et.id END) >= 3
ORDER BY clicks DESC;
```
