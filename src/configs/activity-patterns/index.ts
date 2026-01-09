/**
 * Activity Patterns Configuration
 * 
 * Export all activity pattern definitions for seeding and reference.
 * 
 * Total: 80+ patterns across 12 entity types and 6 categories
 * 
 * Entity Types:
 * - candidate (23 patterns)
 * - job (17 patterns)
 * - submission (13 patterns)
 * - interview (12 patterns)
 * - placement (17 patterns)
 * - account (17 patterns)
 * - contact (9 patterns)
 * - lead (6 patterns)
 * - deal (7 patterns)
 * - consultant (13 patterns)
 * - vendor (10 patterns)
 * - general (6 patterns)
 * 
 * Categories:
 * - communication: Calls, emails, texts, outreach
 * - calendar: Meetings, interviews, appointments
 * - workflow: Pipeline stages, process tasks
 * - documentation: Document review, compliance
 * - research: Sourcing, market analysis
 * - administrative: Data entry, system tasks
 */

// Re-export types and patterns from main seed files
export type {
  Category,
  EntityType,
  Priority,
  OutcomeColor,
  NextAction,
  Outcome,
  ActivityPatternSeed,
} from '../activity-patterns-seed'

export {
  CANDIDATE_PATTERNS,
  JOB_PATTERNS,
  SUBMISSION_PATTERNS,
  INTERVIEW_PATTERNS,
  PLACEMENT_PATTERNS,
} from '../activity-patterns-seed'

export {
  ACCOUNT_PATTERNS,
  CONTACT_PATTERNS,
  LEAD_PATTERNS,
  DEAL_PATTERNS,
  CONSULTANT_PATTERNS,
  VENDOR_PATTERNS,
  GENERAL_PATTERNS,
} from '../activity-patterns-seed-part2'

// Combined export of all patterns
import {
  CANDIDATE_PATTERNS,
  JOB_PATTERNS,
  SUBMISSION_PATTERNS,
  INTERVIEW_PATTERNS,
  PLACEMENT_PATTERNS,
} from '../activity-patterns-seed'

import {
  ACCOUNT_PATTERNS,
  CONTACT_PATTERNS,
  LEAD_PATTERNS,
  DEAL_PATTERNS,
  CONSULTANT_PATTERNS,
  VENDOR_PATTERNS,
  GENERAL_PATTERNS,
} from '../activity-patterns-seed-part2'

import type { ActivityPatternSeed } from '../activity-patterns-seed'

/**
 * All activity patterns combined in a single array
 */
export const ALL_ACTIVITY_PATTERNS: ActivityPatternSeed[] = [
  ...CANDIDATE_PATTERNS,
  ...JOB_PATTERNS,
  ...SUBMISSION_PATTERNS,
  ...INTERVIEW_PATTERNS,
  ...PLACEMENT_PATTERNS,
  ...ACCOUNT_PATTERNS,
  ...CONTACT_PATTERNS,
  ...LEAD_PATTERNS,
  ...DEAL_PATTERNS,
  ...CONSULTANT_PATTERNS,
  ...VENDOR_PATTERNS,
  ...GENERAL_PATTERNS,
]

/**
 * Patterns grouped by entity type
 */
export const PATTERNS_BY_ENTITY: Record<string, ActivityPatternSeed[]> = {
  candidate: CANDIDATE_PATTERNS,
  job: JOB_PATTERNS,
  submission: SUBMISSION_PATTERNS,
  interview: INTERVIEW_PATTERNS,
  placement: PLACEMENT_PATTERNS,
  account: ACCOUNT_PATTERNS,
  contact: CONTACT_PATTERNS,
  lead: LEAD_PATTERNS,
  deal: DEAL_PATTERNS,
  consultant: CONSULTANT_PATTERNS,
  vendor: VENDOR_PATTERNS,
  general: GENERAL_PATTERNS,
}

/**
 * Patterns grouped by category
 */
export const PATTERNS_BY_CATEGORY: Record<string, ActivityPatternSeed[]> = {
  communication: ALL_ACTIVITY_PATTERNS.filter(p => p.category === 'communication'),
  calendar: ALL_ACTIVITY_PATTERNS.filter(p => p.category === 'calendar'),
  workflow: ALL_ACTIVITY_PATTERNS.filter(p => p.category === 'workflow'),
  documentation: ALL_ACTIVITY_PATTERNS.filter(p => p.category === 'documentation'),
  research: ALL_ACTIVITY_PATTERNS.filter(p => p.category === 'research'),
  administrative: ALL_ACTIVITY_PATTERNS.filter(p => p.category === 'administrative'),
}

/**
 * Get pattern by code
 */
export function getPatternByCode(code: string): ActivityPatternSeed | undefined {
  return ALL_ACTIVITY_PATTERNS.find(p => p.code === code)
}

/**
 * Get patterns for an entity type
 */
export function getPatternsForEntity(entityType: string): ActivityPatternSeed[] {
  return PATTERNS_BY_ENTITY[entityType] || []
}

/**
 * Get patterns for a category
 */
export function getPatternsForCategory(category: string): ActivityPatternSeed[] {
  return PATTERNS_BY_CATEGORY[category] || []
}

/**
 * Pattern statistics
 */
export const PATTERN_STATS = {
  total: ALL_ACTIVITY_PATTERNS.length,
  byEntity: Object.fromEntries(
    Object.entries(PATTERNS_BY_ENTITY).map(([k, v]) => [k, v.length])
  ),
  byCategory: Object.fromEntries(
    Object.entries(PATTERNS_BY_CATEGORY).map(([k, v]) => [k, v.length])
  ),
}







