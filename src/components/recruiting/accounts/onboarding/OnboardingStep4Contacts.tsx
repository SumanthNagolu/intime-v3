'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { useAccountOnboardingStore, CONTACT_ROLES, AdditionalContact } from '@/stores/account-onboarding-store'
import { Plus, X } from 'lucide-react'

export function OnboardingStep4Contacts() {
  const { formData, setFormData } = useAccountOnboardingStore()
  const [newContact, setNewContact] = useState<AdditionalContact>({
    firstName: '',
    lastName: '',
    email: '',
    phone: { countryCode: 'US', number: '' },
    title: '',
    roles: [],
  })

  const addContact = () => {
    if (!newContact.firstName || !newContact.email) return
    setFormData({
      additionalContacts: [...formData.additionalContacts, newContact],
    })
    setNewContact({
      firstName: '',
      lastName: '',
      email: '',
      phone: { countryCode: 'US', number: '' },
      title: '',
      roles: [],
    })
  }

  const removeContact = (index: number) => {
    setFormData({
      additionalContacts: formData.additionalContacts.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      {/* Communication Preferences */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Communication Preferences
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Preferred Contact Method</Label>
            <Select
              value={formData.preferredChannel}
              onValueChange={(v) => setFormData({ preferredChannel: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="teams">Microsoft Teams</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Meeting Cadence</Label>
            <Select
              value={formData.meetingCadence}
              onValueChange={(v) => setFormData({ meetingCadence: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="as_needed">As Needed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Existing Contacts */}
      {formData.additionalContacts.length > 0 && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Added Contacts
          </h3>
          <div className="space-y-2">
            {formData.additionalContacts.map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg"
              >
                <div>
                  <span className="font-medium">
                    {contact.firstName} {contact.lastName}
                  </span>
                  <span className="text-charcoal-500 text-sm ml-2">{contact.title}</span>
                  <div className="text-sm text-charcoal-500">{contact.email}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeContact(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Contact */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Add Additional Contact
        </h3>
        <div className="p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                value={newContact.firstName}
                onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={newContact.lastName}
                onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="john@company.com"
              />
            </div>
            <div className="space-y-2">
              <PhoneInput
                label="Phone"
                value={newContact.phone && typeof newContact.phone === 'object' && 'countryCode' in newContact.phone
                  ? newContact.phone
                  : { countryCode: 'US', number: '' }}
                onChange={(phone) => setNewContact({ ...newContact, phone })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newContact.title}
                onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                placeholder="Engineering Manager"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newContact.roles[0] || ''}
                onValueChange={(v) => setNewContact({ ...newContact, roles: [v] })}
              >
                <SelectTrigger>
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
          </div>
          <Button type="button" variant="outline" onClick={addContact} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>
    </div>
  )
}
