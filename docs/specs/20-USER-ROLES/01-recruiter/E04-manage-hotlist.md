# Use Case: Manage Hotlist

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-E04 |
| Actor | Recruiter |
| Goal | Maintain a curated list of top-tier, pre-qualified candidates ready for immediate placement |
| Frequency | Daily maintenance |
| Estimated Time | 10-15 minutes per session |
| Priority | Medium |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "candidate.update" permission
3. Candidates have been screened and qualified

---

## Trigger

- Strong candidate identified during sourcing
- Candidate completes successful screen but no immediate fit
- Placement ends, contractor available
- Weekly hotlist review
- Client requests "bench" candidates

---

## Main Flow

### Step 1: Access Hotlist

**User Action:** Navigate to "My Hotlist" from sidebar

**Screen State:**
```
+----------------------------------------------------------+
| MY HOTLIST                          [+ Add Candidate]     |
+----------------------------------------------------------+
| Filter: [All Skills ▼] [Available ▼] [Sort: Score ▼]    |
+----------------------------------------------------------+
|                                                           |
| 🔥 HOT CANDIDATES (12)                                    |
| ┌────────────────────────────────────────────────────┐  |
| │                                                     │  |
| │ ⭐ Jane Doe - Sr. Backend Engineer                  │  |
| │    Score: 4.5/5 | Available: Immediate             │  |
| │    Skills: Node.js, TypeScript, AWS, PostgreSQL   │  |
| │    Rate: $95-105/hr | Location: Remote (US)       │  |
| │    Last Contact: 2 days ago                        │  |
| │    Notes: Excellent Meta engineer, FinTech interest│  |
| │    [Submit] [Schedule] [Remove] [View Profile]    │  |
| │                                                     │  |
| │ ⭐ John Smith - Full Stack Engineer                 │  |
| │    Score: 4.3/5 | Available: 2 weeks notice       │  |
| │    Skills: React, Node.js, Python, AWS            │  |
| │    Rate: $90-100/hr | Location: SF Bay Area       │  |
| │    Last Contact: 5 days ago                        │  |
| │    Notes: Strong frontend, wants startup          │  |
| │    [Submit] [Schedule] [Remove] [View Profile]    │  |
| │                                                     │  |
| │ [+ 10 more candidates...]                          │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| HOTLIST BY SKILL                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ Backend:     5 candidates                          │  |
| │ Frontend:    3 candidates                          │  |
| │ Full Stack:  2 candidates                          │  |
| │ DevOps:      2 candidates                          │  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

---

### Step 2: Add Candidate to Hotlist

**User Action:** Click "+ Add Candidate" or from candidate profile

**Screen State:**
```
+----------------------------------------------------------+
|                              Add to Hotlist           [×] |
+----------------------------------------------------------+
|                                                           |
| Candidate: Mike Chen                                      |
| Current Status: Screened                                  |
|                                                           |
| HOTLIST DETAILS                                           |
|                                                           |
| Primary Skill Category *                                  |
| [Full Stack Engineer                           ▼]        |
|                                                           |
| Availability *                                            |
| ○ Immediate   ○ 2 weeks   ○ 1 month   ○ Specific date   |
|                                                           |
| Rate Range *                                              |
| Min: [$85     ] /hr    Max: [$100    ] /hr              |
|                                                           |
| Work Authorization                                        |
| [US Citizen                                    ▼]        |
|                                                           |
| Location Preference                                       |
| [Remote (US)                                   ▼]        |
|                                                           |
| Hotlist Notes *                                           |
| [Strong React/Node skills, 5 years exp. Looking for     |
|  growth opportunity at mid-size company. Great          |
|  communicator, will interview well.                ]    |
|                                                           |
| Tags                                                      |
| [+ Add] [FinTech] [×] [Startup] [×]                     |
|                                                           |
| NOTIFICATION SETTINGS                                     |
| ☑ Notify me when matching jobs are created               |
| ☑ Include in weekly hotlist report                       |
|                                                           |
+----------------------------------------------------------+
|                       [Cancel]  [Add to Hotlist ✓]       |
+----------------------------------------------------------+
```

---

### Step 3: Submit from Hotlist

**User Action:** Click "Submit" on hotlist candidate

**System Response:**
- Opens job matching view
- Shows compatible open jobs
- One-click submission initiation

---

## Postconditions

1. ✅ Candidate added to hotlist
2. ✅ Categorized by skill
3. ✅ Availability tracked
4. ✅ Notes and tags saved
5. ✅ Match notifications configured

---

## Events Logged

| Event | Payload |
|-------|---------|
| `hotlist.candidate_added` | `{ candidate_id, skill_category, availability }` |
| `hotlist.candidate_removed` | `{ candidate_id, reason }` |

---

## Related Use Cases

- [E03-screen-candidate.md](./E03-screen-candidate.md) - Pre-qualification
- [F01-submit-candidate.md](./F01-submit-candidate.md) - Submit to client

---

*Last Updated: 2025-12-05*

