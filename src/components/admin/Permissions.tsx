'use client';


import React, { useState } from 'react';
import { Shield, Lock, Check, Plus, ChevronRight, Users, ChevronDown, Eye, Edit2, Trash2, X, Search, User } from 'lucide-react';

export const Permissions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Roles' | 'User Overrides'>('Roles');
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [viewRoleDetail, setViewRoleDetail] = useState<any | null>(null);

  // Use a mock list of roles to coordinate between components if needed
  const roles = [
      { name: 'Admin', desc: 'Full system access', users: 2, color: 'bg-stone-900 text-white' },
      { name: 'Recruiter', desc: 'Manage jobs, candidates, and pipeline', users: 12, color: 'bg-white text-charcoal border border-stone-200' },
      { name: 'HR Manager', desc: 'Employee directory, payroll, and onboarding', users: 3, color: 'bg-white text-charcoal border border-stone-200' },
      { name: 'Bench Sales', desc: 'Consultant marketing and placement', users: 5, color: 'bg-white text-charcoal border border-stone-200' },
      { name: 'Training Specialist', desc: 'Course creation and student grading', users: 2, color: 'bg-white text-charcoal border border-stone-200' },
  ];

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Security</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Permissions & Roles</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-stone-100 mb-8">
          {['Roles', 'User Overrides'].map(tab => (
              <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
                     activeTab === tab ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
                 }`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {activeTab === 'Roles' ? (
          <RolesView 
            roles={roles}
            onCreate={() => setIsCreateRoleOpen(true)} 
            onEdit={(role) => { setSelectedRole(role); setIsCreateRoleOpen(true); }}
            onView={(role) => setViewRoleDetail(role)}
          />
      ) : (
          <UserOverridesView />
      )}

      {isCreateRoleOpen && (
          <RoleModal 
            isOpen={isCreateRoleOpen} 
            onClose={() => { setIsCreateRoleOpen(false); setSelectedRole(null); }} 
            editRole={selectedRole}
          />
      )}

      {viewRoleDetail && (
          <RoleDetailModal 
            isOpen={!!viewRoleDetail} 
            onClose={() => setViewRoleDetail(null)} 
            role={viewRoleDetail} 
          />
      )}
    </div>
  );
};

const RolesView: React.FC<{ roles: any[], onCreate: () => void, onEdit: (role: string) => void, onView: (role: any) => void }> = ({ roles, onCreate, onEdit, onView }) => {
    return (
        <div>
            <div className="flex justify-end mb-8">
                <button 
                    onClick={onCreate}
                    className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2"
                >
                    <Plus size={16} /> Create New Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role, i) => (
                    <div 
                        key={i} 
                        onClick={() => onView(role)}
                        className={`p-8 rounded-[2rem] shadow-lg transition-all group relative cursor-pointer ${role.color}`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-stone-100/10 flex items-center justify-center backdrop-blur-sm">
                                <Shield size={24} className={role.name === 'Admin' ? 'text-rust' : 'text-stone-400'} />
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold opacity-60 uppercase tracking-widest">
                                <Users size={14} /> {role.users} Users
                            </div>
                        </div>
                        
                        <h3 className="text-2xl font-serif font-bold mb-2">{role.name}</h3>
                        <p className={`text-sm mb-8 ${role.name === 'Admin' ? 'text-stone-400' : 'text-stone-500'}`}>
                            {role.desc}
                        </p>

                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(role.name); }}
                            className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${
                                role.name === 'Admin' 
                                ? 'bg-white text-charcoal hover:bg-rust hover:text-white' 
                                : 'bg-stone-50 text-charcoal hover:bg-stone-100'
                            }`}
                        >
                            Edit Permissions
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UserOverridesView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddOverrideOpen, setIsAddOverrideOpen] = useState(false);
    
    const overrides = [
        { user: 'Sarah Lao', role: 'Recruiter', override: 'Can View Salaries', status: 'Active' },
        { user: 'James Wilson', role: 'Bench Sales', override: 'Can Edit Courses', status: 'Active' }
    ];

    const filteredOverrides = overrides.filter(o => 
        o.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-xl p-8 min-h-[500px]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4 bg-stone-50 px-6 py-3 rounded-full border border-stone-100 focus-within:ring-2 focus-within:ring-rust/20 w-full md:w-96">
                    <Search size={20} className="text-stone-400" />
                    <input 
                        type="text" 
                        placeholder="Search user for overrides..." 
                        className="bg-transparent outline-none w-full text-sm font-medium text-charcoal placeholder-stone-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <p className="text-xs text-stone-400 italic">
                    Overrides grant additional permissions on top of the base role.
                </p>
            </div>

            <div className="space-y-4">
                {filteredOverrides.map((u, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 group hover:border-rust/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-serif font-bold text-charcoal border border-stone-200">
                                {u.user.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-charcoal text-sm">{u.user}</div>
                                <div className="text-xs text-stone-500">Base Role: {u.role}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Override</div>
                                <div className="text-xs font-bold text-rust">{u.override}</div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 bg-white border border-stone-200 rounded-lg hover:text-charcoal text-stone-400"><Edit2 size={14}/></button>
                                <button className="p-2 bg-white border border-stone-200 rounded-lg hover:text-red-500 text-stone-400"><Trash2 size={14}/></button>
                            </div>
                        </div>
                    </div>
                ))}
                
                <button 
                    onClick={() => setIsAddOverrideOpen(true)}
                    className="w-full py-4 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs font-bold uppercase tracking-widest hover:border-rust hover:text-rust hover:bg-rust/5 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={16} /> Add Override
                </button>
            </div>

            {isAddOverrideOpen && <AddOverrideModal onClose={() => setIsAddOverrideOpen(false)} />}
        </div>
    );
};

const AddOverrideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal"><X size={24}/></button>
                <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Add User Override</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">User</label>
                        <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl">
                            <option>Select User...</option>
                            <option>David Kim</option>
                            <option>Sarah Lao</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Permission to Grant</label>
                        <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl">
                            <option>View Salaries</option>
                            <option>Edit Courses</option>
                            <option>Approve Expenses</option>
                        </select>
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Cancel</button>
                    <button onClick={onClose} className="flex-1 py-3 bg-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rust transition-all shadow-lg">Save Override</button>
                </div>
            </div>
        </div>
    )
}

const RoleDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; role: any }> = ({ isOpen, onClose, role }) => {
    const [tab, setTab] = useState<'Users' | 'Permissions'>('Users');

    if (!isOpen || !role) return null;

    // Mock Users
    const assignedUsers = [
        { name: 'John Doe', dept: 'Recruiting', email: 'john@example.com' },
        { name: 'Jane Smith', dept: 'Recruiting', email: 'jane@example.com' },
    ];

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-3xl rounded-[2.5rem] p-10 shadow-2xl relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal"><X size={24}/></button>
                
                <div className="mb-8 border-b border-stone-100 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-stone-100 rounded-lg text-charcoal"><Shield size={20} /></div>
                        <h2 className="text-3xl font-serif font-bold text-charcoal">{role.name}</h2>
                    </div>
                    <p className="text-stone-500">{role.desc}</p>
                </div>

                <div className="flex gap-4 mb-6">
                    <button onClick={() => setTab('Users')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${tab === 'Users' ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-500'}`}>Assigned Users</button>
                    <button onClick={() => setTab('Permissions')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${tab === 'Permissions' ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-500'}`}>Permissions</button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    {tab === 'Users' ? (
                        <div className="space-y-3">
                            {assignedUsers.map((u, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-charcoal shadow-sm">{u.name.charAt(0)}</div>
                                        <div>
                                            <div className="font-bold text-charcoal text-sm">{u.name}</div>
                                            <div className="text-xs text-stone-500">{u.email}</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{u.dept}</span>
                                </div>
                            ))}
                            <div className="text-center p-4 text-stone-400 text-sm italic">Total {assignedUsers.length} users assigned to this role.</div>
                        </div>
                    ) : (
                        <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 text-center text-stone-500">
                            <Lock size={32} className="mx-auto mb-4 text-stone-300" />
                            <p>Read-only view of permissions. To edit, use the "Edit Permissions" action.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const RoleModal: React.FC<{ isOpen: boolean; onClose: () => void; editRole: string | null }> = ({ isOpen, onClose, editRole }) => {
    const [expandedModule, setExpandedModule] = useState<string | null>('Academy');

    const permissionTree = [
        {
            module: 'Academy',
            features: [
                { name: 'View Courses', type: 'read' },
                { name: 'Enroll Students', type: 'write' },
                { name: 'Grade Assignments', type: 'write' },
            ]
        },
        {
            module: 'Recruiting',
            features: [
                { name: 'View Jobs', type: 'read' },
                { name: 'Create Jobs', type: 'write' },
                { name: 'Submit Candidates', type: 'write' },
            ]
        },
        {
            module: 'HR',
            features: [
                { name: 'View Employees', type: 'read' },
                { name: 'Edit Employees', type: 'write' },
                { name: 'Approve Time Off', type: 'approve' },
            ]
        }
    ];

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] p-10 shadow-2xl relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal"><X size={24} /></button>
                
                <div className="mb-8 border-b border-stone-100 pb-6">
                    <h2 className="text-3xl font-serif font-bold text-charcoal mb-2">{editRole ? `Edit Role: ${editRole}` : 'Create New Role'}</h2>
                    <p className="text-stone-500">Define functional access levels.</p>
                </div>

                <div className="grid grid-cols-3 gap-8 flex-1 overflow-hidden">
                    {/* Role Details */}
                    <div className="col-span-1 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Role Name</label>
                            <input defaultValue={editRole || ''} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust font-bold text-charcoal" placeholder="e.g. Junior Recruiter" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Description</label>
                            <textarea className="w-full h-32 p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust resize-none text-sm" placeholder="Describe the role's purpose..." />
                        </div>
                    </div>

                    {/* Permission Tree */}
                    <div className="col-span-2 bg-stone-50 rounded-2xl p-6 border border-stone-200 overflow-y-auto">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Permissions Tree</h3>
                        <div className="space-y-4">
                            {permissionTree.map((mod) => (
                                <div key={mod.module} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                                    <button 
                                        onClick={() => setExpandedModule(expandedModule === mod.module ? null : mod.module)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
                                    >
                                        <span className="font-bold text-charcoal text-sm">{mod.module} Module</span>
                                        <ChevronDown size={16} className={`transition-transform text-stone-400 ${expandedModule === mod.module ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {expandedModule === mod.module && (
                                        <div className="border-t border-stone-100 p-4 space-y-3">
                                            {mod.features.map((feat, i) => (
                                                <div key={i} className="flex items-center justify-between pl-4 border-l-2 border-stone-100">
                                                    <span className="text-sm text-stone-600">{feat.name}</span>
                                                    <div className="flex gap-2">
                                                        {['Read', 'Write', 'Delete', 'Approve'].map(action => (
                                                            <label key={action} className="flex items-center gap-1.5 cursor-pointer group">
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                                    // Mock pre-checked logic
                                                                    (editRole === 'Admin' || (action === 'Read')) 
                                                                    ? 'bg-rust border-rust text-white' 
                                                                    : 'bg-white border-stone-300 group-hover:border-stone-400'
                                                                }`}>
                                                                    { (editRole === 'Admin' || (action === 'Read')) && <Check size={10} /> }
                                                                </div>
                                                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider select-none">{action}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Cancel</button>
                    <button onClick={onClose} className="px-8 py-3 bg-charcoal text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-rust transition-all shadow-lg">Save Changes</button>
                </div>
            </div>
        </div>
    );
};
