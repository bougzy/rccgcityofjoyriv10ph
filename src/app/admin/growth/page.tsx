'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHierarchy } from '@/lib/contexts/HierarchyContext';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { formatShortDate, formatNumber } from '@/lib/utils/format';
import {
  TrendingUp,
  Plus,
  Download,
  Users,
  Church,
  UserPlus,
  UserCheck,
  Calendar,
  FileSpreadsheet,
  BarChart3,
  ClipboardList,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GrowthReport {
  _id: string;
  province: string;
  zone?: string;
  area?: string;
  parish?: string;
  level: string;
  entityId: string;
  entityName: string;
  period: string;
  periodType: string;
  sundayAttendance: number;
  midweekAttendance: number;
  newConverts: number;
  baptisms: number;
  outreachActivities: number;
  houseFellowshipCount: number;
  houseFellowshipAttendance: number;
  firstTimers: number;
  firstTimerRetention: number;
  totalMembers: number;
  activeMembers: number;
  notes: string;
  submittedBy: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_FORM = {
  period: '',
  periodType: 'weekly' as 'weekly' | 'monthly',
  sundayAttendance: '',
  midweekAttendance: '',
  newConverts: '',
  baptisms: '',
  outreachActivities: '',
  houseFellowshipCount: '',
  houseFellowshipAttendance: '',
  firstTimers: '',
  firstTimerRetention: '',
  totalMembers: '',
  activeMembers: '',
  notes: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEntityId(selection: {
  level: string;
  provinceId: string;
  zoneId: string | null;
  areaId: string | null;
  parishId: string | null;
}): string {
  if (selection.level === 'province') return selection.provinceId;
  if (selection.level === 'zone') return selection.zoneId || '';
  if (selection.level === 'area') return selection.areaId || '';
  return selection.parishId || '';
}

function getEntityLabel(selection: {
  level: string;
  provinceName: string;
  zoneName: string | null;
  areaName: string | null;
  parishName: string | null;
}): string {
  if (selection.level === 'province') return selection.provinceName;
  if (selection.level === 'zone') return selection.zoneName || '';
  if (selection.level === 'area') return selection.areaName || '';
  return selection.parishName || '';
}

function getCurrentWeek(): string {
  const now = new Date();
  const year = now.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const dayOfYear = Math.ceil((now.getTime() - oneJan.getTime()) / (1000 * 60 * 60 * 24));
  const weekNum = Math.ceil(dayOfYear / 7);
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatPeriod(period: string, periodType: string): string {
  if (periodType === 'weekly' && period.includes('-W')) {
    const parts = period.split('-W');
    return `Week ${parseInt(parts[1], 10)}, ${parts[0]}`;
  }
  if (periodType === 'monthly' && period.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  return period;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GrowthPage() {
  const { selection } = useHierarchy();
  const { showToast } = useToast();

  // Data state
  const [reports, setReports] = useState<GrowthReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit modal
  const [submitOpen, setSubmitOpen] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [submitting, setSubmitting] = useState(false);

  const entityId = getEntityId(selection);
  const entityLabel = getEntityLabel(selection);

  // ---------------------------------------------------------------------------
  // Fetch reports
  // ---------------------------------------------------------------------------

  const fetchReports = useCallback(async () => {
    if (!entityId) {
      setReports([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        level: selection.level,
        entityId,
      });
      const res = await fetch(`/api/growth-reports?${params}`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data: GrowthReport[] = await res.json();
      setReports(data);
    } catch {
      showToast('Failed to load growth reports', 'error');
    } finally {
      setLoading(false);
    }
  }, [selection.level, entityId, showToast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ---------------------------------------------------------------------------
  // Summary stats from latest report
  // ---------------------------------------------------------------------------

  const latestReport = reports.length > 0 ? reports[0] : null;

  const summaryStats = [
    {
      label: 'Sunday Attendance',
      value: latestReport ? formatNumber(latestReport.sundayAttendance) : '--',
      icon: Church,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      label: 'Midweek Attendance',
      value: latestReport ? formatNumber(latestReport.midweekAttendance) : '--',
      icon: Users,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      label: 'New Converts',
      value: latestReport ? formatNumber(latestReport.newConverts) : '--',
      icon: UserPlus,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      label: 'First Timers',
      value: latestReport ? formatNumber(latestReport.firstTimers) : '--',
      icon: UserCheck,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
    },
  ];

  // ---------------------------------------------------------------------------
  // Submit Report
  // ---------------------------------------------------------------------------

  const openSubmit = () => {
    setForm({
      ...DEFAULT_FORM,
      period: getCurrentWeek(),
    });
    setSubmitOpen(true);
  };

  const handlePeriodTypeChange = (periodType: 'weekly' | 'monthly') => {
    setForm((p) => ({
      ...p,
      periodType,
      period: periodType === 'weekly' ? getCurrentWeek() : getCurrentMonth(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.period) {
      showToast('Period is required', 'warning');
      return;
    }
    if (!entityId) {
      showToast('Please select an entity from the hierarchy', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        period: form.period,
        periodType: form.periodType,
        level: selection.level,
        entityId,
        entityName: entityLabel,
        province: selection.provinceId,
        zone: selection.zoneId || undefined,
        area: selection.areaId || undefined,
        parish: selection.parishId || undefined,
        sundayAttendance: parseInt(form.sundayAttendance, 10) || 0,
        midweekAttendance: parseInt(form.midweekAttendance, 10) || 0,
        newConverts: parseInt(form.newConverts, 10) || 0,
        baptisms: parseInt(form.baptisms, 10) || 0,
        outreachActivities: parseInt(form.outreachActivities, 10) || 0,
        houseFellowshipCount: parseInt(form.houseFellowshipCount, 10) || 0,
        houseFellowshipAttendance: parseInt(form.houseFellowshipAttendance, 10) || 0,
        firstTimers: parseInt(form.firstTimers, 10) || 0,
        firstTimerRetention: parseFloat(form.firstTimerRetention) || 0,
        totalMembers: parseInt(form.totalMembers, 10) || 0,
        activeMembers: parseInt(form.activeMembers, 10) || 0,
        notes: form.notes.trim(),
      };

      const res = await fetch('/api/growth-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to submit report');
      }

      showToast('Growth report submitted successfully', 'success');
      setSubmitOpen(false);
      fetchReports();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit report';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  const handleExportCSV = () => {
    if (!entityId) {
      showToast('Please select an entity to export', 'warning');
      return;
    }
    const params = new URLSearchParams({
      level: selection.level,
      entityId,
      format: 'csv',
    });
    window.open(`/api/growth-reports/export?${params}`, '_blank');
  };

  // ---------------------------------------------------------------------------
  // Shared classes
  // ---------------------------------------------------------------------------

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors';

  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

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
            <TrendingUp className="text-primary" size={24} />
            Growth Intelligence
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track growth metrics for {entityLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download size={16} className="mr-1" /> Export CSV
          </Button>
          <Button onClick={openSubmit}>
            <Plus size={16} className="mr-1" /> Submit Report
          </Button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
        {summaryStats.map((stat) => (
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

      {/* Latest report note */}
      {latestReport && (
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <Calendar size={12} />
          Stats from latest report: {formatPeriod(latestReport.period, latestReport.periodType)}
          {latestReport.createdAt && (
            <span className="ml-1">
              (submitted {formatShortDate(latestReport.createdAt)})
            </span>
          )}
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : reports.length === 0 ? (
        <Card className="p-16 text-center">
          <BarChart3 className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400 mb-4">No growth reports submitted yet</p>
          <Button onClick={openSubmit}>Submit First Report</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardList size={18} className="text-slate-400" />
              Report History
            </h2>
            <span className="text-sm text-slate-400">{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
          </div>

          {reports.map((report) => (
            <Card key={report._id} className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Report period + entity */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {formatPeriod(report.period, report.periodType)}
                    </h3>
                    <Badge variant={report.periodType === 'weekly' ? 'primary' : 'accent'}>
                      {report.periodType === 'weekly' ? 'Weekly' : 'Monthly'}
                    </Badge>
                    {report.entityName && (
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {report.entityName}
                      </span>
                    )}
                  </div>
                  {report.createdAt && (
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Submitted {formatShortDate(report.createdAt)}
                    </p>
                  )}
                </div>

                {/* Key metrics */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="text-center min-w-[70px]">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatNumber(report.sundayAttendance)}
                    </p>
                    <p className="text-xs text-slate-400">Sunday</p>
                  </div>
                  <div className="text-center min-w-[70px]">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatNumber(report.midweekAttendance)}
                    </p>
                    <p className="text-xs text-slate-400">Midweek</p>
                  </div>
                  <div className="text-center min-w-[70px]">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatNumber(report.newConverts)}
                    </p>
                    <p className="text-xs text-slate-400">Converts</p>
                  </div>
                  <div className="text-center min-w-[70px]">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatNumber(report.baptisms)}
                    </p>
                    <p className="text-xs text-slate-400">Baptisms</p>
                  </div>
                  <div className="text-center min-w-[70px]">
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {formatNumber(report.firstTimers)}
                    </p>
                    <p className="text-xs text-slate-400">First Timers</p>
                  </div>
                </div>
              </div>

              {/* Expanded details row */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                {report.outreachActivities > 0 && (
                  <span>Outreach: {report.outreachActivities}</span>
                )}
                {report.houseFellowshipCount > 0 && (
                  <span>HF Count: {report.houseFellowshipCount}</span>
                )}
                {report.houseFellowshipAttendance > 0 && (
                  <span>HF Attendance: {formatNumber(report.houseFellowshipAttendance)}</span>
                )}
                {report.firstTimerRetention > 0 && (
                  <span>Retention: {report.firstTimerRetention}%</span>
                )}
                {report.totalMembers > 0 && (
                  <span>Total Members: {formatNumber(report.totalMembers)}</span>
                )}
                {report.activeMembers > 0 && (
                  <span>Active: {formatNumber(report.activeMembers)}</span>
                )}
                {report.notes && (
                  <span className="italic truncate max-w-xs">{report.notes}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Submit Report Modal                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title="Submit Growth Report"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Period Type + Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Period Type</label>
              <select
                value={form.periodType}
                onChange={(e) =>
                  handlePeriodTypeChange(e.target.value as 'weekly' | 'monthly')
                }
                className={inputClass}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                Period <span className="text-red-500">*</span>
              </label>
              {form.periodType === 'weekly' ? (
                <input
                  type="week"
                  value={form.period}
                  onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))}
                  className={inputClass}
                  required
                />
              ) : (
                <input
                  type="month"
                  value={form.period}
                  onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))}
                  className={inputClass}
                  required
                />
              )}
            </div>
          </div>

          {/* Attendance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Sunday Attendance</label>
              <input
                type="number"
                value={form.sundayAttendance}
                onChange={(e) => setForm((p) => ({ ...p, sundayAttendance: e.target.value }))}
                className={inputClass}
                placeholder="0"
                min={0}
              />
            </div>
            <div>
              <label className={labelClass}>Midweek Attendance</label>
              <input
                type="number"
                value={form.midweekAttendance}
                onChange={(e) => setForm((p) => ({ ...p, midweekAttendance: e.target.value }))}
                className={inputClass}
                placeholder="0"
                min={0}
              />
            </div>
          </div>

          {/* Converts + Baptisms + Outreach */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>New Converts</label>
              <input
                type="number"
                value={form.newConverts}
                onChange={(e) => setForm((p) => ({ ...p, newConverts: e.target.value }))}
                className={inputClass}
                placeholder="0"
                min={0}
              />
            </div>
            <div>
              <label className={labelClass}>Baptisms</label>
              <input
                type="number"
                value={form.baptisms}
                onChange={(e) => setForm((p) => ({ ...p, baptisms: e.target.value }))}
                className={inputClass}
                placeholder="0"
                min={0}
              />
            </div>
            <div>
              <label className={labelClass}>Outreach Activities</label>
              <input
                type="number"
                value={form.outreachActivities}
                onChange={(e) => setForm((p) => ({ ...p, outreachActivities: e.target.value }))}
                className={inputClass}
                placeholder="0"
                min={0}
              />
            </div>
          </div>

          {/* House Fellowship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>House Fellowship Count</label>
              <input
                type="number"
                value={form.houseFellowshipCount}
                onChange={(e) => setForm((p) => ({ ...p, houseFellowshipCount: e.target.value }))}
                className={inputClass}
                placeholder="0"
                min={0}
              />
            </div>
            <div>
              <label className={labelClass}>HF Attendance</label>
              <input
                type="number"
                value={form.houseFellowshipAttendance}
                onChange={(e) =>
                  setForm((p) => ({ ...p, houseFellowshipAttendance: e.target.value }))
                }
                className={inputClass}
                placeholder="0"
                min={0}
              />
            </div>
          </div>

          {/* First Timers + Retention */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Timers</label>
              <input
                type="number"
                value={form.firstTimers}
                onChange={(e) => setForm((p) => ({ ...p, firstTimers: e.target.value }))}
                className={inputClass}
                placeholder="0"
                min={0}
              />
            </div>
            <div>
              <label className={labelClass}>First Timer Retention %</label>
              <input
                type="number"
                value={form.firstTimerRetention}
                onChange={(e) => setForm((p) => ({ ...p, firstTimerRetention: e.target.value }))}
                className={inputClass}
                placeholder="0"
                min={0}
                max={100}
                step="0.1"
              />
            </div>
          </div>

          {/* Total + Active Members */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Total Members</label>
              <input
                type="number"
                value={form.totalMembers}
                onChange={(e) => setForm((p) => ({ ...p, totalMembers: e.target.value }))}
                className={inputClass}
                placeholder="0"
                min={0}
              />
            </div>
            <div>
              <label className={labelClass}>Active Members</label>
              <input
                type="number"
                value={form.activeMembers}
                onChange={(e) => setForm((p) => ({ ...p, activeMembers: e.target.value }))}
                className={inputClass}
                placeholder="0"
                min={0}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Any additional observations, highlights, or prayer points..."
            />
          </div>

          {/* Hierarchy info (read-only) */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <FileSpreadsheet size={14} className="shrink-0" />
            <span>
              Scope: <span className="font-medium capitalize">{selection.level}</span> &mdash;{' '}
              {entityLabel}
              {form.periodType === 'weekly' && form.period && (
                <span className="ml-2">| {formatPeriod(form.period, 'weekly')}</span>
              )}
              {form.periodType === 'monthly' && form.period && (
                <span className="ml-2">| {formatPeriod(form.period, 'monthly')}</span>
              )}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="ghost" onClick={() => setSubmitOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Submitting...
                </span>
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
