'use client';

/**
 * Learning Admin Panel Widget
 *
 * Displays course management, enrollment stats, and completion rates.
 * Provides quick actions for course administration.
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Play,
  Pause,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Plus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface Course {
  id: string;
  title: string;
  category: string;
  enrollments: number;
  completions: number;
  avgScore: number;
  duration: string;
  status: 'active' | 'draft' | 'archived';
  mandatory: boolean;
}

interface CourseRowProps {
  course: Course;
  onAction?: (action: string, courseId: string) => void;
}

function CourseRow({ course, onAction }: CourseRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const completionRate = course.enrollments > 0
    ? Math.round((course.completions / course.enrollments) * 100)
    : 0;

  const statusColors = {
    active: 'bg-success-100 text-success-700',
    draft: 'bg-gold-100 text-gold-700',
    archived: 'bg-charcoal-100 text-charcoal-600',
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-charcoal-25 transition-colors border-b border-charcoal-50 last:border-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 bg-forest-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-forest-600" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-charcoal-900 truncate">{course.title}</p>
            {course.mandatory && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-error-100 text-error-700 rounded">
                Required
              </span>
            )}
          </div>
          <p className="text-sm text-charcoal-500">{course.category} • {course.duration}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Enrollment Stats */}
        <div className="text-center">
          <p className="text-sm font-medium text-charcoal-900">{course.enrollments}</p>
          <p className="text-xs text-charcoal-500">Enrolled</p>
        </div>

        {/* Completion Rate */}
        <div className="w-24">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-charcoal-500">Completion</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                completionRate >= 80 ? 'bg-success-500' :
                completionRate >= 50 ? 'bg-gold-500' : 'bg-error-500'
              )}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Avg Score */}
        <div className="text-center w-16">
          <p className="text-sm font-medium text-charcoal-900">{course.avgScore}%</p>
          <p className="text-xs text-charcoal-500">Avg Score</p>
        </div>

        {/* Status */}
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full capitalize',
          statusColors[course.status]
        )}>
          {course.status}
        </span>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded hover:bg-charcoal-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-charcoal-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-charcoal-100 rounded-lg shadow-lg z-10">
              <button
                onClick={() => { onAction?.('view', course.id); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
              >
                <Eye className="w-4 h-4" /> View
              </button>
              <button
                onClick={() => { onAction?.('edit', course.id); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => { onAction?.('toggle', course.id); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
              >
                {course.status === 'active' ? (
                  <><Pause className="w-4 h-4" /> Deactivate</>
                ) : (
                  <><Play className="w-4 h-4" /> Activate</>
                )}
              </button>
              <button
                onClick={() => { onAction?.('delete', course.id); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error-600 hover:bg-error-50"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mock data
const MOCK_COURSES: Course[] = [
  { id: '1', title: 'Onboarding Essentials', category: 'Compliance', enrollments: 45, completions: 42, avgScore: 94, duration: '2h', status: 'active', mandatory: true },
  { id: '2', title: 'Security Awareness', category: 'Compliance', enrollments: 120, completions: 98, avgScore: 87, duration: '1h', status: 'active', mandatory: true },
  { id: '3', title: 'Leadership Fundamentals', category: 'Development', enrollments: 28, completions: 15, avgScore: 91, duration: '4h', status: 'active', mandatory: false },
  { id: '4', title: 'Technical Writing', category: 'Skills', enrollments: 15, completions: 8, avgScore: 88, duration: '3h', status: 'draft', mandatory: false },
  { id: '5', title: 'Project Management', category: 'Development', enrollments: 35, completions: 22, avgScore: 85, duration: '6h', status: 'active', mandatory: false },
];

const MOCK_STATS = {
  totalCourses: 24,
  activeLearners: 156,
  completionsThisMonth: 89,
  avgCompletionRate: 78,
};

export function LearningAdminPanel({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const props = definition.componentProps as {
    showCatalog?: boolean;
    showAssignments?: boolean;
    showProgress?: boolean;
  } | undefined;

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
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const courses = (data as { courses?: Course[] })?.courses || MOCK_COURSES;
  const stats = (data as { stats?: typeof MOCK_STATS })?.stats || MOCK_STATS;

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (action: string, courseId: string) => {
    console.log(`Action: ${action} on course ${courseId}`);
  };

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-forest rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                Course Management
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                {stats.totalCourses} courses • {stats.activeLearners} active learners
              </p>
            </div>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Course
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-charcoal-25 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-charcoal-900">{stats.totalCourses}</p>
            <p className="text-xs text-charcoal-500">Total Courses</p>
          </div>
          <div className="bg-forest-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-forest-700">{stats.activeLearners}</p>
            <p className="text-xs text-forest-600">Active Learners</p>
          </div>
          <div className="bg-gold-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gold-700">{stats.completionsThisMonth}</p>
            <p className="text-xs text-gold-600">Completions (Month)</p>
          </div>
          <div className="bg-info-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-info-700">{stats.avgCompletionRate}%</p>
            <p className="text-xs text-info-600">Avg Completion Rate</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-charcoal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-charcoal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Course List */}
        <div className="border border-charcoal-100 rounded-lg overflow-hidden">
          <div className="bg-charcoal-50 px-4 py-2 text-xs font-medium text-charcoal-600 flex items-center gap-6">
            <span className="flex-1">Course</span>
            <span className="w-16 text-center">Enrolled</span>
            <span className="w-24 text-center">Completion</span>
            <span className="w-16 text-center">Score</span>
            <span className="w-20 text-center">Status</span>
            <span className="w-8"></span>
          </div>
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <CourseRow key={course.id} course={course} onAction={handleAction} />
            ))
          ) : (
            <div className="py-8 text-center text-charcoal-500">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No courses found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default LearningAdminPanel;
