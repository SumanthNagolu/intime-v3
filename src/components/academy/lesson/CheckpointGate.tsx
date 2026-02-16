'use client'

import React, { useState, useCallback } from 'react'
import { ShieldCheck, CheckCircle, XCircle, ChevronRight, Lightbulb } from 'lucide-react'
import type { Checkpoint, CheckpointQuestion } from '@/lib/academy/types'

interface CheckpointGateProps {
  checkpoint: Checkpoint
  completedIds: string[]
  onComplete: (checkpointId: string) => void
  questionNumber?: number
  totalQuestions?: number
}

export function CheckpointGate({ checkpoint, completedIds, onComplete, questionNumber, totalQuestions }: CheckpointGateProps) {
  const isAlreadyCompleted = completedIds.includes(checkpoint.id)
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isFinished, setIsFinished] = useState(isAlreadyCompleted)

  const question = checkpoint.questions[currentQ]
  const isCorrect = selectedAnswer === question?.correctIndex

  const handleAnswer = useCallback((index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }, [showResult])

  const handleCheck = useCallback(() => {
    if (selectedAnswer === null) return
    setShowResult(true)
    if (selectedAnswer === question.correctIndex) {
      setCorrectCount((c) => c + 1)
    }
  }, [selectedAnswer, question])

  const handleNext = useCallback(() => {
    if (currentQ < checkpoint.questions.length - 1) {
      setCurrentQ((c) => c + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setIsFinished(true)
      onComplete(checkpoint.id)
    }
  }, [currentQ, checkpoint, onComplete])

  if (isFinished) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50/50 p-6" id={`checkpoint-${checkpoint.id}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-green-900 text-sm">Checkpoint Passed</h4>
            <p className="text-xs text-green-700">
              {isAlreadyCompleted
                ? 'Previously completed'
                : `${correctCount}/${checkpoint.questions.length} correct`}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl border-2 border-gold-300 bg-gradient-to-br from-gold-50/80 to-amber-50/40 shadow-elevation-sm overflow-hidden"
      id={`checkpoint-${checkpoint.id}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gold-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-gold-700" />
          </div>
          <div>
            <h4 className="font-heading font-semibold text-charcoal-900 text-sm">
              Knowledge Check{questionNumber != null ? ` ${questionNumber}` : ''}
            </h4>
            <p className="text-xs text-charcoal-500">
              {totalQuestions != null
                ? `Question ${questionNumber} of ${totalQuestions}`
                : `Question ${currentQ + 1} of ${checkpoint.questions.length}`}
            </p>
          </div>
        </div>
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {checkpoint.questions.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < currentQ
                  ? 'bg-green-500'
                  : i === currentQ
                    ? 'bg-gold-500'
                    : 'bg-charcoal-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Question */}
        <p className="font-medium text-charcoal-900 leading-relaxed">
          {question.question}
        </p>

        {/* Options */}
        <div className="space-y-2.5">
          {question.options.map((option, i) => {
            let optionStyle = 'border-charcoal-200 bg-white hover:border-charcoal-300 hover:bg-charcoal-50'
            if (selectedAnswer === i && !showResult) {
              optionStyle = 'border-gold-400 bg-gold-50 ring-2 ring-gold-200'
            }
            if (showResult) {
              if (i === question.correctIndex) {
                optionStyle = 'border-green-400 bg-green-50 ring-2 ring-green-200'
              } else if (i === selectedAnswer && i !== question.correctIndex) {
                optionStyle = 'border-red-300 bg-red-50 ring-2 ring-red-200'
              } else {
                optionStyle = 'border-charcoal-200 bg-charcoal-50 opacity-60'
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={showResult}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all duration-200 ${optionStyle}`}
              >
                <span
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    showResult && i === question.correctIndex
                      ? 'border-green-500 bg-green-500 text-white'
                      : showResult && i === selectedAnswer
                        ? 'border-red-400 bg-red-400 text-white'
                        : selectedAnswer === i
                          ? 'border-gold-500 bg-gold-500 text-white'
                          : 'border-charcoal-300 text-charcoal-500'
                  }`}
                >
                  {showResult && i === question.correctIndex ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : showResult && i === selectedAnswer ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span className="text-sm text-charcoal-800">{option}</span>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {showResult && question.explanation && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800 leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        {/* Action button */}
        <div className="flex justify-end">
          {!showResult ? (
            <button
              onClick={handleCheck}
              disabled={selectedAnswer === null}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-charcoal-900 text-white text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold-500 text-white text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              {currentQ < checkpoint.questions.length - 1 ? 'Next Question' : 'Complete Checkpoint'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
