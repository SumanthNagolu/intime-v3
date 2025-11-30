'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { Users, UserPlus, Clock, TrendingUp, Briefcase, ChevronRight, Activity, Calendar, CheckCircle, LayoutDashboard, Network, FileText, GraduationCap, BarChart3, DollarSign, Download, X, MapPin, Award } from 'lucide-react';
import { ApprovalModal } from './ApprovalModal';
import { ApprovalRequest } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

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
                            <div key={e.id} onClick={() => { onClose(); router.push(`/employee/hr/profile/${e.id}`); }} className="flex items-center justify-between p-4 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer group transition-colors">
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

interface CalendarEvent {
    id: number;
    title: string;
    date: string;
    time: string;
    color: string;
    location?: string;
}

const EventDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; event: CalendarEvent | null }> = ({ isOpen, onClose, event }) => {
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
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

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

  // Static metrics for animation
  const metrics = {
    totalEmployees: totalEmployees || 47,
    newHires: newHires.length || 3,
    openRoles: openRoles.length || 5,
    retentionRate: retentionRate
  };

  // Animated metrics state
  const [animatedMetrics, setAnimatedMetrics] = useState({
    totalEmployees: 0,
    newHires: 0,
    openRoles: 0,
    retentionRate: 0
  });

  // Animate metrics on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedMetrics({
        totalEmployees: Math.round(metrics.totalEmployees * progress),
        newHires: Math.round(metrics.newHires * progress),
        openRoles: Math.round(metrics.openRoles * progress),
        retentionRate: Math.round(metrics.retentionRate * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="animate-fade-in space-y-8">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Headcount Card */}
        <Card className="group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-forest"></div>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center border border-forest-100 group-hover:bg-forest-100 transition-colors">
                <Users size={24} className="text-forest-600" strokeWidth={2.5} />
              </div>
              <div className="flex items-center gap-2 text-caption text-success-600 font-bold bg-success-50 px-3 py-1 rounded-full">
                <TrendingUp size={12} strokeWidth={2.5} />
                +12%
              </div>
            </div>
            <div className="text-display font-heading font-black text-charcoal-900 mb-2">
              {animatedMetrics.totalEmployees}
            </div>
            <CardDescription className="text-charcoal-600 font-subheading font-semibold">
              Total Headcount
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-caption text-charcoal-500 font-medium">
              Month over Month
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Card */}
        <Card
          onClick={() => setDrillDownType('onboarding')}
          className="group relative overflow-hidden cursor-pointer hover:shadow-premium transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-100 transition-colors">
                <UserPlus size={24} className="text-blue-600" strokeWidth={2.5} />
              </div>
              <span className="text-caption font-bold text-blue-600 group-hover:underline">
                View Details
              </span>
            </div>
            <div className="text-display font-heading font-black text-charcoal-900 mb-2">
              {animatedMetrics.newHires}
            </div>
            <CardDescription className="text-charcoal-600 font-subheading font-semibold">
              New Hires Onboarding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-caption text-blue-600 font-medium">
              <Activity size={14} strokeWidth={2} />
              Active workflows
            </div>
          </CardContent>
        </Card>

        {/* Open Roles Card */}
        <Card
          onClick={() => setDrillDownType('roles')}
          className="group relative overflow-hidden cursor-pointer hover:shadow-premium transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warning-500 to-warning-600"></div>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center border border-warning-100 group-hover:bg-warning-100 transition-colors">
                <Briefcase size={24} className="text-warning-600" strokeWidth={2.5} />
              </div>
              {urgentRoles > 0 && (
                <span className="text-caption font-bold text-error-600 bg-error-50 px-3 py-1 rounded-full border border-error-100">
                  {urgentRoles} Urgent
                </span>
              )}
            </div>
            <div className="text-display font-heading font-black text-charcoal-900 mb-2">
              {animatedMetrics.openRoles}
            </div>
            <CardDescription className="text-charcoal-600 font-subheading font-semibold">
              Open Roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-caption text-warning-600 font-medium group-hover:underline">
              Needs attention
            </div>
          </CardContent>
        </Card>

        {/* Retention Card */}
        <Card className="bg-gradient-forest text-white border-0 shadow-premium hover:shadow-premium-lg group relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center border border-gold-400/30">
                <Award size={24} className="text-gold-300" strokeWidth={2.5} />
              </div>
              <div className="flex items-center gap-2 text-caption text-success-300 font-bold">
                <TrendingUp size={12} strokeWidth={2.5} />
                Excellent
              </div>
            </div>
            <div className="text-display font-heading font-black text-white mb-2">
              {animatedMetrics.retentionRate}%
            </div>
            <CardDescription className="text-gold-200 font-subheading font-semibold">
              Retention Rate
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-caption text-forest-100 font-medium">
              Annualized Average
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Action Area - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">

              {/* Approvals */}
              <Card>
                  <CardHeader>
                      <div className="flex items-center justify-between">
                          <CardTitle>Pending Approvals</CardTitle>
                          <span className="text-caption font-bold text-charcoal-500 bg-charcoal-50 px-3 py-1 rounded-full">
                              {pendingApprovals.length} Items
                          </span>
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      {pendingApprovals.length > 0 ? pendingApprovals.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedRequest(item)}
                            className="flex items-center justify-between p-6 bg-charcoal-50 rounded-xl border border-charcoal-100 hover:bg-white hover:border-forest-200 hover:shadow-elevation-md transition-all duration-300 cursor-pointer group hover:-translate-y-0.5"
                          >
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-charcoal-400 border border-charcoal-100 group-hover:border-forest-500 group-hover:text-forest-600 transition-all duration-300">
                                      {item.type === 'Commission' ? <DollarSign size={20} strokeWidth={2.5} /> : <Clock size={20} strokeWidth={2.5} />}
                                  </div>
                                  <div>
                                      <div className="font-heading font-bold text-body text-charcoal-900 group-hover:text-forest-700 transition-colors">
                                          {item.type} Request
                                      </div>
                                      <div className="text-caption text-charcoal-500">
                                          <span className="font-semibold">{item.employeeName}</span> • {item.date}
                                      </div>
                                  </div>
                              </div>
                              <button className="px-5 py-3 bg-gradient-forest text-white rounded-lg text-caption font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-elevation-sm hover:shadow-elevation-md">
                                  Review
                              </button>
                          </div>
                      )) : (
                          <div className="text-center py-12">
                              <CheckCircle size={48} className="mx-auto mb-4 text-charcoal-200" strokeWidth={1.5} />
                              <CardDescription>No pending approvals</CardDescription>
                          </div>
                      )}
                  </CardContent>
              </Card>

              {/* Onboarding Status (Condensed) */}
              <Card>
                  <CardHeader>
                      <div className="flex justify-between items-center">
                          <CardTitle className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                                  <UserPlus size={20} className="text-blue-600" strokeWidth={2.5} />
                              </div>
                              New Hire Progress
                          </CardTitle>
                          <button
                            onClick={() => setDrillDownType('onboarding')}
                            className="text-caption font-bold text-blue-600 hover:text-blue-700 hover:underline uppercase tracking-wider transition-colors"
                          >
                              View All
                          </button>
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      {newHires.slice(0, 2).map(e => (
                          <div
                            key={e.id}
                            onClick={() => router.push(`/employee/hr/profile/${e.id}`)}
                            className="cursor-pointer group p-6 -mx-8 rounded-xl hover:bg-charcoal-50 transition-all duration-300"
                          >
                              <div className="flex justify-between items-center mb-3">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gradient-forest text-white flex items-center justify-center font-heading font-black text-body shadow-elevation-sm">
                                          {e.firstName.charAt(0)}
                                      </div>
                                      <span className="font-heading font-bold text-body text-charcoal-900 group-hover:text-forest-700 transition-colors">
                                          {e.firstName} {e.lastName}
                                      </span>
                                  </div>
                                  <span className="text-caption font-semibold text-charcoal-500 flex items-center gap-2">
                                      Day 3 of 30
                                      <ChevronRight size={14} strokeWidth={2.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </span>
                              </div>
                              <div className="h-3 bg-charcoal-100 rounded-full overflow-hidden shadow-inner mb-3">
                                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 w-[15%] rounded-full transition-all duration-1000"></div>
                              </div>
                              <div className="flex justify-between text-caption text-charcoal-500">
                                  <span className="font-medium">✓ Equipment Setup</span>
                                  <span className="font-semibold text-blue-600">Pending: Benefits Enrollment</span>
                              </div>
                          </div>
                      ))}
                      {newHires.length === 0 && (
                          <div className="text-center py-12">
                              <UserPlus size={48} className="mx-auto mb-4 text-charcoal-200" strokeWidth={1.5} />
                              <CardDescription>No active onboarding workflows</CardDescription>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-8">
              {/* Calendar Widget */}
              <Card>
                   <CardHeader>
                       <CardTitle className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-forest-50 rounded-lg flex items-center justify-center border border-forest-100">
                               <Calendar size={20} className="text-forest-600" strokeWidth={2.5} />
                           </div>
                           Upcoming Events
                       </CardTitle>
                   </CardHeader>
                   <CardContent>
                       <div className="space-y-6 relative">
                           <div className="absolute left-2.5 top-2 bottom-2 w-px bg-charcoal-100"></div>

                           {calendarEvents.map((evt) => (
                               <div
                                    key={evt.id}
                                    className="relative pl-8 cursor-pointer group"
                                    onClick={() => setSelectedEvent(evt)}
                               >
                                   <div className={cn(
                                       "absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white shadow-elevation-sm z-10 group-hover:scale-125 transition-transform duration-300",
                                       evt.color
                                   )}></div>
                                   <div className="text-caption font-semibold uppercase tracking-wider text-charcoal-500 mb-1 group-hover:text-forest-600 transition-colors">
                                       {evt.date}, {evt.time}
                                   </div>
                                   <div className="font-subheading font-bold text-body text-charcoal-900">
                                       {evt.title}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-charcoal-50 border-charcoal-200">
                  <CardHeader>
                      <CardTitle className="text-h4 text-charcoal-700">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                      <button
                        onClick={() => setIsAddEmployeeOpen(true)}
                        className="block w-full py-4 bg-white border-2 border-charcoal-200 rounded-xl text-center text-caption font-bold text-charcoal-900 hover:border-forest-500 hover:text-forest-700 hover:bg-forest-50 transition-all duration-300 shadow-sm hover:shadow-elevation-md hover:-translate-y-0.5"
                      >
                          + Add Employee
                      </button>
                      <button
                        onClick={() => setIsPayrollOpen(true)}
                        className="block w-full py-4 bg-white border-2 border-charcoal-200 rounded-xl text-center text-caption font-bold text-charcoal-900 hover:border-forest-500 hover:text-forest-700 hover:bg-forest-50 transition-all duration-300 shadow-sm hover:shadow-elevation-md hover:-translate-y-0.5"
                      >
                          Run Off-Cycle Payroll
                      </button>
                      <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="block w-full py-4 bg-white border-2 border-charcoal-200 rounded-xl text-center text-caption font-bold text-charcoal-900 hover:border-forest-500 hover:text-forest-700 hover:bg-forest-50 transition-all duration-300 shadow-sm hover:shadow-elevation-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {isExporting ? (
                              <span className="flex items-center justify-center gap-2">
                                  <div className="animate-spin w-4 h-4 border-2 border-charcoal-300 border-t-forest-600 rounded-full"></div>
                                  Exporting...
                              </span>
                          ) : (
                              <span className="flex items-center justify-center gap-2">
                                  <Download size={14} strokeWidth={2.5} />
                                  Export Census Data
                              </span>
                          )}
                      </button>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  );
};

// --- MAIN HR CONTROLLER ---

export const HRDashboard: React.FC = () => {
  const pathname = usePathname();
  const { employeeId } = useParams();

  // Determine Active Group based on path
  const currentPath = pathname;

  // Navigation Configuration (kept for future use)
  const _navGroups = [
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
    <div>
      {content}
    </div>
  );
};
