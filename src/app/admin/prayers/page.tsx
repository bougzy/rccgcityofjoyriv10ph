'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatShortDate } from '@/lib/utils/format';
import {
  HandHeart,
  Search,
  CheckCircle,
  XCircle,
  Archive,
  Trash2,
  Clock,
  Users,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PrayerData {
  _id: string;
  authorName: string;
  authorEmail: string;
  title: string;
  body: string;
  isAnonymous: boolean;
  category: string;
  status: string;
  prayerCount: number;
  isApproved: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type FilterTab = 'all' | 'pending' | 'approved' | 'answered' | 'archived';

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'answered', label: 'Answered' },
  { value: 'archived', label: 'Archived' },
];

const CATEGORY_BADGE: Record<string, 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'info' | 'yaya'> = {
  healing: 'danger',
  provision: 'success',
  family: 'yaya',
  guidance: 'info',
  thanksgiving: 'accent',
  other: 'primary',
};

const STATUS_BADGE: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
  active: 'primary',
  answered: 'success',
  archived: 'warning',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PrayerModerationPage() {
  const { showToast } = useToast();

  const [prayers, setPrayers] = useState<PrayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const fetchPrayers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prayers?limit=200');
      if (!res.ok) throw new Error('Failed to fetch prayers');
      const data: PrayerData[] = await res.json();
      setPrayers(data);
    } catch {
      showToast('Failed to load prayer requests', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPrayers();
  }, [fetchPrayers]);

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  const filtered = prayers.filter((p) => {
    // Tab filter
    if (activeTab === 'pending' && p.isApproved) return false;
    if (activeTab === 'pending' && p.status !== 'active') return false;
    if (activeTab === 'approved' && !p.isApproved) return false;
    if (activeTab === 'answered' && p.status !== 'answered') return false;
    if (activeTab === 'archived' && p.status !== 'archived') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const totalCount = prayers.length;
  const pendingCount = prayers.filter((p) => !p.isApproved && p.status === 'active').length;
  const activeCount = prayers.filter((p) => p.isApproved && p.status === 'active').length;
  const answeredCount = prayers.filter((p) => p.status === 'answered').length;

  const statCards = [
    {
      label: 'Total Requests',
      value: totalCount,
      icon: HandHeart,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      label: 'Pending Review',
      value: pendingCount,
      icon: Clock,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      label: 'Active',
      value: activeCount,
      icon: ShieldCheck,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      label: 'Answered',
      value: answeredCount,
      icon: CheckCircle,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
    },
  ];

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleApprove = async (prayer: PrayerData) => {
    setActionLoading(prayer._id);
    try {
      const res = await fetch(`/api/prayers/${prayer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true }),
      });
      if (!res.ok) throw new Error('Failed to approve');
      showToast('Prayer request approved', 'success');
      fetchPrayers();
    } catch {
      showToast('Failed to approve prayer request', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (prayer: PrayerData) => {
    setActionLoading(prayer._id);
    try {
      const res = await fetch(`/api/prayers/${prayer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: false }),
      });
      if (!res.ok) throw new Error('Failed to reject');
      showToast('Prayer request unapproved', 'success');
      fetchPrayers();
    } catch {
      showToast('Failed to update prayer request', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (prayer: PrayerData, status: string) => {
    setActionLoading(prayer._id);
    try {
      const res = await fetch(`/api/prayers/${prayer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      showToast(`Prayer marked as ${status}`, 'success');
      fetchPrayers();
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (prayer: PrayerData) => {
    if (!confirm(`Delete prayer request "${prayer.title}"? This cannot be undone.`)) return;
    setActionLoading(prayer._id);
    try {
      const res = await fetch(`/api/prayers/${prayer._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setPrayers((prev) => prev.filter((p) => p._id !== prayer._id));
      showToast('Prayer request deleted', 'success');
    } catch {
      showToast('Failed to delete prayer request', 'error');
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
          <HandHeart className="text-primary" size={24} />
          Prayer Request Moderation
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review, approve, and manage prayer requests submitted by members
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
            else if (tab.value === 'approved') count = prayers.filter((p) => p.isApproved).length;
            else if (tab.value === 'answered') count = answeredCount;
            else if (tab.value === 'archived') count = prayers.filter((p) => p.status === 'archived').length;

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

      {/* Prayer List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-16 text-center">
          <HandHeart className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400">
            {searchQuery.trim()
              ? 'No prayer requests match your search'
              : activeTab !== 'all'
                ? `No ${activeTab} prayer requests`
                : 'No prayer requests yet'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((prayer) => {
            const isLoading = actionLoading === prayer._id;

            return (
              <Card key={prayer._id} className={`p-5 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Prayer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                        {prayer.title}
                      </h3>
                      <Badge variant={CATEGORY_BADGE[prayer.category] || 'primary'}>
                        {prayer.category}
                      </Badge>
                      <Badge variant={STATUS_BADGE[prayer.status] || 'primary'}>
                        {prayer.status}
                      </Badge>
                      {prayer.isApproved ? (
                        <Badge variant="success">Approved</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {prayer.body}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="shrink-0" />
                        {prayer.isAnonymous ? 'Anonymous' : prayer.authorName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle size={14} className="shrink-0" />
                        {prayer.prayerCount} prayer{prayer.prayerCount !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="shrink-0" />
                        {formatShortDate(prayer.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!prayer.isApproved && prayer.status === 'active' && (
                      <button
                        onClick={() => handleApprove(prayer)}
                        className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {prayer.isApproved && (
                      <button
                        onClick={() => handleReject(prayer)}
                        className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        title="Unapprove"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                    {prayer.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(prayer, 'answered')}
                        className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        title="Mark as Answered"
                      >
                        <ShieldCheck size={16} />
                      </button>
                    )}
                    {prayer.status !== 'archived' && (
                      <button
                        onClick={() => handleStatusChange(prayer, 'archived')}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Archive"
                      >
                        <Archive size={16} />
                      </button>
                    )}
                    {prayer.status === 'archived' && (
                      <button
                        onClick={() => handleStatusChange(prayer, 'active')}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Restore to Active"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(prayer)}
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
