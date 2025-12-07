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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Loader2, ChevronsUpDown, Check, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CreateJobOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedVendorId?: string
}

export function CreateJobOrderDialog({ open, onOpenChange, preselectedVendorId }: CreateJobOrderDialogProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [vendorId, setVendorId] = useState(preselectedVendorId || '')
  const [vendorSearch, setVendorSearch] = useState('')
  const [vendorOpen, setVendorOpen] = useState(false)
  const [clientName, setClientName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [rateType, setRateType] = useState('hourly')
  const [billRate, setBillRate] = useState('')
  const [durationMonths, setDurationMonths] = useState('')
  const [positions, setPositions] = useState('1')
  const [priority, setPriority] = useState('medium')
  const [source, setSource] = useState('email')
  const [responseDueAt, setResponseDueAt] = useState('')

  // Fetch vendors for selection
  const vendorsQuery = trpc.bench.vendors.list.useQuery({
    search: vendorSearch || undefined,
    status: 'active',
    limit: 20,
  })

  const vendors = vendorsQuery.data?.items || []

  const createMutation = trpc.bench.jobOrders.create.useMutation({
    onSuccess: (data) => {
      toast.success('Job order created successfully')
      utils.bench.jobOrders.list.invalidate()
      onOpenChange(false)
      resetForm()
      router.push(`/employee/recruiting/job-orders/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create job order')
    },
  })

  const resetForm = () => {
    if (!preselectedVendorId) setVendorId('')
    setVendorSearch('')
    setClientName('')
    setTitle('')
    setDescription('')
    setLocation('')
    setWorkMode('')
    setRateType('hourly')
    setBillRate('')
    setDurationMonths('')
    setPositions('1')
    setPriority('medium')
    setSource('email')
    setResponseDueAt('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Job title is required')
      return
    }

    createMutation.mutate({
      vendorId: vendorId || undefined,
      clientName: clientName || undefined,
      title: title.trim(),
      description: description || undefined,
      location: location || undefined,
      workMode: workMode as 'onsite' | 'remote' | 'hybrid' | undefined,
      rateType: rateType as 'hourly' | 'daily' | 'monthly' | 'annual',
      billRate: billRate ? parseFloat(billRate) : undefined,
      durationMonths: durationMonths ? parseInt(durationMonths) : undefined,
      positions: parseInt(positions) || 1,
      priority: priority as 'low' | 'medium' | 'high' | 'urgent',
      source: source as 'email' | 'portal' | 'call' | 'referral',
      responseDueAt: responseDueAt || undefined,
    })
  }

  const selectedVendor = vendors.find(v => v.id === vendorId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Job Order</DialogTitle>
          <DialogDescription>
            Add a new job order from a vendor. You can submit bench consultants to this order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Vendor Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-charcoal-900">Source</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor</Label>
                  <Popover open={vendorOpen} onOpenChange={setVendorOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={vendorOpen}
                        className="w-full justify-between"
                      >
                        {selectedVendor ? (
                          <span className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {selectedVendor.name}
                          </span>
                        ) : (
                          "Select vendor..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search vendors..."
                          value={vendorSearch}
                          onValueChange={setVendorSearch}
                        />
                        <CommandList>
                          <CommandEmpty>No vendors found.</CommandEmpty>
                          <CommandGroup>
                            {vendors.map((vendor) => (
                              <CommandItem
                                key={vendor.id}
                                value={vendor.id}
                                onSelect={() => {
                                  setVendorId(vendor.id)
                                  setVendorOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    vendorId === vendor.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{vendor.name}</span>
                                  <span className="text-xs text-charcoal-500">{vendor.type}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="clientName">End Client Name</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Client company name"
                  />
                </div>

                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger id="source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="portal">Portal</SelectItem>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="responseDueAt">Response Due</Label>
                  <Input
                    id="responseDueAt"
                    type="datetime-local"
                    value={responseDueAt}
                    onChange={(e) => setResponseDueAt(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-charcoal-900">Job Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Senior Software Engineer"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Job description and requirements..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="New York, NY"
                  />
                </div>

                <div>
                  <Label htmlFor="workMode">Work Mode</Label>
                  <Select value={workMode} onValueChange={setWorkMode}>
                    <SelectTrigger id="workMode">
                      <SelectValue placeholder="Select work mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="positions">Open Positions</Label>
                  <Input
                    id="positions"
                    type="number"
                    min="1"
                    value={positions}
                    onChange={(e) => setPositions(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="durationMonths">Duration (months)</Label>
                  <Input
                    id="durationMonths"
                    type="number"
                    min="1"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    placeholder="12"
                  />
                </div>
              </div>
            </div>

            {/* Rates and Priority */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-charcoal-900">Rates and Priority</h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rateType">Rate Type</Label>
                  <Select value={rateType} onValueChange={setRateType}>
                    <SelectTrigger id="rateType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="billRate">Bill Rate ($)</Label>
                  <Input
                    id="billRate"
                    type="number"
                    step="0.01"
                    value={billRate}
                    onChange={(e) => setBillRate(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
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
                'Create Job Order'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
