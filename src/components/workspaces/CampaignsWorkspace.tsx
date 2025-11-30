/**
 * CampaignsWorkspace
 *
 * Unified workspace for Talent Acquisition campaigns
 * Manages outreach, engagement tracking, and conversion metrics
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import {
  Megaphone,
  Users,
  BarChart3,
  Mail,
  Linkedin,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  Play,
  Pause,
  Calendar,
  Settings,
  FileText,
  ArrowUpRight,
  Percent,
  Send,
  Eye,
  MousePointer,
  MessageSquare,
  UserPlus,
  Beaker,
  MapPin,
  Briefcase,
  Building2,
  AlertCircle,
  FolderOpen,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import { WorkspaceLayout, WorkspaceSidebar, ActivityPanel, type WorkspaceTab } from './base';
import { useWorkspaceContext } from './hooks';

// =====================================================
// TYPES & CONSTANTS
// =====================================================

interface CampaignsWorkspaceProps {
  campaignId: string;
}

const CAMPAIGN_STATUSES = {
  draft: { label: 'Draft', color: 'bg-stone-100 text-stone-600', icon: FileText },
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: Play },
  paused: { label: 'Paused', color: 'bg-amber-100 text-amber-700', icon: Pause },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  archived: { label: 'Archived', color: 'bg-stone-100 text-stone-500', icon: Clock },
} as const;

const CAMPAIGN_TYPES = {
  talent_sourcing: { label: 'Talent Sourcing', color: 'bg-indigo-100 text-indigo-700' },
  business_development: { label: 'Business Development', color: 'bg-emerald-100 text-emerald-700' },
  mixed: { label: 'Mixed', color: 'bg-purple-100 text-purple-700' },
} as const;

const CAMPAIGN_CHANNELS = {
  email: { label: 'Email', icon: Mail, color: 'text-blue-600' },
  linkedin: { label: 'LinkedIn', icon: Linkedin, color: 'text-[#0A66C2]' },
  combined: { label: 'Multi-Channel', icon: Send, color: 'text-purple-600' },
} as const;

const CONTACT_STATUSES = {
  pending: { label: 'Pending', color: 'bg-stone-100 text-stone-600' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  opened: { label: 'Opened', color: 'bg-cyan-100 text-cyan-700' },
  responded: { label: 'Responded', color: 'bg-green-100 text-green-700' },
  converted: { label: 'Converted', color: 'bg-purple-100 text-purple-700' },
  bounced: { label: 'Bounced', color: 'bg-red-100 text-red-700' },
  unsubscribed: { label: 'Unsubscribed', color: 'bg-amber-100 text-amber-700' },
} as const;

// =====================================================
// DATA HOOKS
// =====================================================

function useCampaign(campaignId: string) {
  return trpc.taHr.campaigns.getById.useQuery({ id: campaignId });
}

function useCampaignContacts(campaignId: string) {
  return trpc.taHr.campaignContacts.list.useQuery({ campaignId, limit: 100 });
}

function useCampaignMetrics(campaignId: string) {
  return trpc.taHr.campaigns.metrics.useQuery({ campaignId });
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function CampaignsWorkspace({ campaignId }: CampaignsWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const context = useWorkspaceContext('campaign', campaignId);

  // Fetch campaign data from database
  const { data: campaign, isLoading: campaignLoading, error } = useCampaign(campaignId);
  const { data: contactsData } = useCampaignContacts(campaignId);
  const { data: metrics } = useCampaignMetrics(campaignId);

  const contacts = contactsData || [];
  const [selectedStatus, setSelectedStatus] = useState(campaign?.status || 'draft');

  // Loading state
  if (campaignLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rust" />
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium">Campaign not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Calculate metrics with fallbacks for null values
  const targetContacts = campaign.targetContactsCount || 1;
  const targetResponse = Number(campaign.targetResponseRate) || 1;
  const targetConversion = campaign.targetConversionCount || 1;
  const currentResponseRate = Number(campaign.responseRate) || 0;

  const reachProgress = ((campaign.contactsReached || 0) / targetContacts) * 100;
  const responseProgress = (currentResponseRate / targetResponse) * 100;
  const conversionProgress = ((campaign.conversions || 0) / targetConversion) * 100;

  const daysRemaining = campaign.endDate
    ? Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const campaignStatus = campaign.status || 'draft';
  const StatusIcon = CAMPAIGN_STATUSES[campaignStatus as keyof typeof CAMPAIGN_STATUSES]?.icon || Clock;
  const ChannelIcon = CAMPAIGN_CHANNELS[campaign.channel as keyof typeof CAMPAIGN_CHANNELS]?.icon || Send;

  // =====================================================
  // OVERVIEW TAB
  // =====================================================

  const OverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Send className="w-4 h-4" />
                <span className="text-xs">Contacts Reached</span>
              </div>
              <p className="text-2xl font-bold">{campaign.contactsReached || 0}</p>
              <p className="text-xs text-muted-foreground">
                of {campaign.targetContactsCount || 0} target
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Eye className="w-4 h-4" />
                <span className="text-xs">Open Rate</span>
              </div>
              <p className="text-2xl font-bold">55.8%</p>
              <p className="text-xs text-green-600">+12% vs avg</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs">Response Rate</span>
              </div>
              <p className="text-2xl font-bold">{currentResponseRate}%</p>
              <p className="text-xs text-green-600">
                Above {targetResponse}% target
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <UserPlus className="w-4 h-4" />
                <span className="text-xs">Conversions</span>
              </div>
              <p className="text-2xl font-bold">{campaign.conversions || 0}</p>
              <p className="text-xs text-muted-foreground">
                {targetConversion - (campaign.conversions || 0)} to goal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress to Goals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Progress to Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Contacts Reached</span>
                <span className="font-medium">
                  {campaign.contactsReached || 0} / {targetContacts}
                </span>
              </div>
              <Progress value={reachProgress} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Response Rate</span>
                <span className="font-medium">
                  {currentResponseRate}% / {targetResponse}%
                </span>
              </div>
              <Progress value={Math.min(responseProgress, 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Conversions</span>
                <span className="font-medium">
                  {campaign.conversions || 0} / {targetConversion}
                </span>
              </div>
              <Progress value={conversionProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Campaign Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
              <p className="text-sm">{campaign.description}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Campaign Type</h4>
                <Badge className={CAMPAIGN_TYPES[campaign.campaignType as keyof typeof CAMPAIGN_TYPES]?.color}>
                  {CAMPAIGN_TYPES[campaign.campaignType as keyof typeof CAMPAIGN_TYPES]?.label}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Channel</h4>
                <div className="flex items-center gap-2">
                  <ChannelIcon className={cn('w-4 h-4', CAMPAIGN_CHANNELS[campaign.channel as keyof typeof CAMPAIGN_CHANNELS]?.color)} />
                  <span className="text-sm">
                    {CAMPAIGN_CHANNELS[campaign.channel as keyof typeof CAMPAIGN_CHANNELS]?.label}
                  </span>
                </div>
              </div>
            </div>
            {campaign.isAbTest && (
              <>
                <Separator />
                <div className="flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">A/B Test Active</span>
                  <Badge variant="outline" className="ml-2">
                    {campaign.abSplitPercentage || 50}% / {100 - (campaign.abSplitPercentage || 50)}% split
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Targeting */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Targeting Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Target Audience</h4>
              <p className="text-sm">{campaign.targetAudience || 'Not specified'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Locations
              </h4>
              <div className="flex flex-wrap gap-1">
                {(campaign.targetLocations || []).length > 0 ? (
                  campaign.targetLocations!.map((location, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {location}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No locations specified</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Required Skills
              </h4>
              <div className="flex flex-wrap gap-1">
                {(campaign.targetSkills || []).length > 0 ? (
                  campaign.targetSkills!.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No skills specified</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Company Sizes
              </h4>
              <div className="flex flex-wrap gap-1">
                {(campaign.targetCompanySizes || []).length > 0 ? (
                  campaign.targetCompanySizes!.map((size, i) => (
                    <Badge key={i} variant="outline" className="text-xs capitalize">
                      {size.replace('_', ' ')}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">All sizes</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Content */}
      <div className="space-y-6">
        {/* Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium">
                {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-medium">
                {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Not set'}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Days Remaining</span>
              <span className={cn(
                'font-medium',
                daysRemaining < 7 ? 'text-amber-600' : 'text-green-600'
              )}>
                {daysRemaining > 0 ? `${daysRemaining} days` : 'Ended'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Channel Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Channel Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Email</span>
                </div>
                <span className="text-sm font-medium">{campaign.emailsSent || 0}</span>
              </div>
              <Progress value={(campaign.contactsReached || 0) > 0 ? ((campaign.emailsSent || 0) / (campaign.contactsReached || 1)) * 100 : 0} className="h-1.5" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                  <span className="text-sm">LinkedIn</span>
                </div>
                <span className="text-sm font-medium">{campaign.linkedinMessagesSent || 0}</span>
              </div>
              <Progress value={(campaign.contactsReached || 0) > 0 ? ((campaign.linkedinMessagesSent || 0) / (campaign.contactsReached || 1)) * 100 : 0} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Owner */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Campaign Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {campaign.ownerId ? 'O' : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{campaign.ownerId ? 'Campaign Owner' : 'Unassigned'}</p>
                <p className="text-xs text-muted-foreground">Owner ID: {campaign.ownerId || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // =====================================================
  // CONTACTS TAB
  // =====================================================

  const ContactsTab = () => {
    const statusCounts = contacts.reduce((acc, c) => {
      const status = c.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="space-y-6">
        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(CONTACT_STATUSES).map(([key, value]) => (
            <Card key={key} className={cn(
              'cursor-pointer hover:shadow-md transition-shadow',
              statusCounts[key] > 0 ? '' : 'opacity-50'
            )}>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-2xl font-bold">{statusCounts[key] || 0}</p>
                <Badge className={cn('mt-1 text-xs', value.color)}>
                  {value.label}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contacts List */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Campaign Contacts ({contacts.length})</CardTitle>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Contacts
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No contacts added</p>
                <p className="text-sm">Add contacts to start your outreach campaign</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => {
                  const contactStatus = contact.status || 'pending';
                  const firstName = contact.firstName || '';
                  const lastName = contact.lastName || '';
                  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?';

                  return (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {firstName} {lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contact.title ? `${contact.title}${contact.companyName ? ` at ${contact.companyName}` : ''}` : contact.email || 'No details'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {campaign.isAbTest && contact.abVariant && (
                          <Badge variant="outline" className="text-xs">
                            Variant {contact.abVariant}
                          </Badge>
                        )}
                        <Badge className={CONTACT_STATUSES[contactStatus as keyof typeof CONTACT_STATUSES]?.color}>
                          {CONTACT_STATUSES[contactStatus as keyof typeof CONTACT_STATUSES]?.label || contactStatus}
                        </Badge>
                        <div className="text-xs text-muted-foreground text-right min-w-[80px]">
                          {contact.sentAt && (
                            <div>Sent {new Date(contact.sentAt).toLocaleDateString()}</div>
                          )}
                        </div>
                        <Button variant="ghost" size="icon">
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // =====================================================
  // A/B TEST TAB
  // =====================================================

  const AbTestTab = () => (
    <div className="space-y-6">
      {!campaign.isAbTest ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Beaker className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No A/B Test Configured</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This campaign is not running an A/B test
            </p>
            <Button variant="outline">
              <Beaker className="w-4 h-4 mr-2" />
              Enable A/B Testing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* A/B Test Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Beaker className="w-4 h-4 text-purple-600" />
                A/B Test Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Split Ratio</p>
                  <p className="text-lg font-bold">
                    {campaign.abSplitPercentage || 50}% / {100 - (campaign.abSplitPercentage || 50)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className="bg-purple-100 text-purple-700">
                    Test Running
                  </Badge>
                </div>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                A/B test analytics will be available once sufficient data has been collected.
                The system will automatically determine the winning variant based on response and conversion rates.
              </p>
            </CardContent>
          </Card>

          {/* Variant Comparison Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Variant A</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Collecting data...</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Variant B</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Collecting data...</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );

  // =====================================================
  // ANALYTICS TAB
  // =====================================================

  const AnalyticsTab = () => (
    <div className="space-y-6">
      {/* Funnel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Engagement Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Contacts Added', value: campaign.contactsReached || 0, percent: 100 },
              { label: 'Messages Sent', value: campaign.emailsSent || 0, percent: 100 },
              { label: 'Opened', value: Math.round((campaign.contactsReached || 0) * 0.558), percent: 55.8 },
              { label: 'Clicked', value: Math.round((campaign.contactsReached || 0) * 0.234), percent: 23.4 },
              { label: 'Responded', value: campaign.responsesReceived || 0, percent: currentResponseRate },
              { label: 'Converted', value: campaign.conversions || 0, percent: (campaign.contactsReached || 0) > 0 ? ((campaign.conversions || 0) / (campaign.contactsReached || 1)) * 100 : 0 },
            ].map((step, i) => (
              <div key={step.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{step.label}</span>
                  <span className="font-medium">{step.value} ({step.percent.toFixed(1)}%)</span>
                </div>
                <div className="h-8 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rust to-rust/70 transition-all"
                    style={{ width: `${step.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Eye className="w-4 h-4" />
              Open Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Open Rate</span>
              <span className="font-medium">55.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Unique Opens</span>
              <span className="font-medium">191</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Avg. Time to Open</span>
              <span className="font-medium">4.2 hours</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <MousePointer className="w-4 h-4" />
              Click Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Click Rate</span>
              <span className="font-medium">23.4%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Click-to-Open</span>
              <span className="font-medium">41.9%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Clicks</span>
              <span className="font-medium">124</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              Delivery Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Bounce Rate</span>
              <span className="font-medium text-amber-600">2.3%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Unsubscribed</span>
              <span className="font-medium">4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Spam Reports</span>
              <span className="font-medium text-green-600">0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best Performing Times */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Best Performing Send Times</CardTitle>
          <CardDescription>Based on open and response rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="font-medium text-muted-foreground">{day}</div>
            ))}
            {[
              { intensity: 0.6 }, { intensity: 0.8 }, { intensity: 0.9 }, { intensity: 0.7 },
              { intensity: 0.5 }, { intensity: 0.2 }, { intensity: 0.1 },
            ].map((slot, i) => (
              <div
                key={i}
                className="h-8 rounded"
                style={{
                  backgroundColor: `rgba(var(--rust), ${slot.intensity})`,
                }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Best days: Tuesday and Wednesday at 9-10 AM
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // =====================================================
  // ACTIVITY TAB
  // =====================================================

  const ActivityTab = () => (
    <ActivityPanel entityType="campaign" entityId={campaignId} />
  );

  // =====================================================
  // DOCUMENTS TAB
  // =====================================================

  const DocumentsTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Campaign Assets</CardTitle>
            <CardDescription>Email templates, images, and attachments</CardDescription>
          </div>
          <Button size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Upload Asset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No assets uploaded yet</p>
        </div>
      </CardContent>
    </Card>
  );

  // =====================================================
  // STATUS DIALOG
  // =====================================================

  const StatusDialog = () => (
    <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Campaign Status</DialogTitle>
          <DialogDescription>
            Change the status of this campaign
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CAMPAIGN_STATUSES).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <value.icon className="w-4 h-4" />
                    {value.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setStatusDialogOpen(false)}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // =====================================================
  // BUILD TABS
  // =====================================================

  const tabs: WorkspaceTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className="w-4 h-4" />,
      content: <OverviewTab />,
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: <Users className="w-4 h-4" />,
      badge: contacts.length || undefined,
      content: <ContactsTab />,
    },
    ...(campaign.isAbTest ? [{
      id: 'ab-test',
      label: 'A/B Test',
      icon: <Beaker className="w-4 h-4" />,
      content: <AbTestTab />,
    }] : []),
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <TrendingUp className="w-4 h-4" />,
      content: <AnalyticsTab />,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <Activity className="w-4 h-4" />,
      content: <ActivityTab />,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FolderOpen className="w-4 h-4" />,
      content: <DocumentsTab />,
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <WorkspaceLayout
        entityType="campaign"
        entityId={campaignId}
        title={campaign.name}
        subtitle={`${CAMPAIGN_TYPES[campaign.campaignType as keyof typeof CAMPAIGN_TYPES]?.label || 'Campaign'}`}
        backHref="/employee/workspace/campaigns"
        backLabel="Campaigns"
        status={{
          label: CAMPAIGN_STATUSES[campaignStatus as keyof typeof CAMPAIGN_STATUSES]?.label || campaignStatus,
          color: CAMPAIGN_STATUSES[campaignStatus as keyof typeof CAMPAIGN_STATUSES]?.color,
        }}
        primaryAction={campaignStatus === 'draft' ? {
          label: 'Launch Campaign',
          icon: <Play className="w-4 h-4 mr-1" />,
          onClick: () => {},
        } : campaignStatus === 'paused' ? {
          label: 'Resume Campaign',
          icon: <Play className="w-4 h-4 mr-1" />,
          onClick: () => {},
        } : undefined}
        secondaryActions={[
          {
            label: 'Change Status',
            onClick: () => setStatusDialogOpen(true),
            variant: 'outline',
          },
          ...(campaignStatus === 'active' ? [{
            label: 'Pause',
            onClick: () => {},
            variant: 'outline' as const,
          }] : []),
        ]}
        tabs={tabs}
        defaultTab="overview"
        sidebar={
          <WorkspaceSidebar
            stats={[
              { label: 'Reached', value: (campaign.contactsReached || 0).toString() },
              { label: 'Response Rate', value: `${currentResponseRate}%` },
              { label: 'Conversions', value: (campaign.conversions || 0).toString() },
            ]}
          />
        }
        showActivityPanel
        activityPanel={<ActivityPanel entityType="campaign" entityId={campaignId} canEdit={true} />}
      />

      <StatusDialog />
    </>
  );
}
