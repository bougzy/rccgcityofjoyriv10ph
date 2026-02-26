'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity, Plus, Search, RefreshCw, X, Users,
  TrendingUp, AlertTriangle, UserX, ChevronDown,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useHierarchy } from '@/lib/contexts/HierarchyContext';

type Classification = 'highly-active' | 'active' | 'at-risk' | 'inactive';

interface EngagementScore {
  _id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  parish: string;
  scores: {
    attendance: number;
    participation: number;
    volunteer: number;
    evangelism: number;
  };
  overallScore: number;
  classification: Classification;
  updatedAt: string;
}

const CLASSIFICATION_CONFIG: Record<
  Classification,
  { label: string; variant: 'success' | 'info' | 'warning' | 'danger'; color: string }
> = {
  'highly-active': { label: 'Highly Active', variant: 'success', color: 'text-green-600' },
  'active': { label: 'Active', variant: 'info', color: 'text-blue-600' },
  'at-risk': { label: 'At Risk', variant: 'warning', color: 'text-amber-600' },
  'inactive': { label: 'Inactive', variant: 'danger', color: 'text-red-600' },
};

const SCORE_CATEGORIES = [
  { key: 'attendance' as const, label: 'Attendance' },
  { key: 'participation' as const, label: 'Participation' },
  { key: 'volunteer' as const, label: 'Volunteer' },
  { key: 'evangelism' as const, label: 'Evangelism' },
];

function calculateOverall(scores: { attendance: number; participation: number; volunteer: number; evangelism: number }) {
  return Math.round((scores.attendance + scores.participation + scores.volunteer + scores.evangelism) / 4);
}

function deriveClassification(score: number): Classification {
  if (score >= 80) return 'highly-active';
  if (score >= 60) return 'active';
  if (score >= 40) return 'at-risk';
  return 'inactive';
}

const emptyForm = {
  memberName: '',
  memberEmail: '',
  scores: {
    attendance: 50,
    participation: 50,
    volunteer: 50,
    evangelism: 50,
  },
};

export default function EngagementPage() {
  const { selection } = useHierarchy();
  const { showToast } = useToast();

  const [engagementData, setEngagementData] = useState<EngagementScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');

  // Add Member Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const parishId = selection.parishId || '';

  const fetchEngagement = useCallback(async () => {
    if (!parishId) {
      setEngagementData([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/engagement?parish=${parishId}`);
      if (!res.ok) throw new Error('Failed to fetch engagement data');
      const data = await res.json();
      setEngagementData(data);
    } catch {
      showToast('Failed to fetch engagement data', 'error');
    } finally {
      setLoading(false);
    }
  }, [parishId, showToast]);

  useEffect(() => {
    fetchEngagement();
  }, [fetchEngagement]);

  // Computed summary stats
  const stats = {
    highlyActive: engagementData.filter((e) => e.classification === 'highly-active').length,
    active: engagementData.filter((e) => e.classification === 'active').length,
    atRisk: engagementData.filter((e) => e.classification === 'at-risk').length,
    inactive: engagementData.filter((e) => e.classification === 'inactive').length,
  };

  // Filtered list
  const filteredData = engagementData.filter((entry) => {
    const matchesClassification =
      classificationFilter === 'all' || entry.classification === classificationFilter;
    const matchesSearch =
      !searchQuery ||
      entry.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.memberEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClassification && matchesSearch;
  });

  // Recalculate scores
  const handleRecalculate = async () => {
    if (!parishId) {
      showToast('Please select a parish first', 'warning');
      return;
    }
    setRecalculating(true);
    try {
      const res = await fetch('/api/engagement/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parishId }),
      });
      if (!res.ok) throw new Error('Recalculation failed');
      showToast('Engagement scores recalculated successfully', 'success');
      fetchEngagement();
    } catch {
      showToast('Failed to recalculate engagement scores', 'error');
    } finally {
      setRecalculating(false);
    }
  };

  // Add member form
  const openAddModal = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleScoreChange = (key: keyof typeof form.scores, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    setForm((prev) => ({
      ...prev,
      scores: { ...prev.scores, [key]: clamped },
    }));
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parishId) {
      showToast('Please select a parish first', 'warning');
      return;
    }
    setSaving(true);
    try {
      const overallScore = calculateOverall(form.scores);
      const payload = {
        memberName: form.memberName,
        memberEmail: form.memberEmail,
        parish: parishId,
        scores: form.scores,
        overallScore,
        classification: deriveClassification(overallScore),
      };
      const res = await fetch('/api/engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add member');
      }
      showToast('Member engagement score added successfully', 'success');
      setModalOpen(false);
      fetchEngagement();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to add member', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formOverallScore = calculateOverall(form.scores);
  const formClassification = deriveClassification(formOverallScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-[family-name:var(--font-playfair)]">
            Member Engagement
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track and manage member engagement scores
            {selection.parishName && (
              <span className="text-primary font-medium"> - {selection.parishName}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRecalculate}
            disabled={recalculating || !parishId}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={recalculating ? 'animate-spin' : ''} />
            Recalculate Scores
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Add Member
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Highly Active', count: stats.highlyActive, icon: TrendingUp, bgColor: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
          { label: 'Active', count: stats.active, icon: Activity, bgColor: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
          { label: 'At Risk', count: stats.atRisk, icon: AlertTriangle, bgColor: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
          { label: 'Inactive', count: stats.inactive, icon: UserX, bgColor: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className="text-white" size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.count}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="relative">
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Classifications</option>
            <option value="highly-active">Highly Active</option>
            <option value="active">Active</option>
            <option value="at-risk">At Risk</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* No parish selected */}
      {!parishId && (
        <Card className="p-12 text-center">
          <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
            No Parish Selected
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Please select a parish from the hierarchy to view engagement scores.
          </p>
        </Card>
      )}

      {/* Engagement List */}
      {parishId && loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : parishId && filteredData.length === 0 ? (
        <Card className="p-12 text-center">
          <Activity size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {searchQuery || classificationFilter !== 'all'
              ? 'No matching members found'
              : 'No engagement data yet'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {searchQuery || classificationFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Add member engagement scores or run recalculation to get started.'}
          </p>
        </Card>
      ) : parishId ? (
        <div className="grid gap-4">
          {filteredData.map((entry) => {
            const config = CLASSIFICATION_CONFIG[entry.classification];
            return (
              <Card key={entry._id} className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Member Info + Overall Score */}
                  <div className="flex items-center gap-4 lg:w-72 shrink-0">
                    {/* Circular Score Indicator */}
                    <div className="relative w-14 h-14 shrink-0">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-slate-200 dark:text-slate-700"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${(entry.overallScore / 100) * 150.8} 150.8`}
                          className={config.color}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm font-bold ${config.color}`}>
                          {entry.overallScore}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {entry.memberName}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {entry.memberEmail}
                      </p>
                      <div className="mt-1">
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Individual Score Bars */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SCORE_CATEGORIES.map((cat) => {
                      const value = entry.scores[cat.key];
                      const barColor =
                        value >= 80
                          ? 'bg-green-500'
                          : value >= 60
                          ? 'bg-blue-500'
                          : value >= 40
                          ? 'bg-amber-500'
                          : 'bg-red-500';
                      return (
                        <div key={cat.key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {cat.label}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {value}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor} rounded-full transition-all duration-500`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* Add Member Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-[family-name:var(--font-playfair)]">
                Add Member Engagement
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.memberName}
                  onChange={(e) => setForm((prev) => ({ ...prev, memberName: e.target.value }))}
                  required
                  placeholder="Enter member name"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.memberEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, memberEmail: e.target.value }))}
                  required
                  placeholder="Enter email address"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Parish (read-only from hierarchy) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Parish
                </label>
                <input
                  type="text"
                  value={selection.parishName || 'No parish selected'}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              {/* Score Sliders */}
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Individual Scores
                </p>
                {SCORE_CATEGORIES.map((cat) => (
                  <div key={cat.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm text-slate-600 dark:text-slate-400">
                        {cat.label}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={form.scores[cat.key]}
                        onChange={(e) => handleScoreChange(cat.key, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={form.scores[cat.key]}
                      onChange={(e) => handleScoreChange(cat.key, parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary bg-slate-200 dark:bg-slate-700"
                    />
                  </div>
                ))}
              </div>

              {/* Auto-calculated Overall Score */}
              <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Overall Score
                  </p>
                  <Badge variant={CLASSIFICATION_CONFIG[formClassification].variant}>
                    {CLASSIFICATION_CONFIG[formClassification].label}
                  </Badge>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-slate-200 dark:text-slate-600"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${(formOverallScore / 100) * 175.9} 175.9`}
                      className={CLASSIFICATION_CONFIG[formClassification].color}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold ${CLASSIFICATION_CONFIG[formClassification].color}`}>
                      {formOverallScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !parishId}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
