import type { ScreenDefinition } from '@/lib/metadata/types';

export const hrDashboardScreen: ScreenDefinition = {
  id: 'hr-dashboard',
  type: 'dashboard',
  title: 'HR Dashboard',
  icon: 'Users',

  layout: {
    type: 'single-column',
    sections: [
      {
        id: 'hr-metrics',
        type: 'metrics-grid',
        columns: 4,
        widgets: [
          {
            id: 'total-employees',
            type: 'metric-card',
            label: 'Total Employees',
            dataSource: { type: 'aggregate', entityType: 'user', method: 'count', filter: { role: 'employee', status: 'active' } }
          },
          {
            id: 'onboarding-pending',
            type: 'metric-card',
            label: 'Onboarding Pending',
            dataSource: { type: 'aggregate', entityType: 'onboarding_task', method: 'count', filter: { status: 'pending' } },
            config: { bgColor: 'blue-50', iconColor: 'blue-500' }
          },
          {
            id: 'compliance-alerts',
            type: 'metric-card',
            label: 'Compliance Alerts',
            dataSource: { type: 'aggregate', entityType: 'compliance_alert', method: 'count', filter: { status: 'active' } },
            config: { bgColor: 'red-50', iconColor: 'red-500', icon: 'AlertTriangle' }
          },
          {
            id: 'upcoming-reviews',
            type: 'metric-card',
            label: 'Reviews Due',
            dataSource: { type: 'aggregate', entityType: 'performance_review', method: 'count', filter: { dueDate: { op: 'lte', value: 'next_30_days' } } }
          }
        ]
      },
      {
        id: 'onboarding-pipeline',
        type: 'table', // Or Kanban ideally
        title: 'Onboarding Pipeline',
        dataSource: { type: 'list', entityType: 'user', filter: { onboardingStatus: 'in_progress' } },
        columns_config: [
          { id: 'name', header: 'Name', path: 'fullName' },
          { id: 'role', header: 'Role', path: 'title' },
          { id: 'start-date', header: 'Start Date', path: 'employeeHireDate', type: 'date' },
          { id: 'progress', header: 'Progress', path: 'onboardingProgress', type: 'progress-display' }
        ]
      }
    ]
  }
};

export const employeeListScreen: ScreenDefinition = {
  id: 'employee-list',
  type: 'list',
  entityType: 'user', // Assuming generic user entity with filters
  title: 'Employee Directory',
  icon: 'Contact',

  dataSource: {
    type: 'list',
    entityType: 'user',
    filter: { role: 'employee' },
    pagination: true,
    searchFields: ['firstName', 'lastName', 'email', 'title']
  },

  layout: {
    type: 'single-column',
    sections: [
      {
        id: 'employee-table',
        type: 'table',
        columns_config: [
          { id: 'name', header: 'Name', path: 'fullName', sortable: true },
          { id: 'title', header: 'Title', path: 'title' },
          { id: 'dept', header: 'Department', path: 'employeeDepartment' },
          { id: 'email', header: 'Email', path: 'email', type: 'email-display' },
          { id: 'status', header: 'Status', path: 'employeeStatus', type: 'status-badge' },
        ],
        actions: [
          { id: 'view', label: 'View Profile', type: 'navigate', config: { type: 'navigate', route: 'employee-detail', params: { id: { type: 'context', path: 'id' } } } }
        ]
      }
    ]
  },

  actions: [
    {
      id: 'add-employee',
      label: 'Add Employee',
      type: 'navigate',
      icon: 'UserPlus',
      variant: 'primary',
      config: { type: 'navigate', route: 'employee-create' } // Or modal
    }
  ]
};

export const employeeDetailScreen: ScreenDefinition = {
  id: 'employee-detail',
  type: 'detail',
  entityType: 'user',
  title: { type: 'field', path: 'fullName' },
  subtitle: { type: 'field', path: 'title' },

  dataSource: {
    type: 'entity',
    entityType: 'user',
    entityId: { type: 'param', path: 'id' }
  },

  layout: {
    type: 'sidebar-main',
    sidebar: {
      type: 'info-card',
      title: 'At a Glance',
      fields: [
        { type: 'field', path: 'email', label: 'Email' },
        { type: 'field', path: 'phone', label: 'Phone' },
        { type: 'field', path: 'employeeDepartment', label: 'Department' },
        { type: 'field', path: 'employeeManager.fullName', label: 'Manager' },
        { type: 'field', path: 'employeeHireDate', label: 'Start Date', format: { type: 'date' } }
      ]
    },
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        sections: [
          {
            id: 'personal-info',
            type: 'input-set',
            title: 'Personal Information',
            inputSet: 'EmployeePersonalInfo', // Need to define this
            readOnly: true
          }
        ]
      },
      {
        id: 'compensation',
        label: 'Compensation',
        permissions: [{ action: 'view', resource: 'compensation' }], // Restricted tab
        sections: [
          {
            id: 'salary-info',
            type: 'info-card',
            title: 'Current Compensation',
            fields: [
              { type: 'field', path: 'employeeSalary', label: 'Base Salary', widget: 'CurrencyDisplay' },
              { type: 'field', path: 'bonusTarget', label: 'Bonus Target', widget: 'CurrencyDisplay' }
            ]
          }
        ]
      },
      {
        id: 'documents',
        label: 'Documents',
        sections: [
          {
            id: 'compliance-docs',
            type: 'list',
            title: 'Compliance Documents',
            dataSource: { type: 'related', relation: 'complianceDocuments' },
            columns_config: [
              { id: 'name', header: 'Document', path: 'documentName' },
              { id: 'status', header: 'Status', path: 'status', type: 'status-badge' },
              { id: 'date', header: 'Date', path: 'submittedAt', type: 'date' }
            ]
          }
        ]
      }
    ]
  },

  actions: [
    {
      id: 'edit',
      label: 'Edit',
      type: 'navigate',
      config: { type: 'navigate', route: 'employee-edit', params: { id: { type: 'context', path: 'id' } } }
    }
  ]
};

