'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PipelineStage } from '../types';
import { formatPercentage } from '../types';

interface PipelineFunnelCardProps {
  title?: string;
  stages: PipelineStage[];
  onStageClick?: (stage: PipelineStage) => void;
  className?: string;
}

const STAGE_COLORS = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-emerald-500',
];

export function PipelineFunnelCard({
  title = 'Pipeline',
  stages,
  onStageClick,
  className,
}: PipelineFunnelCardProps) {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Funnel visualization */}
        <div className="space-y-2">
          {stages.map((stage, index) => {
            const widthPercent = (stage.count / maxCount) * 100;
            const color = STAGE_COLORS[index % STAGE_COLORS.length];

            return (
              <div
                key={stage.id}
                className={cn(
                  'transition-all',
                  onStageClick && 'cursor-pointer hover:opacity-80'
                )}
                onClick={() => onStageClick?.(stage)}
              >
                {/* Stage bar */}
                <div className="flex items-center gap-2">
                  <div className="w-24 text-right">
                    <span className="text-xs text-charcoal-500 truncate">
                      {stage.name}
                    </span>
                  </div>
                  <div className="flex-1 h-7 bg-charcoal-100 rounded overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded flex items-center justify-end px-2 transition-all duration-500',
                        color
                      )}
                      style={{ width: `${Math.max(widthPercent, 5)}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {stage.count}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Conversion rate */}
                {stage.conversionRate !== undefined && index < stages.length - 1 && (
                  <div className="flex items-center gap-2 mt-0.5 mb-1">
                    <div className="w-24" />
                    <div className="flex-1 flex items-center">
                      <div className="h-4 w-px bg-charcoal-200 ml-4" />
                      <span className="ml-2 text-[10px] text-charcoal-400">
                        {formatPercentage(stage.conversionRate, 0)} conversion
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-charcoal-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-charcoal-900">
              {stages.reduce((sum, s) => sum + s.count, 0)}
            </p>
            <p className="text-xs text-charcoal-500">Total in pipeline</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-charcoal-900">
              {stages.length > 0 && stages[stages.length - 1].count}
            </p>
            <p className="text-xs text-charcoal-500">
              {stages.length > 0 && stages[stages.length - 1].name}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PipelineFunnelCard;
