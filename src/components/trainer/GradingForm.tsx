/**
 * Grading Form Component
 * Story: ACAD-026
 *
 * Interactive form for grading capstone submissions with rubric
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { RubricScores } from '@/types/capstone';

interface GradingFormProps {
  submissionId: string;
  currentGrade?: number;
  currentFeedback?: string;
  currentStatus?: 'passed' | 'failed' | 'revision_requested';
  currentRubricScores?: RubricScores | null;
}

// Grading rubric criteria
const RUBRIC_CRITERIA = [
  {
    key: 'functionality',
    label: 'Functionality & Requirements',
    description: 'All required features implemented correctly',
    maxScore: 25,
  },
  {
    key: 'code_quality',
    label: 'Code Quality',
    description: 'Clean, readable, and well-structured code',
    maxScore: 20,
  },
  {
    key: 'best_practices',
    label: 'Best Practices',
    description: 'Follows industry standards and conventions',
    maxScore: 15,
  },
  {
    key: 'testing',
    label: 'Testing',
    description: 'Adequate test coverage and quality',
    maxScore: 15,
  },
  {
    key: 'documentation',
    label: 'Documentation',
    description: 'README, comments, and setup instructions',
    maxScore: 10,
  },
  {
    key: 'ui_ux',
    label: 'UI/UX Design',
    description: 'User-friendly interface and experience',
    maxScore: 10,
  },
  {
    key: 'demo_presentation',
    label: 'Demo & Presentation',
    description: 'Clear demonstration of project features',
    maxScore: 5,
  },
];

export function GradingForm({
  submissionId,
  currentGrade,
  currentFeedback,
  currentStatus,
  currentRubricScores,
}: GradingFormProps) {
  const router = useRouter();

  // Form state
  const [rubricScores, setRubricScores] = useState<Record<string, number>>(
    currentRubricScores || {}
  );
  const [feedback, setFeedback] = useState(currentFeedback || '');
  const [status, setStatus] = useState<'passed' | 'failed' | 'revision_requested'>(
    currentStatus || 'passed'
  );

  // Mutation
  const gradeMutation = trpc.capstone.gradeCapstone.useMutation({
    onSuccess: () => {
      toast.success('Grade submitted successfully!', {
        description: 'Student has been notified of their grade.',
      });
      router.push('/trainer/dashboard');
      router.refresh();
    },
    onError: (error) => {
      toast.error('Failed to submit grade', {
        description: error.message,
      });
    },
  });

  // Calculate total score from rubric
  const totalScore = Object.values(rubricScores).reduce((sum, score) => sum + score, 0);

  // Handle rubric score change
  const handleRubricChange = (key: string, value: number) => {
    setRubricScores((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (feedback.length < 10) {
      toast.error('Feedback is too short', {
        description: 'Please provide at least 10 characters of feedback.',
      });
      return;
    }

    if (totalScore < 0 || totalScore > 100) {
      toast.error('Invalid score', {
        description: 'Total score must be between 0 and 100.',
      });
      return;
    }

    // Submit grade
    await gradeMutation.mutateAsync({
      submissionId,
      grade: totalScore,
      feedback,
      rubricScores,
      status,
    });
  };

  const isSubmitting = gradeMutation.isPending;

  // Status configuration
  const statusConfig = {
    passed: {
      label: 'Pass',
      icon: CheckCircle,
      color: 'text-green-600',
      description: 'Student has successfully completed the capstone',
    },
    failed: {
      label: 'Fail',
      icon: XCircle,
      color: 'text-red-600',
      description: 'Student needs to resubmit with major improvements',
    },
    revision_requested: {
      label: 'Revision Requested',
      icon: AlertCircle,
      color: 'text-orange-600',
      description: 'Student needs to make minor improvements',
    },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Grading Rubric */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Grading Rubric</Label>
          <span className="text-2xl font-bold text-blue-600">{totalScore}/100</span>
        </div>

        <div className="space-y-3">
          {RUBRIC_CRITERIA.map((criterion) => (
            <div key={criterion.key} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Label htmlFor={criterion.key} className="font-medium">
                    {criterion.label}
                  </Label>
                  <p className="text-sm text-gray-600">{criterion.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Input
                    id={criterion.key}
                    type="number"
                    min={0}
                    max={criterion.maxScore}
                    value={rubricScores[criterion.key] || 0}
                    onChange={(e) =>
                      handleRubricChange(criterion.key, parseInt(e.target.value) || 0)
                    }
                    className="w-20 text-center"
                  />
                  <span className="text-sm text-gray-600">/ {criterion.maxScore}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${((rubricScores[criterion.key] || 0) / criterion.maxScore) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <Label htmlFor="feedback">
          Feedback <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide detailed feedback on the submission..."
          className="min-h-32"
          required
        />
        <p className="text-sm text-gray-600">{feedback.length} characters</p>
      </div>

      {/* Status Selection */}
      <div className="space-y-2">
        <Label htmlFor="status">
          Decision <span className="text-red-500">*</span>
        </Label>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <config.icon className={`h-4 w-4 ${config.color}`} />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-md">
          <StatusIcon className={`h-5 w-5 ${statusConfig[status].color} mt-0.5`} />
          <p className="text-sm text-gray-700">{statusConfig[status].description}</p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="space-y-2">
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting Grade...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Grade
            </>
          )}
        </Button>
        <p className="text-xs text-gray-600 text-center">
          Student will be notified via email when you submit
        </p>
      </div>
    </form>
  );
}
