/**
 * Event Bus Initialization
 *
 * Initializes the Event Bus system at application startup.
 * This should be called from the root layout or a server initialization script.
 */

import { getEventBus } from './EventBus';
import { registerAllHandlers } from './handlers';

let initialized = false;

/**
 * Initialize the Event Bus system
 *
 * This function:
 * 1. Gets the EventBus singleton instance
 * 2. Registers all event handlers
 * 3. Starts listening to PostgreSQL NOTIFY
 *
 * Safe to call multiple times (will only initialize once).
 */
export async function initializeEventBus(): Promise<void> {
  if (initialized) {
    console.log('[EventBus:init] Already initialized, skipping');
    return;
  }

  // Validate required environment variables
  if (!process.env.SUPABASE_DB_URL) {
    throw new Error(
      'SUPABASE_DB_URL environment variable is required for Event Bus. ' +
      'Please add it to your .env.local file.'
    );
  }

  try {
    const eventBus = getEventBus();

    // Register all handlers
    // Use environment variable for default org ID with fallback
    const defaultOrgId = process.env.DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';
    await registerAllHandlers(eventBus, defaultOrgId);

    // Start listening to PostgreSQL NOTIFY
    await eventBus.startListening();

    initialized = true;
    console.log('[EventBus:init] Event Bus initialized successfully');
  } catch (error) {
    console.error('[EventBus:init] Failed to initialize Event Bus:', error);
    throw error;
  }
}

/**
 * Shutdown the Event Bus gracefully
 *
 * This should be called during application shutdown to close connections.
 */
export async function shutdownEventBus(): Promise<void> {
  if (!initialized) {
    return;
  }

  const eventBus = getEventBus();
  await eventBus.stopListening();
  initialized = false;
  console.log('[EventBus:init] Event Bus shut down successfully');
}

/**
 * Get initialization status
 */
export function isEventBusInitialized(): boolean {
  return initialized;
}

// Auto-initialize in production (skip in test/dev for manual control)
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  initializeEventBus().catch(error => {
    console.error('[EventBus:init] Auto-initialization failed:', error);
  });
}
