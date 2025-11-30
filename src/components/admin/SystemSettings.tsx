'use client';


import React, { useState } from 'react';
import { Settings, Shield, Globe, Database, Save, ToggleLeft, ToggleRight, RefreshCw, Check, Loader2 } from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'General' | 'Auth' | 'Integrations' | 'Backup'>('General');

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Configuration</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">System Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Tabs */}
          <div className="lg:w-64 shrink-0 space-y-2">
              {([
                  { id: 'General' as const, icon: Settings },
                  { id: 'Auth' as const, icon: Shield },
                  { id: 'Integrations' as const, icon: Globe },
                  { id: 'Backup' as const, icon: Database }
              ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                        activeTab === tab.id
                        ? 'bg-charcoal text-white shadow-lg'
                        : 'bg-white text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                      <tab.icon size={16} /> {tab.id}
                  </button>
              ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-[2.5rem] border border-stone-200 shadow-xl p-10 min-h-[600px]">
              {activeTab === 'General' && <GeneralSettings />}
              {activeTab === 'Auth' && <AuthSettings />}
              {activeTab === 'Integrations' && <IntegrationSettings />}
              {activeTab === 'Backup' && <BackupSettings />}
          </div>
      </div>
    </div>
  );
};

const GeneralSettings: React.FC = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [companyName, setCompanyName] = useState('InTime Solutions');
    const [supportEmail, setSupportEmail] = useState('support@intime.com');

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h3 className="text-xl font-serif font-bold text-charcoal mb-6">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Company Name</label>
                        <input 
                            value={companyName} 
                            onChange={e => setCompanyName(e.target.value)}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-charcoal font-bold focus:outline-none focus:border-rust" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Support Email</label>
                        <input 
                            value={supportEmail} 
                            onChange={e => setSupportEmail(e.target.value)}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-charcoal font-bold focus:outline-none focus:border-rust" 
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-stone-100 pt-8">
                <h3 className="text-xl font-serif font-bold text-charcoal mb-6">Localization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Timezone</label>
                        <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-charcoal font-bold outline-none focus:border-rust">
                            <option>UTC (GMT+00:00)</option>
                            <option>EST (GMT-05:00)</option>
                            <option>PST (GMT-08:00)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Language</label>
                        <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-charcoal font-bold outline-none focus:border-rust">
                            <option>English (US)</option>
                            <option>Spanish</option>
                            <option>French</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-8">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${
                        saved ? 'bg-green-600 text-white' : 'bg-charcoal text-white hover:bg-rust'
                    }`}
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                    {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

const AuthSettings: React.FC = () => {
    const [minLength, setMinLength] = useState(12);
    const [specialChars, setSpecialChars] = useState(true);
    const [mfa, setMfa] = useState(true);

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h3 className="text-xl font-serif font-bold text-charcoal mb-6">Password Policy</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                        <div>
                            <div className="font-bold text-charcoal text-sm">Minimum Length</div>
                            <div className="text-xs text-stone-500">Enforce character count</div>
                        </div>
                        <input 
                            type="number" 
                            value={minLength} 
                            onChange={e => setMinLength(parseInt(e.target.value))}
                            className="w-20 p-2 bg-white border border-stone-200 rounded-lg text-center font-bold focus:outline-none focus:border-rust" 
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                        <div>
                            <div className="font-bold text-charcoal text-sm">Require Special Characters</div>
                            <div className="text-xs text-stone-500">Increase complexity</div>
                        </div>
                        <button onClick={() => setSpecialChars(!specialChars)} className={`transition-colors ${specialChars ? 'text-green-600' : 'text-stone-300'}`}>
                            {specialChars ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="border-t border-stone-100 pt-8">
                <h3 className="text-xl font-serif font-bold text-charcoal mb-6">Multi-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div>
                        <div className="font-bold text-blue-900 text-sm">Enforce 2FA for Admins</div>
                        <div className="text-xs text-blue-700">Mandatory for roles with system access</div>
                    </div>
                    <button onClick={() => setMfa(!mfa)} className={`transition-colors ${mfa ? 'text-blue-600' : 'text-blue-300'}`}>
                        {mfa ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

const IntegrationSettings: React.FC = () => {
    const [integrations, setIntegrations] = useState([
        { id: 1, name: 'Slack', status: 'Connected', desc: 'Notifications & Alerts', color: 'bg-purple-50 text-purple-700 border-purple-100' },
        { id: 2, name: 'Google Workspace', status: 'Connected', desc: 'SSO & Calendar', color: 'bg-blue-50 text-blue-700 border-blue-100' },
        { id: 3, name: 'ADP Workforce', status: 'Disconnected', desc: 'Payroll Sync', color: 'bg-stone-50 text-stone-500 border-stone-200' },
    ]);

    const toggleConnect = (id: number) => {
        setIntegrations(prev => prev.map(int => {
            if (int.id === id) {
                const isConnected = int.status === 'Connected';
                return {
                    ...int,
                    status: isConnected ? 'Disconnected' : 'Connected',
                    color: isConnected ? 'bg-stone-50 text-stone-500 border-stone-200' : (int.name === 'Slack' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100')
                };
            }
            return int;
        }));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-serif font-bold text-charcoal mb-6">Connected Services</h3>
            
            {integrations.map((integration) => (
                <div key={integration.id} className={`flex items-center justify-between p-6 rounded-2xl border ${integration.color}`}>
                    <div>
                        <h4 className="font-bold text-lg mb-1">{integration.name}</h4>
                        <p className="text-xs opacity-80 uppercase tracking-widest font-bold">{integration.desc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold uppercase tracking-widest">{integration.status}</span>
                        <button 
                            onClick={() => toggleConnect(integration.id)}
                            className="px-4 py-2 bg-white rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all border border-transparent"
                        >
                            {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const BackupSettings: React.FC = () => {
    const [lastBackup, setLastBackup] = useState('Today, 04:00 AM');
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [autoBackup, setAutoBackup] = useState(true);

    const handleManualBackup = () => {
        setIsBackingUp(true);
        setTimeout(() => {
            setIsBackingUp(false);
            setLastBackup(`Today, ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
        }, 2000);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Last Backup</h3>
                    <div className="text-4xl font-serif font-bold mb-2">{lastBackup}</div>
                    <p className="text-xs text-stone-400 uppercase tracking-widest">Size: 1.2 GB • Status: Success</p>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-serif font-bold text-charcoal mb-6">Schedule</h3>
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 flex justify-between items-center">
                    <div>
                        <div className="font-bold text-charcoal">Automatic Daily Backup</div>
                        <div className="text-xs text-stone-500 mt-1">Runs at 04:00 UTC</div>
                    </div>
                    <button onClick={() => setAutoBackup(!autoBackup)} className={`transition-colors ${autoBackup ? 'text-green-600' : 'text-stone-300'}`}>
                        {autoBackup ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                </div>
            </div>

            <button 
                onClick={handleManualBackup}
                disabled={isBackingUp}
                className="w-full py-4 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 font-bold text-xs uppercase tracking-widest hover:border-charcoal hover:text-charcoal transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isBackingUp ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                {isBackingUp ? 'Running Backup...' : 'Run Manual Backup Now'}
            </button>
        </div>
    );
};
