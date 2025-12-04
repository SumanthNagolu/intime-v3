/**
 * Zod Validation Schemas: Shared Infrastructure
 * Runtime validation for notifications, tasks, and comments
 */

import { z } from 'zod';

// =====================================================
// NOTIFICATIONS
// =====================================================

export const createNotificationSchema = z.object({
  // Recipient
  userId: z.string().uuid(),

  // Notification details
  notificationType: z.enum([
    'submission_update',
    'interview_scheduled',
    'offer_sent',
    'approval_needed',
    'placement_started',
    'bench_alert_30day',
    'bench_alert_60day',
    'campaign_response',
    'review_due',
    'timesheet_approval',
    'payroll_ready',
    'task_assigned',
    'mention',
  ]),
  title: z.string().min(1, 'Notification title is required').max(255),
  message: z.string().min(1, 'Notification message is required'),

  // Association (polymorphic)
  entityType: z.enum(['submission', 'interview', 'offer', 'placement', 'approval_request', 'task', 'comment']).optional(),
  entityId: z.string().uuid().optional(),

  // Delivery
  channels: z.array(z.enum(['in_app', 'email', 'slack'])).default(['in_app']),

  // Priority
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),

  // Action
  actionUrl: z.string().optional(),
  actionLabel: z.string().optional(),
});

export const markNotificationReadSchema = z.object({
  notificationId: z.string().uuid(),
});

export const archiveNotificationSchema = z.object({
  notificationId: z.string().uuid(),
});

// =====================================================
// TASKS
// =====================================================

export const createTaskSchema = z.object({
  // Task details
  title: z.string().min(1, 'Task title is required').max(255),
  description: z.string().optional(),

  // Association (optional)
  entityType: z.enum(['submission', 'candidate', 'job', 'deal', 'lead', 'placement', 'account']).optional(),
  entityId: z.string().uuid().optional(),

  // Assignment
  assignedTo: z.string().uuid().optional(),

  // Status
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),

  // Dates
  dueDate: z.coerce.date().optional(),

  // Recurrence
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.enum(['daily', 'weekly', 'monthly']).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().uuid(),
  completedBy: z.string().uuid().optional(),
  completedAt: z.coerce.date().optional(),
});

export const completeTaskSchema = z.object({
  taskId: z.string().uuid(),
});

export const assignTaskSchema = z.object({
  taskId: z.string().uuid(),
  assignedTo: z.string().uuid(),
});

// =====================================================
// COMMENTS
// =====================================================

export const createCommentSchema = z.object({
  // Association (polymorphic)
  entityType: z.enum(['submission', 'candidate', 'job', 'deal', 'lead', 'account', 'placement', 'interview']),
  entityId: z.string().uuid(),

  // Comment details
  content: z.string().min(1, 'Comment content is required').max(5000),

  // Threading
  parentCommentId: z.string().uuid().optional(),

  // Mentions
  mentionedUserIds: z.array(z.string().uuid()).optional(),
});

export const updateCommentSchema = z.object({
  commentId: z.string().uuid(),
  content: z.string().min(1, 'Comment content is required').max(5000),
});

export const deleteCommentSchema = z.object({
  commentId: z.string().uuid(),
});

export const addReactionSchema = z.object({
  commentId: z.string().uuid(),
  emoji: z.string().min(1).max(10),
});

export const removeReactionSchema = z.object({
  commentId: z.string().uuid(),
  emoji: z.string().min(1).max(10),
});

// =====================================================
// Type Exports
// =====================================================

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>;
export type ArchiveNotificationInput = z.infer<typeof archiveNotificationSchema>;

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
export type AddReactionInput = z.infer<typeof addReactionSchema>;
export type RemoveReactionInput = z.infer<typeof removeReactionSchema>;
