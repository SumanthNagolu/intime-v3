# Video Extraction: Ultimate Jira Tutorial for Beginners
**Source**: [YouTube Video](https://www.youtube.com/watch?v=8jWKwiIcWPI)
**Channel**: Stewart Gauld

## Video Content Breakdown
I have analyzed the video chapters to understand the core feature set required to replicate the "Jira Board" experience in the Team Workspace.

### Key Features Identified
1.  **Project/Team Setup** (0:00 - 3:53)
    -   Equivalent to our `TeamWorkspace`.
    -   Adding team members (we already have `MembersSection`).

2.  **Scrum Structure** (3:53 - 8:24)
    -   **Epics**: High-level goals.
    -   **Stories**: User requirements.
    -   **Tasks**: Actionable items.
    -   *Mapping*: We can map these to our `Activities` (Tasks) and `Jobs` (Epics/Stories).

3.  **Sprint Management** (10:22)
    -   Adding items to a Sprint.
    -   *Mapping*: We can add a "Sprint" or "Phase" field to `Activity` or just use Due Dates initially.

4.  **Views**
    -   **Timeline View** (11:37): Gantt chart style.
    -   **Board View** (12:03): Kanban board (To Do, In Progress, Done). **<-- PRIMARY GOAL**
    -   **List View** (12:57): Our current `TeamActivitySection` (implied).

## Implementation Strategy: "Team Workspace as Board"

Based on the video's "Board View" chapter (12:03), here is how we will "ingrain" this into the Team Workspace.

### 1. Board UI Structure
We will create a **Kanban Board** tab in the Team Workspace.
-   **Columns**:
    -   `To Do` (Open/New)
    -   `In Progress` (Assigned/Working)
    -   `Review` (Pending Review)
    -   `Done` (Completed)

### 2. Card Content (The "Issue")
Each card on the board will represent an **Activity** or **Submission**:
-   **Title**: Subject/Candidate Name
-   **Type Icon**: Call, Email, Task, Submission.
-   **Assignee**: Avatar of team member.
-   **Priority**: Low/Medium/High tag.
-   **Video Inspiration**: The card should look like the Jira card shown at 12:15 (clean, white background, shadow on hover).

### 3. Workflow
-   **Drag & Drop**: Moving a card updates its `status`.
-   **Filters**: "Only My Issues" (mentioned in video as "Your Work" at 14:07).

## Next Steps
I have prepared the `implementation_plan_team_board.md` to build this features.
-   [x] Analyze Video
-   [ ] Create Board Component
-   [ ] Integrate into Team Workspace
