# InTime OS - Glossary of Terms

This document defines all terms used throughout the InTime OS documentation. Understanding these terms is essential for both users and developers.

---

## Core Entities

### Account
A company or organization that is either a client (pays for services) or a prospect (potential client). Accounts can have multiple Contacts, Jobs, and Deals associated with them.

**Related Terms:** Client, Company, Organization
**Table:** `accounts`

### Candidate
A person being considered for job placement. Candidates have resumes, skills, work history, and availability status. They can be sourced, screened, submitted to jobs, and eventually placed.

**Related Terms:** Talent, Applicant, Consultant (when placed)
**Table:** `candidates` (part of `user_profiles` with role flags)

### Contact
A person associated with an Account. Contacts are typically hiring managers, HR representatives, or other points of contact at client companies. 

**Related Terms:** POC (Point of Contact), Client Contact, Hiring Manager
**Table:** `contacts`

### Deal
A potential revenue opportunity with a client. Deals track the sales pipeline from initial conversation to closed-won (contract signed) or closed-lost.

**Related Terms:** Opportunity, Sales Opportunity
**Table:** `deals`

### Job
A position that needs to be filled. Jobs belong to Accounts and have requirements (skills, experience, location) and rates (bill rate, pay rate). Jobs go through a lifecycle: Draft → Active → On Hold → Filled → Closed.

**Related Terms:** Requisition, Position, Opening, Req
**Table:** `jobs`

### Job Order
A confirmed, billable work order from a client. Job Orders are created when a Job becomes official and have specific billing terms, start dates, and contractual requirements.

**Related Terms:** Work Order, PO (Purchase Order), Confirmed Requisition
**Table:** `job_orders`

### Lead
A potential business opportunity that hasn't been qualified yet. Leads can convert to Deals (sales) or Jobs (recruiting needs).

**Related Terms:** Prospect, Inquiry
**Table:** `leads`

### Placement
A successful candidate placement. Created when a candidate accepts an offer and starts working. Placements track start date, end date, rates, and commission.

**Related Terms:** Start, Hire, Filled Position
**Table:** `placements`

### Submission
A candidate submitted to a job. Submissions track the progress of a candidate through the interview process: Submitted → Screening → Interview → Offer → Placed/Rejected.

**Related Terms:** Candidate Submission, Submittal
**Table:** `submissions`

### Campaign
An organized outreach effort to source candidates or generate leads. Campaigns can be email-based, LinkedIn-based, or multi-channel.

**Related Terms:** Outreach Campaign, Sourcing Campaign
**Table:** `campaigns`

---

## RCAI Ownership Model

### RCAI
**R**esponsible, **A**ccountable, **C**onsulted, **I**nformed - A model for defining ownership and involvement on any entity.

### Responsible (R)
The person who does the work. They actively work on the entity (e.g., the recruiter working on filling a job). Responsible parties have **edit** permission.

### Accountable (A)
The person who owns the outcome. There can only be **one** Accountable person per entity. They approve work and are ultimately responsible for success/failure. Accountable parties have **edit** permission.

### Consulted (C)
People whose input is sought. They provide advice or expertise but don't do the primary work. Consulted parties have **view** permission.

### Informed (I)
People who need to be kept updated. They receive notifications about changes but don't actively participate. Informed parties have **view** permission.

**Table:** `object_owners`

---

## Organizational Structure

### Organization (Org)
A company using InTime OS. All data is isolated by organization (multi-tenancy). 

**Table:** `organizations`

### Pod
A team unit consisting of a Manager and Juniors. Pods have performance targets (e.g., 1 placements per 2-week sprint per team memebr) and work as independent contribitors handling end to end on jobs and candidates under the oversight of a a manager. (Manager for us is more like path cleaner / torc bearer .. for example in recruting, every recruiter in himself is a account manger, delivery manager, recriter everything.. we have partners.. partner managers for us is to hadle teams in pods so i can delegate all C and I responsibilities lsowly to managers and COO)

**Related Terms:** Team, Pod Structure
**Table:** `pods`

### User
A person with access to InTime OS. Users have profiles, roles, and belong to organizations.

**Table:** `user_profiles`

---

## User Roles

### Technical Recruiter
An individual contributor (IC) who sources candidates, submits them to jobs, manages the interview process, and closes placements. Primary daily user of the system.

**Permissions:** Full access to Jobs, Candidates, Submissions, Placements they own or are assigned to.

### Bench Sales Recruiter
An IC who markets consultants on the bench (between assignments) to find new job opportunities. Works with external job postings and vendor relationships.

**Permissions:** Full access to Bench Candidates, External Jobs, Vendor accounts.

### Talent Acquisition Recruiter
An IC focused on business development - generating new leads, converting them to deals, and building client relationships.

**Permissions:** Full access to Leads, Deals, Accounts, Campaigns.

### Manager
A supervisor responsible for a Pod or team. Managers have visibility into their team's work and approve certain actions.

**Permissions:** View all items their team owns. Can transfer ownership. Access to Pod metrics.

### Admin
System administrator who configures settings, manages users, and handles permissions.

**Permissions:** Full system access. User management. Settings configuration.

### CEO/Executive
Executive leadership requiring high-level visibility across the organization.

**Permissions:** Read-only access to dashboards and analytics. Informed on major deals.

### HR Manager
HR

**Permissions:** HR related

---

## Workflow States

### Job Statuses
| Status | Description |
|--------|-------------|
| `draft` | Job is being created, not yet visible |
| `active` | Job is open and accepting candidates |
| `on_hold` | Job is paused (client request, budget issue) |
| `filled` | All positions have been filled |
| `cancelled` | Job is cancelled and will not be filled |
| `closed` | Job is complete (filled or cancelled) |

### Candidate Statuses
| Status | Description |
|--------|-------------|
| `new` | Just added to the system |
| `active` | Available and being considered |
| `passive` | Not actively looking but open to opportunities |
| `placed` | Currently on an assignment |
| `on_bench` | Between assignments, available |
| `do_not_use` | Flagged as not to be submitted |
| `inactive` | No longer in candidate pool |

### Submission Statuses
| Status | Description |
|--------|-------------|
| `sourced` | Identified as potential match |
| `screening` | Being evaluated internally |
| `submitted` | Sent to client for review |
| `client_review` | Client is reviewing resume |
| `interview_scheduled` | Interview has been scheduled |
| `interview_completed` | Interview has occurred |
| `offer_pending` | Waiting for offer details |
| `offer_extended` | Offer has been made |
| `offer_accepted` | Candidate accepted offer |
| `offer_declined` | Candidate declined offer |
| `placed` | Candidate has started |
| `rejected` | Rejected at any stage |
| `withdrawn` | Candidate withdrew |

### Lead Statuses
| Status | Description |
|--------|-------------|
| `new` | Just captured, not yet contacted |
| `contacted` | Initial outreach made |
| `qualified` | Confirmed as valid opportunity |
| `unqualified` | Determined to not be a fit |
| `converted` | Converted to Deal or Job |

### Deal Stages
| Stage | Description |
|-------|-------------|
| `discovery` | Initial conversations |
| `proposal` | Proposal/quote submitted |
| `negotiation` | Terms being negotiated |
| `closed_won` | Deal signed |
| `closed_lost` | Deal lost |

---

## Activities & Actions

### Activity
Any logged interaction or task. Activities can be past (email sent, call made) or future (scheduled meeting, task due).

**Types:**
- `email` - Email sent or received
- `call` - Phone call made or received
- `meeting` - In-person or virtual meeting
- `note` - Internal note or comment
- `linkedin_message` - LinkedIn communication
- `task` - To-do item
- `follow_up` - Scheduled follow-up action
- `reminder` - Reminder notification

**Table:** `activities`

### Event
A system event triggered by user actions or system processes. Events are used for logging, analytics, and automation.

**Table:** `events`

---

## Financial Terms

### Bill Rate
The hourly rate charged to the client for a contractor's work.

### Pay Rate
The hourly rate paid to the contractor.

### Margin / Markup
The difference between bill rate and pay rate, representing profit.

**Formula:** `Margin = Bill Rate - Pay Rate`
**Markup %:** `((Bill Rate - Pay Rate) / Pay Rate) × 100`

### Placement Fee
A one-time fee for permanent placements, typically a percentage of annual salary.

---

## Technical Terms

### RLS (Row Level Security)
PostgreSQL security feature that restricts which rows a user can access. Used to enforce multi-tenancy (users only see their organization's data).

### Multi-tenancy
Architecture where a single system serves multiple organizations, with complete data isolation between them.

### tRPC
Type-safe API layer used for frontend-backend communication.

### Drizzle ORM
TypeScript ORM used for database queries and schema definition.

### Supabase
Backend-as-a-service platform providing PostgreSQL database, authentication, and edge functions.

---

## UI/UX Terms

### Command Bar (Cmd+K)
A keyboard-triggered modal for quick search and actions. Access with `Cmd+K` (Mac) or `Ctrl+K` (Windows).

### Split Pane
Layout with a list on the left and detail view on the right. Allows viewing list and details simultaneously.

### Entity 360
A comprehensive detail view showing all information about an entity in one place.

### Toast
A temporary notification message that appears and disappears automatically.

### Modal
A dialog box that overlays the screen, requiring user interaction.

### Sidebar
The left navigation panel showing all available sections and entities.

---

## Business Terms

### Cross-Pollination
The practice of identifying opportunities across different business pillars from a single interaction. For example, a recruiter call might reveal a training need (Academy) or sales opportunity (TA).

**Target:** 5+ opportunities identified per meaningful conversation.

### Pillar
One of the five business lines of InTime:
1. **Training Academy** - Technical training and certification
2. **Recruiting Services** - Direct hire and contract staffing
3. **Bench Sales** - Marketing consultants on the bench
4. **Talent Acquisition** - Business development and sales
5. **Cross-Border** - International staffing

### Sprint
A 2-week work period. Partners have targets measured per sprint (e.g., 1 placements per sprint).

---

## Abbreviations

| Abbreviation | Full Term |
|--------------|-----------|
| ATS | Applicant Tracking System |
| CRM | Customer Relationship Management |
| IC | Individual Contributor |
| JO | Job Order |
| MSA | Master Service Agreement |
| MSP | Managed Service Provider |
| POC | Point of Contact |
| PTO | Paid Time Off |
| RCAI | Responsible, Accountable, Consulted, Informed |
| RLS | Row Level Security |
| SOW | Statement of Work |
| TA | Talent Acquisition |
| VMS | Vendor Management System |

---

*Last Updated: 2024-11-30*


