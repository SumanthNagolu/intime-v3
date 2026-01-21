'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  Mail,
  Phone,
} from 'lucide-react'
import { SectionHeader } from '../fields/SectionHeader'
import { FieldGrid } from '../layouts/FieldGrid'
import { CONTACT_ROLES, DECISION_AUTHORITY, getLabel } from '@/lib/accounts/constants'
import type { SectionMode, AccountContact, ContactsSectionData } from '@/lib/accounts/types'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

// ============ PROPS ============

interface ContactsSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: ContactsSectionData
  /** Handler for adding a contact */
  onAddContact?: (contact: AccountContact) => void
  /** Handler for updating a contact */
  onUpdateContact?: (id: string, contact: Partial<AccountContact>) => void
  /** Handler for removing a contact */
  onRemoveContact?: (id: string) => void
  /** Handler to enter edit mode (view mode) */
  onEdit?: () => void
  /** Save handler (for edit mode) */
  onSave?: () => Promise<void>
  /** Cancel handler (for edit mode) */
  onCancel?: () => void
  /** Loading state for save operation */
  isSaving?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
}

const DEFAULT_CONTACT: Partial<AccountContact> = {
  firstName: '',
  lastName: '',
  email: '',
  phone: { countryCode: 'US', number: '' },
  title: '',
  department: '',
  role: 'primary',
  decisionAuthority: 'influencer',
  isPrimary: false,
}

/**
 * ContactsSection - Unified component for Account Contacts
 *
 * Guidewire PCH Architecture:
 * - Same card-based layout in all modes (create, view, edit)
 * - Consistent table structure across wizard and detail view
 * - Mode determines editability, not layout
 */
export function ContactsSection({
  mode,
  data,
  onAddContact,
  onUpdateContact,
  onRemoveContact,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: ContactsSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = React.useState(false)
  const [currentContact, setCurrentContact] = React.useState<Partial<AccountContact>>(DEFAULT_CONTACT)

  // Reset editing state when mode changes
  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const isPanelOpen = isAddingNew || editingId !== null
  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  const handleEdit = () => {
    onEdit?.()
    setIsEditing(true)
  }

  const handleSectionSave = async () => {
    await onSave?.()
    setIsEditing(false)
  }

  const handleSectionCancel = () => {
    onCancel?.()
    setIsEditing(false)
  }

  const handleOpenAdd = () => {
    setEditingId(null)
    setIsAddingNew(true)
    setCurrentContact({
      ...DEFAULT_CONTACT,
      id: uuidv4(),
      isPrimary: data.contacts.length === 0,
    })
  }

  const handleOpenEdit = (contact: AccountContact) => {
    if (!isEditable) return
    setIsAddingNew(false)
    setEditingId(contact.id)
    setCurrentContact({ ...contact })
  }

  const handleClose = () => {
    setEditingId(null)
    setIsAddingNew(false)
    setCurrentContact(DEFAULT_CONTACT)
  }

  const handleContactSave = () => {
    if (!currentContact.firstName || !currentContact.lastName || !currentContact.email) {
      return
    }

    if (editingId) {
      onUpdateContact?.(editingId, currentContact)
    } else {
      onAddContact?.({
        ...currentContact,
        id: currentContact.id || uuidv4(),
      } as AccountContact)
    }
    handleClose()
  }

  const handleDelete = (id: string) => {
    onRemoveContact?.(id)
    if (editingId === id) {
      handleClose()
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Contacts"
          subtitle={`Key stakeholders and contacts (${data.contacts.length})`}
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSectionSave}
          onCancel={handleSectionCancel}
          isSaving={isSaving}
        />
      )}

      {/* Contacts Card */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Key Contacts</CardTitle>
            </div>
            {isEditable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAdd}
                className="gap-1.5"
                disabled={isPanelOpen}
              >
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contact Table */}
          {data.contacts.length > 0 ? (
            <div className="border border-charcoal-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-charcoal-50/50">
                    <TableHead className="font-semibold text-charcoal-700">Name</TableHead>
                    <TableHead className="font-semibold text-charcoal-700">Role</TableHead>
                    <TableHead className="font-semibold text-charcoal-700">Contact</TableHead>
                    <TableHead className="font-semibold text-charcoal-700 w-24">Primary</TableHead>
                    {isEditable && (
                      <TableHead className="font-semibold text-charcoal-700 w-20">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.contacts.map((contact) => (
                    <TableRow
                      key={contact.id}
                      className={cn(
                        'group transition-colors',
                        isEditable && 'hover:bg-charcoal-50/50 cursor-pointer',
                        editingId === contact.id && 'bg-gold-50'
                      )}
                      onClick={() => handleOpenEdit(contact)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-charcoal-900">
                            {contact.firstName} {contact.lastName}
                          </p>
                          {contact.title && (
                            <p className="text-sm text-charcoal-500">{contact.title}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {getLabel(CONTACT_ROLES, contact.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1 text-charcoal-600">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </span>
                          {contact.phone?.number && (
                            <span className="flex items-center gap-1 text-charcoal-500">
                              <Phone className="w-3 h-3" />
                              {contact.phone.number}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {contact.isPrimary && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
                            Primary
                          </Badge>
                        )}
                      </TableCell>
                      {isEditable && (
                        <TableCell>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-charcoal-400 hover:text-charcoal-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenEdit(contact)
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-charcoal-400 hover:text-red-500 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(contact.id)
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 bg-charcoal-50/50 rounded-lg border border-dashed border-charcoal-200">
              <Users className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
              <p className="text-sm text-charcoal-500 mb-1 font-medium">No contacts added yet</p>
              <p className="text-xs text-charcoal-400 mb-4">
                {isEditable
                  ? 'Click "Add Contact" to add your first stakeholder'
                  : 'No contacts have been added to this account'}
              </p>
              {isEditable && (
                <Button variant="outline" size="sm" onClick={handleOpenAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              )}
            </div>
          )}

          {/* Inline Edit Panel */}
          {isPanelOpen && (
            <div className="w-full border border-charcoal-200 rounded-lg bg-white animate-in slide-in-from-bottom duration-300">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-charcoal-200">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal-900">
                    {isAddingNew ? 'Add New Contact' : 'Edit Contact'}
                  </h3>
                  <p className="text-sm text-charcoal-500">Enter the contact details</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Panel Content */}
              <div className="p-4 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                    Basic Information
                  </h4>
                  <FieldGrid cols={2}>
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input
                        value={currentContact.firstName || ''}
                        onChange={(e) =>
                          setCurrentContact((prev) => ({ ...prev, firstName: e.target.value }))
                        }
                        placeholder="John"
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input
                        value={currentContact.lastName || ''}
                        onChange={(e) =>
                          setCurrentContact((prev) => ({ ...prev, lastName: e.target.value }))
                        }
                        placeholder="Smith"
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={currentContact.email || ''}
                        onChange={(e) =>
                          setCurrentContact((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="john.smith@example.com"
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <PhoneInput
                        value={currentContact.phone || { countryCode: 'US', number: '' }}
                        onChange={(phone) =>
                          setCurrentContact((prev) => ({ ...prev, phone }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={currentContact.title || ''}
                        onChange={(e) =>
                          setCurrentContact((prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="VP of Engineering"
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input
                        value={currentContact.department || ''}
                        onChange={(e) =>
                          setCurrentContact((prev) => ({ ...prev, department: e.target.value }))
                        }
                        placeholder="Engineering"
                        className="h-11 rounded-lg"
                      />
                    </div>
                  </FieldGrid>
                </div>

                {/* Role & Authority */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                    Role & Authority
                  </h4>
                  <FieldGrid cols={2}>
                    <div className="space-y-2">
                      <Label>Contact Role</Label>
                      <Select
                        value={currentContact.role}
                        onValueChange={(v) =>
                          setCurrentContact((prev) => ({
                            ...prev,
                            role: v as AccountContact['role'],
                          }))
                        }
                      >
                        <SelectTrigger className="h-11 rounded-lg">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTACT_ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Decision Authority</Label>
                      <Select
                        value={currentContact.decisionAuthority}
                        onValueChange={(v) =>
                          setCurrentContact((prev) => ({
                            ...prev,
                            decisionAuthority: v as AccountContact['decisionAuthority'],
                          }))
                        }
                      >
                        <SelectTrigger className="h-11 rounded-lg">
                          <SelectValue placeholder="Select authority" />
                        </SelectTrigger>
                        <SelectContent>
                          {DECISION_AUTHORITY.map((auth) => (
                            <SelectItem key={auth.value} value={auth.value}>
                              {auth.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FieldGrid>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isPrimary"
                      checked={currentContact.isPrimary}
                      onCheckedChange={(checked) =>
                        setCurrentContact((prev) => ({ ...prev, isPrimary: !!checked }))
                      }
                    />
                    <Label htmlFor="isPrimary" className="cursor-pointer">
                      Primary Contact for this Account
                    </Label>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={currentContact.notes || ''}
                    onChange={(e) =>
                      setCurrentContact((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Additional notes about this contact..."
                    rows={3}
                    className="rounded-lg"
                  />
                </div>
              </div>

              {/* Panel Footer */}
              <div className="flex items-center justify-end gap-2 p-4 border-t border-charcoal-200">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleContactSave}
                  className="bg-gold-500 hover:bg-gold-600 text-white border-none"
                >
                  {isAddingNew ? 'Add Contact' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ContactsSection
