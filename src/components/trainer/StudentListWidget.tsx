/**
 * Student List Widget
 * Story: ACAD-025
 *
 * Browse all students with filtering and progress tracking
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Search,
  Filter,
  Mail,
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

export function StudentListWidget() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'dropped'>('all');

  const { data: enrollments, isLoading } = trpc.enrollment.getCourseEnrollments.useQuery({
    courseId: undefined, // All courses
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const filteredStudents = enrollments?.filter((enrollment: any) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      enrollment.user?.full_name?.toLowerCase().includes(searchLower) ||
      enrollment.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              <Filter className="h-4 w-4 mr-2" />
              All
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('completed')}
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === 'dropped' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('dropped')}
            >
              Dropped
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredStudents?.length || 0} of {enrollments?.length || 0} students
        </p>
      </div>

      {/* Student List */}
      {filteredStudents && filteredStudents.length > 0 ? (
        <div className="space-y-4">
          {filteredStudents.map((enrollment: any) => {
            const statusColors: Record<string, string> = {
              active: 'default',
              completed: 'secondary',
              dropped: 'outline',
              pending: 'secondary',
            };

            return (
              <Card key={enrollment.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {enrollment.user?.full_name || 'Unknown Student'}
                        </h3>
                        <p className="text-sm text-gray-600">{enrollment.user?.email}</p>
                      </div>
                      <Badge variant={statusColors[enrollment.status] as any}>
                        {enrollment.status}
                      </Badge>
                    </div>

                    {/* Course Info */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">{enrollment.course?.title || 'Unknown Course'}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <TrendingUp className="h-4 w-4" />
                          <span>Progress</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {enrollment.completion_percentage || 0}%
                        </span>
                      </div>
                      <Progress value={enrollment.completion_percentage || 0} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-sm">
                        <p className="text-gray-600 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Enrolled
                        </p>
                        <p className="font-medium text-gray-900">
                          {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                      {enrollment.completed_at && (
                        <div className="text-sm">
                          <p className="text-gray-600 flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            Completed
                          </p>
                          <p className="font-medium text-gray-900">
                            {new Date(enrollment.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <Link href={`mailto:${enrollment.user?.email}`}>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      </Link>
                      <Link href={`/trainer/students/${enrollment.user_id}`}>
                        <Button variant="outline" size="sm">
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria.
          </p>
        </Card>
      )}
    </div>
  );
}
