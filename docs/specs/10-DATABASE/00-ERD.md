# Entity Relationship Diagram (ERD)

## Overview

This document describes the complete data model for InTime OS, including all entities, their relationships, and cardinalities.

---

## Entity Categories

### Core Business Entities
1. **Organizations** - Multi-tenant isolation
2. **Accounts** - Client companies
3. **Contacts** - People at client companies
4. **Jobs** - Job requisitions
5. **Candidates** (via User Profiles) - Talent pool
6. **Submissions** - Candidate-Job applications
7. **Interviews** - Interview schedules
8. **Offers** - Job offers
9. **Placements** - Successful hires

### CRM Entities
10. **Leads** - Sales opportunities
11. **Deals** - Qualified opportunities
12. **Campaigns** - Outreach campaigns

### Operational Entities
13. **Job Orders** - Confirmed client orders
14. **Activities** - All logged interactions
15. **Object Owners** - RCAI ownership

### System Entities
16. **User Profiles** - System users
17. **Pods** - Team structure
18. **Skills** - Skills taxonomy

---

## Entity Relationship Diagram (ASCII)

```
                                    ┌─────────────────┐
                                    │  Organizations  │
                                    │     (Tenant)    │
                                    └────────┬────────┘
                                             │ 1
                                             │
              ┌──────────────────────────────┼──────────────────────────────┐
              │                              │                              │
              ▼ *                            ▼ *                            ▼ *
     ┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
     │   User Profiles │◄───────────│      Pods       │            │    Accounts     │
     │   (Candidates,  │     *   1  │   (Teams)       │            │   (Clients)     │
     │    Employees)   │            └─────────────────┘            └────────┬────────┘
     └────────┬────────┘                                                    │ 1
              │                                                             │
              │ 1                                                           │
              │                                  ┌──────────────────────────┤
              │                                  │                          │
              ▼ *                                ▼ *                        ▼ *
     ┌─────────────────┐                ┌─────────────────┐        ┌─────────────────┐
     │  Object Owners  │                │    Contacts     │        │      Leads      │
     │  (RCAI Matrix)  │                │   (POCs)        │        │                 │
     └─────────────────┘                └─────────────────┘        └────────┬────────┘
                                                                            │
                                                                            ▼ 1
                                                                   ┌─────────────────┐
                                                                   │     Deals       │
                                                                   │                 │
                                                                   └─────────────────┘


     ┌─────────────────┐                ┌─────────────────┐
     │    Accounts     │ 1          * │      Jobs       │
     │                 │◄──────────────│                 │
     └─────────────────┘               └────────┬────────┘
                                                │ 1
                                                │
                          ┌─────────────────────┼─────────────────────┐
                          │                     │                     │
                          ▼ *                   ▼ *                   ▼ *
                 ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
                 │   Submissions   │   │   Job Orders    │   │   Placements    │
                 │                 │   │                 │   │                 │
                 └────────┬────────┘   └─────────────────┘   └─────────────────┘
                          │ 1
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼ *         ▼ *         ▼ 1
     ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
     │  Interviews │ │   Offers    │ │  Candidates │
     │             │ │             │ │(UserProfile)│
     └─────────────┘ └─────────────┘ └─────────────┘


     ┌─────────────────┐                ┌─────────────────┐
     │   Activities    │ *          1 │  Any Entity     │
     │   (Polymorphic) │──────────────▶│  (Jobs, Leads,  │
     └─────────────────┘               │   Candidates)   │
                                       └─────────────────┘
```

---

## Detailed Relationships

### Organizations (Tenant Root)

| Relationship | Target Entity | Cardinality | Description |
|--------------|---------------|-------------|-------------|
| has many | User Profiles | 1:* | Users belong to one org |
| has many | Accounts | 1:* | All client accounts |
| has many | Jobs | 1:* | All job requisitions |
| has many | Leads | 1:* | All leads |
| has many | Deals | 1:* | All deals |
| has many | Submissions | 1:* | All submissions |
| has many | Pods | 1:* | Team structures |

---

### User Profiles

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| belongs to | Pods | *:1 | `pod_id` | Team membership |
| has many | Jobs (owned) | 1:* | `jobs.owner_id` | Jobs user owns |
| has many | Submissions (owned) | 1:* | `submissions.owner_id` | Submissions created |
| has many | Object Owners | 1:* | `object_owners.user_id` | RCAI assignments |
| has many | Activities (assigned) | 1:* | `activities.assigned_to` | Tasks assigned |
| has many | Candidate Skills | 1:* | `candidate_skills.candidate_id` | Skills (if candidate) |
| has many | Candidate Resumes | 1:* | `candidate_resumes.candidate_id` | Resumes (if candidate) |
| has many | Candidate Education | 1:* | `candidate_education.candidate_id` | Education history |
| has many | Candidate Work History | 1:* | `candidate_work_history.candidate_id` | Employment history |
| has many | Work Authorizations | 1:* | `candidate_work_authorizations.candidate_id` | Visa status |

---

### Accounts

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| has many | Contacts | 1:* | `contacts.company_id` | POCs at this company |
| has many | Jobs | 1:* | `jobs.account_id` | Jobs from this client |
| has many | Leads | 1:* | `leads.account_id` | Leads for this company |
| has many | Deals | 1:* | `deals.account_id` | Deals with this client |
| has many | Placements | 1:* | `placements.account_id` | Placements at this client |
| has many | Job Orders | 1:* | `job_orders.account_id` | Confirmed orders |
| has one | Account Manager | *:1 | `account_manager_id` | Primary relationship owner |

---

### Contacts

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| belongs to | Accounts | *:1 | `company_id` | Company affiliation |
| has many | Jobs (as contact) | 1:* | `job_orders.client_contact_id` | Jobs they're contact for |
| has one | User Profile | 1:1 | `user_profile_id` | If contact is also user |
| has one | Owner | *:1 | `owner_id` | Assigned recruiter |

---

### Jobs

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| belongs to | Accounts | *:1 | `account_id` | Client company |
| belongs to | Deals | *:1 | `deal_id` | Originating deal (optional) |
| has one | Owner | *:1 | `owner_id` | Primary recruiter |
| has many | Submissions | 1:* | `submissions.job_id` | Candidates submitted |
| has many | Interviews | 1:* | `interviews.job_id` | All interviews for this job |
| has many | Offers | 1:* | `offers.job_id` | All offers for this job |
| has many | Placements | 1:* | `placements.job_id` | Successful placements |
| has many | Object Owners | 1:* | Polymorphic | RCAI assignments |

---

### Submissions

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| belongs to | Jobs | *:1 | `job_id` | Job applied to |
| belongs to | User Profiles (Candidate) | *:1 | `candidate_id` | Candidate submitted |
| belongs to | Accounts | *:1 | `account_id` | Client (denormalized) |
| has one | Owner | *:1 | `owner_id` | Recruiter managing |
| has many | Interviews | 1:* | `interviews.submission_id` | Interviews scheduled |
| has many | Offers | 1:* | `offers.submission_id` | Offers made |
| has one | Placement | 1:1 | `placements.submission_id` | If placed |

**Unique Constraint:** `(job_id, candidate_id)` - One submission per candidate per job

---

### Interviews

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| belongs to | Submissions | *:1 | `submission_id` | Parent submission |
| belongs to | Jobs | *:1 | `job_id` | Job (denormalized) |
| belongs to | User Profiles (Candidate) | *:1 | `candidate_id` | Candidate (denormalized) |
| has one | Scheduler | *:1 | `scheduled_by` | Who scheduled |

---

### Offers

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| belongs to | Submissions | *:1 | `submission_id` | Parent submission |
| belongs to | Jobs | *:1 | `job_id` | Job (denormalized) |
| belongs to | User Profiles (Candidate) | *:1 | `candidate_id` | Candidate (denormalized) |
| has one | Placement | 1:1 | `placements.offer_id` | If accepted |

---

### Placements

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| belongs to | Submissions | *:1 | `submission_id` | Originating submission |
| belongs to | Offers | *:1 | `offer_id` | Accepted offer (optional) |
| belongs to | Jobs | *:1 | `job_id` | Job filled |
| belongs to | User Profiles (Candidate) | *:1 | `candidate_id` | Placed candidate |
| belongs to | Accounts | *:1 | `account_id` | Client |
| has one | Recruiter | *:1 | `recruiter_id` | Credited recruiter |
| has one | Account Manager | *:1 | `account_manager_id` | AM credited |

---

### Leads

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| belongs to | Accounts | *:1 | `account_id` | Associated company (optional) |
| has one | Owner | *:1 | `owner_id` | Assigned TA specialist |
| has one | Deal | 1:1 | `deals.lead_id` | If converted |

---

### Deals

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| belongs to | Accounts | *:1 | `account_id` | Client company |
| belongs to | Leads | *:1 | `lead_id` | Originating lead (optional) |
| has one | Owner | *:1 | `owner_id` | Assigned salesperson |
| has many | Jobs | 1:* | `jobs.deal_id` | Jobs from this deal |

---

### Activities (Polymorphic)

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| belongs to | Any Entity | *:1 | `entity_type`, `entity_id` | Polymorphic reference |
| has one | Assigned To | *:1 | `assigned_to` | Who's responsible |
| has one | Performed By | *:1 | `performed_by` | Who did it |
| has one | Parent Activity | *:1 | `parent_activity_id` | For follow-up chains |

**Polymorphic Values for `entity_type`:**
- `lead`, `deal`, `account`, `candidate`, `submission`, `job`, `contact`, `placement`

---

### Object Owners (RCAI - Polymorphic)

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| belongs to | Any Entity | *:1 | `entity_type`, `entity_id` | Polymorphic reference |
| belongs to | User Profiles | *:1 | `user_id` | Assigned user |

**Unique Constraint:** `(entity_type, entity_id, user_id)` - One role per user per entity

---

### Job Orders

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| belongs to | Accounts | *:1 | `account_id` | Paying client |
| belongs to | Jobs | *:1 | `source_job_id` | Source requisition (optional) |
| belongs to | Contacts | *:1 | `client_contact_id` | Client POC |
| has one | Accountable | *:1 | `accountable_id` | Primary owner |

---

### Pods

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| has one | Manager | *:1 | `manager_id` | Pod manager |
| has many | Members | 1:* | `user_profiles.pod_id` | Team members |

---

### Campaigns

| Relationship | Target Entity | Cardinality | FK Column | Description |
|--------------|---------------|-------------|-----------|-------------|
| belongs to | Organizations | *:1 | `org_id` | Tenant isolation |
| has one | Owner | *:1 | `owner_id` | Campaign owner |
| has many | Campaign Contacts | 1:* | `campaign_contacts.campaign_id` | Outreach recipients |

---

## Cardinality Legend

| Symbol | Meaning |
|--------|---------|
| 1 | Exactly one |
| * | Zero or more |
| 1:1 | One-to-one |
| 1:* | One-to-many |
| *:1 | Many-to-one |
| *:* | Many-to-many |

---

## Multi-Tenancy Pattern

All entities (except global reference tables like `skills`) include:

```sql
org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
```

With RLS policy:

```sql
CREATE POLICY "org_isolation" ON [table_name]
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
```

---

## Soft Delete Pattern

Most entities include:

```sql
deleted_at TIMESTAMPTZ DEFAULT NULL
```

Queries filter: `WHERE deleted_at IS NULL`

---

## Audit Trail Pattern

Most entities include:

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
created_by UUID REFERENCES user_profiles(id)
updated_by UUID REFERENCES user_profiles(id)
```

---

*Last Updated: 2024-11-30*


