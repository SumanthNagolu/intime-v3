'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Search, Clock, Star, GraduationCap } from 'lucide-react'

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

export default function CourseCatalogPage() {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<string | undefined>()

  const { data, isLoading } = trpc.academy.getCourses.useQuery({
    search: search || undefined,
    difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced' | undefined,
    limit: 20,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal-900">Course Catalog</h1>
        <p className="text-charcoal-500 mt-1">Explore our training courses and start learning</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={difficulty === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDifficulty(undefined)}
          >
            All Levels
          </Button>
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <Button
              key={level}
              variant={difficulty === level ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficulty(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : data?.courses && data.courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {data.courses.map((course: any) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-32 bg-gradient-to-br from-hublot-900 to-charcoal-700 flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-white/50" />
              </div>
              <CardContent className="p-4">
                <Badge className={difficultyColors[course.difficulty] || 'bg-charcoal-100'}>
                  {course.difficulty}
                </Badge>
                <h3 className="font-heading font-bold text-lg mt-2 text-charcoal-900">
                  {course.title}
                </h3>
                <p className="text-sm text-charcoal-500 mt-1 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-charcoal-100">
                  <div className="flex items-center gap-4 text-sm text-charcoal-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration_hours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gold-500" />
                      {course.xp_reward} XP
                    </span>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/training/courses/${course.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="w-12 h-12 text-charcoal-300 mb-4" />
            <p className="text-charcoal-500">No courses found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
