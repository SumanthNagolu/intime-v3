# Implementation Plan: Admin User Creation Flow

**Date**: 2026-01-01
**Author**: Claude
**Status**: Ready for Implementation
**Research**: `thoughts/shared/research/2026-01-01-admin-user-creation-flow.md`

---

## Objective

Complete the admin user creation flow so an admin can:
1. Create a new user via the UI
2. Assign roles, groups, and pods during creation
3. Enable the new user to login and start working

---

## Current State Analysis

### What Works ✅
- User creation form exists at `/employee/admin/users/new`
- Role assignment is implemented and mandatory
- Pod assignment is implemented (optional/conditional)
- Supabase Auth user + `user_profiles` record created in single procedure
- Login flow works once user has credentials

### Gaps to Fix 🔧
| Gap | Impact | Priority |
|-----|--------|----------|
| No group selection in user form | Admin must go to Groups to assign users | High |
| Pod role hardcoded to 'junior' | Cannot assign senior role during creation | Medium |
| Invitation email not sent | User cannot login via invitation flow | High |
| Group membership not synced on update | Data inconsistency | Medium |

---

## Implementation Tasks

### Phase 1: Complete User Creation Form (Priority: High) ✅ COMPLETED

#### Task 1.1: Add Group Selection to User Form ✅

**File**: `src/components/admin/users/UserFormClient.tsx`

**Changes**:
- [x] Add `groups` to `initialData` type (line ~83)
- [x] Add `Group` type definition (line ~46-51)
- [x] Add `primary_group_id` to `UserData` type (line ~70)
- [x] Add `primaryGroupId` state variable (line ~99)
- [x] Load `primaryGroupId` from user data in edit mode (line ~122)
- [x] Add Group select dropdown in form (after Pod select, line ~342-360)
- [x] Include `primaryGroupId` in create/update mutation calls (line ~195, ~209)

**UI Design**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Access & Assignment                                             │
├─────────────────────────────────────────────────────────────────┤
│ Role *                [Recruiter ▼]                             │
│ Pod                   [Alpha Team ▼] (required for pod_ic roles)│
│ Group                 [East Region ▼] (optional)                │
│ Manager               [Jane Smith ▼]                            │
└─────────────────────────────────────────────────────────────────┘
```

**Backend**: Already supports `primaryGroupId` in `users.create` procedure (line 380-390 in users.ts)

#### Task 1.2: Fetch Groups in Form Initial Data ✅

**File**: `src/app/employee/admin/users/new/page.tsx`

**Changes**:
- [x] Groups now fetched via `reference.getUserCreateWizardData` (updated reference.ts)
- [x] Pass `groups` array to `UserFormClient` initialData (line ~23)

**File**: `src/server/routers/reference.ts`

**Changes**:
- [x] Added groups query to `getUserCreateWizardData` (lines 57-64)
- [x] Added groups query to `getUserEditWizardData` (lines 106-113)
- [x] Added `primary_group_id` to user select in edit wizard (line 133)
- [x] Return groups in both wizard data responses (lines 78, 152)

**Also Updated**: `src/components/admin/users/UserFormPage.tsx` (for edit page)
- [x] Added Group type definition
- [x] Added `primary_group_id` to UserData type
- [x] Added `primaryGroupId` state variable
- [x] Added `groupsQuery` using groups.list
- [x] Load `primaryGroupId` in edit mode useEffect
- [x] Added Group select dropdown in form UI
- [x] Include `primaryGroupId` in mutation calls

---

### Phase 2: Enhance Pod Assignment (Priority: Medium) ✅ COMPLETED

#### Task 2.1: Add Pod Role Selection ✅

**File**: `src/components/admin/users/UserFormClient.tsx`

**Changes**:
- [x] Add `podRole` state: `'junior' | 'senior'` with default 'junior'
- [x] Add Pod Role radio buttons (shown when pod is selected)
- [x] Include `podRole` in mutation call
- [x] Load `podRole` from existing user data in edit mode

**Also Updated**: `src/components/admin/users/UserFormPage.tsx`
- [x] Added `podRole` state variable
- [x] Added Pod Role radio buttons UI
- [x] Load `podRole` from active pod membership
- [x] Include `podRole` in create/update mutation calls

**UI Design**:
```
Pod                   [Alpha Team ▼]
  Pod Role            ○ Junior (default)  ○ Senior
```

#### Task 2.2: Update Backend to Accept Pod Role ✅

**File**: `src/server/routers/users.ts`

**Changes**:
- [x] Add `podRole` to create input schema
   ```typescript
   podRole: z.enum(['junior', 'senior']).default('junior'),
   ```
- [x] Use `input.podRole` instead of hardcoded `'junior'` in create procedure
- [x] Add `podRole` to update input schema
- [x] Use `input.podRole ?? 'junior'` when creating new pod membership during update
- [x] Update existing pod membership role when only role changes (same pod)

---

### Phase 3: Implement Invitation Email (Priority: High)

#### Task 3.1: Create Invitation Email Template

**File**: `src/lib/email/templates/user-invitation.tsx` (new file)

**Content**:
```typescript
export const userInvitationEmail = {
  subject: (orgName: string) => `You've been invited to join ${orgName}`,
  html: (params: { inviteUrl: string; orgName: string; inviterName: string }) => `
    <h1>Welcome to ${params.orgName}</h1>
    <p>${params.inviterName} has invited you to join the team.</p>
    <a href="${params.inviteUrl}">Accept Invitation</a>
    <p>This link expires in 7 days.</p>
  `,
}
```

#### Task 3.2: Send Invitation Email After User Creation

**File**: `src/server/routers/users.ts`

**Location**: After invitation record creation (line ~419)

**Changes**:
1. Import email service
2. After creating `user_invitations` record, send email:
   ```typescript
   if (input.sendInvitation && invitationToken) {
     const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${invitationToken}`
     await sendEmail({
       to: input.email,
       subject: userInvitationEmail.subject(org.name),
       html: userInvitationEmail.html({
         inviteUrl,
         orgName: org.name,
         inviterName: ctx.user.full_name,
       }),
     })
   }
   ```

#### Task 3.3: Create Accept Invitation Page

**File**: `src/app/accept-invitation/page.tsx` (new file)

**Flow**:
1. Read `token` from URL params
2. Validate token against `user_invitations` table
3. If valid and not expired:
   - Show password setup form
   - On submit: Update auth user password + set `user_profiles.status = 'active'`
   - Redirect to login
4. If invalid/expired: Show error with link to contact admin

---

### Phase 4: Fix Group Membership Sync (Priority: Medium) ✅ COMPLETED

#### Task 4.1: Sync Group Membership on User Update ✅

**File**: `src/server/routers/users.ts`

**Location**: Update procedure (line ~445-550)

**Changes**:
- [x] When `primaryGroupId` changes:
   ```typescript
   if (input.primaryGroupId !== existingUser.primary_group_id) {
     // Deactivate old group membership
     if (existingUser.primary_group_id) {
       await adminClient
         .from('group_members')
         .update({ is_active: false })
         .eq('user_id', userId)
         .eq('group_id', existingUser.primary_group_id)
     }

     // Create or activate new group membership
     if (input.primaryGroupId) {
       await adminClient
         .from('group_members')
         .upsert({
           org_id: orgId,
           group_id: input.primaryGroupId,
           user_id: userId,
           is_manager: false,
           is_active: true,
         }, { onConflict: 'group_id,user_id' })
     }
   }
   ```

---

### Phase 5: UI Polish (Priority: Low) ✅ COMPLETED

#### Task 5.1: Add Form Validation Feedback ✅

**File**: `src/components/admin/users/UserFormClient.tsx`

**Changes**:
- [x] Add inline validation messages for required fields
- [x] Highlight invalid fields with red border (using cn() and conditional classes)
- [x] Track touched state for each field
- [x] Compute validation errors with useMemo
- [x] Mark all fields as touched on submit attempt
- [x] Show first validation error as toast on invalid submit

#### Task 5.2: Add Loading States ✅

**Changes**:
- [x] Show spinner overlay during form submission (with backdrop blur)
- [x] Disable form fields during submission (using fieldsets with disabled prop)
- [x] Show contextual loading message ("Creating user..." / "Saving changes...")

#### Task 5.3: Add Success Animation ✅

**Changes**:
- [x] Show success checkmark animation before redirect (CheckCircle2 icon with animate-in)
- [x] Brief pause (600ms) to let user see confirmation
- [x] Display contextual success message ("User Created!" / "Changes Saved!")

**Also Updated**: `src/components/admin/users/UserFormPage.tsx` with same polish

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/users/UserFormClient.tsx` | Add group select, pod role select, validation |
| `src/app/employee/admin/users/new/page.tsx` | Fetch groups in initial data |
| `src/app/employee/admin/users/[id]/edit/page.tsx` | Fetch groups in initial data |
| `src/server/routers/users.ts` | Add podRole input, send invitation email, sync group membership |

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/email/templates/user-invitation.tsx` | Invitation email template |
| `src/app/accept-invitation/page.tsx` | Accept invitation + set password page |
| `src/app/api/auth/accept-invitation/route.ts` | API to validate token and activate user |

---

## Database Changes

**None required** - All tables already exist:
- `user_profiles` has `primary_group_id` column
- `group_members` table exists
- `pod_members` has `role` column
- `user_invitations` table exists

---

## Testing Checklist

### User Creation Flow
- [ ] Create user with invitation method → receives email → can set password → can login
- [ ] Create user with password method → can login immediately
- [ ] Create user with role → correct role assigned
- [ ] Create user with pod → correct pod membership created
- [ ] Create user with group → correct group membership created
- [ ] Create user with pod_ic role without pod → shows validation error

### User Update Flow
- [ ] Update user's group → old membership deactivated, new membership created
- [ ] Update user's pod → old pod membership deactivated, new created
- [ ] Update user's role → role_id updated correctly

### Login Flow
- [ ] New user can login with set password
- [ ] User sees correct role-based navigation
- [ ] User is in correct pod (if assigned)
- [ ] User is in correct group (if assigned)

---

## Success Criteria

1. ✅ Admin can create a user and assign role + group + pod in one form
2. ✅ New user receives invitation email (if invitation method selected)
3. ✅ New user can set password via invitation link
4. ✅ New user can login and sees role-appropriate dashboard
5. ✅ User's pod and group memberships are correctly created
6. ✅ Editing a user's group properly syncs `group_members` table

---

## Implementation Order

```
Phase 1: Complete User Form (2 tasks)
    ↓
Phase 2: Pod Role Selection (2 tasks)
    ↓
Phase 3: Invitation Email (3 tasks)
    ↓
Phase 4: Group Membership Sync (1 task)
    ↓
Phase 5: UI Polish (3 tasks)
```

**Estimated Scope**: 11 tasks across 5 phases

---

## Notes

- Invitation token is already being generated and stored (users.ts:403-419)
- The `user_invitations` table stores: `id`, `org_id`, `user_id`, `email`, `token`, `expires_at`, `accepted_at`
- Supabase Auth user is created immediately with a random password when using invitation flow
- The accept-invitation page should use Supabase's `updateUser` to set the real password
