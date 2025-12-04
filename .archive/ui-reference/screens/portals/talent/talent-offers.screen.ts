/**
 * Offers Screen
 *
 * Pending and past offers for the candidate.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata/types';

const columns: TableColumnDefinition[] = [
  { id: 'position', header: 'Position', path: 'jobTitle', type: 'text', width: '20%' },
  { id: 'company', header: 'Company', path: 'company', type: 'text', width: '20%' },
  { id: 'compensation', header: 'Compensation', path: 'compensation', type: 'text' },
  { id: 'startDate', header: 'Start Date', path: 'proposedStartDate', type: 'date' },
  { id: 'expiresAt', header: 'Expires', path: 'expiresAt', type: 'date' },
  {
    id: 'status',
    header: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'declined', label: 'Declined' },
        { value: 'expired', label: 'Expired' },
        { value: 'withdrawn', label: 'Withdrawn' },
      ],
      badgeColors: {
        pending: 'yellow',
        accepted: 'green',
        declined: 'gray',
        expired: 'red',
        withdrawn: 'gray',
      },
    },
  },
];

export const talentOffersScreen: ScreenDefinition = {
  id: 'talent-offers',
  type: 'list',
  title: 'My Offers',
  subtitle: 'View and respond to job offers',
  icon: 'Gift',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.talent.getOffers',
      params: {},
    },
    pagination: true,
    pageSize: 20,
  },

  layout: {
    type: 'tabs',
    defaultTab: 'pending',
    tabs: [
      // ===========================================
      // PENDING OFFERS TAB
      // ===========================================
      {
        id: 'pending',
        label: 'Pending',
        badge: { type: 'count', path: 'stats.pendingCount' },
        sections: [
          {
            id: 'pending-offers',
            type: 'custom',
            component: 'OfferCardsList',
            componentProps: {
              showExpiryCountdown: true,
              showCompensationBreakdown: true,
              layout: 'cards',
            },
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'portal.talent.getOffers',
                params: { status: 'pending' },
              },
            },
            emptyState: {
              title: 'No pending offers',
              description: 'Job offers will appear here when you receive them.',
              icon: 'Gift',
            },
          },
        ],
      },

      // ===========================================
      // PAST OFFERS TAB
      // ===========================================
      {
        id: 'past',
        label: 'Past',
        sections: [
          {
            id: 'past-table',
            type: 'table',
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'portal.talent.getOffers',
                params: { status: 'past' },
              },
            },
            columns_config: columns,
            rowClick: { type: 'navigate', route: '/talent/offers/{{id}}' },
            emptyState: {
              title: 'No past offers',
              description: 'Past offers will appear here.',
              icon: 'Gift',
            },
          },
        ],
      },
    ],
  },

  navigation: {
    breadcrumbs: [
      { label: 'Talent Portal', route: '/talent' },
      { label: 'Offers', active: true },
    ],
  },
};

export default talentOffersScreen;
