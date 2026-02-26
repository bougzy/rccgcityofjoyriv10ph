'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BackToTop from '@/components/public/BackToTop';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import {
  Heart, HandHeart, Plus, Clock, User, CheckCircle2,
  Stethoscope, Home, Compass, Gift, Sparkles, ListFilter
} from 'lucide-react';

interface PrayerRequest {
  _id: string;
  authorName: string;
  title: string;
  body: string;
  category: string;
  isAnonymous: boolean;
  status: 'active' | 'answered';
  prayerCount: number;
  isApproved: boolean;
  createdAt: string;
}

const categories = [
  { key: 'all', label: 'All', icon: ListFilter },
  { key: 'healing', label: 'Healing', icon: Stethoscope },
  { key: 'provision', label: 'Provision', icon: Gift },
  { key: 'family', label: 'Family', icon: Home },
  { key: 'guidance', label: 'Guidance', icon: Compass },
  { key: 'thanksgiving', label: 'Thanksgiving', icon: Sparkles },
];

const categoryColors: Record<string, 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'info' | 'yaya'> = {
  healing: 'info',
  provision: 'accent',
  family: 'success',
  guidance: 'yaya',
  thanksgiving: 'warning',
  other: 'primary',
};

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function PrayerWallPage() {
  const { showToast } = useToast();
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [prayingFor, setPrayingFor] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    authorName: '',
    title: '',
    body: '',
    category: 'healing',
    isAnonymous: false,
  });

  const fetchPrayers = useCallback(async () => {
    try {
      const res = await fetch('/api/prayers?approved=true');
      if (res.ok) {
        const data = await res.json();
        setPrayers(data);
      }
    } catch {
      showToast('Failed to load prayer requests', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPrayers();
  }, [fetchPrayers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }
    if (!formData.isAnonymous && !formData.authorName.trim()) {
      showToast('Please enter your name or choose to be anonymous', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: formData.isAnonymous ? 'Anonymous' : formData.authorName,
          title: formData.title,
          body: formData.body,
          category: formData.category,
          isAnonymous: formData.isAnonymous,
        }),
      });

      if (res.ok) {
        showToast('Prayer request submitted! It will appear after approval.', 'success');
        setShowModal(false);
        setFormData({ authorName: '', title: '', body: '', category: 'healing', isAnonymous: false });
      } else {
        showToast('Failed to submit prayer request', 'error');
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePray = async (prayerId: string) => {
    setPrayingFor(prayerId);
    try {
      const res = await fetch(`/api/prayers/${prayerId}/pray`, { method: 'POST' });
      if (res.ok) {
        setPrayers((prev) =>
          prev.map((p) => (p._id === prayerId ? { ...p, prayerCount: p.prayerCount + 1 } : p))
        );
        showToast('Thank you for praying!', 'success');
      }
    } catch {
      showToast('Could not record your prayer', 'error');
    } finally {
      setPrayingFor(null);
    }
  };

  const filteredPrayers = activeCategory === 'all'
    ? prayers
    : prayers.filter((p) => p.category === activeCategory);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient relative min-h-[400px] flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center">
          <div className="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <HandHeart className="text-white" size={36} />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-playfair)]">
            Prayer Wall
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Submit your prayer requests and pray for others. We believe in the power of united prayer and stand together in faith.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-8 inline-flex items-center gap-2 bg-accent hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Plus size={18} /> Submit Prayer Request
          </button>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <section className="py-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 page-enter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide animate-fade-in-up stagger-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.key
                    ? 'bg-primary text-white dark:bg-primary-light'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <cat.icon size={14} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Prayer Cards Grid */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900 mesh-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="lg" />
              <p className="mt-4 text-slate-500 dark:text-slate-400">Loading prayer requests...</p>
            </div>
          ) : filteredPrayers.length === 0 ? (
            <div className="text-center py-20">
              <HandHeart className="text-slate-300 dark:text-slate-600 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No prayer requests yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {activeCategory === 'all'
                  ? 'Be the first to submit a prayer request.'
                  : 'No prayer requests in this category yet.'}
              </p>
              <Button variant="accent" onClick={() => setShowModal(true)}>
                <Plus size={16} className="mr-2" /> Submit a Prayer
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-2">
              {filteredPrayers.map((prayer) => (
                <Card key={prayer._id} hover className="p-6 relative">
                  {/* Answered Badge */}
                  {prayer.status === 'answered' && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle2 size={12} /> Answered
                      </Badge>
                    </div>
                  )}

                  {/* Category Badge */}
                  <Badge variant={categoryColors[prayer.category] || 'primary'} className="mb-3 capitalize">
                    {prayer.category}
                  </Badge>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 pr-16 leading-tight">
                    {prayer.title}
                  </h3>

                  {/* Body (truncated) */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {prayer.body}
                  </p>

                  {/* Author & Time */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {prayer.isAnonymous ? 'Anonymous' : prayer.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {timeAgo(prayer.createdAt)}
                    </span>
                  </div>

                  {/* Prayer Count & Pray Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <span className="flex items-center gap-1.5 text-sm text-rose-500 dark:text-rose-400 font-medium">
                      <Heart size={16} className="fill-rose-500 dark:fill-rose-400" />
                      {prayer.prayerCount} {prayer.prayerCount === 1 ? 'prayer' : 'prayers'}
                    </span>
                    <button
                      onClick={() => handlePray(prayer._id)}
                      disabled={prayingFor === prayer._id}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50"
                    >
                      {prayingFor === prayer._id ? (
                        <Spinner size="sm" className="border-rose-300 border-t-rose-600" />
                      ) : (
                        <Heart size={14} />
                      )}
                      I Prayed
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-playfair)]">
            The Power of United Prayer
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            &ldquo;For where two or three gather in my name, there am I with them.&rdquo; &mdash; Matthew 18:20
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-accent hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            <Plus size={18} /> Submit a Prayer Request
          </button>
        </div>
      </section>

      {/* Submit Prayer Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Submit a Prayer Request" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Anonymous toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Submit anonymously</span>
          </label>

          {/* Author Name */}
          {!formData.isAnonymous && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Prayer Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Prayer for healing"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
            >
              <option value="healing">Healing</option>
              <option value="provision">Provision</option>
              <option value="family">Family</option>
              <option value="guidance">Guidance</option>
              <option value="thanksgiving">Thanksgiving</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Prayer Request <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Share your prayer request..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors resize-none"
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your prayer request will be reviewed before appearing on the prayer wall.
          </p>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner size="sm" className="mr-2" /> Submitting...
                </>
              ) : (
                'Submit Prayer Request'
              )}
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
      <BackToTop />
    </>
  );
}
