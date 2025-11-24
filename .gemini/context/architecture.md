# Architecture & Schema

## Core Principles
1.  **Unified Schema**: One `user_profiles` table for ALL roles (Student, Employee, Candidate, etc.). Avoid data silos.
2.  **Event-Driven**: Modules communicate via `EventBus`. No direct tight coupling.
3.  **Strict Typing**: TypeScript everywhere. No `any`.
4.  **RLS Enabled**: Row Level Security on all tables.

## Database Schema (Key Tables)
### `user_profiles`
-   **Purpose**: Single source of truth for all users.
-   **Key Fields**: `id`, `email`, `full_name`, `role` (via `user_roles`), `student_enrollment_date`, `candidate_status`, `employee_department`.
-   **Constraints**: Soft deletes (`deleted_at`), Check constraints on status fields.

### `project_timeline`
-   **Purpose**: Comprehensive logging of AI/Agent interactions.
-   **Fields**: `session_id`, `agent_type`, `conversation_summary`, `actions_taken`, `decisions`.

### `guru_interactions`
-   **Purpose**: Logs interactions with AI Agents (Guru).
-   **Key Fields**: `student_id`, `agent_type` (MUST be valid specialist type, NOT 'coordinator'), `input`, `output`.

## Event Bus
-   **Location**: `src/lib/events`
-   **Pattern**: Publish/Subscribe.
-   **Usage**: Trigger badges, notifications, and cross-module updates.

## Tech Stack
-   **Frontend**: Next.js 15 (App Router), Tailwind CSS, shadcn/ui.
-   **Backend**: Supabase (PostgreSQL), Trpc.
-   **AI**: OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Gemini Pro.
