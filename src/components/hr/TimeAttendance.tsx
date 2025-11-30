'use client';


import React, { useState } from 'react';
import { CheckSquare, X } from 'lucide-react';
import { ApprovalModal } from './ApprovalModal';

const TimesheetDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; employeeName: string }> = ({ isOpen, onClose, employeeName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal"><X size={24}/></button>
                <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Timesheet Review</h2>
                <p className="text-stone-500 mb-6">For: <span className="font-bold text-charcoal">{employeeName}</span> (Oct 1 - Oct 15)</p>

                <div className="border border-stone-200 rounded-xl overflow-hidden mb-6">
                     <div className="bg-stone-50 p-3 grid grid-cols-3 text-xs font-bold text-stone-400 uppercase tracking-widest">
                         <span>Date</span>
                         <span>Hours</span>
                         <span>Project</span>
                     </div>
                     {[1,2,3,4,5].map(d => (
                         <div key={d} className="p-3 grid grid-cols-3 border-b border-stone-100 last:border-0 text-sm">
                             <span className="text-charcoal">Oct 0{d}</span>
                             <span className="text-stone-600 font-mono">8.0</span>
                             <span className="text-stone-500">Internal Ops</span>
                         </div>
                     ))}
                </div>

                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:text-red-600 hover:bg-red-50">Reject</button>
                    <button onClick={onClose} className="px-8 py-3 bg-green-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-700 shadow-lg">Approve Timesheet</button>
                </div>
            </div>
        </div>
    )
}

export const TimeAttendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Review Timesheets' | 'Time Off Requests' | 'Availability'>('Review Timesheets');

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Operations</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Time & Attendance</h1>
        <p className="text-stone-500 mt-2">Workforce time management and PTO administration.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-stone-100 mb-8">
          {(['Review Timesheets', 'Time Off Requests', 'Availability'] as const).map(tab => (
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

      {activeTab === 'Review Timesheets' && <TimesheetReviewView />}
      {activeTab === 'Time Off Requests' && <TimeOffRequestView />}
      {activeTab === 'Availability' && <AvailabilityView />}

    </div>
  );
};

const TimesheetReviewView: React.FC = () => {
    const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

    const employees = [
        { name: 'David Kim', department: 'Recruiting', hours: 40, status: 'Submitted' },
        { name: 'Sarah Lao', department: 'Recruiting', hours: 40, status: 'Approved' },
        { name: 'James Wilson', department: 'Bench Sales', hours: 45, status: 'Submitted', overtime: true },
        { name: 'Marcus Johnson', department: 'Recruiting', hours: 0, status: 'Missing' },
    ];

    return (
        <div className="space-y-8">
            <TimesheetDetailModal isOpen={!!selectedSheet} onClose={() => setSelectedSheet(null)} employeeName={selectedSheet || ''} />

            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-charcoal">Pay Period: Oct 1 - Oct 15</h3>
                <button className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
                    <CheckSquare size={14} /> Approve All Submitted
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-stone-200 shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-stone-50 text-xs font-bold text-stone-400 uppercase tracking-widest">
                        <tr>
                            <th className="p-6">Employee</th>
                            <th className="p-6">Department</th>
                            <th className="p-6">Total Hours</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {employees.map((e, i) => (
                            <tr key={i} className="hover:bg-stone-50 transition-colors">
                                <td className="p-6 font-bold text-charcoal">{e.name}</td>
                                <td className="p-6 text-sm text-stone-500">{e.department}</td>
                                <td className="p-6 font-mono text-sm">
                                    {e.hours}
                                    {e.overtime && <span className="ml-2 text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded uppercase tracking-wide">Overtime</span>}
                                </td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                        e.status === 'Approved' ? 'bg-green-50 text-green-600' :
                                        e.status === 'Submitted' ? 'bg-blue-50 text-blue-600' :
                                        'bg-red-50 text-red-600'
                                    }`}>
                                        {e.status}
                                    </span>
                                </td>
                                <td className="p-6 text-right">
                                    {e.status === 'Submitted' && (
                                        <button onClick={() => setSelectedSheet(e.name)} className="text-xs font-bold text-rust hover:underline">Review</button>
                                    )}
                                    {e.status === 'Missing' && (
                                        <button className="text-xs font-bold text-stone-400 hover:text-charcoal">Send Reminder</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TimeOffRequestView: React.FC = () => {
    const [approvalRequest, setApprovalRequest] = useState<{ id: string; type: string; employeeName: string; date: string; status: string; details: Record<string, unknown> } | null>(null);

    const handleOpenApproval = () => {
        setApprovalRequest({
            id: 'req-test',
            type: 'Time Off',
            employeeName: 'Sarah Lao',
            date: 'Today',
            status: 'Pending',
            details: { start: 'Dec 20', end: 'Dec 27', days: 5, reason: 'Family Vacation' }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* We reuse the ApprovalModal here via portal or state lifting if needed, but for this view we simulate local usage */}
            <ApprovalModal 
                isOpen={!!approvalRequest} 
                onClose={() => setApprovalRequest(null)} 
                request={approvalRequest} 
                onApprove={() => setApprovalRequest(null)} 
                onDeny={() => setApprovalRequest(null)} 
            />

            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                    <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Pending Requests</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-charcoal border border-stone-200">S</div>
                                    <div>
                                        <div className="font-bold text-charcoal text-sm">Sarah Lao</div>
                                        <div className="text-xs text-stone-500">Dec 20 - Dec 27 (5 Days)</div>
                                    </div>
                                </div>
                                <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-[10px] font-bold uppercase tracking-widest rounded">Conflict Warning</span>
                            </div>
                            <p className="text-xs text-stone-600 italic mb-4">&quot;Family vacation for holidays.&quot;</p>
                            <div className="flex gap-3">
                                <button onClick={handleOpenApproval} className="px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust">Review Request</button>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-stone-400 text-sm italic mt-8">No other pending requests.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden bg-noise">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-6 -mt-6"></div>
                    <h3 className="text-lg font-serif font-bold mb-4 relative z-10">Upcoming Out of Office</h3>
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <div className="text-sm">
                                <span className="font-bold">Mike Ross</span> <span className="text-stone-400 text-xs uppercase ml-2">Oct 28 (1 Day)</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <div className="text-sm">
                                <span className="font-bold">Elena R.</span> <span className="text-stone-400 text-xs uppercase ml-2">Nov 02 - Nov 05</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AvailabilityView: React.FC = () => {
    return (
        <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
            <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Team Availability</h3>
            <div className="grid grid-cols-7 gap-4 mb-4 text-center text-xs font-bold text-stone-400 uppercase tracking-widest">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
            <div className="grid grid-cols-7 gap-4">
                {/* Mock Calendar Data */}
                {Array.from({length: 30}).map((_, i) => {
                    const day = i + 1;
                    const isWeekend = (i % 7) >= 5;
                    const hasPTO = day === 20 || day === 21;
                    
                    return (
                        <div key={i} className={`h-24 rounded-xl p-2 border ${isWeekend ? 'bg-stone-50 border-stone-100' : 'bg-white border-stone-200'} flex flex-col justify-between`}>
                            <span className="text-xs font-bold text-stone-400">{day}</span>
                            {hasPTO && (
                                <div className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded truncate">
                                    Sarah (PTO)
                                </div>
                            )}
                            {!isWeekend && !hasPTO && (
                                <div className="text-[10px] text-stone-400 text-center">Full Staff</div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};
