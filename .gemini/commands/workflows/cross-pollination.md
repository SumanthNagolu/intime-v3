---
description: Build cross-pollination opportunity tracking system (1 conversation = 5+ lead opportunities)
---

I'll route this through our specialized workflow to build InTime's **secret sauce** - the cross-pollination engine that turns every conversation into 5+ business opportunities.

**Pipeline Stages**:
1. **CEO Advisor** - Validate strategic importance (cross-pollination is core to InTime's DNA)
2. **PM Agent** - Define opportunity tracking, scoring, and notification requirements
3. **Database Architect** - Design interaction tracking, opportunity scoring, and notification tables
4. **API Developer** - Build AI-powered opportunity detection from conversation logs
5. **Frontend Developer** - Create opportunity dashboard with actionable insights
6. **Integration Specialist** - Connect to all 5 pillars (Academy, Recruiting, Bench Sales, TA, Cross-Border)
7. **QA Engineer** - Test cross-pillar workflows and opportunity accuracy

## The Cross-Pollination Engine

### What It Tracks

**Interaction Types**:
- Client placement calls → Reveals training needs, bench candidates, cross-border opportunities
- Student enrollment → Future candidate, future trainer, future client referral
- Candidate interviews → Client insights, skill gap identification, training opportunities
- Bench consultant check-ins → New job opportunities, skill upgrades, cross-border possibilities

**Opportunity Types**:
1. **Training Academy**: Client needs skill we can teach
2. **Recruiting**: Immediate placement opportunity
3. **Bench Sales**: Candidate available for marketing
4. **Talent Acquisition**: Pipeline building from competitor intel
5. **Cross-Border**: International talent or client needs

### How It Works

**Step 1: Capture Interaction**
```typescript
// After every client call, candidate interview, or student interaction
const interaction = await logInteraction({
  type: 'client_call',
  participants: ['recruiter-123', 'client-456'],
  summary: 'Client needs 2 Guidewire developers ASAP, mentioned expanding to India office',
  pillar: 'recruiting'
});
```

**Step 2: AI Analyzes for Opportunities**
```typescript
// AI scans summary for cross-pillar keywords and patterns
const opportunities = await detectOpportunities(interaction.summary);
// Returns:
// [
//   { pillar: 'recruiting', confidence: 0.95, reason: '2 Guidewire developers needed' },
//   { pillar: 'training_academy', confidence: 0.75, reason: 'Future Guidewire training demand' },
//   { pillar: 'cross_border', confidence: 0.80, reason: 'India office expansion' }
// ]
```

**Step 3: Create Actionable Tasks**
```typescript
// Auto-create tasks for relevant team members
opportunities.forEach(opp => {
  if (opp.confidence > 0.7) {
    createTask({
      pillar: opp.pillar,
      assignedTo: getPillarLead(opp.pillar),
      priority: opp.confidence > 0.9 ? 'high' : 'medium',
      description: opp.reason,
      linkedInteraction: interaction.id
    });
  }
});
```

**Step 4: Track Cross-Pollination ROI**
```typescript
// When opportunity converts to revenue
await markOpportunityConverted({
  opportunityId: 'opp-123',
  revenueGenerated: 15000,
  timeToConversion: '14 days'
});

// Calculate cross-pollination success rate per pod
const podMetrics = await getCrossPollinationMetrics(podId);
// {
//   opportunitiesIdentified: 47,
//   opportunitiesConverted: 12,
//   conversionRate: 0.255, // 25.5%
//   avgTimeToConversion: '18 days',
//   totalRevenue: 180000
// }
```

### UI Dashboard Features

**For Recruiters**:
- Real-time opportunity feed ("Client XYZ mentioned needing Salesforce training")
- One-click task creation from opportunity
- Opportunity leaderboard (gamification)

**For Managers**:
- Cross-pollination heatmap (which pillars connect most?)
- Pod performance comparison (which pod finds most opportunities?)
- Revenue attribution (how much revenue from cross-pollination?)

**For CEO**:
- Strategic insights dashboard
- Pillar interconnectedness analysis
- Long-term trend analysis (are we improving at cross-pollination?)

### Success Metrics

- **Opportunity Detection Rate**: Average 5+ opportunities per interaction (target from vision)
- **Conversion Rate**: 20%+ of opportunities convert to revenue
- **Time to Action**: Tasks created within 1 hour of interaction
- **Revenue Impact**: 30%+ of revenue attributed to cross-pollination

**Estimated time**: 3-4 hours (complex AI integration and multi-pillar coordination)

This is InTime's competitive moat - let's build it right!

Let me start by validating with the CEO Advisor...
