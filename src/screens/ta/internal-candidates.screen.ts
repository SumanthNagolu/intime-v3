/**
 * Internal Candidates Screen Definition
 *
 * All internal candidates across jobs with:
 * - Pipeline/Kanban view
 * - Table view with filtering
 * - Cross-job candidate tracking
 *
 * Routes: /employee/workspace/ta/internal-candidates
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import { INTERNAL_CANDIDATE_STAGE_OPTIONS } from '@/lib/metadata/options/ta-options';

// ==========================================
// TABLE COLUMNS
// ==========================================

const candidateTableColumns = [
  {
    id: 'name',
    header: 'Candidate',
    accessor: 'name',
    type: 'composite',
    sortable: true,
    width: '200px',
    config: {
      primary: { path: 'name' },
      secondary: { path: 'currentRole' },
      avatar: { path: 'name', type: 'initials' },
    },
  },
  {
    id: 'job',
    header: 'Position',
    accessor: 'jobTitle',
    type: 'text',
    sortable: true,
  },
  {
    id: 'stage',
    header: 'Stage',
    accessor: 'stage',
    type: 'enum',
    sortable: true,
    config: {
      options: INTERNAL_CANDIDATE_STAGE_OPTIONS,
      badgeColors: {
        applied: 'blue',
        screening: 'cyan',
        interview: 'amber',
        offer: 'purple',
        hired: 'green',
        rejected: 'red',
      },
    },
  },
  {
    id: 'source',
    header: 'Source',
    accessor: 'source',
    type: 'text',
  },
  {
    id: 'appliedAt',
    header: 'Applied',
    accessor: 'appliedAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
  {
    id: 'nextInterview',
    header: 'Next Interview',
    accessor: 'nextInterviewDate',
    type: 'date',
    sortable: true,
    config: { format: 'short' },
  },
  {
    id: 'hiringManager',
    header: 'Hiring Manager',
    accessor: 'hiringManagerName',
    type: 'text',
  },
  {
    id: 'recruiter',
    header: 'Recruiter',
    accessor: 'recruiterName',
    type: 'text',
  },
];

// ==========================================
// PIPELINE CONFIGURATION
// ==========================================

const pipelineConfig = {
  stages: INTERNAL_CANDIDATE_STAGE_OPTIONS.filter(s => !['hired', 'rejected'].includes(s.value)),
  closedStages: ['hired', 'rejected'],
  cardConfig: {
    titlePath: 'name',
    subtitlePath: 'currentRole',
    avatarPath: 'name',
    badges: [
      { path: 'source', type: 'text' },
    ],
    footer: {
      leftPath: 'appliedAt',
      leftFormat: 'relative',
      rightPath: 'jobTitle',
    },
  },
  onDragEnd: {
    mutation: 'ta.internalCandidates.updateStage',
    inputMapping: {
      candidateId: 'id',
      stage: 'newStage',
    },
  },
};

// ==========================================
// INTERNAL CANDIDATES SCREEN
// ==========================================

export const internalCandidatesScreen: ScreenDefinition = {
  id: 'internal-candidates',
  type: 'list',
  entityType: 'internalCandidate',
  title: 'All Internal Candidates',
  subtitle: 'Track candidates across all internal job postings',
  icon: 'Users',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.internalCandidates.listAll',
      params: {},
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Metrics Row
      {
        id: 'candidate-metrics',
        type: 'metrics-grid',
        columns: 6,
        widgets: [
          {
            id: 'total',
            type: 'metric',
            label: 'Total',
            path: 'stats.total',
            config: { icon: 'Users' },
          },
          {
            id: 'applied',
            type: 'metric',
            label: 'Applied',
            path: 'stats.applied',
            config: { icon: 'FileText', variant: 'blue' },
          },
          {
            id: 'screening',
            type: 'metric',
            label: 'Screening',
            path: 'stats.screening',
            config: { icon: 'Search', variant: 'cyan' },
          },
          {
            id: 'interviewing',
            type: 'metric',
            label: 'Interview',
            path: 'stats.interview',
            config: { icon: 'Calendar', variant: 'amber' },
          },
          {
            id: 'offer',
            type: 'metric',
            label: 'Offer',
            path: 'stats.offer',
            config: { icon: 'FileCheck', variant: 'purple' },
          },
          {
            id: 'hired-mtd',
            type: 'metric',
            label: 'Hired (MTD)',
            path: 'stats.hiredMTD',
            config: { icon: 'CheckCircle', variant: 'green' },
          },
        ],
      },

      // Filters
      {
        id: 'filters',
        type: 'field-grid',
        inline: true,
        columns: 4,
        fields: [
          {
            id: 'search',
            type: 'search',
            placeholder: 'Search candidates...',
            config: { fields: ['name', 'email', 'currentRole'] },
          },
          {
            id: 'stage',
            type: 'multi-select',
            label: 'Stage',
            options: INTERNAL_CANDIDATE_STAGE_OPTIONS,
          },
          {
            id: 'job',
            type: 'async-select',
            label: 'Job',
            config: {
              procedure: 'ta.internalJobs.listForSelect',
              labelPath: 'title',
              valuePath: 'id',
            },
          },
          {
            id: 'dateRange',
            type: 'date-range',
            label: 'Applied',
          },
        ],
      },

      // View Toggle
      {
        id: 'candidates-view',
        type: 'custom',
        component: 'ViewToggleContainer',
        componentProps: {
          views: ['pipeline', 'table'],
          defaultView: 'pipeline',
          pipelineConfig,
          tableConfig: {
            columns: candidateTableColumns,
            selectable: true,
            rowClick: {
              type: 'modal',
              modal: 'candidate-detail',
            },
          },
        },
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'add-candidate',
      type: 'modal',
      label: 'Add Candidate',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'add-internal-candidate' },
    },
    {
      id: 'export',
      type: 'custom',
      label: 'Export',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'custom', handler: 'handleExportCandidates' },
    },
  ],

  // Bulk Actions
  bulkActions: [
    {
      id: 'bulk-advance',
      type: 'modal',
      label: 'Advance Stage',
      icon: 'ArrowRight',
      config: { type: 'modal', modal: 'bulk-advance-stage' },
    },
    {
      id: 'bulk-schedule',
      type: 'modal',
      label: 'Schedule Interviews',
      icon: 'Calendar',
      config: { type: 'modal', modal: 'bulk-schedule-interviews' },
    },
    {
      id: 'bulk-reject',
      type: 'modal',
      label: 'Reject',
      icon: 'X',
      variant: 'destructive',
      config: { type: 'modal', modal: 'bulk-reject-candidates' },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Internal Candidates' },
    ],
  },

  // Keyboard Shortcuts
  keyboard_shortcuts: [
    { key: 'n', action: 'add-candidate', description: 'Add candidate' },
    { key: 'p', action: 'toggle-pipeline', description: 'Toggle pipeline view' },
    { key: 't', action: 'toggle-table', description: 'Toggle table view' },
    { key: '/', action: 'focus-search', description: 'Focus search' },
  ],
};

export default internalCandidatesScreen;
