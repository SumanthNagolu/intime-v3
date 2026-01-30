/**
 * Integration Types
 * Common interfaces and types for all external integrations
 */

// Integration status
export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'pending'

// Integration categories
export type IntegrationCategory = 'payroll' | 'esignature' | 'identity' | 'hris' | 'calendar' | 'communication'

// Base integration config stored in database
export interface IntegrationConfig {
  id: string
  orgId: string
  provider: string
  category: IntegrationCategory
  status: IntegrationStatus
  credentials: IntegrationCredentials
  settings: Record<string, unknown>
  lastSyncAt?: Date
  lastSyncStatus?: 'success' | 'error' | 'partial'
  lastSyncError?: string
  createdAt: Date
  updatedAt: Date
}

// Encrypted credentials (stored encrypted in DB)
export interface IntegrationCredentials {
  apiKey?: string
  apiSecret?: string
  accessToken?: string
  refreshToken?: string
  tokenExpiresAt?: string
  clientId?: string
  clientSecret?: string
  baseUrl?: string
  webhookSecret?: string
  additionalFields?: Record<string, string>
}

// Webhook event from external providers
export interface WebhookEvent {
  id: string
  provider: string
  eventType: string
  timestamp: Date
  payload: Record<string, unknown>
  signature?: string
}

// Sync operation result
export interface SyncResult {
  success: boolean
  syncedCount: number
  errorCount: number
  errors?: SyncError[]
  details?: Record<string, unknown>
}

export interface SyncError {
  entityId: string
  entityType: string
  error: string
  retryable: boolean
}

// Employee data mapping between systems
export interface EmployeeMapping {
  internalId: string
  externalId: string
  provider: string
  lastSyncAt: Date
  syncStatus: 'synced' | 'pending' | 'error'
}

// Common employee data structure for sync
export interface EmployeeSyncData {
  externalId?: string
  email: string
  firstName: string
  lastName: string
  jobTitle?: string
  department?: string
  startDate?: string
  endDate?: string
  status: string
  salary?: {
    type: 'hourly' | 'annual'
    amount: number
    currency: string
  }
  address?: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

// Document for e-signature
export interface ESignatureDocument {
  id?: string
  templateId?: string
  name: string
  recipients: ESignatureRecipient[]
  fields?: Record<string, string | number | boolean>
  metadata?: Record<string, string>
}

export interface ESignatureRecipient {
  email: string
  name: string
  role?: string
  signOrder?: number
}

export interface ESignatureStatus {
  documentId: string
  status: 'draft' | 'sent' | 'delivered' | 'signed' | 'declined' | 'voided' | 'completed'
  recipients: {
    email: string
    name: string
    status: string
    signedAt?: Date
  }[]
  createdAt: Date
  completedAt?: Date
}

// SCIM User for identity providers
export interface ScimUser {
  id?: string
  externalId?: string
  userName: string
  active: boolean
  name: {
    givenName: string
    familyName: string
    formatted?: string
  }
  emails: {
    value: string
    type: string
    primary: boolean
  }[]
  groups?: {
    value: string
    display: string
  }[]
}

// Provider capabilities
export interface ProviderCapabilities {
  canSyncEmployees: boolean
  canProcessPayroll: boolean
  canSendDocuments: boolean
  canManageUsers: boolean
  supportsWebhooks: boolean
  supportsBidirectionalSync: boolean
}
