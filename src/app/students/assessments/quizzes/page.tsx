/**
 * Quiz Listing Page
 * Story: ACAD-011
 *
 * Lists all available quizzes
 */

import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Clock, CheckCircle2, Lock } from 'lucide-react';

export default async function QuizzesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // TODO: Fetch quizzes (ACAD-011)
  // For now, show placeholder

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link
          href="/students/assessments"
          className="text-gray-600 hover:text-black mb-4 inline-block"
        >
          ← Back to Assessments
        </Link>
      </div>

      <div className="mb-12">
        <h1 className="text-6xl font-bold text-black mb-4">Quizzes</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Test your knowledge and track your progress
        </p>
      </div>

      <Card className="p-12 text-center bg-white border-2 border-gray-200">
        <p className="text-xl text-gray-700 mb-4">No quizzes available yet</p>
        <p className="text-gray-600">Quizzes will appear here as you progress through courses</p>
      </Card>
    </div>
  );
}

