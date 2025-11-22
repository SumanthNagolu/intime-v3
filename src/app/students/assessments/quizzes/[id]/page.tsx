/**
 * Quiz Taking Page
 * Story: ACAD-011
 *
 * Interactive quiz interface
 */

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { QuizTaker } from '@/components/academy/QuizTaker';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function QuizPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // TODO: Fetch quiz data (ACAD-011)
  // For now, show placeholder

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/students/assessments/quizzes"
          className="text-gray-600 hover:text-black mb-4 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quizzes
        </Link>
      </div>

      <Card className="p-12 text-center bg-white border-2 border-gray-200">
        <p className="text-xl text-gray-700 mb-4">Quiz not found</p>
        <p className="text-gray-600">This quiz may not exist or you may not have access to it</p>
      </Card>
    </div>
  );
}

