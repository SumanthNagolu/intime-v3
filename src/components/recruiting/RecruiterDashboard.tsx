'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { trpc } from '../../lib/trpc/client';
import { Briefcase, ArrowRight, Plus, MapPin, ChevronLeft, Send, Award, Star, Building2, Activity, Check, TrendingUp, Zap, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

// Import new CRM components
import { LeadsList } from './LeadsList';
import { LeadDetail } from './LeadDetail';
import { DealsPipeline } from './DealsPipeline';
import { DealDetail } from './DealDetail';
import { JobDetail } from './JobDetail';
import { OfferBuilder } from './OfferBuilder';
import { PlacementWorkflow } from './PlacementWorkflow';
import { PipelineView } from './PipelineView';
import { CandidateDetail } from './CandidateDetail';
import { AccountsList } from './AccountsList';
import { AccountDetail } from './AccountDetail';
import { ScreeningRoom } from './ScreeningRoom';
import { SourcingRoom } from './SourcingRoom';
import { SubmissionBuilder } from './SubmissionBuilder';
import { CreateLeadModal, CreateDealModal } from './Modals';
import { SourcingModal } from './SourcingModal';

// --- DAILY PLANNER WIDGET - CLEAN PREMIUM ---
const DailyPlanner: React.FC = () => {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Call Sarah about Offer', done: false },
        { id: 2, text: 'Review 5 new applicants for TechFlow', done: false },
        { id: 3, text: 'Follow up with Mike (Client)', done: true }
    ]);

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    return (
        <Card className="bg-white border border-charcoal-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-forest-100 rounded-lg flex items-center justify-center">
                            <Calendar size={20} className="text-forest-700" strokeWidth={2} />
                        </div>
                        <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                            Daily Planner
                        </CardTitle>
                    </div>
                    <span className="text-xs text-charcoal-500 font-semibold uppercase tracking-wider px-3 py-1 bg-charcoal-50 rounded-full">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border",
                            task.done
                                ? 'bg-charcoal-50 text-charcoal-400 line-through border-charcoal-100'
                                : 'bg-white hover:bg-forest-50 text-charcoal-900 border-charcoal-200 hover:border-forest-300'
                        )}
                    >
                        <div className={cn(
                            "w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                            task.done
                                ? 'border-success-500 bg-success-500 text-white'
                                : 'border-charcoal-300 hover:border-forest-500 bg-white'
                        )}>
                            {task.done && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-medium">{task.text}</span>
                    </div>
                ))}
                <button className="w-full py-3 mt-2 text-xs font-semibold text-forest-700 uppercase tracking-wider border border-dashed border-forest-300 rounded-lg hover:border-forest-500 hover:bg-forest-50 transition-all duration-200 flex items-center justify-center gap-2">
                    <Plus size={14} strokeWidth={2} />
                    Add Task
                </button>
            </CardContent>
        </Card>
    );
};

// --- DASHBOARD HOME ---

const DashboardHome: React.FC<{ onSearchRequest: () => void }> = ({ onSearchRequest: _onSearchRequest }) => {
  // Fetch real data from backend using tRPC
  const { data: jobs, isLoading: jobsLoading } = trpc.ats.jobs.list.useQuery({
    limit: 50,
    offset: 0,
    status: 'open'
  });

  const { data: submissions, isLoading: submissionsLoading } = trpc.ats.submissions.list.useQuery({
    limit: 50,
    offset: 0
  });

  const { data: placementsCount, isLoading: placementsLoading } = trpc.ats.placements.activeCount.useQuery();

  // Calculate stats from real data
  const activeJobs = jobs || [];
  const activeSubmissions = submissions?.filter(s =>
    ['screening', 'submitted_to_client', 'client_interview', 'offer'].includes(s.status)
  ) || [];
  const placements = placementsCount || 0;

  // Static metrics for animation
  const metrics = {
    placements: placements || 3,
    submissions: activeSubmissions.length || 8,
    openReqs: activeJobs.length || 5,
    revenue: 147000, // Could come from backend
    conversionRate: 68
  };

  // Animated metrics state
  const [animatedMetrics, setAnimatedMetrics] = useState({
    placements: 0,
    submissions: 0,
    openReqs: 0,
    revenue: 0,
    conversionRate: 0
  });

  // Animate metrics on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedMetrics({
        placements: Math.round(metrics.placements * progress),
        submissions: Math.round(metrics.submissions * progress),
        openReqs: Math.round(metrics.openReqs * progress),
        revenue: Math.round(metrics.revenue * progress),
        conversionRate: Math.round(metrics.conversionRate * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading state
  if (jobsLoading || submissionsLoading || placementsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-forest-100 border-t-forest-500 mx-auto mb-4"></div>
          <p className="text-body text-charcoal-500 font-subheading">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placements Card - Clean with Status Color */}
        <Card className="bg-white border border-charcoal-200 shadow-lg hover:shadow-xl group transition-all duration-300">
          <div className="h-1 bg-gradient-to-r from-success-500 to-success-600"></div>
          
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <Award size={24} className="text-success-700" strokeWidth={2} />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-success-50 rounded-full border border-success-200">
                <TrendingUp size={12} strokeWidth={2.5} className="text-success-600" />
                <span className="text-xs font-semibold text-success-700 uppercase tracking-wider">On Track</span>
              </div>
            </div>
            <div className="text-4xl font-heading font-black text-charcoal-900 mb-2">
              {animatedMetrics.placements}
            </div>
            <CardDescription className="text-base text-charcoal-600 font-medium">
              My Placements This Quarter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between pt-4 border-t border-charcoal-100">
              <span className="text-sm text-charcoal-500">Target: 4</span>
              <Link href="/employee/recruiting/pipeline" className="text-sm font-semibold text-forest-700 hover:text-forest-800 transition-colors flex items-center gap-1 group-hover:gap-2">
                View Pipeline <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Active Submissions Card */}
        <Card className="bg-white border border-charcoal-200 shadow-lg hover:shadow-xl group transition-all duration-300">
          <div className="h-1 bg-gradient-to-r from-forest-500 to-forest-600"></div>
          
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-forest-100 rounded-lg flex items-center justify-center">
                <FileCheck size={24} className="text-forest-700" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-forest-700 bg-forest-50 px-3 py-1 rounded-full border border-forest-200 uppercase tracking-wider">
                Active
              </span>
            </div>
            <div className="text-4xl font-heading font-black text-charcoal-900 mb-2">
              {animatedMetrics.submissions}
            </div>
            <CardDescription className="text-base text-charcoal-600 font-medium">
              Submissions in Pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between pt-4 border-t border-charcoal-100">
              <span className="text-sm text-charcoal-500">Target: 12+</span>
              <Link href="/employee/recruiting/pipeline" className="text-sm font-semibold text-forest-700 hover:text-forest-800 transition-colors flex items-center gap-1 group-hover:gap-2">
                Manage <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Open Reqs Card - Urgent Priority */}
        <Card className="bg-white border border-charcoal-200 shadow-lg hover:shadow-xl group relative transition-all duration-300">
          <div className="h-1 bg-gradient-to-r from-warning-500 to-warning-600"></div>
          {/* Subtle pulse indicator */}
          <div className="absolute top-4 right-4">
            <div className="w-2 h-2 bg-warning-500 rounded-full animate-ping opacity-75 absolute"></div>
            <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
          </div>
          
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <Briefcase size={24} className="text-warning-700" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-warning-700 bg-warning-50 px-3 py-1 rounded-full border border-warning-200 uppercase tracking-wider">
                Urgent
              </span>
            </div>
            <div className="text-4xl font-heading font-black text-charcoal-900 mb-2">
              {animatedMetrics.openReqs}
            </div>
            <CardDescription className="text-base text-charcoal-600 font-medium">
              Open Requisitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between pt-4 border-t border-charcoal-100">
              <span className="text-sm text-charcoal-500">Needs attention</span>
              <Link href="/employee/recruiting/jobs" className="text-sm font-semibold text-warning-700 hover:text-warning-800 transition-colors flex items-center gap-1 group-hover:gap-2">
                View All <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pipeline Visualization */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-forest rounded-lg flex items-center justify-center shadow-elevation-sm">
                      <Activity size={20} className="text-gold-300" strokeWidth={2.5} />
                    </div>
                    Pipeline Overview
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Track candidate progress across stages
                  </CardDescription>
                </div>
                <Link href="/employee/recruiting/pipeline" className="text-caption font-bold text-forest-600 hover:text-forest-700 transition-colors">
                  View Details
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Pipeline Stages */}
                {[
                  { stage: 'Sourcing', count: 12, color: 'charcoal', progress: 100 },
                  { stage: 'Screening', count: 5, color: 'forest', progress: 75 },
                  { stage: 'Client Interview', count: 3, color: 'gold', progress: 50 },
                  { stage: 'Offer', count: 2, color: 'success', progress: 40 }
                ].map((stage, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-caption font-heading font-black",
                          stage.color === 'charcoal' && "bg-charcoal-900 text-white",
                          stage.color === 'forest' && "bg-forest-500 text-white",
                          stage.color === 'gold' && "bg-gold-500 text-charcoal-900",
                          stage.color === 'success' && "bg-success-500 text-white"
                        )}>
                          {stage.count}
                        </div>
                        <span className="text-body font-subheading font-semibold text-charcoal-900">
                          {stage.stage}
                        </span>
                      </div>
                      <span className="text-caption font-mono font-bold text-charcoal-500">
                        {stage.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          stage.color === 'charcoal' && "bg-gradient-to-r from-charcoal-700 to-charcoal-900",
                          stage.color === 'forest' && "bg-gradient-forest",
                          stage.color === 'gold' && "bg-gradient-gold",
                          stage.color === 'success' && "bg-gradient-to-r from-success-400 to-success-500"
                        )}
                        style={{ width: `${stage.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Requisitions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Requisitions</CardTitle>
                <Link href="/employee/recruiting/jobs" className="text-caption font-bold text-forest-600 hover:text-forest-700 transition-colors">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeJobs.slice(0, 3).map(job => (
                <Link
                  href={`/employee/recruiting/jobs/${job.id}`}
                  key={job.id}
                  className="block p-6 bg-charcoal-50 rounded-xl hover:bg-forest-50 transition-all duration-300 group border border-charcoal-100 hover:border-forest-200 hover:-translate-y-0.5"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-heading font-bold text-body text-charcoal-900 group-hover:text-forest-700 transition-colors mb-2">
                        {job.title}
                      </div>
                      <div className="flex items-center gap-4 text-caption text-charcoal-500">
                        <span className="flex items-center gap-2">
                          <Building2 size={14} strokeWidth={2} />
                          {job.accountId || 'Client'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-2">
                          <MapPin size={14} strokeWidth={2} />
                          {job.location || 'Remote'}
                        </span>
                      </div>
                    </div>
                    {job.priority === 'high' && (
                      <span className="text-caption font-bold bg-error-50 text-error-600 px-3 py-1 rounded-full uppercase tracking-wider border border-error-100">
                        Urgent
                      </span>
                    )}
                  </div>
                </Link>
              ))}
              {activeJobs.length === 0 && (
                <div className="text-center py-12 text-charcoal-400">
                  <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-body font-subheading">No active jobs</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-8">
          <DailyPlanner />

          {/* Performance Card */}
          <Card className="border-forest-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center shadow-elevation-sm">
                  <Zap size={20} className="text-charcoal-900" strokeWidth={2.5} />
                </div>
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Revenue Impact */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-caption font-semibold text-charcoal-600">Revenue Generated</span>
                  <span className="text-caption font-mono font-bold text-forest-700">
                    ${(animatedMetrics.revenue / 1000).toFixed(0)}k
                  </span>
                </div>
                <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-forest rounded-full transition-all duration-1000"
                    style={{ width: `${(animatedMetrics.revenue / 200000) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Conversion Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-caption font-semibold text-charcoal-600">Conversion Rate</span>
                  <span className="text-caption font-mono font-bold text-success-700">
                    {animatedMetrics.conversionRate}%
                  </span>
                </div>
                <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-success-400 to-success-500 rounded-full transition-all duration-1000"
                    style={{ width: `${animatedMetrics.conversionRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="pt-4 border-t border-charcoal-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-caption text-charcoal-500">Avg. Time to Fill</span>
                  <span className="text-caption font-mono font-bold text-charcoal-900">18 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-caption text-charcoal-500">Client Satisfaction</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={12} className="text-gold-500 fill-gold-500" />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-h4">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-charcoal-100"></div>
                {activeSubmissions.slice(0, 4).map((sub, idx) => (
                  <div key={sub.id} className="relative pl-6">
                    <div className={cn(
                      "absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white",
                      idx === 0 ? "bg-success-500" : "bg-charcoal-200"
                    )}></div>
                    <p className="text-caption font-bold text-charcoal-900">
                      Submission #{sub.id.slice(0, 8)}
                    </p>
                    <p className="text-caption text-charcoal-500">
                      {sub.status.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
                {activeSubmissions.length === 0 && (
                  <p className="text-caption text-charcoal-400 italic pl-6">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const JobIntake: React.FC = () => {
  const router = useRouter();

  // Fetch accounts for dropdown
  const { data: accountsData } = trpc.crm.accounts.list.useQuery({ page: 1, pageSize: 100 });
  const accounts = accountsData?.items;

  // Create job mutation
  const createJobMutation = trpc.ats.jobs.create.useMutation({
    onSuccess: () => {
      router.push('/employee/recruiting/jobs');
    },
    onError: (error) => {
      console.error('Failed to create job:', error);
      alert('Failed to create job. Please try again.');
    }
  });

  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    location: '',
    jobType: 'contract' as 'contract' | 'contract_to_hire' | 'permanent' | 'temp' | 'fulltime',
    salaryRange: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createJobMutation.mutate({
      accountId: formData.clientId || undefined,
      title: formData.title,
      location: formData.location,
      jobType: formData.jobType,
      description: formData.description,
      status: 'open',
      urgency: 'medium',
      positionsCount: 1,
      ownerId: '' // Will be set by the server from ctx.userId
    });
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link href="/employee/recruiting/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Cancel & Back
      </Link>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-rust"></div>
        <div className="mb-10 border-b border-stone-100 pb-8">
          <h2 className="text-3xl font-serif font-bold text-charcoal mb-2">Submit New Requisition</h2>
          <p className="text-stone-500">Our Talent AI will immediately begin sourcing matching profiles upon submission.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Account (Client)</label>
              <select
                required
                value={formData.clientId}
                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust font-bold text-charcoal"
              >
                  <option value="">Select a client...</option>
                  {accounts?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Position Title</label>
              <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" placeholder="e.g. Senior Guidewire Developer" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Location</label>
              <input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" placeholder="e.g. Remote (US)" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Employment Type</label>
              <select value={formData.jobType} onChange={e => setFormData({ ...formData, jobType: e.target.value as 'contract' | 'contract_to_hire' | 'permanent' | 'temp' | 'fulltime' })} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust">
                <option value="contract">Contract</option>
                <option value="permanent">Full-time</option>
                <option value="contract_to_hire">C2H</option>
                <option value="temp">Temp</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Target Rate / Salary</label>
              <input required value={formData.salaryRange} onChange={e => setFormData({ ...formData, salaryRange: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" placeholder="e.g. $90-110/hr" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Job Description & Requirements</label>
            <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-48 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust resize-none leading-relaxed" placeholder="Paste the full job description here..." />
          </div>

          <div className="flex items-center justify-end pt-6 border-t border-stone-100">
            <button type="submit" disabled={createJobMutation.isPending} className="px-10 py-4 bg-charcoal text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {createJobMutation.isPending ? 'Processing...' : 'Submit Requisition'} <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TIME_FILTERS = ['Current Sprint', 'This Month', 'This Quarter', 'YTD', 'All Time'];

const JobsList: React.FC = () => {
    const { jobs } = useAppStore();
    const [statusFilter, setStatusFilter] = useState('All');
    const [timeFilter, setTimeFilter] = useState('All Time');

    // Strict Filter: Only show internal/client jobs, exclude 'market' jobs
    const internalJobs = jobs.filter(j => j.ownerId !== 'market');

    const filteredJobs = internalJobs.filter(j =>
        (statusFilter === 'All' || j.status === statusFilter.toLowerCase())
    );

    return (
        <div className="animate-fade-in space-y-8">
            {/* Filter Bar */}
            <Card>
                <CardContent className="flex flex-col md:flex-row gap-4 justify-between items-end">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {['All', 'Open', 'Urgent', 'Filled', 'Hold'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "px-6 py-3 rounded-full text-caption font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                                    statusFilter === status
                                        ? 'bg-gradient-forest text-white shadow-elevation-md hover:shadow-elevation-lg'
                                        : 'bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100 hover:text-charcoal-700'
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="glass-strong p-2 rounded-full flex gap-1 overflow-x-auto max-w-full shadow-inner">
                        {TIME_FILTERS.map(tf => (
                            <button
                                key={tf}
                                onClick={() => setTimeFilter(tf)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-caption font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300",
                                    timeFilter === tf
                                        ? 'bg-white text-charcoal-900 shadow-elevation-sm'
                                        : 'text-charcoal-400 hover:text-charcoal-700'
                                )}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                    <Link href={`/employee/recruiting/jobs/${job.id}`} key={job.id}>
                        <Card className="group relative h-full">
                            {/* Status indicator line */}
                            <div className={cn(
                                "absolute top-0 left-0 w-full h-1 rounded-t-xl",
                                job.status === 'urgent' && "bg-gradient-to-r from-error-500 to-error-600",
                                job.status === 'filled' && "bg-gradient-to-r from-success-500 to-success-600",
                                job.status === 'open' && "bg-gradient-gold"
                            )}></div>

                            <CardHeader>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="text-caption font-bold text-charcoal-500 uppercase tracking-wider mb-2">
                                            {job.client}
                                        </div>
                                        <CardTitle className="text-h4 group-hover:text-forest-700 transition-colors">
                                            {job.title}
                                        </CardTitle>
                                    </div>
                                    <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center border border-forest-100 group-hover:bg-forest-100 transition-colors">
                                        <Briefcase size={20} className="text-forest-600" strokeWidth={2.5} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-body text-charcoal-600">
                                        <MapPin size={16} className="text-forest-600" strokeWidth={2} />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-3 text-body text-charcoal-600">
                                        <DollarSign size={16} className="text-gold-600" strokeWidth={2} />
                                        {job.rate}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="flex items-center justify-between pt-4 border-t border-charcoal-100">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-caption font-bold uppercase tracking-wider border",
                                        job.status === 'urgent' && 'bg-error-50 text-error-600 border-error-100',
                                        job.status === 'filled' && 'bg-success-50 text-success-600 border-success-100',
                                        job.status === 'open' && 'bg-forest-50 text-forest-600 border-forest-100'
                                    )}>
                                        {job.status}
                                    </span>
                                    <span className="text-caption font-bold text-forest-600 group-hover:text-forest-700 transition-colors flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                                        Details <ArrowRight size={12} strokeWidth={2.5} />
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {filteredJobs.length === 0 && (
                    <div className="col-span-full">
                        <Card>
                            <CardContent className="text-center py-16">
                                <Briefcase size={64} className="mx-auto mb-6 text-charcoal-200" strokeWidth={1.5} />
                                <CardTitle className="mb-2">No jobs found</CardTitle>
                                <CardDescription>
                                    Try adjusting your filters or create a new requisition
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN CONTROLLER ---

export const RecruiterDashboard: React.FC = () => {
  const pathname = usePathname();
  const { jobId, candidateId, leadId, dealId, accountId, submissionId } = useParams();
  const { addLead, addDeal, leads } = useAppStore();
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isSourcingModalOpen, setIsSourcingModalOpen] = useState(false);

  // Router Logic to switch views
  let content;

  const currentPath = pathname;

  if (currentPath.includes('/post')) {
      content = <JobIntake />;
  } else if (jobId && currentPath.includes('/jobs/')) {
      content = <JobDetail />;
  } else if (candidateId && currentPath.includes('/sourcing/')) { // Sourcing Room
      content = <SourcingRoom />;
  } else if (candidateId && currentPath.includes('/screening/')) {
      content = <ScreeningRoom />;
  } else if (candidateId && currentPath.includes('/candidate/')) {
      content = <CandidateDetail />;
  } else if (leadId && currentPath.includes('/leads/')) {
      content = <LeadDetail />;
  } else if (currentPath.includes('/leads')) {
      content = <LeadsList />;
  } else if (dealId && currentPath.includes('/deals/')) {
      content = <DealDetail />;
  } else if (currentPath.includes('/deals')) {
      content = <DealsPipeline />;
  } else if (accountId && currentPath.includes('/accounts/')) {
      content = <AccountDetail />;
  } else if (currentPath.includes('/accounts')) {
      content = <AccountsList />;
  } else if (submissionId && currentPath.includes('/offer/')) { 
      content = <OfferBuilder />;
  } else if (submissionId && currentPath.includes('/placement/')) {
      content = <PlacementWorkflow />;
  } else if (currentPath.includes('/pipeline')) {
      content = <PipelineView />;
  } else if (currentPath.includes('/jobs')) {
      content = <JobsList />;
  } else if (candidateId && currentPath.includes('/submit/')) {
      content = <SubmissionBuilder />;
  } else {
      content = <DashboardHome onSearchRequest={() => {}} />;
  }

  return (
    <div>
      {content}

      {/* Hoisted Modals */}
      {isLeadModalOpen && <CreateLeadModal onClose={() => setIsLeadModalOpen(false)} onSave={addLead} />}
      {isDealModalOpen && <CreateDealModal leads={leads} onClose={() => setIsDealModalOpen(false)} onSave={addDeal} />}
      {isSourcingModalOpen && jobId && typeof jobId === 'string' && <SourcingModal isOpen={isSourcingModalOpen} onClose={() => setIsSourcingModalOpen(false)} jobId={jobId} />}
    </div>
  );
};
