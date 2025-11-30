/**
 * DealsWorkspace Component
 *
 * Unified workspace for managing deals/opportunities with full CRM fields
 * Context-aware tabs based on user role (Recruiting, TA, Bench Sales)
 */

'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Briefcase,
  FileText,
  Activity,
  FolderOpen,
  Lightbulb,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Clock,
  Link2,
  History,
  PieChart,
  Percent,
  CreditCard,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

interface DealsWorkspaceProps {
  dealId: string;
}

// =====================================================
// CONSTANTS
// =====================================================

const DEAL_STAGES = {
  discovery: { label: 'Discovery', color: 'bg-blue-100 text-blue-700', probability: 10, order: 1 },
  qualification: { label: 'Qualification', color: 'bg-cyan-100 text-cyan-700', probability: 25, order: 2 },
  proposal: { label: 'Proposal', color: 'bg-purple-100 text-purple-700', probability: 50, order: 3 },
  negotiation: { label: 'Negotiation', color: 'bg-amber-100 text-amber-700', probability: 75, order: 4 },
  closed_won: { label: 'Closed Won', color: 'bg-green-100 text-green-700', probability: 100, order: 5 },
  closed_lost: { label: 'Closed Lost', color: 'bg-red-100 text-red-700', probability: 0, order: 6 },
};

const CLOSE_REASONS = {
  won_price: 'Won - Best Price',
  won_service: 'Won - Best Service',
  won_relationship: 'Won - Existing Relationship',
  won_timing: 'Won - Perfect Timing',
  won_quality: 'Won - Quality of Candidates',
  lost_price: 'Lost - Price Too High',
  lost_competition: 'Lost - Competitor Won',
  lost_timing: 'Lost - Bad Timing',
  lost_budget: 'Lost - No Budget',
  lost_need: 'Lost - No Longer Needed',
  lost_ghosted: 'Lost - Client Unresponsive',
  lost_internal: 'Lost - Hired Internally',
};

// =====================================================
// SUB-COMPONENTS
// =====================================================

function DealPipeline({ stage }: { stage: string }) {
  const stages = Object.entries(DEAL_STAGES)
    .filter(([key]) => key !== 'closed_lost')
    .sort(([, a], [, b]) => a.order - b.order);

  const currentIndex = stages.findIndex(([key]) => key === stage);
  const isClosed = stage === 'closed_won' || stage === 'closed_lost';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Pipeline Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1">
          {stages.map(([key, config], index) => {
            const isActive = key === stage;
            const isPast = index < currentIndex;
            const isFuture = index > currentIndex && !isClosed;

            return (
              <React.Fragment key={key}>
                <div
                  className={cn(
                    'flex-1 h-2 rounded-full transition-colors',
                    isActive && config.color.replace('text-', 'bg-').split(' ')[0],
                    isPast && 'bg-green-500',
                    isFuture && 'bg-stone-200',
                    stage === 'closed_lost' && index === currentIndex && 'bg-red-500'
                  )}
                />
                {index < stages.length - 1 && <div className="w-1" />}
              </React.Fragment>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {stages.map(([key, config]) => (
            <span key={key} className={cn(key === stage && 'font-medium text-foreground')}>
              {config.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ deal, canEdit: _canEdit }: { deal: NonNullable<ReturnType<typeof useDeal>['data']>; canEdit: boolean }) {
  const daysInPipeline = differenceInDays(new Date(), new Date(deal.createdAt));
  const daysToClose = deal.expectedCloseDate
    ? differenceInDays(new Date(deal.expectedCloseDate), new Date())
    : null;

  return (
    <div className="space-y-6">
      {/* Pipeline Progress */}
      <DealPipeline stage={deal.stage} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Value & Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Deal Value & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Deal Value</Label>
                <p className="text-2xl font-bold text-green-600">
                  ${Number(deal.value || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Weighted Value</Label>
                <p className="text-2xl font-bold">
                  ${Math.round(Number(deal.value || 0) * ((deal.probability || 0) / 100)).toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Probability</Label>
                <div className="flex items-center gap-2">
                  <Progress value={deal.probability || 0} className="h-2 flex-1" />
                  <span className="font-medium">{deal.probability || 0}%</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Expected Close</Label>
                <p className="font-medium">
                  {deal.expectedCloseDate
                    ? format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')
                    : 'Not set'}
                </p>
                {daysToClose !== null && daysToClose >= 0 && (
                  <p className="text-xs text-muted-foreground">
                    {daysToClose === 0 ? 'Due today' : `${daysToClose} days remaining`}
                  </p>
                )}
                {daysToClose !== null && daysToClose < 0 && (
                  <p className="text-xs text-red-600">
                    {Math.abs(daysToClose)} days overdue
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Days in Pipeline</Label>
                <p className="font-medium">{daysInPipeline} days</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Created</Label>
                <p className="font-medium">
                  {format(new Date(deal.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              {deal.actualCloseDate && (
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Actual Close Date</Label>
                  <p className="font-medium">
                    {format(new Date(deal.actualCloseDate), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Deal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Deal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Deal Title</Label>
              <p className="font-medium">{deal.title}</p>
            </div>

            {deal.description && (
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {deal.description}
                </p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Stage</Label>
                <Badge className={cn('mt-1', DEAL_STAGES[deal.stage as keyof typeof DEAL_STAGES]?.color)}>
                  {DEAL_STAGES[deal.stage as keyof typeof DEAL_STAGES]?.label || deal.stage}
                </Badge>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Owner</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      U
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    Assigned
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        {deal.accountId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Account ID</Label>
                  <p className="font-medium text-xs">{deal.accountId}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Building2 className="w-4 h-4 mr-2" />
                View Account Details
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Source Lead */}
        {deal.leadId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Source Lead
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Lead ID</Label>
                  <p className="font-medium text-xs">{deal.leadId}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Target className="w-4 h-4 mr-2" />
                View Lead Details
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Close Reason (if closed) */}
        {(deal.stage === 'closed_won' || deal.stage === 'closed_lost') && (
          <Card className={cn(
            'col-span-full',
            deal.stage === 'closed_won' ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
          )}>
            <CardHeader>
              <CardTitle className={cn(
                'text-base flex items-center gap-2',
                deal.stage === 'closed_won' ? 'text-green-700' : 'text-red-700'
              )}>
                {deal.stage === 'closed_won' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {deal.stage === 'closed_won' ? 'Deal Won' : 'Deal Lost'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Close Date</Label>
                  <p className="font-medium">
                    {deal.actualCloseDate
                      ? format(new Date(deal.actualCloseDate), 'MMM d, yyyy')
                      : format(new Date(deal.updatedAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Close Reason</Label>
                  <p className="font-medium">
                    {deal.closeReason
                      ? CLOSE_REASONS[deal.closeReason as keyof typeof CLOSE_REASONS] || deal.closeReason
                      : 'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function LinkedJobsTab({ deal, canEdit }: { deal: NonNullable<ReturnType<typeof useDeal>['data']>; canEdit: boolean }) {
  const linkedJobIds = deal.linkedJobIds || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Linked Job Requisitions
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                <Link2 className="w-4 h-4 mr-2" />
                Link Job
              </Button>
            )}
          </div>
          <CardDescription>
            Jobs associated with this deal opportunity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkedJobIds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No linked jobs</p>
              <p className="text-sm">Link jobs to track fulfillment progress</p>
            </div>
          ) : (
            <div className="space-y-3">
              {linkedJobIds.map((jobId) => (
                <div
                  key={jobId}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Job #{jobId.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">Click to view details</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fulfillment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Fulfillment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{linkedJobIds.length}</p>
              <p className="text-xs text-muted-foreground">Total Jobs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-xs text-muted-foreground">Filled</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">0</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-xs text-muted-foreground">Open</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StageHistoryTab({ deal }: { deal: NonNullable<ReturnType<typeof useDeal>['data']> }) {
  // Mock stage history - in production this would come from events table
  const stageHistory = [
    { stage: 'discovery', enteredAt: deal.createdAt, duration: '3 days' },
    { stage: 'qualification', enteredAt: new Date(new Date(deal.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), duration: '5 days' },
    { stage: deal.stage, enteredAt: new Date(new Date(deal.createdAt).getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(), duration: 'Current' },
  ].filter((_, i, _arr) => {
    const stageOrder = DEAL_STAGES[deal.stage as keyof typeof DEAL_STAGES]?.order || 1;
    return i < stageOrder;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" />
            Stage Progression
          </CardTitle>
          <CardDescription>
            Timeline of stage changes for this deal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-stone-200" />

            {/* Stage entries */}
            <div className="space-y-6">
              {stageHistory.map((entry, index) => {
                const config = DEAL_STAGES[entry.stage as keyof typeof DEAL_STAGES];
                const isLast = index === stageHistory.length - 1;

                return (
                  <div key={entry.stage} className="relative pl-10">
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        'absolute left-2 w-5 h-5 rounded-full border-2 border-background',
                        isLast ? config?.color.split(' ')[0] : 'bg-green-500'
                      )}
                    />

                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{config?.label || entry.stage}</p>
                          {isLast && (
                            <Badge variant="outline" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Entered {format(new Date(entry.enteredAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {entry.duration}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Duration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time in Each Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(DEAL_STAGES)
              .filter(([key]) => key !== 'closed_lost')
              .sort(([, a], [, b]) => a.order - b.order)
              .map(([key, config]) => {
                const currentOrder = DEAL_STAGES[deal.stage as keyof typeof DEAL_STAGES]?.order || 1;
                const isPast = config.order < currentOrder;
                const isCurrent = key === deal.stage;

                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      isPast && 'bg-green-500',
                      isCurrent && config.color.split(' ')[0],
                      !isPast && !isCurrent && 'bg-stone-200'
                    )} />
                    <span className="text-sm flex-1">{config.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {isPast ? '3 days' : isCurrent ? 'In progress' : '-'}
                    </span>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ForecastTab({ deal }: { deal: NonNullable<ReturnType<typeof useDeal>['data']> }) {
  const dealValue = Number(deal.value || 0);
  const probability = deal.probability || 0;
  const weightedValue = dealValue * (probability / 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold text-green-600">
                ${dealValue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Deal Value</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Percent className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-3xl font-bold text-blue-600">{probability}%</p>
              <p className="text-sm text-muted-foreground">Win Probability</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-3xl font-bold text-purple-600">
                ${Math.round(weightedValue).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Weighted Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Recognition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Revenue Recognition
          </CardTitle>
          <CardDescription>
            Projected revenue based on deal timeline and probability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Expected Close</Label>
                <p className="font-medium">
                  {deal.expectedCloseDate
                    ? format(new Date(deal.expectedCloseDate), 'MMM yyyy')
                    : 'Not set'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Best Case</Label>
                <p className="font-medium text-green-600">
                  ${dealValue.toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Commit</Label>
                <p className="font-medium">
                  ${probability >= 75 ? dealValue.toLocaleString() : '0'}
                </p>
              </div>
            </div>

            <Separator />

            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Forecast Category:</strong>{' '}
                {probability >= 75
                  ? 'Commit'
                  : probability >= 50
                  ? 'Best Case'
                  : probability >= 25
                  ? 'Pipeline'
                  : 'Early Stage'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {probability < 25 && (
              <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Low probability - needs more qualification</span>
              </div>
            )}
            {deal.expectedCloseDate && differenceInDays(new Date(deal.expectedCloseDate), new Date()) < 0 && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-amber-700">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Expected close date has passed</span>
              </div>
            )}
            {differenceInDays(new Date(), new Date(deal.createdAt)) > 90 && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-amber-700">
                <History className="w-4 h-4" />
                <span className="text-sm">Deal has been in pipeline for over 90 days</span>
              </div>
            )}
            {probability >= 50 && deal.expectedCloseDate && differenceInDays(new Date(deal.expectedCloseDate), new Date()) >= 0 && (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Deal is on track</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to fetch deal data
function useDeal(dealId: string) {
  return trpc.crm.deals.getById.useQuery({ id: dealId });
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function DealsWorkspace({ dealId }: DealsWorkspaceProps) {
  const router = useRouter();
  const { canEdit, canDelete, isLoading: contextLoading } = useWorkspaceContext('deal', dealId);

  // Fetch deal data
  const { data: deal, isLoading: dealLoading, error } = useDeal(dealId);

  // Dialogs
  const [showUpdateStageDialog, setShowUpdateStageDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closeType, setCloseType] = useState<'won' | 'lost'>('won');

  // Build tabs
  const tabs = useMemo((): WorkspaceTab[] => {
    if (!deal) return [];

    const baseTabs: WorkspaceTab[] = [
      {
        id: 'overview',
        label: 'Overview',
        icon: <FileText className="w-4 h-4" />,
        content: <OverviewTab deal={deal} canEdit={canEdit} />,
      },
      {
        id: 'jobs',
        label: 'Linked Jobs',
        icon: <Briefcase className="w-4 h-4" />,
        badge: deal.linkedJobIds?.length || undefined,
        content: <LinkedJobsTab deal={deal} canEdit={canEdit} />,
      },
      {
        id: 'history',
        label: 'Stage History',
        icon: <History className="w-4 h-4" />,
        content: <StageHistoryTab deal={deal} />,
      },
      {
        id: 'forecast',
        label: 'Forecast',
        icon: <TrendingUp className="w-4 h-4" />,
        content: <ForecastTab deal={deal} />,
      },
      {
        id: 'strategy',
        label: 'Strategy',
        icon: <Lightbulb className="w-4 h-4" />,
        content: <div className="text-muted-foreground">Sales strategy and competitive analysis will appear here</div>,
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
        content: <div className="text-muted-foreground">Proposals, contracts, and other documents will appear here</div>,
      },
    ];

    return baseTabs;
  }, [deal, canEdit]);

  // Sidebar stats
  const sidebarStats = useMemo((): StatItem[] => {
    if (!deal) return [];

    return [
      {
        label: 'Deal Value',
        value: `$${Number(deal.value || 0).toLocaleString()}`,
        icon: <DollarSign className="w-3 h-3" />,
      },
      {
        label: 'Probability',
        value: `${deal.probability || 0}%`,
        icon: <Target className="w-3 h-3" />,
      },
      {
        label: 'Weighted',
        value: `$${Math.round(Number(deal.value || 0) * ((deal.probability || 0) / 100)).toLocaleString()}`,
        icon: <TrendingUp className="w-3 h-3" />,
      },
      {
        label: 'Days Open',
        value: differenceInDays(new Date(), new Date(deal.createdAt)),
        icon: <Calendar className="w-3 h-3" />,
      },
    ];
  }, [deal]);

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

    if (deal?.accountId) {
      objects.push({
        id: deal.accountId,
        type: 'Account',
        title: 'Account',
        href: `/employee/workspace/accounts/${deal.accountId}`,
        icon: <Building2 className="w-4 h-4" />,
      });
    }

    if (deal?.leadId) {
      objects.push({
        id: deal.leadId,
        type: 'Lead',
        title: 'Lead',
        href: `/employee/workspace/leads/${deal.leadId}`,
        icon: <Target className="w-4 h-4" />,
      });
    }

    return objects;
  }, [deal]);

  // Loading state
  if (dealLoading || contextLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rust" />
      </div>
    );
  }

  // Error state
  if (error || !deal) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium">Deal not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const stageConfig = DEAL_STAGES[deal.stage as keyof typeof DEAL_STAGES] ||
    { label: deal.stage, color: 'bg-stone-100 text-stone-600' };

  const isOpen = deal.stage !== 'closed_won' && deal.stage !== 'closed_lost';

  return (
    <>
      <WorkspaceLayout
        title={deal.title}
        subtitle={deal.accountId ? `Account: ${deal.accountId.slice(0, 8)}...` : undefined}
        backHref="/employee/workspace/deals"
        backLabel="Deals"
        status={{
          label: stageConfig.label,
          color: stageConfig.color,
        }}
        entityType="deal"
        entityId={dealId}
        canEdit={canEdit}
        canDelete={canDelete}
        primaryAction={isOpen ? {
          label: 'Update Stage',
          icon: <ArrowRight className="w-4 h-4 mr-1" />,
          onClick: () => setShowUpdateStageDialog(true),
        } : undefined}
        secondaryActions={isOpen ? [
          {
            label: 'Mark Won',
            onClick: () => {
              setCloseType('won');
              setShowCloseDialog(true);
            },
            variant: 'outline',
          },
          {
            label: 'Mark Lost',
            onClick: () => {
              setCloseType('lost');
              setShowCloseDialog(true);
            },
            variant: 'outline',
          },
        ] : []}
        tabs={tabs}
        defaultTab="overview"
        sidebar={
          <WorkspaceSidebar
            stats={sidebarStats}
            quickActions={quickActions}
            relatedObjects={relatedObjects}
          />
        }
        showActivityPanel
        activityPanel={<ActivityPanel entityType="deal" entityId={dealId} canEdit={canEdit} />}
        onDelete={() => {
          if (window.confirm('Are you sure you want to delete this deal?')) {
            // Handle delete
          }
        }}
      />

      {/* Update Stage Dialog */}
      <Dialog open={showUpdateStageDialog} onOpenChange={setShowUpdateStageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Deal Stage</DialogTitle>
            <DialogDescription>
              Move this deal to the next stage in your pipeline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Stage</Label>
              <Select defaultValue={deal.stage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEAL_STAGES)
                    .filter(([key]) => key !== 'closed_won' && key !== 'closed_lost')
                    .sort(([, a], [, b]) => a.order - b.order)
                    .map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label} ({config.probability}% probability)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Expected Close Date</Label>
              <Input
                type="date"
                defaultValue={deal.expectedCloseDate ? format(new Date(deal.expectedCloseDate), 'yyyy-MM-dd') : ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Add any notes about this stage change..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateStageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle stage update
              setShowUpdateStageDialog(false);
            }}>
              Update Stage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Deal Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {closeType === 'won' ? 'Mark Deal as Won' : 'Mark Deal as Lost'}
            </DialogTitle>
            <DialogDescription>
              {closeType === 'won'
                ? 'Congratulations! Record the details of this win.'
                : 'Record why this deal was lost for future analysis.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Close Reason</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CLOSE_REASONS)
                    .filter(([key]) => key.startsWith(closeType === 'won' ? 'won_' : 'lost_'))
                    .map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Close Date</Label>
              <Input
                type="date"
                defaultValue={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            {closeType === 'won' && (
              <div className="space-y-2">
                <Label>Final Value</Label>
                <Input
                  type="number"
                  defaultValue={deal.value}
                  placeholder="Enter final deal value"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder={closeType === 'won'
                  ? "What made this deal successful?"
                  : "What could we have done differently?"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={closeType === 'won' ? 'default' : 'destructive'}
              onClick={() => {
                // Handle close
                setShowCloseDialog(false);
              }}
            >
              {closeType === 'won' ? 'Mark as Won' : 'Mark as Lost'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DealsWorkspace;
