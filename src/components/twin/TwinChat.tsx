'use client';

/**
 * Twin Chat Component
 *
 * Reusable chat interface for AI twin interactions.
 * Can be embedded in floating widget, sidebar, or dashboard.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface TwinChatProps {
  /** Initial messages to display */
  initialMessages?: ChatMessage[];
  /** Placeholder text for input */
  placeholder?: string;
  /** Called when user sends a message */
  onSendMessage: (message: string) => Promise<string>;
  /** Show typing indicator */
  isTyping?: boolean;
  /** Maximum height of chat area */
  maxHeight?: string;
  /** Additional class names */
  className?: string;
  /** Show "Ask the Organization" button */
  showAskOrg?: boolean;
  /** Called when "Ask the Organization" is clicked */
  onAskOrg?: () => void;
  /** Compact mode for floating widget */
  compact?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TwinChat({
  initialMessages = [],
  placeholder = 'Ask your AI twin anything...',
  onSendMessage,
  isTyping = false,
  maxHeight = '400px',
  className,
  showAskOrg = false,
  onAskOrg,
  compact = false,
}: TwinChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    // Add loading message
    const loadingId = `loading-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: loadingId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      },
    ]);

    try {
      const response = await onSendMessage(userMessage.content);

      // Replace loading message with actual response
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingId
            ? { ...msg, content: response, isLoading: false }
            : msg
        )
      );
    } catch (error) {
      // Replace loading message with error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingId
            ? {
                ...msg,
                content: 'Sorry, I encountered an error. Please try again.',
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto space-y-4 p-4"
        style={{ maxHeight }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-forest-600" />
            </div>
            <p className="text-charcoal-600 text-sm">
              {compact
                ? 'Ask me anything!'
                : "I'm your AI twin. Ask me anything about your work!"}
            </p>
            {showAskOrg && onAskOrg && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-forest-600"
                onClick={onAskOrg}
              >
                <Bot className="w-4 h-4 mr-2" />
                Ask the Organization
              </Button>
            )}
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                compact={compact}
              />
            ))}
            {isTyping && !messages.some(m => m.isLoading) && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-charcoal-100 p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className={cn(
              'flex-1 resize-none rounded-lg border border-charcoal-200 bg-white px-3 py-2',
              'text-sm text-charcoal-800 placeholder:text-charcoal-400',
              'focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500',
              'disabled:opacity-50'
            )}
            disabled={isSending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="shrink-0"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function MessageBubble({
  message,
  compact,
}: {
  message: ChatMessage;
  compact: boolean;
}) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-2',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      {!compact && (
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
            isUser ? 'bg-forest-100' : 'bg-gold-100'
          )}
        >
          {isUser ? (
            <User className="w-4 h-4 text-forest-600" />
          ) : (
            <Bot className="w-4 h-4 text-gold-600" />
          )}
        </div>
      )}

      {/* Message */}
      <div
        className={cn(
          'rounded-lg px-3 py-2 max-w-[80%]',
          isUser
            ? 'bg-forest-500 text-white'
            : 'bg-charcoal-50 text-charcoal-800',
          message.isLoading && 'animate-pulse'
        )}
      >
        {message.isLoading ? (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-charcoal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-charcoal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-charcoal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center">
        <Bot className="w-4 h-4 text-gold-600" />
      </div>
      <div className="bg-charcoal-50 rounded-lg px-3 py-2">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-charcoal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-charcoal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-charcoal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default TwinChat;
