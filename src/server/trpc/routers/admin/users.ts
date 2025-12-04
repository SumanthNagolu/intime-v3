/**
 * Admin Users Router
 *
 * tRPC router for admin user management:
 * - List users with filters, search, pagination
 * - Get user stats (counts by status)
 * - Get user details by ID
 * - Update user profile
 * - Deactivate/reactivate users
 * - Bulk actions (activate, deactivate, reset password)
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router } from '../../init';
import { adminProcedure, orgProtectedProcedure } from '../../middleware';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { pods } from '@/lib/db/schema/ta-hr';
import { eq, and, or, sql, desc, asc, ilike, inArray, isNull } from 'drizzle-orm';

// ==========================================
// SCHEMAS
// ==========================================

const userStatusSchema = z.enum(['active', 'pending', 'inactive', 'suspended']);

const employeeRoleSchema = z.enum([
  'admin',
  'recruiting_manager',
  'recruiter',
  'bench_sales_manager',
  'bench_sales',
  'hr_manager',
  'ta',
  'cfo',
  'coo',
  'ceo',
]);

const departmentSchema = z.enum([
  'recruiting',
  'bench_sales',
  'hr',
  'finance',
  'operations',
  'executive',
]);

const listUsersInput = z.object({
  // Pagination
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(25),

  // Sorting
  sortBy: z
    .enum(['fullName', 'email', 'role', 'department', 'status', 'lastLoginAt', 'createdAt'])
    .default('fullName'),
  sortDirection: z.enum(['asc', 'desc']).default('asc'),

  // Search
  search: z.string().optional(),

  // Filters
  filters: z
    .object({
      role: z.array(employeeRoleSchema).optional(),
      department: z.array(departmentSchema).optional(),
      status: userStatusSchema.optional(),
      podId: z.string().uuid().optional(),
    })
    .optional(),
});

const updateUserInput = z.object({
  id: z.string().uuid(),
  data: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    employeeDepartment: departmentSchema.optional(),
    employeeRole: employeeRoleSchema.optional(),
    employeePosition: z.string().optional(),
    employeeManagerId: z.string().uuid().nullable().optional(),
    recruiterPodId: z.string().uuid().nullable().optional(),
    timezone: z.string().optional(),
    avatarUrl: z.string().url().nullable().optional(),
  }),
});

const bulkActionInput = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(100),
});

// ==========================================
// HELPERS
// ==========================================

/**
 * Derive user status from isActive and employeeStatus fields
 */
function deriveUserStatus(
  isActive: boolean | null,
  employeeStatus: string | null
): 'active' | 'pending' | 'inactive' | 'suspended' {
  if (isActive === false) return 'inactive';
  if (employeeStatus === 'suspended') return 'suspended';
  if (employeeStatus === 'active') return 'active';
  if (!employeeStatus) return 'pending';
  return 'inactive';
}

// ==========================================
// ROUTER
// ==========================================

export const adminUsersRouter = router({
  /**
   * List users with filters, search, and pagination
   */
  list: orgProtectedProcedure.input(listUsersInput).query(async ({ ctx, input }) => {
    const { orgId } = ctx;
    const { page, pageSize, sortBy, sortDirection, search, filters } = input;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [eq(userProfiles.orgId, orgId), isNull(userProfiles.deletedAt)];

    // Search filter
    if (search && search.trim()) {
      conditions.push(
        or(ilike(userProfiles.fullName, `%${search}%`), ilike(userProfiles.email, `%${search}%`))!
      );
    }

    // Role filter
    if (filters?.role && filters.role.length > 0) {
      conditions.push(inArray(userProfiles.employeeRole, filters.role));
    }

    // Department filter
    if (filters?.department && filters.department.length > 0) {
      conditions.push(inArray(userProfiles.employeeDepartment, filters.department));
    }

    // Status filter
    if (filters?.status) {
      if (filters.status === 'active') {
        conditions.push(eq(userProfiles.isActive, true));
        conditions.push(eq(userProfiles.employeeStatus, 'active'));
      } else if (filters.status === 'inactive') {
        conditions.push(eq(userProfiles.isActive, false));
      } else if (filters.status === 'pending') {
        conditions.push(isNull(userProfiles.employeeStatus));
        conditions.push(eq(userProfiles.isActive, true));
      } else if (filters.status === 'suspended') {
        conditions.push(eq(userProfiles.employeeStatus, 'suspended'));
      }
    }

    // Pod filter
    if (filters?.podId) {
      conditions.push(eq(userProfiles.recruiterPodId, filters.podId));
    }

    // Build sort - using switch for proper typing
    let orderBy;
    switch (sortBy) {
      case 'email':
        orderBy = sortDirection === 'asc' ? asc(userProfiles.email) : desc(userProfiles.email);
        break;
      case 'role':
        orderBy = sortDirection === 'asc' ? asc(userProfiles.employeeRole) : desc(userProfiles.employeeRole);
        break;
      case 'department':
        orderBy = sortDirection === 'asc' ? asc(userProfiles.employeeDepartment) : desc(userProfiles.employeeDepartment);
        break;
      case 'status':
        orderBy = sortDirection === 'asc' ? asc(userProfiles.employeeStatus) : desc(userProfiles.employeeStatus);
        break;
      case 'lastLoginAt':
        orderBy = sortDirection === 'asc' ? asc(userProfiles.lastActivityDate) : desc(userProfiles.lastActivityDate);
        break;
      case 'createdAt':
        orderBy = sortDirection === 'asc' ? asc(userProfiles.createdAt) : desc(userProfiles.createdAt);
        break;
      case 'fullName':
      default:
        orderBy = sortDirection === 'asc' ? asc(userProfiles.fullName) : desc(userProfiles.fullName);
        break;
    }

    // Execute queries in parallel
    const [items, countResult] = await Promise.all([
      db
        .select({
          id: userProfiles.id,
          authId: userProfiles.authId,
          email: userProfiles.email,
          firstName: userProfiles.firstName,
          lastName: userProfiles.lastName,
          fullName: userProfiles.fullName,
          avatarUrl: userProfiles.avatarUrl,
          role: userProfiles.employeeRole,
          department: userProfiles.employeeDepartment,
          employeeStatus: userProfiles.employeeStatus,
          isActive: userProfiles.isActive,
          lastLoginAt: userProfiles.lastActivityDate,
          createdAt: userProfiles.createdAt,
          recruiterPodId: userProfiles.recruiterPodId,
        })
        .from(userProfiles)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(pageSize)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(userProfiles)
        .where(and(...conditions)),
    ]);

    // Fetch pod info for users that have pods
    const podIds = [...new Set(items.filter((i) => i.recruiterPodId).map((i) => i.recruiterPodId!))];
    const podsMap = new Map<string, { id: string; name: string }>();

    if (podIds.length > 0) {
      const podResults = await db
        .select({ id: pods.id, name: pods.name })
        .from(pods)
        .where(inArray(pods.id, podIds));
      podResults.forEach((p) => podsMap.set(p.id, p));
    }

    // Map status for frontend
    const enrichedItems = items.map((item) => ({
      ...item,
      status: deriveUserStatus(item.isActive, item.employeeStatus),
      pod: item.recruiterPodId ? podsMap.get(item.recruiterPodId) ?? null : null,
    }));

    return {
      items: enrichedItems,
      total: countResult[0]?.count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((countResult[0]?.count ?? 0) / pageSize),
    };
  }),

  /**
   * Get user statistics (counts by status)
   */
  stats: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const allUsers = await db
      .select({
        isActive: userProfiles.isActive,
        employeeStatus: userProfiles.employeeStatus,
      })
      .from(userProfiles)
      .where(and(eq(userProfiles.orgId, orgId), isNull(userProfiles.deletedAt)));

    const total = allUsers.length;
    const active = allUsers.filter((u) => u.isActive && u.employeeStatus === 'active').length;
    const pending = allUsers.filter((u) => u.isActive && !u.employeeStatus).length;
    const inactive = allUsers.filter((u) => !u.isActive).length;

    return {
      total,
      active,
      pending,
      inactive,
    };
  }),

  /**
   * Get single user by ID with all relations
   */
  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      // Get user
      const [user] = await db
        .select({
          id: userProfiles.id,
          authId: userProfiles.authId,
          email: userProfiles.email,
          firstName: userProfiles.firstName,
          lastName: userProfiles.lastName,
          fullName: userProfiles.fullName,
          avatarUrl: userProfiles.avatarUrl,
          phone: userProfiles.phone,
          phoneWork: userProfiles.phoneWork,
          timezone: userProfiles.timezone,
          employeeRole: userProfiles.employeeRole,
          employeeDepartment: userProfiles.employeeDepartment,
          employeePosition: userProfiles.employeePosition,
          employeeStatus: userProfiles.employeeStatus,
          employeeHireDate: userProfiles.employeeHireDate,
          employeeManagerId: userProfiles.employeeManagerId,
          recruiterPodId: userProfiles.recruiterPodId,
          isActive: userProfiles.isActive,
          lastActivityDate: userProfiles.lastActivityDate,
          createdAt: userProfiles.createdAt,
          updatedAt: userProfiles.updatedAt,
        })
        .from(userProfiles)
        .where(
          and(
            eq(userProfiles.id, input.id),
            eq(userProfiles.orgId, orgId!),
            isNull(userProfiles.deletedAt)
          )
        )
        .limit(1);

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      // Fetch related data in parallel
      const [managerData, podData] = await Promise.all([
        // Manager
        user.employeeManagerId
          ? db
              .select({ id: userProfiles.id, fullName: userProfiles.fullName })
              .from(userProfiles)
              .where(eq(userProfiles.id, user.employeeManagerId))
              .limit(1)
          : Promise.resolve([]),

        // Pod
        user.recruiterPodId
          ? db
              .select({ id: pods.id, name: pods.name, podType: pods.podType })
              .from(pods)
              .where(eq(pods.id, user.recruiterPodId))
              .limit(1)
          : Promise.resolve([]),
      ]);

      return {
        ...user,
        status: deriveUserStatus(user.isActive, user.employeeStatus),
        role: user.employeeRole,
        department: user.employeeDepartment,
        jobTitle: user.employeePosition,
        workPhone: user.phoneWork,
        startDate: user.employeeHireDate,
        lastLoginAt: user.lastActivityDate,
        manager: managerData[0] || null,
        pod: podData[0] || null,
        // Placeholder security fields
        twoFactorEnabled: false,
        twoFactorMethod: null,
        passwordLastChangedAt: null,
        mustChangePassword: false,
        // Counts for badges
        activityCount: 0,
        activeSessionsCount: 0,
      };
    }),

  /**
   * Update user profile
   */
  update: adminProcedure.input(updateUserInput).mutation(async ({ ctx, input }) => {
    const { orgId, userId } = ctx;
    const { id, data } = input;

    // Get current user profile
    const [currentUser] = await db
      .select()
      .from(userProfiles)
      .where(and(eq(userProfiles.id, id), eq(userProfiles.orgId, orgId!)))
      .limit(1);

    if (!currentUser) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    // Build update object
    const updateData: Partial<typeof userProfiles.$inferInsert> = {
      updatedAt: new Date(),
      updatedBy: userId,
    };

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.employeeDepartment !== undefined)
      updateData.employeeDepartment = data.employeeDepartment;
    if (data.employeeRole !== undefined) updateData.employeeRole = data.employeeRole;
    if (data.employeePosition !== undefined) updateData.employeePosition = data.employeePosition;
    if (data.employeeManagerId !== undefined)
      updateData.employeeManagerId = data.employeeManagerId;
    if (data.recruiterPodId !== undefined) updateData.recruiterPodId = data.recruiterPodId;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

    // Update fullName if first/last changed
    if (data.firstName !== undefined || data.lastName !== undefined) {
      const newFirstName = data.firstName ?? currentUser.firstName ?? '';
      const newLastName = data.lastName ?? currentUser.lastName ?? '';
      updateData.fullName = `${newFirstName} ${newLastName}`.trim() || null;
    }

    const [updated] = await db
      .update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.id, id))
      .returning();

    return updated;
  }),

  /**
   * Deactivate single user
   */
  deactivate: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId } = ctx;

      // Prevent self-deactivation
      if (input.id === userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot deactivate your own account',
        });
      }

      const [updated] = await db
        .update(userProfiles)
        .set({
          isActive: false,
          employeeStatus: 'inactive',
          updatedAt: new Date(),
          updatedBy: userId,
        })
        .where(and(eq(userProfiles.id, input.id), eq(userProfiles.orgId, orgId!)))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      return { success: true, user: updated };
    }),

  /**
   * Reactivate user
   */
  reactivate: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId } = ctx;

      const [updated] = await db
        .update(userProfiles)
        .set({
          isActive: true,
          employeeStatus: 'active',
          updatedAt: new Date(),
          updatedBy: userId,
        })
        .where(and(eq(userProfiles.id, input.id), eq(userProfiles.orgId, orgId!)))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      return { success: true, user: updated };
    }),

  /**
   * Bulk activate users
   */
  bulkActivate: adminProcedure.input(bulkActionInput).mutation(async ({ ctx, input }) => {
    const { orgId, userId } = ctx;

    const updated = await db
      .update(userProfiles)
      .set({
        isActive: true,
        employeeStatus: 'active',
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(and(inArray(userProfiles.id, input.userIds), eq(userProfiles.orgId, orgId!)))
      .returning({ id: userProfiles.id });

    return { count: updated.length, userIds: updated.map((u) => u.id) };
  }),

  /**
   * Bulk deactivate users
   */
  bulkDeactivate: adminProcedure.input(bulkActionInput).mutation(async ({ ctx, input }) => {
    const { orgId, userId } = ctx;

    // Filter out current user from deactivation
    const userIdsToDeactivate = input.userIds.filter((id) => id !== userId);

    if (userIdsToDeactivate.length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No users to deactivate (cannot deactivate yourself)',
      });
    }

    const updated = await db
      .update(userProfiles)
      .set({
        isActive: false,
        employeeStatus: 'inactive',
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(and(inArray(userProfiles.id, userIdsToDeactivate), eq(userProfiles.orgId, orgId!)))
      .returning({ id: userProfiles.id });

    return { count: updated.length, userIds: updated.map((u) => u.id) };
  }),

  /**
   * Bulk reset password (sends reset emails)
   */
  bulkResetPassword: adminProcedure.input(bulkActionInput).mutation(async ({ ctx, input }) => {
    const { orgId } = ctx;

    // Get users to reset
    const users = await db
      .select({ id: userProfiles.id, authId: userProfiles.authId, email: userProfiles.email })
      .from(userProfiles)
      .where(and(inArray(userProfiles.id, input.userIds), eq(userProfiles.orgId, orgId!)));

    // Send password reset emails via Supabase Auth
    const results = await Promise.allSettled(
      users
        .filter((u) => u.email)
        .map(async (user) => {
          const { error } = await ctx.supabase.auth.resetPasswordForEmail(user.email);
          if (error) throw error;
          return user.id;
        })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { successful, failed, total: users.length };
  }),

  /**
   * Get user login history (placeholder)
   */
  getLoginHistory: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async () => {
      // Placeholder - would query from audit_logs table
      return [];
    }),

  /**
   * Get user action log (placeholder)
   */
  getActionLog: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async () => {
      // Placeholder - would query from audit_logs table
      return [];
    }),

  /**
   * Get user sessions (placeholder)
   */
  getSessions: adminProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async () => {
      // Placeholder - would query from sessions table or Supabase
      return [];
    }),

  /**
   * Get permission overrides (placeholder)
   */
  getPermissionOverrides: adminProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async () => {
      // Placeholder - would query from user_permission_overrides table
      return [];
    }),

  /**
   * Revoke single session (placeholder)
   */
  revokeSession: adminProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async () => {
      // Placeholder - would use Supabase admin API
      return { success: true };
    }),

  /**
   * Revoke all sessions for user (placeholder)
   */
  revokeAllSessions: adminProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async () => {
      // Placeholder - would use Supabase admin API
      return { success: true };
    }),
});
