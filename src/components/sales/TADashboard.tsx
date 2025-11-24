'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { TrendingUp, Megaphone, Target, Building2, UserPlus, Filter, ArrowRight, Database, Activity, Users, Briefcase, Plus, LayoutDashboard, DollarSign } from 'lucide-react';

// Reuse components to maintain consistency
import { LeadsList } from '../recruiting/LeadsList';
import { LeadDetail } from '../recruiting/LeadDetail';
import { DealsPipeline } from '../recruiting/DealsPipeline';
import { DealDetail } from '../recruiting/DealDetail';
import { CreateLeadModal, CreateDealModal } from '../recruiting/Modals';
import { CampaignManager } from './CampaignManager';
import { AccountProspects } from './AccountProspects';
import { SourcedCandidates } from './SourcedCandidates';
import { SalesAnalytics } from './SalesAnalytics';

// --- CONSOLE VIEW (METRICS) ---
const SalesConsole: React.FC = () => {
  const { leads, campaigns } = useAppStore();
  const [mode, setMode] = useState<'business' | 'talent'>('business');

  // Mock Data for the two modes
  const businessStats = {
      activeCampaigns: campaigns.filter(c => c.status === 'Active').length,
      newLeads: leads.filter(l => l.status === 'new').length,
      meetingsBooked: 5,
      pipelineValue: '$450k'
  };

  const talentStats = {
      activeCampaigns: 2,
      profilesSourced: 85,
      responses: 14,
      interviews: 3
  };

  // Common stats accessor
  const activeCampaignCount = mode === 'business' ? businessStats.activeCampaigns : talentStats.activeCampaigns;

  return (
    <div className="animate-fade-in">
      {/* Mode Toggle */}
      <div className="flex justify-between mb-8">
        <div className="text-lg font-serif font-bold text-charcoal flex items-center gap-2">
            <Activity size={20} className="text-rust" />
            {mode === 'business' ? 'Account Hunting Mode' : 'Talent Sourcing Mode'}
        </div>
        <div className="flex gap-4 bg-stone-100 p-1 rounded-full">
            <button 
                onClick={() => setMode('business')}
                className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'business' ? 'bg-white text-charcoal shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
            >
                <Building2 size={14} /> Find Clients
            </button>
            <button 
                onClick={() => setMode('talent')}
                className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'talent' ? 'bg-white text-charcoal shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
            >
                <UserPlus size={14} /> Find Talent
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-charcoal text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-rust/20 rounded-full blur-2xl -mr-6 -mt-6"></div>
               <div className="relative z-10">
                   <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Active Campaigns</div>
                   <div className="text-4xl font-serif font-bold mb-2">{activeCampaignCount}</div>
                   <Link href="/employee/ta/campaigns" className="text-xs text-rust font-bold uppercase tracking-wide hover:underline flex items-center gap-1">
                       Manage <ArrowRight size={10} />
                   </Link>
               </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-lg">
               <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                   {mode === 'business' ? 'New Leads' : 'Sourced Profiles'}
               </div>
               <div className="text-4xl font-serif font-bold text-charcoal mb-2">
                   {mode === 'business' ? businessStats.newLeads : talentStats.profilesSourced}
               </div>
               <div className="text-xs text-green-600 font-bold uppercase tracking-wide bg-green-50 px-2 py-1 rounded inline-block">
                   +15% this week
               </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-lg">
               <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                   {mode === 'business' ? 'Meetings Booked' : 'Responses'}
               </div>
               <div className="text-4xl font-serif font-bold text-charcoal mb-2">
                   {mode === 'business' ? businessStats.meetingsBooked : talentStats.responses}
               </div>
               <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 w-1/2"></div>
               </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-lg">
               <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                   {mode === 'business' ? 'Pipeline Value' : 'Interviews'}
               </div>
               <div className="text-4xl font-serif font-bold text-charcoal mb-2">
                   {mode === 'business' ? businessStats.pipelineValue : talentStats.interviews}
               </div>
               <p className="text-[10px] text-stone-400 uppercase tracking-widest">Generated Q4</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Activity Feed */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* Hot Leads / Candidates */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-xl font-bold text-charcoal flex items-center gap-2">
                          <Target size={20} className="text-blue-600" /> {mode === 'business' ? 'Hot Client Leads' : 'Top Candidates'}
                      </h3>
                      <Link href={mode === 'business' ? "/employee/ta/prospects" : "/employee/ta/candidates"} className="text-xs font-bold text-stone-400 hover:text-charcoal uppercase tracking-widest flex items-center gap-1">
                          View All <ArrowRight size={12} />
                      </Link>
                  </div>

                  <div className="space-y-4">
                      {(mode === 'business' ? leads.slice(0,3) : [
                          { id: 'c1', name: 'Priya Sharma', role: 'Sr. Dev', status: 'Active' },
                          { id: 'c2', name: 'Mike Chen', role: 'Architect', status: 'New' }
                      ]).map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-4 border-b border-stone-100 last:border-0">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-stone-100 text-charcoal flex items-center justify-center font-serif font-bold">
                                      {mode === 'business' ? item.company.charAt(0) : item.name.charAt(0)}
                                  </div>
                                  <div>
                                      <div className="font-bold text-charcoal text-sm">
                                          {mode === 'business' ? item.company : item.name}
                                      </div>
                                      <div className="text-xs text-stone-500">
                                          {mode === 'business' ? item.contact : item.role}
                                      </div>
                                  </div>
                              </div>
                              <span className="px-3 py-1 bg-stone-50 rounded-full text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                                  {item.status}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
              
              {/* Quick Actions */}
              <div className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-xl bg-noise relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-rust/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <h3 className="font-serif text-lg font-bold mb-6 relative z-10">Actions</h3>
                  <div className="space-y-3 relative z-10">
                      <Link href="/employee/ta/campaigns/new" className="w-full py-3 bg-white text-charcoal rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust hover:text-white transition-all flex items-center justify-center gap-2">
                          <Plus size={14} /> Launch Campaign
                      </Link>
                      <Link href="/employee/ta/analytics" className="w-full py-3 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-charcoal transition-all flex items-center justify-center gap-2">
                          <TrendingUp size={14} /> View Analytics
                      </Link>
                  </div>
              </div>

              {/* Funnel Visual */}
              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-stone-400 mb-6">Conversion Funnel</h3>
                  <div className="space-y-4">
                      <div>
                          <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                              <span>Outreach</span>
                              <span>1,200</span>
                          </div>
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full bg-charcoal w-full"></div>
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                              <span>Engaged</span>
                              <span>450</span>
                          </div>
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 w-[35%]"></div>
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                              <span>Qualified</span>
                              <span>85</span>
                          </div>
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full bg-rust w-[15%]"></div>
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                              <span>Closed</span>
                              <span>12</span>
                          </div>
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 w-[5%]"></div>
                          </div>
                      </div>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};

// --- MAIN WORKSPACE LAYOUT ---

export const TADashboard: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { leadId, dealId } = useParams();
  const { addLead, addDeal, leads } = useAppStore();
  
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);

  // Router Logic
  let content;
  let actionButton = null;
  
  const currentPath = pathname;

  if (leadId && currentPath.includes('/leads/')) {
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
  } else if (currentPath.includes('/campaigns')) {
      content = <CampaignManager />;
  } else if (currentPath.includes('/prospects')) {
      content = <AccountProspects />;
  } else if (currentPath.includes('/candidates')) {
      content = <SourcedCandidates />;
  } else if (currentPath.includes('/analytics')) {
      content = <SalesAnalytics />;
  } else {
      content = <SalesConsole />;
      actionButton = (
          <button onClick={() => setIsLeadModalOpen(true)} className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
              <Plus size={16} /> Add Lead
          </button>
      );
  }

  const isActive = (path: string) => pathname.includes(path);

  return (
    <div className="pt-4">
      {/* Header & Sub-Nav */}
      <div className="mb-10 border-b border-stone-200 pb-0">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
            <div>
                <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Sales Specialist</div>
                <h1 className="text-4xl font-serif font-bold text-charcoal">TA Workspace</h1>
            </div>
            <div className="flex gap-3">
                {actionButton}
            </div>
          </div>
          
          {/* Sub Nav */}
          <div className="flex gap-8 overflow-x-auto">
              <Link href="/employee/ta/dashboard" className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('dashboard') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'}`}>
                  <LayoutDashboard size={14} /> Console
              </Link>
              <Link href="/employee/ta/campaigns" className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('campaigns') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'}`}>
                  <Megaphone size={14} /> Campaigns
              </Link>
              <Link href="/employee/ta/prospects" className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('prospects') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'}`}>
                  <Building2 size={14} /> Prospects
              </Link>
              <Link href="/employee/ta/candidates" className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('candidates') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'}`}>
                  <UserPlus size={14} /> Candidates
              </Link>
              <Link href="/employee/ta/leads" className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('leads') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'}`}>
                  <Target size={14} /> Leads
              </Link>
              <Link href="/employee/ta/deals" className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('deals') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'}`}>
                  <DollarSign size={14} /> Deals
              </Link>
          </div>
      </div>

      {content}

      {/* Hoisted Modals */}
      {isLeadModalOpen && <CreateLeadModal onClose={() => setIsLeadModalOpen(false)} onSave={addLead} />}
      {isDealModalOpen && <CreateDealModal leads={leads} onClose={() => setIsDealModalOpen(false)} onSave={addDeal} />}
    </div>
  );
};
