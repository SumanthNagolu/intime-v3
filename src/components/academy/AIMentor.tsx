'use client';

/**
 * AI Mentor - Floating Chat Widget
 * Exact copy from academy prototype
 *
 * Socratic method coaching - guides with questions, not answers
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import type { AcademyChatMessage } from '@/types/academy';

export function AIMentor() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AcademyChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      content: "Hi! I'm your AI mentor. I'm here to guide you through your learning journey using the Socratic method. Instead of giving you direct answers, I'll ask questions to help you discover solutions yourself. What can I help you with today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: AcademyChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    try {
      // TODO: Replace with actual AI service call
      // const responseText = await generateMentorResponse(history, userMsg.content);

      // Mock response for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      const aiMsg: AcademyChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "That's an interesting question. Before I guide you, can you tell me what you've tried so far? What's your current understanding of the problem?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-rust text-white p-4 rounded-full shadow-lg hover:bg-[#B8421E] transition-all transform hover:scale-105 z-50 flex items-center gap-2 group"
      >
        <MessageCircle size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-medium whitespace-nowrap">
          Ask AI Mentor
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'w-72 h-14' : 'w-96 h-[600px]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full absolute -right-0.5 -bottom-0.5 ring-1 ring-white animate-pulse"></div>
            <div className="w-8 h-8 bg-forest text-white rounded-full flex items-center justify-center text-xs font-bold">
              AI
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-charcoal text-sm">AI Mentor</h3>
            {!isMinimized && <p className="text-xs text-gray-500">Always here to help</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <button onClick={() => setIsMinimized(!isMinimized)} className="hover:text-charcoal p-1">
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="hover:text-charcoal p-1">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-hide">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-rust text-white rounded-tr-none'
                      : 'bg-white text-charcoal border border-gray-200 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100 rounded-b-xl">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-rust focus-within:border-transparent transition-all">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none text-sm text-charcoal placeholder-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isThinking}
                className={`p-1.5 rounded-full transition-colors ${
                  inputValue.trim() && !isThinking
                    ? 'bg-rust text-white hover:bg-[#B8421E]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isThinking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] text-gray-400">AI can make mistakes. Verify important info.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
