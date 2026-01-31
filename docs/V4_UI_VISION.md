# InTime v4: UI Vision Document

## The Problem with Current Enterprise Staffing UIs

Traditional staffing software (Bullhorn, Ceipal, even our current Guidewire-inspired design) suffers from:

1. **Entity-centric thinking** - "Go to Jobs page, find job, go to Candidates page, find candidate, submit"
2. **Modal hell** - Click → Modal → Save → Close → Click → Modal → Save
3. **Context switching** - Constantly losing your place jumping between screens
4. **Mouse dependency** - Every action requires hunting for buttons
5. **Feature bloat** - 100 visible buttons, 5 you actually use
6. **Slow feedback** - Spinners, page reloads, waiting

## The New Mental Model: Flow-Based Work

Instead of thinking about **entities** (Jobs, Candidates, Accounts), we think about **workflows**:

- "I need to fill this urgent Java role"
- "I'm working on submissions for Acme Corp today"
- "I'm sourcing for 3 jobs this week"

The UI should support **focus** and **flow**, not navigation.

---

## Core Design Principles

### 1. Split View is Default

**Never navigate away from context.** When you click a candidate, they open in a panel - you still see the list.

```
┌─────────────────────────────────────────────────────────────────┐
│ ⌘K Search                                    Mike Chen ⚙       │
├────────────────┬────────────────────────────────────────────────┤
│                │                                                │
│   CANDIDATE    │   SARAH CHEN                                   │
│   LIST         │   ────────────────────────────────────────     │
│                │   Senior React Developer                       │
│   ○ Sarah Chen │   sarah@email.com • (555) 123-4567             │
│   ○ John Smith │                                                │
│   ○ Mike Lee   │   [Submit to Job] [Schedule Call] [Email]      │
│   ○ Emily Davis│                                                │
│   ○ Alex Wilson│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                │   QUICK INFO                                   │
│                │   Status: Active     Rate: $150k               │
│                │   Location: SF       Available: Now            │
│                │                                                │
│                │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                │   SKILLS                                       │
│                │   React • TypeScript • Node.js • AWS           │
│                │                                                │
│                │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                │   SUBMISSIONS (3)                              │
│                │   → Acme Corp - React Dev (Interview)          │
│                │   → BigCo - Full Stack (Submitted)             │
│                │   → StartupXYZ - Lead Dev (Rejected)           │
│                │                                                │
└────────────────┴────────────────────────────────────────────────┘
```

### 2. Command Palette is Everything

Press `⌘K` from anywhere:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐     │
│   │ 🔍 submit sarah chen to acme                          │     │
│   ├───────────────────────────────────────────────────────┤     │
│   │                                                       │     │
│   │   ACTIONS                                             │     │
│   │   ────────                                            │     │
│   │   ⚡ Submit Sarah Chen to Job...              ⌘⇧S     │     │
│   │   📋 Create Submission for Sarah Chen                 │     │
│   │                                                       │     │
│   │   JOBS MATCHING SARAH'S SKILLS                        │     │
│   │   ────────────────────────────                        │     │
│   │   💼 Acme Corp - Senior React Developer               │     │
│   │   💼 BigCo - Frontend Lead (95% match)                │     │
│   │   💼 TechStart - Full Stack Engineer                  │     │
│   │                                                       │     │
│   │   RECENT                                              │     │
│   │   ────────                                            │     │
│   │   👤 Sarah Chen (viewed 2m ago)                       │     │
│   │   💼 Acme Corp Job (viewed 5m ago)                    │     │
│   │                                                       │     │
│   └───────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Natural language commands:**
- "show me react developers in nyc"
- "submit john to acme job"
- "jobs with no submissions this week"
- "remind me to follow up with sarah tomorrow"

### 3. Inline Everything

No modals for simple edits. Click → Edit → Tab to next → Auto-save.

```
Before (Modal):
  Click "Edit" → Modal opens → Change field → Click "Save" → Modal closes

After (Inline):
  Click field → Type → Tab or click away → Saved
```

**Inline status change:**
```
┌──────────────────────────────────────────────────────┐
│ Sarah Chen                                           │
│ Status: [Active ▾]  ←── Click dropdown, pick new    │
│         ┌─────────────┐                              │
│         │ ● Active    │                              │
│         │ ○ On Hold   │                              │
│         │ ○ Placed    │                              │
│         │ ○ Inactive  │                              │
│         └─────────────┘                              │
└──────────────────────────────────────────────────────┘
```

### 4. Keyboard First, Mouse Welcome

Every action has a keyboard shortcut. Power users fly, new users discover.

```
NAVIGATION (G + _)
G then J → Go to Jobs
G then C → Go to Candidates
G then S → Go to Submissions
G then A → Go to Accounts
G then I → Go to Inbox

CREATION (C + _)
C then J → Create Job
C then C → Create Candidate
C then S → Create Submission

ACTIONS (on selected item)
E → Edit
D → Delete (with confirm)
Enter → Open
Space → Quick preview
S → Submit to job (on candidate)
X → Toggle select

LIST NAVIGATION
J / ↓ → Move down
K / ↑ → Move up
⌘J → Move to bottom
⌘K → Open command palette
/ → Focus search
Esc → Clear selection / Close panel
```

### 5. Spaces for Context

Segment your work into Spaces. Each Space has its own:
- Pinned items
- Recent history
- Filters
- Layout preference

```
┌─────────────────────────────────────────────────────────────────┐
│ [🔍 ⌘K]                                              Mike Chen │
├─────────────┬───────────────────────────────────────────────────┤
│             │                                                   │
│  SPACES     │                                                   │
│  ──────     │                                                   │
│  ● Recruit  │     (Space content here)                          │
│  ○ Sales    │                                                   │
│  ○ Bench    │                                                   │
│  ○ Admin    │                                                   │
│             │                                                   │
│  ──────     │                                                   │
│  PINNED     │                                                   │
│  ⭐ Hot Jobs│                                                   │
│  ⭐ VIPs    │                                                   │
│             │                                                   │
│  ──────     │                                                   │
│  RECENT     │                                                   │
│  Sarah Chen │                                                   │
│  Acme Corp  │                                                   │
│  React Job  │                                                   │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

---

## Screen-by-Screen Redesign

### Home / Inbox

Not a dashboard with charts. A **work queue** of things needing attention.

```
┌─────────────────────────────────────────────────────────────────┐
│ ⌘K Search for anything...                        Mike Chen ⚙   │
├─────────────┬───────────────────────────────────────────────────┤
│             │                                                   │
│  SPACES     │   INBOX                                    ⋮      │
│  ● Recruit  │   ─────────────────────────────────────────────   │
│             │   Filter: [All ▾] [Today ▾] [Sort: Priority ▾]   │
│  PINNED     │                                                   │
│  ⭐ Hot Jobs│   ┌─────────────────────────────────────────────┐ │
│             │   │ 🔴 HIGH                                     │ │
│  RECENT     │   │                                             │ │
│  Sarah Chen │   │ □ Review submission: Sarah → Acme Corp      │ │
│  Acme Corp  │   │   Submitted 2h ago • Interview scheduled    │ │
│             │   │                                             │ │
│             │   │ □ Client waiting: BigCo rate negotiation    │ │
│             │   │   Stalled for 3 days • $150k contract       │ │
│             │   │                                             │ │
│             │   ├─────────────────────────────────────────────┤ │
│             │   │ 🟡 MEDIUM                                   │ │
│             │   │                                             │ │
│             │   │ □ Source candidates for TechStart job       │ │
│             │   │   0 submissions • Due Friday                │ │
│             │   │                                             │ │
│             │   │ □ Follow up with John Smith                 │ │
│             │   │   No response for 5 days                    │ │
│             │   │                                             │ │
│             │   ├─────────────────────────────────────────────┤ │
│             │   │ ✓ COMPLETED TODAY (3)                       │ │
│             │   │   ✓ Submitted Mike Lee to BigCo             │ │
│             │   │   ✓ Scheduled interview for Alex            │ │
│             │   │   ✓ Closed TechCorp deal                    │ │
│             │   └─────────────────────────────────────────────┘ │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

### Jobs View

Split view with pipeline visualization.

```
┌─────────────────────────────────────────────────────────────────┐
│ ⌘K Jobs                          [+ New Job]     Mike Chen ⚙   │
├─────────────┬───────────────────────────────────────────────────┤
│             │                                                   │
│  SPACES     │   JOBS                           [List] [Board]  │
│  ● Recruit  │   ─────────────────────────────────────────────   │
│             │   [🔍 Filter jobs...] [Status ▾] [Client ▾]       │
│  VIEWS      │                                                   │
│  ○ All Jobs │   ┌──────────┬──────────┬──────────┬──────────┐   │
│  ○ My Jobs  │   │ DRAFT(2) │ OPEN(8)  │ FILLED(3)│ CLOSED   │   │
│  ○ Hot      │   ├──────────┼──────────┼──────────┼──────────┤   │
│             │   │          │          │          │          │   │
│  CLIENTS    │   │ TechCorp │●Acme Corp│ BigCo    │ OldCo    │   │
│  Acme (5)   │   │ React Dev│ Sr React │ ML Eng   │ DevOps   │   │
│  BigCo (3)  │   │          │ 12 sub   │          │          │   │
│  TechCorp(2)│   │          │          │          │          │   │
│             │   │          │ StartupX │          │          │   │
│             │   │          │ FullStack│          │          │   │
│             │   │          │ 3 sub    │          │          │   │
│             │   │          │          │          │          │   │
│             │   └──────────┴──────────┴──────────┴──────────┘   │
│             │                                                   │
│             │   ● = Currently selected                          │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

### Job Detail (Split View)

When you click a job, it opens in the right panel. The list stays visible.

```
┌─────────────────────────────────────────────────────────────────┐
│ ⌘K Jobs › Acme Corp - Sr React Developer    [Actions ▾] ✕      │
├─────────────┬───────────────────────────────────────────────────┤
│             │                                                   │
│ JOBS        │   ACME CORP                                       │
│ ─────       │   Senior React Developer                          │
│ ○ TechCorp  │   ─────────────────────────────────────────────   │
│ ● Acme Corp │   Open • $140-160k • San Francisco • Remote OK    │
│ ○ StartupX  │                                                   │
│ ○ BigCo     │   [Submit Candidate ⌘S] [Edit] [Share] [Close]    │
│             │                                                   │
│             │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│             │                                                   │
│             │   PIPELINE                              [+ Add]   │
│             │   ───────────────────────────────────────────     │
│             │   Submitted(5) → Interview(2) → Offer(1)          │
│             │                                                   │
│             │   ┌─────────────────────────────────────────────┐ │
│             │   │ 🟢 Sarah Chen        Interview Tomorrow      │ │
│             │   │    React • TypeScript • 8 yrs • $155k        │ │
│             │   │    [View] [Schedule] [Reject]                │ │
│             │   ├─────────────────────────────────────────────┤ │
│             │   │ 🟡 John Smith        Submitted 2 days ago    │ │
│             │   │    React • Node • 5 yrs • $140k              │ │
│             │   │    [View] [Schedule] [Reject]                │ │
│             │   ├─────────────────────────────────────────────┤ │
│             │   │ 🔵 Mike Lee          Offer Extended          │ │
│             │   │    React • AWS • 10 yrs • $165k              │ │
│             │   │    [View] [Accept] [Decline]                 │ │
│             │   └─────────────────────────────────────────────┘ │
│             │                                                   │
│             │   ACTIVITY                                        │
│             │   ─────────                                       │
│             │   Today: Mike extended offer                      │
│             │   Yesterday: Sarah interview scheduled            │
│             │   2d ago: John submitted                          │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

### Candidates View

Cards with photos, inline actions on hover.

```
┌─────────────────────────────────────────────────────────────────┐
│ ⌘K Candidates                [+ New Candidate]   Mike Chen ⚙   │
├─────────────┬───────────────────────────────────────────────────┤
│             │                                                   │
│  SPACES     │   CANDIDATES                    [Grid] [List]     │
│  ● Recruit  │   ─────────────────────────────────────────────   │
│             │   [🔍 Search...] [Skills ▾] [Status ▾] [Loc ▾]    │
│  FILTERS    │                                                   │
│  ○ Active   │   ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  ○ Available│   │  [Photo]  │ │  [Photo]  │ │  [Photo]  │       │
│  ○ My Cands │   │           │ │           │ │           │       │
│             │   │Sarah Chen │ │John Smith │ │ Mike Lee  │       │
│  SKILLS     │   │Sr React   │ │Full Stack │ │  DevOps   │       │
│  React (45) │   │SF • $155k │ │NYC • $140k│ │ LA • $160k│       │
│  Node (32)  │   │           │ │           │ │           │       │
│  AWS (28)   │   │ Active 🟢 │ │Available🟡│ │ Placed 🔵 │       │
│             │   │           │ │           │ │           │       │
│             │   │[Submit][📧]│ │[Submit][📧]│ │ [View]    │       │
│             │   └───────────┘ └───────────┘ └───────────┘       │
│             │                                                   │
│             │   ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│             │   │  [Photo]  │ │  [Photo]  │ │  [Photo]  │       │
│             │   │Emily Davis│ │Alex Wilson│ │Chris Brown│       │
│             │   │  Backend  │ │   ML Eng  │ │  Frontend │       │
│             │   └───────────┘ └───────────┘ └───────────┘       │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

### Candidate Detail (Panel)

When you click a candidate, panel slides in from right.

```
┌─────────────────────────────────────────────────────────────────┐
│ ⌘K Candidates                                    Mike Chen ⚙   │
├─────────────────────────────────┬───────────────────────────────┤
│                                 │                               │
│   CANDIDATES (faded)            │   SARAH CHEN            ✕     │
│                                 │   ─────────────────────────   │
│   ┌───────┐ ┌───────┐ ┌───────┐ │   [📷]  Senior React Developer│
│   │ Sarah │ │ John  │ │ Mike  │ │         sarah@email.com       │
│   │ ●     │ │       │ │       │ │         (555) 123-4567        │
│   └───────┘ └───────┘ └───────┘ │         San Francisco, CA     │
│                                 │                               │
│   ┌───────┐ ┌───────┐ ┌───────┐ │   [Submit to Job] [Email] [📞]│
│   │ Emily │ │ Alex  │ │ Chris │ │                               │
│   └───────┘ └───────┘ └───────┘ │   ━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                 │   Status    [Active ▾]        │
│                                 │   Rate      [$155,000]        │
│                                 │   Available [Now ▾]           │
│                                 │   Work Auth [US Citizen]      │
│                                 │                               │
│                                 │   ━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                 │   SKILLS (click to edit)      │
│                                 │   React • TypeScript • Node   │
│                                 │   AWS • GraphQL • Docker      │
│                                 │                               │
│                                 │   ━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                 │   SUBMISSIONS                 │
│                                 │   → Acme Corp (Interview)     │
│                                 │   → BigCo (Submitted)         │
│                                 │                               │
│                                 │   ━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                 │   NOTES                       │
│                                 │   [+ Add note...]             │
│                                 │                               │
└─────────────────────────────────┴───────────────────────────────┘
```

### Quick Submit Flow

Instead of navigating to a creation page, command palette handles it:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│      ┌─────────────────────────────────────────────────┐        │
│      │  SUBMIT SARAH CHEN TO JOB                       │        │
│      ├─────────────────────────────────────────────────┤        │
│      │                                                 │        │
│      │  Candidate: Sarah Chen ✓                        │        │
│      │                                                 │        │
│      │  Select Job:                                    │        │
│      │  ┌───────────────────────────────────────────┐  │        │
│      │  │ 🔍 Search jobs...                         │  │        │
│      │  ├───────────────────────────────────────────┤  │        │
│      │  │ MATCHING SARAH'S SKILLS (95%+)            │  │        │
│      │  │ ● Acme Corp - Sr React Developer          │  │        │
│      │  │   SF • $140-160k • React, TypeScript      │  │        │
│      │  │                                           │  │        │
│      │  │ ○ BigCo - Frontend Lead                   │  │        │
│      │  │   NYC • $150-180k • React, Team Lead      │  │        │
│      │  │                                           │  │        │
│      │  │ ○ StartupX - Full Stack                   │  │        │
│      │  │   Remote • $130-150k • React, Node        │  │        │
│      │  └───────────────────────────────────────────┘  │        │
│      │                                                 │        │
│      │  Rate: [$155,000        ]  (Sarah's rate)       │        │
│      │  Notes: [Add submission notes...]               │        │
│      │                                                 │        │
│      │  [Cancel]                    [Submit ⌘↵]        │        │
│      │                                                 │        │
│      └─────────────────────────────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Library

### 1. Command Palette

The most important component. Replaces 90% of navigation.

```typescript
Features:
- Natural language search ("react developers in NYC")
- Recent items (auto-tracked)
- Keyboard shortcuts shown
- Context-aware actions (different on Job vs Candidate)
- Fuzzy matching
- AI-powered suggestions
```

### 2. Split Panel

The primary viewing pattern. List + Detail side-by-side.

```typescript
Features:
- Resizable divider
- Collapsible (full-width modes)
- Remembers width preference
- Swipe to close on mobile
- Keyboard: Esc to close, Tab to focus
```

### 3. Inline Edit Field

Every field is directly editable.

```typescript
Features:
- Click to edit
- Tab to next field
- Esc to cancel
- Auto-save on blur
- Optimistic UI
- Undo support (Cmd+Z)
```

### 4. Quick Card

Compact entity representation with hover actions.

```typescript
Features:
- Avatar/icon
- Primary text (name)
- Secondary text (title, status)
- Status indicator (color dot)
- Hover: action buttons appear
- Click: opens in split panel
```

### 5. Smart Filter Bar

Dynamic filters based on entity type.

```typescript
Features:
- Type to filter (instant)
- Saved filter presets
- Multi-select dropdowns
- Date ranges
- Clear all button
- Filter count badge
```

### 6. Activity Stream

Real-time activity with smart grouping.

```typescript
Features:
- Grouped by time (Today, Yesterday, This Week)
- Inline actions (reply to comment)
- @mentions clickable
- Collapsible threads
- Real-time updates
```

### 7. Status Pill

Visual status indicator with quick change.

```typescript
Features:
- Color-coded by status
- Click to change (dropdown)
- Keyboard navigable
- Transition animations
- Disabled states
```

### 8. Toast/Notification

Non-blocking feedback.

```typescript
Features:
- Auto-dismiss (3s default)
- Undo action
- Progress indicator
- Stack multiple
- Click to dismiss
```

---

## Interaction Patterns

### 1. Click-to-Edit

Any text field becomes editable on click:

```
Display: "Sarah Chen"
Click:   [Sarah Chen|] ← cursor appears
Type:    [Sarah Jane Chen|]
Blur:    "Sarah Jane Chen" ← auto-saved
```

### 2. Hover-to-Reveal

Actions appear on hover, not always visible:

```
Default:  [Sarah Chen    Active    React Dev]
Hover:    [Sarah Chen    Active    React Dev] [Submit] [Edit] [⋮]
```

### 3. Drag-to-Reorder/Move

Pipeline stages, priorities, assignments:

```
Drag candidate card from "Submitted" column to "Interview" column
→ Status auto-updates
→ Toast: "Sarah moved to Interview"
→ Undo available
```

### 4. Type-to-Filter

Start typing anywhere in a list:

```
On Jobs page, just start typing "acme"
→ List instantly filters to Acme jobs
→ No need to click search first
```

### 5. Keyboard-First Navigation

```
J → Select next item
K → Select previous item
O → Open selected (or Enter)
E → Edit selected
D → Delete selected (with confirm)
/ → Focus search
Esc → Clear/Close
```

---

## Color System

### Dark Mode (Default)

```css
/* Backgrounds */
--bg-primary: #0A0A0A;      /* Main background */
--bg-secondary: #141414;     /* Sidebar, panels */
--bg-elevated: #1A1A1A;      /* Cards, modals */
--bg-hover: #242424;         /* Hover states */

/* Text */
--text-primary: #FAFAFA;     /* Primary text */
--text-secondary: #A1A1A1;   /* Secondary text */
--text-muted: #6B6B6B;       /* Muted text */

/* Borders */
--border-default: #2A2A2A;   /* Default borders */
--border-subtle: #1F1F1F;    /* Subtle borders */

/* Accent */
--accent-primary: #6366F1;   /* Primary actions */
--accent-hover: #818CF8;     /* Hover state */

/* Status */
--status-success: #22C55E;   /* Active, Placed */
--status-warning: #EAB308;   /* Pending, Review */
--status-error: #EF4444;     /* Urgent, Rejected */
--status-info: #3B82F6;      /* Info, New */
```

### Light Mode

```css
/* Backgrounds */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
--bg-elevated: #FFFFFF;
--bg-hover: #F3F4F6;

/* Text */
--text-primary: #111827;
--text-secondary: #6B7280;
--text-muted: #9CA3AF;

/* Borders */
--border-default: #E5E7EB;
--border-subtle: #F3F4F6;
```

---

## Typography

```css
/* System font stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Scale */
--text-xs: 11px;     /* Labels, badges */
--text-sm: 13px;     /* Secondary text */
--text-base: 14px;   /* Body text */
--text-lg: 16px;     /* Titles */
--text-xl: 20px;     /* Page headers */
--text-2xl: 24px;    /* Section headers */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;

/* Line heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

---

## Animation

```css
/* Durations */
--duration-instant: 50ms;    /* Hover colors */
--duration-fast: 100ms;      /* Small changes */
--duration-normal: 200ms;    /* Most transitions */
--duration-slow: 300ms;      /* Page transitions */

/* Easings */
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Examples */
.button:hover {
  transition: background var(--duration-instant) var(--ease-out);
}

.panel-enter {
  transition: transform var(--duration-normal) var(--ease-out);
}
```

---

## What We're Removing

### ❌ Wizard Steps
Before: 7-step wizard for job creation
After: Single form with smart defaults, expand sections as needed

### ❌ Modals for Everything
Before: Click Edit → Modal opens → Save → Close
After: Click field → Edit inline → Auto-save

### ❌ Entity-Centric Navigation
Before: Jobs page → Candidates page → Submissions page
After: Split view with context preserved

### ❌ Feature-Heavy Sidebar
Before: 20 navigation items in sidebar
After: Spaces + Pinned + Recent (5-8 items)

### ❌ Dashboard Charts
Before: Dashboard with 8 chart widgets
After: Inbox with actionable work items

### ❌ Separate View/Edit Modes
Before: View mode → Click Edit → Edit mode → Save
After: Everything is always editable inline

---

## Implementation Priority

### Phase 1: Foundation
1. Command Palette (Cmd+K)
2. Split Panel component
3. Dark/Light theme
4. Keyboard navigation hooks

### Phase 2: Core Views
5. Inbox (work queue)
6. Candidates list + panel
7. Jobs list + panel
8. Quick submit flow

### Phase 3: Power Features
9. Spaces
10. Inline editing
11. Real-time presence
12. Natural language commands

### Phase 4: Polish
13. Animations
14. Mobile responsive
15. Offline support
16. Keyboard shortcut overlay

---

## Success Metrics

1. **Time to submit candidate**: <30 seconds (down from 2+ minutes)
2. **Keyboard shortcut adoption**: 60%+ of power users
3. **Context switches per hour**: Reduce by 50%
4. **User satisfaction (NPS)**: >50
5. **Onboarding time**: <30 minutes to productive

---

## Summary

The new InTime v4 UI is built on these core beliefs:

1. **Work flows, not pages** - Keep context, reduce navigation
2. **Keyboard is faster** - Every action has a shortcut
3. **Edit inline, always** - No view/edit mode switching
4. **Show less, do more** - Progressive disclosure
5. **Speed is a feature** - Optimistic UI, instant feedback

This isn't a reskin - it's a rethinking of how recruiters work.
