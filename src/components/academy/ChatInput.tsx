/**
 * Chat Input Component
 * ACAD-020
 *
 * Input field for sending messages with:
 * - Multi-line text input
 * - Send button
 * - File upload support (future)
 * - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
 * - Character counter
 */

'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { validateMessageContent } from '@/types/ai-chat';
import { toast } from 'sonner';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  placeholder = 'Ask me anything...',
  disabled = false,
  isLoading = false,
  maxLength = 5000,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const validation = validateMessageContent(input);

    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    onSend(input.trim());
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !disabled) {
        handleSend();
      }
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const characterCount = input.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isOverLimit = characterCount > maxLength;

  return (
    <div className="border-t bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Character Counter */}
        {isNearLimit && (
          <div className="text-xs text-right mb-2">
            <span className={isOverLimit ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
              {characterCount} / {maxLength}
            </span>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2 items-end">
          {/* File Upload Button (Future Enhancement) */}
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 mb-1"
            disabled={disabled || isLoading}
            title="Attach file (coming soon)"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          {/* Textarea */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className="min-h-[60px] max-h-[200px] resize-none pr-12"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={disabled || isLoading || !input.trim() || isOverLimit}
            size="icon"
            className="flex-shrink-0 mb-1"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {isLoading && (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              AI is thinking...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
