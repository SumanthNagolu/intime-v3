/**
 * Question Editor Component
 * ACAD-010
 *
 * Handles editing of all question types with type-specific UI
 */

'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  CreateQuizQuestionInput,
  QuestionType,
  Difficulty,
} from '@/types/quiz';
import { validateQuizQuestion, createEmptyQuestion } from '@/types/quiz';

export interface QuestionEditorProps {
  question?: CreateQuizQuestionInput;
  onChange: (question: CreateQuizQuestionInput) => void;
  onDelete?: () => void;
  questionNumber?: number;
}

export function QuestionEditor({
  question: initialQuestion,
  onChange,
  onDelete,
  questionNumber,
}: QuestionEditorProps) {
  const [question, setQuestion] = useState<CreateQuizQuestionInput>(
    initialQuestion || createEmptyQuestion('multiple_choice_single')
  );
  const [errors, setErrors] = useState<string[]>([]);

  // Validate on change
  useEffect(() => {
    const validation = validateQuizQuestion(question);
    setErrors(validation.errors);
    onChange(question);
  }, [question]);

  const handleTypeChange = (type: QuestionType) => {
    setQuestion(createEmptyQuestion(type));
  };

  const handleQuestionTextChange = (text: string) => {
    setQuestion({ ...question, questionText: text });
  };

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setQuestion({ ...question, difficulty });
  };

  const handlePointsChange = (points: number) => {
    setQuestion({ ...question, points: Math.max(1, points) });
  };

  const handleExplanationChange = (explanation: string) => {
    setQuestion({ ...question, explanation: explanation || null });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    setQuestion({ ...question, options: newOptions });
  };

  const handleAddOption = () => {
    if (question.questionType === 'true_false') return; // Can't add options to true/false
    setQuestion({ ...question, options: [...question.options, ''] });
  };

  const handleRemoveOption = (index: number) => {
    if (question.options.length <= 2) return; // Need at least 2 options
    const newOptions = question.options.filter((_, i) => i !== index);
    const newCorrectAnswers = question.correctAnswers
      .filter((ans) => ans !== index)
      .map((ans) => (ans > index ? ans - 1 : ans));
    setQuestion({
      ...question,
      options: newOptions,
      correctAnswers: newCorrectAnswers,
    });
  };

  const handleCorrectAnswerToggle = (index: number) => {
    const isSelected = question.correctAnswers.includes(index as any);

    if (question.questionType === 'multiple_choice_single' || question.questionType === 'true_false') {
      // Single answer - replace
      setQuestion({ ...question, correctAnswers: [index] });
    } else {
      // Multiple answers - toggle
      const newCorrectAnswers = isSelected
        ? question.correctAnswers.filter((ans) => ans !== index)
        : [...question.correctAnswers, index];
      setQuestion({ ...question, correctAnswers: newCorrectAnswers });
    }
  };

  const handleCodeLanguageChange = (language: string) => {
    if (question.questionType === 'code') {
      setQuestion({ ...question, codeLanguage: language });
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Question {questionNumber ? `#${questionNumber}` : ''}
        </h3>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete question"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Question Type Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Question Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { value: 'multiple_choice_single', label: 'Single Choice' },
            { value: 'multiple_choice_multiple', label: 'Multiple Choice' },
            { value: 'true_false', label: 'True/False' },
            { value: 'code', label: 'Code' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => handleTypeChange(type.value as QuestionType)}
              className={cn(
                'py-2 px-4 rounded-lg border transition-colors',
                question.questionType === type.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-700 border-gray-300 hover:border-blue-300'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Question Text *</label>
        <textarea
          value={question.questionText}
          onChange={(e) => handleQuestionTextChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Enter your question here..."
        />
      </div>

      {/* Code Language (for code questions) */}
      {question.questionType === 'code' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Programming Language *</label>
          <select
            value={question.codeLanguage || 'javascript'}
            onChange={(e) => handleCodeLanguageChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="sql">SQL</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
        </div>
      )}

      {/* Options */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Answer Options *
          {question.questionType === 'multiple_choice_multiple' && (
            <span className="text-gray-500 text-xs ml-2">(Select all correct answers)</span>
          )}
        </label>
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              {/* Correct Answer Checkbox/Radio */}
              <button
                onClick={() => handleCorrectAnswerToggle(index)}
                className={cn(
                  'flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
                  question.correctAnswers.includes(index as any)
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-gray-300 hover:border-green-300'
                )}
                aria-label={`Mark option ${index + 1} as correct`}
              >
                {question.correctAnswers.includes(index as any) && <Check className="h-4 w-4" />}
              </button>

              {/* Option Text */}
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                disabled={question.questionType === 'true_false'}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                placeholder={`Option ${index + 1}`}
              />

              {/* Remove Option */}
              {question.questionType !== 'true_false' && question.options.length > 2 && (
                <button
                  onClick={() => handleRemoveOption(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label={`Remove option ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Option Button */}
        {question.questionType !== 'true_false' && (
          <button
            onClick={handleAddOption}
            className="mt-2 flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Option
          </button>
        )}
      </div>

      {/* Metadata Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium mb-2">Difficulty</label>
          <select
            value={question.difficulty}
            onChange={(e) => handleDifficultyChange(e.target.value as Difficulty)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Points */}
        <div>
          <label className="block text-sm font-medium mb-2">Points</label>
          <input
            type="number"
            min="1"
            value={question.points}
            onChange={(e) => handlePointsChange(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Public */}
        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={question.isPublic}
              onChange={(e) => setQuestion({ ...question, isPublic: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium">Public (Shareable)</span>
          </label>
        </div>
      </div>

      {/* Explanation */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Explanation (Optional)
          <span className="text-gray-500 text-xs ml-2">Shown after submission</span>
        </label>
        <textarea
          value={question.explanation || ''}
          onChange={(e) => handleExplanationChange(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Explain why the answer is correct..."
        />
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800 mb-1">Validation Errors:</p>
          <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
