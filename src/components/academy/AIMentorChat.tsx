/**
 * AI Mentor Chat Interface
 * ACAD-013
 *
 * 24/7 AI-powered student mentorship with Socratic prompting
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Star,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConversationMessage } from '@/types/ai-mentor';

export interface AIMentorChatProps {
  topicId?: string | null;
  courseId?: string | null;
  sessionId?: string | null;
  onAsk: (question: string, conversationHistory: ConversationMessage[]) => Promise<{
    chatId: string;
    response: string;
    tokensUsed: number;
    responseTimeMs: number;
    costUsd: number;
  }>;
  onRate?: (chatId: string, rating: number, feedback?: string) => Promise<void>;
  className?: string;
}

interface ChatMessage extends ConversationMessage {
  chatId?: string;
  tokensUsed?: number;
  responseTimeMs?: number;
  rating?: number;
}

export function AIMentorChat({
  topicId,
  courseId,
  sessionId,
  onAsk,
  onRate,
  className,
}: AIMentorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingChatId, setRatingChatId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setError(null);
    const question = input.trim();
    setInput('');

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);

    try {
      // Get conversation history (exclude system messages)
      const conversationHistory = messages.filter((m) => m.role !== 'system');

      // Ask AI mentor
      const response = await onAsk(question, conversationHistory);

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        chatId: response.chatId,
        tokensUsed: response.tokensUsed,
        responseTimeMs: response.responseTimeMs,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');

      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRate = async (chatId: string, rating: number) => {
    if (!onRate) return;

    try {
      await onRate(chatId, rating);

      // Update message with rating
      setMessages((prev) =>
        prev.map((m) => (m.chatId === chatId ? { ...m, rating } : m))
      );

      setRatingChatId(null);
      setRatingValue(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rate response');
    }
  };

  return (
    <div className={cn('flex flex-col h-full max-h-[600px] border rounded-lg', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        <Bot className="h-6 w-6 text-blue-600" />
        <div>
          <h3 className="font-semibold">AI Mentor</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            24/7 Socratic guidance
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Ask me anything!</p>
            <p className="text-sm">
              I'm here to guide you through your learning journey with questions and hints.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            )}

            <div
              className={cn(
                'max-w-[80%] rounded-lg px-4 py-2',
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              )}
            >
              <div className="whitespace-pre-wrap break-words">{message.content}</div>

              {/* Metadata for assistant messages */}
              {message.role === 'assistant' && message.chatId && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    {/* Response time */}
                    {message.responseTimeMs && (
                      <span>{(message.responseTimeMs / 1000).toFixed(1)}s</span>
                    )}

                    {/* Rating */}
                    {message.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{message.rating}/5</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRatingChatId(message.chatId!)}
                        className="text-blue-600 hover:underline"
                      >
                        Rate this
                      </button>
                    )}
                  </div>

                  {/* Rating dialog */}
                  {ratingChatId === message.chatId && (
                    <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded border">
                      <p className="text-xs mb-2">How helpful was this response?</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            onClick={() => {
                              setRatingValue(value);
                              handleRate(message.chatId!, value);
                            }}
                            className="focus:outline-none"
                          >
                            <Star
                              className={cn(
                                'h-5 w-5 transition-colors',
                                value <= ratingValue
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask a question about your coursework..."
            rows={2}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-white transition-colors',
              'bg-blue-600 hover:bg-blue-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-2'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}
