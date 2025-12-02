/**
 * List Screen Factory
 *
 * Generates a ScreenDefinition from a ListTemplateConfig.
 * Handles metrics grid, table columns, actions, and navigation.
 */

import type { ScreenDefinition, TableColumnDefinition, ActionDefinition, SectionDefinition } from '../types/screen.types';
import type { FieldDefinition } from '../types/widget.types';
import type {
  ListTemplateConfig,
  ListColumnConfig,
  MetricConfig,
  HeaderActionConfig,
} from '../templates/types';
import { capitalizeFirst, pluralize, getBasePath, getProcedureName } from '../templates/types';
import { toBadgeColorsMap } from '../options/crm-options';

/**
 * Create a list screen from template config
 */
export function createListScreen(config: ListTemplateConfig): ScreenDefinition {
  const {
    entityType,
    domain,
    displayName,
    pluralName,
    procedures,
    basePath,
    columns,
    metrics,
    headerActions,
    rowClick = 'navigate',
    defaultSort,
    defaultPageSize = 25,
  } = config;

  const entityDisplayName = displayName ?? capitalizeFirst(entityType);
  const entityPluralName = pluralName ?? pluralize(entityDisplayName);
  const entityBasePath = basePath ?? getBasePath(domain, entityType);
  const listProcedure = procedures.list ?? getProcedureName(domain, entityType, 'list');

  // Generate table columns from config
  const tableColumns = generateTableColumns(columns, entityType, entityBasePath, rowClick);

  // Generate sections
  const sections: SectionDefinition[] = [];

  // Add metrics section if provided
  if (metrics && metrics.length > 0) {
    sections.push(generateMetricsSection(entityType, metrics));
  }

  // Add table section
  sections.push({
    id: `${entityType}-table`,
    type: 'table',
    columns_config: tableColumns,
  });

  // Generate actions
  const actions = generateHeaderActions(
    headerActions ?? [{ id: 'create', type: 'create' }],
    entityType,
    entityDisplayName,
    entityBasePath
  );

  return {
    id: `${entityType}-list`,
    type: 'list',
    entityType: entityType as import('@/lib/workspace/entity-registry').EntityType,

    title: entityPluralName,
    subtitle: `Manage ${entityPluralName.toLowerCase()}`,

    dataSource: {
      type: 'query',
      query: {
        procedure: listProcedure,
        params: {},
      },
    } as unknown as import('../types/data.types').DataSourceDefinition,

    layout: {
      type: 'single-column',
      sections,
    },

    actions,

    navigation: {
      breadcrumbs: [
        { label: capitalizeFirst(domain), route: `/employee/${domain}` },
        { label: entityPluralName },
      ],
    },
  };
}

/**
 * Generate table columns from config
 */
function generateTableColumns(
  columns: ListColumnConfig[],
  entityType: string,
  basePath: string,
  rowClick: string
): TableColumnDefinition[] {
  return columns.map((col, index) => {
    const column: TableColumnDefinition = {
      id: col.id,
      label: col.label,
      path: col.path,
      type: col.type ?? 'text',
      sortable: col.sortable ?? false,
      width: col.width,
    };

    // Add config for enum types with options
    if (col.options || col.badgeColors) {
      column.config = {};
      if (col.options) {
        column.config.options = col.options;
      }
      if (col.badgeColors) {
        column.config.badgeColors = col.badgeColors;
      } else if (col.options) {
        // Auto-generate badge colors from options
        column.config.badgeColors = toBadgeColorsMap(col.options);
      }
    }

    // Merge any additional config
    if (col.config) {
      column.config = { ...column.config, ...col.config };
    }

    // Add link to detail for first column (or columns marked as linkToDetail)
    if ((index === 0 && rowClick === 'navigate') || col.linkToDetail) {
      column.config = {
        ...column.config,
        linkToDetail: true,
        detailRoute: `${basePath}/{{id}}`,
      };
    }

    return column;
  });
}

/**
 * Generate metrics section
 */
function generateMetricsSection(entityType: string, metrics: MetricConfig[]): SectionDefinition {
  const fields: FieldDefinition[] = metrics.map((m) => ({
    id: m.id,
    label: m.label,
    fieldType: m.type,
    path: m.path,
    config: {
      icon: m.icon,
      color: m.color,
      trendPath: m.trendPath,
      link: m.link,
    },
  }));

  return {
    id: `${entityType}-metrics`,
    type: 'metrics-grid',
    columns: Math.min(metrics.length, 4) as 1 | 2 | 3 | 4,
    fields,
  };
}

/**
 * Generate header actions
 */
function generateHeaderActions(
  actions: HeaderActionConfig[],
  entityType: string,
  displayName: string,
  basePath: string
): ActionDefinition[] {
  return actions.map((action): ActionDefinition => {
    switch (action.type) {
      case 'create':
        return {
          id: action.id,
          type: 'navigate' as const,
          label: action.label ?? `New ${displayName}`,
          variant: action.variant ?? 'primary',
          icon: action.icon ?? 'Plus',
          config: {
            type: 'navigate' as const,
            route: action.route ?? `${basePath}/new`,
          },
        };

      case 'import':
        return {
          id: action.id,
          type: 'custom' as const,
          label: action.label ?? 'Import',
          variant: action.variant ?? 'secondary',
          icon: action.icon ?? 'Upload',
          config: {
            type: 'custom' as const,
            handler: action.handler ?? 'handleImport',
          },
        };

      case 'export':
        return {
          id: action.id,
          type: 'custom' as const,
          label: action.label ?? 'Export',
          variant: action.variant ?? 'secondary',
          icon: action.icon ?? 'Download',
          config: {
            type: 'custom' as const,
            handler: action.handler ?? 'handleExport',
          },
        };

      case 'custom':
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

      default:
        return {
          id: action.id,
          type: 'custom' as const,
          label: action.label ?? (action.type || 'Action'),
          variant: action.variant ?? 'secondary',
          config: {
            type: 'custom' as const,
            handler: action.handler ?? `handle${capitalizeFirst(action.id)}`,
          },
        };
    }
  });
}

export default createListScreen;
