'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BackToTop from '@/components/public/BackToTop';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import {
  BookOpen, Calendar, User, ArrowRight, BookMarked
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

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DevotionalsPage() {
  const { showToast } = useToast();
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevotionals = useCallback(async () => {
    try {
      const res = await fetch('/api/devotionals?published=true');
      if (res.ok) {
        const data = await res.json();
        setDevotionals(data);
      }
    } catch {
      showToast('Failed to load devotionals', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDevotionals();
  }, [fetchDevotionals]);

  const latestDevotional = devotionals.length > 0 ? devotionals[0] : null;
  const pastDevotionals = devotionals.slice(1);

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
            <BookOpen className="text-white" size={36} />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-playfair)]">
            Daily Devotional
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Start your day with the Word of God. Be encouraged, strengthened, and inspired through our daily devotionals.
          </p>
        </div>
      </section>

      {/* Loading State */}
      {loading ? (
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="flex flex-col items-center justify-center">
            <Spinner size="lg" />
            <p className="mt-4 text-slate-500 dark:text-slate-400">Loading devotionals...</p>
          </div>
        </section>
      ) : devotionals.length === 0 ? (
        /* Empty State */
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <BookOpen className="text-slate-300 dark:text-slate-600 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No devotionals yet</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Devotionals will be published here. Check back soon!
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* Latest Devotional - Hero Card */}
          {latestDevotional && (
            <section className="py-20 bg-white dark:bg-slate-950 page-enter">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 animate-fade-in-up stagger-1">
                  <span className="section-badge">Latest</span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
                    Today&apos;s Devotional
                  </h2>
                </div>

                <Card hover className="p-0 overflow-hidden max-w-4xl mx-auto animate-fade-in-up stagger-2">
                  <div className="grid grid-cols-1 lg:grid-cols-5">
                    {/* Left - Date & Scripture Highlight */}
                    <div className="lg:col-span-2 hero-gradient p-8 lg:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-4">
                        <BookMarked className="text-accent" size={20} />
                        <span className="text-accent font-semibold text-sm uppercase tracking-wider">Devotional</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-[family-name:var(--font-playfair)]">
                        {latestDevotional.title}
                      </h3>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-blue-100">
                          <Calendar size={16} className="shrink-0" />
                          <span className="text-sm">{formatDate(latestDevotional.date)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-blue-100">
                          <User size={16} className="shrink-0" />
                          <span className="text-sm">{latestDevotional.author}</span>
                        </div>
                      </div>
                      {latestDevotional.scripture && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                          <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-1">Scripture</p>
                          <p className="text-white font-medium italic text-sm">{latestDevotional.scripture}</p>
                        </div>
                      )}
                    </div>

                    {/* Right - Content Preview */}
                    <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center">
                      <div className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        {latestDevotional.body.split('\n').slice(0, 4).map((paragraph, i) => (
                          paragraph.trim() && (
                            <p key={i} className={i > 0 ? 'mt-3' : ''}>
                              {paragraph.length > 300 ? `${paragraph.substring(0, 300)}...` : paragraph}
                            </p>
                          )
                        ))}
                        {latestDevotional.body.length > 600 && (
                          <p className="mt-2 text-slate-400 dark:text-slate-500 italic">...</p>
                        )}
                      </div>
                      <Link
                        href={`/devotionals/${latestDevotional._id}`}
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-semibold transition-colors text-sm w-fit"
                      >
                        Read Full Devotional <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            </section>
          )}

          {/* Past Devotionals Grid */}
          {pastDevotionals.length > 0 && (
            <section className="py-20 bg-slate-50 dark:bg-slate-900 mesh-gradient">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 animate-fade-in-up stagger-3">
                  <span className="section-badge">Archive</span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
                    Previous Devotionals
                  </h2>
                  <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Explore our archive of past devotionals for continued spiritual nourishment.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-4">
                  {pastDevotionals.map((devotional) => (
                    <Card key={devotional._id} hover className="p-6">
                      {/* Cover Image or Placeholder */}
                      {devotional.coverImage ? (
                        <div className="relative rounded-lg h-40 mb-4 overflow-hidden">
                          <img
                            src={devotional.coverImage}
                            alt={devotional.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="bg-primary/10 dark:bg-primary-light/10 rounded-lg h-40 flex items-center justify-center mb-4">
                          <BookOpen className="text-primary dark:text-primary-light" size={40} />
                        </div>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                        <Calendar size={12} />
                        <span>{formatShortDate(devotional.date)}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                        {devotional.title}
                      </h3>

                      {/* Scripture */}
                      {devotional.scripture && (
                        <p className="text-sm text-primary dark:text-primary-light italic mb-3 line-clamp-1">
                          {devotional.scripture}
                        </p>
                      )}

                      {/* Author */}
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                        <User size={14} />
                        <span>{devotional.author}</span>
                      </div>

                      {/* Read More Link */}
                      <Link
                        href={`/devotionals/${devotional._id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary dark:text-primary-light hover:underline"
                      >
                        Read More <ArrowRight size={14} />
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* CTA */}
      <section className="py-16 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-playfair)]">
            Feed on the Word Daily
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            &ldquo;Your word is a lamp for my feet, a light on my path.&rdquo; &mdash; Psalm 119:105
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 bg-accent hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Join Our Community <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </>
  );
}
