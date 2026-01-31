/**
 * Entity Schemas Index
 *
 * Import this file to register all entity schemas.
 * Schemas are registered on import via side effects.
 */

// Import all schemas to register them
import './job'
import './candidate'
import './account'
import './contact'
import './lead'
import './deal'

// Re-export schema types and utilities
export * from '../schema'

// Export individual schemas for direct access if needed
export { jobSchema } from './job'
export { candidateSchema } from './candidate'
export { accountSchema } from './account'
export { contactSchema } from './contact'
export { leadSchema } from './lead'
export { dealSchema } from './deal'
