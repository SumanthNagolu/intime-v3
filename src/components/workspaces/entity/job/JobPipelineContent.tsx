/**
 * JobPipelineContent Component
 *
 * Visual pipeline showing candidates by stage for a job.
 * Supports both kanban board and list views.
 */

'use client';

import React, { useState } from 'react';
import {
  Users,
  LayoutGrid,
  List,
  ChevronRight,
  MapPin,
  DollarSign,
  GripVertical,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface PipelineCandidate {
  id: string;
  submissionId: string;
  candidateId: string;
  fullName: string;
  initials?: string;
  location?: string | null;
  visa?: string | null;
  hourlyRate?: number | null;
  skills?: string[];
  status: string;
  createdAt?: Date | string | null;
}

export interface PipelineStage {
  key: string;
  label: string;
  color?: string;
}

export interface JobPipelineContentProps {
  candidates: PipelineCandidate[];
  stages?: PipelineStage[];
  onCandidateClick?: (candidate: PipelineCandidate) => void;
  onAddCandidate?: () => void;
  className?: string;
}

// =====================================================
// DEFAULT STAGES
// =====================================================

const DEFAULT_STAGES: PipelineStage[] = [
  { key: 'sourced', label: 'Sourced', color: 'bg-gray-100 text-gray-700' },
  { key: 'screening', label: 'Screening', color: 'bg-blue-100 text-blue-700' },
  { key: 'submitted_to_client', label: 'Submitted', color: 'bg-purple-100 text-purple-700' },
  { key: 'client_review', label: 'Review', color: 'bg-indigo-100 text-indigo-700' },
  { key: 'client_interview', label: 'Interview', color: 'bg-cyan-100 text-cyan-700' },
  { key: 'offer_stage', label: 'Offer', color: 'bg-amber-100 text-amber-700' },
  { key: 'placed', label: 'Placed', color: 'bg-green-100 text-green-700' },
];

// Visa colors
const VISA_COLORS: Record<string, string> = {
  H1B: 'bg-blue-100 text-blue-700',
  GC: 'bg-green-100 text-green-700',
  USC: 'bg-emerald-100 text-emerald-700',
  OPT: 'bg-amber-100 text-amber-700',
  CPT: 'bg-orange-100 text-orange-700',
  TN: 'bg-purple-100 text-purple-700',
  L1: 'bg-indigo-100 text-indigo-700',
  EAD: 'bg-cyan-100 text-cyan-700',
  Other: 'bg-gray-100 text-gray-700',
};

// =====================================================
// CANDIDATE CARD
// =====================================================

function CandidateCard({
  candidate,
  compact = false,
  onClick,
}: {
  candidate: PipelineCandidate;
  compact?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left bg-white rounded-lg border border-stone-200 hover:border-rust/30 hover:shadow-sm transition-all group',
        compact ? 'p-3' : 'p-4'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle (for future drag-drop) */}
        {!compact && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
            <GripVertical className="w-4 h-4 text-stone-300" />
          </div>
        )}

        {/* Avatar */}
        <div
          className={cn(
            'bg-gradient-to-br from-rust/20 to-rust/10 rounded-lg flex items-center justify-center text-rust font-bold flex-shrink-0',
            compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
          )}
        >
          {candidate.initials || candidate.fullName.slice(0, 2).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={cn('font-medium text-charcoal truncate', compact && 'text-sm')}>
            {candidate.fullName}
          </div>
          {!compact && (
            <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
              {candidate.location && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3" /> {candidate.location}
                </span>
              )}
              {candidate.visa && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-bold',
                    VISA_COLORS[candidate.visa] || VISA_COLORS.Other
                  )}
                >
                  {candidate.visa}
                </span>
              )}
              {candidate.hourlyRate && (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />${candidate.hourlyRate}/hr
                </span>
              )}
            </div>
          )}
          {!compact && candidate.skills && candidate.skills.length > 0 && (
            <div className="flex gap-1 mt-2">
              {candidate.skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px]"
                >
                  {skill}
                </span>
              ))}
              {candidate.skills.length > 3 && (
                <span className="text-[10px] text-stone-400">+{candidate.skills.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight
          className={cn(
            'text-stone-300 group-hover:text-rust transition-colors flex-shrink-0',
            compact ? 'w-4 h-4' : 'w-5 h-5'
          )}
        />
      </div>
    </button>
  );
}

// =====================================================
// STAGE COLUMN (KANBAN)
// =====================================================

function StageColumn({
  stage,
  candidates,
  onCandidateClick,
}: {
  stage: PipelineStage;
  candidates: PipelineCandidate[];
  onCandidateClick?: (candidate: PipelineCandidate) => void;
}) {
  return (
    <div className="flex-1 min-w-[200px] max-w-[280px]">
      {/* Stage Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-1 rounded text-xs font-bold', stage.color)}>
            {stage.label}
          </span>
          <span className="text-xs text-stone-400">{candidates.length}</span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-2 min-h-[200px] bg-stone-50/50 rounded-xl p-2 border border-stone-100">
        {candidates.length > 0 ? (
          candidates.map((candidate) => (
            <CandidateCard
              key={candidate.submissionId}
              candidate={candidate}
              compact
              onClick={() => onCandidateClick?.(candidate)}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-[100px] text-xs text-stone-400">
            No candidates
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function JobPipelineContent({
  candidates,
  stages = DEFAULT_STAGES,
  onCandidateClick,
  onAddCandidate,
  className,
}: JobPipelineContentProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Group candidates by stage
  const candidatesByStage = stages.reduce(
    (acc, stage) => {
      acc[stage.key] = candidates.filter((c) => c.status === stage.key);
      return acc;
    },
    {} as Record<string, PipelineCandidate[]>
  );

  // Count totals
  const totalActive = candidates.filter(
    (c) => c.status !== 'rejected' && c.status !== 'withdrawn'
  ).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-charcoal">Candidate Pipeline</h3>
          <Badge variant="secondary" className="text-xs">
            {totalActive} active
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-stone-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'kanban'
                  ? 'bg-white shadow-sm text-charcoal'
                  : 'text-stone-400 hover:text-stone-600'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-charcoal'
                  : 'text-stone-400 hover:text-stone-600'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {onAddCandidate && (
            <Button size="sm" onClick={onAddCandidate}>
              <Users className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
          )}
        </div>
      </div>

      {/* Pipeline View */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <StageColumn
              key={stage.key}
              stage={stage}
              candidates={candidatesByStage[stage.key] || []}
              onCandidateClick={onCandidateClick}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {candidates.length > 0 ? (
            candidates.map((candidate) => {
              const stage = stages.find((s) => s.key === candidate.status);
              return (
                <div key={candidate.submissionId} className="flex items-center gap-4">
                  <CandidateCard
                    candidate={candidate}
                    onClick={() => onCandidateClick?.(candidate)}
                  />
                  {stage && (
                    <Badge
                      variant="secondary"
                      className={cn('flex-shrink-0 text-xs', stage.color)}
                    >
                      {stage.label}
                    </Badge>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
              <Users className="w-12 h-12 mx-auto text-stone-300 mb-4" />
              <h3 className="font-bold text-charcoal mb-2">No Candidates Yet</h3>
              <p className="text-stone-500 text-sm mb-4">
                Attach candidates from your talent pool to start the pipeline
              </p>
              {onAddCandidate && (
                <Button onClick={onAddCandidate}>Attach First Candidate</Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default JobPipelineContent;
