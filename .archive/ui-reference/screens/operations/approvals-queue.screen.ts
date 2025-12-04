/**
 * Approvals Queue Screen Definition
 * 
 * Displays pending approvals for submissions, offers, and other decisions.
 * 
 * @see docs/specs/20-USER-ROLES/04-manager/07-approval-workflows.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const approvalsQueueScreen: ScreenDefinition = {
  id: 'manager-approvals',
  type: 'list-detail',
  entityType: 'approval',
  title: 'Approvals Queue',
  description: 'Review and approve pending submissions and requests',
  
  dataSource: {
    type: 'query',
    query: 'approvals.listForManager',
    params: {
      managerId: { type: 'context', path: 'user.id' },
    },
  },
  
  layout: {
    type: 'sidebar-main',
    sidebar: {
      id: 'approval-stats',
      type: 'custom',
      component: 'ApprovalStatsSidebar',
      width: 'narrow',
      sections: [
        {
          id: 'counts',
          type: 'metrics-grid',
          columns: 1,
          metrics: [
            {
              id: 'pending',
              type: 'metric',
              label: 'Pending',
              value: { type: 'field', path: 'counts.pending' },
              icon: 'clock',
              color: 'warning',
            },
            {
              id: 'urgent',
              type: 'metric',
              label: 'Urgent',
              value: { type: 'field', path: 'counts.urgent' },
              icon: 'alert-triangle',
              color: 'destructive',
            },
            {
              id: 'overdue',
              type: 'metric',
              label: 'Overdue',
              value: { type: 'field', path: 'counts.overdue' },
              icon: 'x-circle',
              color: 'destructive',
            },
            {
              id: 'approved-today',
              type: 'metric',
              label: 'Approved Today',
              value: { type: 'field', path: 'counts.approvedToday' },
              icon: 'check-circle',
              color: 'success',
            },
          ],
        },
        {
          id: 'filters',
          type: 'form',
          title: 'Filters',
          fields: [
            {
              id: 'type',
              name: 'type',
              label: 'Type',
              type: 'select',
              options: [
                { value: 'all', label: 'All Types' },
                { value: 'submission', label: 'Submissions' },
                { value: 'offer', label: 'Offers' },
                { value: 'job_cancel', label: 'Job Cancellations' },
                { value: 'contract', label: 'Contracts' },
                { value: 'relocation', label: 'Relocation' },
                { value: 'visa', label: 'Visa Sponsorship' },
              ],
            },
            {
              id: 'urgency',
              name: 'urgency',
              label: 'Urgency',
              type: 'select',
              options: [
                { value: 'all', label: 'All' },
                { value: 'critical', label: 'Critical' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'normal', label: 'Normal' },
              ],
            },
            {
              id: 'requester',
              name: 'requesterId',
              label: 'Requester (IC)',
              type: 'select',
              optionsSource: {
                type: 'query',
                query: 'users.podMembers',
                params: {
                  podId: { type: 'context', path: 'user.podId' },
                },
                labelField: 'fullName',
                valueField: 'id',
              },
            },
          ],
        },
      ],
    },
    main: {
      sections: [
        {
          id: 'approvals-table',
          type: 'table',
          title: 'Pending Approvals',
          dataSource: {
            type: 'field',
            path: 'approvals',
          },
          sortable: true,
          columns_config: [
            {
              id: 'urgency-indicator',
              header: '',
              path: 'urgency',
              type: 'badge',
              options: [
                { value: 'critical', label: '🔴', color: 'destructive' },
                { value: 'urgent', label: '🟡', color: 'warning' },
                { value: 'normal', label: '', color: 'muted' },
              ],
              width: '40px',
            },
            {
              id: 'type',
              header: 'Type',
              accessor: 'approvalType',
              type: 'badge',
              options: [
                { value: 'submission', label: 'Submission', color: 'info' },
                { value: 'offer', label: 'Offer', color: 'success' },
                { value: 'job_cancel', label: 'Job Cancel', color: 'warning' },
                { value: 'contract', label: 'Contract', color: 'secondary' },
                { value: 'relocation', label: 'Relocation', color: 'primary' },
                { value: 'visa', label: 'Visa', color: 'destructive' },
              ],
              width: '120px',
            },
            {
              id: 'subject',
              header: 'Subject',
              accessor: 'subject',
              type: 'link',
              config: { linkPattern: '/employee/manager/approvals/{{id}}' },
              primary: true,
            },
            {
              id: 'reason',
              header: 'Reason',
              accessor: 'reason',
              type: 'text',
              truncate: 50,
            },
            {
              id: 'requester',
              header: 'Requester',
              accessor: 'requesterName',
              type: 'user',
            },
            {
              id: 'financial-impact',
              header: 'Impact',
              accessor: 'financialSummary',
              type: 'custom',
              component: 'FinancialImpactCell',
            },
            {
              id: 'requested',
              header: 'Requested',
              accessor: 'requestedAt',
              type: 'relative-time',
              sortable: true,
            },
            {
              id: 'due',
              header: 'Due',
              accessor: 'dueBy',
              type: 'relative-time',
              highlight: {
                condition: { operator: 'lt', field: 'dueBy', value: 'now' },
                color: 'destructive',
              },
            },
            {
              id: 'actions',
              header: '',
              type: 'actions',
              actions: [
                {
                  id: 'quick-approve',
                  label: 'Approve',
                  icon: 'check',
                  variant: 'default',
                  type: 'modal',
                  config: { type: 'modal', modal: 'approval-decision', props: { defaultDecision: 'approved' } },
                },
                {
                  id: 'quick-reject',
                  label: 'Reject',
                  icon: 'x',
                  variant: 'destructive',
                  type: 'modal',
                  config: { type: 'modal', modal: 'approval-decision', props: { defaultDecision: 'rejected' } },
                },
                {
                  id: 'view-details',
                  label: 'Review Details',
                  icon: 'eye',
                  type: 'navigate',
                  config: { type: 'navigate', route: '/employee/manager/approvals/{{id}}' },
                },
              ],
              width: '150px',
            },
          ],
          rowActions: [
            {
              id: 'swipe-approve',
              label: 'Approve',
              trigger: 'swipe-right',
              type: 'modal',
              config: { type: 'modal', modal: 'approval-decision', props: { defaultDecision: 'approved' } },
            },
            {
              id: 'swipe-reject',
              label: 'Reject',
              trigger: 'swipe-left',
              type: 'modal',
              config: { type: 'modal', modal: 'approval-decision', props: { defaultDecision: 'rejected' } },
            },
          ],
        },
      ],
    },
  },

  // TODO: Add modals support to ScreenDefinition type
  // modals: [...],

  actions: [
    {
      id: 'refresh',
      label: 'Refresh',
      icon: 'refresh-cw',
      type: 'custom',
      handler: 'refresh',
      position: 'header',
    },
    {
      id: 'mark-all-read',
      label: 'Mark All Read',
      icon: 'check-check',
      type: 'mutation',
      config: { type: 'mutation', procedure: 'approvals.markAllRead' },
      position: 'header',
    },
  ],
  
  keyboardShortcuts: [
    { key: 'r', action: 'refresh', description: 'Refresh approvals' },
    { key: 'a', action: 'modal:approval-decision:approved', description: 'Quick approve' },
    { key: 'j', action: 'modal:approval-decision:rejected', description: 'Quick reject' },
    { key: 'Enter', action: 'view-selected', description: 'View details' },
    { key: 'g p', action: 'navigate:/employee/manager/pod', description: 'Go to Pod Dashboard' },
  ],
};

