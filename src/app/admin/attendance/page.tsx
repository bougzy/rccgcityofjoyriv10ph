'use client';

import { useState } from 'react';
import { useHierarchy } from '@/lib/contexts/HierarchyContext';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { SERVICE_TYPES } from '@/lib/constants/service-types';
import { ClipboardList, Plus, Calendar, Users, UserCheck, Baby, Sparkles, Save } from 'lucide-react';
import { formatShortDate } from '@/lib/utils/format';

interface RecentRecord {
  _id: string;
  date: string;
  serviceLabel: string;
  grandTotal: number;
  firstTimers: number;
  entityName: string;
}

export default function AttendancePage() {
  const { selection } = useHierarchy();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    serviceType: 'sunday-service',
    totalMen: 0,
    totalWomen: 0,
    totalChildren: 0,
    totalYouth: 0,
    totalWorkers: 0,
    firstTimers: 0,
    salvations: 0,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([]);

  const grandTotal = form.totalMen + form.totalWomen + form.totalChildren + form.totalYouth + form.totalWorkers;

  const serviceLabel = SERVICE_TYPES.find((s) => s.value === form.serviceType)?.label || form.serviceType;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ['totalMen', 'totalWomen', 'totalChildren', 'totalYouth', 'totalWorkers', 'firstTimers', 'salvations'].includes(name)
        ? parseInt(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const entityName =
        selection.level === 'province' ? selection.provinceName :
        selection.level === 'zone' ? selection.zoneName :
        selection.level === 'area' ? selection.areaName :
        selection.parishName || 'Unknown';

      const entityId =
        selection.level === 'province' ? selection.provinceId :
        selection.level === 'zone' ? selection.zoneId :
        selection.level === 'area' ? selection.areaId :
        selection.parishId || '';

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          grandTotal,
          serviceLabel,
          level: selection.level,
          entityId,
          entityName,
          province: selection.provinceId,
          zone: selection.zoneId,
          area: selection.areaId,
          parish: selection.parishId,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      const saved = await res.json();
      showToast('Attendance recorded successfully', 'success');

      setRecentRecords((prev) => [
        { _id: saved._id, date: form.date, serviceLabel, grandTotal, firstTimers: form.firstTimers, entityName: entityName || '' },
        ...prev.slice(0, 9),
      ]);

      setForm({
        date: new Date().toISOString().split('T')[0],
        serviceType: 'sunday-service',
        totalMen: 0,
        totalWomen: 0,
        totalChildren: 0,
        totalYouth: 0,
        totalWorkers: 0,
        firstTimers: 0,
        salvations: 0,
        notes: '',
      });
    } catch {
      showToast('Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="text-primary" size={24} />
            Record Attendance
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Recording for: <span className="font-semibold text-primary dark:text-primary-light">{
              selection.level === 'province' ? selection.provinceName :
              selection.level === 'zone' ? selection.zoneName :
              selection.level === 'area' ? selection.areaName :
              selection.parishName
            }</span>
          </p>
        </div>
        <a href="/admin/attendance/history">
          <Button variant="outline" size="sm">View History</Button>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-1">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <Calendar size={14} className="inline mr-1" /> Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Type</label>
                  <select
                    name="serviceType"
                    value={form.serviceType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {SERVICE_TYPES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Users size={16} /> Headcount
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { name: 'totalMen', label: 'Men', icon: Users },
                    { name: 'totalWomen', label: 'Women', icon: Users },
                    { name: 'totalChildren', label: 'Children', icon: Baby },
                    { name: 'totalYouth', label: 'Youth', icon: UserCheck },
                    { name: 'totalWorkers', label: 'Workers', icon: UserCheck },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{field.label}</label>
                      <input
                        type="number"
                        name={field.name}
                        value={form[field.name as keyof typeof form]}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Grand Total */}
              <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Grand Total</p>
                <p className="text-4xl font-bold text-primary dark:text-primary-light">{grandTotal.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <Sparkles size={14} className="inline mr-1" /> First Timers
                  </label>
                  <input
                    type="number"
                    name="firstTimers"
                    value={form.firstTimers}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <Sparkles size={14} className="inline mr-1" /> Salvations
                  </label>
                  <input
                    type="number"
                    name="salvations"
                    value={form.salvations}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Any special notes about this service..."
                />
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                <Save size={16} className="mr-2" />
                {saving ? 'Saving...' : 'Record Attendance'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Recent Records */}
        <div>
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Plus size={16} /> Recent Records
            </h3>
            {recentRecords.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No records yet. Submit your first attendance record.</p>
            ) : (
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <div key={record._id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-white">{record.serviceLabel}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatShortDate(record.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary dark:text-primary-light">{record.grandTotal}</p>
                        {record.firstTimers > 0 && (
                          <p className="text-xs text-green-600">+{record.firstTimers} first timers</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
