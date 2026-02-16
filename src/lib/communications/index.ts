/**
 * Communications Module
 * Phase 2: Communications
 *
 * Exports all communication-related functionality.
 */

// Context Engine
export {
  analyzeEmailForEntities,
  analyzeCalendarEventForEntities,
  autoLinkCommunication,
  getEntityCommunicationHistory,
  type EntityMatch,
  type LinkConfidence,
  type ContextLinkResult,
} from './context-engine'

// Gmail Provider
export {
  GmailClient,
  getGmailAuthUrl,
  exchangeGmailAuthCode,
  refreshGmailToken,
  parseGmailHeaders,
  extractGmailBody,
  convertGmailMessage,
  type GmailCredentials,
  type GmailMessage,
  type GmailThread,
  type GmailLabel,
} from './providers/gmail'

// Outlook Provider
export {
  OutlookClient,
  getOutlookAuthUrl,
  exchangeOutlookAuthCode,
  refreshOutlookToken,
  convertOutlookMessage,
  convertOutlookEvent,
  type OutlookCredentials,
  type OutlookMessage,
  type OutlookFolder,
  type OutlookCalendarEvent,
} from './providers/outlook'
