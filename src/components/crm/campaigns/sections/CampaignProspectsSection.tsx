'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  UserPlus,
  Loader2,
  Linkedin,
  Eye,
} from 'lucide-react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { ConvertProspectDialog } from '../ConvertProspectDialog'
import { InlinePanel, InlinePanelHeader, InlinePanelContent, InlinePanelSection } from '@/components/ui/inline-panel'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface ProspectData {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  company_name?: string
  title?: string
  status: string
  response_type?: string
  response_text?: string
  engagement_score?: number
  converted_lead_id?: string
  linkedin_url?: string
  responded_at?: string
}

const prospectStatusColors: Record<string, string> = {
  enrolled: 'bg-gray-100 text-gray-700',
  contacted: 'bg-blue-100 text-blue-700',
  engaged: 'bg-cyan-100 text-cyan-700',
  responded: 'bg-green-100 text-green-700',
  converted: 'bg-purple-100 text-purple-700',
  unsubscribed: 'bg-red-100 text-red-700',
  bounced: 'bg-orange-100 text-orange-700',
}

const responseTypeColors: Record<string, string> = {
  positive: 'text-green-600 bg-green-50',
  neutral: 'text-gray-600 bg-gray-50',
  negative: 'text-red-600 bg-red-50',
}

interface CampaignProspectsSectionProps {
  campaignId: string
}

export function CampaignProspectsSection({ campaignId }: CampaignProspectsSectionProps) {
  const [prospectFilter, setProspectFilter] = useState<string>('all')
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [selectedProspect, setSelectedProspect] = useState<ProspectData | null>(null)
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null)

  const utils = trpc.useUtils()

  const { data: prospects, isLoading } = trpc.crm.campaigns.getProspects.useQuery({
    campaignId,
    status: prospectFilter as 'enrolled' | 'contacted' | 'engaged' | 'responded' | 'converted' | 'unsubscribed' | 'bounced' | 'all',
    limit: 50,
  })

  const handleConvert = (prospect: ProspectData) => {
    setSelectedProspect(prospect)
    setConvertDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
      </div>
    )
  }

  const selectedProspectData = selectedProspectId
    ? prospects?.items?.find((p: ProspectData) => p.id === selectedProspectId)
    : null

  return (
    <div className="p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-heading font-semibold text-charcoal-900">
            Campaign Prospects
          </h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Enrolled prospects and their engagement status
          </p>
        </div>
        <Select value={prospectFilter} onValueChange={setProspectFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="enrolled">Enrolled</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="engaged">Engaged</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        {/* List View */}
        <div className={cn(
          'flex-1 transition-all duration-300',
          selectedProspectId ? 'max-w-[calc(100%-496px)]' : 'max-w-full'
        )}>
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-charcoal-50/50 hover:bg-charcoal-50/50">
                  <TableHead>Prospect</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prospects?.items?.map((prospect: ProspectData, idx: number) => (
                  <TableRow 
                    key={prospect.id}
                    className={cn(
                      'cursor-pointer transition-colors',
                      idx % 2 === 0 && 'bg-white',
                      idx % 2 === 1 && 'bg-charcoal-50/30',
                      selectedProspectId === prospect.id && 'bg-hublot-50 hover:bg-hublot-50'
                    )}
                    onClick={() => setSelectedProspectId(prospect.id)}
                  >
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {prospect.first_name} {prospect.last_name}
                      </div>
                      <div className="text-sm text-charcoal-500">{prospect.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{prospect.company_name || '-'}</div>
                      <div className="text-sm text-charcoal-500">{prospect.title || '-'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={prospectStatusColors[prospect.status]}>
                      {prospect.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {prospect.response_type ? (
                      <div>
                        <Badge className={responseTypeColors[prospect.response_type]}>
                          {prospect.response_type}
                        </Badge>
                        {prospect.response_text && (
                          <p className="text-xs text-charcoal-500 mt-1 max-w-[200px] truncate">
                            {prospect.response_text}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${prospect.engagement_score || 0}%` }}
                        />
                      </div>
                      <span className="text-sm">{prospect.engagement_score || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProspectId(prospect.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!prospect.converted_lead_id && prospect.status === 'responded' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConvert(prospect)}
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!prospects?.items || prospects.items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-charcoal-500 py-8">
                    No prospects found
                  </TableCell>
                </TableRow>
              )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Inline Panel for Prospect Details */}
        {selectedProspectData && (
          <InlinePanel width="lg" onClose={() => setSelectedProspectId(null)}>
            <InlinePanelHeader
              title={`${selectedProspectData.first_name} ${selectedProspectData.last_name}`}
              description={selectedProspectData.title || 'Prospect'}
              onClose={() => setSelectedProspectId(null)}
            />

            <InlinePanelContent>
              {/* Contact Information */}
              <InlinePanelSection title="Contact Information">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Email:</span>
                    <a href={`mailto:${selectedProspectData.email}`} className="font-medium text-blue-600 hover:underline">
                      {selectedProspectData.email}
                    </a>
                  </div>
                  {selectedProspectData.linkedin_url && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">LinkedIn:</span>
                      <a
                        href={selectedProspectData.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Linkedin className="w-3 h-3" />
                        Profile
                      </a>
                    </div>
                  )}
                </div>
              </InlinePanelSection>

              {/* Company Information */}
              <InlinePanelSection title="Company Information">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Company:</span>
                    <span className="font-medium">{selectedProspectData.company_name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Title:</span>
                    <span className="font-medium">{selectedProspectData.title || '-'}</span>
                  </div>
                </div>
              </InlinePanelSection>

              {/* Engagement */}
              <InlinePanelSection title="Engagement">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-charcoal-500">Status:</span>
                      <Badge className={prospectStatusColors[selectedProspectData.status]}>
                        {selectedProspectData.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-charcoal-500">Engagement Score:</span>
                      <span className="font-semibold">{selectedProspectData.engagement_score || 0}/100</span>
                    </div>
                    <div className="w-full h-2 bg-charcoal-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${selectedProspectData.engagement_score || 0}%` }}
                      />
                    </div>
                  </div>
                  {selectedProspectData.response_type && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-charcoal-500">Response Type:</span>
                        <Badge className={responseTypeColors[selectedProspectData.response_type]}>
                          {selectedProspectData.response_type}
                        </Badge>
                      </div>
                      {selectedProspectData.response_text && (
                        <p className="text-sm text-charcoal-600 mt-2 p-3 bg-charcoal-50 rounded-lg">
                          {selectedProspectData.response_text}
                        </p>
                      )}
                      {selectedProspectData.responded_at && (
                        <p className="text-xs text-charcoal-500 mt-1">
                          Responded {format(new Date(selectedProspectData.responded_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </InlinePanelSection>

              {/* Conversion Status */}
              {selectedProspectData.converted_lead_id && (
                <InlinePanelSection title="Conversion">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-emerald-700 mb-2">
                      <UserPlus className="w-4 h-4" />
                      <span className="font-medium">Converted to Lead</span>
                    </div>
                    <Link href={`/employee/crm/leads/${selectedProspectData.converted_lead_id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Lead
                      </Button>
                    </Link>
                  </div>
                </InlinePanelSection>
              )}
            </InlinePanelContent>

            {/* Footer Actions */}
            {!selectedProspectData.converted_lead_id && selectedProspectData.status === 'responded' && (
              <div className="p-4 border-t border-charcoal-100">
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    handleConvert(selectedProspectData)
                    setSelectedProspectId(null)
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                  Convert to Lead
                </Button>
              </div>
            )}
          </InlinePanel>
        )}
      </div>

      {/* Convert Dialog */}
      {selectedProspect && (
        <ConvertProspectDialog
          open={convertDialogOpen}
          onOpenChange={setConvertDialogOpen}
          prospect={selectedProspect}
          onSuccess={() => {
            utils.crm.campaigns.getProspects.invalidate({ campaignId })
            setSelectedProspect(null)
          }}
        />
      )}
    </div>
  )
}
