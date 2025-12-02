/**
 * Form Screen Factory
 *
 * Generates a ScreenDefinition for create/edit forms from FormTemplateConfig.
 * Handles sections, InputSets, validation, and submit actions.
 */

import type { ScreenDefinition, SectionDefinition, ActionDefinition } from '../types/screen.types';
import type { DynamicValue } from '../types/data.types';
import type { FormTemplateConfig, FormSectionConfig, FormSubmitConfig } from '../templates/types';
import { capitalizeFirst, pluralize, getBasePath, getProcedureName, fieldValue } from '../templates/types';
import { getInputSet } from '../inputsets';

/**
 * Create a form screen from template config
 */
export function createFormScreen(config: FormTemplateConfig): ScreenDefinition {
  const {
    entityType,
    domain,
    displayName,
    pluralName,
    procedures,
    basePath,
    mode,
    title,
    subtitle,
    sections,
    submit,
    cancelRoute,
  } = config;

  const entityDisplayName = displayName ?? capitalizeFirst(entityType);
  const entityPluralName = pluralName ?? pluralize(entityDisplayName);
  const entityBasePath = basePath ?? getBasePath(domain, entityType);

  // Generate form sections
  const formSections = generateFormSections(sections, entityType);

  // Generate submit action
  const submitAction = generateSubmitAction(submit || {}, entityType, entityDisplayName, entityBasePath, procedures, mode);

  // Generate cancel action
  const cancelAction = generateCancelAction(cancelRoute ?? entityBasePath, entityPluralName);

  // Determine title
  let screenTitle: string | DynamicValue;
  if (title) {
    screenTitle = title;
  } else if (mode === 'create') {
    screenTitle = `New ${entityDisplayName}`;
  } else {
    screenTitle = fieldValue('name', `Edit ${entityDisplayName}`);
  }

  // Determine data source for edit mode
  const dataSource =
    mode === 'edit'
      ? ({
          type: 'query',
          query: {
            procedure: procedures.getById ?? getProcedureName(domain, entityType, 'getById'),
            params: { id: { type: 'param', path: 'id' } },
          },
        } as unknown as import('../types/data.types').DataSourceDefinition)
      : undefined;

  return {
    id: `${entityType}-${mode}`,
    type: 'wizard', // Using wizard type for form screens (single step wizard)
    entityType: entityType as import('@/lib/workspace/entity-registry').EntityType,

    title: screenTitle,
    subtitle: subtitle ?? (mode === 'create' ? `Create a new ${entityDisplayName.toLowerCase()}` : `Update ${entityDisplayName.toLowerCase()} details`),

    dataSource,

    layout: {
      type: 'single-column',
      sections: formSections,
    },

    actions: [submitAction, cancelAction],

    navigation: {
      back: {
        label: `Back to ${entityPluralName}`,
        route: cancelRoute ?? entityBasePath,
      },
      breadcrumbs: [
        { label: capitalizeFirst(domain), route: `/employee/${domain}` },
        { label: entityPluralName, route: entityBasePath },
        { label: mode === 'create' ? 'New' : 'Edit' },
      ],
    },
  };
}

/**
 * Generate form sections from config
 */
function generateFormSections(sections: FormSectionConfig[], entityType: string): SectionDefinition[] {
  return sections.map((section) => {
    const sectionDef: SectionDefinition = {
      id: section.id,
      type: 'form',
      title: section.title,
      description: section.description,
      icon: section.icon,
      columns: section.columns ?? 2,
      collapsible: section.collapsible ?? false,
      defaultExpanded: section.defaultExpanded ?? true,
      editable: true,
    };

    // Add fields from InputSet
    if (typeof section.inputSet === 'string') {
      const inputSet = getInputSet(section.inputSet);
      if (inputSet) {
        sectionDef.fields = inputSet.fields.map((field) => ({
          ...field,
          editable: true,
        }));
        sectionDef.columns = inputSet.columns ?? sectionDef.columns;
      }
    }

    // Add inline fields
    if (section.fields) {
      sectionDef.fields = section.fields.map((field) => ({
        ...field,
        editable: true,
      }));
    }

    // Add visibility rule
    if (section.visible) {
      sectionDef.visible = section.visible;
    }

    return sectionDef;
  });
}

/**
 * Generate submit action
 */
function generateSubmitAction(
  submit: FormSubmitConfig | Record<string, never>,
  entityType: string,
  displayName: string,
  basePath: string,
  procedures: FormTemplateConfig['procedures'],
  mode: 'create' | 'edit'
): ActionDefinition {
  const procedure =
    submit.procedure ??
    (mode === 'create' ? procedures.create : procedures.update) ??
    getProcedureName(entityType, entityType, mode);

  // Determine redirect route
  let redirectRoute: string;
  if (submit.redirectTo === 'detail') {
    redirectRoute = `${basePath}/{{id}}`;
  } else if (submit.redirectTo === 'list') {
    redirectRoute = basePath;
  } else {
    redirectRoute = submit.redirectTo ?? basePath;
  }

  return {
    id: 'submit',
    type: 'mutation' as const,
    label: submit.label ?? (mode === 'create' ? `Create ${displayName}` : `Save ${displayName}`),
    variant: 'primary',
    icon: mode === 'create' ? 'Plus' : 'Save',
    config: {
      type: 'mutation' as const,
      procedure,
      input: mode === 'edit' ? { id: fieldValue('id') } : {},
    },
  };
}

/**
 * Generate cancel action
 */
function generateCancelAction(cancelRoute: string, entityPluralName: string): ActionDefinition {
  return {
    id: 'cancel',
    type: 'navigate' as const,
    label: 'Cancel',
    variant: 'outline',
    config: {
      type: 'navigate' as const,
      route: cancelRoute,
    },
  };
}

/**
 * Create a create form screen (shorthand)
 */
export function createCreateFormScreen(
  config: Omit<FormTemplateConfig, 'mode'>
): ScreenDefinition {
  return createFormScreen({ ...config, mode: 'create' });
}

/**
 * Create an edit form screen (shorthand)
 */
export function createEditFormScreen(
  config: Omit<FormTemplateConfig, 'mode'>
): ScreenDefinition {
  return createFormScreen({ ...config, mode: 'edit' });
}

export default createFormScreen;
