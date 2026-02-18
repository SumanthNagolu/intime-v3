'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  Loader2,
  Sparkles,
  User,
  Bot,
  Trash2,
  MessageSquarePlus,
  BookOpen,
  Lightbulb,
  FileText,
  Video,
  Presentation,
  GraduationCap,
} from 'lucide-react'
import type { GuruMessage, GuruSession } from '@/lib/academy/types'
import { generateGuruResponse, getQuickTopicSuggestions } from '@/lib/academy/guru-service'
import { useAcademyStore } from '@/lib/academy/progress-store'

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getSourceIcon(sourceType: string) {
  switch (sourceType) {
    case 'video_transcript':
      return <Video className="w-3 h-3" />
    case 'official_guide':
      return <FileText className="w-3 h-3" />
    case 'ppt_content':
      return <Presentation className="w-3 h-3" />
    case 'slide_ocr':
      return <Presentation className="w-3 h-3" />
    case 'interview_prep':
      return <GraduationCap className="w-3 h-3" />
    default:
      return <FileText className="w-3 h-3" />
  }
}

function formatSourceType(sourceType: string): string {
  switch (sourceType) {
    case 'video_transcript': return 'Video'
    case 'official_guide': return 'Guide'
    case 'ppt_content': return 'Slides'
    case 'slide_ocr': return 'Slides'
    case 'interview_prep': return 'Interview Prep'
    default: return sourceType
  }
}

function deduplicateSources(
  sources: { source_type: string; chapter?: string; chapter_title?: string; score: number }[]
) {
  const seen = new Set<string>()
  return sources.filter((s) => {
    const key = `${s.source_type}:${s.chapter_title || s.source_type}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

interface GuruChatProps {
  compact?: boolean
  fullScreen?: boolean
}

export function GuruChat({ compact = false, fullScreen = false }: GuruChatProps) {
  const { currentLesson } = useAcademyStore()

  const [sessions, setSessions] = useState<GuruSession[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('gw-guru-sessions')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    () => sessions[0]?.id ?? null
  )
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null
  const suggestions = getQuickTopicSuggestions(currentLesson ?? undefined)

  // Persist sessions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gw-guru-sessions', JSON.stringify(sessions))
    }
  }, [sessions])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages])

  const createSession = useCallback(() => {
    const session: GuruSession = {
      id: createId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }
    setSessions((prev) => [session, ...prev])
    setActiveSessionId(session.id)
    setInput('')
  }, [])

  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (activeSessionId === sessionId) {
        setActiveSessionId(sessions.find((s) => s.id !== sessionId)?.id ?? null)
      }
    },
    [activeSessionId, sessions]
  )

  const sendMessage = useCallback(
    async (messageText?: string) => {
      const text = (messageText ?? input).trim()
      if (!text || isThinking) return

      let sessionId = activeSessionId
      if (!sessionId) {
        const session: GuruSession = {
          id: createId(),
          title: text.slice(0, 50),
          messages: [],
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        }
        setSessions((prev) => [session, ...prev])
        sessionId = session.id
        setActiveSessionId(sessionId)
      }

      const userMessage: GuruMessage = {
        id: createId(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
        lessonContext: currentLesson ?? undefined,
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: [...s.messages, userMessage],
                title:
                  s.messages.length === 0
                    ? text.slice(0, 50)
                    : s.title,
                lastModified: new Date().toISOString(),
              }
            : s
        )
      )

      setInput('')
      setIsThinking(true)

      try {
        const currentSession = sessions.find((s) => s.id === sessionId)
        const history = currentSession?.messages ?? []

        const response = await generateGuruResponse(
          [...history, userMessage],
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

        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [...s.messages, guruMessage],
                  lastModified: new Date().toISOString(),
                }
              : s
          )
        )
      } catch (err) {
        const errorMessage: GuruMessage = {
          id: createId(),
          role: 'guru',
          content:
            'Sorry, I encountered an error. Please check your API key and try again.',
          timestamp: new Date().toISOString(),
        }

        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [...s.messages, errorMessage],
                  lastModified: new Date().toISOString(),
                }
              : s
          )
        )
      } finally {
        setIsThinking(false)
      }
    },
    [input, isThinking, activeSessionId, sessions, currentLesson]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={`flex ${fullScreen ? 'h-full' : compact ? 'h-full' : 'h-[calc(100vh-220px)]'} ${fullScreen ? '' : 'rounded-xl border border-charcoal-200/60 shadow-elevation-sm'} bg-white overflow-hidden`}>
      {/* Session sidebar - hidden in compact mode */}
      {!compact && <div className="w-56 border-r border-charcoal-100 flex flex-col bg-charcoal-50/50">
        <div className="p-3 border-b border-charcoal-100">
          <button
            onClick={createSession}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-charcoal-900 text-white text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-1.5">
          {sessions.length === 0 && (
            <div className="px-3 py-6 text-center">
              <Bot className="w-6 h-6 text-charcoal-300 mx-auto mb-1.5" />
              <p className="text-[10px] text-charcoal-400">
                No conversations yet
              </p>
            </div>
          )}
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors group ${
                activeSessionId === session.id
                  ? 'bg-charcoal-100'
                  : 'hover:bg-charcoal-100/50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-charcoal-800 truncate font-medium">
                  {session.title}
                </p>
                <p className="text-[10px] text-charcoal-400 mt-0.5">
                  {session.messages.length} messages
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteSession(session.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
      </div>}

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-charcoal-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-charcoal-900 text-xs">
              Guidewire Guru
            </h2>
            <p className="text-[10px] text-charcoal-500">
              {currentLesson
                ? `Context: Current lesson active`
                : 'Ask anything about Guidewire'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {!activeSession || activeSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gold-600" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="font-heading font-semibold text-charcoal-900 text-base">
                  Guidewire Guru
                </h3>
                <p className="text-xs text-charcoal-500 max-w-sm">
                  Your expert Guidewire mentor. Ask about PolicyCenter,
                  ClaimCenter, BillingCenter, Gosu programming, or anything
                  related to your training.
                </p>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
                {suggestions.slice(0, 4).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-charcoal-200 text-[11px] text-charcoal-600 hover:bg-charcoal-50 hover:border-charcoal-300 transition-all"
                  >
                    <Lightbulb className="w-3 h-3 text-gold-500" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {activeSession.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${
                    msg.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {msg.role === 'guru' && (
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 ${
                      msg.role === 'user'
                        ? 'bg-charcoal-900 text-white'
                        : 'bg-charcoal-50 text-charcoal-800 border border-charcoal-100'
                    }`}
                  >
                    <div className="text-xs leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    {msg.lessonContext && (
                      <div className="flex items-center gap-1 mt-2 opacity-60">
                        <BookOpen className="w-3 h-3" />
                        <span className="text-[10px]">
                          Context: {msg.lessonContext}
                        </span>
                      </div>
                    )}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-charcoal-200/40">
                        <div className="flex items-center gap-1 mb-1">
                          <BookOpen className="w-3 h-3 text-charcoal-400" />
                          <span className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider">
                            Sources
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {deduplicateSources(msg.sources).map((src, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-charcoal-100 text-[10px] text-charcoal-500"
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
                    <div className="w-6 h-6 rounded-md bg-charcoal-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3 h-3 text-charcoal-600" />
                    </div>
                  )}
                </div>
              ))}
              {isThinking && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-charcoal-50 rounded-lg px-3 py-2 border border-charcoal-100">
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 text-gold-500 animate-spin" />
                      <span className="text-xs text-charcoal-500">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-charcoal-100">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the Guru anything about Guidewire..."
                rows={1}
                className="w-full rounded-lg border border-charcoal-200 bg-white px-3 py-2 pr-10 text-xs text-charcoal-800 placeholder:text-charcoal-400 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all resize-none"
                style={{ minHeight: '36px', maxHeight: '100px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = `${Math.min(target.scrollHeight, 100)}px`
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isThinking}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-charcoal-900 text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
