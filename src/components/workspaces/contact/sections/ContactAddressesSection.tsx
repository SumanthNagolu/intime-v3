'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  MapPin, Star, MoreVertical, Plus, Search, Pencil, X, Check, Loader2,
  Building2, Home, Package, Briefcase, MapPinned, ChevronLeft, ChevronRight
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ContactAddressEntry } from '@/types/workspace'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useContactWorkspace } from '@/components/workspaces/contact/ContactWorkspaceProvider'
import {
  getStatesByCountry,
  OPERATING_COUNTRIES,
  ADDRESS_TYPES,
} from '@/components/addresses'
import { PostalCodeInput, type PostalCodeCountry } from '@/components/ui/postal-code-input'

interface ContactAddressesSectionProps {
  addresses: ContactAddressEntry[]
  contactId: string
}

// Constants
const ITEMS_PER_PAGE = 10

// Address type icons
const ADDRESS_TYPE_ICONS: Record<string, React.ElementType> = {
  headquarters: Building2,
  billing: Briefcase,
  shipping: Package,
  mailing: Home,
  office: Building2,
  home: Home,
  work: Building2,
  other: MapPinned,
}

/**
 * ContactAddressesSection - Table-based address list with detail panel
 * Follows the same pattern as AccountAddressesSection
 */
export function ContactAddressesSection({ addresses, contactId }: ContactAddressesSectionProps) {
  const { toast } = useToast()
  const { refreshData } = useContactWorkspace()

  const [selectedAddress, setSelectedAddress] = React.useState<ContactAddressEntry | null>(null)
  const [isEditing, setIsEditing] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)

  // Edit form state
  const [editForm, setEditForm] = React.useState({
    type: 'home',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    isPrimary: false,
  })

  // Validation errors
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Update mutation
  const updateMutation = trpc.addresses.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Address updated successfully' })
      refreshData()
      setIsEditing(false)
      setSelectedAddress(null)
      setErrors({})
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Delete mutation
  const deleteMutation = trpc.addresses.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Address deleted successfully' })
      refreshData()
      setSelectedAddress(null)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Initialize edit form when address is selected
  React.useEffect(() => {
    if (selectedAddress) {
      setEditForm({
        type: selectedAddress.addressType || 'other',
        street: selectedAddress.street || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        zip: selectedAddress.zip || '',
        country: selectedAddress.country || 'US',
        isPrimary: selectedAddress.isPrimary || false,
      })
      setErrors({})
    }
  }, [selectedAddress])

  // Get state options based on country
  const stateOptions = getStatesByCountry(editForm.country || 'US')

  // Handle country change
  const handleCountryChange = (value: string) => {
    setEditForm(f => ({ ...f, country: value, state: '', zip: '' }))
    setErrors(prev => {
      const { zip, ...rest } = prev
      return rest
    })
  }

  // Filter addresses based on search
  const filteredAddresses = React.useMemo(() => {
    if (!searchQuery.trim()) return addresses
    const q = searchQuery.toLowerCase()
    return addresses.filter(a =>
      a.addressType?.toLowerCase().includes(q) ||
      a.street?.toLowerCase().includes(q) ||
      a.city?.toLowerCase().includes(q) ||
      a.state?.toLowerCase().includes(q)
    )
  }, [addresses, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredAddresses.length / ITEMS_PER_PAGE)
  const paginatedAddresses = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAddresses.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAddresses, currentPage])

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!editForm.type) {
      newErrors.type = 'Address type is required'
    }

    if (!editForm.street.trim()) {
      newErrors.street = 'Street address is required'
    }

    if (!editForm.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!editForm.state.trim()) {
      newErrors.state = 'State/Province is required'
    }

    if (!editForm.zip.trim()) {
      newErrors.zip = 'ZIP/Postal code is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!selectedAddress) return

    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fix the errors below', variant: 'error' })
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: selectedAddress.id,
        addressType: editForm.type as any,
        addressLine1: editForm.street.trim(),
        city: editForm.city.trim(),
        stateProvince: editForm.state.trim(),
        postalCode: editForm.zip.trim(),
        countryCode: editForm.country,
        isPrimary: editForm.isPrimary,
      })
    } catch {
      // Error already handled by mutation onError
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setErrors({})
    if (selectedAddress) {
      setEditForm({
        type: selectedAddress.addressType || 'other',
        street: selectedAddress.street || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        zip: selectedAddress.zip || '',
        country: selectedAddress.country || 'US',
        isPrimary: selectedAddress.isPrimary || false,
      })
    }
  }

  const handleRowClick = (address: ContactAddressEntry) => {
    if (selectedAddress?.id === address.id) {
      setSelectedAddress(null)
      setIsEditing(false)
    } else {
      setSelectedAddress(address)
      setIsEditing(false)
    }
  }

  const handleDelete = async (address: ContactAddressEntry, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this address?')) {
      await deleteMutation.mutateAsync({ id: address.id })
    }
  }

  const handleSetPrimary = async (address: ContactAddressEntry, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await updateMutation.mutateAsync({
        id: address.id,
        isPrimary: true,
      })
    } catch {
      // Error handled by mutation
    }
  }

  const loading = updateMutation.isPending || deleteMutation.isPending

  return (
    <div className="space-y-6">
      {/* Header with Search and Add */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-charcoal-700 to-charcoal-800 flex items-center justify-center shadow-sm">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-charcoal-900">Addresses</h2>
            <p className="text-sm text-charcoal-500">
              {filteredAddresses.length} {filteredAddresses.length === 1 ? 'address' : 'addresses'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
            <Input
              placeholder="Search addresses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20"
            />
          </div>
          <Button
            size="sm"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('openContactDialog', {
                detail: { dialogId: 'addAddress', contactId }
              }))
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Address
          </Button>
        </div>
      </div>

      {/* Table */}
      {paginatedAddresses.length > 0 ? (
        <div className="border border-charcoal-200 rounded-xl overflow-hidden bg-white">
          {/* Table Header */}
          <div className="grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-charcoal-50 border-b border-charcoal-200">
            <div className="text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
              Type
            </div>
            <div className="text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
              Address
            </div>
            <div className="text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
              City
            </div>
            <div className="text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
              State
            </div>
            <div className="text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
              ZIP
            </div>
            <div className="text-xs font-semibold text-charcoal-600 uppercase tracking-wider text-right">
              Actions
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-charcoal-100">
            {paginatedAddresses.map((address) => {
              const Icon = ADDRESS_TYPE_ICONS[address.addressType || 'other'] || MapPin
              const isSelected = selectedAddress?.id === address.id

              return (
                <div
                  key={address.id}
                  onClick={() => handleRowClick(address)}
                  className={cn(
                    "grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_auto] gap-4 px-4 py-3 cursor-pointer transition-colors",
                    isSelected
                      ? "bg-gradient-to-r from-gold-50 to-amber-50"
                      : "hover:bg-charcoal-50/50"
                  )}
                >
                  {/* Type */}
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-gold-100" : "bg-charcoal-100"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        isSelected ? "text-gold-600" : "text-charcoal-500"
                      )} />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize text-xs">
                        {address.addressType}
                      </Badge>
                      {address.isPrimary && (
                        <Star className="h-3.5 w-3.5 text-gold-500 fill-gold-500" />
                      )}
                    </div>
                    <p className="text-sm text-charcoal-900 font-medium truncate">
                      {address.street}
                    </p>
                  </div>

                  {/* City */}
                  <div className="flex items-center">
                    <p className="text-sm text-charcoal-700 truncate">
                      {address.city}
                    </p>
                  </div>

                  {/* State */}
                  <div className="flex items-center">
                    <p className="text-sm text-charcoal-700">
                      {address.state}
                    </p>
                  </div>

                  {/* ZIP */}
                  <div className="flex items-center">
                    <p className="text-sm text-charcoal-700">
                      {address.zip}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAddress(address)
                          setIsEditing(true)
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!address.isPrimary && (
                          <DropdownMenuItem onClick={(e) => handleSetPrimary(address, e)}>
                            <Star className="h-4 w-4 mr-2" />
                            Set as Primary
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(address, e)}
                          className="text-error-600"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-charcoal-200 bg-charcoal-50/50">
              <p className="text-sm text-charcoal-600">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAddresses.length)} of {filteredAddresses.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-charcoal-700 min-w-[80px] text-center">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-charcoal-200 rounded-xl bg-white p-12 text-center">
          <MapPin className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
          <p className="text-sm text-charcoal-500 mb-4">
            {searchQuery ? 'No addresses found' : 'No addresses yet'}
          </p>
          {!searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openContactDialog', {
                  detail: { dialogId: 'addAddress', contactId }
                }))
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add First Address
            </Button>
          )}
        </div>
      )}

      {/* Detail Panel */}
      {selectedAddress && (
        <div className="border border-gold-200 rounded-2xl bg-gradient-to-br from-white to-gold-50/30 shadow-lg overflow-hidden animate-slide-up">
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-gold-500 to-amber-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {React.createElement(ADDRESS_TYPE_ICONS[selectedAddress.addressType || 'other'] || MapPin, {
                    className: "h-5 w-5 text-white"
                  })}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {selectedAddress.addressType} Address
                  </h3>
                  <p className="text-sm text-white/80">
                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.country && `• ${selectedAddress.country}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="text-white hover:bg-white/20"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedAddress(null)}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={loading}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-white text-gold-600 hover:bg-white/90"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Panel Content */}
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-5">
                {/* Row 1: Type */}
                <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
                  <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider pt-2">
                    Type <span className="text-error-500">*</span>
                  </label>
                  <div>
                    <Select
                      value={editForm.type}
                      onValueChange={(value) => setEditForm(f => ({ ...f, type: value }))}
                    >
                      <SelectTrigger className={cn(
                        "h-10 border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20",
                        errors.type && "border-error-400"
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ADDRESS_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-xs text-error-500 mt-1">{errors.type}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Street */}
                <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
                  <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider pt-2">
                    Street <span className="text-error-500">*</span>
                  </label>
                  <div>
                    <Input
                      value={editForm.street}
                      onChange={(e) => setEditForm(f => ({ ...f, street: e.target.value }))}
                      placeholder="123 Main Street"
                      className={cn(
                        "h-10 border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20",
                        errors.street && "border-error-400"
                      )}
                    />
                    {errors.street && (
                      <p className="text-xs text-error-500 mt-1">{errors.street}</p>
                    )}
                  </div>
                </div>

                {/* Row 3: City */}
                <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
                  <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider pt-2">
                    City <span className="text-error-500">*</span>
                  </label>
                  <div>
                    <Input
                      value={editForm.city}
                      onChange={(e) => setEditForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="San Francisco"
                      className={cn(
                        "h-10 border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20",
                        errors.city && "border-error-400"
                      )}
                    />
                    {errors.city && (
                      <p className="text-xs text-error-500 mt-1">{errors.city}</p>
                    )}
                  </div>
                </div>

                {/* Row 4: State */}
                <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
                  <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider pt-2">
                    State <span className="text-error-500">*</span>
                  </label>
                  <div>
                    <Select
                      value={editForm.state}
                      onValueChange={(value) => setEditForm(f => ({ ...f, state: value }))}
                    >
                      <SelectTrigger className={cn(
                        "h-10 border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20",
                        errors.state && "border-error-400"
                      )}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {stateOptions.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className="text-xs text-error-500 mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                {/* Row 5: ZIP */}
                <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
                  <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider pt-2">
                    ZIP <span className="text-error-500">*</span>
                  </label>
                  <div>
                    <PostalCodeInput
                      value={editForm.zip}
                      onChange={(value) => setEditForm(f => ({ ...f, zip: value }))}
                      countryCode={editForm.country as PostalCodeCountry}
                      error={errors.zip}
                    />
                  </div>
                </div>

                {/* Row 6: Country */}
                <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
                  <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider pt-2">
                    Country
                  </label>
                  <Select
                    value={editForm.country}
                    onValueChange={handleCountryChange}
                  >
                    <SelectTrigger className="h-10 border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATING_COUNTRIES.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 7: Primary */}
                <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                  <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Status
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={editForm.isPrimary}
                      onChange={(e) => setEditForm(f => ({ ...f, isPrimary: e.target.checked }))}
                      className="w-4 h-4 text-gold-500 rounded border-charcoal-300 focus:ring-gold-400"
                    />
                    <label htmlFor="isPrimary" className="text-sm text-charcoal-700 cursor-pointer">
                      Set as Primary Address
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-2.5 border-b border-charcoal-100">
                  <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Type
                  </span>
                  <Badge variant="outline" className="w-fit capitalize">
                    {selectedAddress.addressType}
                  </Badge>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-2.5 border-b border-charcoal-100">
                  <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Street
                  </span>
                  <span className="text-sm text-charcoal-900">
                    {selectedAddress.street}
                  </span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-2.5 border-b border-charcoal-100">
                  <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    City
                  </span>
                  <span className="text-sm text-charcoal-900">
                    {selectedAddress.city}
                  </span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-2.5 border-b border-charcoal-100">
                  <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    State
                  </span>
                  <span className="text-sm text-charcoal-900">
                    {selectedAddress.state}
                  </span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-2.5 border-b border-charcoal-100">
                  <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    ZIP
                  </span>
                  <span className="text-sm text-charcoal-900">
                    {selectedAddress.zip}
                  </span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-2.5 border-b border-charcoal-100">
                  <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Country
                  </span>
                  <span className="text-sm text-charcoal-900">
                    {OPERATING_COUNTRIES.find(c => c.value === selectedAddress.country)?.label || selectedAddress.country}
                  </span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-2.5">
                  <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Status
                  </span>
                  {selectedAddress.isPrimary ? (
                    <Badge className="w-fit bg-gold-100 text-gold-700 border-gold-200">
                      <Star className="h-3 w-3 mr-1 fill-gold-500" />
                      Primary Address
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="w-fit">Secondary</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactAddressesSection
