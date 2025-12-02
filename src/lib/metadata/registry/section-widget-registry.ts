/**
 * Section Widget Registry
 *
 * Maps custom section component names to their React implementations.
 * Used by SectionRenderer to render custom dashboard widgets.
 */

import React from 'react';
import type { SectionDefinition } from '../types';

// ==========================================
// SECTION WIDGET INTERFACE
// ==========================================

export interface SectionWidgetProps {
  /** Section definition from metadata */
  definition: SectionDefinition;

  /** Data from tRPC query */
  data?: Record<string, unknown>;

  /** Entity context */
  entity?: Record<string, unknown>;

  /** Render context */
  context?: {
    isLoading?: boolean;
    error?: Error | null;
    refetch?: () => void;
  };

  /** Additional className */
  className?: string;
}

export type SectionWidgetComponent = React.ComponentType<SectionWidgetProps>;

// ==========================================
// SECTION WIDGET REGISTRY
// ==========================================

const sectionWidgetRegistry = new Map<string, SectionWidgetComponent>();

/**
 * Register a custom section widget component
 */
export function registerSectionWidget(
  name: string,
  component: SectionWidgetComponent
): void {
  sectionWidgetRegistry.set(name, component);
}

/**
 * Get a section widget component by name
 */
export function getSectionWidget(name: string): SectionWidgetComponent | undefined {
  return sectionWidgetRegistry.get(name);
}

/**
 * Check if a section widget is registered
 */
export function hasSectionWidget(name: string): boolean {
  return sectionWidgetRegistry.has(name);
}

/**
 * Get all registered section widget names
 */
export function getRegisteredSectionWidgets(): string[] {
  return Array.from(sectionWidgetRegistry.keys());
}

// ==========================================
// EXPORT
// ==========================================

export { sectionWidgetRegistry };
