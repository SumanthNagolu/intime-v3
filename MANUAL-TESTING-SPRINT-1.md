# 🧪 Sprint 1 Manual Testing Checklist

**Estimated Time:** 20-30 minutes
**Prerequisites:** Dev server running (`pnpm dev`)

---

## 🎯 Testing Goals

Verify that:
- ✅ Users can sign up and login
- ✅ Role assignment works correctly
- ✅ Protected routes are secure
- ✅ UI is functional and accessible
- ✅ Database records are created properly

---

## ✅ Test Scenarios

### 1️⃣ **Signup Flow** (5 minutes)

#### Test 1.1: Student Signup (Happy Path)
1. Navigate to http://localhost:3000/signup
2. Fill in the form:
   - **Email:** `test.student@intime.com`
   - **Password:** `TestStudent123!`
   - **Full Name:** `Test Student`
   - **Phone:** `+12345678900` (optional)
   - **Role:** Select `Student`
3. Click **"Sign Up"**

**✅ Expected Results:**
- Form submits successfully
- Redirected to `/dashboard`
- Dashboard shows "Test Student" name
- No console errors

**🔍 Verify in Supabase Dashboard:**
- Check `user_profiles` table → New row with email
- Check `user_roles` table → Student role assigned
- Check `audit_logs` table → Signup event logged

---

#### Test 1.2: Recruiter Signup
1. Open **new incognito window** (to avoid session conflicts)
2. Navigate to http://localhost:3000/signup
3. Fill in:
   - **Email:** `test.recruiter@intime.com`
   - **Password:** `TestRecruiter123!`
   - **Full Name:** `Test Recruiter`
   - **Role:** Select `Recruiter`
4. Click **"Sign Up"**

**✅ Expected:** Successfully redirected to dashboard

---

#### Test 1.3: Validation - Invalid Email
1. Navigate to http://localhost:3000/signup
2. Fill in:
   - **Email:** `not-an-email` (invalid)
   - **Password:** `Test123!`
   - **Full Name:** `Test User`
   - **Role:** Student
3. Click **"Sign Up"**

**✅ Expected:**
- Form does NOT submit
- Error message appears: "Invalid email"
- Stays on signup page

---

#### Test 1.4: Validation - Weak Password
1. Navigate to http://localhost:3000/signup
2. Fill in:
   - **Email:** `weak@test.com`
   - **Password:** `123` (too weak)
   - **Full Name:** `Test User`
   - **Role:** Student
3. Click **"Sign Up"**

**✅ Expected:**
- Error message appears about password requirements
- Form does not submit

---

#### Test 1.5: Duplicate Email Prevention
1. Try to sign up again with `test.student@intime.com` (already used)

**✅ Expected:**
- Error message: "Email already registered" or similar
- Form does not submit

---

### 2️⃣ **Login Flow** (5 minutes)

#### Test 2.1: Valid Login
1. Navigate to http://localhost:3000/login
2. Fill in:
   - **Email:** `test.student@intime.com`
   - **Password:** `TestStudent123!`
3. Click **"Sign In"**

**✅ Expected:**
- Successfully logged in
- Redirected to `/dashboard`
- Dashboard shows user name

---

#### Test 2.2: Invalid Credentials
1. Navigate to http://localhost:3000/login
2. Fill in:
   - **Email:** `test.student@intime.com`
   - **Password:** `WrongPassword123!`
3. Click **"Sign In"**

**✅ Expected:**
- Error message: "Invalid email or password"
- Stays on login page
- No redirect

---

#### Test 2.3: Non-existent User
1. Navigate to http://localhost:3000/login
2. Fill in:
   - **Email:** `doesnotexist@test.com`
   - **Password:** `Test123!`
3. Click **"Sign In"**

**✅ Expected:**
- Error message: "Invalid email or password"
- Stays on login page

---

### 3️⃣ **Dashboard Access & Protected Routes** (3 minutes)

#### Test 3.1: Authenticated Access
1. While logged in as student, navigate to:
   - http://localhost:3000/dashboard

**✅ Expected:**
- Dashboard loads successfully
- Shows user information
- No redirect

---

#### Test 3.2: Unauthenticated Access Prevention
1. **Log out** (or open incognito window)
2. Try to directly access:
   - http://localhost:3000/dashboard

**✅ Expected:**
- Immediately redirected to `/login`
- Cannot access dashboard

---

#### Test 3.3: Post-Login Redirect
1. While logged out, try to access `/dashboard`
2. You'll be redirected to `/login`
3. Log in with valid credentials

**✅ Expected:**
- After login, redirected to `/dashboard` (or originally requested page)

---

### 4️⃣ **Logout Flow** (2 minutes)

#### Test 4.1: Logout and Session Cleanup
1. While logged in, find and click **"Sign Out"** button/link

**✅ Expected:**
- Redirected to `/login`
- Session cleared (check browser dev tools → Application → Cookies)

---

#### Test 4.2: Post-Logout Access Prevention
1. After logging out, try to navigate to:
   - http://localhost:3000/dashboard

**✅ Expected:**
- Redirected to `/login`
- Cannot access protected routes

---

### 5️⃣ **Role-Based Signup** (5 minutes)

Create accounts for each role to verify role system:

#### Test 5.1: All Roles Available
Sign up users with each role:

| Role | Email | Expected Behavior |
|------|-------|-------------------|
| Student | `test.student2@intime.com` | ✅ Signup successful |
| Candidate | `test.candidate@intime.com` | ✅ Signup successful |
| Recruiter | `test.recruiter2@intime.com` | ✅ Signup successful |
| Trainer | `test.trainer@intime.com` | ✅ Signup successful |

**🔍 Verify in Supabase:**
- Each user has corresponding role in `user_roles` table

---

### 6️⃣ **Browser Compatibility** (5 minutes - Optional)

Test signup/login in:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari (Mac)
- ✅ Edge

**✅ Expected:** Works identically in all browsers

---

### 7️⃣ **Mobile Responsiveness** (3 minutes - Optional)

1. Open dev tools (F12)
2. Toggle device toolbar (mobile view)
3. Test on:
   - iPhone 12 Pro
   - iPad
   - Samsung Galaxy S20

**✅ Expected:**
- Forms are readable
- Buttons are clickable
- Layout adapts to screen size
- No horizontal scrolling

---

### 8️⃣ **Accessibility** (3 minutes - Optional)

#### Test 8.1: Keyboard Navigation
1. Navigate to signup page
2. Use **Tab** key only (no mouse)
3. Try to complete signup using only keyboard

**✅ Expected:**
- Can focus all form fields
- Can submit with Enter key
- Clear focus indicators

---

#### Test 8.2: Screen Reader (Optional)
1. Enable screen reader (VoiceOver on Mac, NVDA on Windows)
2. Navigate signup form

**✅ Expected:**
- All labels are read aloud
- Error messages are announced
- Form is understandable without visual context

---

## 🐛 Common Issues & Solutions

### Issue 1: "Signup button does nothing"
**Check:**
- Browser console for errors
- Network tab for failed requests
- `.env.local` has correct Supabase keys

---

### Issue 2: "Redirected to login after signup"
**Possible Causes:**
- Supabase email confirmation enabled (check Supabase → Authentication → Email Auth)
- Session not being created properly

**Fix:**
- Disable email confirmation for testing (Supabase Dashboard → Auth → Email → Disable "Confirm Email")

---

### Issue 3: "Cannot read property of null"
**Check:**
- Database migrations ran successfully
- All required tables exist
- RLS policies are in place

**Fix:**
- Re-run migrations: `pnpm tsx scripts/run-migrations-automated.ts`

---

### Issue 4: "Role not assigned"
**Check:**
- `roles` table has 8 system roles
- `user_roles` junction table exists

**Fix:**
- Run role seeding script manually

---

## 📊 Manual Test Results Template

Copy this to track your testing:

```
Sprint 1 Manual Testing Results
Date: _______________
Tester: _______________

✅ = Pass | ❌ = Fail | ⏭️ = Skipped

[ ] 1.1 Student Signup (Happy Path)
[ ] 1.2 Recruiter Signup
[ ] 1.3 Validation - Invalid Email
[ ] 1.4 Validation - Weak Password
[ ] 1.5 Duplicate Email Prevention
[ ] 2.1 Valid Login
[ ] 2.2 Invalid Credentials
[ ] 2.3 Non-existent User
[ ] 3.1 Authenticated Access
[ ] 3.2 Unauthenticated Access Prevention
[ ] 3.3 Post-Login Redirect
[ ] 4.1 Logout and Session Cleanup
[ ] 4.2 Post-Logout Access Prevention
[ ] 5.1 All Roles Available

Issues Found:
_______________________________________
_______________________________________

Overall Status: ✅ PASS | ❌ FAIL
```

---

## 🎯 Success Criteria

**Sprint 1 is ready for production if:**

✅ All 13 core tests pass
✅ No console errors during normal flow
✅ Database records created correctly
✅ Sessions persist across page reloads
✅ Logout clears session properly
✅ Role assignment works for all roles

---

## 🚀 After Manual Testing

Once all tests pass:

1. ✅ **Document any issues found**
2. ✅ **Fix critical bugs** (if any)
3. ✅ **Re-test failed scenarios**
4. ✅ **Mark Sprint 1 as complete**
5. 🎯 **Begin Sprint 2 planning**

---

**Questions or issues during testing?** Document them and we'll address them!
