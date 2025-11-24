# Prototype UI Migration Plan

## Overview
Migrate the complete UI from `frontend-prototype/` (Vite + React) to main project (Next.js 15).

---

## Tech Stack Conversion

### Current Prototype Stack
- **Build:** Vite
- **Routing:** React Router DOM (HashRouter)
- **State:** Zustand
- **Supabase:** @supabase/supabase-js (client-side)
- **UI:** Tailwind CSS + Lucide icons

### Target Main Project Stack
- **Build:** Next.js 15 (App Router)
- **Routing:** Next.js file-based routing
- **State:** Zustand (keep)
- **Supabase:** @supabase/ssr (server-side rendering)
- **API:** tRPC for type-safe APIs
- **UI:** Tailwind CSS + shadcn/ui + Lucide icons

---

## Phase 1: Cleanup (BEFORE migration)

### Root Documentation Files to Archive/Delete
Based on git status, the following are old reports/analysis docs:

**Keep (Core Documentation):**
- `QUICK-REFERENCE.md` - Useful quick reference
- `CLAUDE.md` - Project instructions for AI
- `README.md` - Main project readme

**Archive (Move to `docs/archive/`):**
All migration plans, analysis reports, audit reports (45 files)

**Delete (Obsolete Scripts):**
- Old migration scripts (most of the 146 scripts)
- Test scripts no longer used
- Seed scripts that are redundant

### Existing UI to Delete
- `src/app/(auth)/` - All auth pages
- `src/app/(dashboard)/` - All dashboard pages
- `src/app/(public)/` - All marketing pages
- `src/app/students/` - All student pages
- `src/app/admin/` - All admin pages
- `src/app/academy/` - All academy pages
- `src/components/` - All component folders

---

## Phase 2: Migration Strategy

### 1. Component Migration
**Copy from prototype:**
```
frontend-prototype/components/
├── academy/          → src/components/academy/
├── admin/            → src/components/admin/
├── bench/            → src/components/bench/
├── client/           → src/components/client/
├── executive/        → src/components/executive/
├── hr/               → src/components/hr/
├── immigration/      → src/components/immigration/
├── recruiting/       → src/components/recruiting/
├── sales/            → src/components/sales/
├── shared/           → src/components/shared/
├── talent/           → src/components/talent/
└── *.tsx (root)      → src/components/
```

### 2. Routing Migration
**Convert React Router → Next.js:**

| Prototype Route | Next.js Route |
|----------------|---------------|
| `/` (Home) | `src/app/page.tsx` |
| `/login` | `src/app/login/page.tsx` |
| `/dashboard` | `src/app/dashboard/page.tsx` |
| `/student-dashboard` | `src/app/students/page.tsx` |
| `/academy` | `src/app/academy/page.tsx` |
| `/modules` | `src/app/students/modules/page.tsx` |
| `/lesson/:moduleId/:lessonId` | `src/app/students/lesson/[moduleId]/[lessonId]/page.tsx` |
| `/recruiter` | `src/app/recruiting/page.tsx` |
| `/bench` | `src/app/bench/page.tsx` |
| `/hr` | `src/app/hr/page.tsx` |
| `/admin` | `src/app/admin/page.tsx` |
| `/ceo` | `src/app/executive/page.tsx` |

### 3. Code Adaptations

**A. Remove React Router Dependencies:**
```tsx
// BEFORE (Prototype)
import { useNavigate, Link } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');

// AFTER (Next.js)
import { useRouter } from 'next/navigation';
import Link from 'next/link';
const router = useRouter();
router.push('/dashboard');
```

**B. Convert to Server/Client Components:**
```tsx
// Client components (with interactivity)
'use client';
import { useState } from 'react';

// Server components (static, default)
// No 'use client' directive
```

**C. Update Supabase Client:**
```tsx
// BEFORE (Prototype - client-side only)
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);

// AFTER (Next.js - SSR)
import { createBrowserClient } from '@supabase/ssr';
const supabase = createBrowserClient(url, key);
```

**D. Convert API Calls to tRPC:**
```tsx
// BEFORE (Prototype - direct Supabase)
const { data } = await supabase.from('courses').select('*');

// AFTER (Next.js - tRPC)
import { trpc } from '@/lib/trpc/client';
const { data } = await trpc.courses.list.useQuery();
```

---

## Phase 3: File Structure

### App Router Pages Structure
```
src/app/
├── page.tsx                          ← Home
├── login/page.tsx                    ← LoginPage
├── dashboard/page.tsx                ← Dashboard (role-based redirect)
│
├── students/
│   ├── page.tsx                      ← StudentDashboard
│   ├── modules/page.tsx              ← ModulesList
│   ├── lesson/[moduleId]/[lessonId]/page.tsx  ← LessonView
│   ├── blueprint/page.tsx            ← BlueprintView
│   ├── persona/page.tsx              ← PersonaView
│   ├── dojo/page.tsx                 ← InterviewStudio
│   └── profile/page.tsx              ← ProfileView
│
├── academy/
│   ├── page.tsx                      ← PublicAcademy
│   └── instructor/
│       ├── page.tsx                  ← InstructorDashboard
│       └── cohort/[id]/page.tsx      ← CohortDetail
│
├── recruiting/
│   ├── page.tsx                      ← RecruiterDashboard
│   ├── screening/page.tsx            ← ScreeningRoom
│   ├── sourcing/page.tsx             ← SourcingRoom
│   ├── submission/page.tsx           ← SubmissionBuilder
│   └── analytics/page.tsx            ← RecruiterAnalytics
│
├── bench/
│   ├── page.tsx                      ← BenchDashboard
│   ├── outreach/page.tsx             ← ClientOutreach
│   ├── jobs/page.tsx                 ← JobCollector
│   ├── hotlist/page.tsx              ← HotlistBuilder
│   └── analytics/page.tsx            ← BenchAnalytics
│
├── sales/
│   ├── page.tsx                      ← TADashboard
│   ├── campaigns/page.tsx            ← CampaignBuilder
│   ├── prospects/page.tsx            ← AccountProspects
│   ├── candidates/page.tsx           ← SourcedCandidates
│   └── analytics/page.tsx            ← SalesAnalytics
│
├── hr/
│   ├── page.tsx                      ← HRDashboard
│   ├── people/page.tsx               ← PeopleDirectory
│   ├── performance/page.tsx          ← Performance
│   ├── analytics/page.tsx            ← Analytics
│   └── ... (other HR modules)
│
├── client/
│   ├── page.tsx                      ← ClientDashboard
│   └── welcome/page.tsx              ← ClientWelcome
│
├── executive/
│   └── page.tsx                      ← CEODashboard
│
├── immigration/
│   └── page.tsx                      ← CrossBorderDashboard
│
└── admin/
    └── page.tsx                      ← AdminDashboard
```

### Shared Components
```
src/components/
├── Navbar.tsx                        ← Global nav (convert Link)
├── AIMentor.tsx                      ← AI chat widget
├── GlobalCommand.tsx                 ← Cmd+K command palette
└── ... (other shared UI)
```

---

## Phase 4: Quality Checks

1. **TypeScript Compilation** - No errors
2. **Build Success** - `pnpm build` passes
3. **Visual Parity** - UI looks identical to prototype
4. **Routing Works** - All links navigate correctly
5. **Auth Flow** - Login/logout works
6. **Supabase SSR** - Server-side data fetching works

---

## Execution Steps

1. ✅ Archive old .md files to `docs/archive/`
2. ✅ Delete obsolete scripts
3. ✅ Backup current UI (git commit)
4. ✅ Delete existing src/app pages
5. ✅ Delete existing src/components
6. ✅ Copy prototype components → src/components
7. ✅ Create Next.js pages from App.tsx routes
8. ✅ Convert React Router → Next.js routing
9. ✅ Update Supabase to SSR
10. ✅ Test build and fix errors

---

**Status:** Ready to execute
**Estimated Time:** 2-3 hours
**Risk Level:** Medium (comprehensive backup required)
