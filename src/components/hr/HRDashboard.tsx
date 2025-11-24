'use client';


import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { Users, UserPlus, Clock, TrendingUp, Briefcase, ChevronRight, Activity, Calendar, CheckCircle, AlertCircle, LayoutDashboard, Network, FileText, GraduationCap, BarChart3, Search, DollarSign, Download, X, MapPin, ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'next/navigation';
import { ApprovalModal } from './ApprovalModal';
import { ApprovalRequest } from '../../types';

// Import HR Sub-Components
import { PeopleDirectory, AddEmployeeModal } from './PeopleDirectory';
import { OrgChart } from './OrgChart';
import { TimeAttendance } from './TimeAttendance';
import { PayrollDashboard } from './PayrollDashboard';
import { Documents } from './Documents';
import { PerformanceReviews } from './PerformanceReviews';
import { Recruitment } from './Recruitment';
import { LearningAdmin } from './LearningAdmin';
import { Analytics } from './Analytics';
import { EmployeeProfile } from './EmployeeProfile';

// --- MODALS ---

const DrillDownModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; type: 'onboarding' | 'roles' }> = ({ isOpen, onClose, title, type }) => {
    const { employees, jobs } = useAppStore();
    const router = useRouter();

    if (!isOpen) return null;

    const onboardingList = employees.filter(e => e.status === 'Onboarding');
    const openRolesList = jobs.filter(j => j.status === 'open' || j.status === 'urgent');

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal"><X size={24}/></button>
                
                <div className="mb-6 border-b border-stone-100 pb-4">
                    <h2 className="text-2xl font-serif font-bold text-charcoal">{title}</h2>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {type === 'onboarding' && (
                        onboardingList.length > 0 ? onboardingList.map(e => (
                            <div key={e.id} onClick={() => { onClose(); navigate(`/employee/hr/profile/${e.id}`); }} className="flex items-center justify-between p-4 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer group transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                        {e.firstName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-charcoal text-sm group-hover:text-rust">{e.firstName} {e.lastName}</div>
                                        <div className="text-xs text-stone-500">{e.role} • Start: {e.startDate}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Progress</span>
                                    <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-1/3"></div>
                                    </div>
                                    <ChevronRight size={14} className="text-stone-300" />
                                </div>
                            </div>
                        )) : <p className="text-stone-500 italic text-center py-8">No employees currently onboarding.</p>
                    )}

                    {type === 'roles' && (
                        openRolesList.length > 0 ? openRolesList.map(j => (
                            <div key={j.id} className="flex items-center justify-between p-4 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer group transition-colors">
                                <div>
                                    <div className="font-bold text-charcoal text-sm group-hover:text-rust">{j.title}</div>
                                    <div className="text-xs text-stone-500">{j.client} • {j.location}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {j.status === 'urgent' && <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase tracking-widest">Urgent</span>}
                                    <span className="text-xs font-bold text-charcoal">{j.rate}</span>
                                </div>
                            </div>
                        )) : <p className="text-stone-500 italic text-center py-8">No open roles.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const RunOffCyclePayrollModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { employees } = useAppStore();
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('Bonus');
    const [step, setStep] = useState<'form' | 'processing' | 'done'>('form');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('processing');
        setTimeout(() => {
            setStep('done');
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal"><X size={24}/></button>
                
                {step === 'form' && (
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Run Off-Cycle Payroll</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Employee</label>
                                <select 
                                    required
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust font-bold text-charcoal"
                                    value={selectedEmployee}
                                    onChange={e => setSelectedEmployee(e.target.value)}
                                >
                                    <option value="">Select Employee...</option>
                                    {employees.map(e => (
                                        <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Type</label>
                                <select 
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                >
                                    <option>Bonus / Incentive</option>
                                    <option>Correction</option>
                                    <option>Termination / Final Pay</option>
                                    <option>Commission Payout</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Amount ($)</label>
                                    <input 
                                        required 
                                        type="number"
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Pay Date</label>
                                    <input 
                                        type="date"
                                        required
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust"
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full mt-8 py-4 bg-charcoal text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-rust transition-all shadow-lg">
                            Process Payment
                        </button>
                    </form>
                )}

                {step === 'processing' && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-stone-200 border-t-rust rounded-full animate-spin mx-auto mb-6"></div>
                        <h3 className="text-xl font-bold text-charcoal">Processing Transaction...</h3>
                        <p className="text-stone-500 text-sm mt-2">Connecting to Payroll Provider</p>
                    </div>
                )}

                {step === 'done' && (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Payment Scheduled</h3>
                        <p className="text-stone-500 mb-8">
                            Off-cycle payment of ${amount} has been scheduled. The employee will be notified via email.
                        </p>
                        <button onClick={onClose} className="px-8 py-3 bg-stone-100 text-stone-600 font-bold text-xs uppercase tracking-widest rounded-full hover:bg-stone-200">
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

const EventDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; event: any }> = ({ isOpen, onClose, event }) => {
    if (!isOpen || !event) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal"><X size={24}/></button>
                
                <div className="mb-6">
                    <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Calendar Event</div>
                    <h2 className="text-2xl font-serif font-bold text-charcoal">{event.title}</h2>
                </div>

                <div className="space-y-4 bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-6">
                    <div className="flex items-center gap-3 text-stone-600">
                        <Calendar size={18} className="text-stone-400" />
                        <span className="font-bold">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-stone-600">
                        <Clock size={18} className="text-stone-400" />
                        <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-stone-600">
                        <MapPin size={18} className="text-stone-400" />
                        <span>{event.location || 'Remote / Zoom'}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-charcoal text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rust transition-colors">
                        View in Calendar
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- HR OVERVIEW (The "Console" View) ---
const HROverview: React.FC = () => {
  const { employees, jobs, approvalRequests, updateApprovalRequest, addEmployee } = useAppStore();
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  
  // Modal States
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isPayrollOpen, setIsPayrollOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Drill Down States
  const [drillDownType, setDrillDownType] = useState<'onboarding' | 'roles' | null>(null);
  
  const router = useRouter();

  // Calculate stats
  const totalEmployees = employees.length;
  const newHires = employees.filter(e => e.status === 'Onboarding');
  const openRoles = jobs.filter(j => j.status === 'open' || j.status === 'urgent');
  const urgentRoles = openRoles.filter(j => j.status === 'urgent').length;
  const retentionRate = 98; // Mock
  const pendingApprovals = approvalRequests.filter(req => req.status === 'Pending');

  const handleApprove = (id: string) => {
      updateApprovalRequest(id, 'Approved');
  };

  const handleDeny = (id: string) => {
      updateApprovalRequest(id, 'Denied');
  };

  const handleExport = () => {
      setIsExporting(true);
      setTimeout(() => {
          setIsExporting(false);
          alert("Census Data Exported (CSV)");
      }, 1500);
  };

  const calendarEvents = [
      { id: 1, title: 'Sprint Review: Recruiting Pod A', date: 'Tomorrow', time: '2:00 PM', color: 'bg-rust' },
      { id: 2, title: 'Payroll Cutoff', date: 'Oct 28', time: '5:00 PM', color: 'bg-blue-400' },
      { id: 3, title: 'Open Enrollment Begins', date: 'Nov 01', time: '9:00 AM', color: 'bg-green-400' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Modals */}
      <ApprovalModal 
        isOpen={!!selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
        request={selectedRequest}
        onApprove={handleApprove}
        onDeny={handleDeny}
      />
      
      <AddEmployeeModal 
        isOpen={isAddEmployeeOpen} 
        onClose={() => setIsAddEmployeeOpen(false)} 
        onAdd={addEmployee} 
      />

      <RunOffCyclePayrollModal 
        isOpen={isPayrollOpen} 
        onClose={() => setIsPayrollOpen(false)} 
      />

      <EventDetailModal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        event={selectedEvent} 
      />

      <DrillDownModal 
        isOpen={!!drillDownType}
        onClose={() => setDrillDownType(null)}
        title={drillDownType === 'onboarding' ? 'Onboarding Employees' : 'Open Roles'}
        type={drillDownType || 'onboarding'}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-lg relative overflow-hidden group hover:border-rust/30 transition-all">
             <div className="flex justify-between items-start mb-4">
                 <div className="text-xs font-bold uppercase tracking-widest text-stone-400">Total Headcount</div>
                 <Users size={16} className="text-stone-300 group-hover:text-charcoal transition-colors" />
             </div>
             <div className="text-4xl font-serif font-bold text-charcoal mb-2">{totalEmployees}</div>
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-green-600">
                 <TrendingUp size={12} /> +12% MoM
             </div>
        </div>

        <div 
            onClick={() => setDrillDownType('onboarding')}
            className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-lg relative overflow-hidden group hover:border-blue-200 transition-all cursor-pointer"
        >
             <div className="flex justify-between items-start mb-4">
                 <div className="text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-blue-600 transition-colors">Onboarding</div>
                 <UserPlus size={16} className="text-stone-300 group-hover:text-blue-600 transition-colors" />
             </div>
             <div className="text-4xl font-serif font-bold text-charcoal mb-2">{newHires.length}</div>
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-blue-600 group-hover:underline">
                 <Activity size={12} /> View Details
             </div>
        </div>

        <div 
            onClick={() => setDrillDownType('roles')}
            className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-lg relative overflow-hidden group hover:border-rust/30 transition-all cursor-pointer"
        >
             <div className="flex justify-between items-start mb-4">
                 <div className="text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-rust transition-colors">Open Roles</div>
                 <Briefcase size={16} className="text-stone-300 group-hover:text-rust transition-colors" />
             </div>
             <div className="text-4xl font-serif font-bold text-charcoal mb-2">{openRoles.length}</div>
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-rust group-hover:underline">
                 <AlertCircle size={12} /> {urgentRoles} Urgent
             </div>
        </div>

        <div className="bg-charcoal text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden bg-noise">
             <div className="absolute top-0 right-0 w-24 h-24 bg-rust/20 rounded-full blur-2xl -mr-6 -mt-6"></div>
             <div className="relative z-10">
                 <div className="flex justify-between items-start mb-4">
                     <div className="text-xs font-bold uppercase tracking-widest text-stone-400">Retention</div>
                     <CheckCircle size={16} className="text-rust" />
                 </div>
                 <div className="text-4xl font-serif font-bold mb-2">{retentionRate}%</div>
                 <div className="text-[10px] text-stone-400">Annualized Average</div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Action Area */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* Approvals */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="font-serif text-xl font-bold text-charcoal">Pending Approvals</h3>
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">{pendingApprovals.length} Items</div>
                  </div>
                  
                  <div className="space-y-4">
                      {pendingApprovals.length > 0 ? pendingApprovals.map((item) => (
                          <div 
                            key={item.id} 
                            onClick={() => setSelectedRequest(item)}
                            className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                          >
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-stone-400 border border-stone-100 group-hover:border-rust group-hover:text-rust">
                                      {item.type === 'Commission' ? <AlertCircle size={18} /> : <Clock size={18} />}
                                  </div>
                                  <div>
                                      <div className="font-bold text-charcoal text-sm">{item.type} Request</div>
                                      <div className="text-xs text-stone-500"><span className="font-semibold">{item.employeeName}</span> • {item.date}</div>
                                  </div>
                              </div>
                              <button className="px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rust">
                                  Review
                              </button>
                          </div>
                      )) : (
                          <p className="text-stone-400 italic text-sm p-4 text-center">No pending approvals.</p>
                      )}
                  </div>
              </div>

              {/* Onboarding Status (Condensed) */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-xl font-bold text-charcoal">New Hire Progress</h3>
                      <button onClick={() => setDrillDownType('onboarding')} className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">View All</button>
                  </div>
                  <div className="space-y-6">
                      {newHires.slice(0, 2).map(e => (
                          <div 
                            key={e.id} 
                            onClick={() => navigate(`/employee/hr/profile/${e.id}`)}
                            className="cursor-pointer group hover:bg-stone-50 p-4 -mx-4 rounded-xl transition-colors"
                          >
                              <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-rust text-white flex items-center justify-center text-xs font-bold">
                                          {e.firstName.charAt(0)}
                                      </div>
                                      <span className="font-bold text-sm text-charcoal group-hover:text-rust transition-colors">{e.firstName} {e.lastName}</span>
                                  </div>
                                  <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
                                      Day 3 of 30 <ChevronRight size={12} className="opacity-0 group-hover:opacity-100" />
                                  </span>
                              </div>
                              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 w-[15%] rounded-full"></div>
                              </div>
                              <div className="flex justify-between mt-2 text-[10px] text-stone-400 uppercase tracking-widest">
                                  <span>Equipment Setup</span>
                                  <span>Pending: Benefits Enrollment</span>
                              </div>
                          </div>
                      ))}
                      {newHires.length === 0 && (
                          <p className="text-stone-400 text-sm italic text-center">No active onboarding workflows.</p>
                      )}
                  </div>
              </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
              {/* Calendar Widget */}
              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                   <h3 className="font-serif text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
                       <Calendar size={18} className="text-rust" /> Upcoming
                   </h3>
                   <div className="space-y-6 relative">
                       <div className="absolute left-2.5 top-2 bottom-2 w-px bg-stone-100"></div>
                       
                       {calendarEvents.map((evt) => (
                           <div 
                                key={evt.id} 
                                className="relative pl-8 cursor-pointer group"
                                onClick={() => setSelectedEvent(evt)}
                           >
                               <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white ${evt.color} shadow-sm z-10 group-hover:scale-110 transition-transform`}></div>
                               <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1 group-hover:text-rust">{evt.date}, {evt.time}</div>
                               <div className="font-bold text-charcoal text-sm">{evt.title}</div>
                           </div>
                       ))}
                   </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-stone-50 p-6 rounded-[2rem] border border-stone-100">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-stone-400 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                      <button 
                        onClick={() => setIsAddEmployeeOpen(true)}
                        className="block w-full py-3 bg-white border border-stone-200 rounded-xl text-center text-xs font-bold text-charcoal hover:border-rust hover:text-rust transition-colors shadow-sm"
                      >
                          + Add Employee
                      </button>
                      <button 
                        onClick={() => setIsPayrollOpen(true)}
                        className="block w-full py-3 bg-white border border-stone-200 rounded-xl text-center text-xs font-bold text-charcoal hover:border-rust hover:text-rust transition-colors shadow-sm"
                      >
                          Run Off-Cycle Payroll
                      </button>
                      <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="block w-full py-3 bg-white border border-stone-200 rounded-xl text-center text-xs font-bold text-charcoal hover:border-rust hover:text-rust transition-colors shadow-sm"
                      >
                          {isExporting ? 'Exporting...' : 'Export Census Data'}
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

// --- MAIN HR CONTROLLER ---

export const HRDashboard: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { employeeId } = useParams();
  
  // Determine Active Group based on path
  const currentPath = pathname;
  let activeGroup = 'Overview';
  
  if (currentPath.includes('/people') || currentPath.includes('/org') || currentPath.includes('/profile')) activeGroup = 'Workforce';
  if (currentPath.includes('/time') || currentPath.includes('/payroll') || currentPath.includes('/documents')) activeGroup = 'Operations';
  if (currentPath.includes('/performance') || currentPath.includes('/learning') || currentPath.includes('/recruitment')) activeGroup = 'Growth';
  if (currentPath.includes('/analytics')) activeGroup = 'Intelligence';

  // Navigation Configuration
  const navGroups = [
      { 
          id: 'Overview', 
          label: 'Console', 
          path: '/employee/hr/dashboard',
          icon: LayoutDashboard 
      },
      { 
          id: 'Workforce', 
          label: 'Workforce', 
          path: '/employee/hr/people',
          icon: Users,
          subLinks: [
              { label: 'Directory', path: '/employee/hr/people', icon: Users },
              { label: 'Org Chart', path: '/employee/hr/org', icon: Network }
          ]
      },
      { 
          id: 'Operations', 
          label: 'Operations', 
          path: '/employee/hr/payroll',
          icon: Briefcase,
          subLinks: [
              { label: 'Payroll', path: '/employee/hr/payroll', icon: DollarSign },
              { label: 'Time & Attendance', path: '/employee/hr/time', icon: Clock },
              { label: 'Documents', path: '/employee/hr/documents', icon: FileText }
          ]
      },
      { 
          id: 'Growth', 
          label: 'Growth', 
          path: '/employee/hr/performance',
          icon: TrendingUp,
          subLinks: [
              { label: 'Performance', path: '/employee/hr/performance', icon: Activity },
              { label: 'Recruitment', path: '/employee/hr/recruitment', icon: UserPlus },
              { label: 'L&D', path: '/employee/hr/learning', icon: GraduationCap }
          ]
      },
      { 
          id: 'Intelligence', 
          label: 'Analytics', 
          path: '/employee/hr/analytics',
          icon: BarChart3 
      }
  ];

  // Determine Content
  let content;
  if (currentPath.includes('/profile/') && employeeId) content = <EmployeeProfile />;
  else if (currentPath.includes('/people')) content = <PeopleDirectory />;
  else if (currentPath.includes('/org')) content = <OrgChart />;
  else if (currentPath.includes('/time')) content = <TimeAttendance />;
  else if (currentPath.includes('/payroll')) content = <PayrollDashboard />;
  else if (currentPath.includes('/documents')) content = <Documents />;
  else if (currentPath.includes('/performance')) content = <PerformanceReviews />;
  else if (currentPath.includes('/recruitment')) content = <Recruitment />;
  else if (currentPath.includes('/learning')) content = <LearningAdmin />;
  else if (currentPath.includes('/analytics')) content = <Analytics />;
  else content = <HROverview />;

  return (
    <div className="pt-4">
      {/* Header & Nav */}
      <div className="mb-10 border-b border-stone-200 pb-0">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
            <div>
                <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Human Resources</div>
                <h1 className="text-4xl font-serif font-bold text-charcoal">People Operations</h1>
            </div>
          </div>
          
          {/* Top Level Nav */}
          <div className="flex gap-2 overflow-x-auto">
              {navGroups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => navigate(group.path)}
                    className={`px-6 py-4 rounded-t-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all relative top-[1px] border-t border-l border-r ${
                        activeGroup === group.id 
                        ? 'bg-ivory border-stone-200 text-rust' 
                        : 'bg-stone-50 border-transparent text-stone-400 hover:text-charcoal hover:bg-stone-100'
                    }`}
                  >
                      <group.icon size={16} className={activeGroup === group.id ? "stroke-[2.5px]" : ""} />
                      {group.label}
                  </button>
              ))}
          </div>
          
          {/* Sub Nav Bar (If applicable) */}
          {activeGroup !== 'Overview' && activeGroup !== 'Intelligence' && (
              <div className="bg-white border-b border-stone-200 py-3 px-1 flex gap-6 overflow-x-auto mb-6 -mt-[1px] relative z-10">
                  {navGroups.find(g => g.id === activeGroup)?.subLinks?.map(sub => (
                      <Link 
                        key={sub.path} 
                        to={sub.path}
                        className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors px-4 py-1 rounded-full ${
                            currentPath.includes(sub.path) ? 'text-charcoal bg-stone-100' : 'text-stone-400 hover:text-charcoal'
                        }`}
                      >
                          <sub.icon size={14} /> {sub.label}
                      </Link>
                  ))}
              </div>
          )}
      </div>

      {content}
    </div>
  );
};
