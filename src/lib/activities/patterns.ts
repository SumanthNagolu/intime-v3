/**
 * Activity Pattern Utilities
 *
 * Pattern definitions and utilities for activity templates.
 * Patterns define the structure, fields, checklists, and SLA for different activity types.
 *
 * @see docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md
 */

import {
  Phone, Mail, Calendar, CheckCircle, FileText, MessageSquare,
  Linkedin, Send, UserPlus, Search, ClipboardCheck, Briefcase,
  Users, DollarSign, Clock, Bell, Edit, Plane, Shield, Megaphone,
  Target, Handshake, FileCheck, Award, GraduationCap, type LucideIcon,
} from 'lucide-react';
import type { Priority } from './sla';
import { DEFAULT_SLA_DURATIONS } from './sla';

// ==========================================
// TYPES
// ==========================================

export type PatternCategory =
  | 'recruiting'
  | 'bench_sales'
  | 'crm'
  | 'hr'
  | 'general';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multi-select'
  | 'date'
  | 'datetime'
  | 'number'
  | 'currency'
  | 'email'
  | 'phone'
  | 'url'
  | 'boolean'
  | 'duration'
  | 'entity-ref';

export interface PatternField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: unknown;
  helpText?: string;
  dependsOn?: {
    field: string;
    value: unknown;
  };
}

export interface ChecklistItem {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
}

export interface PatternOutcome {
  id: string;
  label: string;
  color?: string;
  nextActivity?: string; // Pattern ID to auto-suggest next
  requiresNotes?: boolean;
}

export interface ActivityPattern {
  id: string;
  name: string;
  description: string;
  category: PatternCategory;
  icon: LucideIcon;
  iconEmoji?: string;

  /** Default priority for this pattern */
  defaultPriority: Priority;

  /** SLA tier in hours (overrides default priority SLA) */
  slaTier?: number;

  /** Custom fields for this activity type */
  fields: PatternField[];

  /** Checklist items that appear on the activity */
  checklist: ChecklistItem[];

  /** Possible outcomes when completing */
  outcomes: PatternOutcome[];

  /** Direction: inbound (received) or outbound (initiated) */
  direction?: 'inbound' | 'outbound' | 'both';

  /** Entity types this pattern applies to */
  applicableEntities?: string[];

  /** Whether this is a quick-log activity (no pending state) */
  quickLog?: boolean;

  /** Tags for searching/filtering */
  tags?: string[];
}

// ==========================================
// PATTERN DEFINITIONS
// ==========================================

export const ACTIVITY_PATTERNS: Record<string, ActivityPattern> = {
  // ==========================
  // GENERAL PATTERNS
  // ==========================
  task: {
    id: 'task',
    name: 'Task',
    description: 'Generic task or to-do item',
    category: 'general',
    icon: CheckCircle,
    iconEmoji: '✅',
    defaultPriority: 'normal',
    fields: [
      { id: 'notes', label: 'Notes', type: 'textarea' },
    ],
    checklist: [],
    outcomes: [
      { id: 'completed', label: 'Completed', color: 'green' },
      { id: 'deferred', label: 'Deferred', color: 'gray' },
    ],
  },

  note: {
    id: 'note',
    name: 'Note',
    description: 'Log a note or observation',
    category: 'general',
    icon: FileText,
    iconEmoji: '📝',
    defaultPriority: 'low',
    quickLog: true,
    fields: [
      { id: 'content', label: 'Note Content', type: 'textarea', required: true },
    ],
    checklist: [],
    outcomes: [],
  },

  call: {
    id: 'call',
    name: 'Phone Call',
    description: 'Log or schedule a phone call',
    category: 'general',
    icon: Phone,
    iconEmoji: '📞',
    defaultPriority: 'normal',
    direction: 'both',
    fields: [
      { id: 'phoneNumber', label: 'Phone Number', type: 'phone' },
      { id: 'duration', label: 'Duration (minutes)', type: 'number' },
      { id: 'notes', label: 'Call Notes', type: 'textarea' },
    ],
    checklist: [],
    outcomes: [
      { id: 'connected', label: 'Connected', color: 'green' },
      { id: 'no_answer', label: 'No Answer', color: 'gray', nextActivity: 'call' },
      { id: 'left_voicemail', label: 'Left Voicemail', color: 'blue', nextActivity: 'follow_up' },
      { id: 'busy', label: 'Busy/Line Issue', color: 'orange', nextActivity: 'call' },
      { id: 'wrong_number', label: 'Wrong Number', color: 'red' },
    ],
  },

  email: {
    id: 'email',
    name: 'Email',
    description: 'Log or compose an email',
    category: 'general',
    icon: Mail,
    iconEmoji: '📧',
    defaultPriority: 'normal',
    direction: 'both',
    quickLog: true,
    fields: [
      { id: 'emailAddress', label: 'Email Address', type: 'email' },
      { id: 'subject', label: 'Subject', type: 'text' },
      { id: 'body', label: 'Email Content', type: 'textarea' },
    ],
    checklist: [],
    outcomes: [
      { id: 'sent', label: 'Sent', color: 'green' },
      { id: 'replied', label: 'Received Reply', color: 'blue' },
      { id: 'bounced', label: 'Bounced', color: 'red' },
    ],
  },

  meeting: {
    id: 'meeting',
    name: 'Meeting',
    description: 'Schedule or log a meeting',
    category: 'general',
    icon: Calendar,
    iconEmoji: '📅',
    defaultPriority: 'high',
    fields: [
      { id: 'location', label: 'Location/Link', type: 'text' },
      { id: 'attendees', label: 'Attendees', type: 'text' },
      { id: 'duration', label: 'Duration (minutes)', type: 'number', defaultValue: 30 },
      { id: 'agenda', label: 'Agenda', type: 'textarea' },
      { id: 'notes', label: 'Meeting Notes', type: 'textarea' },
    ],
    checklist: [
      { id: 'agenda_sent', label: 'Agenda sent to attendees' },
      { id: 'calendar_invite', label: 'Calendar invite sent' },
      { id: 'notes_shared', label: 'Notes shared post-meeting' },
    ],
    outcomes: [
      { id: 'completed', label: 'Meeting Held', color: 'green' },
      { id: 'no_show', label: 'No Show', color: 'red', nextActivity: 'call' },
      { id: 'rescheduled', label: 'Rescheduled', color: 'blue', nextActivity: 'meeting' },
      { id: 'cancelled', label: 'Cancelled', color: 'gray' },
    ],
  },

  sms: {
    id: 'sms',
    name: 'SMS/Text',
    description: 'Log a text message',
    category: 'general',
    icon: MessageSquare,
    iconEmoji: '💬',
    defaultPriority: 'normal',
    direction: 'both',
    quickLog: true,
    fields: [
      { id: 'phoneNumber', label: 'Phone Number', type: 'phone' },
      { id: 'message', label: 'Message', type: 'textarea', required: true },
    ],
    checklist: [],
    outcomes: [
      { id: 'sent', label: 'Sent', color: 'green' },
      { id: 'delivered', label: 'Delivered', color: 'blue' },
      { id: 'replied', label: 'Got Reply', color: 'green' },
    ],
  },

  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn Message',
    description: 'LinkedIn InMail or connection request',
    category: 'general',
    icon: Linkedin,
    iconEmoji: '💼',
    defaultPriority: 'normal',
    direction: 'outbound',
    quickLog: true,
    fields: [
      { id: 'profileUrl', label: 'LinkedIn Profile URL', type: 'url' },
      { id: 'messageType', label: 'Type', type: 'select', options: [
        { value: 'inmail', label: 'InMail' },
        { value: 'connection', label: 'Connection Request' },
        { value: 'message', label: 'Direct Message' },
      ]},
      { id: 'message', label: 'Message', type: 'textarea' },
    ],
    checklist: [],
    outcomes: [
      { id: 'sent', label: 'Sent', color: 'green' },
      { id: 'accepted', label: 'Connection Accepted', color: 'blue' },
      { id: 'replied', label: 'Got Reply', color: 'green' },
      { id: 'no_response', label: 'No Response', color: 'gray' },
    ],
  },

  follow_up: {
    id: 'follow_up',
    name: 'Follow Up',
    description: 'General follow-up reminder',
    category: 'general',
    icon: Bell,
    iconEmoji: '🔔',
    defaultPriority: 'normal',
    fields: [
      { id: 'reason', label: 'Follow-up Reason', type: 'text' },
      { id: 'notes', label: 'Notes', type: 'textarea' },
    ],
    checklist: [],
    outcomes: [
      { id: 'completed', label: 'Completed', color: 'green' },
      { id: 'needs_another', label: 'Needs Another Follow-up', color: 'blue', nextActivity: 'follow_up' },
    ],
  },

  // ==========================
  // RECRUITING PATTERNS
  // ==========================
  source_candidate: {
    id: 'source_candidate',
    name: 'Source Candidate',
    description: 'Search for and identify potential candidates',
    category: 'recruiting',
    icon: Search,
    iconEmoji: '🔍',
    defaultPriority: 'normal',
    applicableEntities: ['job'],
    fields: [
      { id: 'source', label: 'Source', type: 'select', options: [
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'job_board', label: 'Job Board' },
        { value: 'referral', label: 'Referral' },
        { value: 'database', label: 'Internal Database' },
        { value: 'other', label: 'Other' },
      ]},
      { id: 'candidatesFound', label: 'Candidates Found', type: 'number' },
      { id: 'notes', label: 'Notes', type: 'textarea' },
    ],
    checklist: [
      { id: 'search_linkedin', label: 'Search LinkedIn' },
      { id: 'search_database', label: 'Search internal database' },
      { id: 'check_referrals', label: 'Check for referrals' },
    ],
    outcomes: [
      { id: 'found_matches', label: 'Found Matches', color: 'green', nextActivity: 'screen_candidate' },
      { id: 'no_matches', label: 'No Matches', color: 'gray' },
      { id: 'expand_search', label: 'Need to Expand Search', color: 'blue' },
    ],
  },

  screen_candidate: {
    id: 'screen_candidate',
    name: 'Screen Candidate',
    description: 'Initial phone screen with candidate',
    category: 'recruiting',
    icon: Phone,
    iconEmoji: '📱',
    defaultPriority: 'high',
    slaTier: 4, // 4 hours
    applicableEntities: ['candidate', 'submission'],
    direction: 'outbound',
    fields: [
      { id: 'duration', label: 'Call Duration (minutes)', type: 'number', defaultValue: 15 },
      { id: 'currentRole', label: 'Current Role', type: 'text' },
      { id: 'yearsExperience', label: 'Years of Experience', type: 'number' },
      { id: 'salaryExpectation', label: 'Salary Expectation', type: 'currency' },
      { id: 'availability', label: 'Availability', type: 'text' },
      { id: 'notes', label: 'Screening Notes', type: 'textarea' },
    ],
    checklist: [
      { id: 'verify_resume', label: 'Verify resume details', required: true },
      { id: 'check_skills', label: 'Confirm key skills match' },
      { id: 'discuss_salary', label: 'Discuss compensation expectations' },
      { id: 'verify_auth', label: 'Verify work authorization', required: true },
      { id: 'confirm_interest', label: 'Confirm interest in role' },
    ],
    outcomes: [
      { id: 'qualified', label: 'Qualified - Proceed', color: 'green', nextActivity: 'submit_candidate' },
      { id: 'not_qualified', label: 'Not Qualified', color: 'red' },
      { id: 'overqualified', label: 'Overqualified', color: 'orange' },
      { id: 'salary_mismatch', label: 'Salary Mismatch', color: 'orange' },
      { id: 'not_interested', label: 'Candidate Not Interested', color: 'gray' },
      { id: 'no_answer', label: 'No Answer', color: 'gray', nextActivity: 'screen_candidate' },
    ],
  },

  submit_candidate: {
    id: 'submit_candidate',
    name: 'Submit Candidate',
    description: 'Submit candidate profile to hiring manager',
    category: 'recruiting',
    icon: Send,
    iconEmoji: '📤',
    defaultPriority: 'high',
    slaTier: 2, // 2 hours
    applicableEntities: ['submission'],
    fields: [
      { id: 'submissionNotes', label: 'Submission Notes', type: 'textarea' },
      { id: 'billRate', label: 'Bill Rate', type: 'currency' },
      { id: 'payRate', label: 'Pay Rate', type: 'currency' },
    ],
    checklist: [
      { id: 'resume_updated', label: 'Resume updated and formatted', required: true },
      { id: 'candidate_confirmed', label: 'Candidate confirmed submission', required: true },
      { id: 'rate_approved', label: 'Rates approved' },
      { id: 'cover_email', label: 'Cover email drafted' },
    ],
    outcomes: [
      { id: 'submitted', label: 'Submitted', color: 'green', nextActivity: 'follow_up_client' },
      { id: 'rejected_internal', label: 'Rejected (Internal)', color: 'red' },
    ],
  },

  schedule_interview: {
    id: 'schedule_interview',
    name: 'Schedule Interview',
    description: 'Coordinate interview between candidate and client',
    category: 'recruiting',
    icon: Calendar,
    iconEmoji: '🗓️',
    defaultPriority: 'urgent',
    slaTier: 2, // 2 hours
    applicableEntities: ['submission'],
    fields: [
      { id: 'interviewType', label: 'Interview Type', type: 'select', options: [
        { value: 'phone', label: 'Phone Screen' },
        { value: 'video', label: 'Video Call' },
        { value: 'onsite', label: 'On-site' },
        { value: 'panel', label: 'Panel Interview' },
        { value: 'technical', label: 'Technical Interview' },
      ]},
      { id: 'scheduledAt', label: 'Interview Date/Time', type: 'datetime' },
      { id: 'duration', label: 'Duration (minutes)', type: 'number', defaultValue: 60 },
      { id: 'location', label: 'Location/Link', type: 'text' },
      { id: 'interviewers', label: 'Interviewers', type: 'text' },
    ],
    checklist: [
      { id: 'candidate_available', label: 'Candidate availability confirmed', required: true },
      { id: 'client_available', label: 'Client availability confirmed', required: true },
      { id: 'calendar_sent', label: 'Calendar invite sent' },
      { id: 'prep_shared', label: 'Interview prep shared with candidate' },
    ],
    outcomes: [
      { id: 'scheduled', label: 'Scheduled', color: 'green', nextActivity: 'conduct_interview' },
      { id: 'candidate_unavailable', label: 'Candidate Unavailable', color: 'orange' },
      { id: 'client_unavailable', label: 'Client Unavailable', color: 'orange' },
      { id: 'cancelled', label: 'Cancelled', color: 'gray' },
    ],
  },

  conduct_interview: {
    id: 'conduct_interview',
    name: 'Interview Follow-up',
    description: 'Follow up on interview and gather feedback',
    category: 'recruiting',
    icon: ClipboardCheck,
    iconEmoji: '📋',
    defaultPriority: 'critical',
    slaTier: 1, // 1 hour after interview
    applicableEntities: ['submission'],
    fields: [
      { id: 'interviewFeedback', label: 'Interview Feedback', type: 'textarea' },
      { id: 'candidateFeedback', label: 'Candidate Feedback', type: 'textarea' },
      { id: 'rating', label: 'Overall Rating', type: 'select', options: [
        { value: '5', label: '5 - Excellent' },
        { value: '4', label: '4 - Good' },
        { value: '3', label: '3 - Average' },
        { value: '2', label: '2 - Below Average' },
        { value: '1', label: '1 - Poor' },
      ]},
    ],
    checklist: [
      { id: 'candidate_debrief', label: 'Debrief with candidate', required: true },
      { id: 'client_feedback', label: 'Get client feedback', required: true },
      { id: 'update_status', label: 'Update submission status' },
    ],
    outcomes: [
      { id: 'positive', label: 'Positive - Next Round', color: 'green', nextActivity: 'schedule_interview' },
      { id: 'offer', label: 'Moving to Offer', color: 'blue', nextActivity: 'make_offer' },
      { id: 'rejected', label: 'Rejected', color: 'red' },
      { id: 'pending_decision', label: 'Pending Decision', color: 'orange', nextActivity: 'follow_up_client' },
    ],
  },

  follow_up_client: {
    id: 'follow_up_client',
    name: 'Client Follow-up',
    description: 'Follow up with client on submission or interview',
    category: 'recruiting',
    icon: Briefcase,
    iconEmoji: '💼',
    defaultPriority: 'high',
    slaTier: 24, // 24 hours
    applicableEntities: ['job', 'submission'],
    fields: [
      { id: 'contactedVia', label: 'Contacted Via', type: 'select', options: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
        { value: 'teams', label: 'Teams/Slack' },
      ]},
      { id: 'response', label: 'Client Response', type: 'textarea' },
    ],
    checklist: [],
    outcomes: [
      { id: 'feedback_received', label: 'Feedback Received', color: 'green' },
      { id: 'no_response', label: 'No Response', color: 'gray', nextActivity: 'follow_up_client' },
      { id: 'interview_requested', label: 'Interview Requested', color: 'blue', nextActivity: 'schedule_interview' },
      { id: 'rejected', label: 'Rejected', color: 'red' },
    ],
  },

  make_offer: {
    id: 'make_offer',
    name: 'Make Offer',
    description: 'Extend offer to candidate',
    category: 'recruiting',
    icon: Award,
    iconEmoji: '🏆',
    defaultPriority: 'critical',
    slaTier: 2,
    applicableEntities: ['submission'],
    fields: [
      { id: 'offerAmount', label: 'Offer Amount', type: 'currency' },
      { id: 'startDate', label: 'Start Date', type: 'date' },
      { id: 'offerDetails', label: 'Offer Details', type: 'textarea' },
    ],
    checklist: [
      { id: 'verbal_offer', label: 'Extend verbal offer to candidate', required: true },
      { id: 'written_offer', label: 'Send written offer letter' },
      { id: 'negotiate_terms', label: 'Negotiate terms if needed' },
    ],
    outcomes: [
      { id: 'accepted', label: 'Offer Accepted', color: 'green', nextActivity: 'onboard_placement' },
      { id: 'declined', label: 'Offer Declined', color: 'red' },
      { id: 'negotiating', label: 'Counter Offer', color: 'orange', nextActivity: 'make_offer' },
      { id: 'pending', label: 'Awaiting Response', color: 'gray', nextActivity: 'follow_up' },
    ],
  },

  onboard_placement: {
    id: 'onboard_placement',
    name: 'Onboard Placement',
    description: 'Complete onboarding for new placement',
    category: 'recruiting',
    icon: UserPlus,
    iconEmoji: '🎉',
    defaultPriority: 'high',
    applicableEntities: ['placement'],
    fields: [
      { id: 'startDate', label: 'Start Date', type: 'date' },
      { id: 'notes', label: 'Onboarding Notes', type: 'textarea' },
    ],
    checklist: [
      { id: 'background_check', label: 'Background check completed', required: true },
      { id: 'drug_test', label: 'Drug test completed (if required)' },
      { id: 'paperwork', label: 'All paperwork signed', required: true },
      { id: 'first_day_info', label: 'First day information shared' },
      { id: 'welcome_call', label: 'Welcome call completed' },
    ],
    outcomes: [
      { id: 'completed', label: 'Onboarding Complete', color: 'green' },
      { id: 'pending_items', label: 'Pending Items', color: 'orange' },
      { id: 'cancelled', label: 'Placement Cancelled', color: 'red' },
    ],
  },

  // ==========================
  // BENCH SALES PATTERNS
  // ==========================
  market_consultant: {
    id: 'market_consultant',
    name: 'Market Consultant',
    description: 'Add consultant to hotlist for marketing',
    category: 'bench_sales',
    icon: Megaphone,
    iconEmoji: '📢',
    defaultPriority: 'normal',
    applicableEntities: ['consultant'],
    fields: [
      { id: 'hotlistId', label: 'Hotlist', type: 'entity-ref' },
      { id: 'marketingNotes', label: 'Marketing Notes', type: 'textarea' },
    ],
    checklist: [
      { id: 'profile_updated', label: 'Profile updated', required: true },
      { id: 'resume_current', label: 'Resume current' },
      { id: 'skills_verified', label: 'Skills verified' },
    ],
    outcomes: [
      { id: 'added', label: 'Added to Hotlist', color: 'green' },
      { id: 'not_ready', label: 'Not Ready', color: 'orange' },
    ],
  },

  submit_to_vendor: {
    id: 'submit_to_vendor',
    name: 'Submit to Vendor',
    description: 'Submit consultant to vendor requirement',
    category: 'bench_sales',
    icon: Send,
    iconEmoji: '📤',
    defaultPriority: 'high',
    slaTier: 2,
    applicableEntities: ['consultant', 'requirement'],
    fields: [
      { id: 'vendorName', label: 'Vendor', type: 'text' },
      { id: 'rate', label: 'Submitted Rate', type: 'currency' },
      { id: 'notes', label: 'Submission Notes', type: 'textarea' },
    ],
    checklist: [
      { id: 'consultant_consent', label: 'Consultant consent obtained', required: true },
      { id: 'rate_approved', label: 'Rate approved' },
      { id: 'resume_formatted', label: 'Resume formatted for vendor' },
    ],
    outcomes: [
      { id: 'submitted', label: 'Submitted', color: 'green', nextActivity: 'follow_up' },
      { id: 'rejected', label: 'Rejected by Vendor', color: 'red' },
    ],
  },

  immigration_check: {
    id: 'immigration_check',
    name: 'Immigration Status Check',
    description: 'Verify consultant immigration/work authorization status',
    category: 'bench_sales',
    icon: Shield,
    iconEmoji: '🛡️',
    defaultPriority: 'critical',
    applicableEntities: ['consultant'],
    fields: [
      { id: 'visaType', label: 'Visa Type', type: 'select', options: [
        { value: 'h1b', label: 'H1B' },
        { value: 'opt', label: 'OPT' },
        { value: 'opt_stem', label: 'OPT STEM' },
        { value: 'gc', label: 'Green Card' },
        { value: 'usc', label: 'US Citizen' },
        { value: 'other', label: 'Other' },
      ]},
      { id: 'expirationDate', label: 'Expiration Date', type: 'date' },
      { id: 'notes', label: 'Notes', type: 'textarea' },
    ],
    checklist: [
      { id: 'verify_docs', label: 'Verify immigration documents', required: true },
      { id: 'check_expiry', label: 'Check expiration dates', required: true },
      { id: 'update_system', label: 'Update system records' },
    ],
    outcomes: [
      { id: 'valid', label: 'Valid', color: 'green' },
      { id: 'expiring_soon', label: 'Expiring Soon', color: 'orange', nextActivity: 'immigration_check' },
      { id: 'action_required', label: 'Action Required', color: 'red' },
    ],
  },

  // ==========================
  // CRM PATTERNS
  // ==========================
  lead_outreach: {
    id: 'lead_outreach',
    name: 'Lead Outreach',
    description: 'Initial outreach to a new lead',
    category: 'crm',
    icon: Target,
    iconEmoji: '🎯',
    defaultPriority: 'high',
    applicableEntities: ['lead'],
    fields: [
      { id: 'channel', label: 'Outreach Channel', type: 'select', options: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
        { value: 'linkedin', label: 'LinkedIn' },
      ]},
      { id: 'message', label: 'Message', type: 'textarea' },
    ],
    checklist: [],
    outcomes: [
      { id: 'connected', label: 'Connected', color: 'green', nextActivity: 'qualify_lead' },
      { id: 'no_response', label: 'No Response', color: 'gray', nextActivity: 'lead_outreach' },
      { id: 'not_interested', label: 'Not Interested', color: 'red' },
    ],
  },

  qualify_lead: {
    id: 'qualify_lead',
    name: 'Qualify Lead',
    description: 'Qualify lead for sales pipeline',
    category: 'crm',
    icon: ClipboardCheck,
    iconEmoji: '✅',
    defaultPriority: 'high',
    applicableEntities: ['lead'],
    fields: [
      { id: 'budget', label: 'Budget', type: 'currency' },
      { id: 'timeline', label: 'Timeline', type: 'text' },
      { id: 'authority', label: 'Decision Maker?', type: 'boolean' },
      { id: 'needs', label: 'Needs/Pain Points', type: 'textarea' },
    ],
    checklist: [
      { id: 'understand_needs', label: 'Understand business needs', required: true },
      { id: 'confirm_budget', label: 'Confirm budget availability' },
      { id: 'identify_stakeholders', label: 'Identify decision makers' },
      { id: 'assess_timeline', label: 'Assess timeline' },
    ],
    outcomes: [
      { id: 'qualified', label: 'Qualified', color: 'green', nextActivity: 'send_proposal' },
      { id: 'not_qualified', label: 'Not Qualified', color: 'red' },
      { id: 'nurture', label: 'Nurture for Later', color: 'orange', nextActivity: 'follow_up' },
    ],
  },

  send_proposal: {
    id: 'send_proposal',
    name: 'Send Proposal',
    description: 'Create and send proposal to prospect',
    category: 'crm',
    icon: FileCheck,
    iconEmoji: '📄',
    defaultPriority: 'high',
    applicableEntities: ['deal', 'lead'],
    fields: [
      { id: 'proposalValue', label: 'Proposal Value', type: 'currency' },
      { id: 'proposalUrl', label: 'Proposal Link', type: 'url' },
      { id: 'notes', label: 'Notes', type: 'textarea' },
    ],
    checklist: [
      { id: 'customize_proposal', label: 'Customize proposal for client', required: true },
      { id: 'review_pricing', label: 'Review pricing' },
      { id: 'get_approval', label: 'Get internal approval if needed' },
    ],
    outcomes: [
      { id: 'sent', label: 'Proposal Sent', color: 'green', nextActivity: 'follow_up' },
      { id: 'accepted', label: 'Accepted', color: 'blue', nextActivity: 'negotiate_deal' },
      { id: 'declined', label: 'Declined', color: 'red' },
    ],
  },

  negotiate_deal: {
    id: 'negotiate_deal',
    name: 'Negotiate Deal',
    description: 'Negotiate contract terms',
    category: 'crm',
    icon: Handshake,
    iconEmoji: '🤝',
    defaultPriority: 'critical',
    applicableEntities: ['deal'],
    fields: [
      { id: 'originalValue', label: 'Original Value', type: 'currency' },
      { id: 'negotiatedValue', label: 'Negotiated Value', type: 'currency' },
      { id: 'terms', label: 'Key Terms', type: 'textarea' },
    ],
    checklist: [],
    outcomes: [
      { id: 'closed_won', label: 'Deal Closed - Won', color: 'green' },
      { id: 'closed_lost', label: 'Deal Closed - Lost', color: 'red' },
      { id: 'ongoing', label: 'Negotiation Ongoing', color: 'orange', nextActivity: 'negotiate_deal' },
    ],
  },

  // ==========================
  // HR PATTERNS
  // ==========================
  onboard_employee: {
    id: 'onboard_employee',
    name: 'Employee Onboarding',
    description: 'Complete new employee onboarding',
    category: 'hr',
    icon: UserPlus,
    iconEmoji: '👋',
    defaultPriority: 'high',
    applicableEntities: ['employee'],
    fields: [
      { id: 'startDate', label: 'Start Date', type: 'date' },
      { id: 'department', label: 'Department', type: 'text' },
      { id: 'manager', label: 'Manager', type: 'text' },
    ],
    checklist: [
      { id: 'offer_letter', label: 'Offer letter signed', required: true },
      { id: 'i9', label: 'I-9 completed', required: true },
      { id: 'tax_forms', label: 'Tax forms completed', required: true },
      { id: 'direct_deposit', label: 'Direct deposit setup' },
      { id: 'benefits', label: 'Benefits enrollment' },
      { id: 'equipment', label: 'Equipment assigned' },
      { id: 'access', label: 'System access granted' },
      { id: 'orientation', label: 'Orientation completed' },
    ],
    outcomes: [
      { id: 'completed', label: 'Onboarding Complete', color: 'green' },
      { id: 'pending', label: 'Items Pending', color: 'orange' },
      { id: 'withdrawn', label: 'Candidate Withdrew', color: 'red' },
    ],
  },

  one_on_one: {
    id: 'one_on_one',
    name: '1:1 Meeting',
    description: 'Conduct 1:1 meeting with team member',
    category: 'hr',
    icon: Users,
    iconEmoji: '👥',
    defaultPriority: 'normal',
    applicableEntities: ['employee'],
    fields: [
      { id: 'topics', label: 'Discussion Topics', type: 'textarea' },
      { id: 'actionItems', label: 'Action Items', type: 'textarea' },
      { id: 'feedback', label: 'Feedback Given', type: 'textarea' },
    ],
    checklist: [],
    outcomes: [
      { id: 'completed', label: 'Completed', color: 'green' },
      { id: 'rescheduled', label: 'Rescheduled', color: 'orange', nextActivity: 'one_on_one' },
    ],
  },

  performance_review: {
    id: 'performance_review',
    name: 'Performance Review',
    description: 'Conduct employee performance review',
    category: 'hr',
    icon: GraduationCap,
    iconEmoji: '📊',
    defaultPriority: 'high',
    applicableEntities: ['employee'],
    fields: [
      { id: 'reviewPeriod', label: 'Review Period', type: 'text' },
      { id: 'rating', label: 'Overall Rating', type: 'select', options: [
        { value: '5', label: '5 - Exceptional' },
        { value: '4', label: '4 - Exceeds Expectations' },
        { value: '3', label: '3 - Meets Expectations' },
        { value: '2', label: '2 - Needs Improvement' },
        { value: '1', label: '1 - Unsatisfactory' },
      ]},
      { id: 'achievements', label: 'Key Achievements', type: 'textarea' },
      { id: 'areasForGrowth', label: 'Areas for Growth', type: 'textarea' },
      { id: 'goals', label: 'Goals for Next Period', type: 'textarea' },
    ],
    checklist: [
      { id: 'self_review', label: 'Self-review submitted', required: true },
      { id: 'manager_review', label: 'Manager review completed', required: true },
      { id: 'calibration', label: 'Calibration completed' },
      { id: 'feedback_shared', label: 'Feedback shared with employee', required: true },
    ],
    outcomes: [
      { id: 'completed', label: 'Review Completed', color: 'green' },
      { id: 'pending_discussion', label: 'Pending Discussion', color: 'orange' },
    ],
  },
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get pattern by ID
 */
export function getPattern(patternId: string): ActivityPattern | undefined {
  return ACTIVITY_PATTERNS[patternId];
}

/**
 * Get all patterns for a category
 */
export function getPatternsByCategory(category: PatternCategory): ActivityPattern[] {
  return Object.values(ACTIVITY_PATTERNS).filter(p => p.category === category);
}

/**
 * Get patterns applicable to an entity type
 */
export function getPatternsForEntity(entityType: string): ActivityPattern[] {
  return Object.values(ACTIVITY_PATTERNS).filter(p =>
    !p.applicableEntities || p.applicableEntities.includes(entityType)
  );
}

/**
 * Get default due date for a pattern
 */
export function getPatternDueDate(
  pattern: ActivityPattern,
  startFrom: Date = new Date()
): Date {
  const hours = pattern.slaTier ?? DEFAULT_SLA_DURATIONS[pattern.defaultPriority];
  const dueDate = new Date(startFrom);
  dueDate.setHours(dueDate.getHours() + hours);
  return dueDate;
}

/**
 * Get fields for a pattern
 */
export function getPatternFields(patternId: string): PatternField[] {
  return ACTIVITY_PATTERNS[patternId]?.fields ?? [];
}

/**
 * Get checklist items for a pattern
 */
export function getPatternChecklist(patternId: string): ChecklistItem[] {
  return ACTIVITY_PATTERNS[patternId]?.checklist ?? [];
}

/**
 * Get outcomes for a pattern
 */
export function getPatternOutcomes(patternId: string): PatternOutcome[] {
  return ACTIVITY_PATTERNS[patternId]?.outcomes ?? [];
}

/**
 * Search patterns by name or tags
 */
export function searchPatterns(query: string): ActivityPattern[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(ACTIVITY_PATTERNS).filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags?.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get quick-log patterns (no pending state)
 */
export function getQuickLogPatterns(): ActivityPattern[] {
  return Object.values(ACTIVITY_PATTERNS).filter(p => p.quickLog);
}

/**
 * Get category label
 */
export function getCategoryLabel(category: PatternCategory): string {
  const labels: Record<PatternCategory, string> = {
    recruiting: 'Recruiting',
    bench_sales: 'Bench Sales',
    crm: 'CRM',
    hr: 'HR',
    general: 'General',
  };
  return labels[category];
}

/**
 * Get category color
 */
export function getCategoryColor(category: PatternCategory): string {
  const colors: Record<PatternCategory, string> = {
    recruiting: 'bg-blue-100 text-blue-700',
    bench_sales: 'bg-purple-100 text-purple-700',
    crm: 'bg-green-100 text-green-700',
    hr: 'bg-amber-100 text-amber-700',
    general: 'bg-gray-100 text-gray-700',
  };
  return colors[category];
}
