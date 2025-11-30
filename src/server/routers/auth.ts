/**
 * tRPC Router: Auth Module
 * Provides authentication-related queries and mutations
 */

import { router, protectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import { userRoles, roles } from '@/lib/db/schema/rbac';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, isNull, or, sql } from 'drizzle-orm';

export const authRouter = router({
  /**
   * Get current user's roles
   * Returns array of role names (e.g., ['recruiter', 'employee'])
   *
   * Note: ctx.userId is auth.users.id, but user_roles.user_id references user_profiles.id
   * So we must join through user_profiles to find the correct user.
   */
  getUserRoles: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    // First, get the user_profile ID from the auth user ID
    // user_profiles.auth_id links to auth.users.id
    const [profile] = await db
      .select({ id: userProfiles.id })
      .from(userProfiles)
      .where(eq(userProfiles.authId, userId))
      .limit(1);

    if (!profile) {
      // Fallback: try to find user_roles directly (legacy compatibility)
      const directResults = await db
        .select({ roleName: roles.name })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(
          and(
            eq(userRoles.userId, userId),
            or(isNull(userRoles.expiresAt), sql`${userRoles.expiresAt} > NOW()`)
          )
        );
      return directResults.map((r) => r.roleName);
    }

    // Get all active roles for the user using profile ID
    const results = await db
      .select({
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, profile.id),
          or(isNull(userRoles.expiresAt), sql`${userRoles.expiresAt} > NOW()`)
        )
      );

    return results.map((r) => r.roleName);
  }),

  /**
   * Get current user's primary role
   */
  getPrimaryRole: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    // First, get the user_profile ID from the auth user ID
    const [profile] = await db
      .select({ id: userProfiles.id })
      .from(userProfiles)
      .where(eq(userProfiles.authId, userId))
      .limit(1);

    if (!profile) {
      // Fallback: try direct query
      const [directResult] = await db
        .select({ roleName: roles.name })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(
          and(
            eq(userRoles.userId, userId),
            eq(userRoles.isPrimary, true),
            or(isNull(userRoles.expiresAt), sql`${userRoles.expiresAt} > NOW()`)
          )
        )
        .limit(1);
      return directResult?.roleName || null;
    }

    // Get primary role for the user using profile ID
    const [result] = await db
      .select({
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, profile.id),
          eq(userRoles.isPrimary, true),
          or(isNull(userRoles.expiresAt), sql`${userRoles.expiresAt} > NOW()`)
        )
      )
      .limit(1);

    return result?.roleName || null;
  }),
});
