'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Mail, Calendar, Clock, CheckCircle, AlertCircle, FileText, X, Zap, Activity, Unlock, StickyNote } from 'lucide-react';
import { CommunicationLog, type LogEntry } from '../shared/CommunicationLog';
import { GradingModal } from './AcademyModals';

export const StudentInstructorView: React.FC = () => {
  const { studentId } = useParams();
  const [activeTab, setActiveTab] = useState<'Progress' | 'Assignments' | 'Communication' | 'Engagement'>('Progress');
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState({ name: '', score: '' });

  // Mock Data
  const student = { id: studentId, name: 'Alex Rivera', email: 'alex.r@intime.com', cohort: 'Nov 2025', status: 'At Risk', image: 'A' };
  const assignments = [
      { id: 1, name: 'PolicyCenter Config Lab', date: 'Oct 20', status: 'Pending Review', score: '-' },
      { id: 2, name: 'Data Model Entity Extension', date: 'Oct 15', status: 'Approved', score: '95/100' },
  ];

  const communicationLogs: LogEntry[] = [
      { id: '1', type: 'email', subject: 'Missing Lab Submission', content: 'Hi Alex, noticed you missed the deadline for Module 3. Is everything okay?', date: '2 days ago', author: 'You' },
      { id: '2', type: 'meeting', subject: '1:1 Sync', content: 'Discussed struggles with Gosu generics. Recommended extra reading material.', date: '1 week ago', author: 'You' },
      { id: '3', type: 'note', content: 'Escalated to Student Success due to consecutive low quiz scores.', date: '1 week ago', author: 'AI Mentor' }
  ];

  return (
    <div className="animate-fade-in pt-4 relative">
      <Link href="/employee/academy/admin/cohorts/c1" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Cohort
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar: ID Card */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-xl text-center">
                  <div className="w-24 h-24 mx-auto bg-rust text-white rounded-full flex items-center justify-center text-3xl font-serif font-bold mb-4 shadow-lg">
                      {student.image}
                  </div>
                  <h1 className="text-2xl font-serif font-bold text-charcoal mb-1">{student.name}</h1>
                  <p className="text-stone-500 text-sm mb-4">{student.email}</p>
                  <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                      <AlertCircle size={12} /> {student.status}
                  </div>
                  
                  <div className="text-left space-y-4 border-t border-stone-100 pt-6">
                      <div className="flex justify-between text-sm">
                          <span className="text-stone-400 font-bold text-xs uppercase tracking-widest">Cohort</span>
                          <span className="font-bold text-charcoal">{student.cohort}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span className="text-stone-400 font-bold text-xs uppercase tracking-widest">Job Ready</span>
                          <span className="font-bold text-charcoal">75%</span>
                      </div>
                  </div>
              </div>

              <div className="bg-stone-50 p-6 rounded-[2rem] border border-stone-200">
                  <h4 className="font-bold text-charcoal mb-4 text-sm uppercase tracking-widest">Quick Actions</h4>
                  <div className="space-y-3">
                      <button className="w-full py-3 bg-white border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-rust hover:text-rust transition-colors flex items-center justify-center gap-2">
                          <Mail size={14} /> Send Message
                      </button>
                      <button className="w-full py-3 bg-white border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-rust hover:text-rust transition-colors flex items-center justify-center gap-2">
                          <Calendar size={14} /> Schedule 1:1
                      </button>
                      <button className="w-full py-3 bg-white border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-rust hover:text-rust transition-colors flex items-center justify-center gap-2">
                          <StickyNote size={14} /> Add Instructor Note
                      </button>
                      <button className="w-full py-3 bg-white border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-rust hover:text-rust transition-colors flex items-center justify-center gap-2">
                          <Unlock size={14} /> Override Lesson Lock
                      </button>
                      <button className="w-full py-3 bg-white border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-rust hover:text-rust transition-colors flex items-center justify-center gap-2">
                          <FileText size={14} /> Export Report
                      </button>
                  </div>
              </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
              {/* Tabs */}
              <div className="flex gap-6 border-b border-stone-200 mb-8 overflow-x-auto">
                  {(['Progress', 'Assignments', 'Communication', 'Engagement'] as const).map(tab => (
                      <button
                         key={tab}
                         onClick={() => setActiveTab(tab)}
                         className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${
                             activeTab === tab ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
                         }`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>

              {activeTab === 'Assignments' && (
                  <div className="space-y-6">
                      <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
                          <table className="w-full text-left">
                              <thead className="bg-stone-50 text-xs font-bold text-stone-400 uppercase tracking-widest">
                                  <tr>
                                      <th className="p-6">Project Name</th>
                                      <th className="p-6">Date</th>
                                      <th className="p-6">Status</th>
                                      <th className="p-6">Score</th>
                                      <th className="p-6 text-right">Action</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100">
                                  {assignments.map((a, i) => (
                                      <tr key={i} className="hover:bg-stone-50 transition-colors">
                                          <td className="p-6 font-bold text-charcoal">{a.name}</td>
                                          <td className="p-6 text-sm text-stone-600">{a.date}</td>
                                          <td className="p-6">
                                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                  a.status === 'Approved' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                                              }`}>
                                                  {a.status}
                                              </span>
                                          </td>
                                          <td className="p-6 font-bold text-charcoal">{a.score}</td>
                                          <td className="p-6 text-right">
                                              {a.status === 'Pending Review' ? (
                                                  <button onClick={() => { setSelectedAssignment(a); setIsGradingOpen(true); }} className="px-4 py-2 bg-rust text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#B8421E]">
                                                      Grade
                                                  </button>
                                              ) : (
                                                  <button className="text-xs font-bold text-stone-400 hover:text-charcoal">View</button>
                                              )}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {activeTab === 'Communication' && (
                  <CommunicationLog logs={communicationLogs} />
              )}

              {activeTab === 'Engagement' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                          <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Platform Activity</h3>
                          <div className="space-y-6">
                              <div className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-100">
                                  <div className="flex items-center gap-3">
                                      <Clock size={20} className="text-stone-400" />
                                      <span className="text-sm font-bold text-charcoal">Total Time on Platform</span>
                                  </div>
                                  <span className="font-mono text-lg font-bold text-charcoal">87 Hours</span>
                              </div>
                              <div className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-100">
                                  <div className="flex items-center gap-3">
                                      <Activity size={20} className="text-stone-400" />
                                      <span className="text-sm font-bold text-charcoal">Avg Session Duration</span>
                                  </div>
                                  <span className="font-mono text-lg font-bold text-charcoal">45 Mins</span>
                              </div>
                              <div className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-100">
                                  <div className="flex items-center gap-3">
                                      <Zap size={20} className="text-purple-500" />
                                      <span className="text-sm font-bold text-charcoal">AI Mentor Interactions</span>
                                  </div>
                                  <span className="font-mono text-lg font-bold text-charcoal">47 Questions</span>
                              </div>
                          </div>
                      </div>

                      <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                          <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Live Attendance</h3>
                          <div className="flex items-center gap-4 mb-8">
                              <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center text-2xl font-bold text-charcoal shadow-sm">
                                  80%
                              </div>
                              <div>
                                  <div className="text-sm font-bold text-charcoal">Attendance Rate</div>
                                  <div className="text-xs text-stone-500">8/10 Sessions</div>
                              </div>
                          </div>
                          <div className="space-y-3">
                              <div className="flex items-center gap-3 text-sm text-stone-600">
                                  <CheckCircle size={16} className="text-green-500" /> Oct 24: Office Hours
                              </div>
                              <div className="flex items-center gap-3 text-sm text-stone-600">
                                  <CheckCircle size={16} className="text-green-500" /> Oct 22: Module 3 Review
                              </div>
                              <div className="flex items-center gap-3 text-sm text-stone-600">
                                  <X size={16} className="text-red-500" /> Oct 20: Guest Speaker (Absent)
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'Progress' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                          <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Module Completion</h3>
                          <div className="space-y-4">
                              {[
                                  { mod: 'M1: Intro', val: 100, status: 'done' },
                                  { mod: 'M2: Data Model', val: 100, status: 'done' },
                                  { mod: 'M3: PCF', val: 45, status: 'current' },
                                  { mod: 'M4: Gosu', val: 0, status: 'locked' },
                              ].map((m, i) => (
                                  <div key={i}>
                                      <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                                          <span>{m.mod}</span>
                                          <span>{m.val}%</span>
                                      </div>
                                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                                          <div className={`h-full ${m.status === 'done' ? 'bg-green-500' : m.status === 'current' ? 'bg-blue-500' : 'bg-stone-300'}`} style={{ width: `${m.val}%` }}></div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* Grading Modal */}
      <GradingModal 
        isOpen={isGradingOpen} 
        onClose={() => setIsGradingOpen(false)} 
        studentName={student.name}
        assignmentTitle={selectedAssignment.name}
      />
    </div>
  );
};
