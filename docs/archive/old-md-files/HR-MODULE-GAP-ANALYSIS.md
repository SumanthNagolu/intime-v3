# HR Module (PeopleOS) - Gap Analysis & Defect Report
**Date:** 2025-11-23
**Version:** 1.0
**Status:** FAILED (Critical UI/Rendering Issues)

## 1. Executive Summary
The HR Module ("InTime PeopleOS") has been prototyped with a comprehensive navigation structure covering Dashboard, People, Org Chart, Recruitment, Performance, Payroll, and Utilities. However, **critical rendering defects** make the current prototype unusable for client demos.

**Major Issues:**
1.  **Global Typography Failure:** The letter 's' is consistently missing from text across all modules, likely due to a font subsetting or CSS conflict issue.
2.  **Missing Features:** The "Org Chart" and "Analytics" pages fail to render entirely (blank screens).
3.  **Data Integration:** All data is currently static/mocked; no integration with Supabase or the core `org_id` multi-tenancy architecture.

---

## 2. Detailed Defect Log

### A. Critical Rendering Issues (Priority 0)

| ID | Location | Issue Description | Evidence | Possible Cause |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-001** | Global | **Missing Character 's'**: Text renders as "Per on", "Benefit ", "Cour e" across all HR pages. | All Screenshots | Font file corruption, unicode-range CSS issue, or conflict with Tailwind's font stack. |
| **DEF-002** | `/hr/org` | **White Screen of Death**: Org Chart page loads navigation but content area is completely blank. | `hr-org-chart.png` | Missing library (e.g., react-flow, d3), JS error in rendering logic, or data structure mismatch. |
| **DEF-003** | `/hr/analytics` | **White Screen of Death**: Analytics page loads navigation but content area is completely blank. | `hr-analytics.png` | Missing charting library (Recharts/Chart.js) or undefined data. |

### B. Functional & Visual Gaps (Priority 1)

| ID | Page | Current State | Expected Behavior (InTime v3 Vision) |
| :--- | :--- | :--- | :--- |
| **GAP-001** | Dashboard | Generic "Welcome" stats. | Needs **Pod Performance Metrics** (Time-to-fill, Placement Rate) vs generic HR stats. |
| **GAP-002** | Recruitment | Basic list of requisitions. | Needs **Cross-Pollination** indicators. (e.g., "This role matches 3 Bench candidates"). |
| **GAP-003** | People | Flat list of profiles. | Needs **Role-Based Access Control** (RBAC) visibility. Senior vs Junior Pod view. |
| **GAP-004** | Performance | OKRs/Goals. | Needs alignment with **2 Placements/Sprint** KPI for recruiters. |

---

## 3. Technical Recommendations

### Immediate Fixes (Sprint 1)
1.  **Fix Font Stack:** Check `index.html` and `tailwind.config.js`. The Inter font loading or a custom font override is likely stripping the 's' character.
    *   *Action:* Revert to system sans-serif stack temporarily to confirm.
2.  **Debug Blank Pages:** Check browser console for `OrgChart` and `Analytics` components.
    *   *Action:* Verify dependencies for charts/graphs are installed (`npm install`).

### Architectural Alignments (Sprint 2)
1.  **Inject `org_id`:** All HR data fetch calls must accept `orgId` from the global store to ensure multi-tenancy.
2.  **Standardize Layout:** HR module uses a slightly different sidebar/header structure than Academy. Unify under `AppLayout`.

## 4. Screen Gallery
*Reference screenshots located in `/screenshots/`*
- `hr-dashboard.png` - Shows missing 's' in headers.
- `hr-recruitment.png` - Shows "Requi ition".
- `hr-payroll.png` - Shows "Pay tub", "Hi tory".


