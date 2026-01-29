# Workspace Merge & Scrum/PM System Implementation Plan

## Overview

Merge "My Workspace" and "My Team Space" into a unified "Workspaces" navigation with a dropdown switcher, while evolving Team Space into a full Scrum/PM application like Jira.

## Current State

- Two separate top nav items: "My Workspace" and "My Team Space"
- Each has its own dropdown menu with different items
- Team Space has basic team dashboard, activities, work queue
- Database already has: `pods`, `pod_sprint_metrics`, `team_metrics`, `activities`
- Kanban board exists using `@dnd-kit` library

## Target Architecture

```
Top Nav:
  [Workspaces ▼] → Dropdown with workspace switcher at top
                   - My Space (personal)
                   - Team Space (Scrum/PM)

My Space:          Team Space (Scrum/PM):
- Dashboard        - Sprint Board (Kanban)
- Today            - Backlog
- My Activities    - Active Sprint
- My Pipeline      - Sprint Planning
- My Entities      - Retrospectives
- Reports          - Velocity/Reports
                   - Team Settings
```

---

## Phase 1: Unified Workspaces Navigation

### 1.1 Merge Top Nav Tabs

**File:** `src/lib/navigation/top-navigation.ts`

```typescript
// Replace 'workspace' and 'team' tabs with single 'workspaces' tab
{
  id: 'workspaces',
  label: 'Workspaces',
  entityType: 'workspace',
  icon: LayoutGrid,
  defaultHref: '/employee/workspace',
  dropdown: [
    // Workspace Switcher (special type)
    { id: 'workspace-switcher', type: 'workspace-switcher' },
    { id: 'divider-ws', label: '', type: 'divider' },
    // Items will be dynamic based on selected workspace
    // My Space items when mySpace selected
    // Team Space items when teamSpace selected
  ],
}
```

### 1.2 Create Workspace Switcher Component

**New File:** `src/components/navigation/WorkspaceSwitcher.tsx`

```typescript
interface WorkspaceSwitcherProps {
  currentWorkspace: 'my-space' | 'team-space'
  onSwitch: (workspace: 'my-space' | 'team-space') => void
  teamName?: string
}
```

Features:
- Two clickable options: "My Space" and "Team Space"
- Visual indicator for current selection (checkmark or highlight)
- Team Space shows team name if user has team
- Persist selection in localStorage

### 1.3 Update TopNavigation Component

**File:** `src/components/navigation/TopNavigation.tsx`

Changes:
- Add state for `currentWorkspace`
- Render `WorkspaceSwitcher` in dropdown
- Dynamically show menu items based on selected workspace
- Update URL path handling for `/employee/workspace` vs `/employee/team`

### 1.4 Update Active Tab Detection

**File:** `src/lib/navigation/top-navigation.ts`

```typescript
// Both paths now map to 'workspaces' tab
if (pathname.includes('/employee/workspace') || pathname.includes('/employee/team')) {
  return 'workspaces'
}
```

### 1.5 Update Role Navigation Config

**File:** `src/lib/navigation/role-navigation.config.ts`

- Replace `['workspace', 'team']` with `['workspaces']` in all role configs
- Add `teamSpaceAccess` boolean to control Team Space visibility

---

## Phase 2: Database Schema Extensions

### 2.1 Sprints Table

**SQL Migration:**

```sql
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  pod_id UUID NOT NULL REFERENCES pods(id),

  -- Sprint Identity
  sprint_number INTEGER NOT NULL,
  name TEXT NOT NULL,  -- e.g., "Sprint 42" or custom name

  -- Timeline
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Goals
  goal TEXT,
  goal_achieved BOOLEAN,

  -- Status
  status TEXT NOT NULL DEFAULT 'planning', -- 'planning' | 'active' | 'review' | 'completed' | 'cancelled'

  -- Metrics (denormalized for performance)
  planned_points INTEGER DEFAULT 0,
  completed_points INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  completed_items INTEGER DEFAULT 0,

  -- Ceremonies
  planning_completed_at TIMESTAMPTZ,
  review_completed_at TIMESTAMPTZ,
  retro_completed_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),

  CONSTRAINT sprints_dates_check CHECK (end_date >= start_date),
  CONSTRAINT sprints_number_unique UNIQUE (pod_id, sprint_number)
);

CREATE INDEX sprints_org_id_idx ON sprints(org_id) WHERE deleted_at IS NULL;
CREATE INDEX sprints_pod_id_idx ON sprints(pod_id) WHERE deleted_at IS NULL;
CREATE INDEX sprints_status_idx ON sprints(org_id, status) WHERE deleted_at IS NULL;
```

### 2.2 Sprint Items (Stories/Tasks)

**SQL Migration:**

```sql
CREATE TABLE sprint_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  sprint_id UUID REFERENCES sprints(id),  -- NULL = in backlog

  -- Item Identity
  item_number TEXT NOT NULL,  -- e.g., "TEAM-123"
  title TEXT NOT NULL,
  description TEXT,

  -- Type & Status
  item_type TEXT NOT NULL DEFAULT 'story', -- 'epic' | 'story' | 'task' | 'bug' | 'spike'
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'

  -- Priority & Estimation
  priority TEXT NOT NULL DEFAULT 'medium', -- 'critical' | 'high' | 'medium' | 'low'
  story_points INTEGER,

  -- Assignment
  assignee_id UUID REFERENCES user_profiles(id),
  reporter_id UUID REFERENCES user_profiles(id),

  -- Hierarchy
  parent_id UUID REFERENCES sprint_items(id),  -- For subtasks
  epic_id UUID REFERENCES sprint_items(id),    -- Link to epic

  -- Linked Entities (recruiting integration)
  linked_entity_type TEXT,  -- 'job' | 'submission' | 'candidate' | 'activity'
  linked_entity_id UUID,

  -- Board Position
  board_column TEXT NOT NULL DEFAULT 'todo',
  board_order INTEGER NOT NULL DEFAULT 0,

  -- Backlog Position (when not in sprint)
  backlog_order INTEGER,

  -- Labels/Tags
  labels TEXT[] DEFAULT '{}',

  -- Time Tracking
  time_estimate_hours NUMERIC,
  time_spent_hours NUMERIC DEFAULT 0,

  -- Dates
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX sprint_items_org_id_idx ON sprint_items(org_id) WHERE deleted_at IS NULL;
CREATE INDEX sprint_items_sprint_id_idx ON sprint_items(sprint_id) WHERE deleted_at IS NULL;
CREATE INDEX sprint_items_assignee_idx ON sprint_items(assignee_id) WHERE deleted_at IS NULL;
CREATE INDEX sprint_items_backlog_idx ON sprint_items(org_id, backlog_order) WHERE sprint_id IS NULL AND deleted_at IS NULL;
CREATE INDEX sprint_items_linked_idx ON sprint_items(linked_entity_type, linked_entity_id) WHERE deleted_at IS NULL;
```

### 2.3 Board Columns (Customizable)

**SQL Migration:**

```sql
CREATE TABLE board_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  pod_id UUID NOT NULL REFERENCES pods(id),

  -- Column Definition
  column_key TEXT NOT NULL,  -- 'todo' | 'in_progress' | 'review' | 'done' | custom
  name TEXT NOT NULL,
  description TEXT,

  -- Display
  color TEXT DEFAULT 'gray',  -- Tailwind color name
  icon TEXT,  -- Lucide icon name
  position INTEGER NOT NULL DEFAULT 0,

  -- WIP Limit
  wip_limit INTEGER,  -- NULL = no limit

  -- Status Mapping
  maps_to_status TEXT NOT NULL,  -- Which sprint_items.status values go here

  -- Behavior
  is_done_column BOOLEAN DEFAULT FALSE,  -- Items here count as completed
  is_initial_column BOOLEAN DEFAULT FALSE,  -- New items go here

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT board_columns_unique UNIQUE (pod_id, column_key)
);
```

### 2.4 Sprint Retrospectives

**SQL Migration:**

```sql
CREATE TABLE sprint_retrospectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  sprint_id UUID NOT NULL REFERENCES sprints(id),

  -- Retro Content (arrays of items)
  went_well JSONB DEFAULT '[]',      -- [{text, votes, author_id}]
  to_improve JSONB DEFAULT '[]',     -- [{text, votes, author_id}]
  action_items JSONB DEFAULT '[]',   -- [{text, assignee_id, completed, due_date}]

  -- Participation
  participants UUID[] DEFAULT '{}',

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'in_progress' | 'completed'
  completed_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.5 Sprint Burndown Data

**SQL Migration:**

```sql
CREATE TABLE sprint_burndown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  sprint_id UUID NOT NULL REFERENCES sprints(id),

  -- Daily Snapshot
  snapshot_date DATE NOT NULL,

  -- Points
  remaining_points INTEGER NOT NULL,
  completed_points INTEGER NOT NULL,
  added_points INTEGER DEFAULT 0,  -- Scope creep

  -- Items
  remaining_items INTEGER NOT NULL,
  completed_items INTEGER NOT NULL,

  -- Calculated ideal burndown
  ideal_remaining_points NUMERIC,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT sprint_burndown_unique UNIQUE (sprint_id, snapshot_date)
);
```

### 2.6 Extend Activities Table

**SQL Migration:**

```sql
-- Add sprint-related fields to existing activities table
ALTER TABLE activities
  ADD COLUMN sprint_item_id UUID REFERENCES sprint_items(id),
  ADD COLUMN story_points INTEGER,
  ADD COLUMN board_column TEXT DEFAULT 'todo';

-- Index for sprint board queries
CREATE INDEX activities_sprint_item_idx ON activities(sprint_item_id) WHERE deleted_at IS NULL;
```

---

## Phase 3: Backend/tRPC Implementation

### 3.1 Sprint Router

**New File:** `src/server/routers/sprints.ts`

```typescript
export const sprintsRouter = router({
  // Sprint CRUD
  list: orgProtectedProcedure.query(...),
  get: orgProtectedProcedure.input(z.object({ id: z.string() })).query(...),
  create: orgProtectedProcedure.input(createSprintSchema).mutation(...),
  update: orgProtectedProcedure.input(updateSprintSchema).mutation(...),

  // Sprint Lifecycle
  startSprint: orgProtectedProcedure.input(z.object({ id: z.string() })).mutation(...),
  completeSprint: orgProtectedProcedure.input(z.object({ id: z.string() })).mutation(...),

  // Sprint Board
  getBoard: orgProtectedProcedure.input(z.object({ sprintId: z.string() })).query(...),

  // Sprint Metrics
  getBurndown: orgProtectedProcedure.input(z.object({ sprintId: z.string() })).query(...),
  getVelocity: orgProtectedProcedure.input(z.object({ podId: z.string(), count: z.number() })).query(...),
})
```

### 3.2 Sprint Items Router

**New File:** `src/server/routers/sprint-items.ts`

```typescript
export const sprintItemsRouter = router({
  // Item CRUD
  list: orgProtectedProcedure.query(...),
  get: orgProtectedProcedure.input(z.object({ id: z.string() })).query(...),
  create: orgProtectedProcedure.input(createItemSchema).mutation(...),
  update: orgProtectedProcedure.input(updateItemSchema).mutation(...),
  delete: orgProtectedProcedure.input(z.object({ id: z.string() })).mutation(...),

  // Board Operations
  moveItem: orgProtectedProcedure.input(moveItemSchema).mutation(...),
  reorderItems: orgProtectedProcedure.input(reorderSchema).mutation(...),

  // Backlog Operations
  getBacklog: orgProtectedProcedure.query(...),
  addToSprint: orgProtectedProcedure.input(addToSprintSchema).mutation(...),
  removeFromSprint: orgProtectedProcedure.input(z.object({ id: z.string() })).mutation(...),
  reorderBacklog: orgProtectedProcedure.input(reorderSchema).mutation(...),

  // Bulk Operations
  bulkMove: orgProtectedProcedure.input(bulkMoveSchema).mutation(...),
  bulkAssign: orgProtectedProcedure.input(bulkAssignSchema).mutation(...),
})
```

### 3.3 Board Router

**New File:** `src/server/routers/board.ts`

```typescript
export const boardRouter = router({
  // Column Management
  getColumns: orgProtectedProcedure.input(z.object({ podId: z.string() })).query(...),
  createColumn: orgProtectedProcedure.input(createColumnSchema).mutation(...),
  updateColumn: orgProtectedProcedure.input(updateColumnSchema).mutation(...),
  deleteColumn: orgProtectedProcedure.input(z.object({ id: z.string() })).mutation(...),
  reorderColumns: orgProtectedProcedure.input(reorderSchema).mutation(...),

  // Board State
  getFullBoard: orgProtectedProcedure.input(z.object({
    podId: z.string(),
    sprintId: z.string().optional(),
  })).query(...),
})
```

### 3.4 Retrospectives Router

**New File:** `src/server/routers/retrospectives.ts`

```typescript
export const retrospectivesRouter = router({
  get: orgProtectedProcedure.input(z.object({ sprintId: z.string() })).query(...),
  create: orgProtectedProcedure.input(createRetroSchema).mutation(...),

  // Retro Items
  addItem: orgProtectedProcedure.input(addRetroItemSchema).mutation(...),
  voteItem: orgProtectedProcedure.input(voteItemSchema).mutation(...),

  // Action Items
  addActionItem: orgProtectedProcedure.input(addActionSchema).mutation(...),
  completeActionItem: orgProtectedProcedure.input(z.object({ id: z.string() })).mutation(...),

  // Lifecycle
  start: orgProtectedProcedure.input(z.object({ sprintId: z.string() })).mutation(...),
  complete: orgProtectedProcedure.input(z.object({ sprintId: z.string() })).mutation(...),
})
```

### 3.5 Update App Router

**File:** `src/server/routers/_app.ts`

```typescript
export const appRouter = router({
  // ... existing routers
  sprints: sprintsRouter,
  sprintItems: sprintItemsRouter,
  board: boardRouter,
  retrospectives: retrospectivesRouter,
})
```

---

## Phase 4: Team Space UI (Scrum/PM)

### 4.1 Team Space Layout

**File:** `src/app/employee/team/layout.tsx`

Updated layout with new sidebar structure:

```typescript
const teamSpaceSections = [
  { id: 'board', label: 'Sprint Board', icon: LayoutGrid, href: '/employee/team' },
  { id: 'backlog', label: 'Backlog', icon: ListTodo, href: '/employee/team/backlog' },
  { id: 'sprints', label: 'Sprints', icon: Rocket, href: '/employee/team/sprints' },
  { id: 'divider-1' },
  { id: 'planning', label: 'Sprint Planning', icon: Target, href: '/employee/team/planning' },
  { id: 'retro', label: 'Retrospectives', icon: History, href: '/employee/team/retro' },
  { id: 'divider-2' },
  { id: 'velocity', label: 'Velocity', icon: TrendingUp, href: '/employee/team/velocity' },
  { id: 'reports', label: 'Reports', icon: BarChart3, href: '/employee/team/reports' },
  { id: 'divider-3' },
  { id: 'settings', label: 'Team Settings', icon: Settings, href: '/employee/team/settings' },
]
```

### 4.2 Sprint Board Page

**File:** `src/app/employee/team/page.tsx`

Main Scrum board with:
- Header: Sprint name, dates, progress bar, sprint goal
- Columns: Configurable (default: To Do, In Progress, Review, Done)
- Cards: Draggable sprint items with assignee, points, labels
- Quick filters: By assignee, label, type
- Sprint selector dropdown

### 4.3 Sprint Board Component

**New File:** `src/components/team-space/SprintBoard.tsx`

Enhanced Kanban board:
- Uses existing `@dnd-kit` patterns
- Sortable items within columns
- Cross-column drag-and-drop
- WIP limit warnings
- Swimlanes option (by assignee or type)
- Quick actions on cards

### 4.4 Sprint Item Card

**New File:** `src/components/team-space/SprintItemCard.tsx`

Card showing:
- Item number (e.g., "TEAM-123")
- Title
- Type icon (story/task/bug/spike)
- Story points badge
- Assignee avatar
- Priority indicator
- Labels
- Linked entity indicator
- Due date (if set)

### 4.5 Backlog Page

**File:** `src/app/employee/team/backlog/page.tsx`

Features:
- Sortable list of all items not in active sprint
- Drag to reorder priority
- Bulk select and move to sprint
- Create new items inline
- Filter by type, label, assignee
- Epic grouping view

### 4.6 Sprint Planning Page

**File:** `src/app/employee/team/planning/page.tsx`

Two-panel layout:
- Left: Backlog items (draggable)
- Right: Sprint items (droppable)
- Sprint capacity calculator
- Point totals
- Team member assignment

### 4.7 Retrospective Page

**File:** `src/app/employee/team/retro/page.tsx`

Three-column layout:
- Went Well (green)
- To Improve (amber)
- Action Items (blue)

Features:
- Anonymous mode option
- Voting on items
- Group similar items
- Action item assignment
- Previous retro comparison

### 4.8 Velocity & Reports Page

**File:** `src/app/employee/team/velocity/page.tsx`

Charts:
- Velocity chart (points per sprint)
- Burndown chart (current sprint)
- Burnup chart (cumulative)
- Cycle time distribution
- Sprint commitment vs completion

### 4.9 Sprint Item Detail Drawer

**New File:** `src/components/team-space/SprintItemDrawer.tsx`

Slide-in panel with:
- Full item details
- Description (markdown)
- Comments
- Activity log
- Linked entity preview
- Time tracking
- Sub-items list

---

## Phase 5: Recruiting Integration

### 5.1 Job → Epic Linking

Allow jobs to be treated as epics:
- Create sprint items from job requirements
- Link submissions to sprint items
- Track job fill progress on board

### 5.2 Activity → Task Sync

Existing activities can appear on board:
- Filter activities by current sprint
- Sync status changes bidirectionally
- Show recruiting context in item detail

### 5.3 Auto-Create Items from Events

When recruiting events happen, optionally create sprint items:
- New job posted → Create story for "Source candidates"
- Submission created → Create task for "Review submission"
- Interview scheduled → Create task for "Conduct interview"

---

## Phase 6: Migration & Defaults

### 6.1 Default Board Columns

Create default columns for existing pods:

```sql
INSERT INTO board_columns (org_id, pod_id, column_key, name, position, maps_to_status, is_initial_column, is_done_column, color)
SELECT
  p.org_id,
  p.id,
  'todo',
  'To Do',
  0,
  'todo',
  TRUE,
  FALSE,
  'gray'
FROM pods p
WHERE NOT EXISTS (SELECT 1 FROM board_columns bc WHERE bc.pod_id = p.id);

-- Repeat for in_progress, review, done columns
```

### 6.2 Item Number Sequence

Add sequence per org for item numbers:

```sql
CREATE SEQUENCE sprint_item_number_seq;

CREATE OR REPLACE FUNCTION generate_item_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.item_number := 'ITEM-' || nextval('sprint_item_number_seq');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sprint_items_number_trigger
BEFORE INSERT ON sprint_items
FOR EACH ROW EXECUTE FUNCTION generate_item_number();
```

---

## Implementation Order

### Week 1: Navigation Merge
1. Create WorkspaceSwitcher component
2. Update top-navigation.ts config
3. Update TopNavigation.tsx
4. Update role configs
5. Add localStorage persistence

### Week 2: Database Schema
1. Create sprints table
2. Create sprint_items table
3. Create board_columns table
4. Create sprint_retrospectives table
5. Create sprint_burndown table
6. Add migrations for activities table

### Week 3: Backend APIs
1. sprints router
2. sprint-items router
3. board router
4. retrospectives router
5. Connect to app router

### Week 4: Core UI
1. Sprint Board page & component
2. Sprint Item Card
3. Backlog page
4. Sprint Item Drawer

### Week 5: Advanced UI
1. Sprint Planning page
2. Retrospective page
3. Velocity charts
4. Reports page

### Week 6: Integration & Polish
1. Recruiting entity linking
2. Auto-create from events
3. Team settings page
4. Testing & bug fixes

---

## Success Criteria

1. **Navigation**: Single "Workspaces" dropdown with clear switcher
2. **Board**: Functional drag-and-drop Kanban with WIP limits
3. **Backlog**: Prioritizable product backlog
4. **Sprints**: Full sprint lifecycle (plan → active → review → complete)
5. **Retrospectives**: Collaborative retro with action items
6. **Metrics**: Velocity and burndown charts
7. **Integration**: Jobs/activities can link to sprint items
8. **Performance**: Board loads < 500ms, drag updates < 100ms

---

## Files to Create/Modify

### New Files
- `src/components/navigation/WorkspaceSwitcher.tsx`
- `src/server/routers/sprints.ts`
- `src/server/routers/sprint-items.ts`
- `src/server/routers/board.ts`
- `src/server/routers/retrospectives.ts`
- `src/components/team-space/SprintBoard.tsx`
- `src/components/team-space/SprintItemCard.tsx`
- `src/components/team-space/SprintItemDrawer.tsx`
- `src/components/team-space/BacklogList.tsx`
- `src/components/team-space/SprintPlanningView.tsx`
- `src/components/team-space/RetrospectiveBoard.tsx`
- `src/components/team-space/VelocityChart.tsx`
- `src/components/team-space/BurndownChart.tsx`
- `src/app/employee/team/backlog/page.tsx`
- `src/app/employee/team/sprints/page.tsx`
- `src/app/employee/team/planning/page.tsx`
- `src/app/employee/team/retro/page.tsx`
- `src/app/employee/team/velocity/page.tsx`
- `src/app/employee/team/settings/page.tsx`
- `src/types/scrum.ts`
- `database/migrations/add_scrum_tables.sql`

### Modified Files
- `src/lib/navigation/top-navigation.ts`
- `src/components/navigation/TopNavigation.tsx`
- `src/lib/navigation/role-navigation.config.ts`
- `src/server/routers/_app.ts`
- `src/app/employee/team/layout.tsx`
- `src/app/employee/team/page.tsx`
- `src/types/workspace.ts`
