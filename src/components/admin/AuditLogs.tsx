'use client';


import React, { useState } from 'react';
import { Search, Filter, Download, Clock, User, FileText, X } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LogDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; log: any }> = ({ isOpen, onClose, log }) => {
    if (!isOpen || !log) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>

                <div className="mb-6">
                    <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Audit Trail</div>
                    <h2 className="text-2xl font-serif font-bold text-charcoal">Event Details</h2>
                </div>

                <div className="space-y-4 mb-8 bg-stone-50 p-6 rounded-2xl border border-stone-100">
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">ID</span>
                        <span className="font-mono text-sm text-charcoal">{log.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Timestamp</span>
                        <span className="font-mono text-sm text-charcoal">{log.timestamp}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Actor</span>
                        <span className="font-bold text-charcoal">{log.user}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Action</span>
                        <span className="font-bold text-charcoal">{log.action}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Category</span>
                        <span className="font-mono text-sm text-charcoal">{log.category}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Target</span>
                        <span className="font-mono text-sm text-charcoal">{log.target}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Origin IP</span>
                        <span className="font-mono text-sm text-charcoal">{log.ip}</span>
                    </div>
                </div>

                <div className="bg-stone-900 p-4 rounded-xl text-xs font-mono text-stone-300 overflow-x-auto">
                    <pre>{JSON.stringify({
                        event_id: `evt_${Math.floor(Math.random()*10000)}`,
                        timestamp: log.timestamp,
                        actor: log.user,
                        action: log.action,
                        category: log.category,
                        resource: log.target,
                        ip: log.ip,
                        status: "success"
                    }, null, 2)}</pre>
                </div>

                <div className="mt-8 text-center">
                    <button onClick={onClose} className="px-8 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
                        Close Detail
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AuditLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<unknown | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const logs = [
      { id: 'log-1', timestamp: '2025-11-24 09:15:32', user: 'Sarah Lao', action: 'Created User', target: 'John Doe (Recruiter)', ip: '192.168.1.45', category: 'User' },
      { id: 'log-2', timestamp: '2025-11-24 09:20:14', user: 'David Kim', action: 'Changed Permissions', target: 'Role: Recruiter', ip: '192.168.1.52', category: 'Security' },
      { id: 'log-3', timestamp: '2025-11-24 10:05:22', user: 'Admin', action: 'Approved Course', target: 'Guidewire ClaimCenter', ip: '192.168.1.10', category: 'System' },
      { id: 'log-4', timestamp: '2025-11-24 11:30:00', user: 'System', action: 'Backup Completed', target: 'Daily Backup', ip: 'localhost', category: 'System' },
      { id: 'log-5', timestamp: '2025-11-23 16:45:12', user: 'Elena R.', action: 'Failed Login', target: 'N/A', ip: '203.0.113.42', alert: true, category: 'Security' },
      { id: 'log-6', timestamp: '2025-11-23 14:20:05', user: 'Mike Ross', action: 'Deleted Course', target: 'Draft: Intro to Billing', ip: '192.168.1.33', category: 'Content' },
      { id: 'log-7', timestamp: '2025-11-23 10:15:00', user: 'System', action: 'API Rate Limit', target: 'Gateway', ip: '45.32.11.90', alert: true, category: 'System' },
  ];

  const filteredLogs = logs.filter(log => {
      const matchesSearch = 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip.includes(searchTerm);
      
      const matchesFilter = activeFilter === 'All' || log.category === activeFilter;

      return matchesSearch && matchesFilter;
  });

  const handleExportCSV = () => {
      const headers = ['ID', 'Timestamp', 'User', 'Action', 'Category', 'Target', 'IP'];
      const csvContent = [
          headers.join(','),
          ...filteredLogs.map(log => [log.id, log.timestamp, log.user, log.action, log.category, log.target, log.ip].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  return (
    <div className="animate-fade-in pt-4">
      <LogDetailModal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} log={selectedLog} />

      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Security</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Audit Logs</h1>
        <p className="text-stone-500 mt-2">Immutable record of system events and user actions.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-6 border-b border-stone-100 bg-stone-50 flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm flex-1 max-w-md">
                  <Search size={18} className="text-stone-400 ml-2" />
                  <input 
                    type="text" 
                    placeholder="Search logs by user, IP, or action..." 
                    className="flex-1 bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <div className="flex gap-2">
                  <div className="relative group">
                      <button className="px-4 py-2 bg-white border border-stone-200 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-50 flex items-center gap-2 text-stone-500">
                          <Filter size={14} /> {activeFilter === 'All' ? 'Filter' : activeFilter}
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-20 hidden group-hover:block">
                          {['All', 'User', 'System', 'Security', 'Content'].map(filter => (
                              <button 
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-stone-50 ${activeFilter === filter ? 'text-rust bg-rust/5' : 'text-stone-500'}`}
                              >
                                  {filter}
                              </button>
                          ))}
                      </div>
                  </div>
                  <button 
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-white border border-stone-200 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-50 flex items-center gap-2 text-stone-500"
                  >
                      <Download size={14} /> Export CSV
                  </button>
              </div>
          </div>

          {/* Log Table */}
          <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-sm">
                  <thead className="bg-stone-100 text-xs font-bold text-stone-500 uppercase tracking-widest">
                      <tr>
                          <th className="p-6">Timestamp</th>
                          <th className="p-6">User</th>
                          <th className="p-6">Category</th>
                          <th className="p-6">Action</th>
                          <th className="p-6">Target</th>
                          <th className="p-6">IP Address</th>
                          <th className="p-6">Details</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                      {filteredLogs.map((log) => (
                          <tr 
                            key={log.id} 
                            onClick={() => setSelectedLog(log)}
                            className={`hover:bg-stone-50 transition-colors cursor-pointer ${log.alert ? 'bg-red-50/50 hover:bg-red-50' : ''}`}
                          >
                              <td className="p-6 text-stone-500 whitespace-nowrap flex items-center gap-2">
                                  <Clock size={14} /> {log.timestamp}
                              </td>
                              <td className="p-6 font-bold text-charcoal">
                                  <div className="flex items-center gap-2">
                                      <User size={14} className="text-stone-400" /> {log.user}
                                  </div>
                              </td>
                              <td className="p-6">
                                  <span className="px-2 py-1 rounded border border-stone-200 text-[10px] font-bold uppercase tracking-widest bg-white text-stone-500">
                                      {log.category}
                                  </span>
                              </td>
                              <td className="p-6">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${log.alert ? 'bg-red-100 text-red-600' : 'bg-stone-200 text-stone-600'}`}>
                                      {log.action}
                                  </span>
                              </td>
                              <td className="p-6 text-stone-600 truncate max-w-xs">{log.target}</td>
                              <td className="p-6 text-stone-400">{log.ip}</td>
                              <td className="p-6">
                                  <button className="text-rust hover:underline text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                      View JSON <FileText size={12} />
                                  </button>
                              </td>
                          </tr>
                      ))}
                      {filteredLogs.length === 0 && (
                          <tr>
                              <td colSpan={7} className="p-12 text-center text-stone-400 italic">No logs found matching your criteria.</td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-between items-center">
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                  Showing {filteredLogs.length} of {logs.length} Logs
              </div>
              <div className="flex gap-2">
                  <button disabled className="px-3 py-1 bg-white border border-stone-200 rounded text-xs font-bold text-stone-400 opacity-50 cursor-not-allowed">Prev</button>
                  <button disabled className="px-3 py-1 bg-white border border-stone-200 rounded text-xs font-bold text-stone-400 opacity-50 cursor-not-allowed">Next</button>
              </div>
          </div>
      </div>
    </div>
  );
};
