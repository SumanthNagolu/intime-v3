'use client'

import { useState, useEffect } from 'react'
import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { dealsListConfig, Deal } from '@/configs/entities/deals.config'
import { CreateDealDialog } from '@/components/crm/deals'

// Declare the custom event type for TypeScript
declare global {
  interface WindowEventMap {
    openDealDialog: CustomEvent<{ dialogId: string; dealId?: string }>
  }
}

export default function DealsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Listen for custom event to open dialogs
  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string; dealId?: string }>) => {
      if (event.detail.dialogId === 'create') {
        setCreateDialogOpen(true)
      }
    }

    window.addEventListener('openDealDialog', handleOpenDialog)
    return () => window.removeEventListener('openDealDialog', handleOpenDialog)
  }, [])

  return (
    <>
      <EntityListView<Deal> config={dealsListConfig} />
      
      <CreateDealDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          // Dialog closes automatically and list refetches via tRPC cache invalidation
        }}
      />
    </>
  )
}
