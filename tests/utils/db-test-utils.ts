/**
 * Database Test Utilities
 * 
 * Provides utilities for database operations in tests:
 * - Test database seeding
 * - Cleanup between tests
 * - Transaction wrapping for test isolation
 */

import { vi } from 'vitest';

// ==========================================
// TYPES
// ==========================================

export interface TestOrganization {
  id: string;
  name: string;
  slug: string;
  tier: 'starter' | 'professional' | 'enterprise';
  createdAt: Date;
}

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  orgId: string;
  role: string;
  createdAt: Date;
}

export interface TestCandidate {
  id: string;
  orgId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  createdAt: Date;
}

export interface TestJob {
  id: string;
  orgId: string;
  title: string;
  accountId: string;
  status: string;
  createdAt: Date;
}

// ==========================================
// MOCK DATABASE STATE
// ==========================================

// In-memory storage for test data
const testData = {
  organizations: new Map<string, TestOrganization>(),
  users: new Map<string, TestUser>(),
  jobs: new Map<string, unknown>(),
  candidates: new Map<string, unknown>(),
  submissions: new Map<string, unknown>(),
  activities: new Map<string, unknown>(),
  events: new Map<string, unknown>(),
};

// ==========================================
// DATABASE UTILITIES
// ==========================================

/**
 * Reset all test data
 */
export function resetTestDatabase(): void {
  testData.organizations.clear();
  testData.users.clear();
  testData.jobs.clear();
  testData.candidates.clear();
  testData.submissions.clear();
  testData.activities.clear();
  testData.events.clear();
}

/**
 * Get test data store for direct manipulation
 */
export function getTestDataStore() {
  return testData;
}

/**
 * Seed test organization
 */
export function seedOrganization(partial: Partial<TestOrganization> = {}): TestOrganization {
  const id = partial.id || `org_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const org: TestOrganization = {
    id,
    name: partial.name || 'Test Organization',
    slug: partial.slug || 'test-org',
    tier: partial.tier || 'professional',
    createdAt: partial.createdAt || new Date(),
  };
  testData.organizations.set(id, org);
  return org;
}

/**
 * Seed test user
 */
export function seedUser(partial: Partial<TestUser> = {}): TestUser {
  const id = partial.id || `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  
  // Ensure org exists
  let orgId = partial.orgId;
  if (!orgId) {
    const org = seedOrganization();
    orgId = org.id;
  }
  
  const user: TestUser = {
    id,
    email: partial.email || `test-${id}@example.com`,
    firstName: partial.firstName || 'Test',
    lastName: partial.lastName || 'User',
    orgId,
    role: partial.role || 'technical_recruiter',
    createdAt: partial.createdAt || new Date(),
  };
  testData.users.set(id, user);
  return user;
}

/**
 * Get all organizations
 */
export function getOrganizations(): TestOrganization[] {
  return Array.from(testData.organizations.values());
}

/**
 * Get organization by ID
 */
export function getOrganizationById(id: string): TestOrganization | undefined {
  return testData.organizations.get(id);
}

/**
 * Get users by organization
 */
export function getUsersByOrg(orgId: string): TestUser[] {
  return Array.from(testData.users.values()).filter((u) => u.orgId === orgId);
}

/**
 * Get user by ID
 */
export function getUserById(id: string): TestUser | undefined {
  return testData.users.get(id);
}

/**
 * Create test organization (alias for seedOrganization)
 */
export function createTestOrg(partial?: Partial<TestOrganization>): TestOrganization {
  return seedOrganization(partial);
}

/**
 * Create test user (alias for seedUser)
 */
export function createTestUser(partial?: Partial<TestUser>): TestUser {
  return seedUser(partial);
}

/**
 * Create test candidate
 */
export function createTestCandidate(partial: Partial<TestCandidate> = {}): TestCandidate {
  const id = partial.id || `cand_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Ensure org exists
  let orgId = partial.orgId;
  if (!orgId) {
    const org = seedOrganization();
    orgId = org.id;
  }

  const candidate: TestCandidate = {
    id,
    orgId,
    email: partial.email || `candidate-${id}@example.com`,
    firstName: partial.firstName || 'Test',
    lastName: partial.lastName || 'Candidate',
    phone: partial.phone,
    status: partial.status || 'active',
    createdAt: partial.createdAt || new Date(),
  };

  testData.candidates.set(id, candidate);
  return candidate;
}

/**
 * Create test job
 */
export function createTestJob(partial: Partial<TestJob> = {}): TestJob {
  const id = partial.id || `job_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Ensure org exists
  let orgId = partial.orgId;
  if (!orgId) {
    const org = seedOrganization();
    orgId = org.id;
  }

  const job: TestJob = {
    id,
    orgId,
    title: partial.title || 'Test Job',
    accountId: partial.accountId || 'account_test',
    status: partial.status || 'open',
    createdAt: partial.createdAt || new Date(),
  };

  testData.jobs.set(id, job);
  return job;
}

/**
 * Clean up all test data
 */
export function cleanupTestData(): void {
  resetTestDatabase();
}

// ==========================================
// DATABASE MOCK SETUP
// ==========================================

/**
 * Create a mock database connection for testing
 * Use this when you need to mock actual database calls
 */
export function createMockDbConnection() {
  return {
    query: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    execute: vi.fn().mockResolvedValue([]),
  };
}

/**
 * Mock the database module
 */
export function mockDatabaseModule() {
  vi.mock('@/lib/db', () => ({
    db: createMockDbConnection(),
  }));
}

// ==========================================
// TRANSACTION UTILITIES
// ==========================================

/**
 * Wrap a test in a transaction that gets rolled back
 * Note: This is for integration tests with real DB connection
 */
export async function withTestTransaction<T>(
  fn: () => Promise<T>
): Promise<T> {
  // In mock environment, just run the function
  // In real DB tests, this would wrap in a transaction
  try {
    return await fn();
  } finally {
    // Cleanup would happen here in real implementation
  }
}

// ==========================================
// ASSERTION HELPERS
// ==========================================

/**
 * Assert that an entity has the standard audit fields
 */
export function assertHasAuditFields(entity: Record<string, unknown>): void {
  const requiredFields = ['createdAt', 'updatedAt', 'createdBy'];
  for (const field of requiredFields) {
    if (entity[field] === undefined) {
      throw new Error(`Entity missing required audit field: ${field}`);
    }
  }
}

/**
 * Assert that an entity has the org_id field (multi-tenancy)
 */
export function assertHasOrgId(entity: Record<string, unknown>): void {
  if (!entity.orgId && !entity.org_id) {
    throw new Error('Entity missing required org_id field for multi-tenancy');
  }
}

/**
 * Assert entity is soft deleted
 */
export function assertIsSoftDeleted(entity: Record<string, unknown>): void {
  if (!entity.deletedAt && !entity.deleted_at) {
    throw new Error('Entity is not soft deleted (deletedAt is null)');
  }
}

/**
 * Assert entity is not soft deleted
 */
export function assertIsNotSoftDeleted(entity: Record<string, unknown>): void {
  if (entity.deletedAt || entity.deleted_at) {
    throw new Error('Entity is soft deleted but should not be');
  }
}

