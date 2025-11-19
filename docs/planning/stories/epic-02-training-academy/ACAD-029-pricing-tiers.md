# ACAD-029: Pricing Tiers

**Story Points:** 4
**Sprint:** Sprint 5 (Week 13-14)
**Priority:** MEDIUM

---

## User Story

As a **Trainer**,
I want **Per-course, all-access pass, discounts**,
So that **I can support students effectively and track teaching performance**.

---

## Acceptance Criteria

- [ ] Per-course pricing (individual course purchase)
- [ ] All-access pass (monthly subscription to all courses)
- [ ] Discount codes (percentage or fixed amount)
- [ ] Early bird pricing (time-limited discounts)
- [ ] Scholarship/free enrollment option
- [ ] Team/corporate pricing (bulk discounts)
- [ ] Pricing display on course pages
- [ ] Admin pricing management UI

---

## Implementation

```sql
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  
  plan_type TEXT CHECK (plan_type IN ('per_course', 'all_access', 'team')),
  
  price_monthly NUMERIC(10,2),
  price_annual NUMERIC(10,2),
  
  stripe_price_id TEXT,
  
  features JSONB, -- ["Access to all courses", "Certificate", "Priority support"]
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT true
);
```

```typescript
export async function applyDiscountCode(
  priceAmount: number,
  discountCode: string
): Promise<number> {
  const discount = await getDiscountByCode(discountCode);

  if (!discount || !discount.is_active) {
    throw new Error('Invalid discount code');
  }

  if (discount.uses_count >= discount.max_uses) {
    throw new Error('Discount code has reached maximum uses');
  }

  if (discount.discount_type === 'percentage') {
    return priceAmount * (1 - discount.discount_value / 100);
  } else {
    return Math.max(0, priceAmount - discount.discount_value);
  }
}
```

---

**Dependencies:** ACAD-028 (Stripe)
**Next:** ACAD-030 (Revenue Analytics)
