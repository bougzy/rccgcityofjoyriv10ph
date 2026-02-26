'use client';

import { useState, useEffect } from 'react';
import { useHierarchy } from '@/lib/contexts/HierarchyContext';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { Network, ChevronRight, ChevronDown, Plus, Edit, Trash2, MapPin, User, Building } from 'lucide-react';

interface HierarchyNode {
  _id: string;
  name: string;
  code: string;
  type: 'zone' | 'area' | 'parish';
  pastorName?: string;
  isHeadquarters?: boolean;
  children?: HierarchyNode[];
}

interface FormState {
  type: 'zone' | 'area' | 'parish';
  parentId?: string;
  parentName?: string;
  _id?: string;
  name: string;
  code: string;
  pastorName: string;
  pastorPhone: string;
  pastorEmail: string;
  address: string;
  isHeadquarters: boolean;
}

const emptyForm: FormState = {
  type: 'zone',
  name: '',
  code: '',
  pastorName: '',
  pastorPhone: '',
  pastorEmail: '',
  address: '',
  isHeadquarters: false,
};

export default function HierarchyPage() {
  const { selection } = useHierarchy();
  const { showToast } = useToast();

  const [tree, setTree] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const [zonesRes, areasRes, parishesRes] = await Promise.all([
        fetch('/api/hierarchy/zones'),
        fetch('/api/hierarchy/areas'),
        fetch('/api/hierarchy/parishes'),
      ]);

      const zones = await zonesRes.json();
      const areas = await areasRes.json();
      const parishes = await parishesRes.json();

      const tree: HierarchyNode[] = zones.map((zone: { _id: string; name: string; code: string; zonalPastorName: string }) => ({
        _id: zone._id,
        name: zone.name,
        code: zone.code,
        type: 'zone' as const,
        pastorName: zone.zonalPastorName,
        children: areas
          .filter((a: { zone: string }) => a.zone === zone._id || (a.zone as { _id?: string })?._id === zone._id)
          .map((area: { _id: string; name: string; code: string; areaPastorName: string }) => ({
            _id: area._id,
            name: area.name,
            code: area.code,
            type: 'area' as const,
            pastorName: area.areaPastorName,
            children: parishes
              .filter((p: { area: string }) => p.area === area._id || (p.area as { _id?: string })?._id === area._id)
              .map((parish: { _id: string; name: string; code: string; pastorName: string; isHeadquarters: boolean }) => ({
                _id: parish._id,
                name: parish.name,
                code: parish.code,
                type: 'parish' as const,
                pastorName: parish.pastorName,
                isHeadquarters: parish.isHeadquarters,
              })),
          })),
      }));

      setTree(tree);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = (type: 'zone' | 'area' | 'parish', parentId?: string, parentName?: string) => {
    setForm({ ...emptyForm, type, parentId, parentName });
    setModalOpen(true);
  };

  const openEdit = (node: HierarchyNode) => {
    setForm({
      type: node.type,
      _id: node._id,
      name: node.name,
      code: node.code,
      pastorName: node.pastorName || '',
      pastorPhone: '',
      pastorEmail: '',
      address: '',
      isHeadquarters: node.isHeadquarters || false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const urlMap = { zone: 'zones', area: 'areas', parish: 'parishes' };
    const basePath = `/api/hierarchy/${urlMap[form.type]}`;

    const body: Record<string, unknown> = {
      name: form.name,
      code: form.code,
      province: selection.provinceId,
    };

    if (form.type === 'zone') {
      body.zonalPastorName = form.pastorName;
      body.zonalPastorPhone = form.pastorPhone;
      body.zonalPastorEmail = form.pastorEmail;
    } else if (form.type === 'area') {
      body.zone = form.parentId;
      body.areaPastorName = form.pastorName;
      body.areaPastorPhone = form.pastorPhone;
      body.areaPastorEmail = form.pastorEmail;
    } else {
      body.area = form.parentId;
      body.pastorName = form.pastorName;
      body.pastorPhone = form.pastorPhone;
      body.pastorEmail = form.pastorEmail;
      body.address = form.address;
      body.isHeadquarters = form.isHeadquarters;
    }

    try {
      const url = form._id ? `${basePath}/${form._id}` : basePath;
      const method = form._id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

      if (!res.ok) throw new Error('Failed');
      showToast(`${form.type} ${form._id ? 'updated' : 'created'} successfully`, 'success');
      setModalOpen(false);
      fetchTree();
    } catch {
      showToast(`Failed to save ${form.type}`, 'error');
    }
  };

  const handleDelete = async (node: HierarchyNode) => {
    const childWarning = node.children && node.children.length > 0
      ? ` This will also delete ${node.children.length} child ${node.type === 'zone' ? 'areas' : 'parishes'} and all their children.`
      : '';
    if (!confirm(`Delete ${node.name}?${childWarning}`)) return;

    const urlMap = { zone: 'zones', area: 'areas', parish: 'parishes' };
    try {
      await fetch(`/api/hierarchy/${urlMap[node.type]}/${node._id}`, { method: 'DELETE' });
      showToast(`${node.name} deleted`, 'success');
      fetchTree();
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const renderNode = (node: HierarchyNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node._id);
    const hasChildren = node.children && node.children.length > 0;
    const typeColors = {
      zone: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      area: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      parish: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    };

    return (
      <div key={node._id}>
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group`}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          {hasChildren ? (
            <button onClick={() => toggleNode(node._id)} className="p-0.5 rounded text-slate-400 hover:text-slate-600">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span className="w-5" />
          )}

          <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${typeColors[node.type]}`}>
            {node.type}
          </span>

          <span className="font-medium text-slate-900 dark:text-white">{node.name}</span>
          <span className="text-xs text-slate-400">({node.code})</span>

          {node.pastorName && (
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <User size={12} /> {node.pastorName}
            </span>
          )}

          {node.isHeadquarters && <Badge variant="accent">HQ</Badge>}

          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {node.type === 'zone' && (
              <button
                onClick={() => openCreate('area', node._id, node.name)}
                className="p-1 rounded text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                title="Add Area"
              >
                <Plus size={14} />
              </button>
            )}
            {node.type === 'area' && (
              <button
                onClick={() => openCreate('parish', node._id, node.name)}
                className="p-1 rounded text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                title="Add Parish"
              >
                <Plus size={14} />
              </button>
            )}
            <button onClick={() => openEdit(node)} className="p-1 rounded text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700">
              <Edit size={14} />
            </button>
            <button onClick={() => handleDelete(node)} className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalZones = tree.length;
  const totalAreas = tree.reduce((sum, z) => sum + (z.children?.length || 0), 0);
  const totalParishes = tree.reduce((sum, z) => sum + (z.children?.reduce((s, a) => s + (a.children?.length || 0), 0) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="text-primary" size={24} />
            Church Hierarchy
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {selection.provinceName} - Manage zones, areas, and parishes
          </p>
        </div>
        <Button onClick={() => openCreate('zone')}>
          <Plus size={16} className="mr-1" /> Add Zone
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Zones', value: totalZones, icon: Building, color: 'bg-blue-500' },
          { label: 'Areas', value: totalAreas, icon: MapPin, color: 'bg-green-500' },
          { label: 'Parishes', value: totalParishes, icon: Building, color: 'bg-purple-500' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center`}>
                <s.icon className="text-white" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tree */}
      <Card className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner /></div>
        ) : tree.length === 0 ? (
          <div className="text-center py-16">
            <Network className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400 mb-4">No hierarchy data yet</p>
            <p className="text-sm text-slate-400 mb-4">Seed the database first by calling POST /api/seed</p>
            <Button onClick={async () => {
              try {
                const res = await fetch('/api/seed', { method: 'POST' });
                const data = await res.json();
                showToast(data.message, 'success');
                fetchTree();
              } catch {
                showToast('Failed to seed', 'error');
              }
            }}>
              Seed Database
            </Button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {/* Province header */}
            <div className="flex items-center gap-2 py-3 px-3 bg-primary/5 dark:bg-primary/10 rounded-lg mb-2">
              <Building className="text-primary" size={20} />
              <span className="font-bold text-primary dark:text-primary-light text-lg">{selection.provinceName}</span>
              <Badge variant="accent">Province</Badge>
            </div>
            {tree.map((zone) => renderNode(zone))}
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`${form._id ? 'Edit' : 'New'} ${form.type.charAt(0).toUpperCase() + form.type.slice(1)}`} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {form.parentName && (
            <p className="text-sm text-slate-500">Parent: <span className="font-medium text-slate-700 dark:text-slate-300">{form.parentName}</span></p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                required
                placeholder={`e.g., ${form.type === 'zone' ? 'Zone 1' : form.type === 'area' ? 'Area 1' : 'Grace Chapel'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                required
                placeholder="e.g., Z1, A1, GC"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {form.type === 'zone' ? 'Zonal Pastor' : form.type === 'area' ? 'Area Pastor' : 'Pastor'} Name
            </label>
            <input
              type="text"
              value={form.pastorName}
              onChange={(e) => setForm((prev) => ({ ...prev, pastorName: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={form.pastorPhone}
                onChange={(e) => setForm((prev) => ({ ...prev, pastorPhone: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={form.pastorEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, pastorEmail: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          {form.type === 'parish' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isHeadquarters}
                  onChange={(e) => setForm((prev) => ({ ...prev, isHeadquarters: e.target.checked }))}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Province Headquarters</span>
              </label>
            </>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{form._id ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
