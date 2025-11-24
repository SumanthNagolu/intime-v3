-- ACAD-030: Revenue Analytics
-- Create analytics views and functions for revenue tracking

-- =====================================================
-- REVENUE ANALYTICS MATERIALIZED VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS revenue_analytics AS
SELECT
  DATE_TRUNC('month', pt.created_at) AS month,

  -- Monthly Recurring Revenue (subscriptions only)
  SUM(CASE
    WHEN pt.status = 'succeeded'
      AND se.payment_type = 'subscription'
    THEN pt.amount
    ELSE 0
  END) AS mrr,

  -- Total revenue (all payment types)
  SUM(CASE
    WHEN pt.status = 'succeeded'
    THEN pt.amount
    ELSE 0
  END) AS total_revenue,

  -- One-time payment revenue
  SUM(CASE
    WHEN pt.status = 'succeeded'
      AND se.payment_type = 'one_time'
    THEN pt.amount
    ELSE 0
  END) AS one_time_revenue,

  -- Total enrollments
  COUNT(DISTINCT se.id) AS total_enrollments,

  -- Active subscriptions (at end of month)
  COUNT(DISTINCT CASE
    WHEN se.status = 'active'
      AND se.payment_type = 'subscription'
    THEN se.id
  END) AS active_subscriptions,

  -- New subscriptions this month
  COUNT(DISTINCT CASE
    WHEN se.payment_type = 'subscription'
      AND DATE_TRUNC('month', se.enrolled_at) = DATE_TRUNC('month', pt.created_at)
    THEN se.id
  END) AS new_subscriptions,

  -- Churned subscriptions this month
  COUNT(DISTINCT CASE
    WHEN se.status IN ('dropped', 'expired')
      AND se.payment_type = 'subscription'
      AND DATE_TRUNC('month', se.updated_at) = DATE_TRUNC('month', pt.created_at)
    THEN se.id
  END) AS churned_subscriptions,

  -- Successful payments
  COUNT(CASE WHEN pt.status = 'succeeded' THEN 1 END) AS successful_payments,

  -- Failed payments
  COUNT(CASE WHEN pt.status = 'failed' THEN 1 END) AS failed_payments,

  -- Refunded payments
  COUNT(CASE WHEN pt.status = 'refunded' THEN 1 END) AS refunded_payments,

  -- Total refund amount
  SUM(CASE WHEN pt.status = 'refunded' THEN pt.amount ELSE 0 END) AS refund_amount,

  -- Average revenue per enrollment
  AVG(CASE WHEN pt.status = 'succeeded' THEN pt.amount END) AS avg_revenue_per_enrollment,

  -- Unique paying students
  COUNT(DISTINCT pt.user_id) AS unique_paying_students

FROM payment_transactions pt
JOIN student_enrollments se ON se.id = pt.enrollment_id
GROUP BY DATE_TRUNC('month', pt.created_at);

-- Create unique index for efficient refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_revenue_analytics_month ON revenue_analytics(month);

-- Create index for date range queries
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_month_desc ON revenue_analytics(month DESC);

COMMENT ON MATERIALIZED VIEW revenue_analytics IS 'ACAD-030: Monthly revenue analytics aggregation';

-- =====================================================
-- COURSE REVENUE ANALYTICS VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS course_revenue_analytics AS
SELECT
  c.id AS course_id,
  c.title AS course_title,
  c.slug AS course_slug,

  -- Total revenue for this course
  SUM(CASE WHEN pt.status = 'succeeded' THEN pt.amount ELSE 0 END) AS total_revenue,

  -- Total enrollments
  COUNT(DISTINCT se.id) AS total_enrollments,

  -- Active enrollments
  COUNT(DISTINCT CASE WHEN se.status = 'active' THEN se.id END) AS active_enrollments,

  -- Completed enrollments
  COUNT(DISTINCT CASE WHEN se.status = 'completed' THEN se.id END) AS completed_enrollments,

  -- Average revenue per enrollment
  AVG(CASE WHEN pt.status = 'succeeded' THEN pt.amount END) AS avg_revenue_per_enrollment,

  -- Completion rate
  ROUND(
    COUNT(DISTINCT CASE WHEN se.status = 'completed' THEN se.id END)::numeric /
    NULLIF(COUNT(DISTINCT se.id), 0) * 100,
    2
  ) AS completion_rate_percent,

  -- First enrollment date
  MIN(se.enrolled_at) AS first_enrollment_at,

  -- Last enrollment date
  MAX(se.enrolled_at) AS last_enrollment_at

FROM courses c
LEFT JOIN student_enrollments se ON se.course_id = c.id
LEFT JOIN payment_transactions pt ON pt.enrollment_id = se.id
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.title, c.slug;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_course_revenue_analytics_course ON course_revenue_analytics(course_id);

COMMENT ON MATERIALIZED VIEW course_revenue_analytics IS 'ACAD-030: Per-course revenue analytics';

-- =====================================================
-- STUDENT LIFETIME VALUE VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS student_ltv_analytics AS
SELECT
  up.id AS student_id,
  up.full_name AS student_name,
  up.email AS student_email,

  -- Total revenue from this student
  SUM(CASE WHEN pt.status = 'succeeded' THEN pt.amount ELSE 0 END) AS lifetime_revenue,

  -- Number of enrollments
  COUNT(DISTINCT se.id) AS total_enrollments,

  -- Number of active subscriptions
  COUNT(DISTINCT CASE
    WHEN se.status = 'active' AND se.payment_type = 'subscription'
    THEN se.id
  END) AS active_subscriptions,

  -- Average revenue per enrollment
  AVG(CASE WHEN pt.status = 'succeeded' THEN pt.amount END) AS avg_revenue_per_enrollment,

  -- First purchase date
  MIN(pt.created_at) AS first_purchase_at,

  -- Last purchase date
  MAX(pt.created_at) AS last_purchase_at,

  -- Months as customer
  EXTRACT(EPOCH FROM (MAX(pt.created_at) - MIN(pt.created_at))) / (30 * 24 * 60 * 60) AS months_as_customer

FROM user_profiles up
JOIN payment_transactions pt ON pt.user_id = up.id
JOIN student_enrollments se ON se.id = pt.enrollment_id
WHERE pt.status = 'succeeded'
GROUP BY up.id, up.full_name, up.email;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_ltv_analytics_student ON student_ltv_analytics(student_id);

-- Create index for high-value students
CREATE INDEX IF NOT EXISTS idx_student_ltv_analytics_revenue ON student_ltv_analytics(lifetime_revenue DESC);

COMMENT ON MATERIALIZED VIEW student_ltv_analytics IS 'ACAD-030: Student lifetime value analytics';

-- =====================================================
-- DISCOUNT CODE EFFECTIVENESS VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS discount_effectiveness_analytics AS
SELECT
  dc.id AS discount_code_id,
  dc.code AS discount_code,
  dc.name AS discount_name,
  dc.discount_type,
  dc.discount_value,

  -- Usage stats
  COUNT(dcu.id) AS total_uses,
  dc.max_uses AS max_uses_limit,

  -- Revenue impact
  SUM(dcu.original_amount) AS total_original_amount,
  SUM(dcu.discount_amount) AS total_discount_given,
  SUM(dcu.final_amount) AS total_revenue_generated,

  -- Average discount
  AVG(dcu.discount_amount) AS avg_discount_per_use,

  -- Conversion metrics
  ROUND(
    SUM(dcu.final_amount) / NULLIF(SUM(dcu.discount_amount), 0),
    2
  ) AS roi_ratio, -- Revenue per dollar discounted

  -- First and last usage
  MIN(dcu.used_at) AS first_used_at,
  MAX(dcu.used_at) AS last_used_at,

  -- Active status
  dc.is_active,
  dc.valid_from,
  dc.valid_until

FROM discount_codes dc
LEFT JOIN discount_code_usage dcu ON dcu.discount_code_id = dc.id
WHERE dc.deleted_at IS NULL
GROUP BY dc.id, dc.code, dc.name, dc.discount_type, dc.discount_value,
         dc.max_uses, dc.is_active, dc.valid_from, dc.valid_until;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_discount_effectiveness_code ON discount_effectiveness_analytics(discount_code_id);

COMMENT ON MATERIALIZED VIEW discount_effectiveness_analytics IS 'ACAD-030: Discount code ROI analytics';

-- =====================================================
-- ANALYTICS CALCULATION FUNCTIONS
-- =====================================================

-- Calculate MRR (Monthly Recurring Revenue)
CREATE OR REPLACE FUNCTION calculate_mrr()
RETURNS NUMERIC AS $$
DECLARE
  current_mrr NUMERIC;
BEGIN
  SELECT COALESCE(SUM(pt.amount), 0) INTO current_mrr
  FROM payment_transactions pt
  JOIN student_enrollments se ON se.id = pt.enrollment_id
  WHERE pt.status = 'succeeded'
    AND se.payment_type = 'subscription'
    AND se.status = 'active'
    AND DATE_TRUNC('month', pt.created_at) = DATE_TRUNC('month', NOW());

  RETURN current_mrr;
END;
$$ LANGUAGE plpgsql STABLE;

-- Calculate churn rate (percentage)
CREATE OR REPLACE FUNCTION calculate_churn_rate(
  p_period_months INTEGER DEFAULT 1
)
RETURNS NUMERIC AS $$
DECLARE
  start_date TIMESTAMPTZ;
  end_date TIMESTAMPTZ;
  starting_subs INTEGER;
  churned_subs INTEGER;
  churn_rate NUMERIC;
BEGIN
  end_date := DATE_TRUNC('month', NOW());
  start_date := end_date - (p_period_months || ' months')::INTERVAL;

  -- Count active subscriptions at start of period
  SELECT COUNT(DISTINCT se.id) INTO starting_subs
  FROM student_enrollments se
  WHERE se.payment_type = 'subscription'
    AND se.status = 'active'
    AND se.enrolled_at < start_date;

  -- Count subscriptions that churned during period
  SELECT COUNT(DISTINCT se.id) INTO churned_subs
  FROM student_enrollments se
  WHERE se.payment_type = 'subscription'
    AND se.status IN ('dropped', 'expired')
    AND se.updated_at >= start_date
    AND se.updated_at < end_date;

  -- Calculate churn rate
  IF starting_subs > 0 THEN
    churn_rate := (churned_subs::NUMERIC / starting_subs) * 100;
  ELSE
    churn_rate := 0;
  END IF;

  RETURN ROUND(churn_rate, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- Calculate average Student Lifetime Value
CREATE OR REPLACE FUNCTION calculate_avg_student_ltv()
RETURNS NUMERIC AS $$
DECLARE
  avg_monthly_revenue NUMERIC;
  avg_subscription_months NUMERIC;
  churn_rate NUMERIC;
  ltv NUMERIC;
BEGIN
  -- Get average monthly revenue per active subscription
  SELECT AVG(pt.amount) INTO avg_monthly_revenue
  FROM payment_transactions pt
  JOIN student_enrollments se ON se.id = pt.enrollment_id
  WHERE pt.status = 'succeeded'
    AND se.payment_type = 'subscription'
    AND se.status = 'active';

  -- Get average subscription duration in months
  SELECT AVG(
    EXTRACT(EPOCH FROM (
      COALESCE(se.completed_at, NOW()) - se.enrolled_at
    )) / (30 * 24 * 60 * 60)
  ) INTO avg_subscription_months
  FROM student_enrollments se
  WHERE se.payment_type = 'subscription';

  -- Get churn rate
  churn_rate := calculate_churn_rate(3); -- 3-month churn rate

  -- Calculate LTV
  IF churn_rate > 0 THEN
    ltv := (avg_monthly_revenue * avg_subscription_months) / (churn_rate / 100);
  ELSE
    ltv := avg_monthly_revenue * avg_subscription_months;
  END IF;

  RETURN ROUND(COALESCE(ltv, 0), 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- Get payment success rate
CREATE OR REPLACE FUNCTION calculate_payment_success_rate(
  p_period_days INTEGER DEFAULT 30
)
RETURNS NUMERIC AS $$
DECLARE
  total_payments INTEGER;
  successful_payments INTEGER;
  success_rate NUMERIC;
BEGIN
  SELECT
    COUNT(*),
    COUNT(CASE WHEN status = 'succeeded' THEN 1 END)
  INTO total_payments, successful_payments
  FROM payment_transactions
  WHERE created_at >= NOW() - (p_period_days || ' days')::INTERVAL;

  IF total_payments > 0 THEN
    success_rate := (successful_payments::NUMERIC / total_payments) * 100;
  ELSE
    success_rate := 0;
  END IF;

  RETURN ROUND(success_rate, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- Calculate refund rate
CREATE OR REPLACE FUNCTION calculate_refund_rate(
  p_period_days INTEGER DEFAULT 30
)
RETURNS NUMERIC AS $$
DECLARE
  total_successful INTEGER;
  total_refunded INTEGER;
  refund_rate NUMERIC;
BEGIN
  SELECT
    COUNT(CASE WHEN status = 'succeeded' THEN 1 END),
    COUNT(CASE WHEN status = 'refunded' THEN 1 END)
  INTO total_successful, total_refunded
  FROM payment_transactions
  WHERE created_at >= NOW() - (p_period_days || ' days')::INTERVAL;

  IF total_successful > 0 THEN
    refund_rate := (total_refunded::NUMERIC / total_successful) * 100;
  ELSE
    refund_rate := 0;
  END IF;

  RETURN ROUND(refund_rate, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- Get enrollment funnel metrics
CREATE OR REPLACE FUNCTION get_enrollment_funnel(
  p_period_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  stage TEXT,
  count BIGINT,
  conversion_rate NUMERIC
) AS $$
DECLARE
  total_views BIGINT := 1000; -- This would come from analytics tracking
  total_attempts BIGINT;
  total_enrollments BIGINT;
BEGIN
  -- Get payment attempts (checkout sessions created)
  SELECT COUNT(*) INTO total_attempts
  FROM payment_transactions
  WHERE created_at >= NOW() - (p_period_days || ' days')::INTERVAL;

  -- Get successful enrollments
  SELECT COUNT(*) INTO total_enrollments
  FROM student_enrollments
  WHERE enrolled_at >= NOW() - (p_period_days || ' days')::INTERVAL;

  RETURN QUERY
  SELECT
    'Course Views'::TEXT,
    total_views,
    100.0::NUMERIC
  UNION ALL
  SELECT
    'Checkout Attempts'::TEXT,
    total_attempts,
    ROUND((total_attempts::NUMERIC / NULLIF(total_views, 0)) * 100, 2)
  UNION ALL
  SELECT
    'Successful Enrollments'::TEXT,
    total_enrollments,
    ROUND((total_enrollments::NUMERIC / NULLIF(total_attempts, 0)) * 100, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- MATERIALIZED VIEW REFRESH FUNCTION
-- =====================================================

-- Refresh all revenue analytics views
CREATE OR REPLACE FUNCTION refresh_revenue_analytics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY revenue_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY course_revenue_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY student_ltv_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY discount_effectiveness_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION refresh_revenue_analytics IS 'ACAD-030: Refresh all revenue analytics materialized views (call via cron)';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions to authenticated users for read-only functions
GRANT EXECUTE ON FUNCTION calculate_mrr() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_churn_rate(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_avg_student_ltv() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_payment_success_rate(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_refund_rate(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_enrollment_funnel(INTEGER) TO authenticated;

-- Grant refresh function to service role only (for cron jobs)
GRANT EXECUTE ON FUNCTION refresh_revenue_analytics() TO service_role;
