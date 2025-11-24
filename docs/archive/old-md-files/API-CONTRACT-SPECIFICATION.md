# InTime Unified Platform - API Contract Specification

**Project:** InTime Internal Employee Platform
**Version:** 1.0
**Date:** 2025-11-23
**For:** Frontend & Backend Development Teams
**API Framework:** tRPC (Type-safe API)
**Authentication:** Supabase Auth (JWT tokens)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [HR Module APIs](#hr-module-apis)
5. [Academy Module APIs](#academy-module-apis)
6. [Client Portal APIs](#client-portal-apis)
7. [Shared Boards APIs](#shared-boards-apis)
8. [Pod Workflows APIs](#pod-workflows-apis)
9. [CEO Dashboard APIs](#ceo-dashboard-apis)
10. [Admin Panel APIs](#admin-panel-apis)
11. [AI Twin APIs](#ai-twin-apis)
12. [Notification APIs](#notification-apis)
13. [Real-time Subscriptions](#real-time-subscriptions)

---

## Overview

### tRPC Structure

```typescript
// src/server/trpc/root.ts
export const appRouter = router({
  hr: hrRouter,
  academy: academyRouter,
  academyAdmin: academyAdminRouter,
  clients: clientsRouter,
  shared: sharedRouter,
  recruiting: recruitingRouter,
  bench: benchRouter,
  ta: taRouter,
  ceo: ceoRouter,
  admin: adminRouter,
  ai: aiRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
```

### Common Types

```typescript
// src/types/api.ts
export type APIResponse<T> =
  | { success: true; data: T }
  | { success: false; error: APIError };

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationInput {
  page: number; // 1-indexed
  limit: number; // default: 50, max: 100
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
```

---

## Authentication

### Session Management

```typescript
// All protected procedures require authentication
// tRPC middleware extracts user from Supabase JWT

export const protectedProcedure = t.procedure
  .use(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
        user: ctx.session.user,
      },
    });
  });

// User context available in all routes
interface AuthContext {
  userId: string;
  email: string;
  roles: string[]; // ['recruiter', 'senior_account_manager']
  podId: string | null;
}
```

---

## Error Handling

### Standard Error Codes

```typescript
export const ErrorCodes = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Business Logic
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  DEADLINE_PASSED: 'DEADLINE_PASSED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
};
```

### Error Response Format

```typescript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid timesheet data',
    details: {
      field: 'hours',
      reason: 'Hours cannot exceed 24 per day',
    },
  },
}
```

---

## HR Module APIs

### Router: `hr`

#### 1. Dashboard

```typescript
// Get pending approvals
hr.getPendingApprovals.useQuery()

// Input: none (uses authenticated user)
// Output:
interface PendingApproval {
  id: string;
  type: 'timesheet' | 'leave_request' | 'expense';
  employeeName: string;
  employeeId: string;
  submittedAt: Date;
  details: {
    // For timesheet:
    weekEnding?: Date;
    totalHours?: number;
    // For leave:
    startDate?: Date;
    endDate?: Date;
    leaveType?: string;
    // For expense:
    amount?: number;
    category?: string;
  };
}

// Response:
{
  success: true,
  data: {
    timesheets: PendingApproval[];
    leaveRequests: PendingApproval[];
    expenses: PendingApproval[];
  }
}
```

#### 2. Timesheets

```typescript
// Submit timesheet
hr.submitTimesheet.useMutation()

// Input:
interface SubmitTimesheetInput {
  weekEnding: Date; // Friday of the week
  entries: {
    date: Date;
    hours: number;
    projectId?: string; // null = internal/non-billable
    description: string;
  }[];
}

// Output:
{
  success: true,
  data: {
    timesheetId: string;
    status: 'pending_approval';
    submittedAt: Date;
  }
}

// Validation:
// - Hours per day <= 24
// - Hours per week <= 80
// - Dates must be within weekEnding week
// - Cannot submit duplicate timesheet for same week


// Get my timesheets
hr.getMyTimesheets.useQuery({ status?: 'all' | 'pending' | 'approved' | 'rejected' })

// Output:
interface Timesheet {
  id: string;
  weekEnding: Date;
  totalHours: number;
  billableHours: number;
  internalHours: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  submittedAt: Date | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectedReason: string | null;
  entries: TimesheetEntry[];
}

{
  success: true,
  data: Timesheet[]
}


// Approve timesheet (manager only)
hr.approveTimesheet.useMutation()

// Input:
{
  timesheetId: string;
  comments?: string;
}

// Output:
{
  success: true,
  data: {
    timesheetId: string;
    status: 'approved';
    approvedAt: Date;
  }
}

// Authorization:
// - User must be manager of employee who submitted timesheet
// - OR user has 'hr_admin' role


// Reject timesheet (manager only)
hr.rejectTimesheet.useMutation()

// Input:
{
  timesheetId: string;
  reason: string; // Required
}

// Output:
{
  success: true,
  data: {
    timesheetId: string;
    status: 'rejected';
    rejectedReason: string;
  }
}
```

#### 3. Leave Requests

```typescript
// Submit leave request
hr.submitLeaveRequest.useMutation()

// Input:
interface SubmitLeaveRequestInput {
  startDate: Date;
  endDate: Date;
  leaveType: 'pto' | 'sick' | 'unpaid' | 'bereavement';
  reason: string;
  halfDay?: boolean; // First day only
}

// Output:
{
  success: true,
  data: {
    leaveRequestId: string;
    status: 'pending_approval';
    submittedAt: Date;
  }
}

// Validation:
// - Start date <= End date
// - Cannot overlap with existing approved leave
// - Sufficient PTO balance (check against accrual)


// Get my leave requests
hr.getMyLeaveRequests.useQuery()

// Output:
interface LeaveRequest {
  id: string;
  startDate: Date;
  endDate: Date;
  days: number;
  leaveType: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  approvedBy: string | null;
  rejectedReason: string | null;
}


// Approve leave request
hr.approveLeaveRequest.useMutation()

// Input:
{
  leaveRequestId: string;
  comments?: string;
}


// Reject leave request
hr.rejectLeaveRequest.useMutation()

// Input:
{
  leaveRequestId: string;
  reason: string;
}
```

#### 4. People Directory

```typescript
// Get employees list
hr.getEmployees.useQuery({
  search?: string;
  podId?: string;
  role?: string;
  status?: 'active' | 'inactive';
})

// Output:
interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  title: string;
  pod: {
    id: string;
    name: string; // "Recruiting Pod A"
    type: 'recruiting' | 'bench_sales' | 'ta' | 'academy';
  } | null;
  roles: string[]; // ['recruiter', 'senior_account_manager']
  status: 'active' | 'inactive';
  hireDate: Date;
  managerId: string | null;
  managerName: string | null;
}

{
  success: true,
  data: Employee[]
}


// Get employee detail
hr.getEmployeeDetail.useQuery({ employeeId: string })

// Output:
interface EmployeeDetail extends Employee {
  phone: string;
  location: string;
  department: string;
  employmentType: 'full_time' | 'part_time' | 'contractor';

  // Performance
  currentGoals: Goal[];
  recentReviews: PerformanceReview[];

  // Compensation
  salary: number; // Only visible to HR + CEO
  commission: number;
  ytdEarnings: number;

  // Time off
  ptoBalance: number;
  sickBalance: number;

  // Training
  completedCourses: number;
  inProgressCourses: number;
  certifications: string[];
}


// Create employee
hr.createEmployee.useMutation()

// Input:
interface CreateEmployeeInput {
  email: string;
  name: string;
  title: string;
  podId: string | null;
  roles: string[]; // ['recruiter']
  hireDate: Date;
  managerId: string | null;
  salary: number;
  employmentType: 'full_time' | 'part_time' | 'contractor';
}

// Output:
{
  success: true,
  data: {
    employeeId: string;
    authUserId: string; // Supabase Auth user created
    temporaryPassword: string; // Send to employee via email
  }
}

// Side effects:
// - Creates Supabase Auth user
// - Creates user_profiles record
// - Creates user_roles records
// - Sends welcome email with temp password
// - Triggers onboarding workflow


// Update employee
hr.updateEmployee.useMutation()

// Input:
{
  employeeId: string;
  updates: Partial<CreateEmployeeInput>;
}

// Authorization:
// - HR admin can update all fields
// - Manager can update title, podId
// - Employee can update own phone, location
```

#### 5. Performance Reviews

```typescript
// Get employee goals
hr.getEmployeeGoals.useQuery({ employeeId: string; quarter?: string })

// Output:
interface Goal {
  id: string;
  title: string;
  description: string;
  quarter: string; // "Q4 2025"
  status: 'not_started' | 'in_progress' | 'completed' | 'at_risk';
  progress: number; // 0-100
  keyResults: {
    id: string;
    description: string;
    target: string;
    current: string;
    completed: boolean;
  }[];
  createdBy: string;
  createdAt: Date;
}


// Create/Update goal
hr.upsertGoal.useMutation()

// Input:
interface UpsertGoalInput {
  goalId?: string; // undefined = create
  employeeId: string;
  title: string;
  description: string;
  quarter: string;
  keyResults: {
    description: string;
    target: string;
  }[];
}


// Submit self-review
hr.submitSelfReview.useMutation()

// Input:
{
  employeeId: string;
  period: string; // "Q4 2025"
  accomplishments: string;
  challenges: string;
  goals: string; // Next quarter
  rating: 1 | 2 | 3 | 4 | 5; // Self-assessment
}
```

#### 6. Documents

```typescript
// Get documents
hr.getDocuments.useQuery({
  employeeId?: string; // Filter by employee
  category?: 'handbook' | 'policy' | 'contract' | 'offer_letter' | 'w4';
})

// Output:
interface Document {
  id: string;
  name: string;
  category: string;
  uploadedBy: string;
  uploadedAt: Date;
  url: string; // Supabase Storage signed URL
  size: number; // bytes
  employeeId: string | null; // null = company-wide
}


// Upload document
hr.uploadDocument.useMutation()

// Input:
{
  file: File; // Frontend uploads to Supabase Storage first
  fileUrl: string; // Supabase Storage URL
  name: string;
  category: string;
  employeeId?: string;
}

// Output:
{
  success: true,
  data: {
    documentId: string;
    url: string;
  }
}
```

#### 7. Learning & Development

```typescript
// Assign course to employee(s)
hr.assignCourseToEmployees.useMutation()

// Input:
{
  courseId: string;
  employeeIds: string[];
  dueDate?: Date;
  mandatory?: boolean;
}

// Output:
{
  success: true,
  data: {
    enrollmentIds: string[];
    emailsSent: number;
  }
}

// Side effects:
// - Creates student_enrollments records
// - Sends email notifications
// - Creates notification for each employee


// Get employee training progress
hr.getEmployeeTraining.useQuery({ employeeId: string })

// Output:
interface EmployeeTraining {
  enrolled: number;
  inProgress: number;
  completed: number;
  overdue: number;
  courses: {
    id: string;
    title: string;
    progress: number; // 0-100
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
    enrolledAt: Date;
    dueDate: Date | null;
    completedAt: Date | null;
  }[];
}
```

---

## Academy Module APIs

### Router: `academy` (Student-facing)

#### 1. Student Dashboard

```typescript
// Get my dashboard
academy.getMyDashboard.useQuery()

// Output:
interface StudentDashboard {
  student: {
    id: string;
    name: string;
    email: string;
    cohort: string; // "Cohort 12 - Jan 2026"
    enrolledDate: Date;
    expectedGraduation: Date;
  };

  stats: {
    coursesEnrolled: number;
    coursesCompleted: number;
    overallProgress: number; // 0-100
    xpEarned: number;
    badgesEarned: number;
  };

  currentFocus: {
    courseId: string;
    courseName: string;
    moduleId: string;
    moduleName: string;
    lessonId: string;
    lessonName: string;
    progress: number;
  } | null;

  upcomingDeadlines: {
    courseId: string;
    courseName: string;
    taskType: 'quiz' | 'lab' | 'capstone';
    taskName: string;
    dueDate: Date;
  }[];

  recentActivity: {
    type: 'lesson_completed' | 'quiz_passed' | 'badge_earned';
    description: string;
    timestamp: Date;
  }[];
}
```

#### 2. Course Catalog

```typescript
// Get available courses
academy.getCourses.useQuery({ status?: 'enrolled' | 'available' | 'completed' })

// Output:
interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string; // "8 weeks"
  modules: number;
  lessons: number;

  // Student-specific
  enrolled: boolean;
  progress: number; // 0-100
  status: 'not_started' | 'in_progress' | 'completed';
  enrolledAt: Date | null;
  completedAt: Date | null;

  // Course structure
  modulesList: {
    id: string;
    title: string;
    order: number;
    lessons: number;
    progress: number;
    locked: boolean; // Sequential gating
  }[];
}
```

#### 3. Lesson View

```typescript
// Get lesson content
academy.getLesson.useQuery({ lessonId: string })

// Output:
interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  order: number;

  // 4-tab structure
  tabs: {
    theory: {
      slides: {
        id: string;
        order: number;
        content: string; // HTML
        imageUrl: string | null;
      }[];
      seniorContext: string; // Sidebar content
    };

    demo: {
      videoUrl: string;
      duration: number; // seconds
      transcript: string | null;
    };

    verify: {
      quizId: string;
      passingScore: number; // 80
      questions: {
        id: string;
        question: string;
        type: 'multiple_choice' | 'true_false';
        options: string[];
        correctAnswer?: string; // Only after submission
      }[];
    };

    build: {
      labId: string;
      instructions: string; // HTML
      userStory: string;
      acceptanceCriteria: string[];
      rubric: {
        criteria: string;
        points: number;
      }[];
    };
  };

  // Progress
  completion: {
    theoryCompleted: boolean;
    demoCompleted: boolean;
    verifyCompleted: boolean;
    buildCompleted: boolean;
  };

  // Next lesson
  nextLessonId: string | null;
  nextLessonLocked: boolean;
}


// Complete theory tab
academy.completeTheory.useMutation()

// Input:
{
  lessonId: string;
}

// Output:
{
  success: true,
  data: {
    lessonId: string;
    theoryCompleted: true;
    demoUnlocked: true;
  }
}


// Complete demo tab (video watch)
academy.completeDemo.useMutation()

// Input:
{
  lessonId: string;
  watchDuration: number; // seconds watched
}

// Validation:
// - watchDuration >= 80% of video duration

// Output:
{
  success: true,
  data: {
    demoCompleted: true;
    verifyUnlocked: true;
  }
}


// Submit quiz
academy.submitQuiz.useMutation()

// Input:
{
  quizId: string;
  answers: {
    questionId: string;
    answer: string;
  }[];
}

// Output:
{
  success: true,
  data: {
    score: number; // 0-100
    passed: boolean; // score >= passingScore
    correctCount: number;
    totalQuestions: number;
    results: {
      questionId: string;
      correct: boolean;
      correctAnswer: string;
    }[];
    buildUnlocked: boolean; // if passed
  }
}


// Submit lab
academy.submitLab.useMutation()

// Input:
{
  labId: string;
  submissionText: string; // Code or writeup
  fileUrls: string[]; // Uploaded to Supabase Storage
}

// Output:
{
  success: true,
  data: {
    submissionId: string;
    status: 'pending_grading';
    submittedAt: Date;
    aiReview: {
      score: number; // AI-suggested score
      feedback: string;
      suggestions: string[];
    };
  }
}
```

#### 4. Persona & Blueprint

```typescript
// Get my persona (resume)
academy.getMyPersona.useQuery()

// Output:
interface Persona {
  id: string;
  studentId: string;

  // Assumed persona
  assumedName: string; // "John Senior"
  assumedTitle: string; // "Senior Guidewire PolicyCenter Developer"
  assumedExperience: number; // years
  assumedSkills: string[];

  // Resume sections
  summary: string;
  experience: {
    company: string;
    title: string;
    duration: string;
    responsibilities: string[];
  }[];
  education: {
    school: string;
    degree: string;
    year: number;
  }[];
  certifications: string[];

  // Generated from Academy progress
  projects: {
    name: string;
    description: string;
    technologies: string[];
    completedAt: Date;
  }[];
}


// Get my blueprint (portfolio)
academy.getMyBlueprint.useQuery()

// Output:
interface Blueprint {
  id: string;
  studentId: string;
  items: {
    id: string;
    type: 'lab' | 'capstone' | 'project';
    title: string;
    description: string;
    technicalSpecs: string[];
    codeUrl: string | null; // GitHub link
    demoUrl: string | null;
    completedAt: Date;
  }[];
}
```

---

## Academy Admin APIs

### Router: `academyAdmin` (Trainer-facing)

#### 1. Course Management

```typescript
// Get all courses (admin view)
academyAdmin.getCourses.useQuery({ status?: 'published' | 'draft' })

// Output:
interface AdminCourse {
  id: string;
  title: string;
  status: 'draft' | 'published';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  stats: {
    totalModules: number;
    totalLessons: number;
    enrolledStudents: number;
    completionRate: number; // %
  };
}


// Create course
academyAdmin.createCourse.useMutation()

// Input:
{
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string; // "8 weeks"
}

// Output:
{
  success: true,
  data: {
    courseId: string;
    status: 'draft';
  }
}


// Add module to course
academyAdmin.addModule.useMutation()

// Input:
{
  courseId: string;
  title: string;
  description: string;
  order: number;
}


// Add lesson to module
academyAdmin.addLesson.useMutation()

// Input:
{
  moduleId: string;
  title: string;
  order: number;

  // Theory tab
  theory: {
    slides: {
      order: number;
      content: string; // HTML
      imageUrl?: string;
    }[];
    seniorContext: string;
  };

  // Demo tab
  demo: {
    videoUrl: string;
    duration: number;
    transcript?: string;
  };

  // Verify tab
  verify: {
    passingScore: number;
    questions: {
      question: string;
      type: 'multiple_choice' | 'true_false';
      options: string[];
      correctAnswer: string;
    }[];
  };

  // Build tab
  build: {
    instructions: string;
    userStory: string;
    acceptanceCriteria: string[];
    rubric: {
      criteria: string;
      points: number;
    }[];
  };
}


// Publish course
academyAdmin.publishCourse.useMutation()

// Input:
{
  courseId: string;
}

// Validation:
// - Course must have at least 1 module
// - Each module must have at least 1 lesson
// - All lessons must have all 4 tabs completed

// Output:
{
  success: true,
  data: {
    courseId: string;
    status: 'published';
    publishedAt: Date;
  }
}
```

#### 2. Student Tracking

```typescript
// Get students list
academyAdmin.getStudents.useQuery({
  cohort?: string;
  status?: 'active' | 'completed' | 'at_risk' | 'dropped';
  search?: string;
})

// Output:
interface Student {
  id: string;
  name: string;
  email: string;
  cohort: string;
  enrolledDate: Date;
  status: 'active' | 'completed' | 'at_risk' | 'dropped';

  progress: {
    overallProgress: number; // 0-100
    coursesCompleted: number;
    coursesInProgress: number;
  };

  performance: {
    avgQuizScore: number;
    labsSubmitted: number;
    labsPending: number;
    labsGraded: number;
  };

  aiInsights: {
    atRisk: boolean;
    reason: string | null; // "Low quiz scores (40% avg), 2 weeks behind"
  };
}


// Get student detail
academyAdmin.getStudentDetail.useQuery({ studentId: string })

// Output:
interface StudentDetail extends Student {
  // Courses
  enrollments: {
    courseId: string;
    courseName: string;
    progress: number;
    status: 'not_started' | 'in_progress' | 'completed';
    enrolledAt: Date;
    completedAt: Date | null;
  }[];

  // Quiz performance
  quizzes: {
    quizId: string;
    lessonName: string;
    score: number;
    passed: boolean;
    attemptedAt: Date;
  }[];

  // Lab submissions
  labs: {
    submissionId: string;
    labName: string;
    submittedAt: Date;
    status: 'pending' | 'graded';
    score: number | null;
    feedback: string | null;
  }[];

  // AI Mentor interactions
  aiMentorSessions: {
    sessionId: string;
    topic: string;
    messageCount: number;
    lastMessage: Date;
  }[];

  // Activity timeline
  activity: {
    type: 'lesson_completed' | 'quiz_attempted' | 'lab_submitted' | 'badge_earned';
    description: string;
    timestamp: Date;
  }[];
}


// Flag student as at-risk
academyAdmin.flagStudentAtRisk.useMutation()

// Input:
{
  studentId: string;
  reason: string;
  interventionPlan?: string;
}

// Side effects:
// - Sends notification to student
// - Sends notification to assigned trainer
// - AI Mentor adjusts approach (more supportive)
```

#### 3. Grading

```typescript
// Get pending submissions
academyAdmin.getPendingSubmissions.useQuery({
  courseId?: string;
  moduleId?: string;
})

// Output:
interface PendingSubmission {
  submissionId: string;
  studentId: string;
  studentName: string;
  labId: string;
  labName: string;
  submittedAt: Date;
  aiSuggestedScore: number;
  aiFeedback: string;
}


// Get submission detail
academyAdmin.getSubmissionDetail.useQuery({ submissionId: string })

// Output:
interface SubmissionDetail {
  submissionId: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  lab: {
    id: string;
    title: string;
    instructions: string;
    rubric: {
      criteria: string;
      points: number;
    }[];
  };
  submission: {
    text: string;
    fileUrls: string[];
    submittedAt: Date;
  };
  aiReview: {
    score: number;
    feedback: string;
    suggestions: string[];
    rubricScores: {
      criteria: string;
      score: number;
      maxPoints: number;
      comment: string;
    }[];
  };
}


// Grade submission
academyAdmin.gradeSubmission.useMutation()

// Input:
{
  submissionId: string;
  score: number; // 0-100
  feedback: string;
  rubricScores: {
    criteria: string;
    score: number;
  }[];
  overrideAI?: boolean; // true if trainer disagrees with AI grade
}

// Output:
{
  success: true,
  data: {
    submissionId: string;
    status: 'graded';
    score: number;
    gradedAt: Date;
  }
}

// Side effects:
// - Updates student_progress
// - Sends notification to student
// - Unlocks next lesson if score >= passing
```

---

## Client Portal APIs

### Router: `clients`

#### 1. Client Management

```typescript
// Get clients list
clients.getClients.useQuery({
  status?: 'active' | 'inactive' | 'lost';
  accountManagerId?: string;
  search?: string;
})

// Output:
interface Client {
  id: string;
  name: string;
  logo: string | null;
  status: 'active' | 'inactive' | 'lost';

  accountManager: {
    id: string;
    name: string;
    podName: string;
  };

  stats: {
    activeProjects: number;
    monthlyRevenue: number;
    totalPlacements: number;
    healthScore: number; // 0-100 (AI-calculated)
  };

  industry: string;
  size: string;
  contractType: 'MSA' | 'SOW' | 'Staffing Agreement';
  billingTerms: 'Net 30' | 'Net 45' | 'Net 60';
  lastContact: Date;
  nextReview: Date;
}


// Get client detail
clients.getClientDetail.useQuery({ clientId: string })

// Output:
interface ClientDetail extends Client {
  contacts: {
    id: string;
    name: string;
    title: string;
    email: string;
    phone: string;
    isPrimary: boolean;
  }[];

  contract: {
    id: string;
    type: string;
    signedDate: Date;
    expiresDate: Date;
    fileUrl: string;
  };

  activeProjects: {
    id: string;
    title: string;
    consultant: {
      id: string;
      name: string;
    };
    rate: number; // per hour
    startDate: Date;
    endDate: Date | null;
    monthlyRevenue: number;
  }[];

  pipeline: {
    id: string;
    jobTitle: string;
    status: 'open' | 'submitted' | 'interviewing';
    priority: 'hot' | 'warm' | 'cold';
    submittedCount: number;
  }[];

  invoices: {
    id: string;
    period: string; // "Nov 2025"
    amount: number;
    dueDate: Date;
    status: 'pending' | 'sent' | 'paid' | 'overdue';
  }[];

  healthScore: {
    score: number;
    factors: {
      recentPlacements: number; // impact: +/-
      paymentHistory: number;
      projectCount: number;
      satisfaction: number;
    };
    insights: string[]; // AI-generated
  };

  activity: {
    type: 'project_started' | 'invoice_paid' | 'placement_made' | 'contact_added';
    description: string;
    timestamp: Date;
  }[];
}


// Create client
clients.createClient.useMutation()

// Input:
{
  name: string;
  industry: string;
  size: string;
  accountManagerId: string;
  contractType: 'MSA' | 'SOW' | 'Staffing Agreement';
  billingTerms: 'Net 30' | 'Net 45' | 'Net 60';

  primaryContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
}


// Update client
clients.updateClient.useMutation()

// Input:
{
  clientId: string;
  updates: Partial<{
    name: string;
    accountManagerId: string;
    status: 'active' | 'inactive' | 'lost';
    billingTerms: string;
  }>;
}
```

#### 2. Project Management

```typescript
// Create project
clients.createProject.useMutation()

// Input:
{
  clientId: string;
  jobId?: string; // Link to job from Job Board
  title: string;
  consultantId: string;
  billRate: number; // per hour
  payRate: number; // what consultant is paid
  startDate: Date;
  endDate?: Date;
  duration?: string; // "6 months"
  type: 'contract' | 'contract_to_hire' | 'permanent';
}

// Output:
{
  success: true,
  data: {
    projectId: string;
    margin: number; // billRate - payRate
    monthlyRevenue: number; // estimated
  }
}


// Get project detail
clients.getProjectDetail.useQuery({ projectId: string })

// Output:
interface Project {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  status: 'active' | 'on_hold' | 'extended' | 'completed' | 'cancelled';

  consultant: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };

  financials: {
    billRate: number;
    payRate: number;
    margin: number;
    marginPercent: number;
    hoursThisWeek: number;
    hoursTotal: number;
    revenueThisMonth: number;
    revenueTotal: number;
  };

  timeline: {
    startDate: Date;
    endDate: Date | null;
    duration: string;
    daysActive: number;
  };

  performance: {
    clientSatisfaction: number; // 1-5 stars
    lastCheckIn: Date;
    nextReview: Date;
  };

  documents: {
    id: string;
    name: string; // "SOW.pdf"
    uploadedAt: Date;
    url: string;
  }[];

  notes: {
    id: string;
    createdBy: string;
    content: string;
    createdAt: Date;
  }[];

  alerts: {
    type: 'renewal_due' | 'performance_issue' | 'hours_low';
    message: string;
  }[];
}


// Update project status
clients.updateProjectStatus.useMutation()

// Input:
{
  projectId: string;
  status: 'active' | 'on_hold' | 'extended' | 'completed' | 'cancelled';
  reason?: string;
  newEndDate?: Date; // if extended
}


// Add client satisfaction rating
clients.addSatisfactionRating.useMutation()

// Input:
{
  projectId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  recordedAt: Date;
}
```

#### 3. Invoicing

```typescript
// Get invoices
clients.getInvoices.useQuery({
  clientId?: string;
  status?: 'pending' | 'sent' | 'paid' | 'overdue';
  period?: string; // "Nov 2025"
})

// Output:
interface Invoice {
  id: string;
  invoiceNumber: string; // "INV-001025"
  clientId: string;
  clientName: string;
  period: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'sent' | 'paid' | 'overdue';
  sentAt: Date | null;
  paidAt: Date | null;

  lineItems: {
    projectId: string;
    projectName: string;
    consultantName: string;
    hours: number;
    rate: number;
    subtotal: number;
  }[];
}


// Generate invoice (auto-calculates from project hours)
clients.generateInvoice.useMutation()

// Input:
{
  clientId: string;
  period: string; // "Nov 2025"
  dueDate: Date;
}

// Logic:
// - Fetch all active projects for client
// - Calculate hours from timesheets (period)
// - Calculate amount per project (hours * billRate)
// - Generate PDF

// Output:
{
  success: true,
  data: {
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    pdfUrl: string; // Supabase Storage
  }
}


// Send invoice
clients.sendInvoice.useMutation()

// Input:
{
  invoiceId: string;
  emailTo: string[]; // Client contacts
}

// Side effects:
// - Sends email with PDF attachment
// - Updates status to 'sent'
// - Creates activity record


// Mark invoice as paid
clients.markInvoicePaid.useMutation()

// Input:
{
  invoiceId: string;
  paidDate: Date;
  paymentMethod?: string; // "ACH", "Check #1234"
}
```

---

## Shared Boards APIs

### Router: `shared`

#### 1. Talent Board

```typescript
// Get talent board
shared.getTalentBoard.useQuery({
  status?: TalentStatus[];
  skills?: string[];
  ownerId?: string;
  podId?: string;
  search?: string;
  aiScoreMin?: number; // 0-100
  pagination: PaginationInput;
})

// Output:
{
  success: true,
  data: {
    candidates: Candidate[];
    meta: PaginationMeta;
  }
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pipeline' | 'contacted' | 'qualified' | 'academy_candidate' | 'student' | 'graduate' | 'bench' | 'placed' | 'alumni';
  source: 'LinkedIn' | 'Referral' | 'Job Board' | 'Academy Application';

  skills: string[];
  experience: number; // years
  availability: 'Immediate' | 'Available in 2 weeks' | 'Academy Student' | 'On Assignment';
  location: string;
  visaStatus: 'US Citizen' | 'Green Card' | 'H-1B' | 'OPT' | 'Needs Sponsorship';

  resumeUrl: string;
  aiScore: number; // 0-100

  owner: {
    id: string;
    name: string;
    podName: string;
  };

  tags: string[]; // ['Hot Lead', 'Senior', 'Visa Required']

  lastContact: Date;
  nextFollowUp: Date | null;

  createdAt: Date;
  updatedAt: Date;
}


// Create candidate
shared.createCandidate.useMutation()

// Input:
{
  name: string;
  email: string;
  phone: string;
  source: 'LinkedIn' | 'Referral' | 'Job Board' | 'Academy Application';
  skills: string[];
  experience: number;
  location: string;
  visaStatus: string;
  resumeUrl?: string;
  notes?: string;
}

// Side effects:
// - Uploads resume to Supabase Storage
// - AI scores resume
// - Sets owner to current user
// - Creates activity record


// Update candidate status (drag-and-drop)
shared.updateCandidateStatus.useMutation()

// Input:
{
  candidateId: string;
  newStatus: TalentStatus;
  notes?: string;
}

// Side effects:
// - Updates candidate status
// - Creates activity record
// - If status = 'academy_candidate', triggers enrollment flow
// - If status = 'graduate', adds to bench pool
// - Real-time update to all connected clients (WebSocket)


// Assign candidate owner
shared.assignCandidateOwner.useMutation()

// Input:
{
  candidateId: string;
  newOwnerId: string;
}


// Add tag to candidate
shared.addCandidateTag.useMutation()

// Input:
{
  candidateId: string;
  tag: string;
}
```

#### 2. Job Board

```typescript
// Get job board
shared.getJobBoard.useQuery({
  status?: JobStatus[];
  clientId?: string;
  ownerId?: string;
  podId?: string;
  skills?: string[];
  search?: string;
  priority?: 'hot' | 'warm' | 'cold';
  pagination: PaginationInput;
})

// Output:
{
  success: true,
  data: {
    jobs: Job[];
    meta: PaginationMeta;
  }
}

interface Job {
  id: string;
  title: string;
  client: {
    id: string;
    name: string;
    logo: string | null;
  };
  location: string;
  type: 'Contract' | 'Contract-to-Hire' | 'Permanent';
  duration: string | null;
  rate: {
    min: number;
    max: number;
    currency: 'USD';
  };
  status: 'open' | 'submitted' | 'interviewing' | 'offer' | 'filled' | 'cancelled';

  requiredSkills: string[];
  niceToHave: string[];
  description: string;

  owner: {
    id: string;
    name: string;
    podName: string;
  };

  claimedBy: {
    id: string;
    name: string;
    podName: string;
  }[]; // Other pods working this job

  stats: {
    submittedCount: number;
    interviewCount: number;
    aiMatchCount: number; // Candidates in Talent Board that match
  };

  priority: 'hot' | 'warm' | 'cold';
  fillByDate: Date;
  createdAt: Date;
}


// Create job
shared.createJob.useMutation()

// Input:
{
  title: string;
  clientId: string;
  location: string;
  type: 'Contract' | 'Contract-to-Hire' | 'Permanent';
  duration?: string;
  rateMin: number;
  rateMax: number;
  requiredSkills: string[];
  niceToHave?: string[];
  description: string;
  priority: 'hot' | 'warm' | 'cold';
  fillByDate: Date;
}

// Side effects:
// - Sets owner to current user
// - AI matches candidates from Talent Board
// - Creates activity record
// - Sends notification to all pods (new job available)


// Claim job (pod wants to work on it)
shared.claimJob.useMutation()

// Input:
{
  jobId: string;
}

// Logic:
// - Adds current user's pod to claimedBy array
// - Multiple pods can work same job
// - Prevents duplicate submissions from same pod

// Output:
{
  success: true,
  data: {
    jobId: string;
    claimedBy: string[]; // Updated list
  }
}


// Update job status
shared.updateJobStatus.useMutation()

// Input:
{
  jobId: string;
  newStatus: JobStatus;
  reason?: string;
}
```

#### 3. Combined View & Matching

```typescript
// Get AI-matched candidates for job
shared.getMatchesForJob.useQuery({
  jobId: string;
  limit?: number; // default: 10
})

// Output:
{
  success: true,
  data: {
    jobId: string;
    matches: {
      candidate: Candidate;
      matchScore: number; // 0-100
      matchReasons: {
        skillsMatch: number; // % of required skills matched
        experienceMatch: boolean;
        availabilityMatch: boolean;
        locationMatch: boolean;
        visaMatch: boolean;
      };
      aiExplanation: string; // "Strong match: 8+ years Java, PolicyCenter 10, immediate availability"
    }[];
  }
}


// Get AI-matched jobs for candidate
shared.getMatchesForCandidate.useQuery({
  candidateId: string;
  limit?: number;
})

// Output:
{
  success: true,
  data: {
    candidateId: string;
    matches: {
      job: Job;
      matchScore: number;
      matchReasons: {
        skillsMatch: number;
        experienceMatch: boolean;
        rateMatch: boolean;
        locationMatch: boolean;
      };
      aiExplanation: string;
    }[];
  }
}


// Submit candidate to job
shared.submitCandidateToJob.useMutation()

// Input:
{
  candidateId: string;
  jobId: string;
  candidateProfile: string; // AI-generated or custom
  coverLetter: string;
  rateExpectation: number;
  availabilityDate: Date;
  notes?: string;
}

// Validation:
// - Cannot submit same candidate to same job twice
// - Job must be 'open' status
// - Candidate must be 'qualified', 'graduate', or 'bench' status

// Output:
{
  success: true,
  data: {
    submissionId: string;
    status: 'submitted';
    submittedAt: Date;
  }
}

// Side effects:
// - Creates submission record
// - Updates job submittedCount
// - Sends notification to account manager
// - Creates activity for both job and candidate
// - Real-time update to all clients


// Get submission detail
shared.getSubmissionDetail.useQuery({ submissionId: string })

// Output:
interface Submission {
  id: string;
  candidate: Candidate;
  job: Job;
  submittedBy: {
    id: string;
    name: string;
    podName: string;
  };

  profile: string;
  coverLetter: string;
  rateExpectation: number;
  availabilityDate: Date;
  notes: string;

  status: 'submitted' | 'reviewing' | 'interviewing' | 'offer' | 'rejected' | 'placed';
  submittedAt: Date;

  timeline: {
    type: 'submitted' | 'client_reviewed' | 'interview_scheduled' | 'offer_made' | 'rejected';
    description: string;
    timestamp: Date;
  }[];
}


// Update submission status
shared.updateSubmissionStatus.useMutation()

// Input:
{
  submissionId: string;
  newStatus: SubmissionStatus;
  notes?: string;
}
```

---

## Pod Workflows APIs

### Router: `recruiting`

```typescript
// Get recruiting dashboard
recruiting.getDashboard.useQuery()

// Output:
interface RecruitingDashboard {
  podStats: {
    podId: string;
    podName: string;
    sprintGoal: number; // 2 placements
    sprintProgress: number; // 1 placement
    ytdPlacements: number;
    ytdRevenue: number;
  };

  hotReqs: {
    jobId: string;
    title: string;
    clientName: string;
    fillByDate: Date;
    daysRemaining: number;
    submittedCount: number;
  }[];

  myClients: {
    clientId: string;
    clientName: string;
    healthScore: number;
    activeProjects: number;
  }[];

  pipeline: {
    status: 'submitted' | 'interviewing' | 'offer';
    count: number;
  }[];

  aiInsights: string[];
}


// Get my clients
recruiting.getMyClients.useQuery()

// Returns: same as clients.getClients but filtered to current user


// Get my submissions
recruiting.getMySubmissions.useQuery({ status?: SubmissionStatus })

// Output:
{
  success: true,
  data: Submission[]
}
```

### Router: `bench`

```typescript
// Get bench dashboard
bench.getDashboard.useQuery()

// Output:
interface BenchDashboard {
  podStats: {
    podId: string;
    podName: string;
    sprintGoal: number;
    sprintProgress: number;
    ytdPlacements: number;
    ytdRevenue: number;
    commission: number;
  };

  availableConsultants: {
    candidateId: string;
    name: string;
    skills: string[];
    daysOnBench: number;
    aiMatchCount: number; // Jobs matched
  }[];

  longTermBench: {
    candidateId: string;
    name: string;
    daysOnBench: number;
    recommendedActions: string[]; // ["Assign training", "Upskill in AWS"]
  }[];

  outreachStats: {
    thisWeek: number;
    responded: number;
    responseRate: number;
  };
}


// Get bench console (detailed view)
bench.getBenchConsole.useQuery()

// Output:
{
  success: true,
  data: {
    consultants: {
      id: string;
      name: string;
      skills: string[];
      experience: number;
      availability: 'Immediate' | 'Available in 2 weeks' | 'Academy Student';
      daysOnBench: number;
      upskilling: {
        courseId: string;
        courseName: string;
        progress: number;
      }[];
      recentOutreach: {
        clientName: string;
        date: Date;
        status: 'sent' | 'responded' | 'interview_scheduled';
      }[];
      aiMatches: {
        jobId: string;
        jobTitle: string;
        clientName: string;
        matchScore: number;
      }[];
    }[];
  }
}


// Track outreach
bench.trackOutreach.useMutation()

// Input:
{
  consultantId: string;
  clientId: string;
  method: 'email' | 'phone' | 'linkedin';
  notes: string;
}
```

### Router: `ta`

```typescript
// Get TA dashboard
ta.getDashboard.useQuery()

// Output:
interface TADashboard {
  podStats: {
    podId: string;
    podName: string;
    monthlyGoal: number; // 100 warm leads
    monthlyProgress: number;
    ytdLeads: number;
  };

  activeCampaigns: {
    id: string;
    name: string; // "LinkedIn - Guidewire Developers"
    channel: 'linkedin' | 'email' | 'referral';
    contacted: number;
    responded: number;
    warmLeads: number;
    status: 'active' | 'paused' | 'completed';
  }[];

  warmLeads: {
    candidateId: string;
    name: string;
    skills: string[];
    source: string;
    contactedAt: Date;
    readyForHandoff: boolean;
    handoffType: 'Academy' | 'Recruiting';
  }[];

  aiInsights: string[];
}


// Create campaign
ta.createCampaign.useMutation()

// Input:
{
  name: string;
  channel: 'linkedin' | 'email' | 'referral';
  targetPersona: string; // "Guidewire Developers, 5+ years"
  targetCount: number; // 50
  messageSequence: string[]; // AI-generated or custom
}

// Output:
{
  success: true,
  data: {
    campaignId: string;
    aiGeneratedMessages: string[]; // If messageSequence was empty
  }
}


// Track campaign engagement
ta.trackEngagement.useMutation()

// Input:
{
  campaignId: string;
  candidateId: string;
  event: 'contacted' | 'opened' | 'responded' | 'interested' | 'not_interested';
  notes?: string;
}


// Handoff lead
ta.handoffLead.useMutation()

// Input:
{
  candidateId: string;
  handoffTo: 'Academy' | 'Recruiting';
  notes: string;
}

// Side effects:
// - If Academy: Creates student enrollment
// - If Recruiting: Updates candidate status to 'qualified'
// - Sends notification to receiving pod
// - Creates activity record
```

---

## CEO Dashboard APIs

### Router: `ceo`

```typescript
// Get executive dashboard
ceo.getDashboard.useQuery({ period?: 'sprint' | 'month' | 'quarter' | 'ytd' })

// Output:
interface CEODashboard {
  companyKPIs: {
    revenue: {
      current: number;
      target: number;
      growth: number; // % MoM or YoY
    };
    headcount: {
      employees: number;
      consultants: {
        placed: number;
        bench: number;
      };
    };
    placements: {
      current: number; // this sprint/month
      target: number;
      pods: {
        podId: string;
        podName: string;
        placements: number;
        goal: number;
        percentOfGoal: number;
      }[];
    };
  };

  podScoreboard: {
    podId: string;
    podName: string;
    type: 'recruiting' | 'bench_sales' | 'ta' | 'academy';
    performance: {
      placements?: number; // For recruiting/bench
      warmLeads?: number; // For TA
      graduates?: number; // For academy
      goal: number;
      percentOfGoal: number;
    };
    revenue: number;
    ranking: number; // 1-19
  }[];

  underperformingPods: {
    podId: string;
    podName: string;
    issue: string;
    recommendations: string[];
  }[];

  revenueForecast: {
    months: string[]; // ["Dec 2025", "Jan 2026", "Feb 2026"]
    projected: number[];
    confidence: number; // 0-100
    aiInsights: string[];
  };

  clientHealth: {
    healthy: number; // count
    atRisk: number;
    lost: number;
    topClients: {
      clientId: string;
      clientName: string;
      monthlyRevenue: number;
      healthScore: number;
    }[];
  };

  strategicInsights: {
    type: 'opportunity' | 'risk' | 'recommendation';
    priority: 'high' | 'medium' | 'low';
    message: string;
    actionable: boolean;
    action?: string; // "Schedule renewal meeting with Acme Insurance"
  }[];
}


// Get pod performance detail
ceo.getPodPerformance.useQuery({ podId: string; period?: string })

// Output:
interface PodPerformance {
  pod: {
    id: string;
    name: string;
    type: string;
    members: {
      id: string;
      name: string;
      role: 'senior' | 'junior';
    }[];
  };

  metrics: {
    placements: number;
    revenue: number;
    pipeline: {
      submitted: number;
      interviewing: number;
      offers: number;
    };
    conversion: {
      submissionToInterview: number; // %
      interviewToOffer: number;
      offerToPlacement: number;
    };
  };

  trend: {
    dates: string[];
    placements: number[];
    revenue: number[];
  };

  aiInsights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}


// Get financial forecast
ceo.getFinancialForecast.useQuery({ months?: number }) // default: 3

// Output:
{
  success: true,
  data: {
    forecast: {
      month: string;
      projectedRevenue: number;
      projectedExpenses: number;
      projectedProfit: number;
      confidence: number;
      factors: {
        activePlacements: number;
        pipelineValue: number;
        historicalTrend: string;
        seasonality: string;
      };
    }[];
    insights: string[];
  }
}
```

---

## Admin Panel APIs

### Router: `admin`

#### 1. User Management

```typescript
// Get all users
admin.getUsers.useQuery({
  status?: 'active' | 'inactive';
  role?: string;
  podId?: string;
  search?: string;
})

// Output:
interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  status: 'active' | 'inactive';

  roles: {
    id: string;
    name: string; // 'recruiter', 'senior_account_manager'
  }[];

  pod: {
    id: string;
    name: string;
  } | null;

  createdAt: Date;
  lastLoginAt: Date | null;
}


// Create user
admin.createUser.useMutation()

// Input:
{
  email: string;
  name: string;
  roleIds: string[];
  podId: string | null;
}

// Side effects:
// - Creates Supabase Auth user
// - Generates temporary password
// - Creates user_profiles record
// - Creates user_roles records
// - Sends welcome email

// Output:
{
  success: true,
  data: {
    userId: string;
    temporaryPassword: string;
  }
}


// Update user
admin.updateUser.useMutation()

// Input:
{
  userId: string;
  updates: {
    name?: string;
    roleIds?: string[];
    podId?: string | null;
    status?: 'active' | 'inactive';
  };
}


// Reset password
admin.resetUserPassword.useMutation()

// Input:
{
  userId: string;
}

// Output:
{
  success: true,
  data: {
    temporaryPassword: string;
  }
}

// Side effects:
// - Sends email to user with temp password
// - Forces password change on next login
```

#### 2. Roles & Permissions

```typescript
// Get all roles
admin.getRoles.useQuery()

// Output:
interface Role {
  id: string;
  name: string; // 'recruiter'
  displayName: string; // 'Recruiter'
  description: string;
  permissions: {
    module: string; // 'shared.talentBoard'
    action: 'view' | 'edit' | 'create' | 'delete' | 'admin';
  }[];
  userCount: number; // How many users have this role
}


// Create role
admin.createRole.useMutation()

// Input:
{
  name: string;
  displayName: string;
  description: string;
  permissions: {
    module: string;
    action: string;
  }[];
}


// Update role permissions
admin.updateRolePermissions.useMutation()

// Input:
{
  roleId: string;
  permissions: {
    module: string;
    action: string;
  }[];
}

// Validation:
// - Cannot remove permissions from 'admin' role
// - Cannot delete 'admin' role
```

#### 3. Audit Logs

```typescript
// Get audit logs
admin.getAuditLogs.useQuery({
  userId?: string;
  action?: string;
  module?: string;
  startDate?: Date;
  endDate?: Date;
  pagination: PaginationInput;
})

// Output:
{
  success: true,
  data: {
    logs: {
      id: string;
      userId: string;
      userName: string;
      action: string; // 'user.created', 'client.updated', 'job.submitted'
      module: string; // 'admin', 'clients', 'shared'
      entityType: string; // 'user', 'client', 'job'
      entityId: string;
      details: Record<string, unknown>; // What changed
      ipAddress: string;
      userAgent: string;
      timestamp: Date;
    }[];
    meta: PaginationMeta;
  }
}
```

---

## AI Twin APIs

### Router: `ai`

#### 1. Chat

```typescript
// Send message to AI Twin
ai.chat.useMutation()

// Input:
{
  message: string;
  context?: {
    module?: string; // 'recruiting', 'bench', 'academy'
    entityId?: string; // candidateId, jobId, etc.
    entityType?: string; // 'candidate', 'job', 'student'
  };
}

// Output:
{
  success: true,
  data: {
    response: string;
    suggestions: string[]; // Quick action buttons
    data?: unknown; // Structured data if relevant (e.g., candidate matches)
  }
}

// Examples:
// Input: "Find candidates for job ID abc123"
// Output: { response: "I found 5 matching candidates...", data: [...candidates] }

// Input: "Draft outreach email for John Doe to Acme Insurance"
// Output: { response: "Here's a draft email...", suggestions: ["Send", "Edit", "Cancel"] }


// Get conversation history
ai.getConversationHistory.useQuery({ limit?: number })

// Output:
{
  success: true,
  data: {
    messages: {
      id: string;
      role: 'user' | 'assistant';
      content: string;
      timestamp: Date;
    }[];
  }
}
```

#### 2. Automation

```typescript
// Trigger AI automation
ai.triggerAutomation.useMutation()

// Input:
{
  type: 'find_candidates' | 'draft_email' | 'score_resume' | 'match_jobs' | 'generate_report';
  input: {
    // For find_candidates:
    jobId?: string;
    skills?: string[];

    // For draft_email:
    templateType?: 'outreach' | 'follow_up' | 'submission';
    candidateId?: string;
    clientId?: string;

    // For score_resume:
    resumeUrl?: string;
    jobRequirements?: string;

    // etc.
  };
}

// Output:
{
  success: true,
  data: {
    result: unknown; // Depends on automation type
  }
}
```

---

## Notification APIs

### Router: `notifications`

#### 1. Get Notifications

```typescript
// Get my notifications
notifications.getNotifications.useQuery({
  status?: 'unread' | 'read' | 'all';
  type?: 'approval' | 'celebration' | 'alert' | 'info';
  pagination: PaginationInput;
})

// Output:
{
  success: true,
  data: {
    notifications: {
      id: string;
      type: 'approval' | 'celebration' | 'alert' | 'info';
      title: string;
      message: string;
      actionUrl: string | null; // Link to relevant page
      read: boolean;
      createdAt: Date;
    }[];
    meta: PaginationMeta;
    unreadCount: number;
  }
}


// Mark as read
notifications.markAsRead.useMutation()

// Input:
{
  notificationIds: string[];
}


// Mark all as read
notifications.markAllAsRead.useMutation()

// Input: none
```

---

## Real-time Subscriptions

### Using Supabase Real-time

```typescript
// Subscribe to Talent Board updates
const subscription = supabase
  .channel('talent-board')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'candidates',
  }, (payload) => {
    // payload.new = updated candidate
    // Refresh Talent Board UI
  })
  .subscribe();

// Subscribe to Job Board updates
const subscription = supabase
  .channel('job-board')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'jobs',
  }, (payload) => {
    // Refresh Job Board UI
  })
  .subscribe();

// Subscribe to notifications
const subscription = supabase
  .channel(`notifications:${userId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // Show toast notification
    // Update notification badge count
  })
  .subscribe();

// Subscribe to celebrations (all users)
const subscription = supabase
  .channel('celebrations')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'celebrations',
  }, (payload) => {
    // Trigger confetti
    // Show toast
    // Play sound
  })
  .subscribe();
```

---

## API Usage Examples

### Frontend tRPC Usage

```typescript
// In React component
import { trpc } from '@/lib/trpc/client';

// Query (GET data)
const MyComponent = () => {
  const { data, isLoading, error } = trpc.hr.getPendingApprovals.useQuery();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data.timesheets.map(timesheet => (
        <TimesheetCard key={timesheet.id} timesheet={timesheet} />
      ))}
    </div>
  );
};

// Mutation (POST/PUT/DELETE)
const SubmitTimesheetButton = () => {
  const mutation = trpc.hr.submitTimesheet.useMutation();

  const handleSubmit = async () => {
    try {
      const result = await mutation.mutateAsync({
        weekEnding: new Date('2025-12-05'),
        entries: [
          { date: new Date('2025-12-01'), hours: 8, description: 'Client work' },
          // ...
        ],
      });

      toast.success(`Timesheet submitted! ID: ${result.data.timesheetId}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <button onClick={handleSubmit} disabled={mutation.isLoading}>
      {mutation.isLoading ? 'Submitting...' : 'Submit Timesheet'}
    </button>
  );
};
```

---

## Error Handling Best Practices

```typescript
// Backend (tRPC router)
export const hrRouter = router({
  approveTimesheet: protectedProcedure
    .input(z.object({
      timesheetId: z.string(),
      comments: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Validate user is manager
      const timesheet = await db.timesheets.findById(input.timesheetId);
      if (!timesheet) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Timesheet not found',
        });
      }

      if (timesheet.managerId !== ctx.user.id && !ctx.user.roles.includes('hr_admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not authorized to approve this timesheet',
        });
      }

      // Update timesheet
      const updated = await db.timesheets.update(input.timesheetId, {
        status: 'approved',
        approvedBy: ctx.user.id,
        approvedAt: new Date(),
        comments: input.comments,
      });

      // Send notification
      await notifications.create({
        userId: timesheet.employeeId,
        type: 'approval',
        title: 'Timesheet Approved',
        message: `Your timesheet for ${timesheet.weekEnding} was approved`,
      });

      return {
        success: true,
        data: updated,
      };
    }),
});

// Frontend
const { mutateAsync, error } = trpc.hr.approveTimesheet.useMutation();

if (error) {
  // error.data.code = 'FORBIDDEN'
  // error.message = 'You are not authorized...'
  if (error.data?.code === 'FORBIDDEN') {
    toast.error('Access denied');
  } else {
    toast.error(error.message);
  }
}
```

---

## Performance Optimization

### Pagination

```typescript
// Always paginate large lists
shared.getTalentBoard.useQuery({
  pagination: {
    page: 1,
    limit: 50,
  }
});

// Backend implements cursor-based pagination for real-time data
```

### Caching

```typescript
// tRPC automatically caches queries
// Use staleTime and cacheTime to control freshness

trpc.academy.getCourses.useQuery(undefined, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### Optimistic Updates

```typescript
const utils = trpc.useContext();

const mutation = trpc.shared.updateCandidateStatus.useMutation({
  onMutate: async (newStatus) => {
    // Cancel outgoing queries
    await utils.shared.getTalentBoard.cancel();

    // Snapshot previous value
    const previous = utils.shared.getTalentBoard.getData();

    // Optimistically update
    utils.shared.getTalentBoard.setData(undefined, (old) => {
      return old?.map(candidate =>
        candidate.id === newStatus.candidateId
          ? { ...candidate, status: newStatus.newStatus }
          : candidate
      );
    });

    return { previous };
  },

  onError: (err, newStatus, context) => {
    // Rollback on error
    utils.shared.getTalentBoard.setData(undefined, context?.previous);
  },

  onSettled: () => {
    // Refetch after mutation
    utils.shared.getTalentBoard.invalidate();
  },
});
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-23
**Total Endpoints:** 100+
**For:** Frontend & Backend Teams
**API Framework:** tRPC (Type-safe)
**Authentication:** Supabase Auth
**Real-time:** Supabase Real-time

**Next Steps:**
1. Backend team implements routers
2. Frontend team builds UI with mock data
3. Integration: Swap mocks for real API calls
4. Testing: E2E tests for all endpoints
5. Production: Deploy and monitor
