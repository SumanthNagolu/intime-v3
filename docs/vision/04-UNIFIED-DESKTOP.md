# InTime: Unified Desktop Platform Vision

This document describes the transformation from the current Guidewire-inspired web app to a unified desktop platform where the entire organization works.

---

## The Principle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    THE INTIME PRINCIPLE                                 │
│                                                                         │
│   "Everything that happens in staffing happens in InTime"               │
│                                                                         │
│   • Every email sent or received                                        │
│   • Every call made or received                                         │
│   • Every meeting scheduled                                             │
│   • Every document signed                                               │
│   • Every decision made                                                 │
│                                                                         │
│   All captured. All contextualized. All guided.                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## The Three Pillars

```
                    ┌─────────────────┐
                    │   UNIFIED       │
                    │   INBOX         │
                    │                 │
                    │ Everything that │
                    │ needs attention │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   CONTEXT     │    │   WORKFLOW    │    │   COMMS       │
│   ENGINE      │    │   GUIDANCE    │    │   HUB         │
│               │    │               │    │               │
│ Understands   │    │ Shows the     │    │ Email, phone, │
│ what you're   │    │ ideal path    │    │ SMS, calendar │
│ working on    │    │ forward       │    │ all in one    │
└───────────────┘    └───────────────┘    └───────────────┘
```

### Pillar 1: Unified Inbox

Not a dashboard. Not a home page. A **work queue**.

Everything that needs your attention, prioritized by urgency and importance:
- Tasks due today
- Follow-ups scheduled
- Approvals waiting
- Alerts triggered
- Mentions received

Click → Do → Next.

### Pillar 2: Context Engine

The system understands what you're working on and shows relevant information:

- Open an email from "john@acme.com" → System shows:
  - John's contact profile
  - Acme's account health
  - Related jobs and submissions
  - Recent communication history
  - Suggested reply

- View Job #1234 → System shows:
  - Current workflow stage
  - What's been done
  - What should happen next
  - Who's involved
  - SLA status

### Pillar 3: Communication Hub

All communication channels in one place:
- Email (Gmail/Outlook) - read, send, search
- Phone (click-to-call, call logging)
- SMS (candidate communication)
- Calendar (scheduling, availability)
- LinkedIn (profile lookup, messaging)

Every communication automatically linked to the relevant entity.

---

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🔍 Search (⌘K)                    InTime       ▼ Spaces    👤 Profile  │
├─────────────────────────────────────────────────────────────────────────┤
│        │                                              │                 │
│  SIDE  │              MAIN AREA                       │    CONTEXT      │
│  NAV   │                                              │    PANEL        │
│        │  ┌─────────────────────────────────────────┐ │                 │
│ Inbox  │  │                                         │ │  ┌───────────┐  │
│ ══════ │  │         CONTENT VIEW                    │ │  │ ENTITY    │  │
│ Jobs   │  │                                         │ │  │ CONTEXT   │  │
│ Cands  │  │   (List / Detail / Board / Calendar)    │ │  │           │  │
│ Deals  │  │                                         │ │  │ Related   │  │
│ ...    │  │                                         │ │  │ Activities│  │
│        │  └─────────────────────────────────────────┘ │  │ Comms     │  │
│ ────── │                                              │  │ Next Step │  │
│ Comms  │  ┌─────────────────────────────────────────┐ │  │           │  │
│ ══════ │  │         WORKFLOW GUIDE BAR              │ │  └───────────┘  │
│ Email  │  │  ○ Intake → ● Sourcing → ○ Submit → ... │ │                 │
│ Phone  │  └─────────────────────────────────────────┘ │  ┌───────────┐  │
│ SMS    │                                              │  │ AI        │  │
│ Cal    │                                              │  │ ASSISTANT │  │
│        │                                              │  └───────────┘  │
└────────┴──────────────────────────────────────────────┴─────────────────┘
```

### Left Sidebar: Navigation
- **Inbox** - Work queue (default view)
- **Entity sections** - Jobs, Candidates, Accounts, etc.
- **Communication** - Email, Phone, SMS, Calendar
- **Spaces** - Custom saved workspaces

### Main Area: Content
- **List view** - Browse entities with filters
- **Detail view** - Full entity context
- **Board view** - Kanban pipelines
- **Calendar view** - Schedule visualization
- **Split view** - List + Detail side by side

### Workflow Guide Bar
- Shows current stage in workflow
- Highlights what's been done
- Indicates next step
- Surfaces blockers

### Right Panel: Context
- **Entity Context** - Related information
- **Recent Activity** - What's happened
- **Quick Actions** - Common actions
- **AI Assistant** - Natural language help

---

## Screen Inventory

### Primary Screens

| Screen | Purpose | View Modes |
|--------|---------|------------|
| **Inbox** | Work queue - what needs attention | List, Grouped by type |
| **Jobs** | Manage job requisitions | List, Board, Calendar |
| **Candidates** | Manage talent pool | List, Card, Board |
| **Submissions** | Track candidate-job matches | List, Board (by stage) |
| **Placements** | Manage active engagements | List, Calendar |
| **Accounts** | Manage client companies | List, Card |
| **Contacts** | Manage people | List |
| **Deals** | Manage sales pipeline | List, Board |
| **Email** | Unified email inbox | List, Thread |
| **Phone** | Call history and dialer | List, Active call |
| **Calendar** | Schedule and availability | Day, Week, Month |
| **Reports** | Analytics and insights | Dashboard, Detail |

### Context-Dependent Screens

| Screen | Appears When | Shows |
|--------|--------------|-------|
| **Entity Detail** | Entity selected | Full entity information |
| **Compose Email** | Sending email | Email editor with context |
| **Active Call** | Call in progress | Call controls, entity context, notes |
| **Meeting Prep** | Before scheduled meeting | Agenda, participants, context |
| **Approval Request** | Approval needed | Request details, approve/reject |

### Overlay Screens

| Screen | Trigger | Purpose |
|--------|---------|---------|
| **Command Palette** | ⌘K | Search everything, run commands |
| **Quick Create** | ⌘N | Create new entity |
| **Quick Search** | ⌘F | Search current view |
| **Notifications** | Click bell | Recent notifications |
| **Settings** | ⌘, | User preferences |

---

## Context Panel Design

The context panel is always visible on the right side, showing relevant information based on what the user is viewing.

### When Viewing a Candidate

```
┌─────────────────────────────┐
│ CONTEXT                     │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 👤 Sarah Chen           │ │
│ │ React Developer         │ │
│ │ San Francisco, CA       │ │
│ │ ───────────────────────│ │
│ │ Status: Available       │ │
│ │ Rate: $85-95/hr        │ │
│ │ Notice: 2 weeks        │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ ACTIVE WORKFLOWS            │
│ ┌─────────────────────────┐ │
│ │ 📋 Acme Corp - Sr React │ │
│ │    Stage: Interview     │ │
│ │    ○○●○○                │ │
│ │    Next: Prep call      │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ RECENT ACTIVITY             │
│ • Interview scheduled (2h)  │
│ • Email sent (yesterday)    │
│ • Screening call (3 days)   │
│ [View all →]                │
├─────────────────────────────┤
│ QUICK ACTIONS               │
│ [📧 Email] [📞 Call] [📝 Note] │
│ [Submit to Job] [Schedule]  │
└─────────────────────────────┘
```

### When Viewing a Job

```
┌─────────────────────────────┐
│ CONTEXT                     │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 💼 Senior React Dev     │ │
│ │ Acme Corporation        │ │
│ │ San Francisco (Hybrid)  │ │
│ │ ───────────────────────│ │
│ │ Status: Sourcing        │ │
│ │ Bill Rate: $120/hr      │ │
│ │ Priority: High          │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ WORKFLOW PROGRESS           │
│ ○ Intake    ✓ Complete      │
│ ● Sourcing  ← You are here  │
│ ○ Submit    0 submissions   │
│ ○ Interview                 │
│ ○ Offer                     │
│ ○ Close                     │
├─────────────────────────────┤
│ PIPELINE                    │
│ Matched: 12 candidates      │
│ Submitted: 0                │
│ Interviewing: 0             │
│ [View Pipeline →]           │
├─────────────────────────────┤
│ SLA STATUS                  │
│ ⚠️ First submission due     │
│    in 4 hours               │
├─────────────────────────────┤
│ QUICK ACTIONS               │
│ [Submit Candidate]          │
│ [View Matches]              │
│ [Contact Hiring Manager]    │
└─────────────────────────────┘
```

### When Viewing Email

```
┌─────────────────────────────┐
│ CONTEXT                     │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 📧 From: john@acme.com  │ │
│ │ Re: Interview Feedback  │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ LINKED ENTITIES             │
│ ┌─────────────────────────┐ │
│ │ 👤 John Smith           │ │
│ │    Hiring Manager       │ │
│ │    Acme Corporation     │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 📋 Sarah Chen → Acme    │ │
│ │    Stage: Interview     │ │
│ │    [Open Submission]    │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ SUGGESTED ACTIONS           │
│ This looks like interview   │
│ feedback. Would you like to:│
│                             │
│ [Log Feedback]              │
│ [Schedule Next Interview]   │
│ [Move to Offer]             │
│ [Reject Candidate]          │
├─────────────────────────────┤
│ SUGGESTED REPLY             │
│ "Thank you for the feedback │
│ John! I'll discuss next     │
│ steps with Sarah and..."    │
│ [Use This Reply]            │
└─────────────────────────────┘
```

---

## Workflow Guide System

Every entity type has a defined workflow. The system shows progress and guides users through it.

### Visual Representation

```
JOB WORKFLOW:

○────────●────────○────────○────────○────────○
Intake   Source   Submit   Interview  Offer   Close
         ↑
    You are here

Current Stage: Sourcing
Time in Stage: 2 days
Next Action: Submit first candidate
SLA Status: ⚠️ Due in 4 hours
```

### Guidance Prompts

At each stage, the system provides guidance:

**Stage: Sourcing**
```
┌─────────────────────────────────────────────────┐
│ 💡 GUIDANCE: Sourcing                           │
├─────────────────────────────────────────────────┤
│ Goal: Find 3-5 qualified candidates to submit   │
│                                                 │
│ Recommended Actions:                            │
│ ✓ Review AI-matched candidates (12 matches)     │
│ ○ Search pool for additional candidates         │
│ ○ Check hotlists for quick wins                 │
│                                                 │
│ [View Matched Candidates]                       │
├─────────────────────────────────────────────────┤
│ ⚠️ SLA: First submission due in 4 hours        │
└─────────────────────────────────────────────────┘
```

**Stage: Interview**
```
┌─────────────────────────────────────────────────┐
│ 💡 GUIDANCE: Interview                          │
├─────────────────────────────────────────────────┤
│ 2 candidates interviewing                       │
│                                                 │
│ Pending Actions:                                │
│ ⚠️ Sarah Chen - Prep call overdue              │
│    [Schedule Now]                               │
│ ○ Mike Johnson - Interview tomorrow             │
│    [Send Reminder]                              │
│                                                 │
│ After interviews:                               │
│ ○ Collect feedback within 24 hours              │
│ ○ Debrief with candidates                       │
└─────────────────────────────────────────────────┘
```

---

## Integration Architecture

### Communication Integrations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INTIME UNIFIED SHELL                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │   EMAIL       │  │   PHONE       │  │   CALENDAR    │               │
│  │   ADAPTER     │  │   ADAPTER     │  │   ADAPTER     │               │
│  │               │  │               │  │               │               │
│  │ • Gmail API   │  │ • Twilio      │  │ • Google Cal  │               │
│  │ • Outlook API │  │ • RingCentral │  │ • Outlook Cal │               │
│  │ • IMAP/SMTP   │  │ • Vonage      │  │ • CalDAV      │               │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘               │
│          │                  │                  │                        │
│          └──────────────────┼──────────────────┘                        │
│                             │                                           │
│                             ▼                                           │
│                   ┌───────────────────┐                                 │
│                   │  COMMUNICATION    │                                 │
│                   │  CONTEXT ENGINE   │                                 │
│                   │                   │                                 │
│                   │  Links all comms  │                                 │
│                   │  to entities      │                                 │
│                   └───────────────────┘                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Auto-Linking Logic

When an email/call/meeting occurs, the system automatically:

1. **Identify participants** - Match email/phone to contacts
2. **Find related entities** - Jobs, submissions, placements involving those contacts
3. **Determine context** - What workflow stage? What's the likely topic?
4. **Suggest actions** - Based on content and context

---

## Desktop Shell

### Why Desktop?

| Web Limitation | Desktop Solution |
|----------------|------------------|
| Can't integrate with OS phone | Native dialer integration |
| Browser tabs compete for attention | Single focused window |
| No global shortcuts | ⌘K from anywhere |
| Notifications lost in browser | OS-level notifications |
| Can't run in background | System tray presence |

### Technology: Tauri

Lightweight desktop shell wrapping the Next.js app:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ INTIME DESKTOP SHELL (Tauri)                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ NATIVE LAYER                                                      │  │
│  │                                                                   │  │
│  │ • Global keyboard shortcuts (⌘K from anywhere)                    │  │
│  │ • OS notifications (even when minimized)                          │  │
│  │ • Phone integration (SIP/WebRTC)                                  │  │
│  │ • System tray (always running)                                    │  │
│  │ • Deep links (intime://candidate/123)                             │  │
│  │ • Auto-updates                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ WEB LAYER (Next.js - existing app)                                │  │
│  │                                                                   │  │
│  │ • All existing UI                                                 │  │
│  │ • tRPC API                                                        │  │
│  │ • Real-time updates                                               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ BRIDGE LAYER                                                      │  │
│  │                                                                   │  │
│  │ • Web ↔ Native communication                                      │  │
│  │ • Phone events → Web UI                                           │  │
│  │ • Notification clicks → Navigation                                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘K | Open command palette |
| ⌘N | Quick create |
| ⌘1-9 | Switch to section |
| ⌘↵ | Take primary action |
| ⌘⇧P | Phone dialer |
| ⌘⇧M | Compose email |
| Esc | Close panel/cancel |

---

## Command Palette

The command palette (⌘K) is the universal interface for everything.

### Natural Language Commands

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔍 Type a command or search...                                    ⌘K   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ SUGGESTIONS                                                             │
│                                                                         │
│ 📋 "submit sarah to acme"                                              │
│    → Submit Sarah Chen to Acme Corp - Sr React Developer               │
│                                                                         │
│ 📞 "call john at acme"                                                 │
│    → Call John Smith (Hiring Manager) at Acme Corporation              │
│                                                                         │
│ 📧 "email sarah about interview"                                       │
│    → Compose email to Sarah Chen re: Interview                         │
│                                                                         │
│ 🔍 "show react developers in sf"                                       │
│    → Search candidates: React + San Francisco                          │
│                                                                         │
│ 📊 "jobs with no submissions this week"                                │
│    → Filter jobs: 0 submissions, created this week                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Command Categories

| Category | Examples |
|----------|----------|
| **Navigation** | go to jobs, open sarah chen, show pipeline |
| **Actions** | submit candidate, schedule interview, send email |
| **Search** | find react developers, jobs at acme, placements ending soon |
| **Filters** | my open tasks, jobs needing attention, overdue items |
| **Create** | new candidate, new job, new note |
| **Settings** | preferences, notifications, integrations |

---

## Success Metrics

### Adoption

| Metric | Target |
|--------|--------|
| Time in app per day | 6+ hours |
| Actions per session | 50+ |
| External tool usage | <30 min/day |
| Command palette usage | 20%+ of actions |

### Efficiency

| Metric | Before | Target |
|--------|--------|--------|
| Time to log activity | 2 min | 15 sec |
| Context switches/hour | 15 | 3 |
| Missed follow-ups | 20% | 2% |
| Data entry time | 40% | 10% |

### Outcomes

| Metric | Target |
|--------|--------|
| Placements per recruiter | +30% |
| Time to fill | -40% |
| Client retention | 95%+ |
| Candidate satisfaction | 4.5+ |
