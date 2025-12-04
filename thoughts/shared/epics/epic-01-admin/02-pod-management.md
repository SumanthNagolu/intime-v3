# User Story: Pod Management

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-002
**Priority:** High
**Estimated Context:** ~35K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/02-configure-pods.md`

---

## User Story

**As an** Admin user,
**I want** to create and manage organizational pods (teams) with managers, members, and regional assignments,
**So that** I can organize users into logical teams and enable proper data scoping and reporting.

---

## Acceptance Criteria

### AC-1: View Pods List
- [ ] Display all pods in a searchable/sortable table
- [ ] Show pod name, manager, member count, region, status
- [ ] Support filtering by region, status
- [ ] Support search by pod name or manager
- [ ] Show pod creation date

### AC-2: Create New Pod
- [ ] Open create pod modal/form
- [ ] Enter pod name (required, unique within org)
- [ ] Select region (US, Canada, or Multi-region)
- [ ] Assign pod manager (required, from active users)
- [ ] Add initial members (optional)
- [ ] Set pod type (Recruiting, Bench Sales, TA, HR, Mixed)
- [ ] Save creates pod and audit log entry

### AC-3: Edit Pod
- [ ] Edit pod name
- [ ] Change pod manager (reassigns manager role)
- [ ] Change region
- [ ] Update pod type
- [ ] Save updates pod and creates audit log entry

### AC-4: Manage Pod Members
- [ ] View current members with role indicators
- [ ] Add members from user list
- [ ] Remove members from pod
- [ ] Bulk add/remove members
- [ ] Transfer members between pods

### AC-5: Deactivate/Reactivate Pod
- [ ] Deactivate pod (soft delete)
- [ ] Require reassignment of members before deactivation
- [ ] Reactivate previously deactivated pod
- [ ] Show deactivated pods in filtered view

### AC-6: Pod Hierarchy View
- [ ] Visual tree view of pod structure
- [ ] Show manager relationship
- [ ] Show member counts per pod
- [ ] Drill down into pod details

---

## UI/UX Requirements

### Pod List View
```
┌────────────────────────────────────────────────────────────────┐
│ Pods                                              [+ New Pod]  │
├────────────────────────────────────────────────────────────────┤
│ [Search pods...]         [Region: All ▼] [Status: Active ▼]   │
│                                                                │
│ ┌──────────────────┬───────────────┬────────┬────────┬───────┐│
│ │ Pod Name         │ Manager       │ Members│ Region │Status ││
│ ├──────────────────┼───────────────┼────────┼────────┼───────┤│
│ │ Recruiting Alpha │ Mike Jones    │ 12     │ US     │Active ││
│ │ Recruiting Beta  │ Sarah Chen    │ 8      │ US     │Active ││
│ │ Bench Sales US   │ John Smith    │ 15     │ US     │Active ││
│ │ Bench Sales CAN  │ Lisa Wang     │ 6      │ Canada │Active ││
│ │ TA Specialists   │ Tom Brown     │ 5      │ Multi  │Active ││
│ └──────────────────┴───────────────┴────────┴────────┴───────┘│
│                                                                │
│ Showing 5 of 5 pods                                            │
└────────────────────────────────────────────────────────────────┘
```

### Create/Edit Pod Modal
```
┌────────────────────────────────────────────────────────────────┐
│ Create New Pod                                            [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Pod Name *                                                     │
│ [Recruiting Gamma                                         ]    │
│                                                                │
│ Pod Type *                                                     │
│ [Recruiting                                               ▼]   │
│                                                                │
│ Region *                                                       │
│ ○ US  ○ Canada  ● Multi-Region                                │
│                                                                │
│ Pod Manager *                                                  │
│ [Search users...                                          ▼]   │
│                                                                │
│ Initial Members (Optional)                                     │
│ [Search and add users...                                  ]    │
│ ┌────────────────────────────────────────────────────────┐    │
│ │ × Sarah Patel (Tech Recruiter)                         │    │
│ │ × John Doe (Tech Recruiter)                            │    │
│ └────────────────────────────────────────────────────────┘    │
│                                                                │
│ [Cancel]                                        [Create Pod]   │
└────────────────────────────────────────────────────────────────┘
```

### Pod Detail View
```
┌────────────────────────────────────────────────────────────────┐
│ ← Back to Pods                                                 │
│                                                                │
│ Recruiting Alpha                                    [Edit] [⋮]│
│ Manager: Mike Jones  |  Region: US  |  Status: Active          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ MEMBERS (12)                                    [+ Add Members]│
│ ┌────────────────────────────────────────────────────────────┐│
│ │ 👑 Mike Jones (Pod Manager)                                 ││
│ │    mike@company.com  |  Joined: Oct 15, 2024               ││
│ ├────────────────────────────────────────────────────────────┤│
│ │ Sarah Patel (Tech Recruiter)                    [Remove]   ││
│ │    sarah@company.com  |  Joined: Nov 1, 2024               ││
│ ├────────────────────────────────────────────────────────────┤│
│ │ John Smith (Tech Recruiter)                     [Remove]   ││
│ │    john@company.com  |  Joined: Nov 5, 2024                ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ POD METRICS                                                    │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│ │ Open Jobs    │ Submissions  │ Placements   │ Revenue      │ │
│ │ 24           │ 156 (MTD)    │ 8 (MTD)      │ $124K (MTD)  │ │
│ └──────────────┴──────────────┴──────────────┴──────────────┘ │
│                                                                │
│ RECENT ACTIVITY                                                │
│ • Nov 28 - Sarah submitted candidate for JOB-2024-1234        │
│ • Nov 27 - John closed JOB-2024-1198 (filled)                 │
│ • Nov 26 - Mike approved 3 job requisitions                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Pods table
CREATE TABLE pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  pod_type VARCHAR(50) NOT NULL, -- recruiting, bench_sales, ta, hr, mixed
  region VARCHAR(50), -- us, canada, multi
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  UNIQUE(organization_id, name)
);

-- Pod managers (separate table for history/multiple managers)
CREATE TABLE pod_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  is_primary BOOLEAN DEFAULT true,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  removed_at TIMESTAMPTZ,
  UNIQUE(pod_id, user_id, removed_at)
);

-- Pod members
CREATE TABLE pod_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES user_profiles(id),
  removed_at TIMESTAMPTZ,
  UNIQUE(pod_id, user_id, removed_at)
);

-- Indexes
CREATE INDEX idx_pods_org ON pods(organization_id);
CREATE INDEX idx_pods_status ON pods(status);
CREATE INDEX idx_pod_managers_pod ON pod_managers(pod_id);
CREATE INDEX idx_pod_managers_user ON pod_managers(user_id);
CREATE INDEX idx_pod_members_pod ON pod_members(pod_id);
CREATE INDEX idx_pod_members_user ON pod_members(user_id);
```

---

## tRPC Endpoints

```typescript
// src/server/routers/admin/pods.ts
export const podsRouter = router({
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      region: z.enum(['us', 'canada', 'multi']).optional(),
      status: z.enum(['active', 'inactive']).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20)
    }))
    .query(async ({ ctx, input }) => {
      // Return paginated pods list
    }),

  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Return pod with manager and members
    }),

  create: orgProtectedProcedure
    .input(z.object({
      name: z.string().min(2).max(100),
      podType: z.enum(['recruiting', 'bench_sales', 'ta', 'hr', 'mixed']),
      region: z.enum(['us', 'canada', 'multi']),
      managerId: z.string().uuid(),
      memberIds: z.array(z.string().uuid()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Create pod, assign manager, add members
      // Create audit log
    }),

  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(2).max(100).optional(),
      podType: z.enum(['recruiting', 'bench_sales', 'ta', 'hr', 'mixed']).optional(),
      region: z.enum(['us', 'canada', 'multi']).optional(),
      managerId: z.string().uuid().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Update pod
      // Create audit log
    }),

  addMembers: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid(),
      userIds: z.array(z.string().uuid())
    }))
    .mutation(async ({ ctx, input }) => {
      // Add members to pod
      // Remove from other pods if needed
    }),

  removeMembers: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid(),
      userIds: z.array(z.string().uuid())
    }))
    .mutation(async ({ ctx, input }) => {
      // Remove members from pod
    }),

  deactivate: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      reassignTo: z.string().uuid().optional() // Pod to reassign members
    }))
    .mutation(async ({ ctx, input }) => {
      // Check for members, reassign if needed
      // Deactivate pod
    }),

  reactivate: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Reactivate pod
    }),

  getMetrics: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid(),
      period: z.enum(['mtd', 'qtd', 'ytd'])
    }))
    .query(async ({ ctx, input }) => {
      // Return pod performance metrics
    })
});
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-POD-001 | View pods list | Shows all org pods with correct data |
| ADMIN-POD-002 | Search pods | Filters pods by name/manager |
| ADMIN-POD-003 | Create pod | Pod created with manager assigned |
| ADMIN-POD-004 | Create pod with duplicate name | Error: "Pod name already exists" |
| ADMIN-POD-005 | Edit pod | Pod updated, audit log created |
| ADMIN-POD-006 | Add members | Members added to pod |
| ADMIN-POD-007 | Remove members | Members removed from pod |
| ADMIN-POD-008 | Transfer member | Member moved between pods |
| ADMIN-POD-009 | Deactivate pod with members | Error: "Reassign members first" |
| ADMIN-POD-010 | Deactivate empty pod | Pod deactivated successfully |
| ADMIN-POD-011 | Reactivate pod | Pod status set to active |
| ADMIN-POD-012 | Change pod manager | Old manager demoted, new promoted |
| ADMIN-POD-013 | View pod metrics | Shows correct performance data |
| ADMIN-POD-014 | Filter by region | Shows only pods in selected region |
| ADMIN-POD-015 | Non-admin access | Returns 403 Forbidden |

---

## Field Specifications

### Pod Name
| Property | Value |
|----------|-------|
| Field Name | `name` |
| Type | TextInput |
| Required | Yes |
| Min Length | 2 characters |
| Max Length | 100 characters |
| Validation | Unique within organization |
| Error Messages | |
| - Empty | "Pod name is required" |
| - Too Short | "Pod name must be at least 2 characters" |
| - Duplicate | "A pod with this name already exists" |

### Pod Type
| Property | Value |
|----------|-------|
| Field Name | `podType` |
| Type | Select |
| Required | Yes |
| Options | Recruiting, Bench Sales, TA, HR, Mixed |
| Default | Recruiting |
| Error Messages | |
| - Empty | "Please select a pod type" |

### Region
| Property | Value |
|----------|-------|
| Field Name | `region` |
| Type | Radio |
| Required | Yes |
| Options | US, Canada, Multi-Region |
| Default | US |
| Error Messages | |
| - Empty | "Please select a region" |

### Pod Manager
| Property | Value |
|----------|-------|
| Field Name | `managerId` |
| Type | Select (searchable) |
| Required | Yes |
| Options | Active users with manager-eligible roles |
| Validation | Valid user ID, user must be active |
| Error Messages | |
| - Empty | "Please select a pod manager" |
| - Invalid | "Selected user cannot be assigned as manager" |

---

## Dependencies

- User Management (UC-ADMIN-005)
- Audit Logging (UC-ADMIN-008)

---

## Out of Scope

- Pod-to-pod hierarchy (parent/child pods)
- Pod budgets and cost centers
- Pod scheduling/capacity planning
