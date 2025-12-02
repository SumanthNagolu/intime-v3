/**
 * Academy Certificates Screen
 *
 * View and download earned certificates.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const academyCertificatesScreen: ScreenDefinition = {
  id: 'academy-certificates',
  type: 'list',
  title: 'My Certificates',
  subtitle: 'View and share your earned certificates',
  icon: 'Award',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.academy.getMyCertificates',
      params: {},
    },
    pagination: true,
    pageSize: 12,
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // CERTIFICATES GRID
      // ===========================================
      {
        id: 'certificates-grid',
        type: 'custom',
        component: 'CertificatesGrid',
        componentProps: {
          layout: 'grid',
          columns: 3,
          showPreview: true,
          showCourseName: true,
          showEarnedDate: true,
          showCredentialId: true,
        },
        rowActions: [
          {
            id: 'view',
            label: 'View',
            type: 'modal',
            icon: 'Eye',
            config: { type: 'modal', modal: 'CertificatePreview', props: { certificateId: { type: 'field', path: 'id' } } },
          },
          {
            id: 'download',
            label: 'Download PDF',
            type: 'download',
            icon: 'Download',
            config: { type: 'download', url: { type: 'field', path: 'downloadUrl' }, filename: 'certificate.pdf' },
          },
          {
            id: 'share-linkedin',
            label: 'Share on LinkedIn',
            type: 'custom',
            icon: 'Linkedin',
            config: { type: 'custom', handler: 'shareOnLinkedIn', params: { certificateId: { type: 'field', path: 'id' } } },
          },
        ],
        emptyState: {
          title: 'No certificates earned yet',
          description: 'Complete courses that offer certifications to earn certificates.',
          icon: 'Award',
          action: {
            id: 'browse-courses',
            label: 'Browse Courses',
            type: 'navigate',
            variant: 'primary',
            config: { type: 'navigate', route: '/training/courses?filter=has_certificate' },
          },
        },
        pagination: { enabled: true, pageSize: 12 },
      },
    ],
  },

  actions: [
    {
      id: 'export-all',
      label: 'Export All',
      type: 'custom',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'custom', handler: 'exportAllCertificates' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Training Academy', route: '/training' },
      { label: 'Certificates', active: true },
    ],
  },
};

export default academyCertificatesScreen;
