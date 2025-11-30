'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Users, Swords, Trophy,
  Plus, Trash2, Save, Edit3, Loader2, ChevronDown, ChevronRight,
  AlertCircle, CheckCircle, HelpCircle, XCircle, DollarSign,
  FileCheck, ListChecks
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { v4 as uuidv4 } from 'uuid';
import type {
  Objection,
  Stakeholder,
  Competitor,
} from '@/lib/db/schema/strategy';

interface DealNegotiationProps {
  dealId: string;
  dealTitle?: string;
  leadId?: string; // If deal was converted from lead, can inherit strategy
}

// Negotiation-specific types
interface PricingTerm {
  id: string;
  item: string;
  proposedValue: string;
  counterValue?: string;
  status: 'pending' | 'agreed' | 'disputed';
  notes?: string;
}

interface DecisionCriterion {
  id: string;
  criterion: string;
  weight: 'high' | 'medium' | 'low';
  ourStrength: 'strong' | 'neutral' | 'weak';
  notes?: string;
}

// Collapsible Section Component
function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  badge,
  actions,
  color = 'rust',
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
  actions?: React.ReactNode;
  color?: 'rust' | 'green' | 'amber' | 'blue' | 'purple';
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const iconColors = {
    rust: 'text-rust',
    green: 'text-green-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-stone-50/50 hover:bg-stone-100/50 transition-colors cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen); }}
      >
        <div className="flex items-center gap-3">
          <Icon size={16} className={iconColors[color]} />
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
      </div>
      {isOpen && <div className="p-6 border-t border-stone-100">{children}</div>}
    </div>
  );
}

export function DealNegotiation({ _dealId, _dealTitle, leadId }: DealNegotiationProps) {
  // Fetch lead strategy if deal was converted from lead (to inherit data)
  const { data: leadStrategy, isLoading: leadStrategyLoading } = trpc.strategy.get.useQuery(
    { leadId: leadId! },
    { enabled: !!leadId }
  );

  // Local state for Negotiation Notes
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  // Local state for Pricing/Terms
  const [pricingTerms, setPricingTerms] = useState<PricingTerm[]>([]);
  const [editingPricing, setEditingPricing] = useState(false);

  // Local state for Stakeholders (inherited or new)
  const [stakeholdersLocal, setStakeholdersLocal] = useState<Stakeholder[]>([]);
  const [editingStakeholders, setEditingStakeholders] = useState(false);

  // Local state for Objections (inherited or new)
  const [objectionsLocal, setObjectionsLocal] = useState<Objection[]>([]);
  const [editingObjections, setEditingObjections] = useState(false);

  // Local state for Decision Criteria
  const [decisionCriteria, setDecisionCriteria] = useState<DecisionCriterion[]>([]);
  const [editingCriteria, setEditingCriteria] = useState(false);

  // Local state for Competitors (inherited or new)
  const [competitorsLocal, setCompetitorsLocal] = useState<Competitor[]>([]);
  const [editingCompetitors, setEditingCompetitors] = useState(false);

  // Initialize from lead strategy if available
  useEffect(() => {
    if (leadStrategy) {
      setStakeholdersLocal((leadStrategy.stakeholders as Stakeholder[]) || []);
      setObjectionsLocal((leadStrategy.objections as Objection[]) || []);
      setCompetitorsLocal((leadStrategy.competitors as Competitor[]) || []);
    }
  }, [leadStrategy]);

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  // Pricing handlers
  const handleAddPricingTerm = () => {
    const newTerm: PricingTerm = {
      id: uuidv4(),
      item: '',
      proposedValue: '',
      status: 'pending',
    };
    setPricingTerms([...pricingTerms, newTerm]);
    setEditingPricing(true);
  };

  const handleUpdatePricingTerm = (id: string, field: keyof PricingTerm, value: string) => {
    setPricingTerms(terms =>
      terms.map(t => t.id === id ? { ...t, [field]: value } : t)
    );
  };

  const handleDeletePricingTerm = (id: string) => {
    setPricingTerms(terms => terms.filter(t => t.id !== id));
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

  // Decision Criteria handlers
  const handleAddCriterion = () => {
    const newCriterion: DecisionCriterion = {
      id: uuidv4(),
      criterion: '',
      weight: 'medium',
      ourStrength: 'neutral',
    };
    setDecisionCriteria([...decisionCriteria, newCriterion]);
    setEditingCriteria(true);
  };

  const handleUpdateCriterion = (id: string, field: keyof DecisionCriterion, value: string) => {
    setDecisionCriteria(c =>
      c.map(crit => crit.id === id ? { ...crit, [field]: value } : crit)
    );
  };

  const handleDeleteCriterion = (id: string) => {
    setDecisionCriteria(c => c.filter(crit => crit.id !== id));
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

  // Stance icons
  const stanceIcons: Record<string, React.ReactNode> = {
    champion: <Trophy size={14} className="text-green-600" />,
    supporter: <CheckCircle size={14} className="text-blue-600" />,
    neutral: <HelpCircle size={14} className="text-stone-500" />,
    skeptic: <AlertCircle size={14} className="text-amber-600" />,
    blocker: <XCircle size={14} className="text-red-600" />,
  };

  // Pricing status colors
  const pricingStatusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    agreed: 'bg-green-50 text-green-600 border-green-200',
    disputed: 'bg-red-50 text-red-600 border-red-200',
  };

  // Strength colors
  const strengthColors: Record<string, string> = {
    strong: 'bg-green-50 text-green-600',
    neutral: 'bg-stone-100 text-stone-600',
    weak: 'bg-red-50 text-red-600',
  };

  // Loading state
  if (leadStrategyLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-rust" size={32} />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="space-y-4">
      {/* Lead Strategy Inherited Notice */}
      {leadId && leadStrategy && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <FileCheck size={18} className="text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-700">Strategy inherited from lead</p>
            <p className="text-xs text-blue-600">Stakeholders, objections, and competitors were imported from the original lead.</p>
          </div>
        </div>
      )}

      {/* Negotiation Notes */}
      <Section
        title="Negotiation Notes"
        icon={FileText}
        actions={
          editingNotes ? (
            <button
              onClick={() => setEditingNotes(false)}
              className="px-3 py-1 bg-charcoal text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1"
            >
              <Save size={12} /> Save
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
            placeholder="Document your negotiation strategy, key discussion points, and important considerations..."
          />
        ) : (
          <div className="bg-stone-50 rounded-xl p-4 min-h-[100px]">
            {notesValue ? (
              <p className="text-sm text-stone-600 whitespace-pre-wrap">{notesValue}</p>
            ) : (
              <p className="text-sm text-stone-400 italic">No negotiation notes yet. Click Edit to add.</p>
            )}
          </div>
        )}
      </Section>

      {/* Pricing & Terms */}
      <Section
        title="Pricing & Terms"
        icon={DollarSign}
        color="green"
        badge={pricingTerms.length}
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleAddPricingTerm}
              className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold uppercase flex items-center gap-1"
            >
              <Plus size={12} /> Add
            </button>
            {editingPricing && (
              <button
                onClick={() => setEditingPricing(false)}
                className="px-3 py-1 bg-charcoal text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1"
              >
                <Save size={12} /> Save
              </button>
            )}
          </div>
        }
      >
        {pricingTerms.length > 0 ? (
          <div className="space-y-3">
            {pricingTerms.map((term) => (
              <div key={term.id} className="bg-stone-50 rounded-xl p-4 group">
                {editingPricing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-stone-500 mb-1 block">Item/Service</label>
                        <input
                          value={term.item}
                          onChange={(e) => handleUpdatePricingTerm(term.id, 'item', e.target.value)}
                          className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust"
                          placeholder="e.g., Monthly retainer, Hourly rate"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-stone-500 mb-1 block">Proposed Value</label>
                        <input
                          value={term.proposedValue}
                          onChange={(e) => handleUpdatePricingTerm(term.id, 'proposedValue', e.target.value)}
                          className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust"
                          placeholder="e.g., $10,000/mo"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-stone-500 mb-1 block">Counter Offer</label>
                        <input
                          value={term.counterValue || ''}
                          onChange={(e) => handleUpdatePricingTerm(term.id, 'counterValue', e.target.value)}
                          className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust"
                          placeholder="Client's counter (if any)"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-stone-500 mb-1 block">Status</label>
                        <select
                          value={term.status}
                          onChange={(e) => handleUpdatePricingTerm(term.id, 'status', e.target.value)}
                          className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust"
                        >
                          <option value="pending">Pending</option>
                          <option value="agreed">Agreed</option>
                          <option value="disputed">Disputed</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePricingTerm(term.id)}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-charcoal text-sm">{term.item || 'Unnamed item'}</div>
                      <div className="text-xs text-stone-500 mt-1">
                        Proposed: <span className="font-medium">{term.proposedValue || 'N/A'}</span>
                        {term.counterValue && (
                          <> | Counter: <span className="font-medium text-amber-600">{term.counterValue}</span></>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${pricingStatusColors[term.status]}`}>
                      {term.status}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400 italic text-center py-4">
            No pricing terms tracked yet. Add items being negotiated.
          </p>
        )}
      </Section>

      {/* Stakeholder Buy-in */}
      <Section
        title="Stakeholder Buy-in"
        icon={Users}
        color="purple"
        badge={stakeholdersLocal.length}
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleAddStakeholder}
              className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold uppercase flex items-center gap-1"
            >
              <Plus size={12} /> Add
            </button>
            {editingStakeholders && (
              <button
                onClick={() => setEditingStakeholders(false)}
                className="px-3 py-1 bg-charcoal text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1"
              >
                <Save size={12} /> Save
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
            No stakeholders mapped yet. Track decision makers and their buy-in status.
          </p>
        )}
      </Section>

      {/* Objection Handling */}
      <Section
        title="Objection Handling"
        icon={AlertCircle}
        color="amber"
        badge={objectionsLocal.length}
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleAddObjection}
              className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold uppercase flex items-center gap-1"
            >
              <Plus size={12} /> Add
            </button>
            {editingObjections && (
              <button
                onClick={() => setEditingObjections(false)}
                className="px-3 py-1 bg-charcoal text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1"
              >
                <Save size={12} /> Save
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

      {/* Decision Criteria */}
      <Section
        title="Decision Criteria"
        icon={ListChecks}
        color="blue"
        badge={decisionCriteria.length}
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleAddCriterion}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase flex items-center gap-1"
            >
              <Plus size={12} /> Add
            </button>
            {editingCriteria && (
              <button
                onClick={() => setEditingCriteria(false)}
                className="px-3 py-1 bg-charcoal text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1"
              >
                <Save size={12} /> Save
              </button>
            )}
          </div>
        }
      >
        {decisionCriteria.length > 0 ? (
          <div className="space-y-3">
            {decisionCriteria.map((criterion) => (
              <div key={criterion.id} className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl group">
                {editingCriteria ? (
                  <>
                    <input
                      value={criterion.criterion}
                      onChange={(e) => handleUpdateCriterion(criterion.id, 'criterion', e.target.value)}
                      className="flex-1 p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust"
                      placeholder="Decision criterion (e.g., Price, Timeline, Experience)"
                    />
                    <select
                      value={criterion.weight}
                      onChange={(e) => handleUpdateCriterion(criterion.id, 'weight', e.target.value)}
                      className="p-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-rust"
                    >
                      <option value="high">High Weight</option>
                      <option value="medium">Medium Weight</option>
                      <option value="low">Low Weight</option>
                    </select>
                    <select
                      value={criterion.ourStrength}
                      onChange={(e) => handleUpdateCriterion(criterion.id, 'ourStrength', e.target.value)}
                      className="p-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-rust"
                    >
                      <option value="strong">Strong</option>
                      <option value="neutral">Neutral</option>
                      <option value="weak">Weak</option>
                    </select>
                    <button
                      onClick={() => handleDeleteCriterion(criterion.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium text-charcoal text-sm">{criterion.criterion || 'Unnamed criterion'}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      criterion.weight === 'high' ? 'bg-red-50 text-red-600' :
                      criterion.weight === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-stone-100 text-stone-500'
                    }`}>
                      {criterion.weight}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${strengthColors[criterion.ourStrength]}`}>
                      {criterion.ourStrength}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400 italic text-center py-4">
            No decision criteria tracked. Understand what matters most to the client.
          </p>
        )}
      </Section>

      {/* Competition */}
      <Section
        title="Competition Status"
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
                onClick={() => setEditingCompetitors(false)}
                className="px-3 py-1 bg-charcoal text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1"
              >
                <Save size={12} /> Save
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
