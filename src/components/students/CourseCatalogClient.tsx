/**
 * Course Catalog Client Component
 * 
 * Handles client-side filtering and search
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { Course } from '@/types/academy';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CourseCatalogClientProps {
  initialCourses: Course[];
}

export function CourseCatalogClient({ initialCourses }: CourseCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');

  const filteredCourses = initialCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkill = skillFilter === 'all' || course.skill_level === skillFilter;

    return matchesSearch && matchesSkill;
  });

  return (
    <div className="mb-8">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-2 border-gray-300 focus:border-black"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={skillFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setSkillFilter('all')}
            className={skillFilter === 'all' ? 'bg-black text-white' : 'border-2 border-gray-300'}
          >
            All
          </Button>
          <Button
            variant={skillFilter === 'beginner' ? 'default' : 'outline'}
            onClick={() => setSkillFilter('beginner')}
            className={skillFilter === 'beginner' ? 'bg-black text-white' : 'border-2 border-gray-300'}
          >
            Beginner
          </Button>
          <Button
            variant={skillFilter === 'intermediate' ? 'default' : 'outline'}
            onClick={() => setSkillFilter('intermediate')}
            className={skillFilter === 'intermediate' ? 'bg-black text-white' : 'border-2 border-gray-300'}
          >
            Intermediate
          </Button>
          <Button
            variant={skillFilter === 'advanced' ? 'default' : 'outline'}
            onClick={() => setSkillFilter('advanced')}
            className={skillFilter === 'advanced' ? 'bg-black text-white' : 'border-2 border-gray-300'}
          >
            Advanced
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-600 mb-4">
        Showing {filteredCourses.length} of {initialCourses.length} courses
      </p>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="p-12 text-center bg-white border-2 border-gray-200">
          <p className="text-xl text-gray-700 mb-4">No courses found</p>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="p-6 bg-white border-2 border-gray-200 hover:border-black transition-colors"
            >
              {course.thumbnail_url && (
                <div className="mb-4 aspect-video bg-gray-100 border-2 border-gray-200">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                  {course.skill_level}
                </span>
                {course.is_featured && (
                  <span className="px-3 py-1 text-xs font-medium bg-black text-white">
                    Featured
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">{course.title}</h3>
              {course.subtitle && (
                <p className="text-gray-600 mb-3">{course.subtitle}</p>
              )}
              <p className="text-gray-700 mb-6 line-clamp-3">{course.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  <span>{course.total_modules} modules</span>
                  <span className="mx-2">•</span>
                  <span>{course.estimated_duration_weeks} weeks</span>
                </div>
              </div>
              {(course.price_monthly || course.price_one_time) && (
                <div className="mb-4 text-sm">
                  {course.price_monthly && (
                    <span className="font-semibold text-black">
                      ${course.price_monthly}/month
                    </span>
                  )}
                  {course.price_one_time && (
                    <span className="font-semibold text-black ml-2">
                      ${course.price_one_time} one-time
                    </span>
                  )}
                </div>
              )}
              <Link href={`/students/courses/${course.slug}`}>
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  View Course
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

