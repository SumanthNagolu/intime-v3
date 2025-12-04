/**
 * Metadata Type Definitions
 *
 * Central export for all metadata-related types used in the
 * Guidewire-inspired UI architecture.
 */

// Screen types
export type {
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
} from './screen.types';

// Widget types
export type {
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
} from './widget.types';

// Data types
export type {
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
} from './data.types';
