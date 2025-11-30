/**
 * JobOrdersWorkspace Component
 *
 * Unified workspace for managing confirmed client job orders
 * Includes full billing rates, requirements, and fulfillment tracking
 */

'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  User,
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
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Clock,
  Users,
  MapPin,
  Code,
  Award,
  Star,
  Globe,
  FileCheck,
  Send,
  Shield,
  CreditCard,
  Percent,
  Timer,
  Hash,
  UserPlus,
  ExternalLink,
  PieChart,
  Layers,
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

interface JobOrdersWorkspaceProps {
  jobOrderId: string;
}

// =====================================================
// CONSTANTS
// =====================================================

const JOB_ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  on_hold: { label: 'On Hold', color: 'bg-blue-100 text-blue-600' },
  fulfilled: { label: 'Fulfilled', color: 'bg-purple-100 text-purple-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  expired: { label: 'Expired', color: 'bg-stone-100 text-stone-500' },
};

const JOB_ORDER_PRIORITIES = {
  low: { label: 'Low', color: 'bg-stone-100 text-stone-600' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-600' },
  high: { label: 'High', color: 'bg-amber-100 text-amber-700' },
  urgent: { label: 'Urgent', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700' },
};

const JOB_TYPES = {
  contract: { label: 'Contract', description: 'Fixed-term engagement' },
  permanent: { label: 'Permanent', description: 'Direct hire FTE' },
  contract_to_hire: { label: 'Contract-to-Hire', description: 'Convert option' },
  temp: { label: 'Temporary', description: 'Short-term assignment' },
  sow: { label: 'SOW', description: 'Statement of Work' },
};

const EMPLOYMENT_TYPES = {
  w2: { label: 'W2', description: 'Employee of staffing firm' },
  '1099': { label: '1099', description: 'Independent contractor' },
  corp_to_corp: { label: 'Corp-to-Corp', description: 'Business-to-business' },
  direct_hire: { label: 'Direct Hire', description: 'FTE with client' },
};

// =====================================================
// SUB-COMPONENTS
// =====================================================

function FillProgress({ positionsCount, positionsFilled }: { positionsCount: number; positionsFilled: number }) {
  const progress = positionsCount > 0 ? Math.round((positionsFilled / positionsCount) * 100) : 0;
  const remaining = positionsCount - positionsFilled;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-4 h-4" />
          Fill Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {positionsFilled} / {positionsCount}
          </div>
          <Badge variant={progress === 100 ? 'default' : progress >= 50 ? 'secondary' : 'outline'}>
            {progress}% filled
          </Badge>
        </div>
        <Progress value={progress} className="h-3" />
        <div className="text-sm text-muted-foreground">
          {remaining === 0 ? (
            <span className="text-green-600 font-medium">All positions filled!</span>
          ) : (
            <span>{remaining} position{remaining !== 1 ? 's' : ''} remaining</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ jobOrder, canEdit }: { jobOrder: NonNullable<ReturnType<typeof useJobOrder>['data']>; canEdit: boolean }) {
  const daysOpen = differenceInDays(new Date(), new Date(jobOrder.receivedDate || jobOrder.createdAt));
  const daysToTarget = jobOrder.targetFillDate
    ? differenceInDays(new Date(jobOrder.targetFillDate), new Date())
    : null;

  return (
    <div className="space-y-6">
      {/* Fill Progress */}
      <FillProgress
        positionsCount={jobOrder.positionsCount || 1}
        positionsFilled={jobOrder.positionsFilled || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-sm">{jobOrder.orderNumber || 'Pending'}</span>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Title</Label>
              <p className="font-medium">{jobOrder.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Job Type</Label>
                <p className="font-medium">
                  {JOB_TYPES[jobOrder.jobType as keyof typeof JOB_TYPES]?.label || jobOrder.jobType}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Employment Type</Label>
                <p className="font-medium">
                  {EMPLOYMENT_TYPES[jobOrder.employmentType as keyof typeof EMPLOYMENT_TYPES]?.label || jobOrder.employmentType}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Badge className={cn('mt-1', JOB_ORDER_PRIORITIES[jobOrder.priority as keyof typeof JOB_ORDER_PRIORITIES]?.color)}>
                  {JOB_ORDER_PRIORITIES[jobOrder.priority as keyof typeof JOB_ORDER_PRIORITIES]?.label || jobOrder.priority}
                </Badge>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Days Open</Label>
                <p className="font-medium">{daysOpen} days</p>
              </div>
            </div>

            {jobOrder.description && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-4">
                    {jobOrder.description}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Billing & Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Billing & Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Bill Rate</Label>
                <p className="text-lg font-bold text-green-600">
                  ${Number(jobOrder.billRate || 0).toLocaleString()}/{jobOrder.rateType || 'hr'}
                </p>
                {jobOrder.billRateMax && Number(jobOrder.billRateMax) !== Number(jobOrder.billRate) && (
                  <p className="text-xs text-muted-foreground">
                    Max: ${Number(jobOrder.billRateMax).toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Pay Rate Range</Label>
                <p className="font-medium">
                  ${Number(jobOrder.payRateMin || 0).toLocaleString()} - ${Number(jobOrder.payRateMax || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Markup</Label>
                <p className="font-medium">
                  {jobOrder.markupPercentage ? `${Number(jobOrder.markupPercentage)}%` : 'Not set'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Currency</Label>
                <p className="font-medium">{jobOrder.currency || 'USD'}</p>
              </div>
            </div>

            {jobOrder.overtimeExpected && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">OT Bill Rate</Label>
                    <p className="font-medium">
                      ${Number(jobOrder.overtimeBillRate || 0).toLocaleString()}/hr
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">OT Pay Rate</Label>
                    <p className="font-medium">
                      ${Number(jobOrder.overtimePayRate || 0).toLocaleString()}/hr
                    </p>
                  </div>
                </div>
              </>
            )}

            {(jobOrder.placementFeePercentage || jobOrder.placementFeeFlat) && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Placement Fee</Label>
                  <p className="font-medium">
                    {jobOrder.placementFeePercentage
                      ? `${Number(jobOrder.placementFeePercentage)}% of salary`
                      : `$${Number(jobOrder.placementFeeFlat).toLocaleString()} flat`}
                  </p>
                  {jobOrder.guaranteePeriodDays && (
                    <p className="text-xs text-muted-foreground">
                      {jobOrder.guaranteePeriodDays} day guarantee period
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Location</Label>
                <p className="font-medium">{jobOrder.location || 'Not specified'}</p>
                {(jobOrder.city || jobOrder.state) && (
                  <p className="text-sm text-muted-foreground">
                    {[jobOrder.city, jobOrder.state, jobOrder.zipCode].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Work Model</Label>
                <div className="flex items-center gap-2 mt-1">
                  {jobOrder.isRemote ? (
                    <>
                      <Globe className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {jobOrder.remoteType === 'fully_remote' ? 'Fully Remote' :
                          jobOrder.remoteType === 'hybrid' ? `Hybrid (${jobOrder.hybridDays || 0} days remote)` :
                            'Remote'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 text-stone-600" />
                      <span className="font-medium">On-site</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Start Date</Label>
                <p className="font-medium">
                  {jobOrder.startDate
                    ? format(new Date(jobOrder.startDate), 'MMM d, yyyy')
                    : 'TBD'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">End Date</Label>
                <p className="font-medium">
                  {jobOrder.endDate
                    ? format(new Date(jobOrder.endDate), 'MMM d, yyyy')
                    : jobOrder.durationMonths
                      ? `${jobOrder.durationMonths} months`
                      : 'Open-ended'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Target Fill</Label>
                <p className={cn(
                  'font-medium',
                  daysToTarget !== null && daysToTarget < 0 && 'text-red-600',
                  daysToTarget !== null && daysToTarget <= 7 && daysToTarget >= 0 && 'text-amber-600'
                )}>
                  {jobOrder.targetFillDate
                    ? format(new Date(jobOrder.targetFillDate), 'MMM d, yyyy')
                    : 'Not set'}
                </p>
                {daysToTarget !== null && (
                  <p className={cn(
                    'text-xs',
                    daysToTarget < 0 ? 'text-red-600' : 'text-muted-foreground'
                  )}>
                    {daysToTarget < 0
                      ? `${Math.abs(daysToTarget)} days overdue`
                      : daysToTarget === 0
                        ? 'Due today'
                        : `${daysToTarget} days remaining`}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Extension</Label>
                <p className="font-medium">
                  {jobOrder.extensionPossible ? 'Possible' : 'Not expected'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client */}
        {jobOrder.account && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="font-medium">{jobOrder.account.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {jobOrder.account.industry || 'Industry not specified'}
                  </p>
                </div>
              </div>

              {(jobOrder.hiringManagerName || jobOrder.department) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    {jobOrder.hiringManagerName && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Hiring Manager</Label>
                        <p className="font-medium">{jobOrder.hiringManagerName}</p>
                        {jobOrder.hiringManagerEmail && (
                          <a href={`mailto:${jobOrder.hiringManagerEmail}`} className="text-xs text-rust hover:underline">
                            {jobOrder.hiringManagerEmail}
                          </a>
                        )}
                      </div>
                    )}
                    {jobOrder.department && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Department</Label>
                        <p className="font-medium">{jobOrder.department}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Button variant="outline" size="sm" className="w-full">
                View Account Details
              </Button>
            </CardContent>
          </Card>
        )}

        {/* VMS/MSP Info */}
        {(jobOrder.vmsName || jobOrder.mspName || jobOrder.vmsJobId) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4 h-4" />
                VMS/MSP Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {jobOrder.vmsName && (
                  <div>
                    <Label className="text-xs text-muted-foreground">VMS</Label>
                    <p className="font-medium">{jobOrder.vmsName}</p>
                  </div>
                )}
                {jobOrder.mspName && (
                  <div>
                    <Label className="text-xs text-muted-foreground">MSP</Label>
                    <p className="font-medium">{jobOrder.mspName}</p>
                  </div>
                )}
                {jobOrder.vmsJobId && (
                  <div>
                    <Label className="text-xs text-muted-foreground">VMS Job ID</Label>
                    <p className="font-mono text-sm">{jobOrder.vmsJobId}</p>
                  </div>
                )}
                {jobOrder.vendorTier && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Vendor Tier</Label>
                    <Badge variant="outline">{jobOrder.vendorTier}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function RequirementsTab({ jobOrder, canEdit }: { jobOrder: NonNullable<ReturnType<typeof useJobOrder>['data']>; canEdit: boolean }) {
  const requiredSkills = jobOrder.requiredSkills || [];
  const niceToHaveSkills = jobOrder.niceToHaveSkills || [];
  const certifications = jobOrder.certificationsRequired || [];
  const visaRequirements = jobOrder.visaRequirements || [];

  return (
    <div className="space-y-6">
      {/* Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Code className="w-4 h-4" />
              Required Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requiredSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No required skills specified</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill, i) => (
                  <Badge key={i} variant="default">{skill}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4" />
              Nice to Have Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {niceToHaveSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No preferred skills specified</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {niceToHaveSkills.map((skill, i) => (
                  <Badge key={i} variant="secondary">{skill}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Experience & Education */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4" />
            Experience & Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label className="text-xs text-muted-foreground">Experience</Label>
              <p className="font-medium">
                {jobOrder.minExperienceYears || jobOrder.maxExperienceYears
                  ? `${jobOrder.minExperienceYears || 0} - ${jobOrder.maxExperienceYears || '10+'} years`
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Education</Label>
              <p className="font-medium">
                {jobOrder.educationRequirement || 'Not specified'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Certifications</Label>
              {certifications.length === 0 ? (
                <p className="font-medium">None required</p>
              ) : (
                <div className="flex flex-wrap gap-1 mt-1">
                  {certifications.map((cert, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{cert}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Authorization & Clearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Work Authorization & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Visa Requirements</Label>
              {visaRequirements.length === 0 ? (
                <p className="font-medium">Any</p>
              ) : (
                <div className="flex flex-wrap gap-1 mt-1">
                  {visaRequirements.map((visa, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{visa}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Citizenship</Label>
              <p className="font-medium">
                {jobOrder.citizenshipRequired ? 'Required' : 'Not required'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Security Clearance</Label>
              <p className="font-medium">
                {jobOrder.securityClearanceRequired || 'None'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Background/Drug</Label>
              <p className="font-medium">
                {[
                  jobOrder.backgroundCheckRequired && 'Background',
                  jobOrder.drugScreenRequired && 'Drug Screen'
                ].filter(Boolean).join(' + ') || 'None'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Process */}
      {(jobOrder.interviewProcess || jobOrder.interviewRounds || jobOrder.technicalAssessmentRequired) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Interview Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Interview Rounds</Label>
                <p className="font-medium">{jobOrder.interviewRounds || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Technical Assessment</Label>
                <p className="font-medium">
                  {jobOrder.technicalAssessmentRequired ? 'Required' : 'Not required'}
                </p>
              </div>
            </div>
            {jobOrder.interviewProcess && (
              <div>
                <Label className="text-xs text-muted-foreground">Process Details</Label>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {jobOrder.interviewProcess}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SubmissionsTab({ jobOrder, canEdit }: { jobOrder: NonNullable<ReturnType<typeof useJobOrder>['data']>; canEdit: boolean }) {
  const currentSubmissions = jobOrder.currentSubmissions || 0;
  const maxSubmissions = jobOrder.maxSubmissions;

  return (
    <div className="space-y-6">
      {/* Submission Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Send className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{currentSubmissions}</p>
              <p className="text-xs text-muted-foreground">Total Submitted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Timer className="w-6 h-6 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">In Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{jobOrder.positionsFilled || 0}</p>
              <p className="text-xs text-muted-foreground">Placed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">
                {maxSubmissions ? `${currentSubmissions}/${maxSubmissions}` : 'Unlimited'}
              </p>
              <p className="text-xs text-muted-foreground">Submission Limit</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submission Instructions */}
      {(jobOrder.submissionInstructions || jobOrder.submissionFormat) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Submission Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobOrder.submissionFormat && (
              <div>
                <Label className="text-xs text-muted-foreground">Required Format</Label>
                <p className="font-medium">{jobOrder.submissionFormat}</p>
              </div>
            )}
            {jobOrder.submissionInstructions && (
              <div>
                <Label className="text-xs text-muted-foreground">Instructions</Label>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {jobOrder.submissionInstructions}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Submissions
            </CardTitle>
            {canEdit && (
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Submit Candidate
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No submissions yet</p>
            <p className="text-sm">Candidates submitted to this order will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FinancialsTab({ jobOrder }: { jobOrder: NonNullable<ReturnType<typeof useJobOrder>['data']> }) {
  const positionsFilled = jobOrder.positionsFilled || 0;
  const billRate = Number(jobOrder.billRate || 0);
  const avgPayRate = (Number(jobOrder.payRateMin || 0) + Number(jobOrder.payRateMax || 0)) / 2;
  const estimatedMonthlyRevenue = positionsFilled * billRate * 173; // 173 avg working hours/month
  const estimatedGrossProfit = positionsFilled * (billRate - avgPayRate) * 173;
  const markupPercent = avgPayRate > 0 ? ((billRate - avgPayRate) / avgPayRate) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold text-green-600">
                ${estimatedMonthlyRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Est. Monthly Revenue</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-3xl font-bold text-blue-600">
                ${estimatedGrossProfit.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Est. Monthly GP</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Percent className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-3xl font-bold text-purple-600">
                {markupPercent.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Effective Markup</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Rate Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Bill Rate</span>
              <span className="font-bold text-green-600">${billRate.toLocaleString()}/hr</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Pay Rate (avg)</span>
              <span className="font-medium">-${avgPayRate.toLocaleString()}/hr</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Gross Profit/hr</span>
              <span className="font-bold text-blue-600">${(billRate - avgPayRate).toLocaleString()}/hr</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Positions Filled</span>
              <span className="font-medium">× {positionsFilled}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Annual Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Annual Revenue</Label>
              <p className="text-xl font-bold text-green-600">
                ${(estimatedMonthlyRevenue * 12).toLocaleString()}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Annual Gross Profit</Label>
              <p className="text-xl font-bold text-blue-600">
                ${(estimatedGrossProfit * 12).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to fetch job order data
function useJobOrder(jobOrderId: string) {
  return trpc.jobOrders.getById.useQuery({ id: jobOrderId });
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function JobOrdersWorkspace({ jobOrderId }: JobOrdersWorkspaceProps) {
  const router = useRouter();
  const { context, canEdit, canDelete, isLoading: contextLoading } = useWorkspaceContext('job_order', jobOrderId);

  // Fetch job order data
  const { data: jobOrder, isLoading: jobOrderLoading, error } = useJobOrder(jobOrderId);

  // Dialogs
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // Build tabs
  const tabs = useMemo((): WorkspaceTab[] => {
    if (!jobOrder) return [];

    const baseTabs: WorkspaceTab[] = [
      {
        id: 'overview',
        label: 'Overview',
        icon: <FileText className="w-4 h-4" />,
        content: <OverviewTab jobOrder={jobOrder} canEdit={canEdit} />,
      },
      {
        id: 'requirements',
        label: 'Requirements',
        icon: <Code className="w-4 h-4" />,
        content: <RequirementsTab jobOrder={jobOrder} canEdit={canEdit} />,
      },
      {
        id: 'submissions',
        label: 'Submissions',
        icon: <Users className="w-4 h-4" />,
        badge: jobOrder.currentSubmissions || undefined,
        content: <SubmissionsTab jobOrder={jobOrder} canEdit={canEdit} />,
      },
      {
        id: 'financials',
        label: 'Financials',
        icon: <DollarSign className="w-4 h-4" />,
        content: <FinancialsTab jobOrder={jobOrder} />,
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
        content: <div className="text-muted-foreground">Job descriptions, SOWs, and contracts</div>,
      },
    ];

    return baseTabs;
  }, [jobOrder, canEdit]);

  // Sidebar stats
  const sidebarStats = useMemo((): StatItem[] => {
    if (!jobOrder) return [];

    return [
      {
        label: 'Bill Rate',
        value: `$${Number(jobOrder.billRate || 0).toLocaleString()}`,
        icon: <DollarSign className="w-3 h-3" />,
      },
      {
        label: 'Positions',
        value: `${jobOrder.positionsFilled || 0}/${jobOrder.positionsCount || 1}`,
        icon: <Target className="w-3 h-3" />,
      },
      {
        label: 'Submissions',
        value: jobOrder.currentSubmissions || 0,
        icon: <Users className="w-3 h-3" />,
      },
      {
        label: 'Days Open',
        value: differenceInDays(new Date(), new Date(jobOrder.receivedDate || jobOrder.createdAt)),
        icon: <Calendar className="w-3 h-3" />,
      },
    ];
  }, [jobOrder]);

  // Quick actions
  const quickActions = useMemo((): QuickAction[] => {
    return [
      {
        label: 'Submit Candidate',
        icon: <UserPlus className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'View in VMS',
        icon: <ExternalLink className="w-4 h-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Contact Client',
        icon: <Mail className="w-4 h-4 mr-2" />,
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

    if (jobOrder?.account) {
      objects.push({
        id: jobOrder.account.id,
        type: 'Account',
        title: jobOrder.account.name,
        href: `/employee/workspace/accounts/${jobOrder.account.id}`,
        icon: <Building2 className="w-4 h-4" />,
      });
    }

    if (jobOrder?.sourceJob) {
      objects.push({
        id: jobOrder.sourceJob.id,
        type: 'Job',
        title: jobOrder.sourceJob.title,
        href: `/employee/workspace/jobs/${jobOrder.sourceJob.id}`,
        icon: <Briefcase className="w-4 h-4" />,
      });
    }

    return objects;
  }, [jobOrder]);

  // Loading state
  if (jobOrderLoading || contextLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rust" />
      </div>
    );
  }

  // Error state
  if (error || !jobOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium">Job Order not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const statusConfig = JOB_ORDER_STATUSES[jobOrder.status as keyof typeof JOB_ORDER_STATUSES] ||
    { label: jobOrder.status, color: 'bg-stone-100 text-stone-600' };

  const isActive = jobOrder.status === 'active' || jobOrder.status === 'pending';

  return (
    <>
      <WorkspaceLayout
        title={jobOrder.title}
        subtitle={jobOrder.account?.name || jobOrder.orderNumber || undefined}
        backHref="/employee/workspace/job-orders"
        backLabel="Job Orders"
        status={{
          label: statusConfig.label,
          color: statusConfig.color,
        }}
        entityType="job_order"
        entityId={jobOrderId}
        canEdit={canEdit}
        canDelete={canDelete}
        primaryAction={isActive ? {
          label: 'Submit Candidate',
          icon: <UserPlus className="w-4 h-4 mr-1" />,
          onClick: () => {},
        } : undefined}
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
        activityPanel={<ActivityPanel entityType="job_order" entityId={jobOrderId} canEdit={canEdit} />}
        onDelete={() => {
          if (window.confirm('Are you sure you want to delete this job order?')) {
            // Handle delete
          }
        }}
      />

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Job Order Status</DialogTitle>
            <DialogDescription>
              Change the status of this job order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select defaultValue={jobOrder.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(JOB_ORDER_STATUSES).map(([key, config]) => (
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

export default JobOrdersWorkspace;
