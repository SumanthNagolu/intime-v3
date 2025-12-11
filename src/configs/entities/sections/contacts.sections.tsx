'use client'

/**
 * PCF-Compatible Section Adapters for Contacts
 *
 * These wrapper components adapt the existing Contact section components
 * to the PCF SectionConfig interface: { entityId: string; entity?: unknown }
 *
 * Callbacks are handled via the PCF event system (window events).
 * The detail page listens for these events and manages dialog state.
 */

import { useState } from 'react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { Contact, CONTACT_STATUS_CONFIG } from '../contacts.config'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EditableInfoCard, type FieldDefinition } from '@/components/ui/editable-info-card'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { ActivitiesSection } from '@/components/pcf/sections/ActivitiesSection'
import { NotesSection } from '@/components/pcf/sections/NotesSection'
import {
  UserCircle,
  Building2,
  Mail,
  Phone,
  Linkedin,
  Star,
  Clock,
  Send,
  Loader2,
} from 'lucide-react'

/**
 * Dispatch a dialog open event for the Contact entity
 * The detail page listens for this and manages dialog state
 */
function dispatchContactDialog(dialogId: string, contactId: string) {
  window.dispatchEvent(
    new CustomEvent('openContactDialog', {
      detail: { dialogId, contactId },
    })
  )
}

// ==========================================
// PCF Section Adapters
// ==========================================

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

// Field definitions for editable cards
// Note: department removed as it's not in the unified contacts schema
const basicInfoFields: FieldDefinition[] = [
  { key: 'first_name', label: 'First Name', type: 'text', required: true },
  { key: 'last_name', label: 'Last Name', type: 'text', required: true },
  { key: 'title', label: 'Title', type: 'text' },
]

const contactInfoFields: FieldDefinition[] = [
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone', type: 'phone' },
  { key: 'mobile', label: 'Mobile', type: 'phone' },
  { key: 'linkedin_url', label: 'LinkedIn', type: 'url' },
]

/**
 * Overview Section Adapter
 * Shows basic info (editable), contact info (editable), quick stats
 */
export function ContactOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
  const { toast } = useToast()
  const contact = entity as Contact | undefined
  const utils = trpc.useUtils()

  // Query for activities to show count
  const activitiesQuery = trpc.crm.activities.listByContact.useQuery(
    { contactId: entityId, limit: 5 },
    { enabled: !!entityId }
  )
  const activities = activitiesQuery.data?.items || []

  // Update mutation - Using unified contacts router
  const updateContactMutation = trpc.unifiedContacts.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Contact updated successfully' })
      utils.unifiedContacts.getById.invalidate({ id: entityId })
    },
    onError: (error) => {
      toast({ title: 'Failed to update contact', description: error.message, variant: 'error' })
    },
  })

  if (!contact) return null

  // Handler for saving basic info
  const handleSaveBasicInfo = async (data: Record<string, unknown>) => {
    await updateContactMutation.mutateAsync({
      id: entityId,
      firstName: data.first_name as string,
      lastName: data.last_name as string,
      title: data.title as string,
    })
  }

  // Handler for saving contact info
  const handleSaveContactInfo = async (data: Record<string, unknown>) => {
    await updateContactMutation.mutateAsync({
      id: entityId,
      email: data.email as string,
      phone: data.phone as string,
      mobile: data.mobile as string,
      linkedinUrl: data.linkedin_url as string,
    })
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="col-span-2 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-charcoal-400" />
                <span className="text-sm text-charcoal-500">Account</span>
              </div>
              <div className="text-lg font-bold text-charcoal-900 mt-1 truncate">
                {contact.account ? (contact.account as { name: string }).name : 'None'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-charcoal-400" />
                <span className="text-sm text-charcoal-500">Activities</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900 mt-1">
                {activities.length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-charcoal-400" />
                <span className="text-sm text-charcoal-500">Submissions</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900 mt-1">0</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-charcoal-400" />
                <span className="text-sm text-charcoal-500">Role</span>
              </div>
              <div className="mt-1">
                <Badge variant={contact.is_primary ? 'default' : 'outline'}>
                  {contact.is_primary ? 'Primary Contact' : 'Contact'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Basic Info - Editable */}
        <EditableInfoCard
          title="Basic Information"
          fields={basicInfoFields}
          data={contact as unknown as Record<string, unknown>}
          onSave={handleSaveBasicInfo}
          columns={2}
        />

        {/* Recent Activity */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : activities.length === 0 ? (
              <p className="text-charcoal-500 text-center py-4">No recent activities</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-hublot-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-hublot-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {activity.activity_type}
                        </Badge>
                        {activity.outcome && (
                          <Badge variant="secondary" className="capitalize">
                            {activity.outcome}
                          </Badge>
                        )}
                      </div>
                      {activity.subject && (
                        <p className="font-medium text-charcoal-900 mt-1">
                          {activity.subject}
                        </p>
                      )}
                      <p className="text-xs text-charcoal-500 mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Contact Info - Editable */}
        <EditableInfoCard
          title="Contact Information"
          fields={contactInfoFields}
          data={contact as unknown as Record<string, unknown>}
          onSave={handleSaveContactInfo}
          columns={1}
        />

        {/* Account Card */}
        {contact.account && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/employee/recruiting/accounts/${(contact.account as { id: string }).id}`}
                className="block p-4 border rounded-lg hover:border-hublot-300 transition-colors"
              >
                <p className="font-medium text-charcoal-900">
                  {(contact.account as { name: string }).name}
                </p>
                <p className="text-sm text-charcoal-500 mt-1">View account details</p>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Timeline Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Created</span>
              <span className="font-medium">
                {contact.created_at
                  ? formatDistanceToNow(new Date(contact.created_at), { addSuffix: true })
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Last Updated</span>
              <span className="font-medium">
                {contact.updated_at
                  ? formatDistanceToNow(new Date(contact.updated_at), { addSuffix: true })
                  : '-'}
              </span>
            </div>
            {contact.last_contact_date && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Last Contact</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(contact.last_contact_date), { addSuffix: true })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        {contact.status && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={CONTACT_STATUS_CONFIG[contact.status]?.color}>
                {CONTACT_STATUS_CONFIG[contact.status]?.label || contact.status}
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

/**
 * Activities Section Adapter
 */
export function ContactActivitiesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <ActivitiesSection
      entityType="contact"
      entityId={entityId}
      onLogActivity={() => dispatchContactDialog('logActivity', entityId)}
    />
  )
}

/**
 * Notes Section Adapter
 */
export function ContactNotesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <NotesSection
      entityType="contact"
      entityId={entityId}
      notes={[]}
      showInlineForm={true}
    />
  )
}

/**
 * Accounts Section Adapter
 * Shows associated accounts
 */
export function ContactAccountsSectionPCF({ entityId, entity }: PCFSectionProps) {
  const contact = entity as Contact | undefined

  if (!contact) return null

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Associated Accounts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contact.account ? (
          <Link
            href={`/employee/recruiting/accounts/${(contact.account as { id: string }).id}`}
            className="block p-4 border rounded-lg hover:border-hublot-300 transition-colors"
          >
            <p className="font-medium text-charcoal-900">
              {(contact.account as { name: string }).name}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">Primary Account</p>
          </Link>
        ) : (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">Not associated with any account</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Submissions Section Adapter
 */
export function ContactSubmissionsSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Related Submissions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Send className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
          <p className="text-charcoal-500">No submissions linked to this contact</p>
        </div>
      </CardContent>
    </Card>
  )
}

