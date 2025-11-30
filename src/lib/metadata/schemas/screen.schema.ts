/**
 * Screen Schema Definitions
 *
 * Zod schemas for runtime validation of screen definitions.
 * These ensure type safety when loading screen configurations.
 */

import { z } from 'zod';
import {
  dynamicValueSchema,
  visibilityRuleSchema,
  permissionRuleSchema,
  dataSourceSchema,
} from './data.schema';
import { fieldDefinitionSchema, widgetDefinitionSchema } from './widget.schema';

// ==========================================
// SCREEN TYPE SCHEMA
// ==========================================

export const screenTypeSchema = z.enum([
  'detail',
  'list',
  'list-detail',
  'wizard',
  'dashboard',
  'popup',
]);

// ==========================================
// LAYOUT TYPE SCHEMA
// ==========================================

export const layoutTypeSchema = z.enum([
  'single-column',
  'two-column',
  'sidebar-main',
  'tabs',
  'wizard-steps',
]);

// ==========================================
// SECTION TYPE SCHEMA
// ==========================================

export const sectionTypeSchema = z.enum([
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
]);

// ==========================================
// ACTION TYPE SCHEMA
// ==========================================

export const actionTypeSchema = z.enum([
  'navigate',
  'modal',
  'mutation',
  'download',
  'custom',
]);

// ==========================================
// TABLE COLUMN SCHEMA
// ==========================================

export const tableColumnSchema = z.object({
  id: z.string(),
  header: z.string(),
  accessor: z.string(),
  type: z.string().optional(),
  config: z.record(z.unknown()).optional(),
  sortable: z.boolean().optional(),
  filterable: z.boolean().optional(),
  width: z.union([z.string(), z.number()]).optional(),
  visible: visibilityRuleSchema.optional(),
});

// ==========================================
// ACTION CONFIG SCHEMA
// ==========================================

export const actionConfigSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('navigate'),
    route: z.union([z.string(), dynamicValueSchema]),
    params: z.record(dynamicValueSchema).optional(),
  }),
  z.object({
    type: z.literal('modal'),
    modal: z.string(),
    props: z.record(dynamicValueSchema).optional(),
  }),
  z.object({
    type: z.literal('mutation'),
    procedure: z.string(),
    input: z.record(dynamicValueSchema).optional(),
  }),
  z.object({
    type: z.literal('download'),
    url: z.union([z.string(), dynamicValueSchema]),
    filename: z.string().optional(),
  }),
  z.object({
    type: z.literal('custom'),
    handler: z.string(),
  }),
]);

// ==========================================
// CONFIRM CONFIG SCHEMA
// ==========================================

export const confirmConfigSchema = z.object({
  title: z.string(),
  message: z.string(),
  confirmLabel: z.string().optional(),
  cancelLabel: z.string().optional(),
  destructive: z.boolean().optional(),
});

// ==========================================
// ACTION DEFINITION SCHEMA
// ==========================================

export const actionDefinitionSchema = z.object({
  id: z.string(),
  type: actionTypeSchema,
  label: z.string(),
  icon: z.string().optional(),
  variant: z
    .enum(['default', 'primary', 'secondary', 'outline', 'ghost', 'destructive'])
    .optional(),
  config: actionConfigSchema.optional(),
  visible: visibilityRuleSchema.optional(),
  permissions: z.array(permissionRuleSchema).optional(),
  confirm: confirmConfigSchema.optional(),
});

// ==========================================
// SECTION DEFINITION SCHEMA
// ==========================================

export const sectionDefinitionSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: sectionTypeSchema,
    title: z.union([z.string(), dynamicValueSchema]).optional(),
    description: z.string().optional(),
    icon: z.string().optional(),

    // Layout
    columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
    span: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),

    // Content
    widgets: z.array(widgetDefinitionSchema).optional(),
    fields: z.array(fieldDefinitionSchema).optional(),
    inputSet: z.string().optional(),
    inputSetPrefix: z.string().optional(),

    // Table config
    columns_config: z.array(tableColumnSchema).optional(),
    dataSource: dataSourceSchema.optional(),

    // Custom component
    component: z.string().optional(),
    componentProps: z.record(z.unknown()).optional(),

    // Behavior
    visible: visibilityRuleSchema.optional(),
    editable: z.boolean().optional(),
    collapsible: z.boolean().optional(),
    defaultExpanded: z.boolean().optional(),

    // Permissions & Actions
    permissions: z.array(permissionRuleSchema).optional(),
    actions: z.array(actionDefinitionSchema).optional(),
  })
);

// ==========================================
// TAB DEFINITION SCHEMA
// ==========================================

export const tabDefinitionSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  badge: z.union([z.string(), z.number(), dynamicValueSchema]).optional(),
  sections: z.array(sectionDefinitionSchema),
  visible: visibilityRuleSchema.optional(),
  permissions: z.array(permissionRuleSchema).optional(),
  lazy: z.boolean().optional(),
});

// ==========================================
// WIZARD STEP VALIDATION SCHEMA
// ==========================================

export const stepValidationSchema = z.object({
  required: z.array(z.string()).optional(),
  custom: z.string().optional(),
});

// ==========================================
// WIZARD STEP SCHEMA
// ==========================================

export const wizardStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  sections: z.array(sectionDefinitionSchema),
  validation: stepValidationSchema.optional(),
  skippable: z.boolean().optional(),
  visible: visibilityRuleSchema.optional(),
  onEnter: z.string().optional(),
  onLeave: z.string().optional(),
});

// ==========================================
// BREADCRUMB SCHEMA
// ==========================================

export const breadcrumbSchema = z.object({
  label: z.union([z.string(), dynamicValueSchema]),
  route: z.union([z.string(), dynamicValueSchema]).optional(),
  active: z.boolean().optional(),
});

// ==========================================
// NAVIGATION SCHEMA
// ==========================================

export const navigationSchema = z.object({
  back: z
    .object({
      label: z.string().optional(),
      route: z.union([z.string(), dynamicValueSchema]).optional(),
    })
    .optional(),
  breadcrumbs: z.array(breadcrumbSchema).optional(),
});

// ==========================================
// SCREEN HOOKS SCHEMA
// ==========================================

export const screenHooksSchema = z.object({
  onBeforeRender: z.string().optional(),
  onDataLoad: z.string().optional(),
  onBeforeSave: z.string().optional(),
  onAfterSave: z.string().optional(),
  onError: z.string().optional(),
});

// ==========================================
// LAYOUT DEFINITION SCHEMA
// ==========================================

export const layoutDefinitionSchema = z.object({
  type: layoutTypeSchema,

  // Sidebar config
  sidebar: sectionDefinitionSchema.optional(),
  sidebarWidth: z.enum(['sm', 'md', 'lg']).optional(),
  sidebarPosition: z.enum(['left', 'right']).optional(),

  // Tabs config
  tabs: z.array(tabDefinitionSchema).optional(),
  defaultTab: z.string().optional(),
  tabPosition: z.enum(['top', 'left']).optional(),

  // Wizard config
  steps: z.array(wizardStepSchema).optional(),

  // Main content
  sections: z.array(sectionDefinitionSchema).optional(),

  // Header/Footer
  header: sectionDefinitionSchema.optional(),
  footer: sectionDefinitionSchema.optional(),
});

// ==========================================
// SCREEN DEFINITION SCHEMA
// ==========================================

export const screenDefinitionSchema = z.object({
  id: z.string(),
  type: screenTypeSchema,
  entityType: z.string().optional(),

  // Display
  title: z.union([z.string(), dynamicValueSchema]),
  subtitle: z.union([z.string(), dynamicValueSchema]).optional(),
  icon: z.string().optional(),

  // Layout
  layout: layoutDefinitionSchema,

  // Data
  dataSource: dataSourceSchema.optional(),

  // Actions & Navigation
  actions: z.array(actionDefinitionSchema).optional(),
  navigation: navigationSchema.optional(),

  // Permissions
  permissions: z.array(permissionRuleSchema).optional(),

  // Lifecycle
  hooks: screenHooksSchema.optional(),
});

// ==========================================
// WIZARD NAVIGATION SCHEMA
// ==========================================

export const wizardNavigationSchema = z.object({
  allowSkip: z.boolean().optional(),
  showProgress: z.boolean().optional(),
  showStepNumbers: z.boolean().optional(),
  saveDraft: z.boolean().optional(),
  allowResume: z.boolean().optional(),
});

// ==========================================
// WIZARD COMPLETE ACTION SCHEMA
// ==========================================

export const wizardCompleteActionSchema = z.object({
  action: z.enum(['create', 'update', 'custom']),
  entityType: z.string().optional(),
  successRedirect: z.string().optional(),
  successMessage: z.string().optional(),
  handler: z.string().optional(),
});

// ==========================================
// WIZARD SCREEN DEFINITION SCHEMA
// ==========================================

export const wizardScreenDefinitionSchema = z.object({
  id: z.string(),
  type: z.literal('wizard'),
  entityType: z.string().optional(),

  // Display
  title: z.union([z.string(), dynamicValueSchema]),
  subtitle: z.union([z.string(), dynamicValueSchema]).optional(),
  icon: z.string().optional(),

  // Wizard specific
  steps: z.array(wizardStepSchema),
  navigation: wizardNavigationSchema,
  onComplete: wizardCompleteActionSchema,

  // Data
  dataSource: dataSourceSchema.optional(),

  // Actions
  actions: z.array(actionDefinitionSchema).optional(),

  // Permissions
  permissions: z.array(permissionRuleSchema).optional(),

  // Lifecycle
  hooks: screenHooksSchema.optional(),
});

// ==========================================
// TYPE EXPORTS
// ==========================================

export type ScreenDefinitionInput = z.infer<typeof screenDefinitionSchema>;
export type WizardScreenDefinitionInput = z.infer<typeof wizardScreenDefinitionSchema>;
export type LayoutDefinitionInput = z.infer<typeof layoutDefinitionSchema>;
export type SectionDefinitionInput = z.infer<typeof sectionDefinitionSchema>;
export type TabDefinitionInput = z.infer<typeof tabDefinitionSchema>;
export type ActionDefinitionInput = z.infer<typeof actionDefinitionSchema>;
export type WizardStepInput = z.infer<typeof wizardStepSchema>;
