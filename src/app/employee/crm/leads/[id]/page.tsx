'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LeadWorkspace } from '@/components/workspaces/lead/LeadWorkspace'
import { QualifyLeadDialog, ConvertLeadDialog } from '@/components/crm/leads'
import { trpc } from '@/lib/trpc/client'
import { useLeadWorkspace } from '@/components/workspaces/lead/LeadWorkspaceProvider'
import { toast } from 'sonner'
import type { LeadData } from '@/types/lead'

// Custom event handler types
declare global {
  interface WindowEventMap {
    openLeadDialog: CustomEvent<{ dialogId: string; leadId?: string }>
    openEntityDialog: CustomEvent<{ dialogId: string; entityType?: string; entityId?: string }>
  }
}

// Type for QualifyLeadDialog - maps LeadData to expected interface
interface QualifyLeadDialogData {
  id: string
  company_name?: string
  first_name?: string
  last_name?: string
  bant_budget?: number
  bant_authority?: number
  bant_need?: number
  bant_timeline?: number
  positions_count?: number
  skills_needed?: string[]
}

// Type for ConvertLeadDialog - maps LeadData to expected interface
interface ConvertLeadDialogData {
  id: string
  company_name?: string
  first_name?: string
  last_name?: string
  estimated_value?: number
  business_need?: string
  positions_count?: number
  skills_needed?: string[]
  bant_total_score?: number
}

// Helper to transform LeadData to dialog format
function toQualifyDialogData(lead: LeadData): QualifyLeadDialogData {
  return {
    id: lead.id,
    company_name: lead.companyName ?? undefined,
    first_name: lead.firstName,
    last_name: lead.lastName,
    bant_budget: lead.bantBudget ?? undefined,
    bant_authority: lead.bantAuthority ?? undefined,
    bant_need: lead.bantNeed ?? undefined,
    bant_timeline: lead.bantTimeline ?? undefined,
    positions_count: undefined, // Add if available in LeadData
    skills_needed: undefined, // Add if available in LeadData
  }
}

function toConvertDialogData(lead: LeadData): ConvertLeadDialogData {
  return {
    id: lead.id,
    company_name: lead.companyName ?? undefined,
    first_name: lead.firstName,
    last_name: lead.lastName,
    estimated_value: lead.estimatedValue ?? undefined,
    business_need: undefined, // Add if available in LeadData
    positions_count: undefined, // Add if available in LeadData
    skills_needed: undefined, // Add if available in LeadData
    bant_total_score: lead.bantTotalScore ?? undefined,
  }
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string
  const { data, refreshData } = useLeadWorkspace()

  // Dialog states
  const [showQualifyDialog, setShowQualifyDialog] = useState(false)
  const [showConvertDialog, setShowConvertDialog] = useState(false)

  const utils = trpc.useUtils()

  // Delete mutation - uses unified contacts router (delete is at root level)
  const deleteLead = trpc.unifiedContacts.delete.useMutation({
    onSuccess: () => {
      toast.success('Lead deleted')
      router.push('/employee/crm/leads')
    },
    onError: (error: { message?: string }) => {
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

    const handleEntityDialog = (event: CustomEvent<{ dialogId: string; entityType?: string; entityId?: string }>) => {
      if (event.detail.entityType === 'lead' && event.detail.entityId === leadId) {
        switch (event.detail.dialogId) {
          case 'qualify':
          case 'qualifyLead':
            setShowQualifyDialog(true)
            break
          case 'convert':
          case 'convertLead':
            setShowConvertDialog(true)
            break
        }
      }
    }

    window.addEventListener('openLeadDialog', handleOpenDialog)
    window.addEventListener('openEntityDialog', handleEntityDialog)

    return () => {
      window.removeEventListener('openLeadDialog', handleOpenDialog)
      window.removeEventListener('openEntityDialog', handleEntityDialog)
    }
  }, [leadId, deleteLead])

  // Refresh data after dialog closes
  const handleDialogChange = (open: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(open)
    if (!open) {
      refreshData()
    }
  }

  const handleQualifySuccess = () => {
    refreshData()
    utils.unifiedContacts.leads.list.invalidate()
  }

  const handleConvertSuccess = () => {
    refreshData()
    utils.unifiedContacts.leads.list.invalidate()
  }

  // Create deal handler
  const handleCreateDeal = () => {
    // Navigate to deal creation or show deal creation dialog
    // For now, convert the lead which creates a deal
    setShowConvertDialog(true)
  }

  return (
    <>
      {/* Guidewire-style Lead Workspace */}
      <LeadWorkspace
        onQualify={() => setShowQualifyDialog(true)}
        onConvert={() => setShowConvertDialog(true)}
        onCreateDeal={handleCreateDeal}
      />

      {/* Qualify Lead Dialog */}
      {data.lead && (
        <QualifyLeadDialog
          lead={toQualifyDialogData(data.lead)}
          open={showQualifyDialog}
          onOpenChange={(open) => handleDialogChange(open, setShowQualifyDialog)}
          onSuccess={handleQualifySuccess}
        />
      )}

      {/* Convert Lead Dialog */}
      {data.lead && (
        <ConvertLeadDialog
          lead={toConvertDialogData(data.lead)}
          open={showConvertDialog}
          onOpenChange={(open) => handleDialogChange(open, setShowConvertDialog)}
        />
      )}
    </>
  )
}
