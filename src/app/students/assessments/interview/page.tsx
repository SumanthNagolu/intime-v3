/**
 * Interview Practice Page
 * Story: ACAD-012
 *
 * AI-powered interview simulator
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default async function InterviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/students/assessments/interview');
  }

  // TODO: Implement interview coach (ACAD-012)
  // Use the API route at /api/students/interview-coach

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/students/assessments"
          className="text-gray-600 hover:text-black mb-4 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assessments
        </Link>
      </div>

      <div className="mb-12">
        <h1 className="text-6xl font-bold text-black mb-4">Interview Practice</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Practice technical interviews with our AI-powered coach using the STAR method
        </p>
      </div>

      <Card className="p-12 bg-white border-2 border-gray-200">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gray-100 border-2 border-gray-200 mb-4">
            <MessageSquare className="w-12 h-12 text-gray-700" />
          </div>
          <h2 className="text-3xl font-bold text-black mb-4">Start Your Interview Session</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            The interview coach will guide you through technical questions and provide feedback on your answers.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border-2 border-gray-200">
            <h3 className="font-semibold text-black mb-2">How it works:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Answer questions using the STAR method (Situation, Task, Action, Result)</li>
              <li>Receive real-time feedback on your responses</li>
              <li>Track your progress and improve over time</li>
            </ul>
          </div>

          <Button className="w-full bg-black text-white hover:bg-gray-800" size="lg">
            Start Interview Session
          </Button>
        </div>
      </Card>
    </div>
  );
}

