/**
 * 1:1 Session Detail Screen
 *
 * Detailed view for a 1:1 session with an IC.
 * Shows session form, agenda, notes, action items, and history.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/05-conduct-1on1.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const oneOnOneDetailScreen: ScreenDefinition = {
  id: 'one-on-one-detail',
  type: 'detail',
  entityType: 'one_on_one',
  title: { type: 'computed', template: '1:1 with {{ic.fullName}}' },
  subtitle: { type: 'field', path: 'session.scheduledAt' },
  icon: 'MessageSquare',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'ic', procedure: 'users.getById', input: { id: { type: 'param', path: 'userId' } } },
      { key: 'session', procedure: 'manager.getCurrentOneOnOne', input: { userId: { type: 'param', path: 'userId' } } },
      { key: 'history', procedure: 'manager.getOneOnOneHistory', input: { userId: { type: 'param', path: 'userId' } } },
      { key: 'actionItems', procedure: 'manager.getOpenActionItems', input: { userId: { type: 'param', path: 'userId' } } },
      { key: 'performance', procedure: 'manager.getICPerformanceSummary', input: { userId: { type: 'param', path: 'userId' } } },
    ],
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'right',
    sidebar: {
      id: 'ic-context',
      type: 'custom',
      component: 'OneOnOneSidebar',
      componentProps: {
        ic: { type: 'field', path: 'ic' },
        performance: { type: 'field', path: 'performance' },
        actionItems: { type: 'field', path: 'actionItems' },
      },
    },
    sections: [
      // ===========================================
      // SESSION DETAILS
      // ===========================================
      {
        id: 'session-details',
        type: 'info-card',
        title: 'Session Details',
        fields: [
          { id: 'date', label: 'Date & Time', path: 'session.scheduledAt', type: 'datetime' },
          { id: 'duration', label: 'Duration', path: 'session.durationMinutes', type: 'text', config: { suffix: ' minutes' } },
          { id: 'location', label: 'Location', path: 'session.location', type: 'text' },
          { id: 'status', label: 'Status', path: 'session.status', type: 'enum', config: {
            options: [
              { value: 'scheduled', label: 'Scheduled', color: 'blue' },
              { value: 'in_progress', label: 'In Progress', color: 'yellow' },
              { value: 'completed', label: 'Completed', color: 'green' },
              { value: 'cancelled', label: 'Cancelled', color: 'gray' },
            ],
          }},
        ],
      },

      // ===========================================
      // AGENDA
      // ===========================================
      {
        id: 'agenda',
        type: 'custom',
        title: 'Agenda',
        component: 'AgendaEditor',
        componentProps: {
          icAgenda: { type: 'field', path: 'session.icAgenda' },
          managerAgenda: { type: 'field', path: 'session.managerAgenda' },
          editable: { type: 'computed', condition: { field: 'session.status', operator: 'in', value: ['scheduled', 'in_progress'] } },
        },
      },

      // ===========================================
      // DISCUSSION TOPICS
      // ===========================================
      {
        id: 'discussion-topics',
        type: 'custom',
        title: 'Discussion Topics',
        component: 'DiscussionTopicsList',
        componentProps: {
          topics: { type: 'field', path: 'session.topics' },
          suggestedTopics: [
            { id: 'progress', label: 'Sprint Progress', icon: 'Target' },
            { id: 'blockers', label: 'Blockers & Challenges', icon: 'AlertTriangle' },
            { id: 'goals', label: 'Goals & Development', icon: 'TrendingUp' },
            { id: 'feedback', label: 'Feedback', icon: 'MessageSquare' },
            { id: 'career', label: 'Career Discussion', icon: 'Compass' },
            { id: 'wellbeing', label: 'Wellbeing Check', icon: 'Heart' },
          ],
        },
      },

      // ===========================================
      // NOTES
      // ===========================================
      {
        id: 'session-notes',
        type: 'form',
        title: 'Session Notes',
        description: 'These notes are private and not shared with the IC.',
        fields: [
          {
            id: 'notes',
            label: '',
            type: 'richtext',
            path: 'session.notes',
            config: { placeholder: 'Write your notes here...', minRows: 6 },
          },
        ],
        visible: {
          type: 'condition',
          condition: { field: 'session.status', operator: 'in', value: ['scheduled', 'in_progress', 'completed'] },
        },
      },

      // ===========================================
      // ACTION ITEMS
      // ===========================================
      {
        id: 'action-items-form',
        type: 'custom',
        title: 'Action Items from This Session',
        component: 'ActionItemsEditor',
        componentProps: {
          items: { type: 'field', path: 'session.actionItems' },
          allowAdd: true,
          assigneeOptions: [
            { value: 'ic', label: 'IC ({{ic.fullName}})' },
            { value: 'manager', label: 'Manager (Me)' },
            { value: 'both', label: 'Both' },
          ],
        },
      },

      // ===========================================
      // FOLLOW-UP SCHEDULING
      // ===========================================
      {
        id: 'follow-up',
        type: 'form',
        title: 'Schedule Follow-up',
        fields: [
          {
            id: 'schedule-next',
            label: 'Schedule Next 1:1',
            type: 'checkbox',
            path: 'followUp.scheduleNext',
          },
          {
            id: 'next-date',
            label: 'Next 1:1 Date',
            type: 'datetime',
            path: 'followUp.nextDate',
            visible: {
              type: 'condition',
              condition: { field: 'followUp.scheduleNext', operator: 'eq', value: true },
            },
          },
        ],
        visible: {
          type: 'condition',
          condition: { field: 'session.status', operator: 'eq', value: 'in_progress' },
        },
      },

      // ===========================================
      // HISTORY
      // ===========================================
      {
        id: 'history',
        type: 'table',
        title: 'Previous 1:1s',
        dataSource: { type: 'field', path: 'history' },
        columns_config: [
          { id: 'date', header: 'Date', path: 'scheduledAt', type: 'date', sortable: true },
          { id: 'duration', header: 'Duration', path: 'durationMinutes', type: 'duration' },
          { id: 'topics', header: 'Topics', path: 'topicsSummary', type: 'text' },
          { id: 'action-items', header: 'Action Items', path: 'actionItemCount', type: 'badge' },
          { id: 'completed-items', header: 'Completed', path: 'completedActionItemCount', type: 'badge' },
          { id: 'actions', header: '', type: 'actions', width: '80px', config: {
            actions: [
              { id: 'view', label: 'View', icon: 'Eye', type: 'modal',
                    config: { type: 'modal', modal: 'view-1on1-notes' } },
            ],
          }},
        ],
        collapsible: true,
        defaultExpanded: false,
      },
    ],
  },

  actions: [
    {
      id: 'start-session',
      label: 'Start Session',
      type: 'mutation',
      icon: 'Play',
      variant: 'primary',
      config: { type: 'mutation', procedure: 'manager.startOneOnOne' },
      visible: {
        type: 'condition',
        condition: { field: 'session.status', operator: 'eq', value: 'scheduled' },
      },
    },
    {
      id: 'complete-session',
      label: 'Complete Session',
      type: 'modal',
      icon: 'CheckCircle',
      variant: 'primary',
      config: { type: 'modal', modal: 'complete-1on1' },
      visible: {
        type: 'condition',
        condition: { field: 'session.status', operator: 'eq', value: 'in_progress' },
      },
    },
    {
      id: 'reschedule',
      label: 'Reschedule',
      type: 'modal',
      icon: 'CalendarClock',
      variant: 'secondary',
      config: { type: 'modal', modal: 'reschedule-one-on-one' },
      visible: {
        type: 'condition',
        condition: { field: 'session.status', operator: 'eq', value: 'scheduled' },
      },
    },
    {
      id: 'cancel',
      label: 'Cancel',
      type: 'modal',
      icon: 'X',
      variant: 'destructive',
      config: { type: 'modal', modal: 'cancel-1on1' },
      confirm: {
        title: 'Cancel 1:1',
        message: 'Are you sure you want to cancel this 1:1 session?',
        confirmLabel: 'Cancel Session',
        destructive: true,
      },
      visible: {
        type: 'condition',
        condition: { field: 'session.status', operator: 'eq', value: 'scheduled' },
      },
    },
    {
      id: 'view-ic-profile',
      label: 'View IC Profile',
      type: 'navigate',
      icon: 'User',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/manager/team/{{ic.id}}' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Manager', route: '/employee/manager' },
      { label: '1:1 Meetings', route: '/employee/manager/1on1' },
      { label: { type: 'field', path: 'ic.fullName' }, active: true },
    ],
  },
};

export default oneOnOneDetailScreen;
