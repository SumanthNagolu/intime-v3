/**
 * Client Placement Detail Screen
 *
 * Placement details with consultant info, contract info, and actions.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const clientPlacementDetailScreen: ScreenDefinition = {
  id: 'client-placement-detail',
  type: 'detail',
  entityType: 'placement',
  title: { type: 'field', path: 'consultantName' },
  subtitle: { type: 'field', path: 'jobTitle' },
  icon: 'User',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.client.getPlacementById',
      params: { id: { type: 'param', path: 'id' } },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',
    sidebar: {
      id: 'consultant-info',
      type: 'info-card',
      title: 'Consultant',
      header: {
        type: 'avatar',
        path: 'consultantPhoto',
        fallbackPath: 'consultantInitials',
        size: 'lg',
      },
      fields: [
        { id: 'name', label: 'Name', type: 'text', path: 'consultantName' },
        { id: 'email', label: 'Email', type: 'email', path: 'consultantEmail' },
        { id: 'phone', label: 'Phone', type: 'phone', path: 'consultantPhone' },
        { id: 'location', label: 'Location', type: 'text', path: 'location' },
      ],
    },
    sections: [
      // ===========================================
      // CONTRACT INFORMATION
      // ===========================================
      {
        id: 'contract-info',
        type: 'info-card',
        title: 'Contract Information',
        fields: [
          {
            id: 'status',
            label: 'Status',
            type: 'enum',
            path: 'status',
            config: {
              options: [
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'terminated', label: 'Terminated' },
                { value: 'extended', label: 'Extended' },
              ],
              badgeColors: { active: 'green', completed: 'blue', terminated: 'gray', extended: 'purple' },
            },
          },
          { id: 'startDate', label: 'Start Date', type: 'date', path: 'startDate' },
          { id: 'endDate', label: 'End Date', type: 'date', path: 'endDate' },
          { id: 'billRate', label: 'Bill Rate', type: 'currency', path: 'billRate' },
          { id: 'manager', label: 'Hiring Manager', type: 'text', path: 'hiringManager' },
          { id: 'department', label: 'Department', type: 'text', path: 'department' },
        ],
      },

      // ===========================================
      // PERFORMANCE CHECK-INS (If Shared)
      // ===========================================
      {
        id: 'performance-checkins',
        type: 'table',
        title: 'Performance Check-ins',
        collapsible: true,
        visible: { field: 'checkIns.length', operator: 'gt', value: 0 },
        dataSource: { type: 'field', path: 'checkIns' },
        columns_config: [
          { id: 'date', header: 'Date', path: 'date', type: 'date' },
          { id: 'rating', header: 'Rating', path: 'rating', type: 'rating', config: { max: 5 } },
          { id: 'notes', header: 'Notes', path: 'notes', type: 'text' },
        ],
        emptyState: {
          title: 'No check-ins yet',
          description: 'Performance check-ins will appear here.',
          icon: 'ClipboardCheck',
        },
      },

      // ===========================================
      // EXTENSION REQUEST FORM
      // ===========================================
      {
        id: 'extension-request',
        type: 'form',
        title: 'Request Extension',
        collapsible: true,
        defaultExpanded: false,
        visible: { field: 'status', operator: 'eq', value: 'active' },
        fields: [
          {
            id: 'newEndDate',
            type: 'date',
            label: 'New End Date',
            path: 'extension.newEndDate',
            config: { required: true },
          },
          {
            id: 'reason',
            type: 'textarea',
            label: 'Reason for Extension',
            path: 'extension.reason',
            config: { placeholder: 'Explain why the extension is needed...', rows: 3 },
          },
        ],
        actions: [
          {
            id: 'submit-extension',
            label: 'Submit Extension Request',
            type: 'mutation',
            variant: 'primary',
            config: {
              type: 'mutation',
              procedure: 'portal.client.requestExtension',
              input: {
                placementId: { type: 'field', path: 'id' },
                extension: { type: 'context', path: 'formState.values' },
              },
            },
          },
        ],
      },

      // ===========================================
      // ISSUE REPORTING
      // ===========================================
      {
        id: 'report-issue',
        type: 'form',
        title: 'Report an Issue',
        collapsible: true,
        defaultExpanded: false,
        visible: { field: 'status', operator: 'eq', value: 'active' },
        fields: [
          {
            id: 'issueType',
            type: 'select',
            label: 'Issue Type',
            path: 'issue.type',
            config: {
              options: [
                { value: 'performance', label: 'Performance Concern' },
                { value: 'attendance', label: 'Attendance Issue' },
                { value: 'communication', label: 'Communication Problem' },
                { value: 'other', label: 'Other' },
              ],
              required: true,
            },
          },
          {
            id: 'description',
            type: 'textarea',
            label: 'Description',
            path: 'issue.description',
            config: { placeholder: 'Describe the issue...', rows: 4, required: true },
          },
          {
            id: 'urgency',
            type: 'select',
            label: 'Urgency',
            path: 'issue.urgency',
            config: {
              options: [
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ],
            },
          },
        ],
        actions: [
          {
            id: 'submit-issue',
            label: 'Submit Issue',
            type: 'mutation',
            variant: 'destructive',
            config: {
              type: 'mutation',
              procedure: 'portal.client.reportIssue',
              input: {
                placementId: { type: 'field', path: 'id' },
                issue: { type: 'context', path: 'formState.values' },
              },
            },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'contact-consultant',
      label: 'Contact Consultant',
      type: 'modal',
      icon: 'MessageCircle',
      variant: 'default',
      config: { type: 'modal', modal: 'ContactConsultant', props: { placementId: { type: 'field', path: 'id' } } },
    },
    {
      id: 'contact-recruiter',
      label: 'Contact Recruiter',
      type: 'modal',
      icon: 'Phone',
      variant: 'outline',
      config: { type: 'modal', modal: 'ContactRecruiter', props: { placementId: { type: 'field', path: 'id' } } },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Client Portal', route: '/client' },
      { label: 'Placements', route: '/client/placements' },
      { label: { type: 'field', path: 'consultantName' }, active: true },
    ],
  },
};

export default clientPlacementDetailScreen;
