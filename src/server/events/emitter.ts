import type { AccountEvent, AccountEventType, EventHandler } from './types'

class EventEmitter {
  private handlers: Map<AccountEventType, EventHandler[]> = new Map()

  on(eventType: AccountEventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || []
    this.handlers.set(eventType, [...existing, handler])
  }

  async emit(
    type: AccountEventType,
    data: Omit<AccountEvent, 'type' | 'timestamp'>
  ): Promise<void> {
    const event: AccountEvent = {
      ...data,
      type,
      timestamp: new Date(),
    }

    const handlers = this.handlers.get(type) || []

    // Fire-and-forget - don't block the main operation
    Promise.all(handlers.map(h => h(event).catch(err => {
      console.error(`Event handler error for ${type}:`, err)
    })))
  }
}

export const events = new EventEmitter()
