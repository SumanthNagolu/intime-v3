/**
 * Capstone Submission Form Component
 * ACAD-012
 *
 * Form for students to submit their capstone projects
 */

'use client';

import { useState } from 'react';
import { AlertCircle, Github, Video, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubmitCapstoneInput } from '@/types/capstone';

export interface CapstoneSubmissionFormProps {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  isRevision?: boolean;
  existingSubmission?: {
    repositoryUrl: string;
    demoVideoUrl?: string;
    description?: string;
  };
  onSubmit: (data: SubmitCapstoneInput) => Promise<void>;
  onCancel?: () => void;
}

export function CapstoneSubmissionForm({
  enrollmentId,
  courseId,
  courseTitle,
  isRevision = false,
  existingSubmission,
  onSubmit,
  onCancel,
}: CapstoneSubmissionFormProps) {
  const [repositoryUrl, setRepositoryUrl] = useState(
    existingSubmission?.repositoryUrl || ''
  );
  const [demoVideoUrl, setDemoVideoUrl] = useState(
    existingSubmission?.demoVideoUrl || ''
  );
  const [description, setDescription] = useState(
    existingSubmission?.description || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate repository URL
    if (!repositoryUrl.trim()) {
      setError('Repository URL is required');
      return;
    }

    if (!repositoryUrl.includes('github.com')) {
      setError('Please provide a valid GitHub repository URL');
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit({
        enrollmentId,
        courseId,
        repositoryUrl: repositoryUrl.trim(),
        demoVideoUrl: demoVideoUrl.trim() || undefined,
        description: description.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit capstone');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {isRevision ? 'Resubmit Capstone Project' : 'Submit Capstone Project'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Submit your capstone project for <strong>{courseTitle}</strong>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Revision Notice */}
      {isRevision && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Revision Required:</strong> Please address the feedback from your
            previous submission before resubmitting.
          </p>
        </div>
      )}

      {/* Repository URL */}
      <div>
        <label htmlFor="repository" className="block text-sm font-medium mb-2">
          GitHub Repository URL *
        </label>
        <div className="relative">
          <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="repository"
            type="url"
            value={repositoryUrl}
            onChange={(e) => setRepositoryUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            required
          />
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your public GitHub repository containing the capstone project code
        </p>
      </div>

      {/* Demo Video URL */}
      <div>
        <label htmlFor="video" className="block text-sm font-medium mb-2">
          Demo Video URL (Optional)
        </label>
        <div className="relative">
          <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="video"
            type="url"
            value={demoVideoUrl}
            onChange={(e) => setDemoVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          YouTube, Loom, or other video platform URL showing your project in action
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Project Description (Optional)
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe your project, key features, technologies used, and any challenges you overcame..."
            rows={6}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description.length}/500 characters
        </p>
      </div>

      {/* Submission Checklist */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Before Submitting:
        </h3>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>✓ Repository is public or accessible to trainers</li>
          <li>✓ README.md includes setup instructions</li>
          <li>✓ Code is well-documented and follows best practices</li>
          <li>✓ All features are working and tested</li>
          <li>✓ Demo video shows all major features (if provided)</li>
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
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSubmitting
            ? 'Submitting...'
            : isRevision
            ? 'Resubmit Project'
            : 'Submit Project'}
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
          <strong>Note:</strong> Once submitted, your project will be available for peer
          review. You'll receive feedback from fellow students and a final grade from your
          trainer.
        </p>
      </div>
    </form>
  );
}
