'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, User, Mail, Phone, Star, ExternalLink } from 'lucide-react'
import type { DealStakeholder } from '@/types/deal'
import { cn } from '@/lib/utils'

interface DealContactsSectionProps {
  stakeholders: DealStakeholder[]
  dealId: string
  onRefresh: () => void
  onAddContact?: () => void
}

const ROLE_STYLES: Record<string, { label: string; className: string }> = {
  champion: { label: 'Champion', className: 'bg-gold-100 text-gold-700' },
  decision_maker: { label: 'Decision Maker', className: 'bg-purple-100 text-purple-700' },
  influencer: { label: 'Influencer', className: 'bg-blue-100 text-blue-700' },
  blocker: { label: 'Blocker', className: 'bg-red-100 text-red-700' },
  end_user: { label: 'End User', className: 'bg-charcoal-100 text-charcoal-700' },
}

const INFLUENCE_LEVELS: Record<string, { stars: number; label: string }> = {
  high: { stars: 5, label: 'High' },
  medium: { stars: 3, label: 'Medium' },
  low: { stars: 1, label: 'Low' },
}

const SENTIMENT_STYLES: Record<string, string> = {
  positive: 'text-green-600',
  neutral: 'text-charcoal-500',
  negative: 'text-red-600',
}

export function DealContactsSection({
  stakeholders,
  dealId,
  onRefresh,
  onAddContact
}: DealContactsSectionProps) {
  const [selectedContact, setSelectedContact] = React.useState<string | null>(null)

  const selectedStakeholder = stakeholders.find(s => s.id === selectedContact)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-900">
            Deal Contacts ({stakeholders.length})
          </h2>
          <p className="text-sm text-charcoal-500">Key stakeholders for this deal</p>
        </div>
        <Button size="sm" onClick={onAddContact}>
          <Plus className="h-4 w-4 mr-1" />
          Add Contact
        </Button>
      </div>

      <div className="flex gap-4">
        {/* Contacts List */}
        <Card className={cn('flex-1 transition-all duration-300', selectedContact && 'max-w-[50%]')}>
          <CardContent className="p-0">
            {stakeholders.length > 0 ? (
              <div className="divide-y divide-charcoal-100">
                {stakeholders.map((stakeholder) => {
                  const roleConfig = ROLE_STYLES[stakeholder.role || '']
                  const influenceConfig = INFLUENCE_LEVELS[stakeholder.influenceLevel || '']
                  const isSelected = selectedContact === stakeholder.id

                  return (
                    <div
                      key={stakeholder.id}
                      onClick={() => setSelectedContact(isSelected ? null : stakeholder.id)}
                      className={cn(
                        'flex items-center gap-4 p-4 cursor-pointer transition-colors',
                        isSelected ? 'bg-gold-50' : 'hover:bg-charcoal-50'
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-charcoal-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-charcoal-900 truncate">
                            {stakeholder.name}
                          </p>
                          {stakeholder.isPrimary && (
                            <Star className="h-4 w-4 text-gold-500 fill-gold-500" />
                          )}
                        </div>
                        <p className="text-xs text-charcoal-600 truncate">{stakeholder.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {roleConfig && (
                          <Badge className={roleConfig.className}>
                            {roleConfig.label}
                          </Badge>
                        )}
                        {influenceConfig && (
                          <span className="text-xs text-charcoal-500">
                            {'★'.repeat(influenceConfig.stars)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <User className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
                <p className="text-sm text-charcoal-500">No contacts added to this deal</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={onAddContact}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Contact
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Detail Panel */}
        {selectedStakeholder && (
          <Card className="w-[400px] flex-shrink-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-charcoal-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal-900">
                      {selectedStakeholder.name}
                    </h3>
                    <p className="text-sm text-charcoal-600">{selectedStakeholder.title}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedContact(null)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                {/* Contact Info */}
                <div>
                  <h4 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    {selectedStakeholder.email && (
                      <a
                        href={`mailto:${selectedStakeholder.email}`}
                        className="flex items-center gap-2 text-sm text-charcoal-700 hover:text-gold-600"
                      >
                        <Mail className="h-4 w-4" />
                        {selectedStakeholder.email}
                      </a>
                    )}
                    {selectedStakeholder.phone && (
                      <a
                        href={`tel:${selectedStakeholder.phone}`}
                        className="flex items-center gap-2 text-sm text-charcoal-700 hover:text-gold-600"
                      >
                        <Phone className="h-4 w-4" />
                        {selectedStakeholder.phone}
                      </a>
                    )}
                  </div>
                </div>

                {/* Role in Deal */}
                <div>
                  <h4 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                    Role in Deal
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-charcoal-500">Role</p>
                      <p className="text-sm font-medium text-charcoal-900 capitalize">
                        {selectedStakeholder.role?.replace(/_/g, ' ') || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-500">Influence</p>
                      <p className="text-sm font-medium text-charcoal-900 capitalize">
                        {selectedStakeholder.influenceLevel || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-500">Sentiment</p>
                      <p
                        className={cn(
                          'text-sm font-medium capitalize',
                          SENTIMENT_STYLES[selectedStakeholder.sentiment || ''] || 'text-charcoal-900'
                        )}
                      >
                        {selectedStakeholder.sentiment || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Engagement Notes */}
                {selectedStakeholder.engagementNotes && (
                  <div>
                    <h4 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                      Engagement Notes
                    </h4>
                    <p className="text-sm text-charcoal-700 bg-charcoal-50 p-3 rounded-lg">
                      {selectedStakeholder.engagementNotes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {selectedStakeholder.contactId && (
                  <div className="pt-4 border-t border-charcoal-100 flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/employee/contacts/${selectedStakeholder.contactId}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Contact
                      </a>
                    </Button>
                    {selectedStakeholder.email && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${selectedStakeholder.email}`}>
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default DealContactsSection
