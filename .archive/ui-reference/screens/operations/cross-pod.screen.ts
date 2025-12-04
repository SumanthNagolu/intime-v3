/**
 * Cross-Pod Coordination Screen
 *
 * Allows manager to view other pods (read-only) and identify
 * cross-pollination opportunities and collaboration requests.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const crossPodScreen: ScreenDefinition = {
  id: 'cross-pod',
  type: 'dashboard',
  title: 'Cross-Pod Coordination',
  subtitle: 'Collaborate across pods',
  icon: 'Network',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'myPod', procedure: 'pod.getCurrent' },
      { key: 'otherPods', procedure: 'manager.getOtherPods' },
      { key: 'opportunities', procedure: 'manager.getCrossPollination' },
      { key: 'collaborationRequests', procedure: 'manager.getCollaborationRequests' },
      { key: 'sharedAccounts', procedure: 'manager.getSharedAccounts' },
    ],
  },

  layout: {
    type: 'tabs',
    tabs: [
      // ===========================================
      // TAB 1: CROSS-POLLINATION OPPORTUNITIES
      // ===========================================
      {
        id: 'opportunities',
        label: 'Opportunities',
        icon: 'Sparkles',
        badge: { type: 'field', path: 'opportunities.length' },
        sections: [
          {
            id: 'opportunities-intro',
            type: 'info-card',
            description: 'Cross-pollination opportunities identified from interactions. Target: 5+ opportunities per meaningful conversation.',
          },
          {
            id: 'opportunities-table',
            type: 'table',
            title: 'Identified Opportunities',
            dataSource: { type: 'field', path: 'opportunities' },
            columns_config: [
              {
                id: 'type',
                header: 'Type',
                path: 'opportunityType',
                type: 'enum',
                config: {
                  options: [
                    { value: 'training', label: 'Training (Academy)', color: 'purple' },
                    { value: 'recruiting', label: 'Recruiting', color: 'blue' },
                    { value: 'bench_sales', label: 'Bench Sales', color: 'green' },
                    { value: 'ta', label: 'Business Dev', color: 'orange' },
                    { value: 'hr', label: 'HR', color: 'pink' },
                  ],
                },
              },
              {
                id: 'title',
                header: 'Opportunity',
                path: 'title',
                type: 'text',
              },
              {
                id: 'source',
                header: 'Source',
                path: 'sourceDescription',
                type: 'text',
              },
              {
                id: 'identified-by',
                header: 'Identified By',
                path: 'identifiedBy.fullName',
                type: 'user',
              },
              {
                id: 'target-pod',
                header: 'Target Pod',
                path: 'targetPod.name',
                type: 'text',
              },
              {
                id: 'status',
                header: 'Status',
                path: 'status',
                type: 'enum',
                config: {
                  options: [
                    { value: 'new', label: 'New', color: 'blue' },
                    { value: 'shared', label: 'Shared', color: 'yellow' },
                    { value: 'accepted', label: 'Accepted', color: 'green' },
                    { value: 'declined', label: 'Declined', color: 'gray' },
                  ],
                },
              },
              {
                id: 'created-at',
                header: 'Created',
                path: 'createdAt',
                type: 'relative-time',
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                width: '120px',
                config: {
                  actions: [
                    {
                      id: 'share',
                      label: 'Share with Pod',
                      icon: 'Share',
                      type: 'modal',
                    config: { type: 'modal', modal: 'share-opportunity' },
                      visible: {
                        type: 'condition',
                        condition: { field: 'status', operator: 'eq', value: 'new' },
                      },
                    },
                    {
                      id: 'view',
                      label: 'View Details',
                      icon: 'Eye',
                      type: 'modal',
                    config: { type: 'modal', modal: 'view-opportunity' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },

      // ===========================================
      // TAB 2: COLLABORATION REQUESTS
      // ===========================================
      {
        id: 'collaboration',
        label: 'Collaboration',
        icon: 'Users2',
        badge: { type: 'field', path: 'collaborationRequests.pending' },
        sections: [
          {
            id: 'incoming-requests',
            type: 'table',
            title: 'Incoming Requests',
            description: 'Requests from other pods needing your team\'s help',
            dataSource: { type: 'field', path: 'collaborationRequests.incoming' },
            columns_config: [
              {
                id: 'from-pod',
                header: 'From Pod',
                path: 'fromPod.name',
                type: 'text',
              },
              {
                id: 'manager',
                header: 'Manager',
                path: 'fromManager.fullName',
                type: 'user',
              },
              {
                id: 'type',
                header: 'Type',
                path: 'requestType',
                type: 'enum',
                config: {
                  options: [
                    { value: 'candidate_share', label: 'Share Candidate', color: 'blue' },
                    { value: 'job_share', label: 'Share Job', color: 'green' },
                    { value: 'expertise', label: 'Expertise Needed', color: 'purple' },
                    { value: 'account_intro', label: 'Account Intro', color: 'orange' },
                  ],
                },
              },
              {
                id: 'description',
                header: 'Request',
                path: 'description',
                type: 'text',
              },
              {
                id: 'requested-at',
                header: 'Requested',
                path: 'createdAt',
                type: 'relative-time',
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                width: '150px',
                config: {
                  actions: [
                    {
                      id: 'accept',
                      label: 'Accept',
                      icon: 'Check',
                      type: 'modal',
                    config: { type: 'modal', modal: 'accept-collaboration' },
                    },
                    {
                      id: 'decline',
                      label: 'Decline',
                      icon: 'X',
                      type: 'modal',
                    config: { type: 'modal', modal: 'decline-collaboration' },
                    },
                  ],
                },
              },
            ],
          },
          {
            id: 'outgoing-requests',
            type: 'table',
            title: 'Outgoing Requests',
            description: 'Your requests to other pods',
            dataSource: { type: 'field', path: 'collaborationRequests.outgoing' },
            columns_config: [
              {
                id: 'to-pod',
                header: 'To Pod',
                path: 'toPod.name',
                type: 'text',
              },
              {
                id: 'type',
                header: 'Type',
                path: 'requestType',
                type: 'text',
              },
              {
                id: 'description',
                header: 'Request',
                path: 'description',
                type: 'text',
              },
              {
                id: 'status',
                header: 'Status',
                path: 'status',
                type: 'enum',
                config: {
                  options: [
                    { value: 'pending', label: 'Pending', color: 'yellow' },
                    { value: 'accepted', label: 'Accepted', color: 'green' },
                    { value: 'declined', label: 'Declined', color: 'red' },
                  ],
                },
              },
              {
                id: 'requested-at',
                header: 'Requested',
                path: 'createdAt',
                type: 'relative-time',
              },
            ],
            collapsible: true,
            defaultExpanded: false,
          },
        ],
      },

      // ===========================================
      // TAB 3: OTHER PODS (READ-ONLY VIEW)
      // ===========================================
      {
        id: 'other-pods',
        label: 'Other Pods',
        icon: 'Building2',
        sections: [
          {
            id: 'other-pods-note',
            type: 'info-card',
            description: 'Read-only view of other pods. Request collaboration for cross-pod items.',
          },
          {
            id: 'pods-grid',
            type: 'custom',
            component: 'PodsOverviewGrid',
            componentProps: {
              dataPath: 'otherPods',
              cardTemplate: {
                name: { type: 'field', path: 'name' },
                type: { type: 'field', path: 'type' },
                manager: { type: 'field', path: 'manager.fullName' },
                memberCount: { type: 'field', path: 'memberCount' },
                sprintProgress: { type: 'field', path: 'sprintProgress' },
                activeJobs: { type: 'field', path: 'activeJobs' },
                activeCandidates: { type: 'field', path: 'activeCandidates' },
              },
            },
          },
          {
            id: 'pods-summary-table',
            type: 'table',
            title: 'Pod Summary',
            dataSource: { type: 'field', path: 'otherPods' },
            columns_config: [
              {
                id: 'name',
                header: 'Pod',
                path: 'name',
                type: 'text',
              },
              {
                id: 'type',
                header: 'Type',
                path: 'type',
                type: 'enum',
                config: {
                  options: [
                    { value: 'recruiting', label: 'Recruiting', color: 'blue' },
                    { value: 'bench_sales', label: 'Bench Sales', color: 'green' },
                    { value: 'ta', label: 'Talent Acquisition', color: 'orange' },
                  ],
                },
              },
              {
                id: 'manager',
                header: 'Manager',
                path: 'manager.fullName',
                type: 'user',
              },
              {
                id: 'members',
                header: 'Members',
                path: 'memberCount',
                type: 'number',
              },
              {
                id: 'sprint-progress',
                header: 'Sprint Progress',
                path: 'sprintProgress',
                type: 'progress',
              },
              {
                id: 'placements',
                header: 'Placements (Sprint)',
                path: 'placements',
                type: 'number',
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                width: '100px',
                config: {
                  actions: [
                    {
                      id: 'request-collab',
                      label: 'Request Collaboration',
                      icon: 'MessageSquare',
                      type: 'modal',
                    config: { type: 'modal', modal: 'request-collaboration' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },

      // ===========================================
      // TAB 4: SHARED ACCOUNTS
      // ===========================================
      {
        id: 'shared-accounts',
        label: 'Shared Accounts',
        icon: 'Building',
        sections: [
          {
            id: 'shared-accounts-note',
            type: 'info-card',
            description: 'Accounts with activity from multiple pods. Coordinate to avoid conflicts.',
          },
          {
            id: 'shared-accounts-table',
            type: 'table',
            title: 'Accounts with Cross-Pod Activity',
            dataSource: { type: 'field', path: 'sharedAccounts' },
            columns_config: [
              {
                id: 'account',
                header: 'Account',
                path: 'name',
                type: 'link',
                config: { linkPattern: '/employee/crm/accounts/{{id}}' },
              },
              {
                id: 'pods',
                header: 'Pods Involved',
                path: 'pods',
                type: 'tag-list',
              },
              {
                id: 'active-jobs',
                header: 'Active Jobs',
                path: 'activeJobs',
                type: 'number',
              },
              {
                id: 'placements',
                header: 'Placements',
                path: 'placements',
                type: 'number',
              },
              {
                id: 'revenue-ytd',
                header: 'Revenue YTD',
                path: 'revenueYTD',
                type: 'currency',
              },
              {
                id: 'primary-pod',
                header: 'Primary Pod',
                path: 'primaryPod.name',
                type: 'text',
              },
              {
                id: 'last-activity',
                header: 'Last Activity',
                path: 'lastActivityAt',
                type: 'relative-time',
              },
            ],
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'create-opportunity',
      label: 'Log Opportunity',
      type: 'modal',
      icon: 'Sparkles',
      variant: 'primary',
      config: { type: 'modal', modal: 'create-opportunity' },
    },
    {
      id: 'request-collaboration',
      label: 'Request Collaboration',
      type: 'modal',
      icon: 'Users2',
      variant: 'secondary',
      config: { type: 'modal', modal: 'request-collaboration' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Manager', route: '/employee/manager' },
      { label: 'Cross-Pod Coordination', active: true },
    ],
  },
};

export default crossPodScreen;
