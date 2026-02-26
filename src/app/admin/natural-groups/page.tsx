'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Users, Edit2, Search, ChevronDown, ChevronRight,
  Clock, MapPin, User, Phone, Mail, Shield, UserPlus, Trash2,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useHierarchy } from '@/lib/contexts/HierarchyContext';
import { NATURAL_GROUP_DEFINITIONS } from '@/lib/constants/natural-groups';
import type { INaturalGroupData } from '@/types';

interface GroupAdmin {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export default function NaturalGroupsPage() {
  const { showToast } = useToast();
  const { data: session } = useSession();
  const { selection } = useHierarchy();
  const [groups, setGroups] = useState<INaturalGroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<INaturalGroupData | null>(null);
  const [form, setForm] = useState({
    description: '',
    meetingDay: '',
    meetingTime: '',
    meetingVenue: '',
    leaderName: '',
    leaderPhone: '',
    leaderEmail: '',
  });
  const [saving, setSaving] = useState(false);

  // Admin assignment state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningGroup, setAssigningGroup] = useState<INaturalGroupData | null>(null);
  const [groupAdmins, setGroupAdmins] = useState<GroupAdmin[]>([]);
  const [availableUsers, setAvailableUsers] = useState<GroupAdmin[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const userRole = (session?.user as { role?: string })?.role;
  const canAssignAdmins = userRole === 'super-admin' || userRole === 'parish-admin' || userRole === 'area-admin' || userRole === 'zone-admin';

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selection.parishId) params.set('parish', selection.parishId);
      const res = await fetch(`/api/natural-groups?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      setGroups(await res.json());
    } catch {
      showToast('Failed to fetch natural groups', 'error');
    } finally {
      setLoading(false);
    }
  }, [selection.parishId, showToast]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const openEditModal = (group: INaturalGroupData) => {
    setEditingGroup(group);
    setForm({
      description: group.description || '',
      meetingDay: group.meetingDay || '',
      meetingTime: group.meetingTime || '',
      meetingVenue: group.meetingVenue || '',
      leaderName: group.leaderName || '',
      leaderPhone: group.leaderPhone || '',
      leaderEmail: group.leaderEmail || '',
    });
    setModalOpen(true);
  };

  const openAssignModal = async (group: INaturalGroupData) => {
    setAssigningGroup(group);
    setAssignModalOpen(true);
    setLoadingAdmins(true);
    setSelectedUserId('');

    try {
      // Fetch current admins for this group
      const adminsRes = await fetch(`/api/users?scopeType=group&scopeId=${group._id}&role=group-admin`);
      if (adminsRes.ok) {
        const data = await adminsRes.json();
        setGroupAdmins(Array.isArray(data) ? data : data.users || []);
      }

      // Fetch available users (members in the same parish)
      const usersRes = await fetch(`/api/users?parishId=${group.parish}`);
      if (usersRes.ok) {
        const data = await usersRes.json();
        const users = Array.isArray(data) ? data : data.users || [];
        setAvailableUsers(users.filter((u: GroupAdmin) => u.role === 'member'));
      }
    } catch {
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleAssignAdmin = async () => {
    if (!selectedUserId || !assigningGroup) return;
    setAssigning(true);

    try {
      const res = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          role: 'group-admin',
          scopeType: 'group',
          scopeId: assigningGroup._id,
          parishId: assigningGroup.parish,
          naturalGroupId: assigningGroup._id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to assign admin');
      }

      showToast('Admin assigned successfully', 'success');
      openAssignModal(assigningGroup);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to assign admin', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!assigningGroup) return;

    try {
      const res = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          role: 'member',
          scopeType: 'parish',
          scopeId: assigningGroup.parish,
          parishId: assigningGroup.parish,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove admin');
      }

      showToast('Admin removed successfully', 'success');
      openAssignModal(assigningGroup);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to remove admin', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/natural-groups/${editingGroup._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      showToast('Group updated successfully', 'success');
      setModalOpen(false);
      fetchGroups();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const seedGroups = async () => {
    if (!selection.parishId) {
      showToast('Please select a parish first', 'warning');
      return;
    }

    try {
      for (const def of NATURAL_GROUP_DEFINITIONS) {
        await fetch('/api/natural-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parish: selection.parishId,
            name: def.name,
            slug: def.slug,
            type: def.type,
            description: def.description,
            meetingDay: def.defaultMeetingDay,
            meetingTime: def.defaultMeetingTime,
          }),
        });
      }
      showToast('Natural groups seeded successfully', 'success');
      fetchGroups();
    } catch {
      showToast('Failed to seed groups', 'error');
    }
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-[family-name:var(--font-playfair)]">
            Natural Groups
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {selection.parishName
              ? `Manage natural groups for ${selection.parishName}`
              : 'Select a parish to manage natural groups'}
          </p>
        </div>
        {selection.parishId && groups.length === 0 && !loading && (
          <button
            onClick={seedGroups}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            <Users size={18} />
            Seed All 16 Groups
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up stagger-1">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{groups.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total Groups</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{groups.filter(g => g.isActive).length}</p>
          <p className="text-xs text-slate-500 mt-1">Active</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{groups.filter(g => g.leaderName).length}</p>
          <p className="text-xs text-slate-500 mt-1">With Leaders</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{groups.filter(g => g.meetingDay).length}</p>
          <p className="text-xs text-slate-500 mt-1">Scheduled</p>
        </Card>
      </div>

      {/* Info banner about admin assignment */}
      {canAssignAdmins && selection.parishId && groups.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 animate-fade-in-up stagger-2">
          <Shield size={20} className="text-primary dark:text-primary-light shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-slate-900 dark:text-white">Admin Assignment</p>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              Click the <Shield size={14} className="inline" /> icon on any group to assign up to 2 admins per group.
              Group admins can edit their group&apos;s details, manage attendance, and view group reports.
            </p>
          </div>
        </div>
      )}

      {!selection.parishId ? (
        <Card className="p-12 text-center">
          <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Select a Parish</p>
          <p className="text-slate-400 dark:text-slate-500 mt-2">
            Use the hierarchy switcher above to select a parish and manage its natural groups
          </p>
        </Card>
      ) : (
        <>
          {/* Search */}
          <div className="relative animate-fade-in-up stagger-2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
            />
          </div>

          {/* Groups list */}
          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : filteredGroups.length === 0 ? (
            <Card className="p-12 text-center">
              <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No natural groups found</p>
              <button onClick={seedGroups} className="mt-4 text-sm text-primary hover:underline">
                Seed default groups for this parish
              </button>
            </Card>
          ) : (
            <div className="space-y-3 animate-fade-in-up stagger-3">
              {filteredGroups.map((group) => (
                <Card key={group._id} className="overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/30 dark:hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedGroup(expandedGroup === group._id ? null : group._id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Users size={18} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">{group.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {group.meetingDay && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock size={12} /> {group.meetingDay} {group.meetingTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={group.isActive ? 'success' : 'warning'}>
                        {group.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {canAssignAdmins && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openAssignModal(group); }}
                          className="p-2 text-slate-400 hover:text-primary transition-colors"
                          title="Manage Admins"
                        >
                          <Shield size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(group); }}
                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      {expandedGroup === group._id ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    </div>
                  </div>

                  {expandedGroup === group._id && (
                    <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700/50 pt-3 animate-fade-in">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{group.description || 'No description set.'}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {group.leaderName && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <User size={14} /> <span>{group.leaderName}</span>
                          </div>
                        )}
                        {group.leaderPhone && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Phone size={14} /> <span>{group.leaderPhone}</span>
                          </div>
                        )}
                        {group.leaderEmail && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Mail size={14} /> <span>{group.leaderEmail}</span>
                          </div>
                        )}
                        {group.meetingVenue && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <MapPin size={14} /> <span>{group.meetingVenue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingGroup ? `Edit ${editingGroup.name}` : 'Edit Group'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Meeting Day</label>
              <select
                value={form.meetingDay}
                onChange={(e) => setForm(prev => ({ ...prev, meetingDay: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
              >
                <option value="">Select Day</option>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Meeting Time</label>
              <input
                type="text"
                value={form.meetingTime}
                onChange={(e) => setForm(prev => ({ ...prev, meetingTime: e.target.value }))}
                placeholder="e.g. 5:30 PM"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Meeting Venue</label>
            <input
              type="text"
              value={form.meetingVenue}
              onChange={(e) => setForm(prev => ({ ...prev, meetingVenue: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
            />
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Leader Information</p>
            <div className="space-y-3">
              <input
                type="text"
                value={form.leaderName}
                onChange={(e) => setForm(prev => ({ ...prev, leaderName: e.target.value }))}
                placeholder="Leader Name"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  value={form.leaderPhone}
                  onChange={(e) => setForm(prev => ({ ...prev, leaderPhone: e.target.value }))}
                  placeholder="Phone"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                />
                <input
                  type="email"
                  value={form.leaderEmail}
                  onChange={(e) => setForm(prev => ({ ...prev, leaderEmail: e.target.value }))}
                  placeholder="Email"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Group'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Admin Modal */}
      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title={assigningGroup ? `Manage Admins — ${assigningGroup.name}` : 'Manage Admins'} size="lg">
        {loadingAdmins ? (
          <div className="flex justify-center py-8"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-6">
            {/* Current admins */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Shield size={16} className="text-primary" />
                Current Admins ({groupAdmins.length}/2)
              </h4>
              {groupAdmins.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
                  No admins assigned yet
                </p>
              ) : (
                <div className="space-y-2">
                  {groupAdmins.map((admin) => (
                    <div key={admin._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User size={14} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{admin.name}</p>
                          <p className="text-xs text-slate-500 truncate">{admin.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAdmin(admin._id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove Admin"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assign new admin */}
            {groupAdmins.length < 2 && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <UserPlus size={16} className="text-green-600" />
                  Assign New Admin
                </h4>
                <div className="flex gap-3">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignAdmin}
                    disabled={!selectedUserId || assigning}
                    className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 shrink-0"
                  >
                    {assigning ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
                {availableUsers.length === 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    No available users found. Users must be registered and belong to this parish.
                  </p>
                )}
              </div>
            )}

            {/* How it works */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong>How admin assignment works:</strong> Group admins can edit group details,
                manage attendance, and view group reports. A maximum of 2 admins can be assigned per group.
                Parish admins, area admins, zone admins, and super admins can assign group admins.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
