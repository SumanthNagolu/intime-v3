/**
 * Screen Factories
 *
 * Factory functions for generating metadata-driven screens from template configs.
 * These enable rapid creation of List, Detail, and Form screens with minimal code.
 *
 * @example
 * ```typescript
 * import { createListScreen, createDetailScreen, createFormScreen } from '@/lib/metadata/factories';
 * import { contactListConfig, contactDetailConfig, contactFormConfig } from './contact.config';
 *
 * // Generate screens from configs
 * export const contactListScreen = createListScreen(contactListConfig);
 * export const contactDetailScreen = createDetailScreen(contactDetailConfig);
 * export const contactFormScreen = createFormScreen(contactFormConfig);
 * ```
 */

export { createListScreen, default as listFactory } from './createListScreen';
export { createDetailScreen, default as detailFactory } from './createDetailScreen';
export {
  createFormScreen,
  createCreateFormScreen,
  createEditFormScreen,
  default as formFactory,
} from './createFormScreen';

// Re-export template types for convenience
export * from '../templates/types';

// Re-export option helpers
export {
  getOption,
  getOptionLabel,
  getOptionColor,
  toBadgeColorsMap,
  CRM_OPTIONS,
} from '../options/crm-options';
