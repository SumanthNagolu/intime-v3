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
              label: 'Pending',
              value: { type: 'field', path: 'counts.pending' },
              icon: 'clock',
              color: 'warning',
            },
            {
              id: 'urgent',
              label: 'Urgent',
              value: { type: 'field', path: 'counts.urgent' },
              icon: 'alert-triangle',
              color: 'destructive',
            },
            {
              id: 'overdue',
              label: 'Overdue',
              value: { type: 'field', path: 'counts.overdue' },
              icon: 'x-circle',
              color: 'destructive',
            },
            {
              id: 'approved-today',
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
          filterable: true,
          searchable: true,
          columns: [
            {
              id: 'urgency-indicator',
              header: '',
              field: 'urgency',
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
              field: 'approvalType',
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
              field: 'subject',
              type: 'link',
              linkPattern: '/employee/manager/approvals/{{id}}',
              primary: true,
            },
            {
              id: 'reason',
              header: 'Reason',
              field: 'reason',
              type: 'text',
              truncate: 50,
            },
            {
              id: 'requester',
              header: 'Requester',
              field: 'requesterName',
              type: 'user',
            },
            {
              id: 'financial-impact',
              header: 'Impact',
              field: 'financialSummary',
              type: 'custom',
              component: 'FinancialImpactCell',
            },
            {
              id: 'requested',
              header: 'Requested',
              field: 'requestedAt',
              type: 'relative-time',
              sortable: true,
            },
            {
              id: 'due',
              header: 'Due',
              field: 'dueBy',
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
                  variant: 'success',
                  action: { type: 'modal', modalId: 'approval-decision', defaultDecision: 'approved' },
                },
                {
                  id: 'quick-reject',
                  label: 'Reject',
                  icon: 'x',
                  variant: 'destructive',
                  action: { type: 'modal', modalId: 'approval-decision', defaultDecision: 'rejected' },
                },
                {
                  id: 'view-details',
                  label: 'Review Details',
                  icon: 'eye',
                  action: { type: 'navigate', path: '/employee/manager/approvals/{{id}}' },
                },
              ],
              width: '150px',
            },
          ],
          rowActions: [
            {
              id: 'swipe-approve',
              trigger: 'swipe-right',
              action: { type: 'modal', modalId: 'approval-decision', defaultDecision: 'approved' },
            },
            {
              id: 'swipe-reject',
              trigger: 'swipe-left',
              action: { type: 'modal', modalId: 'approval-decision', defaultDecision: 'rejected' },
            },
          ],
        },
      ],
    },
  },
  
  modals: [
    {
      id: 'approval-decision',
      title: 'Approval Decision',
      size: 'large',
      sections: [
        {
          id: 'approval-summary',
          type: 'info-card',
          fields: [
            { id: 'subject', label: 'Subject', path: 'selected.subject' },
            { id: 'type', label: 'Type', path: 'selected.approvalType' },
            { id: 'requester', label: 'Requester', path: 'selected.requesterName' },
            { id: 'reason', label: 'Approval Reason', path: 'selected.reason' },
          ],
        },
        {
          id: 'financial-details',
          type: 'info-card',
          title: 'Financial Details',
          visible: {
            type: 'condition',
            condition: { operator: 'in', field: 'selected.approvalType', value: ['submission', 'offer', 'contract'] },
          },
          fields: [
            { id: 'payRate', label: 'Pay Rate', path: 'selected.payRate', format: 'currency' },
            { id: 'billRate', label: 'Bill Rate', path: 'selected.billRate', format: 'currency' },
            { id: 'margin', label: 'Gross Margin', path: 'selected.margin', format: 'percentage' },
            { id: 'targetMargin', label: 'Target Margin', path: 'selected.targetMargin', format: 'percentage' },
            { id: 'annualRevenue', label: 'Est. Annual Revenue', path: 'selected.annualRevenue', format: 'currency' },
          ],
        },
        {
          id: 'ic-justification',
          type: 'info-card',
          title: 'IC Justification',
          fields: [
            { id: 'justification', label: '', path: 'selected.justification', type: 'long-text' },
          ],
        },
        {
          id: 'decision-form',
          type: 'form',
          title: 'Your Decision',
          fields: [
            {
              id: 'decision',
              name: 'decision',
              label: 'Decision',
              type: 'radio-group',
              required: true,
              options: [
                { value: 'approved', label: 'Approve', description: 'Proceed with submission as-is' },
                { value: 'conditional', label: 'Approve with Conditions', description: 'Approve only if specific conditions are met' },
                { value: 'rejected', label: 'Reject', description: 'Do not proceed, provide feedback to IC' },
                { value: 'escalated', label: 'Escalate', description: 'Need additional guidance or authority' },
              ],
            },
            {
              id: 'comments',
              name: 'comments',
              label: 'Comments / Feedback',
              type: 'textarea',
              required: true,
              placeholder: 'Provide feedback for the IC...',
              validation: {
                minLength: { value: 10, message: 'Please provide detailed feedback' },
              },
            },
            {
              id: 'conditions',
              name: 'conditions',
              label: 'Conditions',
              type: 'textarea',
              visible: {
                type: 'condition',
                condition: { operator: 'eq', field: 'decision', value: 'conditional' },
              },
              required: true,
              placeholder: 'Specify conditions that must be met...',
            },
            {
              id: 'escalateTo',
              name: 'escalateTo',
              label: 'Escalate To',
              type: 'select',
              visible: {
                type: 'condition',
                condition: { operator: 'eq', field: 'decision', value: 'escalated' },
              },
              options: [
                { value: 'regional_director', label: 'Regional Director' },
                { value: 'cfo', label: 'CFO' },
                { value: 'ceo', label: 'CEO' },
              ],
            },
          ],
          actions: [
            {
              id: 'cancel',
              label: 'Cancel',
              variant: 'outline',
              action: { type: 'close-modal' },
            },
            {
              id: 'submit-decision',
              label: 'Submit Decision',
              variant: 'default',
              action: {
                type: 'mutation',
                mutation: 'approvals.decide',
                params: {
                  approvalId: { type: 'field', path: 'selected.id' },
                },
                onSuccess: { type: 'close-modal', refresh: true },
              },
            },
          ],
        },
      ],
    },
  ],
  
  actions: [
    {
      id: 'refresh',
      label: 'Refresh',
      icon: 'refresh-cw',
      action: { type: 'refresh' },
      position: 'header',
    },
    {
      id: 'mark-all-read',
      label: 'Mark All Read',
      icon: 'check-check',
      action: { type: 'mutation', mutation: 'approvals.markAllRead' },
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

