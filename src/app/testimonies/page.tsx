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
  Sparkles, Plus, Star, User, Calendar, ChevronDown, ChevronUp,
  Stethoscope, Gift, Heart, Shield, Zap, ListFilter
} from 'lucide-react';

interface Testimony {
  _id: string;
  authorName: string;
  title: string;
  body: string;
  category: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

const categories = [
  { key: 'all', label: 'All', icon: ListFilter },
  { key: 'healing', label: 'Healing', icon: Stethoscope },
  { key: 'provision', label: 'Provision', icon: Gift },
  { key: 'salvation', label: 'Salvation', icon: Heart },
  { key: 'deliverance', label: 'Deliverance', icon: Shield },
  { key: 'breakthrough', label: 'Breakthrough', icon: Zap },
];

const categoryColors: Record<string, 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'info' | 'yaya'> = {
  healing: 'info',
  provision: 'accent',
  salvation: 'success',
  deliverance: 'yaya',
  breakthrough: 'warning',
  other: 'primary',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function TestimonyWallPage() {
  const { showToast } = useToast();
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    authorName: '',
    title: '',
    body: '',
    category: 'healing',
  });

  const fetchTestimonies = useCallback(async () => {
    try {
      const res = await fetch('/api/testimonies?approved=true');
      if (res.ok) {
        const data = await res.json();
        setTestimonies(data);
      }
    } catch {
      showToast('Failed to load testimonies', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTestimonies();
  }, [fetchTestimonies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authorName.trim() || !formData.title.trim() || !formData.body.trim()) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/testimonies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast('Testimony submitted! It will appear after approval.', 'success');
        setShowModal(false);
        setFormData({ authorName: '', title: '', body: '', category: 'healing' });
      } else {
        showToast('Failed to submit testimony', 'error');
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const featuredTestimonies = testimonies.filter((t) => t.isFeatured);
  const regularTestimonies = testimonies.filter((t) => !t.isFeatured);

  const filteredTestimonies = activeCategory === 'all'
    ? regularTestimonies
    : regularTestimonies.filter((t) => t.category === activeCategory);

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
            <Sparkles className="text-accent" size={36} />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-playfair)]">
            Testimony Wall
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Share what God has done in your life. Your testimony has the power to encourage others and bring glory to His name.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-8 inline-flex items-center gap-2 bg-accent hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Plus size={18} /> Share Your Testimony
          </button>
        </div>
      </section>

      {/* Featured Testimonies */}
      {featuredTestimonies.length > 0 && (
        <section className="py-16 bg-white dark:bg-slate-950 page-enter">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in-up stagger-1">
              <span className="section-badge">Highlighted</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
                Featured Testimonies
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up stagger-2">
              {featuredTestimonies.map((testimony) => (
                <Card key={testimony._id} hover className="p-0 overflow-hidden border-2 border-amber-200 dark:border-amber-800/40">
                  {/* Gold accent top bar */}
                  <div className="h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="accent" className="flex items-center gap-1 capitalize">
                        {testimony.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star size={16} className="fill-amber-500" />
                        <span className="text-xs font-semibold">Featured</span>
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-[family-name:var(--font-playfair)]">
                      {testimony.title}
                    </h3>

                    <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {expandedIds.has(testimony._id) ? (
                        <p className="whitespace-pre-line">{testimony.body}</p>
                      ) : (
                        <p className="line-clamp-4">{testimony.body}</p>
                      )}
                      {testimony.body.length > 200 && (
                        <button
                          onClick={() => toggleExpand(testimony._id)}
                          className="inline-flex items-center gap-1 text-primary dark:text-primary-light font-medium mt-2 hover:underline"
                        >
                          {expandedIds.has(testimony._id) ? (
                            <>Read Less <ChevronUp size={14} /></>
                          ) : (
                            <>Read More <ChevronDown size={14} /></>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {testimony.authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(testimony.createdAt)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Filter Tabs */}
      <section className="py-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide animate-fade-in-up stagger-3">
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

      {/* Testimony Cards Grid */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900 mesh-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up stagger-4">
            <span className="section-badge">Community</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              All Testimonies
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Read what God has been doing in the lives of our church family.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="lg" />
              <p className="mt-4 text-slate-500 dark:text-slate-400">Loading testimonies...</p>
            </div>
          ) : filteredTestimonies.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="text-slate-300 dark:text-slate-600 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No testimonies yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {activeCategory === 'all'
                  ? 'Be the first to share what God has done in your life.'
                  : 'No testimonies in this category yet.'}
              </p>
              <Button variant="accent" onClick={() => setShowModal(true)}>
                <Plus size={16} className="mr-2" /> Share Your Testimony
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-5">
              {filteredTestimonies.map((testimony) => (
                <Card key={testimony._id} hover className="p-6">
                  {/* Category Badge */}
                  <Badge variant={categoryColors[testimony.category] || 'primary'} className="mb-3 capitalize">
                    {testimony.category}
                  </Badge>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                    {testimony.title}
                  </h3>

                  {/* Body (expandable) */}
                  <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {expandedIds.has(testimony._id) ? (
                      <p className="whitespace-pre-line">{testimony.body}</p>
                    ) : (
                      <p className="line-clamp-4">{testimony.body}</p>
                    )}
                    {testimony.body.length > 180 && (
                      <button
                        onClick={() => toggleExpand(testimony._id)}
                        className="inline-flex items-center gap-1 text-primary dark:text-primary-light font-medium mt-2 hover:underline"
                      >
                        {expandedIds.has(testimony._id) ? (
                          <>Read Less <ChevronUp size={14} /></>
                        ) : (
                          <>Read More <ChevronDown size={14} /></>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Author & Date */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {testimony.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(testimony.createdAt)}
                    </span>
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
            Your Story Matters
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            &ldquo;They triumphed over him by the blood of the Lamb and by the word of their testimony.&rdquo; &mdash; Revelation 12:11
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-accent hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            <Plus size={18} /> Share Your Testimony
          </button>
        </div>
      </section>

      {/* Submit Testimony Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Share Your Testimony" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Author Name */}
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

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Testimony Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., God healed my body"
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
              <option value="salvation">Salvation</option>
              <option value="deliverance">Deliverance</option>
              <option value="breakthrough">Breakthrough</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Your Testimony <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Share what God has done for you..."
              rows={6}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors resize-none"
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your testimony will be reviewed before appearing on the testimony wall.
          </p>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner size="sm" className="mr-2" /> Submitting...
                </>
              ) : (
                'Submit Testimony'
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
