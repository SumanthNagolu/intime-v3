
import React from 'react';
import { DollarSign, Download, ExternalLink, Shield } from 'lucide-react';

export const Compensation: React.FC = () => {
  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Operations</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Payroll & Benefits</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
              
              {/* Earnings Overview */}
              <div className="bg-charcoal text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden bg-noise">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-rust/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  
                  <div className="relative z-10 grid grid-cols-2 gap-8">
                      <div>
                          <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">YTD Earnings</div>
                          <div className="text-5xl font-serif font-bold mb-1">$92,450</div>
                          <div className="text-xs text-green-400 font-bold uppercase tracking-wide">On Track</div>
                      </div>
                      <div>
                          <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Next Payday</div>
                          <div className="text-5xl font-serif font-bold mb-1">Oct 15</div>
                          <div className="text-xs text-stone-400 font-bold uppercase tracking-wide">Est: $4,625</div>
                      </div>
                  </div>
              </div>

              {/* Paystubs List */}
              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                  <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Recent Paystubs</h3>
                  <div className="space-y-2">
                      {[
                          { date: 'Sep 30, 2024', amount: '$4,625.00', type: 'Direct Deposit' },
                          { date: 'Sep 15, 2024', amount: '$4,625.00', type: 'Direct Deposit' },
                          { date: 'Sep 01, 2024', amount: '$5,125.00', type: 'Direct Deposit + Bonus' },
                      ].map((stub, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-stone-50 transition-colors group">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
                                      <DollarSign size={18} />
                                  </div>
                                  <div>
                                      <div className="font-bold text-charcoal text-sm">{stub.date}</div>
                                      <div className="text-xs text-stone-500">{stub.type}</div>
                                  </div>
                              </div>
                              <div className="flex items-center gap-6">
                                  <span className="font-mono font-bold text-charcoal">{stub.amount}</span>
                                  <button className="text-stone-300 hover:text-charcoal transition-colors">
                                      <Download size={16} />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
                  <button className="w-full mt-6 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl transition-colors">
                      View All History
                  </button>
              </div>

              {/* Commission Breakdown */}
              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-xl font-bold text-charcoal">Commission Tracker</h3>
                      <div className="text-xs font-bold text-rust uppercase tracking-widest">Pod A</div>
                  </div>
                  <div className="flex gap-4 mb-6">
                      <div className="flex-1 bg-stone-50 p-4 rounded-xl border border-stone-100 text-center">
                          <div className="text-2xl font-bold text-charcoal">2</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Placements</div>
                      </div>
                      <div className="flex-1 bg-stone-50 p-4 rounded-xl border border-stone-100 text-center">
                          <div className="text-2xl font-bold text-charcoal">$500</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Sprint Bonus</div>
                      </div>
                      <div className="flex-1 bg-stone-50 p-4 rounded-xl border border-stone-100 text-center">
                          <div className="text-2xl font-bold text-charcoal">2%</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Rate</div>
                      </div>
                  </div>
                  <p className="text-xs text-stone-400 italic text-center">Commission is paid out 30 days after start date.</p>
              </div>
          </div>

          {/* Sidebar: Benefits */}
          <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                  <h3 className="font-serif text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
                      <Shield size={18} className="text-rust" /> Benefits
                  </h3>
                  
                  <div className="space-y-6">
                      <div>
                          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                              Health Insurance
                              <span className="text-green-600">Active</span>
                          </div>
                          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                              <div className="font-bold text-charcoal text-sm">UnitedHealthcare Choice Plus</div>
                              <div className="text-xs text-stone-500 mt-1">Group #123456789</div>
                          </div>
                      </div>

                      <div>
                          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                              401(k)
                              <span className="text-green-600">Active</span>
                          </div>
                          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                              <div className="font-bold text-charcoal text-sm">Fidelity Investments</div>
                              <div className="text-xs text-stone-500 mt-1">Contribution: 4% (Matched)</div>
                          </div>
                      </div>
                  </div>

                  <button className="w-full mt-8 py-3 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors flex items-center justify-center gap-2">
                      Manage Benefits <ExternalLink size={14} />
                  </button>
              </div>

              <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2">Total Rewards</h4>
                  <p className="text-blue-800 text-sm leading-relaxed mb-4">
                      Your total compensation package including benefits and equity is valued at <span className="font-bold">$165,000</span>.
                  </p>
                  <button className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">Download Statement</button>
              </div>
          </div>
      </div>
    </div>
  );
};
