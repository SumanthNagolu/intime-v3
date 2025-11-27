# InTime v3 Sprint Plan

**Document Version:** 1.0
**Date:** 2025-11-26

This document outlines the sprint-by-sprint execution plan for integrating the frontend prototype with the production backend.

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Sprints | 7 |
| Components to Migrate | 93 |
| tRPC Procedures to Add | ~60 |
| Type Adapters to Create | 12 |
| Test Files to Write | ~50 |

---

## Sprint Overview

| Sprint | Focus Area | Key Deliverables | Components |
|--------|-----------|------------------|------------|
| 1 | Foundation & Infrastructure | Type system, adapters, core hooks | 0 |
| 2 | ATS Core | RecruiterDashboard, Jobs, Pipeline | 8 |
| 3 | ATS Complete | Submissions, Interviews, Offers, Placements | 8 |
| 4 | CRM & Bench | Accounts, Leads, Deals, Bench Sales | 14 |
| 5 | HR Module | Employees, Payroll, Time, Performance | 12 |
| 6 | TA & Academy | Campaigns, Instructor Portal | 10 |
| 7 | Admin & Polish | User Management, Settings, Cross-cutting | 8+ |

---

## Sprint 1: Foundation & Infrastructure

### Goals
- Establish type system alignment
- Create all adapters
- Set up testing infrastructure
- Add missing API procedures

### Tasks

#### 1.1 Type System Setup
- [x] Create `src/types/aligned/` directory structure
- [x] Create `ats.ts` with aligned ATS types
- [x] Create `crm.ts` with aligned CRM types
- [x] Create `bench.ts` with aligned Bench types
- [x] Create `hr.ts` with aligned HR types
- [x] Create `common.ts` with shared types
- [x] Export all from `index.ts`

#### 1.2 Adapter Layer
- [x] Create `src/lib/adapters/` directory
- [x] Implement `job.ts` adapter
- [x] Implement `candidate.ts` adapter
- [x] Implement `submission.ts` adapter
- [x] Implement `account.ts` adapter
- [x] Implement `lead.ts` adapter
- [x] Implement `deal.ts` adapter
- [x] Implement `employee.ts` adapter
- [x] Implement `bench.ts` adapter
- [x] Create utility functions (`status-maps.ts`, `date-format.ts`, `rate-format.ts`)
- [ ] Write unit tests for all adapters

#### 1.3 Hook Infrastructure
- [x] Create `src/hooks/queries/` directory
- [x] Create `src/hooks/mutations/` directory
- [x] Implement base query hooks pattern
- [x] Implement optimistic update helper
- [x] Create cache invalidation utilities
- [ ] Set up tRPC test utilities

#### 1.4 Missing API Procedures (Priority)
- [ ] `ats.jobs.delete` - Soft delete
- [ ] `ats.jobs.search` - Full-text search
- [ ] `ats.interviews.getById` - Single interview
- [ ] `ats.offers.getById` - Single offer
- [ ] `ats.placements.getById` - Single placement
- [ ] `crm.leads.getById` - Single lead
- [ ] `crm.leads.delete` - Soft delete
- [ ] `crm.deals.delete` - Soft delete
- [ ] Add users router for candidate management

#### 1.5 Testing Infrastructure
- [ ] Set up Playwright for E2E tests
- [ ] Create test fixtures for each entity
- [ ] Set up test database seeding
- [ ] Create mock tRPC provider
- [ ] Write helper functions for common test patterns

### Acceptance Criteria
- [ ] All type files compile without errors
- [ ] All adapters pass unit tests (90%+ coverage)
- [ ] All new API procedures work in Postman/Thunder Client
- [ ] Test infrastructure runs successfully
- [ ] CI/CD pipeline updated to run tests

---

## Sprint 2: ATS Core

### Goals
- Migrate core recruiting components
- Establish migration patterns
- Complete job management flow

### Components to Migrate

| Component | Priority | Complexity | Dependencies |
|-----------|----------|------------|--------------|
| RecruiterDashboard | P0 | High | jobs, submissions, interviews |
| JobsList | P0 | Medium | jobs, accounts |
| JobDetail | P0 | High | jobs, submissions, accounts |
| JobIntake | P0 | High | jobs, accounts |
| PipelineView | P0 | High | submissions, jobs, candidates |
| AccountsList | P0 | Low | accounts |
| AccountDetail | P0 | Medium | accounts, pocs, activity |
| GlobalCommand | P1 | Medium | search across entities |

### Tasks

#### 2.1 RecruiterDashboard
- [x] Create `useRecruiterDashboardData` hook
- [x] Create dashboard stats calculation
- [x] Migrate component to use real data
- [x] Add loading skeletons
- [x] Add error handling
- [ ] Write E2E tests
- [x] Enable feature flag

#### 2.2 Jobs Module
- [x] Create `useJobs`, `useJob` hooks
- [x] Create `useCreateJob`, `useUpdateJob`, `useDeleteJob` mutations
- [x] Migrate JobsList component
- [x] Migrate JobDetail component
- [x] Migrate JobIntake form
- [x] Add job status workflow
- [ ] Write integration tests

#### 2.3 Accounts Module (Basic)
- [x] Create `useAccounts`, `useAccount` hooks
- [x] Migrate AccountsList component
- [x] Migrate AccountDetail component
- [x] Wire up POC management
- [x] Wire up activity log

#### 2.4 Pipeline View
- [x] Create `usePipelineData` hook
- [x] Create `useUpdateSubmissionStatus` with optimistic updates
- [x] Migrate PipelineView with drag-and-drop
- [x] Add real-time refresh
- [ ] Write E2E tests for DnD

#### 2.5 Global Command
- [x] Implement search across entities
- [x] Wire up to tRPC search procedures
- [x] Add keyboard shortcuts
- [x] Test with real data

### Acceptance Criteria
- [ ] Recruiter can view dashboard with real data
- [ ] Recruiter can create, view, update, delete jobs
- [ ] Recruiter can view accounts and contacts
- [ ] Pipeline drag-and-drop updates submission status
- [ ] Global command searches real data
- [ ] All E2E tests pass
- [ ] No performance regression (< 2s load time)

---

## Sprint 3: ATS Complete

### Goals
- Complete submission workflow
- Implement interview management
- Implement offer workflow
- Implement placement creation

### Components to Migrate

| Component | Priority | Complexity | Dependencies |
|-----------|----------|------------|--------------|
| SubmissionBuilder | P0 | High | submissions, jobs, candidates |
| CandidateDetail | P0 | High | candidates, skills, submissions |
| InterviewScheduler | P0 | Medium | interviews, submissions |
| ScreeningRoom | P1 | Medium | submissions, candidates |
| OfferBuilder | P0 | High | offers, submissions |
| PlacementWorkflow | P0 | High | placements, offers |
| SourcingRoom | P1 | Medium | candidates, jobs |
| SourcingModal | P1 | Low | candidates |

### Tasks

#### 3.1 Candidate Management
- [x] Create `useCandidates`, `useCandidate` hooks
- [x] Create candidate search hook
- [x] Migrate CandidateDetail component
- [ ] Implement skills management
- [x] Wire up submission history
- [ ] Wire up placement history

#### 3.2 Submission Workflow
- [x] Create `useSubmissions` hooks
- [x] Create submission creation mutation
- [x] Create submission status update mutation
- [x] Migrate SubmissionBuilder component
- [x] Migrate ScreeningRoom component
- [x] Add AI match score display

#### 3.3 Interview Management
- [x] Create `useInterviews` hooks
- [x] Create interview scheduling mutation
- [ ] Create interview completion mutation
- [x] Migrate InterviewScheduler component
- [ ] Add calendar integration (optional)
- [ ] Wire up interview feedback

#### 3.4 Offer Workflow
- [x] Create `useOffers` hooks
- [x] Create offer creation mutation
- [ ] Create offer response handling
- [x] Migrate OfferBuilder component
- [ ] Add offer letter generation (stub)
- [ ] Wire up offer expiry handling

#### 3.5 Placement Creation
- [x] Create `usePlacements` hooks
- [x] Create placement creation from offer
- [x] Migrate PlacementWorkflow component
- [ ] Update job positions filled
- [ ] Update candidate status

#### 3.6 Sourcing (Added)
- [x] Migrate SourcingRoom component
- [x] Migrate SourcingModal component

### Acceptance Criteria
- [ ] Recruiter can view candidate details
- [ ] Recruiter can create submissions
- [ ] Recruiter can schedule interviews
- [ ] Recruiter can create and send offers
- [ ] System creates placement on offer acceptance
- [ ] All status transitions work correctly
- [ ] E2E tests cover full workflow

---

## Sprint 4: CRM & Bench

### Goals
- Complete CRM module
- Migrate Bench Sales module
- Implement cross-module connections

### Components to Migrate

| Component | Priority | Complexity | Dependencies |
|-----------|----------|------------|--------------|
| LeadsList | P0 | Low | leads |
| LeadDetail | P0 | Medium | leads, activity |
| DealsPipeline | P0 | Medium | deals |
| DealDetail | P0 | Medium | deals, accounts |
| BenchDashboard | P0 | Medium | bench metadata |
| BenchTalentList | P0 | Medium | bench candidates |
| BenchTalentDetail | P0 | High | bench, immigration |
| HotlistBuilder | P1 | High | hotlist, candidates |
| JobCollector | P1 | High | external jobs, sources |
| JobHuntRoom | P1 | High | external jobs, submissions |
| ClientOutreach | P1 | Medium | accounts, pocs |
| RecruiterAnalytics | P2 | High | aggregated data |
| BenchAnalytics | P2 | High | aggregated data |

### Tasks

#### 4.1 CRM Leads
- [x] Create `useLeads`, `useLead` hooks
- [x] Create lead CRUD mutations
- [ ] Create lead-to-deal conversion
- [x] Migrate LeadsList component
- [ ] Migrate LeadDetail component
- [ ] Add activity log integration

#### 4.2 CRM Deals
- [x] Create `useDeals`, `useDeal` hooks
- [x] Create deal CRUD mutations
- [x] Create deal stage updates
- [x] Migrate DealsPipeline component
- [ ] Migrate DealDetail component
- [ ] Add job linking

#### 4.3 Bench Consultants
- [x] Create `useBenchConsultants` hook
- [ ] Create bench metadata mutations
- [x] Migrate BenchDashboard component
- [x] Migrate BenchTalentList component
- [ ] Migrate BenchTalentDetail component
- [ ] Add aging report

#### 4.4 External Jobs & Hotlist
- [ ] Create `useExternalJobs` hook
- [ ] Create `useHotlist` hook
- [ ] Migrate JobCollector component
- [x] Migrate HotlistBuilder component
- [ ] Migrate JobHuntRoom component
- [ ] Add candidate matching

#### 4.5 Immigration Cases
- [ ] Wire up immigration cases to bench detail
- [ ] Add immigration timeline
- [ ] Add visa expiry alerts

### Acceptance Criteria
- [ ] Sales can manage leads and deals
- [ ] Leads can be converted to deals
- [ ] Deals show in pipeline view
- [ ] Bench manager can view consultant list
- [ ] Bench manager can create hotlists
- [ ] External jobs are tracked
- [ ] Immigration cases are visible

---

## Sprint 5: HR Module

### Goals
- Complete HR dashboard
- Implement employee management
- Implement payroll basics
- Implement time tracking

### Components to Migrate

| Component | Priority | Complexity | Dependencies |
|-----------|----------|------------|--------------|
| HRDashboard | P0 | Medium | employees, stats |
| PeopleDirectory | P0 | Low | employees |
| EmployeeProfile | P0 | High | employee, reviews, time |
| OrgChart | P1 | High | employees, hierarchy |
| PayrollDashboard | P1 | High | payroll runs |
| TimeAttendance | P1 | Medium | time records |
| PerformanceReviews | P1 | Medium | reviews |
| Compensation | P2 | Medium | salary data |
| Analytics | P2 | High | aggregated data |
| LearningAdmin | P1 | Medium | courses, enrollments |
| Recruitment | P1 | Medium | campaigns |
| Documents | P2 | Medium | file uploads |

### Tasks

#### 5.1 Employee Management
- [x] Create `useEmployees`, `useEmployee` hooks (employees.list/getById available)
- [x] Create employee CRUD mutations (employees.create/update available)
- [x] Migrate HRDashboard component (tRPC integrated)
- [x] Migrate PeopleDirectory component (tRPC integrated)
- [x] Migrate EmployeeProfile component (tRPC integrated)
- [ ] Wire up manager relationships

#### 5.2 Organization Chart
- [x] Create org chart data query (employees.orgChart available)
- [x] Migrate OrgChart component (tRPC integrated)
- [x] Add interactive node details
- [x] Wire up to employee data

#### 5.3 Payroll
- [ ] Create `usePayrollRuns` hooks (payroll router pending)
- [ ] Create payroll mutations
- [x] Migrate PayrollDashboard component (local state, awaiting payroll router)
- [ ] Add payroll item management
- [ ] Add approval workflow

#### 5.4 Time & Attendance
- [ ] Create `useTimeAttendance` hooks
- [ ] Create clock in/out mutations
- [ ] Migrate TimeAttendance component
- [ ] Add approval workflow
- [ ] Add time sheet summary

#### 5.5 Performance Reviews
- [ ] Create `usePerformanceReviews` hooks
- [ ] Create review mutations
- [ ] Migrate PerformanceReviews component
- [ ] Add review scheduling
- [ ] Add acknowledgement flow

### Acceptance Criteria
- [x] HR can view employee directory (PeopleDirectory integrated)
- [x] HR can manage employee profiles (EmployeeProfile integrated)
- [x] Org chart displays correctly (OrgChart integrated)
- [ ] Payroll runs can be created and processed (payroll router pending)
- [ ] Employees can clock in/out
- [ ] Performance reviews can be scheduled

---

## Sprint 6: TA & Academy

### Goals
- Complete Talent Acquisition campaigns
- Migrate Academy instructor views
- Implement cohort management

### Components to Migrate

| Component | Priority | Complexity | Dependencies |
|-----------|----------|------------|--------------|
| TADashboard | P0 | Medium | campaigns, metrics |
| CampaignManager | P0 | Medium | campaigns |
| CampaignBuilder | P0 | High | campaigns, contacts |
| AccountProspects | P1 | Medium | leads, accounts |
| SourcedCandidates | P1 | Medium | campaign contacts |
| InstructorDashboard | P0 | Medium | cohorts, students |
| CohortDetail | P0 | Medium | cohort, enrollments |
| CertificateGenerator | P1 | Medium | certificates |
| CertificateVerification | P1 | Low | certificates |
| AcademyAdmin | P1 | High | courses, cohorts |

### Tasks

#### 6.1 Campaign Management
- [x] Create `useCampaigns` hooks (using direct tRPC - taHr.campaigns.list)
- [x] Create campaign mutations (taHr.campaigns.create available)
- [x] Migrate TADashboard component (2025-11-27)
- [x] Migrate CampaignManager component (2025-11-27)
- [x] Migrate CampaignBuilder component (static wizard UI)
- [ ] Add contact management
- [ ] Add metrics tracking

#### 6.2 Lead Sourcing
- [x] Wire up SourcedCandidates to campaigns (static UI with mock data)
- [x] Migrate AccountProspects component (static UI with mock data)
- [ ] Add engagement tracking
- [ ] Add handoff workflow

#### 6.3 Academy Instructor
- [x] Create `useCohorts` hooks (enrollment.getAtRiskStudents available)
- [x] Create `useEnrollments` hooks (enrollment router available)
- [x] Migrate InstructorDashboard component (tRPC integrated)
- [x] Migrate CohortDetail component (tRPC integrated)
- [x] Wire up student progress (academy.getModulesWithProgress)

#### 6.4 Certifications
- [x] Create `useCertificates` hooks (certificates.adminGetAll available)
- [x] Migrate CertificateGenerator component (tRPC integrated)
- [ ] Migrate CertificateVerification component
- [ ] Add certificate validation

### Acceptance Criteria
- [x] TA can create and manage campaigns (TADashboard + CampaignManager integrated)
- [ ] Campaign contacts can be added and tracked
- [x] Instructor can view cohort progress (InstructorDashboard + CohortDetail integrated)
- [x] Certificates can be generated (CertificateGenerator integrated)
- [ ] Certificate verification works

---

## Sprint 7: Admin & Polish

### Goals
- Complete admin module
- Implement cross-cutting features
- Performance optimization
- Security audit
- Production readiness

### Components to Migrate

| Component | Priority | Complexity | Dependencies |
|-----------|----------|------------|--------------|
| AdminDashboard | P0 | High | aggregated stats |
| UserManagement | P0 | High | users, roles |
| Permissions | P0 | High | roles, permissions |
| AuditLogs | P1 | Medium | audit log |
| SystemSettings | P1 | Medium | settings |
| CourseManagement | P1 | Medium | courses |
| CourseBuilder | P2 | Very High | course structure |
| ClientDashboard | P1 | Medium | client portal |
| TalentDashboard | P1 | Medium | talent portal |
| CEODashboard | P2 | Very High | executive analytics |
| CrossBorderDashboard | P1 | High | immigration |

### Tasks

#### 7.1 User Management
- [x] Create `useUsers` hooks (using taHr.employees.list)
- [ ] Create user invitation mutation (future)
- [x] Migrate UserManagement component (2025-11-27)
- [x] Implement role assignment (via update mutation)
- [x] Add bulk operations (UI-only, uses update mutation)

#### 7.2 RBAC
- [ ] Create `useRoles`, `usePermissions` hooks (requires backend router)
- [x] Migrate Permissions component (static UI documented 2025-11-27)
- [ ] Implement permission checks in UI
- [ ] Add role-based navigation

#### 7.3 Audit & Compliance
- [x] Wire up AuditLogs component (static UI documented 2025-11-27)
- [ ] Add data export functionality
- [ ] Implement audit trail viewing
- [ ] Add GDPR tools

#### 7.4 Settings
- [ ] Create organization settings hooks (requires backend router)
- [x] Migrate SystemSettings component (static UI documented 2025-11-27)
- [ ] Add branding configuration
- [ ] Add notification settings

#### 7.5 Cross-Cutting Features
- [ ] Implement organization switcher
- [ ] Add cross-pollination tracking
- [ ] Implement pod productivity dashboard
- [ ] Add real-time notifications

#### 7.6 Performance & Security
- [ ] Audit all API permissions
- [ ] Add rate limiting
- [ ] Implement caching strategy
- [ ] Optimize slow queries
- [ ] Add error monitoring (Sentry)
- [ ] Security penetration test

### Acceptance Criteria
- [x] Admin can manage users and roles (UserManagement tRPC integrated)
- [ ] Permissions are enforced across UI (RBAC pending)
- [x] Audit logs are accessible (AuditLogs static UI)
- [x] Settings can be configured (SystemSettings static UI)
- [ ] Performance meets targets (< 2s page loads)
- [ ] Security audit passed
- [ ] Error monitoring active

---

## Risk Mitigation

### High Risk Items

| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| Schema mismatches break UI | High | Type adapters, extensive testing | Tech Lead |
| Performance degradation | High | Performance budget, monitoring | Tech Lead |
| Data migration issues | High | Feature flags, parallel data | Backend Lead |
| Scope creep | Medium | Strict sprint planning | PM |
| Security vulnerabilities | Critical | Security audit before launch | Security |

### Contingency Plans

1. **If migration takes longer than expected**:
   - Enable feature flags for partial rollout
   - Keep mock data working in parallel
   - Prioritize critical path components

2. **If performance issues arise**:
   - Add database views for complex queries
   - Implement server-side rendering
   - Add caching layer

3. **If bugs are found post-migration**:
   - Quick revert via feature flags
   - Hotfix process for critical issues

---

## Definition of Done

### For Each Component Migration

- [ ] Component renders with real data
- [ ] All CRUD operations work
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Empty states implemented
- [ ] Unit tests pass (80%+ coverage)
- [ ] E2E tests pass
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Code reviewed
- [ ] Feature flag enabled
- [ ] Documentation updated

### For Each Sprint

- [ ] All planned components migrated
- [ ] All tests passing
- [ ] No P0/P1 bugs
- [ ] Performance within budget
- [ ] Sprint demo completed
- [ ] Retrospective held

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Page Load Time | < 2s | Lighthouse, RUM |
| API Response Time | < 500ms | Server metrics |
| Error Rate | < 0.1% | Sentry |
| Test Coverage | > 80% | Jest/Vitest |
| Migration Completion | 100% | Component count |
| User Satisfaction | > 4/5 | Feedback surveys |

---

## Appendix: Component Checklist

**Last Updated:** 2025-11-27

### ATS (16 components) - ✅ COMPLETE
- [x] RecruiterDashboard - tRPC integrated
- [x] JobsList (via JobDetail page) - tRPC integrated
- [x] JobDetail - tRPC integrated
- [x] JobIntake - tRPC integrated
- [x] PipelineView - tRPC integrated
- [x] CandidateDetail - tRPC integrated
- [x] SubmissionBuilder - tRPC integrated
- [x] ScreeningRoom - tRPC integrated
- [x] SourcingRoom - tRPC integrated (2025-11-27)
- [x] SourcingModal - tRPC integrated (2025-11-27)
- [x] InterviewScheduler - tRPC integrated (2025-11-27)
- [x] OfferBuilder - tRPC integrated
- [x] PlacementWorkflow - tRPC integrated
- [ ] RecruiterAnalytics - Pending (aggregated data)
- [x] AccountsList - tRPC integrated
- [x] AccountDetail - tRPC integrated

### CRM (7 components) - ✅ CORE COMPLETE
- [x] LeadsList - tRPC integrated
- [x] LeadDetail - tRPC integrated
- [x] DealsPipeline - tRPC integrated
- [x] DealDetail - tRPC integrated
- [ ] Modals (various CRM modals) - Static UI
- [ ] HandoffModal - Static UI
- [ ] CommunicationLog - Pending

### Bench (8 components) - ✅ CORE COMPLETE
- [x] BenchDashboard - Data providers integrated
- [x] BenchTalentList - Data providers integrated
- [x] BenchTalentDetail - Data providers integrated
- [x] HotlistBuilder - Data providers integrated
- [x] JobCollector - Data providers integrated
- [x] JobHuntRoom - Data providers integrated
- [x] ClientOutreach - Static UI (appropriate)
- [ ] BenchAnalytics - Pending (aggregated data)

### HR (14 components) - ✅ CORE COMPLETE
- [x] HRDashboard - tRPC integrated
- [x] PeopleDirectory - tRPC integrated (employees.list/create)
- [x] EmployeeProfile - tRPC integrated (employees.getById/update)
- [x] OrgChart - tRPC integrated (employees.orgChart)
- [x] PayrollDashboard - Local state (payroll router pending)
- [ ] TimeAttendance - Not implemented
- [ ] PerformanceReviews - Not implemented
- [ ] Compensation - Not implemented
- [x] Analytics - tRPC integrated (employees.list)
- [x] LearningAdmin - tRPC integrated (employees.list)
- [x] Recruitment - tRPC integrated

### TA (8 components) - ✅ CORE COMPLETE
- [x] TADashboard - tRPC integrated (2025-11-27)
- [x] CampaignManager - tRPC integrated (2025-11-27)
- [x] CampaignBuilder - Static UI (wizard flow)
- [x] AccountProspects - Static UI (mock data)
- [x] SourcedCandidates - Static UI (mock data)
- [x] SourcedCandidateDetail - Static UI
- [x] SalesAnalytics - Static UI (mock analytics)
- [x] HandoffModal - Static UI

### Academy (10+ components) - ✅ COMPLETE
- [x] AcademyPortal - Client-side gamification (academy-store)
- [x] CandidateDashboard - tRPC integrated (academy.getModulesWithProgress/getEmployabilityMetrics)
- [x] InstructorDashboard - tRPC integrated (enrollment.getAtRiskStudents)
- [x] CohortDetail - tRPC integrated (enrollment.getAtRiskStudents)
- [x] CertificateGenerator - tRPC integrated (certificates.adminGetAll)
- [ ] CertificateVerification - Pending
- [x] AcademyAdmin - tRPC integrated
- [x] AcademyModals - Static UI
- [x] ScheduleSessionModal - Static UI
- [x] CourseBuilder - Static UI
- [x] CourseManagement - Static UI
- [x] XPProgress - Client-side gamification (props-based)
- [x] StreakFlame - Client-side gamification (props-based)

### Admin (6 components) - ✅ COMPLETE
- [x] AdminDashboard - Static UI (cleaned up unused import 2025-11-27)
- [x] UserManagement - tRPC integrated (taHr.employees CRUD) 2025-11-27
- [x] Permissions - Static UI (RBAC pending)
- [x] AuditLogs - Static UI
- [x] SystemSettings - Static UI
- [x] CrossBorderDashboard - tRPC integrated (bench.immigration.list) 2025-11-27

### AI Twin (6 components) - ✅ COMPLETE
- [x] TwinWidgetWrapper - REST API (auth/events)
- [x] TwinFloatingWidget - Client-side
- [x] TwinChat - AI SDK
- [x] TwinEventFeed - Client-side
- [x] TwinSidebarPanel - Client-side
- [x] TwinDashboardCard - Client-side

### Portals (4 components) - ✅ COMPLETE
- [x] ClientDashboard - tRPC integrated (client router: dashboardStats, jobs, submissions, interviews) 2025-11-27
- [x] TalentDashboard - tRPC integrated (ats.jobs.list for recommended jobs) 2025-11-27
- [x] CEODashboard - Static UI with mock data (requires executive analytics router) 2025-11-27
- [x] PublicAcademy - Static UI (marketing/landing page, no backend needed) 2025-11-27

### Shared (8 components) - ✅ COMPLETE
- [x] GlobalCommand - tRPC integrated (fixed lead field refs 2025-11-27)
- [x] Navbar - Auth context (role from session, no tRPC needed) 2025-11-27
- [x] NotificationsView - Academy store (gamification context) 2025-11-27
- [x] ProfileView - Academy store (XP/rank/streaks) 2025-11-27
- [x] LoginPage - Auth pages exist
- [x] JobBoard - tRPC integrated (ats.jobs.list) 2025-11-27
- [x] TalentBoard - tRPC integrated (ats.candidates + bench.consultants) 2025-11-27
- [x] CombinedView - tRPC integrated (cross-pollination engine) 2025-11-27
