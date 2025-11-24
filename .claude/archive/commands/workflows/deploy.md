---
description: Deploy feature to production with safety checks and monitoring
---

I'll route this through our Deployment Agent for safe production deployment.

**Deployment Workflow**:

The Deployment Agent will:

1. **Pre-Deployment Checks**:
   - Verify QA approval from `test-report.md`
   - Ensure all tests passing
   - Check for critical bugs
   - Verify database migrations ready
   - Confirm environment variables set

2. **Database Migration** (if needed):
   - Test migration on development first
   - Run migration on production
   - Verify migration success
   - Confirm RLS policies active

3. **Deploy to Vercel**:
   - Push to main branch (triggers auto-deploy)
   - OR use Vercel CLI for manual deployment
   - Monitor build progress
   - Verify build success

4. **Post-Deployment Verification**:
   - Smoke tests (site accessible, feature works)
   - Check Vercel logs for errors
   - Monitor Sentry for new errors
   - Verify database health (Supabase dashboard)
   - Check performance metrics

5. **Monitoring** (First 30 minutes):
   - Watch for error spikes
   - Monitor response times
   - Check for failed requests
   - Verify no RLS violations

6. **Rollback** (if critical issues):
   - Revert to previous Vercel deployment
   - OR rollback database migration
   - Document rollback reason

**Safety Protocols**:
- ✅ Never deploy without QA approval
- ✅ Always test migrations on dev first
- ✅ Monitor for 30 minutes post-deploy
- ✅ Have rollback plan ready
- ✅ Document everything in `deployment-log.md`

**Output**: `deployment-log.md` with deployment results and metrics

Let me spawn the Deployment Agent to execute safe production deployment...
