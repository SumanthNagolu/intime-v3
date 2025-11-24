'use client';


import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Briefcase, Users, Clock, CheckCircle, AlertCircle, ArrowRight, Plus, Search, MapPin, DollarSign, FileText, ChevronLeft, Send, Calendar, Mail, Phone, Download, Award, Star, X, CheckSquare, ArrowLeft, Building2, Activity, Filter, LayoutDashboard, List, Target, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { Candidate, Job, Submission } from '../../types';

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
import { CreateLeadModal, CreateDealModal, CreateAccountModal } from './Modals';
import { SourcingModal } from './SourcingModal';

// --- DAILY PLANNER WIDGET ---
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
        <div className="bg-stone-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rust/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif text-lg font-bold">Daily Planner</h3>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="space-y-3">
                    {tasks.map(task => (
                        <div 
                            key={task.id} 
                            onClick={() => toggleTask(task.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${task.done ? 'bg-white/5 text-stone-500 line-through' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.done ? 'border-green-500 bg-green-500 text-stone-900' : 'border-stone-400'}`}>
                                {task.done && <Check size={12} />}
                            </div>
                            <span className="text-sm font-medium">{task.text}</span>
                        </div>
                    ))}
                    <button className="w-full py-2 mt-2 text-xs font-bold text-stone-400 uppercase tracking-widest hover:text-white border border-dashed border-stone-700 rounded-lg hover:border-stone-500 transition-colors">
                        + Add Task
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- DASHBOARD HOME ---

const DashboardHome: React.FC<{ onSearchRequest: () => void }> = ({ onSearchRequest }) => {
  const { accounts, jobs, submissions, candidates } = useAppStore();
  
  // Filter out market/external jobs for recruiter stats
  const internalJobs = jobs.filter(j => j.ownerId !== 'market');
  
  const activeJobs = internalJobs.filter(j => j.status === 'open' || j.status === 'urgent');
  const activeSubmissions = submissions.filter(s => ['screening', 'submitted_to_client', 'client_interview', 'offer'].includes(s.status));
  const placements = submissions.filter(s => s.status === 'placed').length;

  const stats = [
    { label: "My Placements", value: placements.toString(), target: "4", status: "success", path: "/employee/recruiting/pipeline" },
    { label: "Active Submissions", value: activeSubmissions.length.toString(), target: "12+", status: "neutral", path: "/employee/recruiting/pipeline" },
    { label: "Open Reqs", value: activeJobs.length.toString(), target: "5", status: "warning", path: "/employee/recruiting/jobs" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Stats & Activity */}
          <div className="flex-1">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, i) => (
                  <Link href={stat.path} key={i} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-lg hover:shadow-xl hover:border-rust/30 transition-all block group cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                       <div className="text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-rust transition-colors">{stat.label}</div>
                       <ArrowRight size={16} className="text-rust opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                    </div>
                    <div className="flex items-end gap-3">
                      <span className="text-5xl font-serif font-bold text-charcoal">{stat.value}</span>
                      <span className={`text-sm font-bold mb-2 px-2 py-0.5 rounded ${stat.status === 'success' ? 'bg-green-100 text-green-700' : stat.status === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-stone-100 text-stone-500'}`}>
                        Target: {stat.target}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Job Reqs */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif font-bold text-charcoal">Active Requisitions</h3>
                    <Link href="/employee/recruiting/jobs" className="text-xs font-bold text-rust uppercase tracking-widest hover:underline">View All</Link>
                  </div>
                  <div className="space-y-3">
                        {activeJobs.slice(0, 3).map(job => (
                            <Link href={`/employee/recruiting/jobs/${job.id}`} key={job.id} className="block p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors group border border-stone-100 hover:border-rust/30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-sm text-charcoal group-hover:text-rust transition-colors">{job.title}</div>
                                        <div className="text-xs text-stone-500 flex items-center gap-2 mt-1">
                                            <span>{job.client}</span>
                                            <span>•</span>
                                            <span>{job.location}</span>
                                        </div>
                                    </div>
                                    {job.status === 'urgent' && <div className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded uppercase tracking-wider">Urgent</div>}
                                </div>
                            </Link>
                        ))}
                        {activeJobs.length === 0 && <p className="text-stone-400 text-sm italic p-4">No active jobs.</p>}
                  </div>
              </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
              <DailyPlanner />
              
              {/* Recent Subs */}
              <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
                  <h3 className="font-bold text-sm text-charcoal mb-4 uppercase tracking-widest">Recent Activity</h3>
                  <div className="space-y-4 relative">
                      <div className="absolute left-2 top-2 bottom-2 w-px bg-stone-100"></div>
                      {activeSubmissions.slice(0, 4).map(sub => {
                          const candidate = candidates.find(c => c.id === sub.candidateId);
                          if (!candidate) return null;
                          return (
                              <div key={sub.id} className="relative pl-6">
                                  <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-stone-200 border-2 border-white"></div>
                                  <p className="text-xs font-bold text-charcoal">{candidate.name}</p>
                                  <p className="text-[10px] text-stone-500">{sub.lastActivity}</p>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

const JobIntake: React.FC = () => {
  const router = useRouter();
  const { addJob, accounts } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountId: accounts[0]?.id || '',
    title: '',
    location: '',
    type: 'Contract',
    rate: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const account = accounts.find(a => a.id === formData.accountId);
      const newJob: Job = {
        id: `j${Date.now()}`,
        accountId: formData.accountId,
        client: account ? account.name : 'Client',
        title: formData.title,
        status: 'open',
        rate: formData.rate,
        type: formData.type as any,
        location: formData.location,
        ownerId: 'current-user', // Mock
        description: formData.description
      };
      addJob(newJob);
      setIsLoading(false);
      router.push('/employee/recruiting/jobs');
    }, 1500);
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
                value={formData.accountId} 
                onChange={e => setFormData({ ...formData, accountId: e.target.value })} 
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust font-bold text-charcoal"
              >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
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
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust">
                <option>Contract</option>
                <option>Full-time</option>
                <option>C2H</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Target Rate / Salary</label>
              <input required value={formData.rate} onChange={e => setFormData({ ...formData, rate: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" placeholder="e.g. $90-110/hr" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Job Description & Requirements</label>
            <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-48 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust resize-none leading-relaxed" placeholder="Paste the full job description here..." />
          </div>

          <div className="flex items-center justify-end pt-6 border-t border-stone-100">
            <button type="submit" disabled={isLoading} className="px-10 py-4 bg-charcoal text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg flex items-center gap-2">
              {isLoading ? 'Processing...' : 'Submit Requisition'} <Send size={16} />
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
        <div className="animate-fade-in">
            
            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-end">
                <div className="flex gap-2 overflow-x-auto">
                    {['All', 'Open', 'Urgent', 'Filled', 'Hold'].map(status => (
                        <button 
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                                statusFilter === status ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="bg-stone-100 p-1 rounded-full flex gap-1 overflow-x-auto max-w-full">
                    {TIME_FILTERS.map(tf => (
                        <button
                            key={tf}
                            onClick={() => setTimeFilter(tf)}
                            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                                timeFilter === tf ? 'bg-white text-charcoal shadow-sm' : 'text-stone-400 hover:text-stone-600'
                            }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                    <Link href={`/employee/recruiting/jobs/${job.id}`} key={job.id} className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group relative">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{job.client}</div>
                                <h3 className="font-serif font-bold text-xl text-charcoal group-hover:text-rust transition-colors">{job.title}</h3>
                            </div>
                            <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400">
                                <Briefcase size={20} />
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3 text-sm text-stone-600">
                                <MapPin size={16} className="text-rust" /> {job.location}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-stone-600">
                                <DollarSign size={16} className="text-rust" /> {job.rate}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-stone-100">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                job.status === 'urgent' ? 'bg-red-50 text-red-600' : 
                                job.status === 'filled' ? 'bg-blue-50 text-blue-600' :
                                'bg-green-50 text-green-600'
                            }`}>
                                {job.status}
                            </span>
                            <button className="text-xs font-bold text-charcoal uppercase tracking-widest hover:text-rust transition-colors flex items-center gap-1">
                                Details <ArrowRight size={12} />
                            </button>
                        </div>
                    </Link>
                ))}
                
                {filteredJobs.length === 0 && (
                    <div className="col-span-full text-center py-12 text-stone-400">
                        <p>No jobs found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN CONTROLLER ---

export const RecruiterDashboard: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { jobId, candidateId, leadId, dealId, accountId, submissionId } = useParams();
  const { addLead, addDeal, addAccount, leads } = useAppStore();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isSourcingModalOpen, setIsSourcingModalOpen] = useState(false);

  // Router Logic to switch views
  let content;
  let actionButton = null;
  
  const currentPath = pathname;

  if (currentPath.includes('/post')) {
      content = <JobIntake />;
  } else if (jobId && currentPath.includes('/jobs/')) {
      content = <JobDetail />;
      actionButton = (
          <button onClick={() => setIsSourcingModalOpen(true)} className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
              <Plus size={16} /> Add Candidates
          </button>
      );
  } else if (candidateId && currentPath.includes('/sourcing/')) { // Sourcing Room
      content = <SourcingRoom />;
  } else if (candidateId && currentPath.includes('/screening/')) {
      content = <ScreeningRoom />;
  } else if (candidateId && currentPath.includes('/submit/')) {
      content = <SubmissionBuilder />;
  } else if (candidateId && currentPath.includes('/candidate/')) {
      content = <CandidateDetail />;
  } else if (leadId && currentPath.includes('/leads/')) {
      content = <LeadDetail />;
  } else if (currentPath.includes('/leads')) {
      content = <LeadsList />;
      actionButton = (
          <button onClick={() => setIsLeadModalOpen(true)} className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
              <Plus size={16} /> Add Lead
          </button>
      );
  } else if (dealId && currentPath.includes('/deals/')) {
      content = <DealDetail />;
  } else if (currentPath.includes('/deals')) {
      content = <DealsPipeline />;
      actionButton = (
          <button onClick={() => setIsDealModalOpen(true)} className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
              <Plus size={16} /> New Deal
          </button>
      );
  } else if (accountId && currentPath.includes('/accounts/')) {
      content = <AccountDetail />;
  } else if (currentPath.includes('/accounts')) {
      content = <AccountsList />;
      actionButton = (
          <button onClick={() => setIsAccountModalOpen(true)} className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
              <Plus size={16} /> Add Account
          </button>
      );
  } else if (submissionId && currentPath.includes('/offer/')) { 
      content = <OfferBuilder />;
  } else if (submissionId && currentPath.includes('/placement/')) {
      content = <PlacementWorkflow />;
  } else if (currentPath.includes('/pipeline')) {
      content = <PipelineView />;
  } else if (currentPath.includes('/jobs')) {
      content = <JobsList />;
      actionButton = (
          <Link href="/employee/recruiting/post" className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
              <Plus size={16} /> New Requisition
          </Link>
      );
  } else {
      content = <DashboardHome onSearchRequest={() => setIsSearchModalOpen(true)} />;
      actionButton = (
          <Link href="/employee/recruiting/post" className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
              <Plus size={16} /> New Requisition
          </Link>
      );
  }

  // Active Tab Logic
  const isActive = (path: string) => pathname.includes(path);

  return (
    <div className="pt-4">
      {/* Navigation Sub-Header */}
      <div className="mb-10 border-b border-stone-200 pb-0">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
            <div>
                <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Internal Recruiting</div>
                <h1 className="text-4xl font-serif font-bold text-charcoal">Recruiter Workspace</h1>
            </div>
            <div className="flex gap-3">
                {actionButton}
            </div>
          </div>
          
          {/* Sub Nav */}
          <div className="flex gap-8 overflow-x-auto">
              <Link href="/employee/recruiting/dashboard" className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('dashboard') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'}`}>
                  <LayoutDashboard size={14} /> Console
              </Link>
              <Link href="/employee/recruiting/accounts" className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('accounts') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'}`}>
                  <Building2 size={14} /> Accounts
              </Link>
              <Link href="/employee/recruiting/leads" className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('leads') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'}`}>
                  <Target size={14} /> Leads
              </Link>
              <Link href="/employee/recruiting/deals" className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('deals') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'}`}>
                  <DollarSign size={14} /> Deals
              </Link>
              <Link href="/employee/recruiting/jobs" className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('jobs') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'}`}>
                  <Briefcase size={14} /> Jobs
              </Link>
              <Link href="/employee/recruiting/pipeline" className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('pipeline') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'}`}>
                  <List size={14} /> Pipeline
              </Link>
          </div>
      </div>

      {content}

      {/* Hoisted Modals */}
      {isLeadModalOpen && <CreateLeadModal onClose={() => setIsLeadModalOpen(false)} onSave={addLead} />}
      {isDealModalOpen && <CreateDealModal leads={leads} onClose={() => setIsDealModalOpen(false)} onSave={addDeal} />}
      {isAccountModalOpen && <CreateAccountModal onClose={() => setIsAccountModalOpen(false)} onSave={addAccount} />}
      {isSourcingModalOpen && jobId && <SourcingModal isOpen={isSourcingModalOpen} onClose={() => setIsSourcingModalOpen(false)} jobId={jobId} />}
    </div>
  );
};
