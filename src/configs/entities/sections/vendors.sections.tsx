'use client'

/**
 * PCF-Compatible Section Adapters for Vendors
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Building2, MapPin, Phone, Globe, FileText, Activity, Users, DollarSign, Clock } from 'lucide-react'

interface Vendor {
  id: string
  name: string
  status: string
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  website?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  payment_terms?: string | null
  markup_percentage?: number | null
  tier?: string | null
  notes?: string | null
  created_at: string
  updated_at?: string
}

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

/**
 * Overview Section
 */
export function VendorOverviewSectionPCF({ entityId: _entityId, entity }: PCFSectionProps) {
  const vendor = entity as Vendor | undefined

  if (!vendor) return null

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left - Main info */}
      <div className="col-span-2 space-y-6">
        {/* Company Details Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-charcoal-500">Company Name</span>
                <p className="font-medium text-lg">{vendor.name}</p>
              </div>
              {vendor.tier && (
                <div>
                  <span className="text-sm text-charcoal-500">Tier</span>
                  <p>
                    <Badge variant="outline" className="capitalize">{vendor.tier}</Badge>
                  </p>
                </div>
              )}
              {vendor.website && (
                <div>
                  <span className="text-sm text-charcoal-500">Website</span>
                  <p>
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {vendor.website.replace(/^https?:\/\//, '')}
                    </a>
                  </p>
                </div>
              )}
              {(vendor.city || vendor.state) && (
                <div>
                  <span className="text-sm text-charcoal-500">Location</span>
                  <p className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-charcoal-400" />
                    {[vendor.city, vendor.state].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>
            {vendor.address && (
              <div>
                <span className="text-sm text-charcoal-500">Address</span>
                <p>{vendor.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Primary Contact Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Primary Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vendor.contact_name ? (
              <>
                <p className="font-medium text-lg">{vendor.contact_name}</p>
                {vendor.contact_email && (
                  <p className="text-sm">
                    <a href={`mailto:${vendor.contact_email}`} className="text-blue-600 hover:underline">
                      {vendor.contact_email}
                    </a>
                  </p>
                )}
                {vendor.contact_phone && (
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="w-4 h-4 text-charcoal-400" />
                    {vendor.contact_phone}
                  </p>
                )}
              </>
            ) : (
              <p className="text-charcoal-500">No contact information on file</p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {vendor.notes && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-charcoal-700 whitespace-pre-wrap">{vendor.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right - Terms & Timeline */}
      <div className="space-y-6">
        {/* Payment Terms */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-charcoal-500">Terms</span>
              <span className="font-medium">{vendor.payment_terms || 'Net 30'}</span>
            </div>
            {vendor.markup_percentage !== null && vendor.markup_percentage !== undefined && (
              <div className="flex justify-between">
                <span className="text-charcoal-500">Markup</span>
                <span className="font-medium">{vendor.markup_percentage}%</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Added</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(vendor.created_at), { addSuffix: true })}
              </span>
            </div>
            {vendor.updated_at && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Last Updated</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(vendor.updated_at), { addSuffix: true })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Consultants Section
 */
export function VendorConsultantsSectionPCF({ entityId: _entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Consultants
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Users className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No consultants from this vendor yet</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Activities Section
 */
export function VendorActivitiesSectionPCF({ entityId: _entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Activity className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No activities recorded yet</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Documents Section
 */
export function VendorDocumentsSectionPCF({ entityId: _entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <FileText className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No documents uploaded yet</p>
        </div>
      </CardContent>
    </Card>
  )
}













