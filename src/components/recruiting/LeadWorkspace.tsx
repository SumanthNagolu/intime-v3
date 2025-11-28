'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useLead, useLeadActivities } from '@/hooks/queries/leads';
import { 
  useUpdateLeadStatus, 
  useConvertLead, 
  useUpdateLead, 
  useCreateLeadActivity,
  useUpdateLeadBANT,
} from '@/hooks/mutations/leads';
import {
  usePendingActivities,
  useCreateActivity,
  useCompleteActivity,
  useCancelActivity,
} from '@/hooks/mutations/activities';
import { ActivityComposer } from '@/components/crm/ActivityComposer';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { LeadStrategy } from '@/components/crm/LeadStrategy';
import {
  ChevronLeft,
  Building2,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  ArrowRight,
  User,
  Linkedin,
  Globe,
  MapPin,
  Briefcase,
  DollarSign,
  Loader2,
  AlertCircle,
  X,
  Target,
  TrendingUp,
  Clock,
  Users,
  MessageSquare,
  FileText,
  Star,
  Zap,
  CheckSquare,
  Square,
  Plus,
  Save,
  Edit3,
  Send,
  PhoneCall,
  Video,
  Sparkles,
  Award,
  CircleDot,
  ChevronDown,
  ChevronUp,
  Flame,
  Snowflake,
  Crown,
  AlertTriangle,
  BarChart3,
  Activity,
  ExternalLink,
} from 'lucide-react';

type LeadStatus = 'new' | 'warm' | 'hot' | 'cold' | 'converted' | 'lost';

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string; icon: React.ElementType }[] = [
  { value: 'new', label: 'New', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Sparkles },
  { value: 'warm', label: 'Warm', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: TrendingUp },
  { value: 'hot', label: 'Hot', color: 'bg-red-100 text-red-700 border-red-200', icon: Flame },
  { value: 'cold', label: 'Cold', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Snowflake },
  { value: 'converted', label: 'Won', color: 'bg-green-100 text-green-700 border-green-200', icon: Crown },
  { value: 'lost', label: 'Lost', color: 'bg-stone-100 text-stone-500 border-stone-200', icon: X },
];

const LOST_REASONS = [
  'Budget constraints',
  'Went with competitor',
  'No current need',
  'Timing not right',
  'No response after follow-ups',
  'Project cancelled/delayed',
  'Other',
];

// BANT Qualification Interface
interface BANTScore {
  budget: number; // 0-25
  authority: number; // 0-25
  need: number; // 0-25
  timeline: number; // 0-25
}

// Task Interface
interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export const LeadWorkspace: React.FC = () => {
  const params = useParams();
  const leadId = params.id as string;
  const router = useRouter();

  // Fetch lead data
  const { leadRaw: lead, isLoading, isError, error, refetch } = useLead(leadId);
  const { activities, isLoading: activitiesLoading, refetch: refetchActivities } = useLeadActivities(leadId);
  
  // Fetch tasks from unified activities (type = 'task' or 'follow_up')
  const { data: pendingTasks, isLoading: tasksLoading, refetch: refetchTasks } = usePendingActivities('lead', leadId);

  // Mutations
  const updateStatus = useUpdateLeadStatus();
  const convertLead = useConvertLead();
  const updateLead = useUpdateLead();
  const createActivity = useCreateLeadActivity();
  const updateBANT = useUpdateLeadBANT();
  
  // Task mutations (using unified activities)
  const createTaskMutation = useCreateActivity();
  const completeTaskMutation = useCompleteActivity();
  const cancelTaskMutation = useCancelActivity();

  // UI State
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [customLostReason, setCustomLostReason] = useState('');
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'research' | 'strategy' | 'tasks'>('activity');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [strategyNotes, setStrategyNotes] = useState('');
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [quickNoteContent, setQuickNoteContent] = useState('');
  
  // BANT Qualification State - initialized from DB
  const [bantScore, setBantScore] = useState<BANTScore>({
    budget: 0,
    authority: 0,
    need: 0,
    timeline: 0,
  });
  const [bantNotes, setBantNotes] = useState({
    budget: '',
    authority: '',
    need: '',
    timeline: '',
  });
  const [bantDirty, setBantDirty] = useState(false);
  const [savingBant, setSavingBant] = useState(false);

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  // Load BANT from lead data
  useEffect(() => {
    if (lead) {
      setBantScore({
        budget: lead.bantBudget ?? 0,
        authority: lead.bantAuthority ?? 0,
        need: lead.bantNeed ?? 0,
        timeline: lead.bantTimeline ?? 0,
      });
      setBantNotes({
        budget: lead.bantBudgetNotes ?? '',
        authority: lead.bantAuthorityNotes ?? '',
        need: lead.bantNeedNotes ?? '',
        timeline: lead.bantTimelineNotes ?? '',
      });
      setBantDirty(false);
    }
  }, [lead]);

  // Convert form
  const [convertFormData, setConvertFormData] = useState({
    dealTitle: '',
    dealValue: '',
    createAccount: true,
  });

  // Load strategy notes from lead
  useEffect(() => {
    if (lead?.notes) {
      setStrategyNotes(lead.notes);
    }
  }, [lead?.notes]);

  // Calculate total BANT score
  const totalBantScore = bantScore.budget + bantScore.authority + bantScore.need + bantScore.timeline;
  const bantPercentage = Math.round(totalBantScore);

  // Engagement score calculation (based on activities)
  const engagementScore = Math.min(100, (activities?.length || 0) * 15 + (lead?.lastContactedAt ? 20 : 0));

  // Handle status change
  const handleStatusChange = (newStatus: LeadStatus) => {
    if (newStatus === 'lost') {
      setShowLostModal(true);
      return;
    }
    if (newStatus === 'converted') {
      // Pre-populate form data when opening modal
      setConvertFormData({
        dealTitle: `Deal with ${lead?.companyName || 'Lead'}`,
        dealValue: lead?.estimatedValue || '0',
        createAccount: true,
      });
      setShowConvertModal(true);
      return;
    }
    updateStatus.mutate({ id: leadId, status: newStatus });
  };

  // Handle lost confirmation
  const handleConfirmLost = () => {
    const reason = lostReason === 'Other' ? customLostReason : lostReason;
    updateStatus.mutate(
      { id: leadId, status: 'lost', lostReason: reason },
      { onSuccess: () => setShowLostModal(false) }
    );
  };

  // Handle convert to deal
  const handleConvertToDeal = () => {
    if (!convertFormData.dealTitle || !convertFormData.dealValue) return;
    convertLead.mutate(
      {
        leadId,
        dealTitle: convertFormData.dealTitle,
        dealValue: parseFloat(convertFormData.dealValue),
        createAccount: convertFormData.createAccount,
        accountName: lead?.companyName || undefined,
      },
      {
        onSuccess: (result) => {
          setShowConvertModal(false);
          router.push(`/employee/recruiting/deals/${result.deal.id}`);
        },
      }
    );
  };

  // Handle save strategy notes
  const handleSaveNotes = () => {
    updateLead.mutate(
      { id: leadId, notes: strategyNotes },
      { onSuccess: () => setIsEditingNotes(false) }
    );
  };

  // Handle quick note
  const handleQuickNote = () => {
    if (!quickNoteContent.trim()) return;
    createActivity.mutate(
      {
        entityType: 'lead',
        entityId: leadId,
        activityType: 'note',
        body: quickNoteContent,
      },
      {
        onSuccess: () => {
          setQuickNoteContent('');
          setShowQuickNote(false);
          refetchActivities();
        },
      }
    );
  };

  // Toggle task completion (using unified activities)
  const toggleTask = (taskId: string, currentStatus: string) => {
    if (currentStatus === 'completed') {
      // Can't uncomplete for now - would need reschedule
      return;
    }
    completeTaskMutation.mutate(
      { id: taskId },
      { onSuccess: () => refetchTasks() }
    );
  };

  // Add new task (using unified activities)
  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    createTaskMutation.mutate(
      {
        entityType: 'lead',
        entityId: leadId,
        activityType: 'task',
        subject: newTaskTitle,
        dueDate: new Date(newTaskDueDate),
        priority: newTaskPriority,
        status: 'open',
      },
      {
        onSuccess: () => {
          setNewTaskTitle('');
          setNewTaskPriority('medium');
          setNewTaskDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
          refetchTasks();
          refetchActivities(); // Also refresh activity timeline
        },
      }
    );
  };

  // Delete task (cancel via unified activities)
  const handleDeleteTask = (taskId: string) => {
    cancelTaskMutation.mutate({ id: taskId }, { onSuccess: () => refetchTasks() });
  };

  // Save BANT scores to database
  const handleSaveBant = () => {
    setSavingBant(true);
    updateBANT.mutate(
      {
        id: leadId,
        bantBudget: bantScore.budget,
        bantAuthority: bantScore.authority,
        bantNeed: bantScore.need,
        bantTimeline: bantScore.timeline,
        bantBudgetNotes: bantNotes.budget || undefined,
        bantAuthorityNotes: bantNotes.authority || undefined,
        bantNeedNotes: bantNotes.need || undefined,
        bantTimelineNotes: bantNotes.timeline || undefined,
      },
      {
        onSuccess: () => {
          setBantDirty(false);
          setSavingBant(false);
          refetch();
        },
        onError: () => {
          setSavingBant(false);
        },
      }
    );
  };

  // Format currency
  const formatCurrency = (value: string | number | null | undefined) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (!num) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Get BANT grade
  const getBantGrade = (score: number): { grade: string; color: string } => {
    if (score >= 80) return { grade: 'A', color: 'text-green-600' };
    if (score >= 60) return { grade: 'B', color: 'text-emerald-600' };
    if (score >= 40) return { grade: 'C', color: 'text-amber-600' };
    if (score >= 20) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="animate-spin text-rust mx-auto mb-4" size={48} />
          <p className="text-stone-500 text-sm">Loading lead workspace...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !lead) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-500 font-medium">Lead not found</p>
        <p className="text-stone-400 text-sm mt-2">{error?.message || `ID: ${leadId}`}</p>
        <Link href="/employee/recruiting/leads" className="inline-flex items-center gap-2 mt-4 text-rust hover:underline">
          <ChevronLeft size={14} /> Back to Leads
        </Link>
      </div>
    );
  }

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === lead.status) || STATUS_OPTIONS[0];
  const StatusIcon = currentStatus.icon;
  const bantGrade = getBantGrade(bantPercentage);
  const taskList = pendingTasks || [];
  const completedTasks = taskList.filter(t => t.completed).length;
  const overdueTasks = taskList.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length;

  return (
    <div className="animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/employee/recruiting/leads"
          className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest"
        >
          <ChevronLeft size={14} /> Back to Leads
        </Link>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickNote(true)}
            className="p-2.5 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all group"
            title="Quick Note"
          >
            <FileText size={18} className="text-stone-400 group-hover:text-charcoal" />
          </button>
          <a
            href={`mailto:${lead.email}`}
            className="p-2.5 bg-white border border-stone-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group"
            title="Send Email"
          >
            <Mail size={18} className="text-stone-400 group-hover:text-blue-600" />
          </a>
          <a
            href={`tel:${lead.phone}`}
            className="p-2.5 bg-white border border-stone-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all group"
            title="Call"
          >
            <PhoneCall size={18} className="text-stone-400 group-hover:text-green-600" />
          </a>
          {lead.linkedinUrl && (
            <a
              href={lead.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-white border border-stone-200 rounded-xl hover:bg-sky-50 hover:border-sky-200 transition-all group"
              title="LinkedIn"
            >
              <Linkedin size={18} className="text-stone-400 group-hover:text-sky-600" />
            </a>
          )}
          <button
            onClick={() => {
              // Pre-populate form data when opening modal
              setConvertFormData({
                dealTitle: `Deal with ${lead.companyName || 'Lead'}`,
                dealValue: lead.estimatedValue || '0',
                createAccount: true,
              });
              setShowConvertModal(true);
            }}
            disabled={lead.status === 'converted' || lead.status === 'lost'}
            className="px-4 py-2.5 bg-gradient-to-r from-rust to-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap size={14} /> Convert to Deal
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Sidebar - Lead Info */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          
          {/* Lead Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-stone-800 to-stone-700"></div>
            <div className="px-6 pb-6 -mt-10">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white">
                <Building2 size={32} className="text-rust" />
              </div>
              <h1 className="text-xl font-serif font-bold text-charcoal text-center mb-1">
                {lead.companyName || 'Unknown Company'}
              </h1>
              <p className="text-stone-500 text-sm text-center flex items-center justify-center gap-2 mb-4">
                <User size={12} /> {lead.firstName} {lead.lastName}
              </p>
              
              {/* Status Badge */}
              <div className="flex justify-center mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${currentStatus.color}`}>
                  <StatusIcon size={12} /> {currentStatus.label}
                </span>
              </div>

              {/* Status Selector */}
              <div className="grid grid-cols-3 gap-1 mb-4">
                {STATUS_OPTIONS.slice(0, 6).map((status) => {
                  const Icon = status.icon;
                  return (
                    <button
                      key={status.value}
                      onClick={() => handleStatusChange(status.value)}
                      disabled={updateStatus.isPending || lead.status === 'converted'}
                      className={`p-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${
                        lead.status === status.value
                          ? status.color + ' ring-1 ring-offset-1 ring-current'
                          : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                      } ${lead.status === 'converted' ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <Icon size={12} />
                      {status.label}
                    </button>
                  );
                })}
              </div>

              {/* Contact Details */}
              <div className="space-y-2 text-sm border-t border-stone-100 pt-4">
                {lead.email && (
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-stone-600 hover:text-rust transition-colors">
                    <Mail size={14} className="text-stone-400" />
                    <span className="truncate">{lead.email}</span>
                  </a>
                )}
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-stone-600 hover:text-rust transition-colors">
                    <Phone size={14} className="text-stone-400" />
                    {lead.phone}
                  </a>
                )}
                {lead.website && (
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-stone-600 hover:text-rust transition-colors">
                    <Globe size={14} className="text-stone-400" />
                    <span className="truncate">Website</span>
                    <ExternalLink size={10} className="text-stone-300" />
                  </a>
                )}
                {lead.headquarters && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <MapPin size={14} className="text-stone-400" />
                    {lead.headquarters}
                  </div>
                )}
                {lead.title && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Briefcase size={14} className="text-stone-400" />
                    {lead.title}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Value Card */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Est. Value</span>
              <div className="p-2 bg-white/10 rounded-lg">
                <DollarSign size={14} className="text-green-400" />
              </div>
            </div>
            <div className="text-3xl font-serif font-bold mb-2">{formatCurrency(lead.estimatedValue)}</div>
            <div className="text-xs text-stone-400">
              Source: <span className="text-white capitalize">{lead.source || 'Unknown'}</span>
            </div>
          </div>

          {/* Qualification Score Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">BANT Score</span>
              <span className={`text-2xl font-bold ${bantGrade.color}`}>{bantGrade.grade}</span>
            </div>
            <div className="relative h-3 bg-stone-100 rounded-full overflow-hidden mb-2">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-rust to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${bantPercentage}%` }}
              />
            </div>
            <div className="text-right text-sm font-medium text-stone-600">{bantPercentage}%</div>
          </div>

          {/* Tasks Summary */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Tasks</span>
              <span className="text-sm font-medium text-stone-600">{completedTasks}/{taskList.length}</span>
            </div>
            {overdueTasks > 0 && (
              <div className="flex items-center gap-2 text-red-600 text-xs mb-2">
                <AlertTriangle size={12} />
                {overdueTasks} overdue
              </div>
            )}
            <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-green-500 rounded-full transition-all"
                style={{ width: `${taskList.length ? (completedTasks / taskList.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Engagement Score */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Engagement</span>
              <Activity size={14} className="text-stone-400" />
            </div>
            <div className="flex items-end gap-1 h-12">
              {[20, 40, 60, 80, 100].map((threshold, i) => (
                <div
                  key={threshold}
                  className={`flex-1 rounded transition-all ${
                    engagementScore >= threshold
                      ? 'bg-gradient-to-t from-rust to-amber-500'
                      : 'bg-stone-100'
                  }`}
                  style={{ height: `${(i + 1) * 20}%` }}
                />
              ))}
            </div>
            <div className="text-center mt-2 text-sm font-medium text-stone-600">{engagementScore}%</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          
          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="flex border-b border-stone-100">
              {[
                { id: 'activity', label: 'Activity', icon: MessageSquare },
                { id: 'research', label: 'Research', icon: Target },
                { id: 'strategy', label: 'Strategy', icon: BarChart3 },
                { id: 'tasks', label: 'Tasks', icon: CheckSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-charcoal border-b-2 border-rust'
                        : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                    }`}
                  >
                    <Icon size={14} /> {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <ActivityComposer entityType="lead" entityId={leadId} onActivityCreated={() => refetchActivities()} />
                  <ActivityTimeline activities={activities} isLoading={activitiesLoading} />
                </div>
              )}

              {/* Research Tab */}
              {activeTab === 'research' && (
                <div className="space-y-6">
                  {/* Company Overview */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                      <Building2 size={14} /> Company Overview
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-stone-50 rounded-xl p-4">
                        <div className="text-xs text-stone-400 mb-1">Industry</div>
                        <div className="font-medium text-charcoal capitalize">{lead.industry || 'Unknown'}</div>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-4">
                        <div className="text-xs text-stone-400 mb-1">Company Size</div>
                        <div className="font-medium text-charcoal">{lead.companySize?.replace(/_/g, '-') || 'Unknown'}</div>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-4">
                        <div className="text-xs text-stone-400 mb-1">Tier</div>
                        <div className="font-medium text-charcoal capitalize">{lead.tier?.replace(/_/g, ' ') || 'Unknown'}</div>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-4">
                        <div className="text-xs text-stone-400 mb-1">Type</div>
                        <div className="font-medium text-charcoal capitalize">{lead.companyType?.replace(/_/g, ' ') || 'Unknown'}</div>
                      </div>
                    </div>
                  </div>

                  {/* BANT Qualification */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                      <Target size={14} /> BANT Qualification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Budget */}
                      <div className="bg-stone-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-green-600" />
                            <span className="font-medium">Budget</span>
                          </div>
                          <span className="text-sm font-bold text-stone-600">{bantScore.budget}/25</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="25"
                          value={bantScore.budget}
                          onChange={(e) => { setBantScore({ ...bantScore, budget: parseInt(e.target.value) }); setBantDirty(true); }}
                          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <textarea
                          placeholder="Budget notes... (e.g., Confirmed $50-100k budget for Q1)"
                          value={bantNotes.budget}
                          onChange={(e) => { setBantNotes({ ...bantNotes, budget: e.target.value }); setBantDirty(true); }}
                          className="mt-3 w-full p-2 text-sm bg-white border border-stone-200 rounded-lg resize-none focus:outline-none focus:border-green-500"
                          rows={2}
                        />
                      </div>

                      {/* Authority */}
                      <div className="bg-stone-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Crown size={14} className="text-purple-600" />
                            <span className="font-medium">Authority</span>
                          </div>
                          <span className="text-sm font-bold text-stone-600">{bantScore.authority}/25</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="25"
                          value={bantScore.authority}
                          onChange={(e) => { setBantScore({ ...bantScore, authority: parseInt(e.target.value) }); setBantDirty(true); }}
                          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <textarea
                          placeholder="Authority notes... (e.g., VP-level, needs CFO sign-off)"
                          value={bantNotes.authority}
                          onChange={(e) => { setBantNotes({ ...bantNotes, authority: e.target.value }); setBantDirty(true); }}
                          className="mt-3 w-full p-2 text-sm bg-white border border-stone-200 rounded-lg resize-none focus:outline-none focus:border-purple-500"
                          rows={2}
                        />
                      </div>

                      {/* Need */}
                      <div className="bg-stone-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Target size={14} className="text-blue-600" />
                            <span className="font-medium">Need</span>
                          </div>
                          <span className="text-sm font-bold text-stone-600">{bantScore.need}/25</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="25"
                          value={bantScore.need}
                          onChange={(e) => { setBantScore({ ...bantScore, need: parseInt(e.target.value) }); setBantDirty(true); }}
                          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <textarea
                          placeholder="Need notes... (e.g., Urgent hiring need for 5 Java devs)"
                          value={bantNotes.need}
                          onChange={(e) => { setBantNotes({ ...bantNotes, need: e.target.value }); setBantDirty(true); }}
                          className="mt-3 w-full p-2 text-sm bg-white border border-stone-200 rounded-lg resize-none focus:outline-none focus:border-blue-500"
                          rows={2}
                        />
                      </div>

                      {/* Timeline */}
                      <div className="bg-stone-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-amber-600" />
                            <span className="font-medium">Timeline</span>
                          </div>
                          <span className="text-sm font-bold text-stone-600">{bantScore.timeline}/25</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="25"
                          value={bantScore.timeline}
                          onChange={(e) => { setBantScore({ ...bantScore, timeline: parseInt(e.target.value) }); setBantDirty(true); }}
                          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                        <textarea
                          placeholder="Timeline notes... (e.g., Decision by end of month)"
                          value={bantNotes.timeline}
                          onChange={(e) => { setBantNotes({ ...bantNotes, timeline: e.target.value }); setBantDirty(true); }}
                          className="mt-3 w-full p-2 text-sm bg-white border border-stone-200 rounded-lg resize-none focus:outline-none focus:border-amber-500"
                          rows={2}
                        />
                      </div>
                    </div>
                    
                    {/* BANT Save Button */}
                    {bantDirty && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={handleSaveBant}
                          disabled={savingBant}
                          className="px-6 py-2.5 bg-gradient-to-r from-rust to-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {savingBant ? (
                            <>
                              <Loader2 size={14} className="animate-spin" /> Saving...
                            </>
                          ) : (
                            <>
                              <Save size={14} /> Save BANT Scores
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick Research Links */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                      <Globe size={14} /> Quick Research
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`https://www.linkedin.com/company/${lead.companyName?.toLowerCase().replace(/\s+/g, '-')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-sky-50 text-sky-700 rounded-lg text-xs font-medium hover:bg-sky-100 transition-colors flex items-center gap-2"
                      >
                        <Linkedin size={12} /> LinkedIn Company
                      </a>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(lead.companyName || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-stone-50 text-stone-700 rounded-lg text-xs font-medium hover:bg-stone-100 transition-colors flex items-center gap-2"
                      >
                        <Globe size={12} /> Google Search
                      </a>
                      <a
                        href={`https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(lead.companyName || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors flex items-center gap-2"
                      >
                        <Star size={12} /> Glassdoor
                      </a>
                      <a
                        href={`https://news.google.com/search?q=${encodeURIComponent(lead.companyName || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors flex items-center gap-2"
                      >
                        <FileText size={12} /> News
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Strategy Tab */}
              {activeTab === 'strategy' && (
                <LeadStrategy leadId={leadId} companyName={lead.companyName || undefined} />
              )}

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  {/* Add Task Form */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Add a new task..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                      className="w-full p-3 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust"
                    />
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-stone-500 mb-1 block">Due Date</label>
                        <input
                          type="date"
                          value={newTaskDueDate}
                          onChange={(e) => setNewTaskDueDate(e.target.value)}
                          className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-stone-500 mb-1 block">Priority</label>
                        <select
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                          className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={addTask}
                          disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
                          className="px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {createTaskMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Task List - Using Unified Activities */}
                  <div className="space-y-2">
                    {tasksLoading ? (
                      <div className="text-center py-8">
                        <Loader2 size={24} className="animate-spin mx-auto text-rust" />
                      </div>
                    ) : pendingTasks && pendingTasks.length > 0 ? (
                      pendingTasks.map((task) => {
                        const isCompleted = task.status === 'completed';
                        const isOverdue = !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();
                        return (
                          <div
                            key={task.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              isCompleted
                                ? 'bg-green-50 border-green-200'
                                : isOverdue
                                ? 'bg-red-50 border-red-200'
                                : 'bg-white border-stone-200'
                            }`}
                          >
                            <button 
                              onClick={() => toggleTask(task.id, task.status)} 
                              className="flex-shrink-0"
                              disabled={completeTaskMutation.isPending || isCompleted}
                            >
                              {isCompleted ? (
                                <CheckSquare size={20} className="text-green-600" />
                              ) : (
                                <Square size={20} className="text-stone-400 hover:text-charcoal" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${isCompleted ? 'line-through text-stone-400' : 'text-charcoal'}`}>
                                {task.subject || 'Untitled Task'}
                              </div>
                              <div className={`text-xs ${isOverdue ? 'text-red-600' : 'text-stone-400'}`}>
                                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                                {isOverdue && ' (Overdue)'}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                task.priority === 'high' || task.priority === 'urgent'
                                  ? 'bg-red-100 text-red-600'
                                  : task.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {task.priority || 'medium'}
                            </span>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              disabled={cancelTaskMutation.isPending}
                              className="text-stone-400 hover:text-red-500 transition-colors p-1"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-stone-400">
                        <CheckSquare size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tasks yet. Add your first task above.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Note Modal */}
      {showQuickNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif font-bold text-charcoal">Quick Note</h3>
              <button onClick={() => setShowQuickNote(false)} className="text-stone-400 hover:text-charcoal">
                <X size={20} />
              </button>
            </div>
            <textarea
              value={quickNoteContent}
              onChange={(e) => setQuickNoteContent(e.target.value)}
              placeholder="Add a quick note about this lead..."
              className="w-full h-32 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowQuickNote(false)}
                className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickNote}
                disabled={!quickNoteContent.trim() || createActivity.isPending}
                className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createActivity.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lost Reason Modal */}
      {showLostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-charcoal">Mark Lead as Lost</h3>
              <button onClick={() => setShowLostModal(false)} className="text-stone-400 hover:text-charcoal">
                <X size={20} />
              </button>
            </div>
            <p className="text-stone-600 mb-6">Select a reason for losing this lead to help improve future outreach.</p>
            <div className="space-y-2 mb-6">
              {LOST_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setLostReason(reason)}
                  className={`w-full p-3 text-left rounded-xl border transition-all ${
                    lostReason === reason ? 'border-rust bg-rust/5 text-charcoal' : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            {lostReason === 'Other' && (
              <input
                type="text"
                placeholder="Enter custom reason..."
                value={customLostReason}
                onChange={(e) => setCustomLostReason(e.target.value)}
                className="w-full p-3 border border-stone-200 rounded-xl mb-6 focus:outline-none focus:border-rust"
              />
            )}
            <div className="flex gap-4">
              <button onClick={() => setShowLostModal(false)} className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50">
                Cancel
              </button>
              <button
                onClick={handleConfirmLost}
                disabled={!lostReason || (lostReason === 'Other' && !customLostReason) || updateStatus.isPending}
                className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50"
              >
                {updateStatus.isPending ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Deal Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-charcoal flex items-center gap-2">
                <Zap className="text-amber-500" size={20} /> Convert to Deal
              </h3>
              <button onClick={() => setShowConvertModal(false)} className="text-stone-400 hover:text-charcoal">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Deal Title</label>
                <input
                  type="text"
                  placeholder={`Deal with ${lead.companyName}`}
                  value={convertFormData.dealTitle}
                  onChange={(e) => setConvertFormData({ ...convertFormData, dealTitle: e.target.value })}
                  className="w-full p-3 border border-stone-200 rounded-xl focus:outline-none focus:border-rust"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Deal Value ($)</label>
                <input
                  type="number"
                  placeholder={lead.estimatedValue || '0'}
                  value={convertFormData.dealValue}
                  onChange={(e) => setConvertFormData({ ...convertFormData, dealValue: e.target.value })}
                  className="w-full p-3 border border-stone-200 rounded-xl focus:outline-none focus:border-rust"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="createAccount"
                  checked={convertFormData.createAccount}
                  onChange={(e) => setConvertFormData({ ...convertFormData, createAccount: e.target.checked })}
                  className="w-5 h-5 rounded border-stone-300"
                />
                <label htmlFor="createAccount" className="text-sm text-stone-600">Create Account from this lead</label>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowConvertModal(false)} className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50">
                Cancel
              </button>
              <button
                onClick={handleConvertToDeal}
                disabled={!convertFormData.dealTitle || !convertFormData.dealValue || convertLead.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-rust to-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {convertLead.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Converting...
                  </>
                ) : (
                  <>
                    Convert <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadWorkspace;

