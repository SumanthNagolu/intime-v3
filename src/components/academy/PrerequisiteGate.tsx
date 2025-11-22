/**
 * Prerequisite Gate Component
 * Story: ACAD-006
 *
 * Wrapper component that blocks access to locked content
 * Shows helpful messages about prerequisites
 */

'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PrerequisiteGateProps {
  isUnlocked: boolean;
  isLoading?: boolean;
  reason?: string;
  missingPrerequisites?: string[];
  children: React.ReactNode;
  redirectUrl?: string;
}

/**
 * Client-side prerequisite gate
 * Use when unlock status is already fetched
 */
export function PrerequisiteGate({
  isUnlocked,
  isLoading = false,
  reason,
  missingPrerequisites,
  children,
  redirectUrl,
}: PrerequisiteGateProps) {
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Checking access...</span>
        </div>
      </Card>
    );
  }

  if (!isUnlocked) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <Lock className="h-8 w-8 text-gray-400" />
          </div>

          <h3 className="text-xl font-semibold mb-2">Content Locked</h3>

          <p className="text-muted-foreground mb-4">
            {reason || 'This content is locked. Complete prerequisites to unlock.'}
          </p>

          {missingPrerequisites && missingPrerequisites.length > 0 && (
            <div className="w-full mb-6">
              <p className="text-sm font-medium mb-2">Complete these first:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {missingPrerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                    {prereq}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {redirectUrl && (
            <Link href={redirectUrl}>
              <Button>Go to Prerequisites</Button>
            </Link>
          )}
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}

/**
 * Inline prerequisite warning (non-blocking)
 */
export function PrerequisiteWarning({
  missingPrerequisites,
  onDismiss,
}: {
  missingPrerequisites: string[];
  onDismiss?: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed || missingPrerequisites.length === 0) {
    return null;
  }

  return (
    <Alert variant="default" className="mb-4 border-amber-200 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">Recommended Prerequisites</AlertTitle>
      <AlertDescription className="text-amber-800">
        <p className="mb-2">For best results, complete these topics first:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {missingPrerequisites.map((prereq, index) => (
            <li key={index}>{prereq}</li>
          ))}
        </ul>
      </AlertDescription>
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-amber-600 hover:text-amber-900"
        >
          ✕
        </button>
      )}
    </Alert>
  );
}

/**
 * Module Lock Gate
 */
export function ModuleLockGate({
  isUnlocked,
  moduleName,
  prerequisiteModules,
  children,
}: {
  isUnlocked: boolean;
  moduleName: string;
  prerequisiteModules?: string[];
  children: React.ReactNode;
}) {
  if (!isUnlocked) {
    return (
      <Card className="p-8 border-2 border-dashed border-gray-300">
        <div className="text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Module Locked: {moduleName}</h3>
          <p className="text-muted-foreground mb-4">
            Complete all topics in previous modules to unlock this module.
          </p>
          {prerequisiteModules && prerequisiteModules.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Required modules:</p>
              <p>{prerequisiteModules.join(', ')}</p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}

/**
 * Course Lock Gate
 */
export function CourseLockGate({
  isUnlocked,
  courseName,
  prerequisiteCourses,
  children,
}: {
  isUnlocked: boolean;
  courseName: string;
  prerequisiteCourses?: string[];
  children: React.ReactNode;
}) {
  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-12 max-w-2xl text-center">
          <div className="mb-6 rounded-full bg-blue-100 p-6 inline-block">
            <Lock className="h-16 w-16 text-blue-600" />
          </div>

          <h2 className="text-3xl font-bold mb-4">{courseName}</h2>
          <p className="text-lg text-muted-foreground mb-6">
            This is an advanced course with prerequisites.
          </p>

          {prerequisiteCourses && prerequisiteCourses.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <p className="font-semibold mb-3">Complete these courses first:</p>
              <ul className="space-y-2">
                {prerequisiteCourses.map((course, index) => (
                  <li key={index} className="flex items-center justify-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <span>{course}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link href="/courses">
            <Button size="lg">Browse All Courses</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
