export type AccountEventType =
  | 'account.draft.created'
  | 'account.submitted'
  | 'account.identity.updated'
  | 'account.locations.updated'
  | 'account.billing.updated'
  | 'account.contacts.updated'
  | 'account.contracts.updated'
  | 'account.compliance.updated'
  | 'account.team.updated'
  | 'account.status.changed'

export interface AccountEvent {
  type: AccountEventType
  accountId: string
  orgId: string
  userId: string
  payload?: Record<string, unknown>
  timestamp: Date
}

export type EventHandler = (event: AccountEvent) => Promise<void>
