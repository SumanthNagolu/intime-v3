'use client';


import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { Search, Filter, Plus, MoreHorizontal, Mail, Shield, CheckCircle, XCircle, Edit3, Lock, Trash2, ChevronRight, Square, CheckSquare, Clock, History, ShieldAlert, ArrowLeft, ArrowRight, Unlock, ChevronDown, X } from 'lucide-react';
import { Employee } from '../../types';

interface UserManagementProps {
    autoOpenCreate?: boolean;
}

const ITEMS_PER_PAGE = 10;

export const UserManagement: React.FC<UserManagementProps> = ({ autoOpenCreate = false }) => {
  const { employees, addEmployee, updateEmployee } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Bulk Action State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'role' | 'dept' | 'deactivate' | null>(null);

  // Trigger modal if prop is passed
  useEffect(() => {
      if (autoOpenCreate) {
          setIsCreateModalOpen(true);
      }
  }, [autoOpenCreate]);

  // Filter Logic
  const filteredUsers = employees.filter(user => {
      const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'All' || 
                          (roleFilter === 'Recruiter' && user.role.includes('Recruiter')) ||
                          (roleFilter === 'HR Manager' && user.role.includes('HR')) ||
                          (roleFilter === 'Bench Sales' && user.role.includes('Bench')) ||
                          (roleFilter === 'Academy' && user.role.includes('Academy'));

      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleEditClick = (user: Employee) => {
      setSelectedUser(user);
      setIsEditModalOpen(true);
  };

  const handleLockClick = (e: React.MouseEvent, user: Employee) => {
      e.stopPropagation();
      const newStatus = user.status === 'Active' ? 'Terminated' : 'Active'; // Using Terminated/Active for simplicity or 'Inactive' if preferred
      updateEmployee({ ...user, status: newStatus });
  };

  const toggleSelection = (id: string) => {
      if (selectedIds.includes(id)) {
          setSelectedIds(prev => prev.filter(i => i !== id));
      } else {
          setSelectedIds(prev => [...prev, id]);
      }
  };

  const toggleSelectAll = () => {
      if (selectedIds.length === paginatedUsers.length) {
          setSelectedIds([]);
      } else {
          setSelectedIds(paginatedUsers.map(u => u.id));
      }
  };

  const handleBulkUpdate = (field: keyof Employee, value: string) => {
      selectedIds.forEach(id => {
          const user = employees.find(e => e.id === id);
          if (user) {
              updateEmployee({ ...user, [field]: value });
          }
      });
      setBulkActionType(null);
      setSelectedIds([]);
  };

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 flex justify-between items-end border-b border-stone-200 pb-6">
        <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Access Control</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">User Management</h1>
        </div>
        <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2"
        >
            <Plus size={16} /> Create New User
        </button>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="bg-white p-4 rounded-[2rem] border border-stone-200 shadow-lg mb-8 flex flex-col md:flex-row gap-4 items-center min-h-[88px]">
          {selectedIds.length > 0 ? (
              <div className="flex-1 flex items-center justify-between bg-stone-50 px-6 py-3 rounded-full border border-stone-200 animate-fade-in w-full">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedIds([])} className="p-1 hover:bg-stone-200 rounded-full"><X size={16} /></button>
                      <span className="text-sm font-bold text-charcoal">{selectedIds.length} Users Selected</span>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => setBulkActionType('role')} className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold hover:text-rust transition-colors shadow-sm">Assign Role</button>
                      <button onClick={() => setBulkActionType('dept')} className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold hover:text-rust transition-colors shadow-sm">Change Dept</button>
                      <button onClick={() => setBulkActionType('deactivate')} className="px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-xs font-bold text-red-600 hover:bg-red-100 transition-colors shadow-sm">Deactivate</button>
                  </div>
              </div>
          ) : (
              <>
                <div className="flex items-center gap-4 bg-stone-50 px-6 py-3 rounded-full flex-1 border border-stone-100 focus-within:ring-2 focus-within:ring-rust/20 transition-all">
                    <Search size={20} className="text-stone-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, email, or role..." 
                        className="bg-transparent outline-none w-full text-sm font-medium text-charcoal placeholder-stone-400"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative group">
                        <select 
                            value={roleFilter} 
                            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                            className="appearance-none bg-stone-50 border border-stone-200 rounded-full pl-6 pr-10 py-3 text-xs font-bold uppercase tracking-widest text-stone-500 focus:outline-none cursor-pointer hover:bg-stone-100 focus:border-rust transition-all"
                        >
                            <option value="All">All Roles</option>
                            <option value="Recruiter">Recruiter</option>
                            <option value="HR Manager">HR Manager</option>
                            <option value="Bench Sales">Bench Sales</option>
                            <option value="Academy">Academy</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    </div>
                    <div className="relative group">
                        <select 
                            value={statusFilter} 
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="appearance-none bg-stone-50 border border-stone-200 rounded-full pl-6 pr-10 py-3 text-xs font-bold uppercase tracking-widest text-stone-500 focus:outline-none cursor-pointer hover:bg-stone-100 focus:border-rust transition-all"
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Onboarding">Onboarding</option>
                            <option value="Terminated">Inactive</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    </div>
                </div>
              </>
          )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-stone-50 text-xs font-bold uppercase tracking-widest text-stone-400">
                    <tr>
                        <th className="p-6 w-16 text-center">
                            <button onClick={toggleSelectAll} className="text-stone-400 hover:text-charcoal">
                                {selectedIds.length === paginatedUsers.length && paginatedUsers.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}
                            </button>
                        </th>
                        <th className="p-6">Name</th>
                        <th className="p-6">Role & Dept</th>
                        <th className="p-6">Status</th>
                        <th className="p-6">Last Login</th>
                        <th className="p-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                    {paginatedUsers.map((user) => (
                        <tr 
                            key={user.id} 
                            onClick={() => handleEditClick(user)}
                            className={`hover:bg-stone-50 transition-colors group cursor-pointer ${selectedIds.includes(user.id) ? 'bg-stone-50' : ''}`}
                        >
                            <td className="p-6" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => toggleSelection(user.id)} className={`transition-colors ${selectedIds.includes(user.id) ? 'text-rust' : 'text-stone-300 hover:text-stone-400'}`}>
                                    {selectedIds.includes(user.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                                </button>
                            </td>
                            <td className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-stone-100 text-charcoal flex items-center justify-center font-bold font-serif border border-stone-200">
                                        {user.firstName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-charcoal text-sm">{user.firstName} {user.lastName}</div>
                                        <div className="text-xs text-stone-400">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-6">
                                <div className="font-bold text-sm text-stone-600">{user.role}</div>
                                <div className="text-xs text-stone-400">{user.department}</div>
                            </td>
                            <td className="p-6">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                    user.status === 'Active' ? 'bg-green-50 text-green-700' :
                                    user.status === 'Onboarding' ? 'bg-blue-50 text-blue-700' :
                                    'bg-stone-100 text-stone-500'
                                }`}>
                                    {user.status}
                                </span>
                            </td>
                            <td className="p-6 text-xs text-stone-500 font-mono">
                                2 hours ago
                            </td>
                            <td className="p-6 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditClick(user)} className="p-2 bg-white border border-stone-200 rounded-lg hover:border-charcoal hover:text-charcoal transition-colors text-stone-400" title="Edit">
                                        <Edit3 size={14} />
                                    </button>
                                    <button onClick={(e) => handleLockClick(e, user)} className={`p-2 bg-white border border-stone-200 rounded-lg transition-colors ${user.status !== 'Active' ? 'text-red-500 border-red-200' : 'text-stone-400 hover:border-red-400 hover:text-red-500'}`} title={user.status === 'Active' ? 'Deactivate' : 'Activate'}>
                                        {user.status === 'Active' ? <Lock size={14} /> : <Unlock size={14} />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-12 text-center text-stone-400 italic">No users found matching criteria.</td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {filteredUsers.length > 0 && (
              <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-between items-center">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} Users
                  </div>
                  <div className="flex gap-2">
                      <button 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-500 hover:text-charcoal disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                      >
                          <ChevronRight size={14} className="rotate-180" /> Prev
                      </button>
                      <div className="px-4 py-2 text-xs font-bold text-charcoal">
                          Page {currentPage}
                      </div>
                      <button 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-500 hover:text-charcoal disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                      >
                          Next <ChevronRight size={14} />
                      </button>
                  </div>
              </div>
          )}
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
          <CreateUserModal onClose={() => setIsCreateModalOpen(false)} onSave={addEmployee} />
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
          <EditUserModal user={selectedUser} onClose={() => setIsEditModalOpen(false)} onUpdate={updateEmployee} />
      )}

      {/* Bulk Action Modal */}
      {bulkActionType && (
          <BulkActionModal 
            type={bulkActionType} 
            count={selectedIds.length} 
            onClose={() => setBulkActionType(null)} 
            onConfirm={(val) => handleBulkUpdate(bulkActionType === 'role' ? 'role' : bulkActionType === 'dept' ? 'department' : 'status', val)} 
          />
      )}
    </div>
  );
};

const CreateUserModal: React.FC<{ onClose: () => void; onSave: (e: Employee) => void }> = ({ onClose, onSave }) => {
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', role: '', department: 'Recruiting', manager: '',
        phone: '', location: '', startDate: new Date().toISOString().split('T')[0], salary: '',
        bio: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: Employee = {
            id: `e${Date.now()}`,
            ...form,
            status: 'Onboarding',
            pod: 'Unassigned',
            department: form.department as any
        };
        onSave(newUser);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal"><XCircle size={24} /></button>
                
                <div className="mb-6 border-b border-stone-100 pb-4 shrink-0">
                    <h2 className="text-3xl font-serif font-bold text-charcoal mb-2">Create User</h2>
                    <p className="text-stone-500">Add a new member to the organization.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 flex-1">
                    {/* Section 1: Identity */}
                    <div>
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">Identity</h3>
                        <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-charcoal mb-2">First Name</label>
                                <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-charcoal mb-2">Last Name</label>
                                <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-charcoal mb-2">Email</label>
                                <input type="email" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-charcoal mb-2">Phone</label>
                                <input type="tel" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555)..." />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Role & Access */}
                    <div>
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">Role & Access</h3>
                        <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-charcoal mb-2">System Role</label>
                                <select 
                                    required 
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" 
                                    value={form.role} 
                                    onChange={e => setForm({...form, role: e.target.value})}
                                >
                                    <option value="">Select Role...</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Recruiter">Recruiter</option>
                                    <option value="HR Manager">HR Manager</option>
                                    <option value="Bench Sales">Bench Sales Lead</option>
                                    <option value="Training Specialist">Training Specialist</option>
                                    <option value="Sales Specialist">Sales Specialist</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-charcoal mb-2">Department</label>
                                <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                                    <option>Recruiting</option>
                                    <option>Bench Sales</option>
                                    <option>Engineering</option>
                                    <option>HR</option>
                                    <option>Product</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Employment */}
                    <div>
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">Employment Details</h3>
                        <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-charcoal mb-2">Start Date</label>
                                <input type="date" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-charcoal mb-2">Location</label>
                                <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="City, State or Remote" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-charcoal mb-2">Manager</label>
                                <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.manager} onChange={e => setForm({...form, manager: e.target.value})}>
                                    <option value="">Select Manager...</option>
                                    <option value="David Kim">David Kim</option>
                                    <option value="Elena Rodriguez">Elena Rodriguez</option>
                                    <option value="James Wilson">James Wilson</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-charcoal mb-2">Base Salary</label>
                                <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="$0.00" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-charcoal mb-2">Notes / Bio</label>
                            <textarea className="w-full h-20 p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust resize-none" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-rust rounded border-stone-300 focus:ring-rust" />
                        <label className="text-sm text-blue-800">Send welcome email with temporary password</label>
                    </div>

                    <button type="submit" className="w-full py-4 bg-charcoal text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-rust transition-all shadow-lg">
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

const EditUserModal: React.FC<{ user: Employee; onClose: () => void; onUpdate: (e: Employee) => void }> = ({ user, onClose, onUpdate }) => {
    const [showHistory, setShowHistory] = useState(false);
    const [formData, setFormData] = useState(user);

    const handleSave = () => {
        onUpdate(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal"><XCircle size={24} /></button>
                
                <div className="mb-8 border-b border-stone-100 pb-6">
                    <h2 className="text-3xl font-serif font-bold text-charcoal mb-2">Edit User</h2>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                        <span className="font-bold text-charcoal">{user.firstName} {user.lastName}</span>
                        <span>•</span>
                        <span>{user.email}</span>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2">
                    {!showHistory ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Role</label>
                                    <select 
                                        value={formData.role} 
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust"
                                    >
                                        <option value="Recruiter">Recruiter</option>
                                        <option value="Bench Sales Lead">Bench Sales Lead</option>
                                        <option value="HR Manager">HR Manager</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Department</label>
                                    <input value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value as any})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Manager</label>
                                <select 
                                    value={formData.manager} 
                                    onChange={(e) => setFormData({...formData, manager: e.target.value})}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust"
                                >
                                    <option value="David Kim">David Kim</option>
                                    <option value="Elena Rodriguez">Elena Rodriguez</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Status</label>
                                <select 
                                    value={formData.status} 
                                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Onboarding">Onboarding</option>
                                    <option value="Terminated">Inactive (Terminated)</option>
                                </select>
                            </div>

                            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-charcoal text-sm">Security Audit</div>
                                    <div className="text-xs text-stone-500">Last login: 2 hours ago from 192.168.1.45</div>
                                </div>
                                <button onClick={() => setShowHistory(true)} className="text-xs font-bold text-rust uppercase tracking-widest hover:underline flex items-center gap-1">
                                    <History size={12} /> View Login History
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <button onClick={() => setShowHistory(false)} className="text-xs font-bold text-stone-400 hover:text-charcoal uppercase tracking-widest mb-4 flex items-center gap-1">
                                <ChevronRight size={12} className="rotate-180" /> Back to Details
                            </button>
                            <h3 className="font-bold text-charcoal mb-4 text-sm uppercase tracking-widest">Login History</h3>
                            <div className="space-y-2">
                                {[
                                    { date: 'Nov 24, 2025 09:15 AM', ip: '192.168.1.45', status: 'Success' },
                                    { date: 'Nov 23, 2025 04:45 PM', ip: '192.168.1.45', status: 'Success' },
                                    { date: 'Nov 22, 2025 10:30 AM', ip: '203.0.113.42', status: 'Failed (Wrong Password)', alert: true },
                                    { date: 'Nov 22, 2025 10:32 AM', ip: '192.168.1.45', status: 'Success' },
                                ].map((log, i) => (
                                    <div key={i} className={`flex justify-between items-center p-3 rounded-lg border ${log.alert ? 'bg-red-50 border-red-100' : 'bg-stone-50 border-stone-100'}`}>
                                        <div className="flex items-center gap-3">
                                            <Clock size={14} className={log.alert ? 'text-red-500' : 'text-stone-400'} />
                                            <span className="text-sm font-mono text-stone-600">{log.date}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xs font-bold ${log.alert ? 'text-red-600' : 'text-green-600'}`}>{log.status}</div>
                                            <div className="text-[10px] text-stone-400 font-mono">{log.ip}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-stone-100 flex justify-between items-center mt-6">
                    <button className="text-xs font-bold text-stone-400 hover:text-charcoal uppercase tracking-widest flex items-center gap-1">
                        <Lock size={12} /> Reset Password
                    </button>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Cancel</button>
                        <button onClick={handleSave} className="px-8 py-3 bg-charcoal text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-rust transition-all shadow-lg">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BulkActionModal: React.FC<{ type: 'role' | 'dept' | 'deactivate', count: number, onClose: () => void, onConfirm: (value: string) => void }> = ({ type, count, onClose, onConfirm }) => {
    const [value, setValue] = useState('');

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal"><XCircle size={24} /></button>
                
                <h3 className="text-xl font-serif font-bold text-charcoal mb-4">
                    {type === 'role' && 'Assign Role'}
                    {type === 'dept' && 'Change Department'}
                    {type === 'deactivate' && 'Deactivate Users'}
                </h3>
                
                <p className="text-stone-500 text-sm mb-6">
                    You are about to update <strong>{count} users</strong>. This action cannot be undone.
                </p>

                {type === 'role' && (
                    <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl mb-6" onChange={e => setValue(e.target.value)}>
                        <option value="">Select Role...</option>
                        <option value="Recruiter">Recruiter</option>
                        <option value="HR Manager">HR Manager</option>
                        <option value="Bench Sales">Bench Sales</option>
                    </select>
                )}

                {type === 'dept' && (
                    <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl mb-6" onChange={e => setValue(e.target.value)}>
                        <option value="">Select Department...</option>
                        <option value="Recruiting">Recruiting</option>
                        <option value="HR">HR</option>
                        <option value="Engineering">Engineering</option>
                    </select>
                )}

                {type === 'deactivate' && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-600 text-sm mb-6 flex gap-2">
                        <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                        These users will lose access immediately.
                    </div>
                )}

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Cancel</button>
                    <button 
                        onClick={() => onConfirm(type === 'deactivate' ? 'Terminated' : value)}
                        disabled={type !== 'deactivate' && !value}
                        className="flex-1 py-3 bg-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rust transition-all shadow-lg disabled:opacity-50"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
