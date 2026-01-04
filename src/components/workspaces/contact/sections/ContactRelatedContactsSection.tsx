'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Users, Phone, Mail, MoreVertical, ExternalLink,
  ChevronLeft, ChevronRight, Search, X,
  User, Building2, Crown, Star, Plus, Link2, UserPlus
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ContactRelatedContact } from '@/types/workspace'
import { cn } from '@/lib/utils'

// Constants
const ITEMS_PER_PAGE = 10

const DECISION_AUTHORITY_CONFIG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  final_decision: { label: 'Final Decision', icon: Crown, bg: 'bg-gold-50', text: 'text-gold-700' },
  recommender: { label: 'Recommender', icon: Star, bg: 'bg-purple-50', text: 'text-purple-700' },
  influencer: { label: 'Influencer', icon: Users, bg: 'bg-blue-50', text: 'text-blue-700' },
  evaluator: { label: 'Evaluator', icon: User, bg: 'bg-teal-50', text: 'text-teal-700' },
  end_user: { label: 'End User', icon: User, bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
}

interface ContactRelatedContactsSectionProps {
  relatedContacts: ContactRelatedContact[]
  contactId: string
  companyId: string | null
  companyName: string | null
  onNavigate?: (section: string) => void
}

/**
 * ContactRelatedContactsSection - Premium SaaS-level related contacts list
 * Shows other contacts at the same accounts
 */
export function ContactRelatedContactsSection({ relatedContacts, contactId, companyId, companyName, onNavigate: _onNavigate }: ContactRelatedContactsSectionProps) {
  const router = useRouter()

  const [selectedContact, setSelectedContact] = React.useState<ContactRelatedContact | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)

  // Filter contacts based on search
  const filteredContacts = React.useMemo(() => {
    if (!searchQuery.trim()) return relatedContacts

    const q = searchQuery.toLowerCase()
    return relatedContacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.title?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.decisionAuthority?.toLowerCase().includes(q)
    )
  }, [relatedContacts, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE)
  const paginatedContacts = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredContacts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredContacts, currentPage])

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const handleRowClick = (contact: ContactRelatedContact) => {
    if (selectedContact?.id === contact.id) {
      setSelectedContact(null)
    } else {
      setSelectedContact(contact)
    }
  }

  const getAvatarColors = (name: string) => {
    const colors = [
      'from-forest-400 to-forest-600',
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-teal-400 to-teal-600',
      'from-gold-400 to-gold-600',
    ]
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Premium List Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        {/* Header with gradient */}
        <div className="px-5 py-4 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50/80 via-white to-purple-50/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-sm">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Related Contacts</h3>
                <p className="text-xs text-charcoal-500">
                  {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} sharing accounts with this contact
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-64 text-sm border-charcoal-200 focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>
              {companyId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openContactDialog', {
                      detail: { dialogId: 'createRelatedContact', contactId, companyId, companyName }
                    }))
                  }}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Contact
                </Button>
              )}
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-sm"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openContactDialog', {
                    detail: { dialogId: 'linkRelatedContact', contactId }
                  }))
                }}
              >
                <Link2 className="h-4 w-4 mr-1.5" />
                Link Contact
              </Button>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[1fr_180px_130px_120px_80px_70px] gap-3 px-5 py-3 bg-charcoal-50/50 border-b border-charcoal-200/60 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
          <div>Contact</div>
          <div>Shared Account</div>
          <div>Title</div>
          <div>Decision Role</div>
          <div>Primary</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        {paginatedContacts.length > 0 ? (
          <div className="divide-y divide-charcoal-100/60">
            {paginatedContacts.map((contact, idx) => {
              const authorityConfig = contact.decisionAuthority
                ? DECISION_AUTHORITY_CONFIG[contact.decisionAuthority] || null
                : null
              const AuthorityIcon = authorityConfig?.icon || User

              return (
                <div
                  key={contact.id}
                  onClick={() => handleRowClick(contact)}
                  className={cn(
                    'group grid grid-cols-[1fr_180px_130px_120px_80px_70px] gap-3 px-5 py-3.5 cursor-pointer transition-all duration-200 items-center',
                    selectedContact?.id === contact.id
                      ? 'bg-purple-50/70 hover:bg-purple-50'
                      : 'hover:bg-charcoal-50/50'
                  )}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {/* Contact Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "relative w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105",
                      getAvatarColors(contact.name)
                    )}>
                      <span className="text-sm font-semibold text-white">
                        {getInitials(contact.name)}
                      </span>
                      {contact.isPrimary && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold-500 border-2 border-white flex items-center justify-center">
                          <Star className="h-2.5 w-2.5 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-charcoal-900 truncate block">{contact.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {contact.email && (
                          <span className="text-[11px] text-charcoal-500 truncate flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shared Account */}
                  <div className="min-w-0">
                    {contact.sharedAccounts && contact.sharedAccounts.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {contact.sharedAccounts.slice(0, 2).map((account) => (
                          <Badge
                            key={account.id}
                            variant="outline"
                            className="text-[10px] font-medium px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200 truncate max-w-[80px]"
                            title={account.name}
                          >
                            <Building2 className="h-2.5 w-2.5 mr-0.5 flex-shrink-0" />
                            <span className="truncate">{account.name}</span>
                          </Badge>
                        ))}
                        {contact.sharedAccounts.length > 2 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium px-1.5 py-0.5 bg-charcoal-100 text-charcoal-600 border-charcoal-200"
                            title={contact.sharedAccounts.slice(2).map(a => a.name).join(', ')}
                          >
                            +{contact.sharedAccounts.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-charcoal-300 text-sm">—</span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="text-sm text-charcoal-600 truncate">
                    {contact.title || <span className="text-charcoal-300">—</span>}
                  </div>

                  {/* Decision Role */}
                  <div>
                    {authorityConfig ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 border-0",
                          authorityConfig.bg,
                          authorityConfig.text
                        )}
                      >
                        <AuthorityIcon className="h-3 w-3 mr-1" />
                        {authorityConfig.label}
                      </Badge>
                    ) : (
                      <span className="text-charcoal-300 text-sm">—</span>
                    )}
                  </div>

                  {/* Primary Status */}
                  <div>
                    {contact.isPrimary ? (
                      <Badge className="bg-gold-100 text-gold-700 border-gold-200 text-xs">
                        <Star className="h-3 w-3 mr-1 fill-gold-500" />
                        Primary
                      </Badge>
                    ) : (
                      <span className="text-charcoal-300 text-sm">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4 text-charcoal-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/employee/recruiting/contacts/${contact.id}`}>
                            <div className="w-7 h-7 rounded-md bg-gold-100 flex items-center justify-center mr-2">
                              <ExternalLink className="h-3.5 w-3.5 text-gold-700" />
                            </div>
                            View Contact
                          </Link>
                        </DropdownMenuItem>
                        {contact.email && (
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${contact.email}`}>
                              <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center mr-2">
                                <Mail className="h-3.5 w-3.5 text-blue-700" />
                              </div>
                              Send Email
                            </a>
                          </DropdownMenuItem>
                        )}
                        {contact.phone && (
                          <DropdownMenuItem asChild>
                            <a href={`tel:${contact.phone}`}>
                              <div className="w-7 h-7 rounded-md bg-green-100 flex items-center justify-center mr-2">
                                <Phone className="h-3.5 w-3.5 text-green-700" />
                              </div>
                              Call
                            </a>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-charcoal-400" />
            </div>
            <p className="text-base font-medium text-charcoal-700">
              {searchQuery ? 'No matching contacts' : 'No related contacts'}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">
              {searchQuery
                ? 'Try adjusting your search'
                : companyId
                  ? 'Add contacts to this company to see them here'
                  : 'Related contacts will appear here when this contact shares accounts with others'}
            </p>
            {!searchQuery && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {companyId && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('openContactDialog', {
                        detail: { dialogId: 'createRelatedContact', contactId, companyId, companyName }
                      }))
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Create Contact
                  </Button>
                )}
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openContactDialog', {
                      detail: { dialogId: 'linkRelatedContact', contactId }
                    }))
                  }}
                >
                  <Link2 className="h-4 w-4 mr-1.5" />
                  Link Contact
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-charcoal-100 bg-charcoal-50/30 flex items-center justify-between">
            <p className="text-sm text-charcoal-500">
              Showing <span className="font-medium text-charcoal-700">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-medium text-charcoal-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredContacts.length)}</span> of <span className="font-medium text-charcoal-700">{filteredContacts.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-charcoal-600 min-w-[100px] text-center">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Premium Detail Panel */}
      {selectedContact && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-md overflow-hidden animate-slide-up">
          {/* Header with gradient */}
          <div className="relative px-6 py-4 bg-gradient-to-r from-charcoal-50 via-white to-purple-50/40 border-b border-charcoal-100">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-gold-500 to-purple-500" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "relative w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                  getAvatarColors(selectedContact.name)
                )}>
                  <span className="text-lg font-bold text-white">
                    {getInitials(selectedContact.name)}
                  </span>
                  {selectedContact.isPrimary && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gold-500 border-2 border-white flex items-center justify-center">
                      <Star className="h-3 w-3 text-white fill-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-charcoal-900">{selectedContact.name}</h3>
                    {selectedContact.isPrimary && (
                      <Badge className="bg-gold-100 text-gold-700 border-gold-200 text-xs">
                        Primary Contact
                      </Badge>
                    )}
                  </div>
                  {selectedContact.title && (
                    <p className="text-sm text-charcoal-500 mt-0.5">
                      {selectedContact.title}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/employee/recruiting/contacts/${selectedContact.id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> View Full Profile
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedContact(null)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Column 1 - Contact Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-charcoal-900">Contact Details</h4>
                  </div>
                  <div className="space-y-0">
                    <DisplayField label="Name" value={selectedContact.name} />
                    <DisplayField label="Title" value={selectedContact.title} />
                    <DisplayField
                      label="Email"
                      value={selectedContact.email}
                      icon={Mail}
                      href={selectedContact.email ? `mailto:${selectedContact.email}` : undefined}
                    />
                    <DisplayField
                      label="Phone"
                      value={selectedContact.phone}
                      icon={Phone}
                      href={selectedContact.phone ? `tel:${selectedContact.phone}` : undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Column 2 - Role Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                      <Crown className="h-4 w-4 text-purple-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-charcoal-900">Role & Authority</h4>
                  </div>
                  <div className="space-y-0">
                    <DisplayField
                      label="Primary"
                      value={selectedContact.isPrimary ? 'Yes' : 'No'}
                    />
                    {selectedContact.decisionAuthority && (
                      <DisplayField
                        label="Decision"
                        value={DECISION_AUTHORITY_CONFIG[selectedContact.decisionAuthority]?.label || selectedContact.decisionAuthority}
                      />
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 pt-4">
                  {selectedContact.email && (
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-charcoal-200/60 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-blue-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal-900 group-hover:text-blue-700">
                          Send Email
                        </p>
                        <p className="text-xs text-charcoal-500">{selectedContact.email}</p>
                      </div>
                    </a>
                  )}
                  {selectedContact.phone && (
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-charcoal-200/60 hover:border-green-300 hover:bg-green-50/50 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-green-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal-900 group-hover:text-green-700">
                          Call
                        </p>
                        <p className="text-xs text-charcoal-500">{selectedContact.phone}</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-charcoal-100 flex items-center justify-between">
              <p className="text-xs text-charcoal-500">
                View the full contact profile for more details
              </p>
              <Link
                href={`/employee/recruiting/contacts/${selectedContact.id}`}
                className="group inline-flex items-center gap-2 text-sm font-medium text-gold-700 hover:text-gold-800 transition-colors"
              >
                Go to Contact Profile
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Display field component
function DisplayField({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string
  value: string | null | undefined
  icon?: React.ElementType
  href?: string
}) {
  const content = (
    <div className={cn(
      "py-2.5 border-b border-charcoal-100/60 last:border-b-0 transition-colors",
      "grid grid-cols-[80px_1fr] gap-3 items-center hover:bg-charcoal-50/50 -mx-2 px-2 rounded-lg"
    )}>
      <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {Icon && value && (
          <div className="w-6 h-6 rounded-md bg-charcoal-100 flex items-center justify-center flex-shrink-0">
            <Icon className="h-3.5 w-3.5 text-charcoal-500" />
          </div>
        )}
        <span className={cn(
          "text-sm",
          value ? "text-charcoal-900 font-medium" : "text-charcoal-400 italic"
        )}>
          {value || '—'}
        </span>
      </div>
    </div>
  )

  if (href && value) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}

export default ContactRelatedContactsSection
