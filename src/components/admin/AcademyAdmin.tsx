
import React from 'react';
import { useAppStore } from '../../lib/store';
import { Users, BookOpen, Award, Plus, MoreHorizontal, Calendar } from 'lucide-react';

export const AcademyAdmin: React.FC = () => {
  const { cohorts } = useAppStore();

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 border-b border-stone-200 pb-6 flex justify-between items-end">
        <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Training Command</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">Academy Admin</h1>
        </div>
        <div className="flex gap-3">
            <button className="px-6 py-3 bg-white border border-stone-200 rounded-full text-xs font-bold uppercase tracking-widest hover:border-charcoal transition-colors">
                Create Course
            </button>
            <button className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center gap-2">
                <Plus size={16} /> New Cohort
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Active Cohort Card */}
          {cohorts.map(cohort => (
              <div key={cohort.id} className="bg-white p-8 rounded-[2rem] shadow-xl border border-stone-200 relative overflow-hidden group cursor-pointer hover:border-rust/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cohort.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-stone-100 text-stone-400'}`}>
                          <Users size={24} />
                      </div>
                      <button className="text-stone-300 hover:text-charcoal">
                          <MoreHorizontal size={20} />
                      </button>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-charcoal mb-2">{cohort.name}</h3>
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {cohort.startDate}</span>
                      <span>{cohort.studentsCount} Students</span>
                  </div>
                  
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-charcoal">
                          <span>Completion Rate</span>
                          <span>{cohort.completionRate}%</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rust" style={{ width: `${cohort.completionRate}%` }}></div>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-lg p-8">
          <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Student Performance</h3>
          <table className="w-full text-left">
              <thead className="bg-stone-50 text-xs font-bold uppercase tracking-widest text-stone-400">
                  <tr>
                      <th className="p-6">Student</th>
                      <th className="p-6">Cohort</th>
                      <th className="p-6">Progress</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Action</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                  {[
                      { name: 'Priya Sharma', cohort: 'Nov 2025', progress: 95, status: 'On Track' },
                      { name: 'Marcus Johnson', cohort: 'Nov 2025', progress: 45, status: 'At Risk' },
                      { name: 'Sarah Lee', cohort: 'Sep 2025', progress: 100, status: 'Graduated' },
                  ].map((s, i) => (
                      <tr key={i} className="hover:bg-stone-50 transition-colors">
                          <td className="p-6 font-bold text-charcoal">{s.name}</td>
                          <td className="p-6 text-sm text-stone-600">{s.cohort}</td>
                          <td className="p-6">
                              <div className="flex items-center gap-2">
                                  <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                      <div className={`h-full ${s.progress < 60 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${s.progress}%` }}></div>
                                  </div>
                                  <span className="text-xs font-bold">{s.progress}%</span>
                              </div>
                          </td>
                          <td className="p-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                  s.status === 'At Risk' ? 'bg-red-50 text-red-600' : 
                                  s.status === 'Graduated' ? 'bg-blue-50 text-blue-600' :
                                  'bg-green-50 text-green-600'
                              }`}>
                                  {s.status}
                              </span>
                          </td>
                          <td className="p-6 text-right">
                              <button className="text-xs font-bold text-rust hover:underline">View Details</button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
};
