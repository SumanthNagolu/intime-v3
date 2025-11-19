# FOUND-017: Configure Vercel Deployment

**Story Points:** 2
**Sprint:** Sprint 3 (Week 5-6)
**Priority:** HIGH

---

## User Story

As a **DevOps Engineer**,
I want **automated deployment to Vercel**,
So that **every merge to main goes to production automatically**.

---

## Acceptance Criteria

- [ ] Vercel project created and linked
- [ ] Environment variables configured
- [ ] Auto-deploy on merge to main
- [ ] Preview deployments for PRs
- [ ] Custom domain configured
- [ ] Edge functions work correctly

---

## Technical Implementation

Create file: `vercel.json`

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
  }
}
```

Create file: `.vercelignore`

```
.git
node_modules
.next
.env.local
tests
docs
```

---

## Dependencies

- **Requires:** All foundation stories complete

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
