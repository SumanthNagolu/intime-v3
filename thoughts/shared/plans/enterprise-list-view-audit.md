# Enterprise List View Audit Plan

## Overview

This document provides detailed specifications for upgrading all list views in InTime to enterprise-grade standards. Each entity is analyzed separately with specific requirements for stats, columns, filters, and sorting.

## Enterprise UI Standards

### Data Density Principles
- **Show, don't hide**: Enterprise users need information density, not simplification
- **Scannable rows**: Users should identify records without clicking into them
- **Contextual data**: Show related entity info inline (e.g., Account name on Contact row)
- **Status visibility**: Always show status with color-coded badges
- **Temporal context**: Show created/updated dates, use relative dates for recent items

### Table Design Standards
- **Minimum columns**: 8-12 columns for primary entities
- **Column priorities**: Name/Title > Status > Key Metrics > Owner > Dates
- **Alignment**: Left for text, Right for numbers/currency, Center for status badges
- **Sorting**: Enable on all data columns (not computed/rendered columns)
- **Fixed columns**: Name column should have min-width to prevent truncation

### Stats Card Standards
- **Count**: 4-5 cards maximum
- **Types**: Total count, Status breakdown, Key KPI, Trend/Rate
- **Real data**: Always connect to database aggregates, never mock
- **Format**: Use proper number formatting (1,234 not 1234)

### Filter Standards
- **Always include**: Search, Status, Owner/Assigned
- **Entity-specific**: Type, Category, Date ranges
- **URL sync**: All filters persist in URL for shareability

---

## Core CRM Entities

### 1. Campaigns (COMPLETED)

**URL**: `/employee/crm/campaigns`

**Status**: ✅ Completed

**Reference implementation** for other entities.

---

### 2. Leads

**URL**: `/employee/crm/leads`

**Business Context**: Leads are potential business opportunities captured from various sources. Critical for sales pipeline and revenue forecasting.

#### Stats Cards (4)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Leads | `COUNT(*)` | Users |
| `newThisWeek` | New This Week | `COUNT(*) WHERE created_at > NOW() - 7 days` | TrendingUp |
| `qualified` | Qualified | `COUNT(*) WHERE status = 'qualified'` | CheckCircle |
| `conversionRate` | MQL→SQL Rate | `(qualified / total) * 100` | Target |

#### Columns (12)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `name` | Lead Name | ✓ | min-w-[180px] | left | text |
| `company` | Company | ✓ | w-[150px] | left | text |
| `email` | Email | ✗ | w-[180px] | left | text |
| `phone` | Phone | ✗ | w-[120px] | left | text |
| `source` | Source | ✓ | w-[120px] | left | badge |
| `status` | Status | ✓ | w-[100px] | left | status |
| `score` | Score | ✓ | w-[80px] | right | number |
| `campaign` | Campaign | ✓ | w-[140px] | left | link |
| `assignedTo` | Assigned To | ✓ | w-[130px] | left | avatar+name |
| `lastActivity` | Last Activity | ✓ | w-[110px] | left | relative-date |
| `createdAt` | Created | ✓ | w-[100px] | left | relative-date |

#### Filters (6)
| Key | Type | Options |
|-----|------|---------|
| `search` | search | - |
| `status` | select | New, Contacted, Qualified, Unqualified, Converted, Lost |
| `source` | select | Website, Referral, Campaign, Cold Outreach, Event, Other |
| `assignedTo` | select | (dynamic user list) |
| `campaign` | select | (dynamic campaign list) |
| `scoreRange` | range | 0-100 |

#### Sort Field Mapping
```typescript
const sortFieldMap = {
  name: 'name',
  company: 'company_name',
  source: 'source',
  status: 'status',
  score: 'lead_score',
  campaign: 'campaign_id',
  assignedTo: 'assigned_to',
  lastActivity: 'last_activity_at',
  createdAt: 'created_at',
}
```

#### tRPC Procedures Needed
- `crm.leads.list` - with filters, pagination, sorting
- `crm.leads.stats` - aggregate metrics

---

### 3. Deals

**URL**: `/employee/crm/deals`

**Business Context**: Deals represent qualified opportunities with estimated value. Critical for pipeline management and revenue forecasting.

#### Stats Cards (5)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Deals | `COUNT(*)` | Briefcase |
| `pipelineValue` | Pipeline Value | `SUM(value) WHERE status NOT IN ('won', 'lost')` | DollarSign |
| `wonThisMonth` | Won This Month | `COUNT(*) WHERE status = 'won' AND closed_at > start_of_month` | Trophy |
| `winRate` | Win Rate | `(won / (won + lost)) * 100` | TrendingUp |
| `avgDealSize` | Avg Deal Size | `AVG(value) WHERE status = 'won'` | BarChart |

#### Columns (12)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `name` | Deal Name | ✓ | min-w-[200px] | left | text |
| `account` | Account | ✓ | w-[150px] | left | link |
| `contact` | Contact | ✗ | w-[130px] | left | text |
| `stage` | Stage | ✓ | w-[120px] | left | status |
| `value` | Value | ✓ | w-[100px] | right | currency |
| `probability` | Prob. | ✓ | w-[70px] | right | percent |
| `weightedValue` | Weighted | ✗ | w-[100px] | right | currency |
| `expectedClose` | Expected Close | ✓ | w-[110px] | left | date |
| `owner` | Owner | ✓ | w-[130px] | left | avatar+name |
| `lastActivity` | Last Activity | ✓ | w-[110px] | left | relative-date |
| `daysInStage` | Days in Stage | ✗ | w-[80px] | right | number |
| `createdAt` | Created | ✓ | w-[100px] | left | relative-date |

#### Filters (6)
| Key | Type | Options |
|-----|------|---------|
| `search` | search | - |
| `stage` | select | Discovery, Qualification, Proposal, Negotiation, Closed Won, Closed Lost |
| `owner` | select | (dynamic user list) |
| `account` | select | (dynamic account list) |
| `valueRange` | range | 0-1000000 |
| `expectedCloseRange` | date-range | - |

#### Sort Field Mapping
```typescript
const sortFieldMap = {
  name: 'name',
  account: 'account_id',
  stage: 'stage',
  value: 'value',
  probability: 'probability',
  expectedClose: 'expected_close_date',
  owner: 'owner_id',
  lastActivity: 'last_activity_at',
  createdAt: 'created_at',
}
```

---

## Recruiting Entities

### 4. Accounts

**URL**: `/employee/recruiting/accounts`

**Business Context**: Client companies that hire through the staffing platform. Primary revenue generators.

#### Stats Cards (5)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Accounts | `COUNT(*)` | Building2 |
| `activeClients` | Active Clients | `COUNT(*) WHERE status = 'active'` | CheckCircle |
| `prospects` | Prospects | `COUNT(*) WHERE status = 'prospect'` | Target |
| `jobsThisQuarter` | Jobs This Quarter | `COUNT(jobs) WHERE created_at > start_of_quarter` | Briefcase |
| `placementsYTD` | Placements YTD | `COUNT(placements) WHERE placed_at > start_of_year` | UserCheck |

#### Columns (12)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `name` | Company Name | ✓ | min-w-[200px] | left | text |
| `industry` | Industry | ✓ | w-[130px] | left | text |
| `type` | Type | ✓ | w-[100px] | left | badge |
| `status` | Status | ✓ | w-[100px] | left | status |
| `location` | Location | ✗ | w-[140px] | left | text |
| `jobsCount` | Jobs | ✓ | w-[70px] | right | number |
| `contactsCount` | Contacts | ✗ | w-[80px] | right | number |
| `placementsCount` | Placements | ✓ | w-[90px] | right | number |
| `owner` | Owner | ✓ | w-[130px] | left | avatar+name |
| `lastContact` | Last Contact | ✓ | w-[110px] | left | relative-date |
| `createdAt` | Created | ✓ | w-[100px] | left | relative-date |

#### Filters (5)
| Key | Type | Options |
|-----|------|---------|
| `search` | search | - |
| `status` | select | Active, Inactive, Prospect, On Hold |
| `type` | select | Enterprise, Mid-Market, SMB, Startup |
| `industry` | select | Technology, Healthcare, Finance, Manufacturing, Retail, Other |
| `owner` | select | (dynamic user list) |

---

### 5. Contacts

**URL**: `/employee/recruiting/contacts`

**Business Context**: Individual people at client accounts - hiring managers, HR, executives.

#### Stats Cards (4)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Contacts | `COUNT(*)` | Users |
| `active` | Active | `COUNT(*) WHERE status = 'active'` | UserCheck |
| `decisionMakers` | Decision Makers | `COUNT(*) WHERE is_decision_maker = true` | Crown |
| `recentlyContacted` | Recently Contacted | `COUNT(*) WHERE last_contact_at > NOW() - 30 days` | MessageCircle |

#### Columns (11)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `name` | Name | ✓ | min-w-[180px] | left | text |
| `title` | Title | ✓ | w-[150px] | left | text |
| `account` | Account | ✓ | w-[150px] | left | link |
| `email` | Email | ✗ | w-[180px] | left | text |
| `phone` | Phone | ✗ | w-[120px] | left | text |
| `type` | Type | ✓ | w-[110px] | left | badge |
| `status` | Status | ✓ | w-[90px] | left | status |
| `isDecisionMaker` | DM | ✗ | w-[50px] | center | boolean |
| `lastContact` | Last Contact | ✓ | w-[110px] | left | relative-date |
| `owner` | Owner | ✓ | w-[130px] | left | avatar+name |
| `createdAt` | Created | ✓ | w-[100px] | left | relative-date |

#### Filters (5)
| Key | Type | Options |
|-----|------|---------|
| `search` | search | - |
| `status` | select | Active, Inactive, Left Company |
| `type` | select | Hiring Manager, HR, Executive, Technical Lead, Procurement |
| `account` | select | (dynamic account list) |
| `owner` | select | (dynamic user list) |

---

### 6. Jobs

**URL**: `/employee/recruiting/jobs`

**Business Context**: Job requisitions from clients. Primary workflow driver for recruiters.

#### Stats Cards (5)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Jobs | `COUNT(*)` | Briefcase |
| `active` | Active | `COUNT(*) WHERE status = 'active'` | Play |
| `filledThisMonth` | Filled This Month | `COUNT(*) WHERE status = 'filled' AND filled_at > start_of_month` | CheckCircle |
| `avgTimeToFill` | Avg Time to Fill | `AVG(filled_at - created_at) WHERE status = 'filled'` | Clock |
| `avgSubmissions` | Avg Submissions | `AVG(submissions_count)` | Users |

#### Columns (13)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `title` | Job Title | ✓ | min-w-[200px] | left | text |
| `account` | Client | ✓ | w-[150px] | left | link |
| `location` | Location | ✓ | w-[130px] | left | text |
| `type` | Type | ✓ | w-[100px] | left | badge |
| `status` | Status | ✓ | w-[100px] | left | status |
| `salaryMin` | Salary Range | ✗ | w-[120px] | right | salary-range |
| `openings` | Openings | ✓ | w-[80px] | right | number |
| `submissions` | Submissions | ✓ | w-[90px] | right | number |
| `interviews` | Interviews | ✓ | w-[80px] | right | number |
| `owner` | Owner | ✓ | w-[130px] | left | avatar+name |
| `dueDate` | Due Date | ✓ | w-[100px] | left | date |
| `createdAt` | Created | ✓ | w-[100px] | left | relative-date |

#### Filters (7)
| Key | Type | Options |
|-----|------|---------|
| `search` | search | - |
| `status` | select | Draft, Active, On Hold, Filled, Cancelled |
| `type` | select | Full-Time, Contract, Contract-to-Hire, Part-Time |
| `account` | select | (dynamic account list) |
| `location` | select | (dynamic location list) |
| `owner` | select | (dynamic user list) |
| `salaryRange` | range | 0-500000 |

---

### 7. Candidates

**URL**: `/employee/recruiting/candidates`

**Business Context**: Talent pool - people who can be placed in jobs.

#### Stats Cards (5)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Candidates | `COUNT(*)` | Users |
| `active` | Active | `COUNT(*) WHERE status = 'active'` | UserCheck |
| `placedThisMonth` | Placed This Month | `COUNT(*) WHERE placed_at > start_of_month` | Trophy |
| `avgPlacementRate` | Placement Rate | `(placed / submitted) * 100` | Target |
| `newThisWeek` | New This Week | `COUNT(*) WHERE created_at > NOW() - 7 days` | UserPlus |

#### Columns (12)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `name` | Name | ✓ | min-w-[180px] | left | text |
| `title` | Current Title | ✓ | w-[150px] | left | text |
| `skills` | Skills | ✗ | w-[180px] | left | tags |
| `location` | Location | ✓ | w-[130px] | left | text |
| `status` | Status | ✓ | w-[100px] | left | status |
| `experience` | Experience | ✓ | w-[90px] | right | years |
| `salaryExpected` | Expected Salary | ✓ | w-[120px] | right | currency |
| `source` | Source | ✓ | w-[100px] | left | badge |
| `submissions` | Submissions | ✓ | w-[90px] | right | number |
| `owner` | Owner | ✓ | w-[130px] | left | avatar+name |
| `lastActivity` | Last Activity | ✓ | w-[110px] | left | relative-date |
| `createdAt` | Created | ✓ | w-[100px] | left | relative-date |

#### Filters (7)
| Key | Type | Options |
|-----|------|---------|
| `search` | search | - |
| `status` | select | Active, Placed, Inactive, Do Not Contact |
| `skills` | multi-select | (dynamic skills list) |
| `location` | select | (dynamic location list) |
| `experienceRange` | range | 0-30 |
| `source` | select | Job Board, Referral, LinkedIn, Direct Apply, Agency |
| `owner` | select | (dynamic user list) |

---

## Pipeline Entities

### 8. Submissions ✅

**URL**: `/employee/recruiting/submissions` (updated route)

**Status**: ✅ Completed - Enterprise-grade config with 5 stats cards, 11 columns with sorting, 5 filters

**Business Context**: Candidate submissions to jobs. Core pipeline tracking.

#### Stats Cards (5)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Submissions | `COUNT(*)` | Send |
| `pendingReview` | Pending Review | `COUNT(*) WHERE stage = 'submitted'` | Clock |
| `interviewStage` | In Interview | `COUNT(*) WHERE stage IN ('interview_scheduled', 'interviewed')` | Calendar |
| `offerRate` | Offer Rate | `(offers / interviews) * 100` | Target |
| `avgDaysInStage` | Avg Days in Stage | `AVG(NOW() - stage_changed_at)` | Timer |

#### Columns (11)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `candidate` | Candidate | ✓ | min-w-[180px] | left | link |
| `job` | Job | ✓ | w-[180px] | left | link |
| `account` | Client | ✓ | w-[140px] | left | link |
| `stage` | Stage | ✓ | w-[130px] | left | status |
| `submittedAt` | Submitted | ✓ | w-[100px] | left | date |
| `interviewDate` | Interview | ✓ | w-[100px] | left | date |
| `feedback` | Feedback | ✗ | w-[100px] | left | badge |
| `billRate` | Bill Rate | ✓ | w-[100px] | right | currency |
| `payRate` | Pay Rate | ✓ | w-[100px] | right | currency |
| `owner` | Owner | ✓ | w-[130px] | left | avatar+name |
| `daysInStage` | Days | ✗ | w-[60px] | right | number |

#### Filters (6)
| Key | Type | Options |
|-----|------|---------|
| `search` | search | - |
| `stage` | select | Submitted, Client Review, Interview Scheduled, Interviewed, Offer, Rejected, Withdrawn |
| `account` | select | (dynamic account list) |
| `job` | select | (dynamic job list) |
| `owner` | select | (dynamic user list) |
| `submittedRange` | date-range | - |

---

### 9. Interviews ✅

**URL**: `/employee/recruiting/interviews` (updated route)

**Status**: ✅ Completed - Enterprise-grade config with 4 stats cards, 11 columns with sorting, 6 filters

**Business Context**: Scheduled and completed interviews.

#### Stats Cards (4)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Interviews | `COUNT(*)` | Calendar |
| `scheduledThisWeek` | This Week | `COUNT(*) WHERE scheduled_at BETWEEN start_of_week AND end_of_week` | Clock |
| `completedThisMonth` | Completed | `COUNT(*) WHERE status = 'completed' AND completed_at > start_of_month` | CheckCircle |
| `passRate` | Pass Rate | `(passed / completed) * 100` | TrendingUp |

#### Columns (11)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `candidate` | Candidate | ✓ | min-w-[180px] | left | link |
| `job` | Job | ✓ | w-[180px] | left | link |
| `account` | Client | ✓ | w-[140px] | left | link |
| `type` | Type | ✓ | w-[100px] | left | badge |
| `status` | Status | ✓ | w-[100px] | left | status |
| `scheduledAt` | Scheduled | ✓ | w-[140px] | left | datetime |
| `duration` | Duration | ✗ | w-[80px] | right | minutes |
| `interviewer` | Interviewer | ✓ | w-[130px] | left | text |
| `outcome` | Outcome | ✓ | w-[100px] | left | badge |
| `owner` | Owner | ✓ | w-[130px] | left | avatar+name |
| `createdAt` | Created | ✓ | w-[100px] | left | relative-date |

#### Filters (6)
| Key | Type | Options |
|-----|------|---------|
| `search` | search | - |
| `status` | select | Scheduled, Completed, Cancelled, No Show |
| `type` | select | Phone Screen, Video, On-site, Panel, Technical |
| `outcome` | select | Passed, Failed, Pending Decision |
| `account` | select | (dynamic account list) |
| `scheduledRange` | date-range | - |

---

### 10. Offers ✅

**URL**: `/employee/recruiting/offers` (updated route)

**Status**: ✅ Completed - Enterprise-grade config with 4 stats cards, 10 columns with sorting, 5 filters. Created new config and page from scratch.

**Business Context**: Job offers extended to candidates.

#### Stats Cards (4)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Offers | `COUNT(*)` | FileText |
| `pending` | Pending | `COUNT(*) WHERE status = 'pending'` | Clock |
| `acceptedThisMonth` | Accepted | `COUNT(*) WHERE status = 'accepted' AND accepted_at > start_of_month` | CheckCircle |
| `acceptRate` | Accept Rate | `(accepted / (accepted + declined)) * 100` | Target |

#### Columns (11)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `candidate` | Candidate | ✓ | min-w-[180px] | left | link |
| `job` | Job | ✓ | w-[180px] | left | link |
| `account` | Client | ✓ | w-[140px] | left | link |
| `status` | Status | ✓ | w-[100px] | left | status |
| `salary` | Salary | ✓ | w-[110px] | right | currency |
| `startDate` | Start Date | ✓ | w-[100px] | left | date |
| `expiresAt` | Expires | ✓ | w-[100px] | left | date |
| `extendedAt` | Extended | ✓ | w-[100px] | left | date |
| `respondedAt` | Responded | ✓ | w-[100px] | left | date |
| `owner` | Owner | ✓ | w-[130px] | left | avatar+name |

#### Filters (5)
| Key | Type | Options |
|-----|------|---------|
| `search` | search | - |
| `status` | select | Draft, Pending, Accepted, Declined, Expired, Withdrawn |
| `account` | select | (dynamic account list) |
| `owner` | select | (dynamic user list) |
| `extendedRange` | date-range | - |

---

### 11. Placements ✅

**URL**: `/employee/recruiting/placements` (updated route)

**Status**: ✅ Completed - Enterprise-grade config with 5 stats cards (including Revenue YTD, Avg Rate), 12 columns with sorting, 6 filters

**Business Context**: Successful placements - candidates hired by clients.

#### Stats Cards (5)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Placements | `COUNT(*)` | Trophy |
| `activeNow` | Currently Active | `COUNT(*) WHERE status = 'active'` | UserCheck |
| `thisMonth` | This Month | `COUNT(*) WHERE placed_at > start_of_month` | Calendar |
| `revenueYTD` | Revenue YTD | `SUM(fee) WHERE placed_at > start_of_year` | DollarSign |
| `avgFee` | Avg Placement Fee | `AVG(fee)` | BarChart |

#### Columns (12)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `candidate` | Candidate | ✓ | min-w-[180px] | left | link |
| `job` | Job | ✓ | w-[180px] | left | link |
| `account` | Client | ✓ | w-[140px] | left | link |
| `type` | Type | ✓ | w-[100px] | left | badge |
| `status` | Status | ✓ | w-[100px] | left | status |
| `startDate` | Start Date | ✓ | w-[100px] | left | date |
| `endDate` | End Date | ✓ | w-[100px] | left | date |
| `billRate` | Bill Rate | ✓ | w-[100px] | right | currency/hr |
| `payRate` | Pay Rate | ✓ | w-[100px] | right | currency/hr |
| `fee` | Fee | ✓ | w-[100px] | right | currency |
| `owner` | Owner | ✓ | w-[130px] | left | avatar+name |
| `placedAt` | Placed | ✓ | w-[100px] | left | date |

---

## Bench Sales Entities

### 12. Consultants ✅

**URL**: `/employee/bench/consultants`

**Status**: ✅ Completed - Enterprise-grade config with 5 stats cards, 10 columns with sorting, 4 filters. Added stats procedure to bench router.

**Business Context**: Consultants on bench waiting for placement.

#### Stats Cards (5)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Consultants | `COUNT(*)` | Users |
| `onBench` | On Bench | `COUNT(*) WHERE status = 'available'` | Clock |
| `deployed` | Deployed | `COUNT(*) WHERE status = 'deployed'` | Briefcase |
| `utilization` | Utilization Rate | `(deployed / total) * 100` | PieChart |
| `avgDaysOnBench` | Avg Days on Bench | `AVG(NOW() - bench_start_date) WHERE status = 'available'` | Timer |

#### Columns (11)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `name` | Name | ✓ | min-w-[180px] | left | text |
| `title` | Title | ✓ | w-[150px] | left | text |
| `skills` | Skills | ✗ | w-[180px] | left | tags |
| `status` | Status | ✓ | w-[100px] | left | status |
| `location` | Location | ✓ | w-[130px] | left | text |
| `billRate` | Bill Rate | ✓ | w-[100px] | right | currency/hr |
| `visa` | Visa | ✓ | w-[80px] | left | badge |
| `daysOnBench` | Days on Bench | ✓ | w-[100px] | right | number |
| `submissions` | Submissions | ✓ | w-[90px] | right | number |
| `owner` | Owner | ✓ | w-[130px] | left | avatar+name |
| `benchStart` | Bench Start | ✓ | w-[100px] | left | date |

---

### 13. Vendors ✅

**URL**: `/employee/bench/vendors`

**Status**: ✅ Completed - Enterprise-grade config with 4 stats cards, 8 columns with sorting, 4 filters. Added stats procedure and sorting support to bench router.

**Business Context**: Partner vendors/suppliers.

#### Stats Cards (4)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Vendors | `COUNT(*)` | Building |
| `active` | Active | `COUNT(*) WHERE status = 'active'` | CheckCircle |
| `tier1` | Tier 1 | `COUNT(*) WHERE tier = '1'` | Star |
| `activeOrders` | Active Orders | `COUNT(job_orders) WHERE status = 'active'` | FileText |

#### Columns (10)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `name` | Vendor Name | ✓ | min-w-[200px] | left | text |
| `type` | Type | ✓ | w-[100px] | left | badge |
| `tier` | Tier | ✓ | w-[70px] | center | badge |
| `status` | Status | ✓ | w-[100px] | left | status |
| `location` | Location | ✓ | w-[140px] | left | text |
| `contactName` | Contact | ✗ | w-[130px] | left | text |
| `activeOrders` | Active Orders | ✓ | w-[100px] | right | number |
| `placements` | Placements | ✓ | w-[90px] | right | number |
| `owner` | Owner | ✓ | w-[130px] | left | avatar+name |
| `createdAt` | Created | ✓ | w-[100px] | left | relative-date |

---

### 14. Job Orders ✅

**URL**: `/employee/bench/job-orders`

**Status**: ✅ Completed - Enterprise-grade config with 4 stats cards, 10 columns with sorting, 3 filters. Wired up real tRPC hooks (was returning stub data), added stats procedure and sorting support to bench router.

**Business Context**: Requirements from vendors/prime clients.

#### Stats Cards (4)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Orders | `COUNT(*)` | FileText |
| `active` | Active | `COUNT(*) WHERE status = 'active'` | Play |
| `filled` | Filled This Month | `COUNT(*) WHERE status = 'filled' AND filled_at > start_of_month` | CheckCircle |
| `avgTimeToFill` | Avg Time to Fill | `AVG(filled_at - created_at)` | Clock |

#### Columns (11)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `title` | Title | ✓ | min-w-[200px] | left | text |
| `vendor` | Vendor | ✓ | w-[150px] | left | link |
| `client` | End Client | ✓ | w-[140px] | left | text |
| `location` | Location | ✓ | w-[130px] | left | text |
| `status` | Status | ✓ | w-[100px] | left | status |
| `billRate` | Bill Rate | ✓ | w-[100px] | right | currency/hr |
| `duration` | Duration | ✓ | w-[90px] | right | months |
| `submissions` | Submissions | ✓ | w-[90px] | right | number |
| `owner` | Owner | ✓ | w-[130px] | left | avatar+name |
| `dueDate` | Due Date | ✓ | w-[100px] | left | date |
| `createdAt` | Created | ✓ | w-[100px] | left | relative-date |

---

## HR Entities

### 15. Employees

**URL**: `/employee/hr/employees`

**Business Context**: Internal staff management.

#### Stats Cards (4)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Employees | `COUNT(*)` | Users |
| `active` | Active | `COUNT(*) WHERE status = 'active'` | UserCheck |
| `newThisMonth` | New This Month | `COUNT(*) WHERE hired_at > start_of_month` | UserPlus |
| `byDepartment` | By Department | `GROUP BY department` | Building2 |

#### Columns (11)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `name` | Name | ✓ | min-w-[180px] | left | avatar+name |
| `title` | Title | ✓ | w-[150px] | left | text |
| `department` | Department | ✓ | w-[120px] | left | badge |
| `status` | Status | ✓ | w-[100px] | left | status |
| `email` | Email | ✗ | w-[180px] | left | text |
| `phone` | Phone | ✗ | w-[120px] | left | text |
| `manager` | Manager | ✓ | w-[130px] | left | text |
| `pod` | Pod/Team | ✓ | w-[100px] | left | badge |
| `hiredAt` | Hired | ✓ | w-[100px] | left | date |
| `location` | Location | ✓ | w-[130px] | left | text |

---

### 16. Pods/Teams

**URL**: `/employee/hr/pods`

**Business Context**: Team/pod management.

#### Stats Cards (4)
| Key | Label | Calculation | Icon |
|-----|-------|-------------|------|
| `total` | Total Pods | `COUNT(*)` | Users |
| `active` | Active | `COUNT(*) WHERE status = 'active'` | CheckCircle |
| `avgSize` | Avg Size | `AVG(member_count)` | Users |
| `totalMembers` | Total Members | `SUM(member_count)` | UserCheck |

#### Columns (9)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `name` | Pod Name | ✓ | min-w-[180px] | left | text |
| `type` | Type | ✓ | w-[100px] | left | badge |
| `status` | Status | ✓ | w-[100px] | left | status |
| `lead` | Pod Lead | ✓ | w-[150px] | left | avatar+name |
| `members` | Members | ✓ | w-[80px] | right | number |
| `focus` | Focus Area | ✗ | w-[140px] | left | text |
| `activeJobs` | Active Jobs | ✓ | w-[90px] | right | number |
| `placements` | Placements MTD | ✓ | w-[100px] | right | number |
| `createdAt` | Created | ✓ | w-[100px] | left | relative-date |

---

## Supporting Entities (Polymorphic)

These entities appear as sections within other entity detail pages.

### 17. Activities ✅

**Status**: ✅ Completed - Enterprise-grade section component with 4 stats cards, 10 columns with sorting, table layout with inline panel

**Context**: Appears on all entity detail pages (Accounts, Contacts, Jobs, Candidates, etc.)

**URL Pattern**: `/employee/[module]/[entity]/[id]?section=activities`

#### Stats Cards (4)
| Key | Label | Calculation |
|-----|-------|-------------|
| `total` | Total | `COUNT(*)` |
| `completedToday` | Completed Today | `COUNT(*) WHERE completed_at > start_of_day` |
| `overdue` | Overdue | `COUNT(*) WHERE due_date < NOW() AND status != 'completed'` |
| `byType` | By Type | `GROUP BY activity_type` |

#### Columns (10)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `type` | Type | ✓ | w-[100px] | left | icon+badge |
| `subject` | Subject | ✓ | min-w-[200px] | left | text |
| `description` | Description | ✗ | w-[200px] | left | truncated |
| `relatedTo` | Related To | ✓ | w-[150px] | left | link |
| `status` | Status | ✓ | w-[100px] | left | status |
| `priority` | Priority | ✓ | w-[80px] | left | badge |
| `dueDate` | Due Date | ✓ | w-[100px] | left | date |
| `completedAt` | Completed | ✓ | w-[100px] | left | date |
| `owner` | Owner | ✓ | w-[130px] | left | avatar+name |
| `createdAt` | Created | ✓ | w-[100px] | left | relative-date |

#### Activity Types
- Call, Email, Meeting, Task, Note, LinkedIn Message, Follow-up

---

### 18. Notes ✅

**Status**: ✅ Completed - Enterprise-grade section component with 6 columns, table layout with inline panel, pinning support

**Context**: Appears on all entity detail pages

#### Columns (6)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `subject` | Subject | ✓ | min-w-[200px] | left | text |
| `preview` | Preview | ✗ | w-[300px] | left | truncated |
| `relatedTo` | Related To | ✓ | w-[150px] | left | link |
| `author` | Author | ✓ | w-[130px] | left | avatar+name |
| `createdAt` | Created | ✓ | w-[100px] | left | relative-date |
| `updatedAt` | Updated | ✓ | w-[100px] | left | relative-date |

---

### 19. Documents ✅

**Status**: ✅ Completed - Enterprise-grade section component with 3 stats cards, 8 columns with sorting, table layout with inline panel

**Context**: Appears on all entity detail pages

#### Stats Cards (3)
| Key | Label | Calculation |
|-----|-------|-------------|
| `total` | Total | `COUNT(*)` |
| `byType` | By Type | `GROUP BY document_type` |
| `storageUsed` | Storage Used | `SUM(file_size)` |

#### Columns (8)
| Key | Header | Sortable | Width | Align | Format |
|-----|--------|----------|-------|-------|--------|
| `name` | Name | ✓ | min-w-[200px] | left | icon+text |
| `type` | Type | ✓ | w-[100px] | left | badge |
| `size` | Size | ✓ | w-[80px] | right | filesize |
| `relatedTo` | Related To | ✓ | w-[150px] | left | link |
| `uploadedBy` | Uploaded By | ✓ | w-[130px] | left | avatar+name |
| `uploadedAt` | Uploaded | ✓ | w-[100px] | left | relative-date |
| `lastAccessed` | Last Accessed | ✓ | w-[110px] | left | relative-date |
| `actions` | Actions | ✗ | w-[100px] | center | buttons |

#### Document Types
- Resume, Contract, NDA, SOW, Invoice, Report, Other

---

## Implementation Priority

### Phase 1: Core Revenue Entities (High Impact)
1. ✅ Campaigns
2. ✅ Leads
3. ✅ Deals
4. Jobs
5. Candidates

### Phase 2: Pipeline Entities
6. Submissions
7. Accounts
8. Contacts

### Phase 3: Supporting Pipeline
9. Interviews
10. Offers
11. Placements

### Phase 4: Bench & HR
12. Consultants
13. Vendors
14. Job Orders
15. ✅ Employees
16. ✅ Pods

### Phase 5: Polymorphic Entities
17. Activities (as section component)
18. Notes (as section component)
19. Documents (as section component)

---

## Execution Checklist Per Entity

```markdown
## [Entity Name] Audit

### Pre-Implementation
- [ ] Review existing page code
- [ ] Identify current config (if exists)
- [ ] Check tRPC router for list/stats procedures

### Backend
- [ ] Add/update `list` procedure with all filters + sorting
- [ ] Add `stats` procedure for metrics
- [ ] Extend `sortBy` enum for all sortable columns
- [ ] Test queries with Supabase

### Config
- [ ] Create/update config in `src/configs/entities/`
- [ ] Define all columns with proper headers
- [ ] Configure sortFieldMap for camelCase → snake_case
- [ ] Add useListQuery hook
- [ ] Add useStatsQuery hook
- [ ] Set renderMode: 'table'

### Page
- [ ] Simplify page to < 10 lines
- [ ] Use EntityListView with config

### Testing
- [ ] Verify stats show real data
- [ ] Test all column sorting
- [ ] Test all filters
- [ ] Test pagination
- [ ] Test URL state persistence
- [ ] Verify sidebar recent items

### Documentation
- [ ] Update CLAUDE.md if new patterns
- [ ] Update ui-design-system.md if new rules
```

---

## Notes

- All column widths use Tailwind classes
- Status badges use StatusBadge component with config
- Links open detail pages, not inline panels
- Numbers always right-aligned
- Dates use `date` or `relative-date` format
- Currency uses `currency` format with proper symbol
- Owner fields show avatar + name
- Tags/skills use truncated pill display
