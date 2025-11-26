/**
 * AI Twins Module
 *
 * Epic: AI Twin Living Organism
 *
 * Exports all twin-related classes, functions, and types.
 *
 * @module lib/ai/twins
 */

// ============================================================================
// CORE TWIN
// ============================================================================

export { EmployeeTwin } from './EmployeeTwin';

// ============================================================================
// COMMUNICATION LAYER
// ============================================================================

// Event Bus (Async Communication)
export {
  TwinEventBus,
  createTwinEventBus,
  TwinEvents,
  type TwinEvent,
  type TwinEventType,
  type EventPriority,
  type CreateEventInput,
  type EventHandler,
  type EventQueryOptions,
} from './TwinEventBus';

// Twin Directory (Direct Query)
export {
  TwinDirectory,
  createTwinDirectory,
  type TwinQueryResult,
  type QueryOptions,
} from './TwinDirectory';

// Organization Context (Shared Knowledge)
export {
  OrganizationContext,
  getOrganizationContext,
  resetOrganizationContext,
  type OrgPriority,
  type PillarHealth,
  type OrgMetrics,
  type CrossPollinationOpportunity,
  type ContextType,
} from './OrganizationContext';

// Organization Twin (Central Orchestrator)
export {
  OrganizationTwin,
  createOrganizationTwin,
  type StandupReport,
  type PillarStandupSummary,
  type Escalation,
  type Blocker,
  type OrganismHealth,
  type RoutingResult,
} from './OrganizationTwin';

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

import type { TwinRole } from '@/types/productivity';

/**
 * All available twin roles
 */
export const TWIN_ROLES: TwinRole[] = [
  'ceo',
  'admin',
  'recruiter',
  'bench_sales',
  'talent_acquisition',
  'hr',
  'immigration',
  'trainer',
];

/**
 * Revenue-generating partner roles (end-to-end ownership)
 */
export const PARTNER_ROLES: TwinRole[] = [
  'recruiter',
  'bench_sales',
  'talent_acquisition',
];

/**
 * Support partner roles
 */
export const SUPPORT_ROLES: TwinRole[] = [
  'hr',
  'immigration',
  'trainer',
];

/**
 * Leadership roles
 */
export const LEADERSHIP_ROLES: TwinRole[] = [
  'ceo',
  'admin',
];
