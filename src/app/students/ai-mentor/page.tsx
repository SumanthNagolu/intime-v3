/**
 * AI Mentor Chat Interface
 * Story: ACAD-020 (UI) + ACAD-013 (Backend Integration)
 *
 * Real-time AI mentor chat with:
 * - OpenAI GPT-4o-mini integration
 * - Streaming responses (optional)
 * - Session-based conversation history
 * - Markdown & code formatting
 * - Feedback system
 * - Context awareness
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Menu, X, Sparkles } from 'lucide-react';
import { ChatMessage } from '@/components/academy/ChatMessage';
import { ChatInput } from '@/components/academy/ChatInput';
import { TypingIndicator } from '@/components/academy/TypingIndicator';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import type { ChatMessage as ChatMessageType } from '@/types/ai-chat';

// Session type from ai-mentor backend
interface ChatSession {
  id: string;
  session_id: string;
  user_id: string;
  topic_id?: string;
  course_id?: string;
  created_at: string;
  last_activity: string;
  total_chats: number;
}

export default function AIMentorPage() {
  const searchParams = useSearchParams();
  const promptParam = searchParams.get('prompt');

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant'; content: string}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries using REAL aiMentor router
  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } =
    trpc.aiMentor.getUserSessions.useQuery(
      { limit: 50 },
      { refetchOnWindowFocus: false }
    );

  const { data: chatHistory, isLoading: historyLoading } =
    trpc.aiMentor.getChatHistory.useQuery(
      { sessionId: activeSessionId!, limit: 50 },
      { enabled: !!activeSessionId, refetchOnWindowFocus: false }
    );

  // Mutations using REAL aiMentor router
  const askMentorMutation = trpc.aiMentor.askMentor.useMutation({
    onSuccess: (data) => {
      // Add AI response to messages
      const assistantMessage: ChatMessageType = {
        id: data.chatId,
        conversation_id: activeSessionId!,
        role: 'assistant',
        content: data.response,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setConversationHistory((prev) => [...prev, { role: 'assistant', content: data.response }]);
      setIsTyping(false);

      // Refetch sessions to update last activity
      refetchSessions();

      toast.success('Response received!');
    },
    onError: (error) => {
      toast.error(`AI Error: ${error.message}`);
      setIsTyping(false);
    },
  });

  const rateChatMutation = trpc.aiMentor.rateChat.useMutation({
    onSuccess: () => {
      toast.success('Thanks for your feedback!');
    },
    onError: (error) => {
      toast.error(`Failed to record feedback: ${error.message}`);
    },
  });

  // Effects
  useEffect(() => {
    if (chatHistory) {
      // Convert chat history to messages format
      const formattedMessages: ChatMessageType[] = chatHistory.map((chat: any) => [
        {
          id: `${chat.id}-user`,
          conversation_id: activeSessionId!,
          role: 'user' as const,
          content: chat.question,
          created_at: chat.created_at,
        },
        {
          id: chat.id,
          conversation_id: activeSessionId!,
          role: 'assistant' as const,
          content: chat.response,
          created_at: chat.created_at,
          feedback: chat.student_rating ? (chat.student_rating >= 4 ? 'positive' : 'negative') : null,
        },
      ]).flat();

      setMessages(formattedMessages);

      // Build conversation history for context
      const history = formattedMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
      setConversationHistory(history);
    }
  }, [chatHistory, activeSessionId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Handle prompt parameter
    if (promptParam && !activeSessionId) {
      handleSendMessage(promptParam);
    }
  }, [promptParam]);

  // Handlers
  const handleNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setConversationHistory([]);
  };

  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.session_id);
  };

  const handleSendMessage = (content: string) => {
    // Generate session ID if none exists
    const sessionId = activeSessionId || crypto.randomUUID();
    if (!activeSessionId) {
      setActiveSessionId(sessionId);
    }

    // Add user message optimistically
    const userMessage: ChatMessageType = {
      id: 'temp-' + Date.now(),
      conversation_id: sessionId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setConversationHistory((prev) => [...prev, { role: 'user', content }]);
    setIsTyping(true);

    // Call real AI mentor
    askMentorMutation.mutate({
      question: content,
      sessionId,
      topicId: null,
      courseId: null,
      conversationHistory,
    });
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    const rating = feedback === 'positive' ? 5 : 2;

    rateChatMutation.mutate({
      chatId: messageId,
      rating,
    });

    // Update message locally
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg))
    );
  };

  return (
    <div className="h-full w-full flex flex-1">
      {/* Sidebar - Session History */}
      <div
        className={`${
          showSidebar ? 'w-80' : 'w-0'
        } transition-all duration-300 overflow-hidden border-r-2 border-gray-200`}
      >
        <div className="h-full flex flex-col bg-gray-50">
          {/* Header */}
          <div className="p-4 border-b">
            <Button onClick={handleNewSession} className="w-full" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Sessions List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {sessionsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : sessions && sessions.length > 0 ? (
                <div className="space-y-1">
                  {sessions.map((session: ChatSession) => (
                    <button
                      key={session.session_id}
                      onClick={() => handleSelectSession(session)}
                      className={`w-full p-3 text-left rounded-lg transition-colors ${
                        activeSessionId === session.session_id
                          ? 'bg-accent'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">
                          Session {session.total_chats} chats
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.last_activity).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No sessions yet</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2"
                    onClick={handleNewSession}
                  >
                    Start your first chat
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b-2 border-gray-200 bg-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">AI Mentor</h1>
                  <p className="text-xs text-muted-foreground">
                    Powered by GPT-4o-mini · Socratic Method
                  </p>
                </div>
              </div>
            </div>
            {activeSessionId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewSession}
              >
                New Chat
              </Button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="max-w-4xl mx-auto p-6">
            {historyLoading && activeSessionId ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to AI Mentor!</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  I'm here to help you learn Guidewire using the Socratic method. I'll guide you to discover answers through questions rather than giving you direct answers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {[
                    {
                      icon: '💡',
                      title: 'Explain Concepts',
                      prompt: 'Can you explain how PolicyCenter rating works?',
                    },
                    {
                      icon: '🐛',
                      title: 'Debug Code',
                      prompt: 'Help me debug this Gosu code...',
                    },
                    {
                      icon: '🎯',
                      title: 'Practice Questions',
                      prompt: 'Give me practice questions on ClaimCenter workflow',
                    },
                    {
                      icon: '💼',
                      title: 'Career Advice',
                      prompt: 'What career paths are available for Guidewire developers?',
                    },
                  ].map((suggestion, index) => (
                    <Card
                      key={index}
                      className="p-4 hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleSendMessage(suggestion.prompt)}
                    >
                      <div className="text-2xl mb-2">{suggestion.icon}</div>
                      <h3 className="font-medium mb-1">{suggestion.title}</h3>
                      <p className="text-sm text-muted-foreground">{suggestion.prompt}</p>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onFeedback={handleFeedback}
                  />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t-2 border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto p-4">
            <ChatInput
              onSend={handleSendMessage}
              disabled={askMentorMutation.isPending}
              isLoading={isTyping || askMentorMutation.isPending}
              placeholder="Ask me anything about Guidewire..."
              maxLength={1000}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
