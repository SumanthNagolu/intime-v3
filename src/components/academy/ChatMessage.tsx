/**
 * Chat Message Component
 * ACAD-020
 *
 * Displays individual chat messages with:
 * - Markdown rendering
 * - Code syntax highlighting
 * - Copy code button
 * - Thumbs up/down feedback
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Copy, Check, User, Sparkles } from 'lucide-react';
import { ChatMessage as ChatMessageType, formatMessageTimestamp } from '@/types/ai-chat';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: ChatMessageType;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
  theme?: 'light' | 'dark';
}

export function ChatMessage({ message, onFeedback, theme = 'light' }: ChatMessageProps) {
  const [copiedCode, setCopiedCode] = useState<number | null>(null);
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(index);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleFeedback = (feedback: 'positive' | 'negative') => {
    if (onFeedback) {
      onFeedback(message.id, feedback);
      toast.success(`Thanks for your feedback!`);
    }
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {message.content}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <Card
          className={`p-4 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border'
          }`}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  const codeIndex = Math.random(); // Unique index for each code block

                  if (!inline && match) {
                    return (
                      <div className="relative group">
                        <div className="flex items-center justify-between bg-muted px-3 py-2 rounded-t-md border-b">
                          <span className="text-xs font-medium text-muted-foreground">
                            {match[1]}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => handleCopyCode(codeString, codeIndex)}
                          >
                            {copiedCode === codeIndex ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                <span className="text-xs">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                <span className="text-xs">Copy</span>
                              </>
                            )}
                          </Button>
                        </div>
                        <SyntaxHighlighter
                          style={theme === 'dark' ? vscDarkPlus : vs}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-b-md !mt-0"
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  return (
                    <code
                      className={`${isUser ? 'bg-primary-foreground/10' : 'bg-muted'} px-1.5 py-0.5 rounded text-sm font-mono`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre({ children }) {
                  return <>{children}</>;
                },
                p({ children }) {
                  return <p className="mb-2 last:mb-0">{children}</p>;
                },
                ul({ children }) {
                  return <ul className="list-disc pl-4 mb-2">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal pl-4 mb-2">{children}</ol>;
                },
                li({ children }) {
                  return <li className="mb-1">{children}</li>;
                },
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </Card>

        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {formatMessageTimestamp(message.created_at)}
          </span>

          {!isUser && onFeedback && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${
                  message.feedback === 'positive' ? 'text-green-600' : 'text-muted-foreground'
                }`}
                onClick={() => handleFeedback('positive')}
                disabled={message.feedback !== null}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${
                  message.feedback === 'negative' ? 'text-red-600' : 'text-muted-foreground'
                }`}
                onClick={() => handleFeedback('negative')}
                disabled={message.feedback !== null}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}
