'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  useCreateAccountStore,
  AccountContact,
  PhoneValue,
} from '@/stores/create-account-store'
import { Section } from './shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  X,
  Briefcase,
  CheckCircle2,
  Linkedin,
  Globe,
  Clock,
  MessageSquare,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const CONTACT_ROLES = [
  { value: 'primary', label: 'Primary Contact' },
  { value: 'billing', label: 'Billing Contact' },
  { value: 'executive_sponsor', label: 'Executive Sponsor' },
  { value: 'hiring_manager', label: 'Hiring Manager' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'procurement', label: 'Procurement / Legal' },
]

const DECISION_AUTHORITY = [
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'champion', label: 'Champion' },
  { value: 'gatekeeper', label: 'Gatekeeper' },
]

const CONTACT_METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'slack', label: 'Slack' },
  { value: 'teams', label: 'Microsoft Teams' },
]

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
]

const defaultPhoneValue: PhoneValue = { countryCode: 'US', number: '' }

export function AccountIntakeStep4Contacts() {
  const { formData, addContact, removeContact, updateContact } =
    useCreateAccountStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  const [currentContact, setCurrentContact] = useState<Partial<AccountContact>>({
    role: 'hiring_manager',
    decisionAuthority: 'influencer',
    isPrimary: false,
    phone: { ...defaultPhoneValue },
    mobile: { ...defaultPhoneValue },
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setIsAddingNew(true)
    setCurrentContact({
      id: uuidv4(),
      role: 'hiring_manager',
      decisionAuthority: 'influencer',
      isPrimary: formData.contacts.length === 0,
      phone: { ...defaultPhoneValue },
      mobile: { ...defaultPhoneValue },
      timezone: 'America/New_York',
      preferredContactMethod: 'email',
    })
  }

  const handleOpenEdit = (contact: AccountContact) => {
    setIsAddingNew(false)
    setEditingId(contact.id)
    setCurrentContact({ ...contact })
  }

  const handleClose = () => {
    setEditingId(null)
    setIsAddingNew(false)
    setCurrentContact({
      role: 'hiring_manager',
      decisionAuthority: 'influencer',
      isPrimary: false,
      phone: { ...defaultPhoneValue },
      mobile: { ...defaultPhoneValue },
    })
  }

  const handleSave = () => {
    if (!currentContact.firstName || !currentContact.lastName || !currentContact.email) {
      return
    }

    if (editingId) {
      updateContact(editingId, currentContact)
    } else {
      addContact({
        ...currentContact,
        id: currentContact.id || uuidv4(),
      } as AccountContact)
    }
    handleClose()
  }

  const getRoleLabel = (role: string) =>
    CONTACT_ROLES.find((r) => r.value === role)?.label || role

  const isPanelOpen = isAddingNew || editingId !== null

  return (
    <div className="space-y-6">
      <Section
        icon={Users}
        title="Key Contacts"
        subtitle="Manage stakeholders and points of contact"
      >
        <div className="flex flex-col gap-4">
          {/* List View */}
          <div className="w-full transition-all duration-300">
            {/* Add Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAdd}
              className="mb-4 w-full border-dashed"
              disabled={isPanelOpen}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>

            {/* Table */}
            {formData.contacts.length > 0 ? (
              <div className="border border-charcoal-200 rounded-xl overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-charcoal-50/50">
                      <TableHead className="font-semibold text-charcoal-700">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold text-charcoal-700">
                        Role
                      </TableHead>
                      <TableHead className="font-semibold text-charcoal-700">
                        Contact
                      </TableHead>
                      <TableHead className="font-semibold text-charcoal-700 w-20">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.contacts.map((contact) => (
                      <TableRow
                        key={contact.id}
                        className={cn(
                          'group hover:bg-charcoal-50/50 cursor-pointer transition-colors',
                          editingId === contact.id && 'bg-gold-50'
                        )}
                        onClick={() => handleOpenEdit(contact)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-semibold text-xs">
                              {contact.firstName[0]}
                              {contact.lastName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-charcoal-900">
                                {contact.firstName} {contact.lastName}
                              </div>
                              <div className="text-xs text-charcoal-500">
                                {contact.title}
                              </div>
                            </div>
                            {contact.isPrimary && (
                              <Badge className="bg-gold-100 text-gold-700 border-gold-200 hover:bg-gold-100 ml-1">
                                Primary
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-charcoal-50 text-charcoal-600 border-charcoal-200"
                          >
                            {getRoleLabel(contact.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-charcoal-600 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-charcoal-400" />
                            {contact.email}
                          </div>
                        </TableCell>
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
                                removeContact(contact.id)
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-charcoal-50/50 rounded-xl border border-dashed border-charcoal-200">
                <Users className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
                <p className="text-sm text-charcoal-500 mb-1 font-medium">
                  No contacts added yet
                </p>
                <p className="text-xs text-charcoal-400">
                  Add key stakeholders and points of contact
                </p>
              </div>
            )}
          </div>

          {/* Inline Detail Panel - Full Width Bottom */}
          {isPanelOpen && (
            <div className="w-full border border-charcoal-200 rounded-xl bg-white animate-in slide-in-from-bottom duration-300">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-charcoal-200">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal-900">
                    {isAddingNew ? 'Add New Contact' : 'Edit Contact'}
                  </h3>
                  <p className="text-sm text-charcoal-500">
                    Contact information and preferences
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8 text-charcoal-400 hover:text-charcoal-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Panel Content */}
              <div className="p-4 space-y-5">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={currentContact.firstName || ''}
                        onChange={(e) =>
                          setCurrentContact((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={currentContact.lastName || ''}
                        onChange={(e) =>
                          setCurrentContact((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                        <Input
                          type="email"
                          className="pl-9 h-10"
                          value={currentContact.email || ''}
                          onChange={(e) =>
                            setCurrentContact((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Job Title</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                        <Input
                          className="pl-9 h-10"
                          value={currentContact.title || ''}
                          onChange={(e) =>
                            setCurrentContact((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Department</Label>
                      <Input
                        value={currentContact.department || ''}
                        onChange={(e) =>
                          setCurrentContact((prev) => ({
                            ...prev,
                            department: e.target.value,
                          }))
                        }
                        className="h-10"
                      />
                    </div>
                    <PhoneInput
                      label="Work Phone"
                      value={currentContact.phone as PhoneValue}
                      onChange={(phone) =>
                        setCurrentContact((prev) => ({ ...prev, phone }))
                      }
                    />
                    <PhoneInput
                      label="Mobile Phone"
                      value={currentContact.mobile as PhoneValue}
                      onChange={(mobile) =>
                        setCurrentContact((prev) => ({ ...prev, mobile }))
                      }
                    />
                    <div className="flex items-end pb-1">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentContact((prev) => ({
                            ...prev,
                            isPrimary: !prev.isPrimary,
                          }))
                        }
                        className={cn(
                          'flex items-center gap-2 text-sm font-medium transition-colors',
                          currentContact.isPrimary
                            ? 'text-gold-600'
                            : 'text-charcoal-500 hover:text-charcoal-700'
                        )}
                      >
                        <CheckCircle2
                          className={cn(
                            'w-5 h-5',
                            currentContact.isPrimary
                              ? 'fill-gold-100'
                              : 'text-charcoal-300'
                          )}
                        />
                        Primary
                      </button>
                    </div>
                  </div>
                </div>

                {/* Role & Authority */}
                <div className="space-y-4 pt-2 border-t border-charcoal-100">
                  <h4 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">
                    Role & Authority
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Role</Label>
                      <Select
                        value={currentContact.role}
                        onValueChange={(v: AccountContact['role']) =>
                          setCurrentContact((prev) => ({ ...prev, role: v }))
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTACT_ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Decision Authority</Label>
                      <Select
                        value={currentContact.decisionAuthority}
                        onValueChange={(v: AccountContact['decisionAuthority']) =>
                          setCurrentContact((prev) => ({
                            ...prev,
                            decisionAuthority: v,
                          }))
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DECISION_AUTHORITY.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Influence Level</Label>
                      <div className="flex gap-2">
                        {([1, 2, 3, 4, 5] as const).map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() =>
                              setCurrentContact((prev) => ({
                                ...prev,
                                influenceLevel: level,
                              }))
                            }
                            className={cn(
                              'w-10 h-10 rounded-lg border-2 font-semibold transition-all',
                              currentContact.influenceLevel === level
                                ? 'border-gold-400 bg-gold-50 text-gold-700'
                                : 'border-charcoal-200 text-charcoal-500 hover:border-charcoal-300'
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Communication Preferences */}
                <div className="space-y-4 pt-2 border-t border-charcoal-100">
                  <h4 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">
                    Communication Preferences
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-charcoal-400" />
                        Preferred Method
                      </Label>
                      <Select
                        value={currentContact.preferredContactMethod || 'email'}
                        onValueChange={(
                          v: AccountContact['preferredContactMethod']
                        ) =>
                          setCurrentContact((prev) => ({
                            ...prev,
                            preferredContactMethod: v,
                          }))
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTACT_METHODS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                        Timezone
                      </Label>
                      <Select
                        value={currentContact.timezone || 'America/New_York'}
                        onValueChange={(v) =>
                          setCurrentContact((prev) => ({ ...prev, timezone: v }))
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Best Time to Contact</Label>
                      <Input
                        placeholder="e.g., Mornings before 10am"
                        value={currentContact.bestTimeToContact || ''}
                        onChange={(e) =>
                          setCurrentContact((prev) => ({
                            ...prev,
                            bestTimeToContact: e.target.value,
                          }))
                        }
                        className="h-10"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Do Not Call</Label>
                        <p className="text-xs text-charcoal-500">
                          Prefers not to receive calls
                        </p>
                      </div>
                      <Switch
                        checked={currentContact.doNotCall || false}
                        onCheckedChange={(checked) =>
                          setCurrentContact((prev) => ({
                            ...prev,
                            doNotCall: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links & Notes */}
                <div className="space-y-4 pt-2 border-t border-charcoal-100">
                  <h4 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">
                    Social Profiles & Notes
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm flex items-center gap-1.5">
                        <Linkedin className="w-3.5 h-3.5 text-charcoal-400" />
                        LinkedIn URL
                      </Label>
                      <Input
                        placeholder="https://linkedin.com/in/..."
                        value={currentContact.linkedInUrl || ''}
                        onChange={(e) =>
                          setCurrentContact((prev) => ({
                            ...prev,
                            linkedInUrl: e.target.value,
                          }))
                        }
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-charcoal-400" />
                        Twitter/X URL
                      </Label>
                      <Input
                        placeholder="https://twitter.com/..."
                        value={currentContact.twitterUrl || ''}
                        onChange={(e) =>
                          setCurrentContact((prev) => ({
                            ...prev,
                            twitterUrl: e.target.value,
                          }))
                        }
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Notes</Label>
                    <Textarea
                      placeholder="Additional notes..."
                      value={currentContact.notes || ''}
                      onChange={(e) =>
                        setCurrentContact((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Panel Footer */}
              <div className="flex items-center justify-end gap-2 p-4 border-t border-charcoal-200">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gold-500 hover:bg-gold-600 text-white border-none"
                >
                  {isAddingNew ? 'Add Contact' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}


