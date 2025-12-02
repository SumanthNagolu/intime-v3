/**
 * Detail Screen Factory
 *
 * Generates a ScreenDefinition from a DetailTemplateConfig.
 * Handles sidebar, tabs, sections, related tables, and actions.
 */

import type {
  ScreenDefinition,
  SectionDefinition,
  TabDefinition,
  ActionDefinition,
} from '../types/screen.types';
import type { FieldDefinition } from '../types/widget.types';
import type { DynamicValue } from '../types/data.types';
import type {
  DetailTemplateConfig,
  SidebarConfig,
  SidebarFieldConfig,
  DetailTabConfig,
  DetailSectionConfig,
  RelatedTableConfig,
  ActivityTimelineConfig,
  DetailActionConfig,
} from '../templates/types';
import { capitalizeFirst, pluralize, getBasePath, getProcedureName, fieldValue } from '../templates/types';
import { getInputSet } from '../inputsets';
import { toBadgeColorsMap } from '../options/crm-options';

/**
 * Create a detail screen from template config
 */
export function createDetailScreen(config: DetailTemplateConfig): ScreenDefinition {
  const {
    entityType,
    domain,
    displayName,
    pluralName,
    procedures,
    basePath,
    titleField,
    subtitleField,
    sidebar,
    tabs,
    headerActions,
    editable = true,
  } = config;

  const entityDisplayName = displayName ?? capitalizeFirst(entityType);
  const entityPluralName = pluralName ?? pluralize(entityDisplayName);
  const entityBasePath = basePath ?? getBasePath(domain, entityType);
  const getByIdProcedure = procedures.getById ?? getProcedureName(domain, entityType, 'getById');

  // Build sidebar section
  const sidebarSection = sidebar ? generateSidebarSection(sidebar, entityType) : undefined;

  // Build tabs
  const tabDefs = generateTabs(tabs, entityType, domain);

  // Generate actions
  const actions = generateDetailActions(
    headerActions ?? [
      { id: 'edit', type: 'edit' },
      { id: 'delete', type: 'delete' },
    ],
    entityType,
    entityDisplayName,
    entityBasePath,
    procedures.delete ?? getProcedureName(domain, entityType, 'delete'),
    editable
  );

  return {
    id: `${entityType}-detail`,
    type: 'detail',
    entityType: entityType as import('@/lib/workspace/entity-registry').EntityType,

    title: fieldValue(titleField),
    subtitle: subtitleField
      ? fieldValue(subtitleField)
      : `${entityDisplayName} Details`,

    dataSource: {
      type: 'query',
      query: {
        procedure: getByIdProcedure,
        params: { id: { type: 'param', path: 'id' } },
      },
    } as unknown as import('../types/data.types').DataSourceDefinition,

    layout: {
      type: sidebar ? 'sidebar-main' : 'tabs',
      sidebarWidth: sidebar?.width ?? 'md',
      sidebarPosition: sidebar?.position ?? 'right',
      sidebar: sidebarSection,
      tabs: tabDefs,
    },

    actions,

    navigation: {
      back: {
        label: `Back to ${entityPluralName}`,
        route: entityBasePath,
      },
      breadcrumbs: [
        { label: capitalizeFirst(domain), route: `/employee/${domain}` },
        { label: entityPluralName, route: entityBasePath },
        { label: fieldValue(titleField) },
      ],
    },
  };
}

/**
 * Generate sidebar section from config
 */
function generateSidebarSection(
  config: SidebarConfig,
  entityType: string
): SectionDefinition {
  const fields: FieldDefinition[] = config.fields.map((f) => {
    const field: FieldDefinition = {
      id: f.id,
      label: f.label,
      type: f.type as FieldDefinition['type'],
      path: f.path,
    };

    // Add options for enum/select types
    if (f.options) {
      field.options = f.options;
    }

    // Add badge colors
    if (f.badgeColors) {
      field.config = { ...field.config, badgeColors: f.badgeColors };
    } else if (f.options && (f.type === 'enum' || f.type === 'select')) {
      field.config = { ...field.config, badgeColors: toBadgeColorsMap(f.options) };
    }

    // Merge additional config
    if (f.config) {
      field.config = { ...field.config, ...f.config };
    }

    return field;
  });

  return {
    id: `${entityType}-sidebar`,
    type: 'info-card',
    title: config.title ?? 'Quick Info',
    fields,
  };
}

/**
 * Generate tabs from config
 */
function generateTabs(
  tabs: DetailTabConfig[],
  entityType: string,
  domain: string
): TabDefinition[] {
  return tabs.map((tab) => {
    const sections: SectionDefinition[] = [];

    // Add sections from InputSets
    if (tab.inputSets && tab.inputSets.length > 0) {
      tab.inputSets.forEach((inputSetId) => {
        const inputSet = getInputSet(inputSetId);
        if (inputSet) {
          sections.push({
            id: `${tab.id}-${inputSetId}`,
            type: 'field-grid',
            title: inputSet.label ?? inputSet.name ?? inputSetId,
            columns: inputSet.columns ?? 2,
            fields: inputSet.fields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          });
        }
      });
    }

    // Add inline sections
    if (tab.sections && tab.sections.length > 0) {
      tab.sections.forEach((section) => {
        sections.push(generateDetailSection(section, tab.id, entityType));
      });
    }

    // Add related table
    if (tab.relatedTable) {
      sections.push(generateRelatedTableSection(tab.relatedTable, tab.id, entityType, domain));
    }

    // Add activity timeline
    if (tab.activityTimeline) {
      sections.push(generateActivityTimelineSection(tab.activityTimeline, tab.id, entityType));
    }

    const tabDef: TabDefinition = {
      id: tab.id,
      label: tab.label,
      icon: tab.icon,
      sections,
    };

    // Add badge if path provided
    if (tab.badgePath) {
      tabDef.badge = fieldValue(tab.badgePath);
    }

    // Add visibility/permissions
    if (tab.visible) {
      tabDef.visible = tab.visible;
    }
    if (tab.permissions) {
      tabDef.permissions = tab.permissions;
    }

    return tabDef;
  });
}

/**
 * Generate a detail section from config
 */
function generateDetailSection(
  config: DetailSectionConfig,
  tabId: string,
  entityType: string
): SectionDefinition {
  const section: SectionDefinition = {
    id: config.id ?? `${tabId}-section`,
    type: config.type ?? 'field-grid',
    title: config.title,
    columns: config.columns ?? 2,
    collapsible: config.collapsible ?? false,
    defaultExpanded: config.defaultExpanded ?? true,
    editable: config.editable ?? true,
  };

  // Add fields from InputSet
  if (config.inputSet) {
    const inputSet = getInputSet(config.inputSet);
    if (inputSet) {
      section.fields = inputSet.fields;
      section.columns = inputSet.columns ?? section.columns;
    }
  }

  // Add inline fields
  if (config.fields) {
    section.fields = config.fields;
  }

  // Custom component
  if (config.component) {
    section.type = 'custom';
    section.component = config.component;
  }

  return section;
}

/**
 * Generate related table section
 */
function generateRelatedTableSection(
  config: RelatedTableConfig,
  tabId: string,
  entityType: string,
  domain: string
): SectionDefinition {
  return {
    id: `${tabId}-${config.entity}-table`,
    type: 'table',
    dataSource: {
      type: 'query',
      query: {
        procedure: config.dataSource.procedure,
        params: config.dataSource.params ?? { [`${entityType}Id`]: { type: 'param', path: 'id' } },
      },
    } as unknown as import('../types/data.types').DataSourceDefinition,
    columns_config: config.columns.map((col) => ({
      id: col.id,
      label: col.label,
      path: col.path,
      type: col.type ?? 'text',
      sortable: col.sortable ?? false,
      config: col.options
        ? { options: col.options, badgeColors: col.badgeColors ?? toBadgeColorsMap(col.options) }
        : col.config,
    })),
    actions: config.addAction
      ? [
          {
            id: `add-${config.entity}`,
            type: config.addAction.modal ? 'modal' : 'navigate',
            label: config.addAction.label ?? `Add ${capitalizeFirst(config.entity)}`,
            variant: 'secondary',
            icon: 'Plus',
            config: config.addAction.modal
              ? { type: 'modal', modal: config.addAction.modal }
              : { type: 'navigate', route: config.addAction.route ?? `${getBasePath(domain, config.entity)}/new` },
          } as ActionDefinition,
        ]
      : undefined,
  };
}

/**
 * Generate activity timeline section
 */
function generateActivityTimelineSection(
  config: ActivityTimelineConfig,
  tabId: string,
  entityType: string
): SectionDefinition {
  return {
    id: `${tabId}-activity-timeline`,
    type: 'timeline',
    dataSource: {
      type: 'query',
      query: {
        procedure: config.procedure,
        params: { entityId: { type: 'param', path: 'id' }, entityType },
      },
    } as unknown as import('../types/data.types').DataSourceDefinition,
    actions: config.showAddButton
      ? [
          {
            id: 'add-activity',
            type: 'modal',
            label: 'Log Activity',
            variant: 'secondary',
            icon: 'Plus',
            config: { type: 'modal', modal: config.addModal ?? 'AddActivityModal' },
          } as ActionDefinition,
        ]
      : undefined,
  };
}

/**
 * Generate detail actions
 */
function generateDetailActions(
  actions: DetailActionConfig[],
  entityType: string,
  displayName: string,
  basePath: string,
  deleteProcedure: string,
  editable: boolean
): ActionDefinition[] {
  return actions
    .filter((action) => {
      // Filter out edit action if not editable
      if (action.type === 'edit' && !editable) return false;
      return true;
    })
    .map((action) => {
      switch (action.type) {
        case 'edit':
          return {
            id: action.id,
            type: 'navigate' as const,
            label: action.label ?? 'Edit',
            variant: action.variant ?? 'secondary',
            icon: action.icon ?? 'Pencil',
            config: {
              type: 'navigate' as const,
              route: action.route ?? `${basePath}/{{id}}/edit`,
            },
          };

        case 'delete':
          return {
            id: action.id,
            type: 'mutation' as const,
            label: action.label ?? 'Delete',
            variant: action.variant ?? 'destructive',
            icon: action.icon ?? 'Trash2',
            config: {
              type: 'mutation' as const,
              procedure: action.procedure ?? deleteProcedure,
              input: { id: fieldValue('id') },
            },
            confirm: action.confirm ?? {
              title: `Delete ${displayName}`,
              message: `Are you sure you want to delete this ${displayName.toLowerCase()}? This action cannot be undone.`,
              destructive: true,
            },
          };

        case 'navigate':
          return {
            id: action.id,
            type: 'navigate' as const,
            label: action.label ?? 'Go',
            variant: action.variant ?? 'secondary',
            icon: action.icon,
            config: {
              type: 'navigate' as const,
              route: action.route ?? basePath,
            },
          };

        case 'mutation':
          return {
            id: action.id,
            type: 'mutation' as const,
            label: action.label ?? 'Action',
            variant: action.variant ?? 'secondary',
            icon: action.icon,
            config: {
              type: 'mutation' as const,
              procedure: action.procedure!,
              input: { id: fieldValue('id') },
            },
            confirm: action.confirm,
          };

        case 'modal':
          return {
            id: action.id,
            type: 'modal' as const,
            label: action.label ?? 'Open',
            variant: action.variant ?? 'secondary',
            icon: action.icon,
            config: {
              type: 'modal' as const,
              modal: action.modal!,
            },
          };

        case 'custom':
        default:
          return {
            id: action.id,
            type: 'custom' as const,
            label: action.label ?? 'Action',
            variant: action.variant ?? 'secondary',
            icon: action.icon,
            config: {
              type: 'custom' as const,
              handler: action.handler ?? `handle${capitalizeFirst(action.id)}`,
            },
          };
      }
    });
}

export default createDetailScreen;
