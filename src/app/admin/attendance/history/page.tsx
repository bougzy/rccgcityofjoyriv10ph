'use client';

import { useState, useEffect } from 'react';
import { useHierarchy } from '@/lib/contexts/HierarchyContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { SERVICE_TYPES } from '@/lib/constants/service-types';
import { History, Download, Filter, Trash2, ChevronLeft } from 'lucide-react';
import { formatShortDate, formatNumber } from '@/lib/utils/format';
import Link from 'next/link';

interface AttendanceRecord {
  _id: string;
  date: string;
  serviceType: string;
  serviceLabel: string;
  entityName: string;
  level: string;
  totalMen: number;
  totalWomen: number;
  totalChildren: number;
  totalYouth: number;
  totalWorkers: number;
  grandTotal: number;
  firstTimers: number;
  salvations: number;
  notes: string;
}

export default function AttendanceHistoryPage() {
  const { selection } = useHierarchy();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    serviceType: '',
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        level: selection.level,
        entityId: selection.level === 'province' ? selection.provinceId :
                  selection.level === 'zone' ? (selection.zoneId || '') :
                  selection.level === 'area' ? (selection.areaId || '') :
                  (selection.parishId || ''),
        limit: '100',
      });
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      if (filters.serviceType) params.set('serviceType', filters.serviceType);

      const res = await fetch(`/api/attendance?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selection.provinceId) fetchRecords();
  }, [selection.level, selection.provinceId, selection.zoneId, selection.areaId, selection.parishId]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this attendance record?')) return;
    try {
      const res = await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Service', 'Entity', 'Men', 'Women', 'Children', 'Youth', 'Workers', 'Total', 'First Timers', 'Salvations', 'Notes'];
    const rows = records.map((r) => [
      r.date, r.serviceLabel, r.entityName, r.totalMen, r.totalWomen, r.totalChildren, r.totalYouth, r.totalWorkers, r.grandTotal, r.firstTimers, r.salvations, `"${r.notes || ''}"`
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selection.level}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/attendance" className="flex items-center gap-1 text-sm text-primary dark:text-primary-light hover:underline mb-2">
            <ChevronLeft size={14} /> Back to Record
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="text-primary" size={24} />
            Attendance History
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={records.length === 0}>
          <Download size={14} className="mr-1" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Service Type</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters((prev) => ({ ...prev, serviceType: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            >
              <option value="">All Services</option>
              {SERVICE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <Button type="submit" size="sm">
            <Filter size={14} className="mr-1" /> Apply
          </Button>
        </form>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16">
            <History className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400">No attendance records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Service</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Entity</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Men</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Women</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Children</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Youth</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Workers</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-300 font-bold">Total</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-300">1st Timers</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {records.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-slate-900 dark:text-white">{formatShortDate(record.date)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="primary">{record.serviceLabel}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{record.entityName}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{record.totalMen}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{record.totalWomen}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{record.totalChildren}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{record.totalYouth}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{record.totalWorkers}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary dark:text-primary-light">{formatNumber(record.grandTotal)}</td>
                    <td className="px-4 py-3 text-right text-green-600">{record.firstTimers > 0 ? `+${record.firstTimers}` : '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(record._id)} className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
