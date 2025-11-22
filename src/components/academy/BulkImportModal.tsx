/**
 * Bulk Import Modal Component
 * ACAD-010
 *
 * Handles CSV/JSON bulk import of quiz questions
 */

'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreateQuizQuestionInput, BulkImportQuestion } from '@/types/quiz';
import { parseCSVRow } from '@/types/quiz';

export interface BulkImportModalProps {
  topicId: string;
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (questions: CreateQuizQuestionInput[]) => void;
}

export function BulkImportModal({
  topicId,
  isOpen,
  onClose,
  onImportComplete,
}: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parsedQuestions, setParsedQuestions] = useState<CreateQuizQuestionInput[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setParseErrors([]);
    setParsedQuestions([]);
    setIsProcessing(true);

    try {
      const fileType = selectedFile.name.endsWith('.json') ? 'json' : 'csv';
      const text = await selectedFile.text();

      if (fileType === 'json') {
        // Parse JSON
        const data = JSON.parse(text) as BulkImportQuestion[];
        const questions = data.map((q) => ({
          topicId: topicId,
          questionText: q.question_text,
          questionType: q.question_type,
          options: q.options,
          correctAnswers: q.correct_answers,
          explanation: q.explanation || null,
          difficulty: q.difficulty || 'medium',
          points: q.points || 1,
          codeLanguage: q.code_language,
          isPublic: q.is_public || false,
        }));
        setParsedQuestions(questions as CreateQuizQuestionInput[]);
      } else {
        // Parse CSV
        const lines = text.split('\n').filter((line) => line.trim());
        const errors: string[] = [];
        const questions: CreateQuizQuestionInput[] = [];

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          try {
            // Simple CSV parsing (not production-grade)
            const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
            const parsed = parseCSVRow(values);

            if (parsed) {
              questions.push({
                topicId: topicId,
                questionText: parsed.question_text,
                questionType: parsed.question_type,
                options: parsed.options,
                correctAnswers: parsed.correct_answers,
                explanation: parsed.explanation || null,
                difficulty: parsed.difficulty || 'medium',
                points: parsed.points || 1,
                codeLanguage: parsed.code_language,
                isPublic: parsed.is_public || false,
              } as CreateQuizQuestionInput);
            } else {
              errors.push(`Line ${i + 1}: Failed to parse question`);
            }
          } catch (error) {
            errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
          }
        }

        setParsedQuestions(questions);
        setParseErrors(errors);
      }
    } catch (error) {
      setParseErrors([error instanceof Error ? error.message : 'Failed to parse file']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    onImportComplete(parsedQuestions);
  };

  const handleDownloadTemplate = () => {
    const template = `question_text,question_type,options,correct_answers,difficulty,points,explanation,code_language,is_public
"What is 2+2?",multiple_choice_single,"[""2"",""3"",""4"",""5""]","[2]",easy,1,"The answer is 4",,false
"Which are prime numbers?",multiple_choice_multiple,"[""2"",""3"",""4"",""5""]","[0,1,3]",medium,2,"2, 3, and 5 are prime numbers",,false
"JavaScript is a compiled language",true_false,"[""True"",""False""]","[1]",easy,1,"JavaScript is an interpreted language",,false`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-questions-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Bulk Import Questions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium mb-2">Import Instructions</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Supported formats: CSV, JSON</li>
              <li>CSV must include header row</li>
              <li>Options and correct_answers must be JSON arrays</li>
              <li>Download template below for correct format</li>
            </ul>
            <button
              onClick={handleDownloadTemplate}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Download CSV Template
            </button>
          </div>

          {/* File Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              file
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  handleFileSelect(selectedFile);
                }
              }}
              className="hidden"
            />

            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">CSV or JSON file</p>
              </>
            )}
          </div>

          {/* Processing */}
          {isProcessing && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400">Processing file...</p>
            </div>
          )}

          {/* Parse Errors */}
          {parseErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-800 dark:text-red-200 mb-2">
                    Parse Errors ({parseErrors.length})
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 max-h-32 overflow-y-auto">
                    {parseErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Success */}
          {parsedQuestions.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-800 dark:text-green-200">
                  Successfully parsed {parsedQuestions.length} question
                  {parsedQuestions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t p-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={parsedQuestions.length === 0}
            className={cn(
              'px-4 py-2 rounded-lg transition-colors',
              parsedQuestions.length > 0
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
          >
            Import {parsedQuestions.length} Question{parsedQuestions.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
