/**
 * Peer Review Form Component
 * ACAD-012
 *
 * Form for students to review their peers' capstone projects
 */

'use client';

import { useState } from 'react';
import { Star, ThumbsUp, AlertTriangle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubmitPeerReviewInput } from '@/types/capstone';

export interface PeerReviewFormProps {
  submissionId: string;
  studentName: string;
  repositoryUrl: string;
  demoVideoUrl?: string;
  description?: string;
  onSubmit: (data: SubmitPeerReviewInput) => Promise<void>;
  onCancel?: () => void;
}

export function PeerReviewForm({
  submissionId,
  studentName,
  repositoryUrl,
  demoVideoUrl,
  description,
  onSubmit,
  onCancel,
}: PeerReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comments, setComments] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comments.trim().length < 10) {
      setError('Comments must be at least 10 characters');
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit({
        submissionId,
        rating,
        comments: comments.trim(),
        strengths: strengths.trim() || undefined,
        improvements: improvements.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Project Info */}
      <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">
          Reviewing {studentName}'s Capstone Project
        </h3>

        <div className="space-y-2 text-sm">
          <div>
            <strong>Repository:</strong>{' '}
            <a
              href={repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
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
                className="text-blue-600 hover:underline"
              >
                {demoVideoUrl}
              </a>
            </div>
          )}

          {description && (
            <div>
              <strong>Description:</strong>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold">Submit Your Peer Review</h2>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Overall Rating *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                <Star
                  className={cn(
                    'h-10 w-10 transition-colors',
                    value <= displayRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  )}
                />
              </button>
            ))}
            <span className="ml-3 text-lg font-medium">
              {rating > 0 ? `${rating}/5` : 'Not rated'}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {rating === 5 && '⭐ Exceptional work!'}
            {rating === 4 && '👍 Great job!'}
            {rating === 3 && '✓ Good work'}
            {rating === 2 && '⚠️ Needs improvement'}
            {rating === 1 && '❌ Significant issues'}
          </p>
        </div>

        {/* Comments */}
        <div>
          <label htmlFor="comments" className="block text-sm font-medium mb-2">
            General Comments *
          </label>
          <textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Provide constructive feedback on the project. What did you think of the implementation, code quality, features, etc.?"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {comments.length} characters (minimum 10)
          </p>
        </div>

        {/* Strengths */}
        <div>
          <label htmlFor="strengths" className="block text-sm font-medium mb-2">
            <ThumbsUp className="inline h-4 w-4 mr-1" />
            Strengths (Optional)
          </label>
          <textarea
            id="strengths"
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder="What did the student do particularly well? Highlight the strong points of their project..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          />
        </div>

        {/* Areas for Improvement */}
        <div>
          <label htmlFor="improvements" className="block text-sm font-medium mb-2">
            <AlertTriangle className="inline h-4 w-4 mr-1" />
            Areas for Improvement (Optional)
          </label>
          <textarea
            id="improvements"
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder="What could be improved? Be constructive and specific with your suggestions..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          />
        </div>

        {/* Review Guidelines */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Peer Review Guidelines:
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>✓ Be constructive and respectful</li>
            <li>✓ Focus on the work, not the person</li>
            <li>✓ Provide specific examples</li>
            <li>✓ Suggest actionable improvements</li>
            <li>✓ Acknowledge what was done well</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'px-6 py-2 bg-blue-600 text-white rounded-lg font-medium',
              'hover:bg-blue-700 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-2'
            )}
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
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

        {/* Help Text */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            Your review will help your peer improve and contribute to their final grade.
            Thank you for being a thoughtful reviewer!
          </p>
        </div>
      </form>
    </div>
  );
}
