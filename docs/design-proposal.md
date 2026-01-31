# design-proposal.md

## "Cinematic Enterprise" - Redesign Proposal

### 1. The Vision
Move away from the "Traditional Enterprise" (grids, gray borders, dense data) to a **"Cinematic Productivity"** interface.
Think **Linear meets Jira**, but with your premium "Forest & Gold" branding.

### 2. Core Visual Pillars
- **Glassmorphism 2.0**: Instead of solid white backgrounds, use `bg-white/80` with `backdrop-blur-xl` to let subtle "Aurora" gradients shine through from the background.
- **Sofft Depth**: Replace hard borders (`border-charcoal-200`) with soft, colored shadows (`shadow-lg shadow-forest/5`).
- **Typography**:
  - **Headings**: `Outfit` or `Plus Jakarta Sans` - Geometric, modern, friendly.
  - **Body**: `Inter` or `Geist Sans` - Ultra-readable, technical.
- **Vibrant Accents**: 
  - **Forest Green**: Shift from "Flat Green" to a deep, rich **Emerald**.
  - **Gold**: Shift from "Mustard" to a metallic, gradient **Champagne**.

### 3. Screen-Specific Changes

#### A. Team Workspace (The "Hub")
*Current*: A grid of 4 small KPI cards + a list of managers + list of activities.
*Proposed*:
- **Hero Header**: A full-width "Command Center" card with a mesh gradient background. It shows the most critical team stats (Capacity, Active Placements) in large, hero typography.
- **Kanban First**: Instead of hiding the board, the "Pending Activities" section BECOMES a mini-Kanban board right on the overview. You can drag items *immediately*.
- **Quick Actions**: Floating action bar for "New Job", "Add Member" with a glass effect.

#### B. Candidate Workspace (The "Profile")
*Current*: A standard resume-style layout.
*Proposed*:
- **Split View**: Left side is a "Sticky" Profile Card (Photo, Quick Stats, Availability) that stays with you as you scroll.
- **Timeline**: The Work History is visualized as a connected timeline, not just a list of boxes.
- **Skill Matrix**: A visual "Radar Chart" or "Tag Cloud" for skills instead of a simple list.

### 4. Technical Implementation
1.  **Tokens**: Add `glass`, `aurora`, and `soft-shadow` tokens to `tailwind.config.ts`.
2.  **Layout**: specialized `TeamDashboardLayout` wrapper.
3.  **Components**: Update `Card` (or create `GlassCard`) to use the new tokens.

### 5. Why the "Fresh Eye"?
You have the *functional* parity with Jira (tasks, stories, epics identified in `video_analysis.md`).
Now you need the *emotional* parity - the feeling of "flow" and lack of friction. This design removes visual friction (borders, heavy grays) to make the data feel weightless.
