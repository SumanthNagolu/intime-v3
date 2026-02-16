# InTime: Current State Assessment

This document captures what exists in InTime v3 today.

---

## Summary

InTime v3 is a sophisticated web-based staffing platform with:
- **417 database tables**
- **77 tRPC routers**
- **65+ UI components**
- **21 entity types**
- **Comprehensive workflow/automation infrastructure**
- **Guidewire-inspired UI patterns**

The foundation is solid but fragmented across multiple navigation patterns.

---

## What Exists (Strengths)

### Entity Management ✅

| Entity | Status | Notes |
|--------|--------|-------|
| Candidates | Complete | Full CRUD, profiles, skills, documents |
| Jobs | Complete | Requirements, skills, assignments |
| Submissions | Complete | Status tracking, history |
| Interviews | Complete | Scheduling, feedback |
| Offers | Complete | Terms, approval workflow |
| Placements | Complete | Timesheets, check-ins, extensions |
| Accounts | Complete | Health scores, contracts, billing |
| Contacts | Complete | Polymorphic (person/company) |
| Deals | Complete | Pipeline stages, forecasting |
| Leads | Complete | Qualification, scoring |
| Campaigns | Complete | Marketing automation |
| Timesheets | Complete | Submission, approval, payroll |
| Invoices | Complete | Generation, tracking |

### Workflow Engine ✅

**Location:** `src/lib/workflows/`

- State machine with transitions
- 8 workflow types: approval, status_auto, notification, sla_escalation, field_auto, assignment, webhook, scheduled
- 6 trigger events: record_created, record_updated, field_changed, status_changed, time_based, manual
- 18 condition operators
- 7 action types: update_field, send_notification, create_activity, trigger_webhook, run_workflow, assign_user, create_task
- Multi-step approval with escalation
- Workflow versioning

### Activity System ✅

**Location:** `src/server/routers/activityPatterns.ts`

- Activity patterns (templates)
- Auto-creation from events
- Outcome tracking
- Follow-up rules
- Activity chaining (successors)
- Priority and assignment strategies
- Gamification (points)

### Event System ✅

**Location:** `src/server/events/`

- Pub/sub pattern
- Event subscriptions
- Event handlers
- Comprehensive event store
- Retry logic with dead letter queue

### Notification System ✅

**Location:** `src/lib/notifications/`

- Multi-channel: in-app, email, SMS, push
- 25+ notification types
- User preferences
- Priority levels
- Resend integration for email

### SLA Management ✅

- SLA definitions per entity/activity type
- Warning and critical thresholds
- Escalation levels
- Breach tracking

### Integrations ⚠️ Partial

| Integration | Status |
|-------------|--------|
| Gusto (Payroll) | ✅ Complete |
| DocuSign (E-sign) | ✅ Complete |
| Okta (SSO) | ✅ Complete |
| Resend (Email sending) | ✅ Complete |
| Gmail/Outlook (Email inbox) | ❌ Missing |
| Phone/Dialer | ❌ Missing |
| Calendar | ❌ Missing |
| LinkedIn | ❌ Missing |
| SMS | ⚠️ Capability defined |

### V4 UI (Linear-style) ⚠️ Started

**Location:** `src/components/v4/`, `src/app/demo/`

- Command palette exists
- Entity list/view components
- AI-native demo (full recruiting flow)
- New design tokens

---

## What's Missing (Gaps)

### Critical Gaps

| Component | Impact | Priority |
|-----------|--------|----------|
| **Unified Inbox** | Users don't know what to work on | P0 |
| **Email Integration** | Communication happens outside app | P0 |
| **Phone Integration** | Calls not tracked, context lost | P0 |
| **Calendar Integration** | Scheduling happens outside app | P0 |
| **Context Engine** | No automatic context linking | P0 |
| **Workflow Guidance** | Users don't see optimal path | P0 |

### High Priority Gaps

| Component | Impact | Priority |
|-----------|--------|----------|
| **Desktop Shell** | Can't be "one app" without it | P1 |
| **Screen Collection** | Can't guide without knowing state | P1 |
| **Real-time Collaboration** | Teams work in silos | P1 |
| **AI Assistant** | Only exists in demo | P1 |

### Medium Priority Gaps

| Component | Impact | Priority |
|-----------|--------|----------|
| **LinkedIn Integration** | Sourcing requires tab switching | P2 |
| **SMS Integration** | Candidate communication limited | P2 |
| **Mobile App** | Field users can't access | P2 |
| **Voice Recording** | Call quality not tracked | P2 |

---

## Architecture Assessment

### Database Schema

**Strengths:**
- Comprehensive entity model (417 tables)
- Proper soft deletes
- Audit trails everywhere
- Multi-tenant (org_id scoping)
- Partitioned tables for scale

**Gaps:**
- No communication_threads table (for unified inbox)
- No email_messages table (for email integration)
- No phone_calls table (for call logging)
- No calendar_events table (for calendar sync)

### API Layer (tRPC)

**Strengths:**
- 77 routers covering all entities
- Type-safe end-to-end
- Proper input validation
- One-call pattern for detail pages

**Gaps:**
- No email sync router
- No phone router
- No calendar router
- No unified inbox router

### Frontend

**Strengths:**
- 65+ UI components
- Config-driven views
- Entity workspace pattern
- V4 components started

**Gaps:**
- No unified inbox view
- No email view
- No phone dialer
- No calendar view
- Context panel not implemented
- Workflow guide not implemented

### Integrations

**Strengths:**
- Provider pattern exists
- OAuth token management
- Health monitoring
- Retry/failover logic

**Gaps:**
- Email provider not implemented
- Phone provider not implemented
- Calendar provider not implemented

---

## Technical Debt

### Code Organization

| Issue | Severity | Notes |
|-------|----------|-------|
| Multiple navigation patterns | Medium | Journey vs Section vs Module |
| Duplicate components | Low | Some entity-specific vs generic |
| Inconsistent state management | Medium | Zustand + Context + props |
| V4 parallel to main | High | Need to converge |

### Performance

| Issue | Severity | Notes |
|-------|----------|-------|
| Large bundle size | Medium | UI component library |
| No code splitting by route | Medium | All routes load everything |
| No real-time updates | High | Polling only |

### Testing

| Issue | Severity | Notes |
|-------|----------|-------|
| Limited test coverage | High | Need unit + integration tests |
| No E2E tests | High | Critical workflows untested |
| No performance tests | Medium | Load testing needed |

---

## Infrastructure Assessment

### Current Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | Next.js 15 + React 19 | Current |
| API | tRPC | Current |
| Database | Supabase (PostgreSQL) | Stable |
| ORM | Drizzle | Current |
| Auth | Supabase Auth | Stable |
| Styling | Tailwind CSS | Current |
| State | Zustand + React Context | Mixed |
| Forms | React Hook Form + Zod | Current |

### Needed for Desktop

| Layer | Technology | Status |
|-------|------------|--------|
| Desktop Shell | Tauri | Not started |
| Phone/SIP | WebRTC / Twilio | Not started |
| Email Sync | Gmail/Outlook API | Not started |
| Calendar Sync | Google/Outlook Cal API | Not started |
| Real-time | WebSockets / Supabase Realtime | Not started |
| Push Notifications | Native + Web Push | Not started |

---

## Migration Path

### What Can Be Reused

| Component | Reuse Level | Notes |
|-----------|-------------|-------|
| Database schema | 90% | Add comms tables |
| tRPC routers | 95% | Add new routers |
| Entity management | 100% | Core is solid |
| Workflow engine | 100% | Ready for use |
| Activity system | 100% | Ready for use |
| Event system | 100% | Ready for use |
| Notification system | 95% | Add channels |
| UI components | 80% | Refactor for V4 |
| V4 components | 100% | Build on these |

### What Needs Rebuilding

| Component | Effort | Notes |
|-----------|--------|-------|
| Unified Inbox | High | New view + API |
| Email Integration | High | Provider + UI |
| Phone Integration | High | Provider + UI |
| Calendar Integration | High | Provider + UI |
| Context Engine | High | New service |
| Workflow Guidance | Medium | UI overlay |
| Desktop Shell | High | Tauri wrapper |

---

## Recommendations

### Immediate (Next 2 Weeks)

1. **Finalize V4 design system** - Converge on one pattern
2. **Build Unified Inbox** - Make it the home view
3. **Add Context Panel** - Right sidebar everywhere
4. **Implement Workflow Guide** - Progress bar + guidance

### Short Term (Weeks 3-8)

1. **Email Integration** - Gmail/Outlook API
2. **Calendar Integration** - Scheduling in-app
3. **Communication Context Engine** - Auto-link comms to entities
4. **Enhanced Command Palette** - Natural language

### Medium Term (Weeks 9-16)

1. **Desktop Shell** - Tauri wrapper
2. **Phone Integration** - Click-to-call, logging
3. **AI Assistant** - Move from demo to production
4. **Real-time Updates** - WebSocket layer

### Long Term (Beyond Week 16)

1. **Mobile App** - React Native or PWA
2. **LinkedIn Integration** - Profile lookup, messaging
3. **Voice Intelligence** - Call recording, transcription
4. **Predictive Features** - AI matching, forecasting
