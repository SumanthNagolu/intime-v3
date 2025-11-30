/**
 * Layout Renderer
 *
 * Renders different layout types: sidebar-main, tabs, wizard-steps, etc.
 * Handles the overall screen structure and navigation.
 */

'use client';

import React from 'react';
import type {
  LayoutDefinition,
  SectionDefinition,
  RenderContext,
  FormState,
  DynamicValue,
} from '../types';
import { SectionRenderer } from './SectionRenderer';
import { cn } from '@/lib/utils';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Resolve dynamic value to string for display
 */
function resolveDynamicValue(
  value: string | number | DynamicValue | undefined,
  context?: RenderContext
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();

  // For DynamicValue, resolve from context
  if (context && value.path) {
    // Simple resolution - in production this would be more sophisticated
    const resolved = context.query?.[value.path] || value.default;
    return resolved?.toString() || '';
  }

  return value.default?.toString() || '';
}

// ==========================================
// TYPES
// ==========================================

export interface LayoutRendererProps {
  /** Layout definition */
  definition: LayoutDefinition;

  /** Entity data */
  entity?: Record<string, unknown>;

  /** Form state */
  formState?: FormState;

  /** Field change handler */
  onFieldChange?: (fieldId: string, value: unknown) => void;

  /** Field blur handler */
  onFieldBlur?: (fieldId: string) => void;

  /** Whether in edit mode */
  isEditing?: boolean;

  /** Render context */
  context?: RenderContext;

  /** Additional className */
  className?: string;

  /** Wizard-specific: current step index */
  currentStep?: number;

  /** Wizard-specific: step change handler */
  onStepChange?: (stepIndex: number) => void;
}

// ==========================================
// LAYOUT TYPE RENDERERS
// ==========================================

/**
 * Single Column Layout - simple vertical stack of sections
 */
function SingleColumnLayout({
  definition,
  entity,
  formState,
  onFieldChange,
  onFieldBlur,
  isEditing,
  context,
}: LayoutRendererProps) {
  const sections = definition.sections || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          definition={section}
          entity={entity}
          formState={formState}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          isEditing={isEditing}
          context={context}
        />
      ))}
    </div>
  );
}

/**
 * Two Column Layout - equal width columns
 */
function TwoColumnLayout({
  definition,
  entity,
  formState,
  onFieldChange,
  onFieldBlur,
  isEditing,
  context,
}: LayoutRendererProps) {
  const sections = definition.sections || [];
  // Split sections into two columns
  const midPoint = Math.ceil(sections.length / 2);
  const leftSections = sections.slice(0, midPoint);
  const rightSections = sections.slice(midPoint);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {leftSections.map((section: SectionDefinition) => (
          <SectionRenderer
            key={section.id}
            definition={section}
            entity={entity}
            formState={formState}
            onFieldChange={onFieldChange}
            onFieldBlur={onFieldBlur}
            isEditing={isEditing}
            context={context}
          />
        ))}
      </div>
      <div className="space-y-6">
        {rightSections.map((section: SectionDefinition) => (
          <SectionRenderer
            key={section.id}
            definition={section}
            entity={entity}
            formState={formState}
            onFieldChange={onFieldChange}
            onFieldBlur={onFieldBlur}
            isEditing={isEditing}
            context={context}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Sidebar Main Layout - narrow sidebar + main content area
 */
function SidebarMainLayout({
  definition,
  entity,
  formState,
  onFieldChange,
  onFieldBlur,
  isEditing,
  context,
}: LayoutRendererProps) {
  const sidebar = definition.sidebar;
  const tabs = definition.tabs || [];
  const sections = definition.sections || [];

  // Active tab state
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.id || '');

  // Get sections for active tab
  const activeSections = tabs.length > 0
    ? tabs.find((t) => t.id === activeTab)?.sections || []
    : sections;

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      {sidebar && (
        <aside className="w-80 flex-shrink-0">
          <div className="sticky top-4">
            <SectionRenderer
              definition={sidebar}
              entity={entity}
              formState={formState}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
              isEditing={isEditing}
              context={context}
            />
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Tab bar */}
        {tabs.length > 0 && (
          <div className="border-b mb-6">
            <nav className="flex gap-4 -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-muted rounded-full">
                      {resolveDynamicValue(tab.badge, context)}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Tab content */}
        <div className="space-y-6">
          {activeSections.map((section: SectionDefinition) => (
            <SectionRenderer
              key={section.id}
              definition={section}
              entity={entity}
              formState={formState}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
              isEditing={isEditing}
              context={context}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

/**
 * Tabs Layout - full-width tabs without sidebar
 */
function TabsLayout({
  definition,
  entity,
  formState,
  onFieldChange,
  onFieldBlur,
  isEditing,
  context,
}: LayoutRendererProps) {
  const tabs = definition.tabs || [];
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.id || '');

  const activeTabDef = tabs.find((t) => t.id === activeTab);
  const activeSections = activeTabDef?.sections || [];

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b mb-6">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
                activeTab === tab.id
                  ? 'bg-background border border-b-0 border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
              {tab.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                  {resolveDynamicValue(tab.badge, context)}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {activeSections.map((section: SectionDefinition) => (
          <SectionRenderer
            key={section.id}
            definition={section}
            entity={entity}
            formState={formState}
            onFieldChange={onFieldChange}
            onFieldBlur={onFieldBlur}
            isEditing={isEditing}
            context={context}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Wizard Steps Layout - step-by-step form
 */
function WizardStepsLayout({
  definition,
  entity,
  formState,
  onFieldChange,
  onFieldBlur,
  isEditing = true,
  context,
  currentStep = 0,
  onStepChange,
}: LayoutRendererProps) {
  const steps = definition.steps || [];
  const currentStepDef = steps[currentStep];

  if (!currentStepDef) {
    return <div className="text-muted-foreground">No steps defined</div>;
  }

  const canGoBack = currentStep > 0;
  const canGoNext = currentStep < steps.length - 1;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <nav className="mb-8">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <li
                key={step.id}
                className={cn(
                  'flex items-center',
                  index < steps.length - 1 && 'flex-1'
                )}
              >
                {/* Step circle */}
                <button
                  onClick={() => isCompleted && onStepChange?.(index)}
                  disabled={!isCompleted}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    isCompleted && 'bg-primary text-primary-foreground cursor-pointer',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? '✓' : index + 1}
                </button>

                {/* Step label */}
                <span
                  className={cn(
                    'ml-2 text-sm hidden sm:block',
                    isCurrent ? 'font-medium' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-px mx-4',
                      isCompleted ? 'bg-primary' : 'bg-border'
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step content */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">{currentStepDef.title}</h2>
        {currentStepDef.description && (
          <p className="text-muted-foreground mb-6">{currentStepDef.description}</p>
        )}

        <div className="space-y-6">
          {currentStepDef.sections.map((section) => (
            <SectionRenderer
              key={section.id}
              definition={section}
              entity={entity}
              formState={formState}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
              isEditing={isEditing}
              context={context}
            />
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => canGoBack && onStepChange?.(currentStep - 1)}
          disabled={!canGoBack}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            canGoBack
              ? 'bg-muted hover:bg-muted/80'
              : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
          )}
        >
          Back
        </button>

        <button
          onClick={() => canGoNext && onStepChange?.(currentStep + 1)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          {isLastStep ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// MAIN LAYOUT RENDERER
// ==========================================

const layoutRenderers: Record<string, React.ComponentType<LayoutRendererProps>> = {
  'single-column': SingleColumnLayout,
  'two-column': TwoColumnLayout,
  'sidebar-main': SidebarMainLayout,
  tabs: TabsLayout,
  'wizard-steps': WizardStepsLayout,
};

export function LayoutRenderer(props: LayoutRendererProps) {
  const { definition, className } = props;

  const Renderer = layoutRenderers[definition.type] || SingleColumnLayout;

  return (
    <div className={cn('layout', className)}>
      <Renderer {...props} />
    </div>
  );
}

// ==========================================
// EXPORTS
// ==========================================

export default LayoutRenderer;
