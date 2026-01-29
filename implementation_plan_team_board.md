# Implementation Plan: Team Workspace Board

## Objective
Implement a Jira-style Kanban/Scrum board within the Team Workspace to visualize and manage team activities and tasks. This aligns with the "Ultimate Jira Tutorial" video, effectively transforming the Team Workspace into a project management board.

## References
- **Video**: Ultimate Jira Tutorial for Beginners (Stewart Gauld)
- **Target**: `src/components/workspaces/TeamWorkspace.tsx`
- **Goal**: "Team workspace acting as boards"

## Features
1.  **Kanban Board View**:
    - Columns: **To Do**, **In Progress**, **Review**, **Done**.
    - Cards: Represent `TeamActivity` (Tasks).
    - Drag & Drop: Move cards between columns to update status.
2.  **Integration**:
    - Add a "Board" tab/section to the overarching Team Workspace.
    - Seamless switching between List View (Activities) and Board View.

## Technical Architecture

### 1. New Component: `TeamBoardSection`
**Location**: `src/components/workspaces/team/sections/TeamBoardSection.tsx`

**Dependencies**:
- `@dnd-kit/core`: For drag-and-drop context and sensors.
- `@dnd-kit/sortable`: For sortable columns and cards.
- `lucide-react`: For icons (Plus, MoreHorizontal, etc.).

**Props**:
- `activities`: `TeamWorkspaceActivity[]` (Data source).
- `onUpdateActivity`: `(id: string, newStatus: string) => void` (Callback for mutations).

**Structure**:
- **BoardContainer**: Horizontal scrollable container.
- **Column**: Droppable area for each status.
- **TaskCard**: Draggable item displaying Activity Subject, Priority, Due Date, and Assignee.

### 2. Update `TeamWorkspace`
**Location**: `src/components/workspaces/TeamWorkspace.tsx`

- Use `TeamBoardSection` when `currentSection === 'board'`.
- Pass `activities` data to the board.
- Implement `handleActivityUpdate` (initially optimistic UI update or mock, later API integration).

### 3. Data Model & Navigation
- leverage existing `TeamWorkspaceActivity` type.
- Map existing statuses (e.g., 'open', 'pending') to Board Columns.
- Add "Board" to the navigation options (or replace "Activities" with a specialized view that offers both List and Board modes).

## Step-by-Step Implementation

1.  **Create `TeamBoardSection.tsx`**: Implement the visual board with hardcoded columns and `dnd-kit` logic.
2.  **Card Design**: Create a generic `BoardCard` component to display activity details aesthetically (Priority tags, Due Date colors).
3.  **Integrate**: Modify `TeamWorkspace.tsx` to include the new section.
4.  **Wiring**: Connect the drag-end event to a handler that updates the local state (and eventually calls `trpc` mutation).

## Future Enhancements (Post-Implementation)
- "Add Task" button in each column.
- Swimlanes (by Assignee).
- Sprint logic (filtering by due date).
