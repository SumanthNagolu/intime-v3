/**
 * Authentication Test Utilities
 * 
 * Provides utilities for testing with authentication context:
 * - Mock authenticated users
 * - Test different role permissions
 * - RACI assignment testing
 */

import { vi } from 'vitest';

// ==========================================
// TYPES
// ==========================================

export type UserRole =
  | 'technical_recruiter'
  | 'bench_sales'
  | 'ta_specialist'
  | 'pod_manager'
  | 'regional_director'
  | 'hr_manager'
  | 'cfo'
  | 'coo'
  | 'ceo'
  | 'admin'
  | 'client_portal'
  | 'candidate_portal';

export type RACIRole = 'R' | 'A' | 'C' | 'I';

export interface MockAuthUser {
  id: string;
  email: string;
  orgId: string;
  role: UserRole;
  permissions: string[];
  podId?: string;
  regionId?: string;
  firstName?: string;
  lastName?: string;
}

export interface RACIAssignment {
  responsible: string;    // User ID
  accountable: string;    // User ID
  consulted: string[];    // User IDs
  informed: string[];     // User IDs
}

// ==========================================
// MOCK AUTH STATE
// ==========================================

let currentMockUser: MockAuthUser | null = null;

/**
 * Set the current mock user for tests
 */
export function setMockUser(user: MockAuthUser): void {
  currentMockUser = user;
}

/**
 * Get the current mock user
 */
export function getMockUser(): MockAuthUser | null {
  return currentMockUser;
}

/**
 * Clear the mock user
 */
export function clearMockUser(): void {
  currentMockUser = null;
}

// ==========================================
// USER FACTORIES
// ==========================================

/**
 * Create a mock user with role-based defaults
 */
export function createMockUser(overrides: Partial<MockAuthUser> = {}): MockAuthUser {
  const role = overrides.role || 'technical_recruiter';
  const id = overrides.id || `user_${Date.now()}`;
  
  return {
    id,
    email: overrides.email || `${id}@test.com`,
    orgId: overrides.orgId || 'org_test_1',
    role,
    permissions: overrides.permissions || getDefaultPermissions(role),
    podId: overrides.podId,
    regionId: overrides.regionId,
    firstName: overrides.firstName || 'Test',
    lastName: overrides.lastName || 'User',
  };
}

/**
 * Create mock users for each role (useful for permission testing)
 */
export function createMockUsersForAllRoles(orgId: string = 'org_test_1'): Map<UserRole, MockAuthUser> {
  const roles: UserRole[] = [
    'technical_recruiter',
    'bench_sales',
    'ta_specialist',
    'pod_manager',
    'regional_director',
    'hr_manager',
    'cfo',
    'coo',
    'ceo',
    'admin',
  ];
  
  const users = new Map<UserRole, MockAuthUser>();
  
  for (const role of roles) {
    users.set(role, createMockUser({
      id: `user_${role}`,
      email: `${role}@test.com`,
      orgId,
      role,
    }));
  }
  
  return users;
}

// ==========================================
// PERMISSION HELPERS
// ==========================================

/**
 * Get default permissions for a role
 */
export function getDefaultPermissions(role: UserRole): string[] {
  const basePermissions = ['read:own'];
  
  switch (role) {
    case 'technical_recruiter':
      return [
        ...basePermissions,
        'job:create', 'job:read', 'job:update',
        'candidate:create', 'candidate:read', 'candidate:update',
        'submission:create', 'submission:read', 'submission:update',
        'activity:create', 'activity:read', 'activity:update',
        'account:read',
      ];
      
    case 'bench_sales':
      return [
        ...basePermissions,
        'consultant:create', 'consultant:read', 'consultant:update',
        'hotlist:create', 'hotlist:read', 'hotlist:update',
        'job_order:create', 'job_order:read', 'job_order:update',
        'vendor:create', 'vendor:read', 'vendor:update',
        'activity:create', 'activity:read', 'activity:update',
      ];
      
    case 'ta_specialist':
      return [
        ...basePermissions,
        'lead:create', 'lead:read', 'lead:update',
        'deal:create', 'deal:read', 'deal:update',
        'campaign:create', 'campaign:read', 'campaign:update',
        'activity:create', 'activity:read', 'activity:update',
      ];
      
    case 'pod_manager':
      return [
        ...basePermissions,
        'team:read', 'team:manage',
        'job:create', 'job:read', 'job:update', 'job:approve',
        'candidate:read', 'candidate:update',
        'submission:read', 'submission:update', 'submission:approve',
        'activity:create', 'activity:read', 'activity:update',
        'report:team',
      ];
      
    case 'regional_director':
      return [
        ...basePermissions,
        'region:read', 'region:manage',
        'pod:read', 'pod:manage',
        'job:read', 'job:approve',
        'candidate:read',
        'submission:read', 'submission:approve',
        'report:region',
      ];
      
    case 'hr_manager':
      return [
        ...basePermissions,
        'employee:create', 'employee:read', 'employee:update',
        'leave:read', 'leave:approve',
        'timesheet:read', 'timesheet:approve',
        'expense:read', 'expense:approve',
        'onboarding:manage',
        'report:hr',
      ];
      
    case 'cfo':
      return [
        ...basePermissions,
        'finance:read', 'finance:manage',
        'invoice:create', 'invoice:read', 'invoice:update',
        'payroll:read', 'payroll:approve',
        'commission:read', 'commission:approve',
        'report:finance',
      ];
      
    case 'coo':
      return [
        ...basePermissions,
        'operations:read', 'operations:manage',
        'sla:read', 'sla:manage',
        'process:read', 'process:manage',
        'escalation:read', 'escalation:manage',
        'report:operations',
        'event:read:all', // INFORMED on all events
      ];
      
    case 'ceo':
      return [
        ...basePermissions,
        'strategic:read', 'strategic:manage',
        'okr:read', 'okr:manage',
        'board:read', 'board:manage',
        'report:executive',
        '*:read', // Can read everything
      ];
      
    case 'admin':
      return ['*']; // Full access
      
    case 'client_portal':
      return [
        'job:read:own',
        'submission:read:own',
        'interview:read:own',
        'placement:read:own',
      ];
      
    case 'candidate_portal':
      return [
        'profile:read:own', 'profile:update:own',
        'application:read:own',
        'interview:read:own',
      ];
      
    default:
      return basePermissions;
  }
}

/**
 * Check if user has permission
 */
export function hasPermission(user: MockAuthUser, permission: string): boolean {
  // Admin has all permissions
  if (user.permissions.includes('*')) {
    return true;
  }
  
  // Check exact match
  if (user.permissions.includes(permission)) {
    return true;
  }
  
  // Check wildcard patterns
  const [resource, action] = permission.split(':');
  if (user.permissions.includes(`${resource}:*`)) {
    return true;
  }
  if (user.permissions.includes(`*:${action}`)) {
    return true;
  }
  
  return false;
}

// ==========================================
// RACI HELPERS
// ==========================================

/**
 * Create a mock RACI assignment
 */
export function createMockRACIAssignment(overrides: Partial<RACIAssignment> = {}): RACIAssignment {
  return {
    responsible: overrides.responsible || 'user_responsible',
    accountable: overrides.accountable || 'user_accountable',
    consulted: overrides.consulted || ['user_consulted_1'],
    informed: overrides.informed || ['user_informed_1', 'user_coo'],
  };
}

/**
 * Check if user has RACI role on entity
 */
export function hasRACIRole(
  userId: string,
  assignment: RACIAssignment,
  role: RACIRole
): boolean {
  switch (role) {
    case 'R':
      return assignment.responsible === userId;
    case 'A':
      return assignment.accountable === userId;
    case 'C':
      return assignment.consulted.includes(userId);
    case 'I':
      return assignment.informed.includes(userId);
    default:
      return false;
  }
}

/**
 * Get all RACI roles for a user on an entity
 */
export function getUserRACIRoles(
  userId: string,
  assignment: RACIAssignment
): RACIRole[] {
  const roles: RACIRole[] = [];
  
  if (assignment.responsible === userId) roles.push('R');
  if (assignment.accountable === userId) roles.push('A');
  if (assignment.consulted.includes(userId)) roles.push('C');
  if (assignment.informed.includes(userId)) roles.push('I');
  
  return roles;
}

// ==========================================
// MOCK CONTEXT UTILITIES
// ==========================================

/**
 * Create a mock request context for tRPC
 */
export function createMockTRPCContext(user?: MockAuthUser) {
  const authUser = user || currentMockUser;
  
  return {
    user: authUser,
    session: authUser
      ? {
          user: {
            id: authUser.id,
            email: authUser.email,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }
      : null,
    req: {} as unknown,
    res: {} as unknown,
  };
}

/**
 * Mock the auth utilities module
 */
export function mockAuthModule() {
  vi.mock('@/lib/auth', () => ({
    getServerSession: vi.fn(() => {
      const user = getMockUser();
      if (!user) return null;
      return {
        user: {
          id: user.id,
          email: user.email,
          orgId: user.orgId,
        },
      };
    }),
    requireAuth: vi.fn(() => {
      const user = getMockUser();
      if (!user) throw new Error('Unauthorized');
      return user;
    }),
    hasPermission: vi.fn((permission: string) => {
      const user = getMockUser();
      if (!user) return false;
      return hasPermission(user, permission);
    }),
  }));
}

// ==========================================
// TEST HELPERS
// ==========================================

/**
 * Run a test as a specific user
 */
export async function asUser<T>(
  user: MockAuthUser,
  fn: () => Promise<T>
): Promise<T> {
  const previousUser = currentMockUser;
  try {
    setMockUser(user);
    return await fn();
  } finally {
    if (previousUser) {
      setMockUser(previousUser);
    } else {
      clearMockUser();
    }
  }
}

/**
 * Run a test as each role and collect results
 */
export async function testAsEachRole<T>(
  orgId: string,
  fn: (user: MockAuthUser) => Promise<T>
): Promise<Map<UserRole, T | Error>> {
  const users = createMockUsersForAllRoles(orgId);
  const results = new Map<UserRole, T | Error>();
  
  for (const [role, user] of users) {
    try {
      const result = await asUser(user, () => fn(user));
      results.set(role, result);
    } catch (error) {
      results.set(role, error as Error);
    }
  }
  
  return results;
}

