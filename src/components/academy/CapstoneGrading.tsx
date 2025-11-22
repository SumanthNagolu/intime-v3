/**
 * Capstone Grading Component
 * ACAD-012
 *
 * Interface for trainers to grade capstone projects with rubric
 */

'use client';

import { useState } from 'react';
import { Check, X, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GradeCapstoneInput, RubricScores } from '@/types/capstone';
import {
  DEFAULT_RUBRIC_CRITERIA,
  calculateGradeFromRubric,
  validateRubricScores,
} from '@/types/capstone';

export interface CapstoneGradingProps {
  submissionId: string;
  studentName: string;
  repositoryUrl: string;
  demoVideoUrl?: string;
  description?: string;
  peerReviewCount: number;
  avgPeerRating: number | null;
  onSubmit: (data: GradeCapstoneInput) => Promise<void>;
  onCancel?: () => void;
}

export function CapstoneGrading({
  submissionId,
  studentName,
  repositoryUrl,
  demoVideoUrl,
  description,
  peerReviewCount,
  avgPeerRating,
  onSubmit,
  onCancel,
}: CapstoneGradingProps) {
  const [rubricScores, setRubricScores] = useState<RubricScores>({
    functionality: 0,
    codeQuality: 0,
    documentation: 0,
    testing: 0,
    userExperience: 0,
    innovation: 0,
  });

  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<'passed' | 'failed' | 'revision_requested'>(
    'passed'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalGrade = calculateGradeFromRubric(rubricScores);

  const handleRubricChange = (criterion: string, value: number) => {
    setRubricScores((prev) => ({
      ...prev,
      [criterion]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate rubric scores
    const validation = validateRubricScores(rubricScores);
    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }

    // Validate feedback
    if (feedback.trim().length < 20) {
      setError('Feedback must be at least 20 characters');
      return;
    }

    // Check if grade matches status
    if (status === 'passed' && totalGrade < 70) {
      setError('Grade must be at least 70% to mark as passed');
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit({
        submissionId,
        grade: totalGrade,
        feedback: feedback.trim(),
        rubricScores,
        status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Project Info */}
      <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-3">Grading {studentName}'s Capstone</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Repository:</strong>{' '}
            <a
              href={repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {repositoryUrl}
            </a>
          </div>

          {demoVideoUrl && (
            <div>
              <strong>Demo Video:</strong>{' '}
              <a
                href={demoVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {demoVideoUrl}
              </a>
            </div>
          )}

          <div>
            <strong>Peer Reviews:</strong> {peerReviewCount}{' '}
            {avgPeerRating && `(Avg: ${avgPeerRating.toFixed(1)}/5.0)`}
          </div>
        </div>

        {description && (
          <div className="mt-3">
            <strong className="text-sm">Description:</strong>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Rubric Scoring */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Grading Rubric</h3>

          <div className="space-y-4">
            {DEFAULT_RUBRIC_CRITERIA.map((criterion) => (
              <div
                key={criterion.name}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium capitalize">
                      {criterion.name.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {criterion.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {rubricScores[criterion.name]}/{criterion.maxPoints}
                    </div>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max={criterion.maxPoints}
                  value={rubricScores[criterion.name]}
                  onChange={(e) =>
                    handleRubricChange(criterion.name, parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {/* Total Grade */}
          <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Total Grade:</span>
              <span
                className={cn(
                  'text-4xl font-bold',
                  totalGrade >= 90
                    ? 'text-green-600'
                    : totalGrade >= 80
                    ? 'text-blue-600'
                    : totalGrade >= 70
                    ? 'text-yellow-600'
                    : 'text-red-600'
                )}
              >
                {totalGrade}%
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {totalGrade >= 90 && 'Exceptional work!'}
              {totalGrade >= 80 && totalGrade < 90 && 'Excellent performance'}
              {totalGrade >= 70 && totalGrade < 80 && 'Good work, meets requirements'}
              {totalGrade < 70 && 'Below passing threshold'}
            </p>
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label htmlFor="feedback" className="block text-sm font-medium mb-2">
            Detailed Feedback *
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide detailed feedback on the project. Include strengths, areas for improvement, and specific suggestions..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {feedback.length} characters (minimum 20)
          </p>
        </div>

        {/* Status Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Decision *</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setStatus('passed')}
              className={cn(
                'p-4 border-2 rounded-lg transition-colors',
                status === 'passed'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            >
              <Check className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="font-medium">Pass</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Approve and graduate
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStatus('revision_requested')}
              className={cn(
                'p-4 border-2 rounded-lg transition-colors',
                status === 'revision_requested'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            >
              <RotateCcw className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
              <div className="font-medium">Request Revision</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Needs improvements
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStatus('failed')}
              className={cn(
                'p-4 border-2 rounded-lg transition-colors',
                status === 'failed'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            >
              <X className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <div className="font-medium">Fail</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Does not meet standards
              </div>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'px-6 py-2 rounded-lg font-medium text-white',
              status === 'passed' && 'bg-green-600 hover:bg-green-700',
              status === 'revision_requested' && 'bg-yellow-600 hover:bg-yellow-700',
              status === 'failed' && 'bg-red-600 hover:bg-red-700',
              'disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            )}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Grade'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
