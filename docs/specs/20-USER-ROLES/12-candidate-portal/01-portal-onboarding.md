# Candidate Portal - Onboarding & Registration

**Process**: External candidate/consultant registration and profile setup
**Duration**: 10-30 minutes (varies by profile completeness)
**Role**: candidate_user, consultant_user
**Goal**: Create complete, searchable candidate profile

---

## Table of Contents

1. [Registration Options](#registration-options)
2. [Email Registration Flow](#email-registration-flow)
3. [LinkedIn OAuth Flow](#linkedin-oauth-flow)
4. [Recruiter Invitation Flow](#recruiter-invitation-flow)
5. [Referral Link Flow](#referral-link-flow)
6. [Profile Creation Wizard](#profile-creation-wizard)
7. [Resume Upload & Parsing](#resume-upload--parsing)
8. [Skills Assessment](#skills-assessment)
9. [Availability & Preferences](#availability--preferences)
10. [Mobile Onboarding](#mobile-onboarding)
11. [International Onboarding](#international-onboarding)
12. [Profile Completeness](#profile-completeness)

---

## Registration Options

### Overview

Candidates can register through multiple channels, each with different onboarding flows:

```typescript
type RegistrationSource =
  | 'direct'           // Self-registration on website
  | 'linkedin'         // LinkedIn OAuth
  | 'google'           // Google OAuth
  | 'referral'         // Employee/candidate referral
  | 'recruiter_invite' // Invited by recruiter
  | 'job_board'        // External job board (Indeed, Monster)
  | 'job_apply'        // Direct job application

interface RegistrationContext {
  source: RegistrationSource;
  referrer_id?: string;
  job_id?: string;
  campaign_id?: string;
  utm_params?: Record<string, string>;
  locale: string;
  timezone: string;
}
```

### Registration Entry Points

**1. Homepage Registration** (`/register`):
- General candidate registration
- No specific job in mind
- Full profile creation wizard

**2. Job Application** (`/jobs/:id/apply`):
- Register to apply to specific job
- Streamlined flow
- Job-specific questions

**3. LinkedIn Quick Apply**:
- One-click OAuth
- Pre-filled profile data
- Minimal additional input

**4. Recruiter Invitation**:
- Email invitation link
- Pre-validated email
- Expedited verification

**5. Referral Link**:
- Shared by employee or candidate
- Referral bonus tracking
- Trust signal

---

## Email Registration Flow

### Step 1: Account Creation

**Form Fields**:
```typescript
interface AccountCreation {
  email: string;              // Required, unique
  password: string;           // Min 8 chars, complexity rules
  password_confirm: string;
  first_name: string;         // Required
  last_name: string;          // Required
  phone: string;              // Optional (required later)
  country_code: string;       // Default based on IP
  agree_to_terms: boolean;    // Required
  marketing_opt_in: boolean;  // Optional
}
```

**Validation Rules**:
```typescript
const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    check_disposable: true, // Block temp email services
    check_mx_record: true,  // Verify email domain
  },
  password: {
    min_length: 8,
    require_uppercase: true,
    require_lowercase: true,
    require_number: true,
    require_special: false, // Optional
    common_password_check: true, // Block "password123"
  },
  phone: {
    validate_format: true,
    country_code_required: true,
    allow_landline: false, // Mobile preferred for 2FA
  }
};
```

**UI Implementation**:
```tsx
// Account creation form
<Form onSubmit={handleAccountCreation}>
  <FormField label="Email Address" required>
    <Input
      type="email"
      name="email"
      autoComplete="email"
      validate={validateEmail}
      asyncValidate={checkEmailAvailability}
    />
    <FieldHelp>
      We'll send a verification link to this email
    </FieldHelp>
  </FormField>

  <FormField label="Password" required>
    <PasswordInput
      name="password"
      showStrengthMeter
      requirements={passwordRequirements}
    />
  </FormField>

  <FormField label="Full Name" required>
    <div className="grid grid-cols-2 gap-4">
      <Input name="first_name" placeholder="First name" />
      <Input name="last_name" placeholder="Last name" />
    </div>
  </FormField>

  <FormField label="Phone Number">
    <PhoneInput
      name="phone"
      defaultCountry={userCountry}
      showFlag
    />
  </FormField>

  <Checkbox name="agree_to_terms" required>
    I agree to the{' '}
    <Link href="/legal/terms">Terms of Service</Link> and{' '}
    <Link href="/legal/privacy">Privacy Policy</Link>
  </Checkbox>

  <Checkbox name="marketing_opt_in">
    Send me job alerts and career tips
  </Checkbox>

  <Button type="submit" fullWidth loading={isSubmitting}>
    Create Account
  </Button>
</Form>
```

### Step 2: Email Verification

**Verification Flow**:
```typescript
interface EmailVerification {
  verification_token: string;  // UUID, expires in 24 hours
  sent_at: Date;
  verified_at?: Date;
  resend_count: number;        // Max 3 resends
  resend_cooldown: number;     // 60 seconds between resends
}

async function sendVerificationEmail(userId: string, email: string) {
  const token = generateSecureToken();
  const verificationLink = `${baseUrl}/verify-email?token=${token}`;

  await db.insert(emailVerifications).values({
    user_id: userId,
    token,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await emailService.send({
    to: email,
    template: 'email_verification',
    data: {
      verification_link: verificationLink,
      expires_in: '24 hours',
    },
  });
}
```

**Verification Email Template**:
```html
<EmailTemplate>
  <Heading>Welcome to InTime!</Heading>
  <Text>
    Thanks for signing up. To get started, please verify your email address.
  </Text>
  <Button href="{verification_link}">
    Verify Email Address
  </Button>
  <Text style="muted">
    This link expires in 24 hours.
    If you didn't create this account, you can safely ignore this email.
  </Text>
</EmailTemplate>
```

**Post-Verification Actions**:
```typescript
async function handleEmailVerification(token: string) {
  // 1. Validate token
  const verification = await db.query.emailVerifications.findFirst({
    where: and(
      eq(emailVerifications.token, token),
      gt(emailVerifications.expires_at, new Date())
    ),
  });

  if (!verification) {
    throw new Error('Invalid or expired verification link');
  }

  // 2. Mark email as verified
  await db.update(users)
    .set({ email_verified: true, verified_at: new Date() })
    .where(eq(users.id, verification.user_id));

  // 3. Delete verification token
  await db.delete(emailVerifications)
    .where(eq(emailVerifications.token, token));

  // 4. Send welcome email
  await sendWelcomeEmail(verification.user_id);

  // 5. Redirect to profile wizard
  return { redirect: '/onboarding/profile' };
}
```

---

## LinkedIn OAuth Flow

### Step 1: OAuth Initiation

**OAuth Configuration**:
```typescript
const linkedInOAuth = {
  client_id: process.env.LINKEDIN_CLIENT_ID,
  client_secret: process.env.LINKEDIN_CLIENT_SECRET,
  redirect_uri: `${baseUrl}/auth/linkedin/callback`,
  scope: [
    'r_liteprofile',      // Basic profile
    'r_emailaddress',     // Email
    'r_basicprofile',     // Full profile
    'w_member_social',    // Post on behalf (optional)
  ].join(' '),
};

function initiateLinkedInLogin() {
  const state = generateSecureToken(); // CSRF protection
  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');

  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', linkedInOAuth.client_id);
  authUrl.searchParams.set('redirect_uri', linkedInOAuth.redirect_uri);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('scope', linkedInOAuth.scope);

  // Store state for validation
  sessionStorage.setItem('linkedin_oauth_state', state);

  window.location.href = authUrl.toString();
}
```

### Step 2: OAuth Callback & Profile Import

**Callback Handler**:
```typescript
async function handleLinkedInCallback(code: string, state: string) {
  // 1. Validate state (CSRF protection)
  const savedState = sessionStorage.getItem('linkedin_oauth_state');
  if (state !== savedState) {
    throw new Error('Invalid OAuth state');
  }

  // 2. Exchange code for access token
  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: linkedInOAuth.redirect_uri,
      client_id: linkedInOAuth.client_id,
      client_secret: linkedInOAuth.client_secret,
    }),
  });

  const { access_token } = await tokenResponse.json();

  // 3. Fetch LinkedIn profile
  const profile = await fetchLinkedInProfile(access_token);

  // 4. Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.linkedin_id, profile.id),
  });

  if (existingUser) {
    // Login existing user
    return loginUser(existingUser.id);
  }

  // 5. Create new candidate profile
  return createCandidateFromLinkedIn(profile);
}
```

**Profile Import Logic**:
```typescript
interface LinkedInProfile {
  id: string;
  firstName: { localized: Record<string, string> };
  lastName: { localized: Record<string, string> };
  emailAddress: string;
  profilePicture?: {
    displayImage: string;
  };
  positions?: LinkedInPosition[];
  educations?: LinkedInEducation[];
  skills?: LinkedInSkill[];
}

async function createCandidateFromLinkedIn(profile: LinkedInProfile) {
  // 1. Create user account
  const user = await db.insert(users).values({
    email: profile.emailAddress,
    email_verified: true, // LinkedIn emails are verified
    linkedin_id: profile.id,
    auth_provider: 'linkedin',
  }).returning();

  // 2. Create candidate profile
  const candidate = await db.insert(candidates).values({
    user_id: user.id,
    first_name: profile.firstName.localized['en_US'],
    last_name: profile.lastName.localized['en_US'],
    profile_source: 'linkedin',
    profile_completeness: 50, // Start at 50% for LinkedIn imports
  }).returning();

  // 3. Import work history
  if (profile.positions) {
    await importLinkedInPositions(candidate.id, profile.positions);
  }

  // 4. Import education
  if (profile.educations) {
    await importLinkedInEducation(candidate.id, profile.educations);
  }

  // 5. Import skills
  if (profile.skills) {
    await importLinkedInSkills(candidate.id, profile.skills);
  }

  // 6. Download profile picture
  if (profile.profilePicture) {
    await downloadProfilePicture(candidate.id, profile.profilePicture.displayImage);
  }

  return candidate;
}
```

### Step 3: LinkedIn Data Mapping

**Work History Mapping**:
```typescript
async function importLinkedInPositions(
  candidateId: string,
  positions: LinkedInPosition[]
) {
  const workHistory = positions.map(position => ({
    candidate_id: candidateId,
    company_name: position.companyName,
    job_title: position.title,
    start_date: parseLinkedInDate(position.timePeriod.startDate),
    end_date: position.timePeriod.endDate
      ? parseLinkedInDate(position.timePeriod.endDate)
      : null,
    is_current: !position.timePeriod.endDate,
    description: position.description,
    location: position.locationName,
    imported_from: 'linkedin',
  }));

  await db.insert(candidateWorkHistory).values(workHistory);
}
```

**Skills Mapping**:
```typescript
async function importLinkedInSkills(
  candidateId: string,
  skills: LinkedInSkill[]
) {
  // Map LinkedIn skills to InTime skill taxonomy
  const skillMappings = await Promise.all(
    skills.map(async skill => {
      // Try to find matching skill in our taxonomy
      const existingSkill = await db.query.skills.findFirst({
        where: or(
          eq(skills.name, skill.name),
          like(skills.aliases, `%${skill.name}%`)
        ),
      });

      return {
        candidate_id: candidateId,
        skill_id: existingSkill?.id || null,
        skill_name: skill.name, // Store original name if no match
        proficiency_level: skill.endorsements > 5 ? 'advanced' : 'intermediate',
        years_of_experience: null, // LinkedIn doesn't provide this
        imported_from: 'linkedin',
      };
    })
  );

  await db.insert(candidateSkills).values(skillMappings);
}
```

---

## Recruiter Invitation Flow

### Step 1: Recruiter Creates Invitation

**Invitation Creation** (Recruiter UI):
```typescript
interface RecruiterInvitation {
  invited_by: string;        // Recruiter user_id
  email: string;             // Candidate email
  first_name?: string;
  last_name?: string;
  job_id?: string;           // Optional: invite for specific job
  message?: string;          // Personalized message
  expires_at: Date;          // Default: 30 days
  invitation_token: string;  // Secure UUID
}

async function createCandidateInvitation(
  recruiterId: string,
  data: RecruiterInvitationInput
) {
  // 1. Check if candidate already exists
  const existing = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  if (existing) {
    throw new Error('Candidate already registered. Send them a direct message instead.');
  }

  // 2. Create invitation
  const invitation = await db.insert(recruiterInvitations).values({
    invited_by: recruiterId,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    job_id: data.job_id,
    message: data.message,
    token: generateSecureToken(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'pending',
  }).returning();

  // 3. Send invitation email
  await sendInvitationEmail(invitation);

  return invitation;
}
```

**Invitation Email**:
```html
<EmailTemplate>
  <Heading>{recruiter_name} invited you to InTime</Heading>
  <Text>
    {recruiter_name} from InTime thinks you'd be a great fit for opportunities
    in our network.
  </Text>

  {#if job_id}
  <Card>
    <CardTitle>{job_title}</CardTitle>
    <CardBody>{job_summary}</CardBody>
  </Card>
  {/if}

  {#if message}
  <Quote>
    {message}
  </Quote>
  {/if}

  <Button href="{invitation_link}">
    Create Your Profile
  </Button>

  <Text style="muted">
    This invitation expires in 30 days.
  </Text>
</EmailTemplate>
```

### Step 2: Candidate Accepts Invitation

**Invitation Landing Page** (`/invite/:token`):
```tsx
function InvitationLandingPage({ token }: { token: string }) {
  const invitation = useInvitation(token);

  if (invitation.status === 'expired') {
    return <InvitationExpired />;
  }

  if (invitation.status === 'used') {
    return <InvitationAlreadyUsed />;
  }

  return (
    <OnboardingLayout>
      <InvitationHeader
        recruiter={invitation.recruiter}
        job={invitation.job}
      />

      {invitation.message && (
        <PersonalMessage>{invitation.message}</PersonalMessage>
      )}

      <RegisterForm
        defaultValues={{
          email: invitation.email,
          first_name: invitation.first_name,
          last_name: invitation.last_name,
        }}
        hiddenFields={['email']} // Email pre-filled and locked
        onSubmit={handleInvitationRegistration}
      />
    </OnboardingLayout>
  );
}
```

**Invitation Registration**:
```typescript
async function handleInvitationRegistration(
  token: string,
  data: RegistrationData
) {
  // 1. Validate invitation
  const invitation = await validateInvitation(token);

  // 2. Create user account
  const user = await createUser({
    email: invitation.email,
    email_verified: true, // Pre-verified via recruiter
    ...data,
  });

  // 3. Create candidate profile
  const candidate = await createCandidate({
    user_id: user.id,
    first_name: invitation.first_name || data.first_name,
    last_name: invitation.last_name || data.last_name,
    source: 'recruiter_invite',
    referred_by: invitation.invited_by,
  });

  // 4. Mark invitation as used
  await db.update(recruiterInvitations)
    .set({ status: 'accepted', used_at: new Date() })
    .where(eq(recruiterInvitations.token, token));

  // 5. If invited for specific job, create draft application
  if (invitation.job_id) {
    await db.insert(applications).values({
      candidate_id: candidate.id,
      job_id: invitation.job_id,
      status: 'draft',
      source: 'recruiter_invite',
    });
  }

  // 6. Notify recruiter
  await notifyRecruiterOfAcceptance(invitation.invited_by, candidate.id);

  return { candidate, redirect: '/onboarding/profile' };
}
```

---

## Referral Link Flow

### Step 1: Referral Link Generation

**Employee/Candidate Referral**:
```typescript
interface ReferralLink {
  referrer_id: string;       // User making referral
  referrer_type: 'employee' | 'candidate';
  referral_code: string;     // Unique code (e.g., "JOHN_SMITH_2025")
  referral_url: string;      // Full URL with code
  bonus_tier?: string;       // If eligible for referral bonus
  expires_at?: Date;         // Optional expiration
}

function generateReferralLink(userId: string) {
  const user = getUserProfile(userId);
  const referralCode = generateReferralCode(user);

  const referralUrl = `${baseUrl}/register?ref=${referralCode}`;

  return {
    referrer_id: userId,
    referral_code: referralCode,
    referral_url: referralUrl,
    share_options: {
      email: generateReferralEmail(referralUrl),
      linkedin: generateLinkedInShare(referralUrl),
      twitter: generateTwitterShare(referralUrl),
      whatsapp: generateWhatsAppShare(referralUrl),
    },
  };
}
```

**Referral Code Format**:
```typescript
function generateReferralCode(user: User): string {
  // Format: FIRSTNAME_LASTNAME_RANDOM4
  const normalized = `${user.first_name}_${user.last_name}`.toUpperCase()
    .replace(/[^A-Z]/g, '_');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${normalized}_${random}`;
}
```

### Step 2: Referral Registration

**Referral Tracking**:
```typescript
async function handleReferralRegistration(
  referralCode: string,
  registrationData: RegistrationData
) {
  // 1. Validate referral code
  const referral = await db.query.referralLinks.findFirst({
    where: eq(referralLinks.referral_code, referralCode),
  });

  if (!referral) {
    // Continue with normal registration, but log invalid code
    await logInvalidReferralCode(referralCode);
    return registerCandidate(registrationData);
  }

  if (referral.expires_at && referral.expires_at < new Date()) {
    throw new Error('Referral link has expired');
  }

  // 2. Create candidate with referral tracking
  const candidate = await registerCandidate({
    ...registrationData,
    source: 'referral',
    referred_by: referral.referrer_id,
  });

  // 3. Create referral record
  await db.insert(candidateReferrals).values({
    referrer_id: referral.referrer_id,
    referee_id: candidate.id,
    referral_code: referralCode,
    status: 'registered', // Changes to 'placed' when hired
    bonus_eligible: referral.bonus_tier !== null,
    bonus_tier: referral.bonus_tier,
  });

  // 4. Notify referrer
  await notifyReferrer(referral.referrer_id, candidate);

  return candidate;
}
```

**Referral Bonus Tracking**:
```typescript
interface ReferralBonus {
  referral_id: string;
  milestone: 'registered' | 'applied' | 'interviewed' | 'placed' | 'retained_90_days';
  bonus_amount: number;
  paid_at?: Date;
}

async function trackReferralMilestone(
  candidateId: string,
  milestone: ReferralBonus['milestone']
) {
  const referral = await db.query.candidateReferrals.findFirst({
    where: eq(candidateReferrals.referee_id, candidateId),
  });

  if (!referral || !referral.bonus_eligible) return;

  // Check bonus tiers
  const bonusConfig = REFERRAL_BONUS_TIERS[referral.bonus_tier];
  const bonusAmount = bonusConfig[milestone];

  if (bonusAmount > 0) {
    await db.insert(referralBonuses).values({
      referral_id: referral.id,
      milestone,
      bonus_amount: bonusAmount,
      status: 'pending_approval',
    });

    await notifyReferrerOfBonus(referral.referrer_id, milestone, bonusAmount);
  }
}
```

---

## Profile Creation Wizard

### Wizard Overview

**Multi-Step Wizard**:
```typescript
interface ProfileWizard {
  steps: [
    'basic_info',        // Name, contact, location
    'work_authorization', // Legal work status
    'resume_upload',     // Resume parsing
    'work_history',      // Experience details
    'education',         // Degrees and certifications
    'skills',            // Skills and expertise
    'preferences',       // Job preferences, availability
    'review',            // Final review
  ];
  current_step: number;
  can_skip: boolean;     // Allow partial completion
  min_completion: 60;    // % required to apply to jobs
}
```

### Step 1: Basic Information

**Basic Info Form**:
```tsx
<WizardStep step="basic_info" title="Let's start with the basics">
  <FormField label="Professional Photo" optional>
    <ImageUpload
      name="profile_picture"
      accept="image/*"
      maxSize={5 * 1024 * 1024} // 5MB
      aspectRatio={1} // Square
      cropEnabled
    />
  </FormField>

  <FormField label="Full Name" required>
    <div className="grid grid-cols-3 gap-4">
      <Input name="first_name" placeholder="First" />
      <Input name="middle_name" placeholder="Middle" optional />
      <Input name="last_name" placeholder="Last" />
    </div>
  </FormField>

  <FormField label="Preferred Name" optional>
    <Input name="preferred_name" placeholder="What should we call you?" />
    <FieldHelp>
      If different from your legal name
    </FieldHelp>
  </FormField>

  <FormField label="Location" required>
    <LocationInput
      name="location"
      fields={['city', 'state', 'country', 'zip']}
      allowGeolocation
    />
  </FormField>

  <FormField label="Phone Number" required>
    <PhoneInput
      name="phone"
      defaultCountry={userCountry}
      verify // SMS verification
    />
  </FormField>

  <FormField label="LinkedIn Profile" optional>
    <Input
      name="linkedin_url"
      placeholder="https://linkedin.com/in/..."
      validate={validateLinkedInUrl}
    />
  </FormField>
</WizardStep>
```

### Step 2: Work Authorization

**Work Authorization Form**:
```tsx
<WizardStep step="work_authorization" title="Work Authorization">
  <FormField label="Are you authorized to work in the United States?" required>
    <RadioGroup name="us_work_auth">
      <Radio value="citizen">US Citizen</Radio>
      <Radio value="green_card">Green Card / Permanent Resident</Radio>
      <Radio value="h1b">H-1B Visa</Radio>
      <Radio value="opt_cpt">F-1 OPT/CPT</Radio>
      <Radio value="tn">TN Visa (Canadian/Mexican)</Radio>
      <Radio value="other">Other Work Visa</Radio>
      <Radio value="not_authorized">Not Authorized (Require Sponsorship)</Radio>
    </RadioGroup>
  </FormField>

  {workAuth === 'other' && (
    <FormField label="Visa Type">
      <Input name="visa_type" placeholder="e.g., L-1, O-1" />
    </FormField>
  )}

  {workAuth === 'h1b' && (
    <>
      <FormField label="H-1B Status">
        <RadioGroup name="h1b_status">
          <Radio value="cap_subject">Cap Subject (Need lottery)</Radio>
          <Radio value="cap_exempt">Cap Exempt</Radio>
          <Radio value="already_stamped">Already H-1B Stamped</Radio>
        </RadioGroup>
      </FormField>

      <FormField label="Current H-1B Employer" optional>
        <Input name="h1b_employer" />
      </FormField>

      <FormField label="H-1B Expiration Date" optional>
        <DateInput name="h1b_expiry" />
      </FormField>
    </>
  )}

  {workAuth === 'not_authorized' && (
    <Alert type="info">
      <AlertTitle>Sponsorship Required</AlertTitle>
      <AlertBody>
        We'll only show you positions where the employer is willing to sponsor work authorization.
      </AlertBody>
    </Alert>
  )}

  <FormField label="Willing to relocate?" required>
    <RadioGroup name="willing_to_relocate">
      <Radio value="yes">Yes, anywhere in the US</Radio>
      <Radio value="specific">Yes, to specific locations</Radio>
      <Radio value="no">No, local opportunities only</Radio>
    </RadioGroup>
  </FormField>

  {relocate === 'specific' && (
    <FormField label="Preferred Relocation Cities">
      <LocationMultiSelect
        name="relocation_preferences"
        placeholder="Add cities..."
      />
    </FormField>
  )}
</WizardStep>
```

### Step 3: Resume Upload

See [02-resume-upload-parsing.md](#resume-upload--parsing) for detailed implementation.

### Step 4: Work History

**Work History Form**:
```tsx
<WizardStep step="work_history" title="Work Experience">
  <WorkHistoryList>
    {workHistory.map((job, index) => (
      <WorkHistoryItem key={index} editable>
        <FormField label="Company Name" required>
          <CompanyAutocomplete
            name={`work_history.${index}.company`}
            onSelect={handleCompanySelect}
          />
        </FormField>

        <FormField label="Job Title" required>
          <Input name={`work_history.${index}.title`} />
        </FormField>

        <FormField label="Employment Period" required>
          <DateRangeInput
            nameStart={`work_history.${index}.start_date`}
            nameEnd={`work_history.${index}.end_date`}
            allowCurrent
          />
        </FormField>

        <FormField label="Location">
          <LocationInput name={`work_history.${index}.location`} />
        </FormField>

        <FormField label="Description">
          <Textarea
            name={`work_history.${index}.description`}
            rows={4}
            placeholder="Describe your responsibilities and achievements..."
          />
          <FieldHelp>
            Use bullet points to highlight key accomplishments
          </FieldHelp>
        </FormField>

        <FormField label="Technologies Used" optional>
          <SkillMultiSelect
            name={`work_history.${index}.technologies`}
            category="technical"
          />
        </FormField>
      </WorkHistoryItem>
    ))}
  </WorkHistoryList>

  <Button onClick={addWorkHistory} variant="outline">
    + Add Another Position
  </Button>
</WizardStep>
```

### Step 5: Education

**Education Form**:
```tsx
<WizardStep step="education" title="Education">
  <EducationList>
    {education.map((edu, index) => (
      <EducationItem key={index} editable>
        <FormField label="School Name" required>
          <SchoolAutocomplete
            name={`education.${index}.school`}
            onSelect={handleSchoolSelect}
          />
        </FormField>

        <FormField label="Degree" required>
          <Select name={`education.${index}.degree_type`}>
            <Option value="high_school">High School Diploma</Option>
            <Option value="associate">Associate Degree</Option>
            <Option value="bachelor">Bachelor's Degree</Option>
            <Option value="master">Master's Degree</Option>
            <Option value="phd">PhD / Doctorate</Option>
            <Option value="certificate">Professional Certificate</Option>
          </Select>
        </FormField>

        <FormField label="Field of Study">
          <Input
            name={`education.${index}.field_of_study`}
            placeholder="e.g., Computer Science"
          />
        </FormField>

        <FormField label="Graduation Date">
          <MonthYearInput name={`education.${index}.graduation_date`} />
        </FormField>

        <FormField label="GPA" optional>
          <Input
            name={`education.${index}.gpa`}
            type="number"
            step="0.01"
            min="0"
            max="4.0"
            placeholder="4.0 scale"
          />
        </FormField>
      </EducationItem>
    ))}
  </EducationList>

  <Button onClick={addEducation} variant="outline">
    + Add Education
  </Button>
</WizardStep>
```

### Step 6: Skills

See [Skills Assessment](#skills-assessment) section.

### Step 7: Preferences

**Job Preferences**:
```tsx
<WizardStep step="preferences" title="Job Preferences">
  <FormField label="Desired Job Titles">
    <TagInput
      name="desired_titles"
      placeholder="Add job titles..."
      suggestions={suggestedTitles}
    />
  </FormField>

  <FormField label="Employment Type" required>
    <CheckboxGroup name="employment_types">
      <Checkbox value="full_time">Full-Time</Checkbox>
      <Checkbox value="contract">Contract / C2C</Checkbox>
      <Checkbox value="contract_to_hire">Contract-to-Hire</Checkbox>
      <Checkbox value="part_time">Part-Time</Checkbox>
    </CheckboxGroup>
  </FormField>

  <FormField label="Work Arrangement" required>
    <CheckboxGroup name="work_arrangements">
      <Checkbox value="remote">Remote</Checkbox>
      <Checkbox value="hybrid">Hybrid</Checkbox>
      <Checkbox value="onsite">On-Site</Checkbox>
    </CheckboxGroup>
  </FormField>

  <FormField label="Desired Salary/Rate">
    <div className="grid grid-cols-2 gap-4">
      <Select name="rate_type">
        <Option value="hourly">Hourly</Option>
        <Option value="annual">Annual Salary</Option>
      </Select>
      <Input
        name="desired_rate"
        type="number"
        prefix="$"
        placeholder="Your rate"
      />
    </div>
  </FormField>

  <FormField label="Availability">
    <RadioGroup name="availability">
      <Radio value="immediate">Immediate (Can start within 2 weeks)</Radio>
      <Radio value="2_weeks">2-4 weeks notice</Radio>
      <Radio value="1_month">1 month notice</Radio>
      <Radio value="specific_date">Specific start date</Radio>
    </RadioGroup>
  </FormField>

  {availability === 'specific_date' && (
    <FormField label="Available Start Date">
      <DateInput name="available_start_date" minDate={new Date()} />
    </FormField>
  )}
</WizardStep>
```

### Step 8: Review & Submit

**Profile Review**:
```tsx
<WizardStep step="review" title="Review Your Profile">
  <ProfileCompleteness score={profileScore} />

  <ProfileSummaryCard>
    <Section title="Basic Information">
      <ReviewItem label="Name" value={`${firstName} ${lastName}`} edit />
      <ReviewItem label="Email" value={email} edit />
      <ReviewItem label="Phone" value={phone} edit />
      <ReviewItem label="Location" value={location} edit />
    </Section>

    <Section title="Work Authorization">
      <ReviewItem label="US Work Auth" value={workAuthStatus} edit />
    </Section>

    <Section title="Experience">
      <ReviewItem
        label="Years of Experience"
        value={calculateYearsOfExperience(workHistory)}
      />
      <ReviewItem
        label="Positions"
        value={`${workHistory.length} positions`}
        edit
      />
    </Section>

    <Section title="Skills">
      <SkillTagList skills={skills} editable />
    </Section>

    <Section title="Preferences">
      <ReviewItem label="Job Types" value={employmentTypes.join(', ')} edit />
      <ReviewItem label="Desired Rate" value={formatRate(desiredRate)} edit />
      <ReviewItem label="Availability" value={availabilityStatus} edit />
    </Section>
  </ProfileSummaryCard>

  <ActionBar>
    <Button onClick={saveAsDraft} variant="outline">
      Save as Draft
    </Button>
    <Button onClick={submitProfile} variant="primary">
      Complete Profile
    </Button>
  </ActionBar>
</WizardStep>
```

---

## Resume Upload & Parsing

### Upload Interface

**Resume Upload Component**:
```tsx
function ResumeUpload() {
  return (
    <FileUpload
      accept=".pdf,.doc,.docx,.txt"
      maxSize={10 * 1024 * 1024} // 10MB
      onUpload={handleResumeUpload}
    >
      <UploadZone>
        <UploadIcon />
        <UploadText>
          Drag & drop your resume here, or click to browse
        </UploadText>
        <UploadHint>
          PDF, DOC, DOCX up to 10MB
        </UploadHint>
      </UploadZone>
    </FileUpload>
  );
}
```

### Resume Parsing

**Parsing Pipeline**:
```typescript
async function parseResume(file: File): Promise<ParsedResume> {
  // 1. Upload file to storage
  const fileUrl = await uploadFile(file, 'resumes');

  // 2. Extract text based on file type
  const text = await extractText(file);

  // 3. Parse with AI (OpenAI/Claude)
  const parsed = await parseResumeWithAI(text);

  // 4. Extract structured data
  return {
    contact_info: extractContactInfo(parsed),
    work_history: extractWorkHistory(parsed),
    education: extractEducation(parsed),
    skills: extractSkills(parsed),
    certifications: extractCertifications(parsed),
    summary: extractSummary(parsed),
  };
}
```

**AI Resume Parser**:
```typescript
async function parseResumeWithAI(text: string): Promise<ParsedResume> {
  const prompt = `
    Extract structured information from this resume.
    Return JSON with: contact_info, work_history, education, skills, certifications.

    Resume text:
    ${text}
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### Parsing Review

**Review Parsed Data**:
```tsx
function ResumeParseReview({ parsed }: { parsed: ParsedResume }) {
  const [editMode, setEditMode] = useState(false);

  return (
    <ParseReviewCard>
      <Alert type="success">
        <AlertTitle>Resume Parsed Successfully!</AlertTitle>
        <AlertBody>
          Please review the extracted information and make any necessary corrections.
        </AlertBody>
      </Alert>

      <ReviewSection title="Contact Information" editable>
        {Object.entries(parsed.contact_info).map(([key, value]) => (
          <ReviewField key={key} label={key} value={value} />
        ))}
      </ReviewSection>

      <ReviewSection title="Work History" editable>
        {parsed.work_history.map((job, i) => (
          <JobCard key={i} job={job} editable />
        ))}
      </ReviewSection>

      <ReviewSection title="Skills" editable>
        <SkillList skills={parsed.skills} editable />
      </ReviewSection>

      <ActionBar>
        <Button onClick={() => setEditMode(true)}>
          Edit Extracted Data
        </Button>
        <Button onClick={confirmParsedData} variant="primary">
          Looks Good, Continue
        </Button>
      </ActionBar>
    </ParseReviewCard>
  );
}
```

---

## Skills Assessment

### Skill Selection

**Skill Taxonomy Browser**:
```tsx
function SkillSelector() {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>();

  return (
    <SkillSelectorLayout>
      <SkillCategories>
        {SKILL_CATEGORIES.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            selected={selectedCategory?.id === category.id}
            onClick={() => setSelectedCategory(category)}
          />
        ))}
      </SkillCategories>

      {selectedCategory && (
        <SkillList category={selectedCategory}>
          {selectedCategory.skills.map(skill => (
            <SkillCheckbox
              key={skill.id}
              skill={skill}
              onSelect={handleSkillSelect}
            />
          ))}
        </SkillList>
      )}

      <SelectedSkills>
        <SkillTagList
          skills={selectedSkills}
          onRemove={handleSkillRemove}
        />
      </SelectedSkills>
    </SkillSelectorLayout>
  );
}
```

### Proficiency Assessment

**Self-Assessment**:
```tsx
function SkillProficiencyForm({ skill }: { skill: Skill }) {
  return (
    <FormField label={`How would you rate your ${skill.name} skills?`}>
      <RadioGroup name={`skill_${skill.id}_proficiency`}>
        <Radio value="beginner">
          <ProficiencyLabel level="beginner">
            <strong>Beginner</strong>
            <span>Limited experience, still learning</span>
          </ProficiencyLabel>
        </Radio>

        <Radio value="intermediate">
          <ProficiencyLabel level="intermediate">
            <strong>Intermediate</strong>
            <span>Can work independently with guidance</span>
          </ProficiencyLabel>
        </Radio>

        <Radio value="advanced">
          <ProficiencyLabel level="advanced">
            <strong>Advanced</strong>
            <span>Deep expertise, can mentor others</span>
          </ProficiencyLabel>
        </Radio>

        <Radio value="expert">
          <ProficiencyLabel level="expert">
            <strong>Expert</strong>
            <span>Industry-recognized authority</span>
          </ProficiencyLabel>
        </Radio>
      </RadioGroup>

      <FormField label="Years of Experience">
        <Input
          type="number"
          name={`skill_${skill.id}_years`}
          min="0"
          max="50"
          placeholder="e.g., 5"
        />
      </FormField>

      <FormField label="Last Used" optional>
        <RadioGroup name={`skill_${skill.id}_last_used`}>
          <Radio value="current">Currently using</Radio>
          <Radio value="6_months">Within last 6 months</Radio>
          <Radio value="1_year">Within last year</Radio>
          <Radio value="2_years">1-2 years ago</Radio>
          <Radio value="older">More than 2 years ago</Radio>
        </RadioGroup>
      </FormField>
    </FormField>
  );
}
```

---

## Availability & Preferences

**Availability Status**:
```typescript
type AvailabilityStatus =
  | 'immediate'        // Available now
  | 'passive'          // Open to opportunities
  | 'not_looking'      // Not actively seeking
  | 'specific_date';   // Available on specific date

interface AvailabilityPreferences {
  status: AvailabilityStatus;
  available_date?: Date;
  notice_period?: '2_weeks' | '1_month' | 'negotiable';
  open_to_contract: boolean;
  open_to_fulltime: boolean;
  min_contract_duration?: number; // months
  preferred_locations: string[];
  willing_to_relocate: boolean;
  remote_preference: 'remote_only' | 'hybrid' | 'onsite' | 'flexible';
}
```

---

## Mobile Onboarding

**Mobile-Optimized Wizard**:
- Single column layout
- Larger touch targets
- Swipe navigation between steps
- Save progress automatically
- Resume upload via camera
- Voice input for descriptions

---

## International Onboarding

**Localization**:
- Auto-detect locale
- Currency selection
- Date format preferences
- Work authorization by country
- Tax forms by jurisdiction

**Regional Variations**:
- EU: GDPR consent, data processing agreements
- UK: Right to work verification
- Canada: Provincial work permits
- Australia: Visa subclass selection

---

## Profile Completeness

**Scoring Algorithm**:
```typescript
function calculateProfileCompleteness(profile: CandidateProfile): number {
  const weights = {
    contact_info: 15,
    work_history: 25,
    education: 15,
    skills: 20,
    resume: 15,
    preferences: 10,
  };

  let score = 0;

  // Contact info (15 points)
  if (profile.phone) score += 5;
  if (profile.location) score += 5;
  if (profile.linkedin_url) score += 5;

  // Work history (25 points)
  if (profile.work_history.length > 0) score += 10;
  if (profile.work_history.length >= 2) score += 10;
  if (profile.work_history.some(job => job.description)) score += 5;

  // Education (15 points)
  if (profile.education.length > 0) score += 15;

  // Skills (20 points)
  if (profile.skills.length >= 3) score += 10;
  if (profile.skills.length >= 10) score += 10;

  // Resume (15 points)
  if (profile.resume_url) score += 15;

  // Preferences (10 points)
  if (profile.desired_rate) score += 5;
  if (profile.availability_status) score += 5;

  return Math.min(score, 100);
}
```

**Profile Completeness UI**:
```tsx
function ProfileCompletenessWidget({ score }: { score: number }) {
  const missingItems = getProfileGaps(score);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completeness</CardTitle>
        <ProgressBar value={score} max={100} />
        <ProgressText>{score}% Complete</ProgressText>
      </CardHeader>

      {score < 100 && (
        <CardBody>
          <h4>Complete your profile to unlock:</h4>
          <BenefitsList>
            <Benefit checked={score >= 60}>
              Apply to jobs
            </Benefit>
            <Benefit checked={score >= 75}>
              Appear in recruiter searches
            </Benefit>
            <Benefit checked={score >= 90}>
              Get AI-powered job matches
            </Benefit>
          </BenefitsList>

          <h4>To improve your score:</h4>
          <TodoList>
            {missingItems.map(item => (
              <TodoItem key={item.id} onClick={() => navigateTo(item.url)}>
                {item.label}
                <Badge>+{item.points}</Badge>
              </TodoItem>
            ))}
          </TodoList>
        </CardBody>
      )}
    </Card>
  );
}
```
