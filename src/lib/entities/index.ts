/**
 * Entity Configurations Index
 *
 * Central export for all entity configurations.
 * These define the structure for database, tRPC, and frontend sync.
 */

// Types
export * from './types';

// CRM Entities
export * from './crm';

// Future exports:
// export * from './ats';       // ATS/Recruiting entities
// export * from './bench';     // Bench Sales entities
// export * from './academy';   // Academy entities
// export * from './hr';        // HR entities

// ==========================================
// ENTITY REGISTRY
// ==========================================

import { leadEntity, accountEntity } from './crm';
import type { EntityConfig } from './types';

/**
 * Registry of all entity configurations
 */
export const ENTITY_REGISTRY: Record<string, EntityConfig> = {
  lead: leadEntity,
  account: accountEntity,
  // deal: dealEntity,
  // job: jobEntity,
  // talent: talentEntity,
  // submission: submissionEntity,
};

/**
 * Get an entity configuration by name
 */
export function getEntity(name: string): EntityConfig | undefined {
  return ENTITY_REGISTRY[name];
}

/**
 * Get all registered entity names
 */
export function getEntityNames(): string[] {
  return Object.keys(ENTITY_REGISTRY);
}
