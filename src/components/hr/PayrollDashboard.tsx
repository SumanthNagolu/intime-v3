'use client';


import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { CheckCircle, AlertCircle, ArrowRight, Download, Send, RefreshCcw, FileText, AlertTriangle, X, ChevronLeft, Search } from 'lucide-react';

// PDF Preview Modal
const FilePreviewModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string }> = ({ isOpen, onClose, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in bg-charcoal/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-3xl h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <h3 className="font-bold text-charcoal">{title}</h3>
                    <button onClick={onClose}><X size={20} className="text-stone-400 hover:text-charcoal"/></button>
                </div>
                <div className="flex-1 bg-stone-200 flex items-center justify-center p-8">
                    <div className="bg-white w-[80%] h-full shadow-lg flex flex-col items-center justify-center text-stone-300 border border-stone-300">
                        <FileText size={80} className="mb-6"/>
                        <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">Document Preview</h2>
                        <p className="text-stone-400 text-sm text-center max-w-xs">{title}</p>
                        <button className="mt-6 px-6 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs font-bold uppercase tracking-widest">Download PDF</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface HistoryRun {
  period: string;
  payDate: string;
  total: string;
  employees: number;
}

export const PayrollDashboard: React.FC = () => {
  const { payrollRun } = useAppStore();
  const [view, setView] = useState<'Dashboard' | 'Wizard' | 'HistoryDetail'>('Dashboard');
  const [selectedHistory, setSelectedHistory] = useState<HistoryRun | null>(null);

  const handleViewHistory = (run: HistoryRun) => {
      setSelectedHistory(run);
      setView('HistoryDetail');
  };

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Operations</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Payroll Center</h1>
      </div>

      {view === 'Dashboard' && (
          <>
            {/* Main Status Card */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-200 mb-12 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${payrollRun.status === 'Paid' ? 'bg-blue-600' : 'bg-yellow-500'}`}></div>
                
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Current Pay Period</div>
                        <h2 className="text-3xl font-serif font-bold text-charcoal">{payrollRun.periodStart} - {payrollRun.periodEnd}</h2>
                        <div className="mt-2 flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                payrollRun.status === 'Paid' ? 'bg-blue-50 text-blue-600' : 
                                payrollRun.status === 'Ready for Approval' ? 'bg-green-50 text-green-700' : 
                                'bg-yellow-50 text-yellow-700'
                            }`}>
                                {payrollRun.status}
                            </span>
                            <span className="text-xs text-stone-500">• {payrollRun.employeeCount} Employees to be paid</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Payroll</div>
                        <div className="text-4xl font-mono font-bold text-charcoal">${payrollRun.totalAmount.toLocaleString()}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Base Salaries</div>
                        <div className="text-xl font-bold text-charcoal">$195,000</div>
                    </div>
                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Commissions</div>
                        <div className="text-xl font-bold text-charcoal">$18,500</div>
                    </div>
                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Bonuses</div>
                        <div className="text-xl font-bold text-charcoal">$4,950</div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button 
                        onClick={() => setView('Wizard')}
                        disabled={payrollRun.status === 'Paid'}
                        className="px-10 py-4 bg-charcoal text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {payrollRun.status === 'Paid' ? 'View Run Details' : 'Process Payroll'} <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* Historical Runs */}
            <div className="bg-white rounded-[2.5rem] shadow-lg border border-stone-200 overflow-hidden">
                <div className="p-8 border-b border-stone-100 bg-stone-50">
                    <h3 className="font-serif text-xl font-bold text-charcoal">Payroll History</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                        <tr>
                            <th className="p-6">Period</th>
                            <th className="p-6">Pay Date</th>
                            <th className="p-6">Total</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        <tr className="hover:bg-stone-50 transition-colors">
                            <td className="p-6 font-bold text-charcoal">Oct 15 - Oct 31, 2025</td>
                            <td className="p-6 text-sm text-stone-500">Nov 1, 2025</td>
                            <td className="p-6 font-mono text-sm">$212,400</td>
                            <td className="p-6"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">Paid</span></td>
                            <td className="p-6 text-right">
                                <button 
                                    onClick={() => handleViewHistory({ period: 'Oct 15 - Oct 31, 2025', payDate: 'Nov 1, 2025', total: '$212,400', employees: 46 })}
                                    className="text-xs font-bold text-rust hover:underline"
                                >
                                    View Run Details
                                </button>
                            </td>
                        </tr>
                        <tr className="hover:bg-stone-50 transition-colors">
                            <td className="p-6 font-bold text-charcoal">Oct 1 - Oct 15, 2025</td>
                            <td className="p-6 text-sm text-stone-500">Oct 16, 2025</td>
                            <td className="p-6 font-mono text-sm">$208,150</td>
                            <td className="p-6"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">Paid</span></td>
                            <td className="p-6 text-right">
                                <button 
                                    onClick={() => handleViewHistory({ period: 'Oct 1 - Oct 15, 2025', payDate: 'Oct 16, 2025', total: '$208,150', employees: 45 })}
                                    className="text-xs font-bold text-rust hover:underline"
                                >
                                    View Run Details
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
          </>
      )}

      {view === 'Wizard' && (
          <PayrollWizard onClose={() => setView('Dashboard')} />
      )}

      {view === 'HistoryDetail' && selectedHistory && (
          <HistoryDetailView run={selectedHistory} onBack={() => setView('Dashboard')} />
      )}
    </div>
  );
};

const HistoryDetailView: React.FC<{ run: HistoryRun, onBack: () => void }> = ({ run, onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [previewFile, setPreviewFile] = useState<string | null>(null);

    return (
        <div className="animate-fade-in">
            <FilePreviewModal isOpen={!!previewFile} onClose={() => setPreviewFile(null)} title={previewFile || ''} />
            
            <button onClick={onBack} className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
                <ChevronLeft size={14} /> Back to History
            </button>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-200 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Run Complete</div>
                        <h2 className="text-3xl font-serif font-bold text-charcoal">{run.period}</h2>
                        <div className="mt-2 text-sm text-stone-500">Paid on {run.payDate} • {run.employees} Employees</div>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-mono font-bold text-charcoal">{run.total}</div>
                        <button 
                            onClick={() => setPreviewFile('Master Payroll Report - ' + run.period)}
                            className="mt-4 px-6 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ml-auto"
                        >
                            <Download size={14} /> Download Master Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-lg border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                    <h3 className="font-serif text-xl font-bold text-charcoal">Individual Paystubs</h3>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-stone-200">
                        <Search size={16} className="text-stone-400" />
                        <input 
                            placeholder="Search employee..." 
                            className="bg-transparent outline-none text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                        <tr>
                            <th className="p-6">Employee</th>
                            <th className="p-6">Gross Pay</th>
                            <th className="p-6">Deductions</th>
                            <th className="p-6">Net Pay</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {[
                            { name: 'David Kim', gross: '$5,200.00', ded: '$1,450.00', net: '$3,750.00' },
                            { name: 'Sarah Lao', gross: '$4,800.00', ded: '$1,200.00', net: '$3,600.00' },
                            { name: 'James Wilson', gross: '$5,500.00', ded: '$1,500.00', net: '$4,000.00' },
                        ].filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).map((e, i) => (
                            <tr key={i} className="hover:bg-stone-50 transition-colors">
                                <td className="p-6 font-bold text-charcoal">{e.name}</td>
                                <td className="p-6 text-sm font-mono text-stone-600">{e.gross}</td>
                                <td className="p-6 text-sm font-mono text-red-500">{e.ded}</td>
                                <td className="p-6 text-sm font-mono font-bold text-charcoal">{e.net}</td>
                                <td className="p-6 text-right">
                                    <button 
                                        onClick={() => setPreviewFile(`Paystub - ${e.name} - ${run.period}`)}
                                        className="text-xs font-bold text-rust hover:underline flex items-center gap-1 justify-end"
                                    >
                                        <FileText size={14} /> PDF Stub
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PayrollWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { updatePayrollStatus, payrollRun } = useAppStore();
    const [step, setStep] = useState(payrollRun.stepsCompleted || 1);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // State for Step 1 (Timesheets)
    const [timesheets, setTimesheets] = useState([
        { id: 1, name: 'David Kim', hours: 80, status: 'Approved' },
        { id: 2, name: 'Sarah Lao', hours: 80, status: 'Approved' },
        { id: 3, name: 'James Wilson', hours: 80, status: 'Approved' },
        { id: 4, name: 'Marcus Johnson', hours: 0, status: 'Not Submitted' },
    ]);

    // Check if we can proceed from step 1
    const canProceedStep1 = !timesheets.some(t => t.status !== 'Approved');

    // Update store step when local step changes
    useEffect(() => {
        updatePayrollStatus('In Progress', step);
    }, [step, updatePayrollStatus]);

    const handleNext = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            if (step < 7) setStep(step + 1);
            else {
                updatePayrollStatus('Paid', 7);
                onClose();
            }
        }, 800);
    };

    const forceApproveAll = () => {
        setTimesheets(timesheets.map(t => ({ ...t, status: 'Approved', hours: t.hours || 80 })));
    };

    const steps = [
        { id: 1, label: 'Review Timesheets' },
        { id: 2, label: 'Review Commissions' },
        { id: 3, label: 'Add Bonuses' },
        { id: 4, label: 'Calculate Taxes' },
        { id: 5, label: 'Generate Paystubs' },
        { id: 6, label: 'Submit Provider' },
        { id: 7, label: 'Confirm' },
    ];

    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-charcoal">Step 1: Review Timesheets</h3>
                            <div className="flex gap-2">
                                <button onClick={forceApproveAll} className="text-xs font-bold text-stone-400 hover:text-charcoal uppercase tracking-widest">Force Approve All</button>
                                <button className="text-xs font-bold text-rust hover:underline uppercase tracking-widest">Remind Employees</button>
                            </div>
                        </div>
                        
                        <div className="border border-stone-200 rounded-xl overflow-hidden">
                            <div className="bg-stone-50 p-3 flex justify-between text-xs font-bold text-stone-400 uppercase tracking-widest">
                                <span>Employee</span>
                                <span>Status</span>
                            </div>
                            {timesheets.map((e) => (
                                <div key={e.id} className="flex justify-between items-center p-4 border-b border-stone-100 bg-white last:border-0">
                                    <span className="font-bold text-sm text-charcoal">{e.name}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono text-sm">{e.hours} hrs</span>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded flex items-center gap-1 ${
                                            e.status === 'Approved' ? 'bg-green-50 text-green-600' : 
                                            e.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                                            'bg-red-50 text-red-600'
                                        }`}>
                                            {e.status === 'Approved' && <CheckCircle size={10} />}
                                            {e.status === 'Not Submitted' && <AlertTriangle size={10} />}
                                            {e.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {!canProceedStep1 && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 items-start text-red-700 text-sm">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <div>
                                    <strong>Action Required:</strong> You cannot proceed until all timesheets are approved. Use &quot;Force Approve&quot; for demo.
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-charcoal">Step 2: Review Commissions</h3>
                        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                            <div className="flex justify-between text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 px-2">
                                <span>Employee / Placement</span>
                                <span>Amount</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-stone-100 shadow-sm">
                                    <div>
                                        <div className="font-bold text-charcoal text-sm">Sarah Lao</div>
                                        <div className="text-xs text-stone-500">Placement: John Smith @ Acme Corp</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-bold uppercase">Approved</span>
                                        <span className="font-mono text-charcoal font-bold">$1,500.00</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-stone-100 shadow-sm">
                                    <div>
                                        <div className="font-bold text-charcoal text-sm">James Wilson</div>
                                        <div className="text-xs text-stone-500">Placement: Amit Kumar @ TechFlow</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-bold uppercase">Approved</span>
                                        <span className="font-mono text-charcoal font-bold">$2,250.00</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-4 px-2 pt-2 border-t border-stone-200">
                                <span className="text-sm font-bold text-charcoal">Total Commissions</span>
                                <span className="text-lg font-bold text-charcoal">$3,750.00</span>
                            </div>
                        </div>
                        <button className="w-full py-3 border-2 border-dashed border-stone-300 rounded-xl text-xs font-bold text-stone-400 uppercase tracking-widest hover:border-rust hover:text-rust hover:bg-rust/5 transition-all">
                            + Add Manual Adjustment
                        </button>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-charcoal">Step 3: Add Bonuses/Adjustments</h3>
                        <p className="text-sm text-stone-500">Enter holiday bonuses, referral bonuses, or one-time adjustments.</p>
                        
                        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-stone-50 text-xs font-bold text-stone-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Employee</th>
                                        <th className="p-4">Bonus Amount</th>
                                        <th className="p-4">Reason</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    <tr>
                                        <td className="p-4 font-bold text-charcoal">David Kim</td>
                                        <td className="p-4"><input className="w-24 p-1 border border-stone-200 rounded text-right" defaultValue="500.00" /></td>
                                        <td className="p-4"><input className="w-full p-1 border border-stone-200 rounded" defaultValue="Holiday Bonus" /></td>
                                        <td className="p-4 text-right"><button className="text-red-500 hover:text-red-700"><X size={14}/></button></td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-bold text-charcoal">Marcus Johnson</td>
                                        <td className="p-4"><input className="w-24 p-1 border border-stone-200 rounded text-right" defaultValue="250.00" /></td>
                                        <td className="p-4"><input className="w-full p-1 border border-stone-200 rounded" defaultValue="Referral Bonus" /></td>
                                        <td className="p-4 text-right"><button className="text-red-500 hover:text-red-700"><X size={14}/></button></td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="p-3 bg-stone-50 text-center border-t border-stone-100">
                                <button className="text-xs font-bold text-rust uppercase tracking-widest hover:underline">+ Add Row</button>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-charcoal">Step 4: Calculate Taxes & Deductions</h3>
                            <button className="text-xs font-bold text-rust hover:underline flex items-center gap-1">
                                <RefreshCcw size={12} /> Recalculate
                            </button>
                        </div>

                        <div className="bg-stone-900 text-white p-6 rounded-2xl shadow-lg">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-stone-700 rounded-full flex items-center justify-center font-serif font-bold">S</div>
                                    <div>
                                        <div className="font-bold text-sm">Sarah Lao</div>
                                        <div className="text-[10px] text-stone-400 uppercase tracking-widest">Preview</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-stone-400 uppercase tracking-widest">Net Pay</div>
                                    <div className="text-xl font-bold text-green-400">$2,826.19</div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <div className="flex justify-between text-stone-300">
                                    <span>Gross Pay</span>
                                    <span className="text-white font-mono">$4,625.00</span>
                                </div>
                                <div className="flex justify-between text-stone-400">
                                    <span>Federal Tax</span>
                                    <span className="text-red-400 font-mono">-$925.00</span>
                                </div>
                                <div className="flex justify-between text-stone-400">
                                    <span>State Tax</span>
                                    <span className="text-red-400 font-mono">-$185.00</span>
                                </div>
                                <div className="flex justify-between text-stone-400">
                                    <span>Social Security</span>
                                    <span className="text-red-400 font-mono">-$286.75</span>
                                </div>
                                <div className="flex justify-between text-stone-400">
                                    <span>Medicare</span>
                                    <span className="text-red-400 font-mono">-$67.06</span>
                                </div>
                                <div className="flex justify-between text-stone-400">
                                    <span>401(k) (4%)</span>
                                    <span className="text-red-400 font-mono">-$185.00</span>
                                </div>
                                <div className="flex justify-between text-stone-400">
                                    <span>Health Ins.</span>
                                    <span className="text-red-400 font-mono">-$150.00</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-xs text-stone-400 italic">Showing preview for 1 of 47 employees.</p>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6 animate-fade-in text-center py-8">
                        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-charcoal mb-2">Step 5: Generate Paystubs</h3>
                        <p className="text-stone-500 text-sm mb-8 max-w-xs mx-auto">
                            System will generate 47 individual PDF paystubs and attach them to employee profiles.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button className="px-6 py-3 border border-stone-200 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-50">Preview Sample</button>
                            <button className="px-8 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
                                Generate All PDFs <FileText size={14} />
                            </button>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-6 animate-fade-in text-center py-8">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100">
                            <span className="font-bold text-red-600 text-2xl">ADP</span>
                        </div>
                        <h3 className="text-xl font-bold text-charcoal mb-2">Step 6: Submit to Provider</h3>
                        <p className="text-stone-500 text-sm mb-8 max-w-xs mx-auto">
                            Ready to upload finalized payroll data to ADP Workforce Now via API.
                        </p>
                        <div className="space-y-3 max-w-xs mx-auto">
                            <button className="w-full py-4 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-2">
                                Send to ADP <Send size={14} />
                            </button>
                            <button className="w-full py-4 bg-white border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-all flex items-center justify-center gap-2 text-stone-500">
                                <Download size={14} /> Export Payroll File (CSV)
                            </button>
                        </div>
                    </div>
                );
            case 7:
                return (
                    <div className="space-y-6 animate-fade-in text-center py-8">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Step 7: Confirm & Close</h3>
                        <p className="text-stone-500 text-sm mb-8 max-w-xs mx-auto">
                            Bank confirms deposits have been scheduled. Click below to mark this period as &quot;Paid&quot; and lock edits.
                        </p>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-xs font-bold max-w-sm mx-auto mb-8">
                            Paystub emails will be sent automatically upon completion.
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="mt-8 border-t border-stone-100 pt-8 animate-slide-up">
            <button onClick={onClose} className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
                <ChevronLeft size={14} /> Cancel Run
            </button>

            {/* Stepper */}
            <div className="flex justify-between mb-8 relative px-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -z-10"></div>
                {steps.map((s) => (
                    <div key={s.id} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-4 transition-all z-10 ${
                            step >= s.id ? 'bg-charcoal border-charcoal text-white' : 'bg-white border-stone-200 text-stone-300'
                        }`}>
                            {step > s.id ? <CheckCircle size={12} /> : s.id}
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest hidden md:block ${step === s.id ? 'text-charcoal' : 'text-stone-300'}`}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white border border-stone-200 rounded-2xl p-8 min-h-[400px] shadow-sm relative flex flex-col justify-between">
                <div>
                    {renderStepContent()}
                </div>
                
                <div className="flex justify-between pt-8 mt-4 border-t border-stone-100">
                    <button 
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className="px-6 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:text-charcoal disabled:opacity-30"
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleNext}
                        disabled={isProcessing || (step === 1 && !canProceedStep1)}
                        className="px-8 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : step === 7 ? 'Mark as Paid' : 'Next Step'} <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
