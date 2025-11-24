
import React from 'react';
import { useAppStore } from '../../lib/store';
import { Globe, FileText, Check, Clock, AlertTriangle } from 'lucide-react';

export const CrossBorderDashboard: React.FC = () => {
  const { immigrationCases } = useAppStore();
  
  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 flex justify-between items-end border-b border-stone-200 pb-6">
        <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Global Mobility</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">Immigration Cases</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {immigrationCases.map(ic => (
              <div key={ic.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 relative overflow-hidden group hover:border-rust/20 transition-all">
                  <div className="flex justify-between items-start mb-8">
                      <div>
                          <div className="flex items-center gap-2 mb-2">
                             <span className="w-2 h-2 rounded-full bg-rust animate-pulse"></span>
                             <span className="text-xs font-bold uppercase tracking-widest text-rust">{ic.status.replace('_', ' ')}</span>
                          </div>
                          <h3 className="text-2xl font-serif font-bold text-charcoal">{ic.candidateName}</h3>
                          <p className="text-stone-500">{ic.type} Application</p>
                      </div>
                      <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-rust group-hover:text-white transition-colors">
                          <Globe size={24} />
                      </div>
                  </div>

                  <div className="space-y-6">
                      <div className="bg-stone-50 p-4 rounded-xl flex justify-between items-center">
                          <div className="flex items-center gap-3">
                              <Clock size={16} className="text-stone-400" />
                              <span className="text-sm font-medium text-stone-600">Timeline</span>
                          </div>
                          <div className="text-sm font-bold text-charcoal">{ic.daysElapsed} / 100 Days</div>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-rust to-clay rounded-full" style={{ width: `${(ic.daysElapsed / 100) * 100}%` }}></div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm">
                          <FileText size={16} className="shrink-0 mt-0.5" />
                          <div>
                              <span className="font-bold uppercase text-[10px] tracking-widest block mb-1">Next Step</span>
                              {ic.nextStep}
                          </div>
                      </div>
                  </div>
              </div>
          ))}

          {/* Upsell Card */}
          <div className="bg-stone-900 p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-center items-center text-center text-white bg-noise">
              <Globe size={48} className="text-rust mb-6" />
              <h3 className="text-2xl font-serif font-bold mb-4">Expand Your Reach</h3>
              <p className="text-stone-400 mb-8 max-w-xs">Access pre-vetted talent from India, Canada, and UK with our 100-day visa guarantee.</p>
              <button className="px-8 py-4 bg-white text-charcoal rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust hover:text-white transition-all">
                  Start New Case
              </button>
          </div>
      </div>
    </div>
  );
};
