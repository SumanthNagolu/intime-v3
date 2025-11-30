# TypeScript Patterns & Common Fixes

> Lessons learned from resolving 1000+ TypeScript errors. Follow these patterns to avoid compilation issues.

## Critical Type Patterns

### 1. Drizzle ORM Type Handling

Drizzle ORM has specific type behaviors that differ from runtime values:

#### Numeric Columns Return Strings
```typescript
// Schema definition
rateMin: numeric('rate_min', { precision: 10, scale: 2 }),

// BAD - TypeScript error
const rate = job.rateMin; // Type is string, not number!

// GOOD - Parse to number when needed
const rate = job.rateMin ? parseFloat(job.rateMin) : null;

// GOOD - For display (keep as string)
const rateDisplay = job.rateMin ?? 'N/A';
```

#### Date Columns Return Strings
```typescript
// BAD - Calling Date methods on string
const dateStr = job.createdAt.toISOString(); // Error!

// GOOD - Already a string, use directly
const dateStr = job.createdAt;

// GOOD - Convert to Date if needed
const date = job.createdAt ? new Date(job.createdAt) : null;
```

#### Relations Are NOT Automatically Loaded
```typescript
// BAD - Relations don't exist unless explicitly joined
const clientName = job.account.name; // Error: account is undefined!
const owner = job.owner.email; // Error: owner is undefined!

// GOOD - Use the ID fields that ARE present
const accountId = job.accountId;
const ownerId = job.ownerId;

// GOOD - If you need relations, explicitly include them in query
const jobWithRelations = await db.query.jobs.findFirst({
  where: eq(jobs.id, jobId),
  with: {
    account: true,
    owner: true,
  },
});
```

#### Self-Referential Foreign Keys
```typescript
// BAD - Circular type inference
parentTaskId: uuid('parent_task_id').references(() => tasks.id),

// GOOD - Add explicit return type to break cycle
parentTaskId: uuid('parent_task_id').references((): any => tasks.id),
```

---

### 2. Supabase Type Assertions

When tables or RPC functions aren't in generated types:

#### Tables Not in Types
```typescript
// BAD - Table not recognized
await supabase.from('audit_logs').insert({...});
await supabase.from('twin_events').select('*');

// GOOD - Type assertion pattern
await (supabase.from as any)('audit_logs').insert({...});
await (supabase.from as any)('twin_events').select('*');
```

#### RPC Functions Not in Types
```typescript
// BAD - RPC not recognized
await supabase.rpc('get_org_context', { p_org_id: orgId });

// GOOD - Type assertion pattern
await (supabase.rpc as any)('get_org_context', { p_org_id: orgId });
```

#### Regenerate Types After Schema Changes
```bash
# After adding tables/functions, regenerate types
pnpm supabase gen types typescript --project-id gkwhxmvugnjwwwiufmdy > src/lib/supabase/database.types.ts
```

---

### 3. tRPC Error Handling

#### TRPCClientError in Hooks
```typescript
// BAD - Direct type mismatch
onError: (error) => {
  options.onError?.(error); // TRPCClientError not assignable to Error
}

// GOOD - Double assertion pattern
onError: (error) => {
  options.onError?.(error as unknown as Error);
}
```

#### Context Properties May Be Null
```typescript
// BAD - ctx.userId might be null
const userId = ctx.userId;
await db.select().where(eq(table.userId, userId)); // Error!

// GOOD - Assert after middleware guarantees it
const userId = ctx.userId as string; // After orgProtectedProcedure

// BETTER - Add explicit check
if (!ctx.userId) {
  throw new TRPCError({ code: 'UNAUTHORIZED' });
}
const userId = ctx.userId;
```

---

### 4. Metadata Framework Patterns

#### Field Definitions
```typescript
// BAD - Old property names
{
  fieldType: 'text',        // Wrong!
  visibility: { ... },      // Wrong!
}

// GOOD - Correct property names
{
  type: 'text',             // Use 'type' not 'fieldType'
  visible: { ... },         // Use 'visible' not 'visibility'
}
```

#### DataSource Structure
```typescript
// BAD - Flat structure
dataSource: {
  type: 'query',
  procedure: 'crm.accounts.list',
  params: {},
}

// GOOD - Nested query structure
dataSource: {
  type: 'query',
  query: {
    procedure: 'crm.accounts.list',
    params: {},
  },
}
```

#### Action Definitions
```typescript
// BAD - Missing required type, incomplete config
{
  id: 'export',
  label: 'Export',
  config: { type: 'custom' },  // Missing 'handler'!
}

// GOOD - Complete action definition
{
  id: 'export',
  type: 'custom',              // Required ActionType
  label: 'Export',
  config: {
    type: 'custom',
    handler: 'handleExport',   // Required for custom actions
  },
}
```

#### Condition Operators
```typescript
// BAD - Full operator names
{ operator: 'equals', ... }
{ operator: 'notEquals', ... }

// GOOD - Abbreviated operators
{ operator: 'eq', ... }
{ operator: 'neq', ... }
// Others: 'gt', 'gte', 'lt', 'lte', 'contains', 'in', 'nin'
```

---

### 5. Null Coalescing Patterns

#### Use `??` Instead of `||`
```typescript
// BAD - || treats 0 and '' as falsy
const count = value || 0;     // Bug: if value is 0, returns 0 anyway
const name = value || null;   // Type issues

// GOOD - ?? only checks null/undefined
const count = value ?? 0;     // Correct: only replaces null/undefined
const name = value ?? null;   // Correct type inference
```

#### Providing Defaults for Nullable Fields
```typescript
// BAD - Type mismatch
const status: string = record.status;  // Error if status is nullable

// GOOD - Provide default
const status = record.status ?? 'pending';
const isActive = record.isActive ?? false;
const count = record.count ?? 0;
```

---

### 6. Component & Hook Patterns

#### useParams Returns string | string[]
```typescript
// BAD - Treating params as simple strings
const { id } = useParams();
router.push(`/entity/${id}`);  // Could be array!

// GOOD - Handle both cases
const params = useParams();
const id = typeof params.id === 'string' ? params.id : params.id?.[0];
```

#### Query Hooks Need Default Values
```typescript
// BAD - Data could be undefined
const { data } = trpc.items.list.useQuery();
data.map(item => ...);  // Error if data is undefined!

// GOOD - Provide default
const { data = [] } = trpc.items.list.useQuery();
data.map(item => ...);  // Safe
```

---

### 7. Import/Export Patterns

#### Type-Only Imports
```typescript
// BAD - Mixed imports can cause issues
import { Role, Candidate } from '@/types';

// GOOD - Explicit type imports
import type { Role, Candidate } from '@/types';
```

#### Re-Export Conflicts
```typescript
// BAD - Wildcard re-exports can conflict
export * from './module-a';  // Has StatItem
export * from './module-b';  // Also has StatItem!

// GOOD - Explicit named exports
export { StatItem, OtherThing } from './module-a';
export { DifferentThing } from './module-b';
```

---

## Quick Reference Checklist

Before committing, verify:

- [ ] Numeric Drizzle columns use `parseFloat()` where needed
- [ ] Date columns treated as strings (no `.toISOString()` on them)
- [ ] No relation access without explicit `.with()` joins
- [ ] Supabase tables/RPC not in types use `as any` pattern
- [ ] tRPC errors use `as unknown as Error` casting
- [ ] Metadata uses `type` not `fieldType`, `visible` not `visibility`
- [ ] DataSource has `query: { procedure, params }` structure
- [ ] Custom actions have `handler` property
- [ ] Null handling uses `??` not `||`
- [ ] Query hooks have default values

---

## Pre-Commit TypeScript Check

Add to your workflow before committing:

```bash
# Quick type check
pnpm tsc --noEmit

# If errors, fix before committing!
```

Consider adding to `.husky/pre-commit`:
```bash
#!/bin/sh
pnpm tsc --noEmit || (echo "TypeScript errors found. Fix before committing." && exit 1)
```

---

## Common Error Messages → Solutions

| Error Message | Solution |
|--------------|----------|
| `Property 'X' does not exist on type` | Check if relation needs `.with()` join, or use correct field name |
| `Type 'string' is not assignable to type 'number'` | Use `parseFloat()` for Drizzle numeric columns |
| `No overload matches this call` (Supabase) | Use `(supabase.from as any)('table')` pattern |
| `'null' is not assignable to type 'string'` | Use `value ?? ''` or `value ?? 'default'` |
| `Type 'X \| null' is not assignable to type 'X'` | Add null check or use `as string` after middleware guarantees |
| `Module has no exported member` | Check if export name changed or type-only import needed |
| `Type instantiation is excessively deep` | Add explicit `: any` return type for self-referential types |
