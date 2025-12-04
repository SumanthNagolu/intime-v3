import type { ScreenDefinition } from '@/lib/metadata/types';

export const benchDashboardScreen: ScreenDefinition = {
  id: 'bench-dashboard',
  type: 'dashboard',
  title: 'Bench Dashboard',
  icon: 'LayoutDashboard',

  layout: {
    type: 'single-column',
    sections: [
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        widgets: [
          {
            id: 'total-bench',
            type: 'metric-card',
            label: 'Total on Bench',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'bench.countConsultants',
                params: { status: 'on_bench' }
              }
            },
            config: { icon: 'Users', trend: { field: 'delta', positiveColor: 'green' } }
          },
          {
            id: 'utilization',
            type: 'metric-card',
            label: 'Bench Utilization',
            dataSource: {
              type: 'query',
              query: 'bench.getUtilization'
            },
            config: { format: { type: 'percentage' } }
          },
          {
            id: 'placements-sprint',
            type: 'metric-card',
            label: 'Sprint Placements',
            dataSource: {
              type: 'list',
              entityType: 'placement',
              filter: { period: 'current_sprint' }
            }
          },
          {
            id: 'avg-days',
            type: 'metric-card',
            label: 'Avg Days on Bench',
            dataSource: {
              type: 'query',
              query: 'bench.getAverageDaysOnBench'
            }
          }
        ]
      },
      {
        id: 'recent-activity',
        type: 'timeline',
        title: 'Recent Bench Activity',
        dataSource: { type: 'list', entityType: 'activity', filter: { category: 'bench' }, limit: 10 }
      }
    ]
  }
};

export const benchListScreen: ScreenDefinition = {
  id: 'bench-list',
  type: 'list',
  entityType: 'consultant',
  title: 'My Consultants',
  icon: 'Users',

  dataSource: {
    type: 'list',
    entityType: 'consultant',
    pagination: true,
    filter: { assignedTo: { type: 'context', path: 'user.id' } }
  },

  layout: {
    type: 'single-column',
    sections: [
      {
        id: 'consultant-table',
        type: 'table',
        columns_config: [
          { id: 'name', header: 'Name', path: 'candidate.fullName', sortable: true },
          { id: 'title', header: 'Title', path: 'candidate.professionalHeadline' },
          { id: 'days', header: 'Days on Bench', path: 'daysOnBench', sortable: true, type: 'number-display' },
          { id: 'status', header: 'Status', path: 'status', type: 'status-badge' },
          { id: 'visa', header: 'Visa', path: 'visaType' },
          { id: 'location', header: 'Location', path: 'candidate.location' },
        ],
        actions: [
          { id: 'view', label: 'View Profile', type: 'navigate', config: { type: 'navigate', route: 'bench-detail', params: { id: { type: 'context', path: 'id' } } } },
          { id: 'add-to-hotlist', label: 'Add to Hotlist', type: 'modal', config: { type: 'modal', modal: 'add-to-hotlist', props: { consultantId: { type: 'context', path: 'id' } } } }
        ]
      }
    ]
  },

  actions: [
    {
      id: 'add-consultant',
      label: 'Add Consultant',
      type: 'navigate',
      icon: 'UserPlus',
      variant: 'primary',
      config: { type: 'navigate', route: 'consultant-create' } // Using shared candidate create or specialized? Let's assume separate flow or parameter
    }
  ]
};

