'use client';


import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { TrendingUp, Users, AlertTriangle, CheckCircle, DollarSign, Activity, Zap, ChevronDown, Target, BarChart3, Globe, Brain, ArrowRight, LayoutDashboard, PieChart, Lightbulb } from 'lucide-react';

export const CEODashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Console' | 'Strategy' | 'Intel'>('Console');

  // Mock metrics
  const revenue = "$147,000";
  const target = "$150,000";
  const placements = "18/20";
  const revenuePerEmployee = "$245k";

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="flex justify-between items-start">
            <div>
                <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Executive Office</div>
                <h1 className="text-4xl font-serif font-bold text-charcoal">Company Performance</h1>
                <p className="text-stone-500 mt-2">Real-time strategic oversight across all 19 pods.</p>
            </div>
            <div className="flex gap-4">
                 <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-50 shadow-sm">
                    <BarChart3 size={14} /> Export Report
                 </button>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-stone-100 mb-8">
          {['Console', 'Strategy', 'Intel'].map(tab => (
              <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${
                     activeTab === tab ? 'border-charcoal text-charcoal' : 'border-transparent text-stone-400 hover:text-charcoal'
                 }`}
              >
                  {tab === 'Console' && <LayoutDashboard size={14} />}
                  {tab === 'Strategy' && <Target size={14} />}
                  {tab === 'Intel' && <Lightbulb size={14} />}
                  {tab}
              </button>
          ))}
      </div>

      {activeTab === 'Console' && <ConsoleView revenue={revenue} placements={placements} revenuePerEmployee={revenuePerEmployee} />}
      {activeTab === 'Strategy' && <StrategyView />}
      {activeTab === 'Intel' && <IntelView />}
    </div>
  );
};

const ConsoleView: React.FC<{ revenue: string, placements: string, revenuePerEmployee: string }> = ({ revenue, placements, revenuePerEmployee }) => {
    return (
      <>
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-charcoal text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rust/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                  <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Revenue (Nov)</div>
                  <div className="text-4xl font-serif font-bold mb-2">{revenue}</div>
                  <div className="flex items-center gap-2 text-xs font-bold text-green-400 uppercase tracking-wide">
                      <TrendingUp size={14} /> 98% to Target
                  </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-rust to-charcoal transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg hover:border-rust/30 transition-colors group relative overflow-hidden">
              <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Placements</div>
              <div className="text-4xl font-serif font-bold text-charcoal mb-2">{placements}</div>
              <div className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded inline-block uppercase tracking-wide mb-1">
                  2 Pods Below Goal
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg hover:border-rust/30 transition-colors group relative overflow-hidden">
              <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Bench Utilization</div>
              <div className="text-4xl font-serif font-bold text-charcoal mb-2">78%</div>
              <div className="text-xs text-stone-400 uppercase tracking-wide">Target: 85%</div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg hover:border-rust/30 transition-colors group relative overflow-hidden">
              <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Rev / Employee</div>
              <div className="text-4xl font-serif font-bold text-forest mb-2">{revenuePerEmployee}</div>
              <div className="text-xs text-stone-400 uppercase tracking-wide">Annualized</div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Pod Scoreboard */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-stone-200 shadow-xl overflow-hidden flex flex-col">
              <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                  <h3 className="font-serif text-xl font-bold text-charcoal">Pod Scoreboard</h3>
                  <button className="text-xs font-bold text-rust uppercase tracking-widest hover:underline flex items-center gap-1">
                    View All 19 Pods <ArrowRight size={12} />
                  </button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-stone-50 text-xs font-bold uppercase tracking-widest text-stone-400">
                          <tr>
                              <th className="p-6">Pod Name</th>
                              <th className="p-6">Type</th>
                              <th className="p-6">Placements</th>
                              <th className="p-6">Rev YTD</th>
                              <th className="p-6">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                          {[
                              { name: 'Recruiting Pod A', type: 'Recruiting', placements: 2, rev: '$180k', status: 'Exceeding' },
                              { name: 'Sales Pod 1', type: 'Bench Sales', placements: 1, rev: '$95k', status: 'On Track' },
                              { name: 'Recruiting Pod B', type: 'Recruiting', placements: 0, rev: '$45k', status: 'At Risk' },
                              { name: 'TA Pod 3', type: 'Talent Acq', placements: 15, rev: 'N/A', status: 'High Perf' },
                              { name: 'Immigration Pod 1', type: 'Immigration', placements: 8, rev: '$42k', status: 'On Track' },
                          ].map((pod, i) => (
                              <tr key={i} className="hover:bg-stone-50 transition-colors group cursor-pointer">
                                  <td className="p-6 font-bold text-charcoal group-hover:text-rust transition-colors">{pod.name}</td>
                                  <td className="p-6 text-xs text-stone-500 uppercase tracking-wide">{pod.type}</td>
                                  <td className="p-6 font-mono text-stone-600">{pod.placements}</td>
                                  <td className="p-6 font-mono text-stone-600">{pod.rev}</td>
                                  <td className="p-6">
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                          pod.status === 'Exceeding' || pod.status === 'High Perf' ? 'bg-green-50 text-green-700' :
                                          pod.status === 'At Risk' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                                      }`}>
                                          {pod.status}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
              {/* AI Strategic Insights */}
              <div className="bg-charcoal text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rust via-purple-500 to-blue-500"></div>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                  
                  <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
                      <Zap className="text-yellow-400 fill-yellow-400" size={20} /> AI Twin Insights
                  </h3>
                  
                  <div className="space-y-6 relative z-10">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3 mb-2">
                              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-1" />
                              <span className="font-bold text-sm text-red-100">Risk Alert</span>
                          </div>
                          <p className="text-xs text-stone-300 leading-relaxed">
                              Recruiting Pod B has 0 placements this sprint. Recommendation: Reassign Senior's top client to Pod A temporarily.
                          </p>
                      </div>

                      <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3 mb-2">
                              <CheckCircle size={16} className="text-green-400 shrink-0 mt-1" />
                              <span className="font-bold text-sm text-green-100">Revenue Opportunity</span>
                          </div>
                          <p className="text-xs text-stone-300 leading-relaxed">
                              12 Academy graduates are available. Bench Sales can place 8 within 30 days if we launch targeted outreach.
                          </p>
                      </div>

                      <button className="w-full py-3 bg-white text-charcoal rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust hover:text-white transition-all shadow-lg">
                          Generate Board Report
                      </button>
                  </div>
              </div>

              {/* Vision 2030 Tracker */}
              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                  <h3 className="font-serif text-lg font-bold text-charcoal mb-4 flex items-center justify-between">
                    <span>Vision 2030</span>
                    <Globe size={16} className="text-stone-300" />
                  </h3>
                  <div className="space-y-6 relative">
                      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-stone-100"></div>
                      
                      <div className="flex gap-4 relative">
                          <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center border-2 border-white shadow-sm z-10 shrink-0">
                              <CheckCircle size={12} />
                          </div>
                          <div>
                              <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-1">Year 1</div>
                              <div className="text-sm font-bold text-charcoal">Internal Tool</div>
                              <div className="text-xs text-stone-400 mt-1">Completed • Nov 2025</div>
                          </div>
                      </div>

                      <div className="flex gap-4 relative opacity-60">
                          <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center border-2 border-white shadow-sm z-10 shrink-0">
                              <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                          </div>
                          <div>
                              <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Year 2</div>
                              <div className="text-sm font-bold text-charcoal">B2B SaaS (InTimeOS)</div>
                          </div>
                      </div>

                      <div className="flex gap-4 relative opacity-40">
                          <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center border-2 border-white shadow-sm z-10 shrink-0">
                              <div className="w-2 h-2 bg-stone-300 rounded-full"></div>
                          </div>
                          <div>
                              <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Year 5</div>
                              <div className="text-sm font-bold text-charcoal">IPO Ready</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      </>
    )
}

const StrategyView: React.FC = () => {
    return (
        <div className="grid grid-cols-2 gap-8">
             <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                 <h3 className="font-serif text-2xl font-bold text-charcoal mb-6">Strategic Roadmap</h3>
                 <div className="space-y-6">
                     {['Market Expansion', 'Product Development', 'Talent Acquisition'].map((item, i) => (
                         <div key={i} className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                             <div className="flex justify-between items-center mb-4">
                                 <h4 className="font-bold text-lg text-charcoal">{item}</h4>
                                 <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-stone-500 border border-stone-200">Q4 2025</span>
                             </div>
                             <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                                 <div className="bg-rust h-full rounded-full" style={{ width: '65%' }}></div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
             <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                 <h3 className="font-serif text-2xl font-bold text-charcoal mb-6">Key Initiatives</h3>
                 <ul className="space-y-4">
                     <li className="flex items-center gap-3 p-4 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer">
                         <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Globe size={20} /></div>
                         <div>
                             <div className="font-bold text-charcoal">Cross-Border Expansion</div>
                             <div className="text-xs text-stone-500">Establishing UK entity</div>
                         </div>
                     </li>
                     <li className="flex items-center gap-3 p-4 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer">
                         <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><Brain size={20} /></div>
                         <div>
                             <div className="font-bold text-charcoal">AI Agent V2</div>
                             <div className="text-xs text-stone-500">Multi-agent orchestration</div>
                         </div>
                     </li>
                 </ul>
             </div>
        </div>
    )
}

const IntelView: React.FC = () => {
    return (
        <div className="bg-charcoal text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden min-h-[600px]">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rust/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
             <div className="relative z-10 grid grid-cols-2 gap-12">
                 <div>
                     <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-4">Market Intelligence</div>
                     <h2 className="text-5xl font-serif font-bold mb-8">Global Competitor Analysis</h2>
                     <p className="text-lg text-stone-400 leading-relaxed mb-8">
                         Real-time analysis of 45 competitor firms indicates a 15% shift towards AI-driven staffing models in Q4.
                         InTime is currently positioned in the top 5% for technological adoption.
                     </p>
                     <button className="px-8 py-4 bg-white text-charcoal rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rust hover:text-white transition-all">
                         Download Full Report
                     </button>
                 </div>
                 <div className="space-y-6">
                     {[1, 2, 3].map((_, i) => (
                         <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                             <div className="flex justify-between items-start mb-4">
                                 <div className="font-bold text-lg">Competitor {String.fromCharCode(65 + i)}</div>
                                 <span className="text-red-400 text-xs font-bold uppercase">-5% Market Share</span>
                             </div>
                             <div className="w-full bg-white/10 h-1 rounded-full mb-2">
                                 <div className="bg-stone-500 h-full rounded-full" style={{ width: '40%' }}></div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    )
}

