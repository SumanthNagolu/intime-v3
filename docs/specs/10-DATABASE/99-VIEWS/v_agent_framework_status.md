# V Agent Framework Status View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_agent_framework_status` |
| Schema | `public` |
| Purpose | Status overview of the agent framework system |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| active_prompts | bigint | YES | active prompts |
| unique_templates | bigint | YES | unique templates |
| cost_entries_24h | bigint | YES | cost entries 24h |
| cost_24h_usd | numeric | YES | cost 24h usd |
| cost_30d_usd | numeric | YES | cost 30d usd |
| interactions_24h | bigint | YES | interactions 24h |
| failures_24h | bigint | YES | failures 24h |
| active_agents_7d | bigint | YES | active agents 7d |

## Definition

```sql
CREATE OR REPLACE VIEW v_agent_framework_status AS
 SELECT ( SELECT count(*) AS count
           FROM ai_prompts
          WHERE (ai_prompts.is_active = true)) AS active_prompts,
    ( SELECT count(DISTINCT ai_prompts.name) AS count
           FROM ai_prompts) AS unique_templates,
    ( SELECT count(*) AS count
           FROM ai_cost_tracking
          WHERE (ai_cost_tracking.created_at > (now() - '24:00:00'::interval))) AS cost_entries_24h,
    ( SELECT COALESCE(sum(ai_cost_tracking.cost_usd), (0)::numeric) AS "coalesce"
           FROM ai_cost_tracking
          WHERE (ai_cost_tracking.created_at > (now() - '24:00:00'::interval))) AS cost_24h_usd,
    ( SELECT COALESCE(sum(ai_cost_tracking.cost_usd), (0)::numeric) AS "coalesce"
           FROM ai_cost_tracking
          WHERE (ai_cost_tracking.created_at > (now() - '30 days'::interval))) AS cost_30d_usd,
    ( SELECT count(*) AS count
           FROM ai_agent_interactions
          WHERE (ai_agent_interactions.created_at > (now() - '24:00:00'::interval))) AS interactions_24h,
    ( SELECT count(*) AS count
           FROM ai_agent_interactions
          WHERE ((ai_agent_interactions.created_at > (now() - '24:00:00'::interval)) AND (ai_agent_interactions.success = false))) AS failures_24h,
    ( SELECT count(DISTINCT ai_agent_interactions.agent_name) AS count
           FROM ai_agent_interactions
          WHERE (ai_agent_interactions.created_at > (now() - '7 days'::interval))) AS active_agents_7d;
```
