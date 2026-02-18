// ============================================================
// Guidewire Developer Training - Full Curriculum
// 14 Chapters, ~160 Lessons, 276 Videos, 159 Assignments
// ============================================================

import type { Chapter, LessonMeta, ChapterPhase } from './types'

// --- Chapter Definitions ---

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: 'Guidewire Cloud Overview',
    slug: 'ch01',
    description: 'Introduction to the Guidewire Cloud platform, architecture, and deployment model.',
    weekRange: 'Week 1',
    phase: 'foundation',
    totalLessons: 1,
  },
  {
    id: 2,
    title: 'Surepath Overview',
    slug: 'ch02',
    description: 'SurePath delivery methodology, Cloud Standards, enablement collateral, pre-built solutions, and the Guidewire Project Lifecycle.',
    weekRange: 'Week 1',
    phase: 'foundation',
    totalLessons: 1,
  },
  {
    id: 3,
    title: 'InsuranceSuite Implementation Tools',
    slug: 'ch03',
    description: 'User Story Cards, UI Story Cards, and implementation planning tools used in Guidewire projects.',
    weekRange: 'Week 1',
    phase: 'foundation',
    totalLessons: 1,
    assignmentFolder: 'Resources',
  },
  {
    id: 4,
    title: 'PolicyCenter Introduction',
    slug: 'ch04',
    description: 'Deep dive into PolicyCenter: accounts, policy transactions, product model, coverages, rating, and administration.',
    weekRange: 'Week 2-4',
    phase: 'specialization',
    totalLessons: 31,
    assignmentFolder: 'PolicyCenter Introduction',
  },
  {
    id: 5,
    title: 'ClaimCenter Introduction',
    slug: 'ch05',
    description: 'Comprehensive ClaimCenter training: claims process, intake, financials, contacts, vendors, and workers compensation.',
    weekRange: 'Week 4-5',
    phase: 'specialization',
    totalLessons: 19,
    assignmentFolder: 'ClaimCenter Introduction',
  },
  {
    id: 6,
    title: 'BillingCenter Introduction',
    slug: 'ch06',
    description: 'BillingCenter fundamentals: billing lifecycle, charge invoicing, payments, delinquency, producers, and commissions.',
    weekRange: 'Week 5-6',
    phase: 'specialization',
    totalLessons: 19,
    assignmentFolder: 'BillingCenter Introduction',
  },
  {
    id: 7,
    title: 'InsuranceSuite Developer Fundamentals',
    slug: 'ch07',
    description: 'Core developer skills: data model, UI architecture, Gosu programming, PCF files, validations, and entity management.',
    weekRange: 'Week 6-8',
    phase: 'developer-core',
    totalLessons: 23,
    assignmentFolder: 'InsuranceSuite Fundamentals',
  },
  {
    id: 8,
    title: 'PolicyCenter Configuration',
    slug: 'ch08',
    description: 'Advanced PolicyCenter configuration: data model, job wizards, contacts, revisioning, underwriting, validation, and activities.',
    weekRange: 'Week 8-10',
    phase: 'configuration',
    totalLessons: 14,
    assignmentFolder: 'PolicyCenter Configuration',
  },
  {
    id: 9,
    title: 'ClaimCenter Configuration',
    slug: 'ch09',
    description: 'ClaimCenter configuration: UI customization, LOB, claim intake, Gosu rules, assignment, financials, and permissions.',
    weekRange: 'Week 10-12',
    phase: 'configuration',
    totalLessons: 18,
    assignmentFolder: 'ClaimCenter Configuration',
  },
  {
    id: 10,
    title: 'BillingCenter Configuration',
    slug: 'ch10',
    description: 'BillingCenter configuration: charge invoicing, activities, workflows, payment allocation, delinquency, and commissions.',
    weekRange: 'Week 12-13',
    phase: 'configuration',
    totalLessons: 17,
    assignmentFolder: 'BillingCenter Configuration',
  },
  {
    id: 11,
    title: 'Introduction to Integration',
    slug: 'ch11',
    description: 'InsuranceSuite integration: Gosu for integration, queries, bundles, XML, web services, plugins, messaging, and batch processes.',
    weekRange: 'Week 13-15',
    phase: 'advanced',
    totalLessons: 21,
    assignmentFolder: 'InsuranceSuite Integration',
  },
  {
    id: 12,
    title: 'Advanced Product Designer',
    slug: 'ch12',
    description: 'Advanced Product Designer in PolicyCenter: conceptualizing requirements, modeling products, enhancing and visualizing.',
    weekRange: 'Week 15-16',
    phase: 'advanced',
    totalLessons: 4,
  },
  {
    id: 13,
    title: 'Rating Introduction',
    slug: 'ch13',
    description: 'Rating fundamentals: rate tables, rating algorithms, factor-based rating, and rating engine architecture.',
    weekRange: 'Week 16-17',
    phase: 'advanced',
    totalLessons: 7,
  },
  {
    id: 14,
    title: 'Rating Configuration',
    slug: 'ch14',
    description: 'Rating configuration: rate routines, rate tables, system tables, and advanced rating patterns.',
    weekRange: 'Week 17-18',
    phase: 'advanced',
    totalLessons: 5,
  },
]

// --- Phase groupings for UI ---

export const PHASE_CONFIG: Record<ChapterPhase, { label: string; description: string; color: string }> = {
  'foundation': {
    label: 'Foundation',
    description: 'Core platform understanding',
    color: 'bg-charcoal-100 text-charcoal-700',
  },
  'specialization': {
    label: 'Product Specialization',
    description: 'Deep dive into PC, CC, BC',
    color: 'bg-blue-50 text-blue-700',
  },
  'developer-core': {
    label: 'Developer Core',
    description: 'Essential developer skills',
    color: 'bg-amber-50 text-amber-700',
  },
  'configuration': {
    label: 'Configuration',
    description: 'Advanced product configuration',
    color: 'bg-purple-50 text-purple-700',
  },
  'advanced': {
    label: 'Advanced',
    description: 'Integration, rating, APD',
    color: 'bg-green-50 text-green-700',
  },
}

// --- Split assignment manifest ---
// PDFs that were successfully split into questions + solutions files.
// Generated by scripts/split-assignment-pdfs.py

const SPLIT_ASSIGNMENTS = new Set([
  'ch04/assignment-01', 'ch04/assignment-03', 'ch04/assignment-09', 'ch04/assignment-10',
  'ch04/assignment-11', 'ch04/assignment-13', 'ch04/assignment-15', 'ch04/assignment-24',
  'ch04/assignment-25', 'ch04/assignment-29', 'ch04/assignment-30',
  'ch05/assignment-04', 'ch05/assignment-08', 'ch05/assignment-13',
  'ch05/assignment-17', 'ch05/assignment-19',
  'ch06/assignment-04', 'ch06/assignment-11', 'ch06/assignment-15',
  'ch07/assignment-01', 'ch07/assignment-03', 'ch07/assignment-05', 'ch07/assignment-06',
  'ch07/assignment-07', 'ch07/assignment-08', 'ch07/assignment-09', 'ch07/assignment-10',
  'ch07/assignment-12', 'ch07/assignment-13', 'ch07/assignment-14', 'ch07/assignment-15',
  'ch07/assignment-16', 'ch07/assignment-17', 'ch07/assignment-18', 'ch07/assignment-19',
  'ch07/assignment-20', 'ch07/assignment-21', 'ch07/assignment-22',
  'ch08/assignment-01', 'ch08/assignment-02', 'ch08/assignment-03', 'ch08/assignment-04',
  'ch08/assignment-06', 'ch08/assignment-07', 'ch08/assignment-08',
  'ch08/assignment-11', 'ch08/assignment-12',
  'ch09/assignment-02', 'ch09/assignment-04', 'ch09/assignment-05', 'ch09/assignment-06',
  'ch09/assignment-07', 'ch09/assignment-09', 'ch09/assignment-10',
  'ch09/assignment-13', 'ch09/assignment-14', 'ch09/assignment-15', 'ch09/assignment-16',
  'ch11/assignment-02', 'ch11/assignment-03', 'ch11/assignment-04', 'ch11/assignment-06',
  'ch11/assignment-07', 'ch11/assignment-08', 'ch11/assignment-09', 'ch11/assignment-10',
  'ch11/assignment-12', 'ch11/assignment-13', 'ch11/assignment-15', 'ch11/assignment-16',
])

function getAssignmentPaths(chapterSlug: string, n: number): { assignmentPdf: string; solutionPdf?: string } {
  const base = `/academy/guidewire/assignments/${chapterSlug}`
  const num = String(n).padStart(2, '0')
  const key = `${chapterSlug}/assignment-${num}`
  if (SPLIT_ASSIGNMENTS.has(key)) {
    return {
      assignmentPdf: `${base}/assignment-${num}-questions.pdf`,
      solutionPdf: `${base}/assignment-${num}-solutions.pdf`,
    }
  }
  return { assignmentPdf: `${base}/assignment-${num}.pdf` }
}

// --- Lesson metadata builders ---
// These will be populated from extracted JSON at runtime.
// For now we provide static metadata that maps chapter -> lessons.

export const CHAPTER_LESSONS: Record<string, LessonMeta[]> = {
  ch01: [
    { lessonId: 'ch01-l01', chapterSlug: 'ch01', chapterId: 1, lessonNumber: 1, title: 'Guidewire Cloud Overview', estimatedMinutes: 37, videoCount: 7, hasAssignment: false },
  ],
  ch02: [
    { lessonId: 'ch02-l01', chapterSlug: 'ch02', chapterId: 2, lessonNumber: 1, title: 'Surepath Overview', estimatedMinutes: 25, videoCount: 1, hasAssignment: false },
  ],
  ch03: [
    { lessonId: 'ch03-l01', chapterSlug: 'ch03', chapterId: 3, lessonNumber: 1, title: 'User Story Cards & Implementation Tools', estimatedMinutes: 45, videoCount: 0, hasAssignment: true, assignmentPdf: '/academy/guidewire/assignments/ch03/01_User_Story_Cards_Assignment.pdf' },
  ],
  ch04: Array.from({ length: 31 }, (_, i) => {
    const n = i + 1
    const titles: Record<number, string> = {
      1: 'Accounts', 2: 'Policy Transactions', 3: 'The Policy File', 4: 'Product Model Introduction',
      5: 'Full Application Submission', 6: 'Full Application Submission (continued)', 7: 'Policy Tools',
      8: 'Policy Changes and Preemptions', 9: 'Renewals', 10: 'Cancellation, Reinstatement, and Rewrite',
      11: 'Out-of-Sequence Transactions', 12: 'Users and Groups', 13: 'Organizations and Producer Codes',
      14: 'Forms', 15: 'Introduction to Underwriting Authority', 16: 'Managing Underwriting Authority',
      17: 'Products and Policy Lines', 18: 'Coverages', 19: 'Coverage Terms',
      20: 'Product Model Availability', 21: 'Question Sets and Offerings', 22: 'Modifiers',
      23: 'Contingencies', 24: 'Policy Holds and Underwriting Referral Reasons', 25: 'Documents',
      26: 'Notes', 27: 'Activities', 28: 'Roles and Permissions', 29: 'Validation',
      30: 'Premium Audits', 31: 'Introduction to Submission Intake',
    }
    return {
      lessonId: `ch04-l${String(n).padStart(2, '0')}`,
      chapterSlug: 'ch04',
      chapterId: 4,
      lessonNumber: n,
      title: titles[n] || `PolicyCenter Lesson ${n}`,
      estimatedMinutes: 40,
      videoCount: n <= 31 ? 1 : 0,
      hasAssignment: true,
      ...getAssignmentPaths('ch04', n),
    }
  }),
  ch05: Array.from({ length: 19 }, (_, i) => {
    const n = i + 1
    const titles: Record<number, string> = {
      1: 'The Claims Process', 2: 'Claim Maintenance', 3: 'Organizational Structure',
      4: 'Claim Intake', 5: 'Claim Setup', 6: 'Data Model', 7: 'Adjudication',
      8: 'Workers Compensation Exposures', 9: 'Defining Financial Terms and Concepts',
      10: 'Creating Payments and Reserves', 11: 'Constraining Payments - Approvals',
      12: 'Constraining Payments - Financial Holds', 13: 'Managing Contacts',
      14: 'Permissions and Access Control Lists', 15: 'Specialized Claim Processes - Workers Compensation',
      16: 'Administering Workers Compensation', 17: 'Line of Business, Policy and Coverage',
      18: 'Managing Vendors', 19: 'Managing Service Requests',
    }
    return {
      lessonId: `ch05-l${String(n).padStart(2, '0')}`,
      chapterSlug: 'ch05',
      chapterId: 5,
      lessonNumber: n,
      title: titles[n] || `ClaimCenter Lesson ${n}`,
      estimatedMinutes: 45,
      videoCount: 2,
      hasAssignment: true,
      ...getAssignmentPaths('ch05', n),
    }
  }),
  ch06: Array.from({ length: 19 }, (_, i) => {
    const n = i + 1
    const titles: Record<number, string> = {
      1: 'Billing Lifecycle', 2: 'Interacting with the Development System',
      3: 'Administering Charge Invoicing', 4: 'Billing a One-Time Charge',
      5: 'Billing a Pro Rata Charge', 6: 'Charge Invoicing Overview',
      7: 'Sending Invoices', 8: 'Managing Invoices', 9: 'Receiving Direct Bill Payments',
      10: 'Applying Direct Bill Payments', 11: 'Managing Direct Bill Payments',
      12: 'Processing a Delinquency', 13: 'Using Trouble Tickets to Resolve Issues',
      14: 'Managing Producers and Commissions', 15: 'Handling Policy Transactions After Issuance',
      16: 'Managing Disbursements', 17: 'Billing at the Account Level',
      18: 'Designating an Alternate Payer', 19: 'Controlling Access',
    }
    return {
      lessonId: `ch06-l${String(n).padStart(2, '0')}`,
      chapterSlug: 'ch06',
      chapterId: 6,
      lessonNumber: n,
      title: titles[n] || `BillingCenter Lesson ${n}`,
      estimatedMinutes: 35,
      videoCount: 1,
      hasAssignment: true,
      ...getAssignmentPaths('ch06', n),
    }
  }),
  ch07: Array.from({ length: 23 }, (_, i) => {
    const n = i + 1
    const titles: Record<number, string> = {
      1: 'Introduction to Guidewire Configuration', 2: 'Introduction to the Data Model',
      3: 'Extending the Data Model', 4: 'User Interface Architecture',
      5: 'Introduction to Atomic Widgets', 6: 'Introduction to Detail Views',
      7: 'Introduction to Locations', 8: 'Introduction to Gosu',
      9: 'Introduction to Gosu Rules', 10: 'Introduction to Enhancements',
      11: 'Code Generation and Debugging', 12: 'Creating New Entities',
      13: 'Introduction to List Views', 14: 'Editable List Views',
      15: 'Introduction to Typelists', 16: 'Introduction to Popups',
      17: 'Introduction to Validation', 18: 'Introduction to Input Sets',
      19: 'Introduction to Partial Page Update', 20: 'Introduction to Subtypes',
      21: 'Introduction to Modes', 22: 'Introduction to Entity Names',
      23: 'Preparing for a Guidewire Exam',
    }
    return {
      lessonId: `ch07-l${String(n).padStart(2, '0')}`,
      chapterSlug: 'ch07',
      chapterId: 7,
      lessonNumber: n,
      title: titles[n] || `Developer Fundamentals Lesson ${n}`,
      estimatedMinutes: 50,
      videoCount: 1,
      hasAssignment: n <= 22,
      ...(n <= 22 ? getAssignmentPaths('ch07', n) : {}),
    }
  }),
  ch08: Array.from({ length: 14 }, (_, i) => {
    const n = i + 1
    const titles: Record<number, string> = {
      1: 'PolicyCenter Data Model', 2: 'Configuring Location Groups and Pages',
      3: 'Configuring Job Wizards', 4: 'Contacts and Locations',
      5: 'Concepts of Revisioning', 6: 'Raising Underwriting Issues',
      7: 'Approving Underwriting Issues', 8: 'Validation Classes',
      9: 'Revisioning Contacts and Locations', 10: 'Permission Configuration',
      11: 'Creating Activities', 12: 'Assigning Activities',
      13: 'The Job Lifecycle', 14: 'Advanced Configuration Topics',
    }
    return {
      lessonId: `ch08-l${String(n).padStart(2, '0')}`,
      chapterSlug: 'ch08',
      chapterId: 8,
      lessonNumber: n,
      title: titles[n] || `PC Config Lesson ${n}`,
      estimatedMinutes: 55,
      videoCount: 2,
      hasAssignment: n <= 13,
      ...(n <= 13 ? getAssignmentPaths('ch08', n) : {}),
    }
  }),
  ch09: Array.from({ length: 18 }, (_, i) => {
    const n = i + 1
    const titles: Record<number, string> = {
      1: 'Configuring the ClaimCenter User Interface', 2: 'Line of Business',
      3: 'Configuring Claim Intake', 4: 'Writing Gosu Rules',
      5: 'Writing Assignment Rules', 6: 'Writing Claim and Exposure Validation Rules',
      7: 'Claim Setup Rules', 8: 'Configuring Claim Contacts',
      9: 'Configuring ClaimCenter Financials - Transactions',
      10: 'Configuring ClaimCenter Financials - Financial Holds',
      11: 'Configuring ClaimCenter Financials - Transaction Approvals',
      12: 'Configuring Vendor Services', 13: 'Configuring Search',
      14: 'Configuring Claim History', 15: 'Configuring Permissions',
      16: 'Business Rules - Activities', 17: 'Business Rules - Exposures and Reserves',
      18: 'Cloud Data Archiving for ClaimCenter',
    }
    return {
      lessonId: `ch09-l${String(n).padStart(2, '0')}`,
      chapterSlug: 'ch09',
      chapterId: 9,
      lessonNumber: n,
      title: titles[n] || `CC Config Lesson ${n}`,
      estimatedMinutes: 50,
      videoCount: 2,
      hasAssignment: n <= 17,
      ...(n <= 17 ? getAssignmentPaths('ch09', n) : {}),
    }
  }),
  ch10: Array.from({ length: 17 }, (_, i) => {
    const n = i + 1
    const titles: Record<number, string> = {
      1: 'Configuration Basics', 2: 'Configuring Charge Invoicing Behaviors',
      3: 'Configuring Invoice Streams', 4: 'Configuring Activities',
      5: 'Configuring Trouble Tickets', 6: 'Workflow Processes',
      7: 'Workflow Elements', 8: 'Configuring Payment Allocation',
      9: 'Configuring Assignment', 10: 'Configuring Escalation',
      11: 'Configuring Delinquency Workflow', 12: 'Configuring Policy Transactions After Issuance',
      13: 'Earning and Tracking Commission', 14: 'Configuring Producer Commission',
      15: 'Overriding Policy Commission', 16: 'Configuring Policy Transfer',
      17: 'Configuring Transaction Approval',
    }
    return {
      lessonId: `ch10-l${String(n).padStart(2, '0')}`,
      chapterSlug: 'ch10',
      chapterId: 10,
      lessonNumber: n,
      title: titles[n] || `BC Config Lesson ${n}`,
      estimatedMinutes: 40,
      videoCount: 0,
      hasAssignment: true,
      ...getAssignmentPaths('ch10', n),
    }
  }),
  ch11: Array.from({ length: 21 }, (_, i) => {
    const n = i + 1
    const titles: Record<number, string> = {
      1: 'Introduction to Integration', 2: 'Gosu for Integration',
      3: 'Gosu Queries', 4: 'Bundles and Database Transactions',
      5: 'Gosu Templates', 6: 'XML Modeler and Strongly Typed XML',
      7: 'Integration Views', 8: 'RESTful Web Services',
      9: 'SOAP Web Services', 10: 'Plugins',
      11: 'Messaging Architecture', 12: 'Triggering Messages',
      13: 'Creating Messages', 14: 'Message Payload Transformation',
      15: 'Sending Messages', 16: 'Acknowledging Messages',
      17: 'Authentication', 18: 'Batch Processes',
      19: 'Startable Plugins', 20: 'Integration Testing',
      21: 'Cloud Integration Patterns',
    }
    return {
      lessonId: `ch11-l${String(n).padStart(2, '0')}`,
      chapterSlug: 'ch11',
      chapterId: 11,
      lessonNumber: n,
      title: titles[n] || `Integration Lesson ${n}`,
      estimatedMinutes: 50,
      videoCount: 1,
      hasAssignment: n <= 18,
      ...(n <= 18 ? getAssignmentPaths('ch11', n) : {}),
    }
  }),
  ch12: [
    { lessonId: 'ch12-l01', chapterSlug: 'ch12', chapterId: 12, lessonNumber: 1, title: 'Advanced Product Designer Introduction', estimatedMinutes: 60, videoCount: 5, hasAssignment: false },
    { lessonId: 'ch12-l02', chapterSlug: 'ch12', chapterId: 12, lessonNumber: 2, title: 'Conceptualizing Requirements in Mind Map', estimatedMinutes: 45, videoCount: 5, hasAssignment: false },
    { lessonId: 'ch12-l03', chapterSlug: 'ch12', chapterId: 12, lessonNumber: 3, title: 'Enhancing and Visualizing Product in APD', estimatedMinutes: 60, videoCount: 6, hasAssignment: false },
    { lessonId: 'ch12-l04', chapterSlug: 'ch12', chapterId: 12, lessonNumber: 4, title: 'Finalizing and Generating Product from APD', estimatedMinutes: 45, videoCount: 6, hasAssignment: false },
  ],
  ch13: Array.from({ length: 7 }, (_, i) => {
    const n = i + 1
    const titles: Record<number, string> = {
      1: 'Rating Overview', 2: 'Rate Tables',
      3: 'Rating Algorithms', 4: 'Factor-Based Rating',
      5: 'Rating Engine Architecture', 6: 'Rate Routines',
      7: 'Rating Testing and Debugging',
    }
    return {
      lessonId: `ch13-l${String(n).padStart(2, '0')}`,
      chapterSlug: 'ch13',
      chapterId: 13,
      lessonNumber: n,
      title: titles[n] || `Rating Intro Lesson ${n}`,
      estimatedMinutes: 45,
      videoCount: 1,
      hasAssignment: false,
    }
  }),
  ch14: Array.from({ length: 5 }, (_, i) => {
    const n = i + 1
    const titles: Record<number, string> = {
      1: 'Rate Routine Configuration', 2: 'Rate Table Configuration',
      3: 'System Rate Tables', 4: 'Advanced Rating Patterns',
      5: 'Rating Performance Optimization',
    }
    return {
      lessonId: `ch14-l${String(n).padStart(2, '0')}`,
      chapterSlug: 'ch14',
      chapterId: 14,
      lessonNumber: n,
      title: titles[n] || `Rating Config Lesson ${n}`,
      estimatedMinutes: 50,
      videoCount: 2,
      hasAssignment: false,
    }
  }),
}

// --- Helpers ---

export function getChapter(id: number): Chapter | undefined {
  return CHAPTERS.find(c => c.id === id)
}

export function getChapterBySlug(slug: string): Chapter | undefined {
  return CHAPTERS.find(c => c.slug === slug)
}

export function getLessonsForChapter(chapterSlug: string): LessonMeta[] {
  return CHAPTER_LESSONS[chapterSlug] || []
}

export function getLesson(lessonId: string): LessonMeta | undefined {
  for (const lessons of Object.values(CHAPTER_LESSONS)) {
    const found = lessons.find(l => l.lessonId === lessonId)
    if (found) return found
  }
  return undefined
}

export function getAllLessons(): LessonMeta[] {
  return CHAPTERS.flatMap(ch => CHAPTER_LESSONS[ch.slug] || [])
}

export function getNextLesson(currentLessonId: string): LessonMeta | undefined {
  const all = getAllLessons()
  const idx = all.findIndex(l => l.lessonId === currentLessonId)
  return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined
}

export function getPrevLesson(currentLessonId: string): LessonMeta | undefined {
  const all = getAllLessons()
  const idx = all.findIndex(l => l.lessonId === currentLessonId)
  return idx > 0 ? all[idx - 1] : undefined
}

export function getChaptersByPhase(phase: ChapterPhase): Chapter[] {
  return CHAPTERS.filter(ch => ch.phase === phase)
}

export function getAllChaptersByPhase(): Record<ChapterPhase, Chapter[]> {
  const grouped: Record<ChapterPhase, Chapter[]> = {
    'foundation': [],
    'specialization': [],
    'developer-core': [],
    'configuration': [],
    'advanced': [],
  }
  CHAPTERS.forEach(ch => grouped[ch.phase].push(ch))
  return grouped
}

// Phase metadata for UI display
export const PHASES: Record<ChapterPhase, { label: string; description: string; color: string }> = {
  'foundation': {
    label: 'Foundation',
    description: 'Cloud platform, tools, and project methodology',
    color: 'text-blue-600',
  },
  'specialization': {
    label: 'Specialization',
    description: 'Deep dive into PolicyCenter, ClaimCenter, and BillingCenter',
    color: 'text-purple-600',
  },
  'developer-core': {
    label: 'Developer Core',
    description: 'Data model, UI architecture, Gosu programming, and fundamentals',
    color: 'text-amber-600',
  },
  'configuration': {
    label: 'Configuration',
    description: 'PolicyCenter and ClaimCenter configuration techniques',
    color: 'text-green-600',
  },
  'advanced': {
    label: 'Advanced',
    description: 'Integration, Advanced Product Designer, and Rating',
    color: 'text-red-600',
  },
}

export const TOTAL_LESSONS = CHAPTERS.reduce((sum, ch) => sum + ch.totalLessons, 0)
export const TOTAL_CHAPTERS = CHAPTERS.length

// --- Path-based helpers ---

export function getChaptersForPath(chapterSlugs: string[]): Chapter[] {
  return chapterSlugs
    .map(slug => CHAPTERS.find(ch => ch.slug === slug))
    .filter((ch): ch is Chapter => ch !== undefined)
}

export function getLessonsForPath(chapterSlugs: string[]): LessonMeta[] {
  return chapterSlugs.flatMap(slug => CHAPTER_LESSONS[slug] || [])
}

export function getNextLessonInPath(currentLessonId: string, chapterSlugs: string[]): LessonMeta | undefined {
  const pathLessons = getLessonsForPath(chapterSlugs)
  const idx = pathLessons.findIndex(l => l.lessonId === currentLessonId)
  return idx >= 0 && idx < pathLessons.length - 1 ? pathLessons[idx + 1] : undefined
}

export function getPrevLessonInPath(currentLessonId: string, chapterSlugs: string[]): LessonMeta | undefined {
  const pathLessons = getLessonsForPath(chapterSlugs)
  const idx = pathLessons.findIndex(l => l.lessonId === currentLessonId)
  return idx > 0 ? pathLessons[idx - 1] : undefined
}
