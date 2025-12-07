'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Building2,
  Globe,
  Star,
  Edit2,
  MoreHorizontal,
  Trash2,
  Plus,
  Mail,
  Phone,
  Briefcase,
  User,
  Loader2,
  ExternalLink,
  Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { VendorPerformanceDashboard } from './VendorPerformanceDashboard'

interface VendorDetailPageProps {
  vendorId: string
}

const typeColors: Record<string, string> = {
  direct_client: 'bg-blue-100 text-blue-800',
  prime_vendor: 'bg-purple-100 text-purple-800',
  sub_vendor: 'bg-indigo-100 text-indigo-800',
  msp: 'bg-amber-100 text-amber-800',
  vms: 'bg-teal-100 text-teal-800',
}

const tierColors: Record<string, string> = {
  preferred: 'bg-gold-100 text-gold-700',
  standard: 'bg-charcoal-100 text-charcoal-700',
  new: 'bg-green-100 text-green-700',
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-charcoal-100 text-charcoal-600',
}

const typeLabels: Record<string, string> = {
  direct_client: 'Direct Client',
  prime_vendor: 'Prime Vendor',
  sub_vendor: 'Sub Vendor',
  msp: 'MSP',
  vms: 'VMS',
}

const jobOrderStatusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  working: 'bg-amber-100 text-amber-800',
  filled: 'bg-green-100 text-green-800',
  closed: 'bg-charcoal-100 text-charcoal-600',
  on_hold: 'bg-red-100 text-red-800',
}

export function VendorDetailPage({ vendorId }: VendorDetailPageProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [editMode, setEditMode] = useState(false)
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<string | null>(null)

  // Form state for editing
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')
  const [editTier, setEditTier] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editWebsite, setEditWebsite] = useState('')
  const [editIndustryFocus, setEditIndustryFocus] = useState('')
  const [editGeographicFocus, setEditGeographicFocus] = useState('')
  const [editNotes, setEditNotes] = useState('')

  // New contact form state
  const [newContactName, setNewContactName] = useState('')
  const [newContactEmail, setNewContactEmail] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactTitle, setNewContactTitle] = useState('')
  const [newContactDepartment, setNewContactDepartment] = useState('')
  const [newContactIsPrimary, setNewContactIsPrimary] = useState(false)

  // Fetch vendor data
  const vendorQuery = trpc.bench.vendors.getById.useQuery({ id: vendorId })

  // Fetch job orders for this vendor
  const jobOrdersQuery = trpc.bench.vendors.getJobOrders.useQuery({
    vendorId,
    status: 'all',
    limit: 20,
  })

  // Mutations
  const updateMutation = trpc.bench.vendors.update.useMutation({
    onSuccess: () => {
      toast.success('Vendor updated successfully')
      utils.bench.vendors.getById.invalidate({ id: vendorId })
      setEditMode(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update vendor')
    },
  })

  const deleteMutation = trpc.bench.vendors.delete.useMutation({
    onSuccess: () => {
      toast.success('Vendor deleted successfully')
      router.push('/employee/recruiting/vendors')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete vendor')
    },
  })

  const addContactMutation = trpc.bench.vendors.addContact.useMutation({
    onSuccess: () => {
      toast.success('Contact added successfully')
      utils.bench.vendors.getById.invalidate({ id: vendorId })
      setAddContactOpen(false)
      resetContactForm()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add contact')
    },
  })

  const deleteContactMutation = trpc.bench.vendors.deleteContact.useMutation({
    onSuccess: () => {
      toast.success('Contact deleted successfully')
      utils.bench.vendors.getById.invalidate({ id: vendorId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete contact')
    },
  })

  const vendor = vendorQuery.data
  const jobOrders = jobOrdersQuery.data || []

  // Initialize edit form when entering edit mode
  const startEdit = () => {
    if (vendor) {
      setEditName(vendor.name)
      setEditType(vendor.type)
      setEditTier(vendor.tier || 'standard')
      setEditStatus(vendor.status)
      setEditWebsite(vendor.website || '')
      setEditIndustryFocus(vendor.industry_focus?.join(', ') || '')
      setEditGeographicFocus(vendor.geographic_focus?.join(', ') || '')
      setEditNotes(vendor.notes || '')
    }
    setEditMode(true)
  }

  const cancelEdit = () => {
    setEditMode(false)
  }

  const saveEdit = () => {
    updateMutation.mutate({
      id: vendorId,
      name: editName,
      type: editType as 'direct_client' | 'prime_vendor' | 'sub_vendor' | 'msp' | 'vms',
      tier: editTier as 'preferred' | 'standard' | 'new',
      status: editStatus as 'active' | 'inactive',
      website: editWebsite || undefined,
      industryFocus: editIndustryFocus ? editIndustryFocus.split(',').map(s => s.trim()) : undefined,
      geographicFocus: editGeographicFocus ? editGeographicFocus.split(',').map(s => s.trim()) : undefined,
      notes: editNotes || undefined,
    })
  }

  const resetContactForm = () => {
    setNewContactName('')
    setNewContactEmail('')
    setNewContactPhone('')
    setNewContactTitle('')
    setNewContactDepartment('')
    setNewContactIsPrimary(false)
  }

  const handleAddContact = () => {
    if (!newContactName.trim()) {
      toast.error('Contact name is required')
      return
    }

    addContactMutation.mutate({
      vendorId,
      name: newContactName,
      email: newContactEmail || undefined,
      phone: newContactPhone || undefined,
      title: newContactTitle || undefined,
      department: newContactDepartment || undefined,
      isPrimary: newContactIsPrimary,
    })
  }

  if (vendorQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal-900">Vendor not found</h3>
          <p className="text-charcoal-500 mb-4">The vendor you are looking for does not exist.</p>
          <Link href="/employee/recruiting/vendors">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vendors
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/employee/recruiting/vendors">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-heading font-semibold text-charcoal-900">{vendor.name}</h1>
              <Badge className={cn(typeColors[vendor.type])}>{typeLabels[vendor.type]}</Badge>
              <Badge className={cn(tierColors[vendor.tier || 'standard'])}>
                {vendor.tier === 'preferred' && <Star className="w-3 h-3 mr-1" />}
                {vendor.tier}
              </Badge>
              <Badge className={cn(statusColors[vendor.status])}>{vendor.status}</Badge>
            </div>
            {vendor.website && (
              <a
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-charcoal-500 hover:text-hublot-700"
              >
                <Globe className="w-3 h-3" />
                {vendor.website}
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={cancelEdit} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={saveEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={startEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setAddContactOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => deleteMutation.mutate({ id: vendorId })}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Vendor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({vendor.contacts?.length || 0})</TabsTrigger>
          <TabsTrigger value="job-orders">Job Orders ({jobOrders.length})</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {editMode ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Vendor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="edit-name">Vendor Name</Label>
                    <Input
                      id="edit-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-type">Type</Label>
                    <Select value={editType} onValueChange={setEditType}>
                      <SelectTrigger id="edit-type">
                        <SelectValue />
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
                    <Label htmlFor="edit-tier">Tier</Label>
                    <Select value={editTier} onValueChange={setEditTier}>
                      <SelectTrigger id="edit-tier">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preferred">Preferred</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger id="edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-website">Website</Label>
                    <Input
                      id="edit-website"
                      type="url"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-industry">Industry Focus</Label>
                    <Input
                      id="edit-industry"
                      value={editIndustryFocus}
                      onChange={(e) => setEditIndustryFocus(e.target.value)}
                      placeholder="Comma-separated"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-geo">Geographic Focus</Label>
                    <Input
                      id="edit-geo"
                      value={editGeographicFocus}
                      onChange={(e) => setEditGeographicFocus(e.target.value)}
                      placeholder="Comma-separated"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="edit-notes">Notes</Label>
                    <Textarea
                      id="edit-notes"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-charcoal-500">Industry Focus</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {vendor.industry_focus && vendor.industry_focus.length > 0 ? (
                        vendor.industry_focus.map((industry: string) => (
                          <Badge key={industry} variant="outline">{industry}</Badge>
                        ))
                      ) : (
                        <span className="text-charcoal-400">Not specified</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-charcoal-500">Geographic Focus</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {vendor.geographic_focus && vendor.geographic_focus.length > 0 ? (
                        vendor.geographic_focus.map((geo: string) => (
                          <Badge key={geo} variant="outline">{geo}</Badge>
                        ))
                      ) : (
                        <span className="text-charcoal-400">Not specified</span>
                      )}
                    </div>
                  </div>
                  {vendor.notes && (
                    <div>
                      <Label className="text-charcoal-500">Notes</Label>
                      <p className="text-charcoal-700 mt-1">{vendor.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-charcoal-500">Job Orders</Label>
                      <p className="text-2xl font-bold text-charcoal-900">{jobOrders.length}</p>
                    </div>
                    <div>
                      <Label className="text-charcoal-500">Contacts</Label>
                      <p className="text-2xl font-bold text-charcoal-900">{vendor.contacts?.length || 0}</p>
                    </div>
                    <div>
                      <Label className="text-charcoal-500">Active Orders</Label>
                      <p className="text-2xl font-bold text-green-600">
                        {jobOrders.filter(jo => jo.status === 'working').length}
                      </p>
                    </div>
                    <div>
                      <Label className="text-charcoal-500">Created</Label>
                      <p className="text-sm text-charcoal-600">
                        {formatDistanceToNow(new Date(vendor.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Contacts</CardTitle>
                <CardDescription>Manage vendor contacts</CardDescription>
              </div>
              <Button onClick={() => setAddContactOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </CardHeader>
            <CardContent>
              {vendor.contacts && vendor.contacts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Primary</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendor.contacts.map((contact: {
                      id: string
                      name: string
                      title?: string
                      email?: string
                      phone?: string
                      is_primary?: boolean
                    }) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.title || '-'}</TableCell>
                        <TableCell>
                          {contact.email ? (
                            <a href={`mailto:${contact.email}`} className="text-hublot-700 hover:underline">
                              {contact.email}
                            </a>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{contact.phone || '-'}</TableCell>
                        <TableCell>
                          {contact.is_primary && (
                            <Badge className="bg-gold-100 text-gold-700">Primary</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => deleteContactMutation.mutate({ contactId: contact.id })}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-charcoal-900">No contacts</h3>
                  <p className="text-charcoal-500 mb-4">Add contacts for this vendor</p>
                  <Button onClick={() => setAddContactOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Orders Tab */}
        <TabsContent value="job-orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Orders from this Vendor</CardTitle>
              <CardDescription>
                Job orders received from {vendor.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobOrders.map((order) => (
                      <TableRow key={order.id} className="group">
                        <TableCell>
                          <Link
                            href={`/employee/recruiting/job-orders/${order.id}`}
                            className="font-medium text-charcoal-900 group-hover:text-hublot-700"
                          >
                            {order.title}
                          </Link>
                        </TableCell>
                        <TableCell>{order.client_name || '-'}</TableCell>
                        <TableCell>{order.location || '-'}</TableCell>
                        <TableCell>
                          {order.bill_rate ? `$${order.bill_rate}/hr` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(jobOrderStatusColors[order.status] || 'bg-charcoal-100')}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-charcoal-500">
                          {formatDistanceToNow(new Date(order.received_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Link href={`/employee/recruiting/job-orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-charcoal-900">No job orders</h3>
                  <p className="text-charcoal-500">No job orders received from this vendor yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <VendorPerformanceDashboard
            vendorId={vendorId}
            vendorName={vendor.name}
          />
        </TabsContent>
      </Tabs>

      {/* Add Contact Dialog */}
      <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>
              Add a new contact for {vendor.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="contact-name">Name *</Label>
                <Input
                  id="contact-name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Contact name"
                />
              </div>
              <div>
                <Label htmlFor="contact-title">Title</Label>
                <Input
                  id="contact-title"
                  value={newContactTitle}
                  onChange={(e) => setNewContactTitle(e.target.value)}
                  placeholder="Job title"
                />
              </div>
              <div>
                <Label htmlFor="contact-department">Department</Label>
                <Input
                  id="contact-department"
                  value={newContactDepartment}
                  onChange={(e) => setNewContactDepartment(e.target.value)}
                  placeholder="Department"
                />
              </div>
              <div>
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="contact-primary"
                  checked={newContactIsPrimary}
                  onChange={(e) => setNewContactIsPrimary(e.target.checked)}
                  className="rounded border-charcoal-300"
                />
                <Label htmlFor="contact-primary">Set as primary contact</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddContactOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={addContactMutation.isPending}>
              {addContactMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
