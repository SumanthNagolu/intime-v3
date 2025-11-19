# ACAD-008: Create Lab Environments System

**Story Points:** 8
**Sprint:** Sprint 2 (Week 7-8)
**Priority:** HIGH

---

## User Story

As a **Student**,
I want **hands-on lab environments provisioned automatically**,
So that **I can practice real-world skills without complex setup**.

---

## Acceptance Criteria

- [ ] GitHub template repository integration
- [ ] Auto-create student fork when lab started
- [ ] Docker/sandbox environment provisioning (optional)
- [ ] Lab instructions embedded in UI
- [ ] Submission workflow (submit GitHub repo URL)
- [ ] Auto-grading for simple labs (unit tests pass)
- [ ] Manual grading queue for complex labs
- [ ] Lab time limit (optional, for certifications)
- [ ] Resource cleanup after lab completion

---

## Technical Implementation

### Lab Provisioning

```typescript
// src/lib/labs/provision.ts
import { Octokit } from '@octokit/rest';

export async function provisionLab(
  userId: string,
  labTemplateUrl: string
): Promise<string> {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // Fork template repo
  const [owner, repo] = labTemplateUrl.split('/').slice(-2);
  
  const { data: fork } = await octokit.repos.createFork({
    owner,
    repo,
  });

  // Grant user access
  await octokit.repos.addCollaborator({
    owner: fork.owner.login,
    repo: fork.name,
    username: userId, // Assumes GitHub username mapped
    permission: 'push',
  });

  return fork.html_url;
}
```

### Lab Submissions Table

```sql
CREATE TABLE lab_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  topic_id UUID NOT NULL REFERENCES module_topics(id),
  enrollment_id UUID NOT NULL REFERENCES student_enrollments(id),
  
  repository_url TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'passed', 'failed', 'grading')
  ),
  
  auto_grade_result JSONB,
  manual_grade_score NUMERIC(5,2),
  graded_by UUID REFERENCES user_profiles(id),
  graded_at TIMESTAMPTZ,
  feedback TEXT
);
```

---

## Dependencies

- **ACAD-001** (Topics with lab_environment_template)
- **ACAD-003** (Progress tracking)
- **FOUND-001** (User profiles)

---

## Testing

```typescript
it('should provision GitHub lab', async () => {
  const repoUrl = await provisionLab('user-id', 'template-url');
  expect(repoUrl).toContain('github.com');
});
```

---

**Related Stories:**
- **Next:** ACAD-009 (Reading Materials)
- **Depends On:** ACAD-001, ACAD-003
