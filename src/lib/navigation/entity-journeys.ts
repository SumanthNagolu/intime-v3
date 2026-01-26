import {
  Briefcase, Search, Users, Calendar, FileText, CheckCircle,
  UserCheck, ClipboardCheck, Send, Building2, Target, Handshake,
  DollarSign, Award, Phone, Star, TrendingUp, Package,
  PauseCircle, PlayCircle, Edit, XCircle, MessageSquare, Plus,
  UserCircle, Mail, Megaphone, BarChart3, Pause, Play,
  Settings, UserPlus, Rocket, Heart, Flag, Copy, Download,
  Receipt, CreditCard, Clock, Calculator, Wallet, Link2,
  Trophy, StickyNote, ArrowRight, UserMinus, RefreshCw, Archive,
  Shield, UsersRound,
} from 'lucide-react'
import { EntityJourneyConfig, EntityType } from './entity-navigation.types'

export const entityJourneys: Record<EntityType, EntityJourneyConfig> = {
  job: {
    entityType: 'job',
    steps: [
      {
        id: 'info',
        label: 'Job Info',
        icon: Briefcase,
        description: 'Job requirements and details',
        activeStatuses: ['draft'],
        completedStatuses: ['open', 'active', 'on_hold', 'filled', 'cancelled'],
        defaultTab: 'overview',
      },
      {
        id: 'sourcing',
        label: 'Sourcing',
        icon: Search,
        description: 'Finding candidates',
        activeStatuses: ['open'],
        completedStatuses: ['active', 'on_hold', 'filled'],
        defaultTab: 'pipeline',
      },
      {
        id: 'pipeline',
        label: 'Pipeline',
        icon: Users,
        description: 'Managing submissions',
        activeStatuses: ['active'],
        completedStatuses: ['filled'],
        defaultTab: 'pipeline',
      },
      {
        id: 'interviews',
        label: 'Interviews',
        icon: Calendar,
        description: 'Client interviews',
        activeStatuses: ['active'], // Sub-state based on submissions
        completedStatuses: ['filled'],
        defaultTab: 'pipeline',
      },
      {
        id: 'offers',
        label: 'Offers',
        icon: FileText,
        description: 'Offer management',
        activeStatuses: ['active'], // Sub-state based on submissions
        completedStatuses: ['filled'],
        defaultTab: 'pipeline',
      },
      {
        id: 'placement',
        label: 'Placement',
        icon: CheckCircle,
        description: 'Confirmed placements',
        activeStatuses: ['filled'],
        completedStatuses: [],
        defaultTab: 'overview',
      },
    ],
    quickActions: [
      // Primary edit action
      {
        id: 'edit',
        label: 'Edit Job',
        icon: Edit,
        actionType: 'navigate',
        href: '/employee/recruiting/jobs/new?edit=:id',
        hideForStatuses: ['filled', 'cancelled'],
      },
      // Primary creation actions (like account pattern)
      {
        id: 'add-submission',
        label: '+ Add Submission',
        icon: Send,
        actionType: 'navigate',
        href: '/employee/recruiting/jobs/:id/submissions/new',
        hideForStatuses: ['draft', 'filled', 'cancelled', 'on_hold'],
      },
      {
        id: 'add-candidate',
        label: '+ Add Candidate',
        icon: UserPlus,
        actionType: 'navigate',
        href: '/employee/recruiting/jobs/:id/add-candidate',
        hideForStatuses: ['draft', 'filled', 'cancelled'],
      },
      {
        id: 'activity',
        label: 'Log Activity',
        icon: Phone,
        actionType: 'dialog',
        dialogId: 'logActivity',
      },
      // Status actions
      {
        id: 'hold',
        label: 'Put on Hold',
        icon: PauseCircle,
        actionType: 'dialog',
        dialogId: 'updateStatus',
        showForStatuses: ['open', 'active'],
      },
      {
        id: 'resume',
        label: 'Resume Job',
        icon: PlayCircle,
        actionType: 'dialog',
        dialogId: 'updateStatus',
        showForStatuses: ['on_hold'],
      },
      {
        id: 'close',
        label: 'Close Job',
        icon: XCircle,
        actionType: 'dialog',
        dialogId: 'closeJob',
        variant: 'destructive',
        hideForStatuses: ['draft', 'filled', 'cancelled'],
      },
    ],
  },

  candidate: {
    entityType: 'candidate',
    steps: [
      {
        id: 'profile',
        label: 'Profile',
        icon: UserCheck,
        description: 'Candidate information',
        activeStatuses: ['sourced', 'new'],
        completedStatuses: ['screening', 'bench', 'active', 'placed'],
      },
      {
        id: 'screening',
        label: 'Screening',
        icon: ClipboardCheck,
        description: 'Initial assessment',
        activeStatuses: ['screening'],
        completedStatuses: ['bench', 'active', 'placed'],
      },
      {
        id: 'submissions',
        label: 'Submissions',
        icon: Send,
        description: 'Job submissions',
        activeStatuses: ['bench', 'active'],
        completedStatuses: ['placed'],
      },
      {
        id: 'placed',
        label: 'Placed',
        icon: Award,
        description: 'Active placement',
        activeStatuses: ['placed'],
        completedStatuses: [],
      },
    ],
    quickActions: [
      // Primary actions
      {
        id: 'edit',
        label: 'Edit Candidate',
        icon: Edit,
        actionType: 'navigate',
        href: '/employee/recruiting/candidates/:id/edit',
      },
      {
        id: 'submit',
        label: 'Submit to Job',
        icon: Send,
        actionType: 'dialog',
        dialogId: 'submitToJob',
        hideForStatuses: ['placed', 'inactive', 'archived'],
      },
      // Communication actions
      {
        id: 'note',
        label: 'Add Note',
        icon: FileText,
        actionType: 'dialog',
        dialogId: 'addNote',
      },
      {
        id: 'call',
        label: 'Schedule Call',
        icon: Phone,
        actionType: 'dialog',
        dialogId: 'scheduleCall',
      },
      {
        id: 'activity',
        label: 'Log Activity',
        icon: MessageSquare,
        actionType: 'dialog',
        dialogId: 'logActivity',
      },
      // Document actions
      {
        id: 'upload-resume',
        label: 'Upload Resume',
        icon: FileText,
        actionType: 'dialog',
        dialogId: 'uploadResume',
      },
      // Status actions
      {
        id: 'screen',
        label: 'Start Screening',
        icon: ClipboardCheck,
        actionType: 'dialog',
        dialogId: 'startScreening',
        showForStatuses: ['sourced', 'new'],
      },
      {
        id: 'update-status',
        label: 'Update Status',
        icon: TrendingUp,
        actionType: 'dialog',
        dialogId: 'updateCandidateStatus',
        hideForStatuses: ['archived'],
      },
      {
        id: 'hotlist',
        label: 'Add to Hotlist',
        icon: Star,
        actionType: 'mutation',
        hideForStatuses: ['inactive', 'archived'],
      },
      {
        id: 'mark-inactive',
        label: 'Mark Inactive',
        icon: XCircle,
        actionType: 'dialog',
        dialogId: 'markInactive',
        variant: 'destructive',
        hideForStatuses: ['inactive', 'archived', 'placed'],
      },
    ],
  },

  account: {
    entityType: 'account',
    steps: [
      {
        id: 'profile',
        label: 'Company Profile',
        icon: Building2,
        description: 'Account information',
        activeStatuses: ['prospect'],
        completedStatuses: ['active'],
        defaultTab: 'overview',
      },
      {
        id: 'contacts',
        label: 'Contacts',
        icon: Users,
        description: 'Key contacts',
        activeStatuses: ['prospect', 'active'],
        completedStatuses: [],
        defaultTab: 'contacts',
      },
      {
        id: 'contracts',
        label: 'Contracts & Terms',
        icon: FileText,
        description: 'Business terms',
        activeStatuses: ['active'],
        completedStatuses: [],
        defaultTab: 'overview',
      },
      {
        id: 'jobs',
        label: 'Active Jobs',
        icon: Briefcase,
        description: 'Job requisitions',
        activeStatuses: ['active'],
        completedStatuses: [],
        defaultTab: 'jobs',
      },
      {
        id: 'placements',
        label: 'Placements',
        icon: Award,
        description: 'Placement history',
        activeStatuses: ['active'],
        completedStatuses: [],
        defaultTab: 'placements',
      },
    ],
    quickActions: [
      {
        id: 'edit',
        label: 'Edit Account',
        icon: Edit,
        actionType: 'navigate',
        href: '/employee/recruiting/accounts/new?edit=:id'
      },
      {
        id: 'new-account',
        label: '+ New Account',
        icon: Building2,
        actionType: 'navigate',
        href: '/employee/recruiting/accounts/new'
      },
      {
        id: 'contact',
        label: '+ New Contact',
        icon: UserPlus,
        actionType: 'dialog',
        dialogId: 'addContact'
      },
      {
        id: 'link-contact',
        label: 'Link Contact',
        icon: Link2,
        actionType: 'dialog',
        dialogId: 'linkContact'
      },
      {
        id: 'job',
        label: 'New Job',
        icon: Briefcase,
        actionType: 'dialog',
        dialogId: 'jobIntake'
      },
      {
        id: 'activity',
        label: 'Log Activity',
        icon: Phone,
        actionType: 'dialog',
        dialogId: 'logActivity'
      },
    ],
  },

  contact: {
    entityType: 'contact',
    // Contact uses section-based navigation (not journey steps)
    // Steps array kept for backward compatibility
    steps: [
      {
        id: 'profile',
        label: 'Contact Profile',
        icon: UserCircle,
        description: 'Contact information',
        activeStatuses: ['active'],
        completedStatuses: [],
        defaultTab: 'summary',
      },
    ],
    quickActions: [
      // Edit action
      {
        id: 'edit',
        label: 'Edit Contact',
        icon: Edit,
        actionType: 'navigate',
        href: '/employee/contacts/:id/edit',
      },

      // Communication actions (Person)
      {
        id: 'email',
        label: 'Email Contact',
        icon: Mail,
        actionType: 'navigate',
        href: 'mailto::email',
      },
      {
        id: 'call',
        label: 'Call',
        icon: Phone,
        actionType: 'navigate',
        href: 'tel::phone',
      },

      // Common actions
      {
        id: 'add-note',
        label: 'Add Note',
        icon: StickyNote,
        actionType: 'dialog',
        dialogId: 'addNote',
      },
      {
        id: 'schedule-meeting',
        label: 'Schedule Meeting',
        icon: Calendar,
        actionType: 'dialog',
        dialogId: 'scheduleMeeting',
      },
      {
        id: 'log-activity',
        label: 'Log Activity',
        icon: Phone,
        actionType: 'dialog',
        dialogId: 'logActivity',
      },

      // Person-specific actions
      {
        id: 'add-to-campaign',
        label: 'Add to Campaign',
        icon: Target,
        actionType: 'dialog',
        dialogId: 'addToCampaign',
      },
      {
        id: 'convert-to-candidate',
        label: 'Convert to Candidate',
        icon: UserPlus,
        actionType: 'mutation',
        // Note: This should be hidden for contacts already marked as candidates
      },

      // Company-specific actions
      {
        id: 'add-contact',
        label: 'Add Contact',
        icon: UserPlus,
        actionType: 'dialog',
        dialogId: 'addContact',
      },
      {
        id: 'add-job',
        label: 'Add Job',
        icon: Briefcase,
        actionType: 'dialog',
        dialogId: 'addJob',
      },
    ],
  },

  submission: {
    entityType: 'submission',
    steps: [
      {
        id: 'sourced',
        label: 'Sourced',
        icon: Search,
        description: 'Candidate sourced',
        activeStatuses: ['sourced'],
        completedStatuses: ['screening', 'submission_ready', 'submitted_to_client', 'client_review', 'client_interview', 'offer_stage', 'placed']
      },
      {
        id: 'screening',
        label: 'Screening',
        icon: ClipboardCheck,
        description: 'Internal screening',
        activeStatuses: ['screening'],
        completedStatuses: ['submission_ready', 'submitted_to_client', 'client_review', 'client_interview', 'offer_stage', 'placed']
      },
      {
        id: 'submission',
        label: 'Submission',
        icon: Send,
        description: 'Ready for client',
        activeStatuses: ['submission_ready', 'submitted_to_client'],
        completedStatuses: ['client_review', 'client_interview', 'offer_stage', 'placed']
      },
      {
        id: 'review',
        label: 'Client Review',
        icon: Users,
        description: 'Client reviewing',
        activeStatuses: ['client_review'],
        completedStatuses: ['client_interview', 'offer_stage', 'placed']
      },
      {
        id: 'interview',
        label: 'Interview',
        icon: Calendar,
        description: 'Interview stage',
        activeStatuses: ['client_interview'],
        completedStatuses: ['offer_stage', 'placed']
      },
      {
        id: 'offer',
        label: 'Offer',
        icon: FileText,
        description: 'Offer stage',
        activeStatuses: ['offer_stage'],
        completedStatuses: ['placed']
      },
      {
        id: 'placed',
        label: 'Placed',
        icon: CheckCircle,
        description: 'Placement confirmed',
        activeStatuses: ['placed'],
        completedStatuses: []
      },
    ],
    quickActions: [
      {
        id: 'advance',
        label: 'Advance Status',
        icon: TrendingUp,
        actionType: 'dialog',
        dialogId: 'updateSubmissionStatus',
        hideForStatuses: ['placed', 'rejected', 'withdrawn'],
      },
      {
        id: 'schedule',
        label: 'Schedule Interview',
        icon: Calendar,
        actionType: 'dialog',
        dialogId: 'scheduleInterview',
        showForStatuses: ['client_review', 'client_interview'],
      },
      {
        id: 'withdraw',
        label: 'Withdraw',
        icon: XCircle,
        actionType: 'dialog',
        dialogId: 'withdrawSubmission',
        variant: 'destructive',
        hideForStatuses: ['placed', 'rejected', 'withdrawn'],
      },
    ],
  },

  placement: {
    entityType: 'placement',
    steps: [
      {
        id: 'pending',
        label: 'Pending Start',
        icon: Calendar,
        description: 'Awaiting start date',
        activeStatuses: ['pending_start'],
        completedStatuses: ['active', 'extended', 'ended']
      },
      {
        id: 'active',
        label: 'Active',
        icon: CheckCircle,
        description: 'Currently placed',
        activeStatuses: ['active'],
        completedStatuses: ['extended', 'ended']
      },
      {
        id: 'extended',
        label: 'Extended',
        icon: TrendingUp,
        description: 'Contract extended',
        activeStatuses: ['extended'],
        completedStatuses: ['ended']
      },
      {
        id: 'ended',
        label: 'Ended',
        icon: Package,
        description: 'Placement completed',
        activeStatuses: ['ended'],
        completedStatuses: []
      },
    ],
    quickActions: [
      {
        id: 'extend',
        label: 'Extend Placement',
        icon: TrendingUp,
        actionType: 'dialog',
        dialogId: 'extendPlacement',
        showForStatuses: ['active', 'extended'],
      },
      {
        id: 'checkin',
        label: 'Log Check-in',
        icon: Phone,
        actionType: 'dialog',
        dialogId: 'placementCheckin',
        showForStatuses: ['active', 'extended'],
      },
      {
        id: 'end',
        label: 'End Placement',
        icon: Package,
        actionType: 'dialog',
        dialogId: 'endPlacement',
        variant: 'destructive',
        showForStatuses: ['active', 'extended'],
      },
    ],
  },

  lead: {
    entityType: 'lead',
    steps: [
      {
        id: 'new',
        label: 'New',
        icon: Target,
        description: 'New lead',
        activeStatuses: ['new'],
        completedStatuses: ['contacted', 'qualified', 'converted']
      },
      {
        id: 'contacted',
        label: 'Contacted',
        icon: Phone,
        description: 'Initial contact made',
        activeStatuses: ['contacted'],
        completedStatuses: ['qualified', 'converted']
      },
      {
        id: 'qualified',
        label: 'Qualified',
        icon: Star,
        description: 'Lead qualified',
        activeStatuses: ['qualified'],
        completedStatuses: ['converted']
      },
      {
        id: 'converted',
        label: 'Converted',
        icon: Handshake,
        description: 'Converted to opportunity',
        activeStatuses: ['converted'],
        completedStatuses: []
      },
    ],
    quickActions: [
      // Primary edit action
      {
        id: 'edit',
        label: 'Edit Lead',
        icon: Edit,
        actionType: 'navigate',
        href: '/employee/crm/leads/:id/edit'
      },
      // Communication actions
      {
        id: 'email',
        label: 'Send Email',
        icon: Mail,
        actionType: 'navigate',
        hideForStatuses: ['converted', 'lost'],
      },
      {
        id: 'call',
        label: 'Call Lead',
        icon: Phone,
        actionType: 'navigate',
        hideForStatuses: ['converted', 'lost'],
      },
      // Activity actions
      {
        id: 'add_note',
        label: 'Add Note',
        icon: StickyNote,
        actionType: 'dialog',
        dialogId: 'addNote'
      },
      {
        id: 'schedule_meeting',
        label: 'Schedule Meeting',
        icon: Calendar,
        actionType: 'dialog',
        dialogId: 'scheduleMeeting',
        hideForStatuses: ['converted', 'lost'],
      },
      // Qualification actions
      {
        id: 'qualify',
        label: 'Update BANT',
        icon: Star,
        actionType: 'dialog',
        dialogId: 'qualifyLead',
        hideForStatuses: ['converted', 'lost'],
      },
      // Conversion actions
      {
        id: 'convert',
        label: 'Convert to Deal',
        icon: TrendingUp,
        actionType: 'dialog',
        dialogId: 'convertLead',
        showForStatuses: ['qualified'],
      },
      {
        id: 'convertToAccount',
        label: 'Convert to Account',
        icon: Building2,
        actionType: 'dialog',
        dialogId: 'convertToAccount',
        hideForStatuses: ['converted', 'lost'],
      },
      {
        id: 'convertToContact',
        label: 'Convert to Contact',
        icon: UserCircle,
        actionType: 'dialog',
        dialogId: 'convertToContact',
        hideForStatuses: ['converted', 'lost'],
      },
      {
        id: 'convertToCandidate',
        label: 'Convert to Candidate',
        icon: UserPlus,
        actionType: 'dialog',
        dialogId: 'convertToCandidate',
        hideForStatuses: ['converted', 'lost'],
      },
      {
        id: 'disqualify',
        label: 'Disqualify',
        icon: XCircle,
        actionType: 'mutation',
        variant: 'destructive',
        hideForStatuses: ['converted', 'lost'],
      },
    ],
  },

  deal: {
    entityType: 'deal',
    steps: [
      {
        id: 'discovery',
        label: 'Discovery',
        icon: Search,
        description: 'Understanding needs',
        activeStatuses: ['discovery'],
        completedStatuses: ['qualification', 'proposal', 'negotiation', 'verbal_commit', 'closed_won']
      },
      {
        id: 'qualification',
        label: 'Qualification',
        icon: Star,
        description: 'Qualifying opportunity',
        activeStatuses: ['qualification'],
        completedStatuses: ['proposal', 'negotiation', 'verbal_commit', 'closed_won']
      },
      {
        id: 'proposal',
        label: 'Proposal',
        icon: FileText,
        description: 'Proposal sent',
        activeStatuses: ['proposal'],
        completedStatuses: ['negotiation', 'verbal_commit', 'closed_won']
      },
      {
        id: 'negotiation',
        label: 'Negotiation',
        icon: Handshake,
        description: 'Terms negotiation',
        activeStatuses: ['negotiation'],
        completedStatuses: ['verbal_commit', 'closed_won']
      },
      {
        id: 'verbal_commit',
        label: 'Verbal Commit',
        icon: CheckCircle,
        description: 'Verbal agreement',
        activeStatuses: ['verbal_commit'],
        completedStatuses: ['closed_won']
      },
      {
        id: 'closed',
        label: 'Closed',
        icon: DollarSign,
        description: 'Deal closed',
        activeStatuses: ['closed_won', 'closed_lost'],
        completedStatuses: []
      },
    ],
    quickActions: [
      // Primary edit action
      {
        id: 'edit',
        label: 'Edit Deal',
        icon: Edit,
        actionType: 'navigate',
        href: '/employee/crm/deals/:id/edit',
        hideForStatuses: ['closed_won', 'closed_lost'],
      },
      // Stage progression
      {
        id: 'advanceStage',
        label: 'Advance Stage',
        icon: ArrowRight,
        actionType: 'dialog',
        dialogId: 'advanceStage',
        hideForStatuses: ['closed_won', 'closed_lost', 'verbal_commit'],
      },
      // Stakeholder management
      {
        id: 'addStakeholder',
        label: 'Add Stakeholder',
        icon: UserPlus,
        actionType: 'dialog',
        dialogId: 'addStakeholder',
      },
      // Meeting scheduling
      {
        id: 'scheduleMeeting',
        label: 'Schedule Meeting',
        icon: Calendar,
        actionType: 'dialog',
        dialogId: 'scheduleMeeting',
        hideForStatuses: ['closed_won', 'closed_lost'],
      },
      // Note taking
      {
        id: 'addNote',
        label: 'Add Note',
        icon: StickyNote,
        actionType: 'dialog',
        dialogId: 'addNote',
      },
      // Activity logging
      {
        id: 'activity',
        label: 'Log Activity',
        icon: Phone,
        actionType: 'dialog',
        dialogId: 'logDealActivity',
      },
      // Close actions
      {
        id: 'markWon',
        label: 'Mark as Won',
        icon: Trophy,
        actionType: 'dialog',
        dialogId: 'closeDealWon',
        showForStatuses: ['proposal', 'negotiation', 'verbal_commit'],
      },
      {
        id: 'markLost',
        label: 'Mark as Lost',
        icon: XCircle,
        actionType: 'dialog',
        dialogId: 'closeDealLost',
        variant: 'destructive',
        hideForStatuses: ['closed_won', 'closed_lost'],
      },
    ],
  },

  /**
   * Campaign Journey - Enterprise 5-Step Workflow
   *
   * This journey guides users through the complete campaign lifecycle:
   *
   * 1. SETUP: Configure campaign settings, goals, channels, and templates
   * 2. AUDIENCE: Build prospect list, import contacts, define segments
   * 3. EXECUTE: Launch sequences, monitor sends, track engagement
   * 4. NURTURE: Follow up with engaged prospects, qualify leads
   * 5. CLOSE: Complete campaign, analyze results, document learnings
   *
   * The journey supports both sequential workflow (Journey Mode) and
   * random-access navigation (Sections Mode) for flexible campaign management.
   */
  campaign: {
    entityType: 'campaign',
    steps: [
      {
        id: 'setup',
        label: 'Setup',
        icon: Settings,
        description: 'Configure campaign settings, goals, and channels',
        activeStatuses: ['draft'],
        completedStatuses: ['scheduled', 'active', 'paused', 'completed'],
        defaultTab: 'overview',
        // Checklist items for this step:
        // - Campaign name and type defined
        // - Goal description added
        // - Target metrics set (leads, meetings, budget)
        // - Channels selected (email, LinkedIn, phone)
        // - Email templates configured
        // - Start/end dates set
      },
      {
        id: 'audience',
        label: 'Audience',
        icon: UserPlus,
        description: 'Build and refine your prospect list',
        activeStatuses: ['draft', 'scheduled'],
        completedStatuses: ['active', 'paused', 'completed'],
        defaultTab: 'prospects',
        // Checklist items for this step:
        // - Target audience criteria defined
        // - Prospects imported (minimum 10)
        // - Duplicates removed
        // - Invalid contacts cleaned
        // - Segments assigned
      },
      {
        id: 'execute',
        label: 'Execute',
        icon: Rocket,
        description: 'Launch and monitor outreach sequences',
        activeStatuses: ['active'],
        completedStatuses: ['paused', 'completed'],
        defaultTab: 'sequence',
        // Checklist items for this step:
        // - First batch sent
        // - Open/click tracking enabled
        // - Response monitoring active
        // - LinkedIn automation connected (if applicable)
      },
      {
        id: 'nurture',
        label: 'Nurture',
        icon: Heart,
        description: 'Follow up with engaged prospects',
        activeStatuses: ['active'],
        completedStatuses: ['completed'],
        defaultTab: 'leads',
        // Checklist items for this step:
        // - Responded prospects identified
        // - Follow-up tasks created
        // - Meetings scheduled
        // - Leads qualified (BANT)
      },
      {
        id: 'close',
        label: 'Close',
        icon: Flag,
        description: 'Complete campaign and analyze results',
        activeStatuses: ['completed'],
        completedStatuses: [],
        defaultTab: 'analytics',
        // Checklist items for this step:
        // - All sequences completed
        // - Final metrics captured
        // - ROI calculated
        // - Learnings documented
      },
    ],
    quickActions: [
      // Primary status actions
      {
        id: 'start',
        label: 'Start Campaign',
        icon: Play,
        actionType: 'mutation',
        showForStatuses: ['draft', 'scheduled'],
        variant: 'default',
      },
      {
        id: 'resume',
        label: 'Resume',
        icon: Play,
        actionType: 'mutation',
        showForStatuses: ['paused'],
      },
      {
        id: 'pause',
        label: 'Pause',
        icon: Pause,
        actionType: 'mutation',
        showForStatuses: ['active'],
        variant: 'outline',
      },

      // Prospect management
      {
        id: 'add-prospect',
        label: 'Add Prospect',
        icon: UserPlus,
        actionType: 'dialog',
        dialogId: 'addProspect',
        hideForStatuses: ['completed'],
      },
      {
        id: 'import-prospects',
        label: 'Import Prospects',
        icon: Download,
        actionType: 'dialog',
        dialogId: 'importProspects',
        showForStatuses: ['draft', 'scheduled'],
      },

      // Campaign management
      {
        id: 'edit',
        label: 'Edit Campaign',
        icon: Edit,
        actionType: 'dialog',
        dialogId: 'editCampaign',
        hideForStatuses: ['completed'],
      },
      {
        id: 'complete',
        label: 'Complete Campaign',
        icon: CheckCircle,
        actionType: 'dialog',
        dialogId: 'completeCampaign',
        showForStatuses: ['active', 'paused'],
      },

      // Tools
      {
        id: 'activity',
        label: 'Log Activity',
        icon: Phone,
        actionType: 'dialog',
        dialogId: 'logActivity',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        actionType: 'navigate',
        href: '/employee/crm/campaigns/:id?section=analytics',
      },
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: Copy,
        actionType: 'dialog',
        dialogId: 'duplicateCampaign',
      },
    ],
  },

  // Finance Entities
  invoice: {
    entityType: 'invoice',
    steps: [
      {
        id: 'draft',
        label: 'Draft',
        icon: FileText,
        description: 'Invoice created',
        activeStatuses: ['draft'],
        completedStatuses: ['pending_approval', 'approved', 'sent', 'viewed', 'partially_paid', 'paid'],
        defaultTab: 'overview',
      },
      {
        id: 'approval',
        label: 'Approval',
        icon: CheckCircle,
        description: 'Awaiting approval',
        activeStatuses: ['pending_approval'],
        completedStatuses: ['approved', 'sent', 'viewed', 'partially_paid', 'paid'],
        defaultTab: 'overview',
      },
      {
        id: 'sent',
        label: 'Sent',
        icon: Send,
        description: 'Sent to client',
        activeStatuses: ['approved', 'sent', 'viewed'],
        completedStatuses: ['partially_paid', 'paid'],
        defaultTab: 'overview',
      },
      {
        id: 'payment',
        label: 'Payment',
        icon: DollarSign,
        description: 'Payment processing',
        activeStatuses: ['partially_paid'],
        completedStatuses: ['paid'],
        defaultTab: 'payments',
      },
      {
        id: 'paid',
        label: 'Paid',
        icon: Wallet,
        description: 'Fully paid',
        activeStatuses: ['paid'],
        completedStatuses: [],
        defaultTab: 'overview',
      },
    ],
    quickActions: [
      {
        id: 'edit',
        label: 'Edit Invoice',
        icon: Edit,
        actionType: 'navigate',
        href: '/employee/finance/invoices/:id/edit',
        showForStatuses: ['draft'],
      },
      {
        id: 'approve',
        label: 'Approve',
        icon: CheckCircle,
        actionType: 'mutation',
        showForStatuses: ['pending_approval'],
      },
      {
        id: 'send',
        label: 'Send Invoice',
        icon: Send,
        actionType: 'mutation',
        showForStatuses: ['approved'],
      },
      {
        id: 'payment',
        label: 'Record Payment',
        icon: DollarSign,
        actionType: 'dialog',
        dialogId: 'recordPayment',
        showForStatuses: ['sent', 'viewed', 'partially_paid', 'overdue'],
      },
      {
        id: 'void',
        label: 'Void Invoice',
        icon: XCircle,
        actionType: 'dialog',
        dialogId: 'voidInvoice',
        variant: 'destructive',
        hideForStatuses: ['paid', 'void', 'written_off'],
      },
    ],
  },

  pay_run: {
    entityType: 'pay_run',
    steps: [
      {
        id: 'draft',
        label: 'Draft',
        icon: FileText,
        description: 'Pay run created',
        activeStatuses: ['draft'],
        completedStatuses: ['calculating', 'pending_approval', 'approved', 'submitted', 'processing', 'completed'],
        defaultTab: 'overview',
      },
      {
        id: 'calculate',
        label: 'Calculate',
        icon: Calculator,
        description: 'Calculating pay',
        activeStatuses: ['calculating'],
        completedStatuses: ['pending_approval', 'approved', 'submitted', 'processing', 'completed'],
        defaultTab: 'payItems',
      },
      {
        id: 'approval',
        label: 'Approval',
        icon: CheckCircle,
        description: 'Awaiting approval',
        activeStatuses: ['pending_approval'],
        completedStatuses: ['approved', 'submitted', 'processing', 'completed'],
        defaultTab: 'overview',
      },
      {
        id: 'process',
        label: 'Process',
        icon: CreditCard,
        description: 'Processing payments',
        activeStatuses: ['approved', 'submitted', 'processing'],
        completedStatuses: ['completed'],
        defaultTab: 'overview',
      },
      {
        id: 'completed',
        label: 'Completed',
        icon: Wallet,
        description: 'Pay run complete',
        activeStatuses: ['completed'],
        completedStatuses: [],
        defaultTab: 'overview',
      },
    ],
    quickActions: [
      {
        id: 'calculate',
        label: 'Calculate',
        icon: Calculator,
        actionType: 'mutation',
        showForStatuses: ['draft'],
      },
      {
        id: 'approve',
        label: 'Approve',
        icon: CheckCircle,
        actionType: 'mutation',
        showForStatuses: ['pending_approval'],
      },
      {
        id: 'process',
        label: 'Process',
        icon: CreditCard,
        actionType: 'mutation',
        showForStatuses: ['approved', 'submitted'],
      },
      {
        id: 'void',
        label: 'Void Pay Run',
        icon: XCircle,
        actionType: 'dialog',
        dialogId: 'voidPayRun',
        variant: 'destructive',
        showForStatuses: ['draft', 'calculating', 'pending_approval'],
      },
    ],
  },

  timesheet: {
    entityType: 'timesheet',
    steps: [
      {
        id: 'draft',
        label: 'Draft',
        icon: Clock,
        description: 'Time entry',
        activeStatuses: ['draft'],
        completedStatuses: ['submitted', 'approved', 'processed'],
        defaultTab: 'overview',
      },
      {
        id: 'submitted',
        label: 'Submitted',
        icon: Send,
        description: 'Awaiting approval',
        activeStatuses: ['submitted'],
        completedStatuses: ['approved', 'processed'],
        defaultTab: 'overview',
      },
      {
        id: 'approved',
        label: 'Approved',
        icon: CheckCircle,
        description: 'Ready for payroll',
        activeStatuses: ['approved'],
        completedStatuses: ['processed'],
        defaultTab: 'overview',
      },
      {
        id: 'processed',
        label: 'Processed',
        icon: Wallet,
        description: 'Included in payroll',
        activeStatuses: ['processed'],
        completedStatuses: [],
        defaultTab: 'overview',
      },
    ],
    quickActions: [
      {
        id: 'edit',
        label: 'Edit Timesheet',
        icon: Edit,
        actionType: 'navigate',
        href: '/employee/recruiting/timesheets/:id/edit',
        showForStatuses: ['draft'],
      },
      {
        id: 'submit',
        label: 'Submit',
        icon: Send,
        actionType: 'mutation',
        showForStatuses: ['draft'],
      },
      {
        id: 'approve',
        label: 'Approve',
        icon: CheckCircle,
        actionType: 'mutation',
        showForStatuses: ['submitted'],
      },
      {
        id: 'reject',
        label: 'Reject',
        icon: XCircle,
        actionType: 'dialog',
        dialogId: 'rejectTimesheet',
        variant: 'destructive',
        showForStatuses: ['submitted'],
      },
    ],
  },
  interview: {
    entityType: 'interview',
    // Interviews use section-based navigation, but we still need an entry for type safety
    steps: [
      {
        id: 'scheduled',
        label: 'Scheduled',
        icon: Calendar,
        description: 'Interview scheduled',
        activeStatuses: ['proposed', 'scheduled', 'confirmed'],
        completedStatuses: ['completed', 'cancelled', 'no_show'],
        defaultTab: 'overview',
      },
      {
        id: 'in_progress',
        label: 'In Progress',
        icon: Clock,
        description: 'Interview in progress',
        activeStatuses: ['in_progress'],
        completedStatuses: ['completed'],
        defaultTab: 'overview',
      },
      {
        id: 'completed',
        label: 'Completed',
        icon: CheckCircle,
        description: 'Interview completed',
        activeStatuses: ['completed'],
        completedStatuses: [],
        defaultTab: 'feedback',
      },
    ],
    quickActions: [
      {
        id: 'join-meeting',
        label: 'Join Meeting',
        icon: Play,
        actionType: 'navigate',
        showForStatuses: ['scheduled', 'confirmed'],
      },
      {
        id: 'reschedule',
        label: 'Reschedule',
        icon: Calendar,
        actionType: 'dialog',
        dialogId: 'rescheduleInterview',
        showForStatuses: ['scheduled', 'confirmed'],
      },
      {
        id: 'submit-feedback',
        label: 'Submit Feedback',
        icon: MessageSquare,
        actionType: 'dialog',
        dialogId: 'submitFeedback',
        showForStatuses: ['completed'],
      },
      {
        id: 'cancel',
        label: 'Cancel Interview',
        icon: XCircle,
        actionType: 'dialog',
        dialogId: 'cancelInterview',
        variant: 'destructive',
        showForStatuses: ['scheduled', 'confirmed'],
      },
    ],
  },

  // Offers use section-based navigation, but we still need an entry for type safety
  offer: {
    entityType: 'offer',
    steps: [],
    quickActions: [],
  },

  /**
   * Team Journey - Section-based workspace for team management
   *
   * Teams use section-based navigation (not journey workflow).
   * Quick actions support team member management and administration.
   */
  team: {
    entityType: 'team',
    steps: [], // Section-based, no journey steps
    quickActions: [
      // Primary edit action
      {
        id: 'edit',
        label: 'Edit Team',
        icon: Edit,
        actionType: 'navigate',
        href: '/employee/settings/teams/:id/edit',
        hideForStatuses: ['archived'],
      },
      // Member management
      {
        id: 'add_member',
        label: 'Add Member',
        icon: UserPlus,
        actionType: 'dialog',
        dialogId: 'addTeamMember',
        hideForStatuses: ['archived'],
      },
      {
        id: 'remove_member',
        label: 'Remove Member',
        icon: UserMinus,
        actionType: 'dialog',
        dialogId: 'removeTeamMember',
        hideForStatuses: ['archived'],
      },
      // Note taking
      {
        id: 'add_note',
        label: 'Add Note',
        icon: StickyNote,
        actionType: 'dialog',
        dialogId: 'addNote',
      },
      // Work management
      {
        id: 'reassign_work',
        label: 'Reassign Work',
        icon: RefreshCw,
        actionType: 'dialog',
        dialogId: 'reassignWork',
        hideForStatuses: ['archived'],
      },
      // Administration
      {
        id: 'edit_permissions',
        label: 'Edit Permissions',
        icon: Shield,
        actionType: 'navigate',
        href: '/employee/settings/teams/:id?section=roles',
        hideForStatuses: ['archived'],
      },
      // Archive action (destructive)
      {
        id: 'archive_team',
        label: 'Archive Team',
        icon: Archive,
        actionType: 'mutation',
        variant: 'destructive',
        hideForStatuses: ['archived'],
      },
    ],
  },
}

// Helper function to get journey config for an entity type
export function getEntityJourney(entityType: EntityType): EntityJourneyConfig {
  return entityJourneys[entityType]
}

// Helper to determine current step index based on status
export function getCurrentStepIndex(entityType: EntityType, status: string): number {
  const journey = entityJourneys[entityType]

  // Find the step where this status is active
  const activeIndex = journey.steps.findIndex(step =>
    step.activeStatuses.includes(status)
  )

  if (activeIndex >= 0) return activeIndex

  // If not found as active, find the last completed step
  for (let i = journey.steps.length - 1; i >= 0; i--) {
    if (journey.steps[i].completedStatuses.includes(status)) {
      return i + 1 // Return the next step after completed
    }
  }

  return 0 // Default to first step
}

// Helper to get visible quick actions based on entity status
export function getVisibleQuickActions(entityType: EntityType, status: string) {
  const journey = entityJourneys[entityType]

  return journey.quickActions.filter(action => {
    // Check if action should be shown for this status
    if (action.showForStatuses && !action.showForStatuses.includes(status)) {
      return false
    }

    // Check if action should be hidden for this status
    if (action.hideForStatuses && action.hideForStatuses.includes(status)) {
      return false
    }

    return true
  })
}
