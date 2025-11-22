/**
 * Quiz Timer Component
 * ACAD-011
 *
 * Countdown timer with color-coded warnings
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  calculateRemainingTime,
  formatTimeRemaining,
  getTimeWarningColor,
} from '@/types/quiz';

export interface QuizTimerProps {
  timeLimitMinutes: number;
  startTime: Date;
  onTimeExpired: () => void;
}

export function QuizTimer({ timeLimitMinutes, startTime, onTimeExpired }: QuizTimerProps) {
  const [timeState, setTimeState] = useState(() =>
    calculateRemainingTime(startTime, timeLimitMinutes)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const newState = calculateRemainingTime(startTime, timeLimitMinutes);
      setTimeState(newState);

      if (newState.isExpired) {
        clearInterval(interval);
        onTimeExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, timeLimitMinutes, onTimeExpired]);

  const warningColor = getTimeWarningColor(timeState.percentRemaining);
  const isWarning = warningColor === 'yellow';
  const isCritical = warningColor === 'red';

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
        isCritical
          ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-2 border-red-500 animate-pulse'
          : isWarning
          ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 border-2 border-yellow-500'
          : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-2 border-blue-300'
      )}
    >
      {isCritical ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span className="text-lg tabular-nums">
        {formatTimeRemaining(timeState.remainingSeconds)}
      </span>
      {isCritical && <span className="text-sm">Time Almost Up!</span>}
    </div>
  );
}
