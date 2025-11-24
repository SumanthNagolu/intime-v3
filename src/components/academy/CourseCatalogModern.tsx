/**
 * Course Catalog Modern Component
 * Design System V2 (Ivory/Forest/Rust)
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react';
import type { Course } from '@/types/academy';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface CourseCatalogModernProps {
  initialCourses: Course[];
}

export function CourseCatalogModern({ initialCourses }: CourseCatalogModernProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic (Search only)
  const filteredCourses = initialCourses.filter((course) => {
    const query = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query) ||
      course.subtitle?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 font-body">
      {/* Header Section */}
      <div className="relative bg-white rounded-2xl p-8 border border-gray-200 shadow-sm overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-heading font-bold text-charcoal mb-3 tracking-tight">
            Master the Future of Staffing
          </h1>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed font-body">
            Professional training designed for the modern era. Combine human expertise with AI capability.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for courses, skills, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-forest-500 focus:ring-forest-500 rounded-xl text-base transition-all"
            />
          </div>
        </div>
        
        {/* Subtle Background Decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-forest-50 to-white opacity-50 pointer-events-none" />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-gray-500">
          {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'} Available
        </p>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-charcoal mb-1">No courses found</h3>
          <p className="text-gray-500">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="group flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-elevation-md hover:border-forest-200 transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-forest-50 to-forest-100">
                    <Sparkles className="w-12 h-12 text-forest-200" />
                  </div>
                )}
                {course.is_featured && (
                  <Badge className="absolute top-4 right-4 bg-white/90 text-forest-700 hover:bg-white border-0 shadow-sm backdrop-blur-sm">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col">
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-3 bg-forest-50 text-forest-700 hover:bg-forest-100 border-0 rounded-full px-3 py-1 text-xs uppercase tracking-wide font-semibold">
                    {course.skill_level}
                  </Badge>
                  <h3 className="text-xl font-heading font-bold text-charcoal mb-2 group-hover:text-forest-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  {course.subtitle && (
                    <p className="text-sm text-gray-500 line-clamp-2">{course.subtitle}</p>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500 font-medium">
                    <Clock className="w-4 h-4 mr-2 text-forest-400" />
                    {course.estimated_duration_weeks} weeks
                  </div>
                  <div className="flex items-center text-sm text-gray-500 font-medium">
                    <BookOpen className="w-4 h-4 mr-2 text-forest-400" />
                    {course.total_modules} modules
                  </div>
                </div>

                <div className="mt-auto">
                  <Link href={`/students/courses/${course.slug}`} className="block">
                    <Button className="w-full bg-white text-charcoal border border-gray-200 hover:bg-forest-50 hover:border-forest-300 hover:text-forest-700 group-hover:border-forest-200 transition-all shadow-sm font-medium h-11 rounded-lg">
                      View Course
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
