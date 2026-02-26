'use client';

import { useState, useEffect, useActionState, use } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import {
  QrCode,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  User,
  Phone,
  Church,
  Users,
  IdCard,
  AlertCircle,
  Star,
} from 'lucide-react';
import { NATURAL_GROUP_DEFINITIONS } from '@/lib/constants/natural-groups';

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
  isActive: boolean;
  maxAttendees?: number;
}

interface Parish {
  _id: string;
  name: string;
}

interface FormState {
  success: boolean;
  error: string;
}

const initialFormState: FormState = { success: false, error: '' };

async function submitCheckIn(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const eventId = formData.get('eventId') as string;
  const fullName = (formData.get('fullName') as string)?.trim();

  if (!fullName) {
    return { success: false, error: 'Full name is required' };
  }

  const payload = {
    fullName,
    phone: (formData.get('phone') as string)?.trim() || '',
    parish: (formData.get('parish') as string) || '',
    parishName: (formData.get('parishName') as string) || '',
    naturalGroup: (formData.get('naturalGroup') as string) || '',
    isFirstTimer: formData.get('isFirstTimer') === 'on',
    memberId: (formData.get('memberId') as string)?.trim() || '',
    checkInMethod: 'qr',
  };

  try {
    const res = await fetch(`/api/events/${eventId}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error || 'Check-in failed' };
    }

    return { success: true, error: '' };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export default function QRCheckInPage({
  params,
}: {
  params: Promise<{ eventToken: string }>;
}) {
  const { eventToken } = use(params);
  const { showToast } = useToast();
  const [event, setEvent] = useState<EventData | null>(null);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedParishName, setSelectedParishName] = useState('');

  const [formState, formAction, isPending] = useActionState(
    submitCheckIn,
    initialFormState
  );

  useEffect(() => {
    async function loadData() {
      try {
        const [eventRes, parishRes] = await Promise.all([
          fetch(`/api/events/by-token/${eventToken}`),
          fetch('/api/hierarchy/parishes'),
        ]);

        if (!eventRes.ok) {
          const errData = await eventRes.json();
          setFetchError(
            errData.error || 'This event is not available or has expired.'
          );
          setLoading(false);
          return;
        }

        const eventData = await eventRes.json();
        setEvent(eventData);

        if (parishRes.ok) {
          const parishData = await parishRes.json();
          setParishes(parishData);
        }
      } catch {
        setFetchError('Unable to load event. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventToken]);

  useEffect(() => {
    if (formState.error) {
      showToast(formState.error, 'error');
    }
  }, [formState.error, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  if (fetchError || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-slate-800 dark:text-white mb-2">
            Event Not Available
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {fetchError || 'This event could not be found.'}
          </p>
        </Card>
      </div>
    );
  }

  if (formState.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-success flex items-center justify-center">
              <CheckCircle className="text-white" size={40} />
            </div>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Check-In Successful!
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-2">
            Welcome to <span className="font-semibold">{event.title}</span>
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You have been checked in. Enjoy the event!
          </p>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              RCCG City Of Joy Fellowship
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const eventDate = new Date(event.startDate);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="hero-gradient text-white py-8 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <QrCode size={24} />
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-1">
            Quick Check-In
          </h1>
          <p className="text-blue-100 text-sm">
            Scan complete! Fill in your details below.
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-8">
        {/* Event Info Card */}
        <Card className="p-4 mb-4">
          <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-slate-800 dark:text-white mb-3">
            {event.title}
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Calendar size={16} className="text-primary shrink-0" />
              <span>{formattedDate}</span>
            </div>
            {(event.startTime || event.endTime) && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Clock size={16} className="text-primary shrink-0" />
                <span>
                  {event.startTime}
                  {event.endTime ? ` - ${event.endTime}` : ''}
                </span>
              </div>
            )}
            {event.venue && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <MapPin size={16} className="text-primary shrink-0" />
                <span>{event.venue}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Check-In Form */}
        <Card className="p-5">
          <form action={formAction}>
            <input type="hidden" name="eventId" value={event._id} />
            <input type="hidden" name="parishName" value={selectedParishName} />

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <User size={16} className="text-primary" />
                  <label
                    htmlFor="fullName"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-base"
                />
              </div>

              {/* Phone */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Phone size={16} className="text-primary" />
                  <label
                    htmlFor="phone"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Phone Number
                  </label>
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="e.g. 08012345678"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-base"
                />
              </div>

              {/* Parish */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Church size={16} className="text-primary" />
                  <label
                    htmlFor="parish"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Parish
                  </label>
                </div>
                <select
                  id="parish"
                  name="parish"
                  onChange={(e) => {
                    const selected = parishes.find(
                      (p) => p._id === e.target.value
                    );
                    setSelectedParishName(selected?.name || '');
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-base"
                >
                  <option value="">Select your parish</option>
                  {parishes.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Natural Group */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Users size={16} className="text-primary" />
                  <label
                    htmlFor="naturalGroup"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Natural Group
                  </label>
                </div>
                <select
                  id="naturalGroup"
                  name="naturalGroup"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-base"
                >
                  <option value="">Select your group</option>
                  {NATURAL_GROUP_DEFINITIONS.map((g) => (
                    <option key={g.type} value={g.type}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Member ID */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <IdCard size={16} className="text-primary" />
                  <label
                    htmlFor="memberId"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Member ID{' '}
                    <span className="text-slate-400 font-normal">
                      (optional)
                    </span>
                  </label>
                </div>
                <input
                  type="text"
                  id="memberId"
                  name="memberId"
                  placeholder="Enter your member ID"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-base"
                />
              </div>

              {/* First Timer */}
              <label
                htmlFor="isFirstTimer"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-amber-50 dark:bg-amber-900/20 cursor-pointer hover:border-accent transition"
              >
                <input
                  type="checkbox"
                  id="isFirstTimer"
                  name="isFirstTimer"
                  className="w-5 h-5 rounded border-slate-300 text-accent focus:ring-accent"
                />
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-accent" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    I am a First Timer
                  </span>
                </div>
              </label>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="w-full mt-2"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" className="border-white border-t-transparent" />
                    Checking in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle size={20} />
                    Check In
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          RCCG City Of Joy Fellowship &middot; Rivers Province 10
        </p>
      </div>
    </div>
  );
}
