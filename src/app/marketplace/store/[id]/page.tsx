'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Store, CheckCircle, XCircle, Clock, Eye, Trash2,
  MessageCircle, ShoppingBag, Package, BadgeCheck,
  AlertTriangle, RefreshCw, Search, Filter,
} from 'lucide-react';

type StoreStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

interface MarketplaceStore {
  _id: string;
  storeName: string;
  description: string;
  ownerName: string;
  ownerEmail: string;
  whatsappNumber: string;
  category: string;
  status: StoreStatus;
  setupFeePaid: boolean;
  setupFeeProof?: string;
  totalProducts: number;
  createdAt: string;
  rejectionReason?: string;
}

const STATUS_CONFIG: Record<StoreStatus, { label: string; color: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  suspended: { label: 'Suspended', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400', icon: AlertTriangle },
};

export default function AdminMarketplacePage() {
  const { data: session } = useSession();
  const [stores, setStores] = useState<MarketplaceStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const userRole = (session?.user as { role?: string })?.role;

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/stores?status=all');
      if (res.ok) {
        const data = await res.json();
        setStores(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStores(); }, []);

  const handleAction = async (id: string, status: StoreStatus, extra?: Record<string, string>) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/marketplace/stores/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      });
      if (res.ok) {
        setStores((prev) => prev.map((s) => s._id === id ? { ...s, status, ...extra } : s));
      }
    } finally {
      setActionLoading(null);
      setRejectModal(null);
      setRejectReason('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this store permanently?')) return;
    setActionLoading(id);
    try {
      await fetch(`/api/marketplace/stores/${id}`, { method: 'DELETE' });
      setStores((prev) => prev.filter((s) => s._id !== id));
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = stores.filter((s) => {
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchSearch = !search || s.storeName.toLowerCase().includes(search.toLowerCase()) || s.ownerName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all: stores.length,
    pending: stores.filter((s) => s.status === 'pending').length,
    approved: stores.filter((s) => s.status === 'approved').length,
    rejected: stores.filter((s) => s.status === 'rejected').length,
  };

  if (userRole !== 'super-admin') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle size={40} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Access Restricted</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Only super admins can manage the marketplace.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="text-primary" size={24} />
            Marketplace Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Review store applications and manage listings</p>
        </div>
        <button onClick={fetchStores} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
          <RefreshCw size={15} />Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Stores', value: counts.all, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-700/50' },
          { label: 'Pending Review', value: counts.pending, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Active Stores', value: counts.approved, color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Rejected', value: counts.rejected, color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-white/50 dark:border-white/5`}>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search stores or owners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-slate-400"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filterStatus === status ? 'bg-primary text-white shadow' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-primary/50'}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} {status !== 'all' ? `(${counts[status as keyof typeof counts]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Store list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Store size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No stores found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((store) => {
            const StatusIcon = STATUS_CONFIG[store.status].icon;
            return (
              <div key={store._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Store icon */}
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                    <Store size={22} className="text-primary" />
                  </div>

                  {/* Store info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white">{store.storeName}</h3>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CONFIG[store.status].color}`}>
                        <StatusIcon size={11} />
                        {STATUS_CONFIG[store.status].label}
                      </span>
                      {store.setupFeePaid && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          <BadgeCheck size={11} /> Fee Paid
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{store.ownerName} · {store.ownerEmail}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{store.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><MessageCircle size={11} />{store.whatsappNumber}</span>
                      <span className="flex items-center gap-1"><Package size={11} />{store.totalProducts} products</span>
                      {store.setupFeeProof && (
                        <a href={store.setupFeeProof} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                          <Eye size={11} />View payment proof
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {store.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(store._id, 'approved')}
                          disabled={actionLoading === store._id}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: store._id, name: store.storeName })}
                          disabled={actionLoading === store._id}
                          className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-xs font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </>
                    )}
                    {store.status === 'approved' && (
                      <button
                        onClick={() => handleAction(store._id, 'suspended')}
                        disabled={actionLoading === store._id}
                        className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 text-amber-700 dark:text-amber-400 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                      >
                        <AlertTriangle size={13} /> Suspend
                      </button>
                    )}
                    {(store.status === 'rejected' || store.status === 'suspended') && (
                      <button
                        onClick={() => handleAction(store._id, 'approved')}
                        disabled={actionLoading === store._id}
                        className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 text-green-700 dark:text-green-400 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                      >
                        <CheckCircle size={13} /> Re-approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(store._id)}
                      disabled={actionLoading === store._id}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 text-xs px-2 py-2 rounded-xl transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Reject Store Application</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Rejecting: <span className="font-semibold text-slate-700 dark:text-slate-300">{rejectModal.name}</span></p>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reason for rejection</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-4"
              placeholder="Provide a reason (optional, will be communicated to applicant)"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(rejectModal.id, 'rejected', rejectReason ? { rejectionReason: rejectReason } : {})}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}