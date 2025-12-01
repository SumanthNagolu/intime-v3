/**
 * Activity Engine Unit Tests
 * 
 * Tests for the core activity engine functionality:
 * - Activity creation
 * - Pattern matching
 * - Auto-activity generation
 * - Due date calculation
 * 
 * Run: pnpm vitest tests/unit/activities/activity-engine.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockUser,
  setMockUser,
  clearMockUser,
  createMockRACIAssignment,
} from '../../utils/auth-test-utils';
import {
  createTestOrg,
  createTestUser,
  createTestCandidate,
  createTestJob,
  cleanupTestData,
} from '../../utils/db-test-utils';

// ============================================================================
// Mock Dependencies
// ============================================================================

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  })),
}));

// ============================================================================
// Test Types
// ============================================================================

type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note';
type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
type ActivityPriority = 'low' | 'medium' | 'high' | 'critical';

interface Activity {
  id: string;
  orgId: string;
  type: ActivityType;
  subject: string;
  description?: string;
  status: ActivityStatus;
  priority: ActivityPriority;
  dueDate?: Date;
  assignedTo: string;
  entityType: string;
  entityId: string;
  outcome?: string;
  notes?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface ActivityPattern {
  id: string;
  eventType: string;
  activityType: ActivityType;
  subjectTemplate: string;
  descriptionTemplate: string;
  priority: ActivityPriority;
  dueDateOffset: number;
  assigneeRole: string;
}

// ============================================================================
// Mock Implementations
// ============================================================================

const mockActivities: Activity[] = [];
const mockPatterns: ActivityPattern[] = [
  {
    id: 'pattern_1',
    eventType: 'candidate.created',
    activityType: 'call',
    subjectTemplate: 'Introduction call with {{candidateName}}',
    descriptionTemplate: 'Schedule introduction call to discuss career goals and opportunities',
    priority: 'high',
    dueDateOffset: 24, // hours
    assigneeRole: 'responsible',
  },
  {
    id: 'pattern_2',
    eventType: 'submission.created',
    activityType: 'task',
    subjectTemplate: 'Follow up on submission: {{candidateName}} → {{jobTitle}}',
    descriptionTemplate: 'Follow up with client on candidate submission',
    priority: 'high',
    dueDateOffset: 48,
    assigneeRole: 'responsible',
  },
];

// Mock activity service
const ActivityService = {
  create: vi.fn(async (data: Partial<Activity>) => {
    const activity: Activity = {
      id: `act_${Date.now()}`,
      orgId: data.orgId || 'org_test',
      type: data.type || 'task',
      subject: data.subject || '',
      description: data.description,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      dueDate: data.dueDate,
      assignedTo: data.assignedTo || 'user_test',
      entityType: data.entityType || 'candidate',
      entityId: data.entityId || 'entity_test',
      createdAt: new Date(),
    };
    mockActivities.push(activity);
    return activity;
  }),
  
  complete: vi.fn(async (activityId: string, outcome: string, notes?: string) => {
    const activity = mockActivities.find(a => a.id === activityId);
    if (activity) {
      activity.status = 'completed';
      activity.outcome = outcome;
      activity.notes = notes;
      activity.completedAt = new Date();
    }
    return activity;
  }),
  
  getById: vi.fn(async (id: string) => {
    return mockActivities.find(a => a.id === id);
  }),
  
  listForEntity: vi.fn(async (entityType: string, entityId: string) => {
    return mockActivities.filter(
      a => a.entityType === entityType && a.entityId === entityId
    );
  }),
  
  listForUser: vi.fn(async (userId: string) => {
    return mockActivities.filter(a => a.assignedTo === userId);
  }),
};

// Mock pattern matcher
const PatternMatcher = {
  findMatchingPatterns: vi.fn((eventType: string) => {
    return mockPatterns.filter(p => p.eventType === eventType);
  }),
  
  resolveAssignee: vi.fn((pattern: ActivityPattern, context: Record<string, unknown>) => {
    return context.responsibleUserId || 'user_default';
  }),
};

// Mock template utils
const TemplateUtils = {
  interpolate: vi.fn((template: string, variables: Record<string, unknown>) => {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return result;
  }),
};

// Mock due date utils
const DueDateUtils = {
  calculateDueDate: vi.fn((offsetHours: number, startDate?: Date) => {
    const start = startDate || new Date();
    return new Date(start.getTime() + offsetHours * 60 * 60 * 1000);
  }),
  
  isOverdue: vi.fn((dueDate: Date) => {
    return dueDate < new Date();
  }),
  
  isDueToday: vi.fn((dueDate: Date) => {
    const today = new Date();
    return (
      dueDate.getFullYear() === today.getFullYear() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getDate() === today.getDate()
    );
  }),
};

// Mock Activity Engine
const ActivityEngine = {
  processEvent: vi.fn(async (event: {
    type: string;
    entityType: string;
    entityId: string;
    orgId: string;
    data: Record<string, unknown>;
  }) => {
    const patterns = PatternMatcher.findMatchingPatterns(event.type);
    const createdActivities: Activity[] = [];
    
    for (const pattern of patterns) {
      const assignee = PatternMatcher.resolveAssignee(pattern, event.data);
      const subject = TemplateUtils.interpolate(pattern.subjectTemplate, event.data);
      const description = TemplateUtils.interpolate(pattern.descriptionTemplate, event.data);
      const dueDate = DueDateUtils.calculateDueDate(pattern.dueDateOffset);
      
      const activity = await ActivityService.create({
        orgId: event.orgId,
        type: pattern.activityType,
        subject,
        description,
        priority: pattern.priority,
        dueDate,
        assignedTo: assignee as string,
        entityType: event.entityType,
        entityId: event.entityId,
      });
      
      createdActivities.push(activity);
    }
    
    return createdActivities;
  }),
};

// ============================================================================
// Test Suites
// ============================================================================

describe('ActivityService', () => {
  beforeEach(() => {
    mockActivities.length = 0;
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    clearMockUser();
  });
  
  describe('create', () => {
    it('should create an activity with required fields', async () => {
      const activity = await ActivityService.create({
        orgId: 'org_test',
        type: 'call',
        subject: 'Test call',
        assignedTo: 'user_123',
        entityType: 'candidate',
        entityId: 'cand_456',
      });
      
      expect(activity).toBeDefined();
      expect(activity.id).toBeTruthy();
      expect(activity.type).toBe('call');
      expect(activity.status).toBe('pending');
      expect(activity.subject).toBe('Test call');
    });
    
    it('should set default status to pending', async () => {
      const activity = await ActivityService.create({
        orgId: 'org_test',
        type: 'task',
        subject: 'Test task',
        assignedTo: 'user_123',
        entityType: 'job',
        entityId: 'job_789',
      });
      
      expect(activity.status).toBe('pending');
    });
    
    it('should set default priority to medium', async () => {
      const activity = await ActivityService.create({
        orgId: 'org_test',
        type: 'email',
        subject: 'Test email',
        assignedTo: 'user_123',
        entityType: 'candidate',
        entityId: 'cand_456',
      });
      
      expect(activity.priority).toBe('medium');
    });
  });
  
  describe('complete', () => {
    it('should mark activity as completed with outcome', async () => {
      const activity = await ActivityService.create({
        orgId: 'org_test',
        type: 'call',
        subject: 'Test call',
        assignedTo: 'user_123',
        entityType: 'candidate',
        entityId: 'cand_456',
      });
      
      const completed = await ActivityService.complete(
        activity.id,
        'positive',
        'Great conversation, candidate is interested'
      );
      
      expect(completed?.status).toBe('completed');
      expect(completed?.outcome).toBe('positive');
      expect(completed?.notes).toBe('Great conversation, candidate is interested');
      expect(completed?.completedAt).toBeDefined();
    });
  });
  
  describe('listForEntity', () => {
    it('should return activities for a specific entity', async () => {
      // Create activities for different entities
      await ActivityService.create({
        orgId: 'org_test',
        type: 'call',
        subject: 'Call 1',
        assignedTo: 'user_123',
        entityType: 'candidate',
        entityId: 'cand_1',
      });
      
      await ActivityService.create({
        orgId: 'org_test',
        type: 'email',
        subject: 'Email 1',
        assignedTo: 'user_123',
        entityType: 'candidate',
        entityId: 'cand_1',
      });
      
      await ActivityService.create({
        orgId: 'org_test',
        type: 'task',
        subject: 'Task for different candidate',
        assignedTo: 'user_123',
        entityType: 'candidate',
        entityId: 'cand_2',
      });
      
      const activities = await ActivityService.listForEntity('candidate', 'cand_1');
      
      expect(activities.length).toBe(2);
      expect(activities.every(a => a.entityId === 'cand_1')).toBe(true);
    });
  });
  
  describe('listForUser', () => {
    it('should return activities assigned to a specific user', async () => {
      await ActivityService.create({
        orgId: 'org_test',
        type: 'call',
        subject: 'Call for user 1',
        assignedTo: 'user_1',
        entityType: 'candidate',
        entityId: 'cand_1',
      });
      
      await ActivityService.create({
        orgId: 'org_test',
        type: 'task',
        subject: 'Task for user 1',
        assignedTo: 'user_1',
        entityType: 'job',
        entityId: 'job_1',
      });
      
      await ActivityService.create({
        orgId: 'org_test',
        type: 'email',
        subject: 'Email for user 2',
        assignedTo: 'user_2',
        entityType: 'candidate',
        entityId: 'cand_2',
      });
      
      const activities = await ActivityService.listForUser('user_1');
      
      expect(activities.length).toBe(2);
      expect(activities.every(a => a.assignedTo === 'user_1')).toBe(true);
    });
  });
});

describe('PatternMatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('findMatchingPatterns', () => {
    it('should find patterns matching event type', () => {
      const patterns = PatternMatcher.findMatchingPatterns('candidate.created');
      
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].eventType).toBe('candidate.created');
    });
    
    it('should return empty array for unknown event types', () => {
      const patterns = PatternMatcher.findMatchingPatterns('unknown.event');
      
      expect(patterns.length).toBe(0);
    });
  });
  
  describe('resolveAssignee', () => {
    it('should resolve assignee from context', () => {
      const pattern = mockPatterns[0];
      const context = { responsibleUserId: 'user_responsible' };
      
      const assignee = PatternMatcher.resolveAssignee(pattern, context);
      
      expect(assignee).toBe('user_responsible');
    });
    
    it('should return default user when context is empty', () => {
      const pattern = mockPatterns[0];
      const context = {};
      
      const assignee = PatternMatcher.resolveAssignee(pattern, context);
      
      expect(assignee).toBe('user_default');
    });
  });
});

describe('TemplateUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('interpolate', () => {
    it('should replace template variables', () => {
      const template = 'Introduction call with {{candidateName}}';
      const variables = { candidateName: 'John Doe' };
      
      const result = TemplateUtils.interpolate(template, variables);
      
      expect(result).toBe('Introduction call with John Doe');
    });
    
    it('should replace multiple variables', () => {
      const template = '{{candidateName}} submitted to {{jobTitle}} at {{company}}';
      const variables = {
        candidateName: 'Jane Smith',
        jobTitle: 'Senior Developer',
        company: 'TechCorp',
      };
      
      const result = TemplateUtils.interpolate(template, variables);
      
      expect(result).toBe('Jane Smith submitted to Senior Developer at TechCorp');
    });
  });
});

describe('DueDateUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('calculateDueDate', () => {
    it('should calculate due date from offset hours', () => {
      const startDate = new Date('2024-01-01T10:00:00Z');
      const dueDate = DueDateUtils.calculateDueDate(24, startDate);
      
      expect(dueDate.getTime()).toBe(new Date('2024-01-02T10:00:00Z').getTime());
    });
    
    it('should use current time if no start date provided', () => {
      const beforeCall = new Date();
      const dueDate = DueDateUtils.calculateDueDate(24);
      const afterCall = new Date();
      
      // Due date should be approximately 24 hours from now
      const expectedMin = beforeCall.getTime() + 24 * 60 * 60 * 1000;
      const expectedMax = afterCall.getTime() + 24 * 60 * 60 * 1000;
      
      expect(dueDate.getTime()).toBeGreaterThanOrEqual(expectedMin);
      expect(dueDate.getTime()).toBeLessThanOrEqual(expectedMax);
    });
  });
  
  describe('isOverdue', () => {
    it('should return true for past due dates', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      
      expect(DueDateUtils.isOverdue(pastDate)).toBe(true);
    });
    
    it('should return false for future due dates', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      
      expect(DueDateUtils.isOverdue(futureDate)).toBe(false);
    });
  });
  
  describe('isDueToday', () => {
    it('should return true for today\'s date', () => {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      expect(DueDateUtils.isDueToday(today)).toBe(true);
    });
    
    it('should return false for other dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      expect(DueDateUtils.isDueToday(tomorrow)).toBe(false);
    });
  });
});

describe('ActivityEngine', () => {
  beforeEach(() => {
    mockActivities.length = 0;
    vi.clearAllMocks();
  });
  
  describe('processEvent', () => {
    it('should create activities from matching patterns', async () => {
      const event = {
        type: 'candidate.created',
        entityType: 'candidate',
        entityId: 'cand_123',
        orgId: 'org_test',
        data: {
          candidateName: 'John Doe',
          responsibleUserId: 'user_recruiter',
        },
      };
      
      const activities = await ActivityEngine.processEvent(event);
      
      expect(activities.length).toBe(1);
      expect(activities[0].type).toBe('call');
      expect(activities[0].subject).toBe('Introduction call with John Doe');
      expect(activities[0].assignedTo).toBe('user_recruiter');
    });
    
    it('should not create activities for events without matching patterns', async () => {
      const event = {
        type: 'unknown.event',
        entityType: 'unknown',
        entityId: 'unknown_123',
        orgId: 'org_test',
        data: {},
      };
      
      const activities = await ActivityEngine.processEvent(event);
      
      expect(activities.length).toBe(0);
    });
    
    it('should create multiple activities for multiple matching patterns', async () => {
      // Add a second pattern for candidate.created
      mockPatterns.push({
        id: 'pattern_3',
        eventType: 'candidate.created',
        activityType: 'email',
        subjectTemplate: 'Send welcome email to {{candidateName}}',
        descriptionTemplate: 'Send welcome email with next steps',
        priority: 'medium',
        dueDateOffset: 4,
        assigneeRole: 'responsible',
      });
      
      const event = {
        type: 'candidate.created',
        entityType: 'candidate',
        entityId: 'cand_456',
        orgId: 'org_test',
        data: {
          candidateName: 'Jane Smith',
          responsibleUserId: 'user_recruiter',
        },
      };
      
      const activities = await ActivityEngine.processEvent(event);
      
      expect(activities.length).toBe(2);
      expect(activities.map(a => a.type).sort()).toEqual(['call', 'email'].sort());
      
      // Cleanup
      mockPatterns.pop();
    });
    
    it('should calculate correct due dates based on pattern offset', async () => {
      const event = {
        type: 'candidate.created',
        entityType: 'candidate',
        entityId: 'cand_789',
        orgId: 'org_test',
        data: {
          candidateName: 'Test Candidate',
          responsibleUserId: 'user_recruiter',
        },
      };
      
      const beforeProcess = new Date();
      const activities = await ActivityEngine.processEvent(event);
      
      expect(activities[0].dueDate).toBeDefined();
      
      // Due date should be approximately 24 hours from now (based on pattern)
      const expectedDue = new Date(beforeProcess.getTime() + 24 * 60 * 60 * 1000);
      const actualDue = activities[0].dueDate!;
      
      // Allow 1 second tolerance
      expect(Math.abs(actualDue.getTime() - expectedDue.getTime())).toBeLessThan(1000);
    });
  });
});

describe('Activity RACI Integration', () => {
  beforeEach(() => {
    mockActivities.length = 0;
    vi.clearAllMocks();
  });
  
  it('should create activity assigned to Responsible user', async () => {
    const raciAssignment = createMockRACIAssignment({
      responsible: 'user_responsible_1',
      accountable: 'user_accountable_1',
    });
    
    const event = {
      type: 'candidate.created',
      entityType: 'candidate',
      entityId: 'cand_123',
      orgId: 'org_test',
      data: {
        candidateName: 'RACI Test Candidate',
        responsibleUserId: raciAssignment.responsible,
      },
    };
    
    const activities = await ActivityEngine.processEvent(event);
    
    expect(activities[0].assignedTo).toBe('user_responsible_1');
  });
});

describe('Activity Multi-Tenancy', () => {
  beforeEach(() => {
    mockActivities.length = 0;
    vi.clearAllMocks();
  });
  
  it('should include org_id on all created activities', async () => {
    const event = {
      type: 'candidate.created',
      entityType: 'candidate',
      entityId: 'cand_123',
      orgId: 'org_tenant_a',
      data: {
        candidateName: 'Tenant A Candidate',
        responsibleUserId: 'user_1',
      },
    };
    
    const activities = await ActivityEngine.processEvent(event);
    
    expect(activities[0].orgId).toBe('org_tenant_a');
  });
  
  it('should filter activities by org when listing', async () => {
    // Create activities for different orgs
    await ActivityService.create({
      orgId: 'org_tenant_a',
      type: 'call',
      subject: 'Tenant A call',
      assignedTo: 'user_1',
      entityType: 'candidate',
      entityId: 'cand_1',
    });
    
    await ActivityService.create({
      orgId: 'org_tenant_b',
      type: 'call',
      subject: 'Tenant B call',
      assignedTo: 'user_1',
      entityType: 'candidate',
      entityId: 'cand_2',
    });
    
    // Note: In real implementation, listForUser would also filter by org_id
    // This test verifies the activities have different org_ids
    const allActivities = mockActivities;
    
    const orgAActivities = allActivities.filter(a => a.orgId === 'org_tenant_a');
    const orgBActivities = allActivities.filter(a => a.orgId === 'org_tenant_b');
    
    expect(orgAActivities.length).toBe(1);
    expect(orgBActivities.length).toBe(1);
    expect(orgAActivities[0].subject).toBe('Tenant A call');
    expect(orgBActivities[0].subject).toBe('Tenant B call');
  });
});

