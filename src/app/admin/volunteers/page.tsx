'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHierarchy } from '@/lib/contexts/HierarchyContext';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { formatShortDate } from '@/lib/utils/format';
import {
  Heart,
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  Phone,
  Mail,
  Filter,
  Calendar,
  Wrench,
  Clock,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VolunteerData {
  _id: string;
  name: string;
  phone: string;
  email: string;
  parish: { _id: string; name: string } | string;
  skills: string[];
  availability: string;
  naturalGroups: { _id: string; name: string }[] | string[];
  isActive: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SKILLS = [
  { value: 'music', label: 'Music' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'technical', label: 'Technical' },
  { value: 'ushering', label: 'Ushering' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'driving', label: 'Driving' },
  { value: 'children-ministry', label: 'Children Ministry' },
  { value: 'counseling', label: 'Counseling' },
  { value: 'media', label: 'Media' },
  { value: 'hospitality', label: 'Hospitality' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'both', label: 'Both' },
  { value: 'flexible', label: 'Flexible' },
];

const SKILL_BADGE_COLORS: Record<string, string> = {
  music: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  teaching: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  technical: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  ushering: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  cooking: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  driving: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  'children-ministry': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  counseling: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  media: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  hospitality: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

const DEFAULT_FORM = {
  name: '',
  phone: '',
  email: '',
  skills: [] as string[],
  availability: 'flexible',
  naturalGroups: [] as string[],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getParishId(selection: { level: string; parishId: string | null }): string {
  return selection.parishId || '';
}

function getParishName(volunteer: VolunteerData): string {
  if (typeof volunteer.parish === 'object' && volunteer.parish?.name) {
    return volunteer.parish.name;
  }
  return '';
}

function getGroupNames(groups: { _id: string; name: string }[] | string[]): string[] {
  if (!groups || groups.length === 0) return [];
  if (typeof groups[0] === 'object') {
    return (groups as { _id: string; name: string }[]).map((g) => g.name);
  }
  return [];
}

function getSkillLabel(value: string): string {
  return SKILLS.find((s) => s.value === value)?.label || value;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VolunteerDatabasePage() {
  const { selection } = useHierarchy();
  const { showToast } = useToast();

  const [volunteers, setVolunteers] = useState<VolunteerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VolunteerData | null>(null);
  const [form, setForm] = useState({ ...DEFAULT_FORM });

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<VolunteerData | null>(null);

  const parishId = getParishId(selection);

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none';

  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const fetchVolunteers = useCallback(async () => {
    if (!parishId) {
      setVolunteers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ parish: parishId });
      if (filterSkill) params.set('skill', filterSkill);
      if (filterAvailability) params.set('availability', filterAvailability);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/volunteers?${params}`);
      if (!res.ok) throw new Error('Failed to fetch volunteers');
      const data: VolunteerData[] = await res.json();
      setVolunteers(data);
    } catch {
      showToast('Failed to load volunteers', 'error');
    } finally {
      setLoading(false);
    }
  }, [parishId, filterSkill, filterAvailability, searchQuery, showToast]);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const totalVolunteers = volunteers.length;

  const skillBreakdown: Record<string, number> = {};
  volunteers.forEach((v) => {
    v.skills.forEach((skill) => {
      skillBreakdown[skill] = (skillBreakdown[skill] || 0) + 1;
    });
  });

  const topSkills = Object.entries(skillBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // ---------------------------------------------------------------------------
  // Create / Edit
  // ---------------------------------------------------------------------------

  const openCreate = () => {
    setEditing(null);
    setForm({ ...DEFAULT_FORM });
    setModalOpen(true);
  };

  const openEdit = (volunteer: VolunteerData) => {
    setEditing(volunteer);
    setForm({
      name: volunteer.name,
      phone: volunteer.phone || '',
      email: volunteer.email || '',
      skills: [...volunteer.skills],
      availability: volunteer.availability,
      naturalGroups: typeof volunteer.naturalGroups[0] === 'object'
        ? (volunteer.naturalGroups as { _id: string; name: string }[]).map((g) => g._id)
        : [...(volunteer.naturalGroups as string[])],
    });
    setModalOpen(true);
  };

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Name is required', 'warning');
      return;
    }
    if (!parishId) {
      showToast('Please select a parish from the hierarchy', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        parish: parishId,
        skills: form.skills,
        availability: form.availability,
        naturalGroups: form.naturalGroups.length > 0 ? form.naturalGroups : undefined,
      };

      const url = editing ? `/api/volunteers/${editing._id}` : '/api/volunteers';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save volunteer');
      }

      showToast(
        editing ? 'Volunteer updated successfully' : 'Volunteer added successfully',
        'success'
      );
      setModalOpen(false);
      fetchVolunteers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save volunteer';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/volunteers/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setVolunteers((prev) => prev.filter((v) => v._id !== deleteTarget._id));
      showToast('Volunteer removed', 'success');
    } catch {
      showToast('Failed to delete volunteer', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // ---------------------------------------------------------------------------
  // No parish selected guard
  // ---------------------------------------------------------------------------

  if (!parishId) {
    return (
      <div className="space-y-6 page-enter">
        <div>
          <h1
            className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-[family-name:var(--font-playfair)]"
          >
            <Heart className="text-primary" size={24} />
            Volunteer Database
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage volunteers and their skills
          </p>
        </div>
        <Card className="p-16 text-center">
          <Heart className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400">
            Please select a parish from the hierarchy to view volunteers.
          </p>
        </Card>
      </div>
    );
  }

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
            <Heart className="text-primary" size={24} />
            Volunteer Database
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage volunteers for {selection.parishName}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-1" /> Add Volunteer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalVolunteers}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Volunteers</p>
            </div>
          </div>
        </Card>
        {topSkills.slice(0, 3).map(([skill, count]) => (
          <Card key={skill} className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                <Wrench size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{getSkillLabel(skill)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Skill Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Skills</option>
              {SKILLS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Availability</option>
            {AVAILABILITY_OPTIONS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Volunteer List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : volunteers.length === 0 ? (
        <Card className="p-16 text-center">
          <Heart className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {searchQuery.trim() || filterSkill || filterAvailability
              ? 'No volunteers match your filters'
              : 'No volunteers registered yet'}
          </p>
          {!searchQuery.trim() && !filterSkill && !filterAvailability && (
            <Button onClick={openCreate}>Add First Volunteer</Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {volunteers.map((volunteer) => {
            const parishName = getParishName(volunteer);
            const groupNames = getGroupNames(
              volunteer.naturalGroups as { _id: string; name: string }[]
            );

            return (
              <Card key={volunteer._id} className="p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Volunteer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                        {volunteer.name}
                      </h3>
                      <Badge variant="info">
                        {AVAILABILITY_OPTIONS.find((a) => a.value === volunteer.availability)?.label || volunteer.availability}
                      </Badge>
                      {parishName && <Badge variant="primary">{parishName}</Badge>}
                    </div>

                    {/* Skills */}
                    {volunteer.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {volunteer.skills.map((skill) => (
                          <span
                            key={skill}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              SKILL_BADGE_COLORS[skill] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {getSkillLabel(skill)}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                      {volunteer.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone size={14} className="shrink-0" />
                          {volunteer.phone}
                        </span>
                      )}
                      {volunteer.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail size={14} className="shrink-0" />
                          {volunteer.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="shrink-0" />
                        Joined {formatShortDate(volunteer.createdAt)}
                      </span>
                    </div>

                    {/* Natural Groups */}
                    {groupNames.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                        <Clock size={12} className="shrink-0" />
                        Groups: {groupNames.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(volunteer)}
                      className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(volunteer)}
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
        title={editing ? 'Edit Volunteer' : 'Add Volunteer'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className={labelClass}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={inputClass}
              placeholder="Volunteer full name"
              required
            />
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className={inputClass}
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className={inputClass}
                placeholder="Email address"
              />
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className={labelClass}>Availability</label>
            <select
              value={form.availability}
              onChange={(e) => setForm((p) => ({ ...p, availability: e.target.value }))}
              className={inputClass}
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Skills (multi-select) */}
          <div>
            <label className={labelClass}>Skills</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((skill) => {
                const isSelected = form.skills.includes(skill.value);
                return (
                  <button
                    key={skill.value}
                    type="button"
                    onClick={() => toggleSkill(skill.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      isSelected
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {skill.label}
                  </button>
                );
              })}
            </div>
            {form.skills.length > 0 && (
              <p className="text-xs text-slate-400 mt-1.5">
                {form.skills.length} skill{form.skills.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Parish Info (read-only) */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-xs text-slate-500 dark:text-slate-400">
            Parish: <span className="font-medium">{selection.parishName}</span>
          </div>

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
                'Update Volunteer'
              ) : (
                'Add Volunteer'
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
        title="Remove Volunteer"
        size="sm"
      >
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Are you sure you want to remove{' '}
          <span className="font-semibold text-slate-900 dark:text-white">
            {deleteTarget?.name}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
}
