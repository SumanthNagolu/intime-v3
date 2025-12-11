'use client'

import { useState } from 'react'
import {
  MapPin,
  Plus,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { AddressForm } from '@/components/addresses/AddressForm'
import { AddressDisplay } from '@/components/addresses/AddressDisplay'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import type { AddressFormData } from '@/components/addresses'

interface AddressesSectionProps {
  contactId: string
}

const ADDRESS_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  current: { label: 'Current', color: 'bg-gold-100 text-gold-700' },
  permanent: { label: 'Permanent', color: 'bg-blue-100 text-blue-700' },
  mailing: { label: 'Mailing', color: 'bg-cyan-100 text-cyan-700' },
  work: { label: 'Work', color: 'bg-purple-100 text-purple-700' },
  billing: { label: 'Billing', color: 'bg-green-100 text-green-700' },
  shipping: { label: 'Shipping', color: 'bg-orange-100 text-orange-700' },
  headquarters: { label: 'Headquarters', color: 'bg-charcoal-100 text-charcoal-700' },
  office: { label: 'Office', color: 'bg-pink-100 text-pink-700' },
  job_location: { label: 'Job Location', color: 'bg-amber-100 text-amber-700' },
  meeting: { label: 'Meeting', color: 'bg-teal-100 text-teal-700' },
  first_day: { label: 'First Day', color: 'bg-indigo-100 text-indigo-700' },
}

const DEFAULT_ADDRESS: Partial<AddressFormData> = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  stateProvince: '',
  postalCode: '',
  countryCode: 'US',
}

type AddressType = 'current' | 'permanent' | 'mailing' | 'work' | 'billing' | 'shipping' | 'headquarters' | 'office' | 'job_location' | 'meeting' | 'first_day'

export function AddressesSection({ contactId }: AddressesSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newAddressType, setNewAddressType] = useState<AddressType>('work')
  const [formData, setFormData] = useState<Partial<AddressFormData>>(DEFAULT_ADDRESS)

  // Fetch addresses
  const addressesQuery = trpc.addresses.getByEntity.useQuery({
    entityType: 'contact',
    entityId: contactId,
  })

  const addresses = addressesQuery.data || []

  // Mutations
  const createAddress = trpc.addresses.create.useMutation({
    onSuccess: () => {
      toast({ title: 'Address added' })
      utils.addresses.getByEntity.invalidate({ entityType: 'contact', entityId: contactId })
      setIsAddDialogOpen(false)
      setFormData(DEFAULT_ADDRESS)
    },
    onError: (error) => {
      toast({ title: 'Failed to add address', description: error.message, variant: 'error' })
    },
  })

  const updateAddress = trpc.addresses.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Address updated' })
      utils.addresses.getByEntity.invalidate({ entityType: 'contact', entityId: contactId })
      setEditingAddressId(null)
      setFormData(DEFAULT_ADDRESS)
    },
    onError: (error) => {
      toast({ title: 'Failed to update address', description: error.message, variant: 'error' })
    },
  })

  const deleteAddress = trpc.addresses.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Address deleted' })
      utils.addresses.getByEntity.invalidate({ entityType: 'contact', entityId: contactId })
    },
    onError: (error) => {
      toast({ title: 'Failed to delete address', description: error.message, variant: 'error' })
    },
  })

  const setPrimaryAddress = trpc.addresses.setPrimary.useMutation({
    onSuccess: () => {
      toast({ title: 'Primary address updated' })
      utils.addresses.getByEntity.invalidate({ entityType: 'contact', entityId: contactId })
    },
    onError: (error) => {
      toast({ title: 'Failed to set primary address', description: error.message, variant: 'error' })
    },
  })

  const handleOpenAddDialog = () => {
    setFormData(DEFAULT_ADDRESS)
    setNewAddressType('work')
    setIsAddDialogOpen(true)
  }

  const handleCreateAddress = async () => {
    setIsSubmitting(true)
    try {
      await createAddress.mutateAsync({
        entityType: 'contact',
        entityId: contactId,
        addressType: newAddressType,
        addressLine1: formData.addressLine1 || undefined,
        addressLine2: formData.addressLine2 || undefined,
        city: formData.city || undefined,
        stateProvince: formData.stateProvince || undefined,
        postalCode: formData.postalCode || undefined,
        countryCode: formData.countryCode || 'US',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenEditDialog = (address: typeof addresses[0]) => {
    setFormData({
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      stateProvince: address.stateProvince || '',
      postalCode: address.postalCode || '',
      countryCode: address.countryCode || 'US',
    })
    setEditingAddressId(address.id)
  }

  const handleUpdateAddress = async () => {
    if (!editingAddressId) return
    setIsSubmitting(true)
    try {
      await updateAddress.mutateAsync({
        id: editingAddressId,
        addressLine1: formData.addressLine1 || undefined,
        addressLine2: formData.addressLine2 || undefined,
        city: formData.city || undefined,
        stateProvince: formData.stateProvince || undefined,
        postalCode: formData.postalCode || undefined,
        countryCode: formData.countryCode || undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (addressId: string) => {
    await deleteAddress.mutateAsync({ id: addressId })
  }

  const handleSetPrimary = async (addressId: string) => {
    await setPrimaryAddress.mutateAsync({ id: addressId })
  }

  const handleFormChange = (data: Partial<AddressFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  if (addressesQuery.isLoading) {
    return (
      <div className="p-6">
        <Card className="bg-white animate-pulse">
          <CardContent className="py-4">
            <div className="h-48 bg-charcoal-100 rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (addresses.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          config={{
            icon: MapPin,
            title: 'No addresses yet',
            description: 'Add addresses to track locations for this contact',
            action: { label: 'Add Address', onClick: handleOpenAddDialog },
          }}
          variant="inline"
        />

        {/* Add Address Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Address</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Address Type</label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-charcoal-200 rounded-md"
                  value={newAddressType}
                  onChange={(e) => setNewAddressType(e.target.value as AddressType)}
                >
                  {Object.entries(ADDRESS_TYPE_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>{config.label}</option>
                  ))}
                </select>
              </div>
              <AddressForm
                value={formData}
                onChange={handleFormChange}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAddress} disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Address'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-charcoal-900">
          Addresses ({addresses.length})
        </h2>
        <Button size="sm" onClick={handleOpenAddDialog}>
          <Plus className="w-4 h-4 mr-1" />
          Add Address
        </Button>
      </div>

      {/* Address Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card
            key={address.id}
            className={cn(
              'bg-white transition-all',
              address.isPrimary && 'ring-2 ring-gold-200'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={cn(
                        'text-xs',
                        ADDRESS_TYPE_CONFIG[address.addressType]?.color ||
                          'bg-charcoal-100 text-charcoal-700'
                      )}
                    >
                      {ADDRESS_TYPE_CONFIG[address.addressType]?.label || address.addressType}
                    </Badge>
                    {address.isPrimary && (
                      <Badge className="text-xs bg-gold-100 text-gold-700">
                        <Star className="w-3 h-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                    {address.isVerified && (
                      <Badge className="text-xs bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <AddressDisplay address={address} variant="full" />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenEditDialog(address)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {!address.isPrimary && (
                      <DropdownMenuItem onClick={() => handleSetPrimary(address.id)}>
                        <Star className="w-4 h-4 mr-2" />
                        Set as Primary
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Address Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Address Type</label>
              <select
                className="w-full mt-1 px-3 py-2 border border-charcoal-200 rounded-md"
                value={newAddressType}
                onChange={(e) => setNewAddressType(e.target.value as AddressType)}
              >
                {Object.entries(ADDRESS_TYPE_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>{config.label}</option>
                ))}
              </select>
            </div>
            <AddressForm
              value={formData}
              onChange={handleFormChange}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAddress} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog open={!!editingAddressId} onOpenChange={() => setEditingAddressId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          <AddressForm
            value={formData}
            onChange={handleFormChange}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAddressId(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAddress} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
