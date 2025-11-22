/**
 * Grade Capstone Submission Page
 * Story: ACAD-026
 *
 * Allows trainers to review and grade capstone submissions
 */

import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Calendar, GitBranch, Video, Award } from 'lucide-react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/server';
import { createClient } from '@/lib/supabase/server';
import { GradingForm } from '@/components/trainer/GradingForm';
import { GitHubRepoViewer } from '@/components/trainer/GitHubRepoViewer';
import { VideoPlayer } from '@/components/trainer/VideoPlayer';
import { PeerReviewsList } from '@/components/trainer/PeerReviewsList';

interface Props {
  params: Promise<{
    submissionId: string;
  }>;
}

export default async function GradeSubmissionPage({ params }: Props) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // TODO: Check if user has trainer role

  const { submissionId } = await params;
  const caller = trpc.createCaller({ userId: user.id });

  // Fetch submission details and peer reviews in parallel
  const [submission, peerReviews] = await Promise.all([
    caller.capstone.getSubmissionById({ submissionId }),
    caller.capstone.getPeerReviews({ submissionId }),
  ]);

  // Calculate wait time
  const waitDays = Math.floor(
    (Date.now() - submission.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Status badge variant
  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'secondary',
    peer_review: 'secondary',
    trainer_review: 'default',
    passed: 'default',
    failed: 'destructive',
    revision_requested: 'outline',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/trainer/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grade Capstone Submission</h1>
            <p className="text-gray-600 mt-1">{submission.courseTitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info Card */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Student Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Student</p>
                    <p className="font-medium">{submission.studentName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="font-medium">
                      {submission.submittedAt.toLocaleDateString()} ({waitDays} days ago)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant={statusVariants[submission.status]}>{submission.status}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Peer Reviews</p>
                    <p className="font-medium">
                      {submission.peerReviewCount} reviews
                      {submission.avgPeerRating && ` (${submission.avgPeerRating.toFixed(1)}★)`}
                    </p>
                  </div>
                </div>
              </div>

              {submission.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-900">{submission.description}</p>
                </div>
              )}

              {submission.revisionCount > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Badge variant="outline">Revision #{submission.revisionCount}</Badge>
                </div>
              )}
            </Card>

            {/* GitHub Repository Viewer */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                GitHub Repository
              </h2>
              <GitHubRepoViewer repositoryUrl={submission.repositoryUrl} />
            </Card>

            {/* Demo Video Player */}
            {submission.demoVideoUrl && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Demo Video
                </h2>
                <VideoPlayer videoUrl={submission.demoVideoUrl} />
              </Card>
            )}

            {/* Peer Reviews */}
            {peerReviews.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Peer Reviews</h2>
                <PeerReviewsList reviews={peerReviews} />
              </Card>
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Grading Form */}
            <Card className="p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Grade Submission</h2>
              <GradingForm
                submissionId={submissionId}
                currentGrade={submission.grade || undefined}
                currentFeedback={submission.feedback || undefined}
                currentStatus={submission.status as 'passed' | 'failed' | 'revision_requested'}
                currentRubricScores={submission.rubricScores}
              />
            </Card>

            {/* Previous Grading (if exists) */}
            {submission.gradedAt && (
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Previous Grade</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Score:</span>{' '}
                    <span className="font-medium">{submission.grade}/100</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Graded by:</span>{' '}
                    <span className="font-medium">{submission.graderName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>{' '}
                    <span className="font-medium">
                      {submission.gradedAt.toLocaleDateString()}
                    </span>
                  </div>
                  {submission.feedback && (
                    <div className="pt-2 border-t">
                      <p className="text-gray-600 mb-1">Feedback:</p>
                      <p className="text-gray-900">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate metadata
export async function generateMetadata({ params }: Props) {
  const { submissionId } = await params;
  return {
    title: `Grade Submission - InTime Training Academy`,
    description: 'Review and grade capstone project submission',
  };
}
