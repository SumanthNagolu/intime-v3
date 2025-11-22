/**
 * Lab Environment Component
 * ACAD-008
 *
 * Main lab interface with instructions, timer, and submission
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  ActiveLabInstance,
  calculateTimeRemaining,
  formatTimeRemaining,
  LabTimeRemaining,
} from '@/types/lab';

interface LabEnvironmentProps {
  labInstance: ActiveLabInstance | null;
  instructions: string;
  onSubmit: (repoUrl: string) => void;
  onStartLab?: () => void;
  isLoading?: boolean;
}

export function LabEnvironment({
  labInstance,
  instructions,
  onSubmit,
  onStartLab,
  isLoading = false,
}: LabEnvironmentProps) {
  const [timeRemaining, setTimeRemaining] = useState<LabTimeRemaining | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // Update timer every second
  useEffect(() => {
    if (!labInstance?.expiresAt) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(labInstance.expiresAt);
      setTimeRemaining(remaining);

      if (remaining.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [labInstance]);

  const handleSubmit = () => {
    if (!repoUrl.trim()) {
      alert('Please enter your repository URL');
      return;
    }

    onSubmit(repoUrl);
    setShowSubmitForm(false);
    setRepoUrl('');
  };

  // No lab started yet
  if (!labInstance) {
    return (
      <Card className="p-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Hands-On Lab Exercise</h2>

          <div className="prose prose-sm max-w-none mb-6 text-left">
            <div dangerouslySetInnerHTML={{ __html: instructions }} />
          </div>

          <Button onClick={onStartLab} disabled={isLoading} size="lg">
            {isLoading ? 'Provisioning Lab...' : 'Start Lab'}
          </Button>

          <p className="text-sm text-gray-600 mt-4">
            A GitHub repository will be forked for you when you start the lab
          </p>
        </div>
      </Card>
    );
  }

  // Lab is active
  return (
    <div className="space-y-6">
      {/* Lab Header with Timer */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Lab Environment Active</h2>
            <p className="text-sm text-gray-600">Complete the tasks and submit your solution</p>
          </div>

          {timeRemaining && (
            <div
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg',
                timeRemaining.isExpired
                  ? 'bg-red-100 text-red-700'
                  : timeRemaining.totalSeconds < 300
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-blue-100 text-blue-700'
              )}
            >
              <Clock className="h-5 w-5" />
              <span>{formatTimeRemaining(timeRemaining)}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Expiration Warning */}
      {timeRemaining?.isExpired && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your lab session has expired. Please submit your work or start a new session.
          </AlertDescription>
        </Alert>
      )}

      {/* Repository Access */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Lab Repository</h3>
        <div className="flex items-center gap-4">
          <code className="flex-1 bg-gray-100 px-4 py-2 rounded text-sm">
            {labInstance.forkedRepoUrl}
          </code>
          <Button
            variant="outline"
            onClick={() => window.open(labInstance.forkedRepoUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in GitHub
          </Button>
        </div>
      </Card>

      {/* Lab Instructions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Instructions</h3>
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: instructions }} />
        </div>
      </Card>

      {/* Submit Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Submit Your Solution</h3>

        {!showSubmitForm ? (
          <Button onClick={() => setShowSubmitForm(true)} size="lg">
            Submit Lab
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Repository URL
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/lab-repo"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-1">
                Enter the URL of your GitHub repository (your forked lab repo)
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit for Grading'}
              </Button>
              <Button variant="outline" onClick={() => setShowSubmitForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/**
 * Lab Submission Status Card
 */
export function LabSubmissionStatus({
  status,
  score,
  feedback,
  passed,
}: {
  status: string;
  score: number | null;
  feedback: string | null;
  passed: boolean | null;
}) {
  const getStatusColor = () => {
    if (passed === true) return 'bg-green-100 text-green-700 border-green-200';
    if (passed === false) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  const getStatusIcon = () => {
    if (passed === true) return <CheckCircle className="h-5 w-5" />;
    if (passed === false) return <AlertCircle className="h-5 w-5" />;
    return <Clock className="h-5 w-5" />;
  };

  return (
    <Card className={cn('p-6 border-2', getStatusColor())}>
      <div className="flex items-start gap-4">
        <div className="mt-1">{getStatusIcon()}</div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Submission Status: {status}</h3>

          {score !== null && (
            <div className="mb-3">
              <span className="text-2xl font-bold">{score}%</span>
              <span className="text-sm ml-2">
                {passed ? 'Passing Grade' : 'Below Passing Threshold'}
              </span>
            </div>
          )}

          {feedback && (
            <div className="mt-4 p-4 bg-white rounded border">
              <p className="text-sm font-medium mb-2">Feedback:</p>
              <p className="text-sm">{feedback}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Lab Timer Display (standalone)
 */
export function LabTimer({ expiresAt }: { expiresAt: Date }) {
  const [timeRemaining, setTimeRemaining] = useState<LabTimeRemaining>(
    calculateTimeRemaining(expiresAt)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(expiresAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
        timeRemaining.isExpired
          ? 'bg-red-100 text-red-700'
          : timeRemaining.totalSeconds < 300
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-green-100 text-green-700'
      )}
    >
      <Clock className="h-4 w-4" />
      <span className="font-mono">{formatTimeRemaining(timeRemaining)}</span>
    </div>
  );
}
