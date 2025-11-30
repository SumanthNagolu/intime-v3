/**
 * Metadata Schema Definitions
 *
 * Central export for all Zod validation schemas used in the
 * metadata-driven UI architecture.
 */

// Data schemas
export {
  dynamicValueTypeSchema,
  dynamicValueSchema,
  dataSourceTypeSchema,
  queryDefinitionSchema,
  dataSourceSchema,
  visibilityTypeSchema,
  conditionOperatorSchema,
  conditionExpressionSchema,
  visibilityRuleSchema,
  permissionRuleSchema,
  validationRuleTypeSchema,
  validationRuleSchema,
  mutationConfigSchema,
  entityFieldConfigSchema,
  type DynamicValueInput,
  type DataSourceInput,
  type QueryDefinitionInput,
  type VisibilityRuleInput,
  type ConditionExpressionInput,
  type PermissionRuleInput,
  type ValidationRuleInput,
  type MutationConfigInput,
  type EntityFieldConfigInput,
} from './data.schema';

// Widget schemas
export {
  fieldTypeSchema,
  widgetTypeSchema,
  optionDefinitionSchema,
  optionsSourceSchema,
  dependencySchema,
  formatDefinitionSchema,
  fieldDefinitionSchema,
  widgetDefinitionSchema,
  inputSetConfigSchema,
  fieldGroupSchema,
  type FieldDefinitionInput,
  type WidgetDefinitionInput,
  type OptionDefinitionInput,
  type OptionsSourceInput,
  type InputSetConfigInput,
  type FieldGroupInput,
} from './widget.schema';

// Screen schemas
export {
  screenTypeSchema,
  layoutTypeSchema,
  sectionTypeSchema,
  actionTypeSchema,
  tableColumnSchema,
  actionConfigSchema,
  confirmConfigSchema,
  actionDefinitionSchema,
  sectionDefinitionSchema,
  tabDefinitionSchema,
  stepValidationSchema,
  wizardStepSchema,
  breadcrumbSchema,
  navigationSchema,
  screenHooksSchema,
  layoutDefinitionSchema,
  screenDefinitionSchema,
  wizardNavigationSchema,
  wizardCompleteActionSchema,
  wizardScreenDefinitionSchema,
  type ScreenDefinitionInput,
  type WizardScreenDefinitionInput,
  type LayoutDefinitionInput,
  type SectionDefinitionInput,
  type TabDefinitionInput,
  type ActionDefinitionInput,
  type WizardStepInput,
} from './screen.schema';

// ==========================================
// VALIDATION HELPERS
// ==========================================

import { screenDefinitionSchema, wizardScreenDefinitionSchema } from './screen.schema';
import { inputSetConfigSchema } from './widget.schema';
import type { ScreenDefinition, WizardScreenDefinition } from '../types';
import type { InputSetConfig } from '../types';

/**
 * Validate a screen definition at runtime
 */
export function validateScreenDefinition(
  definition: unknown
): { success: true; data: ScreenDefinition } | { success: false; error: Error } {
  try {
    const result = screenDefinitionSchema.parse(definition);
    return { success: true, data: result as unknown as ScreenDefinition };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

/**
 * Validate a wizard screen definition at runtime
 */
export function validateWizardScreenDefinition(
  definition: unknown
): { success: true; data: WizardScreenDefinition } | { success: false; error: Error } {
  try {
    const result = wizardScreenDefinitionSchema.parse(definition);
    return { success: true, data: result as unknown as WizardScreenDefinition };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

/**
 * Validate an InputSet configuration at runtime
 */
export function validateInputSetConfig(
  config: unknown
): { success: true; data: InputSetConfig } | { success: false; error: Error } {
  try {
    const result = inputSetConfigSchema.parse(config);
    return { success: true, data: result as unknown as InputSetConfig };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

/**
 * Safe parse with detailed error messages
 */
export function safeParseScreenDefinition(definition: unknown) {
  return screenDefinitionSchema.safeParse(definition);
}

export function safeParseWizardScreenDefinition(definition: unknown) {
  return wizardScreenDefinitionSchema.safeParse(definition);
}

export function safeParseInputSetConfig(config: unknown) {
  return inputSetConfigSchema.safeParse(config);
}
