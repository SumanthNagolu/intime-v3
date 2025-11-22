/**
 * Course Catalog Page
 * Story: ACAD-024
 *
 * Browse all published courses with enrollment options
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Clock,
  Award,
  Star,
  Search,
  Filter,
  ChevronRight,
  Users,
  TrendingUp,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

type SkillLevel = 'all' | 'beginner' | 'intermediate' | 'advanced';

export default function CourseCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('all');

  const { data: courses, isLoading } = trpc.courses.listPublished.useQuery();
  const { data: enrollments } = trpc.enrollment.getMyEnrollments.useQuery();

  // Filter courses based on search and skill level
  const filteredCourses = courses?.filter((course) => {
    const matchesSearch =
      searchQuery === '' ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkill = skillLevel === 'all' || course.skill_level === skillLevel;

    return matchesSearch && matchesSkill;
  });

  // Check if user is enrolled in a course
  const isEnrolled = (courseId: string) => {
    return enrollments?.some((e) => e.course_id === courseId);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Course Catalog</h1>
        <p className="text-lg text-gray-600">
          Discover courses designed to accelerate your Guidewire career
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Skill Level Filter */}
        <div className="flex gap-2">
          <Button
            variant={skillLevel === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSkillLevel('all')}
          >
            <Filter className="h-4 w-4 mr-2" />
            All Levels
          </Button>
          <Button
            variant={skillLevel === 'beginner' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSkillLevel('beginner')}
          >
            Beginner
          </Button>
          <Button
            variant={skillLevel === 'intermediate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSkillLevel('intermediate')}
          >
            Intermediate
          </Button>
          <Button
            variant={skillLevel === 'advanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSkillLevel('advanced')}
          >
            Advanced
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Showing {filteredCourses?.length || 0} of {courses?.length || 0} courses
        </p>
      </div>

      {/* Course Grid */}
      {filteredCourses && filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const enrolled = isEnrolled(course.id);

            return (
              <Card
                key={course.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Course Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-purple-600 to-blue-600 overflow-hidden">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-20 h-20 text-white/30" />
                    </div>
                  )}

                  {/* Skill Level Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant="secondary"
                      className="bg-white/90 text-gray-900 backdrop-blur"
                    >
                      {course.skill_level.charAt(0).toUpperCase() + course.skill_level.slice(1)}
                    </Badge>
                  </div>

                  {/* Featured Badge */}
                  {course.is_featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-yellow-500 text-white border-0">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  {/* Enrolled Badge */}
                  {enrolled && (
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-green-500 text-white border-0">
                        <Award className="h-3 w-3 mr-1" />
                        Enrolled
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {course.title}
                  </h3>

                  {/* Subtitle */}
                  {course.subtitle && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.subtitle}</p>
                  )}

                  {/* Course Stats */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.estimated_duration_weeks} weeks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.total_modules || 0} modules</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{course.total_topics || 0} topics</span>
                    </div>
                  </div>

                  {/* Description Preview */}
                  <p className="text-sm text-gray-700 mb-6 line-clamp-3">
                    {course.description || 'No description available.'}
                  </p>

                  {/* Pricing & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      {course.price_monthly ? (
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            ${course.price_monthly}
                          </p>
                          <p className="text-xs text-gray-500">per month</p>
                        </div>
                      ) : course.price_one_time ? (
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            ${course.price_one_time}
                          </p>
                          <p className="text-xs text-gray-500">one-time</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-2xl font-bold text-green-600">Free</p>
                        </div>
                      )}
                    </div>

                    <Link href={`/students/courses/${course.slug}`}>
                      <Button variant={enrolled ? 'outline' : 'default'}>
                        {enrolled ? (
                          <>
                            Continue
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </>
                        ) : (
                          <>
                            View Course
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h2>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setSkillLevel('all');
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
}
