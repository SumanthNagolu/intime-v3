/**
 * AI Mentor Quick Access Widget Component
 * ACAD-019
 *
 * Quick access to AI mentor with suggested prompts and recent conversations
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Sparkles, ArrowRight, Clock, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface RecentConversation {
  id: string;
  title: string;
  last_message_at: string;
  topic: string;
}

interface AIMentorQuickAccessProps {
  recentConversations?: RecentConversation[];
  isLoading?: boolean;
}

export function AIMentorQuickAccess({ recentConversations, isLoading }: AIMentorQuickAccessProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const suggestedPrompts = [
    {
      id: 'explain',
      icon: '💡',
      text: 'Explain a concept',
      prompt: 'Can you explain...',
      category: 'Learning',
    },
    {
      id: 'debug',
      icon: '🐛',
      text: 'Debug my code',
      prompt: 'Help me debug this code...',
      category: 'Coding',
    },
    {
      id: 'practice',
      icon: '🎯',
      text: 'Practice questions',
      prompt: 'Give me practice questions on...',
      category: 'Practice',
    },
    {
      id: 'career',
      icon: '💼',
      text: 'Career advice',
      prompt: 'What career paths...',
      category: 'Career',
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Mentor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Chat Button */}
        <Link href="/academy/ai-mentor">
          <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <MessageSquare className="h-4 w-4 mr-2" />
            Start New Chat
          </Button>
        </Link>

        {/* Suggested Prompts */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Quick Start
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {suggestedPrompts.map((prompt) => (
              <Link
                key={prompt.id}
                href={`/academy/ai-mentor?prompt=${encodeURIComponent(prompt.prompt)}`}
              >
                <button
                  className="w-full p-2 rounded-lg border bg-card hover:bg-accent transition-colors text-left"
                  onClick={() => setSelectedPrompt(prompt.id)}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{prompt.icon}</span>
                      <span className="text-xs font-medium truncate">{prompt.text}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs w-fit">
                      {prompt.category}
                    </Badge>
                  </div>
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        {recentConversations && recentConversations.length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Recent Chats
                </span>
              </div>
              <Link href="/academy/ai-mentor/history">
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {recentConversations.slice(0, 3).map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/academy/ai-mentor/${conversation.id}`}
                  className="block"
                >
                  <div className="p-2 rounded-lg border bg-card hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {conversation.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {conversation.topic}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(conversation.last_message_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="pt-3 border-t">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
            <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Ask me anything about Guidewire, career advice, or get help with coding problems!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
