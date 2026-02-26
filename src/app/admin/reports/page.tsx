'use client';

import { useState, useEffect } from 'react';
import { useHierarchy } from '@/lib/contexts/HierarchyContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { BarChart3, TrendingUp, Users, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { formatNumber } from '@/lib/utils/format';

interface TrendData {
  _id: string;
  totalAttendance: number;
  count: number;
  avgAttendance: number;
}

export default function ReportsPage() {
  const { selection } = useHierarchy();
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [activeTab, setActiveTab] = useState<'attendance' | 'growth' | 'comparison'>('attendance');

  const entityId =
    selection.level === 'province' ? selection.provinceId :
    selection.level === 'zone' ? (selection.zoneId || '') :
    selection.level === 'area' ? (selection.areaId || '') :
    (selection.parishId || '');

  const fetchTrend = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: 'attendance-trend',
        level: selection.level,
        entityId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      const res = await fetch(`/api/reports?${params}`);
      if (res.ok) {
        setTrendData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) fetchTrend();
  }, [selection.level, entityId]);

  const totalAttendance = trendData.reduce((sum, d) => sum + d.totalAttendance, 0);
  const totalServices = trendData.reduce((sum, d) => sum + d.count, 0);
  const avgAttendance = totalServices > 0 ? Math.round(totalAttendance / totalServices) : 0;
  const peakAttendance = trendData.reduce((max, d) => Math.max(max, d.totalAttendance), 0);

  const maxBar = Math.max(...trendData.map((d) => d.totalAttendance), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="text-primary" size={24} />
          Reports & Analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Insights for {
            selection.level === 'province' ? selection.provinceName :
            selection.level === 'zone' ? selection.zoneName :
            selection.level === 'area' ? selection.areaName :
            selection.parishName
          }
        </p>
      </div>

      {/* Date Range */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <Button size="sm" onClick={fetchTrend}>Update</Button>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Attendance', value: formatNumber(totalAttendance), icon: Users, color: 'bg-blue-500' },
          { label: 'Services Recorded', value: formatNumber(totalServices), icon: Calendar, color: 'bg-green-500' },
          { label: 'Average per Service', value: formatNumber(avgAttendance), icon: TrendingUp, color: 'bg-amber-500' },
          { label: 'Peak Attendance', value: formatNumber(peakAttendance), icon: ArrowUp, color: 'bg-purple-500' },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="text-white" size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
        {[
          { key: 'attendance' as const, label: 'Attendance Trend' },
          { key: 'growth' as const, label: 'Growth' },
          { key: 'comparison' as const, label: 'Comparison' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-primary dark:text-primary-light shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner /></div>
        ) : activeTab === 'attendance' ? (
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Monthly Attendance Trend</h3>
            {trendData.length === 0 ? (
              <div className="text-center py-16">
                <BarChart3 className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                <p className="text-slate-500 dark:text-slate-400">No attendance data for this period</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trendData.map((d) => (
                  <div key={d._id} className="flex items-center gap-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400 w-20 shrink-0">{d._id}</span>
                    <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary-light rounded-lg flex items-center justify-end px-2 transition-all duration-500"
                        style={{ width: `${(d.totalAttendance / maxBar) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-white">{formatNumber(d.totalAttendance)}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 w-16 text-right">{d.count} svc</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'growth' ? (
          <div className="text-center py-16">
            <TrendingUp className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400 mb-2">Growth Analytics</p>
            <p className="text-sm text-slate-400">Record membership snapshots monthly to track growth trends over time.</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <BarChart3 className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400 mb-2">Comparison View</p>
            <p className="text-sm text-slate-400">Compare attendance between zones, areas, or parishes side by side.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
