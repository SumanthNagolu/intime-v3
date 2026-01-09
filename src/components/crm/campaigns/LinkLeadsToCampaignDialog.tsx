'use client'

import { useState, useMemo } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Loader2, Building2, User, LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface LinkLeadsToCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  onSuccess?: () => void
}

export function LinkLeadsToCampaignDialog({
  open,
  onOpenChange,
  campaignId,
  onSuccess,
}: LinkLeadsToCampaignDialogProps) {
  const [search, setSearch] = useState('')
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])

  const utils = trpc.useUtils()

  // Fetch leads available for linking (not already linked to a campaign)
  // Uses unified contacts router for leads
  const { data: availableLeads, isLoading } = trpc.unifiedContacts.leads.listAvailableForCampaign.useQuery(
    { search: search || undefined, limit: 50 },
    { enabled: open }
  )

  const linkLeads = trpc.unifiedContacts.leads.linkToCampaign.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.linked} ${result.linked === 1 ? 'lead' : 'leads'} linked to campaign`)
      setSelectedLeadIds([])
      setSearch('')
      utils.unifiedContacts.leads.listByCampaign.invalidate({ campaignId })
      utils.unifiedContacts.leads.listAvailableForCampaign.invalidate()
      utils.crm.campaigns.getByIdWithCounts.invalidate({ id: campaignId })
      utils.crm.campaigns.getFullEntity.invalidate({ id: campaignId })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to link leads')
    },
  })

  const handleToggleLead = (leadId: string) => {
    setSelectedLeadIds(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleSelectAll = () => {
    if (!availableLeads) return
    if (selectedLeadIds.length === availableLeads.length) {
      setSelectedLeadIds([])
    } else {
      setSelectedLeadIds(availableLeads.map(l => l.id))
    }
  }

  const handleSubmit = () => {
    if (selectedLeadIds.length === 0) return
    linkLeads.mutate({
      campaignId,
      leadIds: selectedLeadIds,
    })
  }

  const filteredLeads = useMemo(() => availableLeads || [], [availableLeads])

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-cyan-100 text-cyan-700',
    qualified: 'bg-emerald-100 text-emerald-700',
    unqualified: 'bg-charcoal-100 text-charcoal-600',
    nurture: 'bg-amber-100 text-amber-700',
    converted: 'bg-violet-100 text-violet-700',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Link Existing Leads
          </DialogTitle>
          <DialogDescription>
            Select leads from your CRM to associate with this campaign. Only leads not already linked to a campaign are shown.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
          <Input
            placeholder="Search by name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Select All */}
        {filteredLeads.length > 0 && (
          <div className="flex items-center justify-between py-2 px-1 border-b">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-charcoal-600">
                Select all ({filteredLeads.length})
              </span>
            </label>
            {selectedLeadIds.length > 0 && (
              <Badge variant="secondary">
                {selectedLeadIds.length} selected
              </Badge>
            )}
          </div>
        )}

        {/* Leads List */}
        <ScrollArea className="h-[300px] border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-charcoal-500">
              <Building2 className="w-10 h-10 mb-2 text-charcoal-300" />
              <p className="text-sm">
                {search ? 'No leads match your search' : 'No available leads to link'}
              </p>
              <p className="text-xs text-charcoal-400 mt-1">
                {!search && 'All leads may already be linked to campaigns'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id)
                const displayName = lead.company_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown'
                const contactName = lead.company_name ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim() : null
                // Handle both lead_status (unified contacts) and status (legacy) field names
                const leadStatus = lead.lead_status || 'new'

                return (
                  <label
                    key={lead.id}
                    className={cn(
                      'flex items-center gap-3 p-3 cursor-pointer transition-colors',
                      isSelected ? 'bg-hublot-50' : 'hover:bg-charcoal-50'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleLead(lead.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-charcoal-900 truncate">
                          {displayName}
                        </span>
                        <Badge className={cn('text-xs', statusColors[leadStatus] || statusColors.new)}>
                          {leadStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-charcoal-500 mt-0.5">
                        {contactName && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {contactName}
                          </span>
                        )}
                        {lead.email && (
                          <span className="truncate">{lead.email}</span>
                        )}
                      </div>
                    </div>
                    {lead.lead_score !== null && (
                      <div className="text-right">
                        <span className="text-sm font-medium text-charcoal-600">
                          {lead.lead_score}/100
                        </span>
                        <div className="text-xs text-charcoal-400">Score</div>
                      </div>
                    )}
                  </label>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedLeadIds.length === 0 || linkLeads.isPending}
          >
            {linkLeads.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Link {selectedLeadIds.length > 0 ? selectedLeadIds.length : ''} {selectedLeadIds.length === 1 ? 'Lead' : 'Leads'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}















