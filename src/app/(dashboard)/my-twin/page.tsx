'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  MessageSquare,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  X,
  Send,
  Loader2,
} from 'lucide-react';

interface TwinInteraction {
  id: string;
  interaction_type: string;
  response: string;
  was_helpful: boolean | null;
  dismissed: boolean;
  created_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function MyTwinPage() {
  const [briefing, setBriefing] = useState<TwinInteraction | null>(null);
  const [suggestions, setSuggestions] = useState<TwinInteraction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchLatestInteractions();
  }, []);

  async function fetchLatestInteractions() {
    setLoading(true);

    try {
      const response = await fetch('/api/twin/latest');
      const data = await response.json();

      if (data.success) {
        setBriefing(data.briefing);
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!question.trim() || sending) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setSending(true);

    try {
      const response = await fetch('/api/twin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.content }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.answer,
          timestamp: new Date(),
        };

        setChatMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  }

  async function provideFeedback(interactionId: string, wasHelpful: boolean) {
    try {
      await fetch('/api/twin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interactionId, wasHelpful }),
      });

      // Update local state
      if (briefing?.id === interactionId) {
        setBriefing({ ...briefing, was_helpful: wasHelpful });
      }

      setSuggestions((prev) =>
        prev.map((s) => (s.id === interactionId ? { ...s, was_helpful: wasHelpful } : s))
      );
    } catch (error) {
      console.error('Error providing feedback:', error);
    }
  }

  async function dismissSuggestion(interactionId: string) {
    try {
      await fetch('/api/twin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interactionId, dismissed: true }),
      });

      // Remove from local state
      setSuggestions((prev) => prev.filter((s) => s.id !== interactionId));
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">My AI Twin</h1>
          <p className="text-muted-foreground">
            Your personalized AI assistant for daily productivity
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Briefing & Suggestions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Morning Briefing */}
            {briefing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Morning Briefing
                  </CardTitle>
                  <CardDescription>
                    {new Date(briefing.created_at).toLocaleString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap leading-relaxed">{briefing.response}</p>

                  {/* Feedback */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Was this helpful?</span>
                    <Button
                      variant={briefing.was_helpful === true ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => provideFeedback(briefing.id, true)}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={briefing.was_helpful === false ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => provideFeedback(briefing.id, false)}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Proactive Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Proactive Suggestions
                </h2>

                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <p className="flex-1">{suggestion.response}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissSuggestion(suggestion.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Feedback */}
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Helpful?</span>
                        <Button
                          variant={suggestion.was_helpful === true ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => provideFeedback(suggestion.id, true)}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={suggestion.was_helpful === false ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => provideFeedback(suggestion.id, false)}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!briefing && suggestions.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Updates Yet</h3>
                  <p className="text-muted-foreground">
                    Your AI Twin will send you a morning briefing at 9 AM and proactive suggestions
                    throughout the day.
                    <br />
                    In the meantime, ask me anything!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Chat */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Ask Your Twin
                </CardTitle>
                <CardDescription>Get instant answers and guidance</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      <p>Ask me anything about your work!</p>
                      <p className="mt-2">
                        Examples:
                        <br />
                        "What are my priorities today?"
                        <br />
                        "Show me my pending tasks"
                      </p>
                    </div>
                  )}

                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {sending && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask your twin..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="min-h-[60px]"
                    disabled={sending}
                  />
                  <Button onClick={sendMessage} disabled={!question.trim() || sending}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
