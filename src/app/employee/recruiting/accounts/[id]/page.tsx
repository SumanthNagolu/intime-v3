'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  Globe,
  Phone,
  MapPin,
  Users,
  Briefcase,
  Calendar,
  Edit,
  MoreHorizontal,
  Star,
  AlertTriangle,
  CheckCircle,
  Loader2,
  MessageSquare,
  FileText,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogActivityDialog } from '@/components/recruiting/accounts/LogActivityDialog'
import { AddContactDialog } from '@/components/recruiting/accounts/AddContactDialog'
import { CreateMeetingDialog } from '@/components/recruiting/accounts/CreateMeetingDialog'
import { CreateEscalationDialog } from '@/components/recruiting/accounts/CreateEscalationDialog'
import { AddNoteDialog } from '@/components/recruiting/accounts/AddNoteDialog'
import { AddDocumentDialog } from '@/components/recruiting/accounts/AddDocumentDialog'
import { useEntityData } from '@/components/layouts/EntityContextProvider'

// Import isolated section components - each handles its own data fetching and inline panels
import {
  AccountOverviewSection,
  AccountContactsSection,
  AccountJobsSection,
  AccountPlacementsSection,
  AccountDocumentsSection,
  AccountActivitiesSection,
  AccountMeetingsSection,
  AccountNotesSection,
  AccountEscalationsSection,
} from '@/components/recruiting/accounts/sections'

// Type for account data from server
interface AccountData {
  id: string
  name: string
  industry: string | null
  status: string
  website: string | null
  phone: string | null
  city: string | null
  state: string | null
  tier: string | null
  description: string | null
  headquarters_location: string | null
  linkedin_url: string | null
  relationship_health: string | null
  nps_score: number | null
  last_contact_date: string | null
  onboarding_status: string | null
  onboarding_completed_at: string | null
  billing_frequency: string | null
  payment_terms_days: number | null
  po_required: boolean | null
  preferred_contact_method: string | null
  meeting_cadence: string | null
  owner: { id: string; full_name: string; avatar_url: string | null } | null
}

/**
 * Account Detail Page - Guidewire Architecture Pattern
 *
 * Data Flow:
 * 1. Account core data comes from server layout via EntityContextProvider
 * 2. Each tab section fetches its own data when rendered
 * 3. Clear triggers: section === 'X' → render X section → X section fetches its data
 * 4. Detail views are handled via inline panels within each section (no popups)
 *
 * DB Call Summary:
 * - Page load: 0 calls (uses server-fetched data from layout)
 * - Overview tab: 2 calls (contacts for primary, jobs for active list)
 * - Contacts tab: 1 call (contacts.listByAccount)
 * - Jobs tab: 1 call (jobs.list)
 * - Placements tab: 1 call (placements.list)
 * - Activities tab: 1 call (activities.listByAccount)
 * - Meetings tab: 1 call (meetingNotes.listByAccount)
 * - Notes tab: 1 call (notes.listByAccount)
 * - Escalations tab: 1 call (escalations.listByAccount)
 */
export default function AccountDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const accountId = params.id as string
  const utils = trpc.useUtils()

  // Get active section from URL query params, default to 'overview'
  const activeSection = searchParams.get('section') || 'overview'

  // Dialog states - only for "create new" dialogs, not detail views
  // Detail views are now handled via inline panels within each section
  const [logActivityOpen, setLogActivityOpen] = useState(false)
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [createMeetingOpen, setCreateMeetingOpen] = useState(false)
  const [createEscalationOpen, setCreateEscalationOpen] = useState(false)
  const [addNoteOpen, setAddNoteOpen] = useState(false)
  const [addDocumentOpen, setAddDocumentOpen] = useState(false)

  // Use account data from server layout context (NO client refetch!)
  const entityData = useEntityData<AccountData>()
  const account = entityData?.data

  // Status mutation - invalidates account data after update
  const updateStatusMutation = trpc.crm.accounts.updateStatus.useMutation({
    onSuccess: () => {
      utils.crm.accounts.getById.invalidate({ id: accountId })
      toast({ title: 'Status updated successfully' })
    },
    onError: (error) => {
      toast({ title: 'Error updating status', description: error.message, variant: 'error' })
    },
  })

  // Listen for dialog events from sidebar quick actions
  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string; entityType?: string; entityId?: string }>) => {
      const { dialogId } = event.detail
      switch (dialogId) {
        case 'addContact':
          setAddContactOpen(true)
          break
        case 'logActivity':
          setLogActivityOpen(true)
          break
      }
    }

    // Listen for the generic entity dialog event (dispatched by SidebarLayout)
    window.addEventListener('openEntityDialog', handleOpenDialog as EventListener)
    return () => {
      window.removeEventListener('openEntityDialog', handleOpenDialog as EventListener)
    }
  }, [])

  // Account data comes from server layout - should never be null
  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with quick contact info and actions */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 text-sm text-charcoal-500">
          {account.website && (
            <a href={account.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-hublot-900">
              <Globe className="w-4 h-4" />
              Website
            </a>
          )}
          {account.phone && (
            <a href={`tel:${account.phone}`} className="flex items-center gap-1 hover:text-hublot-900">
              <Phone className="w-4 h-4" />
              {account.phone}
            </a>
          )}
          {account.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {account.city}{account.state ? `, ${account.state}` : ''}
            </span>
          )}
          {account.tier && (
            <Badge variant="outline" className="border-gold-500 text-gold-600">
              <Star className="w-3 h-3 mr-1" />
              {account.tier}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setLogActivityOpen(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Log Activity
          </Button>
          <Button onClick={() => setCreateMeetingOpen(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/employee/recruiting/accounts/${accountId}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAddContactOpen(true)}>
                <Users className="w-4 h-4 mr-2" />
                Add Contact
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAddNoteOpen(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Add Note
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/employee/recruiting/jobs/intake?accountId=${accountId}`)}>
                <Briefcase className="w-4 h-4 mr-2" />
                Take Job Requisition
              </DropdownMenuItem>
              {!account?.onboarding_completed_at && (
                <DropdownMenuItem onClick={() => router.push(`/employee/recruiting/accounts/${accountId}/onboarding`)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Onboarding
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCreateEscalationOpen(true)} className="text-red-600">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Create Escalation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {account.status === 'active' ? (
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: accountId, status: 'inactive' })}
                >
                  Mark as Inactive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: accountId, status: 'active' })}
                >
                  Mark as Active
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Escalations Alert Banner - only shown when on escalations tab with open escalations */}
      {activeSection === 'escalations' && (
        <EscalationsAlertBanner accountId={accountId} />
      )}

      {/* ============================================
          TAB SECTIONS - Each is an isolated component
          Clear trigger pattern: section === 'X' → render X component
          Each component handles its own data fetching
          Detail views are shown via inline panels (Guidewire pattern)
          ============================================ */}

      {activeSection === 'overview' && (
        <AccountOverviewSection
          account={account}
          accountId={accountId}
          onStartOnboarding={() => router.push(`/employee/recruiting/accounts/${accountId}/onboarding`)}
        />
      )}

      {activeSection === 'contacts' && (
        <AccountContactsSection
          accountId={accountId}
          onAddContact={() => setAddContactOpen(true)}
        />
      )}

      {activeSection === 'jobs' && (
        <AccountJobsSection
          accountId={accountId}
          onNewJob={() => router.push(`/employee/recruiting/jobs/intake?accountId=${accountId}`)}
        />
      )}

      {activeSection === 'placements' && (
        <AccountPlacementsSection accountId={accountId} />
      )}

      {activeSection === 'documents' && (
        <AccountDocumentsSection
          accountId={accountId}
          onAddDocument={() => setAddDocumentOpen(true)}
        />
      )}

      {activeSection === 'activities' && (
        <AccountActivitiesSection
          accountId={accountId}
          onLogActivity={() => setLogActivityOpen(true)}
        />
      )}

      {activeSection === 'meetings' && (
        <AccountMeetingsSection
          accountId={accountId}
          onScheduleMeeting={() => setCreateMeetingOpen(true)}
        />
      )}

      {activeSection === 'notes' && (
        <AccountNotesSection
          accountId={accountId}
          onAddNote={() => setAddNoteOpen(true)}
        />
      )}

      {activeSection === 'escalations' && (
        <AccountEscalationsSection
          accountId={accountId}
          onCreateEscalation={() => setCreateEscalationOpen(true)}
        />
      )}

      {/* Create/Add Dialogs - These remain as dialogs for creating new items */}
      <LogActivityDialog
        open={logActivityOpen}
        onOpenChange={setLogActivityOpen}
        accountId={accountId}
      />
      <AddContactDialog
        open={addContactOpen}
        onOpenChange={setAddContactOpen}
        accountId={accountId}
      />
      <CreateMeetingDialog
        open={createMeetingOpen}
        onOpenChange={setCreateMeetingOpen}
        accountId={accountId}
      />
      <CreateEscalationDialog
        open={createEscalationOpen}
        onOpenChange={setCreateEscalationOpen}
        accountId={accountId}
      />
      <AddNoteDialog
        open={addNoteOpen}
        onOpenChange={setAddNoteOpen}
        accountId={accountId}
      />
      <AddDocumentDialog
        open={addDocumentOpen}
        onOpenChange={setAddDocumentOpen}
        accountId={accountId}
      />
    </div>
  )
}

/**
 * Escalations Alert Banner - Shows count of open escalations
 * Only fetches data when rendered (when on escalations tab)
 */
function EscalationsAlertBanner({ accountId }: { accountId: string }) {
  const escalationsQuery = trpc.crm.escalations.listByAccount.useQuery({ accountId })
  const escalations = escalationsQuery.data || []
  const openEscalations = escalations.filter((e: any) => e.status === 'open' || e.status === 'in_progress')

  if (escalationsQuery.isLoading || openEscalations.length === 0) {
    return null
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
      <AlertTriangle className="w-5 h-5 text-red-500" />
      <div className="flex-1">
        <span className="font-medium text-red-800">
          {openEscalations.length} open escalation{openEscalations.length > 1 ? 's' : ''}
        </span>
        <span className="text-red-600 ml-2">
          Highest severity: {openEscalations.sort((a: any, b: any) => {
            const order = { critical: 0, high: 1, medium: 2, low: 3 }
            return (order[a.severity as keyof typeof order] || 4) - (order[b.severity as keyof typeof order] || 4)
          })[0]?.severity}
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="border-red-200 text-red-700 hover:bg-red-100"
        asChild
      >
        <Link href={`/employee/recruiting/accounts/${accountId}?section=escalations`}>
          View Escalations
        </Link>
      </Button>
    </div>
  )
}
