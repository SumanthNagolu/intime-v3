# PROMPT: DB-CRM (Window 3)

Copy everything below the line and paste into Claude Code CLI:

---

Use the database skill and crm skill.

Design the complete CRM database schema.

## Read First:
- docs/specs/20-USER-ROLES/03-ta/00-OVERVIEW.md
- docs/specs/20-USER-ROLES/03-ta/05-generate-leads.md
- docs/specs/20-USER-ROLES/03-ta/06-qualify-lead.md
- docs/specs/20-USER-ROLES/01-recruiter/15-prospect-clients.md
- docs/specs/20-USER-ROLES/01-recruiter/16-manage-account.md
- docs/specs/10-DATABASE/00-ERD.md (Entity relationships - CRITICAL)
- docs/specs/10-DATABASE/03-accounts.md (Full accounts table spec)
- docs/specs/10-DATABASE/04-contacts.md (Contacts table spec)
- docs/specs/10-DATABASE/05-leads.md (Full leads table spec)
- docs/specs/10-DATABASE/06-deals.md (Deals table spec)
- docs/specs/10-DATABASE/10-campaigns.md (Campaigns table spec)
- src/lib/db/schema/crm.ts

## Create/Update src/lib/db/schema/crm.ts:

### ACCOUNTS
- `accounts` - name, legal_name, industry, website, tier (strategic/growth/standard), status (prospect/active/inactive/churned), health_score (0-100), annual_revenue, employee_count, founded_year, description
- `account_addresses` - account_id, type (hq/billing/office), street, city, state, country, postal_code, is_primary
- `account_contacts` - account_id, contact_id, is_primary, relationship_type
- `account_contracts` - account_id, contract_type (msa/sow/nda), status, start_date, end_date, value, terms (jsonb), document_url
- `account_preferences` - account_id, preferred_skills (array), preferred_visa_types (array), rate_range_min, rate_range_max, work_mode_preference, interview_process_notes
- `account_metrics` - account_id, period (monthly), total_placements, active_placements, total_revenue, avg_ttf_days, submission_to_interview_rate, interview_to_offer_rate
- `account_team` - account_id, user_id, role (owner/secondary/support), assigned_at

### CONTACTS
- `contacts` - first_name, last_name, email, phone, mobile, title, department, linkedin_url, status (active/inactive), notes
- `contact_preferences` - contact_id, preferred_contact_method (email/phone/linkedin), best_time_to_call, timezone, communication_frequency

### LEADS
- `leads` - source (inbound/outbound/referral/event/marketing), status (new/contacted/qualifying/qualified/converted/disqualified), company_name, company_website, company_industry, company_size, contact_name, contact_title, contact_email, contact_phone, notes, assigned_to, converted_at, converted_to_account_id
- `lead_scores` - lead_id, score (0-100), factors (jsonb: budget, authority, need, timeline), calculated_at
- `lead_qualification` - lead_id, has_budget, budget_amount, decision_maker, need_identified, timeline, pain_points, qualified_by, qualified_at
- `lead_touchpoints` - lead_id, type (call/email/meeting/linkedin), direction (inbound/outbound), subject, notes, outcome, next_steps, created_by, created_at

### DEALS
- `deals` - lead_id, account_id, name, stage (discovery/proposal/negotiation/closed_won/closed_lost), deal_type (new_business/expansion/renewal), value, probability (0-100), expected_close_date, actual_close_date, loss_reason, notes, owner_id
- `deal_stages_history` - deal_id, stage, entered_at, exited_at, duration_days
- `deal_stakeholders` - deal_id, contact_id, role (decision_maker/influencer/champion/blocker), influence_level (high/medium/low)
- `deal_competitors` - deal_id, competitor_name, strengths, weaknesses, our_differentiators, status (active/won_against/lost_to)
- `deal_products` - deal_id, product_type (staffing/training/consulting), quantity, unit_price, total_value

### CAMPAIGNS
- `campaigns` - name, type (email/linkedin/event/webinar/content), status (draft/scheduled/active/paused/completed), target_audience, start_date, end_date, budget, description
- `campaign_targets` - campaign_id, target_type (lead/contact/account), target_id, status (pending/sent/opened/clicked/converted)
- `campaign_content` - campaign_id, content_type (email/landing_page/asset), subject, body, asset_url, version
- `campaign_metrics` - campaign_id, impressions, clicks, opens, conversions, cost_per_conversion, roi

### ACTIVITIES (CRM)
- `crm_activities` - entity_type (account/contact/lead/deal), entity_id, activity_type (call/email/meeting/note/task), subject, description, outcome, next_steps, scheduled_at, completed_at, assigned_to, created_by

## Requirements:
- Implement account health score calculation logic
- Add lead scoring factors
- Create pipeline stage configuration
- Proper indexes for queries
- Export types

## After Schema:
Generate migration: npx drizzle-kit generate. 

Use multi-agents to parallelize table creation. Analyze what we have, think hard and complete
