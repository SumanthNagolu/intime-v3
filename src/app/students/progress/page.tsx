/**
 * Progress Tracking Page
 * Story: ACAD-003
 *
 * Shows student progress across all enrolled courses
 */

import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // TODO: Implement progress tracking queries (ACAD-003)
  // For now, show placeholder data

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-12">
        <h1 className="text-6xl font-bold text-black mb-4">My Progress</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="p-6 bg-white border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-black">Enrolled Courses</h3>
          </div>
          <p className="text-4xl font-bold text-black">0</p>
        </Card>

        <Card className="p-6 bg-white border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-black">Completed Topics</h3>
          </div>
          <p className="text-4xl font-bold text-black">0</p>
        </Card>

        <Card className="p-6 bg-white border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-black">Study Time</h3>
          </div>
          <p className="text-4xl font-bold text-black">0h</p>
          <p className="text-sm text-gray-600 mt-2">This week</p>
        </Card>

        <Card className="p-6 bg-white border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-black">Completion Rate</h3>
          </div>
          <p className="text-4xl font-bold text-black">0%</p>
        </Card>
      </div>

      {/* Course Progress */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-black mb-6">Course Progress</h2>
        <Card className="p-12 text-center bg-white border-2 border-gray-200">
          <p className="text-xl text-gray-700 mb-4">No enrolled courses</p>
          <p className="text-gray-600 mb-6">Enroll in a course to start tracking your progress</p>
          <Link href="/students/courses">
            <Button className="bg-black text-white hover:bg-gray-800">
              Browse Courses
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-4xl font-bold text-black mb-6">Recent Activity</h2>
        <Card className="p-12 text-center bg-white border-2 border-gray-200">
          <p className="text-xl text-gray-700">No recent activity</p>
        </Card>
      </div>
    </div>
  );
}

