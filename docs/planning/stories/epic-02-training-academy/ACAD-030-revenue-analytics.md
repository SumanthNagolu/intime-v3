# ACAD-030: Revenue Analytics

**Story Points:** 6
**Sprint:** Sprint 5 (Week 13-14)
**Priority:** MEDIUM

---

## User Story

As a **Trainer**,
I want **MRR, churn, student LTV dashboard**,
So that **I can support students effectively and track teaching performance**.

---

## Acceptance Criteria

- [ ] Monthly Recurring Revenue (MRR) tracking
- [ ] Churn rate calculation
- [ ] Student Lifetime Value (LTV)
- [ ] Revenue per course
- [ ] Enrollment funnel analytics
- [ ] Payment success/failure rates
- [ ] Refund rate tracking
- [ ] Revenue forecasting
- [ ] Export to CSV/Excel

---

## Implementation

```sql
CREATE MATERIALIZED VIEW revenue_analytics AS
SELECT
  DATE_TRUNC('month', pt.created_at) AS month,
  
  -- MRR (Monthly Recurring Revenue)
  SUM(CASE WHEN pt.status = 'succeeded' THEN pt.amount ELSE 0 END) AS mrr,
  
  -- Total enrollments
  COUNT(DISTINCT se.id) AS total_enrollments,
  
  -- Active subscriptions
  COUNT(DISTINCT CASE WHEN se.status = 'active' THEN se.id END) AS active_subscriptions,
  
  -- Churn (canceled subscriptions)
  COUNT(DISTINCT CASE WHEN se.status = 'dropped' THEN se.id END) AS churned_subscriptions,
  
  -- Average revenue per student
  AVG(pt.amount) AS avg_revenue_per_student
FROM payment_transactions pt
JOIN student_enrollments se ON se.id = pt.enrollment_id
WHERE pt.status = 'succeeded'
GROUP BY DATE_TRUNC('month', pt.created_at);

-- Refresh daily via cron
CREATE UNIQUE INDEX ON revenue_analytics(month);
```

```typescript
// src/app/admin/analytics/revenue/page.tsx
export default async function RevenueAnalytics() {
  const mrr = await getMRR();
  const churnRate = await getChurnRate();
  const ltv = await getStudentLTV();

  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard title="MRR" value={\`$\${mrr.toLocaleString()}\`} />
      <MetricCard title="Churn Rate" value={\`\${churnRate}%\`} />
      <MetricCard title="Student LTV" value={\`$\${ltv}\`} />
      <MetricCard title="Active Subs" value={activeSubCount} />

      <div className="col-span-4">
        <RevenueChart data={monthlyRevenue} />
      </div>
    </div>
  );
}
```

```typescript
// Calculate Student LTV
export function calculateStudentLTV(
  avgMonthlyRevenue: number,
  avgSubscriptionMonths: number,
  churnRate: number
): number {
  // LTV = (Average Revenue per Student × Average Subscription Length) / Churn Rate
  return (avgMonthlyRevenue * avgSubscriptionMonths) / (churnRate / 100);
}
```

---

**Dependencies:** ACAD-028, ACAD-029
**Completes:** Epic 2 - Training Academy

---

## Notes

This is the **final story** of Epic 2. Upon completion:
- All 30 stories (ACAD-001 to ACAD-030) delivered
- Complete Learning Management System operational
- AI-powered Socratic mentorship functional
- Revenue tracking and analytics in place
- Ready to integrate with Epic 3 (Recruiting Services)

---

**Success Metrics:**
- 70%+ completion rate
- 80%+ placement rate
- $100/month AI costs (65% savings vs legacy)
- 95%+ AI response quality
- <5% escalation rate to human trainers
