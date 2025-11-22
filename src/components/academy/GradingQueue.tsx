/**
 * Grading Queue Component
 * ACAD-008
 *
 * Admin/Trainer interface for manual grading
 */

'use client';

import { useState } from 'react';
import { ExternalLink, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradingQueueItem, RubricScores, generateRubricTemplate } from '@/types/lab';

interface GradingQueueProps {
  submissions: GradingQueueItem[];
  onGrade: (submissionId: string, score: number, rubric: RubricScores, feedback: string) => void;
  isLoading?: boolean;
}

export function GradingQueue({ submissions, onGrade, isLoading = false }: GradingQueueProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Grading Queue</h2>
        <div className="text-sm text-gray-600">
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''} pending
        </div>
      </div>

      {submissions.length === 0 ? (
        <Card className="p-12 text-center">
          <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
          <p className="text-gray-600">No submissions pending manual review</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.submissionId}
              submission={submission}
              isSelected={selectedSubmission === submission.submissionId}
              onSelect={() => setSelectedSubmission(submission.submissionId)}
              onGrade={onGrade}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionCard({
  submission,
  isSelected,
  onSelect,
  onGrade,
  isLoading,
}: {
  submission: GradingQueueItem;
  isSelected: boolean;
  onSelect: () => void;
  onGrade: (submissionId: string, score: number, rubric: RubricScores, feedback: string) => void;
  isLoading: boolean;
}) {
  const [rubricScores, setRubricScores] = useState<RubricScores>(
    generateRubricTemplate(['Code Quality', 'Functionality', 'Documentation', 'Testing'])
  );
  const [feedback, setFeedback] = useState('');

  const calculateTotalScore = () => {
    const scores = Object.values(rubricScores).filter((score): score is number => score !== undefined);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const handleGrade = () => {
    const totalScore = calculateTotalScore();
    onGrade(submission.submissionId, totalScore, rubricScores, feedback);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{submission.topicTitle}</h3>
            <p className="text-sm text-gray-600">
              {submission.courseTitle} → {submission.moduleTitle}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-gray-600">
                Student: <span className="font-medium">{submission.studentName}</span>
              </span>
              <span className="text-gray-600">
                Attempt: <span className="font-medium">#{submission.attemptNumber}</span>
              </span>
              <span className="text-gray-600">
                Submitted:{' '}
                <span className="font-medium">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </span>
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(submission.repositoryUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Code
          </Button>
        </div>

        {/* Auto-grade Score (if available) */}
        {submission.autoGradeScore !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">
              Auto-Grade Score: {submission.autoGradeScore}%
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Review the code manually to assign final grade
            </p>
          </div>
        )}

        {/* Grading Form */}
        {isSelected && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold">Manual Grading</h4>

            {/* Rubric Scores */}
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(rubricScores).map((category) => (
                <div key={category}>
                  <label className="block text-sm font-medium mb-2">{category}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={rubricScores[category] || 0}
                    onChange={(e) =>
                      setRubricScores({
                        ...rubricScores,
                        [category]: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              ))}
            </div>

            {/* Total Score */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Score (Average)</p>
              <p className="text-3xl font-bold">{calculateTotalScore()}%</p>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium mb-2">Feedback for Student</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                placeholder="Provide constructive feedback..."
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleGrade} disabled={isLoading}>
                <Check className="h-4 w-4 mr-2" />
                {isLoading ? 'Submitting...' : 'Submit Grade'}
              </Button>
              <Button variant="outline" onClick={onSelect}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Toggle Grading Form */}
        {!isSelected && (
          <Button variant="outline" onClick={onSelect} className="w-full">
            Grade Submission
          </Button>
        )}
      </div>
    </Card>
  );
}
