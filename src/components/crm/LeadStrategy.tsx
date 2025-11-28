'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, MessageSquare, Target, Users, Swords, Trophy, 
  Plus, Trash2, Save, Edit3, Loader2, ChevronDown, ChevronRight,
  AlertCircle, CheckCircle, HelpCircle, XCircle
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { v4 as uuidv4 } from 'uuid';
import type { 
  TalkingPoint, 
  Objection, 
  Stakeholder, 
  Competitor,
} from '@/lib/db/schema/strategy';

interface LeadStrategyProps {
  leadId: string;
  companyName?: string;
}

// Collapsible Section Component
function Section({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true,
  badge,
  actions 
}: { 
  title: string; 
  icon: React.ComponentType<{ size?: number; className?: string }>; 
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
  actions?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-stone-50/50 hover:bg-stone-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-rust" />
          <span className="text-sm font-bold uppercase tracking-widest text-charcoal">{title}</span>
          {badge !== undefined && (
            <span className="px-2 py-0.5 bg-rust/10 text-rust text-xs font-bold rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions && <div onClick={e => e.stopPropagation()}>{actions}</div>}
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>
      {isOpen && <div className="p-6 border-t border-stone-100">{children}</div>}
    </div>
  );
}

export function LeadStrategy({ leadId, companyName }: LeadStrategyProps) {
  // ═══════════════════════════════════════════════════════════════
  // ALL HOOKS MUST BE DECLARED AT THE TOP - BEFORE ANY EARLY RETURNS
  // ═══════════════════════════════════════════════════════════════
  
  // Fetch strategy data
  const { data: strategy, isLoading, refetch } = trpc.strategy.get.useQuery({ leadId });
  
  // Mutations
  const upsertStrategy = trpc.strategy.upsert.useMutation({
    onSuccess: () => refetch(),
  });
  const updateTalkingPoints = trpc.strategy.updateTalkingPoints.useMutation({
    onSuccess: () => refetch(),
  });
  const updateStakeholders = trpc.strategy.updateStakeholders.useMutation({
    onSuccess: () => refetch(),
  });
  const updateObjections = trpc.strategy.updateObjections.useMutation({
    onSuccess: () => refetch(),
  });
  const updateCompetitors = trpc.strategy.updateCompetitors.useMutation({
    onSuccess: () => refetch(),
  });
  
  // Local state for Strategy Notes
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  
  // Local state for Value Proposition
  const [editingValue, setEditingValue] = useState(false);
  const [valuePropositionText, setValuePropositionText] = useState('');
  
  // Local state for Talking Points
  const [editingTalkingPoints, setEditingTalkingPoints] = useState(false);
  const [talkingPointsLocal, setTalkingPointsLocal] = useState<TalkingPoint[]>([]);
  
  // Local state for Stakeholders
  const [stakeholdersLocal, setStakeholdersLocal] = useState<Stakeholder[]>([]);
  const [editingStakeholders, setEditingStakeholders] = useState(false);
  
  // Local state for Objections
  const [objectionsLocal, setObjectionsLocal] = useState<Objection[]>([]);
  const [editingObjections, setEditingObjections] = useState(false);
  
  // Local state for Competitors
  const [competitorsLocal, setCompetitorsLocal] = useState<Competitor[]>([]);
  const [editingCompetitors, setEditingCompetitors] = useState(false);
  
  // Initialize all local state when data loads
  useEffect(() => {
    if (strategy) {
      setNotesValue(strategy.strategyNotes || '');
      setValuePropositionText(strategy.valueProposition || '');
      setTalkingPointsLocal((strategy.talkingPoints as TalkingPoint[]) || []);
      setStakeholdersLocal((strategy.stakeholders as Stakeholder[]) || []);
      setObjectionsLocal((strategy.objections as Objection[]) || []);
      setCompetitorsLocal((strategy.competitors as Competitor[]) || []);
    }
  }, [strategy]);
  
  // ═══════════════════════════════════════════════════════════════
  // NOW WE CAN HAVE EARLY RETURNS
  // ═══════════════════════════════════════════════════════════════
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-rust" size={32} />
      </div>
    );
  }
  
  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════
  
  const handleSaveNotes = () => {
    upsertStrategy.mutate({ leadId, strategyNotes: notesValue });
    setEditingNotes(false);
  };
  
  const handleSaveValue = () => {
    upsertStrategy.mutate({ leadId, valueProposition: valuePropositionText });
    setEditingValue(false);
  };
  
  // Talking Points handlers
  const handleAddTalkingPoint = () => {
    const newPoint: TalkingPoint = {
      id: uuidv4(),
      title: 'New Talking Point',
      description: 'Description...',
      order: talkingPointsLocal.length + 1,
    };
    setTalkingPointsLocal([...talkingPointsLocal, newPoint]);
    setEditingTalkingPoints(true);
  };
  
  const handleUpdateTalkingPoint = (id: string, field: 'title' | 'description', value: string) => {
    setTalkingPointsLocal(points => 
      points.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
  };
  
  const handleDeleteTalkingPoint = (id: string) => {
    setTalkingPointsLocal(points => points.filter(p => p.id !== id));
  };
  
  const handleSaveTalkingPoints = () => {
    updateTalkingPoints.mutate({ leadId, talkingPoints: talkingPointsLocal });
    setEditingTalkingPoints(false);
  };
  
  // Stakeholder handlers
  const handleAddStakeholder = () => {
    const newStakeholder: Stakeholder = {
      id: uuidv4(),
      name: '',
      role: '',
      influence: 'medium',
      stance: 'neutral',
    };
    setStakeholdersLocal([...stakeholdersLocal, newStakeholder]);
    setEditingStakeholders(true);
  };
  
  const handleUpdateStakeholder = (id: string, field: keyof Stakeholder, value: string) => {
    setStakeholdersLocal(s => 
      s.map(sh => sh.id === id ? { ...sh, [field]: value } : sh)
    );
  };
  
  const handleDeleteStakeholder = (id: string) => {
    setStakeholdersLocal(s => s.filter(sh => sh.id !== id));
  };
  
  const handleSaveStakeholders = () => {
    updateStakeholders.mutate({ leadId, stakeholders: stakeholdersLocal });
    setEditingStakeholders(false);
  };
  
  // Objection handlers
  const handleAddObjection = () => {
    const newObjection: Objection = {
      id: uuidv4(),
      objection: '',
      response: '',
    };
    setObjectionsLocal([...objectionsLocal, newObjection]);
    setEditingObjections(true);
  };
  
  const handleUpdateObjection = (id: string, field: 'objection' | 'response', value: string) => {
    setObjectionsLocal(o => 
      o.map(obj => obj.id === id ? { ...obj, [field]: value } : obj)
    );
  };
  
  const handleDeleteObjection = (id: string) => {
    setObjectionsLocal(o => o.filter(obj => obj.id !== id));
  };
  
  const handleSaveObjections = () => {
    updateObjections.mutate({ leadId, objections: objectionsLocal });
    setEditingObjections(false);
  };
  
  // Competitor handlers
  const handleAddCompetitor = () => {
    const newCompetitor: Competitor = {
      id: uuidv4(),
      name: '',
      theirStrengths: [],
      ourAdvantages: [],
    };
    setCompetitorsLocal([...competitorsLocal, newCompetitor]);
    setEditingCompetitors(true);
  };
  
  const handleSaveCompetitors = () => {
    updateCompetitors.mutate({ leadId, competitors: competitorsLocal });
    setEditingCompetitors(false);
  };
  
  // Stance icons
  const stanceIcons: Record<string, React.ReactNode> = {
    champion: <Trophy size={14} className="text-green-600" />,
    supporter: <CheckCircle size={14} className="text-blue-600" />,
    neutral: <HelpCircle size={14} className="text-stone-500" />,
    skeptic: <AlertCircle size={14} className="text-amber-600" />,
    blocker: <XCircle size={14} className="text-red-600" />,
  };
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  
  return (
    <div className="space-y-4">
      {/* Strategy Notes */}
      <Section 
        title="Sales Strategy & Notes" 
        icon={FileText}
        actions={
          editingNotes ? (
            <button
              onClick={handleSaveNotes}
              disabled={upsertStrategy.isPending}
              className="px-3 py-1 bg-charcoal text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1"
            >
              {upsertStrategy.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save
            </button>
          ) : (
            <button
              onClick={() => setEditingNotes(true)}
              className="px-3 py-1 bg-stone-200 text-stone-600 rounded-lg text-xs font-bold uppercase flex items-center gap-1 hover:bg-stone-300"
            >
              <Edit3 size={12} /> Edit
            </button>
          )
        }
      >
        {editingNotes ? (
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            className="w-full h-48 p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
            placeholder="Document your overall sales strategy, approach, and key insights about this lead..."
          />
        ) : (
          <div className="bg-stone-50 rounded-xl p-4 min-h-[100px]">
            {notesValue ? (
              <p className="text-sm text-stone-600 whitespace-pre-wrap">{notesValue}</p>
            ) : (
              <p className="text-sm text-stone-400 italic">No strategy notes yet. Click Edit to add.</p>
            )}
          </div>
        )}
      </Section>
      
      {/* Talking Points */}
      <Section 
        title="Talking Points" 
        icon={MessageSquare}
        badge={talkingPointsLocal.length}
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleAddTalkingPoint}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase flex items-center gap-1"
            >
              <Plus size={12} /> Add
            </button>
            {editingTalkingPoints && (
              <button
                onClick={handleSaveTalkingPoints}
                disabled={updateTalkingPoints.isPending}
                className="px-3 py-1 bg-charcoal text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1"
              >
                {updateTalkingPoints.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save
              </button>
            )}
          </div>
        }
      >
        <div className="space-y-3">
          {talkingPointsLocal.map((point, index) => (
            <div key={point.id} className="flex items-start gap-3 group">
              <div className="w-7 h-7 bg-rust/10 text-rust rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                {index + 1}
              </div>
              {editingTalkingPoints ? (
                <div className="flex-1 space-y-2">
                  <input
                    value={point.title}
                    onChange={(e) => handleUpdateTalkingPoint(point.id, 'title', e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-medium focus:outline-none focus:border-rust"
                    placeholder="Title"
                  />
                  <input
                    value={point.description}
                    onChange={(e) => handleUpdateTalkingPoint(point.id, 'description', e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-rust"
                    placeholder="Description"
                  />
                </div>
              ) : (
                <div>
                  <div className="font-medium text-charcoal text-sm">{point.title}</div>
                  <div className="text-xs text-stone-500">{point.description}</div>
                </div>
              )}
              {editingTalkingPoints && (
                <button
                  onClick={() => handleDeleteTalkingPoint(point.id)}
                  className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {talkingPointsLocal.length === 0 && (
            <p className="text-sm text-stone-400 italic text-center py-4">
              No talking points yet. Click Add to create your key messages.
            </p>
          )}
        </div>
      </Section>
      
      {/* Value Proposition */}
      <Section 
        title="Value Proposition" 
        icon={Target}
        actions={
          editingValue ? (
            <button
              onClick={handleSaveValue}
              disabled={upsertStrategy.isPending}
              className="px-3 py-1 bg-charcoal text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1"
            >
              {upsertStrategy.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save
            </button>
          ) : (
            <button
              onClick={() => setEditingValue(true)}
              className="px-3 py-1 bg-stone-200 text-stone-600 rounded-lg text-xs font-bold uppercase flex items-center gap-1 hover:bg-stone-300"
            >
              <Edit3 size={12} /> Edit
            </button>
          )
        }
      >
        {editingValue ? (
          <textarea
            value={valuePropositionText}
            onChange={(e) => setValuePropositionText(e.target.value)}
            className="w-full h-32 p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
            placeholder={`Why should ${companyName || 'this company'} choose us? What unique value do we bring?`}
          />
        ) : (
          <div className="bg-stone-50 rounded-xl p-4 min-h-[80px]">
            {valuePropositionText ? (
              <p className="text-sm text-stone-600 whitespace-pre-wrap">{valuePropositionText}</p>
            ) : (
              <p className="text-sm text-stone-400 italic">Define your unique value proposition for this lead.</p>
            )}
          </div>
        )}
      </Section>
      
      {/* Stakeholder Map */}
      <Section 
        title="Stakeholder Map" 
        icon={Users}
        badge={stakeholdersLocal.length}
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleAddStakeholder}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase flex items-center gap-1"
            >
              <Plus size={12} /> Add
            </button>
            {editingStakeholders && (
              <button
                onClick={handleSaveStakeholders}
                disabled={updateStakeholders.isPending}
                className="px-3 py-1 bg-charcoal text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1"
              >
                {updateStakeholders.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save
              </button>
            )}
          </div>
        }
      >
        {stakeholdersLocal.length > 0 ? (
          <div className="space-y-3">
            {stakeholdersLocal.map((stakeholder) => (
              <div key={stakeholder.id} className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl group">
                <div className="flex-shrink-0">
                  {stanceIcons[stakeholder.stance]}
                </div>
                {editingStakeholders ? (
                  <>
                    <input
                      value={stakeholder.name}
                      onChange={(e) => handleUpdateStakeholder(stakeholder.id, 'name', e.target.value)}
                      className="flex-1 p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust"
                      placeholder="Name"
                    />
                    <input
                      value={stakeholder.role}
                      onChange={(e) => handleUpdateStakeholder(stakeholder.id, 'role', e.target.value)}
                      className="w-32 p-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-rust"
                      placeholder="Role"
                    />
                    <select
                      value={stakeholder.influence}
                      onChange={(e) => handleUpdateStakeholder(stakeholder.id, 'influence', e.target.value)}
                      className="p-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-rust"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <select
                      value={stakeholder.stance}
                      onChange={(e) => handleUpdateStakeholder(stakeholder.id, 'stance', e.target.value)}
                      className="p-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-rust"
                    >
                      <option value="champion">Champion</option>
                      <option value="supporter">Supporter</option>
                      <option value="neutral">Neutral</option>
                      <option value="skeptic">Skeptic</option>
                      <option value="blocker">Blocker</option>
                    </select>
                    <button
                      onClick={() => handleDeleteStakeholder(stakeholder.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium text-charcoal text-sm">{stakeholder.name || 'Unnamed'}</div>
                      <div className="text-xs text-stone-500">{stakeholder.role || 'No role'}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      stakeholder.influence === 'high' ? 'bg-red-50 text-red-600' :
                      stakeholder.influence === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-stone-100 text-stone-500'
                    }`}>
                      {stakeholder.influence}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      stakeholder.stance === 'champion' ? 'bg-green-50 text-green-600' :
                      stakeholder.stance === 'supporter' ? 'bg-blue-50 text-blue-600' :
                      stakeholder.stance === 'skeptic' ? 'bg-amber-50 text-amber-600' :
                      stakeholder.stance === 'blocker' ? 'bg-red-50 text-red-600' :
                      'bg-stone-100 text-stone-500'
                    }`}>
                      {stakeholder.stance}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400 italic text-center py-4">
            No stakeholders mapped yet. Add key decision makers and influencers.
          </p>
        )}
      </Section>
      
      {/* Objection Handling */}
      <Section 
        title="Objection Handling" 
        icon={AlertCircle}
        badge={objectionsLocal.length}
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleAddObjection}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase flex items-center gap-1"
            >
              <Plus size={12} /> Add
            </button>
            {editingObjections && (
              <button
                onClick={handleSaveObjections}
                disabled={updateObjections.isPending}
                className="px-3 py-1 bg-charcoal text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1"
              >
                {updateObjections.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save
              </button>
            )}
          </div>
        }
      >
        {objectionsLocal.length > 0 ? (
          <div className="space-y-4">
            {objectionsLocal.map((obj) => (
              <div key={obj.id} className="bg-stone-50 rounded-xl p-4 group">
                {editingObjections ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold uppercase text-amber-600 mb-1 block">Objection</label>
                      <input
                        value={obj.objection}
                        onChange={(e) => handleUpdateObjection(obj.id, 'objection', e.target.value)}
                        className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust"
                        placeholder="What objection might they raise?"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-green-600 mb-1 block">Response</label>
                      <textarea
                        value={obj.response}
                        onChange={(e) => handleUpdateObjection(obj.id, 'response', e.target.value)}
                        className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust resize-none h-20"
                        placeholder="How will you handle it?"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteObjection(obj.id)}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium text-charcoal">{obj.objection || 'No objection text'}</p>
                    </div>
                    <div className="flex items-start gap-2 pl-5">
                      <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-stone-600">{obj.response || 'No response prepared'}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400 italic text-center py-4">
            No objections prepared. Anticipate pushback and prepare responses.
          </p>
        )}
      </Section>
      
      {/* Competition */}
      <Section 
        title="Competition Analysis" 
        icon={Swords}
        badge={competitorsLocal.length}
        defaultOpen={false}
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleAddCompetitor}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase flex items-center gap-1"
            >
              <Plus size={12} /> Add
            </button>
            {editingCompetitors && (
              <button
                onClick={handleSaveCompetitors}
                disabled={updateCompetitors.isPending}
                className="px-3 py-1 bg-charcoal text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1"
              >
                {updateCompetitors.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save
              </button>
            )}
          </div>
        }
      >
        {competitorsLocal.length > 0 ? (
          <div className="space-y-4">
            {competitorsLocal.map((comp) => (
              <div key={comp.id} className="bg-stone-50 rounded-xl p-4">
                {editingCompetitors ? (
                  <div className="space-y-3">
                    <input
                      value={comp.name}
                      onChange={(e) => setCompetitorsLocal(c => 
                        c.map(x => x.id === comp.id ? { ...x, name: e.target.value } : x)
                      )}
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm font-medium focus:outline-none focus:border-rust"
                      placeholder="Competitor name"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-red-500 mb-1 block">Their Strengths</label>
                        <textarea
                          value={comp.theirStrengths.join('\n')}
                          onChange={(e) => setCompetitorsLocal(c => 
                            c.map(x => x.id === comp.id ? { ...x, theirStrengths: e.target.value.split('\n').filter(Boolean) } : x)
                          )}
                          className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-rust resize-none h-20"
                          placeholder="One per line..."
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-green-500 mb-1 block">Our Advantages</label>
                        <textarea
                          value={comp.ourAdvantages.join('\n')}
                          onChange={(e) => setCompetitorsLocal(c => 
                            c.map(x => x.id === comp.id ? { ...x, ourAdvantages: e.target.value.split('\n').filter(Boolean) } : x)
                          )}
                          className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-rust resize-none h-20"
                          placeholder="One per line..."
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setCompetitorsLocal(c => c.filter(x => x.id !== comp.id))}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="font-medium text-charcoal text-sm mb-3">{comp.name || 'Unnamed Competitor'}</div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="font-bold uppercase text-red-500 mb-1">Their Strengths</div>
                        <ul className="space-y-1 text-stone-600">
                          {comp.theirStrengths.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                          {comp.theirStrengths.length === 0 && <li className="text-stone-400 italic">None listed</li>}
                        </ul>
                      </div>
                      <div>
                        <div className="font-bold uppercase text-green-500 mb-1">Our Advantages</div>
                        <ul className="space-y-1 text-stone-600">
                          {comp.ourAdvantages.map((a, i) => (
                            <li key={i}>• {a}</li>
                          ))}
                          {comp.ourAdvantages.length === 0 && <li className="text-stone-400 italic">None listed</li>}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400 italic text-center py-4">
            No competitors analyzed. Know your competition to win.
          </p>
        )}
      </Section>
    </div>
  );
}
