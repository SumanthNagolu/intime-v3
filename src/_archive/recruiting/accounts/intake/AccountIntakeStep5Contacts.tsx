'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  useCreateAccountStore,
  AccountContact,
  PhoneValue
} from '@/stores/create-account-store'
import { Section } from './shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { Users, Plus, Pencil, Trash2, Mail, Phone, Linkedin, User, Briefcase, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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

export function AccountIntakeStep5Contacts() {
  const { formData, addContact, removeContact, updateContact } = useCreateAccountStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [currentContact, setCurrentContact] = useState<Partial<AccountContact>>({
    role: 'hiring_manager',
    decisionAuthority: 'influencer',
    isPrimary: false,
    phone: { countryCode: 'US', number: '' },
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setCurrentContact({
      id: uuidv4(),
      role: 'hiring_manager',
      decisionAuthority: 'influencer',
      isPrimary: formData.contacts.length === 0,
      phone: { countryCode: 'US', number: '' },
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (contact: AccountContact) => {
    setEditingId(contact.id)
    setCurrentContact({ ...contact })
    setIsDialogOpen(true)
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
    setIsDialogOpen(false)
  }

  const getRoleLabel = (role: string) => 
    CONTACT_ROLES.find(r => r.value === role)?.label || role

  return (
    <div className="space-y-10">
      <Section
        icon={Users}
        title="Key Contacts"
        subtitle="Manage stakeholders and points of contact"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.contacts.map((contact) => (
            <div
              key={contact.id}
              className="group relative p-5 rounded-xl border border-charcoal-200 bg-white hover:border-charcoal-300 transition-all hover:shadow-elevation-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-semibold text-xs">
                     {contact.firstName[0]}{contact.lastName[0]}
                   </div>
                   <div>
                      <h4 className="font-semibold text-charcoal-900">{contact.firstName} {contact.lastName}</h4>
                      <p className="text-xs text-charcoal-500">{contact.title}</p>
                   </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-charcoal-400 hover:text-charcoal-600"
                    onClick={() => handleOpenEdit(contact)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-charcoal-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => removeContact(contact.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                 <Badge variant="outline" className="bg-charcoal-50 text-charcoal-600 border-charcoal-200">
                    {getRoleLabel(contact.role)}
                 </Badge>
                 {contact.isPrimary && (
                    <Badge className="bg-gold-100 text-gold-700 border-gold-200 hover:bg-gold-100">
                      Primary
                    </Badge>
                  )}
              </div>

              <div className="text-sm text-charcoal-600 space-y-1.5">
                <div className="flex items-center gap-2">
                   <Mail className="w-3.5 h-3.5 text-charcoal-400" />
                   <span className="truncate">{contact.email}</span>
                </div>
                {contact.phone?.number && (
                  <div className="flex items-center gap-2">
                     <Phone className="w-3.5 h-3.5 text-charcoal-400" />
                     <span>{contact.phone.number}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add New Button Card */}
          <button
            onClick={handleOpenAdd}
            className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-charcoal-200 bg-charcoal-50/50 hover:bg-white hover:border-gold-300 transition-all min-h-[160px] group"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-charcoal-200 flex items-center justify-center mb-3 group-hover:border-gold-300 group-hover:text-gold-500 transition-colors shadow-sm">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-medium text-charcoal-600 group-hover:text-charcoal-900">
              Add New Contact
            </span>
          </button>
        </div>
      </Section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
            <DialogDescription>
              Enter contact details and role.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
             <div className="space-y-2">
               <Label>First Name <span className="text-red-500">*</span></Label>
               <Input 
                 value={currentContact.firstName || ''}
                 onChange={(e) => setCurrentContact(prev => ({ ...prev, firstName: e.target.value }))}
               />
             </div>
             <div className="space-y-2">
               <Label>Last Name <span className="text-red-500">*</span></Label>
               <Input 
                 value={currentContact.lastName || ''}
                 onChange={(e) => setCurrentContact(prev => ({ ...prev, lastName: e.target.value }))}
               />
             </div>
             
             <div className="space-y-2 col-span-2">
               <Label>Email <span className="text-red-500">*</span></Label>
               <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                  <Input 
                    type="email"
                    className="pl-9"
                    value={currentContact.email || ''}
                    onChange={(e) => setCurrentContact(prev => ({ ...prev, email: e.target.value }))}
                  />
               </div>
             </div>

             <div className="space-y-2 col-span-2">
               <PhoneInput
                  label="Phone Number"
                  value={currentContact.phone as PhoneValue}
                  onChange={(phone) => setCurrentContact(prev => ({ ...prev, phone }))}
               />
             </div>

             <div className="space-y-2">
               <Label>Job Title</Label>
               <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                  <Input 
                    className="pl-9"
                    value={currentContact.title || ''}
                    onChange={(e) => setCurrentContact(prev => ({ ...prev, title: e.target.value }))}
                  />
               </div>
             </div>
             
             <div className="space-y-2">
               <Label>Department</Label>
               <Input 
                 value={currentContact.department || ''}
                 onChange={(e) => setCurrentContact(prev => ({ ...prev, department: e.target.value }))}
               />
             </div>

             <div className="space-y-2">
               <Label>Role</Label>
               <Select
                 value={currentContact.role}
                 onValueChange={(v: any) => setCurrentContact(prev => ({ ...prev, role: v }))}
               >
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   {CONTACT_ROLES.map(r => (
                     <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             <div className="space-y-2">
               <Label>Decision Authority</Label>
               <Select
                 value={currentContact.decisionAuthority}
                 onValueChange={(v: any) => setCurrentContact(prev => ({ ...prev, decisionAuthority: v }))}
               >
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   {DECISION_AUTHORITY.map(r => (
                     <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             
             <div className="col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentContact(prev => ({ ...prev, isPrimary: !prev.isPrimary }))}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    currentContact.isPrimary ? "text-gold-600" : "text-charcoal-500 hover:text-charcoal-700"
                  )}
                 >
                   <CheckCircle2 className={cn("w-5 h-5", currentContact.isPrimary ? "fill-gold-100" : "text-charcoal-300")} />
                   Set as primary contact
                 </button>
             </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-gold-500 hover:bg-gold-600 text-white">Save Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




