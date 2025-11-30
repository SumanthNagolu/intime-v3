/**
 * Metadata-Driven UI Framework
 *
 * A Guidewire-inspired framework for defining screens via TypeScript configuration.
 * This enables declarative UI definitions with automatic data binding.
 *
 * @example
 * ```typescript
 * import { ScreenDefinition, ScreenRenderer } from '@/lib/metadata';
 *
 * const jobDetailScreen: ScreenDefinition = {
 *   id: 'job-detail',
 *   type: 'detail',
 *   entityType: 'job',
 *   title: { type: 'field', path: 'title' },
 *   layout: { ... },
 * };
 *
 * export default function JobDetailPage() {
 *   return <ScreenRenderer definition={jobDetailScreen} />;
 * }
 * ```
 */

// ==========================================
// TYPE EXPORTS
// ==========================================

export type {
  // Screen types
  ScreenType,
  ScreenDefinition,
  LayoutType,
  LayoutDefinition,
  SectionType,
  SectionDefinition,
  TabDefinition,
  WizardStepDefinition,
  StepValidation,
  TableColumnDefinition,
  ActionType,
  ActionDefinition,
  ActionConfig,
  ConfirmConfig,
  NavigationDefinition,
  BreadcrumbDefinition,
  ScreenHooks,
  WizardScreenDefinition,
  WizardNavigation,
  WizardCompleteAction,
  LucideIconName,

  // Widget types
  FieldType,
  WidgetType,
  FieldDefinition,
  WidgetDefinition,
  OptionDefinition,
  OptionsSourceDefinition,
  DependencyDefinition,
  FormatDefinition,
  WidgetConfig,
  TextWidgetConfig,
  NumberWidgetConfig,
  SelectWidgetConfig,
  DateWidgetConfig,
  BadgeWidgetConfig,
  MetricWidgetConfig,
  EntityWidgetConfig,
  FileWidgetConfig,
  InputSetConfig,
  FieldGroup,

  // Data types
  DynamicValueType,
  DynamicValue,
  DataSourceType,
  DataSourceDefinition,
  QueryDefinition,
  VisibilityType,
  VisibilityRule,
  ConditionOperator,
  ConditionExpression,
  PermissionRule,
  ValidationRuleType,
  ValidationRule,
  RenderContext,
  FormState,
  EntityFieldConfig,
  MutationConfig,
  QueryBinding,
  ListQueryBinding,
  MutationBinding,
} from './types';

// ==========================================
// SCHEMA EXPORTS
// ==========================================

export {
  // Validation functions
  validateScreenDefinition,
  validateWizardScreenDefinition,
  validateInputSetConfig,
  safeParseScreenDefinition,
  safeParseWizardScreenDefinition,
  safeParseInputSetConfig,

  // Individual schemas (for custom validation)
  screenDefinitionSchema,
  wizardScreenDefinitionSchema,
  layoutDefinitionSchema,
  sectionDefinitionSchema,
  fieldDefinitionSchema,
  widgetDefinitionSchema,
  inputSetConfigSchema,
  dynamicValueSchema,
  visibilityRuleSchema,
  dataSourceSchema,
} from './schemas';

// ==========================================
// REGISTRY EXPORTS
// ==========================================

export {
  // Widget registry
  registerWidget,
  getWidget,
  hasWidget,
  getRegisteredWidgetTypes,
  getWidgetTypeForField,
  getWidgetForField,
  createDisplayWidget,
  createInputWidget,

  // Format utilities
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercentage,
  formatPhone,
  formatNumber,

  // Types
  type WidgetRenderProps,
  type WidgetComponent,
} from './registry/widget-registry';

// ==========================================
// WIDGET EXPORTS
// ==========================================

export { registerAllWidgets } from './widgets/register-widgets';

// ==========================================
// CONSTANTS
// ==========================================

/**
 * Available screen types
 */
export const SCREEN_TYPES = [
  'detail',
  'list',
  'list-detail',
  'wizard',
  'dashboard',
  'popup',
] as const;

/**
 * Available layout types
 */
export const LAYOUT_TYPES = [
  'single-column',
  'two-column',
  'sidebar-main',
  'tabs',
  'wizard-steps',
] as const;

/**
 * Available section types
 */
export const SECTION_TYPES = [
  'info-card',
  'metrics-grid',
  'field-grid',
  'table',
  'list',
  'form',
  'input-set',
  'timeline',
  'tabs',
  'collapsible',
  'custom',
] as const;

/**
 * Available field types
 */
export const FIELD_TYPES = [
  'text',
  'textarea',
  'richtext',
  'number',
  'currency',
  'percentage',
  'date',
  'datetime',
  'time',
  'duration',
  'boolean',
  'enum',
  'select',
  'multiselect',
  'radio',
  'checkbox-group',
  'tags',
  'email',
  'phone',
  'url',
  'uuid',
  'file',
  'files',
  'image',
  'address',
  'json',
  'computed',
] as const;

/**
 * Standard InputSet IDs
 */
export const INPUT_SETS = {
  ADDRESS: 'address',
  CONTACT: 'contact',
  COMPENSATION: 'compensation',
  SKILLS: 'skills',
  WORK_AUTH: 'workauth',
  INTERVIEW: 'interview',
  DOCUMENT: 'document',
} as const;

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Create a dynamic value that references an entity field
 */
export function fieldValue(path: string, defaultValue?: unknown): DynamicValue {
  return { type: 'field', path, default: defaultValue };
}

/**
 * Create a dynamic value that references a URL parameter
 */
export function paramValue(path: string, defaultValue?: unknown): DynamicValue {
  return { type: 'param', path, default: defaultValue };
}

/**
 * Create a dynamic value that references context (user, permissions, etc.)
 */
export function contextValue(path: string, defaultValue?: unknown): DynamicValue {
  return { type: 'context', path, default: defaultValue };
}

/**
 * Create a permission-based visibility rule
 */
export function permissionVisible(permission: string): VisibilityRule {
  return { type: 'permission', permission };
}

/**
 * Create a role-based visibility rule
 */
export function roleVisible(roles: string[]): VisibilityRule {
  return { type: 'role', roles };
}

/**
 * Create a condition-based visibility rule
 */
export function conditionVisible(
  field: string,
  operator: ConditionOperator,
  value?: unknown
): VisibilityRule {
  return {
    type: 'condition',
    condition: { operator, field, value },
  };
}

/**
 * Always visible
 */
export const ALWAYS_VISIBLE: VisibilityRule = { type: 'always' };

/**
 * Never visible
 */
export const NEVER_VISIBLE: VisibilityRule = { type: 'never' };

// ==========================================
// RENDERER EXPORTS
// ==========================================

export {
  // Main screen renderer
  ScreenRenderer,

  // Sub-renderers
  LayoutRenderer,
  SectionRenderer,
  WidgetRenderer,
  FieldWrapper,

  // Types
  type ScreenRendererProps,
  type LayoutRendererProps,
  type SectionRendererProps,
  type WidgetRendererProps,
  type FieldWrapperProps,
} from './renderers';

// ==========================================
// INPUT SET EXPORTS
// ==========================================

export {
  // Standard InputSets
  addressInputSet,
  usAddressInputSet,
  workLocationInputSet,
  contactInputSet,
  quickContactInputSet,
  pocInputSet,
  professionalLinksInputSet,
  compensationInputSet,
  jobRateInputSet,
  candidateRateInputSet,
  placementRateInputSet,
  jobRequirementsInputSet,
  candidateSkillsInputSet,
  educationInputSet,
  certificationInputSet,
  workAuthInputSet,
  visaDetailsInputSet,
  workEligibilityInputSet,
  interviewScheduleInputSet,
  interviewFeedbackInputSet,
  quickInterviewRatingInputSet,
  interviewRescheduleInputSet,

  // Field definitions (for custom compositions)
  addressFields,
  contactFields,
  nameFields,
  compensationFields,
  billRateFields,
  payRateFields,
  jobRequirementsFields,
  candidateSkillsFields,
  educationFields,
  certificationFields,
  workAuthFields,
  visaDetailsFields,
  interviewScheduleFields,
  interviewFeedbackFields,

  // Option constants
  RATE_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  SKILL_PROFICIENCY_OPTIONS,
  WORK_AUTH_STATUS_OPTIONS,
  INTERVIEW_TYPE_OPTIONS,
  INTERVIEW_STATUS_OPTIONS,
  INTERVIEW_OUTCOME_OPTIONS,

  // Registry functions
  INPUT_SET_REGISTRY,
  getInputSet,
  getAvailableInputSetIds,
  hasInputSet,
} from './inputsets';

// Import types for utility functions
import type {
  DynamicValue,
  VisibilityRule,
  ConditionOperator,
} from './types';
