'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { leadsDetailConfig, Lead } from '@/configs/entities/leads.config'
import { QualifyLeadDialog, ConvertLeadDialog } from '@/components/crm/leads'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

// Custom event handler types
declare global {
  interface WindowEventMap {
    openLeadDialog: CustomEvent<{ dialogId: string; leadId?: string }>
  }
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string

  // Dialog states
  const [showQualifyDialog, setShowQualifyDialog] = useState(false)
  const [showConvertDialog, setShowConvertDialog] = useState(false)

  const utils = trpc.useUtils()

  // Query for lead data (needed for dialogs)
  const leadQuery = trpc.crm.leads.getById.useQuery({ id: leadId })
  const lead = leadQuery.data

  // Delete mutation
  const deleteLead = trpc.crm.leads.delete.useMutation({
    onSuccess: () => {
      toast.success('Lead deleted')
      router.push('/employee/crm/leads')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete lead')
    },
  })

  // Listen for quick action dialog events from the sidebar and PCF components
  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string; leadId?: string }>) => {
      switch (event.detail.dialogId) {
        case 'qualify':
        case 'qualifyLead':
          setShowQualifyDialog(true)
          break
        case 'convert':
        case 'convertLead':
          setShowConvertDialog(true)
          break
        case 'delete':
          if (confirm('Are you sure you want to delete this lead?')) {
            deleteLead.mutate({ id: leadId })
          }
          break
        case 'logActivity':
          // Activity logging is handled inline in the Activities section
          break
      }
    }

    window.addEventListener('openLeadDialog', handleOpenDialog)
    return () => window.removeEventListener('openLeadDialog', handleOpenDialog)
  }, [leadId, deleteLead])

  const handleQualifySuccess = () => {
    leadQuery.refetch()
    utils.crm.leads.list.invalidate()
  }

  const handleConvertSuccess = () => {
    leadQuery.refetch()
    utils.crm.leads.list.invalidate()
  }

  return (
    <>
      <EntityDetailView<Lead>
        config={leadsDetailConfig}
        entityId={leadId}
      />

      {/* Qualify Lead Dialog */}
      {lead && (
        <QualifyLeadDialog
          lead={lead as any}
          open={showQualifyDialog}
          onOpenChange={setShowQualifyDialog}
          onSuccess={handleQualifySuccess}
        />
      )}

      {/* Convert Lead Dialog */}
      {lead && (
        <ConvertLeadDialog
          lead={lead as any}
          open={showConvertDialog}
          onOpenChange={setShowConvertDialog}
        />
      )}
    </>
  )
}
