# FOUND-014: Write Integration Tests for Auth + RLS

**Story Points:** 3
**Sprint:** Sprint 3 (Week 5-6)
**Priority:** HIGH

---

## User Story

As a **QA Engineer**,
I want **integration tests that verify auth and RLS work together**,
So that **we catch security issues before production**.

---

## Acceptance Criteria

- [ ] Test database setup with RLS policies
- [ ] Auth flow tested (signup, login, logout)
- [ ] RLS policies tested (users can only see own data)
- [ ] Permission checks tested
- [ ] Test data seeding and cleanup
- [ ] 80%+ coverage for auth + RLS modules

---

## Technical Implementation

Create file: `tests/integration/auth-rls.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

describe('Auth + RLS Integration', () => {
  let testUserId: string;
  let testUserEmail: string;

  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await supabase.from('user_profiles').delete().eq('id', testUserId);
    }
  });

  describe('User Signup', () => {
    it('should create user profile after signup', async () => {
      testUserEmail = `test-${Date.now()}@example.com`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testUserEmail,
        password: 'Test1234!'
      });

      expect(authError).toBeNull();
      expect(authData.user).toBeDefined();
      testUserId = authData.user!.id;

      // Verify profile created via trigger
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      expect(profileError).toBeNull();
      expect(profile.email).toBe(testUserEmail);
    });

    it('should assign guest role by default', async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', testUserId);

      expect(roles).toHaveLength(1);
      expect(roles![0].roles.name).toBe('guest');
    });
  });

  describe('RLS Policies', () => {
    it('should allow user to read own profile', async () => {
      // Sign in as test user
      const { data: session } = await supabase.auth.signInWithPassword({
        email: testUserEmail,
        password: 'Test1234!'
      });

      expect(session.session).toBeDefined();

      // Read own profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      expect(error).toBeNull();
      expect(data.id).toBe(testUserId);
    });

    it('should block user from reading other profiles', async () => {
      // Create another user
      const { data: otherAuth } = await supabase.auth.signUp({
        email: `other-${Date.now()}@example.com`,
        password: 'Test1234!'
      });

      const otherUserId = otherAuth.user!.id;

      // Try to read other user's profile (should be blocked by RLS)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      // RLS should block this
      expect(data).toBeNull();

      // Cleanup
      await supabase.from('user_profiles').delete().eq('id', otherUserId);
    });
  });
});
```

---

## Dependencies

- **Requires:** FOUND-001 to FOUND-006, FOUND-013

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
