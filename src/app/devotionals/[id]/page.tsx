'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BackToTop from '@/components/public/BackToTop';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import {
  BookOpen, Calendar, User, ArrowLeft, ArrowRight, Share2, BookMarked, ChevronLeft, ChevronRight
} from 'lucide-react';

interface Devotional {
  _id: string;
  title: string;
  date: string;
  scripture: string;
  body: string;
  author: string;
  coverImage?: string;
  isPublished: boolean;
  createdAt: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DevotionalDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { showToast } = useToast();

  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [allDevotionals, setAllDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchDevotional = useCallback(async () => {
    try {
      const res = await fetch(`/api/devotionals/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDevotional(data);
      } else if (res.status === 404) {
        setNotFound(true);
      } else {
        showToast('Failed to load devotional', 'error');
      }
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  const fetchAllDevotionals = useCallback(async () => {
    try {
      const res = await fetch('/api/devotionals?published=true');
      if (res.ok) {
        const data = await res.json();
        setAllDevotionals(data);
      }
    } catch {
      // Silent fail for navigation - non-critical
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchDevotional();
      fetchAllDevotionals();
    }
  }, [id, fetchDevotional, fetchAllDevotionals]);

  // Find prev/next devotionals
  const currentIndex = allDevotionals.findIndex((d) => d._id === id);
  const prevDevotional = currentIndex > 0 ? allDevotionals[currentIndex - 1] : null;
  const nextDevotional = currentIndex < allDevotionals.length - 1 ? allDevotionals[currentIndex + 1] : null;

  const handleShare = async () => {
    const url = window.location.href;
    const title = devotional?.title || 'Devotional';

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!', 'success');
      } catch {
        showToast('Could not copy link', 'error');
      }
    }
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient relative min-h-[300px] flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <Link
            href="/devotionals"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm mb-6"
          >
            <ArrowLeft size={16} /> Back to Devotionals
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <BookMarked className="text-accent" size={20} />
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Daily Devotional</span>
          </div>
          {!loading && devotional && (
            <>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-playfair)] max-w-3xl">
                {devotional.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-blue-100 text-sm">
                <span className="flex items-center gap-2">
                  <Calendar size={14} />
                  {formatDate(devotional.date)}
                </span>
                <span className="flex items-center gap-2">
                  <User size={14} />
                  {devotional.author}
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="lg" />
              <p className="mt-4 text-slate-500 dark:text-slate-400">Loading devotional...</p>
            </div>
          ) : notFound ? (
            <div className="text-center py-20">
              <BookOpen className="text-slate-300 dark:text-slate-600 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Devotional Not Found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                This devotional may have been removed or does not exist.
              </p>
              <Link
                href="/devotionals"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-semibold transition-colors text-sm"
              >
                <ArrowLeft size={16} /> Back to Devotionals
              </Link>
            </div>
          ) : devotional ? (
            <>
              {/* Scripture Card */}
              {devotional.scripture && (
                <Card className="p-6 mb-8 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="text-amber-600 dark:text-amber-400" size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Scripture Reference</p>
                      <p className="text-lg font-medium text-amber-900 dark:text-amber-200 italic font-[family-name:var(--font-playfair)]">
                        {devotional.scripture}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Cover Image */}
              {devotional.coverImage && (
                <div className="rounded-xl overflow-hidden mb-8">
                  <img
                    src={devotional.coverImage}
                    alt={devotional.title}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                </div>
              )}

              {/* Body Content */}
              <article className="prose prose-lg dark:prose-invert max-w-none">
                {devotional.body.split('\n').map((paragraph, i) => (
                  paragraph.trim() ? (
                    <p key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ) : (
                    <div key={i} className="h-2" />
                  )
                ))}
              </article>

              {/* Author Attribution */}
              <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center">
                      <User className="text-primary dark:text-primary-light" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Written by</p>
                      <p className="font-bold text-slate-900 dark:text-white">{devotional.author}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>

              {/* Previous / Next Navigation */}
              {(prevDevotional || nextDevotional) && (
                <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {prevDevotional ? (
                      <Link href={`/devotionals/${prevDevotional._id}`}>
                        <Card hover className="p-4 h-full">
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                            <ChevronLeft size={14} />
                            <span>Previous Devotional</span>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                            {prevDevotional.title}
                          </h4>
                        </Card>
                      </Link>
                    ) : (
                      <div />
                    )}
                    {nextDevotional ? (
                      <Link href={`/devotionals/${nextDevotional._id}`}>
                        <Card hover className="p-4 h-full text-right">
                          <div className="flex items-center justify-end gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                            <span>Next Devotional</span>
                            <ChevronRight size={14} />
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                            {nextDevotional.title}
                          </h4>
                        </Card>
                      </Link>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-playfair)]">
            Continue Your Spiritual Journey
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Explore more devotionals and let the Word of God transform your life daily.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/devotionals"
              className="inline-flex items-center gap-2 bg-accent hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              <BookOpen size={18} /> All Devotionals
            </Link>
            <Link
              href="/prayers"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-8 py-3 rounded-lg font-semibold backdrop-blur-sm transition-colors"
            >
              Prayer Wall <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </>
  );
}
