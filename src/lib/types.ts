
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
}

export interface Slide {
  title: string;
  bullets: string[];
  context?: string;
}

export interface LessonContent {
  theory: {
    slides: (string | Slide)[]; // URLs or text content for slides
    duration: string;
  };
  demo: {
    videoUrl: string;
    duration: string;
    transcript?: string;
  };
  quiz: {
    questions: QuizQuestion[];
    passingScore: number; // e.g., 80%
  };
  lab: {
    title: string;
    instructions: string;
    codeSnippet?: string;
    userStoryId: string; // Links to Blueprint
  };
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'locked';
  content: LessonContent;
  duration?: string;
  type?: 'standard' | 'lab' | 'quiz';
}

export interface Module {
  id: number;
  title: string;
  description?: string;
  progress: number; // 0-100
  week: string; // e.g. "Week 1"
  lessons: Lesson[];
}

export interface Persona {
  name: string;
  title: string;
  experienceLevel: string;
  companies: {
    name: string;
    role: string;
    duration: string;
    description: string;
  }[];
  skills: string[];
  image: string;
}

export interface BlueprintItem {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  moduleRef: number;
  description: string;
  deliverables: string[]; // e.g., "Configured XML", "Gosu Class"
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastModified: Date;
}

export interface InterviewScriptLine {
  speaker: 'Interviewer' | 'SeniorDev';
  text: string;
  duration: number; // ms to read
}

// --- NEW TYPES FOR V3 OS (PRD v1.0) ---

export type Role = 
  | 'student' 
  | 'client' // External Client Portal
  | 'consultant' // External Talent Portal
  | 'admin' // Internal Super Admin
  | 'recruiter' // Internal
  | 'bench_manager' // Internal
  | 'hr_admin' // Internal
  | 'ceo' // Internal
  | 'ta_specialist' // Internal
  | 'academy_admin' // Internal (Academy Coordinator)
  | 'cross_border_specialist'; // Internal

export interface PointOfContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  preference: 'Email' | 'Phone' | 'Text';
  influence: 'Decision Maker' | 'Influencer' | 'Gatekeeper';
}

// CRM Entity: The Client Company
export interface Account {
  id: string;
  name: string;
  industry: string;
  status: 'Prospect' | 'Active' | 'Churned' | 'Hold';
  type: 'Direct Client' | 'MSP/VMS' | 'Implementation Partner';
  accountManagerId: string; // Internal User ID
  logo?: string;
  
  // CRM Metrics
  responsiveness: 'High' | 'Medium' | 'Low';
  preference: 'Quality' | 'Quantity' | 'Speed';
  description?: string;
  pocs: PointOfContact[];
  activityLog?: { date: string; action: string; note?: string }[];
}

// CRM Entity: Lead
export interface Lead {
  id: string;
  company: string;
  firstName: string;
  lastName: string;
  title: string;
  email?: string;
  phone?: string;
  status: 'new' | 'cold' | 'warm' | 'hot' | 'converted';
  value?: string;
  source?: string;
  lastAction?: string;
  notes?: string;
  contact: string;
}

// CRM Entity: Deal
export interface Deal {
  id: string;
  leadId: string; // Links back to lead/company
  company: string;
  title: string; // e.g. "Q4 Staffing Contract"
  value: string;
  stage: 'Prospect' | 'Discovery' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  probability: number;
  expectedClose: string;
  ownerId: string;
  notes?: string;
}

// ATS Entity: The Talent
export interface Candidate {
  id: string;
  name: string;
  role: string;
  // 'status' here refers to their availability/relationship to the firm, NOT a specific job application
  status: 'new' | 'active' | 'placed' | 'bench' | 'student' | 'alumni' | 'blacklisted';
  type: 'external' | 'internal_bench' | 'student';
  skills: string[];
  experience: string;
  location: string;
  rate: string;
  email: string;
  score: number; // AI Score 0-100
  notes?: string;
  source?: 'Academy' | 'LinkedIn' | 'Referral' | 'Recruiting' | 'Academy Sales';
  ownerId?: string; // Recruiter ID
}

// ATS Entity: The Requisition
export interface Job {
  id: string;
  accountId: string; // Link to Account
  title: string;
  status: 'open' | 'filled' | 'urgent' | 'hold' | 'draft';
  type: 'Contract' | 'Full-time' | 'C2H';
  rate: string;
  location: string;
  ownerId: string; // Recruiter ID
  description?: string;
  client: string; // Denormalized for easier display
}

// ATS Entity: The Application (Join Table)
export interface Submission {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'sourced' | 'screening' | 'submission_ready' | 'submitted_to_client' | 'client_interview' | 'offer' | 'placed' | 'rejected';
  createdAt: string;
  lastActivity: string;
  notes?: string;
  matchScore: number;
}

// Legacy Support (To be deprecated or merged into Candidate)
export interface BenchConsultant extends Candidate {
  daysOnBench: number;
  lastContact: string;
  visaStatus: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: 'Engineering' | 'Sales' | 'HR' | 'Product' | 'Recruiting' | 'Bench Sales' | 'Academy' | 'TA';
  startDate: string;
  status: 'Active' | 'Onboarding' | 'Leave' | 'Terminated';
  manager: string;
  location: string;
  salary: string;
  pod?: string; // e.g. "Pod Alpha"
  image?: string;
}

export interface Cohort {
  id: string;
  name: string;
  startDate: string;
  studentsCount: number;
  completionRate: number;
  status: 'Active' | 'Graduated' | 'Planned';
}

export interface Campaign {
  id: string;
  name: string;
  channel: 'LinkedIn' | 'Email' | 'Job Board';
  status: 'Active' | 'Draft' | 'Completed';
  leads: number;
  responseRate: number;
}

export interface ImmigrationCase {
  id: string;
  candidateName: string;
  type: 'H-1B' | 'OPT' | 'L-1';
  status: 'Drafting' | 'Submitted' | 'RFE' | 'Approved';
  daysElapsed: number;
  nextStep: string;
}

// --- HR WORKFLOW TYPES ---

export interface ApprovalRequest {
  id: string;
  type: 'Time Off' | 'Commission' | 'Expense';
  employeeName: string;
  employeeId: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Denied';
  details: Record<string, unknown>; // Flexible payload for specific request types: { start, end, days, reason, conflict? } or { amount, client, placement }
}

export interface PayrollRun {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: 'In Progress' | 'Ready for Approval' | 'Submitted' | 'Paid';
  totalAmount: number;
  employeeCount: number;
  stepsCompleted: number; // 0-7 for the wizard
}

export interface OffboardingTask {
  id: string;
  title: string;
  owner: 'HR' | 'IT' | 'Manager' | 'Payroll';
  status: 'pending' | 'completed';
}
