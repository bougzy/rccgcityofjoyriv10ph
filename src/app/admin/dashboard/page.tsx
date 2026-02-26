'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHierarchy } from '@/lib/contexts/HierarchyContext';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';
import {
  LayoutDashboard, MapPin, Building, Church, Users,
  Megaphone, TrendingUp, UserPlus, Music, BarChart3, Clock,
  CalendarDays, HandHeart, Sparkles, BookMarked, HandHelping,
  HeartHandshake, ArrowRight,
} from 'lucide-react';

interface DashboardCounts {
  events: number;
  sermons: number;
  converts: number;
  prayers: number;
  testimonies: number;
  devotionals: number;
  volunteers: number;
}

const quickLinks = [
  { href: '/admin/events', label: 'Events', icon: CalendarDays, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
  { href: '/admin/converts', label: 'Converts', icon: HeartHandshake, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { href: '/admin/prayers', label: 'Prayers', icon: HandHeart, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' },
  { href: '/admin/testimonies', label: 'Testimonies', icon: Sparkles, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
  { href: '/admin/devotionals', label: 'Devotionals', icon: BookMarked, color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { href: '/admin/volunteers', label: 'Volunteers', icon: HandHelping, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400' },
];

const recentActivity = [
  { text: 'Sunday Service attendance recorded - 245 total', time: '2 hours ago', icon: Users },
  { text: 'New sermon uploaded: "Walking in Divine Favor"', time: '5 hours ago', icon: Music },
  { text: 'Announcement published: "Special Prayer Week"', time: '1 day ago', icon: Megaphone },
  { text: 'Monthly membership snapshot updated', time: '2 days ago', icon: BarChart3 },
  { text: 'Live stream started for Sunday Service', time: '3 days ago', icon: TrendingUp },
];

export default function DashboardPage() {
  const { selection } = useHierarchy();
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);

  const currentName =
    selection.level === 'province' ? selection.provinceName :
    selection.level === 'zone' ? selection.zoneName :
    selection.level === 'area' ? selection.areaName :
    selection.parishName;

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, sermonsRes, convertsRes, prayersRes, testimoniesRes, devotionalsRes] = await Promise.allSettled([
        fetch('/api/events?limit=1000').then(r => r.ok ? r.json() : []),
        fetch('/api/sermons?limit=1000').then(r => r.ok ? r.json() : []),
        fetch('/api/converts?limit=1000').then(r => r.ok ? r.json() : []),
        fetch('/api/prayers?limit=1000').then(r => r.ok ? r.json() : []),
        fetch('/api/testimonies?limit=1000').then(r => r.ok ? r.json() : []),
        fetch('/api/devotionals?limit=1000').then(r => r.ok ? r.json() : []),
      ]);

      setCounts({
        events: eventsRes.status === 'fulfilled' ? (eventsRes.value?.length || 0) : 0,
        sermons: sermonsRes.status === 'fulfilled' ? (sermonsRes.value?.length || 0) : 0,
        converts: convertsRes.status === 'fulfilled' ? (convertsRes.value?.length || 0) : 0,
        prayers: prayersRes.status === 'fulfilled' ? (prayersRes.value?.length || 0) : 0,
        testimonies: testimoniesRes.status === 'fulfilled' ? (testimoniesRes.value?.length || 0) : 0,
        devotionals: devotionalsRes.status === 'fulfilled' ? (devotionalsRes.value?.length || 0) : 0,
        volunteers: 0,
      });
    } catch {
      setCounts({ events: 0, sermons: 0, converts: 0, prayers: 0, testimonies: 0, devotionals: 0, volunteers: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const statCards = [
    { label: 'Events', value: counts?.events ?? '-', icon: CalendarDays, color: 'text-blue-600 dark:text-blue-400', accent: 'bg-blue-500' },
    { label: 'Sermons', value: counts?.sermons ?? '-', icon: Music, color: 'text-emerald-600 dark:text-emerald-400', accent: 'bg-emerald-500' },
    { label: 'New Converts', value: counts?.converts ?? '-', icon: UserPlus, color: 'text-purple-600 dark:text-purple-400', accent: 'bg-purple-500' },
    { label: 'Prayer Requests', value: counts?.prayers ?? '-', icon: HandHeart, color: 'text-amber-600 dark:text-amber-400', accent: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-[family-name:var(--font-playfair)]">
          <LayoutDashboard className="text-primary" size={24} />
          {currentName ? `${currentName} Dashboard` : 'Province Dashboard'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Overview and key metrics for{' '}
          <span className="font-semibold text-primary dark:text-primary-light">
            {currentName || 'Rivers Province 10'}
          </span>
        </p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="relative overflow-hidden">
                <div className={`h-1 ${stat.accent}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <Icon size={20} className={stat.color} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Links */}
      <Card className="p-6 animate-fade-in-up stagger-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:scale-[1.02] transition-transform text-center"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                  <Icon size={22} />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Ministry Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up stagger-3">
        {/* Hierarchy Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-primary" />
            Hierarchy Overview
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Province', value: selection.provinceName || 'Rivers Province 10', icon: MapPin },
              { label: 'Zone', value: selection.zoneName || 'All Zones', icon: Building },
              { label: 'Area', value: selection.areaName || 'All Areas', icon: Building },
              { label: 'Parish', value: selection.parishName || 'All Parishes', icon: Church },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.value}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{activity.text}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Bottom Row - More Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up stagger-4">
        <Card className="p-5 text-center">
          <Sparkles className="mx-auto text-amber-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{counts?.testimonies ?? 0}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Testimonies</p>
          <Link href="/admin/testimonies" className="inline-flex items-center gap-1 text-xs text-primary dark:text-primary-light mt-2">
            Manage <ArrowRight size={12} />
          </Link>
        </Card>
        <Card className="p-5 text-center">
          <BookMarked className="mx-auto text-cyan-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{counts?.devotionals ?? 0}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Devotionals</p>
          <Link href="/admin/devotionals" className="inline-flex items-center gap-1 text-xs text-primary dark:text-primary-light mt-2">
            Manage <ArrowRight size={12} />
          </Link>
        </Card>
        <Card className="p-5 text-center">
          <HandHelping className="mx-auto text-rose-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{counts?.volunteers ?? 0}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Volunteers</p>
          <Link href="/admin/volunteers" className="inline-flex items-center gap-1 text-xs text-primary dark:text-primary-light mt-2">
            Manage <ArrowRight size={12} />
          </Link>
        </Card>
      </div>
    </div>
  );
}
