# Frontend Prototype Audit & Action Plan
**Date:** 2025-11-23
**Context:** InTime v3 "Living Organism" Architecture

## 1. Current State Analysis

The current prototype (`frontend-prototype/`) provides a solid visual foundation for the 5 pillars, but lacks the core "connective tissue" (cross-pollination) and multi-tenant architecture defined in the vision.

### Pillar Coverage

| Pillar | Current Status | Gaps |
| :--- | :--- | :--- |
| **1. Training Academy** | ✅ High (Dashboard, Lessons, Dojo, Mentor) | Missing "Graduation -> Candidate" automated workflow. |
| **2. Recruiting Services** | 🟡 Medium (Client Landing, Basic Dashboard) | Needs "Pod" view (Senior/Junior pairing metrics). |
| **3. Bench Sales** | 🟡 Medium (Dashboard, Consultant List) | Missing "Marketing Loop" (Hotlist generation). |
| **4. Talent Acquisition** | 🟡 Medium (Internal HR Dashboard) | Needs robust "Pipeline" view for internal hires. |
| **5. Cross-Border** | 🔴 Low (Basic Dashboard only) | Needs specific visa tracking & legal document workflow. |

### Critical Architectural Gaps

1.  **Multi-Tenancy (Org Context):**
    *   **Issue:** The `useAppStore` does not track `orgId` or `userRole` with permissions.
    *   **Fix:** Add `orgId` to global state and ensure all mock data calls filter by it.

2.  **Cross-Pollination (The "Living Organism"):**
    *   **Issue:** Portals are siloed. No visual cue that a "Training" action triggers a "Recruiting" event.
    *   **Fix:** Add a global `NotificationCenter` or "Pulse" sidebar that shows cross-pillar events (e.g., "Student X graduated -> Profile Created in Recruiting").

3.  **Pod Structure:**
    *   **Issue:** No UI representation of the 2-person pod (Senior + Junior).
    *   **Fix:** Create a `PodView` component for the Recruiting/Sales dashboards.

## 2. Prioritized Action Plan

### Phase 1: Foundation & Architecture (Immediate)
- [ ] **Update Store:** Add `orgId`, `userRole`, and `currentPod` to Zustand store.
- [ ] **Mock Data Refactor:** Update `services/db.ts` to respect `orgId` (simulate RLS).
- [ ] **Global Navigation:** Add a "Super Admin" toggle to switch between views/pillars easily for demo purposes.

### Phase 2: Cross-Pollination UI
- [ ] **"The Pulse" Component:** A real-time activity feed showing cross-pillar events.
    - *Example:* "Training: Sarah passed assessment" -> "Recruiting: Sarah marked as 'Market Ready'"
- [ ] **Unified Search:** Ability to search across Modules, Candidates, and Consultants.

### Phase 3: Feature Deep Dive
- [ ] **Academy:** Connect "Interview Studio" results to Candidate Profile score.
- [ ] **Recruiting:** Build the "Pod Dashboard" (Metrics: 2 placements/sprint).
- [ ] **Bench:** Implement "Hotlist Generator" (AI-generated email summaries).

## 3. Data Model Alignment (Mock vs Real)

We need to align the frontend types with the backend schema defined in `INTIME-V3-COMPLETE-VISION-AND-TECH-STACK.md`.

**Key Type Updates:**
```typescript
interface UserProfile {
  id: string;
  orgId: string; // CRITICAL
  role: 'super_admin' | 'org_admin' | 'student' | 'recruiter' | 'sales' | 'candidate';
  podId?: string; // Link to specific 2-person pod
}

interface Candidate {
  // ... existing fields
  sourcePillar: 'academy' | 'external' | 'referral'; // Track cross-pollination
  crossBorderEligible: boolean; // Link to Pillar 5
}
```

## 4. Next Steps for Gemini

1.  **Refactor `lib/store.ts`** to include `orgId` and multi-tenant context.
2.  **Create `components/shared/CrossPollinationFeed.tsx`** to visualize the "Living Organism".
3.  **Update `RecruiterDashboard.tsx`** to include Pod metrics.


