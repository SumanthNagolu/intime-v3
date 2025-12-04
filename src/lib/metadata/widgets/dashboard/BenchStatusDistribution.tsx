'use client';

/**
 * Bench Status Distribution Widget
 *
 * Shows a donut chart and breakdown of bench consultants by days on bench
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface StatusDistribution {
  green: number;
  yellow: number;
  orange: number;
  red: number;
  black: number;
}

interface BenchHealthData {
  statusDistribution?: StatusDistribution;
  totalConsultants?: number;
}

const STATUS_CONFIG = [
  { key: 'green', label: 'Green (0-15 days)', color: '#22c55e', description: 'Newly on bench' },
  { key: 'yellow', label: 'Yellow (16-30 days)', color: '#eab308', description: 'Active marketing' },
  { key: 'orange', label: 'Orange (31-60 days)', color: '#f97316', description: 'Needs attention' },
  { key: 'red', label: 'Red (61-90 days)', color: '#ef4444', description: 'Critical' },
  { key: 'black', label: 'Black (91+ days)', color: '#374151', description: 'Long-term bench' },
];

function DonutChart({ data }: { data: StatusDistribution }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  // Calculate percentages and create segments
  let currentAngle = 0;
  const segments = STATUS_CONFIG.map((config) => {
    const value = data[config.key as keyof StatusDistribution] || 0;
    const percentage = (value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...config, value, percentage, startAngle, endAngle: currentAngle };
  }).filter((s) => s.value > 0);

  // Create SVG path for each segment
  const createArcPath = (startAngle: number, endAngle: number, radius: number, innerRadius: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = 50 + radius * Math.cos(startRad);
    const y1 = 50 + radius * Math.sin(startRad);
    const x2 = 50 + radius * Math.cos(endRad);
    const y2 = 50 + radius * Math.sin(endRad);

    const x3 = 50 + innerRadius * Math.cos(endRad);
    const y3 = 50 + innerRadius * Math.sin(endRad);
    const x4 = 50 + innerRadius * Math.cos(startRad);
    const y4 = 50 + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32">
      {segments.map((segment, i) => (
        <path
          key={segment.key}
          d={createArcPath(segment.startAngle, segment.endAngle, 45, 25)}
          fill={segment.color}
          className="transition-all hover:opacity-80 cursor-pointer"
        />
      ))}
      <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-charcoal-900">
        {total}
      </text>
    </svg>
  );
}

export function BenchStatusDistribution({ definition, data, context }: SectionWidgetProps) {
  const benchHealth = data as BenchHealthData | undefined;
  const distribution = benchHealth?.statusDistribution;
  const isLoading = context?.isLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-6 w-48 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 bg-stone-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 bg-stone-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const defaultDistribution: StatusDistribution = { green: 0, yellow: 0, orange: 0, red: 0, black: 0 };
  const statusData = distribution || defaultDistribution;
  const total = Object.values(statusData).reduce((a, b) => a + b, 0);

  return (
    <Card className="border-charcoal-100">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
          {(typeof definition.title === 'string' ? definition.title : 'Bench Status Distribution') || 'Bench Status Distribution'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-8">
          <div className="flex-shrink-0">
            {total > 0 ? (
              <DonutChart data={statusData} />
            ) : (
              <div className="w-32 h-32 rounded-full bg-charcoal-100 flex items-center justify-center">
                <span className="text-charcoal-400 text-sm">No data</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            {STATUS_CONFIG.map((config) => {
              const value = statusData[config.key as keyof StatusDistribution] || 0;
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={config.key} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-charcoal-700 truncate">
                        {config.label}
                      </span>
                      <span className="text-sm font-bold text-charcoal-900 ml-2">
                        {value}
                      </span>
                    </div>
                    <div className="w-full bg-charcoal-100 rounded-full h-1.5 mt-1">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${percentage}%`, backgroundColor: config.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BenchStatusDistribution;
