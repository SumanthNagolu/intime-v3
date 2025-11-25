'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { TrendingUp, Megaphone, Target, Building2, UserPlus, Filter, ArrowRight, Database, Activity, Users, Briefcase, Plus, LayoutDashboard, DollarSign, Zap, CheckCircle, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

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
      activeCampaigns: campaigns.filter(c => c.status === 'Active').length || 3,
      newLeads: leads.filter(l => l.status === 'new').length || 24,
      meetingsBooked: 5,
      pipelineValue: 450
  };

  const talentStats = {
      activeCampaigns: 2,
      profilesSourced: 85,
      responses: 14,
      interviews: 3
  };

  // Animated metrics state
  const [animatedMetrics, setAnimatedMetrics] = useState({
      campaigns: 0,
      primary: 0,
      secondary: 0,
      tertiary: 0
  });

  // Animate metrics on mount or mode change
  useEffect(() => {
    const metrics = mode === 'business'
      ? { campaigns: businessStats.activeCampaigns, primary: businessStats.newLeads, secondary: businessStats.meetingsBooked, tertiary: businessStats.pipelineValue }
      : { campaigns: talentStats.activeCampaigns, primary: talentStats.profilesSourced, secondary: talentStats.responses, tertiary: talentStats.interviews };

    const duration = 2000;
    const steps = 60;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedMetrics({
        campaigns: Math.round(metrics.campaigns * progress),
        primary: Math.round(metrics.primary * progress),
        secondary: Math.round(metrics.secondary * progress),
        tertiary: Math.round(metrics.tertiary * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [mode]);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Mode Toggle - Premium Design */}
      <Card className="border-2 border-charcoal-100">
        <CardContent className="flex justify-between items-center py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-forest rounded-xl flex items-center justify-center shadow-elevation-sm">
              <Activity size={24} className="text-gold-300" strokeWidth={2.5} />
            </div>
            <div>
              <CardTitle className="text-h3 mb-1">
                {mode === 'business' ? 'Account Hunting Mode' : 'Talent Sourcing Mode'}
              </CardTitle>
              <CardDescription>
                {mode === 'business' ? 'Find and engage with potential clients' : 'Source and recruit top talent'}
              </CardDescription>
            </div>
          </div>
          <div className="glass-strong p-2 rounded-full flex gap-2 shadow-elevation-md">
              <button
                  onClick={() => setMode('business')}
                  className={cn(
                      "px-6 py-3 rounded-full text-caption font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
                      mode === 'business'
                          ? 'bg-gradient-forest text-white shadow-elevation-md'
                          : 'text-charcoal-500 hover:text-charcoal-700'
                  )}
              >
                  <Building2 size={16} strokeWidth={2.5} /> Find Clients
              </button>
              <button
                  onClick={() => setMode('talent')}
                  className={cn(
                      "px-6 py-3 rounded-full text-caption font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
                      mode === 'talent'
                          ? 'bg-gradient-forest text-white shadow-elevation-md'
                          : 'text-charcoal-500 hover:text-charcoal-700'
                  )}
              >
                  <UserPlus size={16} strokeWidth={2.5} /> Find Talent
              </button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards - Premium Animated Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Campaigns Card */}
          <Card className="bg-gradient-forest text-white border-0 shadow-premium hover:shadow-premium-lg group relative overflow-hidden">
               <div className="absolute inset-0 opacity-5" style={{
                 backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                 backgroundSize: '40px 40px'
               }}></div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
               <CardHeader className="relative z-10">
                   <div className="flex items-center justify-between mb-4">
                       <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center border border-gold-400/30">
                           <Megaphone size={24} className="text-gold-300" strokeWidth={2.5} />
                       </div>
                   </div>
                   <div className="text-display font-heading font-black text-white mb-2">
                       {animatedMetrics.campaigns}
                   </div>
                   <CardDescription className="text-gold-200 font-subheading font-semibold">
                       Active Campaigns
                   </CardDescription>
               </CardHeader>
               <CardContent className="relative z-10">
                   <Link href="/employee/ta/campaigns" className="text-caption font-bold text-gold-300 hover:text-gold-100 transition-colors flex items-center gap-2">
                       Manage <ArrowRight size={12} strokeWidth={2.5} />
                   </Link>
               </CardContent>
          </Card>

          {/* Primary Metric Card (New Leads / Sourced Profiles) */}
          <Card className="group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-gold"></div>
               <CardHeader>
                   <div className="flex items-center justify-between mb-4">
                       <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center border border-forest-100 group-hover:bg-forest-100 transition-colors">
                           {mode === 'business' ? (
                               <Target size={24} className="text-forest-600" strokeWidth={2.5} />
                           ) : (
                               <Users size={24} className="text-forest-600" strokeWidth={2.5} />
                           )}
                       </div>
                       <span className="text-caption font-bold text-success-600 bg-success-50 px-3 py-1 rounded-full border border-success-100">
                           +15%
                       </span>
                   </div>
                   <div className="text-display font-heading font-black text-charcoal-900 mb-2">
                       {animatedMetrics.primary}
                   </div>
                   <CardDescription className="text-charcoal-600 font-subheading font-semibold">
                       {mode === 'business' ? 'New Leads' : 'Sourced Profiles'}
                   </CardDescription>
               </CardHeader>
               <CardContent>
                   <div className="text-caption text-charcoal-500 font-medium">
                       This week
                   </div>
               </CardContent>
          </Card>

          {/* Secondary Metric Card (Meetings / Responses) */}
          <Card className="group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
               <CardHeader>
                   <div className="flex items-center justify-between mb-4">
                       <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-100 transition-colors">
                           <CheckCircle size={24} className="text-blue-600" strokeWidth={2.5} />
                       </div>
                   </div>
                   <div className="text-display font-heading font-black text-charcoal-900 mb-2">
                       {animatedMetrics.secondary}
                   </div>
                   <CardDescription className="text-charcoal-600 font-subheading font-semibold">
                       {mode === 'business' ? 'Meetings Booked' : 'Responses'}
                   </CardDescription>
               </CardHeader>
               <CardContent>
                   <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000" style={{ width: '50%' }}></div>
                   </div>
               </CardContent>
          </Card>

          {/* Tertiary Metric Card (Pipeline Value / Interviews) */}
          <Card className="group relative overflow-hidden border-2 border-charcoal-100">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 to-gold-600"></div>
               <CardHeader>
                   <div className="flex items-center justify-between mb-4">
                       <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center border border-gold-100 group-hover:bg-gold-100 transition-colors">
                           <DollarSign size={24} className="text-gold-600" strokeWidth={2.5} />
                       </div>
                   </div>
                   <div className="text-display font-heading font-black text-charcoal-900 mb-2">
                       {mode === 'business' ? `$${animatedMetrics.tertiary}k` : animatedMetrics.tertiary}
                   </div>
                   <CardDescription className="text-charcoal-600 font-subheading font-semibold">
                       {mode === 'business' ? 'Pipeline Value' : 'Interviews'}
                   </CardDescription>
               </CardHeader>
               <CardContent>
                   <div className="text-caption text-charcoal-500 font-medium">
                       Generated Q4
                   </div>
               </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Activity Feed - 2/3 width */}
          <div className="lg:col-span-2">

              {/* Hot Leads / Candidates - Premium Card List */}
              <Card>
                  <CardHeader>
                      <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                                  <Target size={20} className="text-blue-600" strokeWidth={2.5} />
                              </div>
                              {mode === 'business' ? 'Hot Client Leads' : 'Top Candidates'}
                          </CardTitle>
                          <Link
                              href={mode === 'business' ? "/employee/ta/prospects" : "/employee/ta/candidates"}
                              className="text-caption font-bold text-forest-600 hover:text-forest-700 transition-colors flex items-center gap-1"
                          >
                              View All <ArrowRight size={12} strokeWidth={2.5} />
                          </Link>
                      </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                      {(mode === 'business' ? leads.slice(0,3) : [
                          { id: 'c1', name: 'Priya Sharma', role: 'Sr. Dev', status: 'Active' },
                          { id: 'c2', name: 'Mike Chen', role: 'Architect', status: 'New' }
                      ]).map((item: any) => (
                          <div
                              key={item.id}
                              className="flex items-center justify-between p-6 bg-charcoal-50 rounded-xl hover:bg-forest-50 transition-all duration-300 border border-charcoal-100 hover:border-forest-200 hover:-translate-y-0.5 group cursor-pointer"
                          >
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full bg-gradient-forest text-white flex items-center justify-center font-heading font-black text-body shadow-elevation-sm">
                                      {mode === 'business' ? item.company?.charAt(0) || 'C' : item.name.charAt(0)}
                                  </div>
                                  <div>
                                      <div className="font-heading font-bold text-body text-charcoal-900 group-hover:text-forest-700 transition-colors">
                                          {mode === 'business' ? item.company : item.name}
                                      </div>
                                      <div className="text-caption text-charcoal-500 font-medium">
                                          {mode === 'business' ? item.contact : item.role}
                                      </div>
                                  </div>
                              </div>
                              <span className={cn(
                                  "px-3 py-1 rounded-full text-caption font-bold uppercase tracking-wider border",
                                  item.status === 'Active' && "bg-success-50 text-success-600 border-success-100",
                                  item.status === 'New' && "bg-blue-50 text-blue-600 border-blue-100",
                                  item.status === 'new' && "bg-blue-50 text-blue-600 border-blue-100"
                              )}>
                                  {item.status}
                              </span>
                          </div>
                      ))}
                  </CardContent>
              </Card>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-8">

              {/* Quick Actions - Premium Card */}
              <Card className="bg-gradient-forest text-white border-0 shadow-premium hover:shadow-premium-lg relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                  }}></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <CardHeader className="relative z-10">
                      <CardTitle className="text-h4 text-white flex items-center gap-3">
                          <div className="w-10 h-10 bg-gold-500/20 rounded-lg flex items-center justify-center border border-gold-400/30">
                              <Zap size={20} className="text-gold-300" strokeWidth={2.5} />
                          </div>
                          Quick Actions
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-3">
                      <Link
                          href="/employee/ta/campaigns/new"
                          className="block w-full py-4 bg-white text-charcoal-900 rounded-xl text-caption font-bold uppercase tracking-wider hover:shadow-elevation-lg transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                      >
                          <Plus size={16} strokeWidth={2.5} /> Launch Campaign
                      </Link>
                      <Link
                          href="/employee/ta/analytics"
                          className="block w-full py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-xl text-caption font-bold uppercase tracking-wider hover:bg-white hover:text-charcoal-900 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                      >
                          <TrendingUp size={16} strokeWidth={2.5} /> View Analytics
                      </Link>
                  </CardContent>
              </Card>

              {/* Conversion Funnel - Premium Design */}
              <Card>
                  <CardHeader>
                      <CardTitle className="text-h4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center shadow-elevation-sm">
                              <Activity size={20} className="text-charcoal-900" strokeWidth={2.5} />
                          </div>
                          Conversion Funnel
                      </CardTitle>
                      <CardDescription>Campaign performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      {[
                          { stage: 'Outreach', count: 1200, percent: 100, color: 'charcoal' },
                          { stage: 'Engaged', count: 450, percent: 37, color: 'blue' },
                          { stage: 'Qualified', count: 85, percent: 19, color: 'forest' },
                          { stage: 'Closed', count: 12, percent: 14, color: 'success' }
                      ].map((item, idx) => (
                          <div key={idx}>
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-body font-subheading font-semibold text-charcoal-900">
                                      {item.stage}
                                  </span>
                                  <span className="text-caption font-mono font-bold text-charcoal-600 bg-charcoal-50 px-3 py-1 rounded-full">
                                      {item.count.toLocaleString()}
                                  </span>
                              </div>
                              <div className="relative h-3 bg-charcoal-100 rounded-full overflow-hidden shadow-inner">
                                  <div
                                      className={cn(
                                          "h-full rounded-full transition-all duration-1000",
                                          item.color === 'charcoal' && "bg-gradient-to-r from-charcoal-700 to-charcoal-900",
                                          item.color === 'blue' && "bg-gradient-to-r from-blue-500 to-blue-600",
                                          item.color === 'forest' && "bg-gradient-forest",
                                          item.color === 'success' && "bg-gradient-to-r from-success-500 to-success-600"
                                      )}
                                      style={{ width: `${item.percent}%` }}
                                  ></div>
                              </div>
                              <div className="flex justify-between mt-1 text-caption text-charcoal-400">
                                  <span>{item.percent}% conversion</span>
                                  {idx < 3 && <span className="text-success-600 font-bold">↓ {Math.round((1 - (item.count / ([1200, 450, 85, 12][idx] || 1))) * 100)}% drop</span>}
                              </div>
                          </div>
                      ))}
                  </CardContent>
              </Card>

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
    <div>
      {content}

      {/* Hoisted Modals */}
      {isLeadModalOpen && <CreateLeadModal onClose={() => setIsLeadModalOpen(false)} onSave={addLead} />}
      {isDealModalOpen && <CreateDealModal leads={leads} onClose={() => setIsDealModalOpen(false)} onSave={addDeal} />}
    </div>
  );
};
