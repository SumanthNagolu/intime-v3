# Established Code Patterns

This document captures code patterns established during implementation. Follow these patterns for consistency.

---

## CRITICAL: Specs-First Development

**The `/docs/specs/` folder is the BIBLE for InTime.**

### Before ANY Implementation:

1. **Identify relevant spec documents:**
   - Database: `docs/specs/10-DATABASE/{entity}.md`
   - User workflows: `docs/specs/20-USER-ROLES/{role}/{workflow}.md`
   - Screens: `docs/specs/30-SCREENS/{domain}/{screen}.md`
   - Forms: `docs/specs/40-FORMS/{form}.md`
   - Components: `docs/specs/50-COMPONENTS/`

2. **Read and understand the spec completely**

3. **Implement EXACTLY as spec defines**

4. **If spec is wrong or incomplete:**
   - Update the spec FIRST
   - Document the change in commit message
   - Then implement per updated spec

### After ANY Implementation:

1. **Verify implementation matches spec**
2. **Update spec if implementation revealed new details**
3. **Add any discovered edge cases to spec**

### Spec Update Pattern:

```markdown
## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-01 | Agent | Added field X based on implementation discovery |
```

### Spec Reference in Code:

```typescript
/**
 * Job Service
 * 
 * Implements: docs/specs/10-DATABASE/01-jobs.md
 * Workflows: docs/specs/20-USER-ROLES/01-recruiter/02-create-job.md
 */
```

---

## Database Schema Patterns

### Table Standard Fields

Every table MUST include these fields:

```typescript
// Multi-tenancy
orgId: uuid('org_id').notNull().references(() => organizations.id),

// Audit trail
createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
createdBy: uuid('created_by').references(() => userProfiles.id),
updatedBy: uuid('updated_by').references(() => userProfiles.id),

// Soft delete
deletedAt: timestamp('deleted_at', { withTimezone: true }),
```

### RLS Policy Pattern

Every table MUST have RLS enabled with org isolation:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON table_name
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
```

### Index Pattern

Always index:
1. Foreign keys
2. `org_id` (for RLS performance)
3. `status` fields
4. Commonly filtered fields
5. Composite indexes for common queries

---

## Activity Pattern

### Creating Manual Activities

```typescript
import { createActivity } from '@/lib/activities';

// After any action, log the activity
await createActivity({
  type: 'call',
  subject: `Called ${candidate.name}`,
  relatedEntityType: 'candidate',
  relatedEntityId: candidate.id,
  assignedTo: userId,
  status: 'completed',
  outcome: 'successful',
  outcomeNotes: 'Discussed availability',
  durationMinutes: 15,
});
```

### Auto-Activity from Patterns

```typescript
// Patterns auto-create activities on events
// Don't manually create activities that patterns should create

// Event emission triggers pattern matching
await emitEvent({
  type: 'candidate.created',
  entityType: 'candidate',
  entityId: candidate.id,
  actorId: userId,
  eventData: { source: 'manual' },
});
// Pattern CAND_NEW_INTRO_CALL automatically creates follow-up call activity
```

---

## Event Pattern

### Emitting Events

```typescript
import { emitEvent } from '@/lib/events';

// Every mutation should emit an event
await emitEvent({
  type: 'job.created',
  entityType: 'job',
  entityId: job.id,
  actorId: userId,
  eventData: {
    title: job.title,
    accountId: job.accountId,
    priority: job.priority,
  },
});
```

### Event Naming Convention

Format: `{entity}.{action}[.{qualifier}]`

Examples:
- `candidate.created`
- `candidate.status_changed`
- `submission.sent_to_client`
- `interview.completed`

---

## tRPC Router Pattern

### Mutation Template

```typescript
export const entityRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createEntitySchema)
    .mutation(async ({ ctx, input }) => {
      // 1. Validate permissions
      await checkPermission(ctx.user, 'entity.create');
      
      // 2. Execute business logic
      const entity = await db.insert(entities).values({
        ...input,
        orgId: ctx.user.orgId,
        createdBy: ctx.user.id,
      }).returning();
      
      // 3. Emit event
      await emitEvent({
        type: 'entity.created',
        entityType: 'entity',
        entityId: entity.id,
        actorId: ctx.user.id,
        eventData: input,
      });
      
      // 4. Return result
      return entity;
    }),
});
```

---

## Screen Definition Pattern

### Detail Screen

```typescript
import type { ScreenDefinition } from '@/lib/metadata/types';

export const entityDetailScreen: ScreenDefinition = {
  id: 'entity-detail',
  type: 'detail',
  entityType: 'entity',
  title: { type: 'field', path: 'name' },
  
  dataSource: {
    type: 'entity',
    entityType: 'entity',
    entityId: { type: 'param', path: 'id' },
  },
  
  layout: {
    type: 'sidebar-main',
    sidebar: {
      id: 'sidebar',
      type: 'info-card',
      fields: [/* key info fields */],
    },
    tabs: [
      {
        id: 'details',
        label: 'Details',
        sections: [/* detail sections */],
      },
      {
        id: 'activities',
        label: 'Activities',
        icon: 'Activity',
        sections: [{
          id: 'activity-timeline',
          type: 'timeline',
          dataSource: {
            type: 'relation',
            relation: 'activities',
          },
        }],
      },
    ],
  },
  
  actions: [
    {
      id: 'edit',
      type: 'modal',
      label: 'Edit',
      icon: 'Pencil',
      config: { type: 'modal', modal: 'entity-edit' },
    },
  ],
};
```

### List Screen

```typescript
export const entityListScreen: ScreenDefinition = {
  id: 'entity-list',
  type: 'list',
  entityType: 'entity',
  title: 'Entities',
  
  dataSource: {
    type: 'query',
    procedure: 'entity.list',
  },
  
  layout: {
    type: 'single-column',
    sections: [{
      id: 'table',
      type: 'table',
      columns_config: [
        { id: 'name', header: 'Name', accessor: 'name', sortable: true },
        { id: 'status', header: 'Status', accessor: 'status', type: 'status-badge' },
        { id: 'actions', header: '', type: 'row-actions' },
      ],
    }],
  },
  
  actions: [
    {
      id: 'create',
      type: 'navigate',
      label: 'Create New',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'navigate', route: '/entity/new' },
    },
  ],
};
```

---

## InputSet Pattern

```typescript
import type { FieldDefinition } from '@/lib/metadata/types';

export const contactInputSet: FieldDefinition[] = [
  {
    id: 'firstName',
    type: 'text',
    label: 'First Name',
    required: true,
    validation: { minLength: 1, maxLength: 50 },
  },
  {
    id: 'lastName',
    type: 'text',
    label: 'Last Name',
    required: true,
    validation: { minLength: 1, maxLength: 50 },
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email',
    required: true,
  },
  {
    id: 'phone',
    type: 'phone',
    label: 'Phone',
    required: false,
  },
];

// Use in screen section
{
  id: 'contact-info',
  type: 'input-set',
  inputSet: 'contact',
  inputSetPrefix: 'contact', // data.contact.firstName, etc.
}
```

---

## Component Pattern

### Server Component (Default)

```typescript
// app/(employee)/entity/page.tsx
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { entityListScreen } from '@/screens/entity/list.screen';

export default function EntityListPage() {
  return <ScreenRenderer definition={entityListScreen} />;
}
```

### Client Component (Only When Needed)

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function InteractiveComponent() {
  // Client-side state and interactions only
}
```

---

## Test Pattern

### Unit Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createActivity, completeActivity } from '@/lib/activities';

describe('Activity Service', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });
  
  it('creates activity with required fields', async () => {
    const activity = await createActivity({
      type: 'call',
      subject: 'Test call',
      relatedEntityType: 'candidate',
      relatedEntityId: 'test-id',
      assignedTo: 'user-id',
    });
    
    expect(activity.id).toBeDefined();
    expect(activity.status).toBe('open');
  });
});
```

### Multi-Tenancy Test

```typescript
describe('Multi-Tenancy Isolation', () => {
  it('org A cannot see org B data', async () => {
    const orgA = await createTestOrg('Org A');
    const orgB = await createTestOrg('Org B');
    
    const candidateB = await createTestCandidate({ orgId: orgB.id });
    
    const results = await getCandidates({ orgId: orgA.id });
    
    expect(results).not.toContainEqual(
      expect.objectContaining({ id: candidateB.id })
    );
  });
});
```

