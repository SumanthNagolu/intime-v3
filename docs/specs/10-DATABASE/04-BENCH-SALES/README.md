# BENCH-SALES Domain Database Documentation

## Overview
This directory contains comprehensive documentation for all database tables in the BENCH-SALES domain of InTime v3. The bench sales module manages consultants on the bench, marketing activities, vendor relationships, and external job order processing.

## Table Categories

### 1. Consultant Management (5 tables)
Core tables for managing bench consultants and their details:
- **bench_consultants.md** - Main consultant tracking with status, rates, and assignments
- **consultant_availability.md** - Detailed availability with blackout dates and restrictions
- **consultant_rates.md** - Historical rate tracking with effective date ranges
- **consultant_visa_details.md** - Visa information with alert levels and expiry tracking
- **consultant_work_authorization.md** - Work authorization documents and verification

### 2. Marketing Management (5 tables)
Marketing profile and activity tracking:
- **marketing_profiles.md** - Core marketing profiles with headlines and highlights
- **marketing_formats.md** - Different format versions (resume, one-pager, etc.)
- **marketing_templates.md** - Organization-level templates with placeholders
- **marketing_activities.md** - Marketing outreach tracking with responses
- **hotlists.md** - Curated consultant lists for targeted marketing

### 3. Hotlist Management (1 table)
Junction table for hotlist functionality:
- **hotlist_consultants.md** - Links consultants to hotlists with ordering

### 4. Vendor Management (7 tables)
Complete vendor relationship management:
- **vendors.md** - Core vendor information with tier and industry focus
- **vendor_contacts.md** - Vendor contact persons
- **vendor_terms.md** - Business terms, payment, and markup agreements
- **vendor_performance.md** - Performance metrics over time
- **vendor_relationships.md** - Polymorphic relationships to other entities
- **vendor_blacklist.md** - Blacklisted vendors with reasons

### 5. External Job Orders (5 tables)
Job order processing from external sources:
- **external_job_orders.md** - Main job order tracking with rates and deadlines
- **external_job_order_notes.md** - Collaboration notes on job orders
- **external_job_order_requirements.md** - Structured requirements with priorities
- **external_job_order_skills.md** - Skill requirements with proficiency levels
- **external_job_order_submissions.md** - Consultant submissions to job orders

## Key Relationships

### Consultant Flow
```
bench_consultants (core)
  ├─> consultant_availability (1:1)
  ├─> consultant_rates (1:many)
  ├─> consultant_visa_details (1:many)
  ├─> consultant_work_authorization (1:many)
  ├─> marketing_profiles (1:many)
  ├─> marketing_activities (1:many)
  ├─> hotlist_consultants (many:many via hotlists)
  └─> external_job_order_submissions (1:many)
```

### Marketing Flow
```
marketing_profiles
  └─> marketing_formats (1:many versions)

hotlists
  └─> hotlist_consultants (many consultants)
      └─> bench_consultants
```

### Vendor Flow
```
vendors (core)
  ├─> vendor_contacts (1:many)
  ├─> vendor_terms (1:1)
  ├─> vendor_performance (1:many periods)
  ├─> vendor_relationships (1:many)
  ├─> vendor_blacklist (1:1 if blacklisted)
  └─> external_job_orders (1:many)
```

### Job Order Flow
```
external_job_orders (core)
  ├─> external_job_order_notes (1:many)
  ├─> external_job_order_requirements (1:many)
  ├─> external_job_order_skills (1:many)
  └─> external_job_order_submissions (many consultants)
      └─> bench_consultants
```

## Database Enums Used

The following custom PostgreSQL enum types are used across these tables:
- **bench_status** - Consultant bench status
- **marketing_status** - Marketing material status (draft/active/archived)
- **visa_type** - Types of work visas
- **visa_alert_level** - Visa expiry alerts (green/yellow/red)
- **vendor_type** - Types of vendors
- **vendor_tier** - Vendor tier levels (preferred/standard/etc.)
- **job_order_status** - External job order status
- **job_order_priority** - Priority levels (low/medium/high/urgent)
- **job_order_source** - Source of job order (email/phone/portal)

## Common Patterns

### Multi-tenancy
All tables include `org_id` for organization-level data isolation.

### Soft Deletes
Main entity tables include `deleted_at` for soft deletion:
- bench_consultants
- vendors
- external_job_orders

### Audit Tracking
Most tables include:
- `created_at` - Record creation timestamp
- `updated_at` - Last modification timestamp
- `created_by` - User who created the record

### Versioning
Some tables support versioning:
- consultant_rates (effective date ranges)
- marketing_profiles (version numbers)
- marketing_formats (version numbers)
- vendor_performance (time periods)

## Total Tables: 23

This documentation was generated from the live PostgreSQL database schema on 2025-12-01.
