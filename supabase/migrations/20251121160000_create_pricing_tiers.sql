-- ACAD-029: Pricing Tiers
-- Create pricing plans and discount code system

-- =====================================================
-- PRICING PLANS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,

  -- Plan type
  plan_type TEXT NOT NULL CHECK (plan_type IN ('per_course', 'all_access', 'team', 'enterprise')),

  -- Pricing
  price_monthly NUMERIC(10,2),
  price_annual NUMERIC(10,2),
  price_one_time NUMERIC(10,2),

  -- Stripe integration
  stripe_price_id_monthly TEXT,
  stripe_price_id_annual TEXT,
  stripe_price_id_one_time TEXT,
  stripe_product_id TEXT,

  -- Features (JSON array)
  features JSONB DEFAULT '[]'::jsonb,

  -- Limits
  max_courses INTEGER, -- null = unlimited
  max_users INTEGER, -- For team plans

  -- Display
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  badge_text TEXT, -- "Most Popular", "Best Value", etc.

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_pricing_plans_plan_type ON pricing_plans(plan_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_pricing_plans_active ON pricing_plans(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_pricing_plans_slug ON pricing_plans(slug) WHERE deleted_at IS NULL;

-- Updated at trigger
CREATE TRIGGER set_pricing_plans_updated_at
  BEFORE UPDATE ON pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DISCOUNT CODES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,

  -- Discount configuration
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),

  -- Usage limits
  max_uses INTEGER, -- null = unlimited
  uses_count INTEGER DEFAULT 0 CHECK (uses_count >= 0),
  max_uses_per_user INTEGER DEFAULT 1,

  -- Validity period
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,

  -- Restrictions
  applicable_plan_types TEXT[], -- null = all plan types
  applicable_course_ids UUID[], -- null = all courses
  minimum_purchase_amount NUMERIC(10,2), -- null = no minimum

  -- Stripe integration
  stripe_coupon_id TEXT,
  stripe_promotion_code_id TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_discount_codes_code ON discount_codes(code) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active, valid_from, valid_until) WHERE deleted_at IS NULL;
CREATE INDEX idx_discount_codes_validity ON discount_codes(valid_from, valid_until) WHERE deleted_at IS NULL AND is_active = true;

-- Updated at trigger
CREATE TRIGGER set_discount_codes_updated_at
  BEFORE UPDATE ON discount_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DISCOUNT CODE USAGE TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS discount_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  enrollment_id UUID REFERENCES student_enrollments(id),

  -- Usage details
  original_amount NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) NOT NULL,
  final_amount NUMERIC(10,2) NOT NULL,

  -- Stripe reference
  stripe_payment_intent_id TEXT,

  -- Timestamps
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_discount_usage_code ON discount_code_usage(discount_code_id);
CREATE INDEX idx_discount_usage_user ON discount_code_usage(user_id);
CREATE INDEX idx_discount_usage_enrollment ON discount_code_usage(enrollment_id);

-- Unique constraint: one use per user per discount code (unless max_uses_per_user allows more)
CREATE UNIQUE INDEX idx_discount_usage_user_code ON discount_code_usage(user_id, discount_code_id);

-- =====================================================
-- COURSE PRICING OVERRIDES
-- =====================================================

CREATE TABLE IF NOT EXISTS course_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Pricing
  price_monthly NUMERIC(10,2),
  price_annual NUMERIC(10,2),
  price_one_time NUMERIC(10,2),

  -- Stripe integration
  stripe_price_id_monthly TEXT,
  stripe_price_id_annual TEXT,
  stripe_price_id_one_time TEXT,
  stripe_product_id TEXT,

  -- Early bird / limited time pricing
  early_bird_price NUMERIC(10,2),
  early_bird_valid_until TIMESTAMPTZ,

  -- Scholarship / free access
  scholarship_available BOOLEAN DEFAULT false,
  scholarship_criteria TEXT,

  -- Team pricing
  team_discount_percentage NUMERIC(5,2), -- Percentage off for team purchases
  min_team_size INTEGER DEFAULT 5,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique: one pricing config per course
  UNIQUE(course_id)
);

-- Indexes
CREATE INDEX idx_course_pricing_course ON course_pricing(course_id);
CREATE INDEX idx_course_pricing_early_bird ON course_pricing(early_bird_valid_until) WHERE early_bird_price IS NOT NULL;

-- Updated at trigger
CREATE TRIGGER set_course_pricing_updated_at
  BEFORE UPDATE ON course_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to validate discount code
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code TEXT,
  p_user_id UUID,
  p_course_id UUID DEFAULT NULL,
  p_plan_type TEXT DEFAULT NULL,
  p_amount NUMERIC DEFAULT NULL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_id UUID,
  discount_type TEXT,
  discount_value NUMERIC,
  error_message TEXT
) AS $$
DECLARE
  v_discount RECORD;
  v_usage_count INTEGER;
BEGIN
  -- Get discount code
  SELECT * INTO v_discount
  FROM discount_codes
  WHERE code = p_code
    AND deleted_at IS NULL
    AND is_active = true
    AND valid_from <= NOW()
    AND (valid_until IS NULL OR valid_until >= NOW());

  -- Check if code exists
  IF v_discount IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Invalid or expired discount code';
    RETURN;
  END IF;

  -- Check max uses
  IF v_discount.max_uses IS NOT NULL AND v_discount.uses_count >= v_discount.max_uses THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Discount code has reached maximum uses';
    RETURN;
  END IF;

  -- Check user-specific usage
  SELECT COUNT(*) INTO v_usage_count
  FROM discount_code_usage
  WHERE discount_code_id = v_discount.id
    AND user_id = p_user_id;

  IF v_discount.max_uses_per_user IS NOT NULL AND v_usage_count >= v_discount.max_uses_per_user THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'You have already used this discount code';
    RETURN;
  END IF;

  -- Check plan type restriction
  IF v_discount.applicable_plan_types IS NOT NULL AND p_plan_type IS NOT NULL THEN
    IF NOT (p_plan_type = ANY(v_discount.applicable_plan_types)) THEN
      RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Discount code not applicable to this plan';
      RETURN;
    END IF;
  END IF;

  -- Check course restriction
  IF v_discount.applicable_course_ids IS NOT NULL AND p_course_id IS NOT NULL THEN
    IF NOT (p_course_id = ANY(v_discount.applicable_course_ids)) THEN
      RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Discount code not applicable to this course';
      RETURN;
    END IF;
  END IF;

  -- Check minimum purchase amount
  IF v_discount.minimum_purchase_amount IS NOT NULL AND p_amount IS NOT NULL THEN
    IF p_amount < v_discount.minimum_purchase_amount THEN
      RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC,
        format('Minimum purchase amount of $%s required', v_discount.minimum_purchase_amount);
      RETURN;
    END IF;
  END IF;

  -- All validations passed
  RETURN QUERY SELECT
    true,
    v_discount.id,
    v_discount.discount_type,
    v_discount.discount_value,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate discounted price
CREATE OR REPLACE FUNCTION calculate_discounted_price(
  p_original_price NUMERIC,
  p_discount_type TEXT,
  p_discount_value NUMERIC
)
RETURNS NUMERIC AS $$
BEGIN
  IF p_discount_type = 'percentage' THEN
    RETURN ROUND(p_original_price * (1 - p_discount_value / 100), 2);
  ELSIF p_discount_type = 'fixed' THEN
    RETURN GREATEST(0, p_original_price - p_discount_value);
  ELSE
    RETURN p_original_price;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to record discount code usage
CREATE OR REPLACE FUNCTION record_discount_usage(
  p_discount_code_id UUID,
  p_user_id UUID,
  p_enrollment_id UUID,
  p_original_amount NUMERIC,
  p_discount_amount NUMERIC,
  p_final_amount NUMERIC,
  p_stripe_payment_intent_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_usage_id UUID;
BEGIN
  -- Insert usage record
  INSERT INTO discount_code_usage (
    discount_code_id,
    user_id,
    enrollment_id,
    original_amount,
    discount_amount,
    final_amount,
    stripe_payment_intent_id
  ) VALUES (
    p_discount_code_id,
    p_user_id,
    p_enrollment_id,
    p_original_amount,
    p_discount_amount,
    p_final_amount,
    p_stripe_payment_intent_id
  )
  RETURNING id INTO v_usage_id;

  -- Increment usage count
  UPDATE discount_codes
  SET uses_count = uses_count + 1
  WHERE id = p_discount_code_id;

  RETURN v_usage_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_pricing ENABLE ROW LEVEL SECURITY;

-- Pricing plans: Public read, admin write
CREATE POLICY pricing_plans_public_read ON pricing_plans
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY pricing_plans_admin_all ON pricing_plans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

-- Discount codes: Admin only (codes shouldn't be publicly browsable)
CREATE POLICY discount_codes_admin_all ON discount_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

-- Discount code usage: Users can see their own, admins see all
CREATE POLICY discount_usage_own_read ON discount_code_usage
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY discount_usage_admin_all ON discount_code_usage
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

-- Course pricing: Public read, admin write
CREATE POLICY course_pricing_public_read ON course_pricing
  FOR SELECT
  USING (true);

CREATE POLICY course_pricing_admin_all ON course_pricing
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default pricing plans
INSERT INTO pricing_plans (name, description, slug, plan_type, price_monthly, price_annual, features, display_order, is_featured) VALUES
  (
    'Single Course',
    'Access to one course with lifetime updates',
    'single-course',
    'per_course',
    NULL,
    NULL,
    '["Lifetime access to one course", "Certificate of completion", "Course materials and resources", "Community forum access"]'::jsonb,
    1,
    false
  ),
  (
    'All-Access Monthly',
    'Unlimited access to all courses with monthly billing',
    'all-access-monthly',
    'all_access',
    99.00,
    NULL,
    '["Unlimited access to all courses", "New courses added monthly", "Priority support", "All certificates", "Download course materials", "Live Q&A sessions"]'::jsonb,
    2,
    true
  ),
  (
    'All-Access Annual',
    'Unlimited access to all courses with annual billing (save 20%)',
    'all-access-annual',
    'all_access',
    NULL,
    950.00,
    '["Unlimited access to all courses", "New courses added monthly", "Priority support", "All certificates", "Download course materials", "Live Q&A sessions", "20% savings vs monthly"]'::jsonb,
    3,
    false
  ),
  (
    'Team Plan',
    'Perfect for teams of 5-20 people',
    'team-plan',
    'team',
    499.00,
    NULL,
    '["All All-Access features", "5-20 user seats", "Team analytics dashboard", "Dedicated account manager", "Custom learning paths", "Bulk enrollment tools"]'::jsonb,
    4,
    false
  ),
  (
    'Enterprise',
    'Custom solutions for large organizations',
    'enterprise',
    'enterprise',
    NULL,
    NULL,
    '["All Team features", "Unlimited users", "Custom branding", "SSO integration", "API access", "Dedicated support team", "Custom course creation"]'::jsonb,
    5,
    false
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert sample discount codes
INSERT INTO discount_codes (code, name, description, discount_type, discount_value, max_uses, valid_until) VALUES
  (
    'WELCOME10',
    'Welcome Discount',
    '10% off your first purchase',
    'percentage',
    10,
    NULL,
    NOW() + INTERVAL '90 days'
  ),
  (
    'EARLYBIRD',
    'Early Bird Special',
    '$50 off any annual plan',
    'fixed',
    50,
    100,
    NOW() + INTERVAL '30 days'
  )
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE pricing_plans IS 'ACAD-029: Pricing plan configurations for courses and subscriptions';
COMMENT ON TABLE discount_codes IS 'ACAD-029: Discount codes for promotions and special offers';
COMMENT ON TABLE discount_code_usage IS 'ACAD-029: Tracking of discount code usage by users';
COMMENT ON TABLE course_pricing IS 'ACAD-029: Course-specific pricing overrides';
