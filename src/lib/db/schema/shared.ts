/**
 * Drizzle ORM Schema: Shared Infrastructure
 * Tables: notifications, tasks, comments
 */

import { pgTable, uuid, text, timestamp, boolean, date, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles';
import { organizations } from './organizations';

// =====================================================
// NOTIFICATIONS
// =====================================================

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Recipient
  userId: uuid('user_id').notNull().references(() => userProfiles.id),

  // Notification details
  notificationType: text('notification_type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),

  // Association (polymorphic)
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),

  // Delivery
  channels: text('channels').array().default(['in_app']),
  emailSentAt: timestamp('email_sent_at', { withTimezone: true }),
  emailError: text('email_error'),
  slackSentAt: timestamp('slack_sent_at', { withTimezone: true }),
  slackError: text('slack_error'),

  // Status
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at', { withTimezone: true }),
  isArchived: boolean('is_archived').default(false),
  archivedAt: timestamp('archived_at', { withTimezone: true }),

  // Priority
  priority: text('priority').default('normal'),

  // Action
  actionUrl: text('action_url'),
  actionLabel: text('action_label'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  organization: one(organizations, {
    fields: [notifications.orgId],
    references: [organizations.id],
  }),
  user: one(userProfiles, {
    fields: [notifications.userId],
    references: [userProfiles.id],
  }),
}));

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// =====================================================
// TASKS
// =====================================================

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Task details
  title: text('title').notNull(),
  description: text('description'),

  // Association (optional)
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),

  // Assignment
  assignedTo: uuid('assigned_to').references(() => userProfiles.id),
  createdBy: uuid('created_by').notNull().references(() => userProfiles.id),

  // Status
  status: text('status').notNull().default('todo'),
  priority: text('priority').default('medium'),

  // Dates
  dueDate: date('due_date'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedBy: uuid('completed_by').references(() => userProfiles.id),

  // Recurrence
  isRecurring: boolean('is_recurring').default(false),
  recurrencePattern: text('recurrence_pattern'),
  parentTaskId: uuid('parent_task_id').references(() => tasks.id),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  organization: one(organizations, {
    fields: [tasks.orgId],
    references: [organizations.id],
  }),
  assignee: one(userProfiles, {
    fields: [tasks.assignedTo],
    references: [userProfiles.id],
  }),
  creator: one(userProfiles, {
    fields: [tasks.createdBy],
    references: [userProfiles.id],
  }),
  completer: one(userProfiles, {
    fields: [tasks.completedBy],
    references: [userProfiles.id],
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
  }),
}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

// =====================================================
// COMMENTS
// =====================================================

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Association (polymorphic)
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),

  // Comment details
  content: text('content').notNull(),

  // Threading
  parentCommentId: uuid('parent_comment_id').references(() => comments.id),
  replyCount: integer('reply_count').default(0),

  // Author
  authorId: uuid('author_id').notNull().references(() => userProfiles.id),

  // Mentions
  mentionedUserIds: uuid('mentioned_user_ids').array(),

  // Reactions
  reactions: jsonb('reactions').default('{}'),

  // Status
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: uuid('deleted_by').references(() => userProfiles.id),

  // Editing
  isEdited: boolean('is_edited').default(false),
  editedAt: timestamp('edited_at', { withTimezone: true }),
  originalContent: text('original_content'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  organization: one(organizations, {
    fields: [comments.orgId],
    references: [organizations.id],
  }),
  author: one(userProfiles, {
    fields: [comments.authorId],
    references: [userProfiles.id],
  }),
  deleter: one(userProfiles, {
    fields: [comments.deletedBy],
    references: [userProfiles.id],
  }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
  }),
}));

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

// =====================================================
// Enums for Type Safety
// =====================================================

export const NotificationType = {
  SUBMISSION_UPDATE: 'submission_update',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  OFFER_SENT: 'offer_sent',
  APPROVAL_NEEDED: 'approval_needed',
  PLACEMENT_STARTED: 'placement_started',
  BENCH_ALERT_30DAY: 'bench_alert_30day',
  BENCH_ALERT_60DAY: 'bench_alert_60day',
  CAMPAIGN_RESPONSE: 'campaign_response',
  REVIEW_DUE: 'review_due',
  TIMESHEET_APPROVAL: 'timesheet_approval',
  PAYROLL_READY: 'payroll_ready',
  TASK_ASSIGNED: 'task_assigned',
  MENTION: 'mention',
} as const;

export const NotificationChannel = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SLACK: 'slack',
} as const;

export const NotificationPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const RecurrencePattern = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

export type NotificationTypeType = typeof NotificationType[keyof typeof NotificationType];
export type NotificationChannelType = typeof NotificationChannel[keyof typeof NotificationChannel];
export type NotificationPriorityType = typeof NotificationPriority[keyof typeof NotificationPriority];
export type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus];
export type TaskPriorityType = typeof TaskPriority[keyof typeof TaskPriority];
export type RecurrencePatternType = typeof RecurrencePattern[keyof typeof RecurrencePattern];

// =====================================================
// FILE UPLOADS
// =====================================================

export const fileUploads = pgTable('file_uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Storage
  bucket: text('bucket').notNull(), // 'avatars', 'resumes', 'documents', 'attachments', 'course-materials'
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(), // bytes
  mimeType: text('mime_type').notNull(),

  // Association (polymorphic)
  entityType: text('entity_type'), // 'deal', 'lead', 'account', 'candidate', 'job', etc.
  entityId: uuid('entity_id'),

  // Uploader
  uploadedBy: uuid('uploaded_by').notNull().references(() => userProfiles.id),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),

  // Soft delete
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // Metadata
  metadata: jsonb('metadata').default('{}'),
});

export const fileUploadsRelations = relations(fileUploads, ({ one }) => ({
  organization: one(organizations, {
    fields: [fileUploads.orgId],
    references: [organizations.id],
  }),
  uploader: one(userProfiles, {
    fields: [fileUploads.uploadedBy],
    references: [userProfiles.id],
  }),
}));

export type FileUpload = typeof fileUploads.$inferSelect;
export type NewFileUpload = typeof fileUploads.$inferInsert;

export const FileBucket = {
  AVATARS: 'avatars',
  RESUMES: 'resumes',
  DOCUMENTS: 'documents',
  ATTACHMENTS: 'attachments',
  COURSE_MATERIALS: 'course-materials',
} as const;

export type FileBucketType = typeof FileBucket[keyof typeof FileBucket];
