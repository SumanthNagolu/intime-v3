'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EditableInfoCard, type FieldDefinition } from '@/components/ui/editable-info-card'
import {
  UserCircle,
  Building2,
  Mail,
  Star,
  Edit,
  MessageSquare,
  Calendar,
  Clock,
  Send,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'

// Field definitions for editable cards
const basicInfoFields: FieldDefinition[] = [
  { key: 'first_name', label: 'First Name', type: 'text', required: true },
  { key: 'last_name', label: 'Last Name', type: 'text', required: true },
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'department', label: 'Department', type: 'text' },
]

const contactInfoFields: FieldDefinition[] = [
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone', type: 'phone' },
  { key: 'mobile', label: 'Mobile', type: 'phone' },
  { key: 'linkedin_url', label: 'LinkedIn', type: 'url' },
]

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const contactId = params.id as string

  // Get current section from URL
  const currentSection = searchParams.get('section') || 'overview'

  // Queries
  const contactQuery = trpc.crm.contacts.getById.useQuery({ id: contactId })
  const activitiesQuery = trpc.crm.activities.listByContact.useQuery(
    { contactId, limit: 5 },
    { enabled: currentSection === 'overview' || currentSection === 'activities' }
  )

  const contact = contactQuery.data
  const activities = activitiesQuery.data?.items || []

  // Update mutation
  const utils = trpc.useUtils()
  const updateContactMutation = trpc.crm.contacts.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Contact updated successfully' })
      utils.crm.contacts.getById.invalidate({ id: contactId })
    },
    onError: (error) => {
      toast({ title: 'Failed to update contact', description: error.message, variant: 'error' })
    },
  })

  // Loading state
  if (contactQuery.isLoading) {
    return (
      <SidebarLayout>
        <div className="container mx-auto px-6 py-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </SidebarLayout>
    )
  }

  // Error state
  if (!contact) {
    return (
      <SidebarLayout>
        <div className="container mx-auto px-6 py-6">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <UserCircle className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                <p className="text-charcoal-500">Contact not found</p>
                <Button className="mt-4" onClick={() => router.push('/employee/contacts')}>
                  Back to Contacts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    )
  }

  // Handler for saving basic info
  const handleSaveBasicInfo = async (data: Record<string, unknown>) => {
    await updateContactMutation.mutateAsync({
      id: contactId,
      firstName: data.first_name as string,
      lastName: data.last_name as string,
      title: data.title as string,
      department: data.department as string,
    })
  }

  // Handler for saving contact info
  const handleSaveContactInfo = async (data: Record<string, unknown>) => {
    await updateContactMutation.mutateAsync({
      id: contactId,
      email: data.email as string,
      phone: data.phone as string,
      mobile: data.mobile as string,
      linkedinUrl: data.linkedin_url as string,
    })
  }

  // Render section content
  const renderSectionContent = () => {
    switch (currentSection) {
      case 'overview':
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
                    <div className="text-2xl font-bold text-charcoal-900 mt-1">
                      0
                    </div>
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
              <Card>
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
                    <p className="text-charcoal-500 text-center py-4">
                      No recent activities
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
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
                <Card>
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
                      <p className="text-sm text-charcoal-500 mt-1">
                        View account details
                      </p>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Timeline Card */}
              <Card>
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
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'activities':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                All Activities
              </CardTitle>
              <CardDescription>
                Activity history for this contact
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activitiesQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                  <p className="text-charcoal-500">No activities recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-hublot-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-hublot-700" />
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
                          <p className="font-medium text-charcoal-900 mt-2">
                            {activity.subject}
                          </p>
                        )}
                        {activity.notes && (
                          <p className="text-sm text-charcoal-600 mt-1">
                            {activity.notes}
                          </p>
                        )}
                        <p className="text-xs text-charcoal-500 mt-2">
                          {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'accounts':
        return (
          <Card>
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
                  <p className="text-sm text-charcoal-500 mt-1">
                    Primary Account
                  </p>
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

      case 'submissions':
        return (
          <Card>
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

      case 'communications':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                <p className="text-charcoal-500">Email integration coming soon</p>
              </div>
            </CardContent>
          </Card>
        )

      case 'meetings':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                <p className="text-charcoal-500">No meetings scheduled</p>
              </div>
            </CardContent>
          </Card>
        )

      case 'notes':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                <p className="text-charcoal-500">No notes yet</p>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <SidebarLayout>
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-hublot-100 flex items-center justify-center">
              <span className="text-lg font-medium text-hublot-700">
                {contact.first_name?.[0]}
                {contact.last_name?.[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-heading font-bold text-charcoal-900">
                  {contact.first_name} {contact.last_name}
                </h1>
                {contact.is_primary && (
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                )}
              </div>
              {contact.title && (
                <p className="text-charcoal-500">
                  {contact.title}
                  {contact.account && (
                    <span>
                      {' at '}
                      <Link
                        href={`/employee/recruiting/accounts/${(contact.account as { id: string }).id}`}
                        className="text-hublot-600 hover:underline"
                      >
                        {(contact.account as { name: string }).name}
                      </Link>
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push(`/employee/contacts/${contactId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Contact
          </Button>
        </div>

        {/* Section Content */}
        {renderSectionContent()}
      </div>
    </SidebarLayout>
  )
}
