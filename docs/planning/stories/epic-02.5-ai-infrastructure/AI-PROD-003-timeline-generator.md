# AI-PROD-003: Daily Timeline Generator

**Story Points:** 3
**Sprint:** Sprint 4 (Week 11-12)
**Priority:** MEDIUM (Analytics & Insights)

---

## User Story

As a **Manager**,
I want **AI-generated daily timeline reports for employees**,
So that **I understand team productivity patterns without invading privacy**.

---

## Acceptance Criteria

- [x] Generate daily narrative report from activity data
- [x] Aggregate metrics only (no raw screenshots shown to managers)
- [x] Insights and patterns identification
- [x] Recommendations for productivity improvement
- [x] Positive and constructive tone
- [x] Batch process for all employees
- [ ] Export to PDF/email (Future Enhancement - Phase 2)
- [x] Privacy-safe aggregation
- [ ] Comparison to team averages (optional - Future Enhancement)
- [ ] Trend analysis over time (Future Enhancement - Phase 2)

---

## Technical Implementation

### Timeline Generator

Create file: `src/lib/ai/productivity/TimelineGenerator.ts`

```typescript
// /src/lib/ai/productivity/TimelineGenerator.ts
import { BaseAgent } from '../agents/BaseAgent';
import { ActivityClassifier } from './ActivityClassifier';
import { PromptLibrary } from '../prompts/library';

export class TimelineGenerator {
  private classifier: ActivityClassifier;

  constructor() {
    this.classifier = new ActivityClassifier();
  }

  /**
   * Generate daily timeline report
   */
  async generateDailyReport(
    userId: string,
    date: string
  ): Promise<{
    summary: string;
    productiveHours: number;
    topActivities: Array<{ category: string; percentage: number }>;
    insights: string[];
    recommendations: string[];
  }> {
    // Get activity summary
    const summary = await this.classifier.getDailySummary(userId, date);

    // Calculate top activities
    const total = summary.totalScreenshots;
    const topActivities = Object.entries(summary.byCategory)
      .map(([category, count]) => ({
        category,
        percentage: Math.round((count / total) * 100),
      }))
      .filter((a) => a.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);

    // Generate narrative report using AI
    const narrative = await this.generateNarrative({
      date,
      productiveHours: summary.productiveHours,
      topActivities,
      totalScreenshots: total,
      analyzed: summary.analyzed,
    });

    return {
      summary: narrative.summary,
      productiveHours: summary.productiveHours,
      topActivities,
      insights: narrative.insights,
      recommendations: narrative.recommendations,
    };
  }

  /**
   * Generate narrative using AI
   */
  private async generateNarrative(data: {
    date: string;
    productiveHours: number;
    topActivities: Array<{ category: string; percentage: number }>;
    totalScreenshots: number;
    analyzed: number;
  }): Promise<{
    summary: string;
    insights: string[];
    recommendations: string[];
  }> {
    const prompt = PromptLibrary.render('daily_timeline', {
      employee_name: 'Employee',
      date: data.date,
      activities: `
- Total active time: ${data.productiveHours.toFixed(1)} hours
- Screenshots analyzed: ${data.analyzed} / ${data.totalScreenshots}

Top Activities:
${data.topActivities
  .map((a) => `- ${a.category}: ${a.percentage}%`)
  .join('\n')}
      `,
    });

    const { routeAIRequest } = await import('../router');

    const response = await routeAIRequest(
      {
        type: 'completion',
        complexity: 'medium',
        requiresWriting: true,
        useCase: 'productivity_timeline',
        userId: 'system',
      },
      prompt,
      {
        temperature: 0.7,
        maxTokens: 512,
      }
    );

    // Parse response for structured output
    const lines = response.content.split('\n');
    const summary = lines.slice(0, 3).join('\n');
    const insights = lines.filter((l) => l.trim().startsWith('-')).slice(0, 3);
    const recommendations = lines
      .filter((l) => l.toLowerCase().includes('recommend'))
      .slice(0, 2);

    return {
      summary,
      insights,
      recommendations,
    };
  }

  /**
   * Batch generate reports for all employees
   */
  async batchGenerateReports(date: string): Promise<number> {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Get all employees who have screenshots for this date
    const { data: employees } = await supabase
      .from('employee_screenshots')
      .select('user_id')
      .gte('captured_at', `${date}T00:00:00Z`)
      .lt('captured_at', `${date}T23:59:59Z`);

    if (!employees || employees.length === 0) {
      return 0;
    }

    const uniqueEmployees = [...new Set(employees.map((e) => e.user_id))];

    console.log(`[TimelineGenerator] Generating reports for ${uniqueEmployees.length} employees`);

    let generated = 0;

    for (const userId of uniqueEmployees) {
      try {
        const report = await this.generateDailyReport(userId, date);

        // Save report
        await supabase.from('productivity_reports').insert({
          user_id: userId,
          date,
          summary: report.summary,
          productive_hours: report.productiveHours,
          top_activities: report.topActivities,
          insights: report.insights,
          recommendations: report.recommendations,
        });

        generated++;
      } catch (error) {
        console.error(`[TimelineGenerator] Failed for user ${userId}:`, error);
      }
    }

    return generated;
  }
}
```

### Database Migration

```sql
-- Productivity reports table
CREATE TABLE productivity_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  date DATE NOT NULL,

  summary TEXT NOT NULL,
  productive_hours FLOAT NOT NULL,
  top_activities JSONB NOT NULL,
  insights JSONB NOT NULL,
  recommendations JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);

CREATE INDEX idx_productivity_reports_user_date ON productivity_reports(user_id, date DESC);

-- RLS
ALTER TABLE productivity_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY reports_user_own ON productivity_reports
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY reports_manager_team ON productivity_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = user_id
      AND manager_id = auth.uid()
    )
  );
```

---

## Testing

```typescript
describe('Timeline Generator', () => {
  it('generates daily report', async () => {
    const generator = new TimelineGenerator();

    const report = await generator.generateDailyReport('test-user-id', '2025-01-15');

    expect(report.summary).toBeTruthy();
    expect(report.productiveHours).toBeGreaterThan(0);
    expect(report.topActivities.length).toBeGreaterThan(0);
  });

  it('batch generates for all employees', async () => {
    const generator = new TimelineGenerator();

    const count = await generator.batchGenerateReports('2025-01-15');

    expect(count).toBeGreaterThan(0);
  });
});
```

---

## Verification

- [x] Reports generated daily (via cron job at 3 AM)
- [x] Positive and constructive tone (tested)
- [x] Privacy-safe (aggregated only, tested)
- [x] Insights actionable (tested)
- [x] Recommendations specific (tested)

---

## Implementation Summary

**Implementation Date:** 2025-11-20
**Tests:** 22 tests, all passing
**Documentation:** `docs/planning/sprints/sprint-07/deliverables/AI-PROD-003-IMPLEMENTATION-COMPLETE.md`

**Key Files:**
- `src/lib/ai/productivity/TimelineGeneratorAgent.ts` (301 lines)
- `src/app/api/cron/generate-timelines/route.ts` (96 lines)
- `src/app/(dashboard)/my-productivity/page.tsx` (261 lines)
- `supabase/migrations/20251120210000_productivity_reports.sql` (94 lines)
- `src/lib/ai/productivity/__tests__/TimelineGeneratorAgent.test.ts` (548 lines)

**Cost:** ~$0.005 per report (GPT-4o), $10/month for 100 employees

---

## Dependencies

**Requires:**
- AI-PROD-002 (Activity Classification) ✅ Complete

**Blocks:**
- Manager dashboards (Future)
- Team productivity analytics (Future)

**Enables:**
- AI-TWIN-001 (Employee AI Twin Framework)

---

**Status:** ✅ COMPLETE
**Next Story:** AI-TWIN-001 (Employee AI Twin Framework)
