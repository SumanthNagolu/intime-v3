'use client';


import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { Users, AlertCircle, Calendar, CheckCircle, ChevronRight, MessageSquare, Video, BookOpen, TrendingUp, LayoutDashboard, Award, Layers, Plus, MoreHorizontal, Search, Filter, Clock, Activity, Zap, CheckSquare, ArrowUp, ArrowDown } from 'lucide-react';
import { CourseBuilder } from '../admin/CourseBuilder';
import { CertificateGenerator } from './CertificateGenerator';
import { MessageModal, AnnouncementModal, GradingModal } from './AcademyModals';
import { ScheduleSessionModal } from './ScheduleSessionModal';

// --- SUB-VIEWS ---

const ConsoleView: React.FC = () => {
  const { cohorts } = useAppStore();
  const router = useRouter();
  const [selectedStudentForMessage, setSelectedStudentForMessage] = useState<string | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Mock At-Risk Students
  const atRiskStudents = [
      { id: 's1', name: 'Alex Rivera', issue: 'Stuck on Module 3 for 2 weeks', activity: '3 days ago', avatar: 'A' },
      { id: 's2', name: 'Jordan Lee', issue: 'Quiz Average: 45%', activity: '1 day ago', avatar: 'J' }
  ];

  const supportTickets = [
      { id: 't1', student: 'Alex Rivera', question: 'How do I configure ClaimCenter API endpoints?', time: '15 min ago', studentId: 's1' },
      { id: 't2', student: 'Sarah Chen', question: 'Getting a null pointer in Gosu lab.', time: '1 hour ago', studentId: 's3' }
  ];

  const handleJoinSession = () => {
      alert("Opening Zoom/Meet session... (Mock)");
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          <MessageModal 
            isOpen={!!selectedStudentForMessage} 
            onClose={() => setSelectedStudentForMessage(null)} 
            recipientName={selectedStudentForMessage || ''}
          />
          
          <ScheduleSessionModal 
            isOpen={isScheduleOpen} 
            onClose={() => setIsScheduleOpen(false)} 
            cohortName="Cohort Alpha" 
          />

          {/* Left: Cohorts & Risk */}
          <div className="lg:col-span-8 space-y-8">
              
              {/* Cohorts Overview */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-200">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-xl font-bold text-charcoal">Active Cohorts</h3>
                      <button onClick={() => router.push('/employee/academy/admin/cohorts')} className="text-xs font-bold text-stone-400 hover:text-rust uppercase tracking-widest">View All</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {cohorts.filter(c => c.status === 'Active').map(cohort => (
                          <div key={cohort.id} onClick={() => navigate(`/employee/academy/admin/cohorts/${cohort.id}`)} className="p-6 rounded-2xl border border-stone-200 hover:shadow-md hover:border-rust/30 transition-all group cursor-pointer relative overflow-hidden bg-stone-50">
                              <div className="absolute top-0 left-0 w-1 h-full bg-rust group-hover:w-2 transition-all"></div>
                              
                              <div className="flex justify-between items-start mb-4 pl-2">
                                  <div>
                                      <h4 className="font-bold text-lg text-charcoal mb-1 group-hover:text-rust transition-colors">{cohort.name}</h4>
                                      <div className="text-xs text-stone-500 flex items-center gap-2">
                                          <Users size={12} /> {cohort.studentsCount} Students
                                      </div>
                                  </div>
                                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-serif font-bold text-charcoal border border-stone-100">
                                      {cohort.name.charAt(0)}
                                  </div>
                              </div>

                              <div className="pl-2">
                                  <div className="flex justify-between text-xs font-bold text-stone-400 mb-1">
                                      <span>Progress</span>
                                      <span>{cohort.completionRate}%</span>
                                  </div>
                                  <div className="h-2 bg-white rounded-full overflow-hidden border border-stone-200 mb-4">
                                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${cohort.completionRate}%` }}></div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Module 4: BillingCenter</span>
                                      <span className="text-xs font-bold text-stone-400 group-hover:text-charcoal uppercase tracking-widest flex items-center gap-1">
                                          Details <ChevronRight size={12} />
                                      </span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* At Risk Students */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-200">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-xl font-bold text-charcoal flex items-center gap-2">
                          <AlertCircle size={20} className="text-red-500" /> Needs Attention
                      </h3>
                  </div>

                  <div className="space-y-4">
                      {atRiskStudents.map(student => (
                          <div key={student.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100 hover:border-red-200 transition-all group">
                              <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/employee/academy/admin/students/${student.id}`)}>
                                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-700 flex items-center justify-center font-bold border border-red-100 group-hover:scale-105 transition-transform">
                                      {student.avatar}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-charcoal text-sm group-hover:text-rust transition-colors">{student.name}</h4>
                                      <p className="text-xs text-red-600 font-medium">{student.issue}</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest hidden md:block">Last Active: {student.activity}</span>
                                  <button onClick={() => setSelectedStudentForMessage(student.name)} className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-charcoal hover:bg-stone-50 shadow-sm">
                                      Message
                                  </button>
                                  <button onClick={() => setIsScheduleOpen(true)} className="px-4 py-2 bg-rust text-white rounded-lg text-xs font-bold hover:bg-[#B8421E] shadow-sm">
                                      Schedule 1:1
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Right: Schedule & Support */}
          <div className="lg:col-span-4 space-y-8">
              
              {/* Schedule */}
              <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden bg-noise">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rust/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <h3 className="font-serif text-xl font-bold mb-6 relative z-10">Today's Schedule</h3>
                  
                  <div className="space-y-4 relative z-10">
                      <div className="p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
                          <div className="flex justify-between mb-1">
                              <span className="text-xs font-bold text-rust uppercase tracking-widest">2:00 PM - 3:00 PM</span>
                              <Video size={14} className="text-white/70" />
                          </div>
                          <div className="font-bold text-white text-sm mb-2">Office Hours - Cohort Alpha</div>
                          <button onClick={handleJoinSession} className="w-full py-2 bg-white text-charcoal rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rust hover:text-white transition-all">
                              Join Session
                          </button>
                      </div>

                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex justify-between mb-1">
                              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">4:00 PM - 5:00 PM</span>
                              <BookOpen size={14} className="text-white/50" />
                          </div>
                          <div className="font-bold text-white/80 text-sm">Curriculum Review</div>
                      </div>
                  </div>
              </div>

              {/* Grading Queue */}
              <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-charcoal text-sm uppercase tracking-widest">Pending Grading</h3>
                      <div className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-bold">5</div>
                  </div>
                  <button 
                    onClick={() => router.push('/employee/academy/admin/assignments')} 
                    className="w-full py-3 border border-dashed border-stone-300 rounded-xl text-xs font-bold text-stone-500 hover:text-charcoal hover:border-charcoal transition-all flex items-center justify-center gap-2"
                  >
                      <CheckCircle size={14} /> Review Submissions
                  </button>
              </div>

              {/* Support Tickets */}
              <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-lg">
                  <h3 className="font-bold text-charcoal text-sm uppercase tracking-widest mb-4">Escalated Tickets</h3>
                  <div className="space-y-4">
                      {supportTickets.map(ticket => (
                          <div key={ticket.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                              <div className="flex justify-between mb-1">
                                  <Link href={`/employee/academy/admin/students/${ticket.studentId}`} className="font-bold text-xs text-charcoal hover:underline">{ticket.student}</Link>
                                  <span className="text-[10px] text-stone-400">{ticket.time}</span>
                              </div>
                              <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">{ticket.question}</p>
                              <button onClick={() => setSelectedStudentForMessage(ticket.student)} className="mt-2 text-[10px] font-bold text-rust hover:underline flex items-center gap-1">
                                  Respond <MessageSquare size={10} />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>

          </div>
      </div>
  );
};

const AssignmentsView: React.FC = () => {
    const router = useRouter();
    const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<{student: string, title: string} | null>(null);
    const [filter, setFilter] = useState<'All' | 'Pending'>('All');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const rawSubmissions = [
      { id: 1, student: 'Alex Rivera', studentId: 's1', title: 'PolicyCenter Config Lab', cohort: 'Cohort Alpha', date: '2024-10-24T10:00:00', status: 'Pending Review' },
      { id: 2, student: 'Jordan Lee', studentId: 's2', title: 'Gosu Fundamentals', cohort: 'Cohort Alpha', date: '2024-10-24T08:00:00', status: 'Pending Review' },
      { id: 3, student: 'Mike Ross', studentId: 's4', title: 'Data Model Extension', cohort: 'Cohort Alpha', date: '2024-10-23T15:00:00', status: 'Graded' },
      { id: 4, student: 'Sarah Chen', studentId: 's3', title: 'UI PCF Layout', cohort: 'Cohort Alpha', date: '2024-10-23T12:00:00', status: 'Pending Review' },
      { id: 5, student: 'David Kim', studentId: 's5', title: 'Integration Patterns', cohort: 'Cohort Beta', date: '2024-10-22T09:00:00', status: 'Pending Review' },
    ];

    // Sort and Filter Logic
    const filteredSubmissions = rawSubmissions
        .filter(s => filter === 'All' || (filter === 'Pending' && s.status === 'Pending Review'))
        .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

    const handleGradeClick = (sub: typeof rawSubmissions[0]) => {
        setSelectedSubmission({ student: sub.student, title: sub.title });
        setIsGradingModalOpen(true);
    };

    const formatTimeAgo = (dateString: string) => {
        const diff = Date.now() - new Date(dateString).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24) return `${hours} hours ago`;
        return `${Math.floor(hours / 24)} days ago`;
    };

    return (
      <div className="animate-fade-in">
         <div className="flex justify-between items-center mb-8">
             <h3 className="font-serif text-2xl font-bold text-charcoal">Grading Queue</h3>
             <div className="flex gap-3">
                 <button 
                    onClick={() => setFilter(filter === 'All' ? 'Pending' : 'All')}
                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-colors ${filter === 'Pending' ? 'bg-rust text-white border-rust' : 'bg-white text-charcoal border-stone-200'}`}
                 >
                    {filter === 'All' ? 'Show All' : 'Pending Only'}
                 </button>
                 <button 
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-5 py-2 bg-white border border-stone-200 rounded-full text-xs font-bold uppercase tracking-widest hover:border-charcoal flex items-center gap-2"
                 >
                    Date {sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                 </button>
             </div>
         </div>
         
         <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-lg overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-stone-50 text-xs font-bold text-stone-400 uppercase tracking-widest">
                  <tr>
                     <th className="p-6">Student</th>
                     <th className="p-6">Assignment</th>
                     <th className="p-6">Status</th>
                     <th className="p-6">Submitted</th>
                     <th className="p-6 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100">
                  {filteredSubmissions.map(sub => (
                     <tr key={sub.id} className="hover:bg-stone-50 transition-colors group">
                        <td className="p-6 font-bold text-charcoal">{sub.student}</td>
                        <td className="p-6 text-sm text-stone-600">
                            <div className="font-medium">{sub.title}</div>
                            <div className="text-xs text-stone-400">{sub.cohort}</div>
                        </td>
                        <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                sub.status === 'Graded' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                            }`}>
                                {sub.status}
                            </span>
                        </td>
                        <td className="p-6 text-sm text-stone-500 font-mono">{formatTimeAgo(sub.date)}</td>
                        <td className="p-6 text-right">
                           <button onClick={() => handleGradeClick(sub)} className="px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust shadow-sm transition-colors">
                              Grade
                           </button>
                        </td>
                     </tr>
                  ))}
                  {filteredSubmissions.length === 0 && (
                      <tr>
                          <td colSpan={5} className="p-8 text-center text-stone-400 italic">No submissions found matching criteria.</td>
                      </tr>
                  )}
               </tbody>
            </table>
         </div>

         {selectedSubmission && (
             <GradingModal 
                isOpen={isGradingModalOpen} 
                onClose={() => setIsGradingModalOpen(false)}
                studentName={selectedSubmission.student}
                assignmentTitle={selectedSubmission.title}
             />
         )}
      </div>
    )
};

const CohortsView: React.FC = () => {
    const { cohorts } = useAppStore();
    const router = useRouter();

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h3 className="font-serif text-xl font-bold text-charcoal">All Cohorts</h3>
                <button className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
                    <Plus size={16} /> New Cohort
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cohorts.map(cohort => (
                    <div key={cohort.id} onClick={() => navigate(`/employee/academy/admin/cohorts/${cohort.id}`)} className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200 hover:shadow-xl hover:border-rust/30 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cohort.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-stone-100 text-stone-400'}`}>
                                <Users size={24} />
                            </div>
                            <button className="text-stone-300 hover:text-charcoal" onClick={e => e.stopPropagation()}>
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-charcoal mb-2 group-hover:text-rust transition-colors">{cohort.name}</h3>
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
        </div>
    );
};

const CoursesView: React.FC = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const courses = [
        { id: 1, title: 'PolicyCenter 10 Fundamentals', modules: 8, students: 45, status: 'Published', updated: '2 days ago' },
        { id: 2, title: 'Gosu Advanced Programming', modules: 12, students: 28, status: 'Published', updated: '1 week ago' },
        { id: 3, title: 'BillingCenter Configuration', modules: 6, students: 0, status: 'Draft', updated: 'Yesterday' },
        { id: 4, title: 'ClaimCenter Intro', modules: 4, students: 12, status: 'Draft', updated: '3 days ago' },
        { id: 5, title: 'InsuranceSuite Architecture', modules: 5, students: 60, status: 'Published', updated: '2 weeks ago' },
    ];

    const filteredCourses = courses
        .filter(c => (filterStatus === 'All' || c.status === filterStatus))
        .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            return sortOrder === 'asc' 
                ? a.title.localeCompare(b.title) 
                : b.title.localeCompare(a.title);
        });

    const toggleFilter = () => {
        if (filterStatus === 'All') setFilterStatus('Published');
        else if (filterStatus === 'Published') setFilterStatus('Draft');
        else setFilterStatus('All');
    };

    const toggleSort = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };
    
    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm flex-1 max-w-md">
                    <Search size={18} className="text-stone-400 ml-2" />
                    <input 
                        placeholder="Search courses..." 
                        className="bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400 flex-1" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => router.push('/employee/academy/admin/builder')} 
                    className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2"
                >
                    <Plus size={16} /> Create Course
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-lg overflow-hidden">
                <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <h3 className="font-serif text-xl font-bold text-charcoal">Course Catalog ({filteredCourses.length})</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={toggleFilter}
                            className={`px-4 py-2 rounded-full border text-xs font-bold uppercase transition-colors ${filterStatus !== 'All' ? 'bg-charcoal text-white border-charcoal' : 'border-stone-200 hover:bg-white'}`}
                        >
                            Filter: {filterStatus}
                        </button>
                        <button 
                            onClick={toggleSort}
                            className="px-4 py-2 rounded-full border border-stone-200 text-xs font-bold uppercase hover:bg-white flex items-center gap-2"
                        >
                            Sort: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                        </button>
                    </div>
                </div>
                <div className="divide-y divide-stone-100">
                    {filteredCourses.length > 0 ? filteredCourses.map((course, i) => (
                        <div key={course.id} className="p-6 hover:bg-stone-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 font-serif font-bold text-lg border border-stone-200">
                                    {course.title.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-charcoal text-lg group-hover:text-rust transition-colors">{course.title}</h4>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-stone-500">
                                        <span className="flex items-center gap-1"><Layers size={10}/> {course.modules} Modules</span>
                                        <span className="flex items-center gap-1"><Users size={10}/> {course.students} Enrolled</span>
                                        <span className="flex items-center gap-1"><Clock size={10}/> {course.updated}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                    course.status === 'Published' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                                }`}>
                                    {course.status}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => router.push('/employee/academy/admin/builder')} className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold uppercase hover:border-charcoal">Edit</button>
                                    <button onClick={() => router.push('/employee/academy/admin/builder')} className="px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase hover:bg-rust">Preview</button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-stone-400">
                            No courses found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ActivityFeedView: React.FC = () => {
    const router = useRouter();
    // Mock Activity Data
    const activities = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        user: ['Alex Rivera', 'Jordan Lee', 'Sarah Chen', 'Mike Ross'][i % 4],
        studentId: ['s1', 's2', 's3', 's4'][i % 4],
        action: ['completed Lab 4.2', 'submitted quiz', 'posted a question', 'joined office hours'][i % 4],
        time: `${i * 15 + 2} mins ago`,
        type: ['lab', 'quiz', 'forum', 'live'][i % 4]
    }));

    const handleActivityClick = (act: typeof activities[0]) => {
        if (act.type === 'lab' || act.type === 'quiz') {
            // Go to student profile to grade/review
            navigate(`/employee/academy/admin/students/${act.studentId}`);
        } else {
            // Just go to student profile general view
            navigate(`/employee/academy/admin/students/${act.studentId}`);
        }
    };

    return (
        <div className="animate-fade-in">
            <h3 className="font-serif text-2xl font-bold text-charcoal mb-6">Real-time Activity Feed</h3>
            <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-lg overflow-hidden">
                <div className="p-8 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-charcoal uppercase tracking-widest px-4 py-2 bg-white rounded-full shadow-sm">
                            <Activity size={14} className="text-rust" /> All Events
                        </div>
                    </div>
                    <span className="text-xs text-stone-400 font-mono uppercase tracking-widest">Live Stream</span>
                </div>
                <div className="max-h-[600px] overflow-y-auto p-4 space-y-1">
                    {activities.map((act) => (
                        <div 
                            key={act.id} 
                            onClick={() => handleActivityClick(act)}
                            className="flex items-center justify-between p-4 hover:bg-stone-50 rounded-xl transition-colors border border-transparent hover:border-stone-100 group cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                    act.type === 'lab' ? 'border-blue-100 bg-blue-50 text-blue-600' :
                                    act.type === 'quiz' ? 'border-green-100 bg-green-50 text-green-600' :
                                    'border-stone-200 bg-stone-100 text-stone-500'
                                }`}>
                                    {act.type === 'lab' && <Layers size={14} />}
                                    {act.type === 'quiz' && <CheckCircle size={14} />}
                                    {act.type === 'forum' && <MessageSquare size={14} />}
                                    {act.type === 'live' && <Video size={14} />}
                                </div>
                                <div>
                                    <p className="text-sm text-charcoal">
                                        <span className="font-bold group-hover:text-rust transition-colors">{act.user}</span> {act.action}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-stone-400 font-mono">{act.time}</span>
                                <ChevronRight size={14} className="text-stone-300 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- MAIN CONTROLLER ---

export const InstructorDashboard: React.FC = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('Console');

  // Sync tab state with URL on mount
  useEffect(() => {
      if (pathname.includes('/cohorts')) setActiveTab('Cohorts');
      else if (pathname.includes('/courses')) setActiveTab('Courses');
      else if (pathname.includes('/builder')) setActiveTab('Builder');
      else if (pathname.includes('/certificates')) setActiveTab('Certificates');
      else if (pathname.includes('/assignments')) setActiveTab('Assignments');
      else setActiveTab('Console');
  }, [pathname]);

  let content;
  switch (activeTab) {
      case 'Cohorts': content = <CohortsView />; break;
      case 'Courses': content = <CoursesView />; break;
      case 'Builder': content = <CourseBuilder />; break;
      case 'Certificates': content = <CertificateGenerator />; break;
      case 'Activity': content = <ActivityFeedView />; break;
      case 'Assignments': content = <AssignmentsView />; break;
      default: content = <ConsoleView />;
  }

  return (
    <div className="pt-4">
      {/* Header & Sub-Nav */}
      <div className="mb-10 border-b border-stone-200 pb-0">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
            <div>
                <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Academy Coordinator</div>
                <h1 className="text-4xl font-serif font-bold text-charcoal">Academic Dashboard</h1>
            </div>
          </div>
          
          {/* Sub Nav */}
          <div className="flex gap-8 overflow-x-auto">
              {['Console', 'Cohorts', 'Courses', 'Assignments', 'Certificates', 'Activity'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                        activeTab === tab ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
                    }`}
                  >
                      {tab === 'Console' && <LayoutDashboard size={14} />}
                      {tab === 'Cohorts' && <Users size={14} />}
                      {tab === 'Courses' && <BookOpen size={14} />}
                      {tab === 'Assignments' && <CheckSquare size={14} />}
                      {tab === 'Certificates' && <Award size={14} />}
                      {tab === 'Activity' && <Activity size={14} />}
                      {tab}
                  </button>
              ))}
          </div>
      </div>

      {content}
    </div>
  );
};
