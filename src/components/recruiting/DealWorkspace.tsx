'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useDealRaw } from '@/hooks/queries/deals';
import {
  useUpdateDeal,
  useDealActivities,
  useDealTasks,
} from '@/hooks/mutations/deals';
import { trpc } from '@/lib/trpc/client';
import {
  useCreateActivity,
  useCompleteActivity,
  useCancelActivity,
} from '@/hooks/mutations/activities';
import { ActivityComposer } from '@/components/crm/ActivityComposer';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { DealNegotiation } from './DealNegotiation';
import {
  ChevronLeft,
  Building2,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  ArrowRight,
  User,
  DollarSign,
  Loader2,
  AlertCircle,
  X,
  Target,
  TrendingUp,
  Clock,
  MessageSquare,
  FileText,
  CheckSquare,
  Square,
  Plus,
  Save,
  Handshake,
  Trophy,
  XCircle,
  Percent,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Globe,
  ExternalLink,
  Pencil,
  Upload,
  File,
  Trash2,
} from 'lucide-react';

type DealStage = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

const STAGE_OPTIONS: { value: DealStage; label: string; color: string; icon: React.ElementType; probability: number }[] = [
  { value: 'discovery', label: 'Discovery', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Target, probability: 10 },
  { value: 'qualification', label: 'Qualification', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckSquare, probability: 25 },
  { value: 'proposal', label: 'Proposal', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: FileText, probability: 50 },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Handshake, probability: 75 },
  { value: 'closed_won', label: 'Won', color: 'bg-green-100 text-green-700 border-green-200', icon: Trophy, probability: 100 },
  { value: 'closed_lost', label: 'Lost', color: 'bg-stone-100 text-stone-500 border-stone-200', icon: XCircle, probability: 0 },
];

const CLOSE_REASONS = [
  'Price too high',
  'Competitor won',
  'No budget',
  'Project cancelled',
  'Timeline mismatch',
  'Lost contact',
  'Requirements changed',
  'Other',
];

export const DealWorkspace: React.FC = () => {
  const params = useParams();
  const dealId = params.id as string;
  const router = useRouter();

  // Fetch deal data
  const { data: deal, isLoading, isError, error, refetch } = useDealRaw(dealId);

  // Fetch activities from unified activities system
  const { data: activities, isLoading: activitiesLoading, refetch: refetchActivities } = useDealActivities(dealId);

  // Fetch all tasks from unified activities (type = 'task' or 'follow_up') - includes completed
  const { data: allTasks, isLoading: tasksLoading, refetch: refetchTasks } = useDealTasks(dealId);

  // Mutations
  const updateDeal = useUpdateDeal();

  // Task mutations (using unified activities)
  const createTaskMutation = useCreateActivity();
  const completeTaskMutation = useCompleteActivity();
  const cancelTaskMutation = useCancelActivity();

  // UI State
  const [showLostModal, setShowLostModal] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [customCloseReason, setCustomCloseReason] = useState('');
  const [showWonModal, setShowWonModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'negotiation' | 'documents' | 'tasks'>('activity');

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  // Deal value editing state
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editValue, setEditValue] = useState('');

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentCategory, setDocumentCategory] = useState<string>('other');
  const [documentName, setDocumentName] = useState<string>('');
  const [documentNotes, setDocumentNotes] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Document categories
  const DOCUMENT_CATEGORIES = [
    { value: 'proposal', label: 'Proposal', color: 'bg-blue-100 text-blue-700' },
    { value: 'contract', label: 'Contract', color: 'bg-green-100 text-green-700' },
    { value: 'sow', label: 'SOW', color: 'bg-purple-100 text-purple-700' },
    { value: 'nda', label: 'NDA', color: 'bg-amber-100 text-amber-700' },
    { value: 'invoice', label: 'Invoice', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'quote', label: 'Quote', color: 'bg-orange-100 text-orange-700' },
    { value: 'presentation', label: 'Presentation', color: 'bg-pink-100 text-pink-700' },
    { value: 'requirement', label: 'Requirements', color: 'bg-cyan-100 text-cyan-700' },
    { value: 'other', label: 'Other', color: 'bg-stone-100 text-stone-700' },
  ];

  // Files queries and mutations
  const { data: documents, isLoading: documentsLoading, refetch: refetchDocuments } = trpc.files.list.useQuery(
    { entityType: 'deal', entityId: dealId },
    { enabled: !!dealId }
  );
  const getUploadUrlMutation = trpc.files.getUploadUrl.useMutation();
  const recordUploadMutation = trpc.files.recordUpload.useMutation();
  const deleteFileMutation = trpc.files.delete.useMutation();
  const utils = trpc.useUtils();

  // Handle deal value save
  const handleSaveValue = () => {
    const numValue = parseFloat(editValue.replace(/[^0-9.]/g, ''));
    if (!isNaN(numValue) && numValue >= 0) {
      updateDeal.mutate(
        { id: dealId, value: numValue },
        {
          onSuccess: () => {
            setIsEditingValue(false);
            refetch();
          },
        }
      );
    }
  };

  // Handle file selection (opens modal)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    // Set default document name from file name (without extension)
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setDocumentName(nameWithoutExt);
    setDocumentCategory('other');
    setDocumentNotes('');
    setShowUploadModal(true);
  };

  // Handle actual file upload with category
  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Get presigned upload URL
      const { uploadUrl, filePath, bucket } = await getUploadUrlMutation.mutateAsync({
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        entityType: 'deal',
        entityId: dealId,
      });

      // Upload file to Supabase Storage
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Record the upload in database with metadata
      // Use custom document name if provided, otherwise use original filename
      const displayName = documentName.trim()
        ? `${documentName.trim()}${selectedFile.name.match(/\.[^/.]+$/)?.[0] || ''}`
        : selectedFile.name;

      await recordUploadMutation.mutateAsync({
        bucket,
        filePath,
        fileName: displayName,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        entityType: 'deal',
        entityId: dealId,
        metadata: {
          category: documentCategory,
          originalFileName: selectedFile.name,
          notes: documentNotes.trim() || undefined,
        },
      });

      refetchDocuments();
      setShowUploadModal(false);
      setSelectedFile(null);
      setDocumentName('');
      setDocumentNotes('');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle file download
  const handleFileDownload = async (fileId: string) => {
    try {
      const result = await utils.files.getDownloadUrl.fetch({ fileId });
      window.open(result.url, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to get download URL.');
    }
  };

  // Handle file delete
  const handleFileDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;

    try {
      await deleteFileMutation.mutateAsync({ fileId });
      refetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file.');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
    return '📎';
  };

  // Handle stage change
  const handleStageChange = (newStage: DealStage) => {
    if (newStage === 'closed_lost') {
      setShowLostModal(true);
      return;
    }
    if (newStage === 'closed_won') {
      setShowWonModal(true);
      return;
    }

    const stageConfig = STAGE_OPTIONS.find(s => s.value === newStage);
    updateDeal.mutate({
      id: dealId,
      stage: newStage,
      probability: stageConfig?.probability,
    });
  };

  // Handle close lost
  const handleConfirmLost = () => {
    const reason = closeReason === 'Other' ? customCloseReason : closeReason;
    updateDeal.mutate(
      {
        id: dealId,
        stage: 'closed_lost',
        closeReason: reason,
        actualCloseDate: new Date(),
        probability: 0,
      },
      { onSuccess: () => setShowLostModal(false) }
    );
  };

  // Handle close won
  const handleConfirmWon = () => {
    updateDeal.mutate(
      {
        id: dealId,
        stage: 'closed_won',
        actualCloseDate: new Date(),
        probability: 100,
      },
      { onSuccess: () => setShowWonModal(false) }
    );
  };

  // Toggle task completion (using unified activities)
  const toggleTask = (taskId: string, currentStatus: string) => {
    if (currentStatus === 'completed') {
      return;
    }
    completeTaskMutation.mutate(
      { id: taskId },
      { onSuccess: () => { refetchTasks(); refetchActivities(); } }
    );
  };

  // Add new task (using unified activities)
  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    createTaskMutation.mutate(
      {
        entityType: 'deal',
        entityId: dealId,
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
          refetchActivities();
        },
      }
    );
  };

  // Delete task (cancel via unified activities)
  const handleDeleteTask = (taskId: string) => {
    cancelTaskMutation.mutate(
      { id: taskId },
      { onSuccess: () => { refetchTasks(); refetchActivities(); } }
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="animate-spin text-rust mx-auto mb-4" size={48} />
          <p className="text-stone-500 text-sm">Loading deal workspace...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !deal) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-500 font-medium">Deal not found</p>
        <p className="text-stone-400 text-sm mt-2">{error?.message || `ID: ${dealId}`}</p>
        <Link href="/employee/recruiting/deals" className="inline-flex items-center gap-2 mt-4 text-rust hover:underline">
          <ChevronLeft size={14} /> Back to Deals
        </Link>
      </div>
    );
  }

  const currentStage = STAGE_OPTIONS.find((s) => s.value === deal.stage) || STAGE_OPTIONS[0];
  const StageIcon = currentStage.icon;
  const taskList = allTasks || [];
  const completedTasks = taskList.filter(t => t.status === 'completed').length;
  const overdueTasks = taskList.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()).length;

  // Calculate days until expected close
  const daysUntilClose = deal.expectedCloseDate
    ? Math.ceil((new Date(deal.expectedCloseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Get stage progress
  const activeStages = STAGE_OPTIONS.filter(s => !['closed_won', 'closed_lost'].includes(s.value));
  const currentStageIndex = activeStages.findIndex(s => s.value === deal.stage);
  const stageProgress = deal.stage === 'closed_won' ? 100 : deal.stage === 'closed_lost' ? 0 : ((currentStageIndex + 1) / activeStages.length) * 100;

  return (
    <div className="animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/employee/recruiting/deals"
          className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest"
        >
          <ChevronLeft size={14} /> Back to Deals
        </Link>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {deal.stage !== 'closed_won' && deal.stage !== 'closed_lost' && (
            <>
              <button
                onClick={() => setShowLostModal(true)}
                className="px-4 py-2.5 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
              >
                Mark Lost
              </button>
              <button
                onClick={() => setShowWonModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Trophy size={14} /> Mark Won
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pipeline Stage Visualization */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Pipeline Stage</h3>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${currentStage.color}`}>
            <StageIcon size={12} /> {currentStage.label}
          </span>
        </div>

        {/* Stage Progress Bar */}
        <div className="relative mb-6">
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                deal.stage === 'closed_won' ? 'bg-green-500' :
                deal.stage === 'closed_lost' ? 'bg-red-500' :
                'bg-gradient-to-r from-rust to-amber-500'
              }`}
              style={{ width: `${stageProgress}%` }}
            />
          </div>
        </div>

        {/* Stage Steps */}
        <div className="flex justify-between items-center">
          {STAGE_OPTIONS.filter(s => !['closed_won', 'closed_lost'].includes(s.value)).map((stage, i) => {
            const Icon = stage.icon;
            const isCompleted = activeStages.findIndex(s => s.value === deal.stage) >= i || deal.stage === 'closed_won';
            const isCurrent = deal.stage === stage.value;

            return (
              <button
                key={stage.value}
                onClick={() => handleStageChange(stage.value)}
                disabled={updateDeal.isPending || deal.stage === 'closed_won' || deal.stage === 'closed_lost'}
                className={`flex flex-col items-center gap-2 group transition-all ${
                  deal.stage === 'closed_won' || deal.stage === 'closed_lost' ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-rust text-white scale-110 shadow-lg'
                    : isCompleted
                    ? 'bg-charcoal text-white'
                    : 'bg-stone-100 text-stone-400 group-hover:bg-stone-200'
                }`}>
                  <Icon size={18} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  isCurrent ? 'text-rust' : 'text-stone-400'
                }`}>
                  {stage.label}
                </span>
                <span className="text-[9px] text-stone-400">{stage.probability}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Sidebar - Deal Info */}
        <div className="col-span-12 lg:col-span-3 space-y-4">

          {/* Deal Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className={`h-20 ${
              deal.stage === 'closed_won' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
              deal.stage === 'closed_lost' ? 'bg-gradient-to-r from-stone-600 to-stone-500' :
              'bg-gradient-to-r from-stone-800 to-stone-700'
            }`}></div>
            <div className="px-6 pb-6 -mt-10">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white">
                <Briefcase size={32} className="text-rust" />
              </div>
              <h1 className="text-xl font-serif font-bold text-charcoal text-center mb-1">
                {deal.title}
              </h1>
              {deal.description && (
                <p className="text-stone-500 text-sm text-center mb-4 line-clamp-2">
                  {deal.description}
                </p>
              )}

              {/* Deal Details */}
              <div className="space-y-2 text-sm border-t border-stone-100 pt-4">
                {deal.accountId && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Building2 size={14} className="text-stone-400" />
                    <span>Account linked</span>
                  </div>
                )}
                {deal.expectedCloseDate && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Calendar size={14} className="text-stone-400" />
                    <span>Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Value Card */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Deal Value</span>
              <button
                onClick={() => {
                  setEditValue(deal.value?.toString() || '0');
                  setIsEditingValue(true);
                }}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Pencil size={14} className="text-green-400" />
              </button>
            </div>
            {isEditingValue ? (
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveValue()}
                    className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-xl font-bold focus:outline-none focus:border-green-400"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveValue}
                    disabled={updateDeal.isPending}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-green-500 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updateDeal.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingValue(false)}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-3xl font-serif font-bold mb-2">{formatCurrency(deal.value)}</div>
            )}
            <div className="flex items-center gap-2 text-xs text-stone-400 mt-2">
              <Percent size={12} />
              <span>Probability: <span className="text-white font-bold">{deal.probability || 0}%</span></span>
            </div>
          </div>

          {/* Probability Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Win Probability</span>
              <span className={`text-2xl font-bold ${
                (deal.probability || 0) >= 75 ? 'text-green-600' :
                (deal.probability || 0) >= 50 ? 'text-amber-600' :
                (deal.probability || 0) >= 25 ? 'text-orange-600' :
                'text-red-600'
              }`}>{deal.probability || 0}%</span>
            </div>
            <div className="relative h-3 bg-stone-100 rounded-full overflow-hidden mb-2">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                  (deal.probability || 0) >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  (deal.probability || 0) >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                  (deal.probability || 0) >= 25 ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                  'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
                style={{ width: `${deal.probability || 0}%` }}
              />
            </div>
            {daysUntilClose !== null && (
              <div className={`text-xs flex items-center gap-1 ${
                daysUntilClose < 0 ? 'text-red-600' :
                daysUntilClose <= 7 ? 'text-amber-600' :
                'text-stone-500'
              }`}>
                <Clock size={12} />
                {daysUntilClose < 0
                  ? `${Math.abs(daysUntilClose)} days overdue`
                  : daysUntilClose === 0
                  ? 'Closes today'
                  : `${daysUntilClose} days until close`
                }
              </div>
            )}
          </div>

          {/* Tasks Summary */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Tasks</span>
              <span className="text-sm font-medium text-stone-600">{completedTasks}/{taskList.length}</span>
            </div>
            {overdueTasks > 0 && (
              <div className="flex items-center gap-2 text-red-600 text-xs mb-2">
                <AlertCircle size={12} />
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
        </div>

        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-9 space-y-6">

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="flex border-b border-stone-100">
              {[
                { id: 'activity', label: 'Activity', icon: MessageSquare },
                { id: 'negotiation', label: 'Negotiation', icon: Handshake },
                { id: 'documents', label: 'Documents', icon: FolderOpen },
                { id: 'tasks', label: 'Tasks', icon: CheckSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
                  <ActivityComposer entityType="deal" entityId={dealId} onActivityCreated={() => refetchActivities()} />
                  <ActivityTimeline
                    activities={activities || []}
                    isLoading={activitiesLoading}
                    onCompleteActivity={(id) => completeTaskMutation.mutate({ id }, { onSuccess: () => { refetchTasks(); refetchActivities(); } })}
                  />
                </div>
              )}

              {/* Negotiation Tab */}
              {activeTab === 'negotiation' && (
                <DealNegotiation dealId={dealId} dealTitle={deal.title} leadId={deal.leadId || undefined} />
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  {/* Upload Section */}
                  <div className="bg-stone-50 rounded-xl border border-stone-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-stone-600">Deal Documents</h3>
                        <p className="text-xs text-stone-400 mt-1">
                          Upload proposals, contracts, SOWs, and other deal documents
                        </p>
                      </div>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-4 py-2.5 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <Upload size={14} /> Upload Document
                        </button>
                      </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-2">
                      {DOCUMENT_CATEGORIES.slice(0, 5).map((cat) => {
                        const count = documents?.filter(d => (d.metadata as { category?: string })?.category === cat.value).length || 0;
                        return (
                          <span
                            key={cat.value}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${cat.color}`}
                          >
                            {cat.label} ({count})
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="space-y-3">
                    {documentsLoading ? (
                      <div className="text-center py-8">
                        <Loader2 size={24} className="animate-spin mx-auto text-rust" />
                      </div>
                    ) : documents && documents.length > 0 ? (
                      documents.map((doc) => {
                        const metadata = doc.metadata as { category?: string; notes?: string; originalFileName?: string } | null;
                        const category = metadata?.category || 'other';
                        const notes = metadata?.notes;
                        const categoryConfig = DOCUMENT_CATEGORIES.find(c => c.value === category) || DOCUMENT_CATEGORIES[DOCUMENT_CATEGORIES.length - 1];
                        return (
                          <div
                            key={doc.id}
                            className="bg-white rounded-xl border border-stone-200 p-4 hover:border-stone-300 transition-colors group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                {getFileIcon(doc.mimeType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-charcoal truncate">{doc.fileName}</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${categoryConfig.color}`}>
                                    {categoryConfig.label}
                                  </span>
                                </div>
                                <div className="text-xs text-stone-400 flex items-center gap-3 mt-1">
                                  <span>{formatFileSize(doc.fileSize)}</span>
                                  <span>•</span>
                                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                  {doc.uploaderName && (
                                    <>
                                      <span>•</span>
                                      <span>by {doc.uploaderName}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button
                                  onClick={() => handleFileDownload(doc.id)}
                                  className="p-2 text-stone-400 hover:text-charcoal hover:bg-stone-100 rounded-lg transition-colors"
                                  title="Download"
                                >
                                  <ExternalLink size={16} />
                                </button>
                                <button
                                  onClick={() => handleFileDelete(doc.id, doc.fileName)}
                                  disabled={deleteFileMutation.isPending}
                                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            {notes && (
                              <div className="mt-3 pt-3 border-t border-stone-100">
                                <p className="text-xs text-stone-500 italic">{notes}</p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
                        <FolderOpen size={48} className="mx-auto mb-4 text-stone-300" />
                        <p className="text-stone-500 font-medium">No documents yet</p>
                        <p className="text-sm text-stone-400 mt-1">Upload your first document to get started</p>
                      </div>
                    )}
                  </div>

                  {/* Document Stats */}
                  {documents && documents.length > 0 && (
                    <div className="bg-stone-50 rounded-xl border border-stone-200 p-4">
                      <div className="text-xs text-stone-500">
                        <span className="font-bold text-charcoal">{documents.length}</span> document{documents.length !== 1 ? 's' : ''} •{' '}
                        <span className="font-bold text-charcoal">
                          {formatFileSize(documents.reduce((sum, d) => sum + d.fileSize, 0))}
                        </span> total
                      </div>
                    </div>
                  )}
                </div>
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

                  {/* Task List */}
                  <div className="space-y-2">
                    {tasksLoading ? (
                      <div className="text-center py-8">
                        <Loader2 size={24} className="animate-spin mx-auto text-rust" />
                      </div>
                    ) : allTasks && allTasks.length > 0 ? (
                      allTasks.map((task) => {
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

      {/* Lost Reason Modal */}
      {showLostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-charcoal">Mark Deal as Lost</h3>
              <button onClick={() => setShowLostModal(false)} className="text-stone-400 hover:text-charcoal">
                <X size={20} />
              </button>
            </div>
            <p className="text-stone-600 mb-6">Select a reason for losing this deal to help improve future opportunities.</p>
            <div className="space-y-2 mb-6">
              {CLOSE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setCloseReason(reason)}
                  className={`w-full p-3 text-left rounded-xl border transition-all ${
                    closeReason === reason ? 'border-rust bg-rust/5 text-charcoal' : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            {closeReason === 'Other' && (
              <input
                type="text"
                placeholder="Enter custom reason..."
                value={customCloseReason}
                onChange={(e) => setCustomCloseReason(e.target.value)}
                className="w-full p-3 border border-stone-200 rounded-xl mb-6 focus:outline-none focus:border-rust"
              />
            )}
            <div className="flex gap-4">
              <button onClick={() => setShowLostModal(false)} className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50">
                Cancel
              </button>
              <button
                onClick={handleConfirmLost}
                disabled={!closeReason || (closeReason === 'Other' && !customCloseReason) || updateDeal.isPending}
                className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50"
              >
                {updateDeal.isPending ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Won Modal */}
      {showWonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-charcoal flex items-center gap-2">
                <Trophy className="text-green-500" size={20} /> Mark Deal as Won
              </h3>
              <button onClick={() => setShowWonModal(false)} className="text-stone-400 hover:text-charcoal">
                <X size={20} />
              </button>
            </div>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={40} className="text-green-600" />
              </div>
              <p className="text-stone-600">
                Congratulations! You&apos;re about to close this deal as won.
              </p>
              <p className="text-2xl font-serif font-bold text-green-600 mt-4">
                {formatCurrency(deal.value)}
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowWonModal(false)} className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50">
                Cancel
              </button>
              <button
                onClick={handleConfirmWon}
                disabled={updateDeal.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateDeal.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    Confirm Win <Trophy size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-charcoal flex items-center gap-2">
                <Upload className="text-rust" size={20} /> Upload Document
              </h3>
              <button
                onClick={() => { setShowUploadModal(false); setSelectedFile(null); setDocumentName(''); setDocumentNotes(''); }}
                className="text-stone-400 hover:text-charcoal"
              >
                <X size={20} />
              </button>
            </div>

            {/* File Preview */}
            <div className="bg-stone-50 rounded-xl p-4 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl border border-stone-200">
                {getFileIcon(selectedFile.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-charcoal truncate">{selectedFile.name}</div>
                <div className="text-xs text-stone-400">{formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}</div>
              </div>
            </div>

            {/* Document Name */}
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">
                Document Name *
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g., Pinnacle Group MSA 2025"
                className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
              />
              <p className="text-xs text-stone-400 mt-1">
                File extension ({selectedFile.name.match(/\.[^/.]+$/)?.[0] || '.file'}) will be added automatically
              </p>
            </div>

            {/* Category Selection */}
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">
                Document Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setDocumentCategory(cat.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                      documentCategory === cat.value
                        ? `${cat.color} border-current`
                        : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">
                Notes <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <textarea
                value={documentNotes}
                onChange={(e) => setDocumentNotes(e.target.value)}
                placeholder="Add any notes about this document..."
                rows={2}
                className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
              />
            </div>

            {/* Deal Association Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
              <div className="text-xs text-amber-700">
                <span className="font-bold">Linked to:</span> {deal.title}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => { setShowUploadModal(false); setSelectedFile(null); setDocumentName(''); setDocumentNotes(''); }}
                className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={isUploading || !documentName.trim()}
                className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={14} /> Upload
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

export default DealWorkspace;
