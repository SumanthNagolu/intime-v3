# ACAD-006: Implement Prerequisites and Sequencing

**Status:** ⚪ Not Started

**Story Points:** 4
**Sprint:** Sprint 1 (Week 5-6)
**Priority:** HIGH

---

## User Story

As a **Student**,
I want **sequential topic unlocking based on completion**,
So that **I master fundamentals before advancing to complex topics**.

---

## Acceptance Criteria

- [ ] Topics locked until prerequisites completed
- [ ] Visual indicators (locked/unlocked icons)
- [ ] "Unlock next topic" flow (complete → unlock → notify)
- [ ] Module-level prerequisites (must complete Module 1 before Module 2)
- [ ] Topic-level prerequisites (must complete Topic 1.1 before 1.2)
- [ ] Course-level prerequisites (Advanced course requires Beginner completion)
- [ ] Bypass for admins/trainers (testing purposes)
- [ ] Clear error messages when trying to access locked content
- [ ] Analytics (track unlock progression)

---

## Technical Implementation

### UI Components

Create file: `src/components/academy/TopicLockStatus.tsx`

```typescript
'use client';

import { Lock, Unlock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicLockStatusProps {
  isUnlocked: boolean;
  isCompleted: boolean;
  topicTitle: string;
}

export function TopicLockStatus({ isUnlocked, isCompleted, topicTitle }: TopicLockStatusProps) {
  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Check className="h-5 w-5" />
        <span className="text-sm font-medium">Completed</span>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Lock className="h-5 w-5" />
        <span className="text-sm">Locked</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-blue-600">
      <Unlock className="h-5 w-5" />
      <span className="text-sm font-medium">Available</span>
    </div>
  );
}
```

### Prerequisite Checker Component

Create file: `src/components/academy/PrerequisiteGate.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface PrerequisiteGateProps {
  topicId: string;
  children: React.ReactNode;
}

export function PrerequisiteGate({ topicId, children }: PrerequisiteGateProps) {
  const { data: unlockStatus, isLoading } = trpc.progress.isTopicUnlocked.useQuery({ topicId });

  if (isLoading) {
    return <div>Checking access...</div>;
  }

  if (!unlockStatus?.unlocked) {
    return (
      <Alert variant="warning" className="my-4">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          This topic is locked. Complete previous topics to unlock.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
```

### Server-Side Unlock Checking

Create file: `src/lib/academy/unlock-checker.ts`

```typescript
import { createAdminClient } from '@/lib/supabase/admin';

export async function checkTopicUnlock(
  userId: string,
  topicId: string
): Promise<{ unlocked: boolean; reason?: string }> {
  const supabase = createAdminClient();

  // Check if user is admin/trainer (bypass prerequisites)
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', userId);

  const hasAdminAccess = roles?.some((r: any) =>
    ['admin', 'trainer', 'course_admin'].includes(r.role?.name)
  );

  if (hasAdminAccess) {
    return { unlocked: true, reason: 'Admin/trainer bypass' };
  }

  // Check prerequisites via database function
  const { data: isUnlocked, error } = await supabase.rpc('is_topic_unlocked', {
    p_user_id: userId,
    p_topic_id: topicId,
  });

  if (error) {
    throw new Error(`Failed to check unlock status: ${error.message}`);
  }

  if (!isUnlocked) {
    // Get prerequisite topic titles for helpful error message
    const { data: topic } = await supabase
      .from('module_topics')
      .select(`
        title,
        prerequisite_topic_ids,
        prerequisites:module_topics!prerequisite_topic_ids(title)
      `)
      .eq('id', topicId)
      .single();

    const prereqTitles = topic?.prerequisites?.map((p: any) => p.title).join(', ');

    return {
      unlocked: false,
      reason: prereqTitles
        ? `Complete these topics first: ${prereqTitles}`
        : 'Prerequisites not met',
    };
  }

  return { unlocked: true };
}
```

### Module Sequencing

```sql
-- Already implemented in ACAD-001, but add helper view:

CREATE VIEW module_unlock_requirements AS
SELECT
  cm.id AS module_id,
  cm.title AS module_title,
  cm.module_number,
  cm.prerequisite_module_ids,
  (
    SELECT ARRAY_AGG(cm2.title)
    FROM course_modules cm2
    WHERE cm2.id = ANY(cm.prerequisite_module_ids)
  ) AS prerequisite_titles
FROM course_modules cm;
```

---

## Dependencies

- **ACAD-001** (Courses schema with prerequisite fields)
- **ACAD-003** (Progress tracking) - Checks completions

---

## Testing

```typescript
describe('Prerequisites & Sequencing', () => {
  it('should lock Topic 2 until Topic 1 completed', async () => {
    const unlock1 = await checkTopicUnlock('user-id', 'topic-2-id');
    expect(unlock1.unlocked).toBe(false);

    // Complete Topic 1
    await completeTopic('user-id', 'enrollment-id', 'topic-1-id');

    const unlock2 = await checkTopicUnlock('user-id', 'topic-2-id');
    expect(unlock2.unlocked).toBe(true);
  });

  it('should allow admin bypass', async () => {
    const unlock = await checkTopicUnlocked('admin-user-id', 'topic-99-id');
    expect(unlock.unlocked).toBe(true);
    expect(unlock.reason).toContain('bypass');
  });
});
```

---

## Verification Queries

```sql
-- Check topic unlock status for a user
SELECT is_topic_unlocked('user-id', 'topic-id');

-- View module dependencies
SELECT * FROM module_unlock_requirements WHERE module_number > 1;

-- Get locked topics for a user
SELECT
  mt.id,
  mt.title,
  mt.topic_number,
  is_topic_unlocked('user-id', mt.id) AS is_unlocked
FROM module_topics mt
WHERE is_published = true
ORDER BY module_id, topic_number;
```

---

**Related Stories:**
- **Next:** ACAD-007 (Video Player) - Sprint 2
- **Depends On:** ACAD-001, ACAD-003
