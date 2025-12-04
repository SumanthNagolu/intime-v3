/**
 * HR Documents Screen Definition
 *
 * Metadata-driven screen for document management.
 * Uses custom component for document repository with categories.
 */

import type { ScreenDefinition } from '@/lib/metadata';

export const documentsScreen: ScreenDefinition = {
  id: 'hr-documents',
  type: 'list',

  title: 'Documents',
  subtitle: 'Centralized repository for policies, templates, and employee files',
  icon: 'FileText',

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'sm',
    sidebar: {
      id: 'document-categories',
      type: 'list',
      title: 'Categories',
      dataSource: {
        type: 'static',
        data: [
          { id: 'templates', name: 'Templates & Forms', icon: 'FileText', count: 12 },
          { id: 'policies', name: 'Policies & Handbooks', icon: 'Shield', count: 8 },
          { id: 'employee-files', name: 'Employee Files', icon: 'Users', count: 45 },
        ],
      },
    },
    sections: [
      {
        id: 'documents-list',
        type: 'custom',
        component: 'DocumentRepository',
        componentProps: {
          showSearch: true,
          showUpload: true,
          showPreview: true,
          categories: ['templates', 'policies', 'employee-files'],
        },
      },
    ],
  },

  actions: [
    {
      id: 'upload-document',
      label: 'Upload',
      type: 'modal',
      variant: 'primary',
      icon: 'Upload',
      config: {
        type: 'modal',
        modal: 'DocumentUploadModal',
      },
    },
    {
      id: 'create-folder',
      label: 'New Folder',
      type: 'modal',
      variant: 'secondary',
      icon: 'FolderPlus',
      config: {
        type: 'modal',
        modal: 'CreateFolderModal',
      },
    },
  ],

  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Documents' },
    ],
  },
};

export default documentsScreen;
