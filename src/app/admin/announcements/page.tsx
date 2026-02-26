'use client';

import { useState, useEffect } from 'react';
import { useHierarchy } from '@/lib/contexts/HierarchyContext';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { Megaphone, Plus, Edit, Trash2, Eye, EyeOff, Bell, AlertTriangle } from 'lucide-react';
import { formatShortDate } from '@/lib/utils/format';

interface Announcement {
  _id: string;
  title: string;
  body: string;
  priority: string;
  category: string;
  visibleToChildren: boolean;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  level: string;
  entityId: string;
  createdAt: string;
}

const PRIORITIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'important', label: 'Important' },
  { value: 'urgent', label: 'Urgent' },
];

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'event', label: 'Event' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'program', label: 'Program' },
];

export default function AnnouncementsPage() {
  const { selection } = useHierarchy();
  const { showToast } = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState({
    title: '',
    body: '',
    priority: 'normal',
    category: 'general',
    visibleToChildren: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const entityId =
        selection.level === 'province' ? selection.provinceId :
        selection.level === 'zone' ? (selection.zoneId || '') :
        selection.level === 'area' ? (selection.areaId || '') :
        (selection.parishId || '');

      const params = new URLSearchParams({
        level: selection.level,
        entityId,
        includeParents: 'true',
      });
      const res = await fetch(`/api/announcements?${params}`);
      if (res.ok) {
        setAnnouncements(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selection.provinceId) fetchAnnouncements();
  }, [selection.level, selection.provinceId, selection.zoneId, selection.areaId, selection.parishId]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      body: '',
      priority: 'normal',
      category: 'general',
      visibleToChildren: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setModalOpen(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditing(ann);
    setForm({
      title: ann.title,
      body: ann.body,
      priority: ann.priority,
      category: ann.category,
      visibleToChildren: ann.visibleToChildren,
      startDate: ann.startDate,
      endDate: ann.endDate || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const entityId =
      selection.level === 'province' ? selection.provinceId :
      selection.level === 'zone' ? (selection.zoneId || '') :
      selection.level === 'area' ? (selection.areaId || '') :
      (selection.parishId || '');

    const payload = {
      ...form,
      level: selection.level,
      entityId,
      province: selection.provinceId,
      zone: selection.zoneId,
      area: selection.areaId,
      parish: selection.parishId,
      isActive: true,
    };

    try {
      const url = editing ? `/api/announcements/${editing._id}` : '/api/announcements';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      if (!res.ok) throw new Error('Failed to save');
      showToast(editing ? 'Announcement updated' : 'Announcement created', 'success');
      setModalOpen(false);
      fetchAnnouncements();
    } catch {
      showToast('Failed to save announcement', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      showToast('Announcement deleted', 'success');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const toggleActive = async (ann: Announcement) => {
    try {
      await fetch(`/api/announcements/${ann._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !ann.isActive }),
      });
      fetchAnnouncements();
    } catch {
      showToast('Failed to update', 'error');
    }
  };

  const priorityBadge = (priority: string) => {
    const map: Record<string, 'primary' | 'warning' | 'danger'> = { normal: 'primary', important: 'warning', urgent: 'danger' };
    return <Badge variant={map[priority] || 'primary'}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="text-primary" size={24} />
            Announcements
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage announcements for {
              selection.level === 'province' ? selection.provinceName :
              selection.level === 'zone' ? selection.zoneName :
              selection.level === 'area' ? selection.areaName :
              selection.parishName
            }
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-1" /> New Announcement
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Spinner /></div>
      ) : announcements.length === 0 ? (
        <Card className="p-16 text-center">
          <Megaphone className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400 mb-4">No announcements yet</p>
          <Button onClick={openCreate}>Create First Announcement</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <Card key={ann._id} className={`p-5 ${!ann.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {ann.priority === 'urgent' && <AlertTriangle className="text-red-500" size={16} />}
                    {ann.priority === 'important' && <Bell className="text-yellow-500" size={16} />}
                    <h3 className="font-semibold text-slate-900 dark:text-white">{ann.title}</h3>
                    {priorityBadge(ann.priority)}
                    <Badge variant="info">{ann.category}</Badge>
                    {ann.visibleToChildren && <Badge variant="success">Cascading</Badge>}
                    {!ann.isActive && <Badge variant="danger">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{ann.body}</p>
                  <p className="text-xs text-slate-400">
                    {formatShortDate(ann.startDate)}
                    {ann.endDate && ` — ${formatShortDate(ann.endDate)}`}
                    {' | '}{ann.level} level
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleActive(ann)} className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title={ann.isActive ? 'Deactivate' : 'Activate'}>
                    {ann.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button onClick={() => openEdit(ann)} className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(ann._id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Announcement' : 'New Announcement'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary resize-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date (optional)</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.visibleToChildren}
              onChange={(e) => setForm((prev) => ({ ...prev, visibleToChildren: e.target.checked }))}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Visible to sub-levels (zones, areas, parishes below)</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'} Announcement</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
