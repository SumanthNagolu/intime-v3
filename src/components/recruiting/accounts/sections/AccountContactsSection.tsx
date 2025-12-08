'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Loader2 } from 'lucide-react'
import { ContactInlinePanel } from '../ContactInlinePanel'
import { cn } from '@/lib/utils'

interface AccountContactsSectionProps {
  accountId: string
  onAddContact: () => void
}

/**
 * Contacts Section - Isolated component with self-contained query
 * Uses inline panel for detail view (Guidewire pattern)
 *
 * Trigger: Rendered when section === 'contacts'
 * DB Call: contacts.listByAccount({ accountId })
 */
export function AccountContactsSection({ accountId, onAddContact }: AccountContactsSectionProps) {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)

  // This query fires when this component is rendered
  const contactsQuery = trpc.crm.contacts.listByAccount.useQuery({ accountId })
  const contacts = contactsQuery.data || []

  const handleContactClick = (contactId: string) => {
    setSelectedContactId(contactId)
  }

  const handleClosePanel = () => {
    setSelectedContactId(null)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Contacts</CardTitle>
          <CardDescription>People associated with this account</CardDescription>
        </div>
        <Button onClick={onAddContact}>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Contact list */}
          <div className={cn(
            'flex-1 transition-all duration-300',
            selectedContactId ? 'max-w-[calc(100%-496px)]' : 'max-w-full'
          )}>
            {contactsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                <p className="text-charcoal-500">No contacts yet</p>
                <Button className="mt-4" onClick={onAddContact}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Contact
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {contacts.map((contact: any) => (
                  <div
                    key={contact.id}
                    onClick={() => handleContactClick(contact.id)}
                    className={cn(
                      'p-4 border rounded-lg transition-colors cursor-pointer',
                      selectedContactId === contact.id
                        ? 'border-hublot-500 bg-hublot-50'
                        : 'hover:border-hublot-300'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-hublot-100 flex items-center justify-center flex-shrink-0">
                        <span className="font-medium text-hublot-700">
                          {contact.first_name?.[0]}{contact.last_name?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-charcoal-900 truncate">
                            {contact.first_name} {contact.last_name}
                          </p>
                          {contact.is_primary && (
                            <Badge variant="outline" className="text-xs">Primary</Badge>
                          )}
                        </div>
                        <p className="text-sm text-charcoal-500 truncate">{contact.title}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-charcoal-500">
                          {contact.email && (
                            <span className="truncate">{contact.email}</span>
                          )}
                          {contact.phone && <span>{contact.phone}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inline detail panel */}
          <ContactInlinePanel
            contactId={selectedContactId}
            accountId={accountId}
            onClose={handleClosePanel}
          />
        </div>
      </CardContent>
    </Card>
  )
}
