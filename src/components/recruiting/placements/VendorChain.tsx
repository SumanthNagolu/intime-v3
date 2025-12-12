'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  Building2,
  ArrowRight,
  DollarSign,
  Percent,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VendorChainProps {
  placementId: string
  clientBillRate: number
  consultantPayRate: number
  onUpdate?: () => void
}

interface VendorFormData {
  vendorCompanyId: string
  vendorType: 'primary' | 'sub_vendor' | 'end_client' | 'implementation_partner'
  positionInChain: number
  billRate?: number
  payRate?: number
  markupPercentage?: number
  vendorContactId?: string
}

const VENDOR_TYPES = [
  { value: 'primary', label: 'Primary Vendor' },
  { value: 'sub_vendor', label: 'Sub-Vendor' },
  { value: 'end_client', label: 'End Client' },
  { value: 'implementation_partner', label: 'Implementation Partner' },
] as const

export function VendorChain({
  placementId,
  clientBillRate,
  consultantPayRate,
  onUpdate,
}: VendorChainProps) {
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<string | null>(null)
  const [formData, setFormData] = useState<VendorFormData>({
    vendorCompanyId: '',
    vendorType: 'primary',
    positionInChain: 1,
  })

  // Fetch vendor chain
  const {
    data: vendors,
    isLoading,
    refetch,
  } = trpc.ats.placements.getVendors.useQuery({ placementId })

  // Fetch margin calculation
  const { data: marginData } = trpc.ats.placements.getVendorChainMargin.useQuery(
    { placementId },
    { enabled: !!vendors && vendors.length > 0 }
  )

  // Fetch companies for selection
  const { data: companies } = trpc.crm.accounts.list.useQuery({
    limit: 100,
  })

  // Mutations
  const addMutation = trpc.ats.placements.addVendor.useMutation({
    onSuccess: () => {
      toast({
        title: 'Vendor added',
        description: 'Vendor has been added to the chain.',
      })
      setIsAddDialogOpen(false)
      resetForm()
      refetch()
      onUpdate?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to add vendor',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const updateMutation = trpc.ats.placements.updateVendor.useMutation({
    onSuccess: () => {
      toast({
        title: 'Vendor updated',
        description: 'Vendor details have been updated.',
      })
      setEditingVendor(null)
      resetForm()
      refetch()
      onUpdate?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to update vendor',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const removeMutation = trpc.ats.placements.removeVendor.useMutation({
    onSuccess: () => {
      toast({
        title: 'Vendor removed',
        description: 'Vendor has been removed from the chain.',
      })
      refetch()
      onUpdate?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to remove vendor',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const resetForm = () => {
    setFormData({
      vendorCompanyId: '',
      vendorType: 'primary',
      positionInChain: (vendors?.length || 0) + 1,
    })
  }

  const handleAdd = () => {
    addMutation.mutate({
      placementId,
      ...formData,
    })
  }

  const handleUpdate = (vendorId: string) => {
    updateMutation.mutate({
      vendorId,
      billRate: formData.billRate,
      payRate: formData.payRate,
      markupPercentage: formData.markupPercentage,
      positionInChain: formData.positionInChain,
    })
  }

  const handleRemove = (vendorId: string) => {
    if (confirm('Are you sure you want to remove this vendor from the chain?')) {
      removeMutation.mutate({ vendorId })
    }
  }

  const startEdit = (vendor: NonNullable<typeof vendors>[number]) => {
    setEditingVendor(vendor.id)
    setFormData({
      vendorCompanyId: vendor.vendor_company_id,
      vendorType: vendor.vendor_type as VendorFormData['vendorType'],
      positionInChain: vendor.position_in_chain,
      billRate: vendor.bill_rate ?? undefined,
      payRate: vendor.pay_rate ?? undefined,
      markupPercentage: vendor.markup_percentage ?? undefined,
    })
  }

  // Calculate overall margin
  const overallMargin = clientBillRate > 0
    ? ((clientBillRate - consultantPayRate) / clientBillRate * 100).toFixed(1)
    : '0.0'

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gold-500" />
            Vendor Chain
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetForm()
              setIsAddDialogOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Vendor
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Margin Summary */}
        <div className={cn(
          'p-3 rounded-lg flex items-center justify-between',
          parseFloat(overallMargin) < 10 ? 'bg-red-50' :
          parseFloat(overallMargin) < 15 ? 'bg-amber-50' :
          'bg-green-50'
        )}>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Overall Margin</span>
          </div>
          <div className="text-right">
            <span className={cn(
              'font-semibold',
              parseFloat(overallMargin) < 10 ? 'text-red-700' :
              parseFloat(overallMargin) < 15 ? 'text-amber-700' :
              'text-green-700'
            )}>
              {overallMargin}%
            </span>
            <p className="text-xs text-charcoal-500">
              ${(clientBillRate - consultantPayRate).toFixed(2)}/hr spread
            </p>
          </div>
        </div>

        {/* Vendor Chain Visualization */}
        {(!vendors || vendors.length === 0) ? (
          <div className="text-center py-6 text-charcoal-500">
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No vendors in chain</p>
            <p className="text-xs">Direct placement between client and consultant</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* End Client (Top) */}
            <div className="flex items-center gap-2 p-2 bg-charcoal-50 rounded-lg">
              <Building2 className="w-4 h-4 text-charcoal-600" />
              <span className="text-sm font-medium">End Client</span>
              <span className="ml-auto text-sm text-charcoal-500">
                Bills: ${clientBillRate}/hr
              </span>
            </div>

            {/* Vendor Chain */}
            {vendors
              .sort((a, b) => a.position_in_chain - b.position_in_chain)
              .map((vendor, index) => (
                <div key={vendor.id}>
                  {/* Arrow connector */}
                  <div className="flex justify-center py-1">
                    <ChevronRight className="w-4 h-4 text-charcoal-300 rotate-90" />
                  </div>

                  {/* Vendor card */}
                  <div className={cn(
                    'p-3 rounded-lg border',
                    editingVendor === vendor.id ? 'border-gold-500 bg-gold-50' : 'border-charcoal-200'
                  )}>
                    {editingVendor === vendor.id ? (
                      /* Edit Mode */
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs">Bill Rate</Label>
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-xs text-charcoal-400">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={formData.billRate || ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  billRate: e.target.value ? parseFloat(e.target.value) : undefined
                                })}
                                className="pl-6 h-8 text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Pay Rate</Label>
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-xs text-charcoal-400">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={formData.payRate || ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  payRate: e.target.value ? parseFloat(e.target.value) : undefined
                                })}
                                className="pl-6 h-8 text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Markup %</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.1"
                                value={formData.markupPercentage || ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  markupPercentage: e.target.value ? parseFloat(e.target.value) : undefined
                                })}
                                className="pr-6 h-8 text-sm"
                              />
                              <span className="absolute right-2 top-2 text-xs text-charcoal-400">%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingVendor(null)
                              resetForm()
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(vendor.id)}
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            #{vendor.position_in_chain}
                          </Badge>
                          <div>
                            <p className="font-medium text-sm">
                              {vendor.vendorCompany?.name || 'Unknown Vendor'}
                            </p>
                            <p className="text-xs text-charcoal-500 capitalize">
                              {vendor.vendor_type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {/* Rate info */}
                          <div className="text-right text-sm">
                            {vendor.bill_rate && (
                              <p className="text-charcoal-600">
                                Bills: ${vendor.bill_rate}/hr
                              </p>
                            )}
                            {vendor.pay_rate && (
                              <p className="text-charcoal-500 text-xs">
                                Pays: ${vendor.pay_rate}/hr
                              </p>
                            )}
                            {vendor.margin_amount && (
                              <p className="text-green-600 text-xs">
                                Margin: ${vendor.margin_amount}/hr
                              </p>
                            )}
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => startEdit(vendor)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                              onClick={() => handleRemove(vendor.id)}
                              disabled={removeMutation.isPending}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {/* Arrow to consultant */}
            <div className="flex justify-center py-1">
              <ChevronRight className="w-4 h-4 text-charcoal-300 rotate-90" />
            </div>
          </div>
        )}

        {/* Consultant (Bottom) */}
        <div className="flex items-center gap-2 p-2 bg-charcoal-50 rounded-lg">
          <Building2 className="w-4 h-4 text-charcoal-600" />
          <span className="text-sm font-medium">Consultant</span>
          <span className="ml-auto text-sm text-charcoal-500">
            Receives: ${consultantPayRate}/hr
          </span>
        </div>

        {/* Margin Breakdown */}
        {marginData && marginData.vendorCount > 0 && (
          <div className="mt-4 pt-4 border-t border-charcoal-100">
            <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
              Margin Summary
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-charcoal-600">Top Bill Rate</span>
                <span className="font-medium text-charcoal-900">
                  ${marginData.topBillRate.toFixed(2)}/hr
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-charcoal-600">Bottom Pay Rate</span>
                <span className="font-medium text-charcoal-900">
                  ${marginData.bottomPayRate.toFixed(2)}/hr
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-charcoal-100">
                <span className="font-medium text-charcoal-700">Total Chain Margin</span>
                <span className="font-semibold text-green-700">
                  ${marginData.totalMargin.toFixed(2)}/hr ({marginData.totalMarginPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Low margin warning */}
        {parseFloat(overallMargin) < 10 && (
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Warning: Overall margin is below 10% threshold</span>
          </div>
        )}
      </CardContent>

      {/* Add Vendor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vendor to Chain</DialogTitle>
            <DialogDescription>
              Add a new vendor to the placement vendor chain
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Vendor Company *</Label>
              <Select
                value={formData.vendorCompanyId}
                onValueChange={(value) => setFormData({ ...formData, vendorCompanyId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.items?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vendor Type *</Label>
              <Select
                value={formData.vendorType}
                onValueChange={(value) => setFormData({
                  ...formData,
                  vendorType: value as VendorFormData['vendorType']
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VENDOR_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Position in Chain *</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.positionInChain}
                onChange={(e) => setFormData({
                  ...formData,
                  positionInChain: parseInt(e.target.value) || 1
                })}
              />
              <p className="text-xs text-charcoal-500">
                Position 1 is closest to end client
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bill Rate</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-charcoal-400">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.billRate || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      billRate: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pay Rate</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-charcoal-400">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.payRate || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      payRate: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Markup Percentage</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.markupPercentage || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    markupPercentage: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  className="pr-8"
                  placeholder="0.0"
                />
                <span className="absolute right-3 top-2.5 text-sm text-charcoal-400">%</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!formData.vendorCompanyId || addMutation.isPending}
            >
              {addMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
