# InTime Implementation Documentation

This directory contains the implementation plan and technical specifications.

## Documents

| Document | Description |
|----------|-------------|
| [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md) | 16-week phased implementation plan |

## Phase Overview

| Phase | Weeks | Focus | Key Deliverables |
|-------|-------|-------|------------------|
| **Phase 1** | 1-4 | Foundation | Unified Inbox, Context Panel, Workflow Guide |
| **Phase 2** | 5-8 | Communications | Email, Calendar, Communication Context |
| **Phase 3** | 9-12 | Desktop & Phone | Tauri Shell, Phone Integration, Global Shortcuts |
| **Phase 4** | 13-16 | Intelligence | AI Assistant, Smart Suggestions |

## Quick Start

### Week 1 Priorities
1. Finalize V4 design system
2. Create inbox database schema
3. Build inbox API router

### Key Technical Decisions
- **Desktop Shell**: Tauri (lightweight, Rust-based)
- **Email Integration**: Gmail API + Outlook Graph API
- **Phone Integration**: Twilio Voice
- **AI**: OpenAI API

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TAURI DESKTOP SHELL                          │
│  • Global shortcuts • System tray • Native notifications        │
├─────────────────────────────────────────────────────────────────┤
│                    NEXT.JS WEB LAYER                            │
│  • Unified Inbox • Context Panel • Workflow Guide              │
│  • Email View • Calendar View • Phone Dialer                   │
├─────────────────────────────────────────────────────────────────┤
│                    tRPC API LAYER                               │
│  • Inbox Router • Email Router • Calendar Router • Phone Router │
├─────────────────────────────────────────────────────────────────┤
│                    INTEGRATION LAYER                            │
│  • Gmail/Outlook • Google/Outlook Cal • Twilio • OpenAI        │
├─────────────────────────────────────────────────────────────────┤
│                    SUPABASE (PostgreSQL)                        │
│  • 417+ tables • Real-time subscriptions • Row-level security  │
└─────────────────────────────────────────────────────────────────┘
```

## New Database Tables

### Phase 1 (Foundation)
- `inbox_items` - Unified work queue
- `inbox_sources` - What creates inbox items

### Phase 2 (Communications)
- `email_accounts` - Connected email accounts
- `email_threads` - Email conversations
- `email_messages` - Individual messages
- `email_entity_links` - Links to entities
- `calendar_accounts` - Connected calendars
- `calendar_events` - Calendar events
- `calendar_entity_links` - Links to entities

### Phase 3 (Desktop & Phone)
- `phone_accounts` - Connected phone numbers
- `phone_calls` - Call records
- `phone_call_entity_links` - Links to entities

## New tRPC Routers

| Router | Purpose |
|--------|---------|
| `inbox` | Unified inbox operations |
| `workflowProgress` | Workflow stage calculation |
| `email` | Email sync and sending |
| `calendar` | Calendar sync and scheduling |
| `phone` | Phone calling and logging |
| `ai` | AI-powered features |

## Key Components

### Phase 1
- `InboxView` - Main inbox component
- `ContextPanel` - Right sidebar context
- `WorkflowGuide` - Workflow progress overlay
- `CommandPalette` - Enhanced ⌘K

### Phase 2
- `EmailInbox` - Email list and thread view
- `EmailCompose` - Send/reply modal
- `CalendarView` - Calendar display
- `EventCreateModal` - Create events

### Phase 3
- `PhoneDialer` - Initiate calls
- `ActiveCall` - In-call UI
- `CallOutcomeModal` - Log call results

### Phase 4
- `Assistant` - AI chat interface
- `Suggestions` - AI-powered suggestions

## Success Metrics

| Metric | Target |
|--------|--------|
| Time in app | 6+ hours/day |
| External tool usage | <30 min/day |
| Task completion | 90%+ |
| User satisfaction | 4.5+ stars |
