'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Mail, Phone, Star, MoreVertical, Linkedin, Activity,
  UserCog, Users, MapPin, Building2,
  ArrowRight, X, Pencil, Check, Loader2, ChevronLeft, ChevronRight,
  Search, MessageSquare, UserPlus, ExternalLink, Sparkles, Globe, Link2, Plus
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AccountContact } from '@/types/workspace'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useAccountWorkspace } from '@/components/workspaces/account/AccountWorkspaceProvider'
import { 
  getStatesByCountry, 
  OPERATING_COUNTRIES,
} from '@/components/addresses'
import { PostalCodeInput } from '@/components/ui/postal-code-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  PhoneInput, 
  PhoneDisplay,
  parsePhoneValue, 
  formatPhoneValue,
  PHONE_COUNTRY_CODES,
  type PhoneCountryCode,
} from '@/components/ui/phone-input'

// Phone value type for form state
interface PhoneValue {
  countryCode: PhoneCountryCode
  number: string
}

// Constants
const ITEMS_PER_PAGE = 10

const DECISION_AUTHORITY_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  decision_maker: { label: 'Decision Maker', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  influencer: { label: 'Influencer', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  gatekeeper: { label: 'Gatekeeper', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  end_user: { label: 'End User', bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
  champion: { label: 'Champion', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
}

const CONTACT_METHOD_LABELS: Record<string, string> = {
  email: 'Email',
  phone: 'Phone',
  linkedin: 'LinkedIn',
  text: 'Text/SMS',
  video_call: 'Video Call',
}

interface AccountContactsSectionProps {
  contacts: AccountContact[]
  accountId: string
}

// Premium Editable field component
function EditableField({ 
  label, 
  value, 
  isEditing, 
  onChange,
  type = 'text',
  icon: Icon,
  href,
  error,
  required,
  placeholder,
}: { 
  label: string
  value: string | null | undefined
  isEditing: boolean
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'tel' | 'url'
  icon?: React.ElementType
  href?: string
  error?: string
  required?: boolean
  placeholder?: string
}) {
  const content = (
    <div className={cn(
      "py-2.5 border-b border-charcoal-100/60 last:border-b-0 transition-colors",
      isEditing ? "grid grid-cols-[100px_1fr] gap-3 items-start" : "grid grid-cols-[100px_1fr] gap-3 items-center hover:bg-charcoal-50/50 -mx-2 px-2 rounded-lg"
    )}>
      <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
        {label}
        {required && isEditing && <span className="text-error-500 ml-0.5">*</span>}
      </span>
      {isEditing ? (
        <div>
          <Input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "h-8 text-sm border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20",
              error && "border-error-400 focus:border-error-500 focus:ring-error-500/20"
            )}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          />
          {error && (
            <p className="text-xs text-error-500 mt-1">{error}</p>
          )}
        </div>
      ) : (
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
      )}
    </div>
  )

  if (href && value && !isEditing) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}

/**
 * AccountContactsSection - Premium SaaS-level contact list
 * Features: Glassmorphism, rich gradients, sophisticated animations
 */
export function AccountContactsSection({ contacts, accountId }: AccountContactsSectionProps) {
  const { toast } = useToast()
  const { refreshData } = useAccountWorkspace()
  
  const [selectedContact, setSelectedContact] = React.useState<AccountContact | null>(null)
  const [isEditing, setIsEditing] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  
  // Edit form state
  const [editForm, setEditForm] = React.useState({
    name: '',
    title: '',
    department: '',
    email: '',
    phone: { countryCode: 'US' as PhoneCountryCode, number: '' } as PhoneValue,
    mobile: { countryCode: 'US' as PhoneCountryCode, number: '' } as PhoneValue,
    linkedinUrl: '',
    decisionAuthority: '',
    preferredContactMethod: '',
    notes: '',
  })
  
  // Address form state
  const [addressForm, setAddressForm] = React.useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })
  
  // Validation errors
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Update mutation
  const updateMutation = trpc.crm.contacts.update.useMutation({
    onSuccess: () => {
      // Don't show success toast here, we'll show it after address save
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })
  
  // Address upsert mutation
  const addressMutation = trpc.addresses.upsertForEntity.useMutation({
    onSuccess: () => {
      toast({ title: 'Contact updated successfully' })
      refreshData()
      setIsEditing(false)
      setSelectedContact(null)
      setErrors({})
    },
    onError: (error) => {
      toast({ title: 'Error saving address', description: error.message, variant: 'error' })
    },
  })

  // Initialize edit form when contact is selected
  React.useEffect(() => {
    if (selectedContact) {
      setEditForm({
        name: selectedContact.name,
        title: selectedContact.title || '',
        department: selectedContact.department || '',
        email: selectedContact.email || '',
        phone: parsePhoneValue(selectedContact.phone),
        mobile: parsePhoneValue(selectedContact.mobile),
        linkedinUrl: selectedContact.linkedinUrl || '',
        decisionAuthority: selectedContact.decisionAuthority || '',
        preferredContactMethod: selectedContact.preferredContactMethod || '',
        notes: selectedContact.notes || '',
      })
      
      const address = selectedContact.addresses?.[0]
      setAddressForm({
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        zip: address?.zip || '',
        country: address?.country || 'US',
      })
      
      setErrors({})
    }
  }, [selectedContact])

  // Get state options based on country
  const stateOptions = getStatesByCountry(addressForm.country || 'US')
  
  // Handle country change
  const handleCountryChange = (value: string) => {
    setAddressForm(f => ({ ...f, country: value, state: '', zip: '' }))
    setErrors(prev => {
      const { zip, ...rest } = prev
      return rest
    })
  }

  // Filter contacts based on search
  const filteredContacts = React.useMemo(() => {
    if (!searchQuery.trim()) return contacts
    const q = searchQuery.toLowerCase()
    return contacts.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.title?.toLowerCase().includes(q) ||
      c.department?.toLowerCase().includes(q)
    )
  }, [contacts, searchQuery])

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

  // Helper to validate phone number based on country
  const validatePhoneByCountry = (phone: PhoneValue, fieldName: string): string | null => {
    if (!phone.number) return null // Empty is valid (optional field)
    
    const config = PHONE_COUNTRY_CODES.find(c => c.code === phone.countryCode)
    if (!config) return null
    
    if (phone.number.length < config.maxDigits) {
      return `${fieldName} must be ${config.maxDigits} digits for ${config.label}`
    }
    if (phone.number.length > config.maxDigits) {
      return `${fieldName} cannot exceed ${config.maxDigits} digits for ${config.label}`
    }
    return null
  }

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!editForm.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (editForm.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(editForm.email.trim())) {
        newErrors.email = 'Invalid email format'
      }
    }
    
    // Phone validation based on country
    const phoneError = validatePhoneByCountry(editForm.phone, 'Phone')
    if (phoneError) newErrors.phone = phoneError
    
    const mobileError = validatePhoneByCountry(editForm.mobile, 'Mobile')
    if (mobileError) newErrors.mobile = mobileError
    
    if (editForm.linkedinUrl.trim() && !editForm.linkedinUrl.trim().match(/^https?:\/\/(www\.)?linkedin\.com\//)) {
      newErrors.linkedinUrl = 'Invalid LinkedIn URL'
    }
    
    const hasAnyAddressField = addressForm.street || addressForm.city || addressForm.state || addressForm.zip
    if (hasAnyAddressField) {
      if (!addressForm.street.trim()) newErrors.street = 'Street is required'
      if (!addressForm.city.trim()) newErrors.city = 'City is required'
      if (!addressForm.state.trim()) newErrors.state = 'State is required'
      if (!addressForm.zip.trim()) newErrors.zip = 'ZIP/Postal code is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSave = async () => {
    if (!selectedContact) return
    
    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fix the errors below', variant: 'error' })
      return
    }
    
    const nameParts = editForm.name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    try {
      // Format phone values for API
      const formattedPhone = formatPhoneValue(editForm.phone)
      const formattedMobile = formatPhoneValue(editForm.mobile)
      
      await updateMutation.mutateAsync({
        id: selectedContact.id,
        firstName,
        lastName: lastName || undefined,
        title: editForm.title.trim() || undefined,
        department: editForm.department.trim() || undefined,
        email: editForm.email.trim() || undefined,
        phone: formattedPhone || undefined,
        mobile: formattedMobile || undefined,
        linkedinUrl: editForm.linkedinUrl.trim() || undefined,
        decisionAuthority: (editForm.decisionAuthority || undefined) as 'decision_maker' | 'influencer' | 'gatekeeper' | 'end_user' | 'champion' | undefined,
        preferredContactMethod: (editForm.preferredContactMethod || undefined) as 'email' | 'phone' | 'linkedin' | 'text' | 'video_call' | undefined,
        notes: editForm.notes.trim() || undefined,
      })
      
      const hasAddress = addressForm.street.trim() || addressForm.city.trim()
      if (hasAddress) {
        const addressPayload = {
          entityType: 'contact' as const,
          entityId: selectedContact.id,
          addressType: 'work' as const,
          addressLine1: addressForm.street.trim() || undefined,
          city: addressForm.city.trim() || undefined,
          stateProvince: addressForm.state.trim() || undefined,
          postalCode: addressForm.zip.trim() || undefined,
          countryCode: addressForm.country || 'US',
          isPrimary: true,
        }
        await addressMutation.mutateAsync(addressPayload)
      } else {
        toast({ title: 'Contact updated successfully' })
        refreshData()
        setIsEditing(false)
        setSelectedContact(null)
        setErrors({})
      }
    } catch {
      // Error already handled by mutation onError
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setErrors({})
    if (selectedContact) {
      setEditForm({
        name: selectedContact.name,
        title: selectedContact.title || '',
        department: selectedContact.department || '',
        email: selectedContact.email || '',
        phone: parsePhoneValue(selectedContact.phone),
        mobile: parsePhoneValue(selectedContact.mobile),
        linkedinUrl: selectedContact.linkedinUrl || '',
        decisionAuthority: selectedContact.decisionAuthority || '',
        preferredContactMethod: selectedContact.preferredContactMethod || '',
        notes: selectedContact.notes || '',
      })
      
      const address = selectedContact.addresses?.[0]
      setAddressForm({
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        zip: address?.zip || '',
        country: address?.country || 'US',
      })
    }
  }

  const handleRowClick = (contact: AccountContact) => {
    if (selectedContact?.id === contact.id) {
      setSelectedContact(null)
      setIsEditing(false)
    } else {
      setSelectedContact(contact)
      setIsEditing(false)
    }
  }

  const handleQuickAction = (action: string, contact: AccountContact, e: React.MouseEvent) => {
    e.stopPropagation()
    switch (action) {
      case 'email':
        window.location.href = `mailto:${contact.email}`
        break
      case 'call':
        window.location.href = `tel:${contact.phone}`
        break
      case 'logActivity':
        window.dispatchEvent(new CustomEvent('openEntityDialog', { 
          detail: { dialogId: 'logActivity', entityType: 'contact', entityId: contact.id } 
        }))
        break
    }
  }

  const getPrimaryAddress = (contact: AccountContact) => {
    if (!contact.addresses?.length) return null
    return contact.addresses.find(a => a.isPrimary) || contact.addresses[0]
  }

  const getAvatarColors = (name: string, isPrimary?: boolean) => {
    if (isPrimary) return 'from-gold-400 to-gold-600'
    const colors = [
      'from-forest-400 to-forest-600',
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-teal-400 to-teal-600',
    ]
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Premium List Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        {/* Header with gradient */}
        <div className="px-5 py-4 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50/80 via-white to-gold-50/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-sm">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Contacts</h3>
                <p className="text-xs text-charcoal-500">
                  {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} associated with this account
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
                  className="pl-9 h-9 w-64 text-sm border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-forest-300 text-forest-700 hover:bg-forest-50"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openAccountDialog', {
                    detail: { dialogId: 'addContact', accountId }
                  }))
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create Contact
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white shadow-sm"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openAccountDialog', {
                    detail: { dialogId: 'linkContact', accountId }
                  }))
                }}
              >
                <Link2 className="h-4 w-4 mr-1.5" />
                Link Contact
              </Button>
            </div>
          </div>
        </div>

        {/* Table Header - Premium styling */}
        <div className="grid grid-cols-[1fr_140px_140px_180px_120px_90px] gap-3 px-5 py-3 bg-charcoal-50/50 border-b border-charcoal-200/60 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
          <div>Contact</div>
          <div>Title</div>
          <div>Authority</div>
          <div>Email</div>
          <div>Phone</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        {paginatedContacts.length > 0 ? (
          <div className="divide-y divide-charcoal-100/60">
            {paginatedContacts.map((contact, idx) => (
              <div
                key={contact.id}
                onClick={() => handleRowClick(contact)}
                className={cn(
                  'group grid grid-cols-[1fr_140px_140px_180px_120px_90px] gap-3 px-5 py-3.5 cursor-pointer transition-all duration-200 items-center',
                  selectedContact?.id === contact.id 
                    ? 'bg-gold-50/70 hover:bg-gold-50' 
                    : 'hover:bg-charcoal-50/50'
                )}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                {/* Contact Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "relative w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105",
                    getAvatarColors(contact.name, contact.isPrimary)
                  )}>
                    <span className="text-sm font-semibold text-white">
                      {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                    {contact.isPrimary && (
                      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold-400 flex items-center justify-center shadow-sm border-2 border-white">
                        <Star className="h-2.5 w-2.5 text-charcoal-900 fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-charcoal-900 truncate">{contact.name}</span>
                    </div>
                    {contact.department && (
                      <p className="text-xs text-charcoal-500 truncate">{contact.department}</p>
                    )}
                  </div>
                </div>
                
                {/* Title */}
                <div className="text-sm text-charcoal-600 truncate">
                  {contact.title || <span className="text-charcoal-300">—</span>}
                </div>
                
                {/* Authority */}
                <div>
                  {contact.decisionAuthority ? (
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 border-0",
                        DECISION_AUTHORITY_CONFIG[contact.decisionAuthority]?.bg,
                        DECISION_AUTHORITY_CONFIG[contact.decisionAuthority]?.text
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", DECISION_AUTHORITY_CONFIG[contact.decisionAuthority]?.dot)} />
                      {DECISION_AUTHORITY_CONFIG[contact.decisionAuthority]?.label || contact.decisionAuthority}
                    </Badge>
                  ) : (
                    <span className="text-charcoal-300 text-sm">—</span>
                  )}
                </div>
                
                {/* Email */}
                <div className="text-sm text-charcoal-600 truncate">
                  {contact.email || <span className="text-charcoal-300">—</span>}
                </div>
                
                {/* Phone */}
                <div className="text-sm text-charcoal-600 truncate">
                  {contact.phone || <span className="text-charcoal-300">—</span>}
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  {contact.email && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-gold-100 transition-colors"
                      onClick={(e) => handleQuickAction('email', contact, e)}
                      title="Send email"
                    >
                      <Mail className="h-4 w-4 text-charcoal-400 hover:text-gold-600" />
                    </Button>
                  )}
                  {contact.phone && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-green-100 transition-colors"
                      onClick={(e) => handleQuickAction('call', contact, e)}
                      title="Call"
                    >
                      <Phone className="h-4 w-4 text-charcoal-400 hover:text-green-600" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4 text-charcoal-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={(e) => handleQuickAction('logActivity', contact, e as unknown as React.MouseEvent)}>
                        <div className="w-7 h-7 rounded-md bg-charcoal-100 flex items-center justify-center mr-2">
                          <Activity className="h-3.5 w-3.5 text-charcoal-600" />
                        </div>
                        Log Activity
                      </DropdownMenuItem>
                      {contact.linkedinUrl && (
                        <DropdownMenuItem onClick={() => window.open(contact.linkedinUrl!, '_blank')}>
                          <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center mr-2">
                            <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          View LinkedIn
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/employee/recruiting/contacts/${contact.id}`}>
                          <div className="w-7 h-7 rounded-md bg-gold-100 flex items-center justify-center mr-2">
                            <ExternalLink className="h-3.5 w-3.5 text-gold-700" />
                          </div>
                          View Full Profile
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-charcoal-400" />
            </div>
            <p className="text-base font-medium text-charcoal-700">
              {searchQuery ? 'No contacts match your search' : 'No contacts yet'}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">
              {searchQuery ? 'Try a different search term' : 'Add your first contact to get started'}
            </p>
            {!searchQuery && (
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-forest-300 text-forest-700 hover:bg-forest-50"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openAccountDialog', {
                      detail: { dialogId: 'addContact', accountId }
                    }))
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Create Contact
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openAccountDialog', {
                      detail: { dialogId: 'linkContact', accountId }
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
          <div className="relative px-6 py-4 bg-gradient-to-r from-charcoal-50 via-white to-gold-50/40 border-b border-charcoal-100">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-forest-500 via-gold-500 to-forest-500" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "relative w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                  getAvatarColors(selectedContact.name, selectedContact.isPrimary)
                )}>
                  <span className="text-lg font-bold text-white">
                    {selectedContact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  {selectedContact.isPrimary && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-400 flex items-center justify-center shadow-sm border-2 border-white">
                      <Star className="h-3 w-3 text-charcoal-900 fill-current" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-charcoal-900">{selectedContact.name}</h3>
                    {selectedContact.isPrimary && (
                      <Badge className="bg-gold-100 text-gold-800 border-gold-200 text-xs">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Primary
                      </Badge>
                    )}
                    {selectedContact.decisionAuthority && (
                      <Badge 
                        variant="outline"
                        className={cn(
                          "text-xs font-medium border-0",
                          DECISION_AUTHORITY_CONFIG[selectedContact.decisionAuthority]?.bg,
                          DECISION_AUTHORITY_CONFIG[selectedContact.decisionAuthority]?.text
                        )}
                      >
                        {DECISION_AUTHORITY_CONFIG[selectedContact.decisionAuthority]?.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-charcoal-500 mt-0.5">
                    {selectedContact.title && <span className="font-medium text-charcoal-600">{selectedContact.title}</span>}
                    {selectedContact.title && selectedContact.department && <span className="mx-1.5">•</span>}
                    {selectedContact.department && <span>{selectedContact.department}</span>}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleCancel} disabled={updateMutation.isPending || addressMutation.isPending}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSave} 
                      disabled={updateMutation.isPending || addressMutation.isPending}
                      className="bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white"
                    >
                      {(updateMutation.isPending || addressMutation.isPending) 
                        ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> 
                        : <Check className="h-4 w-4 mr-1" />
                      }
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => { setSelectedContact(null); setIsEditing(false) }} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content - Three Column Layout */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-8">
              {/* Column 1 - Person & Contact */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-charcoal-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-charcoal-900">Person</h4>
                  </div>
                  <div className="space-y-0">
                    <EditableField label="Name" value={isEditing ? editForm.name : selectedContact.name} isEditing={isEditing} onChange={(v) => setEditForm(f => ({ ...f, name: v }))} error={errors.name} required placeholder="John Smith" />
                    <EditableField label="Title" value={isEditing ? editForm.title : selectedContact.title} isEditing={isEditing} onChange={(v) => setEditForm(f => ({ ...f, title: v }))} placeholder="Senior Manager" />
                    <EditableField label="Department" value={isEditing ? editForm.department : selectedContact.department} isEditing={isEditing} onChange={(v) => setEditForm(f => ({ ...f, department: v }))} placeholder="Engineering" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-charcoal-900">Contact</h4>
                  </div>
                  <div className="space-y-0">
                    <EditableField label="Email" value={isEditing ? editForm.email : selectedContact.email} isEditing={isEditing} onChange={(v) => setEditForm(f => ({ ...f, email: v }))} type="email" icon={Mail} href={selectedContact.email ? `mailto:${selectedContact.email}` : undefined} error={errors.email} placeholder="john@company.com" />
                    
                    {/* Phone with country-based validation */}
                    {isEditing ? (
                      <div className="py-2.5 border-b border-charcoal-100/60">
                        <PhoneInput
                          label="Phone"
                          value={editForm.phone}
                          onChange={(v) => setEditForm(f => ({ ...f, phone: v }))}
                          error={errors.phone}
                          className="[&>label]:text-xs [&>label]:font-medium [&>label]:text-charcoal-500 [&>label]:uppercase [&>label]:tracking-wider"
                        />
                      </div>
                    ) : (
                      <div className={cn(
                        "py-2.5 border-b border-charcoal-100/60 last:border-b-0 transition-colors",
                        "grid grid-cols-[100px_1fr] gap-3 items-center hover:bg-charcoal-50/50 -mx-2 px-2 rounded-lg"
                      )}>
                        <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Phone</span>
                        <div className="flex items-center gap-2">
                          {selectedContact.phone ? (
                            <a href={`tel:${selectedContact.phone}`} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                                <Phone className="h-3.5 w-3.5 text-charcoal-500" />
                              </div>
                              <PhoneDisplay countryCode={parsePhoneValue(selectedContact.phone).countryCode} number={parsePhoneValue(selectedContact.phone).number} showIcon={false} className="font-medium" />
                            </a>
                          ) : (
                            <span className="text-sm text-charcoal-400 italic">—</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Mobile with country-based validation */}
                    {isEditing ? (
                      <div className="py-2.5 border-b border-charcoal-100/60">
                        <PhoneInput
                          label="Mobile"
                          value={editForm.mobile}
                          onChange={(v) => setEditForm(f => ({ ...f, mobile: v }))}
                          error={errors.mobile}
                          className="[&>label]:text-xs [&>label]:font-medium [&>label]:text-charcoal-500 [&>label]:uppercase [&>label]:tracking-wider"
                        />
                      </div>
                    ) : (
                      <div className={cn(
                        "py-2.5 border-b border-charcoal-100/60 last:border-b-0 transition-colors",
                        "grid grid-cols-[100px_1fr] gap-3 items-center hover:bg-charcoal-50/50 -mx-2 px-2 rounded-lg"
                      )}>
                        <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Mobile</span>
                        <div className="flex items-center gap-2">
                          {selectedContact.mobile ? (
                            <a href={`tel:${selectedContact.mobile}`} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                                <Phone className="h-3.5 w-3.5 text-charcoal-500" />
                              </div>
                              <PhoneDisplay countryCode={parsePhoneValue(selectedContact.mobile).countryCode} number={parsePhoneValue(selectedContact.mobile).number} showIcon={false} className="font-medium" />
                            </a>
                          ) : (
                            <span className="text-sm text-charcoal-400 italic">—</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <EditableField label="LinkedIn" value={isEditing ? editForm.linkedinUrl : selectedContact.linkedinUrl} isEditing={isEditing} onChange={(v) => setEditForm(f => ({ ...f, linkedinUrl: v }))} type="url" icon={Linkedin} href={selectedContact.linkedinUrl || undefined} error={errors.linkedinUrl} placeholder="https://linkedin.com/in/..." />
                  </div>
                </div>
              </div>

              {/* Column 2 - Address & Account Role */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-charcoal-900">Address</h4>
                  </div>
                  {isEditing ? (
                    <div className="space-y-0">
                      <EditableField label="Street" value={addressForm.street} isEditing={true} onChange={(v) => setAddressForm(f => ({ ...f, street: v }))} error={errors.street} placeholder="123 Main Street" />
                      <EditableField label="City" value={addressForm.city} isEditing={true} onChange={(v) => setAddressForm(f => ({ ...f, city: v }))} error={errors.city} placeholder="San Francisco" />
                      <div className="py-2.5 border-b border-charcoal-100/60 grid grid-cols-[100px_1fr] gap-3 items-start">
                        <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">State</span>
                        <Select value={addressForm.state} onValueChange={(v) => setAddressForm(f => ({ ...f, state: v }))}>
                          <SelectTrigger className={cn("h-8 text-sm border-charcoal-200", errors.state && "border-error-400")}>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {stateOptions.map((state) => (
                              <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="py-2.5 border-b border-charcoal-100/60 grid grid-cols-[100px_1fr] gap-3 items-start">
                        <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">ZIP Code</span>
                        <PostalCodeInput value={addressForm.zip} onChange={(v) => setAddressForm(f => ({ ...f, zip: v }))} countryCode={addressForm.country || 'US'} error={errors.zip} className="[&>*:first-child]:hidden [&_input]:h-8 [&_input]:text-sm" />
                      </div>
                      <div className="py-2.5 border-b border-charcoal-100/60 grid grid-cols-[100px_1fr] gap-3 items-start">
                        <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Country</span>
                        <Select value={addressForm.country || 'US'} onValueChange={handleCountryChange}>
                          <SelectTrigger className="h-8 text-sm border-charcoal-200"><SelectValue placeholder="Select country" /></SelectTrigger>
                          <SelectContent>
                            {OPERATING_COUNTRIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    (() => {
                      const address = getPrimaryAddress(selectedContact)
                      if (address) {
                        return (
                          <div className="space-y-0">
                            <EditableField label="Street" value={address.street} isEditing={false} onChange={() => {}} />
                            <EditableField label="City" value={address.city} isEditing={false} onChange={() => {}} />
                            <EditableField label="State" value={address.state} isEditing={false} onChange={() => {}} />
                            <EditableField label="ZIP" value={address.zip} isEditing={false} onChange={() => {}} />
                            <EditableField label="Country" value={address.country} isEditing={false} onChange={() => {}} icon={Globe} />
                          </div>
                        )
                      }
                      return (
                        <div className="py-8 text-center bg-gradient-to-br from-charcoal-50 to-white rounded-lg border border-charcoal-100/60">
                          <MapPin className="h-8 w-8 text-charcoal-300 mx-auto mb-2" />
                          <p className="text-sm text-charcoal-500">No address on file</p>
                          <p className="text-xs text-charcoal-400 mt-0.5">Click Edit to add one</p>
                        </div>
                      )
                    })()
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                      <UserCog className="h-4 w-4 text-purple-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-charcoal-900">Account Role</h4>
                  </div>
                  {isEditing ? (
                    <div className="space-y-0">
                      <div className="py-2.5 border-b border-charcoal-100/60 grid grid-cols-[100px_1fr] gap-3 items-start">
                        <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Authority</span>
                        <Select value={editForm.decisionAuthority} onValueChange={(v) => setEditForm(f => ({ ...f, decisionAuthority: v }))}>
                          <SelectTrigger className="h-8 text-sm border-charcoal-200"><SelectValue placeholder="Select role" /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(DECISION_AUTHORITY_CONFIG).map(([value, config]) => (<SelectItem key={value} value={value}>{config.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="py-2.5 border-b border-charcoal-100/60 grid grid-cols-[100px_1fr] gap-3 items-start">
                        <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Contact Via</span>
                        <Select value={editForm.preferredContactMethod} onValueChange={(v) => setEditForm(f => ({ ...f, preferredContactMethod: v }))}>
                          <SelectTrigger className="h-8 text-sm border-charcoal-200"><SelectValue placeholder="Select method" /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(CONTACT_METHOD_LABELS).map(([value, label]) => (<SelectItem key={value} value={value}>{label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      <EditableField label="Authority" value={selectedContact.decisionAuthority ? DECISION_AUTHORITY_CONFIG[selectedContact.decisionAuthority]?.label || selectedContact.decisionAuthority : null} isEditing={false} onChange={() => {}} icon={UserCog} />
                      <EditableField label="Contact Via" value={selectedContact.preferredContactMethod ? CONTACT_METHOD_LABELS[selectedContact.preferredContactMethod] || selectedContact.preferredContactMethod : null} isEditing={false} onChange={() => {}} icon={MessageSquare} />
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3 - Notes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-charcoal-900">Notes</h4>
                </div>
                {isEditing ? (
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Add notes about this contact..."
                    rows={12}
                    className="resize-y text-sm min-h-[240px] border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20"
                  />
                ) : (
                  <div className="text-sm text-charcoal-700 whitespace-pre-wrap bg-gradient-to-br from-charcoal-50 to-white rounded-lg border border-charcoal-100/60 p-4 min-h-[240px]">
                    {selectedContact.notes || <span className="text-charcoal-400 italic">No notes yet</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-charcoal-100 flex items-center justify-between">
              <p className="text-xs text-charcoal-500">
                View complete profile for activities, history, and more
              </p>
              <Link 
                href={`/employee/recruiting/contacts/${selectedContact.id}`} 
                className="group inline-flex items-center gap-2 text-sm font-medium text-gold-700 hover:text-gold-800 transition-colors"
              >
                Go to Full Profile 
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountContactsSection
