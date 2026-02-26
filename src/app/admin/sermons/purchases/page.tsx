'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, CheckCircle, XCircle, Clock, Search,
  ExternalLink, Image as ImageIcon, User, Mail, Phone,
  DollarSign, Calendar, FileText, AlertTriangle,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { formatShortDate } from '@/lib/utils/format';

type PurchaseStatus = 'pending' | 'approved' | 'rejected';
type TabFilter = 'all' | PurchaseStatus;

interface SermonPurchase {
  _id: string;
  sermon: {
    _id: string;
    title: string;
    preacher: string;
    thumbnailUrl?: string;
  };
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amount: number;
  currency?: string;
  paymentProof: string;
  status: PurchaseStatus;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<
  PurchaseStatus,
  { label: string; variant: 'warning' | 'success' | 'danger'; icon: typeof Clock }
> = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  approved: { label: 'Approved', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'danger', icon: XCircle },
};

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

function isImageUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.webp') ||
    lower.includes('/image') ||
    lower.includes('cloudinary')
  );
}

export default function PurchaseVerificationPage() {
  const { showToast } = useToast();

  const [purchases, setPurchases] = useState<SermonPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    purchaseId: string;
    action: 'approve' | 'reject';
  } | null>(null);

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('status', activeTab);
      const res = await fetch(`/api/sermons/purchases?${params}`);
      if (!res.ok) throw new Error('Failed to fetch purchases');
      const data = await res.json();
      setPurchases(data);
    } catch {
      showToast('Failed to fetch purchase data', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  // Pending count for header badge
  const pendingCount = purchases.filter((p) => p.status === 'pending').length;

  // Filtered list (search within currently loaded purchases)
  const filteredPurchases = purchases.filter((purchase) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      purchase.buyerName.toLowerCase().includes(query) ||
      purchase.buyerEmail.toLowerCase().includes(query) ||
      purchase.sermon.title.toLowerCase().includes(query) ||
      purchase.buyerPhone.includes(query)
    );
  });

  // Handle approve/reject
  const handleAction = async (purchaseId: string, action: 'approve' | 'reject') => {
    setActionLoading(purchaseId);
    try {
      const res = await fetch('/api/sermons/purchases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId, action }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${action} purchase`);
      }
      showToast(
        `Purchase ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        'success'
      );
      // Update local state to reflect the change
      setPurchases((prev) =>
        prev.map((p) =>
          p._id === purchaseId
            ? { ...p, status: action === 'approve' ? 'approved' : 'rejected' }
            : p
        )
      );
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : `Failed to ${action} purchase`,
        'error'
      );
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  // Initiate action with confirmation
  const initiateAction = (purchaseId: string, action: 'approve' | 'reject') => {
    setConfirmAction({ purchaseId, action });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-[family-name:var(--font-playfair)] flex items-center gap-3">
            <CreditCard className="text-primary" size={24} />
            Payment Verification
            {pendingCount > 0 && (
              <Badge variant="warning">{pendingCount} pending</Badge>
            )}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Review and verify sermon purchase payments
          </p>
        </div>
      </div>

      {/* Tab Filters */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
        {TABS.map((tab) => {
          const tabCount =
            tab.key === 'all'
              ? purchases.length
              : purchases.filter((p) => p.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-primary dark:text-primary-light shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-primary/10 text-primary'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tabCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, phone, or sermon title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Purchase List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredPurchases.length === 0 ? (
        <Card className="p-12 text-center">
          <CreditCard size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {searchQuery ? 'No matching purchases found' : 'No purchases to display'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {searchQuery
              ? 'Try adjusting your search query.'
              : activeTab === 'pending'
              ? 'There are no pending purchases awaiting verification.'
              : 'No sermon purchases have been recorded yet.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPurchases.map((purchase) => {
            const statusConfig = STATUS_CONFIG[purchase.status];
            const StatusIcon = statusConfig.icon;
            const isProofImage = isImageUrl(purchase.paymentProof);
            const isConfirming =
              confirmAction?.purchaseId === purchase._id;
            const isProcessing = actionLoading === purchase._id;

            return (
              <Card key={purchase._id} className="p-5">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Sermon Info */}
                  <div className="flex items-start gap-3 lg:w-56 shrink-0">
                    <div className="w-16 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {purchase.sermon.thumbnailUrl ? (
                        <img
                          src={purchase.sermon.thumbnailUrl}
                          alt={purchase.sermon.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText size={20} className="text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                        {purchase.sermon.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {purchase.sermon.preacher}
                      </p>
                    </div>
                  </div>

                  {/* Buyer Details */}
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <User size={14} className="shrink-0 text-slate-400" />
                        <span className="truncate">{purchase.buyerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Mail size={14} className="shrink-0 text-slate-400" />
                        <span className="truncate">{purchase.buyerEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone size={14} className="shrink-0 text-slate-400" />
                        <span>{purchase.buyerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar size={14} className="shrink-0 text-slate-400" />
                        <span>{formatShortDate(purchase.createdAt)}</span>
                      </div>
                    </div>

                    {/* Amount + Payment Proof */}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5 text-lg font-bold text-slate-900 dark:text-white">
                        <DollarSign size={18} className="text-green-600" />
                        {purchase.amount.toLocaleString()}
                        {purchase.currency && (
                          <span className="text-xs font-normal text-slate-400 ml-1">
                            {purchase.currency}
                          </span>
                        )}
                      </div>

                      {purchase.paymentProof && (
                        <>
                          {isProofImage ? (
                            <a
                              href={purchase.paymentProof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                            >
                              <ImageIcon size={14} />
                              View Proof
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <a
                              href={purchase.paymentProof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                            >
                              <ExternalLink size={14} />
                              Payment Proof
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex flex-col items-end gap-3 lg:w-48 shrink-0">
                    <Badge variant={statusConfig.variant}>
                      <StatusIcon size={12} className="mr-1" />
                      {statusConfig.label}
                    </Badge>

                    {purchase.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        {isConfirming ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <AlertTriangle size={12} className="text-amber-500" />
                              {confirmAction.action === 'approve' ? 'Approve?' : 'Reject?'}
                            </span>
                            <button
                              onClick={() =>
                                handleAction(
                                  confirmAction.purchaseId,
                                  confirmAction.action
                                )
                              }
                              disabled={isProcessing}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50 ${
                                confirmAction.action === 'approve'
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'bg-red-600 hover:bg-red-700'
                              }`}
                            >
                              {isProcessing ? '...' : 'Yes'}
                            </button>
                            <button
                              onClick={() => setConfirmAction(null)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => initiateAction(purchase._id, 'approve')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle size={14} />
                              Approve
                            </button>
                            <button
                              onClick={() => initiateAction(purchase._id, 'reject')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {purchase.status !== 'pending' && (
                      <span className="text-xs text-slate-400">
                        Updated {formatShortDate(purchase.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Image Proof Thumbnail (shown inline if image) */}
                {purchase.paymentProof && isProofImage && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Payment Proof</p>
                    <a
                      href={purchase.paymentProof}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={purchase.paymentProof}
                        alt="Payment proof"
                        className="max-w-xs h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700 hover:opacity-90 transition-opacity"
                      />
                    </a>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
