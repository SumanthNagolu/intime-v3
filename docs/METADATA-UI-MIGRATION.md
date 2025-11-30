# Metadata-Driven UI Migration Tracker

Track progress of converting pages to the Guidewire-inspired metadata-driven architecture.

## How to Use

1. Pick a page from "Not Started" below
2. Run: `/convert-to-metadata [page-path]`
3. Follow the conversion process
4. Move to "Completed" when done

---

## Migration Order (Recommended)

Start simple, build confidence, then tackle complex screens.

### Phase 1: CRM Module (Simple CRUD)
Good starting point - straightforward entity views.

### Phase 2: ATS Module (Core Business)
The pilot scope - Jobs, Submissions, Talent, Interviews.

### Phase 3: Bench Sales
Similar patterns to ATS.

### Phase 4: Academy
More complex with gamification.

### Phase 5: HR/Admin
Admin screens and dashboards.

---

## CRM Module

### Leads
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Lead List | list | ✅ Completed | `src/screens/crm/lead-list.screen.ts` |
| Lead Detail | detail | ✅ Completed | `src/screens/crm/lead-detail.screen.ts` |
| Create Lead | wizard | ⬜ Not Started | |

### Accounts
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Account List | list | ⬜ Not Started | |
| Account Detail | detail | ⬜ Not Started | |

### Deals
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Deal List | list | ⬜ Not Started | |
| Deal Detail | detail | ⬜ Not Started | |
| Deal Pipeline | dashboard | ⬜ Not Started | |

### Contacts
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Contact List | list | ⬜ Not Started | |
| Contact Detail | detail | ⬜ Not Started | |

### Activities
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Activity Timeline | list | ⬜ Not Started | |
| Log Activity | popup | ⬜ Not Started | |

---

## ATS (Recruiting) Module

### Jobs
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Jobs List | list | ⬜ Not Started | |
| Job Detail/Workspace | detail | ⬜ Not Started | |
| Create Job | wizard | ⬜ Not Started | |
| Post Job | wizard | ⬜ Not Started | |

### Talent (Candidates)
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Talent List | list | ⬜ Not Started | |
| Talent Detail/Workspace | detail | ⬜ Not Started | |
| Create Talent | wizard | ⬜ Not Started | |
| Edit Talent Modal | popup | ⬜ Not Started | |

### Submissions
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Submissions List | list | ⬜ Not Started | |
| Submission Detail | detail | ⬜ Not Started | |
| Submit Candidate | wizard | ⬜ Not Started | |

### Interviews
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Interview List | list | ⬜ Not Started | |
| Interview Detail | detail | ⬜ Not Started | |
| Schedule Interview | popup | ⬜ Not Started | |
| Interview Feedback | popup | ⬜ Not Started | |

### Offers
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Offer List | list | ⬜ Not Started | |
| Offer Detail | detail | ⬜ Not Started | |
| Create Offer | wizard | ⬜ Not Started | |

### Placements
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Placement List | list | ⬜ Not Started | |
| Placement Detail | detail | ⬜ Not Started | |

---

## Bench Sales Module

### Consultants
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Consultant List | list | ⬜ Not Started | |
| Consultant Detail | detail | ⬜ Not Started | |
| Hotlist | list | ⬜ Not Started | |

### Marketing
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Marketing Campaigns | list | ⬜ Not Started | |
| Send to Vendor | popup | ⬜ Not Started | |

---

## Academy Module

### Courses
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Course Catalog | list | ⬜ Not Started | |
| Course Detail | detail | ⬜ Not Started | |
| Lesson View | detail | ⬜ Not Started | |

### Progress
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| My Learning | dashboard | ⬜ Not Started | |
| Certificates | list | ⬜ Not Started | |

### Admin
| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Cohort Management | list | ⬜ Not Started | |
| Create Course | wizard | ⬜ Not Started | |

---

## Workspaces & Dashboards

| Page | Type | Status | Screen File |
|------|------|--------|-------------|
| Recruiting Dashboard | dashboard | ⬜ Not Started | |
| Manager Dashboard | dashboard | ⬜ Not Started | |
| Executive Dashboard | dashboard | ⬜ Not Started | |
| Bench Dashboard | dashboard | ⬜ Not Started | |
| TA Dashboard | dashboard | ⬜ Not Started | |

---

## Progress Summary

| Module | Total | Completed | In Progress |
|--------|-------|-----------|-------------|
| CRM | 11 | 2 | 0 |
| ATS | 16 | 0 | 0 |
| Bench | 4 | 0 | 0 |
| Academy | 6 | 0 | 0 |
| Dashboards | 5 | 0 | 0 |
| **Total** | **42** | **2** | **0** |

---

## Status Legend

- ⬜ Not Started
- 🔄 In Progress
- ✅ Completed
- ⏸️ Blocked

---

## Notes

### Conversion Tips
1. Start with `list` screens - they're simpler
2. Then do `detail` screens for same entity
3. Save `wizard` screens for last - most complex
4. Reuse InputSets wherever possible

### Common Patterns
- Lead Detail → Account Detail → Deal Detail (same pattern)
- Job Workspace → Talent Workspace → Submission Workspace (same pattern)
- All "Create" wizards follow similar structure
