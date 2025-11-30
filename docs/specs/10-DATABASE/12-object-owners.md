# Object Owners Table Specification

## Overview

| Property | Value |
|----------|-------|
| Table Name | `object_owners` |
| Schema | `public` |
| Purpose | RCAI (Responsible, Accountable, Consulted, Informed) ownership assignments for business objects |
| Primary Owner | System/Application |
| RLS Enabled | Yes |
| Soft Delete | No |

---

## Table Definition

```sql
CREATE TABLE object_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Polymorphic Association
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Owner
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- RCAI Role
  role TEXT NOT NULL,

  -- Permission (derived from role, but can be overridden)
  permission TEXT NOT NULL DEFAULT 'view',

  -- Is this the primary owner (Accountable)?
  is_primary BOOLEAN DEFAULT FALSE,

  -- Assignment metadata
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  assignment_type TEXT DEFAULT 'auto',

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each user can only have one RCAI role per entity
  UNIQUE(entity_type, entity_id, user_id)
);
```

---

## Field Specifications

### id
| Property | Value |
|----------|-------|
| Column Name | `id` |
| Type | `UUID` |
| Required | Yes (auto-generated) |
| Default | `gen_random_uuid()` |
| Primary Key | Yes |
| Description | Unique identifier for the ownership assignment |
| UI Display | Hidden (used internally) |

---

### org_id
| Property | Value |
|----------|-------|
| Column Name | `org_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `organizations(id)` |
| On Delete | CASCADE |
| Description | Organization this ownership assignment belongs to (multi-tenancy) |
| UI Display | Hidden (auto-set from session) |
| RLS | Used in isolation policy |

---

### entity_type
| Property | Value |
|----------|-------|
| Column Name | `entity_type` |
| Type | `TEXT` |
| Required | Yes |
| Allowed Values | `campaign`, `lead`, `deal`, `account`, `job`, `job_order`, `submission`, `contact`, `external_job`, `candidate`, `talent` |
| Description | Type of business object being assigned |
| UI Label | "Entity Type" |
| UI Type | Dropdown (in admin contexts) |
| Index | Yes (part of unique constraint) |

**Enum Values:**
| Value | Display Label | Description |
|-------|---------------|-------------|
| `campaign` | Campaign | TA/HR campaign |
| `lead` | Lead | Sales lead |
| `deal` | Deal | Sales deal/opportunity |
| `account` | Account | Client company |
| `job` | Job | Internal job requisition |
| `job_order` | Job Order | Confirmed client order |
| `submission` | Submission | Candidate submission |
| `contact` | Contact | Universal contact |
| `external_job` | External Job | Bench sales job |
| `candidate` | Candidate | Candidate profile |
| `talent` | Talent | Talent pool member |

---

### entity_id
| Property | Value |
|----------|-------|
| Column Name | `entity_id` |
| Type | `UUID` |
| Required | Yes |
| Description | ID of the business object being assigned |
| UI Display | Hidden (contextual) |
| Polymorphic Target | Varies by entity_type |
| Index | Yes (part of unique constraint) |

**Polymorphic Relationships:**
| entity_type | References Table | Purpose |
|-------------|------------------|---------|
| `campaign` | `campaigns.id` | TA campaign ownership |
| `lead` | `leads.id` | Lead ownership |
| `deal` | `deals.id` | Deal ownership |
| `account` | `accounts.id` | Account ownership |
| `job` | `jobs.id` | Job ownership |
| `job_order` | `job_orders.id` | Job order ownership |
| `submission` | `submissions.id` | Submission ownership |
| `contact` | `contacts.id` | Contact ownership |
| `external_job` | `external_jobs.id` | External job ownership |
| `candidate` | `candidates.id` | Candidate ownership |
| `talent` | `talent.id` | Talent ownership |

---

### user_id
| Property | Value |
|----------|-------|
| Column Name | `user_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `user_profiles(id)` |
| On Delete | CASCADE |
| Description | User being assigned to the entity |
| UI Label | "User" |
| UI Type | User Select |
| Index | Yes (for user lookups) |

---

### role
| Property | Value |
|----------|-------|
| Column Name | `role` |
| Type | `TEXT` |
| Required | Yes |
| Allowed Values | `responsible`, `accountable`, `consulted`, `informed` |
| Description | RCAI role assignment |
| UI Label | "Role" |
| UI Type | Dropdown |

**RCAI Role Definitions:**

| Role | Label | Description | Default Permission | Who Can Assign |
|------|-------|-------------|-------------------|----------------|
| `responsible` | Responsible | Does the work to complete the task | `edit` | Accountable, Managers |
| `accountable` | Accountable | Approves/owns the outcome (exactly 1 per entity) | `edit` | System, Managers, Previous Accountable |
| `consulted` | Consulted | Provides input before decisions are made | `view` | Accountable, Responsible |
| `informed` | Informed | Kept updated on progress | `view` | Accountable, Responsible |

**Business Rules:**
- **Exactly 1 Accountable**: Every entity must have exactly one person with role=`accountable`
- **Multiple Responsible**: An entity can have 0-N responsible users
- **Multiple Consulted/Informed**: No limit on consulted or informed users
- **Auto-Assignment**: Creator automatically becomes `accountable` with `isPrimary=true`
- **Permission Hierarchy**: Accountable and Responsible get `edit` by default; Consulted and Informed get `view`

**Color Coding:**
| Role | Background | Text | Use Case |
|------|------------|------|----------|
| `responsible` | `bg-blue-100` | `text-blue-700` | Active contributors |
| `accountable` | `bg-green-100` | `text-green-700` | Owner (always visible) |
| `consulted` | `bg-amber-100` | `text-amber-700` | SMEs/stakeholders |
| `informed` | `bg-stone-100` | `text-stone-600` | Observers |

---

### permission
| Property | Value |
|----------|-------|
| Column Name | `permission` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'view'` |
| Allowed Values | `edit`, `view` |
| Description | Access level for the assigned user (derived from role but can be overridden) |
| UI Label | "Permission" |
| UI Type | Radio Buttons |

**Permission Levels:**
| Value | Display Label | Description | Default Roles |
|-------|---------------|-------------|--------------|
| `edit` | Edit | Full read/write access | `responsible`, `accountable` |
| `view` | View | Read-only access | `consulted`, `informed` |

**Permission Matrix:**

| Role | Default Permission | Can Override to Edit? | Can Override to View? |
|------|-------------------|----------------------|----------------------|
| `accountable` | `edit` | N/A (always edit) | No (must retain edit) |
| `responsible` | `edit` | N/A (already edit) | Yes (demote to view) |
| `consulted` | `view` | Yes (promote to edit) | N/A (already view) |
| `informed` | `view` | Yes (promote to edit) | N/A (already view) |

**Access Control Logic:**
```typescript
// Check edit access
const canEdit = await db.select()
  .from(objectOwners)
  .where(and(
    eq(objectOwners.entityType, entityType),
    eq(objectOwners.entityId, entityId),
    eq(objectOwners.userId, userId),
    eq(objectOwners.permission, 'edit')
  ));

// Check any access (view or edit)
const canView = await db.select()
  .from(objectOwners)
  .where(and(
    eq(objectOwners.entityType, entityType),
    eq(objectOwners.entityId, entityId),
    eq(objectOwners.userId, userId)
  ));
```

---

### isPrimary
| Property | Value |
|----------|-------|
| Column Name | `is_primary` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `FALSE` |
| Description | Indicates if this is the primary owner (Accountable) |
| UI Label | "Primary Owner" |
| UI Type | Display Badge |
| Business Rule | Should be `TRUE` only for `role='accountable'` |

**Primary Owner Logic:**
- `isPrimary=true` marks the main Accountable owner
- Used for quick lookups: "Who owns this?"
- Should align with `role='accountable'`
- Auto-set to `true` when assigning `accountable` role
- Only one `isPrimary=true` per entity (enforced by business logic, not DB constraint)

---

### assigned_at
| Property | Value |
|----------|-------|
| Column Name | `assigned_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Description | Timestamp when this assignment was made |
| UI Label | "Assigned On" |
| UI Type | Display (formatted date) |

---

### assigned_by
| Property | Value |
|----------|-------|
| Column Name | `assigned_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who made this assignment |
| UI Label | "Assigned By" |
| UI Type | Display (user name/avatar) |
| Audit Value | Tracks who made the assignment |

---

### assignment_type
| Property | Value |
|----------|-------|
| Column Name | `assignment_type` |
| Type | `TEXT` |
| Required | No |
| Default | `'auto'` |
| Allowed Values | `auto`, `manual` |
| Description | How the assignment was created |
| UI Label | "Assignment Type" |
| UI Type | Display Badge |

**Enum Values:**
| Value | Display Label | Description | When Used |
|-------|---------------|-------------|----------|
| `auto` | Auto-assigned | System-generated assignment | On entity creation (creator → accountable) |
| `manual` | Manual | User-assigned | Admin/manager assigns RCAI |

**Auto-Assignment Rules:**

| Trigger | Entity Type | Auto Assignments |
|---------|-------------|------------------|
| Job created | `job` | creator → `accountable` + `edit` + `isPrimary=true` |
| Lead created | `lead` | creator → `accountable` + `edit` + `isPrimary=true` |
| Deal created | `deal` | creator → `accountable` + `edit` + `isPrimary=true` |
| Account created | `account` | creator → `accountable` + `edit` + `isPrimary=true` |
| Job Order created | `job_order` | creator → `accountable` + `edit` + `isPrimary=true` |
| Submission created | `submission` | creator → `responsible` + `edit`; job owner → `accountable` |
| Contact created | `contact` | creator → `accountable` + `edit` + `isPrimary=true` |

**Trigger Example:**
```sql
CREATE OR REPLACE FUNCTION auto_assign_rcai()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign creator as accountable
  INSERT INTO object_owners (
    org_id,
    entity_type,
    entity_id,
    user_id,
    role,
    permission,
    is_primary,
    assigned_by,
    assignment_type
  ) VALUES (
    NEW.org_id,
    TG_ARGV[0], -- entity_type passed as trigger arg
    NEW.id,
    NEW.created_by,
    'accountable',
    'edit',
    TRUE,
    NEW.created_by,
    'auto'
  )
  ON CONFLICT (entity_type, entity_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Example usage
CREATE TRIGGER jobs_auto_rcai
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_rcai('job');
```

---

### notes
| Property | Value |
|----------|-------|
| Column Name | `notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 500 characters |
| Description | Explanation or context for this assignment |
| UI Label | "Notes" |
| UI Type | Textarea |
| UI Placeholder | "Why is this person assigned?" |

---

### created_at
| Property | Value |
|----------|-------|
| Column Name | `created_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Description | Timestamp of creation |
| UI Display | Display only, formatted |

---

### updated_at
| Property | Value |
|----------|-------|
| Column Name | `updated_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Auto Update | Yes (via trigger) |
| Description | Timestamp of last update |
| UI Display | Display only, formatted |

---

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `object_owners_pkey` | `id` | BTREE | Primary key |
| `idx_object_owners_org_id` | `org_id` | BTREE | Tenant filtering |
| `idx_object_owners_user_id` | `user_id` | BTREE | User lookup ("my entities") |
| `idx_object_owners_entity` | `entity_type, entity_id` | BTREE | Entity lookup ("who owns this?") |
| `idx_object_owners_role` | `role` | BTREE | Role filtering |
| `idx_object_owners_permission` | `permission` | BTREE | Permission filtering |
| `idx_object_owners_is_primary` | `is_primary` | BTREE | Primary owner lookup |
| `uq_object_owners_entity_user` | `entity_type, entity_id, user_id` | BTREE | Unique constraint |

**Index Creation:**
```sql
CREATE INDEX idx_object_owners_org_id ON object_owners(org_id);
CREATE INDEX idx_object_owners_user_id ON object_owners(user_id);
CREATE INDEX idx_object_owners_entity ON object_owners(entity_type, entity_id);
CREATE INDEX idx_object_owners_role ON object_owners(role);
CREATE INDEX idx_object_owners_permission ON object_owners(permission);
CREATE INDEX idx_object_owners_is_primary ON object_owners(is_primary) WHERE is_primary = TRUE;
```

---

## Unique Constraints

### entity_user_unique
| Property | Value |
|----------|-------|
| Name | `uq_object_owners_entity_user` |
| Columns | `(entity_type, entity_id, user_id)` |
| Description | Each user can only have ONE RCAI role per entity |
| Enforcement | Database |
| Error Handling | Use `ON CONFLICT DO UPDATE` to change roles |

**Usage Pattern:**
```typescript
// Upsert pattern: change role if already assigned
await db.insert(objectOwners)
  .values({
    entityType: 'job',
    entityId: jobId,
    userId: userId,
    role: 'responsible',
    permission: 'edit',
    // ... other fields
  })
  .onConflictDoUpdate({
    target: [objectOwners.entityType, objectOwners.entityId, objectOwners.userId],
    set: {
      role: 'responsible',
      permission: 'edit',
      updatedAt: new Date(),
    },
  });
```

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE object_owners ENABLE ROW LEVEL SECURITY;

-- Organization isolation
CREATE POLICY "object_owners_org_isolation" ON object_owners
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Users can see their own assignments
CREATE POLICY "object_owners_user_read" ON object_owners
  FOR SELECT
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND user_id = (auth.jwt() ->> 'user_id')::uuid
  );

-- Accountable users can manage assignments for their entities
CREATE POLICY "object_owners_accountable_manage" ON object_owners
  FOR ALL
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND EXISTS (
      SELECT 1 FROM object_owners oo
      WHERE oo.entity_type = object_owners.entity_type
        AND oo.entity_id = object_owners.entity_id
        AND oo.user_id = (auth.jwt() ->> 'user_id')::uuid
        AND oo.role = 'accountable'
    )
  );
```

---

## Triggers

### Updated At Trigger
```sql
CREATE TRIGGER object_owners_updated_at
  BEFORE UPDATE ON object_owners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Enforce Primary Owner Trigger
```sql
CREATE OR REPLACE FUNCTION enforce_primary_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting isPrimary=true, ensure role=accountable
  IF NEW.is_primary = TRUE AND NEW.role != 'accountable' THEN
    RAISE EXCEPTION 'Only accountable role can be primary owner';
  END IF;

  -- If role=accountable, automatically set isPrimary=true
  IF NEW.role = 'accountable' THEN
    NEW.is_primary := TRUE;
    NEW.permission := 'edit'; -- Accountable always has edit
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER object_owners_enforce_primary
  BEFORE INSERT OR UPDATE ON object_owners
  FOR EACH ROW
  EXECUTE FUNCTION enforce_primary_owner();
```

### Validate Single Accountable Trigger
```sql
CREATE OR REPLACE FUNCTION validate_single_accountable()
RETURNS TRIGGER AS $$
DECLARE
  accountable_count INTEGER;
BEGIN
  -- Count existing accountable owners for this entity
  SELECT COUNT(*) INTO accountable_count
  FROM object_owners
  WHERE entity_type = NEW.entity_type
    AND entity_id = NEW.entity_id
    AND role = 'accountable'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  -- If trying to insert/update to accountable and one already exists
  IF NEW.role = 'accountable' AND accountable_count > 0 THEN
    RAISE EXCEPTION 'Entity already has an accountable owner. Use transferOwnership instead.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER object_owners_validate_accountable
  BEFORE INSERT OR UPDATE ON object_owners
  FOR EACH ROW
  WHEN (NEW.role = 'accountable')
  EXECUTE FUNCTION validate_single_accountable();
```

---

## Business Rules

### RCAI Model Enforcement

**Rule 1: Exactly One Accountable**
- Every business object MUST have exactly 1 user with `role='accountable'`
- Enforced by trigger `object_owners_validate_accountable`
- To change accountable, use `transferOwnership` mutation (atomic operation)

**Rule 2: Auto-Assignment on Creation**
- When a user creates an entity, they are automatically assigned as `accountable`
- Assignment type: `auto`
- Permission: `edit`
- `isPrimary`: `true`

**Rule 3: Permission Inheritance**
- `accountable` → always `edit` (cannot be overridden)
- `responsible` → default `edit`, can be set to `view`
- `consulted` → default `view`, can be promoted to `edit`
- `informed` → default `view`, can be promoted to `edit`

**Rule 4: Primary Owner Alignment**
- `isPrimary=true` should only exist for `role='accountable'`
- Enforced by trigger `object_owners_enforce_primary`

**Rule 5: Role Change Restrictions**
- To change from one `accountable` to another, use `transferOwnership` (prevents orphaned entities)
- Changing between `responsible`, `consulted`, `informed` can use normal `update`

---

### Access Control Patterns

**Pattern 1: Check Edit Access**
```typescript
const canEdit = await hasEditAccess(userId, orgId, 'job', jobId);
if (!canEdit) {
  throw new Error('Insufficient permissions');
}
```

**Pattern 2: Get All Accessible Entities**
```typescript
const accessibleJobs = await db.select()
  .from(jobs)
  .leftJoin(
    objectOwners,
    and(
      eq(objectOwners.entityType, 'job'),
      eq(objectOwners.entityId, jobs.id),
      eq(objectOwners.userId, userId)
    )
  )
  .where(
    or(
      eq(jobs.ownerId, userId), // Direct owner
      isNotNull(objectOwners.id) // RCAI assigned
    )
  );
```

**Pattern 3: Filter by Ownership**
```typescript
// Using ownership-filter.ts helper
const condition = await buildOwnershipCondition(
  { userId, orgId, isManager, managedUserIds },
  'job',
  jobs,
  'all_accessible' // my_items | my_team | consulted | all_accessible | all_org
);

const results = await db.select()
  .from(jobs)
  .where(condition);
```

---

### Query Patterns

**Get Owners for Entity**
```typescript
const owners = await db.select({
    owner: objectOwners,
    user: userProfiles,
  })
  .from(objectOwners)
  .leftJoin(userProfiles, eq(objectOwners.userId, userProfiles.id))
  .where(and(
    eq(objectOwners.orgId, orgId),
    eq(objectOwners.entityType, 'job'),
    eq(objectOwners.entityId, jobId)
  ))
  .orderBy(sql`
    CASE ${objectOwners.role}
      WHEN 'accountable' THEN 1
      WHEN 'responsible' THEN 2
      WHEN 'consulted' THEN 3
      WHEN 'informed' THEN 4
    END
  `);
```

**Get Primary Owner**
```typescript
const [primaryOwner] = await db.select()
  .from(objectOwners)
  .leftJoin(userProfiles, eq(objectOwners.userId, userProfiles.id))
  .where(and(
    eq(objectOwners.entityType, 'job'),
    eq(objectOwners.entityId, jobId),
    eq(objectOwners.isPrimary, true)
  ))
  .limit(1);
```

**Get Entities Owned by User**
```typescript
const myEntities = await db.select()
  .from(objectOwners)
  .where(and(
    eq(objectOwners.userId, userId),
    eq(objectOwners.entityType, 'job'),
    eq(objectOwners.role, 'accountable')
  ));
```

**Get Users with Edit Permission**
```typescript
const editors = await db.select()
  .from(objectOwners)
  .leftJoin(userProfiles, eq(objectOwners.userId, userProfiles.id))
  .where(and(
    eq(objectOwners.entityType, 'job'),
    eq(objectOwners.entityId, jobId),
    eq(objectOwners.permission, 'edit')
  ));
```

**Transfer Ownership**
```typescript
await db.transaction(async (tx) => {
  // Remove old accountable or change role
  const [current] = await tx.select()
    .from(objectOwners)
    .where(and(
      eq(objectOwners.entityType, 'job'),
      eq(objectOwners.entityId, jobId),
      eq(objectOwners.role, 'accountable')
    ));

  if (current && keepPreviousAs) {
    await tx.update(objectOwners)
      .set({
        role: keepPreviousAs,
        permission: RCAI_DEFAULT_PERMISSIONS[keepPreviousAs],
        isPrimary: false,
      })
      .where(eq(objectOwners.id, current.id));
  } else if (current) {
    await tx.delete(objectOwners)
      .where(eq(objectOwners.id, current.id));
  }

  // Assign new accountable
  await tx.insert(objectOwners)
    .values({
      entityType: 'job',
      entityId: jobId,
      userId: newAccountableId,
      role: 'accountable',
      permission: 'edit',
      isPrimary: true,
      assignmentType: 'manual',
    })
    .onConflictDoUpdate({
      target: [objectOwners.entityType, objectOwners.entityId, objectOwners.userId],
      set: { role: 'accountable', permission: 'edit', isPrimary: true },
    });
});
```

---

## UI Components

### RCAI Header Component

**Purpose:** Display ownership assignments at the top of entity detail pages

**Location:** `src/components/workspaces/base/RCAIHeader.tsx`

**Features:**
- Show primary owner (accountable) prominently
- Display all RCAI assignments with color-coded badges
- Quick actions: Assign, Transfer, Remove
- Inline editing of roles and permissions
- Tooltip explanations for each RCAI role

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Ownership (RCAI)                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Primary Owner: [Avatar] John Doe (Accountable)         │
│                                                         │
│ Team:                                                   │
│   • [Avatar] Jane Smith  [Responsible] [Edit]          │
│   • [Avatar] Bob Johnson [Consulted]   [View]          │
│   • [Avatar] Alice Brown [Informed]    [View]          │
│                                                         │
│ [+ Assign Person]  [Transfer Ownership]                │
└─────────────────────────────────────────────────────────┘
```

**Component Props:**
```typescript
interface RCAIHeaderProps {
  entityType: RCAIEntityType;
  entityId: string;
  showTransferButton?: boolean;
  canManageRCAI?: boolean; // Based on user's permission
}
```

**Hook Integration:**
```typescript
const {
  owners,
  primaryOwner,
  editors,
  assignOwner,
  removeOwner,
  transferOwnership
} = useRCAI(entityType, entityId);
```

---

### RCAI Assignment Modal

**Purpose:** Assign or modify RCAI roles

**Features:**
- User picker with search
- Role selector (radio buttons)
- Permission override (checkbox)
- Notes field
- Real-time validation

**Validation Rules:**
- Cannot assign same user twice (unique constraint)
- If assigning `accountable`, warn that current accountable will be changed
- Suggest default permission based on role
- Require notes for non-standard permission overrides

---

### RCAI Filter UI

**Purpose:** Filter entity lists by ownership

**Location:** Workspace list headers

**Filter Options:**
| Value | Label | Description | Visibility |
|-------|-------|-------------|-----------|
| `my_items` | My Items | Entities I own | All users |
| `my_team` | My Team | My team's entities | Managers only |
| `consulted` | Consulted | Entities where I'm consulted/informed | All users |
| `all_accessible` | All Accessible | Everything I can view | All users |
| `all_org` | All Organization | All entities | Managers/Admins only |

**Implementation:**
```typescript
<Select value={ownershipFilter} onChange={setOwnershipFilter}>
  {getAvailableOwnershipFilters(isManager).map(option => (
    <SelectItem key={option.value} value={option.value}>
      {option.label}
      <span className="text-xs text-stone-500">{option.description}</span>
    </SelectItem>
  ))}
</Select>
```

---

## Related Tables

| Table | Relationship | Connection |
|-------|--------------|------------|
| organizations | Parent | `org_id` FK |
| user_profiles | Owner | `user_id` FK |
| user_profiles | Assigner | `assigned_by` FK |
| campaigns | Polymorphic | `entity_type='campaign'` |
| leads | Polymorphic | `entity_type='lead'` |
| deals | Polymorphic | `entity_type='deal'` |
| accounts | Polymorphic | `entity_type='account'` |
| jobs | Polymorphic | `entity_type='job'` |
| job_orders | Polymorphic | `entity_type='job_order'` |
| submissions | Polymorphic | `entity_type='submission'` |
| contacts | Polymorphic | `entity_type='contact'` |
| external_jobs | Polymorphic | `entity_type='external_job'` |
| candidates | Polymorphic | `entity_type='candidate'` |
| talent | Polymorphic | `entity_type='talent'` |

---

## tRPC Procedures

### Query Procedures

| Procedure | Input | Output | Purpose |
|-----------|-------|--------|---------|
| `getByEntity` | `{entityType, entityId}` | `ObjectOwner[]` | Get all owners for an entity |
| `getByUser` | `{userId?, entityType?, role?, permission?}` | `{items, total}` | Get entities owned by user |
| `canAccess` | `{entityType, entityId, requiredPermission}` | `{hasAccess, permission, role}` | Check access |
| `getPrimaryOwner` | `{entityType, entityId}` | `ObjectOwner \| null` | Get accountable owner |
| `getEditors` | `{entityType, entityId}` | `ObjectOwner[]` | Get users with edit permission |
| `getMySummary` | - | `Record<entityType, Record<role, count>>` | Get user's ownership summary |

### Mutation Procedures

| Procedure | Input | Purpose |
|-----------|-------|---------|
| `assign` | `{entityType, entityId, userId, role, permission?, notes?}` | Assign user to entity |
| `bulkAssign` | `{entityType, entityId, assignments[]}` | Replace all assignments |
| `update` | `{id, role?, permission?, notes?}` | Update assignment |
| `remove` | `{entityType, entityId, userId}` | Remove assignment |
| `removeById` | `{id}` | Remove by ID |
| `transferOwnership` | `{entityType, entityId, newAccountableId, keepPreviousAs?}` | Transfer accountable |
| `copyFromEntity` | `{sourceEntityType, sourceEntityId, targetEntityType, targetEntityId}` | Copy RCAI |

---

## Migration Example

```sql
-- Add object_owners table
CREATE TABLE object_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('responsible', 'accountable', 'consulted', 'informed')),
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('edit', 'view')),
  is_primary BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  assignment_type TEXT DEFAULT 'auto' CHECK (assignment_type IN ('auto', 'manual')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, user_id)
);

-- Indexes
CREATE INDEX idx_object_owners_org_id ON object_owners(org_id);
CREATE INDEX idx_object_owners_user_id ON object_owners(user_id);
CREATE INDEX idx_object_owners_entity ON object_owners(entity_type, entity_id);
CREATE INDEX idx_object_owners_role ON object_owners(role);
CREATE INDEX idx_object_owners_permission ON object_owners(permission);
CREATE INDEX idx_object_owners_is_primary ON object_owners(is_primary) WHERE is_primary = TRUE;

-- Triggers
CREATE TRIGGER object_owners_updated_at
  BEFORE UPDATE ON object_owners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER object_owners_enforce_primary
  BEFORE INSERT OR UPDATE ON object_owners
  FOR EACH ROW
  EXECUTE FUNCTION enforce_primary_owner();

CREATE TRIGGER object_owners_validate_accountable
  BEFORE INSERT OR UPDATE ON object_owners
  FOR EACH ROW
  WHEN (NEW.role = 'accountable')
  EXECUTE FUNCTION validate_single_accountable();

-- RLS
ALTER TABLE object_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "object_owners_org_isolation" ON object_owners
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Backfill existing entities (example for jobs)
INSERT INTO object_owners (
  org_id,
  entity_type,
  entity_id,
  user_id,
  role,
  permission,
  is_primary,
  assigned_by,
  assignment_type,
  assigned_at
)
SELECT
  org_id,
  'job',
  id,
  owner_id,
  'accountable',
  'edit',
  TRUE,
  created_by,
  'auto',
  created_at
FROM jobs
WHERE owner_id IS NOT NULL
ON CONFLICT (entity_type, entity_id, user_id) DO NOTHING;
```

---

## Testing Checklist

- [ ] Verify unique constraint prevents duplicate user assignments
- [ ] Test auto-assignment trigger on entity creation
- [ ] Validate exactly-one-accountable rule enforcement
- [ ] Test permission inheritance (accountable → edit, informed → view)
- [ ] Verify transferOwnership atomic operation
- [ ] Test RLS policies for org isolation
- [ ] Validate ownership filter queries (my_items, my_team, consulted, etc.)
- [ ] Test canAccess permission checking
- [ ] Verify primary owner lookup performance
- [ ] Test bulk assignment (replace all owners)
- [ ] Validate role change permission matrix
- [ ] Test copyFromEntity for duplicating RCAI
- [ ] Verify UI components render correct badges/colors
- [ ] Test RCAI header component with all role types
- [ ] Validate filter dropdown shows/hides manager options correctly

---

## Performance Considerations

**Indexes:**
- Composite index on `(entity_type, entity_id)` for fast entity lookups
- Index on `user_id` for "my entities" queries
- Partial index on `is_primary=true` for primary owner lookups

**Caching:**
- Cache ownership checks at request level (avoid N+1 queries)
- Use React Query to cache ownership data client-side
- Invalidate cache on role changes

**Query Optimization:**
- Use LEFT JOIN when ownership is optional
- Use EXISTS subquery for access checks
- Pre-filter by org_id before RCAI joins

**Monitoring:**
- Track slow queries on ownership filters
- Monitor unique constraint violations (indicates UI bugs)
- Alert on entities with 0 or >1 accountable owners

---

## Security Considerations

**Access Control:**
- Never expose RCAI assignments cross-organization (RLS enforcement)
- Validate user permissions before allowing RCAI changes
- Audit all ownership transfers (log assigned_by)

**Data Integrity:**
- Enforce exactly-one-accountable at database level (trigger)
- Prevent orphaned entities (require accountable on creation)
- Cascade delete when user is deleted (ON DELETE CASCADE)

**Privacy:**
- Don't expose internal notes to non-owners
- Redact sensitive assignment reasons in logs
- Limit who can see "all_org" filter

---

*Last Updated: 2024-11-30*
