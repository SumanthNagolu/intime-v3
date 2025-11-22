/**
 * Quiz Taker Component
 * ACAD-011
 *
 * Student-facing quiz interface with timer, answer selection, and instant grading
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock, Send, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizTimer } from './QuizTimer';
import { QuizResults } from './QuizResults';
import type {
  QuizQuestion,
  QuizSettings,
  QuizAnswers,
  QuizAttemptResult,
} from '@/types/quiz';
import { calculateRemainingTime } from '@/types/quiz';

export interface QuizTakerProps {
  topicId: string;
  enrollmentId: string;
  attemptId: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
  startTime: Date;
  onSubmit: (answers: QuizAnswers) => Promise<QuizAttemptResult>;
  onCancel?: () => void;
}

export function QuizTaker({
  topicId,
  enrollmentId,
  attemptId,
  questions,
  settings,
  startTime,
  onSubmit,
  onCancel,
}: QuizTakerProps) {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Auto-submit on time expiry
  const handleTimeExpired = async () => {
    if (!result) {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submitResult = await onSubmit(answers);
      setResult(submitResult);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleAnswerChange = (questionId: string, selectedAnswers: number[]) => {
    setAnswers({ ...answers, [questionId]: selectedAnswers });
  };

  const answeredCount = Object.keys(answers).filter(
    (qId) => answers[qId].length > 0
  ).length;

  // Show results if quiz is submitted
  if (result) {
    return (
      <QuizResults
        result={result}
        questions={questions}
        settings={settings}
        onRetry={onCancel}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Timer */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 pb-4 mb-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Quiz</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {answeredCount} of {questions.length} answered
            </p>
          </div>

          {/* Timer */}
          {settings.timeLimitMinutes && (
            <QuizTimer
              timeLimitMinutes={settings.timeLimitMinutes}
              startTime={startTime}
              onTimeExpired={handleTimeExpired}
            />
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            questionNumber={index + 1}
            selectedAnswers={answers[question.id] || []}
            onAnswerChange={(selected) => handleAnswerChange(question.id, selected)}
          />
        ))}
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-6 mt-8 border-t">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {answeredCount < questions.length && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {questions.length - answeredCount} question{questions.length - answeredCount !== 1 ? 's' : ''} unanswered
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isSubmitting}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium',
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              )}
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Submit Quiz?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {answeredCount < questions.length ? (
                <>
                  You have {questions.length - answeredCount} unanswered question
                  {questions.length - answeredCount !== 1 ? 's' : ''}. Are you sure you want to submit?
                </>
              ) : (
                'Are you sure you want to submit your quiz?'
              )}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Question Card - Single question with answer selection
 */
function QuestionCard({
  question,
  questionNumber,
  selectedAnswers,
  onAnswerChange,
}: {
  question: QuizQuestion;
  questionNumber: number;
  selectedAnswers: number[];
  onAnswerChange: (answers: number[]) => void;
}) {
  const isSingleAnswer =
    question.questionType === 'multiple_choice_single' ||
    question.questionType === 'true_false';

  const handleToggle = (index: number) => {
    if (isSingleAnswer) {
      onAnswerChange([index]);
    } else {
      if (selectedAnswers.includes(index)) {
        onAnswerChange(selectedAnswers.filter((ans) => ans !== index));
      } else {
        onAnswerChange([...selectedAnswers, index]);
      }
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
      {/* Question Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Question {questionNumber}
          </span>
          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
            {question.points} {question.points === 1 ? 'point' : 'points'}
          </span>
        </div>
        <h3 className="text-lg font-medium">{question.questionText}</h3>
        {question.questionType === 'multiple_choice_multiple' && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select all that apply
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswers.includes(index);

          return (
            <button
              key={index}
              onClick={() => handleToggle(index)}
              className={cn(
                'w-full text-left p-4 rounded-lg border-2 transition-colors',
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox/Radio */}
                <div
                  className={cn(
                    'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                    isSingleAnswer ? 'rounded-full' : '',
                    isSelected
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white dark:bg-gray-800 border-gray-300'
                  )}
                >
                  {isSelected && (
                    <div
                      className={cn(
                        'bg-white rounded',
                        isSingleAnswer ? 'w-2 h-2 rounded-full' : 'w-3 h-3'
                      )}
                    />
                  )}
                </div>

                {/* Option Text */}
                <span className="flex-1">{option}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
