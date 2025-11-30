/**
 * TalentWorkspace Component
 *
 * Unified workspace for managing candidates/consultants with full ATS fields
 * Supports Recruiting, Bench Sales, and TA team contexts
 */

'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  DollarSign,
  Briefcase,
  FileText,
  Activity,
  FolderOpen,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Code,
  Award,
  Star,
  Shield,
  Plane,
  Timer,
  Send,
  BarChart3,
  UserCheck,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface TalentWorkspaceProps {
  talentId: string;
}

// =====================================================
// CONSTANTS
// =====================================================

const CANDIDATE_STATUSES = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  placed: { label: 'Placed', color: 'bg-blue-100 text-blue-700' },
  bench: { label: 'On Bench', color: 'bg-amber-100 text-amber-700' },
  inactive: { label: 'Inactive', color: 'bg-stone-100 text-stone-500' },
  blacklisted: { label: 'Blacklisted', color: 'bg-red-100 text-red-700' },
};

const VISA_TYPES = {
  USC: { label: 'US Citizen', color: 'text-green-600' },
  GC: { label: 'Green Card', color: 'text-green-600' },
  H1B: { label: 'H1B', color: 'text-blue-600' },
  OPT: { label: 'OPT', color: 'text-amber-600' },
  CPT: { label: 'CPT', color: 'text-amber-600' },
  TN: { label: 'TN', color: 'text-blue-600' },
  L1: { label: 'L1', color: 'text-blue-600' },
  EAD: { label: 'EAD', color: 'text-green-600' },
};

const AVAILABILITY_OPTIONS = {
  immediate: { label: 'Immediate', color: 'text-green-600' },
  '2_weeks': { label: '2 Weeks', color: 'text-amber-600' },
  '1_month': { label: '1 Month', color: 'text-orange-600' },
};

// =====================================================
// SUB-COMPONENTS
// =====================================================

function OverviewTab({ talent, canEdit: _canEdit }: { talent: NonNullable<ReturnType<typeof useTalent>['data']>; canEdit: boolean }) {
  const visaConfig = VISA_TYPES[talent.candidateCurrentVisa as keyof typeof VISA_TYPES];
  const availabilityConfig = AVAILABILITY_OPTIONS[talent.candidateAvailability as keyof typeof AVAILABILITY_OPTIONS];

  // Calculate days on bench
  const daysOnBench = talent.candidateBenchStartDate
    ? differenceInDays(new Date(), new Date(talent.candidateBenchStartDate))
    : null;

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
              <AvatarImage src={talent.avatarUrl || undefined} />
              <AvatarFallback className="text-lg">
                {((talent.firstName?.[0] || '') + (talent.lastName?.[0] || '')).toUpperCase() || 'T'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">
                {`${talent.firstName || ''} ${talent.lastName || ''}`.trim() || 'Unknown'}
              </p>
              {talent.candidateLocation && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="text-sm">{talent.candidateLocation}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            {talent.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${talent.email}`} className="text-rust hover:underline">
                  {talent.email}
                </a>
              </div>
            )}
            {talent.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${talent.phone}`} className="text-rust hover:underline">
                  {talent.phone}
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label className="text-xs text-muted-foreground">Timezone</Label>
              <p className="font-medium">{talent.timezone || 'EST'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Willing to Relocate</Label>
              <p className="font-medium">
                {talent.candidateWillingToRelocate ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Professional Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Experience</Label>
              <p className="text-lg font-bold">
                {talent.candidateExperienceYears
                  ? `${talent.candidateExperienceYears} years`
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Hourly Rate</Label>
              <p className="text-lg font-bold text-green-600">
                {talent.candidateHourlyRate
                  ? `$${Number(talent.candidateHourlyRate).toLocaleString()}/hr`
                  : 'Not set'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Availability</Label>
              <p className={cn('font-medium', availabilityConfig?.color)}>
                {availabilityConfig?.label || talent.candidateAvailability || 'Not specified'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Badge className={cn('mt-1', CANDIDATE_STATUSES[talent.candidateStatus as keyof typeof CANDIDATE_STATUSES]?.color)}>
                {CANDIDATE_STATUSES[talent.candidateStatus as keyof typeof CANDIDATE_STATUSES]?.label || talent.candidateStatus}
              </Badge>
            </div>
          </div>

          {talent.candidateResumeUrl && (
            <>
              <Separator />
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                View Resume
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Visa & Work Authorization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Visa & Work Authorization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Current Visa</Label>
              <p className={cn('text-lg font-bold', visaConfig?.color)}>
                {visaConfig?.label || talent.candidateCurrentVisa || 'Not specified'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Visa Expiry</Label>
              <p className="font-medium">
                {talent.candidateVisaExpiry
                  ? format(new Date(talent.candidateVisaExpiry), 'MMM d, yyyy')
                  : 'N/A'}
              </p>
              {talent.candidateVisaExpiry && (
                <p className={cn(
                  'text-xs',
                  differenceInDays(new Date(talent.candidateVisaExpiry), new Date()) <= 90
                    ? 'text-red-600'
                    : 'text-muted-foreground'
                )}>
                  {differenceInDays(new Date(talent.candidateVisaExpiry), new Date())} days remaining
                </p>
              )}
            </div>
          </div>

          {talent.candidateVisaExpiry && differenceInDays(new Date(talent.candidateVisaExpiry), new Date()) <= 90 && (
            <div className="p-3 bg-amber-50 rounded-lg flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Visa expires soon - consider extension</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bench Status (if on bench) */}
      {talent.candidateStatus === 'bench' && (
        <Card className={cn(
          'border-amber-200 bg-amber-50/50',
          daysOnBench && daysOnBench > 60 && 'border-red-200 bg-red-50/50'
        )}>
          <CardHeader>
            <CardTitle className={cn(
              'text-base flex items-center gap-2',
              daysOnBench && daysOnBench > 60 ? 'text-red-700' : 'text-amber-700'
            )}>
              <Timer className="w-4 h-4" />
              Bench Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">On Bench Since</Label>
                <p className="font-medium">
                  {talent.candidateBenchStartDate
                    ? format(new Date(talent.candidateBenchStartDate), 'MMM d, yyyy')
                    : 'Unknown'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Days on Bench</Label>
                <p className={cn(
                  'text-lg font-bold',
                  daysOnBench && daysOnBench > 60 ? 'text-red-600' : daysOnBench && daysOnBench > 30 ? 'text-amber-600' : 'text-green-600'
                )}>
                  {daysOnBench || 0} days
                </p>
              </div>
            </div>

            {daysOnBench && daysOnBench > 30 && (
              <div className={cn(
                'p-2 rounded-lg flex items-center gap-2',
                daysOnBench > 60 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              )}>
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">
                  {daysOnBench > 60
                    ? 'Critical: Over 60 days on bench - needs immediate action'
                    : 'Warning: Over 30 days on bench'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Placement History (if placed) */}
      {talent.candidateStatus === 'placed' && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-blue-700">
              <CheckCircle className="w-4 h-4" />
              Currently Placed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Active placement details would appear here with linked job and client information.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SkillsTab({ talent, canEdit }: { talent: NonNullable<ReturnType<typeof useTalent>['data']>; canEdit: boolean }) {
  const skills = talent.candidateSkills || [];

  return (
    <div className="space-y-6">
      {/* Skills */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Code className="w-4 h-4" />
              Technical Skills
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                Edit Skills
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No skills listed</p>
              <p className="text-sm">Add skills to improve job matching</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4" />
            Experience Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{talent.candidateExperienceYears || 0}</p>
              <p className="text-xs text-muted-foreground">Years Experience</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{skills.length}</p>
              <p className="text-xs text-muted-foreground">Skills Listed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-muted-foreground">Certifications</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface Submission {
  id: string;
  status: string;
  job?: {
    title: string;
    account?: {
      name: string;
    };
  };
}

function SubmissionsTab({ talent: _talent }: { talent: NonNullable<ReturnType<typeof useTalent>['data']> }) {
  // In production, this would fetch submissions from tRPC
  const submissions: Submission[] = [];

  return (
    <div className="space-y-6">
      {/* Submission Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Send className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Total Submissions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Placed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Job Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No submissions yet</p>
              <p className="text-sm">Submissions for this candidate will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{submission.job?.title}</p>
                    <p className="text-sm text-muted-foreground">{submission.job?.account?.name}</p>
                  </div>
                  <Badge>{submission.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface Placement {
  id: string;
  status: string;
  startDate: string;
  endDate?: string;
  job?: {
    title: string;
  };
  account?: {
    name: string;
  };
}

function PlacementsTab({ talent: _talent }: { talent: NonNullable<ReturnType<typeof useTalent>['data']> }) {
  // In production, this would fetch placements from tRPC
  const placements: Placement[] = [];

  return (
    <div className="space-y-6">
      {/* Placement Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Placement Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Total Placements</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">$0</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0 mo</p>
              <p className="text-xs text-muted-foreground">Avg Duration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placements History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Placement History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {placements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No placements yet</p>
              <p className="text-sm">Past and current placements will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {placements.map((placement) => (
                <div
                  key={placement.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{placement.job?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {placement.account?.name} • {placement.startDate} - {placement.endDate || 'Present'}
                    </p>
                  </div>
                  <Badge variant={placement.status === 'active' ? 'default' : 'secondary'}>
                    {placement.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ImmigrationTab({ talent }: { talent: NonNullable<ReturnType<typeof useTalent>['data']> }) {
  const visaConfig = VISA_TYPES[talent.candidateCurrentVisa as keyof typeof VISA_TYPES];
  const daysUntilExpiry = talent.candidateVisaExpiry
    ? differenceInDays(new Date(talent.candidateVisaExpiry), new Date())
    : null;

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Current Immigration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Visa Type</Label>
              <p className={cn('text-2xl font-bold', visaConfig?.color)}>
                {visaConfig?.label || talent.candidateCurrentVisa || 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Expiry Date</Label>
              <p className="font-medium">
                {talent.candidateVisaExpiry
                  ? format(new Date(talent.candidateVisaExpiry), 'MMM d, yyyy')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Days Remaining</Label>
              <p className={cn(
                'text-2xl font-bold',
                daysUntilExpiry && daysUntilExpiry <= 90 ? 'text-red-600' : daysUntilExpiry && daysUntilExpiry <= 180 ? 'text-amber-600' : 'text-green-600'
              )}>
                {daysUntilExpiry !== null ? daysUntilExpiry : 'N/A'}
              </p>
            </div>
          </div>

          {daysUntilExpiry !== null && daysUntilExpiry <= 180 && (
            <div className={cn(
              'p-3 rounded-lg flex items-center gap-2',
              daysUntilExpiry <= 90 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
            )}>
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {daysUntilExpiry <= 90
                  ? 'Visa expires within 90 days - initiate extension/transfer immediately'
                  : 'Visa expires within 180 days - plan for renewal'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Immigration Cases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Immigration Cases
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plane className="w-4 h-4 mr-2" />
              New Case
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No immigration cases</p>
            <p className="text-sm">Immigration cases and history will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to fetch talent data (uses ATS candidates router)
function useTalent(talentId: string) {
  return trpc.ats.candidates.getById.useQuery({ id: talentId });
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function TalentWorkspace({ talentId }: TalentWorkspaceProps) {
  const router = useRouter();
  const { canEdit, canDelete, isLoading: contextLoading } = useWorkspaceContext('talent', talentId);

  // Fetch talent data
  const { data: talent, isLoading: talentLoading, error } = useTalent(talentId);

  // Dialogs
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // Build tabs
  const tabs = useMemo((): WorkspaceTab[] => {
    if (!talent) return [];

    const baseTabs: WorkspaceTab[] = [
      {
        id: 'overview',
        label: 'Overview',
        icon: <FileText className="w-4 h-4" />,
        content: <OverviewTab talent={talent} canEdit={canEdit} />,
      },
      {
        id: 'skills',
        label: 'Skills',
        icon: <Code className="w-4 h-4" />,
        badge: talent.candidateSkills?.length || undefined,
        content: <SkillsTab talent={talent} canEdit={canEdit} />,
      },
      {
        id: 'submissions',
        label: 'Submissions',
        icon: <Send className="w-4 h-4" />,
        content: <SubmissionsTab talent={talent} />,
      },
      {
        id: 'placements',
        label: 'Placements',
        icon: <UserCheck className="w-4 h-4" />,
        content: <PlacementsTab talent={talent} />,
      },
      {
        id: 'immigration',
        label: 'Immigration',
        icon: <Shield className="w-4 h-4" />,
        content: <ImmigrationTab talent={talent} />,
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
        content: <div className="text-muted-foreground">Resumes, certifications, and other documents</div>,
      },
    ];

    return baseTabs;
  }, [talent, canEdit]);

  // Sidebar stats
  const sidebarStats = useMemo((): StatItem[] => {
    if (!talent) return [];

    return [
      {
        label: 'Experience',
        value: `${talent.candidateExperienceYears || 0} yrs`,
        icon: <Award className="w-3 h-3" />,
      },
      {
        label: 'Rate',
        value: talent.candidateHourlyRate ? `$${Number(talent.candidateHourlyRate)}` : '-',
        icon: <DollarSign className="w-3 h-3" />,
      },
      {
        label: 'Skills',
        value: talent.candidateSkills?.length || 0,
        icon: <Code className="w-3 h-3" />,
      },
      {
        label: 'Availability',
        value: AVAILABILITY_OPTIONS[talent.candidateAvailability as keyof typeof AVAILABILITY_OPTIONS]?.label || '-',
        icon: <Clock className="w-3 h-3" />,
      },
    ];
  }, [talent]);

  // Quick actions
  const quickActions = useMemo((): QuickAction[] => {
    return [
      {
        label: 'Submit to Job',
        icon: <Send className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Send Email',
        icon: <Mail className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Schedule Call',
        icon: <Phone className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Add to Hotlist',
        icon: <Star className="w-4 h-4 mr-2" />,
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
    return [];
  }, []);

  // Loading state
  if (talentLoading || contextLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rust" />
      </div>
    );
  }

  // Error state
  if (error || !talent) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium">Talent profile not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const statusConfig = CANDIDATE_STATUSES[talent.candidateStatus as keyof typeof CANDIDATE_STATUSES] ||
    { label: talent.candidateStatus || 'Unknown', color: 'bg-stone-100 text-stone-600' };

  const talentName = `${talent.firstName || ''} ${talent.lastName || ''}`.trim() || 'Unknown';

  return (
    <>
      <WorkspaceLayout
        title={talentName}
        subtitle={talent.candidateLocation || undefined}
        backHref="/employee/workspace/talent"
        backLabel="Talent"
        status={{
          label: statusConfig.label,
          color: statusConfig.color,
        }}
        entityType="talent"
        entityId={talentId}
        canEdit={canEdit}
        canDelete={canDelete}
        primaryAction={{
          label: 'Submit to Job',
          icon: <Send className="w-4 h-4 mr-1" />,
          onClick: () => {},
        }}
        secondaryActions={[
          {
            label: 'Update Status',
            onClick: () => setShowStatusDialog(true),
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
          />
        }
        showActivityPanel
        activityPanel={<ActivityPanel entityType="talent" entityId={talentId} canEdit={canEdit} />}
        onDelete={() => {
          if (window.confirm('Are you sure you want to delete this talent profile?')) {
            // Handle delete
          }
        }}
      />

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Candidate Status</DialogTitle>
            <DialogDescription>
              Change the status of this candidate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select defaultValue={talent.candidateStatus || 'active'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CANDIDATE_STATUSES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Add any notes about this status change..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowStatusDialog(false);
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TalentWorkspace;
