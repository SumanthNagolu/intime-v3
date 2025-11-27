# InTime v3 Integration Gap Analysis

**Document Version:** 1.0
**Date:** 2025-11-26
**Author:** Technical Architecture Team

---

## Executive Summary

This document provides a comprehensive analysis of the gaps between the frontend prototype (`frontend-prototype/`) and the production backend (`src/`). The goal is to identify all type mismatches, missing APIs, and component migration requirements to enable a smooth integration.

### Key Findings

| Category | Count | Priority |
|----------|-------|----------|
| Database Tables | 35+ | Implemented |
| Frontend Components | 93 | To Migrate |
| tRPC Routers Implemented | 29 | 4 Business + 25 Academy |
| Type Mismatches | 47 | Critical |
| Missing API Procedures | ~60 | High |
| Validation Schemas | 7 files | Mostly Complete |

---

## 1. Database Schema Summary

### 1.1 ATS Module (`src/lib/db/schema/ats.ts`)

| Table | Fields | Multi-Tenant | Soft Delete | Audit |
|-------|--------|--------------|-------------|-------|
| `skills` | 9 | No (Global) | No | created_at, updated_at |
| `candidate_skills` | 10 | No | No | created_at, updated_at |
| `jobs` | 28 | Yes (org_id) | Yes (deleted_at) | Full |
| `submissions` | 27 | Yes | Yes | Full |
| `interviews` | 18 | No* | No | created_at, updated_at |
| `offers` | 22 | No* | No | created_at, updated_at |
| `placements` | 23 | Yes | No | Full |

*Note: interviews and offers inherit org scope through job/submission relationships

### 1.2 CRM Module (`src/lib/db/schema/crm.ts`)

| Table | Fields | Multi-Tenant | Soft Delete | Audit |
|-------|--------|--------------|-------------|-------|
| `accounts` | 21 | Yes (org_id) | Yes | Full |
| `point_of_contacts` | 15 | No* | Yes | created_at, updated_at |
| `activity_log` | 14 | Yes | No | created_at only |
| `leads` | 23 | Yes | Yes | Full |
| `deals` | 16 | Yes | Yes | created_at, updated_at |

### 1.3 Bench Module (`src/lib/db/schema/bench.ts`)

| Table | Fields | Multi-Tenant | Soft Delete | Audit |
|-------|--------|--------------|-------------|-------|
| `bench_metadata` | 17 | No* | No | created_at, updated_at |
| `external_jobs` | 19 | Yes | Yes | created_at, updated_at |
| `job_sources` | 20 | Yes | No | created_at, updated_at |
| `bench_submissions` | 18 | Yes | No | created_at, updated_at |
| `hotlists` | 16 | Yes | No | created_at, updated_at |
| `immigration_cases` | 29 | Yes | No | created_at, updated_at |

### 1.4 TA-HR Module (`src/lib/db/schema/ta-hr.ts`)

| Table | Fields | Multi-Tenant | Soft Delete | Audit |
|-------|--------|--------------|-------------|-------|
| `campaigns` | 25 | Yes | No | created_at, updated_at |
| `campaign_contacts` | 18 | No* | No | created_at, updated_at |
| `engagement_tracking` | 9 | No* | No | created_at only |
| `employee_metadata` | 17 | No* | No | created_at, updated_at |
| `pods` | 14 | Yes | No | created_at, updated_at |
| `payroll_runs` | 15 | Yes | No | created_at, updated_at |
| `payroll_items` | 13 | No* | No | created_at, updated_at |
| `performance_reviews` | 19 | Yes | No | created_at, updated_at |
| `time_attendance` | 12 | No* | No | created_at, updated_at |
| `pto_balances` | 8 | No* | No | updated_at only |

### 1.5 Academy Module (`src/lib/db/schema/academy.ts`)

| Table | Fields | Multi-Tenant | Soft Delete | Audit |
|-------|--------|--------------|-------------|-------|
| `courses` | 17 | No* | Yes | created_at, updated_at |
| `course_modules` | 10 | No* | No | created_at, updated_at |
| `module_topics` | 12 | No* | No | created_at, updated_at |
| `topic_lessons` | 10 | No* | No | created_at, updated_at |
| `student_enrollments` | 17 | No* | No | updated_at only |
| `topic_completions` | 5 | No* | No | completed_at only |
| `xp_transactions` | 9 | No* | No | created_at |
| `user_xp_totals` | 4 | No* | No | updated_at |
| `badges` | 12 | No | No | created_at, updated_at |
| `user_badges` | 8 | No* | No | earned_at |
| `quiz_attempts` | 7 | No* | No | attempted_at |
| `capstone_submissions` | 10 | No* | No | submitted_at |
| `onboarding_checklist` | 6 | No* | No | completed_at |
| `student_interventions` | 10 | No* | No | created_at, updated_at |
| `escalations` | 6 | No* | No | created_at |

### 1.6 RBAC Module (`src/lib/db/schema/rbac.ts`)

| Table | Fields | Multi-Tenant | Soft Delete | Audit |
|-------|--------|--------------|-------------|-------|
| `roles` | 11 | No (System) | Yes | created_at, updated_at |
| `permissions` | 8 | No (System) | Yes | created_at |
| `role_permissions` | 4 | No | No | granted_at |
| `user_roles` | 7 | No | Yes | assigned_at |

---

## 2. Type Mismatch Analysis

### 2.1 Job Entity

| Frontend Field | DB Field | Type Difference | Resolution |
|---------------|----------|-----------------|------------|
| `rate: string` | `rateMin, rateMax, rateType` | Simple string vs structured | Transform: `${rateMin}-${rateMax}/${rateType}` |
| `client: string` | `accountId: uuid` | Denormalized name vs FK | Join with accounts table |
| `ownerId: string` | `ownerId: uuid` | Same type | No change |
| `status` values | `status` values | Different enum values | Map: 'open' = 'open', 'hold' = 'on_hold' |
| `type` | `jobType` | Different field name | Rename in query |
| Missing | `dealId` | Not in frontend | Add optional field |
| Missing | `hybridDays` | Not in frontend | Add optional field |
| Missing | `requiredSkills[]` | Not in frontend | Add array field |
| Missing | `visaRequirements[]` | Not in frontend | Add array field |
| Missing | `recruiterIds[]` | Not in frontend | Add array field |

### 2.2 Candidate Entity

| Frontend Field | DB Field | Type Difference | Resolution |
|---------------|----------|-----------------|------------|
| `name: string` | `fullName: text` | Same | Rename in mapping |
| `role: string` | `employeePosition` | Different context | Map based on user type |
| `status` | `candidateStatus` | Different field name | Use candidateStatus |
| `type` | N/A | Frontend only | Compute from status/source |
| `skills: string[]` | `candidateSkills[]` | Simple vs junction table | Join with skills table |
| `experience: string` | `candidateExperienceYears: int` | String vs number | Format: `${years} years` |
| `location: string` | `candidateLocation` | Same | Direct mapping |
| `rate: string` | `candidateHourlyRate: numeric` | String vs number | Format: `$${rate}/hr` |
| `email: string` | `email` | Same | Direct mapping |
| `score: number` | N/A | Computed | Calculate from AI matching |
| `source` | N/A | Frontend enum | Add to user_profiles |
| Missing | `candidateResumeUrl` | Not in frontend | Add field |
| Missing | `candidateCurrentVisa` | Not in frontend | Add field |
| Missing | `candidateVisaExpiry` | Not in frontend | Add field |
| Missing | `candidateAvailability` | Not in frontend | Add field |

### 2.3 Account Entity

| Frontend Field | DB Field | Type Difference | Resolution |
|---------------|----------|-----------------|------------|
| `name: string` | `name` | Same | Direct mapping |
| `industry: string` | `industry` | Same | Direct mapping |
| `status` | `status` | Different values | Map: 'Prospect' → 'prospect' |
| `type` | `companyType` | Different field name | Use companyType |
| `accountManagerId` | `accountManagerId` | Same | Direct mapping |
| `logo?: string` | N/A | Not in DB | Add to accounts or use file_uploads |
| `responsiveness` | `responsiveness` | Same | Direct mapping |
| `preference` | `preferredQuality` | Different field name | Use preferredQuality |
| `pocs: PointOfContact[]` | Separate table | Denormalized vs normalized | Join with point_of_contacts |
| `activityLog` | Separate table | Denormalized vs normalized | Join with activity_log |
| Missing | `tier` | Not in frontend | Add field |
| Missing | `contractStartDate` | Not in frontend | Add field |
| Missing | `contractEndDate` | Not in frontend | Add field |
| Missing | `paymentTermsDays` | Not in frontend | Add field |
| Missing | `markupPercentage` | Not in frontend | Add field |
| Missing | `annualRevenueTarget` | Not in frontend | Add field |

### 2.4 Submission Entity

| Frontend Field | DB Field | Type Difference | Resolution |
|---------------|----------|-----------------|------------|
| `id`, `jobId`, `candidateId` | Same | Same types | Direct mapping |
| `status` | `status` | Different values | Map frontend stages to DB stages |
| `createdAt: string` | `createdAt: timestamp` | String vs Date | Format date |
| `lastActivity: string` | `updatedAt` | Different field | Use updatedAt |
| `notes?: string` | `submissionNotes` | Different field name | Use submissionNotes |
| `matchScore: number` | `aiMatchScore` | Different field name | Use aiMatchScore |
| Missing | `submittedRate` | Not in frontend | Add field |
| Missing | `accountId` | Not in frontend | Add field |
| Missing | `ownerId` | Not in frontend | Add field |
| Missing | `interviewCount` | Not in frontend | Add computed field |

### 2.5 Lead Entity

| Frontend Field | DB Field | Type Difference | Resolution |
|---------------|----------|-----------------|------------|
| `company: string` | `companyName` | Different field name | Use companyName |
| `firstName`, `lastName` | Same | Same | Direct mapping |
| `title` | `title` | Same | Direct mapping |
| `email`, `phone` | Same | Same | Direct mapping |
| `status` | `status` | Same values | Direct mapping |
| `value?: string` | `estimatedValue: numeric` | String vs number | Parse/format |
| `source?: string` | `source` | Same | Direct mapping |
| `lastAction?: string` | N/A | Not in DB | Compute from activity_log |
| `notes?: string` | N/A | Not in DB | Add to leads or use activity_log |
| `contact: string` | N/A | Computed | `${firstName} ${lastName}` |
| Missing | `leadType` | Not in frontend | Add field |
| Missing | `industry` | Not in frontend | Add field |
| Missing | `companySize` | Not in frontend | Add field |
| Missing | `linkedinUrl` | Not in frontend | Add field |
| Missing | `engagementScore` | Not in frontend | Add field |

### 2.6 Deal Entity

| Frontend Field | DB Field | Type Difference | Resolution |
|---------------|----------|-----------------|------------|
| `id`, `leadId` | Same | Same | Direct mapping |
| `company: string` | Via accountId join | Denormalized | Join with accounts |
| `title: string` | `title` | Same | Direct mapping |
| `value: string` | `value: numeric` | String vs number | Parse/format |
| `stage` | `stage` | Different values | Map frontend to DB stages |
| `probability: number` | `probability: int` | Same | Direct mapping |
| `expectedClose: string` | `expectedCloseDate: timestamp` | String vs date | Format date |
| `ownerId` | `ownerId` | Same | Direct mapping |
| `notes?: string` | `description` | Different field name | Use description |
| Missing | `accountId` | Not in frontend | Add field |
| Missing | `linkedJobIds` | Not in frontend | Add field |
| Missing | `actualCloseDate` | Not in frontend | Add field |
| Missing | `closeReason` | Not in frontend | Add field |

### 2.7 Employee Entity

| Frontend Field | DB Field | Type Difference | Resolution |
|---------------|----------|-----------------|------------|
| `firstName`, `lastName` | `fullName` | Split vs combined | Parse fullName |
| `email` | `email` | Same | Direct mapping |
| `role: string` | `employeePosition` | Different field name | Use employeePosition |
| `department` | `employeeDepartment` | Different field name | Use employeeDepartment |
| `startDate: string` | `employeeHireDate` | String vs timestamp | Format date |
| `status` | `employeeStatus` | Different values | Map values |
| `manager: string` | `employeeManagerId` | Name vs UUID | Join to get name |
| `location: string` | N/A | Not in user_profiles | Add to employee_metadata |
| `salary: string` | `employeeSalary: numeric` | String vs number | Format currency |
| `pod?: string` | `recruiterPodId` | Name vs UUID | Join with pods |
| `image?: string` | `avatarUrl` | Different field name | Use avatarUrl |
| Missing | `employeePerformanceRating` | Not in frontend | Add field |

### 2.8 BenchConsultant Entity (extends Candidate)

| Frontend Field | DB Field | Type Difference | Resolution |
|---------------|----------|-----------------|------------|
| All Candidate fields | As above | As above | See Candidate |
| `daysOnBench: number` | `daysOnBench` in bench_metadata | Same | Join with bench_metadata |
| `lastContact: string` | `lastContactedAt` | String vs timestamp | Format date |
| `visaStatus: string` | `candidateCurrentVisa` | Different field name | Use candidateCurrentVisa |
| Missing | `benchStartDate` | Not in frontend | Add field |
| Missing | `benchSalesRepId` | Not in frontend | Add field |
| Missing | `hasActiveImmigrationCase` | Not in frontend | Add field |
| Missing | `immigrationCaseId` | Not in frontend | Add field |

---

## 3. Missing API Procedures

### 3.1 ATS Module - Current Coverage

| Procedure | Status | Notes |
|-----------|--------|-------|
| `jobs.list` | Implemented | Has filters |
| `jobs.getById` | Implemented | - |
| `jobs.create` | Implemented | - |
| `jobs.update` | Implemented | - |
| `jobs.delete` | **MISSING** | Need soft delete |
| `jobs.metrics` | Implemented | - |
| `jobs.search` | **MISSING** | Full-text search |
| `jobs.getByAccount` | **MISSING** | Filter by accountId |
| `submissions.list` | Implemented | Has filters |
| `submissions.getById` | Implemented | - |
| `submissions.create` | Implemented | - |
| `submissions.update` | Implemented | - |
| `submissions.updateStatus` | Implemented | - |
| `submissions.delete` | **MISSING** | - |
| `submissions.getByCandidate` | **MISSING** | - |
| `submissions.bulkUpdateStatus` | **MISSING** | - |
| `interviews.list` | Implemented | - |
| `interviews.create` | Implemented | - |
| `interviews.update` | Implemented | - |
| `interviews.cancel` | Implemented | - |
| `interviews.getById` | **MISSING** | - |
| `interviews.complete` | **MISSING** | With feedback |
| `interviews.reschedule` | **MISSING** | - |
| `offers.list` | Implemented | - |
| `offers.create` | Implemented | - |
| `offers.update` | Implemented | - |
| `offers.send` | Implemented | - |
| `offers.respond` | Implemented | - |
| `offers.getById` | **MISSING** | - |
| `offers.withdraw` | **MISSING** | - |
| `placements.list` | Implemented | - |
| `placements.create` | Implemented | - |
| `placements.update` | Implemented | - |
| `placements.extend` | Implemented | - |
| `placements.activeCount` | Implemented | - |
| `placements.getById` | **MISSING** | - |
| `placements.terminate` | **MISSING** | - |
| `placements.getByCandidate` | **MISSING** | - |
| `skills.list` | Implemented | - |
| `skills.getCandidateSkills` | Implemented | - |
| `skills.addToCandidate` | Implemented | - |
| `skills.create` | **MISSING** | - |
| `skills.removeFromCandidate` | **MISSING** | - |

### 3.2 CRM Module - Current Coverage

| Procedure | Status | Notes |
|-----------|--------|-------|
| `accounts.list` | Implemented | Has filters |
| `accounts.getById` | Implemented | - |
| `accounts.create` | Implemented | - |
| `accounts.update` | Implemented | - |
| `accounts.delete` | Implemented | Soft delete |
| `accounts.search` | **MISSING** | Full-text |
| `accounts.getWithPocs` | **MISSING** | Include POCs |
| `accounts.getWithJobs` | **MISSING** | Include jobs |
| `leads.list` | Implemented | - |
| `leads.create` | Implemented | - |
| `leads.update` | Implemented | - |
| `leads.convertToDeal` | Implemented | - |
| `leads.getById` | **MISSING** | - |
| `leads.delete` | **MISSING** | - |
| `leads.bulkImport` | **MISSING** | CSV import |
| `deals.list` | Implemented | - |
| `deals.getById` | Implemented | - |
| `deals.create` | Implemented | - |
| `deals.update` | Implemented | - |
| `deals.pipelineSummary` | Implemented | - |
| `deals.delete` | **MISSING** | - |
| `deals.close` | **MISSING** | Won/Lost |
| `deals.linkJob` | **MISSING** | - |
| `pocs.list` | Implemented | - |
| `pocs.create` | Implemented | - |
| `pocs.update` | Implemented | - |
| `pocs.delete` | Implemented | - |
| `pocs.getById` | **MISSING** | - |
| `pocs.setPrimary` | **MISSING** | - |
| `activities.list` | Implemented | - |
| `activities.create` | Implemented | - |
| `activities.getTimeline` | **MISSING** | Formatted |

### 3.3 Bench Module - Current Coverage

| Procedure | Status | Notes |
|-----------|--------|-------|
| `consultants.list` | Implemented | - |
| `consultants.getById` | Implemented | - |
| `consultants.create` | Implemented | - |
| `consultants.update` | Implemented | - |
| `consultants.agingReport` | Implemented | - |
| `consultants.delete` | **MISSING** | - |
| `consultants.markAsPlaced` | **MISSING** | - |
| `externalJobs.list` | Implemented | - |
| `externalJobs.create` | Implemented | - |
| `externalJobs.update` | Implemented | - |
| `externalJobs.getById` | **MISSING** | - |
| `externalJobs.delete` | **MISSING** | - |
| `externalJobs.matchCandidates` | **MISSING** | AI matching |
| `sources.list` | Implemented | - |
| `sources.create` | Implemented | - |
| `sources.update` | **MISSING** | - |
| `sources.delete` | **MISSING** | - |
| `sources.testConnection` | **MISSING** | Validation |
| `submissions.list` | Implemented | - |
| `submissions.create` | Implemented | - |
| `submissions.update` | Implemented | - |
| `submissions.getById` | **MISSING** | - |
| `submissions.updateStatus` | **MISSING** | - |
| `hotlist.list` | Implemented | - |
| `hotlist.create` | Implemented | - |
| `hotlist.getById` | **MISSING** | - |
| `hotlist.send` | **MISSING** | Email |
| `hotlist.trackEngagement` | **MISSING** | - |
| `immigration.list` | Implemented | - |
| `immigration.getById` | Implemented | - |
| `immigration.create` | Implemented | - |
| `immigration.update` | Implemented | - |
| `immigration.statistics` | Implemented | - |
| `immigration.delete` | **MISSING** | - |
| `immigration.timeline` | **MISSING** | Events |

### 3.4 TA-HR Module - Current Coverage

| Procedure | Status | Notes |
|-----------|--------|-------|
| `campaigns.list` | Implemented | - |
| `campaigns.getById` | Implemented | - |
| `campaigns.create` | Implemented | - |
| `campaigns.update` | Implemented | - |
| `campaigns.metrics` | Implemented | - |
| `campaigns.delete` | **MISSING** | - |
| `campaigns.duplicate` | **MISSING** | Clone |
| `campaigns.pause/resume` | **MISSING** | - |
| `campaignContacts.list` | Implemented | - |
| `campaignContacts.add` | Implemented | - |
| `campaignContacts.updateStatus` | Implemented | - |
| `campaignContacts.remove` | **MISSING** | - |
| `campaignContacts.bulkAdd` | **MISSING** | - |
| `employees.list` | Implemented | - |
| `employees.getById` | Implemented | - |
| `employees.create` | Implemented | - |
| `employees.update` | Implemented | - |
| `employees.orgChart` | Implemented | - |
| `employees.delete` | **MISSING** | - |
| `employees.terminate` | **MISSING** | Offboarding |
| `employees.transfer` | **MISSING** | Department |
| `pods.list` | Implemented | - |
| `pods.create` | Implemented | - |
| `pods.update` | Implemented | - |
| `pods.performance` | Implemented | Partial |
| `pods.getById` | **MISSING** | - |
| `pods.delete` | **MISSING** | - |
| `pods.reassignMembers` | **MISSING** | - |
| `payroll.runs` | Implemented | - |
| `payroll.createRun` | Implemented | - |
| `payroll.items` | Implemented | - |
| `payroll.getRunById` | **MISSING** | - |
| `payroll.approveRun` | **MISSING** | - |
| `payroll.processRun` | **MISSING** | - |
| `payroll.addItem` | **MISSING** | - |
| `reviews.list` | Implemented | - |
| `reviews.create` | Implemented | - |
| `reviews.update` | Implemented | - |
| `reviews.getById` | **MISSING** | - |
| `reviews.submit` | **MISSING** | - |
| `reviews.acknowledge` | **MISSING** | - |
| `timeAttendance.list` | Implemented | - |
| `timeAttendance.clockIn` | Implemented | - |
| `timeAttendance.clockOut` | Implemented | - |
| `timeAttendance.getById` | **MISSING** | - |
| `timeAttendance.approve` | **MISSING** | - |
| `timeAttendance.reject` | **MISSING** | - |
| `pto.balance` | Implemented | - |
| `pto.request` | Implemented | Stub |
| `pto.getRequests` | **MISSING** | - |
| `pto.approveRequest` | **MISSING** | - |
| `pto.cancelRequest` | **MISSING** | - |

---

## 4. Component Migration Priority Matrix

### 4.1 P0 - Critical Path (Week 1-2)

| Component | Location | Data Entities | API Coverage | Complexity | Est. Effort |
|-----------|----------|---------------|--------------|------------|-------------|
| RecruiterDashboard | recruiting/ | Jobs, Submissions, Candidates | 80% | High | 3 days |
| JobDetail | recruiting/ | Job, Submissions, Account | 70% | Medium | 2 days |
| PipelineView | recruiting/ | Submissions by stage | 70% | High | 3 days |
| CandidateDetail | recruiting/ | Candidate, Skills, Submissions | 60% | High | 3 days |
| AccountsList | recruiting/ | Accounts | 90% | Low | 1 day |
| AccountDetail | recruiting/ | Account, POCs, Jobs, Activity | 70% | Medium | 2 days |

### 4.2 P1 - Core Workflows (Week 2-3)

| Component | Location | Data Entities | API Coverage | Complexity | Est. Effort |
|-----------|----------|---------------|--------------|------------|-------------|
| LeadsList | recruiting/ | Leads | 80% | Low | 1 day |
| LeadDetail | recruiting/ | Lead, Activity | 70% | Medium | 1.5 days |
| DealsPipeline | recruiting/ | Deals by stage | 80% | Medium | 2 days |
| DealDetail | recruiting/ | Deal, Account, Lead | 80% | Medium | 2 days |
| SubmissionBuilder | recruiting/ | Submission, Job, Candidate | 70% | High | 3 days |
| OfferBuilder | recruiting/ | Offer, Submission, Placement | 80% | High | 3 days |
| InterviewScheduler | recruiting/ | Interview, Submission | 70% | Medium | 2 days |
| PlacementWorkflow | recruiting/ | Placement, Offer, Submission | 70% | High | 3 days |
| ScreeningRoom | recruiting/ | Submissions, Candidates | 60% | Medium | 2 days |

### 4.3 P2 - Bench Sales (Week 3-4)

| Component | Location | Data Entities | API Coverage | Complexity | Est. Effort |
|-----------|----------|---------------|--------------|------------|-------------|
| BenchDashboard | bench/ | BenchMetadata, Stats | 80% | Medium | 2 days |
| BenchTalentList | bench/ | BenchMetadata, Candidates | 70% | Medium | 2 days |
| BenchTalentDetail | bench/ | BenchMetadata, Immigration | 60% | High | 3 days |
| HotlistBuilder | bench/ | Hotlist, Candidates | 60% | High | 3 days |
| JobCollector | bench/ | ExternalJobs, Sources | 70% | High | 3 days |
| JobHuntRoom | bench/ | ExternalJobs, Submissions | 60% | High | 3 days |
| ClientOutreach | bench/ | Accounts, POCs, Activity | 70% | Medium | 2 days |

### 4.4 P3 - HR Module (Week 4-5)

| Component | Location | Data Entities | API Coverage | Complexity | Est. Effort |
|-----------|----------|---------------|--------------|------------|-------------|
| HRDashboard | hr/ | Employees, Stats | 70% | Medium | 2 days |
| PeopleDirectory | hr/ | Employees | 80% | Low | 1 day |
| EmployeeProfile | hr/ | Employee, Reviews, Time | 60% | High | 3 days |
| PayrollDashboard | hr/ | PayrollRuns, Items | 60% | High | 3 days |
| TimeAttendance | hr/ | TimeAttendance | 70% | Medium | 2 days |
| PerformanceReviews | hr/ | Reviews | 70% | Medium | 2 days |
| OrgChart | hr/ | Employees, Pods | 60% | High | 3 days |
| Analytics | hr/ | Aggregated data | 40% | High | 3 days |
| Recruitment | hr/ | Campaigns, Contacts | 70% | Medium | 2 days |
| LearningAdmin | hr/ | Courses, Enrollments | 80% | Medium | 2 days |

### 4.5 P4 - TA/Campaigns (Week 5)

| Component | Location | Data Entities | API Coverage | Complexity | Est. Effort |
|-----------|----------|---------------|--------------|------------|-------------|
| TADashboard | sales/ | Campaigns, Metrics | 70% | Medium | 2 days |
| CampaignManager | sales/ | Campaigns | 80% | Medium | 2 days |
| CampaignBuilder | sales/ | Campaign, Contacts | 70% | High | 3 days |
| AccountProspects | sales/ | Leads, Accounts | 70% | Medium | 2 days |
| SourcedCandidates | sales/ | CampaignContacts | 60% | Medium | 2 days |
| SalesAnalytics | sales/ | Aggregated | 40% | High | 3 days |

### 4.6 P5 - Academy (Week 5-6)

| Component | Location | Data Entities | API Coverage | Complexity | Est. Effort |
|-----------|----------|---------------|--------------|------------|-------------|
| InstructorDashboard | academy/ | Cohorts, Enrollments | 90% | Medium | 2 days |
| CohortDetail | academy/ | Cohort, Students, Progress | 80% | Medium | 2 days |
| CertificateGenerator | academy/ | Certificates | 80% | Medium | 2 days |
| CertificateVerification | academy/ | Certificates | 80% | Low | 1 day |
| AcademyAdmin | admin/ | Courses, Cohorts | 80% | High | 3 days |

### 4.7 P6 - Admin (Week 6)

| Component | Location | Data Entities | API Coverage | Complexity | Est. Effort |
|-----------|----------|---------------|--------------|------------|-------------|
| AdminDashboard | admin/ | Stats across modules | 50% | High | 3 days |
| UserManagement | admin/ | Users, Roles | 60% | High | 3 days |
| Permissions | admin/ | Roles, Permissions | 60% | High | 3 days |
| AuditLogs | admin/ | Audit logs | 70% | Medium | 2 days |
| SystemSettings | admin/ | Settings | 40% | Medium | 2 days |
| CourseManagement | admin/ | Courses | 80% | Medium | 2 days |
| CourseBuilder | admin/ | Course, Modules, Topics | 70% | Very High | 5 days |

### 4.8 P7 - Portals & Misc (Week 6-7)

| Component | Location | Data Entities | API Coverage | Complexity | Est. Effort |
|-----------|----------|---------------|--------------|------------|-------------|
| ClientDashboard | client/ | Client view of jobs, submissions | 50% | Medium | 2 days |
| TalentDashboard | talent/ | Candidate self-service | 40% | High | 3 days |
| CrossBorderDashboard | immigration/ | Immigration cases | 70% | High | 3 days |
| CEODashboard | executive/ | Executive analytics | 30% | Very High | 5 days |
| GlobalCommand | shared/ | Search, Navigation | 50% | High | 3 days |
| NotificationsView | shared/ | Notifications | 30% | Medium | 2 days |
| ProfileView | shared/ | User profile | 70% | Low | 1 day |

---

## 5. Missing Features Analysis

### 5.1 Multi-Tenancy UI

| Feature | Status | Required Components |
|---------|--------|---------------------|
| Organization Switcher | Missing | Navbar, OrganizationPicker |
| Org-scoped Data | Backend Ready | All queries use orgId |
| Org Settings UI | Missing | Settings page |
| Org Onboarding | Backend Partial | Wizard component |
| Org Billing | Missing | Stripe integration UI |

### 5.2 Cross-Pollination Tracking

| Feature | Status | Required Components |
|---------|--------|---------------------|
| Source Attribution | Partial | Source field on candidates |
| Pipeline Origin Tracking | Missing | origin_pillar field |
| Cross-Module Handoffs | Missing | HandoffModal exists |
| Attribution Analytics | Missing | Dashboard widget |
| Revenue Attribution | Missing | Reports |

### 5.3 Pod Productivity

| Feature | Status | Required Components |
|---------|--------|---------------------|
| Pod Dashboard | Missing | PodProductivity component |
| 2 Placements/Sprint Goal | Missing | Goal tracking |
| Sprint Tracking | Backend Partial | currentSprintStartDate exists |
| Pod Leaderboard | Missing | Leaderboard component |
| Performance Alerts | Missing | Notification system |

### 5.4 Role-Based Navigation

| Feature | Status | Required Components |
|---------|--------|---------------------|
| Dynamic Nav by Role | Partial | Navbar has role logic |
| Permission Checks | Backend Ready | RBAC tables exist |
| Protected Routes | Partial | Some middleware |
| Role-Specific Dashboards | Partial | Different dashboard components |
| Permission Denied UI | Missing | Error component |

### 5.5 Audit & Compliance

| Feature | Status | Required Components |
|---------|--------|---------------------|
| Audit Log Viewer | Frontend Exists | Needs real data |
| Data Export | Missing | Export functionality |
| GDPR Compliance | Missing | Data deletion, export |
| Activity Timeline | Partial | Per-entity activity |
| Change History | Missing | Diff viewer |

### 5.6 AI Features

| Feature | Status | Required Components |
|---------|--------|---------------------|
| AI Mentor Chat | Backend Ready | Frontend integration |
| Resume Parsing | Missing | Upload + parse flow |
| Job Matching | Partial | Score display exists |
| Smart Recommendations | Missing | Recommendation widget |
| Email Templates | Missing | Template generation |

---

## 6. Risk Assessment

### 6.1 High Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema field name mismatches | Data mapping errors | Create comprehensive type adapters |
| Status enum differences | Workflow breaks | Create status mapping utilities |
| Missing audit fields | Compliance issues | Add missing createdBy/updatedBy |
| Denormalized frontend data | Extra queries | Pre-compute in API layer |
| RBAC not enforced | Security vulnerability | Add permission checks to all procedures |

### 6.2 Medium Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex joins for list views | Performance | Add database views or denormalization |
| File upload integration | Feature incomplete | Implement file_uploads handling |
| Email notifications | User experience | Integrate with email service |
| Real-time updates | Stale data | Add subscription support |

### 6.3 Low Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Date formatting | Display issues | Consistent date formatting utility |
| Pagination differences | UX inconsistency | Standardize pagination patterns |
| Search functionality | Incomplete | Implement full-text search |

---

## 7. Recommendations

### 7.1 Immediate Actions (Before Migration)

1. **Create Type Adapter Layer**: Build `src/lib/adapters/` with transform functions for each entity
2. **Add Missing getById Procedures**: ~20 procedures missing this basic operation
3. **Implement Soft Delete**: Add delete procedures for all entities
4. **Standardize Status Enums**: Create shared enum types matching database

### 7.2 Migration Strategy

1. **Start with RecruiterDashboard**: Highest value, good complexity benchmark
2. **Use Feature Flags**: Enable gradual rollout
3. **Parallel Development**: Keep mock data working during migration
4. **E2E Tests First**: Write Playwright tests before migration

### 7.3 Architecture Improvements

1. **Add API Response Types**: Typed return values for all procedures
2. **Create Shared Hooks**: Reusable tRPC query hooks per entity
3. **Implement Optimistic Updates**: Better UX for mutations
4. **Add Error Boundaries**: Graceful error handling

---

## Appendix A: Complete Table Schema Reference

*See individual schema files for full field definitions.*

## Appendix B: Frontend Component File List

*See `frontend-prototype/components/` for 93 component files.*

## Appendix C: tRPC Router Procedure List

*See `src/server/routers/` and `src/server/trpc/routers/` for full implementation.*
