'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  User,
  Mic,
  MicOff,
  BookOpen,
  FileText,
  Video,
  Presentation,
  GraduationCap,
  PhoneCall,
  PhoneOff,
  X,
} from 'lucide-react'
import type { SlideContent } from '@/lib/academy/types'
import type { GuruMessage } from '@/lib/academy/types'
import { generateGuruResponse } from '@/lib/academy/guru-service'
import { useAcademyStore } from '@/lib/academy/progress-store'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface NotesPanelProps {
  slide: SlideContent
  onClose?: () => void
}

export function NotesPanel({ slide, onClose }: NotesPanelProps) {
  const { currentLesson } = useAcademyStore()

  const [messages, setMessages] = useState<GuruMessage[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Conversation mode: continuous voice back-and-forth
  const [conversationMode, setConversationMode] = useState(false)
  const [convState, setConvState] = useState<'idle' | 'speaking' | 'listening' | 'thinking'>('idle')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const lastSlideRef = useRef<number>(-1)
  const conversationModeRef = useRef(false)
  const messagesRef = useRef<GuruMessage[]>([])

  // Keep refs in sync
  useEffect(() => { conversationModeRef.current = conversationMode }, [conversationMode])
  useEffect(() => { messagesRef.current = messages }, [messages])

  const hasSpeechRecognition =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // When slide changes, add a divider
  useEffect(() => {
    if (slide.slideNumber === lastSlideRef.current) return
    lastSlideRef.current = slide.slideNumber

    setMessages((prev) => {
      if (prev.length === 0) return prev
      return [
        ...prev,
        {
          id: createId(),
          role: 'guru' as const,
          content: `--- Slide ${slide.slideNumber}: ${slide.title || 'Next slide'} ---`,
          timestamp: new Date().toISOString(),
        },
      ]
    })
  }, [slide.slideNumber, slide.title])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // -------------------------------------------------------------------------
  // TTS
  // -------------------------------------------------------------------------
  const speakText = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
          resolve()
          return
        }
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.1
        const voices = window.speechSynthesis.getVoices()
        const preferred =
          voices.find((v) => v.name.includes('Google US English')) ||
          voices.find((v) => v.name.includes('Samantha')) ||
          voices.find((v) => v.lang === 'en-US')
        if (preferred) utterance.voice = preferred

        utterance.onstart = () => {
          setIsSpeaking(true)
          setConvState('speaking')
        }
        utterance.onerror = () => {
          setIsSpeaking(false)
          setConvState('idle')
          resolve()
        }
        const keepAlive = setInterval(() => {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause()
            window.speechSynthesis.resume()
          }
        }, 10000)
        utterance.onend = () => {
          clearInterval(keepAlive)
          setIsSpeaking(false)
          resolve()
        }
        window.speechSynthesis.speak(utterance)
      })
    },
    []
  )

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  // -------------------------------------------------------------------------
  // STT
  // -------------------------------------------------------------------------
  const listenForVoice = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!hasSpeechRecognition) {
        reject(new Error('No speech recognition'))
        return
      }
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        setConvState('listening')
      }
      recognition.onend = () => {
        setIsListening(false)
      }
      recognition.onerror = (e: any) => {
        setIsListening(false)
        if (e.error === 'no-speech' || e.error === 'aborted') {
          resolve('')
        } else {
          reject(e)
        }
      }
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        resolve(transcript)
      }

      recognitionRef.current = recognition
      recognition.start()
    })
  }, [hasSpeechRecognition])

  // -------------------------------------------------------------------------
  // Send message and get AI response
  // -------------------------------------------------------------------------
  const sendAndGetResponse = useCallback(
    async (text: string, shouldSpeak: boolean): Promise<string> => {
      const userMessage: GuruMessage = {
        id: createId(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
        lessonContext: currentLesson ?? undefined,
      }
      setMessages((prev) => [...prev, userMessage])
      setIsThinking(true)
      setConvState('thinking')

      try {
        const currentMessages = messagesRef.current
        const response = await generateGuruResponse(
          currentMessages.slice(-8),
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
        setIsThinking(false)

        if (shouldSpeak) {
          await speakText(response.answer)
        }
        return response.answer
      } catch {
        const errorMsg = 'Sorry, I encountered an error. Please try again.'
        setMessages((prev) => [
          ...prev,
          { id: createId(), role: 'guru' as const, content: errorMsg, timestamp: new Date().toISOString() },
        ])
        setIsThinking(false)
        return errorMsg
      }
    },
    [currentLesson, speakText]
  )

  // -------------------------------------------------------------------------
  // Conversation mode loop
  // -------------------------------------------------------------------------
  const runConversationLoop = useCallback(async () => {
    while (conversationModeRef.current) {
      try {
        const transcript = await listenForVoice()
        if (!conversationModeRef.current) break
        if (!transcript.trim()) continue
        await sendAndGetResponse(transcript, true)
        if (!conversationModeRef.current) break
      } catch {
        break
      }
    }
    setConvState('idle')
  }, [listenForVoice, sendAndGetResponse])

  const startConversationMode = useCallback(() => {
    if (!hasSpeechRecognition) return
    setConversationMode(true)
    conversationModeRef.current = true
    setTimeout(() => runConversationLoop(), 100)
  }, [hasSpeechRecognition, runConversationLoop])

  const stopConversationMode = useCallback(() => {
    setConversationMode(false)
    conversationModeRef.current = false
    stopSpeaking()
    recognitionRef.current?.stop()
    setIsListening(false)
    setConvState('idle')
  }, [stopSpeaking])

  // -------------------------------------------------------------------------
  // One-off voice input
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // Text send
  // -------------------------------------------------------------------------
  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || isThinking) return
    stopSpeaking()
    setInput('')
    await sendAndGetResponse(text, false)
  }, [input, isThinking, stopSpeaking, sendAndGetResponse])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      conversationModeRef.current = false
      recognitionRef.current?.stop()
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const convStateLabel = {
    idle: '',
    speaking: 'Speaking...',
    listening: 'Listening...',
    thinking: 'Thinking...',
  }[convState]

  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-[85vw] sm:w-[380px] md:relative md:w-[320px] lg:w-[340px] xl:w-[380px] flex-shrink-0 flex flex-col z-20 md:z-auto bg-white border-l border-warm-light/15"
    >
      {/* Header - Named Sensei Character */}
      <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between border-b border-warm-light/15" style={{ backgroundColor: 'var(--al-cream, #f5efe5)' }}>
        <div className="flex items-center gap-2.5">
          {/* Copper gradient avatar with initials */}
          <div className="relative">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-display font-bold text-xs ${
                conversationMode ? 'ring-2 ring-sage-400' : ''
              }`}
              style={{ background: 'linear-gradient(135deg, #c06830, #e08a4e)' }}
            >
              RK
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-sage-500 border-2 border-white" />
          </div>
          <div>
            <h3 className="text-[11px] font-display font-semibold text-warm-primary leading-tight">
              {conversationMode ? 'Voice Mode' : 'Rajesh Kumar'}
            </h3>
            <p className="font-mono-warm text-[9px] font-medium uppercase text-warm-muted" style={{ letterSpacing: '2px' }}>
              {conversationMode ? convStateLabel : 'Your Guidewire Sensei'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Close button - mobile only */}
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md flex items-center justify-center text-warm-muted hover:text-warm-primary hover:bg-warm-cream md:hidden transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Conversation mode toggle */}
          {hasSpeechRecognition && (
            <button
              onClick={conversationMode ? stopConversationMode : startConversationMode}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                conversationMode
                  ? 'bg-red-100 text-red-600 ring-1 ring-red-200'
                  : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
              }`}
              title={conversationMode ? 'End voice conversation' : 'Start voice conversation'}
            >
              {conversationMode ? <PhoneOff className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Conversation mode active banner */}
      {conversationMode && (
        <div
          className={`px-4 py-2 flex items-center justify-center gap-3 flex-shrink-0 border-b border-warm-light/15 ${
            convState === 'listening'
              ? 'bg-sage-50/60'
              : convState === 'speaking'
                ? 'bg-copper-50/60'
                : 'bg-warm-cream/30'
          }`}
        >
          {/* Animated visualizer */}
          <div className="flex items-end gap-0.5 h-4">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-0.5 rounded-full"
                style={{
                  background: convState === 'listening'
                    ? 'rgb(90, 122, 90)'
                    : convState === 'speaking'
                      ? 'rgb(192, 104, 48)'
                      : 'rgb(184, 176, 164)',
                  height: (convState === 'listening' || convState === 'speaking')
                    ? `${4 + Math.random() * 12}px`
                    : '4px',
                  transition: 'height 0.15s ease',
                  animation: (convState === 'listening' || convState === 'speaking')
                    ? `pulse 0.6s ease-in-out ${i * 80}ms infinite alternate`
                    : 'none',
                }}
              />
            ))}
          </div>
          <span
            className={`font-mono-warm text-[9px] font-medium uppercase ${
              convState === 'listening'
                ? 'text-sage-700'
                : convState === 'speaking'
                  ? 'text-copper-700'
                  : 'text-warm-muted'
            }`}
            style={{ letterSpacing: '2px' }}
          >
            {convStateLabel}
          </span>
        </div>
      )}

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-warm"
      >
        {/* Empty state */}
        {messages.length === 0 && !isThinking && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-60">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-3 text-white font-display font-bold text-lg"
              style={{ background: 'linear-gradient(135deg, #c06830, #e08a4e)' }}
            >
              RK
            </div>
            <p className="font-display font-semibold text-sm text-warm-secondary mb-1">Ask Rajesh</p>
            <p className="font-serif text-[11px] text-warm-muted leading-relaxed">
              Ask questions about this slide, or start a voice conversation
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isDivider = msg.role === 'guru' && msg.content.startsWith('--- Slide ')
          if (isDivider) {
            return (
              <div key={msg.id} className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(192,104,48,0.15), transparent)' }} />
                <span className="font-mono-warm text-[8px] font-medium uppercase text-warm-light" style={{ letterSpacing: '2px' }}>
                  {msg.content.replace(/^---\s*/, '').replace(/\s*---$/, '')}
                </span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(192,104,48,0.15), transparent)' }} />
              </div>
            )
          }

          return (
            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'guru' && (
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-display text-[9px] font-bold"
                  style={{ background: 'linear-gradient(135deg, #c06830, #e08a4e)' }}
                >
                  RK
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  msg.role === 'user'
                    ? 'bg-warm-deep text-white'
                    : 'border text-warm-secondary'
                }`}
                style={msg.role !== 'user' ? { backgroundColor: 'var(--al-cream, #f5efe5)', borderColor: 'var(--al-border, rgba(42,37,32,0.08))' } : undefined}
              >
                <div className="font-serif text-[13px] leading-[1.75] whitespace-pre-wrap">
                  {msg.content}
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-warm-light/20">
                    <div className="flex items-center gap-1 mb-1">
                      <BookOpen className="w-2.5 h-2.5 text-warm-light" />
                      <span className="font-mono-warm text-[8px] font-medium uppercase text-warm-light" style={{ letterSpacing: '2px' }}>
                        Sources
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {msg.sources.map((src, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono-warm text-[8px] bg-warm-cream text-warm-muted"
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
                <div className="w-6 h-6 rounded-md bg-warm-cream flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3 h-3 text-warm-muted" />
                </div>
              )}
            </div>
          )
        })}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-white font-display text-[9px] font-bold"
              style={{ background: 'linear-gradient(135deg, #c06830, #e08a4e)' }}
            >
              RK
            </div>
            <div className="rounded-lg px-3 py-2 border" style={{ backgroundColor: 'var(--al-cream, #f5efe5)', borderColor: 'var(--al-border, rgba(42,37,32,0.08))' }}>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-copper-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
                <span className="font-serif text-[11px] text-warm-muted">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {!conversationMode ? (
        <div className="px-3 py-3 flex-shrink-0 border-t border-warm-light/15" style={{ backgroundColor: 'var(--al-cream, #f5efe5)' }}>
          <div className="flex items-end gap-1.5">
            {hasSpeechRecognition && (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                  isListening
                    ? 'bg-red-100 text-red-600 ring-1 ring-red-200'
                    : 'bg-white text-warm-muted hover:text-warm-secondary hover:bg-warm-cream border border-warm-light/20'
                }`}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            )}

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? 'Listening...' : 'Ask anything...'}
                rows={1}
                className="w-full rounded-lg px-3 py-2 font-serif text-[12px] resize-none focus:outline-none transition-all bg-white border border-warm-light/20 text-warm-primary placeholder:text-warm-light focus:ring-2 focus:ring-copper-500/15 focus:border-copper-400/40"
                style={{
                  minHeight: '36px',
                  maxHeight: '80px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = `${Math.min(target.scrollHeight, 80)}px`
                }}
              />
            </div>

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isThinking}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-20 disabled:cursor-not-allowed ${
                input.trim()
                  ? 'bg-warm-deep text-white hover:bg-warm-primary/90'
                  : 'bg-white text-warm-light border border-warm-light/20'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Conversation mode footer */
        <div className="px-3 py-3 flex-shrink-0 flex items-center justify-center border-t border-warm-light/15" style={{ backgroundColor: 'var(--al-cream, #f5efe5)' }}>
          <button
            onClick={stopConversationMode}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:scale-105 bg-red-100 text-red-700 ring-1 ring-red-200"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="font-serif text-xs font-medium">End Conversation</span>
          </button>
        </div>
      )}
    </div>
  )
}
