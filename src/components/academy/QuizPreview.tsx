/**
 * Quiz Preview Component
 * ACAD-010
 *
 * Preview quiz questions with optional correct answer display
 */

'use client';

import { useState } from 'react';
import { Check, X, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizQuestion, QuizAnswers } from '@/types/quiz';
import { calculateQuizScore, formatQuestionType } from '@/types/quiz';

export interface QuizPreviewProps {
  questions: QuizQuestion[];
  showCorrectAnswers?: boolean;
  onSubmit?: (answers: QuizAnswers) => void;
}

export function QuizPreview({
  questions,
  showCorrectAnswers = false,
  onSubmit,
}: QuizPreviewProps) {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<ReturnType<typeof calculateQuizScore> | null>(null);

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    if (
      question.questionType === 'multiple_choice_single' ||
      question.questionType === 'true_false'
    ) {
      // Single answer - replace
      setAnswers({ ...answers, [questionId]: [answerIndex] });
    } else {
      // Multiple answers - toggle
      const currentAnswers = answers[questionId] || [];
      const isSelected = currentAnswers.includes(answerIndex);

      if (isSelected) {
        setAnswers({
          ...answers,
          [questionId]: currentAnswers.filter((ans) => ans !== answerIndex),
        });
      } else {
        setAnswers({
          ...answers,
          [questionId]: [...currentAnswers, answerIndex],
        });
      }
    }
  };

  const handleSubmit = () => {
    const calculatedScore = calculateQuizScore(questions, answers);
    setScore(calculatedScore);
    setSubmitted(true);
    onSubmit?.(answers);
  };

  const isAnswerCorrect = (question: QuizQuestion): boolean => {
    const userAnswers = answers[question.id] || [];
    const correctAnswerSet = new Set(question.correctAnswers);
    const userAnswerSet = new Set(userAnswers);

    return (
      correctAnswerSet.size === userAnswerSet.size &&
      [...correctAnswerSet].every((ans) => userAnswerSet.has(ans))
    );
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Quiz Preview</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {questions.length} question{questions.length !== 1 ? 's' : ''} • Total Points:{' '}
          {questions.reduce((sum, q) => sum + q.points, 0)}
        </p>
      </div>

      {/* Score Display (after submission) */}
      {submitted && score && (
        <div
          className={cn(
            'mb-6 p-4 rounded-lg border-2',
            score.passed
              ? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-700'
              : 'bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-700'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {score.score}% {score.passed ? 'Pass' : 'Fail'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {score.correctAnswers} / {score.totalQuestions} correct (passing: {score.passingThreshold}%)
              </p>
            </div>
            {score.passed ? (
              <Check className="h-12 w-12 text-green-600" />
            ) : (
              <X className="h-12 w-12 text-red-600" />
            )}
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => {
          const isCorrect = submitted ? isAnswerCorrect(question) : null;
          const userAnswers = answers[question.id] || [];

          return (
            <div
              key={question.id}
              className={cn(
                'p-6 rounded-lg border',
                submitted
                  ? isCorrect
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
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
                      {formatQuestionType(question.questionType)}
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                      {question.points} {question.points === 1 ? 'point' : 'points'}
                    </span>
                  </div>
                  <p className="text-lg font-medium">{question.questionText}</p>
                </div>
                {submitted && (
                  <div className="ml-4">
                    {isCorrect ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <X className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                )}
              </div>

              {/* Code Language Badge */}
              {question.questionType === 'code' && question.codeLanguage && (
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                  <Code className="h-4 w-4" />
                  <span className="capitalize">{question.codeLanguage}</span>
                </div>
              )}

              {/* Options */}
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isSelected = userAnswers.includes(optionIndex);
                  const isCorrectOption = question.correctAnswers.includes(optionIndex as any);
                  const showAsCorrect = showCorrectAnswers && isCorrectOption;
                  const showAsIncorrect = submitted && isSelected && !isCorrectOption;

                  return (
                    <button
                      key={optionIndex}
                      onClick={() => !submitted && handleAnswerChange(question.id, optionIndex)}
                      disabled={submitted}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border-2 transition-colors',
                        !submitted && 'hover:bg-gray-50 dark:hover:bg-gray-700',
                        isSelected && !submitted && 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
                        !isSelected && !showAsCorrect && 'border-gray-200 dark:border-gray-700',
                        showAsCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/20',
                        showAsIncorrect && 'border-red-500 bg-red-50 dark:bg-red-900/20',
                        submitted && 'cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox/Radio */}
                        <div
                          className={cn(
                            'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center',
                            question.questionType === 'multiple_choice_single' ||
                              question.questionType === 'true_false'
                              ? 'rounded-full'
                              : '',
                            isSelected && !showAsCorrect && !showAsIncorrect
                              ? 'bg-blue-500 border-blue-500'
                              : showAsCorrect
                              ? 'bg-green-500 border-green-500'
                              : showAsIncorrect
                              ? 'bg-red-500 border-red-500'
                              : 'bg-white dark:bg-gray-800 border-gray-300'
                          )}
                        >
                          {(isSelected || showAsCorrect) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>

                        {/* Option Text */}
                        <span className="flex-1">{option}</span>

                        {/* Correct/Incorrect Badge */}
                        {(showAsCorrect || showAsIncorrect) && (
                          <span
                            className={cn(
                              'text-xs px-2 py-1 rounded font-medium',
                              showAsCorrect
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            )}
                          >
                            {showAsCorrect ? 'Correct' : 'Wrong'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {submitted && question.explanation && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Explanation:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{question.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
}
