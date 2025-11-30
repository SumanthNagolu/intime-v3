/**
 * AccountsWorkspace Component
 *
 * Unified workspace for managing client accounts with full CRM fields
 * Context-aware tabs based on user role (Recruiting, TA, Bench Sales)
 */

'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Linkedin,
  MapPin,
  DollarSign,
  Target,
  Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Briefcase,
  FileText,
  Activity,
  FolderOpen,
  Lightbulb,
  Clock,
  Star,
  Award,
  BarChart3,
  PieChart,
  UserPlus,
  Handshake,
  FileCheck,
  Receipt,
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface AccountsWorkspaceProps {
  accountId: string;
}

// =====================================================
// CONSTANTS
// =====================================================

const ACCOUNT_STATUSES = {
  prospect: { label: 'Prospect', color: 'bg-blue-100 text-blue-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactive', color: 'bg-stone-100 text-stone-500' },
  churned: { label: 'Churned', color: 'bg-red-100 text-red-700' },
  on_hold: { label: 'On Hold', color: 'bg-amber-100 text-amber-700' },
};

const COMPANY_TYPES = {
  direct_client: { label: 'Direct Client', description: 'End client with direct relationship' },
  implementation_partner: { label: 'Implementation Partner', description: 'SI or consulting partner' },
  msp_vms: { label: 'MSP/VMS', description: 'Managed Service Provider' },
  system_integrator: { label: 'System Integrator', description: 'Large SI (Accenture, Deloitte, etc.)' },
  staffing_competitor: { label: 'Staffing Competitor', description: 'Other staffing agencies' },
  vendor: { label: 'Vendor', description: 'Service or product vendor' },
};

const ACCOUNT_TIERS = {
  strategic: { label: 'Strategic', color: 'bg-purple-100 text-purple-700', description: 'Top priority accounts' },
  enterprise: { label: 'Enterprise', color: 'bg-blue-100 text-blue-700', description: 'Large enterprise clients' },
  mid_market: { label: 'Mid-Market', color: 'bg-cyan-100 text-cyan-700', description: 'Growing mid-size companies' },
  smb: { label: 'SMB', color: 'bg-green-100 text-green-700', description: 'Small and medium businesses' },
};

const RESPONSIVENESS_LEVELS = {
  highly_responsive: { label: 'Highly Responsive', color: 'text-green-600' },
  responsive: { label: 'Responsive', color: 'text-blue-600' },
  average: { label: 'Average', color: 'text-amber-600' },
  slow: { label: 'Slow', color: 'text-orange-600' },
  unresponsive: { label: 'Unresponsive', color: 'text-red-600' },
};

// =====================================================
// SUB-COMPONENTS
// =====================================================

function OverviewTab({ account, canEdit }: { account: NonNullable<ReturnType<typeof useAccount>['data']>; canEdit: boolean }) {
  const hasContract = account.contractStartDate || account.contractEndDate;
  const contractDaysRemaining = account.contractEndDate
    ? differenceInDays(new Date(account.contractEndDate), new Date())
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Company Name</Label>
              <p className="font-medium">{account.name}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Industry</Label>
              <p className="font-medium">{account.industry || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Company Type</Label>
              <p className="font-medium">
                {COMPANY_TYPES[account.companyType as keyof typeof COMPANY_TYPES]?.label || account.companyType || '-'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Tier</Label>
              {account.tier ? (
                <Badge className={cn('mt-1', ACCOUNT_TIERS[account.tier as keyof typeof ACCOUNT_TIERS]?.color)}>
                  {ACCOUNT_TIERS[account.tier as keyof typeof ACCOUNT_TIERS]?.label || account.tier}
                </Badge>
              ) : (
                <p className="font-medium">-</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            {account.headquartersLocation && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{account.headquartersLocation}</span>
              </div>
            )}
            {account.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a
                  href={account.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rust hover:underline"
                >
                  {account.website}
                </a>
              </div>
            )}
            {account.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${account.phone}`} className="text-rust hover:underline">
                  {account.phone}
                </a>
              </div>
            )}
          </div>

          {account.description && (
            <>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {account.description}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Account Manager</Label>
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={account.accountManager?.avatarUrl || undefined} />
                <AvatarFallback className="text-xs">
                  {((account.accountManager?.firstName?.[0] || '') + (account.accountManager?.lastName?.[0] || '')).toUpperCase() || 'AM'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {account.accountManager
                    ? `${account.accountManager.firstName || ''} ${account.accountManager.lastName || ''}`.trim()
                    : 'Unassigned'}
                </p>
                {account.accountManager?.email && (
                  <p className="text-xs text-muted-foreground">{account.accountManager.email}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Responsiveness</Label>
              <p className={cn(
                'font-medium',
                RESPONSIVENESS_LEVELS[account.responsiveness as keyof typeof RESPONSIVENESS_LEVELS]?.color
              )}>
                {RESPONSIVENESS_LEVELS[account.responsiveness as keyof typeof RESPONSIVENESS_LEVELS]?.label || account.responsiveness || '-'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Preferred Quality</Label>
              <p className="font-medium capitalize">{account.preferredQuality || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Account Created</Label>
              <p className="font-medium">
                {format(new Date(account.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Updated</Label>
              <p className="font-medium">
                {formatDistanceToNow(new Date(account.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract & Business Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Contract & Business Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasContract ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Contract Start</Label>
                  <p className="font-medium">
                    {account.contractStartDate
                      ? format(new Date(account.contractStartDate), 'MMM d, yyyy')
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Contract End</Label>
                  <p className="font-medium">
                    {account.contractEndDate
                      ? format(new Date(account.contractEndDate), 'MMM d, yyyy')
                      : '-'}
                  </p>
                </div>
              </div>

              {contractDaysRemaining !== null && (
                <div className={cn(
                  'p-3 rounded-lg',
                  contractDaysRemaining > 90 && 'bg-green-50 text-green-700',
                  contractDaysRemaining <= 90 && contractDaysRemaining > 30 && 'bg-amber-50 text-amber-700',
                  contractDaysRemaining <= 30 && 'bg-red-50 text-red-700'
                )}>
                  {contractDaysRemaining > 0 ? (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {contractDaysRemaining} days until contract renewal
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Contract expired {Math.abs(contractDaysRemaining)} days ago
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Separator />
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No contract on file</p>
              {canEdit && (
                <Button variant="outline" size="sm" className="mt-2">
                  Add Contract Details
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Payment Terms</Label>
              <p className="font-medium">
                {account.paymentTermsDays ? `Net ${account.paymentTermsDays}` : '-'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Markup %</Label>
              <p className="font-medium">
                {account.markupPercentage ? `${Number(account.markupPercentage)}%` : '-'}
              </p>
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Annual Revenue Target</Label>
              <p className="font-medium text-lg text-green-600">
                {account.annualRevenueTarget
                  ? `$${Number(account.annualRevenueTarget).toLocaleString()}`
                  : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Info */}
      <Card className={cn(
        account.status === 'churned' && 'border-red-200 bg-red-50/50',
        account.status === 'on_hold' && 'border-amber-200 bg-amber-50/50'
      )}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs text-muted-foreground">Current Status</Label>
              <Badge className={cn('mt-1', ACCOUNT_STATUSES[account.status as keyof typeof ACCOUNT_STATUSES]?.color)}>
                {ACCOUNT_STATUSES[account.status as keyof typeof ACCOUNT_STATUSES]?.label || account.status}
              </Badge>
            </div>
            {canEdit && (
              <Button variant="outline" size="sm">
                Change Status
              </Button>
            )}
          </div>

          {account.status === 'churned' && (
            <div className="flex items-center gap-2 p-2 bg-red-100 rounded-lg text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">This account has churned and is no longer active</span>
            </div>
          )}

          {account.status === 'on_hold' && (
            <div className="flex items-center gap-2 p-2 bg-amber-100 rounded-lg text-amber-700">
              <Clock className="w-4 h-4" />
              <span className="text-sm">This account is temporarily on hold</span>
            </div>
          )}

          {account.status === 'prospect' && (
            <div className="flex items-center gap-2 p-2 bg-blue-100 rounded-lg text-blue-700">
              <Target className="w-4 h-4" />
              <span className="text-sm">This account is still in prospect stage</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ContactsTab({ account, canEdit }: { account: NonNullable<ReturnType<typeof useAccount>['data']>; canEdit: boolean }) {
  const contacts = account.pointOfContacts || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Points of Contact
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            )}
          </div>
          <CardDescription>
            Key contacts at this account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No contacts added yet</p>
              <p className="text-sm">Add contacts to track relationships at this account</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {((contact.firstName?.[0] || '') + (contact.lastName?.[0] || '')).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {contact.isPrimary && (
                          <Badge variant="default" className="text-xs">Primary</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.title || '-'}</p>

                      <div className="flex items-center gap-3 mt-2 text-sm">
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-rust hover:underline">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-rust hover:underline">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </a>
                        )}
                        {contact.linkedinUrl && (
                          <a
                            href={contact.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-rust hover:underline"
                          >
                            <Linkedin className="w-3 h-3" />
                            LinkedIn
                          </a>
                        )}
                      </div>

                      {contact.decisionAuthority && (
                        <Badge variant="outline" className="mt-2 text-xs capitalize">
                          {contact.decisionAuthority.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DealsTab({ account, canEdit }: { account: NonNullable<ReturnType<typeof useAccount>['data']>; canEdit: boolean }) {
  const deals = account.deals || [];
  const openDeals = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost');
  const wonDeals = deals.filter(d => d.stage === 'closed_won');
  const lostDeals = deals.filter(d => d.stage === 'closed_lost');

  const totalPipelineValue = openDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const totalWonValue = wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const winRate = deals.length > 0
    ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100) || 0
    : 0;

  return (
    <div className="space-y-6">
      {/* Deal Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Briefcase className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{openDeals.length}</p>
              <p className="text-xs text-muted-foreground">Open Deals</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold">${totalPipelineValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Pipeline Value</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">${totalWonValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Won Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{winRate}%</p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deals List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Handshake className="w-4 h-4" />
              Deals
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                <Briefcase className="w-4 h-4 mr-2" />
                Create Deal
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {deals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No deals yet</p>
              <p className="text-sm">Create a deal to track opportunities with this account</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      deal.stage === 'closed_won' && 'bg-green-100',
                      deal.stage === 'closed_lost' && 'bg-red-100',
                      deal.stage !== 'closed_won' && deal.stage !== 'closed_lost' && 'bg-blue-100'
                    )}>
                      <Briefcase className={cn(
                        'w-5 h-5',
                        deal.stage === 'closed_won' && 'text-green-600',
                        deal.stage === 'closed_lost' && 'text-red-600',
                        deal.stage !== 'closed_won' && deal.stage !== 'closed_lost' && 'text-blue-600'
                      )} />
                    </div>
                    <div>
                      <p className="font-medium">{deal.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>${Number(deal.value || 0).toLocaleString()}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {deal.stage.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function JobsTab({ account, canEdit }: { account: NonNullable<ReturnType<typeof useAccount>['data']>; canEdit: boolean }) {
  // In a real implementation, this would fetch jobs linked to the account
  const jobs: Array<{ id: string; title: string; status: string; location?: string }> = [];
  void account;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Job Requisitions
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                <Briefcase className="w-4 h-4 mr-2" />
                Create Job
              </Button>
            )}
          </div>
          <CardDescription>
            Active and historical job requisitions for this account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No jobs yet</p>
              <p className="text-sm">Job requisitions from this account will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">{job.location ?? 'Remote'}</p>
                  </div>
                  <Badge>{job.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RevenueTab({ account }: { account: NonNullable<ReturnType<typeof useAccount>['data']> }) {
  const deals = account.deals || [];
  const wonDeals = deals.filter(d => d.stage === 'closed_won');
  const totalWonValue = wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const annualTarget = Number(account.annualRevenueTarget || 0);
  const progress = annualTarget > 0 ? Math.round((totalWonValue / annualTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Revenue vs Target */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Revenue vs Target
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Annual Target</p>
              <p className="text-2xl font-bold">
                ${annualTarget.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Won Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalWonValue.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-3" />
          </div>

          <div className="text-sm text-muted-foreground">
            {progress >= 100 ? (
              <div className="flex items-center gap-2 text-green-600">
                <Award className="w-4 h-4" />
                Target achieved! ${(totalWonValue - annualTarget).toLocaleString()} over target
              </div>
            ) : (
              <div>
                ${(annualTarget - totalWonValue).toLocaleString()} remaining to hit target
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Quarter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Revenue by Quarter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
              <div key={quarter} className="space-y-1">
                <p className="text-xs text-muted-foreground">{quarter}</p>
                <p className="text-lg font-bold">$0</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoicing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Invoicing Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">$0</p>
              <p className="text-xs text-muted-foreground">Paid</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">$0</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">$0</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to fetch account data
function useAccount(accountId: string) {
  return trpc.crm.accounts.getById.useQuery({ id: accountId });
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function AccountsWorkspace({ accountId }: AccountsWorkspaceProps) {
  const router = useRouter();
  const { canEdit, canDelete, isLoading: contextLoading } = useWorkspaceContext('account', accountId);

  // Fetch account data
  const { data: account, isLoading: accountLoading, error } = useAccount(accountId);

  // Dialogs
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Build tabs
  const tabs = useMemo((): WorkspaceTab[] => {
    if (!account) return [];

    const contactCount = account.pointOfContacts?.length || 0;
    const dealCount = account.deals?.length || 0;

    const baseTabs: WorkspaceTab[] = [
      {
        id: 'overview',
        label: 'Overview',
        icon: <FileText className="w-4 h-4" />,
        content: <OverviewTab account={account} canEdit={canEdit} />,
      },
      {
        id: 'contacts',
        label: 'Contacts',
        icon: <Users className="w-4 h-4" />,
        badge: contactCount || undefined,
        content: <ContactsTab account={account} canEdit={canEdit} />,
      },
      {
        id: 'deals',
        label: 'Deals',
        icon: <Handshake className="w-4 h-4" />,
        badge: dealCount || undefined,
        content: <DealsTab account={account} canEdit={canEdit} />,
      },
      {
        id: 'jobs',
        label: 'Jobs',
        icon: <Briefcase className="w-4 h-4" />,
        content: <JobsTab account={account} canEdit={canEdit} />,
      },
      {
        id: 'revenue',
        label: 'Revenue',
        icon: <DollarSign className="w-4 h-4" />,
        content: <RevenueTab account={account} />,
      },
      {
        id: 'strategy',
        label: 'Strategy',
        icon: <Lightbulb className="w-4 h-4" />,
        content: <div className="text-muted-foreground">Account strategy and growth plans will appear here</div>,
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
        content: <div className="text-muted-foreground">Contracts, MSAs, and other documents will appear here</div>,
      },
    ];

    return baseTabs;
  }, [account, canEdit]);

  // Sidebar stats
  const sidebarStats = useMemo((): StatItem[] => {
    if (!account) return [];

    const deals = account.deals || [];
    const wonDeals = deals.filter(d => d.stage === 'closed_won');
    const totalWonValue = wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);

    return [
      {
        label: 'Revenue',
        value: `$${totalWonValue.toLocaleString()}`,
        icon: <DollarSign className="w-3 h-3" />,
      },
      {
        label: 'Open Deals',
        value: deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length,
        icon: <Briefcase className="w-3 h-3" />,
      },
      {
        label: 'Contacts',
        value: account.pointOfContacts?.length || 0,
        icon: <Users className="w-3 h-3" />,
      },
      {
        label: 'Days Active',
        value: differenceInDays(new Date(), new Date(account.createdAt)),
        icon: <Calendar className="w-3 h-3" />,
      },
    ];
  }, [account]);

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
        label: 'Add Contact',
        icon: <UserPlus className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Create Deal',
        icon: <Briefcase className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
    ];
  }, []);

  // Related objects
  const relatedObjects = useMemo((): RelatedObject[] => {
    const objects: RelatedObject[] = [];

    // Add open deals
    const openDeals = account?.deals?.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost') || [];
    openDeals.slice(0, 3).forEach(deal => {
      objects.push({
        id: deal.id,
        type: 'Deal',
        title: deal.title,
        subtitle: `$${Number(deal.value || 0).toLocaleString()}`,
        href: `/employee/workspace/deals/${deal.id}`,
        icon: <Briefcase className="w-4 h-4" />,
        status: deal.stage,
      });
    });

    return objects;
  }, [account]);

  // Loading state
  if (accountLoading || contextLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rust" />
      </div>
    );
  }

  // Error state
  if (error || !account) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium">Account not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const statusConfig = ACCOUNT_STATUSES[account.status as keyof typeof ACCOUNT_STATUSES] ||
    { label: account.status, color: 'bg-stone-100 text-stone-600' };

  return (
    <>
      <WorkspaceLayout
        title={account.name}
        subtitle={account.industry || undefined}
        backHref="/employee/workspace/accounts"
        backLabel="Accounts"
        status={{
          label: statusConfig.label,
          color: statusConfig.color,
        }}
        entityType="account"
        entityId={accountId}
        canEdit={canEdit}
        canDelete={canDelete}
        primaryAction={{
          label: 'Create Deal',
          icon: <Briefcase className="w-4 h-4 mr-1" />,
          onClick: () => {},
        }}
        secondaryActions={[
          {
            label: 'Add Contact',
            onClick: () => {},
            variant: 'outline',
          },
          {
            label: 'Edit Account',
            onClick: () => setShowEditDialog(true),
            variant: 'outline',
          },
        ]}
        tabs={tabs}
        defaultTab="overview"
        sidebar={
          <WorkspaceSidebar
            stats={sidebarStats}
            quickActions={quickActions}
            relatedObjects={relatedObjects}
            relatedObjectsTitle="Open Deals"
          />
        }
        showActivityPanel
        activityPanel={<ActivityPanel entityType="account" entityId={accountId} canEdit={canEdit} />}
        onDelete={() => {
          if (window.confirm('Are you sure you want to delete this account?')) {
            // Handle delete
          }
        }}
      />

      {/* Edit Account Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update account information and settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input defaultValue={account.name} />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input defaultValue={account.industry || ''} />
              </div>
              <div className="space-y-2">
                <Label>Company Type</Label>
                <Select defaultValue={account.companyType || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COMPANY_TYPES).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select defaultValue={account.tier || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACCOUNT_TIERS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Website</Label>
                <Input defaultValue={account.website || ''} placeholder="https://..." />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Headquarters</Label>
                <Input defaultValue={account.headquartersLocation || ''} placeholder="City, State" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea defaultValue={account.description || ''} rows={3} />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Terms (Days)</Label>
                <Input type="number" defaultValue={account.paymentTermsDays || 30} />
              </div>
              <div className="space-y-2">
                <Label>Markup %</Label>
                <Input type="number" defaultValue={account.markupPercentage || ''} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Annual Revenue Target</Label>
                <Input type="number" defaultValue={account.annualRevenueTarget || ''} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle update
              setShowEditDialog(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AccountsWorkspace;
