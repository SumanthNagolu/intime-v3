/**
 * Workspace List Page
 *
 * Displays a data-connected list view of entities based on type
 * URL Pattern: /employee/workspace/[type]
 *
 * Examples:
 * - /employee/workspace/leads
 * - /employee/workspace/deals
 * - /employee/workspace/jobs
 */

'use client';

import { use, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { EntityListView, type EntityListType } from '@/components/workspaces/lists';
import { CreateLeadModal } from '@/components/recruiting/Modals';
import type { Lead, Account } from '@/types';

// Valid workspace types
const VALID_TYPES = [
  'leads',
  'accounts',
  'deals',
  'jobs',
  'talent',
  'submissions',
  'contacts',
  'job-orders',
  'campaigns',
] as const;

export default function WorkspaceListPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);
  const router = useRouter();
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);

  // Validate the type
  if (!VALID_TYPES.includes(type as EntityListType)) {
    notFound();
  }

  const handleCreateNew = () => {
    switch (type) {
      case 'leads':
        setShowCreateLeadModal(true);
        break;
      case 'accounts':
        // TODO: Add CreateAccountModal
        console.log('Create new account');
        break;
      case 'deals':
        // TODO: Add CreateDealModal
        console.log('Create new deal');
        break;
      case 'jobs':
        // TODO: Add CreateJobModal
        console.log('Create new job');
        break;
      case 'talent':
        // TODO: Add CreateTalentModal
        console.log('Create new talent');
        break;
      default:
        console.log('Create new', type);
    }
  };

  const handleLeadSave = (lead: Lead, account?: Account) => {
    // Refresh the page to show new lead
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        <EntityListView
          type={type as EntityListType}
          onCreateNew={handleCreateNew}
        />
      </div>

      {/* Create Lead Modal */}
      {showCreateLeadModal && (
        <CreateLeadModal
          onClose={() => setShowCreateLeadModal(false)}
          onSave={handleLeadSave}
        />
      )}
    </div>
  );
}
