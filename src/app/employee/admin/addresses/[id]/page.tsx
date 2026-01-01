'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, MapPin, Edit2, Trash2, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/lib/trpc/client'
import { AddressDisplay } from '@/components/addresses'
import {
  ADDRESS_TYPE_CONFIG,
  ENTITY_TYPE_CONFIG,
} from '@/configs/entities/addresses.config'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function AddressDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const addressId = params.id as string

  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch address data
  const addressQuery = trpc.addresses.getById.useQuery({ id: addressId })
  const address = addressQuery.data

  // Mutations
  const setPrimaryMutation = trpc.addresses.setPrimary.useMutation({
    onSuccess: () => {
      toast({ title: 'Address set as primary' })
      addressQuery.refetch()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const deleteMutation = trpc.addresses.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Address deleted' })
      router.push('/employee/admin/addresses')
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const handleSetPrimary = () => {
    setPrimaryMutation.mutate({ id: addressId })
  }

  const handleDelete = () => {
    setIsDeleting(true)
    deleteMutation.mutate({ id: addressId })
  }

  // Get entity route for "View Entity" link
  const getEntityRoute = (entityType: string, entityId: string) => {
    const routes: Record<string, string> = {
      account: `/employee/recruiting/accounts/${entityId}`,
      contact: `/employee/contacts/${entityId}`,
      job: `/employee/recruiting/jobs/${entityId}`,
      candidate: `/employee/recruiting/candidates/${entityId}`,
      employee: `/employee/hr/employees/${entityId}`,
      vendor: `/employee/bench/vendors/${entityId}`,
      lead: `/employee/crm/leads/${entityId}`,
      interview: `/employee/recruiting/interviews/${entityId}`,
      placement: `/employee/recruiting/placements/${entityId}`,
      organization: `/employee/admin/settings`,
    }
    return routes[entityType] || '#'
  }

  if (addressQuery.isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!address) {
    return (
      <div className="p-6">
        <p className="text-charcoal-500">Address not found</p>
        <Link href="/employee/admin/addresses">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Addresses
          </Button>
        </Link>
      </div>
    )
  }

  const entityConfig = ENTITY_TYPE_CONFIG[address.entityType]
  const addressTypeConfig = ADDRESS_TYPE_CONFIG[address.addressType]

  // Build title from city/state or address line
  const titleParts: string[] = []
  if (address.city) titleParts.push(address.city)
  if (address.stateProvince) titleParts.push(address.stateProvince)
  const title = titleParts.join(', ') || address.addressLine1 || 'Address'

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/employee/admin/addresses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-charcoal-500" />
            <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
              {title}
            </h1>
            {address.isPrimary && (
              <Badge className="bg-gold-100 text-gold-800">Primary</Badge>
            )}
            {address.isVerified && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Check className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <p className="text-charcoal-500">
            {addressTypeConfig?.label || address.addressType} for{' '}
            {entityConfig?.label || address.entityType}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!address.isPrimary && (
            <Button
              variant="outline"
              onClick={handleSetPrimary}
              disabled={setPrimaryMutation.isPending}
            >
              <Star className="w-4 h-4 mr-2" />
              Set as Primary
            </Button>
          )}
          <Link href={`/employee/admin/addresses/${addressId}/edit`}>
            <Button variant="outline">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Address</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this address? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Address Details</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressDisplay address={address} variant="full" showVerified />
            </CardContent>
          </Card>

          {/* Full Address Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Full Address</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-charcoal-500">
                    Street Address
                  </dt>
                  <dd className="text-charcoal-900">
                    {address.addressLine1 || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-charcoal-500">
                    Address Line 2
                  </dt>
                  <dd className="text-charcoal-900">
                    {address.addressLine2 || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-charcoal-500">City</dt>
                  <dd className="text-charcoal-900">{address.city || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-charcoal-500">
                    State/Province
                  </dt>
                  <dd className="text-charcoal-900">
                    {address.stateProvince || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-charcoal-500">
                    ZIP/Postal Code
                  </dt>
                  <dd className="text-charcoal-900">
                    {address.postalCode || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-charcoal-500">Country</dt>
                  <dd className="text-charcoal-900">{address.countryCode}</dd>
                </div>
                {address.county && (
                  <div>
                    <dt className="font-medium text-charcoal-500">County</dt>
                    <dd className="text-charcoal-900">{address.county}</dd>
                  </div>
                )}
                {(address.latitude || address.longitude) && (
                  <div className="col-span-2">
                    <dt className="font-medium text-charcoal-500">
                      Coordinates
                    </dt>
                    <dd className="text-charcoal-900">
                      {address.latitude}, {address.longitude}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Notes */}
          {address.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-charcoal-600">{address.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Linked Entity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Linked Entity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {entityConfig && (
                  <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center">
                    <entityConfig.icon className="w-5 h-5 text-charcoal-500" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-charcoal-900">
                    {entityConfig?.label || address.entityType}
                  </p>
                  <p className="text-xs text-charcoal-500 font-mono">
                    {address.entityId.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <Link
                href={getEntityRoute(address.entityType, address.entityId)}
              >
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View {entityConfig?.label || 'Entity'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-charcoal-500">Address Type</dt>
                  <dd>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${addressTypeConfig?.color || 'bg-gray-100'}`}
                    >
                      {addressTypeConfig?.label || address.addressType}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-charcoal-500">Created</dt>
                  <dd className="text-charcoal-900">
                    {new Date(address.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-charcoal-500">Updated</dt>
                  <dd className="text-charcoal-900">
                    {new Date(address.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
                {address.effectiveFrom && (
                  <div>
                    <dt className="font-medium text-charcoal-500">
                      Effective From
                    </dt>
                    <dd className="text-charcoal-900">
                      {new Date(address.effectiveFrom).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {address.effectiveTo && (
                  <div>
                    <dt className="font-medium text-charcoal-500">
                      Effective To
                    </dt>
                    <dd className="text-charcoal-900">
                      {new Date(address.effectiveTo).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
