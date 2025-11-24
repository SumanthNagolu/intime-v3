# Test Data Seeding Guide

Complete guide for setting up comprehensive test data for InTime v3.

## 📋 Overview

This directory contains scripts to:
1. **Clean up** all existing test users
2. **Seed** comprehensive test data (36 users across all roles)
3. **Create** Supabase Auth users for login

## 🚀 Quick Start

### Option 1: Full Reset (Recommended)
```bash
npm run seed:all
```

This will:
1. Clean up all existing test users
2. Seed 36 comprehensive test users
3. Create Supabase Auth accounts for all users

### Option 2: Step-by-Step

#### Step 1: Reset Database
```bash
npm run seed:reset
```

#### Step 2: Create Auth Users
```bash
npm run seed:auth
```

## 📁 Files

### SQL Scripts
- `cleanup-test-users.sql` - Removes all test users and related data
- `seed-comprehensive-test-data.sql` - Creates 36 test users with full profiles

### TypeScript Scripts
- `reset-and-seed-test-data.ts` - Executes SQL cleanup and seeding
- `create-auth-users.ts` - Creates Supabase Auth accounts

### Documentation
- `../TEST-CREDENTIALS.md` - Complete list of all test accounts

## 👥 Test Users Created

### Leadership (3)
- admin@intime.com
- ceo@intime.com
- cfo@intime.com

### HR (2)
- hr@intime.com
- hr_admin@intime.com

### Training Academy (5)
- trainer@intime.com, trainer_2@intime.com
- student@intime.com, student_2@intime.com, student_3@intime.com

### Recruiting Pods (4)
- sr_rec@intime.com, jr_rec@intime.com (Pod 1 - Northeast)
- sr_rec_2@intime.com, jr_rec_2@intime.com (Pod 2 - Midwest)

### Bench Sales Pods (4)
- sr_bs@intime.com, jr_bs@intime.com (Pod 1 - NYC)
- sr_bs_2@intime.com, jr_bs_2@intime.com (Pod 2 - Chicago)

### Talent Acquisition Pods (4)
- sr_ta@intime.com, jr_ta@intime.com (Pod 1 - National)
- sr_ta_2@intime.com, jr_ta_2@intime.com (Pod 2 - International)

### Candidates (6)
- candidate@intime.com (Active, OPT)
- candidate_bench@intime.com (Bench, H1B)
- candidate_placed@intime.com (Placed, GC)
- candidate_h1b@intime.com (Active, H1B)
- candidate_gc@intime.com (Active, GC)
- candidate_usc@intime.com (Active, USC)

### Clients (4)
- client@intime.com (TechCorp - Preferred)
- client_strategic@intime.com (HealthPlus - Strategic)
- client_exclusive@intime.com (FinanceHub - Exclusive)
- client_new@intime.com (StartupCo - New)

**Total: 36 users**

## 🔐 Default Credentials

**Password for all accounts:** `TestPass123!`

See [TEST-CREDENTIALS.md](../TEST-CREDENTIALS.md) for complete list with details.

## 🔧 Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📝 What Gets Created

### 1. User Profiles
Each user gets:
- Core profile (name, email, phone, timezone)
- Role-specific fields populated
- Realistic data for their role type

### 2. System Roles
17 system roles across hierarchy levels 0-4:
- Level 0: super_admin, ceo, cfo
- Level 1: admin, hr_manager
- Level 2: trainer, senior_* roles
- Level 3: student, junior_* roles, employee
- Level 4: candidate, client

### 3. Role Assignments
Each user assigned to appropriate role(s):
- Single primary role per user
- Multi-role support (users can have multiple roles)

### 4. Realistic Data
- **Students:** Enrollment dates, progress (45%-80%), modules
- **Employees:** Hire dates, departments, salaries, managers
- **Recruiters:** Territories, specializations, targets
- **Candidates:** Skills, experience, visa status, rates
- **Clients:** Company info, tiers, payment terms, markup

## ⚠️ Important Notes

### Before Running
1. Ensure you have a backup if needed (this deletes ALL test data)
2. Verify SUPABASE_SERVICE_ROLE_KEY is set (not just anon key)
3. Confirm you're connected to the correct Supabase project

### After Running
1. Verify counts in output match expected (36 users, 17 roles, 36 assignments)
2. Test login with any account (password: TestPass123!)
3. Check that role-based access works correctly

### Cleanup
The cleanup script will:
- ✅ Delete all users with @intime.com emails
- ✅ Delete all related audit logs
- ✅ Delete all related events
- ✅ Delete academy progress data (if tables exist)
- ✅ Maintain database integrity (foreign keys)
- ❌ NOT delete system roles (only role assignments)
- ❌ NOT delete organizations (uses existing org ID)

## 🧪 Testing Scenarios

### Test as Different Users
```bash
# Login as any user to test their view:
admin@intime.com        # Full system access
ceo@intime.com         # Executive dashboard
student@intime.com     # Academy student view
sr_rec@intime.com      # Recruiter pod lead
candidate@intime.com   # Candidate portal
client@intime.com      # Client portal
```

### Test Role-Based Access
Each role has specific permissions:
- **Admin:** Full access to all features
- **CEO/CFO:** Business analytics, no user management
- **HR Manager:** Employee data, not candidates
- **Senior Recruiter:** Pod management, junior oversight
- **Junior Recruiter:** Limited to assigned candidates
- **Student:** Own progress only
- **Candidate:** Own profile and applications
- **Client:** Own job reqs and submitted candidates

## 🐛 Troubleshooting

### Error: "Missing environment variables"
- Ensure `.env.local` has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- Service role key is different from anon/public key

### Error: "Organization not found"
- The scripts use org_id: `00000000-0000-0000-0000-000000000001`
- Ensure this organization exists in your `organizations` table
- Or update the org_id in the seed script

### Error: "execute_sql function not found"
- Some scripts require a database function for executing SQL
- Alternatively, run SQL files directly via psql:
  ```bash
  psql $SUPABASE_DB_URL -f scripts/cleanup-test-users.sql
  psql $SUPABASE_DB_URL -f scripts/seed-comprehensive-test-data.sql
  ```

### Auth Users Not Created
- Verify SUPABASE_SERVICE_ROLE_KEY (not anon key)
- Check Supabase dashboard → Authentication → Users
- Manually create users if script fails:
  - Email: [from TEST-CREDENTIALS.md]
  - Password: TestPass123!
  - Email Verified: Yes

### Users Created But Can't Login
- Check that `auth_id` is set in `user_profiles` table
- Link should be: `user_profiles.auth_id = auth.users.id`
- Run linking query manually if needed

## 📚 Related Documentation

- [TEST-CREDENTIALS.md](../TEST-CREDENTIALS.md) - Complete user list
- [CLAUDE.md](../CLAUDE.md) - Project overview
- Database schema: `src/lib/db/schema/`
- Migrations: `supabase/migrations/`

## 🔄 Regular Maintenance

### When to Re-seed
- After major schema changes
- When test data becomes stale
- Before major testing sessions
- After corrupted test data

### Best Practices
1. Always run full cleanup before seeding
2. Verify counts after seeding
3. Test login with multiple roles
4. Document any custom test data added
5. Keep TEST-CREDENTIALS.md updated

---

**Last Updated:** 2025-11-22
**Script Version:** 1.0
**Total Test Users:** 36
