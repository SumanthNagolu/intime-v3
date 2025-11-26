'use client';

/**
 * Twin Widget Wrapper Component
 *
 * Wrapper for TwinFloatingWidget that handles authentication
 * and user context. Use this in layouts.
 */

import React, { useEffect, useState } from 'react';
import { TwinFloatingWidget } from './TwinFloatingWidget';

interface UserContext {
  role: string;
  name: string;
  unreadEvents: number;
}

export function TwinWidgetWrapper() {
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Fetch user context for the widget
    const fetchUserContext = async () => {
      try {
        // Check if user is authenticated by calling a lightweight endpoint
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // Fetch unread events count
            let unreadEvents = 0;
            try {
              const eventsRes = await fetch('/api/twin/event');
              if (eventsRes.ok) {
                const eventsData = await eventsRes.json();
                unreadEvents = (eventsData.events || []).filter(
                  (e: { processed: boolean }) => !e.processed
                ).length;
              }
            } catch {
              // Ignore events fetch errors
            }

            setUserContext({
              role: data.user.employee_role || 'employee',
              name: data.user.name?.split(' ')[0] || '',
              unreadEvents,
            });
          }
        }
      } catch {
        // User not authenticated or error - don't show widget
      } finally {
        setIsLoaded(true);
      }
    };

    fetchUserContext();
  }, []);

  // Don't render anything until we've checked auth
  if (!isLoaded) {
    return null;
  }

  // Don't render if user is not authenticated
  if (!userContext) {
    return null;
  }

  return (
    <TwinFloatingWidget
      userRole={userContext.role}
      userName={userContext.name}
      unreadEvents={userContext.unreadEvents}
      position="bottom-right"
    />
  );
}

export default TwinWidgetWrapper;
