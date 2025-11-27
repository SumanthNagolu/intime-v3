#!/usr/bin/env npx tsx
/**
 * Assign Roles and Permissions to Existing Users
 * 
 * Updates existing Supabase users with proper roles and permissions.
 * Users are already created in Supabase auth.
 * 
 * Usage: pnpm tsx scripts/seed-test-users.ts
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================================
// Existing Users - Already in Supabase Auth
// ============================================================================

interface ExistingUser {
  email: string;
  fullName: string;
  roleName: string;
  roleDisplayName: string;
}

// Your existing users in Supabase
const EXISTING_USERS: ExistingUser[] = [
  {
    email: 'ceo@intime.com',
    fullName: 'InTime CEO',
    roleName: 'super_admin',
    roleDisplayName: 'CEO / Super Admin',
  },
  {
    email: 'admin@intime.com',
    fullName: 'InTime Admin',
    roleName: 'admin',
    roleDisplayName: 'Admin',
  },
  {
    email: 'hr_admin@intime.com',
    fullName: 'HR Administrator',
    roleName: 'hr_manager',
    roleDisplayName: 'HR Manager',
  },
  {
    email: 'jr_rec@intime.com',
    fullName: 'Junior Recruiter',
    roleName: 'recruiter',
    roleDisplayName: 'Recruiter',
  },
  {
    email: 'jr_bs@intime.com',
    fullName: 'Junior Bench Sales',
    roleName: 'bench_sales',
    roleDisplayName: 'Bench Sales',
  },
  {
    email: 'jr_ta@intime.com',
    fullName: 'Junior Talent Acquisition',
    roleName: 'ta_sales',
    roleDisplayName: 'Talent Acquisition / Sales',
  },
  {
    email: 'trainer@intime.com',
    fullName: 'InTime Trainer',
    roleName: 'trainer',
    roleDisplayName: 'Trainer',
  },
  {
    email: 'student@intime.com',
    fullName: 'InTime Student',
    roleName: 'student',
    roleDisplayName: 'Student',
  },
];

// Common password for all users
const COMMON_PASSWORD = 'TestPass123!';

// ============================================================================
// Role and Permission Definitions
// ============================================================================

const SYSTEM_ROLES = [
  { name: 'super_admin', displayName: 'Super Admin', hierarchyLevel: 0, isSystemRole: true, colorCode: '#dc2626' },
  { name: 'admin', displayName: 'Admin', hierarchyLevel: 1, isSystemRole: true, colorCode: '#ea580c' },
  { name: 'hr_manager', displayName: 'HR Manager', hierarchyLevel: 2, isSystemRole: true, colorCode: '#16a34a' },
  { name: 'recruiter', displayName: 'Recruiter', hierarchyLevel: 2, isSystemRole: true, colorCode: '#2563eb' },
  { name: 'bench_sales', displayName: 'Bench Sales', hierarchyLevel: 2, isSystemRole: true, colorCode: '#7c3aed' },
  { name: 'ta_sales', displayName: 'Talent Acquisition / Sales', hierarchyLevel: 2, isSystemRole: true, colorCode: '#0891b2' },
  { name: 'trainer', displayName: 'Trainer', hierarchyLevel: 3, isSystemRole: true, colorCode: '#ca8a04' },
  { name: 'student', displayName: 'Student', hierarchyLevel: 4, isSystemRole: true, colorCode: '#64748b' },
  { name: 'employee', displayName: 'Employee', hierarchyLevel: 3, isSystemRole: true, colorCode: '#059669' },
  { name: 'candidate', displayName: 'Candidate', hierarchyLevel: 5, isSystemRole: true, colorCode: '#8b5cf6' },
  { name: 'client', displayName: 'Client', hierarchyLevel: 5, isSystemRole: true, colorCode: '#f59e0b' },
];

// Permissions by resource and action
const PERMISSIONS = [
  // User management
  { resource: 'users', action: 'create', scope: 'all', displayName: 'Create Users', isDangerous: true },
  { resource: 'users', action: 'read', scope: 'all', displayName: 'View All Users', isDangerous: false },
  { resource: 'users', action: 'read', scope: 'own', displayName: 'View Own Profile', isDangerous: false },
  { resource: 'users', action: 'update', scope: 'all', displayName: 'Update Any User', isDangerous: true },
  { resource: 'users', action: 'update', scope: 'own', displayName: 'Update Own Profile', isDangerous: false },
  { resource: 'users', action: 'delete', scope: 'all', displayName: 'Delete Users', isDangerous: true },
  
  // Role management
  { resource: 'roles', action: 'manage', scope: 'all', displayName: 'Manage Roles', isDangerous: true },
  { resource: 'roles', action: 'assign', scope: 'all', displayName: 'Assign Roles', isDangerous: true },
  
  // Job management
  { resource: 'jobs', action: 'create', scope: 'all', displayName: 'Create Jobs', isDangerous: false },
  { resource: 'jobs', action: 'read', scope: 'all', displayName: 'View All Jobs', isDangerous: false },
  { resource: 'jobs', action: 'read', scope: 'own', displayName: 'View Assigned Jobs', isDangerous: false },
  { resource: 'jobs', action: 'update', scope: 'all', displayName: 'Update Any Job', isDangerous: false },
  { resource: 'jobs', action: 'update', scope: 'own', displayName: 'Update Own Jobs', isDangerous: false },
  { resource: 'jobs', action: 'delete', scope: 'all', displayName: 'Delete Jobs', isDangerous: true },
  
  // Candidate management
  { resource: 'candidates', action: 'create', scope: 'all', displayName: 'Create Candidates', isDangerous: false },
  { resource: 'candidates', action: 'read', scope: 'all', displayName: 'View All Candidates', isDangerous: false },
  { resource: 'candidates', action: 'update', scope: 'all', displayName: 'Update Candidates', isDangerous: false },
  { resource: 'candidates', action: 'delete', scope: 'all', displayName: 'Delete Candidates', isDangerous: true },
  
  // Submissions
  { resource: 'submissions', action: 'create', scope: 'all', displayName: 'Create Submissions', isDangerous: false },
  { resource: 'submissions', action: 'read', scope: 'all', displayName: 'View All Submissions', isDangerous: false },
  { resource: 'submissions', action: 'update', scope: 'all', displayName: 'Update Submissions', isDangerous: false },
  
  // Placements
  { resource: 'placements', action: 'create', scope: 'all', displayName: 'Create Placements', isDangerous: false },
  { resource: 'placements', action: 'read', scope: 'all', displayName: 'View All Placements', isDangerous: false },
  { resource: 'placements', action: 'update', scope: 'all', displayName: 'Update Placements', isDangerous: false },
  
  // Accounts/Clients
  { resource: 'accounts', action: 'create', scope: 'all', displayName: 'Create Accounts', isDangerous: false },
  { resource: 'accounts', action: 'read', scope: 'all', displayName: 'View All Accounts', isDangerous: false },
  { resource: 'accounts', action: 'update', scope: 'all', displayName: 'Update Accounts', isDangerous: false },
  { resource: 'accounts', action: 'delete', scope: 'all', displayName: 'Delete Accounts', isDangerous: true },
  
  // Bench Sales specific
  { resource: 'bench', action: 'manage', scope: 'all', displayName: 'Manage Bench Consultants', isDangerous: false },
  { resource: 'hotlists', action: 'create', scope: 'all', displayName: 'Create Hotlists', isDangerous: false },
  { resource: 'hotlists', action: 'send', scope: 'all', displayName: 'Send Hotlists', isDangerous: false },
  
  // HR specific
  { resource: 'employees', action: 'manage', scope: 'all', displayName: 'Manage Employees', isDangerous: true },
  { resource: 'payroll', action: 'manage', scope: 'all', displayName: 'Manage Payroll', isDangerous: true },
  { resource: 'reviews', action: 'manage', scope: 'all', displayName: 'Manage Reviews', isDangerous: false },
  { resource: 'pods', action: 'manage', scope: 'all', displayName: 'Manage Pods', isDangerous: false },
  
  // TA/Sales specific
  { resource: 'campaigns', action: 'create', scope: 'all', displayName: 'Create Campaigns', isDangerous: false },
  { resource: 'campaigns', action: 'manage', scope: 'all', displayName: 'Manage Campaigns', isDangerous: false },
  { resource: 'leads', action: 'create', scope: 'all', displayName: 'Create Leads', isDangerous: false },
  { resource: 'leads', action: 'manage', scope: 'all', displayName: 'Manage Leads', isDangerous: false },
  { resource: 'deals', action: 'manage', scope: 'all', displayName: 'Manage Deals', isDangerous: false },
  
  // Training specific
  { resource: 'courses', action: 'create', scope: 'all', displayName: 'Create Courses', isDangerous: false },
  { resource: 'courses', action: 'manage', scope: 'all', displayName: 'Manage Courses', isDangerous: false },
  { resource: 'students', action: 'manage', scope: 'all', displayName: 'Manage Students', isDangerous: false },
  { resource: 'certificates', action: 'issue', scope: 'all', displayName: 'Issue Certificates', isDangerous: false },
  
  // System
  { resource: 'audit_logs', action: 'read', scope: 'all', displayName: 'View Audit Logs', isDangerous: false },
  { resource: 'settings', action: 'manage', scope: 'all', displayName: 'Manage Settings', isDangerous: true },
  { resource: 'analytics', action: 'read', scope: 'all', displayName: 'View Analytics', isDangerous: false },
];

// Role-Permission mappings
const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['*'], // All permissions
  admin: [
    'users:create:all', 'users:read:all', 'users:update:all', 'users:delete:all',
    'roles:manage:all', 'roles:assign:all',
    'jobs:*', 'candidates:*', 'submissions:*', 'placements:*', 'accounts:*',
    'bench:*', 'hotlists:*',
    'employees:*', 'payroll:*', 'reviews:*', 'pods:*',
    'campaigns:*', 'leads:*', 'deals:*',
    'courses:*', 'students:*', 'certificates:*',
    'audit_logs:read:all', 'settings:manage:all', 'analytics:read:all',
  ],
  hr_manager: [
    'users:read:all', 'users:update:own',
    'employees:manage:all', 'payroll:manage:all', 'reviews:manage:all', 'pods:manage:all',
    'analytics:read:all',
  ],
  recruiter: [
    'users:read:own', 'users:update:own',
    'jobs:create:all', 'jobs:read:all', 'jobs:update:own',
    'candidates:create:all', 'candidates:read:all', 'candidates:update:all',
    'submissions:create:all', 'submissions:read:all', 'submissions:update:all',
    'placements:create:all', 'placements:read:all', 'placements:update:all',
    'accounts:create:all', 'accounts:read:all', 'accounts:update:all',
    'analytics:read:all',
  ],
  bench_sales: [
    'users:read:own', 'users:update:own',
    'jobs:read:all',
    'candidates:read:all', 'candidates:update:all',
    'bench:manage:all',
    'hotlists:create:all', 'hotlists:send:all',
    'submissions:create:all', 'submissions:read:all', 'submissions:update:all',
    'analytics:read:all',
  ],
  ta_sales: [
    'users:read:own', 'users:update:own',
    'campaigns:create:all', 'campaigns:manage:all',
    'leads:create:all', 'leads:manage:all',
    'deals:manage:all',
    'accounts:create:all', 'accounts:read:all', 'accounts:update:all',
    'analytics:read:all',
  ],
  trainer: [
    'users:read:own', 'users:update:own',
    'courses:create:all', 'courses:manage:all',
    'students:manage:all',
    'certificates:issue:all',
  ],
  student: [
    'users:read:own', 'users:update:own',
  ],
  employee: [
    'users:read:own', 'users:update:own',
  ],
  candidate: [
    'users:read:own', 'users:update:own',
    'jobs:read:all',
  ],
  client: [
    'users:read:own', 'users:update:own',
    'jobs:read:own',
    'candidates:read:own',
    'submissions:read:own',
  ],
};

// ============================================================================
// Seeding Functions
// ============================================================================

async function ensureOrganization(): Promise<string> {
  console.log(`\n📁 Ensuring organization exists...`);
  
  // Check if org already exists
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', 'intime')
    .single();
  
  if (existingOrg) {
    console.log(`   ✓ Organization exists: intime`);
    return existingOrg.id;
  }
  
  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      name: 'InTime',
      slug: 'intime',
      status: 'active',
      subscription_tier: 'enterprise',
      subscription_status: 'active',
      max_users: 100,
      max_candidates: 10000,
      features: {
        aiMentoring: true,
        crossPollination: true,
        advancedAnalytics: true,
        customBranding: true,
        apiAccess: true,
        ssoEnabled: false,
      },
    })
    .select()
    .single();
  
  if (error) {
    console.error(`   ❌ Failed to create organization: ${error.message}`);
    throw error;
  }
  
  console.log(`   ✓ Created organization: ${org.id}`);
  return org.id;
}

async function seedRoles(): Promise<Map<string, string>> {
  console.log(`\n🎭 Seeding roles...`);
  const roleMap = new Map<string, string>();
  
  for (const role of SYSTEM_ROLES) {
    // Check if role exists
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role.name)
      .single();
    
    if (existingRole) {
      console.log(`   ✓ Role exists: ${role.name}`);
      roleMap.set(role.name, existingRole.id);
      continue;
    }
    
    const { data: newRole, error } = await supabase
      .from('roles')
      .insert({
        name: role.name,
        display_name: role.displayName,
        hierarchy_level: role.hierarchyLevel,
        is_system_role: role.isSystemRole,
        color_code: role.colorCode,
        is_active: true,
      })
      .select()
      .single();
    
    if (error) {
      console.error(`   ❌ Failed to create role ${role.name}: ${error.message}`);
    } else {
      console.log(`   ✓ Created role: ${role.name}`);
      roleMap.set(role.name, newRole.id);
    }
  }
  
  return roleMap;
}

async function seedPermissions(): Promise<Map<string, string>> {
  console.log(`\n🔐 Seeding permissions...`);
  const permissionMap = new Map<string, string>();
  
  for (const perm of PERMISSIONS) {
    const permKey = `${perm.resource}:${perm.action}:${perm.scope}`;
    
    // Check if permission exists
    const { data: existingPerm } = await supabase
      .from('permissions')
      .select('id')
      .eq('resource', perm.resource)
      .eq('action', perm.action)
      .eq('scope', perm.scope)
      .single();
    
    if (existingPerm) {
      permissionMap.set(permKey, existingPerm.id);
      continue;
    }
    
    const { data: newPerm, error } = await supabase
      .from('permissions')
      .insert({
        resource: perm.resource,
        action: perm.action,
        scope: perm.scope,
        display_name: perm.displayName,
        is_dangerous: perm.isDangerous,
      })
      .select()
      .single();
    
    if (error) {
      console.error(`   ❌ Failed to create permission ${permKey}: ${error.message}`);
    } else {
      permissionMap.set(permKey, newPerm.id);
    }
  }
  
  console.log(`   ✓ Seeded ${permissionMap.size} permissions`);
  return permissionMap;
}

async function assignRolePermissions(roleMap: Map<string, string>, permissionMap: Map<string, string>): Promise<void> {
  console.log(`\n🔗 Assigning permissions to roles...`);
  
  for (const [roleName, permPatterns] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap.get(roleName);
    if (!roleId) {
      console.log(`   ⚠️ Role not found: ${roleName}`);
      continue;
    }
    
    // Handle super_admin with all permissions
    if (permPatterns.includes('*')) {
      for (const [permKey, permId] of permissionMap.entries()) {
        await assignPermissionToRole(roleId, permId);
      }
      console.log(`   ✓ ${roleName}: All permissions`);
      continue;
    }
    
    let assignedCount = 0;
    for (const pattern of permPatterns) {
      // Handle wildcard patterns like 'jobs:*'
      if (pattern.includes('*')) {
        const prefix = pattern.replace('*', '');
        for (const [permKey, permId] of permissionMap.entries()) {
          if (permKey.startsWith(prefix)) {
            await assignPermissionToRole(roleId, permId);
            assignedCount++;
          }
        }
      } else {
        const permId = permissionMap.get(pattern);
        if (permId) {
          await assignPermissionToRole(roleId, permId);
          assignedCount++;
        }
      }
    }
    console.log(`   ✓ ${roleName}: ${assignedCount} permissions`);
  }
}

async function assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
  const { error } = await supabase
    .from('role_permissions')
    .upsert({
      role_id: roleId,
      permission_id: permissionId,
      granted_at: new Date().toISOString(),
    }, {
      onConflict: 'role_id,permission_id',
    });
  
  if (error && error.code !== '23505') {
    // Ignore unique violations, log other errors
    console.error(`   ⚠️ Failed to assign permission: ${error.message}`);
  }
}

async function assignRolesToUsers(roleMap: Map<string, string>, orgId: string): Promise<void> {
  console.log(`\n👤 Assigning roles to existing users...`);

  for (const user of EXISTING_USERS) {
    console.log(`\n   Processing: ${user.email}`);

    // Get auth user by email
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error(`   ❌ Failed to list users: ${listError.message}`);
      continue;
    }

    const authUser = authUsers.users.find(u => u.email === user.email);
    if (!authUser) {
      console.log(`   ⚠️ Auth user not found: ${user.email}`);
      continue;
    }

    console.log(`   ✓ Found auth user: ${authUser.id}`);

    // Ensure user profile exists - check by email OR auth_id
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id, auth_id')
      .or(`email.eq.${user.email},auth_id.eq.${authUser.id}`)
      .single();

    let profileId: string;

    if (!existingProfile) {
      // Create profile - use auth_id as the profile id for consistency
      const { data: newProfile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authUser.id,
          auth_id: authUser.id,
          email: user.email,
          full_name: user.fullName,
          org_id: orgId,
          is_active: true,
        })
        .select('id')
        .single();

      if (profileError && profileError.code !== '23505') {
        console.error(`   ❌ Failed to create profile: ${profileError.message}`);
        continue;
      }
      profileId = newProfile?.id || authUser.id;
      console.log(`   ✓ Created user profile: ${profileId}`);
    } else {
      // Update profile org_id and ensure auth_id is set
      profileId = existingProfile.id;
      await supabase
        .from('user_profiles')
        .update({
          org_id: orgId,
          full_name: user.fullName,
          auth_id: authUser.id // Ensure auth_id is linked
        })
        .eq('id', existingProfile.id);
      console.log(`   ✓ Profile exists: ${profileId}, updated org_id`);
    }

    // Get role ID
    const roleId = roleMap.get(user.roleName);
    if (!roleId) {
      console.error(`   ❌ Role not found: ${user.roleName}`);
      continue;
    }

    // Remove existing roles for this user profile id
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', profileId);

    // Assign new primary role using the PROFILE id (not auth id)
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: profileId,  // Use user_profiles.id, not auth_id
        role_id: roleId,
        is_primary: true,
        assigned_at: new Date().toISOString(),
      });

    if (roleError && roleError.code !== '23505') {
      console.error(`   ❌ Failed to assign role: ${roleError.message}`);
    } else {
      console.log(`   ✓ Assigned role: ${user.roleDisplayName}`);
    }
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main(): Promise<void> {
  console.log('🚀 Starting role and permission assignment...\n');
  console.log('='.repeat(60));
  
  try {
    // Ensure organization exists
    const orgId = await ensureOrganization();
    
    // Seed roles
    const roleMap = await seedRoles();
    
    // Seed permissions
    const permissionMap = await seedPermissions();
    
    // Assign permissions to roles
    await assignRolePermissions(roleMap, permissionMap);
    
    // Assign roles to existing users
    await assignRolesToUsers(roleMap, orgId);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Role and permission assignment complete!\n');
    
    // Print user summary
    console.log('📝 User Role Assignments:');
    console.log('─'.repeat(70));
    console.log('  Role'.padEnd(25) + '| Email'.padEnd(30) + '| Password');
    console.log('─'.repeat(70));
    for (const user of EXISTING_USERS) {
      console.log(`  ${user.roleDisplayName.padEnd(23)} | ${user.email.padEnd(28)} | ${COMMON_PASSWORD}`);
    }
    console.log('─'.repeat(70));
    
    // Print role-permission summary
    console.log('\n📊 Role Permission Summary:');
    console.log('─'.repeat(50));
    for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
      const permCount = perms.includes('*') ? 'ALL' : perms.length.toString();
      console.log(`  ${roleName.padEnd(20)} | ${permCount} permissions`);
    }
    console.log('─'.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();

