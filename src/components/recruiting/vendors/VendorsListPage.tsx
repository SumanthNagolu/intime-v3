'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { CreateVendorDialog } from './CreateVendorDialog'
import {
  Plus,
  Search,
  Warehouse,
  ExternalLink,
  Loader2,
  Star,
  Building2,
  Users,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-charcoal-100 text-charcoal-600',
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

const typeLabels: Record<string, string> = {
  direct_client: 'Direct Client',
  prime_vendor: 'Prime Vendor',
  sub_vendor: 'Sub Vendor',
  msp: 'MSP',
  vms: 'VMS',
}

export function VendorsListPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Fetch vendors
  const vendorsQuery = trpc.bench.vendors.list.useQuery({
    search: search || undefined,
    type: typeFilter as 'direct_client' | 'prime_vendor' | 'sub_vendor' | 'msp' | 'vms' | 'all',
    tier: tierFilter as 'preferred' | 'standard' | 'new' | 'all',
    status: statusFilter as 'active' | 'inactive' | 'all',
    limit: 50,
  })

  const vendors = vendorsQuery.data?.items || []
  const total = vendorsQuery.data?.total || 0

  // Calculate summary stats
  const preferredCount = vendors.filter(v => v.tier === 'preferred').length
  const primeCount = vendors.filter(v => v.type === 'prime_vendor').length
  const directClientCount = vendors.filter(v => v.type === 'direct_client').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-charcoal-900">Vendors</h1>
          <p className="text-charcoal-500">Manage vendors and supplier relationships</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Vendor
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Total Vendors</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Warehouse className="w-8 h-8 text-charcoal-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Preferred</p>
                <p className="text-2xl font-bold text-gold-600">{preferredCount}</p>
              </div>
              <Star className="w-8 h-8 text-gold-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Prime Vendors</p>
                <p className="text-2xl font-bold text-purple-600">{primeCount}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Direct Clients</p>
                <p className="text-2xl font-bold text-blue-600">{directClientCount}</p>
              </div>
              <Users className="w-8 h-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
              <Input
                placeholder="Search vendors by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="direct_client">Direct Client</SelectItem>
                <SelectItem value="prime_vendor">Prime Vendor</SelectItem>
                <SelectItem value="sub_vendor">Sub Vendor</SelectItem>
                <SelectItem value="msp">MSP</SelectItem>
                <SelectItem value="vms">VMS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="preferred">Preferred</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {total} Vendor{total !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vendorsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12">
              <Warehouse className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900">No vendors found</h3>
              <p className="text-charcoal-500 mb-4">
                {search ? 'Try a different search term' : 'Get started by adding your first vendor'}
              </p>
              {!search && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vendor
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Industry Focus</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => {
                  // Find primary contact
                  const primaryContact = Array.isArray(vendor.primary_contact)
                    ? vendor.primary_contact.find((c: { is_primary?: boolean }) => c.is_primary)
                    : null
                  return (
                    <TableRow key={vendor.id} className="group">
                      <TableCell>
                        <Link href={`/employee/recruiting/vendors/${vendor.id}`} className="block">
                          <div className="font-medium text-charcoal-900 group-hover:text-hublot-700">
                            {vendor.name}
                          </div>
                          {vendor.website && (
                            <div className="flex items-center gap-1 text-sm text-charcoal-500">
                              <Globe className="w-3 h-3" />
                              {vendor.website.replace(/^https?:\/\//, '')}
                            </div>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(typeColors[vendor.type] || typeColors.sub_vendor)}>
                          {typeLabels[vendor.type] || vendor.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(tierColors[vendor.tier] || tierColors.standard)}>
                          {vendor.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(statusColors[vendor.status] || statusColors.inactive)}>
                          {vendor.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {vendor.industry_focus && vendor.industry_focus.length > 0 ? (
                          <span className="text-charcoal-600">
                            {vendor.industry_focus.slice(0, 2).join(', ')}
                            {vendor.industry_focus.length > 2 && ` +${vendor.industry_focus.length - 2}`}
                          </span>
                        ) : (
                          <span className="text-charcoal-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {primaryContact ? (
                          <div>
                            <span className="text-charcoal-600">{primaryContact.name}</span>
                            {primaryContact.email && (
                              <div className="text-xs text-charcoal-400">{primaryContact.email}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-charcoal-400">No contact</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/employee/recruiting/vendors/${vendor.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Vendor Dialog */}
      <CreateVendorDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}
