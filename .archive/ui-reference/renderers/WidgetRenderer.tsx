/**
 * Widget Renderer
 *
 * Renders individual widgets based on field/widget definitions.
 * This is the lowest-level renderer in the hierarchy.
 */

'use client';

import React from 'react';
import type { FieldDefinition, WidgetDefinition, RenderContext, FieldType } from '../types';
import { getWidget, getWidgetForField } from '../registry/widget-registry';

// ==========================================
// TYPES
// ==========================================

export interface WidgetRendererProps {
  /** Field or widget definition */
  definition: FieldDefinition | WidgetDefinition;

  /** Current value */
  value: unknown;

  /** Change handler for input mode */
  onChange?: (value: unknown) => void;

  /** Blur handler */
  onBlur?: () => void;

  /** Whether in edit mode */
  isEditing?: boolean;

  /** Whether disabled */
  disabled?: boolean;

  /** Error message */
  error?: string | null;

  /** Entity data for context */
  entity?: Record<string, unknown>;

  /** Render context */
  context?: RenderContext;

  /** Additional className */
  className?: string;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Known field types that contain hyphens (to distinguish from widget types)
const HYPHENATED_FIELD_TYPES = new Set([
  'date-range',
  'rich-text',
  'multi-select',
  'checkbox-group',
  'radio-group',
  'relative-time',
]);

/**
 * Check if definition is a FieldDefinition
 * Checks for both 'fieldType' (preferred) and 'type' (if type is a FieldType, not WidgetType)
 */
function isFieldDefinition(def: FieldDefinition | WidgetDefinition): def is FieldDefinition {
  // Check for fieldType first (preferred)
  if ('fieldType' in def && def.fieldType) return true;

  // Check if 'type' is a FieldType (not a WidgetType)
  if ('type' in def && def.type) {
    const typeStr = def.type as string;

    // Check if it's a known hyphenated field type
    if (HYPHENATED_FIELD_TYPES.has(typeStr)) return true;

    // Widget types end with '-display' or '-input' or '-picker' or '-select' (composite widgets)
    const isWidgetType = typeStr.endsWith('-display') ||
                         typeStr.endsWith('-input') ||
                         typeStr.endsWith('-picker') ||
                         typeStr.endsWith('-card') ||
                         typeStr.endsWith('-item');
    return !isWidgetType;
  }

  return false;
}

/**
 * Resolve a value from a path in an object
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

// ==========================================
// WIDGET RENDERER COMPONENT
// ==========================================

export function WidgetRenderer({
  definition,
  value,
  onChange,
  onBlur,
  isEditing = false,
  disabled = false,
  error,
  entity,
  context: _context,
  className,
}: WidgetRendererProps) {
  // Determine which widget to use
  let widget;

  if (isFieldDefinition(definition)) {
    // It's a field definition - get widget by field type
    const fieldType = (definition.fieldType || definition.type) as FieldType | undefined;
    if (!fieldType) {
      console.warn(`No fieldType found for field definition:`, definition);
      return (
        <span className="text-muted-foreground text-sm">
          Field type missing
        </span>
      );
    }
    widget = getWidgetForField(fieldType, isEditing);
  } else {
    // It's a widget definition - get widget directly
    widget = getWidget(definition.type || 'text-display');
  }

  if (!widget) {
    console.warn(`No widget found for definition:`, definition);
    return (
      <span className="text-muted-foreground text-sm">
        Widget not found
      </span>
    );
  }

  // Resolve the actual value if definition has a path
  let resolvedValue = value;
  if (isFieldDefinition(definition) && definition.path && entity) {
    resolvedValue = resolveValue(entity, definition.path);
  }

  // Choose display or input component
  const Component = isEditing && widget.Input ? widget.Input : widget.Display;

  // Render the widget
  return (
    <Component
      definition={definition}
      value={resolvedValue}
      onChange={onChange}
      onBlur={onBlur}
      isEditing={isEditing}
      disabled={disabled}
      error={error}
      entity={entity}
      className={className}
    />
  );
}

// ==========================================
// FIELD WRAPPER COMPONENT
// ==========================================

export interface FieldWrapperProps {
  /** Field definition */
  definition: FieldDefinition;

  /** Current value */
  value: unknown;

  /** Change handler */
  onChange?: (value: unknown) => void;

  /** Blur handler */
  onBlur?: () => void;

  /** Whether in edit mode */
  isEditing?: boolean;

  /** Whether disabled */
  disabled?: boolean;

  /** Error message */
  error?: string | null;

  /** Entity data */
  entity?: Record<string, unknown>;

  /** Render context */
  context?: RenderContext;

  /** Hide label */
  hideLabel?: boolean;

  /** Custom label */
  label?: string;

  /** Additional className */
  className?: string;
}

/**
 * Field Wrapper - wraps a widget with label, description, and error display
 */
export function FieldWrapper({
  definition,
  value,
  onChange,
  onBlur,
  isEditing = false,
  disabled = false,
  error,
  entity,
  context,
  hideLabel = false,
  label,
  className,
}: FieldWrapperProps) {
  const fieldLabel = label ?? definition.label;
  const isRequired = definition.required;
  const description = definition.description;

  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      {/* Label */}
      {!hideLabel && fieldLabel && (
        <label className="block text-sm font-medium text-foreground">
          {fieldLabel}
          {isRequired && isEditing && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      {/* Widget */}
      <WidgetRenderer
        definition={definition}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        isEditing={isEditing}
        disabled={disabled}
        error={error}
        entity={entity}
        context={context}
      />

      {/* Description */}
      {description && isEditing && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

// ==========================================
// EXPORTS
// ==========================================

export default WidgetRenderer;
