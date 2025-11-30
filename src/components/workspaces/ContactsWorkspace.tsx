/**
 * ContactsWorkspace Component
 *
 * Unified workspace for managing universal contacts
 * Supports: Client POCs, Candidates, Vendors, Partners, Internal contacts
 */

'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Linkedin,
  Building2,
  MapPin,
  Calendar,
  MessageSquare,
  Activity,
  FolderOpen,
  Link as LinkIcon,
  Tag,
  Star,
  AlertTriangle,
  TrendingUp,
  FileText,
  UserCheck,
  Briefcase,
  Send,
  Twitter,
  Github,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';

// Workspace Components
import {
  WorkspaceLayout,
  WorkspaceSidebar,
  ActivityPanel,
  type WorkspaceTab,
  type StatItem,
  type RelatedObject,
  type QuickAction,
} from './base';
import { useWorkspaceContext } from './hooks';

// =====================================================
// TYPES
// =====================================================

interface ContactsWorkspaceProps {
  contactId: string;
}

// =====================================================
// CONSTANTS
// =====================================================

const CONTACT_TYPE_CONFIG = {
  client_poc: { label: 'Client POC', color: 'bg-blue-100 text-blue-700', icon: Building2 },
  candidate: { label: 'Candidate', color: 'bg-green-100 text-green-700', icon: UserCheck },
  vendor: { label: 'Vendor', color: 'bg-purple-100 text-purple-700', icon: Briefcase },
  partner: { label: 'Partner', color: 'bg-amber-100 text-amber-700', icon: Star },
  internal: { label: 'Internal', color: 'bg-cyan-100 text-cyan-700', icon: User },
  general: { label: 'General', color: 'bg-stone-100 text-stone-600', icon: User },
};

const CONTACT_STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactive', color: 'bg-stone-100 text-stone-500' },
  do_not_contact: { label: 'Do Not Contact', color: 'bg-red-100 text-red-700' },
  bounced: { label: 'Bounced', color: 'bg-amber-100 text-amber-700' },
  unsubscribed: { label: 'Unsubscribed', color: 'bg-purple-100 text-purple-700' },
};

const DECISION_AUTHORITY_LABELS = {
  decision_maker: 'Decision Maker',
  influencer: 'Influencer',
  gatekeeper: 'Gatekeeper',
  end_user: 'End User',
  champion: 'Champion',
};

// =====================================================
// SUB-COMPONENTS
// =====================================================

function OverviewTab({ contact, canEdit: _canEdit }: { contact: NonNullable<ReturnType<typeof useContact>['data']>; canEdit: boolean }) {

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={contact.avatarUrl || undefined} />
              <AvatarFallback className="text-lg">
                {`${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">
                {`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed Contact'}
              </h3>
              {contact.title && (
                <p className="text-muted-foreground">{contact.title}</p>
              )}
              {contact.companyName && (
                <p className="text-sm text-muted-foreground">{contact.companyName}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${contact.email}`} className="text-rust hover:underline">
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${contact.phone}`} className="text-rust hover:underline">
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.mobile && contact.mobile !== contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${contact.mobile}`} className="text-rust hover:underline">
                  {contact.mobile} (Mobile)
                </a>
              </div>
            )}
            {contact.linkedinUrl && (
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-muted-foreground" />
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rust hover:underline"
                >
                  LinkedIn Profile
                </a>
              </div>
            )}
            {contact.twitterUrl && (
              <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-muted-foreground" />
                <a
                  href={contact.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rust hover:underline"
                >
                  Twitter/X
                </a>
              </div>
            )}
            {contact.githubUrl && (
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-muted-foreground" />
                <a
                  href={contact.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rust hover:underline"
                >
                  GitHub
                </a>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Contact Type</Label>
              <div className="mt-1">
                <Badge className={cn(CONTACT_TYPE_CONFIG[contact.contactType as keyof typeof CONTACT_TYPE_CONFIG]?.color)}>
                  {CONTACT_TYPE_CONFIG[contact.contactType as keyof typeof CONTACT_TYPE_CONFIG]?.label || contact.contactType}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Preferred Contact Method</Label>
              <p className="font-medium capitalize">{contact.preferredContactMethod || 'Email'}</p>
            </div>
            {contact.timezone && (
              <div>
                <Label className="text-xs text-muted-foreground">Timezone</Label>
                <p className="font-medium">{contact.timezone}</p>
              </div>
            )}
            {contact.workLocation && (
              <div>
                <Label className="text-xs text-muted-foreground">Location</Label>
                <p className="font-medium">{contact.workLocation}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Professional Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Company</Label>
              <p className="font-medium">{contact.companyName || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Department</Label>
              <p className="font-medium">{contact.department || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Title</Label>
              <p className="font-medium">{contact.title || '-'}</p>
            </div>
            {contact.contactType === 'client_poc' && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">Decision Authority</Label>
                  <p className="font-medium">
                    {DECISION_AUTHORITY_LABELS[contact.decisionAuthority as keyof typeof DECISION_AUTHORITY_LABELS] || contact.decisionAuthority || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Buying Role</Label>
                  <p className="font-medium">{contact.buyingRole || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Influence Level</Label>
                  <p className="font-medium capitalize">{contact.influenceLevel || '-'}</p>
                </div>
              </>
            )}
          </div>

          {contact.company && (
            <>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Linked Account</Label>
                <Button variant="link" className="h-auto p-0 text-rust flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {contact.company.name}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Engagement & Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Engagement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Total Interactions</Label>
              <p className="text-2xl font-semibold">{contact.totalInteractions || 0}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Engagement Score</Label>
              <p className="text-2xl font-semibold">{contact.engagementScore || 0}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Contacted</Label>
              <p className="font-medium">
                {contact.lastContactedAt
                  ? formatDistanceToNow(new Date(contact.lastContactedAt), { addSuffix: true })
                  : 'Never'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Response</Label>
              <p className="font-medium">
                {contact.lastResponseAt
                  ? formatDistanceToNow(new Date(contact.lastResponseAt), { addSuffix: true })
                  : 'No response'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source & Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Source & Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Source</Label>
              <p className="font-medium">{contact.source || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Source Detail</Label>
              <p className="font-medium">{contact.sourceDetail || '-'}</p>
            </div>
          </div>

          {contact.tags && contact.tags.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Tags</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {contact.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {contact.notes && (
            <div>
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InteractionsTab({ contact: _contact, canEdit: _canEdit }: { contact: NonNullable<ReturnType<typeof useContact>['data']>; canEdit: boolean }) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>Interaction history will appear here</p>
      <p className="text-sm">Log calls, emails, meetings, and notes</p>
    </div>
  );
}

function LinkedEntitiesTab({ contact: _contact, canEdit: _canEdit }: { contact: NonNullable<ReturnType<typeof useContact>['data']>; canEdit: boolean }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Linked Entities</CardTitle>
          <CardDescription>
            View all records associated with this contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No linked entities found</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to fetch contact data
function useContact(contactId: string) {
  return trpc.contacts.getById.useQuery({ id: contactId });
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function ContactsWorkspace({ contactId }: ContactsWorkspaceProps) {
  const router = useRouter();
  const { canEdit, canDelete, isLoading: contextLoading } = useWorkspaceContext('contact', contactId);

  // Fetch contact data
  const { data: contact, isLoading: contactLoading, error } = useContact(contactId);

  // Build tabs
  const tabs = useMemo((): WorkspaceTab[] => {
    if (!contact) return [];

    return [
      {
        id: 'overview',
        label: 'Overview',
        icon: <FileText className="w-4 h-4" />,
        content: <OverviewTab contact={contact} canEdit={canEdit} />,
      },
      {
        id: 'interactions',
        label: 'Interactions',
        icon: <MessageSquare className="w-4 h-4" />,
        content: <InteractionsTab contact={contact} canEdit={canEdit} />,
        badge: contact.totalInteractions || 0,
      },
      {
        id: 'linked-entities',
        label: 'Linked Entities',
        icon: <LinkIcon className="w-4 h-4" />,
        content: <LinkedEntitiesTab contact={contact} canEdit={canEdit} />,
      },
      {
        id: 'activity',
        label: 'Activity',
        icon: <Activity className="w-4 h-4" />,
        content: <div className="text-muted-foreground">Activity timeline</div>,
      },
      {
        id: 'documents',
        label: 'Documents',
        icon: <FolderOpen className="w-4 h-4" />,
        content: <div className="text-muted-foreground">Documents will appear here</div>,
      },
    ];
  }, [contact, canEdit]);

  // Sidebar stats
  const sidebarStats = useMemo((): StatItem[] => {
    if (!contact) return [];

    return [
      {
        label: 'Interactions',
        value: contact.totalInteractions || 0,
        icon: <MessageSquare className="w-3 h-3" />,
      },
      {
        label: 'Engagement',
        value: contact.engagementScore || 0,
        icon: <TrendingUp className="w-3 h-3" />,
      },
      {
        label: 'Days Known',
        value: Math.floor((Date.now() - new Date(contact.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        icon: <Calendar className="w-3 h-3" />,
      },
    ];
  }, [contact]);

  // Quick actions
  const quickActions = useMemo((): QuickAction[] => {
    return [
      {
        label: 'Log Call',
        icon: <Phone className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Send Email',
        icon: <Mail className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Schedule Meeting',
        icon: <Calendar className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Add Note',
        icon: <MessageSquare className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
    ];
  }, []);

  // Related objects
  const relatedObjects = useMemo((): RelatedObject[] => {
    const objects: RelatedObject[] = [];

    if (contact?.company) {
      objects.push({
        id: contact.company.id,
        type: 'Account',
        title: contact.company.name,
        status: contact.company.status || undefined,
        href: `/employee/workspace/accounts/${contact.company.id}`,
        icon: <Building2 className="w-4 h-4" />,
      });
    }

    return objects;
  }, [contact]);

  // Loading state
  if (contactLoading || contextLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rust" />
      </div>
    );
  }

  // Error state
  if (error || !contact) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium">Contact not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const statusConfig = CONTACT_STATUS_CONFIG[contact.status as keyof typeof CONTACT_STATUS_CONFIG] ||
    CONTACT_STATUS_CONFIG.active;

  const displayName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed Contact';

  return (
    <WorkspaceLayout
      title={displayName}
      subtitle={contact.title ? `${contact.title}${contact.companyName ? ` at ${contact.companyName}` : ''}` : contact.companyName || undefined}
      backHref="/employee/workspace/contacts"
      backLabel="Contacts"
      status={{
        label: statusConfig.label,
        color: statusConfig.color,
      }}
      entityType="contact"
      entityId={contactId}
      canEdit={canEdit}
      canDelete={canDelete}
      primaryAction={{
        label: 'Log Activity',
        icon: <MessageSquare className="w-4 h-4 mr-1" />,
        onClick: () => {},
      }}
      secondaryActions={[
        {
          label: 'Send Email',
          icon: <Send className="w-4 h-4 mr-1" />,
          onClick: () => {
            if (contact.email) {
              window.location.href = `mailto:${contact.email}`;
            }
          },
          variant: 'outline',
          disabled: !contact.email,
        },
      ]}
      tabs={tabs}
      defaultTab="overview"
      sidebar={
        <WorkspaceSidebar
          stats={sidebarStats}
          quickActions={quickActions}
          relatedObjects={relatedObjects}
          customSections={[
            {
              title: 'Contact Info',
              content: (
                <div className="space-y-2 text-sm">
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.workLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span>{contact.workLocation}</span>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      }
      showActivityPanel
      activityPanel={<ActivityPanel entityType="contact" entityId={contactId} canEdit={canEdit} />}
      onDelete={() => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
          // Handle delete
        }
      }}
    />
  );
}

export default ContactsWorkspace;
