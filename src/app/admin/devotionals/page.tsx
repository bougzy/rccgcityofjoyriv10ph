'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { formatShortDate } from '@/lib/utils/format';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
  BookMarked,
  FileText,
  Send,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DevotionalData {
  _id: string;
  title: string;
  date: string;
  scripture: string;
  body: string;
  author: string;
  coverImage: string;
  isPublished: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_FORM = {
  title: '',
  date: '',
  scripture: '',
  body: '',
  author: '',
  isPublished: false,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DevotionalManagementPage() {
  const { showToast } = useToast();

  const [devotionals, setDevotionals] = useState<DevotionalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DevotionalData | null>(null);
  const [form, setForm] = useState({ ...DEFAULT_FORM });

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<DevotionalData | null>(null);

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none';

  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const fetchDevotionals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/devotionals?limit=100');
      if (!res.ok) throw new Error('Failed to fetch devotionals');
      const data: DevotionalData[] = await res.json();
      setDevotionals(data);
    } catch {
      showToast('Failed to load devotionals', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDevotionals();
  }, [fetchDevotionals]);

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const totalCount = devotionals.length;
  const publishedCount = devotionals.filter((d) => d.isPublished).length;
  const draftCount = devotionals.filter((d) => !d.isPublished).length;
  const thisMonthCount = devotionals.filter((d) => {
    const devDate = new Date(d.date);
    const now = new Date();
    return devDate.getMonth() === now.getMonth() && devDate.getFullYear() === now.getFullYear();
  }).length;

  const statCards = [
    {
      label: 'Total',
      value: totalCount,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      label: 'Published',
      value: publishedCount,
      icon: Send,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      label: 'Draft',
      value: draftCount,
      icon: FileText,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      label: 'This Month',
      value: thisMonthCount,
      icon: Calendar,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
    },
  ];

  // ---------------------------------------------------------------------------
  // Create / Edit
  // ---------------------------------------------------------------------------

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...DEFAULT_FORM,
      date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openEdit = (devotional: DevotionalData) => {
    setEditing(devotional);
    setForm({
      title: devotional.title,
      date: devotional.date ? devotional.date.split('T')[0] : '',
      scripture: devotional.scripture || '',
      body: devotional.body,
      author: devotional.author || '',
      isPublished: devotional.isPublished,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Title is required', 'warning');
      return;
    }
    if (!form.date) {
      showToast('Date is required', 'warning');
      return;
    }
    if (!form.body.trim()) {
      showToast('Body content is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        date: form.date,
        scripture: form.scripture.trim(),
        body: form.body.trim(),
        author: form.author.trim(),
        isPublished: form.isPublished,
      };

      const url = editing ? `/api/devotionals/${editing._id}` : '/api/devotionals';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save devotional');
      }

      showToast(
        editing ? 'Devotional updated successfully' : 'Devotional created successfully',
        'success'
      );
      setModalOpen(false);
      fetchDevotionals();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save devotional';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Publish Toggle
  // ---------------------------------------------------------------------------

  const handleTogglePublish = async (devotional: DevotionalData) => {
    setActionLoading(devotional._id);
    try {
      const res = await fetch(`/api/devotionals/${devotional._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !devotional.isPublished }),
      });
      if (!res.ok) throw new Error('Failed to update');
      showToast(
        devotional.isPublished ? 'Devotional unpublished' : 'Devotional published',
        'success'
      );
      fetchDevotionals();
    } catch {
      showToast('Failed to update devotional', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/devotionals/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setDevotionals((prev) => prev.filter((d) => d._id !== deleteTarget._id));
      showToast('Devotional deleted', 'success');
    } catch {
      showToast('Failed to delete devotional', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-[family-name:var(--font-playfair)]"
          >
            <BookOpen className="text-primary" size={24} />
            Devotional Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Create, edit, and publish daily devotionals
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-1" /> New Devotional
        </Button>
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

      {/* Devotionals List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : devotionals.length === 0 ? (
        <Card className="p-16 text-center">
          <BookOpen className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400 mb-4">No devotionals yet</p>
          <Button onClick={openCreate}>Create First Devotional</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {devotionals.map((devotional) => {
            const isLoading = actionLoading === devotional._id;

            return (
              <Card key={devotional._id} className={`p-5 ${!devotional.isPublished ? 'opacity-75' : ''} ${isLoading ? 'pointer-events-none' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Devotional Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                        {devotional.title}
                      </h3>
                      {devotional.isPublished ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge variant="warning">Draft</Badge>
                      )}
                    </div>

                    {devotional.scripture && (
                      <p className="text-sm text-primary dark:text-primary/80 mb-1 flex items-center gap-1.5">
                        <BookMarked size={14} className="shrink-0" />
                        {devotional.scripture}
                      </p>
                    )}

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {devotional.body}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="shrink-0" />
                        {formatShortDate(devotional.date)}
                      </span>
                      {devotional.author && (
                        <span className="flex items-center gap-1.5">
                          <User size={14} className="shrink-0" />
                          {devotional.author}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleTogglePublish(devotional)}
                      className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title={devotional.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {devotional.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => openEdit(devotional)}
                      className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(devotional)}
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

      {/* ------------------------------------------------------------------ */}
      {/* Create / Edit Modal                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Devotional' : 'New Devotional'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className={labelClass}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
              placeholder="Devotional title"
              required
            />
          </div>

          {/* Date + Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Author</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                className={inputClass}
                placeholder="Author name"
              />
            </div>
          </div>

          {/* Scripture */}
          <div>
            <label className={labelClass}>Scripture Reference</label>
            <input
              type="text"
              value={form.scripture}
              onChange={(e) => setForm((p) => ({ ...p, scripture: e.target.value }))}
              className={inputClass}
              placeholder="e.g. John 3:16, Psalm 23:1-6"
            />
          </div>

          {/* Body */}
          <div>
            <label className={labelClass}>
              Body <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              rows={8}
              className={`${inputClass} resize-none`}
              placeholder="Write the devotional content..."
              required
            />
          </div>

          {/* Publish Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 dark:bg-slate-600 rounded-full peer-checked:bg-primary transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Publish immediately
            </span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Saving...
                </span>
              ) : editing ? (
                'Update Devotional'
              ) : (
                'Create Devotional'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* Delete Confirmation Modal                                           */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Devotional"
        size="sm"
      >
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-900 dark:text-white">
            {deleteTarget?.title}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
