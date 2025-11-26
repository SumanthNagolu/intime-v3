'use client';

/**
 * Twin Floating Widget Component
 *
 * Bottom-right floating chat bubble for AI twin interaction.
 * Expands into a full chat panel when clicked.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  Bell,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TwinChat, type ChatMessage } from './TwinChat';
import { TwinEventFeed, type TwinEventItem } from './TwinEventFeed';

// ============================================================================
// TYPES
// ============================================================================

export interface TwinFloatingWidgetProps {
  /** User's role for personalized greeting */
  userRole?: string;
  /** User's name */
  userName?: string;
  /** Position on screen */
  position?: 'bottom-right' | 'bottom-left';
  /** Initial open state */
  defaultOpen?: boolean;
  /** Events to show badge count */
  unreadEvents?: number;
  /** Additional class names */
  className?: string;
}

type WidgetTab = 'chat' | 'events';

// ============================================================================
// COMPONENT
// ============================================================================

export function TwinFloatingWidget({
  userRole = 'employee',
  userName,
  position = 'bottom-right',
  defaultOpen = false,
  unreadEvents = 0,
  className,
}: TwinFloatingWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<WidgetTab>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [events, setEvents] = useState<TwinEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch events on mount
  useEffect(() => {
    if (isOpen && activeTab === 'events') {
      fetchEvents();
    }
  }, [isOpen, activeTab]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/twin/event');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const handleSendMessage = useCallback(async (message: string): Promise<string> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/twin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data.response || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMarkEventProcessed = useCallback(async (eventId: string) => {
    try {
      await fetch('/api/twin/event', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      setEvents(prev => prev.map(e =>
        e.id === eventId ? { ...e, processed: true } : e
      ));
    } catch (error) {
      console.error('Failed to mark event:', error);
    }
  }, []);

  const handleAskOrg = useCallback(async () => {
    // Navigate to organization-wide query
    const orgMessage = `What's happening across the organization today?`;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: orgMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await handleSendMessage(orgMessage);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-response`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      // Error handled in handleSendMessage
    }
  }, [handleSendMessage]);

  const positionClasses = {
    'bottom-right': 'right-4 bottom-4',
    'bottom-left': 'left-4 bottom-4',
  };

  const greeting = userName ? `Hi ${userName}!` : 'Hi there!';
  const roleDisplay = userRole.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div
      className={cn(
        'fixed z-50',
        positionClasses[position],
        className
      )}
    >
      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            'mb-4 bg-white rounded-xl shadow-2xl border border-charcoal-200 overflow-hidden transition-all duration-300',
            isExpanded ? 'w-[480px] h-[600px]' : 'w-[360px] h-[480px]'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-forest-500 to-forest-600 text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{greeting}</h3>
                <p className="text-xs text-forest-100">{roleDisplay} Twin</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/20"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-charcoal-100">
            <button
              className={cn(
                'flex-1 py-2 px-4 text-sm font-medium transition-colors',
                activeTab === 'chat'
                  ? 'text-forest-600 border-b-2 border-forest-500'
                  : 'text-charcoal-500 hover:text-charcoal-700'
              )}
              onClick={() => setActiveTab('chat')}
            >
              <MessageCircle className="w-4 h-4 inline-block mr-1.5" />
              Chat
            </button>
            <button
              className={cn(
                'flex-1 py-2 px-4 text-sm font-medium transition-colors relative',
                activeTab === 'events'
                  ? 'text-forest-600 border-b-2 border-forest-500'
                  : 'text-charcoal-500 hover:text-charcoal-700'
              )}
              onClick={() => setActiveTab('events')}
            >
              <Bell className="w-4 h-4 inline-block mr-1.5" />
              Events
              {unreadEvents > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadEvents > 9 ? '9+' : unreadEvents}
                </Badge>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden" style={{ height: isExpanded ? '488px' : '368px' }}>
            {activeTab === 'chat' ? (
              <TwinChat
                initialMessages={messages}
                onSendMessage={handleSendMessage}
                isTyping={isLoading}
                maxHeight={isExpanded ? '408px' : '288px'}
                showAskOrg={true}
                onAskOrg={handleAskOrg}
                compact={!isExpanded}
              />
            ) : (
              <TwinEventFeed
                events={events}
                onMarkProcessed={handleMarkEventProcessed}
                maxHeight={isExpanded ? '488px' : '368px'}
                compact={!isExpanded}
                className="p-4"
              />
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <Button
        size="lg"
        className={cn(
          'w-14 h-14 rounded-full shadow-lg transition-all duration-300',
          'bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700',
          isOpen && 'rotate-90'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {unreadEvents > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadEvents > 9 ? '9+' : unreadEvents}
              </span>
            )}
          </>
        )}
      </Button>
    </div>
  );
}

export default TwinFloatingWidget;
