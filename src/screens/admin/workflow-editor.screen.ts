/**
 * Workflow Editor Screen Definition
 *
 * Visual editor for configuring workflow stages and transitions.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';
import { fieldValue } from '@/lib/metadata';

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const stagesTableColumns: TableColumnDefinition[] = [
  { id: 'order', label: '#', path: 'order', type: 'number', width: '60px' },
  {
    id: 'name',
    label: 'Stage Name',
    path: 'name',
    type: 'text',
    config: {
      icon: { path: 'icon' },
      color: { path: 'color' },
    },
  },
  { id: 'description', label: 'Description', path: 'description', type: 'text' },
  {
    id: 'type',
    label: 'Type',
    path: 'type',
    type: 'enum',
    config: {
      options: [
        { value: 'initial', label: 'Initial' },
        { value: 'active', label: 'Active' },
        { value: 'terminal', label: 'Terminal' },
        { value: 'success', label: 'Success' },
        { value: 'failure', label: 'Failure' },
      ],
      badgeColors: {
        initial: 'blue',
        active: 'yellow',
        terminal: 'gray',
        success: 'green',
        failure: 'red',
      },
    },
  },
  { id: 'requiresApproval', label: 'Approval', path: 'requiresApproval', type: 'boolean' },
  { id: 'sla', label: 'SLA (hours)', path: 'slaHours', type: 'number' },
];

const transitionsTableColumns: TableColumnDefinition[] = [
  { id: 'fromStage', label: 'From', path: 'fromStage.name', type: 'text' },
  { id: 'arrow', label: '', path: 'arrow', type: 'text', width: '40px' },
  { id: 'toStage', label: 'To', path: 'toStage.name', type: 'text' },
  { id: 'name', label: 'Transition Name', path: 'name', type: 'text' },
  { id: 'conditions', label: 'Conditions', path: 'conditionsCount', type: 'number' },
  { id: 'requiresApproval', label: 'Approval', path: 'requiresApproval', type: 'boolean' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const workflowEditorScreen: ScreenDefinition = {
  id: 'workflow-editor',
  type: 'detail',
  // entityType: 'workflow', // Admin entity

  title: fieldValue('name'),
  subtitle: 'Workflow Configuration',
  icon: 'GitBranch',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'custom',
    query: {
      procedure: 'admin.workflows.getById',
      params: { type: fieldValue('type') },
    },
  },

  // Layout
  layout: {
    type: 'tabs',
    defaultTab: 'visual',
    tabs: [
      // Visual Editor Tab
      {
        id: 'visual',
        label: 'Visual Editor',
        icon: 'Layout',
        sections: [
          {
            id: 'workflow-diagram',
            type: 'custom',
            component: 'WorkflowDiagramEditor',
            componentProps: {
              workflowType: fieldValue('type'),
              editable: true,
              showLegend: true,
            },
          },
        ],
      },
      // Stages Tab
      {
        id: 'stages',
        label: 'Stages',
        icon: 'Layers',
        badge: { type: 'count', path: 'stagesCount' },
        sections: [
          {
            id: 'stages-table',
            type: 'table',
            title: 'Workflow Stages',
            description: 'Drag to reorder stages',
            columns_config: stagesTableColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.workflows.getStages',
                params: { workflowType: fieldValue('type') },
              },
            },
            rowClick: {
              type: 'modal',
              modal: 'EditWorkflowStageModal',
            },
            rowActions: [
              {
                id: 'edit',
                type: 'modal',
                label: 'Edit',
                icon: 'Pencil',
                config: { type: 'modal', modal: 'EditWorkflowStageModal' },
              },
              {
                id: 'delete',
                type: 'mutation',
                label: 'Delete',
                icon: 'Trash2',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'admin.workflows.deleteStage' },
                confirm: {
                  title: 'Delete Stage',
                  message: 'This may affect existing records. Are you sure?',
                  destructive: true,
                },
              },
            ],
            actions: [
              {
                id: 'add-stage',
                type: 'modal',
                label: 'Add Stage',
                icon: 'Plus',
                variant: 'primary',
                config: { type: 'modal', modal: 'AddWorkflowStageModal' },
              },
            ],
          },
        ],
      },
      // Transitions Tab
      {
        id: 'transitions',
        label: 'Transitions',
        icon: 'ArrowRight',
        badge: { type: 'count', path: 'transitionsCount' },
        sections: [
          {
            id: 'transitions-table',
            type: 'table',
            title: 'Stage Transitions',
            description: 'Define allowed movements between stages',
            columns_config: transitionsTableColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.workflows.getTransitions',
                params: { workflowType: fieldValue('type') },
              },
            },
            rowClick: {
              type: 'modal',
              modal: 'EditTransitionModal',
            },
            rowActions: [
              {
                id: 'edit',
                type: 'modal',
                label: 'Edit',
                icon: 'Pencil',
                config: { type: 'modal', modal: 'EditTransitionModal' },
              },
              {
                id: 'delete',
                type: 'mutation',
                label: 'Delete',
                icon: 'Trash2',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'admin.workflows.deleteTransition' },
              },
            ],
            actions: [
              {
                id: 'add-transition',
                type: 'modal',
                label: 'Add Transition',
                icon: 'Plus',
                variant: 'primary',
                config: { type: 'modal', modal: 'AddTransitionModal' },
              },
            ],
          },
        ],
      },
      // Rules Tab
      {
        id: 'rules',
        label: 'Rules & Automation',
        icon: 'Zap',
        sections: [
          {
            id: 'transition-rules',
            type: 'custom',
            title: 'Transition Rules',
            description: 'Conditions required for stage transitions',
            component: 'TransitionRulesEditor',
            componentProps: {
              workflowType: fieldValue('type'),
            },
          },
          {
            id: 'auto-activities',
            type: 'table',
            title: 'Auto-Created Activities',
            description: 'Activities created automatically during transitions',
            columns_config: [
              { id: 'trigger', label: 'Trigger', path: 'triggerDescription', type: 'text' },
              { id: 'activityType', label: 'Activity Type', path: 'activityType', type: 'text' },
              { id: 'assignee', label: 'Assignee', path: 'assigneeRule', type: 'text' },
              { id: 'dueOffset', label: 'Due', path: 'dueOffsetDescription', type: 'text' },
              { id: 'enabled', label: 'Enabled', path: 'enabled', type: 'boolean' },
            ],
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.workflows.getAutoActivities',
                params: { workflowType: fieldValue('type') },
              },
            },
            actions: [
              {
                id: 'manage-patterns',
                type: 'navigate',
                label: 'Manage Activity Patterns',
                icon: 'ExternalLink',
                variant: 'secondary',
                config: { type: 'navigate', route: '/admin/workflows/patterns' },
              },
            ],
          },
        ],
      },
      // Settings Tab
      {
        id: 'settings',
        label: 'Settings',
        icon: 'Settings',
        sections: [
          {
            id: 'workflow-settings',
            type: 'form',
            title: 'Workflow Settings',
            columns: 2,
            editable: true,
            fields: [
              {
                id: 'name',
                label: 'Workflow Name',
                type: 'text',
                path: 'name',
                config: { disabled: true },
              },
              {
                id: 'description',
                label: 'Description',
                type: 'textarea',
                path: 'description',
                config: { rows: 2 },
              },
              {
                id: 'defaultSla',
                label: 'Default SLA (hours)',
                type: 'number',
                path: 'settings.defaultSlaHours',
                config: { min: 0 },
              },
              {
                id: 'requireActivityForTransition',
                label: 'Require Activity for Transitions',
                type: 'checkbox',
                path: 'settings.requireActivityForTransition',
                config: { helpText: 'Users must log an activity before changing stages' },
              },
              {
                id: 'allowSkipStages',
                label: 'Allow Skipping Stages',
                type: 'checkbox',
                path: 'settings.allowSkipStages',
                config: { helpText: 'Enable non-sequential stage transitions' },
              },
              {
                id: 'notifyOnTransition',
                label: 'Notify on Transition',
                type: 'checkbox',
                path: 'settings.notifyOnTransition',
              },
            ],
            actions: [
              {
                id: 'save-settings',
                type: 'mutation',
                label: 'Save Settings',
                variant: 'primary',
                icon: 'Save',
                config: { type: 'mutation', procedure: 'admin.workflows.updateSettings' },
              },
            ],
          },
        ],
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'preview',
      type: 'modal',
      label: 'Preview',
      variant: 'secondary',
      icon: 'Eye',
      config: { type: 'modal', modal: 'WorkflowPreviewModal' },
    },
    {
      id: 'export',
      type: 'custom',
      label: 'Export',
      variant: 'secondary',
      icon: 'Download',
      config: { type: 'custom', handler: 'handleExportWorkflow' },
    },
    {
      id: 'reset',
      type: 'mutation',
      label: 'Reset to Default',
      variant: 'outline',
      icon: 'RotateCcw',
      config: { type: 'mutation', procedure: 'admin.workflows.resetToDefault' },
      confirm: {
        title: 'Reset Workflow',
        message: 'This will restore the default configuration. Custom changes will be lost.',
        destructive: true,
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Workflows', route: '/admin/workflows' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Workflows', route: '/admin/workflows' },
      { label: fieldValue('name') },
    ],
  },
};

export default workflowEditorScreen;
