/**
 * Quiz Builder Component
 * ACAD-010
 *
 * Admin interface for creating and managing quiz questions
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Save, X, Eye, Upload, Download } from 'lucide-react';
import { QuestionEditor } from './QuestionEditor';
import { BulkImportModal } from './BulkImportModal';
import { QuizPreview } from './QuizPreview';
import type { CreateQuizQuestionInput, QuizQuestion } from '@/types/quiz';
import { createEmptyQuestion, questionsToCSV } from '@/types/quiz';
import { cn } from '@/lib/utils';

export interface QuizBuilderProps {
  topicId: string;
  initialQuestions?: QuizQuestion[];
  onSave?: (questions: CreateQuizQuestionInput[]) => Promise<void>;
  onCancel?: () => void;
}

export function QuizBuilder({
  topicId,
  initialQuestions = [],
  onSave,
  onCancel,
}: QuizBuilderProps) {
  const [questions, setQuestions] = useState<CreateQuizQuestionInput[]>(() =>
    initialQuestions.map((q) => ({
      topicId: q.topicId,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      correctAnswers: q.correctAnswers,
      explanation: q.explanation,
      difficulty: q.difficulty,
      points: q.points,
      codeLanguage: q.questionType === 'code' ? q.codeLanguage : undefined,
      isPublic: q.isPublic,
    }))
  );
  const [showPreview, setShowPreview] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, createEmptyQuestion('multiple_choice_single')]);
  };

  const handleQuestionChange = (index: number, question: CreateQuizQuestionInput) => {
    const newQuestions = [...questions];
    newQuestions[index] = question;
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      // Set topicId for all questions
      const questionsWithTopic = questions.map((q) => ({
        ...q,
        topicId,
      }));
      await onSave(questionsWithTopic);
    } catch (error) {
      console.error('Failed to save questions:', error);
      alert('Failed to save questions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    // Convert questions to CSV
    const csv = questionsToCSV(
      questions.map((q, index) => ({
        ...q,
        id: `temp-${index}`,
        topicId: topicId,
        createdBy: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as QuizQuestion[]
    );

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-questions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkImportComplete = (importedQuestions: CreateQuizQuestionInput[]) => {
    setQuestions([...questions, ...importedQuestions]);
    setShowBulkImport(false);
  };

  const hasValidQuestions = questions.length > 0 && questions.every((q) => q.questionText.length >= 10);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quiz Builder</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage quiz questions for this topic
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <button
          onClick={handleAddQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Question
        </button>

        <button
          onClick={() => setShowBulkImport(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Bulk Import
        </button>

        {questions.length > 0 && (
          <>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>

            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Eye className="h-4 w-4" />
              Preview Quiz
            </button>
          </>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </span>

          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={!hasValidQuestions || isSaving}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              hasValidQuestions && !isSaving
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No questions yet. Add your first question to get started.
          </p>
          <button
            onClick={handleAddQuestion}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Question
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question, index) => (
            <QuestionEditor
              key={index}
              question={question}
              questionNumber={index + 1}
              onChange={(updatedQuestion) => handleQuestionChange(index, updatedQuestion)}
              onDelete={() => handleDeleteQuestion(index)}
            />
          ))}
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImportModal
          topicId={topicId}
          isOpen={showBulkImport}
          onClose={() => setShowBulkImport(false)}
          onImportComplete={handleBulkImportComplete}
        />
      )}

      {/* Quiz Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Quiz Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <QuizPreview
                questions={questions.map((q, index) => ({
                  ...q,
                  id: `temp-${index}`,
                  topicId: topicId,
                  createdBy: '',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })) as any}
                showCorrectAnswers={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
