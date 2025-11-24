/**
 * AI Mentor Chat Interface
 * Story: ACAD-020 (UI) + ACAD-013 (Backend Integration)
 * Design System V2 (Ivory/Forest/Rust)
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

import { useState, useEffect, useRef, Suspense } from 'react';
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

function AIMentorContent() {
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
    <div className="h-full w-full flex font-body">
      {/* Sidebar - Session History */}
      <div
        className={`${
          showSidebar ? 'w-80' : 'w-0'
        } transition-all duration-300 overflow-hidden border-r border-gray-200 bg-white shadow-sm z-10`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <Button onClick={handleNewSession} className="w-full btn-primary" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Sessions List */}
          <ScrollArea className="flex-1 bg-gray-50/50">
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
                      className={`w-full p-3 text-left transition-all rounded-lg border border-transparent ${
                        activeSessionId === session.session_id
                          ? 'bg-white shadow-sm border-gray-200 text-forest-700'
                          : 'hover:bg-white hover:border-gray-200 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            activeSessionId === session.session_id ? 'bg-forest-100 text-forest-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                            <Sparkles className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-medium truncate">
                          Session {session.total_chats} chats
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 pl-8">
                        {new Date(session.last_activity).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm text-gray-500">No sessions yet</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 text-forest-600"
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
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur p-4 flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-gray-500 hover:text-forest-600 hover:bg-forest-50"
              >
                {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest-100 border-2 border-white shadow-sm flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-forest-600" />
                </div>
                <div>
                  <h1 className="text-lg font-heading font-bold text-charcoal leading-none mb-1">AI Mentor</h1>
                  <p className="text-xs text-gray-500 font-medium">
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
                className="border-gray-200 hover:border-forest-500 hover:text-forest-600"
              >
                New Chat
              </Button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="max-w-4xl mx-auto p-6 min-h-full">
            {historyLoading && activeSessionId ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 min-h-full flex flex-col justify-center items-center">
                <div className="w-24 h-24 bg-white border-2 border-forest-100 rounded-full flex items-center justify-center mb-8 shadow-sm">
                  <Sparkles className="w-12 h-12 text-forest-500" />
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-charcoal mb-6">Welcome to AI Mentor!</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-12 max-w-2xl">
                  I'm here to help you learn Guidewire using the Socratic method. I'll guide you to discover answers through questions rather than giving you direct answers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full mt-8">
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
                      className="p-6 bg-white border border-gray-200 hover:border-forest-500 hover:shadow-md cursor-pointer transition-all group text-left"
                      onClick={() => handleSendMessage(suggestion.prompt)}
                    >
                      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{suggestion.icon}</div>
                      <h3 className="text-lg font-bold text-charcoal mb-2 group-hover:text-forest-600 transition-colors">{suggestion.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{suggestion.prompt}</p>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onFeedback={handleFeedback}
                  />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              disabled={askMentorMutation.isPending}
              isLoading={isTyping || askMentorMutation.isPending}
              placeholder="Ask me anything about Guidewire..."
              maxLength={1000}
            />
            <p className="text-xs text-center text-gray-400 mt-3">
                AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIMentorPage() {
  return (
    <Suspense fallback={
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-center">
            <Sparkles className="h-10 w-10 text-forest-300 animate-pulse mx-auto mb-4" />
            <p className="text-gray-500">Loading AI Mentor...</p>
        </div>
      </div>
    }>
      <AIMentorContent />
    </Suspense>
  );
}



