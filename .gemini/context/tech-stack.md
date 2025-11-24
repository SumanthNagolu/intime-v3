# Tech Stack & Standards

## Core Stack
-   **Framework**: Next.js 15 (App Router)
-   **Language**: TypeScript 5.x (Strict Mode)
-   **Database**: Supabase (PostgreSQL)
-   **API**: Trpc (Type-safe APIs)
-   **Styling**: Tailwind CSS + shadcn/ui
-   **State**: Zustand

## Development Standards
### Code Quality
-   **No `any` types**: Use proper interfaces/types.
-   **Server Components**: Default to Server Components; use `'use client'` only when necessary.
-   **Composition**: Prefer composition over prop drilling.

### Testing
-   **Framework**: Vitest + Playwright.
-   **Requirement**: 100% pass rate for integration tests.
-   **Pattern**: Test-Driven Development (TDD) for critical logic.

### AI Integration
-   **Agents**: Located in `src/lib/ai/agents`.
-   **Pattern**: Specialist Agents (Code Mentor, Project Planner) orchestrated by a Coordinator.
-   **Mocking**: Use `vi.mock` for OpenAI/Anthropic in tests.

## UI/UX Guidelines (Epic-03)
-   **Aesthetic**: Premium, "Glassmorphism".
-   **Typography**: Space Grotesk (Headers), Inter (Body).
-   **Interactions**: Framer Motion for micro-interactions.
