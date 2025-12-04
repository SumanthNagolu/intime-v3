'use client';

/**
 * Work History Timeline Widget
 *
 * Displays a vertical timeline of work history with job entries,
 * company details, and expandable information.
 */

import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface WorkHistoryEntry {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description?: string;
  skills?: string[];
  achievements?: string[];
  companyLogo?: string;
}

interface TimelineEntryProps {
  entry: WorkHistoryEntry;
  isFirst: boolean;
  isLast: boolean;
  showDuration?: boolean;
  showSkills?: boolean;
}

function calculateDuration(startDate: string, endDate: string | null): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} mo`;
  } else if (remainingMonths === 0) {
    return `${years} yr`;
  } else {
    return `${years} yr ${remainingMonths} mo`;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function TimelineEntry({ entry, isFirst, isLast, showDuration, showSkills }: TimelineEntryProps) {
  const [isExpanded, setIsExpanded] = useState(isFirst);
  const duration = calculateDuration(entry.startDate, entry.endDate);
  const hasExpandableContent = entry.description || (entry.achievements && entry.achievements.length > 0);

  return (
    <div className="relative flex gap-4">
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div className={cn(
          'w-4 h-4 rounded-full border-2 z-10 flex-shrink-0',
          entry.current
            ? 'border-forest-500 bg-forest-500'
            : 'border-charcoal-300 bg-white'
        )}>
          {entry.current && (
            <div className="w-full h-full rounded-full animate-ping bg-forest-400 opacity-75" />
          )}
        </div>
        {/* Line */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-charcoal-200 -mt-1" />
        )}
      </div>

      {/* Content */}
      <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
        <div
          className={cn(
            'bg-white border rounded-lg p-4 transition-shadow',
            entry.current ? 'border-forest-200 shadow-sm' : 'border-charcoal-100',
            hasExpandableContent && 'cursor-pointer hover:shadow-md'
          )}
          onClick={() => hasExpandableContent && setIsExpanded(!isExpanded)}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {/* Company Logo */}
              <div className="w-10 h-10 bg-charcoal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {entry.companyLogo ? (
                  <img
                    src={entry.companyLogo}
                    alt={entry.company}
                    className="w-full h-full rounded-lg object-contain"
                  />
                ) : (
                  <Building2 className="w-5 h-5 text-charcoal-500" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-charcoal-900">{entry.title}</h4>
                  {entry.current && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-forest-100 text-forest-700 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-charcoal-600">{entry.company}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {entry.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(entry.startDate)} - {entry.endDate ? formatDate(entry.endDate) : 'Present'}
                  </span>
                  {showDuration && (
                    <span className="text-charcoal-400">({duration})</span>
                  )}
                </div>
              </div>
            </div>

            {hasExpandableContent && (
              <button className="p-1 rounded hover:bg-charcoal-50">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-charcoal-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-charcoal-400" />
                )}
              </button>
            )}
          </div>

          {/* Expanded Content */}
          {isExpanded && hasExpandableContent && (
            <div className="mt-4 pt-4 border-t border-charcoal-100 space-y-3">
              {entry.description && (
                <p className="text-sm text-charcoal-600">{entry.description}</p>
              )}

              {entry.achievements && entry.achievements.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Key Achievements
                  </h5>
                  <ul className="space-y-1">
                    {entry.achievements.map((achievement, i) => (
                      <li key={i} className="text-sm text-charcoal-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-forest-500 mt-1.5 flex-shrink-0" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showSkills && entry.skills && entry.skills.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Code className="w-3 h-3" />
                    Skills Used
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {entry.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-charcoal-100 text-charcoal-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mock data
const MOCK_WORK_HISTORY: WorkHistoryEntry[] = [
  {
    id: '1',
    company: 'TechCorp Inc.',
    title: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    startDate: '2022-06-01',
    endDate: null,
    current: true,
    description: 'Leading development of cloud-native applications and microservices architecture.',
    skills: ['React', 'Node.js', 'AWS', 'Kubernetes', 'TypeScript'],
    achievements: [
      'Led migration of monolith to microservices, improving deployment frequency by 300%',
      'Mentored team of 5 junior developers',
      'Implemented CI/CD pipeline reducing release time from days to hours',
    ],
  },
  {
    id: '2',
    company: 'StartupXYZ',
    title: 'Full Stack Developer',
    location: 'Austin, TX',
    startDate: '2020-03-01',
    endDate: '2022-05-31',
    current: false,
    description: 'Built and maintained customer-facing web applications.',
    skills: ['Vue.js', 'Python', 'PostgreSQL', 'Docker'],
    achievements: [
      'Developed payment processing system handling $2M+ monthly transactions',
      'Reduced page load time by 40% through optimization',
    ],
  },
  {
    id: '3',
    company: 'Enterprise Solutions',
    title: 'Junior Developer',
    location: 'Chicago, IL',
    startDate: '2018-07-01',
    endDate: '2020-02-28',
    current: false,
    description: 'Worked on enterprise resource planning software.',
    skills: ['Java', 'Spring Boot', 'Angular', 'Oracle DB'],
    achievements: [
      'Contributed to core billing module used by 500+ clients',
    ],
  },
];

export function WorkHistoryTimeline({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;

  const props = definition.componentProps as {
    dataPath?: string;
    showDuration?: boolean;
    showSkills?: boolean;
  } | undefined;

  const showDuration = props?.showDuration ?? true;
  const showSkills = props?.showSkills ?? true;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-4 h-4 rounded-full bg-stone-200 animate-pulse" />
            <div className="flex-1 h-24 bg-stone-100 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Get work history from data or use mock data
  const workHistory = (data as { workHistory?: WorkHistoryEntry[] })?.workHistory || MOCK_WORK_HISTORY;

  // Sort by start date descending (most recent first)
  const sortedHistory = [...workHistory].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Calculate total experience
  const totalMonths = sortedHistory.reduce((total, entry) => {
    const start = new Date(entry.startDate);
    const end = entry.endDate ? new Date(entry.endDate) : new Date();
    return total + (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  }, 0);
  const totalYears = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-charcoal-100">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-forest-600" />
          <span className="font-medium text-charcoal-900">Work Experience</span>
        </div>
        <span className="text-sm text-charcoal-500">
          {totalYears > 0 && `${totalYears} years `}
          {remainingMonths > 0 && `${remainingMonths} months`}
          {' '}total experience
        </span>
      </div>

      {/* Timeline */}
      <div>
        {sortedHistory.length > 0 ? (
          sortedHistory.map((entry, index) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              isFirst={index === 0}
              isLast={index === sortedHistory.length - 1}
              showDuration={showDuration}
              showSkills={showSkills}
            />
          ))
        ) : (
          <div className="py-8 text-center border border-dashed border-charcoal-200 rounded-lg">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-charcoal-300" />
            <p className="text-sm text-charcoal-500">No work history available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkHistoryTimeline;
