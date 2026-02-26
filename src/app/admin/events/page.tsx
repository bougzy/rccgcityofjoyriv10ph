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
  CalendarDays,
  Plus,
  Edit,
  Trash2,
  Users,
  Copy,
  Link,
  Clock,
  MapPin,
  CalendarCheck,
  CalendarX,
  Activity,
  BarChart3,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EventData {
  _id: string;
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  venue: string;
  eventToken: string;
  registrationEnabled: boolean;
  maxAttendees?: number;
  isActive: boolean;
  level: string;
  entityId: string;
  province: string;
  zone?: string;
  area?: string;
  parish?: string;
  createdAt: string;
  attendeeCount?: number;
}

interface Attendee {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  parishName: string;
  naturalGroup: string;
  isFirstTimer: boolean;
  checkInMethod: string;
  checkInTime: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EVENT_TYPES = [
  { value: 'service', label: 'Service' },
  { value: 'conference', label: 'Conference' },
  { value: 'retreat', label: 'Retreat' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'training', label: 'Training' },
  { value: 'special', label: 'Special' },
];

const EVENT_TYPE_BADGE_MAP: Record<string, 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'info' | 'yaya'> = {
  service: 'primary',
  conference: 'accent',
  retreat: 'success',
  outreach: 'info',
  fellowship: 'yaya',
  training: 'warning',
  special: 'danger',
};

const DEFAULT_FORM = {
  title: '',
  description: '',
  eventType: 'service',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  venue: '',
  registrationEnabled: false,
  maxAttendees: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEntityId(selection: {
  level: string;
  provinceId: string;
  zoneId: string | null;
  areaId: string | null;
  parishId: string | null;
}): string {
  if (selection.level === 'province') return selection.provinceId;
  if (selection.level === 'zone') return selection.zoneId || '';
  if (selection.level === 'area') return selection.areaId || '';
  return selection.parishId || '';
}

function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr) >= new Date(new Date().toDateString());
}

function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

function getEntityLabel(selection: {
  level: string;
  provinceName: string;
  zoneName: string | null;
  areaName: string | null;
  parishName: string | null;
}): string {
  if (selection.level === 'province') return selection.provinceName;
  if (selection.level === 'zone') return selection.zoneName || '';
  if (selection.level === 'area') return selection.areaName || '';
  return selection.parishName || '';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EventsManagementPage() {
  const { selection } = useHierarchy();
  const { showToast } = useToast();

  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventData | null>(null);
  const [form, setForm] = useState({ ...DEFAULT_FORM });

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<EventData | null>(null);

  // Attendees modal
  const [attendeesModal, setAttendeesModal] = useState(false);
  const [attendeesEvent, setAttendeesEvent] = useState<EventData | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch events
  // ---------------------------------------------------------------------------

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const entityId = getEntityId(selection);
      const params = new URLSearchParams({
        level: selection.level,
        entityId,
      });
      const res = await fetch(`/api/events?${params}`);
      if (!res.ok) throw new Error('Failed to fetch events');
      const data: EventData[] = await res.json();
      setEvents(data);
    } catch {
      showToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  }, [selection.level, selection.provinceId, selection.zoneId, selection.areaId, selection.parishId]);

  useEffect(() => {
    if (selection.provinceId) fetchEvents();
  }, [fetchEvents, selection.provinceId]);

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const totalEvents = events.length;
  const upcomingEvents = events.filter((e) => isUpcoming(e.startDate)).length;
  const pastEvents = events.filter((e) => !isUpcoming(e.startDate)).length;
  const activeEvents = events.filter((e) => e.isActive).length;

  const stats = [
    { label: 'Total Events', value: totalEvents, icon: CalendarDays, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Upcoming', value: upcomingEvents, icon: CalendarCheck, color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
    { label: 'Past', value: pastEvents, icon: CalendarX, color: 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-400' },
    { label: 'Active', value: activeEvents, icon: Activity, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
  ];

  // ---------------------------------------------------------------------------
  // Create / Edit
  // ---------------------------------------------------------------------------

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...DEFAULT_FORM,
      startDate: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openEdit = (ev: EventData) => {
    setEditing(ev);
    setForm({
      title: ev.title,
      description: ev.description || '',
      eventType: ev.eventType,
      startDate: ev.startDate ? ev.startDate.split('T')[0] : '',
      endDate: ev.endDate ? ev.endDate.split('T')[0] : '',
      startTime: ev.startTime || '',
      endTime: ev.endTime || '',
      venue: ev.venue || '',
      registrationEnabled: ev.registrationEnabled,
      maxAttendees: ev.maxAttendees != null ? String(ev.maxAttendees) : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Title is required', 'warning');
      return;
    }
    if (!form.startDate) {
      showToast('Start date is required', 'warning');
      return;
    }

    setSubmitting(true);
    const entityId = getEntityId(selection);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      eventType: form.eventType,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      startTime: form.startTime,
      endTime: form.endTime,
      venue: form.venue.trim(),
      registrationEnabled: form.registrationEnabled,
      maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees, 10) : undefined,
      level: selection.level,
      entityId,
      province: selection.provinceId,
      zone: selection.zoneId,
      area: selection.areaId,
      parish: selection.parishId,
    };

    try {
      const url = editing ? `/api/events/${editing._id}` : '/api/events';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save event');
      }

      showToast(editing ? 'Event updated successfully' : 'Event created successfully', 'success');
      setModalOpen(false);
      fetchEvents();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save event';
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
      const res = await fetch(`/api/events/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setEvents((prev) => prev.filter((ev) => ev._id !== deleteTarget._id));
      showToast('Event deleted', 'success');
    } catch {
      showToast('Failed to delete event', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Attendees
  // ---------------------------------------------------------------------------

  const viewAttendees = async (ev: EventData) => {
    setAttendeesEvent(ev);
    setAttendeesModal(true);
    setAttendeesLoading(true);
    try {
      const res = await fetch(`/api/events/${ev._id}/attendance`);
      if (!res.ok) throw new Error('Failed to fetch attendees');
      const data: Attendee[] = await res.json();
      setAttendees(data);
    } catch {
      showToast('Failed to load attendees', 'error');
      setAttendees([]);
    } finally {
      setAttendeesLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Copy links
  // ---------------------------------------------------------------------------

  const copyCheckinLink = async (ev: EventData) => {
    const url = `${window.location.origin}/attendance/checkin/${ev.eventToken}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Check-in link copied to clipboard', 'success');
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  const copyFormLink = async (ev: EventData) => {
    const url = `${window.location.origin}/attendance/form/${ev.eventToken}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Form link copied to clipboard', 'success');
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // Shared input classes
  // ---------------------------------------------------------------------------

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors';

  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            <CalendarDays className="text-primary" size={24} />
            Event Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage events for {getEntityLabel(selection)}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-1" /> Create Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
        {stats.map((stat) => (
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

      {/* Events List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : events.length === 0 ? (
        <Card className="p-16 text-center animate-fade-in-up stagger-2">
          <CalendarDays className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400 mb-4">No events yet</p>
          <Button onClick={openCreate}>Create First Event</Button>
        </Card>
      ) : (
        <div className="space-y-4 animate-fade-in-up stagger-2">
          {events.map((ev) => {
            const upcoming = isUpcoming(ev.startDate);
            return (
              <Card key={ev._id} className={`p-5 ${!ev.isActive ? 'opacity-60' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg truncate">
                        {ev.title}
                      </h3>
                      <Badge variant={EVENT_TYPE_BADGE_MAP[ev.eventType] || 'primary'}>
                        {ev.eventType}
                      </Badge>
                      {upcoming ? (
                        <Badge variant="success">Upcoming</Badge>
                      ) : (
                        <Badge variant="warning">Past</Badge>
                      )}
                      {ev.registrationEnabled && (
                        <Badge variant="info">Registration Open</Badge>
                      )}
                      {!ev.isActive && <Badge variant="danger">Inactive</Badge>}
                    </div>

                    {ev.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                        {ev.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} className="shrink-0" />
                        {formatShortDate(ev.startDate)}
                        {ev.endDate && ev.endDate !== ev.startDate && (
                          <> &mdash; {formatShortDate(ev.endDate)}</>
                        )}
                      </span>

                      {(ev.startTime || ev.endTime) && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="shrink-0" />
                          {formatTime(ev.startTime)}
                          {ev.endTime && <> &ndash; {formatTime(ev.endTime)}</>}
                        </span>
                      )}

                      {ev.venue && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="shrink-0" />
                          {ev.venue}
                        </span>
                      )}

                      {ev.attendeeCount != null && (
                        <span className="flex items-center gap-1.5">
                          <Users size={14} className="shrink-0" />
                          {ev.attendeeCount} attendee{ev.attendeeCount !== 1 ? 's' : ''}
                          {ev.maxAttendees != null && <> / {ev.maxAttendees}</>}
                        </span>
                      )}

                      {ev.maxAttendees != null && ev.attendeeCount == null && (
                        <span className="flex items-center gap-1.5">
                          <Users size={14} className="shrink-0" />
                          Max {ev.maxAttendees}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => viewAttendees(ev)}
                      className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="View Attendees"
                    >
                      <BarChart3 size={16} />
                    </button>
                    <button
                      onClick={() => copyCheckinLink(ev)}
                      className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Copy Check-in Link"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => copyFormLink(ev)}
                      className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Copy Form Link"
                    >
                      <Link size={16} />
                    </button>
                    <button
                      onClick={() => openEdit(ev)}
                      className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(ev)}
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
        title={editing ? 'Edit Event' : 'Create Event'}
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
              placeholder="Event title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Brief description of the event"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className={labelClass}>Event Type</label>
            <select
              value={form.eventType}
              onChange={(e) => setForm((p) => ({ ...p, eventType: e.target.value }))}
              className={inputClass}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className={labelClass}>Venue</label>
            <input
              type="text"
              value={form.venue}
              onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))}
              className={inputClass}
              placeholder="Event venue / location"
            />
          </div>

          {/* Registration toggle + Max Attendees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.registrationEnabled}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, registrationEnabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 dark:bg-slate-600 rounded-full peer-checked:bg-primary transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Registration Enabled
              </span>
            </label>

            <div>
              <label className={labelClass}>Max Attendees (optional)</label>
              <input
                type="number"
                value={form.maxAttendees}
                onChange={(e) => setForm((p) => ({ ...p, maxAttendees: e.target.value }))}
                className={inputClass}
                placeholder="No limit"
                min={1}
              />
            </div>
          </div>

          {/* Hierarchy info (read-only) */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-xs text-slate-500 dark:text-slate-400">
            Scope: <span className="font-medium capitalize">{selection.level}</span> &mdash;{' '}
            {getEntityLabel(selection)}
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
                'Update Event'
              ) : (
                'Create Event'
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
        title="Delete Event"
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

      {/* ------------------------------------------------------------------ */}
      {/* Attendees Modal                                                     */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={attendeesModal}
        onClose={() => {
          setAttendeesModal(false);
          setAttendeesEvent(null);
          setAttendees([]);
        }}
        title={attendeesEvent ? `Attendees - ${attendeesEvent.title}` : 'Attendees'}
        size="lg"
      >
        {attendeesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : attendees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
            <p className="text-slate-500 dark:text-slate-400">No attendees registered yet</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {attendees.length} attendee{attendees.length !== 1 ? 's' : ''}
            </p>
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
              {attendees.map((att) => (
                <div key={att._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {att.fullName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {att.phone && <span>{att.phone}</span>}
                      {att.phone && att.email && <span> &middot; </span>}
                      {att.email && <span>{att.email}</span>}
                    </p>
                    {att.parishName && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {att.parishName}
                        {att.naturalGroup && ` - ${att.naturalGroup}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {att.isFirstTimer && <Badge variant="accent">First Timer</Badge>}
                    <Badge variant="info">{att.checkInMethod}</Badge>
                    <span className="text-xs text-slate-400">
                      {att.checkInTime && formatShortDate(att.checkInTime)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
