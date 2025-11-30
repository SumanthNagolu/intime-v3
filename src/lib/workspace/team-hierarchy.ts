/**
 * Team Hierarchy Utilities
 *
 * Helpers for manager-employee relationships using employeeManagerId field.
 * Used for "My Team" filtering in ownership queries.
 */

import { eq, and, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/schema/user-profiles';

/**
 * Get direct reports for a manager.
 *
 * @param managerId - The manager's user profile ID
 * @param orgId - The organization ID
 * @returns Array of profile IDs for direct reports
 */
export async function getDirectReports(managerId: string, orgId: string): Promise<string[]> {
  const reports = await db
    .select({ id: userProfiles.id })
    .from(userProfiles)
    .where(
      and(
        eq(userProfiles.employeeManagerId, managerId),
        eq(userProfiles.orgId, orgId),
        isNull(userProfiles.deletedAt)
      )
    );

  return reports.map((r) => r.id);
}

/**
 * Check if a user has any direct reports (is a manager).
 *
 * @param userId - The user's profile ID
 * @param orgId - The organization ID
 * @returns True if user has at least one direct report
 */
export async function isManagerRole(userId: string, orgId: string): Promise<boolean> {
  const reports = await getDirectReports(userId, orgId);
  return reports.length > 0;
}

/**
 * Get the entire team hierarchy recursively (all levels down).
 * Uses recursive CTE for PostgreSQL.
 *
 * @param managerId - The top-level manager's profile ID
 * @param orgId - The organization ID
 * @param maxDepth - Maximum depth to traverse (default: 5)
 * @returns Array of all profile IDs in the team hierarchy
 */
export async function getTeamRecursive(
  managerId: string,
  orgId: string,
  maxDepth: number = 5
): Promise<string[]> {
  // Use raw SQL for recursive CTE
  const result = await db.execute(sql`
    WITH RECURSIVE team_hierarchy AS (
      -- Base case: direct reports
      SELECT id, 1 as depth
      FROM user_profiles
      WHERE employee_manager_id = ${managerId}
        AND org_id = ${orgId}
        AND deleted_at IS NULL

      UNION ALL

      -- Recursive case: reports of reports
      SELECT up.id, th.depth + 1
      FROM user_profiles up
      INNER JOIN team_hierarchy th ON up.employee_manager_id = th.id
      WHERE up.org_id = ${orgId}
        AND up.deleted_at IS NULL
        AND th.depth < ${maxDepth}
    )
    SELECT DISTINCT id FROM team_hierarchy
  `);

  return (result.rows as Array<{ id: string }>).map((r) => r.id);
}

/**
 * Check if userA is a manager of userB (at any level in hierarchy).
 *
 * @param managerId - Potential manager's profile ID
 * @param employeeId - Potential employee's profile ID
 * @param orgId - Organization ID
 * @returns True if managerId manages employeeId
 */
export async function isManagerOf(
  managerId: string,
  employeeId: string,
  orgId: string
): Promise<boolean> {
  const teamIds = await getTeamRecursive(managerId, orgId);
  return teamIds.includes(employeeId);
}

/**
 * Get the manager chain for a user (up the hierarchy).
 *
 * @param userId - The user's profile ID
 * @param orgId - Organization ID
 * @returns Array of manager profile IDs from immediate manager to top
 */
export async function getManagerChain(userId: string, orgId: string): Promise<string[]> {
  const result = await db.execute(sql`
    WITH RECURSIVE manager_chain AS (
      -- Base case: user's direct manager
      SELECT employee_manager_id as id, 1 as depth
      FROM user_profiles
      WHERE id = ${userId}
        AND org_id = ${orgId}
        AND deleted_at IS NULL
        AND employee_manager_id IS NOT NULL

      UNION ALL

      -- Recursive case: manager's manager
      SELECT up.employee_manager_id, mc.depth + 1
      FROM user_profiles up
      INNER JOIN manager_chain mc ON up.id = mc.id
      WHERE up.org_id = ${orgId}
        AND up.deleted_at IS NULL
        AND up.employee_manager_id IS NOT NULL
        AND mc.depth < 10
    )
    SELECT id FROM manager_chain WHERE id IS NOT NULL
  `);

  return (result.rows as Array<{ id: string }>).map((r) => r.id);
}
