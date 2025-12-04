'use client';

/**
 * Recruitment Workflow Widget
 *
 * Displays internal hiring pipeline with requisitions, candidates,
 * screening, and onboarding stages.
 */

import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  UserCheck,
  ClipboardCheck,
  ChevronRight,
  Clock,
  MapPin,
  Building2,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  UserPlus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface Requisition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  priority: 'high' | 'medium' | 'low';
  openDate: string;
  candidates: number;
  stage: 'open' | 'screening' | 'interviewing' | 'offer' | 'filled';
}

interface Candidate {
  id: string;
  name: string;
  role: string;
  stage: 'new' | 'screening' | 'interview' | 'offer' | 'hired';
  appliedDate: string;
  rating: number;
  source: string;
}

const TABS = ['Requisitions', 'Candidates', 'Screening', 'Onboarding'];

const STAGE_COLORS = {
  open: 'bg-info-100 text-info-700',
  screening: 'bg-gold-100 text-gold-700',
  interviewing: 'bg-forest-100 text-forest-700',
  offer: 'bg-purple-100 text-purple-700',
  filled: 'bg-success-100 text-success-700',
};

const PRIORITY_COLORS = {
  high: 'bg-error-100 text-error-700',
  medium: 'bg-gold-100 text-gold-700',
  low: 'bg-charcoal-100 text-charcoal-600',
};

// Mock data
const MOCK_REQUISITIONS: Requisition[] = [
  { id: '1', title: 'Senior Software Engineer', department: 'Engineering', location: 'Remote', type: 'full-time', priority: 'high', openDate: '2024-01-15', candidates: 12, stage: 'interviewing' },
  { id: '2', title: 'Product Manager', department: 'Product', location: 'New York', type: 'full-time', priority: 'high', openDate: '2024-01-20', candidates: 8, stage: 'screening' },
  { id: '3', title: 'UX Designer', department: 'Design', location: 'San Francisco', type: 'full-time', priority: 'medium', openDate: '2024-01-25', candidates: 15, stage: 'open' },
  { id: '4', title: 'DevOps Engineer', department: 'Engineering', location: 'Remote', type: 'contract', priority: 'medium', openDate: '2024-02-01', candidates: 6, stage: 'offer' },
];

const MOCK_CANDIDATES: Candidate[] = [
  { id: '1', name: 'John Smith', role: 'Senior Software Engineer', stage: 'interview', appliedDate: '2024-01-18', rating: 4, source: 'LinkedIn' },
  { id: '2', name: 'Sarah Johnson', role: 'Product Manager', stage: 'screening', appliedDate: '2024-01-22', rating: 5, source: 'Referral' },
  { id: '3', name: 'Mike Chen', role: 'UX Designer', stage: 'new', appliedDate: '2024-01-28', rating: 3, source: 'Indeed' },
  { id: '4', name: 'Emily Davis', role: 'DevOps Engineer', stage: 'offer', appliedDate: '2024-02-05', rating: 5, source: 'Direct' },
];

function RequisitionCard({ req }: { req: Requisition }) {
  return (
    <div className="border border-charcoal-100 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-charcoal-900">{req.title}</h4>
          <div className="flex items-center gap-2 mt-1 text-sm text-charcoal-500">
            <Building2 className="w-3.5 h-3.5" />
            <span>{req.department}</span>
            <span>•</span>
            <MapPin className="w-3.5 h-3.5" />
            <span>{req.location}</span>
          </div>
        </div>
        <button className="p-1 rounded hover:bg-charcoal-50">
          <MoreVertical className="w-4 h-4 text-charcoal-400" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize', STAGE_COLORS[req.stage])}>
          {req.stage}
        </span>
        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize', PRIORITY_COLORS[req.priority])}>
          {req.priority}
        </span>
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-charcoal-100 text-charcoal-600 capitalize">
          {req.type}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-charcoal-500">
          <Users className="w-4 h-4" />
          <span>{req.candidates} candidates</span>
        </div>
        <div className="flex items-center gap-1 text-charcoal-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{req.openDate}</span>
        </div>
      </div>
    </div>
  );
}

function CandidateRow({ candidate }: { candidate: Candidate }) {
  const stageColors = {
    new: 'bg-info-100 text-info-700',
    screening: 'bg-gold-100 text-gold-700',
    interview: 'bg-forest-100 text-forest-700',
    offer: 'bg-purple-100 text-purple-700',
    hired: 'bg-success-100 text-success-700',
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-charcoal-25 transition-colors border-b border-charcoal-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-forest-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-forest-700">
            {candidate.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <p className="font-medium text-charcoal-900">{candidate.name}</p>
          <p className="text-sm text-charcoal-500">{candidate.role}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <div
              key={star}
              className={cn(
                'w-3 h-3 rounded-full',
                star <= candidate.rating ? 'bg-gold-400' : 'bg-charcoal-200'
              )}
            />
          ))}
        </div>
        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize', stageColors[candidate.stage])}>
          {candidate.stage}
        </span>
        <span className="text-xs text-charcoal-400">{candidate.source}</span>
        <button className="p-1.5 rounded hover:bg-charcoal-100">
          <Eye className="w-4 h-4 text-charcoal-500" />
        </button>
      </div>
    </div>
  );
}

export function RecruitmentWorkflow({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const props = definition.componentProps as {
    tabs?: string[];
    defaultTab?: string;
    enableAIScreening?: boolean;
    enableCalendarIntegration?: boolean;
  } | undefined;

  const tabs = props?.tabs || TABS;
  const [activeTab, setActiveTab] = useState(props?.defaultTab || tabs[0]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-forest-100 rounded-lg animate-pulse" />
            <div className="h-6 w-48 bg-stone-200 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const requisitions = (data as { requisitions?: Requisition[] })?.requisitions || MOCK_REQUISITIONS;
  const candidates = (data as { candidates?: Candidate[] })?.candidates || MOCK_CANDIDATES;

  const pipelineStats = {
    open: requisitions.filter(r => r.stage === 'open').length,
    screening: requisitions.filter(r => r.stage === 'screening').length,
    interviewing: requisitions.filter(r => r.stage === 'interviewing').length,
    offer: requisitions.filter(r => r.stage === 'offer').length,
  };

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-forest rounded-lg flex items-center justify-center shadow-sm">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                Recruitment Pipeline
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                {requisitions.length} open positions • {candidates.length} active candidates
              </p>
            </div>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New Requisition
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-4 border-b border-charcoal-100 -mb-4 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeTab === tab
                  ? 'text-forest-600 border-forest-500'
                  : 'text-charcoal-500 border-transparent hover:text-charcoal-700'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Pipeline Overview */}
        <div className="flex items-center gap-2 mb-6 p-3 bg-charcoal-25 rounded-lg">
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-info-600">{pipelineStats.open}</p>
            <p className="text-xs text-charcoal-500">Open</p>
          </div>
          <ChevronRight className="w-4 h-4 text-charcoal-300" />
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-gold-600">{pipelineStats.screening}</p>
            <p className="text-xs text-charcoal-500">Screening</p>
          </div>
          <ChevronRight className="w-4 h-4 text-charcoal-300" />
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-forest-600">{pipelineStats.interviewing}</p>
            <p className="text-xs text-charcoal-500">Interviewing</p>
          </div>
          <ChevronRight className="w-4 h-4 text-charcoal-300" />
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-purple-600">{pipelineStats.offer}</p>
            <p className="text-xs text-charcoal-500">Offer</p>
          </div>
        </div>

        {activeTab === 'Requisitions' && (
          <div className="grid grid-cols-2 gap-4">
            {requisitions.map(req => (
              <RequisitionCard key={req.id} req={req} />
            ))}
          </div>
        )}

        {activeTab === 'Candidates' && (
          <div className="border border-charcoal-100 rounded-lg overflow-hidden">
            {candidates.map(candidate => (
              <CandidateRow key={candidate.id} candidate={candidate} />
            ))}
          </div>
        )}

        {(activeTab === 'Screening' || activeTab === 'Onboarding') && (
          <div className="py-12 text-center text-charcoal-400">
            <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">{activeTab} Pipeline</p>
            <p className="text-xs mt-1">Connect to data source to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecruitmentWorkflow;
