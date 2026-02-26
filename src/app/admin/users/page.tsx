'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Users, Plus, Search, Edit2, Trash2, Shield, X, Eye, EyeOff,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import type { IUserData, UserRole, ScopeType } from '@/types';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'super-admin', label: 'Super Admin' },
  { value: 'zone-admin', label: 'Zone Admin' },
  { value: 'area-admin', label: 'Area Admin' },
  { value: 'parish-admin', label: 'Parish Admin' },
  { value: 'group-admin', label: 'Group Admin' },
  { value: 'member', label: 'Member' },
];

const ROLE_COLORS: Record<string, string> = {
  'super-admin': 'danger',
  'zone-admin': 'warning',
  'area-admin': 'info',
  'parish-admin': 'success',
  'group-admin': 'primary',
  'member': 'accent',
};

interface ScopeOption {
  _id: string;
  name: string;
  code?: string;
}

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'member' as UserRole,
  scopeType: 'province' as ScopeType,
  scopeId: '',
  parishId: '',
  naturalGroupId: '',
};

export default function UsersPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [users, setUsers] = useState<IUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUserData | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Scope selection dropdowns
  const [zones, setZones] = useState<ScopeOption[]>([]);
  const [areas, setAreas] = useState<ScopeOption[]>([]);
  const [parishes, setParishes] = useState<ScopeOption[]>([]);
  const [groups, setGroups] = useState<ScopeOption[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (roleFilter) params.set('role', roleFilter);
      const res = await fetch(`/api/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      setUsers(await res.json());
    } catch {
      showToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Load scope options
  useEffect(() => {
    fetch('/api/hierarchy/zones').then(r => r.json()).then(setZones).catch(() => {});
  }, []);

  const loadAreas = async (zoneId: string) => {
    if (!zoneId) { setAreas([]); return; }
    const res = await fetch(`/api/hierarchy/areas?zone=${zoneId}`);
    setAreas(await res.json());
  };

  const loadParishes = async (areaId: string) => {
    if (!areaId) { setParishes([]); return; }
    const res = await fetch(`/api/hierarchy/parishes?area=${areaId}`);
    setParishes(await res.json());
  };

  const loadGroups = async (parishId: string) => {
    if (!parishId) { setGroups([]); return; }
    const res = await fetch(`/api/natural-groups?parish=${parishId}`);
    setGroups(await res.json());
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEditModal = (user: IUserData) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role,
      scopeType: user.scopeType,
      scopeId: user.scopeId || '',
      parishId: user.parishId || '',
      naturalGroupId: user.naturalGroupId || '',
    });
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleRoleChange = (role: UserRole) => {
    const scopeMap: Record<UserRole, ScopeType> = {
      'super-admin': 'province',
      'zone-admin': 'zone',
      'area-admin': 'area',
      'parish-admin': 'parish',
      'group-admin': 'group',
      'member': 'province',
    };
    setForm(prev => ({
      ...prev,
      role,
      scopeType: scopeMap[role],
      scopeId: role === 'super-admin' || role === 'member' ? '' : prev.scopeId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingUser ? `/api/users/${editingUser._id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const payload = { ...form };
      if (editingUser && !payload.password) {
        delete (payload as Record<string, unknown>).password;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      showToast(editingUser ? 'User updated successfully' : 'User created successfully', 'success');
      setModalOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete "${userName}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('User deleted successfully', 'success');
      fetchUsers();
    } catch {
      showToast('Failed to delete user', 'error');
    }
  };

  const needsScopeSelection = !['super-admin', 'member'].includes(form.role);

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-[family-name:var(--font-playfair)]">
            User Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage administrators and members across the hierarchy
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ROLE_OPTIONS.map(({ value, label }) => {
          const count = users.filter(u => u.role === value).length;
          return (
            <Card key={value} className="p-3 text-center cursor-pointer hover:ring-2 hover:ring-primary/30" onClick={() => setRoleFilter(roleFilter === value ? '' : value)}>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}s</p>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Roles</option>
          {ROLE_OPTIONS.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center">
          <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No users found</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {users.map((user) => (
            <Card key={user._id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={ROLE_COLORS[user.role] as 'primary' | 'accent' | 'success' | 'info' | 'danger' | 'warning' || 'primary'}>
                    {user.role}
                  </Badge>
                  <div className={`w-2.5 h-2.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-slate-300'}`} title={user.isActive ? 'Active' : 'Inactive'} />
                  <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:text-primary transition-colors" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(user._id, user.name)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password {editingUser ? '(leave blank to keep current)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                    required={!editingUser}
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Scope selection — only for scoped roles */}
              {needsScopeSelection && (
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Assign Scope</p>

                  {['zone-admin', 'area-admin', 'parish-admin', 'group-admin'].includes(form.role) && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Zone</label>
                      <select
                        value={form.role === 'zone-admin' ? form.scopeId : ''}
                        onChange={(e) => {
                          const zoneId = e.target.value;
                          if (form.role === 'zone-admin') {
                            setForm(prev => ({ ...prev, scopeId: zoneId }));
                          }
                          loadAreas(zoneId);
                          setParishes([]);
                          setGroups([]);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                      >
                        <option value="">Select Zone</option>
                        {zones.map(z => (
                          <option key={z._id} value={z._id}>{z.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {['area-admin', 'parish-admin', 'group-admin'].includes(form.role) && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Area</label>
                      <select
                        value={form.role === 'area-admin' ? form.scopeId : ''}
                        onChange={(e) => {
                          const areaId = e.target.value;
                          if (form.role === 'area-admin') {
                            setForm(prev => ({ ...prev, scopeId: areaId }));
                          }
                          loadParishes(areaId);
                          setGroups([]);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                      >
                        <option value="">Select Area</option>
                        {areas.map(a => (
                          <option key={a._id} value={a._id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {['parish-admin', 'group-admin'].includes(form.role) && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Parish</label>
                      <select
                        value={form.role === 'parish-admin' ? form.scopeId : form.parishId}
                        onChange={(e) => {
                          const parishId = e.target.value;
                          if (form.role === 'parish-admin') {
                            setForm(prev => ({ ...prev, scopeId: parishId, parishId }));
                          } else {
                            setForm(prev => ({ ...prev, parishId }));
                          }
                          loadGroups(parishId);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                      >
                        <option value="">Select Parish</option>
                        {parishes.map(p => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {form.role === 'group-admin' && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Natural Group</label>
                      <select
                        value={form.scopeId}
                        onChange={(e) => setForm(prev => ({ ...prev, scopeId: e.target.value, naturalGroupId: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                      >
                        <option value="">Select Group</option>
                        {groups.map(g => (
                          <option key={g._id} value={g._id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
