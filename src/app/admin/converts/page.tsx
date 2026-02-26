'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHierarchy } from '@/lib/contexts/HierarchyContext';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { formatShortDate } from '@/lib/utils/format';
import {
  HeartHandshake,
  Plus,
  ChevronRight,
  Users,
  TrendingUp,
  AlertTriangle,
  Timer,
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserPlus,
  StickyNote,
  Search,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConvertData {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  age?: number;
  gender: string;
  parish: { _id: string; name: string } | string;
  invitedBy: string;
  firstVisitDate: string;
  stage: string;
  stageHistory: {
    stage: string;
    enteredAt: string;
    notes: string;
  }[];
  notes: string;
  isActive: boolean;
  createdAt: string;
}

interface ConvertStats {
  total: number;
  stageCounts: Record<string, number>;
  conversionRate: number;
  dropOffStage: string;
  averageIntegrationDays: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAGES = [
  { value: 'first-visit', label: 'First Visit' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'house-fellowship', label: 'House Fellowship' },
  { value: 'discipleship', label: 'Discipleship' },
  { value: 'baptism', label: 'Baptism' },
  { value: 'integrated', label: 'Integrated' },
] as const;

const STAGE_ORDER: string[] = STAGES.map((s) => s.value);

const STAGE_BADGE_COLORS: Record<string, string> = {
  'first-visit': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  'follow-up': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'house-fellowship': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  discipleship: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  baptism: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  integrated: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const DEFAULT_FORM = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  age: '',
  gender: '',
  firstVisitDate: '',
  invitedBy: '',
  notes: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getParishId(selection: {
  level: string;
  parishId: string | null;
}): string {
  return selection.parishId || '';
}

function getNextStage(currentStage: string): string | null {
  const idx = STAGE_ORDER.indexOf(currentStage);
  if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1];
}

function getStageLabelByValue(value: string): string {
  return STAGES.find((s) => s.value === value)?.label || value;
}

function getParishName(convert: ConvertData): string {
  if (typeof convert.parish === 'object' && convert.parish?.name) {
    return convert.parish.name;
  }
  return '';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ConvertsPage() {
  const { selection } = useHierarchy();
  const { showToast } = useToast();

  // Data state
  const [converts, setConverts] = useState<ConvertData[]>([]);
  const [stats, setStats] = useState<ConvertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filter
  const [activeStage, setActiveStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Register modal
  const [registerOpen, setRegisterOpen] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [submitting, setSubmitting] = useState(false);

  // Advance modal
  const [advanceTarget, setAdvanceTarget] = useState<ConvertData | null>(null);
  const [advanceNotes, setAdvanceNotes] = useState('');
  const [advancing, setAdvancing] = useState(false);

  const parishId = getParishId(selection);

  // ---------------------------------------------------------------------------
  // Fetch stats
  // ---------------------------------------------------------------------------

  const fetchStats = useCallback(async () => {
    if (!parishId) {
      setStats(null);
      setStatsLoading(false);
      return;
    }
    setStatsLoading(true);
    try {
      const params = new URLSearchParams({ parish: parishId });
      const res = await fetch(`/api/converts/stats?${params}`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data: ConvertStats = await res.json();
      setStats(data);
    } catch {
      showToast('Failed to load pipeline stats', 'error');
    } finally {
      setStatsLoading(false);
    }
  }, [parishId, showToast]);

  // ---------------------------------------------------------------------------
  // Fetch converts
  // ---------------------------------------------------------------------------

  const fetchConverts = useCallback(async () => {
    if (!parishId) {
      setConverts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ parish: parishId });
      if (activeStage !== 'all') params.set('stage', activeStage);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      const res = await fetch(`/api/converts?${params}`);
      if (!res.ok) throw new Error('Failed to fetch converts');
      const data: ConvertData[] = await res.json();
      setConverts(data);
    } catch {
      showToast('Failed to load converts', 'error');
    } finally {
      setLoading(false);
    }
  }, [parishId, activeStage, searchQuery, showToast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchConverts();
  }, [fetchConverts]);

  // ---------------------------------------------------------------------------
  // Stats cards
  // ---------------------------------------------------------------------------

  const statCards = stats
    ? [
        {
          label: 'Total Converts',
          value: stats.total,
          icon: Users,
          color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        },
        {
          label: 'Conversion Rate',
          value: `${stats.conversionRate}%`,
          icon: TrendingUp,
          color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        },
        {
          label: 'Drop-off Stage',
          value: stats.dropOffStage ? getStageLabelByValue(stats.dropOffStage) : 'N/A',
          icon: AlertTriangle,
          color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
        },
        {
          label: 'Avg Integration Days',
          value: stats.averageIntegrationDays || 'N/A',
          icon: Timer,
          color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
        },
      ]
    : [];

  // ---------------------------------------------------------------------------
  // Register Convert
  // ---------------------------------------------------------------------------

  const openRegister = () => {
    setForm({
      ...DEFAULT_FORM,
      firstVisitDate: new Date().toISOString().split('T')[0],
    });
    setRegisterOpen(true);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      showToast('Full name is required', 'warning');
      return;
    }
    if (!form.firstVisitDate) {
      showToast('First visit date is required', 'warning');
      return;
    }
    if (!parishId) {
      showToast('Please select a parish from the hierarchy', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        age: form.age ? parseInt(form.age, 10) : undefined,
        gender: form.gender || undefined,
        parish: parishId,
        firstVisitDate: form.firstVisitDate,
        invitedBy: form.invitedBy.trim(),
        notes: form.notes.trim(),
      };

      const res = await fetch('/api/converts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to register convert');
      }

      showToast('Convert registered successfully', 'success');
      setRegisterOpen(false);
      fetchConverts();
      fetchStats();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to register convert';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Advance Stage
  // ---------------------------------------------------------------------------

  const openAdvance = (convert: ConvertData) => {
    setAdvanceTarget(convert);
    setAdvanceNotes('');
  };

  const handleAdvance = async () => {
    if (!advanceTarget) return;
    const nextStage = getNextStage(advanceTarget.stage);
    if (!nextStage) return;

    setAdvancing(true);
    try {
      const res = await fetch(`/api/converts/${advanceTarget._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: nextStage,
          stageNotes: advanceNotes.trim() || `Advanced to ${getStageLabelByValue(nextStage)}`,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to advance stage');
      }

      showToast(
        `${advanceTarget.fullName} advanced to ${getStageLabelByValue(nextStage)}`,
        'success'
      );
      setAdvanceTarget(null);
      fetchConverts();
      fetchStats();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to advance stage';
      showToast(message, 'error');
    } finally {
      setAdvancing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Shared classes
  // ---------------------------------------------------------------------------

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors';

  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  // ---------------------------------------------------------------------------
  // No parish selected guard
  // ---------------------------------------------------------------------------

  if (!parishId) {
    return (
      <div className="space-y-6 page-enter">
        <div>
          <h1
            className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            <HeartHandshake className="text-primary" size={24} />
            New Convert Pipeline
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track and manage the discipleship journey of new converts
          </p>
        </div>
        <Card className="p-16 text-center">
          <HeartHandshake className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            Please select a parish from the hierarchy to view converts.
          </p>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            <HeartHandshake className="text-primary" size={24} />
            New Convert Pipeline
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track and manage the discipleship journey of new converts
          </p>
        </div>
        <Button onClick={openRegister}>
          <Plus size={16} className="mr-1" /> Register Convert
        </Button>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1">
                  <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
          {statCards.map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Stage Tabs + Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveStage('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeStage === 'all'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            All
            {stats && (
              <span className="ml-1.5 text-xs opacity-75">{stats.total}</span>
            )}
          </button>
          {STAGES.map((stage) => (
            <button
              key={stage.value}
              onClick={() => setActiveStage(stage.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeStage === stage.value
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {stage.label}
              {stats?.stageCounts?.[stage.value] != null && (
                <span className="ml-1.5 text-xs opacity-75">
                  {stats.stageCounts[stage.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Converts List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : converts.length === 0 ? (
        <Card className="p-16 text-center">
          <UserPlus className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {activeStage !== 'all'
              ? `No converts in the ${getStageLabelByValue(activeStage)} stage`
              : 'No converts registered yet'}
          </p>
          {activeStage === 'all' && (
            <Button onClick={openRegister}>Register First Convert</Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {converts.map((convert) => {
            const nextStage = getNextStage(convert.stage);
            const parishName = getParishName(convert);

            return (
              <Card key={convert._id} className="p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Convert Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                        {convert.fullName}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STAGE_BADGE_COLORS[convert.stage] || STAGE_BADGE_COLORS['first-visit']
                        }`}
                      >
                        {getStageLabelByValue(convert.stage)}
                      </span>
                      {convert.gender && (
                        <Badge variant="info">
                          {convert.gender === 'male' ? 'Male' : 'Female'}
                        </Badge>
                      )}
                      {convert.age && (
                        <span className="text-xs text-slate-400">
                          {convert.age} yrs
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                      {convert.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone size={14} className="shrink-0" />
                          {convert.phone}
                        </span>
                      )}
                      {convert.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail size={14} className="shrink-0" />
                          {convert.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="shrink-0" />
                        First Visit: {formatShortDate(convert.firstVisitDate)}
                      </span>
                      {convert.address && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="shrink-0" />
                          {convert.address}
                        </span>
                      )}
                      {parishName && (
                        <span className="flex items-center gap-1.5">
                          <HeartHandshake size={14} className="shrink-0" />
                          {parishName}
                        </span>
                      )}
                    </div>

                    {/* Invited by + Notes */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-400 dark:text-slate-500">
                      {convert.invitedBy && (
                        <span className="flex items-center gap-1.5">
                          <UserPlus size={14} className="shrink-0" />
                          Invited by: {convert.invitedBy}
                        </span>
                      )}
                      {convert.notes && (
                        <span className="flex items-center gap-1.5">
                          <StickyNote size={14} className="shrink-0" />
                          {convert.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Advance Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    {nextStage && (
                      <Button size="sm" variant="outline" onClick={() => openAdvance(convert)}>
                        Advance Stage <ChevronRight size={14} className="ml-1" />
                      </Button>
                    )}
                    {!nextStage && (
                      <Badge variant="success">Fully Integrated</Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Register Convert Modal                                              */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="Register New Convert"
        size="xl"
      >
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className={labelClass}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              className={inputClass}
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className={inputClass}
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className={inputClass}
                placeholder="Email address"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className={labelClass}>Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              className={inputClass}
              placeholder="Home address"
            />
          </div>

          {/* Age + Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                className={inputClass}
                placeholder="Age"
                min={1}
                max={150}
              />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Parish (read-only from hierarchy) + First Visit Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Parish</label>
              <div className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm">
                {selection.parishName || 'Selected from hierarchy'}
              </div>
            </div>
            <div>
              <label className={labelClass}>
                First Visit Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.firstVisitDate}
                onChange={(e) => setForm((p) => ({ ...p, firstVisitDate: e.target.value }))}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Invited By */}
          <div>
            <label className={labelClass}>Invited By</label>
            <input
              type="text"
              value={form.invitedBy}
              onChange={(e) => setForm((p) => ({ ...p, invitedBy: e.target.value }))}
              className={inputClass}
              placeholder="Name of the person who invited them"
            />
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Any additional notes about the convert"
            />
          </div>

          {/* Hierarchy info */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-xs text-slate-500 dark:text-slate-400">
            Parish: <span className="font-medium">{selection.parishName}</span> &mdash; New converts
            are automatically placed in the <span className="font-medium">First Visit</span> stage.
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="ghost" onClick={() => setRegisterOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Registering...
                </span>
              ) : (
                'Register Convert'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* Advance Stage Modal                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={!!advanceTarget}
        onClose={() => setAdvanceTarget(null)}
        title="Advance Stage"
        size="sm"
      >
        {advanceTarget && (
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Advance{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {advanceTarget.fullName}
              </span>{' '}
              from{' '}
              <span className="font-medium">{getStageLabelByValue(advanceTarget.stage)}</span>{' '}
              to{' '}
              <span className="font-semibold text-primary">
                {getStageLabelByValue(getNextStage(advanceTarget.stage) || '')}
              </span>
              ?
            </p>

            {/* Stage progress indicator */}
            <div className="flex items-center gap-1 py-2 overflow-x-auto">
              {STAGES.map((stage, idx) => {
                const currentIdx = STAGE_ORDER.indexOf(advanceTarget.stage);
                const nextIdx = currentIdx + 1;
                const isCompleted = idx <= currentIdx;
                const isNext = idx === nextIdx;

                return (
                  <div key={stage.value} className="flex items-center gap-1">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isCompleted
                          ? 'bg-green-500'
                          : isNext
                            ? 'bg-primary animate-pulse'
                            : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                    {idx < STAGES.length - 1 && (
                      <div
                        className={`w-4 h-0.5 shrink-0 ${
                          idx < currentIdx
                            ? 'bg-green-500'
                            : idx === currentIdx
                              ? 'bg-primary'
                              : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={advanceNotes}
                onChange={(e) => setAdvanceNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                placeholder="Add notes about this stage advancement..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setAdvanceTarget(null)}>
                Cancel
              </Button>
              <Button onClick={handleAdvance} disabled={advancing}>
                {advancing ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" /> Advancing...
                  </span>
                ) : (
                  <>
                    Advance to {getStageLabelByValue(getNextStage(advanceTarget.stage) || '')}
                    <ChevronRight size={14} className="ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
