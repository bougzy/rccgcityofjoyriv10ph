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
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Link2,
  Download,
  ChevronUp,
  ChevronDown,
  X,
  ClipboardCopy,
  Hash,
  Inbox,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'date'
  | 'textarea';

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: string; // comma-separated for dropdown/radio/checkbox
}

interface DynamicForm {
  _id: string;
  title: string;
  description: string;
  fields: FormField[];
  formToken: string;
  level: string;
  entityId: string;
  province?: string;
  zone?: string | null;
  area?: string | null;
  parish?: string | null;
  expiresAt?: string;
  maxSubmissions?: number;
  submissionCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Submission {
  _id: string;
  formId: string;
  values: Record<string, string | string[]>;
  submittedAt: string;
}

// ---------------------------------------------------------------------------
// Field-type metadata
// ---------------------------------------------------------------------------

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'file', label: 'File Upload' },
  { value: 'date', label: 'Date' },
  { value: 'textarea', label: 'Textarea' },
];

const TYPES_WITH_OPTIONS: FieldType[] = ['dropdown', 'radio', 'checkbox'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid(): string {
  return Math.random().toString(36).substring(2, 10);
}

function emptyField(): FormField {
  return { id: uid(), label: '', type: 'text', required: false, options: '' };
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary text-sm';

const selectCls =
  'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm';

const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function FormsPage() {
  const { selection } = useHierarchy();
  const { showToast } = useToast();

  // --- list state ---
  const [forms, setForms] = useState<DynamicForm[]>([]);
  const [loading, setLoading] = useState(true);

  // --- create/edit modal ---
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<DynamicForm | null>(null);
  const [saving, setSaving] = useState(false);

  // form fields state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([emptyField()]);
  const [expiresAt, setExpiresAt] = useState('');
  const [maxSubmissions, setMaxSubmissions] = useState('');

  // --- submissions modal ---
  const [subsModalOpen, setSubsModalOpen] = useState(false);
  const [subsForm, setSubsForm] = useState<DynamicForm | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // Derived hierarchy helpers
  // ---------------------------------------------------------------------------

  const getEntityId = useCallback(() => {
    if (selection.level === 'province') return selection.provinceId;
    if (selection.level === 'zone') return selection.zoneId || '';
    if (selection.level === 'area') return selection.areaId || '';
    return selection.parishId || '';
  }, [selection]);

  const getEntityName = useCallback(() => {
    if (selection.level === 'province') return selection.provinceName;
    if (selection.level === 'zone') return selection.zoneName;
    if (selection.level === 'area') return selection.areaName;
    return selection.parishName;
  }, [selection]);

  // ---------------------------------------------------------------------------
  // Fetch forms
  // ---------------------------------------------------------------------------

  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        level: selection.level,
        entityId: getEntityId(),
      });
      const res = await fetch(`/api/forms?${params}`);
      if (res.ok) {
        const data = await res.json();
        setForms(Array.isArray(data) ? data : data.forms ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch forms', err);
    } finally {
      setLoading(false);
    }
  }, [selection.level, getEntityId]);

  useEffect(() => {
    if (selection.provinceId) fetchForms();
  }, [selection.level, selection.provinceId, selection.zoneId, selection.areaId, selection.parishId, fetchForms]);

  // ---------------------------------------------------------------------------
  // Form status helpers
  // ---------------------------------------------------------------------------

  function isExpired(form: DynamicForm): boolean {
    if (!form.expiresAt) return false;
    return new Date(form.expiresAt) < new Date();
  }

  function statusBadge(form: DynamicForm) {
    if (isExpired(form)) return <Badge variant="danger">Expired</Badge>;
    if (!form.isActive) return <Badge variant="warning">Inactive</Badge>;
    return <Badge variant="success">Active</Badge>;
  }

  // ---------------------------------------------------------------------------
  // Create / Edit modal handlers
  // ---------------------------------------------------------------------------

  function openCreate() {
    setEditingForm(null);
    setTitle('');
    setDescription('');
    setFields([emptyField()]);
    setExpiresAt('');
    setMaxSubmissions('');
    setFormModalOpen(true);
  }

  function openEdit(form: DynamicForm) {
    setEditingForm(form);
    setTitle(form.title);
    setDescription(form.description || '');
    setFields(
      form.fields && form.fields.length > 0
        ? form.fields.map((f) => ({ ...f, id: f.id || uid() }))
        : [emptyField()]
    );
    setExpiresAt(form.expiresAt ? form.expiresAt.split('T')[0] : '');
    setMaxSubmissions(form.maxSubmissions ? String(form.maxSubmissions) : '');
    setFormModalOpen(true);
  }

  // ---------------------------------------------------------------------------
  // Field management
  // ---------------------------------------------------------------------------

  function updateField(id: string, patch: Partial<FormField>) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function removeField(id: string) {
    setFields((prev) => {
      const next = prev.filter((f) => f.id !== id);
      return next.length === 0 ? [emptyField()] : next;
    });
  }

  function addField() {
    setFields((prev) => [...prev, emptyField()]);
  }

  function moveField(idx: number, dir: 'up' | 'down') {
    setFields((prev) => {
      const arr = [...prev];
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= arr.length) return prev;
      [arr[idx], arr[targetIdx]] = [arr[targetIdx], arr[idx]];
      return arr;
    });
  }

  // ---------------------------------------------------------------------------
  // Save form
  // ---------------------------------------------------------------------------

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    // Validate fields
    const validFields = fields.filter((f) => f.label.trim() !== '');
    if (validFields.length === 0) {
      showToast('Add at least one field with a label', 'error');
      return;
    }

    // Validate options for types that need them
    for (const f of validFields) {
      if (TYPES_WITH_OPTIONS.includes(f.type) && !f.options.trim()) {
        showToast(`Field "${f.label}" needs options (comma-separated)`, 'error');
        return;
      }
    }

    setSaving(true);

    const payload = {
      title,
      description,
      fields: validFields.map(({ id, ...rest }) => ({ ...rest, id })),
      level: selection.level,
      entityId: getEntityId(),
      province: selection.provinceId,
      zone: selection.zoneId,
      area: selection.areaId,
      parish: selection.parishId,
      expiresAt: expiresAt || undefined,
      maxSubmissions: maxSubmissions ? Number(maxSubmissions) : undefined,
    };

    try {
      const url = editingForm ? `/api/forms/${editingForm._id}` : '/api/forms';
      const method = editingForm ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Failed to save form');
      }

      showToast(editingForm ? 'Form updated' : 'Form created', 'success');
      setFormModalOpen(false);
      fetchForms();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save form', 'error');
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Delete form
  // ---------------------------------------------------------------------------

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this form? All submissions will also be deleted.')) return;
    try {
      const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setForms((prev) => prev.filter((f) => f._id !== id));
      showToast('Form deleted', 'success');
    } catch {
      showToast('Failed to delete form', 'error');
    }
  }

  // ---------------------------------------------------------------------------
  // Copy link
  // ---------------------------------------------------------------------------

  function copyLink(formToken: string) {
    const url = `${window.location.origin}/forms/${formToken}`;
    navigator.clipboard.writeText(url).then(
      () => showToast('Link copied to clipboard', 'success'),
      () => showToast('Failed to copy link', 'error')
    );
  }

  // ---------------------------------------------------------------------------
  // View submissions
  // ---------------------------------------------------------------------------

  async function openSubmissions(form: DynamicForm) {
    setSubsForm(form);
    setSubmissions([]);
    setSubsLoading(true);
    setSubsModalOpen(true);
    try {
      const res = await fetch(`/api/forms/${form._id}/submissions`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(Array.isArray(data) ? data : data.submissions ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch submissions', err);
      showToast('Failed to load submissions', 'error');
    } finally {
      setSubsLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* ------ Header ------ */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            <FileText className="text-primary" size={24} />
            Dynamic Forms
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Build and manage custom forms for {getEntityName()}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-1" /> Create Form
        </Button>
      </div>

      {/* ------ List ------ */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : forms.length === 0 ? (
        <Card className="p-16 text-center">
          <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400 mb-4">No forms yet</p>
          <Button onClick={openCreate}>Create Your First Form</Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form._id} className="p-5 flex flex-col justify-between">
              {/* top section */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">
                    {form.title}
                  </h3>
                  {statusBadge(form)}
                </div>

                {form.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                    {form.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <span className="inline-flex items-center gap-1">
                    <Hash size={12} /> {form.fields?.length ?? 0} fields
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Inbox size={12} /> {form.submissionCount ?? 0} submissions
                  </span>
                  {form.expiresAt && (
                    <span>Expires {formatShortDate(form.expiresAt)}</span>
                  )}
                  {form.maxSubmissions && (
                    <span>Max {form.maxSubmissions}</span>
                  )}
                </div>

                <div className="text-xs text-slate-400 dark:text-slate-500 truncate mb-4" title={form.formToken}>
                  Token: <span className="font-mono">{form.formToken}</span>
                </div>
              </div>

              {/* actions */}
              <div className="flex items-center gap-1 border-t border-slate-100 dark:border-slate-700 pt-3">
                <button
                  onClick={() => openEdit(form)}
                  className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => openSubmissions(form)}
                  className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="View Submissions"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => copyLink(form.formToken)}
                  className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Copy Link"
                >
                  <Link2 size={16} />
                </button>
                <a
                  href={`/api/forms/${form._id}/export`}
                  download
                  className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors inline-flex"
                  title="Export CSV"
                >
                  <Download size={16} />
                </a>
                <button
                  onClick={() => handleDelete(form._id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ================================================================== */}
      {/* Create / Edit Form Modal                                           */}
      {/* ================================================================== */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingForm ? 'Edit Form' : 'Create Form'}
        size="xl"
        className="!max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* Title */}
          <div>
            <label className={labelCls}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
              placeholder="e.g. Youth Camp Registration"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="Optional description shown to respondents"
            />
          </div>

          {/* ---- Dynamic Field Builder ---- */}
          <div>
            <label className={labelCls}>Fields</label>
            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50"
                >
                  {/* Row 1: order buttons, label, type, required, remove */}
                  <div className="flex items-start gap-2">
                    {/* Up / Down buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0 pt-1">
                      <button
                        type="button"
                        onClick={() => moveField(idx, 'up')}
                        disabled={idx === 0}
                        className="p-0.5 rounded text-slate-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(idx, 'down')}
                        disabled={idx === fields.length - 1}
                        className="p-0.5 rounded text-slate-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className={inputCls}
                        placeholder="Field label"
                      />
                    </div>

                    {/* Type */}
                    <div className="w-36 shrink-0">
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(field.id, { type: e.target.value as FieldType })
                        }
                        className={selectCls}
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Required toggle */}
                    <label className="flex items-center gap-1 shrink-0 pt-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(field.id, { required: e.target.checked })
                        }
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Required
                      </span>
                    </label>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                      title="Remove field"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Row 2: Options (for dropdown/radio/checkbox) */}
                  {TYPES_WITH_OPTIONS.includes(field.type) && (
                    <div className="mt-2 ml-7">
                      <input
                        type="text"
                        value={field.options}
                        onChange={(e) =>
                          updateField(field.id, { options: e.target.value })
                        }
                        className={inputCls}
                        placeholder="Options (comma-separated, e.g. Option A, Option B, Option C)"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Separate options with commas
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addField}
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium"
            >
              <Plus size={14} /> Add Field
            </button>
          </div>

          {/* Expiration + Max submissions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Expiration Date (optional)</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Max Submissions (optional)</label>
              <input
                type="number"
                min="1"
                value={maxSubmissions}
                onChange={(e) => setMaxSubmissions(e.target.value)}
                className={inputCls}
                placeholder="Unlimited"
              />
            </div>
          </div>

          {/* Hierarchy info (read-only) */}
          <div className="bg-slate-100 dark:bg-slate-700/40 rounded-lg p-3 text-xs text-slate-500 dark:text-slate-400">
            This form will be created at the <strong>{selection.level}</strong> level for{' '}
            <strong>{getEntityName()}</strong>.
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size="sm" /> Saving...
                </span>
              ) : editingForm ? (
                'Update Form'
              ) : (
                'Create Form'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================================================================== */}
      {/* View Submissions Modal                                             */}
      {/* ================================================================== */}
      <Modal
        isOpen={subsModalOpen}
        onClose={() => setSubsModalOpen(false)}
        title={subsForm ? `Submissions: ${subsForm.title}` : 'Submissions'}
        size="xl"
        className="!max-w-5xl"
      >
        {subsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <Inbox className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
            <p className="text-slate-500 dark:text-slate-400">No submissions yet</p>
          </div>
        ) : (
          <>
            {/* Export CSV button */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
              </p>
              {subsForm && (
                <a
                  href={`/api/forms/${subsForm._id}/export`}
                  download
                  className="inline-flex items-center gap-1"
                >
                  <Button variant="outline" size="sm">
                    <Download size={14} className="mr-1" /> Export CSV
                  </Button>
                </a>
              )}
            </div>

            {/* Submissions table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      #
                    </th>
                    {subsForm?.fields?.map((field) => (
                      <th
                        key={field.id || field.label}
                        className="text-left px-3 py-2 font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap"
                      >
                        {field.label}
                      </th>
                    ))}
                    <th className="text-left px-3 py-2 font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {submissions.map((sub, i) => (
                    <tr
                      key={sub._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                      {subsForm?.fields?.map((field) => {
                        const key = field.id || field.label;
                        const val = sub.values?.[key] ?? sub.values?.[field.label] ?? '';
                        return (
                          <td
                            key={key}
                            className="px-3 py-2 text-slate-700 dark:text-slate-300 max-w-[200px] truncate"
                            title={Array.isArray(val) ? val.join(', ') : String(val)}
                          >
                            {Array.isArray(val) ? val.join(', ') : String(val)}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-slate-400 whitespace-nowrap">
                        {formatShortDate(sub.submittedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Copy public link reminder */}
            {subsForm && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => copyLink(subsForm.formToken)}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ClipboardCopy size={14} /> Copy public form link
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  /forms/{subsForm.formToken}
                </span>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
