/**
 * Bench Consultant List Screen
 * 
 * List of bench consultants with:
 * - Status filtering (green, yellow, orange, red)
 * - Visa status filtering
 * - Days on bench indicators
 * - Quick actions (marketing, submit, contact)
 * 
 * @see docs/specs/20-USER-ROLES/02-bench-sales/02-manage-bench.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const consultantListScreen: ScreenDefinition = {
  id: 'consultant-list',
  type: 'list',
  entityType: 'bench_consultant',
  title: 'Bench Consultants',
  icon: 'Users',

  dataSource: {
    type: 'list',
    entityType: 'bench_consultant',
    pagination: true,
    pageSize: 25,
    sort: { field: 'days_on_bench', direction: 'desc' },
    include: ['skills', 'visaDetails', 'activeSubmissions', 'lastActivity'],
  },

  layout: {
    type: 'single-column',
    sections: [
      // Status Summary Bar
      {
        id: 'status-summary',
        type: 'custom',
        component: 'BenchStatusSummary',
        componentProps: {
          badges: [
            { id: 'all', label: 'All', filter: {} },
            { id: 'green', label: '🟢 Green (0-15 days)', filter: { benchStatus: 'green' }, color: 'green' },
            { id: 'yellow', label: '🟡 Yellow (16-30)', filter: { benchStatus: 'yellow' }, color: 'yellow' },
            { id: 'orange', label: '🟠 Orange (31-60)', filter: { benchStatus: 'orange' }, color: 'orange' },
            { id: 'red', label: '🔴 Red (61-90)', filter: { benchStatus: 'red' }, color: 'red' },
            { id: 'black', label: '⚫ Black (91+)', filter: { benchStatus: 'black' }, color: 'gray' },
          ],
          showCounts: true,
        },
      },

      // Filters
      {
        id: 'filters',
        type: 'form',
        inline: true,
        fields: [
          {
            id: 'search',
            type: 'text',
            path: 'filters.search',
            placeholder: 'Search consultants...',
            config: { icon: 'Search' },
          },
          {
            id: 'skills',
            type: 'tags',
            path: 'filters.skills',
            label: 'Skills',
            placeholder: 'Any skills',
            config: { suggestions: true },
          },
          {
            id: 'visa-status',
            type: 'multiselect',
            path: 'filters.visaStatus',
            label: 'Visa Status',
            options: [
              { value: 'us_citizen', label: 'US Citizen' },
              { value: 'green_card', label: 'Green Card' },
              { value: 'h1b', label: 'H-1B' },
              { value: 'opt', label: 'OPT' },
              { value: 'opt_stem', label: 'OPT STEM' },
              { value: 'l1', label: 'L-1' },
              { value: 'tn_visa', label: 'TN Visa' },
              { value: 'h4_ead', label: 'H4-EAD' },
              { value: 'canada_pr', label: 'Canada PR' },
              { value: 'canada_owp', label: 'Canada OWP' },
            ],
          },
          {
            id: 'location',
            type: 'text',
            path: 'filters.location',
            label: 'Location',
            placeholder: 'City or State',
          },
          {
            id: 'rate-range',
            type: 'number-range',
            path: 'filters.rateRange',
            label: 'Rate Range',
            config: { prefix: '$', suffix: '/hr' },
          },
          {
            id: 'owner',
            type: 'select',
            path: 'filters.ownerId',
            label: 'Assigned To',
            placeholder: 'All Owners',
            optionsSource: { type: 'entity', entityType: 'user', filter: { role: 'bench_sales' } },
          },
          {
            id: 'available-only',
            type: 'boolean',
            path: 'filters.availableOnly',
            label: 'Available Only',
            config: { helpText: 'Hide placed consultants' },
          },
        ],
      },

      // Consultant Table
      {
        id: 'consultant-table',
        type: 'table',
        columns_config: [
          { 
            id: 'bench-status',
            header: '',
            path: 'benchStatus',
            type: 'bench-status-indicator',
            width: '40px',
          },
          { 
            id: 'name', 
            header: 'Name', 
            path: 'fullName', 
            sortable: true,
            width: '18%',
            config: { 
              link: true, 
              linkPath: '/employee/workspace/bench/consultants/{{id}}',
              avatar: true,
              avatarPath: 'avatarUrl',
            },
          },
          { 
            id: 'title', 
            header: 'Title', 
            path: 'title',
            width: '15%',
          },
          { 
            id: 'days-on-bench', 
            header: 'Days on Bench', 
            path: 'daysOnBench',
            type: 'days-on-bench-badge',
            sortable: true,
          },
          { 
            id: 'location', 
            header: 'Location', 
            path: 'location',
          },
          { 
            id: 'visa', 
            header: 'Visa', 
            path: 'visaStatus', 
            type: 'visa-badge',
            config: { showExpiry: true },
          },
          { 
            id: 'rate', 
            header: 'Rate', 
            path: 'rate',
            type: 'currency',
            config: { suffix: '/hr' },
            sortable: true,
          },
          { 
            id: 'skills', 
            header: 'Skills', 
            path: 'skills', 
            type: 'tags-preview',
            config: { maxTags: 3 },
          },
          { 
            id: 'active-subs', 
            header: 'Active Subs', 
            path: 'activeSubmissionsCount',
            type: 'number',
            sortable: true,
          },
          { 
            id: 'last-contact', 
            header: 'Last Contact', 
            path: 'lastContactAt',
            type: 'relative-time',
            sortable: true,
            config: { warnIfStale: 4 },
          },
          { 
            id: 'owner', 
            header: 'Owner', 
            path: 'owner.name',
            type: 'user-avatar',
          },
        ],
        selectable: true,
        rowClick: { type: 'navigate', route: '/employee/workspace/bench/consultants/{{id}}' },
        rowActions: [
          { id: 'view', label: 'View', icon: 'Eye', type: 'navigate', config: { route: '/employee/workspace/bench/consultants/{{id}}' } },
          { id: 'marketing', label: 'Add to Hotlist', icon: 'Megaphone', type: 'modal', config: { modal: 'add-to-hotlist' } },
          { id: 'submit', label: 'Submit', icon: 'Send', type: 'modal', config: { modal: 'bench-submission-create' } },
          { id: 'contact', label: 'Contact', icon: 'Phone', type: 'function', config: { handler: 'initiateCall' } },
          { id: 'log', label: 'Log Activity', icon: 'Plus', type: 'modal', config: { modal: 'log-activity' } },
        ],
        emptyState: {
          title: 'No consultants found',
          description: 'Add consultants to your bench to start marketing',
          action: {
            label: 'Add Consultant',
            type: 'modal',
            config: { type: 'modal', modal: 'consultant-create' },
          },
        },
      },
    ],
  },

  actions: [
    {
      id: 'add-consultant',
      label: 'Add Consultant',
      type: 'modal',
      icon: 'UserPlus',
      variant: 'primary',
      config: { type: 'modal', modal: 'consultant-create' },
    },
    {
      id: 'import',
      label: 'Import',
      type: 'modal',
      icon: 'Upload',
      variant: 'default',
      config: { type: 'modal', modal: 'consultant-import' },
    },
    {
      id: 'bulk-hotlist',
      label: 'Create Hotlist',
      type: 'modal',
      icon: 'FileText',
      variant: 'default',
      config: { type: 'modal', modal: 'create-hotlist-bulk' },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'bulk-assign',
      label: 'Assign Owner',
      type: 'modal',
      icon: 'Users',
      variant: 'default',
      config: { type: 'modal', modal: 'bulk-assign' },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'function',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'function', handler: 'exportConsultants' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Bench Sales', route: '/employee/workspace/bench' },
      { label: 'Consultants', active: true },
    ],
  },
};

export default consultantListScreen;

