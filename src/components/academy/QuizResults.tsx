/**
 * Quiz Results Component
 * ACAD-011
 *
 * Displays quiz results with correct/incorrect answers and explanations
 */

'use client';

import { Check, X, Trophy, RefreshCw, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  QuizAttemptResult,
  QuizQuestion,
  QuizSettings,
} from '@/types/quiz';
import { formatTimeTaken } from '@/types/quiz';

export interface QuizResultsProps {
  result: QuizAttemptResult;
  questions: QuizQuestion[];
  settings: QuizSettings;
  onRetry?: () => void;
  onViewHistory?: () => void;
}

export function QuizResults({
  result,
  questions,
  settings,
  onRetry,
  onViewHistory,
}: QuizResultsProps) {
  const passed = result.passed;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Score Card */}
      <div
        className={cn(
          'mb-8 p-8 rounded-lg border-2',
          passed
            ? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-700'
            : 'bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-700'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {passed ? (
                <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <X className="h-8 w-8 text-red-600 dark:text-red-400" />
              )}
              <h2 className="text-3xl font-bold">
                {passed ? 'Passed!' : 'Not Passed'}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                <p className="text-2xl font-bold">{result.score}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Correct</p>
                <p className="text-2xl font-bold">
                  {result.correctAnswers}/{result.totalQuestions}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Passing</p>
                <p className="text-2xl font-bold">{settings.passingThreshold}%</p>
              </div>
              {result.xpEarned > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">XP Earned</p>
                  <p className="text-2xl font-bold text-blue-600">+{result.xpEarned}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Quiz
          </button>
        )}
        {onViewHistory && (
          <button
            onClick={onViewHistory}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <History className="h-4 w-4" />
            View History
          </button>
        )}
      </div>

      {/* Question Review */}
      {settings.showCorrectAnswers && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Question Review</h3>
          <div className="space-y-6">
            {questions.map((question, index) => {
              const questionResult = result.results.find(
                (r) => r.questionId === question.id
              );
              const isCorrect = questionResult?.isCorrect ?? false;
              const userAnswers = questionResult?.userAnswers ?? [];

              return (
                <div
                  key={question.id}
                  className={cn(
                    'p-6 rounded-lg border-2',
                    isCorrect
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  )}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Question {index + 1}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                          {question.points} {question.points === 1 ? 'point' : 'points'}
                        </span>
                      </div>
                      <h4 className="text-lg font-medium">{question.questionText}</h4>
                    </div>
                    <div className="ml-4">
                      {isCorrect ? (
                        <Check className="h-6 w-6 text-green-600" />
                      ) : (
                        <X className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optionIndex) => {
                      const isCorrectOption = question.correctAnswers.includes(optionIndex as any);
                      const isUserAnswer = userAnswers.includes(optionIndex);

                      return (
                        <div
                          key={optionIndex}
                          className={cn(
                            'p-3 rounded-lg border',
                            isCorrectOption && 'border-green-500 bg-green-50 dark:bg-green-900/10',
                            isUserAnswer && !isCorrectOption && 'border-red-500 bg-red-50 dark:bg-red-900/10',
                            !isCorrectOption && !isUserAnswer && 'border-gray-200 dark:border-gray-700'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {/* Indicator */}
                            {isCorrectOption && (
                              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                            {isUserAnswer && !isCorrectOption && (
                              <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                            )}

                            {/* Option Text */}
                            <span className="flex-1">{option}</span>

                            {/* Badges */}
                            <div className="flex items-center gap-2">
                              {isCorrectOption && (
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded font-medium">
                                  Correct
                                </span>
                              )}
                              {isUserAnswer && (
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded font-medium">
                                  Your Answer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {question.explanation && !isCorrect && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Explanation:
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
