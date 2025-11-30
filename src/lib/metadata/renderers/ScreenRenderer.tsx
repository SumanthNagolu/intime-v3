/**
 * Screen Renderer
 *
 * Top-level renderer that interprets screen definitions and renders
 * the complete UI. This is the main entry point for metadata-driven screens.
 */

'use client';

import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import type {
  ScreenDefinition,
  WizardScreenDefinition,
  DynamicValue,
  ActionDefinition,
  RenderContext,
  FormState,
  NavigationDefinition,
} from '../types';
import { LayoutRenderer } from './LayoutRenderer';
import { cn } from '@/lib/utils';

// ==========================================
// TYPES
// ==========================================

export interface ScreenRendererProps {
  /** Screen definition */
  definition: ScreenDefinition | WizardScreenDefinition;

  /** Entity data (optional - can be fetched via dataSource) */
  entity?: Record<string, unknown>;

  /** Loading state */
  isLoading?: boolean;

  /** Error message */
  error?: string | null;

  /** Initial form values (for edit/create modes) */
  initialValues?: Record<string, unknown>;

  /** Form submit handler */
  onSubmit?: (values: Record<string, unknown>) => Promise<void>;

  /** Custom action handlers */
  onAction?: (actionId: string, actionDef: ActionDefinition) => Promise<void>;

  /** Additional render context */
  context?: Partial<RenderContext>;

  /** Additional className */
  className?: string;
}

// ==========================================
// HELPER HOOKS
// ==========================================

/**
 * Resolve a dynamic value using current context
 */
function useDynamicValue(
  value: string | DynamicValue | undefined,
  entity: Record<string, unknown> | undefined,
  context: Partial<RenderContext>
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;

  switch (value.type) {
    case 'static':
      return String(value.default ?? '');

    case 'field':
      if (entity && value.path) {
        const resolved = resolveValue(entity, value.path);
        return resolved !== undefined ? String(resolved) : String(value.default ?? '');
      }
      return String(value.default ?? '');

    case 'param':
      if (value.path && context.params) {
        const resolved = context.params[value.path];
        return resolved !== undefined ? String(resolved) : String(value.default ?? '');
      }
      return String(value.default ?? '');

    case 'computed':
      if (value.path && context.computed) {
        const resolved = context.computed.get(value.path);
        return resolved !== undefined ? String(resolved) : String(value.default ?? '');
      }
      return String(value.default ?? '');

    case 'context':
      if (value.path) {
        const resolved = resolveValue(context as unknown as Record<string, unknown>, value.path);
        return resolved !== undefined ? String(resolved) : String(value.default ?? '');
      }
      return String(value.default ?? '');

    default:
      return String(value.default ?? '');
  }
}

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
 * Custom hook for form state management
 */
function useFormState(
  initialValues: Record<string, unknown> = {},
  entity?: Record<string, unknown>
): {
  formState: FormState;
  setFieldValue: (fieldId: string, value: unknown) => void;
  setFieldError: (fieldId: string, error: string | null) => void;
  setFieldTouched: (fieldId: string) => void;
  resetForm: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  getValues: () => Record<string, unknown>;
} {
  const [values, setValues] = React.useState<Record<string, unknown>>(() => ({
    ...entity,
    ...initialValues,
  }));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);

  const formState: FormState = {
    values,
    initialValues: { ...entity, ...initialValues },
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid: Object.keys(errors).length === 0,
  };

  const setFieldValue = React.useCallback((fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setIsDirty(true);
  }, []);

  const setFieldError = React.useCallback((fieldId: string, error: string | null) => {
    setErrors((prev) => {
      if (error === null) {
        const { [fieldId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [fieldId]: error };
    });
  }, []);

  const setFieldTouched = React.useCallback((fieldId: string) => {
    setTouched((prev) => ({ ...prev, [fieldId]: true }));
  }, []);

  const resetForm = React.useCallback(() => {
    setValues({ ...entity, ...initialValues });
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [entity, initialValues]);

  const getValues = React.useCallback(() => values, [values]);

  // Reset form when entity changes
  React.useEffect(() => {
    if (entity) {
      setValues((prev) => ({ ...entity, ...initialValues, ...prev }));
    }
  }, [entity, initialValues]);

  return {
    formState,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    setSubmitting: setIsSubmitting,
    getValues,
  };
}

// ==========================================
// ACTION BAR COMPONENT
// ==========================================

interface ActionBarProps {
  actions: ActionDefinition[];
  entity?: Record<string, unknown>;
  formState?: FormState;
  onAction?: (actionId: string, actionDef: ActionDefinition) => Promise<void>;
  isEditing?: boolean;
  onSave?: () => Promise<void>;
  onCancel?: () => void;
}

function ActionBar({
  actions,
  entity,
  formState,
  onAction,
  isEditing,
  onSave,
  onCancel,
}: ActionBarProps) {
  const router = useRouter();

  const handleAction = async (action: ActionDefinition) => {
    if (action.type === 'navigate' && action.config?.type === 'navigate') {
      router.push(
        typeof action.config.route === 'string'
          ? action.config.route
          : String(action.config.route.default ?? '')
      );
      return;
    }

    if (onAction) {
      await onAction(action.id, action);
    }
  };

  // Filter actions based on visibility
  const visibleActions = actions.filter((action) => {
    if (action.visible) {
      // Simple condition evaluation - in production would be more robust
      return true;
    }
    return true;
  });

  return (
    <div className="flex items-center gap-2">
      {visibleActions.map((action) => {
        const isPrimary = action.variant === 'primary';
        const isDestructive = action.variant === 'destructive';
        const isDisabled = formState?.isSubmitting;

        return (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            disabled={isDisabled}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isPrimary && 'bg-primary text-primary-foreground hover:bg-primary/90',
              isDestructive && 'bg-red-600 text-white hover:bg-red-700',
              !isPrimary && !isDestructive && 'bg-muted hover:bg-muted/80',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

// ==========================================
// SCREEN HEADER COMPONENT
// ==========================================

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string | DynamicValue; path?: string | DynamicValue }>;
  actions?: ActionDefinition[];
  entity?: Record<string, unknown>;
  formState?: FormState;
  onAction?: (actionId: string, actionDef: ActionDefinition) => Promise<void>;
  isEditing?: boolean;
  onSave?: () => Promise<void>;
  onCancel?: () => void;
}

function ScreenHeader({
  title,
  subtitle,
  breadcrumbs,
  actions = [],
  entity,
  formState,
  onAction,
  isEditing,
  onSave,
  onCancel,
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <header className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => {
              const label = typeof crumb.label === 'string' ? crumb.label : String(crumb.label.default ?? '');
              const path = crumb.path
                ? (typeof crumb.path === 'string' ? crumb.path : String(crumb.path.default ?? ''))
                : undefined;

              return (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && <span>/</span>}
                  {path ? (
                    <button
                      onClick={() => router.push(path)}
                      className="hover:text-foreground"
                    >
                      {label}
                    </button>
                  ) : (
                    <span>{label}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Title and actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          {subtitle && (
            <p className="mt-1 text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {actions.length > 0 && (
          <ActionBar
            actions={actions}
            entity={entity}
            formState={formState}
            onAction={onAction}
            isEditing={isEditing}
            onSave={onSave}
            onCancel={onCancel}
          />
        )}
      </div>
    </header>
  );
}

// ==========================================
// MAIN SCREEN RENDERER
// ==========================================

export function ScreenRenderer({
  definition,
  entity,
  isLoading = false,
  error,
  initialValues = {},
  onSubmit,
  onAction,
  context: providedContext,
  className,
}: ScreenRendererProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Form state
  const {
    formState,
    setFieldValue,
    setFieldTouched,
    setSubmitting,
    getValues,
    resetForm,
  } = useFormState(initialValues, entity);

  // Build render context
  const context: Partial<RenderContext> = React.useMemo(
    () => ({
      entity: entity ?? {},
      entityType: definition.entityType,
      entityId: (entity?.id as string) ?? '',
      relatedData: new Map(),
      user: providedContext?.user ?? {
        id: '',
        email: '',
        fullName: '',
        role: '',
        permissions: [],
      },
      permissions: providedContext?.permissions ?? [],
      roles: providedContext?.roles ?? [],
      params: params as Record<string, string>,
      query: Object.fromEntries(searchParams.entries()),
      formState,
      computed: new Map(),
      navigate: (path: string) => router.push(path),
      showToast: (message: string, type: 'success' | 'error' | 'info') => {
        console.log(`[${type}] ${message}`);
      },
      ...providedContext,
    }),
    [definition.entityType, entity, params, searchParams, providedContext, formState, router]
  );

  // Edit mode state
  const [isEditing, setIsEditing] = React.useState(definition.type === 'wizard');

  // Wizard step state
  const [currentStep, setCurrentStep] = React.useState(0);

  // Resolve dynamic values for header
  const title = useDynamicValue(definition.title, entity, context);
  const subtitle = useDynamicValue(definition.subtitle, entity, context);

  // Handle form submission
  const handleSave = React.useCallback(async () => {
    if (!onSubmit) return;

    setSubmitting(true);
    try {
      await onSubmit(getValues());
      setIsEditing(false);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  }, [onSubmit, getValues, setSubmitting]);

  // Handle cancel
  const handleCancel = React.useCallback(() => {
    resetForm();
    setIsEditing(false);
  }, [resetForm]);

  // Handle field changes
  const handleFieldChange = React.useCallback(
    (fieldId: string, value: unknown) => {
      setFieldValue(fieldId, value);
    },
    [setFieldValue]
  );

  // Handle field blur
  const handleFieldBlur = React.useCallback(
    (fieldId: string) => {
      setFieldTouched(fieldId);
    },
    [setFieldTouched]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-1/4 mb-8" />
        <div className="space-y-4">
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('p-6 bg-red-50 border border-red-200 rounded-lg', className)}>
        <h2 className="text-lg font-semibold text-red-800">Error</h2>
        <p className="mt-2 text-red-700">{error}</p>
      </div>
    );
  }

  // Prepare actions with edit/save/cancel logic
  const screenActions = [...(definition.actions || [])];

  // Add edit button if not in edit mode and screen supports editing
  if (!isEditing && definition.type === 'detail') {
    screenActions.unshift({
      id: 'edit',
      label: 'Edit',
      type: 'custom',
      variant: 'secondary',
    });
  }

  // Custom action handler that includes edit mode toggle
  const handleAction = async (actionId: string, actionDef: ActionDefinition) => {
    if (actionId === 'edit') {
      setIsEditing(true);
      return;
    }

    if (onAction) {
      await onAction(actionId, actionDef);
    }
  };

  return (
    <div className={cn('screen', className)}>
      {/* Screen Header */}
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={
          definition.type === 'wizard'
            ? undefined
            : (definition.navigation as NavigationDefinition | undefined)?.breadcrumbs
        }
        actions={screenActions}
        entity={entity}
        formState={formState}
        onAction={handleAction}
        isEditing={isEditing}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {/* Screen Content */}
      {definition.type === 'wizard' ? (
        <LayoutRenderer
          definition={{
            type: 'wizard-steps',
            steps: (definition as WizardScreenDefinition).steps,
          }}
          entity={entity}
          formState={formState}
          onFieldChange={handleFieldChange}
          onFieldBlur={handleFieldBlur}
          isEditing={isEditing}
          context={context as RenderContext}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />
      ) : (
        <LayoutRenderer
          definition={(definition as ScreenDefinition).layout}
          entity={entity}
          formState={formState}
          onFieldChange={handleFieldChange}
          onFieldBlur={handleFieldBlur}
          isEditing={isEditing}
          context={context as RenderContext}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />
      )}
    </div>
  );
}

// ==========================================
// EXPORTS
// ==========================================

export default ScreenRenderer;
