'use client'

/**
 * AI-Native Staffing OS - Complete Recruiting Lifecycle Demo
 *
 * Full workflow:
 * 1. Create Job (AI-assisted intake)
 * 2. Match & Submit Candidates (AI matching)
 * 3. Track Interviews (AI scheduling & prep)
 * 4. Manage Offers (AI negotiation support)
 * 5. Confirm Placement (AI onboarding kickoff)
 *
 * Design: Ashby-inspired (clean, minimal, keyboard-first)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  Send,
  User,
  Building2,
  Briefcase,
  Calendar,
  MessageSquare,
  ArrowRight,
  X,
  Zap,
  TrendingUp,
  Users,
  FileText,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Star,
  ThumbsUp,
  Play,
  Target,
  Brain,
  Lightbulb,
  RefreshCw,
  Plus,
  Check,
  Circle,
  Video,
  UserCheck,
  Award,
  PartyPopper,
  Handshake,
  ClipboardList,
  Timer,
  CalendarCheck,
  BadgeCheck,
  Gift,
  Rocket,
  Edit3,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// Types
// ============================================

type WorkflowStage = 'dashboard' | 'create-job' | 'job-created' | 'submissions' | 'interviews' | 'offer' | 'placement'

interface Job {
  id: string
  title: string
  client: string
  clientLogo: string
  location: string
  salary: string
  type: string
  skills: string[]
  description: string
  status: 'draft' | 'open' | 'interviewing' | 'offer' | 'filled'
  submissions: number
  interviews: number
  createdAt: string
}

interface Candidate {
  id: string
  name: string
  initials: string
  title: string
  company: string
  experience: string
  location: string
  matchScore: number
  skills: string[]
  salary: string
  availability: string
  status: 'matched' | 'submitted' | 'interviewing' | 'offer' | 'placed'
  aiReason: string
}

interface Interview {
  id: string
  candidate: Candidate
  type: string
  stage: string
  date: string
  time: string
  duration: string
  interviewers: string[]
  status: 'scheduled' | 'completed' | 'feedback_pending'
  feedback?: {
    rating: number
    recommendation: 'strong_yes' | 'yes' | 'no' | 'strong_no'
    notes: string
  }
}

// ============================================
// Mock Data
// ============================================

const mockClient = {
  name: 'TechVentures Inc',
  logo: 'TV',
  industry: 'Technology',
  size: '500-1000',
  healthScore: 92,
}

const mockJobTemplate = {
  title: 'Senior Full-Stack Engineer',
  location: 'San Francisco, CA (Hybrid)',
  salary: '$180,000 - $220,000',
  type: 'Full-time',
  skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
  description: `We're looking for a Senior Full-Stack Engineer to join our growing team. You'll work on our core platform, building features that impact millions of users.

**Responsibilities:**
• Design and implement scalable web applications
• Lead technical discussions and code reviews
• Mentor junior engineers
• Collaborate with product and design teams

**Requirements:**
• 5+ years of full-stack development experience
• Strong proficiency in React and Node.js
• Experience with cloud platforms (AWS preferred)
• Excellent communication skills`,
}

const mockCandidates: Candidate[] = [
  {
    id: 'c1',
    name: 'Sarah Chen',
    initials: 'SC',
    title: 'Senior Software Engineer',
    company: 'Stripe',
    experience: '7 years',
    location: 'San Francisco, CA',
    matchScore: 96,
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'GraphQL'],
    salary: '$190K - $210K',
    availability: 'Immediate',
    status: 'matched',
    aiReason: 'Perfect technical match. Stripe experience shows she can handle scale. Already in SF.',
  },
  {
    id: 'c2',
    name: 'Marcus Johnson',
    initials: 'MJ',
    title: 'Full-Stack Developer',
    company: 'Airbnb',
    experience: '6 years',
    location: 'Oakland, CA',
    matchScore: 94,
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Redis'],
    salary: '$175K - $195K',
    availability: '2 weeks',
    status: 'matched',
    aiReason: 'Strong product sense from Airbnb. Slightly below on PostgreSQL but quick learner.',
  },
  {
    id: 'c3',
    name: 'Emily Rodriguez',
    initials: 'ER',
    title: 'Staff Engineer',
    company: 'Netflix',
    experience: '8 years',
    location: 'Los Gatos, CA',
    matchScore: 91,
    skills: ['React', 'Java', 'TypeScript', 'PostgreSQL', 'AWS', 'Kafka'],
    salary: '$210K - $240K',
    availability: '1 month',
    status: 'matched',
    aiReason: 'Senior for role but could be a strategic hire. Netflix pedigree is valuable.',
  },
  {
    id: 'c4',
    name: 'David Kim',
    initials: 'DK',
    title: 'Software Engineer',
    company: 'Meta',
    experience: '5 years',
    location: 'Menlo Park, CA',
    matchScore: 89,
    skills: ['React', 'Python', 'TypeScript', 'MySQL', 'GCP'],
    salary: '$170K - $190K',
    availability: 'Immediate',
    status: 'matched',
    aiReason: 'Good match. Node.js experience is limited but React skills are excellent.',
  },
]

const interviewStages = [
  { id: 'phone', name: 'Phone Screen', duration: '30 min', icon: Phone },
  { id: 'technical', name: 'Technical Interview', duration: '60 min', icon: ClipboardList },
  { id: 'system', name: 'System Design', duration: '60 min', icon: Brain },
  { id: 'culture', name: 'Culture Fit', duration: '45 min', icon: Users },
  { id: 'final', name: 'Final Round', duration: '60 min', icon: UserCheck },
]

// ============================================
// Utility Components
// ============================================

function ProgressSteps({
  steps,
  currentStep
}: {
  steps: { id: string; label: string; icon: React.ElementType }[]
  currentStep: number
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isComplete = index < currentStep
        const isCurrent = index === currentStep
        const isFuture = index > currentStep

        return (
          <div key={step.id} className="flex items-center">
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300',
              isComplete && 'bg-emerald-100 text-emerald-700',
              isCurrent && 'bg-indigo-100 text-indigo-700',
              isFuture && 'bg-gray-100 text-gray-400'
            )}>
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                isComplete && 'bg-emerald-500 text-white',
                isCurrent && 'bg-indigo-500 text-white',
                isFuture && 'bg-gray-300 text-gray-500'
              )}>
                {isComplete ? <Check className="w-3 h-3" /> : index + 1}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className={cn(
                'w-4 h-4 mx-1',
                index < currentStep ? 'text-emerald-400' : 'text-gray-300'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function AIBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full',
      className
    )}>
      <Sparkles className="w-3 h-3" />
      {children}
    </span>
  )
}

function TypingText({ text, speed = 15, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    let index = 0
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayed(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
        onComplete?.()
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed, onComplete])

  return <span>{displayed}</span>
}

// ============================================
// Stage Components
// ============================================

// Dashboard Stage
function DashboardStage({ onCreateJob }: { onCreateJob: () => void }) {
  const recentJobs = [
    { title: 'Data Engineer', client: 'DataFlow Systems', status: 'interviewing', submissions: 5, days: 12 },
    { title: 'Product Manager', client: 'StartupXYZ', status: 'open', submissions: 8, days: 5 },
    { title: 'DevOps Engineer', client: 'CloudScale', status: 'offer', submissions: 3, days: 21 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs</h1>
        <p className="text-gray-500">Manage your open positions and track hiring progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Open Jobs', value: '12', icon: Briefcase, color: 'text-indigo-500' },
          { label: 'Active Candidates', value: '47', icon: Users, color: 'text-emerald-500' },
          { label: 'Interviews This Week', value: '8', icon: Calendar, color: 'text-amber-500' },
          { label: 'Pending Offers', value: '2', icon: FileText, color: 'text-purple-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider mb-2">
              <stat.icon className={cn('w-4 h-4', stat.color)} />
              {stat.label}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Create Job CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium text-indigo-200">AI-Powered Job Creation</span>
            </div>
            <h2 className="text-xl font-bold mb-1">Create a new job in seconds</h2>
            <p className="text-indigo-100 text-sm">AI will help you write the description and find matching candidates instantly</p>
          </div>
          <button
            onClick={onCreateJob}
            className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Job
          </button>
        </div>
      </motion.div>

      {/* Recent Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Jobs</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentJobs.map((job, i) => (
            <div key={i} className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-500">{job.client} • {job.days} days old</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{job.submissions} submissions</span>
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full capitalize',
                    job.status === 'open' && 'bg-emerald-100 text-emerald-700',
                    job.status === 'interviewing' && 'bg-amber-100 text-amber-700',
                    job.status === 'offer' && 'bg-purple-100 text-purple-700',
                  )}>
                    {job.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Create Job Stage
function CreateJobStage({
  onJobCreated
}: {
  onJobCreated: (job: Job) => void
}) {
  const [step, setStep] = useState<'client' | 'details' | 'ai-generating' | 'review'>('client')
  const [selectedClient, setSelectedClient] = useState<typeof mockClient | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [generatedJob, setGeneratedJob] = useState<typeof mockJobTemplate | null>(null)

  const handleSelectClient = () => {
    setSelectedClient(mockClient)
    setStep('details')
  }

  const handleGenerateJob = () => {
    setStep('ai-generating')
    setTimeout(() => {
      setGeneratedJob(mockJobTemplate)
      setStep('review')
    }, 2000)
  }

  const handlePublish = () => {
    const job: Job = {
      id: 'job-1',
      title: generatedJob?.title || jobTitle,
      client: selectedClient?.name || '',
      clientLogo: selectedClient?.logo || '',
      location: generatedJob?.location || '',
      salary: generatedJob?.salary || '',
      type: generatedJob?.type || 'Full-time',
      skills: generatedJob?.skills || [],
      description: generatedJob?.description || '',
      status: 'open',
      submissions: 0,
      interviews: 0,
      createdAt: 'Just now',
    }
    onJobCreated(job)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Job</h1>
        <p className="text-gray-500">AI will help you create a compelling job posting</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Client */}
        {step === 'client' && (
          <motion.div
            key="client"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Client</h2>

            <button
              onClick={handleSelectClient}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {mockClient.logo}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">{mockClient.name}</h3>
                  <p className="text-sm text-gray-500">{mockClient.industry} • {mockClient.size} employees</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-emerald-600 font-medium">{mockClient.healthScore}% health</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                </div>
              </div>
            </button>

            <div className="mt-4 p-3 bg-indigo-50 rounded-lg flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5" />
              <p className="text-sm text-indigo-700">AI will use your relationship history with this client to optimize the job posting</p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Job Details */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {selectedClient?.logo}
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedClient?.name}</p>
                <p className="text-sm text-gray-500">New job posting</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium text-indigo-900">AI Job Assistant</span>
                </div>
                <p className="text-sm text-indigo-700 mb-3">
                  I'll generate a complete job description with requirements, responsibilities, and optimal salary range based on market data.
                </p>
                <button
                  onClick={() => {
                    setJobTitle('Senior Full-Stack Engineer')
                    handleGenerateJob()
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate with AI
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: AI Generating */}
        {step === 'ai-generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl border border-gray-200 p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AI is creating your job posting...</h2>
            <div className="space-y-2 text-sm text-gray-500">
              <p>✓ Analyzing market salary data</p>
              <p>✓ Generating compelling description</p>
              <p className="text-indigo-600">→ Finding matching candidates...</p>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review */}
        {step === 'review' && generatedJob && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AIBadge>AI Generated</AIBadge>
                  <span className="text-sm text-gray-500">Review and publish</span>
                </div>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {selectedClient?.logo}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{generatedJob.title}</h2>
                    <p className="text-gray-500">{selectedClient?.name}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Location</p>
                      <p className="text-sm font-medium text-gray-900">{generatedJob.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Salary Range</p>
                      <p className="text-sm font-medium text-gray-900">{generatedJob.salary}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {generatedJob.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Description</p>
                  <div className="prose prose-sm text-gray-600 whitespace-pre-line">
                    {generatedJob.description}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Found Matches */}
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-emerald-900">AI found 4 matching candidates!</p>
                  <p className="text-sm text-emerald-700">Ready to review as soon as you publish</p>
                </div>
                <div className="flex -space-x-2">
                  {mockCandidates.slice(0, 4).map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                      {c.initials}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Publish Button */}
            <button
              onClick={handlePublish}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              Publish Job & View Candidates
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Job Created Success Stage
function JobCreatedStage({
  job,
  onViewCandidates
}: {
  job: Job
  onViewCandidates: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center"
      >
        <CheckCircle2 className="w-10 h-10 text-white" />
      </motion.div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Published!</h1>
      <p className="text-gray-500 mb-8">{job.title} at {job.client} is now live</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 text-left">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {job.clientLogo}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.client} • {job.location}</p>
          </div>
          <span className="ml-auto px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
            Live
          </span>
        </div>

        <div className="p-4 bg-indigo-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span className="font-medium text-indigo-900">AI has found 4 candidates</span>
          </div>
          <p className="text-sm text-indigo-700">
            Based on skills, experience, and availability. Top match is 96%.
          </p>
        </div>
      </div>

      <button
        onClick={onViewCandidates}
        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
      >
        <Users className="w-5 h-5" />
        Review Matched Candidates
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  )
}

// Submissions Stage
function SubmissionsStage({
  job,
  candidates,
  onSubmit,
  onScheduleInterview,
}: {
  job: Job
  candidates: Candidate[]
  onSubmit: (candidate: Candidate) => void
  onScheduleInterview: (candidates: Candidate[]) => void
}) {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [submittedCandidates, setSubmittedCandidates] = useState<string[]>([])

  const handleSubmit = (candidate: Candidate) => {
    setSubmittedCandidates(prev => [...prev, candidate.id])
    onSubmit(candidate)
  }

  const handleBulkSubmit = () => {
    const toSubmit = candidates.filter(c => selectedCandidates.includes(c.id))
    toSubmit.forEach(c => {
      setSubmittedCandidates(prev => [...prev, c.id])
    })
    setSelectedCandidates([])
  }

  const submittedCount = submittedCandidates.length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium mb-1">
            <Sparkles className="w-4 h-4" />
            AI-Matched Candidates
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <p className="text-gray-500">{job.client} • {candidates.length} matches found</p>
        </div>

        {submittedCount >= 2 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onScheduleInterview(candidates.filter(c => submittedCandidates.includes(c.id)))}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            <Calendar className="w-5 h-5" />
            Schedule Interviews ({submittedCount})
          </motion.button>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCandidates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 rounded-xl p-4 mb-6 flex items-center justify-between"
        >
          <span className="text-indigo-700 font-medium">{selectedCandidates.length} candidates selected</span>
          <button
            onClick={handleBulkSubmit}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium"
          >
            Submit All Selected
          </button>
        </motion.div>
      )}

      {/* Candidates Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {candidates.map((candidate, i) => {
          const isSubmitted = submittedCandidates.includes(candidate.id)
          const isSelected = selectedCandidates.includes(candidate.id)

          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'bg-white rounded-xl border-2 overflow-hidden transition-all duration-200',
                isSubmitted ? 'border-emerald-300 bg-emerald-50/50' : isSelected ? 'border-indigo-300' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  {!isSubmitted && (
                    <button
                      onClick={() => setSelectedCandidates(prev =>
                        prev.includes(candidate.id)
                          ? prev.filter(id => id !== candidate.id)
                          : [...prev, candidate.id]
                      )}
                      className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                        isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 hover:border-indigo-400'
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  )}

                  {/* Avatar */}
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0',
                    isSubmitted ? 'bg-emerald-500' : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                  )}>
                    {isSubmitted ? <Check className="w-6 h-6" /> : candidate.initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3" />
                        {candidate.matchScore}%
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{candidate.title} at {candidate.company}</p>
                    <p className="text-xs text-gray-400 mt-1">{candidate.location} • {candidate.experience}</p>
                  </div>

                  {/* Action */}
                  {isSubmitted ? (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-lg">
                      Submitted
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSubmit(candidate)}
                      className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Submit
                    </button>
                  )}
                </div>

                {/* Skills */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {candidate.skills.slice(0, 5).map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* AI Reason */}
                <div className="mt-3 p-2 bg-indigo-50 rounded-lg flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-700">{candidate.aiReason}</p>
                </div>

                {/* Salary & Availability */}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {candidate.salary}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {candidate.availability}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Progress Indicator */}
      {submittedCount > 0 && submittedCount < 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200"
        >
          <p className="text-amber-800 text-sm">
            <strong>Tip:</strong> Submit at least 2 candidates to schedule interviews. You've submitted {submittedCount} so far.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

// Interviews Stage
function InterviewsStage({
  job,
  candidates,
  onComplete,
}: {
  job: Job
  candidates: Candidate[]
  onComplete: (selectedCandidate: Candidate) => void
}) {
  const [currentStage, setCurrentStage] = useState(0)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [showScheduler, setShowScheduler] = useState(true)
  const [completedInterviews, setCompletedInterviews] = useState<string[]>([])
  const [selectedForOffer, setSelectedForOffer] = useState<Candidate | null>(null)

  const handleScheduleAll = () => {
    const newInterviews: Interview[] = candidates.slice(0, 2).map((candidate, i) => ({
      id: `int-${i}`,
      candidate,
      type: 'Video Call',
      stage: interviewStages[0].name,
      date: i === 0 ? 'Tomorrow' : 'Wed, Feb 5',
      time: i === 0 ? '10:00 AM' : '2:00 PM',
      duration: '30 min',
      interviewers: ['Hiring Manager'],
      status: 'scheduled',
    }))
    setInterviews(newInterviews)
    setShowScheduler(false)
  }

  const handleCompleteInterview = (interviewId: string, feedback: Interview['feedback']) => {
    setCompletedInterviews(prev => [...prev, interviewId])
    setInterviews(prev => prev.map(int =>
      int.id === interviewId
        ? { ...int, status: 'completed', feedback }
        : int
    ))
  }

  const handleAdvanceStage = () => {
    if (currentStage < interviewStages.length - 1) {
      setCurrentStage(prev => prev + 1)
    }
  }

  const allCompleted = completedInterviews.length >= 2 && currentStage >= 2

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Interview Pipeline</h1>
        <p className="text-gray-500">{job.title} at {job.client}</p>
      </div>

      {/* Interview Stages Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          {interviewStages.map((stage, i) => {
            const Icon = stage.icon
            const isComplete = i < currentStage
            const isCurrent = i === currentStage

            return (
              <div key={stage.id} className="flex items-center">
                <div className={cn(
                  'flex flex-col items-center',
                  isComplete && 'text-emerald-600',
                  isCurrent && 'text-indigo-600',
                  !isComplete && !isCurrent && 'text-gray-400'
                )}>
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center mb-1',
                    isComplete && 'bg-emerald-100',
                    isCurrent && 'bg-indigo-100',
                    !isComplete && !isCurrent && 'bg-gray-100'
                  )}>
                    {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{stage.name}</span>
                </div>
                {i < interviewStages.length - 1 && (
                  <div className={cn(
                    'w-12 h-0.5 mx-2',
                    i < currentStage ? 'bg-emerald-300' : 'bg-gray-200'
                  )} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Scheduler */}
      <AnimatePresence>
        {showScheduler && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium text-indigo-200">AI Scheduling</span>
                </div>
                <h2 className="text-xl font-bold mb-1">Schedule interviews for {candidates.length} candidates</h2>
                <p className="text-indigo-100 text-sm">AI found optimal time slots based on everyone's calendars</p>
              </div>
              <button
                onClick={handleScheduleAll}
                className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Schedule All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interview Cards */}
      {interviews.length > 0 && (
        <div className="space-y-4">
          {interviews.map((interview, i) => {
            const isCompleted = completedInterviews.includes(interview.id)

            return (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'bg-white rounded-xl border-2 overflow-hidden',
                  isCompleted ? 'border-emerald-300' : 'border-gray-200'
                )}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold',
                        isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                      )}>
                        {isCompleted ? <Check className="w-6 h-6" /> : interview.candidate.initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{interview.candidate.name}</h3>
                        <p className="text-sm text-gray-500">{interview.stage}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{interview.date}</p>
                        <p className="text-sm text-gray-500">{interview.time} • {interview.duration}</p>
                      </div>

                      {isCompleted ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-lg">
                            {interview.feedback?.recommendation === 'strong_yes' ? '👍 Strong Yes' : '👍 Yes'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCompleteInterview(interview.id, {
                              rating: 4,
                              recommendation: i === 0 ? 'strong_yes' : 'yes',
                              notes: 'Great technical skills and culture fit',
                            })}
                            className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
                          >
                            Complete Interview
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isCompleted && interview.feedback && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <p className="text-sm text-emerald-800">
                          <strong>Feedback:</strong> {interview.feedback.notes}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Advance to Next Stage */}
      {completedInterviews.length === interviews.length && interviews.length > 0 && currentStage < 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-indigo-50 rounded-xl flex items-center justify-between"
        >
          <div>
            <p className="font-medium text-indigo-900">All {interviewStages[currentStage].name} interviews completed!</p>
            <p className="text-sm text-indigo-700">Ready to advance to {interviewStages[currentStage + 1].name}</p>
          </div>
          <button
            onClick={handleAdvanceStage}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
          >
            Advance Stage
          </button>
        </motion.div>
      )}

      {/* Ready for Offer */}
      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium text-emerald-100">Interview Complete</span>
              </div>
              <h2 className="text-xl font-bold mb-1">Ready to make an offer!</h2>
              <p className="text-emerald-100 text-sm">Sarah Chen received "Strong Yes" feedback across all stages</p>
            </div>
            <button
              onClick={() => onComplete(candidates[0])}
              className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
            >
              <Gift className="w-5 h-5" />
              Extend Offer
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Offer Stage
function OfferStage({
  job,
  candidate,
  onAccepted,
}: {
  job: Job
  candidate: Candidate
  onAccepted: () => void
}) {
  const [step, setStep] = useState<'draft' | 'sent' | 'negotiation' | 'accepted'>('draft')

  const offer = {
    salary: '$195,000',
    startDate: 'March 3, 2025',
    bonus: '$20,000 signing bonus',
    equity: '0.05% equity',
    benefits: 'Full medical, dental, vision + 401k match',
  }

  const handleSendOffer = () => {
    setStep('sent')
    setTimeout(() => setStep('negotiation'), 2000)
  }

  const handleAcceptCounter = () => {
    setStep('accepted')
    setTimeout(() => onAccepted(), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Offer Management</h1>
        <p className="text-gray-500">{candidate.name} for {job.title}</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'draft' && (
          <motion.div
            key="draft"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AIBadge>AI Generated Offer</AIBadge>
                </div>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {candidate.initials}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                    <p className="text-sm text-gray-500">{job.title} at {job.client}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Base Salary</p>
                    <p className="text-xl font-bold text-gray-900">{offer.salary}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Start Date</p>
                    <p className="text-xl font-bold text-gray-900">{offer.startDate}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Signing Bonus</p>
                    <p className="text-lg font-semibold text-gray-900">{offer.bonus}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Equity</p>
                    <p className="text-lg font-semibold text-gray-900">{offer.equity}</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-indigo-50 rounded-lg flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5" />
                  <div className="text-sm text-indigo-700">
                    <strong>AI Insight:</strong> This offer is 3% above market median for this role in SF. Based on Sarah's current comp, this represents a 15% increase.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSendOffer}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send Offer to Candidate
            </button>
          </motion.div>
        )}

        {step === 'sent' && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl border border-gray-200 p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
              <Send className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Offer Sent!</h2>
            <p className="text-gray-500">Waiting for candidate response...</p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Monitoring for response
            </div>
          </motion.div>
        )}

        {step === 'negotiation' && (
          <motion.div
            key="negotiation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">Counter Offer Received</h3>
                  <p className="text-amber-800 text-sm mb-3">
                    Sarah has requested some adjustments to the offer:
                  </p>
                  <ul className="space-y-2 text-sm text-amber-800">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Salary: $195,000 → <strong>$205,000</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Start Date: March 3 → <strong>March 17</strong> (needs 2 week transition)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-indigo-500" />
                <span className="font-semibold text-gray-900">AI Negotiation Analysis</span>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong className="text-gray-900">Recommendation:</strong> Accept the counter offer.
                </p>
                <p>
                  The $10K increase brings total comp to $225K which is still within budget ($220K + 10% flex).
                  The delayed start date is reasonable for a senior hire transitioning from Stripe.
                </p>
                <p className="text-emerald-600 font-medium">
                  Risk Assessment: Low. Sarah is highly motivated and this is a fair negotiation.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAcceptCounter}
                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Accept Counter Offer
              </button>
              <button className="px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Counter
              </button>
            </div>
          </motion.div>
        )}

        {step === 'accepted' && (
          <motion.div
            key="accepted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center"
            >
              <PartyPopper className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer Accepted! 🎉</h2>
            <p className="text-gray-500 mb-4">Sarah Chen has accepted the position</p>
            <p className="text-sm text-emerald-600 font-medium">Redirecting to placement confirmation...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Placement Stage
function PlacementStage({
  job,
  candidate,
  onComplete,
}: {
  job: Job
  candidate: Candidate
  onComplete: () => void
}) {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const placementDetails = {
    startDate: 'March 17, 2025',
    salary: '$205,000',
    fee: '$41,000',
    feePercent: '20%',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto"
    >
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center"
        >
          <Award className="w-12 h-12 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Placement Confirmed! 🎉</h1>
        <p className="text-gray-500">
          {candidate.name} has been placed at {job.client}
        </p>
      </motion.div>

      {/* Placement Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6"
      >
        <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
              {candidate.initials}
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">{candidate.name}</h2>
              <p className="text-emerald-100">{job.title}</p>
            </div>
            <div className="ml-auto text-right text-white">
              <p className="text-sm text-emerald-100">Placement Fee</p>
              <p className="text-2xl font-bold">{placementDetails.fee}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <Calendar className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Start Date</p>
              <p className="font-semibold text-gray-900">{placementDetails.startDate}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <DollarSign className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Annual Salary</p>
              <p className="font-semibold text-gray-900">{placementDetails.salary}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <Target className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Fee Rate</p>
              <p className="font-semibold text-gray-900">{placementDetails.feePercent}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-indigo-50 rounded-xl border border-indigo-200 p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span className="font-semibold text-indigo-900">AI has initiated the following:</span>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Onboarding checklist sent to client HR', done: true },
            { label: 'Background check initiated', done: true },
            { label: 'Calendar reminder: 30-day check-in scheduled', done: true },
            { label: 'Invoice generated and sent to billing', done: true },
            { label: 'Commission calculation submitted', done: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-indigo-800">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white"
      >
        <h3 className="text-lg font-semibold mb-4">Workflow Summary</h3>
        <div className="grid sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-emerald-400">5 min</p>
            <p className="text-sm text-gray-400">Job created</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-400">4</p>
            <p className="text-sm text-gray-400">Candidates matched</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-400">3 days</p>
            <p className="text-sm text-gray-400">Time to offer</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-amber-400">$41K</p>
            <p className="text-sm text-gray-400">Revenue generated</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            Traditional process: <span className="text-gray-500">~3-4 weeks</span>
          </p>
          <p className="text-emerald-400 font-medium">
            With AI: <span className="text-emerald-300">3 days</span> •
            <span className="text-emerald-300 ml-2">10x faster</span>
          </p>
        </div>
      </motion.div>

      {/* Start Over */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onComplete}
        className="w-full mt-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-5 h-5" />
        Start New Job
      </motion.button>
    </motion.div>
  )
}

// ============================================
// Main Page Component
// ============================================

const workflowSteps = [
  { id: 'job', label: 'Create Job', icon: Briefcase },
  { id: 'submit', label: 'Submit', icon: Send },
  { id: 'interview', label: 'Interview', icon: Calendar },
  { id: 'offer', label: 'Offer', icon: FileText },
  { id: 'placement', label: 'Placement', icon: Award },
]

export default function AINativeDemoPage() {
  const [stage, setStage] = useState<WorkflowStage>('dashboard')
  const [currentJob, setCurrentJob] = useState<Job | null>(null)
  const [submittedCandidates, setSubmittedCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const currentStepIndex = {
    'dashboard': -1,
    'create-job': 0,
    'job-created': 0,
    'submissions': 1,
    'interviews': 2,
    'offer': 3,
    'placement': 4,
  }[stage]

  const handleJobCreated = (job: Job) => {
    setCurrentJob(job)
    setStage('job-created')
  }

  const handleViewCandidates = () => {
    setStage('submissions')
  }

  const handleSubmitCandidate = (candidate: Candidate) => {
    setSubmittedCandidates(prev => [...prev, candidate])
  }

  const handleScheduleInterviews = (candidates: Candidate[]) => {
    setStage('interviews')
  }

  const handleInterviewComplete = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setStage('offer')
  }

  const handleOfferAccepted = () => {
    setStage('placement')
  }

  const handleReset = () => {
    setStage('dashboard')
    setCurrentJob(null)
    setSubmittedCandidates([])
    setSelectedCandidate(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">InTime</span>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">AI Demo</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Full Recruiting Lifecycle</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                R
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      {currentStepIndex >= 0 && (
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <ProgressSteps steps={workflowSteps} currentStep={currentStepIndex} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {stage === 'dashboard' && (
            <DashboardStage
              key="dashboard"
              onCreateJob={() => setStage('create-job')}
            />
          )}

          {stage === 'create-job' && (
            <CreateJobStage
              key="create-job"
              onJobCreated={handleJobCreated}
            />
          )}

          {stage === 'job-created' && currentJob && (
            <JobCreatedStage
              key="job-created"
              job={currentJob}
              onViewCandidates={handleViewCandidates}
            />
          )}

          {stage === 'submissions' && currentJob && (
            <SubmissionsStage
              key="submissions"
              job={currentJob}
              candidates={mockCandidates}
              onSubmit={handleSubmitCandidate}
              onScheduleInterview={handleScheduleInterviews}
            />
          )}

          {stage === 'interviews' && currentJob && (
            <InterviewsStage
              key="interviews"
              job={currentJob}
              candidates={submittedCandidates.length > 0 ? submittedCandidates : mockCandidates.slice(0, 2)}
              onComplete={handleInterviewComplete}
            />
          )}

          {stage === 'offer' && currentJob && selectedCandidate && (
            <OfferStage
              key="offer"
              job={currentJob}
              candidate={selectedCandidate}
              onAccepted={handleOfferAccepted}
            />
          )}

          {stage === 'placement' && currentJob && selectedCandidate && (
            <PlacementStage
              key="placement"
              job={currentJob}
              candidate={selectedCandidate}
              onComplete={handleReset}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
