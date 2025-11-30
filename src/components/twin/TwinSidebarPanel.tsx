'use client';

/**
 * Twin Sidebar Panel Component
 *
 * Collapsible sidebar chat panel for AI twin interaction.
 * Typically placed on the right side of the main content area.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Bell,
  RefreshCw,
  Sparkles,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TwinChat, type ChatMessage } from './TwinChat';
import { TwinEventFeed, type TwinEventItem } from './TwinEventFeed';

// ============================================================================
// TYPES
// ============================================================================

export interface TwinSidebarPanelProps {
  /** User's role */
  userRole?: string;
  /** User's name */
  userName?: string;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Width when expanded */
  expandedWidth?: string;
  /** Width when collapsed */
  collapsedWidth?: string;
  /** Show organism health indicator */
  showHealthIndicator?: boolean;
  /** Additional class names */
  className?: string;
  /** Called when collapse state changes */
  onCollapseChange?: (collapsed: boolean) => void;
}

type SidebarTab = 'chat' | 'events' | 'health';

interface OrganismHealth {
  overallScore: number;
  activeTwins: number;
  totalTwins: number;
  pendingEvents: number;
  lastSync: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TwinSidebarPanel({
  userRole = 'employee',
  userName: _userName,
  defaultCollapsed = false,
  expandedWidth = '360px',
  collapsedWidth = '48px',
  showHealthIndicator = true,
  className,
  onCollapseChange,
}: TwinSidebarPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [activeTab, setActiveTab] = useState<SidebarTab>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [events, setEvents] = useState<TwinEventItem[]>([]);
  const [health, setHealth] = useState<OrganismHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch events and health on mount
  useEffect(() => {
    if (!isCollapsed) {
      fetchEvents();
      if (showHealthIndicator) {
        fetchHealth();
      }
    }
  }, [isCollapsed, showHealthIndicator]);

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

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/twin/organism-health');
      if (response.ok) {
        const data = await response.json();
        setHealth(data.health);
      }
    } catch (error) {
      console.error('Failed to fetch health:', error);
    }
  };

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchEvents(),
      showHealthIndicator && fetchHealth(),
    ]);
    setIsRefreshing(false);
  };

  const handleAskOrg = useCallback(async () => {
    const orgMessage = `What's the current state of the organization?`;
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

  const unprocessedEvents = events.filter(e => !e.processed).length;
  const roleDisplay = userRole.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div
      className={cn(
        'h-full bg-white border-l border-charcoal-200 flex flex-col transition-all duration-300',
        className
      )}
      style={{ width: isCollapsed ? collapsedWidth : expandedWidth }}
    >
      {/* Collapsed View */}
      {isCollapsed ? (
        <div className="flex flex-col items-center py-4 gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleToggleCollapse}
            className="text-charcoal-500 hover:text-forest-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex flex-col items-center gap-3 mt-4">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'relative',
                activeTab === 'chat' && 'text-forest-600 bg-forest-50'
              )}
              onClick={() => {
                setActiveTab('chat');
                handleToggleCollapse();
              }}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'relative',
                activeTab === 'events' && 'text-forest-600 bg-forest-50'
              )}
              onClick={() => {
                setActiveTab('events');
                handleToggleCollapse();
              }}
            >
              <Bell className="w-5 h-5" />
              {unprocessedEvents > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unprocessedEvents > 9 ? '9+' : unprocessedEvents}
                </span>
              )}
            </Button>

            {showHealthIndicator && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'relative',
                  activeTab === 'health' && 'text-forest-600 bg-forest-50'
                )}
                onClick={() => {
                  setActiveTab('health');
                  handleToggleCollapse();
                }}
              >
                <Activity className="w-5 h-5" />
                {health && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1 w-3 h-3 rounded-full',
                      health.overallScore >= 80 ? 'bg-success-500' :
                      health.overallScore >= 60 ? 'bg-warning-500' : 'bg-error-500'
                    )}
                  />
                )}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-forest-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-charcoal-800">AI Twin</h3>
                <p className="text-xs text-charcoal-500">{roleDisplay}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleToggleCollapse}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-charcoal-100">
            <button
              className={cn(
                'flex-1 py-2 px-3 text-xs font-medium transition-colors',
                activeTab === 'chat'
                  ? 'text-forest-600 border-b-2 border-forest-500'
                  : 'text-charcoal-500 hover:text-charcoal-700'
              )}
              onClick={() => setActiveTab('chat')}
            >
              <MessageCircle className="w-3.5 h-3.5 inline-block mr-1" />
              Chat
            </button>
            <button
              className={cn(
                'flex-1 py-2 px-3 text-xs font-medium transition-colors relative',
                activeTab === 'events'
                  ? 'text-forest-600 border-b-2 border-forest-500'
                  : 'text-charcoal-500 hover:text-charcoal-700'
              )}
              onClick={() => setActiveTab('events')}
            >
              <Bell className="w-3.5 h-3.5 inline-block mr-1" />
              Events
              {unprocessedEvents > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 h-4 px-1 text-xs"
                >
                  {unprocessedEvents}
                </Badge>
              )}
            </button>
            {showHealthIndicator && (
              <button
                className={cn(
                  'flex-1 py-2 px-3 text-xs font-medium transition-colors',
                  activeTab === 'health'
                    ? 'text-forest-600 border-b-2 border-forest-500'
                    : 'text-charcoal-500 hover:text-charcoal-700'
                )}
                onClick={() => setActiveTab('health')}
              >
                <Activity className="w-3.5 h-3.5 inline-block mr-1" />
                Health
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' && (
              <TwinChat
                initialMessages={messages}
                onSendMessage={handleSendMessage}
                isTyping={isLoading}
                maxHeight="calc(100vh - 200px)"
                showAskOrg={true}
                onAskOrg={handleAskOrg}
                compact={true}
              />
            )}

            {activeTab === 'events' && (
              <TwinEventFeed
                events={events}
                onMarkProcessed={handleMarkEventProcessed}
                maxHeight="calc(100vh - 200px)"
                compact={true}
                className="p-3"
              />
            )}

            {activeTab === 'health' && health && (
              <OrganismHealthPanel health={health} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function OrganismHealthPanel({ health }: { health: OrganismHealth }) {
  const scoreColor = health.overallScore >= 80 ? 'text-success-600' :
                     health.overallScore >= 60 ? 'text-warning-600' : 'text-error-600';

  return (
    <div className="p-4 space-y-4">
      {/* Overall Score */}
      <div className="text-center py-4">
        <div className={cn('text-4xl font-bold', scoreColor)}>
          {health.overallScore}%
        </div>
        <p className="text-sm text-charcoal-500 mt-1">Organism Health</p>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-charcoal-50">
          <span className="text-sm text-charcoal-600">Active Twins</span>
          <span className="text-sm font-medium text-charcoal-800">
            {health.activeTwins}/{health.totalTwins}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-charcoal-50">
          <span className="text-sm text-charcoal-600">Pending Events</span>
          <Badge variant={health.pendingEvents > 5 ? 'destructive' : 'secondary'}>
            {health.pendingEvents}
          </Badge>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-charcoal-600">Last Sync</span>
          <span className="text-xs text-charcoal-500">
            {new Date(health.lastSync).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Health Indicator */}
      <div className="pt-4">
        <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              health.overallScore >= 80 ? 'bg-success-500' :
              health.overallScore >= 60 ? 'bg-warning-500' : 'bg-error-500'
            )}
            style={{ width: `${health.overallScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default TwinSidebarPanel;
