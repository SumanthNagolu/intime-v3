'use client';


import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Clock, AlertTriangle, CheckCircle, Briefcase, MapPin, DollarSign, Search, Calendar, FileText, X, ChevronRight, Upload, Zap, Download, Award, Filter, ArrowUpRight, Plus, LayoutDashboard, Target, List, User, Flame } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { BenchTalentList } from './BenchTalentList';
import { BenchTalentDetail } from './BenchTalentDetail';
import { JobHuntRoom } from './JobHuntRoom';
import { LeadsList } from '../recruiting/LeadsList';
import { LeadDetail } from '../recruiting/LeadDetail';
import { DealsPipeline } from '../recruiting/DealsPipeline';
import { DealDetail } from '../recruiting/DealDetail';
import { AccountsList } from '../recruiting/AccountsList'; // We might need this for "My Vendors" in future, but sticking to scope
import { PipelineView } from '../recruiting/PipelineView';
import { SubmissionBuilder } from '../recruiting/SubmissionBuilder';
import { JobCollector } from './JobCollector';
import { CreateLeadModal, CreateDealModal } from '../recruiting/Modals';
import { HotlistBuilder } from './HotlistBuilder';

const DashboardHome: React.FC = () => {
    const { bench, submissions, jobs } = useAppStore();
    const placements = submissions.filter(s => s.status === 'placed').length;
    const activeSubmissions = submissions.filter(s => ['submitted_to_client', 'client_interview'].includes(s.status));

    return (
        <div className="animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Link href="/employee/bench/pipeline" className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-lg hover:shadow-xl hover:border-rust/30 transition-all block group cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-rust transition-colors">My Placements</div>
                        <ArrowUpRight size={16} className="text-rust opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-serif font-bold text-charcoal">{placements}</span>
                        <span className="text-sm font-bold mb-2 px-2 py-0.5 rounded bg-green-100 text-green-700">YTD</span>
                    </div>
                </Link>

                <Link href="/employee/bench/talent" className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-lg hover:shadow-xl hover:border-rust/30 transition-all block group cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-rust transition-colors">Active Bench</div>
                        <ArrowUpRight size={16} className="text-rust opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-serif font-bold text-charcoal">{bench.length}</span>
                        <span className="text-sm font-bold mb-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">4 Critical</span>
                    </div>
                </Link>

                <Link href="/employee/bench/pipeline" className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-lg hover:shadow-xl hover:border-rust/30 transition-all block group cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-rust transition-colors">Active Submissions</div>
                        <ArrowUpRight size={16} className="text-rust opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-serif font-bold text-charcoal">{activeSubmissions.length}</span>
                        <span className="text-sm font-bold mb-2 px-2 py-0.5 rounded bg-stone-100 text-stone-500">This Week</span>
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Bench Roster Preview */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-serif font-bold text-charcoal">Bench Roster</h3>
                        <Link href="/employee/bench/talent" className="text-xs font-bold text-rust uppercase tracking-widest hover:underline">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {bench.slice(0, 3).map(consultant => (
                            <Link href={`/employee/bench/talent/${consultant.id}`} key={consultant.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all block group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-charcoal font-serif font-bold text-lg group-hover:bg-rust group-hover:text-white transition-colors">
                                            {consultant.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-charcoal">{consultant.name}</h4>
                                            <p className="text-xs text-stone-500">{consultant.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xl font-bold font-serif ${consultant.daysOnBench > 30 ? 'text-red-500' : 'text-charcoal'}`}>{consultant.daysOnBench}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Days Aged</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Pipeline Preview */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-serif font-bold text-charcoal">Submission Pipeline</h3>
                        <Link href="/employee/bench/pipeline" className="text-xs font-bold text-rust uppercase tracking-widest hover:underline">Full Pipeline</Link>
                    </div>

                    <div className="bg-stone-50 p-6 rounded-[2rem] border border-stone-100">
                        {activeSubmissions.length > 0 ? (
                            <div className="space-y-4">
                                {activeSubmissions.slice(0, 3).map(sub => {
                                    const candidate = bench.find(c => c.id === sub.candidateId);
                                    const job = jobs.find(j => j.id === sub.jobId);
                                    if (!candidate) return null;

                                    return (
                                        <Link href={`/employee/recruiting/submit/${candidate.id}/${job?.id}`} 
                                            key={sub.id} 
                                            className="block bg-white p-4 rounded-2xl shadow-sm border border-stone-100 hover:border-rust hover:shadow-md transition-all"
                                        >
                                            <div className="flex justify-between mb-1">
                                                <span className="font-bold text-charcoal text-sm">{candidate.name}</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${sub.status === 'client_interview' ? 'text-blue-600' : 'text-stone-400'}`}>
                                                    {sub.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <div className="text-xs text-stone-500">
                                                {job ? `Submitted to ${job.client}` : 'External Submission'} • {sub.lastActivity}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-stone-400 text-sm text-center py-4">No active submissions this week.</p>
                        )}
                        <Link href="/employee/bench/pipeline" className="block text-center w-full mt-6 py-4 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors">
                            Manage Pipeline
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN CONTROLLER ---

export const BenchDashboard: React.FC = () => {
    const pathname = usePathname();
    const { candidateId, leadId, dealId, jobId } = useParams(); // Reuse params logic
    const { addLead, addDeal } = useAppStore();
    
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [isDealModalOpen, setIsDealModalOpen] = useState(false);

    // Router Logic
    let content;
    let actionButton = null;
    const currentPath = pathname;

    if (currentPath.includes('/talent/') && candidateId) {
        content = <BenchTalentDetail />;
    } else if (currentPath.includes('/talent')) {
        content = <BenchTalentList />;
    } else if (currentPath.includes('/hunt/') && candidateId) {
        content = <JobHuntRoom />;
    } else if (currentPath.includes('/leads/') && leadId) {
        content = <LeadDetail />;
    } else if (currentPath.includes('/leads')) {
        content = <LeadsList />;
        actionButton = (
            <button onClick={() => setIsLeadModalOpen(true)} className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
                <Plus size={16} /> Add Lead
            </button>
        );
    } else if (currentPath.includes('/deals/') && dealId) {
        content = <DealDetail />;
    } else if (currentPath.includes('/deals')) {
        content = <DealsPipeline />;
        actionButton = (
            <button onClick={() => setIsDealModalOpen(true)} className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
                <Plus size={16} /> New Deal
            </button>
        );
    } else if (currentPath.includes('/jobs')) {
        // In bench context, "Jobs" often means the Market Job Board
        content = <JobCollector />; 
    } else if (currentPath.includes('/pipeline')) {
        content = <PipelineView />;
    } else if (currentPath.includes('/collector')) {
        content = <JobCollector />;
    } else if (currentPath.includes('/outreach')) {
        content = <JobCollector />; 
    } else if (currentPath.includes('/hotlist')) {
        content = <HotlistBuilder />;
    } else {
        content = <DashboardHome />;
        actionButton = (
             <Link href="/employee/bench/hotlist" className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center gap-2 shadow-lg">
                 <Flame size={16} /> Create Hotlist
             </Link>
        );
    }

    const isActive = (path: string) => pathname.includes(path);

    return (
        <div>
            {content}

            {isLeadModalOpen && <CreateLeadModal onClose={() => setIsLeadModalOpen(false)} onSave={addLead} />}
            {isDealModalOpen && <CreateDealModal leads={[]} onClose={() => setIsDealModalOpen(false)} onSave={addDeal} />}
        </div>
    );
};
