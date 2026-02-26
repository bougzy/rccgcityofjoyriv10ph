'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatShortDate } from '@/lib/utils/format';
import {
  Sparkles,
  Search,
  CheckCircle,
  XCircle,
  Star,
  StarOff,
  Trash2,
  Clock,
  Users,
  Award,
  ShieldCheck,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TestimonyData {
  _id: string;
  authorName: string;
  authorEmail: string;
  title: string;
  body: string;
  category: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type FilterTab = 'all' | 'pending' | 'approved' | 'featured';

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'featured', label: 'Featured' },
];

const CATEGORY_BADGE: Record<string, 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'info' | 'yaya'> = {
  healing: 'danger',
  provision: 'success',
  salvation: 'accent',
  deliverance: 'warning',
  breakthrough: 'info',
  other: 'primary',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TestimonyModerationPage() {
  const { showToast } = useToast();

  const [testimonies, setTestimonies] = useState<TestimonyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const fetchTestimonies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/testimonies?limit=200');
      if (!res.ok) throw new Error('Failed to fetch testimonies');
      const data: TestimonyData[] = await res.json();
      setTestimonies(data);
    } catch {
      showToast('Failed to load testimonies', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTestimonies();
  }, [fetchTestimonies]);

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  const filtered = testimonies.filter((t) => {
    if (activeTab === 'pending' && t.isApproved) return false;
    if (activeTab === 'approved' && !t.isApproved) return false;
    if (activeTab === 'featured' && !t.isFeatured) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.authorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const totalCount = testimonies.length;
  const pendingCount = testimonies.filter((t) => !t.isApproved).length;
  const approvedCount = testimonies.filter((t) => t.isApproved).length;
  const featuredCount = testimonies.filter((t) => t.isFeatured).length;

  const statCards = [
    {
      label: 'Total',
      value: totalCount,
      icon: Sparkles,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: Clock,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      label: 'Approved',
      value: approvedCount,
      icon: ShieldCheck,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      label: 'Featured',
      value: featuredCount,
      icon: Award,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
    },
  ];

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleApprove = async (testimony: TestimonyData) => {
    setActionLoading(testimony._id);
    try {
      const res = await fetch(`/api/testimonies/${testimony._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true }),
      });
      if (!res.ok) throw new Error('Failed to approve');
      showToast('Testimony approved', 'success');
      fetchTestimonies();
    } catch {
      showToast('Failed to approve testimony', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnapprove = async (testimony: TestimonyData) => {
    setActionLoading(testimony._id);
    try {
      const res = await fetch(`/api/testimonies/${testimony._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: false }),
      });
      if (!res.ok) throw new Error('Failed to unapprove');
      showToast('Testimony unapproved', 'success');
      fetchTestimonies();
    } catch {
      showToast('Failed to update testimony', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (testimony: TestimonyData) => {
    setActionLoading(testimony._id);
    try {
      const res = await fetch(`/api/testimonies/${testimony._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !testimony.isFeatured }),
      });
      if (!res.ok) throw new Error('Failed to update');
      showToast(
        testimony.isFeatured ? 'Testimony unfeatured' : 'Testimony featured',
        'success'
      );
      fetchTestimonies();
    } catch {
      showToast('Failed to update testimony', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (testimony: TestimonyData) => {
    if (!confirm(`Delete testimony "${testimony.title}"? This cannot be undone.`)) return;
    setActionLoading(testimony._id);
    try {
      const res = await fetch(`/api/testimonies/${testimony._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setTestimonies((prev) => prev.filter((t) => t._id !== testimony._id));
      showToast('Testimony deleted', 'success');
    } catch {
      showToast('Failed to delete testimony', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-[family-name:var(--font-playfair)]"
        >
          <Sparkles className="text-primary" size={24} />
          Testimony Moderation
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review, approve, and feature testimonies shared by members
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      )}

      {/* Filter Tabs + Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => {
            let count = 0;
            if (tab.value === 'all') count = totalCount;
            else if (tab.value === 'pending') count = pendingCount;
            else if (tab.value === 'approved') count = approvedCount;
            else if (tab.value === 'featured') count = featuredCount;

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.value
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs opacity-75">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Testimony List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-16 text-center">
          <Sparkles className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400">
            {searchQuery.trim()
              ? 'No testimonies match your search'
              : activeTab !== 'all'
                ? `No ${activeTab} testimonies`
                : 'No testimonies yet'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((testimony) => {
            const isLoading = actionLoading === testimony._id;

            return (
              <Card key={testimony._id} className={`p-5 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Testimony Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {testimony.isFeatured && (
                        <Star size={16} className="text-yellow-500 fill-yellow-500 shrink-0" />
                      )}
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                        {testimony.title}
                      </h3>
                      <Badge variant={CATEGORY_BADGE[testimony.category] || 'primary'}>
                        {testimony.category}
                      </Badge>
                      {testimony.isApproved ? (
                        <Badge variant="success">Approved</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                      {testimony.isFeatured && (
                        <Badge variant="accent">Featured</Badge>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {testimony.body}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="shrink-0" />
                        {testimony.authorName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="shrink-0" />
                        {formatShortDate(testimony.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!testimony.isApproved ? (
                      <button
                        onClick={() => handleApprove(testimony)}
                        className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnapprove(testimony)}
                        className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        title="Unapprove"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleFeatured(testimony)}
                      className={`p-2 rounded-lg transition-colors ${
                        testimony.isFeatured
                          ? 'text-yellow-500 hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                      }`}
                      title={testimony.isFeatured ? 'Unfeature' : 'Feature'}
                    >
                      {testimony.isFeatured ? <StarOff size={16} /> : <Star size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(testimony)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
