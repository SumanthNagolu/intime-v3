/**
 * Section Renderer
 *
 * Renders different section types: info-card, form, table, metrics-grid, etc.
 * Each section type has its own rendering logic.
 */

'use client';

import React from 'react';
import type {
  SectionDefinition,
  FieldDefinition,
  TableColumnDefinition,
  RenderContext,
  FormState,
  DynamicValue,
} from '../types';
import { FieldWrapper, WidgetRenderer } from './WidgetRenderer';
import { cn } from '@/lib/utils';

// ==========================================
// TYPES
// ==========================================

export interface SectionRendererProps {
  /** Section definition */
  definition: SectionDefinition;

  /** Entity data */
  entity?: Record<string, unknown>;

  /** Form state (for editable sections) */
  formState?: FormState;

  /** Update form field */
  onFieldChange?: (fieldId: string, value: unknown) => void;

  /** Field blur handler */
  onFieldBlur?: (fieldId: string) => void;

  /** Whether in edit mode */
  isEditing?: boolean;

  /** Render context */
  context?: RenderContext;

  /** Additional className */
  className?: string;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Resolve a value from nested path
 */
function resolveValue(obj: Record<string, unknown> | undefined, path: string): unknown {
  if (!obj || !path) return undefined;

  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Get grid columns class based on column count
 */
function getGridCols(columns: number): string {
  const colsMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  return colsMap[columns] || colsMap[2];
}

/**
 * Resolve dynamic value to string for display
 */
function resolveDynamicValue(value: string | DynamicValue | undefined): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  // For DynamicValue, just return the path as placeholder
  // In a real implementation, this would resolve from context
  return value.path || '';
}

// ==========================================
// SECTION TYPE RENDERERS
// ==========================================

/**
 * Info Card Section - displays key-value pairs in a card
 */
function InfoCardSection({
  definition,
  entity,
  formState,
  onFieldChange,
  onFieldBlur,
  isEditing,
  context,
}: SectionRendererProps) {
  const fields = definition.fields || [];
  const columns = definition.columns || 2;

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      {definition.title && (
        <h3 className="text-lg font-semibold mb-4">{resolveDynamicValue(definition.title)}</h3>
      )}

      <div className={cn('grid gap-4', getGridCols(columns))}>
        {fields.map((field) => {
          const value = formState?.values[field.id] ?? resolveValue(entity, field.path || field.id);
          const error = formState?.errors[field.id];

          return (
            <FieldWrapper
              key={field.id}
              definition={field}
              value={value}
              onChange={(val) => onFieldChange?.(field.id, val)}
              onBlur={() => onFieldBlur?.(field.id)}
              isEditing={isEditing}
              disabled={formState?.isSubmitting}
              error={error}
              entity={entity}
              context={context}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Form Section - editable form fields
 */
function FormSection({
  definition,
  entity,
  formState,
  onFieldChange,
  onFieldBlur,
  isEditing,
  context,
}: SectionRendererProps) {
  const fields = definition.fields || [];
  const columns = definition.columns || 1;

  return (
    <div className="space-y-4">
      {definition.title && (
        <h3 className="text-lg font-semibold">{resolveDynamicValue(definition.title)}</h3>
      )}

      {definition.description && (
        <p className="text-sm text-muted-foreground">{definition.description}</p>
      )}

      <div className={cn('grid gap-4', getGridCols(columns))}>
        {fields.map((field) => {
          const value = formState?.values[field.id] ?? resolveValue(entity, field.path || field.id);
          const error = formState?.errors[field.id];

          return (
            <FieldWrapper
              key={field.id}
              definition={field}
              value={value}
              onChange={(val) => onFieldChange?.(field.id, val)}
              onBlur={() => onFieldBlur?.(field.id)}
              isEditing={isEditing ?? true}
              disabled={formState?.isSubmitting}
              error={error}
              entity={entity}
              context={context}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Field Grid Section - compact grid of display fields
 */
function FieldGridSection({
  definition,
  entity,
  context,
}: SectionRendererProps) {
  const fields = definition.fields || [];
  const columns = definition.columns || 3;

  return (
    <div className="space-y-3">
      {definition.title && (
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {resolveDynamicValue(definition.title)}
        </h3>
      )}

      <div className={cn('grid gap-x-6 gap-y-3', getGridCols(columns))}>
        {fields.map((field) => {
          const value = resolveValue(entity, field.path || field.id);

          return (
            <div key={field.id} className="space-y-1">
              <dt className="text-xs text-muted-foreground">{field.label}</dt>
              <dd className="text-sm font-medium">
                <WidgetRenderer
                  definition={field}
                  value={value}
                  isEditing={false}
                  entity={entity}
                  context={context}
                />
              </dd>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Metrics Grid Section - displays metrics/KPIs
 */
function MetricsGridSection({
  definition,
  entity,
  context,
}: SectionRendererProps) {
  const fields = definition.fields || [];
  const columns = definition.columns || 4;

  return (
    <div className={cn('grid gap-4', getGridCols(columns))}>
      {fields.map((field) => {
        const value = resolveValue(entity, field.path || field.id);
        const config = field.config as { trend?: 'up' | 'down'; change?: number } | undefined;

        return (
          <div
            key={field.id}
            className="bg-card rounded-lg border border-border p-4"
          >
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {field.label}
            </div>
            <div className="mt-1 text-2xl font-bold">
              <WidgetRenderer
                definition={field}
                value={value}
                isEditing={false}
                entity={entity}
                context={context}
              />
            </div>
            {config?.change !== undefined && (
              <div
                className={cn(
                  'mt-1 text-xs',
                  config.trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {config.trend === 'up' ? '↑' : '↓'} {Math.abs(config.change)}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Table Section - displays tabular data
 */
function TableSection({
  definition,
  entity,
  context,
}: SectionRendererProps) {
  // Use columns_config from SectionDefinition
  const columns = definition.columns_config || [];
  if (columns.length === 0) {
    return <div className="text-muted-foreground">No table columns configured</div>;
  }

  // Get data from dataSource or default to 'items' field
  const dataPath = 'items'; // Default path for table data
  const data = (resolveValue(entity, dataPath) as Record<string, unknown>[]) || [];

  return (
    <div className="space-y-3">
      {definition.title && (
        <h3 className="text-lg font-semibold">{resolveDynamicValue(definition.title)}</h3>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col: TableColumnDefinition) => (
                <th
                  key={col.id}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide',
                    col.width && `w-[${col.width}]`
                  )}
                >
                  {col.header || col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-muted/30">
                  {columns.map((col: TableColumnDefinition) => {
                    const cellValue = resolveValue(row, col.accessor || col.path || col.id);
                    const fieldDef: FieldDefinition = {
                      id: col.id,
                      label: col.header || col.label || col.id,
                      fieldType: (col.type || 'text') as string,
                      path: col.accessor || col.path || col.id,
                      config: col.config,
                    };

                    return (
                      <td key={col.id} className="px-4 py-3 text-sm">
                        <WidgetRenderer
                          definition={fieldDef}
                          value={cellValue}
                          isEditing={false}
                          entity={row}
                          context={context}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * List Section - displays a simple list
 */
function ListSection({
  definition,
  entity,
  context,
}: SectionRendererProps) {
  // List sections don't have dataPath in SectionDefinition, use 'items' as default
  const dataPath = 'items';
  const data = (resolveValue(entity, dataPath) as Record<string, unknown>[]) || [];
  const fields = definition.fields || [];

  return (
    <div className="space-y-3">
      {definition.title && (
        <h3 className="text-lg font-semibold">{resolveDynamicValue(definition.title)}</h3>
      )}

      <ul className="space-y-2">
        {data.length === 0 ? (
          <li className="text-muted-foreground text-sm">No items</li>
        ) : (
          data.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
            >
              {fields.map((field) => {
                const value = resolveValue(item, field.path || field.id);
                return (
                  <div key={field.id} className="flex-1">
                    <WidgetRenderer
                      definition={field}
                      value={value}
                      isEditing={false}
                      entity={item}
                      context={context}
                    />
                  </div>
                );
              })}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

/**
 * Timeline Section - displays chronological events
 */
function TimelineSection({
  definition,
  entity,
  context,
}: SectionRendererProps) {
  // Timeline sections use 'events' as default data path
  const dataPath = 'events';
  const data = (resolveValue(entity, dataPath) as Record<string, unknown>[]) || [];
  const fields = definition.fields || [];

  // Assume fields are: timestamp, title, description
  const timestampField = fields.find((f) => f.id === 'timestamp' || f.fieldType === 'datetime');
  const titleField = fields.find((f) => f.id === 'title');
  const descriptionField = fields.find((f) => f.id === 'description');

  return (
    <div className="space-y-3">
      {definition.title && (
        <h3 className="text-lg font-semibold">{resolveDynamicValue(definition.title)}</h3>
      )}

      <div className="relative">
        <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />

        <ul className="space-y-4 pl-8">
          {data.length === 0 ? (
            <li className="text-muted-foreground text-sm">No events</li>
          ) : (
            data.map((event, index) => (
              <li key={index} className="relative">
                <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />

                <div className="space-y-1">
                  {timestampField && (
                    <div className="text-xs text-muted-foreground">
                      <WidgetRenderer
                        definition={timestampField}
                        value={resolveValue(event, timestampField.path || 'timestamp')}
                        isEditing={false}
                        entity={event}
                        context={context}
                      />
                    </div>
                  )}

                  {titleField && (
                    <div className="font-medium">
                      <WidgetRenderer
                        definition={titleField}
                        value={resolveValue(event, titleField.path || 'title')}
                        isEditing={false}
                        entity={event}
                        context={context}
                      />
                    </div>
                  )}

                  {descriptionField && (
                    <div className="text-sm text-muted-foreground">
                      <WidgetRenderer
                        definition={descriptionField}
                        value={resolveValue(event, descriptionField.path || 'description')}
                        isEditing={false}
                        entity={event}
                        context={context}
                      />
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

/**
 * Collapsible Section - expandable content
 */
function CollapsibleSection({
  definition,
  entity,
  formState,
  onFieldChange,
  onFieldBlur,
  isEditing,
  context,
}: SectionRendererProps) {
  const [isOpen, setIsOpen] = React.useState(definition.defaultExpanded ?? true);
  const fields = definition.fields || [];

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50"
      >
        <span className="font-medium">{resolveDynamicValue(definition.title)}</span>
        <span className="text-muted-foreground">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 border-t">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {fields.map((field) => {
              const value = formState?.values[field.id] ?? resolveValue(entity, field.path || field.id);
              const error = formState?.errors[field.id];

              return (
                <FieldWrapper
                  key={field.id}
                  definition={field}
                  value={value}
                  onChange={(val) => onFieldChange?.(field.id, val)}
                  onBlur={() => onFieldBlur?.(field.id)}
                  isEditing={isEditing}
                  disabled={formState?.isSubmitting}
                  error={error}
                  entity={entity}
                  context={context}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Custom Section - renders custom content via render function
 */
function CustomSection({
  definition,
  entity: _entity,
  context: _context,
}: SectionRendererProps) {
  // For custom sections, we'd need a registry of custom section components
  // For now, just render a placeholder
  return (
    <div className="p-4 border rounded-lg bg-muted/30">
      <div className="text-muted-foreground text-sm">
        Custom section: {definition.component || definition.id}
      </div>
    </div>
  );
}

// ==========================================
// MAIN SECTION RENDERER
// ==========================================

const sectionRenderers: Record<string, React.ComponentType<SectionRendererProps>> = {
  'info-card': InfoCardSection,
  form: FormSection,
  'field-grid': FieldGridSection,
  'metrics-grid': MetricsGridSection,
  table: TableSection,
  list: ListSection,
  timeline: TimelineSection,
  collapsible: CollapsibleSection,
  custom: CustomSection,
  // Input-set sections are handled by FormSection with special field grouping
  'input-set': FormSection,
};

export function SectionRenderer(props: SectionRendererProps) {
  const { definition, className } = props;

  const Renderer = sectionRenderers[definition.type] || CustomSection;

  return (
    <div
      id={definition.id}
      className={cn('section', className)}
    >
      <Renderer {...props} />
    </div>
  );
}

// ==========================================
// EXPORTS
// ==========================================

export default SectionRenderer;
