/**
 * Escalation Detail Screen
 *
 * Detailed view for handling an escalated issue.
 * Allows manager to take ownership, investigate, contact client,
 * create tasks, and resolve the escalation.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/03-handle-escalation.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const escalationDetailScreen: ScreenDefinition = {
  id: 'escalation-detail',
  type: 'detail',
  entityType: 'escalation',
  title: { type: 'field', path: 'escalation.subject' },
  subtitle: 'Escalation Detail',
  icon: 'AlertTriangle',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'escalation', procedure: 'escalations.getById', input: { id: { type: 'param', path: 'id' } } },
      { key: 'timeline', procedure: 'escalations.getTimeline', input: { id: { type: 'param', path: 'id' } } },
      { key: 'relatedTasks', procedure: 'escalations.getRelatedTasks', input: { id: { type: 'param', path: 'id' } } },
      { key: 'similarEscalations', procedure: 'escalations.getSimilar', input: { id: { type: 'param', path: 'id' } } },
    ],
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'right',
    sidebar: {
      id: 'escalation-sidebar',
      type: 'custom',
      component: 'EscalationSidebar',
      componentProps: {
        escalation: { type: 'field', path: 'escalation' },
      },
    },
    sections: [
      // ===========================================
      // ESCALATION HEADER
      // ===========================================
      {
        id: 'escalation-header',
        type: 'info-card',
        title: 'Issue Summary',
        fields: [
          { id: 'category', label: 'Category', path: 'escalation.category', type: 'text' },
          { id: 'type', label: 'Type', path: 'escalation.type', type: 'text' },
          { id: 'impact', label: 'Business Impact', path: 'escalation.impact', type: 'text' },
        ],
      },

      // ===========================================
      // RELATED ENTITY CONTEXT
      // ===========================================
      {
        id: 'related-entity',
        type: 'info-card',
        title: 'Related Entity',
        fields: [
          { id: 'entity-type', label: 'Entity Type', path: 'escalation.relatedEntityType', type: 'text' },
          { id: 'entity-name', label: 'Entity', path: 'escalation.relatedEntityName', type: 'link', config: { linkPattern: '{{escalation.relatedEntityUrl}}' } },
          { id: 'account', label: 'Account', path: 'escalation.accountName', type: 'link', config: { linkPattern: '/employee/crm/accounts/{{escalation.accountId}}' } },
          { id: 'contact', label: 'Client Contact', path: 'escalation.contactName', type: 'text' },
          { id: 'contact-email', label: 'Contact Email', path: 'escalation.contactEmail', type: 'email' },
        ],
        visible: {
          type: 'condition',
          condition: { field: 'escalation.relatedEntityId', operator: 'neq', value: null },
        },
      },

      // ===========================================
      // DESCRIPTION
      // ===========================================
      {
        id: 'description',
        type: 'info-card',
        title: 'Description',
        fields: [
          { id: 'description', label: '', path: 'escalation.description', type: 'textarea' },
        ],
      },

      // ===========================================
      // IC'S INITIAL ASSESSMENT
      // ===========================================
      {
        id: 'ic-assessment',
        type: 'info-card',
        title: 'IC\'s Initial Assessment',
        fields: [
          { id: 'ic-notes', label: '', path: 'escalation.icAssessment', type: 'textarea' },
        ],
        visible: {
          type: 'condition',
          condition: { field: 'escalation.icAssessment', operator: 'neq', value: null },
        },
      },

      // ===========================================
      // ATTACHED DOCUMENTS
      // ===========================================
      {
        id: 'attachments',
        type: 'custom',
        title: 'Attached Documents',
        component: 'AttachmentsList',
        componentProps: {
          dataPath: 'escalation.attachments',
          allowUpload: true,
          uploadHandler: 'escalations.uploadAttachment',
        },
      },

      // ===========================================
      // TIMELINE
      // ===========================================
      {
        id: 'timeline',
        type: 'custom',
        title: 'Timeline',
        component: 'EscalationTimeline',
        componentProps: {
          dataPath: 'timeline',
          showActivities: true,
          showEvents: true,
          showNotes: true,
        },
      },

      // ===========================================
      // RELATED TASKS
      // ===========================================
      {
        id: 'related-tasks',
        type: 'table',
        title: 'Related Tasks',
        dataSource: { type: 'field', path: 'relatedTasks' },
        columns_config: [
          { id: 'title', header: 'Task', path: 'title', type: 'text' },
          { id: 'assignee', header: 'Assigned To', path: 'assigneeName', type: 'user' },
          { id: 'due', header: 'Due', path: 'dueDate', type: 'date' },
          { id: 'status', header: 'Status', path: 'status', type: 'enum', config: {
            options: [
              { value: 'pending', label: 'Pending', color: 'yellow' },
              { value: 'in_progress', label: 'In Progress', color: 'blue' },
              { value: 'completed', label: 'Completed', color: 'green' },
            ],
          }},
        ],
        actions: [
          {
            id: 'create-task',
            label: 'Create Task',
            type: 'modal',
            icon: 'Plus',
            variant: 'secondary',
            config: { type: 'modal', modal: 'create-escalation-task' },
          },
        ],
      },

      // ===========================================
      // SIMILAR ESCALATIONS (FOR REFERENCE)
      // ===========================================
      {
        id: 'similar-escalations',
        type: 'table',
        title: 'Similar Escalations (Historical)',
        description: 'Previous escalations with this account or similar issues',
        dataSource: { type: 'field', path: 'similarEscalations' },
        columns_config: [
          { id: 'subject', header: 'Subject', path: 'subject', type: 'link', config: { linkPattern: '/employee/manager/escalations/{{id}}' } },
          { id: 'category', header: 'Category', path: 'category', type: 'text' },
          { id: 'resolution', header: 'Resolution', path: 'resolutionSummary', type: 'text' },
          { id: 'resolved-at', header: 'Resolved', path: 'resolvedAt', type: 'date' },
        ],
        collapsible: true,
        defaultExpanded: false,
      },

      // ===========================================
      // RESOLUTION FORM
      // ===========================================
      {
        id: 'resolution-form',
        type: 'form',
        title: 'Resolution',
        visible: {
          type: 'condition',
          condition: { field: 'escalation.status', operator: 'neq', value: 'resolved' },
        },
        fields: [
          {
            id: 'outcome',
            label: 'Outcome',
            type: 'select',
            path: 'resolution.outcome',
            config: {
              options: [
                { value: 'resolved', label: 'Resolved' },
                { value: 'escalated_further', label: 'Escalate Further' },
                { value: 'client_withdrew', label: 'Client Withdrew Complaint' },
              ],
            },
          },
          {
            id: 'resolution-notes',
            label: 'Resolution Notes',
            type: 'textarea',
            path: 'resolution.notes',
            config: { placeholder: 'Describe how the issue was resolved...', minRows: 4 },
          },
          {
            id: 'follow-up-required',
            label: 'Follow-up Required',
            type: 'checkbox',
            path: 'resolution.followUpRequired',
          },
          {
            id: 'follow-up-date',
            label: 'Follow-up Date',
            type: 'date',
            path: 'resolution.followUpDate',
            visible: {
              type: 'condition',
              condition: { field: 'resolution.followUpRequired', operator: 'eq', value: true },
            },
          },
          {
            id: 'lessons-learned',
            label: 'Lessons Learned',
            type: 'textarea',
            path: 'resolution.lessonsLearned',
            config: { placeholder: 'What can we learn from this escalation?', minRows: 2 },
          },
        ],
        actions: [
          {
            id: 'resolve',
            label: 'Mark Resolved',
            type: 'mutation',
            icon: 'Check',
            variant: 'primary',
            config: { type: 'mutation', procedure: 'escalations.resolve' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'take-ownership',
      label: 'Take Ownership',
      type: 'mutation',
      icon: 'UserCheck',
      variant: 'primary',
      config: { type: 'mutation', procedure: 'escalations.takeOwnership' },
      visible: {
        type: 'condition',
        condition: { field: 'escalation.status', operator: 'eq', value: 'pending' },
      },
    },
    {
      id: 'contact-client',
      label: 'Contact Client',
      type: 'modal',
      icon: 'Phone',
      variant: 'default',
      config: { type: 'modal', modal: 'contact-client' },
    },
    {
      id: 'escalate-further',
      label: 'Escalate to COO',
      type: 'modal',
      icon: 'ArrowUp',
      variant: 'secondary',
      config: { type: 'modal', modal: 'escalate-further' },
    },
    {
      id: 'assign-back',
      label: 'Assign Back to IC',
      type: 'modal',
      icon: 'ArrowLeft',
      variant: 'ghost',
      config: { type: 'modal', modal: 'assign-back' },
      visible: {
        type: 'condition',
        condition: { field: 'escalation.status', operator: 'eq', value: 'in_progress' },
      },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Manager', route: '/employee/manager' },
      { label: 'Escalations', route: '/employee/manager/escalations' },
      { label: { type: 'field', path: 'escalation.subject' }, active: true },
    ],
  },
};

export default escalationDetailScreen;
