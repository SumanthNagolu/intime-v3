'use client';

/**
 * Twin Widget Wrapper Component
 *
 * Wrapper for TwinFloatingWidget that handles authentication
 * and user context. Use this in layouts.
 *
 * PERFORMANCE OPTIMIZATION:
 * - Lazy loads the widget component
 * - Defers auth check until after main content renders (requestIdleCallback)
 * - Uses AbortController to cancel in-flight requests on unmount
 */

import React, { useEffect, useState, lazy, Suspense } from 'react';

// Lazy load the actual widget component
const TwinFloatingWidget = lazy(() =>
  import('./TwinFloatingWidget').then((mod) => ({ default: mod.TwinFloatingWidget }))
);

interface UserContext {
  role: string;
  name: string;
  unreadEvents: number;
}

export function TwinWidgetWrapper() {
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Defer loading until browser is idle (non-blocking)
    const scheduleLoad = () => {
      if ('requestIdleCallback' in window) {
        (window as Window).requestIdleCallback(
          () => setShouldLoad(true),
          { timeout: 2000 } // Max wait 2 seconds
        );
      } else {
        // Fallback for Safari
        setTimeout(() => setShouldLoad(true), 100);
      }
    };

    scheduleLoad();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;

    const abortController = new AbortController();

    // Fetch user context for the widget
    const fetchUserContext = async () => {
      try {
        // Check if user is authenticated by calling a lightweight endpoint
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          signal: abortController.signal,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // Set user context immediately, fetch events in background
            setUserContext({
              role: data.user.employee_role || 'employee',
              name: data.user.name?.split(' ')[0] || '',
              unreadEvents: 0, // Start with 0, update async
            });

            // Fetch unread events count in background (non-blocking)
            try {
              const eventsRes = await fetch('/api/twin/event', {
                signal: abortController.signal,
              });
              if (eventsRes.ok) {
                const eventsData = await eventsRes.json();
                const unreadCount = (eventsData.events || []).filter(
                  (e: { processed: boolean }) => !e.processed
                ).length;
                setUserContext((prev) =>
                  prev ? { ...prev, unreadEvents: unreadCount } : null
                );
              }
            } catch {
              // Ignore events fetch errors (aborted or network error)
            }
          }
        }
      } catch (error) {
        // User not authenticated, aborted, or error - don't show widget
        if ((error as Error).name !== 'AbortError') {
          // Only log non-abort errors
          console.debug('Twin widget auth check failed:', error);
        }
      }
    };

    fetchUserContext();

    return () => {
      abortController.abort();
    };
  }, [shouldLoad]);

  // Don't render until we have user context
  if (!userContext) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <TwinFloatingWidget
        userRole={userContext.role}
        userName={userContext.name}
        unreadEvents={userContext.unreadEvents}
        position="bottom-right"
      />
    </Suspense>
  );
}

export default TwinWidgetWrapper;
