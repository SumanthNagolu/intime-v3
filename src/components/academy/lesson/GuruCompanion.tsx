'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  X,
  Send,
  Loader2,
  Sparkles,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Lightbulb,
  BookOpen,
  FileText,
  Video,
  Presentation,
  GraduationCap,
} from 'lucide-react'
import type { GuruMessage } from '@/lib/academy/types'
import { generateGuruResponse } from '@/lib/academy/guru-service'
import { useAcademyStore } from '@/lib/academy/progress-store'

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getSourceIcon(sourceType: string) {
  switch (sourceType) {
    case 'video_transcript': return <Video className="w-3 h-3" />
    case 'official_guide': return <FileText className="w-3 h-3" />
    case 'ppt_content':
    case 'slide_ocr': return <Presentation className="w-3 h-3" />
    case 'interview_prep': return <GraduationCap className="w-3 h-3" />
    default: return <FileText className="w-3 h-3" />
  }
}

function formatSourceType(sourceType: string): string {
  switch (sourceType) {
    case 'video_transcript': return 'Video'
    case 'official_guide': return 'Guide'
    case 'ppt_content':
    case 'slide_ocr': return 'Slides'
    case 'interview_prep': return 'Interview Prep'
    default: return sourceType
  }
}

interface GuruCompanionProps {
  isOpen: boolean
  onClose: () => void
  slideTitle?: string
  slideNumber?: number
}

export function GuruCompanion({ isOpen, onClose, slideTitle, slideNumber }: GuruCompanionProps) {
  const { currentLesson } = useAcademyStore()

  const [messages, setMessages] = useState<GuruMessage[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  const hasSpeechRecognition =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // TTS for guru responses
  const speakResponse = useCallback(
    (text: string) => {
      if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.1

      const voices = window.speechSynthesis.getVoices()
      const preferred =
        voices.find((v) => v.name.includes('Google US English')) ||
        voices.find((v) => v.name.includes('Samantha')) ||
        voices.find((v) => v.lang === 'en-US')
      if (preferred) utterance.voice = preferred

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      // Chrome keep-alive workaround
      const keepAlive = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause()
          window.speechSynthesis.resume()
        }
      }, 10000)
      utterance.onend = () => {
        clearInterval(keepAlive)
        setIsSpeaking(false)
      }

      window.speechSynthesis.speak(utterance)
    },
    [voiceEnabled]
  )

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  // Voice input
  const startListening = useCallback(() => {
    if (!hasSpeechRecognition) return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [hasSpeechRecognition])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  // Send message
  const sendMessage = useCallback(
    async (messageText?: string) => {
      const text = (messageText ?? input).trim()
      if (!text || isThinking) return

      stopSpeaking()

      const userMessage: GuruMessage = {
        id: createId(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
        lessonContext: currentLesson ?? undefined,
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsThinking(true)

      try {
        const response = await generateGuruResponse(
          messages.slice(-8),
          text,
          currentLesson ?? undefined
        )

        const guruMessage: GuruMessage = {
          id: createId(),
          role: 'guru',
          content: response.answer,
          timestamp: new Date().toISOString(),
          sources: response.sources.length > 0 ? response.sources : undefined,
        }

        setMessages((prev) => [...prev, guruMessage])
        speakResponse(response.answer)
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: 'guru' as const,
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date().toISOString(),
          },
        ])
      } finally {
        setIsThinking(false)
      }
    },
    [input, isThinking, messages, currentLesson, speakResponse, stopSpeaking]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Quick actions
  const quickActions = [
    slideTitle ? `Explain "${slideTitle}"` : 'Explain this concept',
    'Quiz me on this',
    'Give a real-world example',
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[440px] max-w-[92vw] bg-white shadow-[−20px_0_60px_rgba(0,0,0,0.15)] transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-charcoal-100 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-bold text-charcoal-900 text-sm">
              Guidewire Guru
            </h2>
            {slideNumber && slideTitle ? (
              <p className="text-[10px] text-charcoal-500 truncate mt-0.5">
                Slide {slideNumber}: {slideTitle}
              </p>
            ) : (
              <p className="text-[10px] text-charcoal-500 mt-0.5">
                Ask anything about Guidewire
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Voice toggle */}
            <button
              onClick={() => {
                if (isSpeaking) stopSpeaking()
                setVoiceEnabled((v) => !v)
              }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                voiceEnabled
                  ? 'text-gold-600 bg-gold-50'
                  : 'text-charcoal-400 hover:bg-charcoal-100'
              }`}
              title={voiceEnabled ? 'Mute voice responses' : 'Enable voice responses'}
            >
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-charcoal-400 flex items-center justify-center hover:bg-charcoal-100 hover:text-charcoal-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && !isThinking ? (
            <div className="flex flex-col items-center justify-center h-full space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-gold-600" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="font-heading font-semibold text-charcoal-900 text-base">
                  Hi, I&apos;m your Guru
                </h3>
                <p className="text-xs text-charcoal-500 max-w-[260px] leading-relaxed">
                  Ask me anything about this lesson, PolicyCenter, or Guidewire concepts.
                </p>
              </div>

              {/* Quick actions */}
              <div className="flex flex-col gap-2 w-full max-w-[280px]">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => sendMessage(action)}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-charcoal-200 text-xs text-charcoal-600 hover:bg-charcoal-50 hover:border-charcoal-300 transition-all text-left"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                    <span>{action}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.role === 'guru' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-3.5 py-2.5 ${
                      msg.role === 'user'
                        ? 'bg-charcoal-900 text-white'
                        : 'bg-charcoal-50 text-charcoal-800 border border-charcoal-100'
                    }`}
                  >
                    <div className="text-[13px] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-charcoal-200/40">
                        <div className="flex items-center gap-1 mb-1">
                          <BookOpen className="w-2.5 h-2.5 text-charcoal-400" />
                          <span className="text-[9px] font-semibold text-charcoal-400 uppercase tracking-wider">
                            Sources
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {msg.sources.map((src, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-charcoal-100 text-[9px] text-charcoal-500"
                            >
                              {getSourceIcon(src.source_type)}
                              {src.chapter_title || formatSourceType(src.source_type)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-charcoal-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-charcoal-600" />
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking indicator */}
              {isThinking && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-charcoal-50 rounded-xl px-3.5 py-2.5 border border-charcoal-100">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-charcoal-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Speaking indicator */}
              {isSpeaking && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-50 border border-gold-200 w-fit">
                  <div className="flex items-end gap-0.5 h-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-gold-500 rounded-full animate-pulse"
                        style={{
                          height: `${6 + Math.random() * 6}px`,
                          animationDelay: `${i * 100}ms`,
                          animationDuration: '0.6s',
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-gold-700">Speaking...</span>
                  <button
                    onClick={stopSpeaking}
                    className="text-gold-600 hover:text-gold-800"
                  >
                    <VolumeX className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="px-5 py-4 border-t border-charcoal-100 flex-shrink-0">
          <div className="flex items-end gap-2">
            {/* Mic button */}
            {hasSpeechRecognition && (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                  isListening
                    ? 'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse'
                    : 'bg-charcoal-100 text-charcoal-500 hover:bg-charcoal-200'
                }`}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? 'Listening...' : 'Ask the Guru...'}
                rows={1}
                className="w-full rounded-xl border border-charcoal-200 bg-white px-4 py-2.5 pr-11 text-sm text-charcoal-800 placeholder:text-charcoal-400 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all resize-none"
                style={{ minHeight: '40px', maxHeight: '100px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = `${Math.min(target.scrollHeight, 100)}px`
                }}
              />
            </div>

            {/* Send */}
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isThinking}
              className="w-10 h-10 rounded-xl bg-charcoal-900 text-white flex items-center justify-center transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
