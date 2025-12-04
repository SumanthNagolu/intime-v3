/**
 * Ownership Filter Schema
 *
 * Defines the ownership filter options for list queries.
 * Used across all entity routers (jobs, leads, deals, etc.)
 */

import { z } from 'zod';

/**
 * Ownership filter options for list queries.
 *
 * - `my_items`: Only items where I'm the owner (ownerId = me)
 * - `my_team`: Items owned by me or my direct reports (managers only)
 * - `consulted`: Items where I'm consulted/informed via RCAI object_owners
 * - `all_accessible`: Union of my_items + consulted + team (if manager)
 * - `all_org`: All organization items (requires manager/admin role)
 */
export const ownershipFilterSchema = z
  .enum(['my_items', 'my_team', 'consulted', 'all_accessible', 'all_org'])
  .default('my_items');

export type OwnershipFilter = z.infer<typeof ownershipFilterSchema>;

/**
 * Extended ownership filter with description for UI.
 */
export const OWNERSHIP_FILTER_OPTIONS: {
  value: OwnershipFilter;
  label: string;
  description: string;
  requiresManager?: boolean;
}[] = [
  {
    value: 'my_items',
    label: 'My Items',
    description: 'Items where you are the owner',
  },
  {
    value: 'my_team',
    label: 'My Team',
    description: 'Items owned by you or your direct reports',
    requiresManager: true,
  },
  {
    value: 'consulted',
    label: 'Consulted',
    description: 'Items where you are consulted or informed',
  },
  {
    value: 'all_accessible',
    label: 'All Accessible',
    description: 'All items you can view (owned, team, or consulted)',
  },
  {
    value: 'all_org',
    label: 'All Organization',
    description: 'All items in the organization',
    requiresManager: true,
  },
];

/**
 * Get available ownership filters for a user based on their access level.
 *
 * @param isManager - Whether the user has manager-level access
 * @returns Array of available filter options
 */
export function getAvailableOwnershipFilters(isManager: boolean): typeof OWNERSHIP_FILTER_OPTIONS {
  if (isManager) {
    return OWNERSHIP_FILTER_OPTIONS;
  }

  return OWNERSHIP_FILTER_OPTIONS.filter((opt) => !opt.requiresManager);
}
