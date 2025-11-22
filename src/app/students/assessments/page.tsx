/**
 * Assessments Hub Page
 * Story: ACAD-010, ACAD-011
 *
 * Central hub for quizzes and interview practice
 */

import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, MessageSquare, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

export default async function AssessmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // TODO: Fetch student assessments (ACAD-010, ACAD-011)
  // For now, show placeholder

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-12">
        <h1 className="text-6xl font-bold text-black mb-4">Assessments</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Test your knowledge with quizzes and practice interviews
        </p>
      </div>

      {/* Assessment Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="p-8 bg-white border-2 border-gray-200 hover:border-black transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gray-100 border-2 border-gray-200">
              <FileText className="w-8 h-8 text-gray-700" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-black">Quizzes</h2>
              <p className="text-gray-600">Test your understanding</p>
            </div>
          </div>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Take quizzes to assess your knowledge and track your progress across different topics.
          </p>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-black">0</span> completed
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-black">0</span> available
            </div>
          </div>
          <Link href="/students/assessments/quizzes">
            <Button className="w-full bg-black text-white hover:bg-gray-800">
              View Quizzes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>

        <Card className="p-8 bg-white border-2 border-gray-200 hover:border-black transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gray-100 border-2 border-gray-200">
              <MessageSquare className="w-8 h-8 text-gray-700" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-black">Interview Practice</h2>
              <p className="text-gray-600">Mock interviews with AI</p>
            </div>
          </div>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Practice technical interviews with our AI-powered interview coach using the STAR method.
          </p>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-black">0</span> sessions
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-black">0</span> average score
            </div>
          </div>
          <Link href="/students/assessments/interview">
            <Button className="w-full bg-black text-white hover:bg-gray-800">
              Start Interview
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-4xl font-bold text-black mb-6">Recent Assessments</h2>
        <Card className="p-12 text-center bg-white border-2 border-gray-200">
          <p className="text-xl text-gray-700">No recent assessments</p>
          <p className="text-gray-600 mt-2">Complete quizzes or practice interviews to see your activity here</p>
        </Card>
      </div>
    </div>
  );
}

