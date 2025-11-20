/**
 * Event Handlers Index
 *
 * Auto-discovers and registers all event handlers.
 * Import all handler modules to trigger decorator registration.
 */

import { EventBus } from '../EventBus';

// Import all handler files (auto-discovery)
import './user-handlers';
import './course-handlers';
// import './placement-handlers'; // Add when created
// import './job-handlers';       // Add when created

/**
 * Register all handlers with the Event Bus and persist to database
 *
 * This should be called once at app startup after the EventBus is created.
 *
 * @param eventBus - The EventBus instance
 * @param orgId - The organization ID for multi-tenancy
 */
export async function registerAllHandlers(eventBus: EventBus, orgId: string): Promise<void> {
  console.log('[EventHandlers] Registering all event handlers...');

  // Handlers are already registered via decorators when modules are imported
  // Now persist them to database
  await eventBus.getRegistry().persistToDatabase(
    eventBus.getPool(),
    orgId
  );

  const handlerCount = eventBus.getRegistry().getHandlerCount();
  console.log(`[EventHandlers] Successfully registered ${handlerCount} event handler(s)`);
}
