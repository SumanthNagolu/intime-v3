'use client';


import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Activity, PieChart, Clock, ArrowUpRight, Download, Calendar, X, ChevronRight, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { useAppStore } from '../../lib/store';

// --- REUSABLE DETAIL MODAL ---
interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    columns: string[];
    data: any[];
    type?: 'list' | 'financial'; 
}

const AnalyticsDetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, title, columns, data, type = 'list' }) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredData = data.filter(row => 
        Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] p-8 shadow-2xl relative flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>
                
                <div className="mb-8 border-b border-stone-100 pb-6">
                    <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Drill Down</div>
                    <h2 className="text-3xl font-serif font-bold text-charcoal">{title}</h2>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-full border border-stone-100 w-64">
                        <Search size={16} className="text-stone-400" />
                        <input 
                            placeholder="Filter data..." 
                            className="bg-transparent outline-none text-sm w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-charcoal uppercase tracking-widest">
                        <Download size={14} /> Export CSV
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto border border-stone-200 rounded-2xl">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 text-xs font-bold text-stone-400 uppercase tracking-widest sticky top-0">
                            <tr>
                                {columns.map((col, i) => (
                                    <th key={i} className="p-4">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {filteredData.length > 0 ? filteredData.map((row, i) => (
                                <tr key={i} className="hover:bg-stone-50 transition-colors">
                                    {Object.values(row).map((val: any, j) => (
                                        <td key={j} className="p-4 text-sm text-charcoal font-medium">
                                            {val}
                                        </td>
                                    ))}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={columns.length} className="p-8 text-center text-stone-400 italic">No records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- MAIN ANALYTICS COMPONENT ---

export const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Headcount' | 'Turnover' | 'Compensation' | 'Performance' | 'Time'>('Headcount');
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, title: string, columns: string[], data: any[]} | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
      setIsExporting(true);
      setTimeout(() => {
          setIsExporting(false);
          alert("Full Analytics Report downloaded successfully.");
      }, 1500);
  };

  const openDrillDown = (title: string, columns: string[], data: any[]) => {
      setModalConfig({ isOpen: true, title, columns, data });
  };

  return (
    <div className="animate-fade-in pt-4">
      {modalConfig && (
          <AnalyticsDetailModal 
            isOpen={modalConfig.isOpen} 
            onClose={() => setModalConfig(null)} 
            title={modalConfig.title}
            columns={modalConfig.columns}
            data={modalConfig.data}
          />
      )}

      <div className="mb-10 flex justify-between items-end border-b border-stone-200 pb-6">
        <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Intelligence</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">HR Analytics</h1>
        </div>
        <button 
            onClick={handleExport}
            className="px-6 py-3 bg-white border border-stone-200 rounded-full text-xs font-bold uppercase tracking-widest hover:border-charcoal transition-colors flex items-center gap-2 shadow-sm"
        >
            {isExporting ? <Clock size={14} className="animate-spin"/> : <Download size={14} />} 
            {isExporting ? 'Generating...' : 'Export Report'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-stone-100 mb-8 overflow-x-auto">
          {['Headcount', 'Turnover', 'Compensation', 'Performance', 'Time'].map(tab => (
              <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${
                     activeTab === tab ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
                 }`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {activeTab === 'Headcount' && <HeadcountView onDrillDown={openDrillDown} />}
      {activeTab === 'Turnover' && <TurnoverView onDrillDown={openDrillDown} />}
      {activeTab === 'Compensation' && <CompensationView onDrillDown={openDrillDown} />}
      {activeTab === 'Performance' && <PerformanceView onDrillDown={openDrillDown} />}
      {activeTab === 'Time' && <TimeAttendanceView onDrillDown={openDrillDown} />}
    </div>
  );
};

// --- SUB-VIEWS ---

const HeadcountView: React.FC<{ onDrillDown: (t: string, c: string[], d: any[]) => void }> = ({ onDrillDown }) => {
    const { employees } = useAppStore();

    // Mock Data for Drilldowns
    const newHiresData = employees.filter(e => e.status === 'Onboarding').map(e => ({ Name: `${e.firstName} ${e.lastName}`, Role: e.role, Start: e.startDate, Dept: e.department }));
    const exitsData = [
        { Name: 'John Doe', Role: 'Junior Dev', Date: 'Oct 15, 2025', Reason: 'Voluntary' },
        { Name: 'Jane Smith', Role: 'Recruiter', Date: 'Sep 01, 2025', Reason: 'Performance' }
    ];
    
    const activeEmployees = employees.map(e => ({ Name: `${e.firstName} ${e.lastName}`, Role: e.role, Dept: e.department, Status: e.status }));

    return (
        <div className="space-y-8 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div 
                    onClick={() => onDrillDown('Total Headcount', ['Name', 'Role', 'Department', 'Status'], activeEmployees)}
                    className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:border-rust/50 hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest group-hover:text-rust">Total Headcount</div>
                        <Users size={16} className="text-stone-300 group-hover:text-rust" />
                    </div>
                    <div className="text-4xl font-serif font-bold text-charcoal">{employees.length}</div>
                    <div className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1"><TrendingUp size={12}/> +5 this month</div>
                </div>
                <div 
                    onClick={() => onDrillDown('New Hires (YTD)', ['Name', 'Role', 'Start Date', 'Department'], newHiresData)}
                    className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest group-hover:text-blue-600">New Hires (YTD)</div>
                        <Users size={16} className="text-stone-300 group-hover:text-blue-600" />
                    </div>
                    <div className="text-4xl font-serif font-bold text-charcoal">12</div>
                </div>
                <div 
                    onClick={() => onDrillDown('Exits (YTD)', ['Name', 'Role', 'Exit Date', 'Reason'], exitsData)}
                    className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:border-red-300 hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest group-hover:text-red-600">Exits (YTD)</div>
                        <Users size={16} className="text-stone-300 group-hover:text-red-600" />
                    </div>
                    <div className="text-4xl font-serif font-bold text-charcoal">2</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Headcount Trend */}
                <div 
                    onClick={() => onDrillDown('Monthly Headcount History', ['Month', 'Count', 'Change'], [
                        { Month: 'Jan', Count: 35, Change: '+0' }, { Month: 'Feb', Count: 36, Change: '+1' }, { Month: 'Mar', Count: 38, Change: '+2' },
                        { Month: 'Apr', Count: 39, Change: '+1' }, { Month: 'May', Count: 41, Change: '+2' }, { Month: 'Jun', Count: 42, Change: '+1' },
                        { Month: 'Jul', Count: 44, Change: '+2' }, { Month: 'Aug', Count: 45, Change: '+1' }, { Month: 'Sep', Count: 47, Change: '+2' }
                    ])}
                    className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg cursor-pointer hover:shadow-xl transition-all"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif text-xl font-bold text-charcoal">Growth Trend</h3>
                        <ArrowUpRight size={16} className="text-stone-300" />
                    </div>
                    <div className="h-64 flex items-end gap-4 px-4 pb-4 border-b border-stone-100 relative">
                        {[35, 36, 38, 39, 41, 42, 44, 45, 47].map((val, i) => (
                            <div key={i} className="flex-1 bg-stone-100 rounded-t-lg relative group">
                                <div className="absolute bottom-0 w-full bg-charcoal rounded-t-lg transition-all group-hover:bg-rust" style={{ height: `${(val/50)*100}%` }}></div>
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold bg-white p-1 rounded shadow border border-stone-200 z-10">{val}</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs font-bold text-stone-400 uppercase tracking-widest">
                        <span>Jan</span><span>May</span><span>Sep</span>
                    </div>
                </div>

                {/* Department Breakdown */}
                <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                    <h3 className="font-serif text-xl font-bold text-charcoal mb-6">By Department</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Recruiting', val: 15, pct: 32 },
                            { label: 'Bench Sales', val: 12, pct: 25 },
                            { label: 'Engineering', val: 10, pct: 21 },
                            { label: 'HR & Ops', val: 5, pct: 10 },
                            { label: 'Training', val: 3, pct: 6 },
                        ].map((dept, i) => (
                            <div 
                                key={i} 
                                onClick={() => onDrillDown(`${dept.label} Roster`, ['Name', 'Role', 'Manager'], employees.filter(e => e.department.includes(dept.label.split(' ')[0])).map(e => ({ Name: `${e.firstName} ${e.lastName}`, Role: e.role, Manager: e.manager })))}
                                className="cursor-pointer group"
                            >
                                <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                                    <span className="group-hover:text-rust transition-colors">{dept.label}</span>
                                    <span>{dept.val}</span>
                                </div>
                                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-charcoal group-hover:bg-rust transition-colors" style={{ width: `${dept.pct}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TurnoverView: React.FC<{ onDrillDown: (t: string, c: string[], d: any[]) => void }> = ({ onDrillDown }) => {
    const exitData = [
        { Name: 'John Doe', Role: 'Junior Dev', Dept: 'Engineering', Date: 'Oct 15, 2025', Reason: 'Better Offer', Type: 'Voluntary' },
        { Name: 'Jane Smith', Role: 'Recruiter', Dept: 'Recruiting', Date: 'Sep 01, 2025', Reason: 'Performance', Type: 'Involuntary' },
        { Name: 'Mike Jones', Role: 'Sales', Dept: 'Bench Sales', Date: 'Aug 10, 2025', Reason: 'Relocation', Type: 'Voluntary' },
    ];

    return (
        <div className="space-y-8 animate-slide-up">
            <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                    <div onClick={() => onDrillDown('Voluntary Exits', ['Name', 'Role', 'Reason', 'Date'], exitData.filter(e => e.Type === 'Voluntary'))} className="cursor-pointer group">
                        <div className="text-3xl font-serif font-bold text-charcoal group-hover:text-green-600 transition-colors">8%</div>
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Voluntary</div>
                    </div>
                    <div onClick={() => onDrillDown('Involuntary Exits', ['Name', 'Role', 'Reason', 'Date'], exitData.filter(e => e.Type === 'Involuntary'))} className="cursor-pointer group">
                        <div className="text-3xl font-serif font-bold text-charcoal group-hover:text-red-600 transition-colors">2%</div>
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Involuntary</div>
                    </div>
                    <div onClick={() => onDrillDown('All Exits', ['Name', 'Role', 'Type', 'Reason'], exitData)} className="cursor-pointer group">
                        <div className="text-3xl font-serif font-bold text-charcoal group-hover:text-rust transition-colors">10%</div>
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Rate</div>
                    </div>
                    <div>
                        <div className="text-3xl font-serif font-bold text-charcoal">2.3y</div>
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Avg Tenure</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                    <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Exit Reasons</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Better Opportunity', pct: 45, color: 'bg-blue-500' },
                            { label: 'Compensation', pct: 25, color: 'bg-green-500' },
                            { label: 'Work-Life Balance', pct: 15, color: 'bg-yellow-500' },
                            { label: 'Other', pct: 15, color: 'bg-stone-300' },
                        ].map((reason, i) => (
                            <div key={i} onClick={() => onDrillDown(`Exits: ${reason.label}`, ['Name', 'Role', 'Date'], exitData)} className="flex items-center gap-4 cursor-pointer group">
                                <div className={`w-3 h-3 rounded-full ${reason.color}`}></div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                                        <span className="group-hover:text-rust transition-colors">{reason.label}</span>
                                        <span>{reason.pct}%</span>
                                    </div>
                                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${reason.color}`} style={{ width: `${reason.pct}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CompensationView: React.FC<{ onDrillDown: (t: string, c: string[], d: any[]) => void }> = ({ onDrillDown }) => {
    const payrollHistory = [
        { Month: 'Oct', Amount: '$220,000', Employees: 47 },
        { Month: 'Sep', Amount: '$218,000', Employees: 45 },
        { Month: 'Aug', Amount: '$215,000', Employees: 44 },
        { Month: 'Jul', Amount: '$212,000', Employees: 42 },
    ];

    const equityData = [
        { Role: 'Junior Recruiter', Avg: '$60,000', Market: '$62,000', Status: 'Underpaid' },
        { Role: 'Senior Recruiter', Avg: '$95,000', Market: '$90,000', Status: 'Overpaid' },
        { Role: 'HR Manager', Avg: '$110,000', Market: '$110,000', Status: 'At Market' },
    ];

    return (
        <div className="space-y-8 animate-slide-up">
            <div 
                onClick={() => onDrillDown('Payroll History (12 Months)', ['Month', 'Amount', 'Employees'], payrollHistory)}
                className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg cursor-pointer hover:border-blue-300 transition-all"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-xl font-bold text-charcoal">Payroll Trend (12 Months)</h3>
                    <ArrowUpRight size={16} className="text-stone-300" />
                </div>
                <div className="h-64 flex items-end gap-2 px-4 pb-4 border-b border-stone-100">
                    {[180, 182, 185, 190, 195, 200, 205, 210, 212, 215, 218, 220].map((val, i) => (
                        <div key={i} className="flex-1 bg-blue-50 rounded-t-lg relative group hover:bg-blue-100 transition-colors">
                            <div className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg" style={{ height: `${(val/250)*100}%` }}></div>
                        </div>
                    ))}
                </div>
                <p className="text-center text-xs font-bold text-stone-400 uppercase tracking-widest mt-4">Total Payroll: $220k / Month</p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Pay Equity Analysis</h3>
                <table className="w-full text-left">
                    <thead className="bg-stone-50 text-xs font-bold uppercase tracking-widest text-stone-400">
                        <tr>
                            <th className="p-4 rounded-l-xl">Role</th>
                            <th className="p-4">Avg Salary</th>
                            <th className="p-4">Market Rate</th>
                            <th className="p-4 rounded-r-xl">Ratio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {[
                            { role: 'Junior Recruiter', avg: '$60,000', mkt: '$62,000', ratio: '97%' },
                            { role: 'Senior Recruiter', avg: '$95,000', mkt: '$90,000', ratio: '105%' },
                            { role: 'HR Manager', avg: '$110,000', mkt: '$110,000', ratio: '100%' },
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-stone-50 cursor-pointer" onClick={() => onDrillDown(`Salary Details: ${row.role}`, ['Role', 'Avg', 'Market', 'Status'], [equityData[i]])}>
                                <td className="p-4 font-bold text-charcoal">{row.role}</td>
                                <td className="p-4 text-stone-600">{row.avg}</td>
                                <td className="p-4 text-stone-600">{row.mkt}</td>
                                <td className="p-4 font-bold text-green-600">{row.ratio}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PerformanceView: React.FC<{ onDrillDown: (t: string, c: string[], d: any[]) => void }> = ({ onDrillDown }) => {
    const reviews = [
        { Name: 'David Kim', Role: 'Manager', Status: 'Completed', Rating: '4.5' },
        { Name: 'Sarah Lao', Role: 'Recruiter', Status: 'Pending', Rating: '-' },
        { Name: 'Marcus Johnson', Role: 'Junior', Status: 'Completed', Rating: '3.8' },
    ];

    return (
        <div className="space-y-8 animate-slide-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Review Completion', val: '87%', data: reviews },
                    { label: 'Avg Rating', val: '3.8/5', data: reviews.filter(r => r.Status === 'Completed') },
                    { label: 'Goals Active', val: '92%', data: [{ Goal: 'Hiring Q4', Owner: 'David', Status: 'On Track' }] },
                    { label: 'Promotions YTD', val: '4', data: [{ Name: 'Sarah Lao', From: 'Junior', To: 'Senior' }] },
                ].map((stat, i) => (
                    <div 
                        key={i} 
                        onClick={() => onDrillDown(stat.label + ' Details', Object.keys(stat.data[0] || {}), stat.data)}
                        className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-center cursor-pointer hover:border-rust/50 hover:shadow-md transition-all group"
                    >
                        <div className="text-2xl font-bold text-charcoal group-hover:text-rust transition-colors">{stat.val}</div>
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-xl font-bold text-charcoal">Top Performers</h3>
                    <button className="text-xs font-bold text-rust hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                    {['David Kim', 'James Wilson', 'Alice Wong'].map((name, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-bold text-xs">{i+1}</div>
                                <span className="font-bold text-charcoal">{name}</span>
                            </div>
                            <span className="font-bold text-green-600">Exceeds Expectations</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TimeAttendanceView: React.FC<{ onDrillDown: (t: string, c: string[], d: any[]) => void }> = ({ onDrillDown }) => {
    const [reminderSent, setReminderSent] = useState(false);

    const highPTO = [
        { Name: 'Sarah Lao', Balance: '15 Days', UseBy: 'Dec 31' },
        { Name: 'Mike Ross', Balance: '12 Days', UseBy: 'Dec 31' },
        { Name: 'James Wilson', Balance: '10 Days', UseBy: 'Dec 31' },
    ];

    const handleSendReminder = () => {
        setReminderSent(true);
        setTimeout(() => setReminderSent(false), 3000);
    };

    return (
        <div className="space-y-8 animate-slide-up">
            {reminderSent && (
                <div className="fixed bottom-8 right-8 bg-charcoal text-white px-6 py-3 rounded-xl shadow-2xl animate-slide-up z-50 flex items-center gap-3">
                    <CheckCircle size={18} className="text-green-400" />
                    <span className="text-sm font-bold">Reminders sent to 8 employees.</span>
                </div>
            )}

            <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                <h3 className="font-serif text-xl font-bold text-charcoal mb-6">PTO Utilization</h3>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div 
                        onClick={() => onDrillDown('PTO Utilization Report', ['Name', 'Days Taken', 'Balance'], [{ Name: 'Avg Employee', Taken: '12', Balance: '8' }])}
                        className="w-40 h-40 rounded-full border-8 border-stone-100 flex items-center justify-center relative cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="absolute inset-0 rounded-full border-8 border-rust border-t-transparent rotate-45"></div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-charcoal">65%</div>
                            <div className="text-[10px] font-bold uppercase text-stone-400">Utilized</div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start gap-3 mb-4">
                            <AlertTriangle size={20} className="text-yellow-500 shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-charcoal mb-1">Burnout Risk Detected</h4>
                                <p className="text-sm text-stone-600">
                                    8 employees have &gt;10 unused PTO days remaining this year. This correlates with higher churn risk in Q1.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => onDrillDown('High PTO Balance List', ['Name', 'Balance', 'Use By'], highPTO)}
                                className="px-6 py-2 bg-stone-100 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-200 text-stone-600"
                            >
                                View List
                            </button>
                            <button 
                                onClick={handleSendReminder}
                                className="px-6 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors"
                            >
                                Send Reminder
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
