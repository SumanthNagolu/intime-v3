'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CreateVendorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateVendorDialog({ open, onOpenChange }: CreateVendorDialogProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [name, setName] = useState('')
  const [type, setType] = useState<string>('sub_vendor')
  const [tier, setTier] = useState<string>('standard')
  const [website, setWebsite] = useState('')
  const [industryFocus, setIndustryFocus] = useState('')
  const [geographicFocus, setGeographicFocus] = useState('')
  const [notes, setNotes] = useState('')

  // Primary contact
  const [primaryContactName, setPrimaryContactName] = useState('')
  const [primaryContactEmail, setPrimaryContactEmail] = useState('')
  const [primaryContactPhone, setPrimaryContactPhone] = useState('')
  const [primaryContactTitle, setPrimaryContactTitle] = useState('')

  const createMutation = trpc.bench.vendors.create.useMutation({
    onSuccess: (data) => {
      toast.success('Vendor created successfully')
      utils.bench.vendors.list.invalidate()
      onOpenChange(false)
      resetForm()
      router.push(`/employee/recruiting/vendors/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create vendor')
    },
  })

  const resetForm = () => {
    setName('')
    setType('sub_vendor')
    setTier('standard')
    setWebsite('')
    setIndustryFocus('')
    setGeographicFocus('')
    setNotes('')
    setPrimaryContactName('')
    setPrimaryContactEmail('')
    setPrimaryContactPhone('')
    setPrimaryContactTitle('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Vendor name is required')
      return
    }

    createMutation.mutate({
      name: name.trim(),
      type: type as 'direct_client' | 'prime_vendor' | 'sub_vendor' | 'msp' | 'vms',
      tier: tier as 'preferred' | 'standard' | 'new',
      website: website.trim() || undefined,
      industryFocus: industryFocus.trim() ? industryFocus.split(',').map(s => s.trim()) : undefined,
      geographicFocus: geographicFocus.trim() ? geographicFocus.split(',').map(s => s.trim()) : undefined,
      notes: notes.trim() || undefined,
      primaryContactName: primaryContactName.trim() || undefined,
      primaryContactEmail: primaryContactEmail.trim() || undefined,
      primaryContactPhone: primaryContactPhone.trim() || undefined,
      primaryContactTitle: primaryContactTitle.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
          <DialogDescription>
            Create a new vendor record. Vendors can be prime vendors, sub-vendors, or direct clients that supply talent.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-charcoal-900">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Vendor Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter vendor name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Vendor Type *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct_client">Direct Client</SelectItem>
                      <SelectItem value="prime_vendor">Prime Vendor</SelectItem>
                      <SelectItem value="sub_vendor">Sub Vendor</SelectItem>
                      <SelectItem value="msp">MSP</SelectItem>
                      <SelectItem value="vms">VMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tier">Tier</Label>
                  <Select value={tier} onValueChange={setTier}>
                    <SelectTrigger id="tier">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preferred">Preferred</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="industryFocus">Industry Focus</Label>
                  <Input
                    id="industryFocus"
                    value={industryFocus}
                    onChange={(e) => setIndustryFocus(e.target.value)}
                    placeholder="IT, Healthcare, Finance (comma-separated)"
                  />
                </div>

                <div>
                  <Label htmlFor="geographicFocus">Geographic Focus</Label>
                  <Input
                    id="geographicFocus"
                    value={geographicFocus}
                    onChange={(e) => setGeographicFocus(e.target.value)}
                    placeholder="USA, Canada (comma-separated)"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes about this vendor..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Primary Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-charcoal-900">Primary Contact (Optional)</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={primaryContactName}
                    onChange={(e) => setPrimaryContactName(e.target.value)}
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <Label htmlFor="contactTitle">Title</Label>
                  <Input
                    id="contactTitle"
                    value={primaryContactTitle}
                    onChange={(e) => setPrimaryContactTitle(e.target.value)}
                    placeholder="Account Manager"
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={primaryContactEmail}
                    onChange={(e) => setPrimaryContactEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={primaryContactPhone}
                    onChange={(e) => setPrimaryContactPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Vendor'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
