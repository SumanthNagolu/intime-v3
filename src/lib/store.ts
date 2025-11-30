
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Role, Candidate, Job, BenchConsultant, Employee, Cohort, Campaign, ImmigrationCase, Account, Submission, Lead, Deal, ApprovalRequest, PayrollRun } from '../types';

// --- ACADEMY TYPES ---
export interface LessonProgress {
  status: 'locked' | 'unlocked' | 'completed';
  score?: number; // For quizzes
  labArtifact?: string; // Code submission
  completedAt?: string; // Serialized Date
}

interface AppState {
  hasKey: boolean;
  activeRole: Role;
  isSprintActive: boolean;
  isMentorOpen: boolean;
  mentorContext: string | null;
  
  // Academy State
  academyProgress: Record<string, LessonProgress>; 

  // Core Data Stores
  accounts: Account[];
  jobs: Job[];
  candidates: Candidate[];
  submissions: Submission[];
  leads: Lead[];
  deals: Deal[];
  
  // Supporting Stores
  bench: BenchConsultant[]; // Legacy/Specific View
  employees: Employee[];
  cohorts: Cohort[];
  campaigns: Campaign[];
  immigrationCases: ImmigrationCase[];
  
  // HR Stores
  approvalRequests: ApprovalRequest[];
  payrollRun: PayrollRun;

  // Actions
  checkKey: () => Promise<void>;
  joinSprint: () => void;
  setMentorOpen: (isOpen: boolean) => void;
  setMentorContext: (context: string | null) => void;
  setActiveRole: (role: Role) => void;
  
  // CRUD Actions
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (candidate: Candidate) => void;
  addJob: (job: Job) => void;
  updateJob: (job: Job) => void;
  addSubmission: (submission: Submission) => void;
  updateSubmission: (submission: Submission) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void; 
  addLead: (lead: Lead) => void;
  updateLead: (lead: Lead) => void;
  addDeal: (deal: Deal) => void;
  updateDeal: (deal: Deal) => void;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  
  // HR Actions
  updateApprovalRequest: (id: string, status: 'Approved' | 'Denied') => void;
  updatePayrollStatus: (status: PayrollRun['status'], step?: number) => void;
  
  // Academy Actions
  updateLessonStatus: (moduleId: number, lessonId: string, status: LessonProgress['status'], score?: number, artifact?: string) => void;
  initializeAcademy: () => void;
  resetProgress: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasKey: false,
      activeRole: 'student', 
      isSprintActive: false,
      isMentorOpen: false,
      mentorContext: null,
      
      academyProgress: {},

      // --- MOCK DATA INITIALIZATION ---
      
      accounts: [
        { 
          id: 'a1', 
          name: 'TechFlow Insurance', 
          industry: 'P&C Insurance', 
          status: 'Active', 
          type: 'Direct Client',
          accountManagerId: 'e2',
          responsiveness: 'High',
          preference: 'Quality',
          description: 'Tier 1 carrier focused on digital transformation.',
          pocs: [
            { id: 'poc1', name: 'Sarah Jenkins', role: 'VP Engineering', email: 'sarah@techflow.com', preference: 'Email', influence: 'Decision Maker' },
            { id: 'poc2', name: 'Mike Ross', role: 'TA Lead', email: 'mike@techflow.com', preference: 'Phone', influence: 'Gatekeeper' }
          ]
        },
        { 
          id: 'a2', 
          name: 'Global Mutual', 
          industry: 'Life Insurance', 
          status: 'Active', 
          type: 'Implementation Partner',
          accountManagerId: 'e2',
          responsiveness: 'Medium',
          preference: 'Quantity',
          description: 'Large SI partner needing bulk staffing for upgrades.',
          pocs: [
            { id: 'poc3', name: 'David Chen', role: 'Delivery Director', email: 'dchen@global.com', preference: 'Email', influence: 'Decision Maker' }
          ]
        },
        { 
          id: 'a3', 
          name: 'SafeGuard', 
          industry: 'Commercial Lines', 
          status: 'Prospect', 
          type: 'Direct Client',
          accountManagerId: 'e4',
          responsiveness: 'Low',
          preference: 'Speed',
          description: 'Mid-market carrier with urgent needs.',
          pocs: []
        },
      ],

      candidates: [
        { id: 'c1', name: 'Sarah Jenkins', role: 'PolicyCenter Dev', status: 'active', type: 'student', skills: ['PolicyCenter', 'Gosu', 'Java', 'Agile'], experience: '4 Yrs', location: 'Remote (US)', rate: '$95/hr', email: 'sarah.j@example.com', score: 92, source: 'Academy', notes: 'Strong communicator. Certified in PC 10.', ownerId: 'e3' },
        { id: 'c2', name: 'Mike Chen', role: 'BillingCenter Lead', status: 'active', type: 'external', skills: ['BillingCenter', 'SQL', 'Integration', 'REST API'], experience: '6 Yrs', location: 'Chicago, IL', rate: '$110/hr', email: 'mike.c@example.com', score: 88, source: 'LinkedIn', notes: 'Expert in billing workflows.', ownerId: 'e3' },
        { id: 'c3', name: 'Priya Sharma', role: 'Senior Dev', status: 'placed', type: 'external', skills: ['PolicyCenter', 'Cloud', 'Gosu', 'React'], experience: '7 Yrs', location: 'Remote', rate: '$100/hr', email: 'priya@example.com', score: 98, source: 'Academy', notes: 'Top of class. Capstone project was excellent.', ownerId: 'e2' },
        { id: 'c4', name: 'Amit Kumar', role: 'Integration Architect', status: 'bench', type: 'internal_bench', skills: ['Integration', 'Gosu', 'MuleSoft'], experience: '8 Yrs', location: 'Hybrid (NJ)', rate: '$120/hr', email: 'amit.k@example.com', score: 90, source: 'Referral', notes: 'Available immediately.', ownerId: 'e4' },
        { id: 'c5', name: 'Vikram Patel', role: 'ClaimCenter Dev', status: 'bench', type: 'internal_bench', skills: ['ClaimCenter', 'Gosu'], experience: '5 Yrs', location: 'Remote', rate: '$90/hr', email: 'vikram@example.com', score: 85, source: 'Academy', notes: 'H-1B Transfer needed.', ownerId: 'e4' },
        { id: 'c6', name: 'Emily Davis', role: 'Guidewire QA', status: 'new', type: 'external', skills: ['Testing', 'Selenium', 'Gosu'], experience: '3 Yrs', location: 'Boston, MA', rate: '$75/hr', email: 'emily.d@example.com', score: 82, source: 'LinkedIn', notes: 'Looking for contract work.', ownerId: 'e3' },
      ],

      jobs: [
        { id: 'j1', accountId: 'a1', client: 'TechFlow Insurance', title: 'Senior PolicyCenter Dev', status: 'urgent', type: 'Contract', rate: '$90-110/hr', location: 'Remote', ownerId: 'e3', description: 'Lead migration from v8 to v10.' },
        { id: 'j2', accountId: 'a1', client: 'TechFlow Insurance', title: 'BillingCenter Architect', status: 'open', type: 'Contract', rate: '$120-140/hr', location: 'Hybrid (NY)', ownerId: 'e3', description: 'Architect new billing flow.' },
        { id: 'j3', accountId: 'a2', client: 'Global Mutual', title: 'Integration Specialist', status: 'open', type: 'C2H', rate: '$85-95/hr', location: 'Remote', ownerId: 'e5', description: 'MuleSoft integration work.' },
        // External Market Jobs (for Bench Sales)
        { id: 'ext-1', accountId: 'ext', client: 'Cognizant (Portal)', title: 'Guidewire Developer', status: 'open', type: 'Contract', rate: '$90/hr', location: 'Remote', ownerId: 'market', description: 'External job scraped from Cognizant portal.' },
        { id: 'ext-2', accountId: 'ext', client: 'Deloitte', title: 'PolicyCenter Lead', status: 'open', type: 'Contract', rate: '$110/hr', location: 'Chicago, IL', ownerId: 'market', description: 'External job found on Indeed.' },
        { id: 'ext-3', accountId: 'ext', client: 'Capgemini', title: 'ClaimCenter Config', status: 'open', type: 'Contract', rate: '$85/hr', location: 'Hartford, CT', ownerId: 'market', description: 'Vendor portal requirement.' },
      ],

      submissions: [
        { id: 's1', jobId: 'j1', candidateId: 'c1', status: 'submitted_to_client', createdAt: '2024-10-15', lastActivity: '2024-10-16', matchScore: 92 },
        { id: 's2', jobId: 'j2', candidateId: 'c2', status: 'client_interview', createdAt: '2024-10-12', lastActivity: '2024-10-18', matchScore: 88 },
        { id: 's3', jobId: 'j1', candidateId: 'c3', status: 'placed', createdAt: '2024-09-01', lastActivity: '2024-09-20', matchScore: 98 },
        // New workflow examples
        { id: 's4', jobId: 'j3', candidateId: 'c4', status: 'sourced', createdAt: '2024-10-20', lastActivity: 'Sourced today', matchScore: 90 },
        { id: 's5', jobId: 'j3', candidateId: 'c5', status: 'submission_ready', createdAt: '2024-10-19', lastActivity: 'Passed Screening', matchScore: 85 },
      ],

      leads: [
          { id: 'l1', company: 'Acme Insure', firstName: 'John', lastName: 'Doe', title: 'CTO', contact: 'John Doe', email: 'john@acme.com', status: 'warm', value: '$200k', lastAction: 'Replied to email 2h ago', source: 'LinkedIn' },
          { id: 'l2', company: 'Global Life', firstName: 'Jane', lastName: 'Smith', title: 'VP HR', contact: 'Jane Smith', email: 'jane@globallife.com', status: 'new', value: '$150k', lastAction: 'Connected on LinkedIn', source: 'Referral' },
          { id: 'l3', company: 'MidWest Mutual', firstName: 'Mike', lastName: 'Ross', title: 'Director', contact: 'Mike Ross', email: 'mike@midwest.com', status: 'cold', value: '$80k', lastAction: 'Email sent 1 week ago', source: 'Cold Outreach' },
      ],

      deals: [
          { id: 'd1', leadId: 'l1', company: 'Acme Insure', title: 'Q4 Staffing Contract', value: '$200,000', stage: 'Negotiation', probability: 75, expectedClose: '2024-11-30', ownerId: 'e2' },
          { id: 'd2', leadId: 'l2', company: 'Global Life', title: 'BillingCenter Implementation', value: '$450,000', stage: 'Proposal', probability: 40, expectedClose: '2024-12-15', ownerId: 'e2' },
          { id: 'd3', leadId: 'l4', company: 'RapidSure', title: 'Initial Discovery', value: '$50,000', stage: 'Discovery', probability: 20, expectedClose: '2025-01-15', ownerId: 'e3' },
      ],

      bench: [
        { id: 'c4', name: 'Amit Kumar', role: 'Integration Architect', status: 'bench', type: 'internal_bench', skills: ['Integration', 'Gosu', 'MuleSoft'], experience: '8 Yrs', location: 'Hybrid (NJ)', rate: '$120/hr', email: 'amit.k@example.com', score: 90, daysOnBench: 28, lastContact: '2 hours ago', visaStatus: 'H-1B' },
        { id: 'c5', name: 'Vikram Patel', role: 'ClaimCenter Dev', status: 'bench', type: 'internal_bench', skills: ['ClaimCenter', 'Gosu'], experience: '5 Yrs', location: 'Remote', rate: '$90/hr', email: 'vikram@example.com', score: 85, daysOnBench: 12, lastContact: 'Yesterday', visaStatus: 'H-1B' },
      ],

      employees: [
        { id: 'e1', firstName: 'Elena', lastName: 'Rodriguez', email: 'elena@intime.com', role: 'Head of People', department: 'HR', startDate: '2023-01-15', status: 'Active', manager: 'CEO', location: 'New York', salary: '$140,000', pod: 'Leadership' },
        { id: 'e2', firstName: 'David', lastName: 'Kim', email: 'david.k@intime.com', role: 'Senior Account Manager', department: 'Recruiting', startDate: '2023-03-01', status: 'Active', manager: 'Elena Rodriguez', location: 'Remote', salary: '$110,000 + Comm', pod: 'Recruiting Pod A' },
        { id: 'e3', firstName: 'Sarah', lastName: 'Lao', email: 'sarah.l@intime.com', role: 'Technical Recruiter', department: 'Recruiting', startDate: '2023-06-12', status: 'Active', manager: 'David Kim', location: 'Austin, TX', salary: '$85,000 + Comm', pod: 'Recruiting Pod A' },
        { id: 'e4', firstName: 'James', lastName: 'Wilson', email: 'james.w@intime.com', role: 'Bench Sales Lead', department: 'Bench Sales', startDate: '2023-08-01', status: 'Active', manager: 'CEO', location: 'Chicago, IL', salary: '$100,000 + Comm', pod: 'Sales Pod 1' },
        { id: 'e5', firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.j@intime.com', role: 'Junior Recruiter', department: 'Recruiting', startDate: '2024-01-10', status: 'Onboarding', manager: 'David Kim', location: 'Remote', salary: '$60,000', pod: 'Recruiting Pod B' },
        { id: 'e6', firstName: 'Alice', lastName: 'Wong', email: 'alice@intime.com', role: 'QA Engineer', department: 'Engineering', startDate: '2024-02-01', status: 'Active', manager: 'CTO', location: 'Remote', salary: '$95,000', pod: 'Product' },
        { id: 'e7', firstName: 'Bob', lastName: 'Smith', email: 'bob@intime.com', role: 'Account Executive', department: 'Sales', startDate: '2024-03-10', status: 'Active', manager: 'James Wilson', location: 'New York', salary: '$90,000', pod: 'Sales Pod 1' },
        { id: 'e8', firstName: 'Charlie', lastName: 'Brown', email: 'charlie@intime.com', role: 'HR Coordinator', department: 'HR', startDate: '2024-04-05', status: 'Onboarding', manager: 'Elena Rodriguez', location: 'Austin, TX', salary: '$55,000', pod: 'Leadership' },
        { id: 'e9', firstName: 'Diana', lastName: 'Prince', email: 'diana@intime.com', role: 'Product Manager', department: 'Product', startDate: '2024-01-20', status: 'Active', manager: 'CEO', location: 'San Francisco', salary: '$130,000', pod: 'Product' },
        { id: 'e10', firstName: 'Evan', lastName: 'Wright', email: 'evan@intime.com', role: 'DevOps Engineer', department: 'Engineering', startDate: '2023-11-15', status: 'Active', manager: 'CTO', location: 'Remote', salary: '$115,000', pod: 'Engineering' },
        { id: 'e11', firstName: 'Fiona', lastName: 'Gallagher', email: 'fiona@intime.com', role: 'Legal Counsel', department: 'HR', startDate: '2023-09-01', status: 'Active', manager: 'CEO', location: 'Chicago', salary: '$150,000', pod: 'Leadership' },
      ],
      
      approvalRequests: [
          { 
            id: 'req1', 
            type: 'Time Off', 
            employeeName: 'David Kim', 
            employeeId: 'e2', 
            date: '2025-12-20', 
            status: 'Pending', 
            details: { start: 'Dec 20', end: 'Dec 27', days: 5, reason: 'Family Vacation' } 
          },
          { 
            id: 'req2', 
            type: 'Commission', 
            employeeName: 'Sarah Lao', 
            employeeId: 'e3', 
            date: '2025-11-15', 
            status: 'Pending', 
            details: { amount: '$1,500', client: 'Acme Corp', placement: 'John Smith', dealValue: '$75,000', contractValue: '$75,000' } 
          },
          { 
            id: 'req3', 
            type: 'Expense', 
            employeeName: 'James Wilson', 
            employeeId: 'e4', 
            date: '2025-11-12', 
            status: 'Pending', 
            details: { amount: '$284.50', items: 3, category: 'Client Entertainment' } 
          }
      ],

      payrollRun: {
          id: 'pay-nov-1',
          periodStart: 'Nov 1',
          periodEnd: 'Nov 15, 2025',
          status: 'Ready for Approval',
          totalAmount: 218450,
          employeeCount: 47,
          stepsCompleted: 0
      },

      cohorts: [
          { id: 'c1', name: 'Cohort Alpha', startDate: '2025-11-01', studentsCount: 20, completionRate: 68, status: 'Active' },
          { id: 'c2', name: 'Cohort Beta', startDate: '2025-09-01', studentsCount: 18, completionRate: 100, status: 'Graduated' },
      ],
      campaigns: [
          { id: 'cam-1', name: 'Guidewire Devs - East Coast', channel: 'LinkedIn', status: 'Active', leads: 87, responseRate: 18 },
          { id: 'cam-2', name: 'Senior Architects - Remote', channel: 'Email', status: 'Draft', leads: 0, responseRate: 0 },
      ],
      immigrationCases: [
          { id: 'ic-1', candidateName: 'Vikram Patel', type: 'H-1B', status: 'Submitted', daysElapsed: 45, nextStep: 'Wait for lottery results' },
          { id: 'ic-2', candidateName: 'Anita Roy', type: 'L-1', status: 'Drafting', daysElapsed: 5, nextStep: 'Employer Letter Signature' },
      ],

      checkKey: async () => {
        try {
          const win = window as any;
          if (win.aistudio && win.aistudio.hasSelectedApiKey) {
            const hasKey = await win.aistudio.hasSelectedApiKey();
            set({ hasKey });
          } else {
             set({ hasKey: !!process.env.API_KEY });
          }
        } catch (e) {
          console.error("Error checking API key:", e);
          set({ hasKey: false });
        }
      },
      joinSprint: () => set({ isSprintActive: true }),
      setMentorOpen: (isOpen) => set({ isMentorOpen: isOpen }),
      setMentorContext: (context) => set({ mentorContext: context }),
      setActiveRole: (role) => set({ activeRole: role }),
      
      addCandidate: (candidate) => set((state) => ({ candidates: [candidate, ...state.candidates] })),
      updateCandidate: (candidate) => set((state) => ({ candidates: state.candidates.map(c => c.id === candidate.id ? candidate : c) })),
      addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
      updateJob: (job) => set((state) => ({ jobs: state.jobs.map(j => j.id === job.id ? job : j) })),
      addSubmission: (submission) => set((state) => ({ submissions: [submission, ...state.submissions] })),
      updateSubmission: (submission) => set((state) => ({ submissions: state.submissions.map(s => s.id === submission.id ? submission : s) })),
      addEmployee: (employee) => set((state) => ({ employees: [employee, ...state.employees] })),
      updateEmployee: (employee) => set((state) => ({ employees: state.employees.map(e => e.id === employee.id ? employee : e) })),
      addLead: (lead) => set((state) => ({ leads: [lead, ...state.leads] })),
      updateLead: (lead) => set((state) => ({ leads: state.leads.map(l => l.id === lead.id ? lead : l) })),
      addDeal: (deal) => set((state) => ({ deals: [deal, ...state.deals] })),
      updateDeal: (deal) => set((state) => ({ deals: state.deals.map(d => d.id === deal.id ? deal : d) })),
      addAccount: (account) => set((state) => ({ accounts: [account, ...state.accounts] })),
      updateAccount: (account) => set((state) => ({ accounts: state.accounts.map(a => a.id === account.id ? account : a) })),

      // HR Actions
      updateApprovalRequest: (id, status) => set((state) => ({ 
          approvalRequests: state.approvalRequests.map(req => req.id === id ? { ...req, status } : req) 
      })),
      updatePayrollStatus: (status, step) => set((state) => ({ 
          payrollRun: { ...state.payrollRun, status, stepsCompleted: step !== undefined ? step : state.payrollRun.stepsCompleted } 
      })),

      // Academy Actions Implementation
      updateLessonStatus: (moduleId, lessonId, status, score, artifact) => set((state) => {
          const key = `${moduleId}-${lessonId}`;
          const current = state.academyProgress[key] || {};
          return {
              academyProgress: {
                  ...state.academyProgress,
                  [key]: { 
                    ...current, 
                    status, 
                    score: score ?? current.score, 
                    labArtifact: artifact ?? current.labArtifact, 
                    completedAt: status === 'completed' ? new Date().toISOString() : current.completedAt
                  }
              }
          };
      }),

      resetProgress: () => set({ academyProgress: {} }),

      initializeAcademy: () => {
          const currentProgress = get().academyProgress;
          // Only initialize if empty
          if (Object.keys(currentProgress).length > 0) return;

          // Pre-populate completed modules for the demo experience
          const initialProgress: Record<string, LessonProgress> = {
              '1-m1-l1': { status: 'completed', score: 95, completedAt: new Date('2024-10-01').toISOString() },
              '1-m1-l2': { status: 'completed', score: 100, completedAt: new Date('2024-10-02').toISOString() },
              '1-m1-l3': { status: 'completed', score: 85, completedAt: new Date('2024-10-03').toISOString() },
              '3-m3-l1': { status: 'completed', score: 90, completedAt: new Date('2024-10-05').toISOString() },
              '3-m3-l2': { status: 'completed', score: 80, completedAt: new Date('2024-10-06').toISOString() },
              '3-m3-l3': { status: 'completed', score: 100, completedAt: new Date('2024-10-07').toISOString() },
              '5-m5-l1': { status: 'completed', score: 92, completedAt: new Date('2024-10-10').toISOString() },
              '5-m5-l2': { status: 'completed', score: 88, completedAt: new Date('2024-10-12').toISOString() },
              // The active lesson for demo purposes
              '5-m5-l3': { status: 'unlocked' } 
          };
          set({ academyProgress: initialProgress });
      }
    }),
    {
      name: 'intime-academy-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        academyProgress: state.academyProgress,
        isSprintActive: state.isSprintActive,
        activeRole: state.activeRole,
        leads: state.leads,
        deals: state.deals,
        accounts: state.accounts,
        jobs: state.jobs,
        candidates: state.candidates,
        submissions: state.submissions,
        employees: state.employees,
        approvalRequests: state.approvalRequests,
        payrollRun: state.payrollRun
      }),
    }
  )
);
