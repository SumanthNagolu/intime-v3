-- =====================================================
-- Migration: Shared Infrastructure
-- Date: 2024-11-24
-- Description: Notifications, tasks, comments for collaboration
-- =====================================================

-- =====================================================
-- 1. NOTIFICATIONS (In-App + Email)
-- =====================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Recipient
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Notification details
  notification_type TEXT NOT NULL,
  -- Types: 'submission_update', 'interview_scheduled', 'offer_sent', 'approval_needed',
  --        'placement_started', 'bench_alert_30day', 'bench_alert_60day', 'campaign_response',
  --        'review_due', 'timesheet_approval', 'payroll_ready'

  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Association (polymorphic)
  entity_type TEXT, -- 'submission', 'interview', 'offer', 'placement', 'approval_request', etc.
  entity_id UUID,

  -- Delivery
  channels TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'slack'
  email_sent_at TIMESTAMPTZ,
  email_error TEXT,
  slack_sent_at TIMESTAMPTZ,
  slack_error TEXT,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,

  -- Priority
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'

  -- Action
  action_url TEXT, -- Deep link to relevant entity
  action_label TEXT, -- Button label (e.g., "View Submission", "Approve")

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_notifications_org ON notifications(org_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE NOT is_read AND NOT is_archived;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_entity ON notifications(entity_type, entity_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);

-- Auto-cleanup old read notifications (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE is_read = true
    AND read_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. TASKS (To-Do Items & Action Items)
-- =====================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Task details
  title TEXT NOT NULL,
  description TEXT,

  -- Association (optional)
  entity_type TEXT, -- 'submission', 'candidate', 'job', 'deal', 'lead', 'placement'
  entity_id UUID,

  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id),
  created_by UUID NOT NULL REFERENCES user_profiles(id),

  -- Status
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'completed', 'cancelled'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'

  -- Dates
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES user_profiles(id),

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
  parent_task_id UUID REFERENCES tasks(id), -- For recurring tasks

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_tasks_org ON tasks(org_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to, status) WHERE status IN ('todo', 'in_progress');
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_due ON tasks(due_date) WHERE status IN ('todo', 'in_progress');
CREATE INDEX idx_tasks_entity ON tasks(entity_type, entity_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Auto-update updated_at
CREATE TRIGGER trigger_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create notification when task assigned
CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    INSERT INTO notifications (
      org_id,
      user_id,
      notification_type,
      title,
      message,
      entity_type,
      entity_id,
      priority,
      action_url
    ) VALUES (
      NEW.org_id,
      NEW.assigned_to,
      'task_assigned',
      'New task assigned to you',
      NEW.title,
      'task',
      NEW.id,
      CASE NEW.priority
        WHEN 'urgent' THEN 'urgent'
        WHEN 'high' THEN 'high'
        ELSE 'normal'
      END,
      '/tasks/' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_task_assigned
  AFTER INSERT OR UPDATE OF assigned_to ON tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_assigned();

-- =====================================================
-- 3. COMMENTS (Collaborative Notes)
-- =====================================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Association (polymorphic)
  entity_type TEXT NOT NULL, -- 'submission', 'candidate', 'job', 'deal', 'lead', 'account', 'placement'
  entity_id UUID NOT NULL,

  -- Comment details
  content TEXT NOT NULL,

  -- Threading
  parent_comment_id UUID REFERENCES comments(id),
  reply_count INTEGER DEFAULT 0,

  -- Author
  author_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Mentions
  mentioned_user_ids UUID[], -- @mention support

  -- Reactions
  reactions JSONB DEFAULT '{}', -- { "👍": ["user_id1", "user_id2"], "❤️": ["user_id3"] }

  -- Status
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),

  -- Editing
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  original_content TEXT, -- Keep original for audit

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_comments_org ON comments(org_id);
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id) WHERE NOT is_deleted;
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);

-- Auto-update updated_at
CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update parent comment reply_count
CREATE OR REPLACE FUNCTION update_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_comment_id IS NOT NULL THEN
    UPDATE comments SET
      reply_count = (SELECT COUNT(*) FROM comments WHERE parent_comment_id = NEW.parent_comment_id AND NOT is_deleted)
    WHERE id = NEW.parent_comment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reply_count
  AFTER INSERT OR UPDATE OF is_deleted ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_reply_count();

-- Auto-notify mentioned users
CREATE OR REPLACE FUNCTION notify_mentioned_users()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_user UUID;
BEGIN
  IF NEW.mentioned_user_ids IS NOT NULL AND array_length(NEW.mentioned_user_ids, 1) > 0 THEN
    FOREACH mentioned_user IN ARRAY NEW.mentioned_user_ids
    LOOP
      INSERT INTO notifications (
        org_id,
        user_id,
        notification_type,
        title,
        message,
        entity_type,
        entity_id,
        priority,
        action_url
      ) VALUES (
        NEW.org_id,
        mentioned_user,
        'mention',
        'You were mentioned in a comment',
        LEFT(NEW.content, 100),
        NEW.entity_type,
        NEW.entity_id,
        'normal',
        '/' || NEW.entity_type || 's/' || NEW.entity_id || '#comment-' || NEW.id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_mentions
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION notify_mentioned_users();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS: NOTIFICATIONS
-- =====================================================

CREATE POLICY "notifications_org_isolation"
  ON notifications
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "notifications_user_own"
  ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- System can create notifications
CREATE POLICY "notifications_system_create"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Users can mark own notifications as read
CREATE POLICY "notifications_user_update_own"
  ON notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- RLS: TASKS
-- =====================================================

CREATE POLICY "tasks_org_isolation"
  ON tasks
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "tasks_assigned_or_created"
  ON tasks
  FOR SELECT
  USING (
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    auth_has_role('admin')
  );

CREATE POLICY "tasks_create_own"
  ON tasks
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "tasks_update_assigned_or_admin"
  ON tasks
  FOR UPDATE
  USING (
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    auth_has_role('admin')
  );

CREATE POLICY "tasks_delete_creator_or_admin"
  ON tasks
  FOR DELETE
  USING (
    created_by = auth.uid() OR
    auth_has_role('admin')
  );

-- =====================================================
-- RLS: COMMENTS
-- =====================================================

CREATE POLICY "comments_org_isolation"
  ON comments
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "comments_read_all"
  ON comments
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin')
  );

CREATE POLICY "comments_create_employee"
  ON comments
  FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND (
      auth_has_role('employee') OR
      auth_has_role('admin')
    )
  );

CREATE POLICY "comments_update_own"
  ON comments
  FOR UPDATE
  USING (
    author_id = auth.uid() OR
    auth_has_role('admin')
  );

CREATE POLICY "comments_delete_own_or_admin"
  ON comments
  FOR DELETE
  USING (
    author_id = auth.uid() OR
    auth_has_role('admin')
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to create submission status notification
CREATE OR REPLACE FUNCTION create_submission_notification(
  p_submission_id UUID,
  p_new_status TEXT,
  p_recipient_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_org_id UUID;
  v_submission submissions;
BEGIN
  -- Get submission details
  SELECT s INTO v_submission
  FROM submissions s
  WHERE s.id = p_submission_id;

  v_org_id := v_submission.org_id;

  -- Create notification
  INSERT INTO notifications (
    org_id,
    user_id,
    notification_type,
    title,
    message,
    entity_type,
    entity_id,
    priority,
    action_url
  ) VALUES (
    v_org_id,
    p_recipient_id,
    'submission_update',
    'Submission status updated',
    format('Submission moved to %s', p_new_status),
    'submission',
    p_submission_id,
    CASE
      WHEN p_new_status = 'client_interview' THEN 'high'
      WHEN p_new_status = 'offer_stage' THEN 'high'
      WHEN p_new_status = 'placed' THEN 'urgent'
      ELSE 'normal'
    END,
    '/submissions/' || p_submission_id
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create bench aging alert
CREATE OR REPLACE FUNCTION create_bench_aging_alert(
  p_candidate_id UUID,
  p_days_on_bench INTEGER
)
RETURNS void AS $$
DECLARE
  v_org_id UUID;
  v_bench_rep_id UUID;
BEGIN
  -- Get org and bench rep
  SELECT up.org_id, bm.bench_sales_rep_id
  INTO v_org_id, v_bench_rep_id
  FROM user_profiles up
  LEFT JOIN bench_metadata bm ON bm.user_id = up.id
  WHERE up.id = p_candidate_id;

  -- Create notification for bench rep
  IF v_bench_rep_id IS NOT NULL THEN
    INSERT INTO notifications (
      org_id,
      user_id,
      notification_type,
      title,
      message,
      entity_type,
      entity_id,
      priority,
      action_url
    ) VALUES (
      v_org_id,
      v_bench_rep_id,
      CASE
        WHEN p_days_on_bench >= 60 THEN 'bench_alert_60day'
        WHEN p_days_on_bench >= 30 THEN 'bench_alert_30day'
      END,
      format('Consultant on bench for %s days', p_days_on_bench),
      'Urgent: Placement needed',
      'candidate',
      p_candidate_id,
      'urgent',
      '/bench/talent/' || p_candidate_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE notifications IS 'In-app and email notifications for users';
COMMENT ON TABLE tasks IS 'To-do items and action items with assignment';
COMMENT ON TABLE comments IS 'Collaborative comments on entities with @mentions';

COMMENT ON FUNCTION create_submission_notification IS 'Helper to create submission status change notifications';
COMMENT ON FUNCTION create_bench_aging_alert IS 'Helper to create bench aging alert notifications';
