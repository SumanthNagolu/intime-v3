'use client';


import React, { useState } from 'react';
import { Activity, Server, ShieldCheck, HardDrive, AlertTriangle, Users, FileText, UserPlus, Settings, BookOpen, X, CheckCircle, XCircle, ChevronRight, Cpu } from 'lucide-react';

// Import Sub-Components
import { UserManagement } from './UserManagement';
import { Permissions } from './Permissions';
import { SystemSettings } from './SystemSettings';
import { AuditLogs } from './AuditLogs';
import { CourseManagement } from './CourseManagement';

// --- TYPES ---

interface ApprovalItem {
  id: number;
  title: string;
  type: 'User' | 'Content';
  user: string;
  time: string;
  role?: string;
  desc?: string;
}

interface ActivityItem {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  type: string;
  timestamp?: string;
}

// --- MODALS ---

const SystemHealthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] p-8 shadow-2xl relative flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-6">
                    <div>
                        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Infrastructure</div>
                        <h2 className="text-3xl font-serif font-bold text-charcoal">System Health Details</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-charcoal">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Cpu size={20} className="text-stone-400" />
                                <span className="font-bold text-charcoal">CPU Load</span>
                            </div>
                            <div className="text-4xl font-serif font-bold text-charcoal mb-2">32%</div>
                            <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[32%]"></div>
                            </div>
                            <p className="text-xs text-stone-500 mt-2">4 Cores Active</p>
                        </div>
                        <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Activity size={20} className="text-stone-400" />
                                <span className="font-bold text-charcoal">Memory</span>
                            </div>
                            <div className="text-4xl font-serif font-bold text-charcoal mb-2">64%</div>
                            <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[64%]"></div>
                            </div>
                            <p className="text-xs text-stone-500 mt-2">12GB / 16GB Used</p>
                        </div>
                        <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                            <div className="flex items-center gap-3 mb-4">
                                <HardDrive size={20} className="text-stone-400" />
                                <span className="font-bold text-charcoal">Storage</span>
                            </div>
                            <div className="text-4xl font-serif font-bold text-charcoal mb-2">47%</div>
                            <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 w-[47%]"></div>
                            </div>
                            <p className="text-xs text-stone-500 mt-2">234GB Free</p>
                        </div>
                    </div>

                    {/* Node Status */}
                    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                        <div className="p-4 bg-stone-50 border-b border-stone-200 font-bold text-charcoal text-sm uppercase tracking-widest">
                            Cluster Nodes
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="text-stone-400 text-xs uppercase font-bold border-b border-stone-100">
                                <tr>
                                    <th className="p-4">Node ID</th>
                                    <th className="p-4">Region</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Latency</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-stone-50">
                                    <td className="p-4 font-mono text-charcoal">us-east-1a</td>
                                    <td className="p-4">N. Virginia</td>
                                    <td className="p-4 text-green-600 font-bold">Healthy</td>
                                    <td className="p-4 text-stone-500">12ms</td>
                                </tr>
                                <tr className="border-b border-stone-50">
                                    <td className="p-4 font-mono text-charcoal">us-east-1b</td>
                                    <td className="p-4">N. Virginia</td>
                                    <td className="p-4 text-green-600 font-bold">Healthy</td>
                                    <td className="p-4 text-stone-500">14ms</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-mono text-charcoal">us-west-2a</td>
                                    <td className="p-4">Oregon</td>
                                    <td className="p-4 text-green-600 font-bold">Healthy</td>
                                    <td className="p-4 text-stone-500">45ms</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="pt-6 border-t border-stone-100 text-right">
                    <button onClick={onClose} className="px-8 py-3 bg-stone-100 text-stone-600 font-bold text-xs uppercase tracking-widest rounded-full hover:bg-stone-200 transition-colors">
                        Close Diagnostics
                    </button>
                </div>
            </div>
        </div>
    );
};

const ApprovalReviewModal: React.FC<{ isOpen: boolean; onClose: () => void; onAction: (_action: 'approve' | 'deny') => void; item: ApprovalItem | null }> = ({ isOpen, onClose, onAction, item }) => {
    const [comment, setComment] = useState('');

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal"><X size={24} /></button>
                
                <div className="mb-8 border-b border-stone-100 pb-6">
                    <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Review Request</div>
                    <h2 className="text-3xl font-serif font-bold text-charcoal mb-2">{item.title}</h2>
                    <p className="text-stone-500">Submitted by <span className="font-bold text-charcoal">{item.user}</span> • {item.time}</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Request Details</h4>
                        {item.type === 'User' ? (
                            <div className="space-y-3">
                                <div className="flex justify-between"><span className="text-stone-500">Name:</span> <span className="font-bold text-charcoal">John Doe</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Role Requested:</span> <span className="font-bold text-charcoal">Recruiter</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Department:</span> <span className="font-bold text-charcoal">Talent Acquisition</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Email:</span> <span className="font-bold text-charcoal">john.doe@intime.com</span></div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-between"><span className="text-stone-500">Course:</span> <span className="font-bold text-charcoal">Advanced PolicyCenter</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Modules:</span> <span className="font-bold text-charcoal">8 Modules</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Changes:</span> <span className="font-bold text-charcoal">New content added to Module 4</span></div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Reviewer Comments</label>
                        <textarea 
                            className="w-full h-32 p-4 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
                            placeholder="Add notes for the requester (optional)..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end gap-4">
                    <button onClick={() => onAction('deny')} className="px-6 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-colors flex items-center gap-2">
                        <XCircle size={16} /> Deny
                    </button>
                    <button onClick={() => onAction('approve')} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg flex items-center gap-2">
                        <CheckCircle size={16} /> Approve
                    </button>
                </div>
            </div>
        </div>
    );
};

const ActivityDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; activity: ActivityItem | null }> = ({ isOpen, onClose, activity }) => {
    if (!isOpen || !activity) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-xl rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>
                
                <div className="mb-6">
                    <div className="text-stone-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">Activity Log</div>
                    <h2 className="text-2xl font-serif font-bold text-charcoal">{activity.action}</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between py-3 border-b border-stone-100">
                        <span className="text-stone-500 text-sm">User</span>
                        <span className="font-bold text-charcoal">{activity.user}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-stone-100">
                        <span className="text-stone-500 text-sm">Target</span>
                        <span className="font-bold text-charcoal">{activity.target}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-stone-100">
                        <span className="text-stone-500 text-sm">Timestamp</span>
                        <span className="font-bold text-charcoal font-mono">{activity.timestamp || 'Just now'}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-stone-100">
                        <span className="text-stone-500 text-sm">IP Address</span>
                        <span className="font-bold text-charcoal font-mono">192.168.1.45</span>
                    </div>
                </div>

                <div className="bg-stone-900 p-4 rounded-xl text-xs font-mono text-stone-300 overflow-x-auto">
                    {`{
  "event_id": "evt_${Math.floor(Math.random()*10000)}",
  "actor": "${activity.user}",
  "action": "${activity.action}",
  "resource": "${activity.target}",
  "status": "success"
}`}
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

// --- Mission Control View ---
const MissionControl: React.FC<{ 
    handleTabChange: (tab: string) => void, 
    triggerCreateUser: () => void 
}> = ({ handleTabChange, triggerCreateUser }) => {
  
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<ApprovalItem | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [activityFilter, setActivityFilter] = useState('All');

  // Mock Pending Approvals
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([
      { id: 1, title: 'New User Request', type: 'User', user: 'Sarah Lao', time: '5 min ago', role: 'Junior Recruiter' },
      { id: 2, title: 'Course Publish Request', type: 'Content', user: 'David Kim', time: '2 hours ago', desc: 'Advanced PolicyCenter • 8 Modules' }
  ]);

  const handleReviewAction = (_action: 'approve' | 'deny') => {
      if (reviewItem) {
          setPendingApprovals(prev => prev.filter(item => item.id !== reviewItem.id));
          setReviewItem(null);
      }
  };

  // Mock System Metrics
  const systemMetrics = [
      { label: 'Total Users', value: '247', sub: '47 Employees, 150 Students', icon: Users, status: 'normal', action: () => handleTabChange('User Management') },
      { label: 'Active Sessions', value: '89', sub: 'Online Now', icon: Activity, status: 'success', action: () => setIsHealthModalOpen(true) },
      { label: 'System Status', value: 'Operational', sub: '100% Uptime', icon: Server, status: 'success', action: () => setIsHealthModalOpen(true) },
      { label: 'Storage', value: '47%', sub: '234GB / 500GB', icon: HardDrive, status: 'warning', action: () => setIsHealthModalOpen(true) },
  ];

  // Extended Mock Activity Feed
  const activityFeed = [
      { id: 1, user: 'Sarah Lao', action: 'created new user account', target: 'John Doe (Recruiter)', time: '5 min ago', type: 'User' },
      { id: 2, user: 'David Kim', action: 'submitted module for approval', target: 'Advanced PolicyCenter', time: '2 hours ago', type: 'Content' },
      { id: 3, user: 'System', action: 'backup completed successfully', target: 'Daily Backup', time: '3 hours ago', type: 'System' },
      { id: 4, user: 'Elena R.', action: 'updated permissions', target: 'HR Manager Role', time: '5 hours ago', type: 'Security' },
      { id: 5, user: 'Mike Ross', action: 'published course', target: 'BillingCenter Basics', time: '6 hours ago', type: 'Content' },
      { id: 6, user: 'Admin', action: 'exported audit logs', target: 'Security Audit', time: 'Yesterday', type: 'Security' },
      { id: 7, user: 'System', action: 'auto-scaling trigger', target: 'Worker Nodes', time: 'Yesterday', type: 'System' },
      { id: 8, user: 'Sarah Lao', action: 'reset password', target: 'Self', time: 'Yesterday', type: 'User' },
  ];

  const filteredActivity = activityFeed.filter(a => activityFilter === 'All' || a.type === activityFilter);

  return (
    <div className="animate-fade-in">
      <SystemHealthModal isOpen={isHealthModalOpen} onClose={() => setIsHealthModalOpen(false)} />
      <ApprovalReviewModal isOpen={!!reviewItem} onClose={() => setReviewItem(null)} onAction={handleReviewAction} item={reviewItem} />
      <ActivityDetailModal isOpen={!!selectedActivity} onClose={() => setSelectedActivity(null)} activity={selectedActivity} />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {systemMetrics.map((metric, i) => (
              <div 
                key={i} 
                onClick={metric.action}
                className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-lg transition-all group cursor-pointer hover:border-rust/30 relative overflow-hidden"
              >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-stone-50 rounded-bl-[2rem] -mr-4 -mt-4 transition-colors group-hover:bg-rust/5"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-rust transition-colors">{metric.label}</div>
                      <metric.icon size={18} className={`text-stone-300 group-hover:text-charcoal transition-colors ${metric.status === 'success' ? 'group-hover:text-green-600' : metric.status === 'warning' ? 'group-hover:text-yellow-600' : ''}`} />
                  </div>
                  <div className="text-4xl font-serif font-bold text-charcoal mb-1 relative z-10">{metric.value}</div>
                  <div className="text-xs font-bold text-stone-500 relative z-10 group-hover:text-charcoal">{metric.sub}</div>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main: Pending Approvals */}
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-200">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-xl font-bold text-charcoal flex items-center gap-2">
                          <AlertTriangle size={20} className="text-yellow-600" /> Pending Approvals
                      </h3>
                      <div className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">{pendingApprovals.length} Items</div>
                  </div>

                  <div className="space-y-4">
                      {pendingApprovals.length === 0 ? (
                          <div className="text-center py-8 text-stone-400 italic">No pending approvals.</div>
                      ) : pendingApprovals.map(item => (
                          <div 
                            key={item.id}
                            className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between group hover:border-stone-300 transition-colors cursor-pointer"
                            onClick={() => setReviewItem(item)}
                          >
                              <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'User' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                      {item.type === 'User' ? <UserPlus size={18} /> : <FileText size={18} />}
                                  </div>
                                  <div>
                                      <div className="font-bold text-charcoal text-sm group-hover:text-rust transition-colors">{item.title}</div>
                                      <div className="text-xs text-stone-500">
                                          {item.type === 'User' ? `Requested by ${item.user} • Role: ${item.role}` : `${item.desc}`}
                                      </div>
                                  </div>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setReviewItem(item); }}
                                className="px-6 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-charcoal hover:text-white transition-all shadow-sm"
                              >
                                  Review
                              </button>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-xl font-bold text-charcoal">System Activity</h3>
                      <div className="flex gap-2">
                          {['All', 'User', 'System', 'Security'].map(filter => (
                              <button 
                                key={filter}
                                onClick={() => setActivityFilter(filter)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${activityFilter === filter ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                              >
                                  {filter}
                              </button>
                          ))}
                      </div>
                  </div>
                  
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {filteredActivity.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedActivity(item)}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group border border-transparent hover:border-stone-100"
                          >
                              <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 bg-stone-50 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 text-[10px] font-bold group-hover:bg-white group-hover:text-rust transition-colors">
                                      {item.user.charAt(0)}
                                  </div>
                                  <div>
                                      <div className="text-sm text-charcoal">
                                          <span className="font-bold">{item.user}</span> {item.action}
                                      </div>
                                      <div className="text-[10px] text-stone-400 font-mono">
                                          {item.time} • {item.target}
                                      </div>
                                  </div>
                              </div>
                              <ChevronRight size={14} className="text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-stone-100 text-center">
                      <button onClick={() => handleTabChange('Audit Logs')} className="text-xs font-bold text-rust uppercase tracking-widest hover:underline">
                          View All Logs
                      </button>
                  </div>
              </div>
          </div>

          {/* Right: Quick Actions & Status */}
          <div className="space-y-6">
              <div className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-xl bg-noise relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rust/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <h3 className="font-serif text-xl font-bold mb-6 relative z-10">Quick Actions</h3>
                  <div className="space-y-3 relative z-10">
                      <button onClick={triggerCreateUser} className="block w-full py-3 bg-white text-charcoal rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust hover:text-white transition-all text-center shadow-lg">
                          Create New User
                      </button>
                      <button onClick={() => handleTabChange('Permissions')} className="block w-full py-3 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-charcoal transition-all text-center">
                          Manage Permissions
                      </button>
                      <button onClick={() => handleTabChange('Configuration')} className="block w-full py-3 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-charcoal transition-all text-center">
                          System Settings
                      </button>
                      <button onClick={() => handleTabChange('Audit Logs')} className="block w-full py-3 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-charcoal transition-all text-center">
                          View Audit Logs
                      </button>
                  </div>
              </div>

              <div 
                onClick={() => setIsHealthModalOpen(true)}
                className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-lg cursor-pointer group hover:border-rust/30 transition-all"
              >
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-xs uppercase tracking-widest text-stone-400 group-hover:text-charcoal transition-colors">Server Status</h3>
                      <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          <span className="text-[10px] font-bold text-green-600">Live</span>
                      </div>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                              <span>CPU Usage</span>
                              <span>32%</span>
                          </div>
                          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 w-[32%]"></div>
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                              <span>Memory</span>
                              <span>64%</span>
                          </div>
                          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 w-[64%]"></div>
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                              <span>Database</span>
                              <span>Healthy</span>
                          </div>
                          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 w-full"></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Mission Control');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  const renderContent = () => {
      switch(activeTab) {
          case 'User Management': return <UserManagement autoOpenCreate={isCreateUserOpen} />;
          case 'Permissions': return <Permissions />;
          case 'Configuration': return <SystemSettings />;
          case 'Audit Logs': return <AuditLogs />;
          case 'Courses': return <CourseManagement />;
          default: return <MissionControl handleTabChange={setActiveTab} triggerCreateUser={() => { setActiveTab('User Management'); setIsCreateUserOpen(true); }} />;
      }
  };

  return (
    <div className="pt-4">
      {/* Header & Sub-Nav */}
      <div className="mb-10 border-b border-stone-200 pb-0">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
            <div>
                <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">System Admin</div>
                <h1 className="text-4xl font-serif font-bold text-charcoal">Admin Console</h1>
            </div>
          </div>

          {/* Sub Nav */}
          <div className="flex gap-8 overflow-x-auto">
              {['Mission Control', 'User Management', 'Permissions', 'Configuration', 'Audit Logs', 'Courses'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setIsCreateUserOpen(false); }}
                    className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                        activeTab === tab ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
                    }`}
                  >
                      {tab === 'Mission Control' && <Activity size={14} />}
                      {tab === 'User Management' && <Users size={14} />}
                      {tab === 'Permissions' && <ShieldCheck size={14} />}
                      {tab === 'Configuration' && <Settings size={14} />}
                      {tab === 'Audit Logs' && <FileText size={14} />}
                      {tab === 'Courses' && <BookOpen size={14} />}
                      {tab}
                  </button>
              ))}
          </div>
      </div>

      {renderContent()}
    </div>
  );
};
