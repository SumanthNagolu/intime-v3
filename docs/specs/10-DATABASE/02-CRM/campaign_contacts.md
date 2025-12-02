# campaign_contacts Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `campaign_contacts` |
| Schema | `public` |
| Purpose | Contacts associated with TA/HR campaigns |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| campaign_id | uuid | NO | NULL | Reference to campaign |
| contact_type | text | NO | `'candidate'::text` | Contact type |
| user_id | uuid | YES | NULL | Reference to user |
| lead_id | uuid | YES | NULL | Reference to lead |
| first_name | text | YES | NULL | First name |
| last_name | text | YES | NULL | Last name |
| email | text | YES | NULL | Email address |
| linkedin_url | text | YES | NULL | Linkedin url |
| company_name | text | YES | NULL | Company name |
| title | text | YES | NULL | Title |
| status | text | NO | `'pending'::text` | Current status |
| ab_variant | text | YES | NULL | Ab variant |
| template_used_id | uuid | YES | NULL | Reference to template used |
| sent_at | timestamp with time zone | YES | NULL | Sent at |
| opened_at | timestamp with time zone | YES | NULL | Opened at |
| clicked_at | timestamp with time zone | YES | NULL | Clicked at |
| responded_at | timestamp with time zone | YES | NULL | Responded at |
| response_text | text | YES | NULL | Response text |
| converted_at | timestamp with time zone | YES | NULL | Converted at |
| conversion_type | text | YES | NULL | Conversion type |
| conversion_entity_id | uuid | YES | NULL | Reference to conversion entity |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| campaign_id | campaigns.id | campaign_contacts_campaign_id_fkey |
| lead_id | leads.id | campaign_contacts_lead_id_fkey |
| user_id | user_profiles.id | campaign_contacts_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| campaign_contacts_pkey | `CREATE UNIQUE INDEX campaign_contacts_pkey ON public.campaign_contacts USING btree (id)` |
| idx_campaign_contacts_campaign | `CREATE INDEX idx_campaign_contacts_campaign ON public.campaign_contacts USING btree (campaign_id)` |
| idx_campaign_contacts_status | `CREATE INDEX idx_campaign_contacts_status ON public.campaign_contacts USING btree (status)` |
| idx_campaign_contacts_email | `CREATE INDEX idx_campaign_contacts_email ON public.campaign_contacts USING btree (email)` |
| idx_campaign_contacts_user | `CREATE INDEX idx_campaign_contacts_user ON public.campaign_contacts USING btree (user_id)` |
| idx_campaign_contacts_lead | `CREATE INDEX idx_campaign_contacts_lead ON public.campaign_contacts USING btree (lead_id)` |
