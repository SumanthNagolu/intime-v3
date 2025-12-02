# CRM Database Documentation

This directory contains detailed documentation for all CRM (Customer Relationship Management) domain tables in InTime v3.

## Overview

The CRM module manages client relationships, sales pipeline, marketing campaigns, and business development activities. It includes 25 tables organized into the following categories:

### Account Management (7 tables)
- **accounts** - Core accounts/clients table storing company/client information
- **account_addresses** - Physical addresses for accounts (HQ, billing, office, shipping)
- **account_contracts** - Contracts associated with accounts (MSA, SOW, NDA, etc.)
- **account_metrics** - Monthly performance metrics for accounts
- **account_preferences** - Account hiring/staffing preferences and requirements
- **account_team** - Team members assigned to accounts (RCAI assignments)
- **contacts** - Universal contacts table (client POCs, vendors, partners)

### Lead Management (6 tables)
- **leads** - Sales leads (companies and individuals) in the pipeline
- **lead_qualification** - BANT qualification details for leads
- **lead_scores** - Detailed scoring factors and metrics for leads
- **lead_strategies** - Sales strategies and approaches for leads
- **lead_tasks** - Tasks and action items related to leads
- **lead_touchpoints** - Outreach tracking and communication history

### Deal Management (5 tables)
- **deals** - Sales opportunities and deals in the pipeline
- **deal_competitors** - Competitive analysis for deals
- **deal_products** - Products/services associated with deals
- **deal_stages_history** - Historical tracking of deal stage transitions
- **deal_stakeholders** - Key stakeholders involved in deals

### Campaign Management (5 tables)
- **crm_campaigns** - Marketing/outreach campaigns for sales
- **crm_campaign_content** - Email templates, landing pages, and assets
- **crm_campaign_metrics** - Performance metrics and analytics
- **crm_campaign_targets** - Target contacts/leads with engagement tracking
- **campaigns** - TA/HR campaigns (recruitment/talent acquisition)
- **campaign_contacts** - Contacts associated with TA/HR campaigns

### Activity Tracking (1 table)
- **crm_activities** - Unified activity log for CRM entities (calls, emails, meetings, tasks)

## Key Features

### Multi-Tenancy
All tables include `org_id` for tenant isolation, ensuring data segregation across organizations.

### Soft Deletes
Most tables support soft deletion via `deleted_at` timestamp, allowing recovery of deleted records.

### Audit Trail
Common audit fields across tables:
- `created_at` / `updated_at` - Timestamps
- `created_by` / `updated_by` - User references

### Search Optimization
Key tables include `search_vector` (tsvector) for full-text search capabilities:
- accounts
- leads
- contacts

### BANT Qualification
Lead qualification follows the BANT framework:
- **B**udget (0-25 points)
- **A**uthority (0-25 points)
- **N**eed (0-25 points)
- **T**imeline (0-25 points)
- Total Score: 0-100

### Health Scoring
Account health scoring (0-100) tracks:
- Engagement metrics
- Revenue performance
- Response rates
- Contract status

## Relationships

### Core Hierarchies
```
Organization
  └── Accounts
       ├── Addresses
       ├── Contracts
       ├── Metrics
       ├── Preferences
       ├── Team Members
       ├── Contacts
       ├── Leads
       │    ├── Scores
       │    ├── Qualification
       │    ├── Touchpoints
       │    ├── Tasks
       │    └── Strategies
       └── Deals
            ├── Stakeholders
            ├── Products
            ├── Competitors
            └── Stage History

Campaigns
  ├── Targets
  ├── Content
  └── Metrics

Activities (polymorphic)
  └── Links to: Accounts, Contacts, Leads, Deals, Campaigns
```

## Common Patterns

### Status Fields
- **Accounts**: prospect, active, inactive, churned
- **Leads**: new, warm, hot, cold, converted, lost
- **Deals**: discovery, qualification, proposal, negotiation, closed_won, closed_lost
- **Campaigns**: draft, scheduled, active, paused, completed, cancelled

### Tier Classifications
- **Accounts**: strategic, growth, standard
- **Leads**: enterprise, mid_market, smb, strategic

### Company Types
- direct_client
- implementation_partner
- msp_vms
- system_integrator

## Documentation Files

All 25 tables are documented with:
- Column definitions (name, type, nullable, default, description)
- Foreign key relationships
- Index definitions
- Table purpose and context

## Related Resources

- Schema Definition: `/src/lib/db/schema/crm.ts`
- tRPC Routers: `/src/server/routers/crm.ts`
- Components: `/src/components/crm/`
- Skills: `.claude/skills/crm/SKILL.md`

## Generated

Documentation generated on: December 1, 2025
Total tables documented: 25
