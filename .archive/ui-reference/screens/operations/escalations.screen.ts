/**
 * Escalations Screen Definition
 * 
 * Allows managers to handle escalated issues requiring intervention.
 * 
 * @see docs/specs/20-USER-ROLES/04-manager/03-handle-escalation.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const escalationsScreen: ScreenDefinition = {
  id: 'manager-escalations',
  type: 'list-detail',
  entityType: 'escalation',
  title: 'Escalations Queue',
  description: 'Handle escalated issues requiring manager intervention',
  
  dataSource: {
    type: 'query',
    query: 'escalations.listForManager',
    params: {
      managerId: { type: 'context', path: 'user.id' },
    },
  },
  
  layout: {
    type: 'tabs',
    tabs: [
      {
        id: 'urgent',
        label: 'Urgent',
        badge: { type: 'field', path: 'counts.urgent' },
        sections: [
          {
            id: 'urgent-list',
            type: 'table',
            title: 'Urgent Escalations',
            emptyMessage: 'No urgent escalations',
            dataSource: {
              type: 'field',
              path: 'urgentEscalations',
            },
            columns_config: [
              {
                id: 'priority',
                header: 'Priority',
                path: 'priority',
                type: 'badge',
                options: [
                  { value: 'critical', label: 'CRITICAL', color: 'destructive' },
                  { value: 'high', label: 'HIGH', color: 'warning' },
                  { value: 'medium', label: 'MEDIUM', color: 'info' },
                ],
                width: '100px',
              },
              {
                id: 'issue',
                header: 'Issue',
                accessor: 'subject',
                type: 'link',
                config: { linkPattern: '/employee/manager/escalations/{{id}}' },
              },
              {
                id: 'category',
                header: 'Category',
                accessor: 'category',
                type: 'text',
              },
              {
                id: 'reporter',
                header: 'Reporter',
                accessor: 'reporterName',
                type: 'user',
              },
              {
                id: 'account',
                header: 'Account',
                accessor: 'accountName',
                type: 'link',
                config: { linkPattern: '/employee/crm/accounts/{{accountId}}' },
              },
              {
                id: 'age',
                header: 'Age',
                accessor: 'createdAt',
                type: 'relative-time',
              },
              {
                id: 'sla',
                header: 'SLA',
                accessor: 'slaStatus',
                type: 'badge',
                options: [
                  { value: 'within', label: 'Within SLA', color: 'success' },
                  { value: 'warning', label: 'Warning', color: 'warning' },
                  { value: 'breached', label: 'Breached', color: 'destructive' },
                ],
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                actions: [
                  {
                    id: 'take-ownership',
                    label: 'Take Ownership',
                    icon: 'user-check',
                    type: 'mutation',
                    config: { type: 'mutation', procedure: 'escalations.takeOwnership' },
                    visible: {
                      type: 'condition',
                      condition: { operator: 'eq', field: 'status', value: 'pending' },
                    },
                  },
                  {
                    id: 'view-details',
                    label: 'View Details',
                    icon: 'eye',
                    type: 'navigate',
                    config: { type: 'navigate', route: '/employee/manager/escalations/{{id}}' },
                  },
                ],
                width: '100px',
              },
            ],
          },
        ],
      },
      {
        id: 'pending',
        label: 'All Pending',
        badge: { type: 'field', path: 'counts.pending' },
        sections: [
          {
            id: 'pending-list',
            type: 'table',
            title: 'Pending Escalations',
            dataSource: {
              type: 'field',
              path: 'pendingEscalations',
            },
            columns_config: [
              {
                id: 'priority',
                header: 'Priority',
                path: 'priority',
                type: 'badge',
                options: [
                  { value: 'critical', label: 'CRITICAL', color: 'destructive' },
                  { value: 'high', label: 'HIGH', color: 'warning' },
                  { value: 'medium', label: 'MEDIUM', color: 'info' },
                  { value: 'low', label: 'LOW', color: 'muted' },
                ],
              },
              {
                id: 'issue',
                header: 'Issue',
                accessor: 'subject',
                type: 'link',
                config: { linkPattern: '/employee/manager/escalations/{{id}}' },
              },
              {
                id: 'category',
                header: 'Category',
                accessor: 'category',
                type: 'text',
              },
              {
                id: 'reporter',
                header: 'Reporter',
                accessor: 'reporterName',
                type: 'user',
              },
              {
                id: 'status',
                header: 'Status',
                accessor: 'status',
                type: 'badge',
                options: [
                  { value: 'pending', label: 'Pending', color: 'warning' },
                  { value: 'in_progress', label: 'In Progress', color: 'info' },
                  { value: 'waiting', label: 'Waiting', color: 'muted' },
                ],
              },
              {
                id: 'age',
                header: 'Age',
                accessor: 'createdAt',
                type: 'relative-time',
              },
              {
                id: 'owner',
                header: 'Owner',
                accessor: 'ownerName',
                type: 'user',
              },
            ],
          },
        ],
      },
      {
        id: 'in-progress',
        label: 'In Progress',
        badge: { type: 'field', path: 'counts.inProgress' },
        sections: [
          {
            id: 'in-progress-list',
            type: 'table',
            title: 'In Progress',
            emptyMessage: 'No escalations in progress',
            dataSource: {
              type: 'field',
              path: 'inProgressEscalations',
            },
            columns_config: [
              {
                id: 'issue',
                header: 'Issue',
                path: 'subject',
                type: 'link',
                config: { linkPattern: '/employee/manager/escalations/{{id}}' },
              },
              {
                id: 'category',
                header: 'Category',
                accessor: 'category',
                type: 'text',
              },
              {
                id: 'owner',
                header: 'Owner',
                accessor: 'ownerName',
                type: 'user',
              },
              {
                id: 'startedAt',
                header: 'Started',
                accessor: 'assignedAt',
                type: 'relative-time',
              },
              {
                id: 'lastAction',
                header: 'Last Action',
                accessor: 'lastActionAt',
                type: 'relative-time',
              },
              {
                id: 'nextSteps',
                header: 'Next Steps',
                accessor: 'nextSteps',
                type: 'text',
              },
            ],
          },
        ],
      },
      {
        id: 'resolved',
        label: 'Resolved',
        badge: { type: 'field', path: 'counts.resolved' },
        sections: [
          {
            id: 'resolved-list',
            type: 'table',
            title: 'Recently Resolved',
            description: 'Escalations resolved in the last 30 days',
            dataSource: {
              type: 'field',
              path: 'resolvedEscalations',
            },
            columns_config: [
              {
                id: 'issue',
                header: 'Issue',
                path: 'subject',
                type: 'link',
                config: { linkPattern: '/employee/manager/escalations/{{id}}' },
              },
              {
                id: 'category',
                header: 'Category',
                accessor: 'category',
                type: 'text',
              },
              {
                id: 'resolvedBy',
                header: 'Resolved By',
                accessor: 'resolvedByName',
                type: 'user',
              },
              {
                id: 'resolvedAt',
                header: 'Resolved',
                accessor: 'resolvedAt',
                type: 'relative-time',
              },
              {
                id: 'resolutionTime',
                header: 'Resolution Time',
                accessor: 'resolutionTime',
                type: 'duration',
              },
              {
                id: 'outcome',
                header: 'Outcome',
                accessor: 'outcome',
                type: 'badge',
                options: [
                  { value: 'resolved', label: 'Resolved', color: 'success' },
                  { value: 'escalated', label: 'Escalated Further', color: 'info' },
                  { value: 'withdrawn', label: 'Withdrawn', color: 'muted' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  
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
      id: 'export',
      label: 'Export Report',
      icon: 'download',
      type: 'export',
                    config: { type: 'download', url: '/api/export', filename: 'escalations.pdf' },
      position: 'header',
    },
  ],
  
  keyboardShortcuts: [
    { key: 'r', action: 'refresh', description: 'Refresh escalations' },
    { key: 'g p', action: 'navigate:/employee/manager/pod', description: 'Go to Pod Dashboard' },
    { key: '1', action: 'tab:urgent', description: 'View urgent escalations' },
    { key: '2', action: 'tab:pending', description: 'View all pending' },
    { key: '3', action: 'tab:in-progress', description: 'View in progress' },
  ],
};

