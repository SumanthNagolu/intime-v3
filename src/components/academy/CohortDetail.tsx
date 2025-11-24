'use client';


import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'next/navigation';
import { ChevronLeft, Users, Calendar, MoreHorizontal, Search, MessageSquare, Eye, AlertCircle, CheckCircle, Clock, Award, Video, Edit3, Download, Megaphone } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { ScheduleSessionModal } from './ScheduleSessionModal';
import { AnnouncementModal, ExportModal } from './AcademyModals';

export const CohortDetail: React.FC = () => {
  const { cohortId } = useParams();
  const router = useRouter();
  const { cohorts } = useAppStore();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [hoveredModule, setHoveredModule] = useState<number | null>(null);

  const cohort = cohorts.find(c => c.id === cohortId);

  if (!cohort) return <div>Cohort not found</div>;

  const students = [
      { id: 's1', name: 'Alex Rivera', module: 'Module 3', progress: 35, lastActive: '3 days ago', score: 45, status: 'At Risk' },
      { id: 's2', name: 'Jordan Lee', module: 'Module 4', progress: 58, lastActive: '2 hours ago', score: 82, status: 'On Track' },
      { id: 's3', name: 'Sarah Chen', module: 'Module 5', progress: 72, lastActive: '1 hour ago', score: 95, status: 'On Track' },
      { id: 's4', name: 'Mike Ross', module: 'Module 3', progress: 40, lastActive: '1 day ago', score: 78, status: 'Needs Attention' },
  ];

  // Extended activity feed
  const baseActivity = [
      { text: "Jordan completed Lab 4.2", time: "2h ago", type: 'normal' },
      { text: "Alex failed Quiz 3.1 (2nd attempt)", time: "4h ago", type: 'alert' },
      { text: "Sarah submitted Capstone Draft", time: "Yesterday", type: 'success' },
  ];
  
  const fullActivity = [
      ...baseActivity,
      { text: "Mike Ross logged in", time: "Yesterday", type: 'normal' },
      { text: "Cohort Live Session ended", time: "2 days ago", type: 'normal' },
      { text: "New material unlocked: Module 5", time: "2 days ago", type: 'normal' },
      { text: "Alex Rivera missed deadline", time: "3 days ago", type: 'alert' },
      { text: "Jordan Lee passed assessment", time: "3 days ago", type: 'success' },
  ];

  const displayedActivity = showAllActivity ? fullActivity : baseActivity;

  // Mock data for progress tooltips
  const getModuleStatus = (index: number) => {
      if (index < 3) return { completed: ['Alex R.', 'Jordan L.', 'Sarah C.', 'Mike R.'], pending: [] };
      if (index === 3) return { completed: ['Jordan L.', 'Sarah C.'], pending: ['Alex R.', 'Mike R.'] }; // Module 4
      if (index === 4) return { completed: ['Sarah C.'], pending: ['Jordan L.', 'Mike R.', 'Alex R.'] }; // Module 5
      return { completed: [], pending: ['All Students'] };
  };

  return (
    <div className="animate-fade-in pt-4">
      <Link href="/employee/academy/admin/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Dashboard
      </Link>

      <ScheduleSessionModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} cohortName={cohort.name} />
      <AnnouncementModal isOpen={isAnnouncementModalOpen} onClose={() => setIsAnnouncementModalOpen(false)} target={cohort.name} />
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />

      {/* Header Card */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-200 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-rust"></div>
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 border border-stone-200">
                      <Users size={32} />
                  </div>
                  <div>
                      <div className="flex items-center gap-2 mb-1 group">
                          <h1 className="text-3xl font-serif font-bold text-charcoal">{cohort.name}</h1>
                          <button className="text-stone-300 hover:text-charcoal p-1 transition-colors opacity-0 group-hover:opacity-100">
                              <Edit3 size={16} />
                          </button>
                      </div>
                      <div className="flex gap-4 text-sm text-stone-600 font-medium">
                          <span className="flex items-center gap-1"><Calendar size={14}/> {cohort.startDate}</span>
                          <span className="flex items-center gap-1"><Users size={14}/> {cohort.studentsCount} Students</span>
                      </div>
                  </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-3">
                      <button onClick={() => setIsExportModalOpen(true)} className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-rust hover:text-rust transition-colors flex items-center gap-2">
                          <Download size={14} /> Export Report
                      </button>
                      <button onClick={() => setIsAnnouncementModalOpen(true)} className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-rust hover:text-rust transition-colors flex items-center gap-2">
                          <Megaphone size={14} /> Announcement
                      </button>
                      <button 
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="px-6 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2"
                      >
                          <Video size={14} /> Schedule Session
                      </button>
                  </div>
                  <div className="w-64">
                      <div className="flex justify-between text-xs font-bold text-stone-400 mb-1 uppercase tracking-widest">
                          <span>Avg Completion</span>
                          <span>{cohort.completionRate}%</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rust" style={{ width: `${cohort.completionRate}%` }}></div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Progress Overview */}
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg relative z-10">
                  <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Progress Overview</h3>
                  <div className="h-64 flex items-end gap-4 px-4 pb-4 border-b border-stone-100 relative">
                      {[85, 85, 85, 50, 25, 5, 0, 0].map((val, i) => {
                          const status = getModuleStatus(i);
                          return (
                              <div 
                                key={i} 
                                className="flex-1 flex flex-col justify-end group relative h-full"
                                onMouseEnter={() => setHoveredModule(i)}
                                onMouseLeave={() => setHoveredModule(null)}
                              >
                                  <div className="w-full bg-stone-100 rounded-t-lg relative overflow-hidden flex flex-col justify-end h-full cursor-pointer hover:bg-stone-200 transition-colors">
                                      <div 
                                        className={`w-full transition-all duration-1000 ${val < 50 && i < 4 ? 'bg-red-400' : 'bg-charcoal'}`} 
                                        style={{ height: `${val}%` }}
                                      ></div>
                                  </div>
                                  <div className="text-center mt-2 text-xs font-bold text-stone-400">M{i+1}</div>
                                  
                                  {/* Detailed Hover Tooltip */}
                                  {hoveredModule === i && (
                                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white p-4 rounded-xl shadow-2xl border border-stone-100 w-48 z-50 animate-slide-up">
                                          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 border-b border-stone-100 pb-1">Module {i+1} Status</div>
                                          
                                          {status.completed.length > 0 && (
                                              <div className="mb-2">
                                                  <div className="flex items-center gap-1 text-green-600 font-bold text-xs mb-1">
                                                      <CheckCircle size={10} /> Completed ({status.completed.length})
                                                  </div>
                                                  <div className="text-[10px] text-stone-500 pl-3">{status.completed.join(', ')}</div>
                                              </div>
                                          )}
                                          
                                          {status.pending.length > 0 && (
                                              <div>
                                                  <div className="flex items-center gap-1 text-red-500 font-bold text-xs mb-1">
                                                      <Clock size={10} /> Pending ({status.pending.length})
                                                  </div>
                                                  <div className="text-[10px] text-stone-500 pl-3">{status.pending.join(', ')}</div>
                                              </div>
                                          )}
                                      </div>
                                  )}
                              </div>
                          );
                      })}
                  </div>
                  <p className="text-xs text-stone-400 mt-4 text-center italic">Hover over bars to see student status per module.</p>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-xl font-bold text-charcoal">Student Roster</h3>
                      <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100">
                          <Search size={14} className="text-stone-400" />
                          <input placeholder="Search..." className="bg-transparent outline-none text-xs font-bold text-charcoal w-24" />
                      </div>
                  </div>

                  <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                          <thead className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100">
                              <tr>
                                  <th className="py-3 pl-2">Student</th>
                                  <th className="py-3">Module</th>
                                  <th className="py-3">Progress</th>
                                  <th className="py-3">Score</th>
                                  <th className="py-3">Last Active</th>
                                  <th className="py-3">Status</th>
                                  <th className="py-3 text-right pr-2">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="text-sm">
                              {students.map(s => (
                                  <tr 
                                    key={s.id} 
                                    className="hover:bg-stone-50 transition-colors group cursor-pointer"
                                    onClick={() => navigate(`/employee/academy/admin/students/${s.id}`)}
                                  >
                                      <td className="py-4 pl-2">
                                          <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-bold text-xs text-charcoal">
                                                  {s.name.charAt(0)}
                                              </div>
                                              <span className="font-bold text-charcoal hover:text-rust transition-colors">{s.name}</span>
                                          </div>
                                      </td>
                                      <td className="py-4 text-stone-600">{s.module}</td>
                                      <td className="py-4 font-bold text-charcoal">{s.progress}%</td>
                                      <td className="py-4 font-bold text-charcoal">{s.score}%</td>
                                      <td className="py-4 text-stone-500 text-xs">{s.lastActive}</td>
                                      <td className="py-4">
                                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                              s.status === 'On Track' ? 'bg-green-50 text-green-700' :
                                              s.status === 'At Risk' ? 'bg-red-50 text-red-700' :
                                              'bg-yellow-50 text-yellow-700'
                                          }`}>
                                              {s.status}
                                          </span>
                                      </td>
                                      <td className="py-4 text-right pr-2">
                                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                              <button className="p-1.5 bg-white border border-stone-200 rounded hover:text-rust hover:border-rust"><MessageSquare size={14}/></button>
                                              <button 
                                                onClick={() => navigate(`/employee/academy/admin/students/${s.id}`)}
                                                className="p-1.5 bg-charcoal text-white rounded hover:bg-rust"
                                              >
                                                  <Eye size={14}/>
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>

          {/* Right: Activity Timeline */}
          <div className="space-y-8">
              <div className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-xl bg-noise relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rust/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <h3 className="font-serif text-xl font-bold mb-6 relative z-10">Cohort Pulse</h3>
                  <div className="space-y-6 relative z-10">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-green-400">
                              <CheckCircle size={24} />
                          </div>
                          <div>
                              <div className="text-2xl font-bold">5</div>
                              <div className="text-xs text-stone-400 uppercase tracking-widest">Modules Completed This Week</div>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-yellow-400">
                              <Users size={24} />
                          </div>
                          <div>
                              <div className="text-2xl font-bold">10/12</div>
                              <div className="text-xs text-stone-400 uppercase tracking-widest">Live Session Attendance</div>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-blue-400">
                              <Award size={24} />
                          </div>
                          <div>
                              <div className="text-2xl font-bold">78%</div>
                              <div className="text-xs text-stone-400 uppercase tracking-widest">Avg Quiz Score</div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-charcoal text-sm uppercase tracking-widest">Recent Activity</h3>
                      <button onClick={() => setShowAllActivity(!showAllActivity)} className="text-xs font-bold text-rust hover:underline">
                          {showAllActivity ? 'Show Less' : 'View All'}
                      </button>
                  </div>
                  <div className="space-y-4 relative max-h-[400px] overflow-y-auto pr-2">
                      <div className="absolute left-3 top-2 bottom-2 w-px bg-stone-100"></div>
                      {displayedActivity.map((act, i) => (
                          <div key={i} className="relative pl-8">
                              <div className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${
                                  act.type === 'alert' ? 'bg-red-500' : 
                                  act.type === 'success' ? 'bg-green-500' :
                                  'bg-stone-300'
                              }`}></div>
                              <p className="text-xs font-bold text-charcoal">{act.text}</p>
                              <p className="text-stone-400 text-[10px] uppercase">{act.time}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
