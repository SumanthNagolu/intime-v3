'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { ChevronLeft, Building2, Plus, Mail, Phone, ArrowUpRight, Activity, Zap } from 'lucide-react';

export const AccountDetail: React.FC = () => {
  const { accountId } = useParams();
  const router = useRouter();
  const { accounts, jobs, leads, deals } = useAppStore();
  
  const account = accounts.find(a => a.id === accountId);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Jobs' | 'Pipeline'>('Overview');

  if (!account) return <div className="p-8 text-center">Account not found</div>;

  const accountJobs = jobs.filter(j => j.accountId === account.id);
  // In a real app, leads/deals would link to accountId too
  const relatedLeads = leads.filter(l => l.company === account.name); 
  const relatedDeals = deals.filter(d => d.company === account.name);

  return (
    <div className="animate-fade-in">
      <Link href="/employee/recruiting/accounts" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Accounts
      </Link>

      {/* Header Card */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-200 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-charcoal"></div>
          <div className="flex justify-between items-start">
              <div className="flex gap-6">
                  <div className="w-24 h-24 bg-stone-50 rounded-3xl flex items-center justify-center text-stone-400 border border-stone-100 shadow-sm">
                      <Building2 size={40} />
                  </div>
                  <div>
                      <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">{account.name}</h1>
                      <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
                          <span className="bg-stone-100 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">{account.industry}</span>
                          <span>•</span>
                          <span>{account.type}</span>
                      </div>
                      <p className="text-stone-600 max-w-xl text-sm leading-relaxed">{account.description}</p>
                  </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${
                      account.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-stone-100 text-stone-500'
                  }`}>
                      {account.status}
                  </span>
                  <button className="text-xs font-bold text-rust hover:underline mt-2">Edit Details</button>
              </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-stone-200 mb-8">
          {(['Overview', 'Jobs', 'Pipeline'] as const).map(tab => (
              <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
                     activeTab === tab ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
                 }`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Account Intelligence */}
              <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                      <h3 className="font-serif text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
                          <Activity size={20} className="text-rust"/> Account Intelligence
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-4 mb-8">
                          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Responsiveness</div>
                              <div className={`font-bold text-lg ${account.responsiveness === 'High' ? 'text-green-600' : 'text-yellow-600'}`}>
                                  {account.responsiveness}
                              </div>
                          </div>
                          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Key Driver</div>
                              <div className="font-bold text-lg text-charcoal">
                                  {account.preference}
                              </div>
                          </div>
                          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Manager</div>
                              <div className="font-bold text-lg text-charcoal">David Kim</div>
                          </div>
                      </div>

                      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4 items-start">
                          <Zap size={20} className="text-blue-600 shrink-0 mt-1" />
                          <div>
                              <h4 className="font-bold text-blue-900 text-sm mb-1">Strategy Tip</h4>
                              <p className="text-blue-800 text-xs leading-relaxed">
                                  This account prioritizes <strong>Quality</strong> over speed. Ensure candidates are thoroughly vetted. 
                                  They typically respond well to detailed submission notes highlighting specific project experience.
                              </p>
                          </div>
                      </div>
                  </div>

                  {/* Points of Contact */}
                  <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-serif text-xl font-bold text-charcoal">Key Stakeholders</h3>
                          <button className="text-xs font-bold text-stone-400 hover:text-charcoal uppercase tracking-widest flex items-center gap-1">
                              <Plus size={12} /> Add POC
                          </button>
                      </div>
                      <div className="space-y-4">
                          {account.pocs.length > 0 ? account.pocs.map(poc => (
                              <div key={poc.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-serif font-bold text-charcoal shadow-sm">
                                          {poc.name.charAt(0)}
                                      </div>
                                      <div>
                                          <div className="font-bold text-charcoal text-sm">{poc.name}</div>
                                          <div className="text-xs text-stone-500">{poc.role}</div>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <span className="inline-block px-2 py-0.5 bg-stone-200 rounded text-[10px] font-bold uppercase text-stone-600 mb-1">{poc.influence}</span>
                                      <div className="flex justify-end gap-2 text-stone-400">
                                          <Mail size={14} className="hover:text-charcoal cursor-pointer" />
                                          <Phone size={14} className="hover:text-charcoal cursor-pointer" />
                                      </div>
                                  </div>
                              </div>
                          )) : (
                              <p className="text-stone-400 text-sm italic">No contacts listed.</p>
                          )}
                      </div>
                  </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                  <div className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-xl bg-noise relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rust/20 rounded-full blur-2xl -mr-6 -mt-6"></div>
                      <h3 className="font-serif text-xl font-bold mb-4 relative z-10">Active Jobs</h3>
                      <div className="text-5xl font-serif font-bold mb-6 relative z-10">{accountJobs.filter(j => j.status === 'open' || j.status === 'urgent').length}</div>
                      <button 
                        onClick={() => router.push('/employee/recruiting/post')} 
                        className="w-full py-3 bg-white text-charcoal rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                          <Plus size={14} /> New Requisition
                      </button>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-lg">
                      <h3 className="font-bold text-xs uppercase tracking-widest text-stone-400 mb-4">Recent Activity</h3>
                      <div className="space-y-4">
                          <div className="flex gap-3">
                              <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></div>
                              <div>
                                  <p className="text-xs font-bold text-charcoal">Deal Won</p>
                                  <p className="text-[10px] text-stone-400">2 days ago</p>
                              </div>
                          </div>
                          <div className="flex gap-3">
                              <div className="w-2 h-2 mt-1.5 rounded-full bg-stone-300 shrink-0"></div>
                              <div>
                                  <p className="text-xs font-bold text-charcoal">Lead Converted</p>
                                  <p className="text-[10px] text-stone-400">2 days ago</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'Jobs' && (
          <div className="space-y-4">
              {accountJobs.map(job => (
                  <Link href={`/employee/recruiting/jobs/${job.id}`} key={job.id} className="flex items-center justify-between p-6 bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-rust/30 transition-all group">
                      <div>
                          <h4 className="font-bold text-lg text-charcoal group-hover:text-rust transition-colors">{job.title}</h4>
                          <div className="flex items-center gap-4 text-xs text-stone-500 mt-1">
                              <span>{job.location}</span>
                              <span>{job.rate}</span>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              job.status === 'urgent' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                          }`}>
                              {job.status}
                          </span>
                          <ArrowUpRight size={18} className="text-stone-300 group-hover:text-charcoal" />
                      </div>
                  </Link>
              ))}
              {accountJobs.length === 0 && <p className="text-stone-400 italic">No jobs found.</p>}
          </div>
      )}

      {activeTab === 'Pipeline' && (
          <div className="space-y-6">
              {/* Related Leads */}
              <div className="bg-white p-6 rounded-[2rem] border border-stone-200">
                  <h4 className="font-bold text-charcoal text-sm mb-4">Associated Leads</h4>
                  {relatedLeads.length > 0 ? relatedLeads.map(l => (
                      <div key={l.id} className="p-3 border-b border-stone-100 last:border-0 flex justify-between">
                          <span className="text-sm font-medium">{l.contact}</span>
                          <span className="text-xs text-stone-500">{l.status}</span>
                      </div>
                  )) : <p className="text-xs text-stone-400 italic">None</p>}
              </div>

              {/* Related Deals */}
              <div className="bg-white p-6 rounded-[2rem] border border-stone-200">
                  <h4 className="font-bold text-charcoal text-sm mb-4">Sales Opportunities</h4>
                  {relatedDeals.length > 0 ? relatedDeals.map(d => (
                      <div key={d.id} className="p-3 border-b border-stone-100 last:border-0 flex justify-between">
                          <span className="text-sm font-medium">{d.title}</span>
                          <span className="text-xs font-bold text-green-600">{d.value}</span>
                      </div>
                  )) : <p className="text-xs text-stone-400 italic">None</p>}
              </div>
          </div>
      )}
    </div>
  );
};
