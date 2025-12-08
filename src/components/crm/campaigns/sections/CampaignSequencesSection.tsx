'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
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
  Mail,
  Linkedin,
  Phone,
  Calendar,
  Pause,
  Play,
  CheckCircle,
  Clock,
  TrendingUp,
  Edit,
  Eye,
  X,
} from 'lucide-react'
import { InlinePanel, InlinePanelHeader, InlinePanelContent, InlinePanelSection } from '@/components/ui/inline-panel'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface CampaignSequencesSectionProps {
  campaignId: string
}

const channelIcons: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  event: <Calendar className="w-4 h-4" />,
}

export function CampaignSequencesSection({ campaignId }: CampaignSequencesSectionProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [channelFilter, setChannelFilter] = useState<string>('all')

  // Fetch campaign with sequences
  const { data: campaign, isLoading } = trpc.crm.campaigns.getById.useQuery({ id: campaignId })

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-charcoal-500">Loading sequences...</div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="p-6">
        <div className="text-sm text-charcoal-500">Campaign not found</div>
      </div>
    )
  }

  // Parse sequences from JSONB
  const sequences = campaign.sequences || {}
  const channels = campaign.channels || []

  // Build sequence list with stats
  const sequenceList = channels.map((channel) => {
    const sequenceConfig = sequences[channel] || {}
    const steps = sequenceConfig.steps || []
    
    return {
      channel,
      config: sequenceConfig,
      steps: steps.length,
      status: 'active', // TODO: Get from campaign status or sequence-specific status
      sent: 0, // TODO: Get from campaign_sequence_logs
      openRate: 0, // TODO: Calculate from logs
      responseRate: 0, // TODO: Calculate from logs
    }
  })

  const filteredSequences = channelFilter === 'all' 
    ? sequenceList 
    : sequenceList.filter(seq => seq.channel === channelFilter)

  const selectedSequence = selectedChannel 
    ? sequenceList.find(seq => seq.channel === selectedChannel)
    : null

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-heading font-semibold text-charcoal-900">
          Campaign Sequences
        </h2>
        <p className="text-sm text-charcoal-500 mt-1">
          Multi-channel outreach sequences configured for this campaign
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="event">Event</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        {/* List View */}
        <div className={cn(
          'flex-1 transition-all duration-300',
          selectedChannel ? 'max-w-[calc(100%-496px)]' : 'max-w-full'
        )}>
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-charcoal-50/50 hover:bg-charcoal-50/50">
                  <TableHead>Channel</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Open Rate</TableHead>
                  <TableHead className="text-right">Response</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSequences.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-charcoal-500">
                      No sequences configured for this campaign
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSequences.map((seq) => (
                    <TableRow
                      key={seq.channel}
                      className={cn(
                        'cursor-pointer transition-colors',
                        selectedChannel === seq.channel && 'bg-hublot-50'
                      )}
                      onClick={() => setSelectedChannel(seq.channel)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {channelIcons[seq.channel]}
                          <span className="font-medium capitalize">{seq.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{seq.steps} steps</Badge>
                      </TableCell>
                      <TableCell>
                        {campaign.status === 'active' ? (
                          <Badge className="gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                            <Play className="w-3 h-3" />
                            Active
                          </Badge>
                        ) : campaign.status === 'paused' ? (
                          <Badge className="gap-1.5 bg-amber-50 text-amber-700 border-amber-200">
                            <Pause className="w-3 h-3" />
                            Paused
                          </Badge>
                        ) : (
                          <Badge className="gap-1.5 bg-charcoal-100 text-charcoal-700 border-charcoal-200">
                            <Clock className="w-3 h-3" />
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {seq.sent.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {seq.openRate}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {seq.responseRate}%
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedChannel(seq.channel)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Inline Panel */}
        {selectedSequence && (
          <InlinePanel width="lg" onClose={() => setSelectedChannel(null)}>
            <InlinePanelHeader
              title={
                <div className="flex items-center gap-2">
                  {channelIcons[selectedSequence.channel]}
                  <span className="capitalize">{selectedSequence.channel} Sequence</span>
                </div>
              }
              description={`${selectedSequence.steps}-step outreach sequence`}
              onClose={() => setSelectedChannel(null)}
            />

            <InlinePanelContent>
              {/* Sequence Performance */}
              <InlinePanelSection title="Performance">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <div className="text-xs text-charcoal-500 mb-1">Messages Sent</div>
                    <div className="text-lg font-semibold tabular-nums">{selectedSequence.sent}</div>
                  </div>
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <div className="text-xs text-charcoal-500 mb-1">Open Rate</div>
                    <div className="text-lg font-semibold tabular-nums text-blue-600">
                      {selectedSequence.openRate}%
                    </div>
                  </div>
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <div className="text-xs text-charcoal-500 mb-1">Response Rate</div>
                    <div className="text-lg font-semibold tabular-nums text-emerald-600">
                      {selectedSequence.responseRate}%
                    </div>
                  </div>
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <div className="text-xs text-charcoal-500 mb-1">Status</div>
                    <div className="text-lg font-semibold capitalize">{selectedSequence.status}</div>
                  </div>
                </div>
              </InlinePanelSection>

              {/* Sequence Steps */}
              <InlinePanelSection title="Sequence Steps">
                <div className="space-y-3">
                  {selectedSequence.config.steps?.map((step: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 border border-charcoal-200 rounded-lg hover:border-hublot-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hublot-100 text-hublot-700 flex items-center justify-center font-semibold text-sm">
                          {step.stepNumber || idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              Day {step.dayOffset || 0}
                            </Badge>
                            {step.templateName && (
                              <span className="text-xs text-charcoal-500 truncate">
                                {step.templateName}
                              </span>
                            )}
                          </div>
                          {step.subject && (
                            <p className="text-sm font-medium text-charcoal-900 mb-1">
                              {step.subject}
                            </p>
                          )}
                          {step.templateId && (
                            <p className="text-xs text-charcoal-500">
                              Template: {step.templateId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-charcoal-500 text-center py-4">
                      No steps configured
                    </p>
                  )}
                </div>
              </InlinePanelSection>

              {/* Stop Conditions */}
              {selectedSequence.config.stopConditions && (
                <InlinePanelSection title="Stop Conditions">
                  <div className="flex flex-wrap gap-2">
                    {selectedSequence.config.stopConditions.map((condition: string) => (
                      <Badge key={condition} variant="secondary" className="capitalize">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {condition.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-charcoal-500 mt-2">
                    Sequence stops automatically when any condition is met
                  </p>
                </InlinePanelSection>
              )}

              {/* Sequence Settings */}
              <InlinePanelSection title="Settings">
                <div className="space-y-2 text-sm">
                  {selectedSequence.config.sendTime && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Send Time:</span>
                      <span className="font-medium capitalize">
                        {selectedSequence.config.sendTime.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                  {selectedSequence.config.respectTimezone !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Respect Timezone:</span>
                      <span className="font-medium">
                        {selectedSequence.config.respectTimezone ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                  {selectedSequence.config.dailyLimit && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Daily Limit:</span>
                      <span className="font-medium tabular-nums">
                        {selectedSequence.config.dailyLimit} per day
                      </span>
                    </div>
                  )}
                </div>
              </InlinePanelSection>
            </InlinePanelContent>

            {/* Footer Actions */}
            {campaign.status !== 'completed' && (
              <div className="p-4 border-t border-charcoal-100 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Sequence
                </Button>
                {campaign.status === 'active' && (
                  <Button variant="outline" size="sm">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
              </div>
            )}
          </InlinePanel>
        )}
      </div>
    </div>
  )
}

