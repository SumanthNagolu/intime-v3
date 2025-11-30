# InTime v3 - Quick Reference

Cheat sheet for patterns, commands, and conventions.

---

## Entity Categories

| Category | Entities | Workplan | Activity Log |
|----------|----------|----------|--------------|
| **Root** | lead, job, submission, deal, placement | ✅ Yes | ✅ All ops |
| **Supporting** | account, contact, candidate, interview, offer | ❌ No | Optional |
| **Platform** | user, org, role, permission | ❌ No | Audit only |

---

## Commands

### Entity Conversion
```bash
/convert-entity [entity]           # Full (all 3 phases)
/convert-entity-config [entity]    # Phase 1: Config
/convert-entity-backend [entity]   # Phase 2: Zod + tRPC
/convert-entity-ui [entity]        # Phase 3: UI + Tests
/sync-entity [entity]              # Audit alignment
```

### MCP Presets
```bash
pnpm claude:coding    # Daily dev (postgres, filesystem, seq-thinking)
pnpm claude:testing   # E2E tests (postgres, playwright, seq-thinking)
pnpm claude:full      # Planning (all tools)
```

### Skills
```bash
Use the database skill     # Drizzle, migrations, schema
Use the trpc skill         # Router development
Use the testing skill      # Vitest, Playwright
Use the recruiting skill   # ATS domain
Use the crm skill          # CRM domain
```

---

## File Locations

```
src/lib/entities/[domain]/[entity].entity.ts   # Entity config
src/lib/validations/[entity].ts                # Zod schemas
src/server/routers/[domain].ts                 # tRPC router
src/screens/[domain]/[entity]-*.screen.ts      # Screen defs
src/app/employee/[module]/[entity]/page.tsx    # Page wrappers
src/hooks/queries/[entity].ts                  # Query hooks
src/hooks/mutations/[entity].ts                # Mutation hooks
tests/e2e/[domain]/[entity]-complete-flow.spec.ts  # E2E tests
```

---

## Database Patterns

### Always Include
```typescript
where: and(
  eq(table.orgId, ctx.user.orgId),  // Multi-tenant
  isNull(table.deletedAt),           // Soft delete
)
```

### Run Migrations
```bash
source .env.local
curl -X POST 'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql' \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"sql":"YOUR SQL HERE"}'
```

### Check Schema
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'table_name'
ORDER BY ordinal_position;
```

---

## tRPC Patterns

### Standard Procedures
```typescript
get[Entity]ById   // Single entity
list[Entities]    // Paginated list
create[Entity]    // Create with workplan (root)
update[Entity]    // Update with activity log
delete[Entity]    // Soft delete
```

### Root Entity Create
```typescript
return db.transaction(async (tx) => {
  // 1. Create entity
  const [entity] = await tx.insert(table).values({...}).returning();

  // 2. Create workplan
  await createWorkplanInstance(tx, {...});

  // 3. Log activity
  await logActivity(tx, {...});

  return entity;
});
```

### Root Entity Update
```typescript
return db.transaction(async (tx) => {
  // 1. Get old values
  const old = await tx.query.table.findFirst({...});

  // 2. Update
  const [entity] = await tx.update(table).set({...}).returning();

  // 3. Log activity
  await logActivity(tx, {...});

  // 4. Handle status change
  if (old.status !== entity.status) {
    await handleStatusChange(tx, {...});
  }

  return entity;
});
```

---

## Workplan Helpers

```typescript
import {
  createWorkplanInstance,
  logActivity,
  handleStatusChange,
} from '@/lib/workplan';

// Create workplan on entity creation
await createWorkplanInstance(tx, {
  orgId,
  entityType: 'lead',
  entityId: entity.id,
  templateCode: 'lead_workflow',
  createdBy: userId,
});

// Log any activity
await logActivity(tx, {
  orgId,
  entityType: 'lead',
  entityId: entity.id,
  subject: 'Lead updated',
  category: 'update', // lifecycle, update, call, email, meeting, task
  performedBy: userId,
  details: { changes: {...} },
});

// Handle status changes (triggers successors)
await handleStatusChange(tx, {
  orgId,
  entityType: 'lead',
  entityId: entity.id,
  oldStatus: 'new',
  newStatus: 'qualified',
  changedBy: userId,
});
```

---

## Testing Patterns

### Login Helper
```typescript
async function loginAs(page: Page, role: 'recruiter' | 'admin' | 'manager') {
  const creds = {
    recruiter: { email: 'jr_rec@intime.com', password: 'TestPass123!' },
    admin: { email: 'admin@intime.com', password: 'TestPass123!' },
    manager: { email: 'hr_admin@intime.com', password: 'TestPass123!' },
  };
  await page.goto('/auth/employee');
  await page.fill('[data-testid="email"]', creds[role].email);
  await page.fill('[data-testid="password"]', creds[role].password);
  await page.click('[data-testid="submit"]');
  await page.waitForURL(/\/employee\//);
}
```

### Test Structure
```typescript
test.describe('[Entity] - Complete Flow', () => {
  test.describe('CRUD Operations', () => {...});
  test.describe('List Operations', () => {...});
  test.describe('Activity Tracking', () => {...});  // Root only
  test.describe('Screenshots', () => {...});
});
```

### Run Tests
```bash
pnpm playwright test tests/e2e/[domain]/[entity].spec.ts
pnpm playwright test --headed  # With browser
pnpm playwright show-report    # View report
```

---

## Zod Schema Patterns

### Full Entity
```typescript
export const entitySchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  // ... fields
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});
```

### Create Input
```typescript
export const createEntityInput = z.object({
  // Required fields
  name: z.string().min(1).max(255),
  // Optional with defaults
  status: z.enum([...]).default('new'),
  // Optional
  description: z.string().optional(),
});
```

### Update Input
```typescript
export const updateEntityInput = z.object({
  id: z.string().uuid(),
  data: createEntityInput.partial(),
});
```

### List Input
```typescript
export const listEntitiesInput = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(25),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  filters: z.object({
    status: z.array(z.string()).optional(),
    ownerId: z.string().uuid().optional(),
  }).optional(),
});
```

---

## Screen Definition Patterns

### List Screen
```typescript
export const entityListScreen: ScreenDefinition = {
  id: 'entity-list',
  type: 'list',
  dataSource: { type: 'query', query: { router: 'domain', procedure: 'listEntities' } },
  columns: [...],
  filters: [...],
  pagination: { defaultPageSize: 25 },
  actions: [{ id: 'create', label: 'New', action: { type: 'navigate', path: '...' } }],
};
```

### Detail Screen
```typescript
export const entityDetailScreen: ScreenDefinition = {
  id: 'entity-detail',
  type: 'detail',
  dataSource: { type: 'query', query: { router: 'domain', procedure: 'getEntityById' } },
  layout: { type: 'sidebar-right', sidebar: {...} },
  tabs: [
    { id: 'overview', label: 'Overview', sections: [...] },
    { id: 'activity', label: 'Activity', sections: [...] },  // Root only
  ],
  actions: [...],
};
```

---

## Git Commit Patterns

```bash
# Entity config
git commit -m "feat(crm): add lead entity configuration"

# Backend
git commit -m "feat(crm): add lead backend procedures"

# Frontend + tests
git commit -m "feat(crm): add lead frontend + E2E tests"

# Format
feat([domain]): [what]
fix([domain]): [what]
refactor([domain]): [what]
```

---

## Test Users

| Role | Email | Password |
|------|-------|----------|
| CEO | ceo@intime.com | TestPass123! |
| Admin | admin@intime.com | TestPass123! |
| HR Manager | hr_admin@intime.com | TestPass123! |
| Recruiter | jr_rec@intime.com | TestPass123! |
| Bench Sales | jr_bs@intime.com | TestPass123! |
| TA/Sales | jr_ta@intime.com | TestPass123! |
| Trainer | trainer@intime.com | TestPass123! |
| Student | student@intime.com | TestPass123! |

---

## Workplan Templates

| Entity | Template Code | Trigger |
|--------|--------------|---------|
| Lead | `lead_workflow` | create |
| Deal | `deal_workflow` | create |
| Job | `job_workflow` | create |
| Submission | `submission_workflow` | create |
| Placement | `placement_workflow` | create |

---

## Activity Categories

| Category | Use For |
|----------|---------|
| `lifecycle` | Created, deleted, converted |
| `status_change` | Status transitions |
| `update` | Field changes |
| `call` | Phone calls |
| `email` | Emails sent/received |
| `meeting` | Meetings |
| `task` | Internal tasks |
| `note` | General notes |
| `follow_up` | Follow-up activities |

---

## Quick Conversions

### Field Type → Zod
| Config | Zod |
|--------|-----|
| `text` | `z.string()` |
| `email` | `z.string().email()` |
| `phone` | `z.string()` |
| `url` | `z.string().url()` |
| `number` | `z.number()` |
| `currency` | `z.number().min(0)` |
| `boolean` | `z.boolean()` |
| `date` | `z.coerce.date()` |
| `timestamp` | `z.date()` |
| `uuid` | `z.string().uuid()` |
| `enum` | `z.enum([...])` |
| `tags` | `z.array(z.string())` |
| `json` | `z.record(z.unknown())` |

---

## Common Fixes

### Type Error in Router
- Check Drizzle schema matches entity config
- Verify import paths

### Workplan Not Created
- Check template exists: `SELECT * FROM workplan_templates WHERE entity_type = 'x'`
- Verify `createWorkplanInstance` import

### E2E Test Failing
- Run `pnpm dev` first
- Check selectors match `data-testid`
- Verify test user credentials
- Check database has seed data

### Activity Not Showing
- Verify entity is Root category
- Check `logActivity` called in mutation
- Verify `activities` router in root.ts
